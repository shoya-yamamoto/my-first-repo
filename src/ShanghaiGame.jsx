import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { LAYOUT_NAMES, LAYOUT_GENERATORS, isFree, isCovered } from "./game.js";
import { pairs, reducer, start } from "./state.js";
import { TILE_IMAGES } from "./tile-images.js";
import "./style.css";
const names = [
  ...Array.from({ length: 9 }, (_, i) => `${i + 1}萬`),
  ...Array.from({ length: 9 }, (_, i) => `${i + 1}筒`),
  "東",
  "南",
  "西",
  "北",
  "中",
  "發",
  "白",
  ...Array.from({ length: 9 }, (_, i) => `${i + 1}索`),
  "春",
  "夏",
];
export default function ShanghaiGame() {
  const [layoutIndex, setLayoutIndex] = useState(() =>
    Math.floor(Math.random() * 5),
  );
  const layout = useMemo(() => LAYOUT_GENERATORS[layoutIndex](), [layoutIndex]);
  const [state, dispatch] = useReducer(reducer, layout, start);
  const [hint, setHint] = useState([]);
  const [message, setMessage] = useState(
    "同じ柄の、明るい牌を2枚選びましょう。",
  );
  const [dialog, setDialog] = useState(null);
  const [options, setOptions] = useState(() => {
    try {
      return {
        highlightAvailable: localStorage.getItem("shanghai-highlight") !== "off",
        showRedeal: localStorage.getItem("shanghai-redeal") !== "off",
        showUndo: localStorage.getItem("shanghai-undo") !== "off",
      };
    } catch {
      return { highlightAvailable: true, showRedeal: true, showUndo: true };
    }
  });
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 });
  const viewport = useRef(null),
    dialogRef = useRef(null),
    gesture = useRef({ points: new Map(), moved: false });
  const hintTimer = useRef();
  const available = useMemo(() => pairs(state.tiles), [state.tiles]);
  const remaining = state.tiles.filter((t) => !t.removed).length;
  const bounds = useMemo(() => {
    const topLayer = Math.max(...layout.map((tile) => tile.layer));
    return {
      topLayer,
      w:
        Math.max(
          ...layout.map((tile) => tile.col * 46 + (topLayer - tile.layer) * 5),
        ) + 52,
      h:
        Math.max(
          ...layout.map((tile) => tile.row * 60 + (topLayer - tile.layer) * 5),
        ) + 66,
    };
  }, [layout]);
  const fit = () => {
    const el = viewport.current;
    if (el)
      setView({
        zoom: Math.min(
          (el.clientWidth - 24) / bounds.w,
          (el.clientHeight - 24) / bounds.h,
          1.6,
        ),
        x: 0,
        y: 0,
      });
  };
  useEffect(() => {
    const observer = new ResizeObserver(fit);
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [bounds]);
  useEffect(() => () => clearTimeout(hintTimer.current), []);
  useEffect(() => {
    if (dialog) {
      const previous = document.activeElement;
      dialogRef.current.showModal();
      return () => {
        dialogRef.current?.close();
        previous?.focus();
      };
    }
  }, [dialog]);
  const clearHint = () => {
    clearTimeout(hintTimer.current);
    setHint([]);
  };
  const toggleOption = (key) => {
    const next = !options[key];
    setOptions((current) => ({ ...current, [key]: next }));
    try {
      localStorage.setItem(
        `shanghai-${key === "highlightAvailable" ? "highlight" : key === "showRedeal" ? "redeal" : "undo"}`,
        next ? "on" : "off",
      );
    } catch {
      // Options still work for this session when browser storage is unavailable.
    }
  };
  const select = (tile) => {
    if (gesture.current.moved || dialog) return;
    clearHint();
    if (!isFree(tile, state.tiles)) {
      setMessage(
        isCovered(tile, state.tiles)
          ? "上に牌が重なっています。先に上の牌を取りましょう。"
          : "左右がふさがっています。端の牌から取りましょう。",
      );
      return;
    }
    const first = state.tiles.find((t) => t.id === state.selected);
    setMessage(
      first && first.id !== tile.id && first.typeId === tile.typeId
        ? `ペアを取りました！ +${10 * (state.combo + 1)}点`
        : `${names[tile.typeId - 1]}を選択。同じ柄の牌を選びましょう。`,
    );
    dispatch({ type: "select", id: tile.id });
  };
  const newGame = (index) => {
    setLayoutIndex(index);
    dispatch({ type: "new", layout: LAYOUT_GENERATORS[index]() });
    clearHint();
    setDialog(null);
    setMessage("新しい盤面です。同じ柄の牌を探しましょう。");
    fit();
  };
  const act = (type) => {
    clearHint();
    dispatch({ type });
    setMessage(
      type === "undo" ? "一手戻しました。" : "残りの牌を配り直しました。",
    );
  };
  const zoomBy = (factor) =>
    setView((v) => ({
      ...v,
      zoom: Math.max(0.25, Math.min(3, v.zoom * factor)),
    }));
  function pointerDown(e) {
    if (e.button !== 0) return;
    const g = gesture.current;
    if (!g.points.size) g.moved = false;
    g.points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (g.points.size === 2) g.moved = true;
    e.target.setPointerCapture(e.pointerId);
  }
  function pointerMove(e) {
    const g = gesture.current,
      old = g.points.get(e.pointerId);
    if (!old) return;
    const next = { x: e.clientX, y: e.clientY };
    if (!g.moved && Math.hypot(next.x - old.x, next.y - old.y) < 6) return;
    g.moved = true;
    const other = [...g.points.entries()].find(
      ([id]) => id !== e.pointerId,
    )?.[1];
    const factor = other
      ? Math.hypot(next.x - other.x, next.y - other.y) /
        Math.max(1, Math.hypot(old.x - other.x, old.y - other.y))
      : 1;
    setView((v) => ({
      ...v,
      zoom: Math.min(3, Math.max(0.25, v.zoom * factor)),
      x: v.x + (next.x - old.x) / (other ? 2 : 1),
      y: v.y + (next.y - old.y) / (other ? 2 : 1),
    }));
    g.points.set(e.pointerId, next);
  }
  return (
    <main className="game">
      <header>
        <div>
          <p className="eyebrow">MAHJONG SOLITAIRE</p>
          <h1>
            上海 <span>静かなひととき、一組ずつ。</span>
          </h1>
        </div>
        <div className="header-actions">
          <button className="help" onClick={() => setDialog("help")}>
            遊び方
          </button>
          <button className="help" onClick={() => setDialog("options")}>
            オプション
          </button>
        </div>
      </header>
      <section className="dashboard" aria-label="ゲームの状況">
        <div>
          <small>配置</small>
          <strong>{LAYOUT_NAMES[layoutIndex]}</strong>
        </div>
        <div>
          <small>スコア</small>
          <strong>{state.score.toLocaleString()}</strong>
        </div>
        <div>
          <small>残りの牌</small>
          <strong>
            {remaining}
            <em> / {state.tiles.length}</em>
          </strong>
        </div>
        <div>
          <small>取れるペア</small>
          <strong>{available.length}</strong>
        </div>
      </section>
      <div
        className="progress"
        role="progressbar"
        aria-label="消した牌"
        aria-valuemin={0}
        aria-valuemax={state.tiles.length}
        aria-valuenow={state.tiles.length - remaining}
      >
        <i
          style={{ width: `${100 * (1 - remaining / state.tiles.length)}%` }}
        />
      </div>
      <div className="status" role="status">
        {remaining === 0
          ? "クリア！ すべての牌を取りました。"
          : available.length === 0
            ? "取れるペアがありません。一手戻すか配り直しを試しましょう。改善しない場合は新しいゲームへ。"
            : message}
      </div>
      <section
        ref={viewport}
        className="viewport"
        aria-label="上海の盤面"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={(e) => gesture.current.points.delete(e.pointerId)}
        onPointerCancel={(e) => {
          gesture.current.points.delete(e.pointerId);
          gesture.current.moved = true;
        }}
        onWheel={(e) => zoomBy(e.deltaY > 0 ? 0.9 : 1.1)}
      >
        <div
          className="board"
          style={{
            width: bounds.w,
            height: bounds.h,
            transform: `translate(${view.x}px,${view.y}px) scale(${view.zoom})`,
          }}
        >
          {state.tiles.map((tile) => {
            const free = isFree(tile, state.tiles);
            return (
              <button
                key={tile.id}
                className={`tile ${tile.removed ? "removed" : ""} ${options.highlightAvailable ? (free ? "free" : "blocked") : "uniform"} ${state.selected === tile.id ? "selected" : ""} ${hint.includes(tile.id) ? "hint" : ""}`}
                style={{
                  left: tile.col * 46 + (bounds.topLayer - tile.layer) * 5,
                  top: tile.row * 60 + (bounds.topLayer - tile.layer) * 5,
                  zIndex: tile.layer * 100 + Math.round(tile.row * 10),
                }}
                disabled={tile.removed}
                tabIndex={tile.removed ? -1 : 0}
                aria-label={`${names[tile.typeId - 1]}、${free ? "選択可能" : "今は取れません"}、${tile.layer + 1}段目`}
                aria-pressed={state.selected === tile.id}
                onKeyDown={() => {
                  gesture.current.moved = false;
                }}
                onClick={() => select(tile)}
              >
                <img
                  className="tile-shell"
                  src="tiles/tile-body.svg"
                  alt=""
                  draggable="false"
                />
                <img
                  className="tile-art"
                  src={`tiles/${TILE_IMAGES[tile.typeId - 1]}.png`}
                  alt=""
                  draggable="false"
                />
              </button>
            );
          })}
        </div>
        {remaining === 0 && (
          <div className="win">
            <p>お見事です</p>
            <h2>クリア！</h2>
            <p>{state.score.toLocaleString()} 点</p>
            <button
              className="primary"
              onClick={() => newGame(Math.floor(Math.random() * 5))}
            >
              もう一局遊ぶ
            </button>
          </div>
        )}
      </section>
      <div className="view-controls">
        <span>ドラッグで移動・ピンチで拡大</span>
        <button aria-label="縮小" onClick={() => zoomBy(0.85)}>
          −
        </button>
        <button aria-label="拡大" onClick={() => zoomBy(1.15)}>
          ＋
        </button>
        <button onClick={fit}>全体表示</button>
      </div>
      <footer className={!options.showUndo && !options.showRedeal ? "footer-single" : ""}>
        <button
          disabled={!available.length}
          onClick={() => {
            clearHint();
            setHint(available[0]);
            setMessage("光っている2枚を選べます。");
            hintTimer.current = setTimeout(() => setHint([]), 2500);
          }}
        >
          ✦ ヒント
        </button>
        {options.showUndo && (
          <button disabled={!state.history.length} onClick={() => act("undo")}>
            ↶ 一手戻す
          </button>
        )}
        {options.showRedeal && (
          <button disabled={!remaining} onClick={() => act("redeal")}>
            配り直し
          </button>
        )}
        <button className="primary" onClick={() => setDialog("new")}>
          新しいゲーム
        </button>
      </footer>
      <dialog
        ref={dialogRef}
        onCancel={() => setDialog(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setDialog(null);
        }}
        aria-labelledby="dialog-title"
      >
        <h2 id="dialog-title">
          {dialog === "help" ? "遊び方" : dialog === "options" ? "オプション" : "新しいゲーム"}
        </h2>
        {dialog === "options" ? (
          <div className="option-list">
            <label className="option-row">
              <span><strong>選択できる牌を明るく表示</strong><small>取れる牌と、まだ取れない牌を見分けやすくします。</small></span>
              <input type="checkbox" checked={options.highlightAvailable} onChange={() => toggleOption("highlightAvailable")} />
            </label>
            <label className="option-row">
              <span><strong>配り直しボタンを表示</strong><small>残りの牌の並びを変更できます。</small></span>
              <input type="checkbox" checked={options.showRedeal} onChange={() => toggleOption("showRedeal")} />
            </label>
            <label className="option-row">
              <span><strong>一手戻すボタンを表示</strong><small>直前の操作を取り消せます。</small></span>
              <input type="checkbox" checked={options.showUndo} onChange={() => toggleOption("showUndo")} />
            </label>
          </div>
        ) : dialog === "help" ? (
          <>
            <p>同じ柄の牌を2枚ずつ取り、すべて消せばクリアです。</p>
            <ol>
              <li>上に牌が重なっていない</li>
              <li>左右どちらかが空いている</li>
            </ol>
            <p>
              この2つを満たす明るい牌を選べます。春・夏も同じ柄どうしで組み合わせます。
            </p>
            <p>
              連続でペアを取ると10点、20点…と加点。違う柄の選択や配り直しでコンボがリセットされます。
            </p>
            <p>拡大後はドラッグで移動。「全体表示」で元の位置に戻ります。</p>
          </>
        ) : (
          <>
            <p>今のゲームを終了して、選んだ配置で始めます。</p>
            <div className="layouts">
              {LAYOUT_NAMES.map((name, i) => (
                <button key={name} onClick={() => newGame(i)}>
                  {name}
                </button>
              ))}
            </div>
          </>
        )}
        <button className="close" onClick={() => setDialog(null)}>
          閉じる
        </button>
      </dialog>
    </main>
  );
}

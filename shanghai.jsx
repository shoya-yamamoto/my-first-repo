import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// --- Tile Type Definitions ---
const TILE_TYPES = [
  { id: 1, label: "一", sub: "萬", color: "#c0392b" },
  { id: 2, label: "二", sub: "萬", color: "#c0392b" },
  { id: 3, label: "三", sub: "萬", color: "#c0392b" },
  { id: 4, label: "四", sub: "萬", color: "#c0392b" },
  { id: 5, label: "五", sub: "萬", color: "#c0392b" },
  { id: 6, label: "六", sub: "萬", color: "#c0392b" },
  { id: 7, label: "七", sub: "萬", color: "#c0392b" },
  { id: 8, label: "八", sub: "萬", color: "#c0392b" },
  { id: 9, label: "九", sub: "萬", color: "#c0392b" },
  { id: 10, label: "一", sub: "筒", color: "#2471a3" },
  { id: 11, label: "二", sub: "筒", color: "#2471a3" },
  { id: 12, label: "三", sub: "筒", color: "#2471a3" },
  { id: 13, label: "四", sub: "筒", color: "#2471a3" },
  { id: 14, label: "五", sub: "筒", color: "#2471a3" },
  { id: 15, label: "六", sub: "筒", color: "#2471a3" },
  { id: 16, label: "七", sub: "筒", color: "#2471a3" },
  { id: 17, label: "八", sub: "筒", color: "#2471a3" },
  { id: 18, label: "九", sub: "筒", color: "#2471a3" },
  { id: 19, label: "東", sub: "", color: "#1a5276" },
  { id: 20, label: "南", sub: "", color: "#1a5276" },
  { id: 21, label: "西", sub: "", color: "#1a5276" },
  { id: 22, label: "北", sub: "", color: "#1a5276" },
  { id: 23, label: "中", sub: "", color: "#e74c3c" },
  { id: 24, label: "發", sub: "", color: "#27ae60" },
  { id: 25, label: "白", sub: "", color: "#7f8c8d" },
  { id: 26, label: "一", sub: "索", color: "#1e8449" },
  { id: 27, label: "二", sub: "索", color: "#1e8449" },
  { id: 28, label: "三", sub: "索", color: "#1e8449" },
  { id: 29, label: "四", sub: "索", color: "#1e8449" },
  { id: 30, label: "五", sub: "索", color: "#1e8449" },
  { id: 31, label: "六", sub: "索", color: "#1e8449" },
  { id: 32, label: "七", sub: "索", color: "#1e8449" },
  { id: 33, label: "八", sub: "索", color: "#1e8449" },
  { id: 34, label: "九", sub: "索", color: "#1e8449" },
  { id: 35, label: "春", sub: "", color: "#d4ac0d" },
  { id: 36, label: "夏", sub: "", color: "#d4ac0d" },
];

// --- Layout Definition (layer, row, col) ---
const LAYOUT = (() => {
  const positions = [];
  // Layer 0: Classic turtle shape
  const L0 = [
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  ];
  for (let r = 0; r < L0.length; r++) {
    for (let c = 0; c < L0[r].length; c++) {
      if (L0[r][c]) positions.push({ layer: 0, row: r, col: c });
    }
  }
  // Layer 1: 8×4 centered
  const L1 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  for (let r = 0; r < L1.length; r++) {
    for (let c = 0; c < L1[r].length; c++) {
      if (L1[r][c]) positions.push({ layer: 1, row: r + 2.5, col: c + 3.5 });
    }
  }
  // Layer 2: 6×2
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 6; c++) {
      positions.push({ layer: 2, row: r + 3, col: c + 4 });
    }
  }
  // Layer 3: 4×2
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      positions.push({ layer: 3, row: r + 3.5, col: c + 5.5 });
    }
  }
  // Layer 4: 2×1
  positions.push({ layer: 4, row: 4, col: 6 });
  positions.push({ layer: 4, row: 4, col: 7 });
  // Layer 5: top 1
  positions.push({ layer: 5, row: 4.5, col: 7 });

  return positions;
})();

// --- Utility Functions ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateTiles(layout) {
  const total = layout.length;
  const pairCount = Math.floor(total / 2);
  const types = [];
  for (let i = 0; i < pairCount; i++) {
    const typeId = (i % TILE_TYPES.length) + 1;
    types.push(typeId, typeId);
  }
  while (types.length < total) {
    types.push(1, 1);
  }
  const shuffled = shuffle(types.slice(0, total));
  return layout.map((pos, idx) => ({
    id: idx,
    typeId: shuffled[idx],
    ...pos,
    removed: false,
  }));
}

function isCovered(tile, tiles) {
  return tiles.some(
    (t) =>
      !t.removed &&
      t.layer === tile.layer + 1 &&
      Math.abs(t.row - tile.row) < 1 &&
      Math.abs(t.col - tile.col) < 1
  );
}

function isSideBlocked(tile, tiles) {
  const sameLayer = tiles.filter(
    (t) => !t.removed && t.layer === tile.layer && t.id !== tile.id
  );
  const leftBlocked = sameLayer.some(
    (t) => Math.abs(t.col - (tile.col - 1)) < 0.01 && Math.abs(t.row - tile.row) < 0.8
  );
  const rightBlocked = sameLayer.some(
    (t) => Math.abs(t.col - (tile.col + 1)) < 0.01 && Math.abs(t.row - tile.row) < 0.8
  );
  return leftBlocked && rightBlocked;
}

function isFree(tile, tiles) {
  if (tile.removed) return false;
  return !isCovered(tile, tiles) && !isSideBlocked(tile, tiles);
}

function findHint(tiles) {
  const free = tiles.filter((t) => isFree(t, tiles));
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (free[i].typeId === free[j].typeId) {
        return [free[i].id, free[j].id];
      }
    }
  }
  return null;
}

function hasMovesLeft(tiles) {
  return findHint(tiles) !== null;
}

// --- Main Game Component ---
export default function ShanghaiGame() {
  const [tiles, setTiles] = useState(() => generateTiles(LAYOUT));
  const [selected, setSelected] = useState(null);
  const [hint, setHint] = useState(null);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [shakeId, setShakeId] = useState(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const boardRef = useRef(null);

  const remaining = tiles.filter((t) => !t.removed).length;

  const TILE_W = 22;
  const TILE_H = 28;
  const GAP = 1.5;
  const LAYER_OFFSET_X = 2;
  const LAYER_OFFSET_Y = 2;

  const boardInfo = useMemo(() => {
    const maxCol = Math.max(...LAYOUT.map((p) => p.col));
    const maxRow = Math.max(...LAYOUT.map((p) => p.row));
    const maxLayer = Math.max(...LAYOUT.map((p) => p.layer));
    const w =
      (maxCol + 1) * (TILE_W + GAP) +
      maxLayer * LAYER_OFFSET_X +
      TILE_W * 0.5 +
      10;
    const h =
      (maxRow + 1) * (TILE_H + GAP) +
      maxLayer * LAYER_OFFSET_Y +
      TILE_H * 0.5 +
      10;
    return { w, h };
  }, []);

  const newGame = useCallback(() => {
    setTiles(generateTiles(LAYOUT));
    setSelected(null);
    setHint(null);
    setRemovingIds(new Set());
    setScore(0);
    setGameState("playing");
    setCombo(0);
    setShowModal(false);
  }, []);

  const reshuffleTiles = useCallback(() => {
    setTiles((prev) => {
      const rem = prev.filter((t) => !t.removed);
      const removed = prev.filter((t) => t.removed);
      const typeIds = shuffle(rem.map((t) => t.typeId));
      const reshuffled = rem.map((t, i) => ({ ...t, typeId: typeIds[i] }));
      return [...reshuffled, ...removed];
    });
    setSelected(null);
    setHint(null);
    setCombo(0);
  }, []);

  const showHintHandler = useCallback(() => {
    const h = findHint(tiles);
    setHint(h);
    if (h) setTimeout(() => setHint(null), 2000);
  }, [tiles]);

  const handleTileClick = useCallback(
    (tile) => {
      if (gameState !== "playing") return;
      if (tile.removed || removingIds.has(tile.id)) return;
      if (!isFree(tile, tiles)) {
        setShakeId(tile.id);
        setTimeout(() => setShakeId(null), 400);
        return;
      }

      if (selected === null) {
        setSelected(tile.id);
        setHint(null);
      } else if (selected === tile.id) {
        setSelected(null);
      } else {
        const selectedTile = tiles.find((t) => t.id === selected);
        if (selectedTile && selectedTile.typeId === tile.typeId) {
          const ids = new Set([selected, tile.id]);
          setRemovingIds(ids);
          setSelected(null);
          const newCombo = combo + 1;
          setCombo(newCombo);
          if (newCombo >= 2) {
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 800);
          }
          const points = 10 * newCombo;
          setScore((s) => s + points);

          setTimeout(() => {
            setTiles((prev) => {
              const next = prev.map((t) =>
                ids.has(t.id) ? { ...t, removed: true } : t
              );
              const rem = next.filter((n) => !n.removed);
              if (rem.length === 0) {
                setGameState("won");
                setShowModal(true);
              } else if (!hasMovesLeft(next)) {
                setGameState("stuck");
                setShowModal(true);
              }
              return next;
            });
            setRemovingIds(new Set());
          }, 300);
        } else {
          setSelected(tile.id);
          setCombo(0);
        }
      }
    },
    [selected, tiles, gameState, removingIds, combo]
  );

  const getTileStyle = (tile) => {
    const free = isFree(tile, tiles);
    const isSelected = selected === tile.id;
    const isHint = hint && hint.includes(tile.id);
    const isRemoving = removingIds.has(tile.id);
    const isShaking = shakeId === tile.id;

    const x = tile.col * (TILE_W + GAP) + tile.layer * LAYER_OFFSET_X;
    const y = tile.row * (TILE_H + GAP) + tile.layer * LAYER_OFFSET_Y;

    const bg = isSelected
      ? "linear-gradient(180deg, #fff8dc, #f0e68c)"
      : isHint
      ? "linear-gradient(180deg, #e8f8e0, #b8e6a0)"
      : free
      ? "linear-gradient(180deg, #fefefe, #e8e0d0)"
      : "linear-gradient(180deg, #d8d0c0, #c0b8a8)";

    const border = isSelected
      ? "#d4af37"
      : isHint
      ? "#66bb6a"
      : "#b0a890";

    const shadow = isSelected
      ? "0 0 6px rgba(212,175,55,0.6), 1px 2px 2px rgba(0,0,0,0.3)"
      : isHint
      ? "0 0 6px rgba(102,187,106,0.5), 1px 2px 2px rgba(0,0,0,0.3)"
      : "1px 2px 2px rgba(0,0,0,0.3)";

    const transform = isRemoving ? "scale(0.5) translateY(-10px)" : "none";

    return {
      position: "absolute",
      left: x,
      top: y,
      width: TILE_W,
      height: TILE_H,
      zIndex: tile.layer * 100 + Math.round(tile.row * 10),
      background: bg,
      border: `1.5px solid ${border}`,
      borderRadius: 3,
      boxShadow: shadow,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: free ? "pointer" : "default",
      transition: isRemoving
        ? "transform 0.3s ease-out, opacity 0.3s"
        : "box-shadow 0.15s",
      transform,
      opacity: isRemoving ? 0 : 1,
      userSelect: "none",
      WebkitTapHighlightColor: "transparent",
      animation: isShaking ? "shake 0.4s ease" : undefined,
      touchAction: "manipulation",
    };
  };

  const tileType = (typeId) =>
    TILE_TYPES[(typeId - 1) % TILE_TYPES.length];

  const btnStyle = {
    padding: "6px 10px",
    border: "1px solid #5a8a6a",
    borderRadius: 6,
    background: "rgba(90,138,106,0.15)",
    color: "#8fbc8f",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    touchAction: "manipulation",
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(145deg, #1a3a2a 0%, #0d2818 50%, #1a3a2a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily:
          "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        @keyframes fadeUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.3); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes winGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,215,0,0.5); }
          50% { text-shadow: 0 0 25px rgba(255,215,0,0.9), 0 0 50px rgba(255,165,0,0.5); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "12px 16px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          maxWidth: 420,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#d4af37",
              letterSpacing: 4,
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}
          >
            上海
          </div>
          <div
            style={{ fontSize: 9, color: "#8fbc8f", letterSpacing: 1 }}
          >
            MAHJONG SOLITAIRE
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: 16, fontWeight: 700, color: "#d4af37" }}
            >
              {score}
            </div>
            <div style={{ fontSize: 8, color: "#8fbc8f" }}>SCORE</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: 16, fontWeight: 700, color: "#e8e0d0" }}
            >
              {remaining}
            </div>
            <div style={{ fontSize: 8, color: "#8fbc8f" }}>残り</div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          overflow: "auto",
          padding: "8px",
          boxSizing: "border-box",
        }}
      >
        <div
          ref={boardRef}
          style={{
            position: "relative",
            width: boardInfo.w,
            height: boardInfo.h,
            flexShrink: 0,
          }}
        >
          {tiles
            .filter((t) => !t.removed || removingIds.has(t.id))
            .sort((a, b) => a.layer - b.layer || a.row - b.row)
            .map((tile) => {
              const type = tileType(tile.typeId);
              return (
                <div
                  key={tile.id}
                  style={getTileStyle(tile)}
                  onClick={() => handleTileClick(tile)}
                >
                  <span
                    style={{
                      fontSize: type.sub ? 10 : 13,
                      fontWeight: 800,
                      color: type.color,
                      lineHeight: 1,
                    }}
                  >
                    {type.label}
                  </span>
                  {type.sub && (
                    <span
                      style={{
                        fontSize: 6,
                        color: type.color,
                        lineHeight: 1,
                        marginTop: 1,
                      }}
                    >
                      {type.sub}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Combo popup */}
      {showCombo && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 28,
            fontWeight: 900,
            color: "#d4af37",
            textShadow: "0 0 20px rgba(212,175,55,0.8)",
            pointerEvents: "none",
            animation: "fadeUp 0.8s ease-out forwards",
            zIndex: 1000,
          }}
        >
          {combo}x COMBO!
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "8px 16px 16px",
          display: "flex",
          gap: 8,
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <button onClick={showHintHandler} style={btnStyle}>
          ヒント
        </button>
        <button onClick={reshuffleTiles} style={btnStyle}>
          配り直し
        </button>
        <button onClick={newGame} style={btnStyle}>
          新規
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(180deg, #1a3a2a, #0d2818)",
              border: "2px solid #d4af37",
              borderRadius: 16,
              padding: "28px 24px 20px",
              textAlign: "center",
              maxWidth: 300,
              width: "85%",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#d4af37",
                marginBottom: 8,
                animation:
                  gameState === "won"
                    ? "winGlow 1.5s ease infinite"
                    : undefined,
              }}
            >
              {gameState === "won" ? "クリア！" : "詰み…"}
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#e8e0d0",
                marginBottom: 4,
              }}
            >
              スコア: {score}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#8fbc8f",
                marginBottom: 20,
              }}
            >
              {gameState === "won"
                ? "おめでとうございます！"
                : "動かせる牌がありません"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {gameState === "stuck" && (
                <button
                  onClick={() => {
                    reshuffleTiles();
                    setGameState("playing");
                    setShowModal(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #5a8a6a",
                    borderRadius: 8,
                    background: "rgba(90,138,106,0.2)",
                    color: "#8fbc8f",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  配り直し
                </button>
              )}
              <button
                onClick={newGame}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #d4af37",
                  borderRadius: 8,
                  background:
                    "linear-gradient(180deg, #d4af37, #b8942e)",
                  color: "#1a3a2a",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                新しいゲーム
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

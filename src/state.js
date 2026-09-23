import { generateTiles, isFree, shuffle } from "./game.js";
export function pairs(tiles) {
  const free = tiles.filter((t) => isFree(t, tiles));
  return free.flatMap((a, i) =>
    free
      .slice(i + 1)
      .filter((b) => a.typeId === b.typeId)
      .map((b) => [a.id, b.id]),
  );
}
// Preserve the remaining multiset and guarantee a move when geometry allows one.
export function redeal(tiles) {
  const types = shuffle(tiles.filter((t) => !t.removed).map((t) => t.typeId));
  const next = tiles.map((t) =>
    t.removed ? t : { ...t, typeId: types.shift() },
  );
  if (pairs(next).length) return next;
  const free = next.filter((t) => isFree(t, next));
  if (free.length < 2) return next;
  const partner = next.find(
    (t) => !t.removed && t.id !== free[0].id && t.typeId === free[0].typeId,
  );
  if (partner)
    [free[1].typeId, partner.typeId] = [partner.typeId, free[1].typeId];
  return next;
}
export function start(layout) {
  return {
    tiles: redeal(generateTiles(layout)),
    selected: null,
    score: 0,
    combo: 0,
    history: [],
  };
}
export function reducer(state, action) {
  if (action.type === "new") return start(action.layout);
  if (action.type === "undo") return state.history.at(-1) || state;
  if (action.type === "redeal")
    return {
      ...state,
      tiles: redeal(state.tiles),
      selected: null,
      combo: 0,
      history: [...state.history, state],
    };
  if (action.type !== "select") return state;
  const tile = state.tiles.find((t) => t.id === action.id);
  if (!tile || !isFree(tile, state.tiles)) return state;
  if (state.selected === tile.id) return { ...state, selected: null };
  const selected = state.tiles.find((t) => t.id === state.selected);
  if (!selected || selected.typeId !== tile.typeId)
    return { ...state, selected: tile.id, combo: selected ? 0 : state.combo };
  const combo = state.combo + 1;
  return {
    ...state,
    selected: null,
    combo,
    score: state.score + 10 * combo,
    history: [...state.history, { ...state, selected: null }],
    tiles: state.tiles.map((t) =>
      t.id === selected.id || t.id === tile.id ? { ...t, removed: true } : t,
    ),
  };
}

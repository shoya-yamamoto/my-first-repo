import { test } from "node:test";
import assert from "node:assert/strict";
import { LAYOUT_GENERATORS, isFree, isCovered } from "../src/game.js";
import { start, reducer, redeal, pairs } from "../src/state.js";
const tile = (id, col, typeId = 1, layer = 0, row = 0) => ({
  id,
  col,
  typeId,
  layer,
  row,
  removed: false,
});
test("all five original layouts retain 144 tiles and an opening pair", () => {
  for (const layout of LAYOUT_GENERATORS)
    for (let i = 0; i < 20; i++) {
      const state = start(layout());
      assert.equal(state.tiles.length, 144);
      assert.ok(pairs(state.tiles).length);
      const counts = new Map();
      for (const t of state.tiles)
        counts.set(t.typeId, (counts.get(t.typeId) || 0) + 1);
      assert.equal(counts.size, 36);
      assert.ok([...counts.values()].every((n) => n === 4));
    }
});

test("every raised tile has support below and tiles on one level do not overlap", () => {
  for (const makeLayout of LAYOUT_GENERATORS) {
    const layout = makeLayout();
    for (const tile of layout) {
      const sameLevel = layout.filter(
        (other) => other !== tile && other.layer === tile.layer,
      );
      assert.ok(
        sameLevel.every(
          (other) =>
            Math.abs(other.col - tile.col) >= 44 / 46 ||
            Math.abs(other.row - tile.row) >= 58 / 60,
        ),
        `same-level overlap at layer ${tile.layer}, row ${tile.row}, col ${tile.col}`,
      );
      if (tile.layer === 0) continue;
      const below = layout.filter((other) => other.layer === tile.layer - 1);
      let supported = 0;
      let sampled = 0;
      for (let y = 2; y < 58; y += 4) {
        for (let x = 2; x < 44; x += 4) {
          sampled++;
          const px = tile.col * 46 - tile.layer * 5 + x;
          const py = tile.row * 60 - tile.layer * 5 + y;
          if (
            below.some((other) =>
              px >= other.col * 46 - other.layer * 5 &&
              px < other.col * 46 - other.layer * 5 + 44 &&
              py >= other.row * 60 - other.layer * 5 &&
              py < other.row * 60 - other.layer * 5 + 58,
            )
          ) supported++;
        }
      }
      assert.ok(
        supported / sampled >= 0.75,
        `floating tile at layer ${tile.layer}, row ${tile.row}, col ${tile.col}`,
      );
    }
  }
});
test("covered by any upper layer and blocked on both sides", () => {
  const board = [tile(0, 0), tile(1, 1), tile(2, 2)];
  assert.ok(isFree(board[0], board));
  assert.equal(isFree(board[1], board), false);
  board.push(tile(3, 0, 1, 2));
  assert.ok(isCovered(board[0], board));
  board[3].removed = true;
  assert.ok(isFree(board[0], board));
});
test("atomic matches, combo scoring and undo restore exact prior state", () => {
  const original = {
    tiles: [tile(0, 0), tile(1, 2), tile(2, 4, 2), tile(3, 6, 2)],
    score: 0,
    combo: 0,
    selected: null,
    history: [],
  };
  let s = reducer(reducer(original, { type: "select", id: 0 }), {
    type: "select",
    id: 1,
  });
  assert.equal(s.score, 10);
  assert.equal(s.tiles.filter((t) => t.removed).length, 2);
  assert.equal(reducer(s, { type: "select", id: 1 }), s);
  const first = s;
  s = reducer(reducer(s, { type: "select", id: 2 }), { type: "select", id: 3 });
  assert.equal(s.score, 30);
  assert.equal(s.tiles.filter((t) => !t.removed).length, 0);
  assert.deepEqual(reducer(s, { type: "undo" }), first);
  assert.deepEqual(reducer(first, { type: "undo" }), original);
});
test("redeal preserves removed tiles, types and coordinates, produces a playable pair", () => {
  const board = [
    tile(0, 0, 1),
    tile(1, 1, 2),
    tile(2, 2, 1),
    tile(3, 3, 2),
    { ...tile(4, 8, 3), removed: true },
  ];
  for (let i = 0; i < 100; i++) {
    const next = redeal(board);
    assert.ok(pairs(next).length);
    assert.deepEqual(
      next.map((t) => t.typeId).sort(),
      board.map((t) => t.typeId).sort(),
    );
    assert.deepEqual(
      next.map((t) => [t.id, t.row, t.col, t.removed]),
      board.map((t) => [t.id, t.row, t.col, t.removed]),
    );
    assert.deepEqual(next[4], board[4]);
  }
});
test("redeal reports geometric dead ends without an infinite retry", () => {
  const board = [tile(0, 0), tile(1, 0, 1, 1)];
  assert.equal(pairs(redeal(board)).length, 0);
});
test("new game clears history and no delayed mutation can affect it", () => {
  const s = reducer(start(LAYOUT_GENERATORS[0]()), { type: "redeal" });
  const fresh = reducer(s, { type: "new", layout: LAYOUT_GENERATORS[1]() });
  assert.equal(fresh.history.length, 0);
  assert.equal(fresh.score, 0);
  assert.equal(fresh.selected, null);
  assert.ok(fresh.tiles.every((t) => !t.removed));
});

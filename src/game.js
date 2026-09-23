const TILE_TYPES = Array.from({ length: 36 }, (_, i) => ({ id: i + 1 }));

// Helper: grid to positions
function gridToPos(grid, layer, rOff, cOff) {
  const p = [];
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++)
      if (grid[r][c])
        p.push({ layer, row: r + (rOff || 0), col: c + (cOff || 0) });
  return p;
}

const LAYOUT_NAMES = ["亀", "城", "十字", "ピラミッド", "蜘蛛"];

// Layout 1: 亀 (Classic Turtle) = 144
function makeLayoutTurtle() {
  const p = gridToPos(
    [
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    ],
    0,
  );
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++)
      p.push({ layer: 1, row: r + 2.5, col: c + 3.5 });
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 6; c++) p.push({ layer: 2, row: r + 3, col: c + 4 });
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 4; c++)
      p.push({ layer: 3, row: r + 3, col: c + 5.5 });
  p.push({ layer: 4, row: 4, col: 6 }, { layer: 4, row: 4, col: 7 });
  p.push({ layer: 5, row: 4, col: 6 }, { layer: 5, row: 4, col: 7 });
  return p;
}
// Layout 2: 城 (Castle) = 144
function makeLayoutCastle() {
  const p = gridToPos(
    [
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    ],
    0,
  ); // 96
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 5; c++)
      p.push({ layer: 1, row: r + 2, col: c + 5 }); // 20 central supports
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++) {
      p.push({ layer: 1, row: r, col: c + 1 });
      p.push({ layer: 1, row: r, col: c + 11 });
    } // 8 tower supports
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++) {
      p.push({ layer: 2, row: r, col: c + 1 });
      p.push({ layer: 2, row: r, col: c + 11 });
    } // 8
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 4; c++)
      p.push({ layer: 2, row: r + 3.5, col: c + 5.5 }); // 8
  p.push(
    { layer: 3, row: 4, col: 6.5 },
    { layer: 3, row: 4, col: 7.5 },
    { layer: 3, row: 1, col: 2 },
    { layer: 3, row: 1, col: 11.5 },
  ); // 4
  return p; // 96+20+8+8+8+4=144
}
// Layout 3: 十字 (Cross) = 144
function makeLayoutCross() {
  const p = gridToPos(
    [
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    ],
    0,
  ); // 80
  p.push(
    ...gridToPos(
      [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 1, 1, 0, 0],
      ],
      1,
      2.5,
      3.5,
    ),
  ); // 24
  p.push(
    ...gridToPos(
      [
        [0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 0, 0],
      ],
      2,
      2.5,
      4.5,
    ),
  ); // 16
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 6; c++)
      p.push({ layer: 3, row: r + 3.5, col: c + 4.5 }); // 12
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 4; c++)
      p.push({ layer: 4, row: r + 3.5, col: c + 5.5 }); // 8
  p.push(
    { layer: 5, row: 3.5, col: 6.5 },
    { layer: 5, row: 3.5, col: 7.5 },
    { layer: 5, row: 4.5, col: 6.5 },
    { layer: 5, row: 4.5, col: 7.5 },
  ); // 4
  return p; // 80+24+16+12+8+4=144
}
// Layout 4: ピラミッド (Pyramid) = 144
function makeLayoutPyramid() {
  const p = gridToPos(
    [
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    ],
    0,
  ); // 96
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++)
      p.push({ layer: 1, row: r + 2.5, col: c + 3.5 }); // 32
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 6; c++) p.push({ layer: 2, row: r + 3, col: c + 4.5 }); // 12
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++)
      p.push({ layer: 3, row: r + 3, col: c + 6.5 }); // 4
  return p; // 96+32+12+4=144
}
// Layout 5: 蜘蛛 (Spider) = 144
function makeLayoutSpider() {
  const p = gridToPos(
    [
      [1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1],
      [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    ],
    0,
  ); // 84
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++)
      p.push({ layer: 1, row: r + 2, col: c + 3.5 }); // 32
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 6; c++)
      p.push({ layer: 2, row: r + 3.5, col: c + 4.5 }); // 12
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 4; c++)
      p.push({ layer: 3, row: r + 3.5, col: c + 5.5 }); // 8
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 2; c++)
      p.push({ layer: 4, row: r + 3.5, col: c + 6.5 }); // 4
  p.push({ layer: 5, row: 4, col: 6.5 }, { layer: 5, row: 4, col: 7.5 }); // 2
  p.push({ layer: 1, row: 0, col: 0 }, { layer: 1, row: 0, col: 13 }); // 2
  return p; // 84+32+12+8+4+2+2=144
}

const LAYOUT_GENERATORS = [
  makeLayoutTurtle,
  makeLayoutCastle,
  makeLayoutCross,
  makeLayoutPyramid,
  makeLayoutSpider,
];
function getRandomLayout() {
  const i = Math.floor(Math.random() * LAYOUT_GENERATORS.length);
  return { layout: LAYOUT_GENERATORS[i](), name: LAYOUT_NAMES[i] };
}

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
  for (let i = 0; i < pairCount; i++)
    types.push((i % TILE_TYPES.length) + 1, (i % TILE_TYPES.length) + 1);
  while (types.length < total) types.push(1, 1);
  const shuffled = shuffle(types.slice(0, total));
  return layout.map((pos, idx) => ({
    id: idx,
    typeId: shuffled[idx],
    ...pos,
    removed: false,
  }));
}

function isCovered(t, tiles) {
  return tiles.some(
    (o) =>
      !o.removed &&
      o.layer > t.layer &&
      Math.abs(o.row - t.row) < 1 &&
      Math.abs(o.col - t.col) < 1,
  );
}
function isSideBlocked(t, tiles) {
  const s = tiles.filter(
    (o) => !o.removed && o.layer === t.layer && o.id !== t.id,
  );
  return (
    s.some(
      (o) =>
        Math.abs(o.col - (t.col - 1)) < 0.01 && Math.abs(o.row - t.row) < 0.8,
    ) &&
    s.some(
      (o) =>
        Math.abs(o.col - (t.col + 1)) < 0.01 && Math.abs(o.row - t.row) < 0.8,
    )
  );
}
function isFree(t, tiles) {
  return !t.removed && !isCovered(t, tiles) && !isSideBlocked(t, tiles);
}
function findHint(tiles) {
  const f = tiles.filter((t) => isFree(t, tiles));
  for (let i = 0; i < f.length; i++)
    for (let j = i + 1; j < f.length; j++)
      if (f[i].typeId === f[j].typeId) return [f[i].id, f[j].id];
  return null;
}
function hasMovesLeft(tiles) {
  return findHint(tiles) !== null;
}

export {
  LAYOUT_NAMES,
  LAYOUT_GENERATORS,
  generateTiles,
  isCovered,
  isSideBlocked,
  isFree,
  findHint,
  shuffle,
};

// A plane design: one piece of each kind, plus stickers. No drawing here.

import { KINDS, PIECES, STARTER, STICKER_IDS, MAX_STICKERS } from './data.js';

const pieces = design => KINDS.map(k => PIECES[design[k]]);

export function stats(design) {
  const sum = f => pieces(design).reduce((s, p) => s + p[f], 0);
  return { fast: sum('fast'), pretty: sum('pretty') + (design.stickers.length ? 1 : 0), comfy: sum('comfy'), seats: sum('seats') };
}

export const buildCost = design => pieces(design).reduce((s, p) => s + p.build, 0);

// Put a piece on. It takes the place of the piece of the same kind.
export function setPiece(design, pieceId) {
  const p = Object.hasOwn(PIECES, pieceId) ? PIECES[pieceId] : null;
  if (!p || design[p.kind] === pieceId) return design;
  return { ...design, [p.kind]: pieceId };
}

// x and y run from -1 to 1 across the plane's picture.
export function addSticker(design, id, x, y) {
  if (!STICKER_IDS.includes(id) || design.stickers.length >= MAX_STICKERS) return design;
  return { ...design, stickers: [...design.stickers, { id, x, y }] };
}

export function removeSticker(design, index) {
  if (!Number.isInteger(index) || index < 0 || index >= design.stickers.length) return design;
  return { ...design, stickers: design.stickers.filter((_, i) => i !== index) };
}

// Owned pieces of this kind that cost less to build, dearest first.
export function cheaper(design, kind, owned) {
  const now = PIECES[design[kind]].build;
  return owned
    .filter(id => Object.hasOwn(PIECES, id) && PIECES[id].kind === kind && PIECES[id].build < now)
    .sort((a, b) => PIECES[b].build - PIECES[a].build);
}

export const cheapestDesign = design => ({ ...STARTER, stickers: design.stickers });

const clamp = n => (Number.isFinite(n) ? Math.max(-1, Math.min(1, n)) : 0);

// Turn anything (an old or broken save) into a design made of owned pieces.
export function tidyDesign(raw, owned) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const d = { stickers: [] };
  for (const k of KINDS) {
    const id = src[k];
    d[k] = typeof id === 'string' && Object.hasOwn(PIECES, id) && PIECES[id].kind === k && owned.includes(id) ? id : STARTER[k];
  }
  if (Array.isArray(src.stickers)) {
    d.stickers = src.stickers
      .filter(s => s && typeof s === 'object' && STICKER_IDS.includes(s.id))
      .slice(0, MAX_STICKERS)
      .map(s => ({ id: s.id, x: clamp(s.x), y: clamp(s.y) }));
  }
  return d;
}

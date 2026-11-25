// What the Investor Bosses offer for a design, and what they wish for.

import { BOSSES, BOSS_ORDER, PIECES, KINDS, STAR_PAY, STAR_CAP, WISH_BONUS } from './data.js';
import { stats } from './plane.js';

export function offer(bossId, design, wish) {
  const boss = BOSSES[bossId];
  const stars = stats(design)[boss.loves];
  const wishMet = !!wish && wish.bossId === bossId && KINDS.some(k => design[k] === wish.pieceId);
  const amount = Math.max(boss.floor, STAR_PAY * Math.min(stars, STAR_CAP)) + (wishMet ? WISH_BONUS : 0);
  return { bossId, stars, amount, wishMet };
}

export const offers = (design, wish) => BOSS_ORDER.map(b => offer(b, design, wish));

// One boss wishes for one piece the child owns (never "no top" or "plain").
// Pieces bought in the shop are wished for before the starter ones.
export function pickWish(owned, rng = Math.random) {
  const all = owned.filter(id => Object.hasOwn(PIECES, id) && id !== 'none' && id !== 'plain');
  const bought = all.filter(id => PIECES[id].own > 0);
  const real = bought.length ? bought : all;
  const pick = list => list[Math.min(list.length - 1, Math.floor(rng() * list.length))];
  return { bossId: pick(BOSS_ORDER), pieceId: pick(real) };
}

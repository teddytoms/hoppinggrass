// Money: where a plane can fly, what a flight earns, the bosses' slices,
// buying pieces and paying for a build. The piggy bank never goes below $0.

import { PIECES, PLACES, BOSSES, CITY_PRICE, DRAGON_TIP, RAINBOW_LUCK } from './data.js';
import { stats, buildCost, tidyDesign } from './plane.js';

export const placeById = id => PLACES.find(p => p.id === id) ?? null;

export function canReach(place, plane, game) {
  if (!plane) return false;
  if (place.needsCity) return !!game.cityBuilt;
  return stats(plane.design).fast >= place.fast;
}

// How many more Fast stars this trip needs.
export const fastNeeded = (place, plane) => Math.max(0, place.fast - stats(plane.design).fast);

// What one flight earns. Each boss who paid for the plane takes 1 coin in
// every 10 (at least $1), but never so much that the child keeps less than $0.
// extras: { dragon: true } when a baby dragon rode along, { rainbow: true } on a rainbow day.
export function earnings(design, place, starsCaught, funders, extras = {}) {
  const s = stats(design);
  const tickets = s.seats * place.ticket;
  const tips = s.comfy + s.pretty;
  const dragon = extras.dragon === true ? DRAGON_TIP : 0;
  const rainbow = extras.rainbow === true ? RAINBOW_LUCK : 0;
  const total = tickets + starsCaught + tips + dragon + rainbow;
  let left = total;
  const slices = funders.map(bossId => {
    const amount = Math.min(left, Math.max(1, Math.floor(total / 10)));
    left -= amount;
    return { bossId, amount };
  });
  return { tickets, stars: starsCaught, tips, dragon, rainbow, total, slices, keep: left };
}

export const startFlight = game => ({ ...game, flightSeq: game.flightSeq + 1 });

// Put the flight's money in the piggy bank. Each flight pays only once.
export function landFlight(game, placeId, starsCaught, extras = {}) {
  const place = placeById(placeId);
  if (!place || !game.plane || !canReach(place, game.plane, game) || game.flightSeq === game.lastPaidSeq) return game;
  const { keep } = earnings(game.plane.design, place, starsCaught, game.plane.funders, extras);
  return { ...game, money: game.money + keep, flights: game.flights + 1, lastPaidSeq: game.flightSeq };
}

const allOwned = game => Object.keys(PIECES).every(id => game.owned.includes(id));
export const piecesLeft = game => Object.keys(PIECES).filter(id => !game.owned.includes(id)).length;

export const priceOf = id => (id === 'city' ? CITY_PRICE : PIECES[id].own);

export function canBuy(game, id) {
  if (id === 'city') return !game.cityBuilt && allOwned(game) && game.money >= CITY_PRICE;
  return Object.hasOwn(PIECES, id) && !game.owned.includes(id) && game.money >= PIECES[id].own;
}

export function buyPiece(game, id) {
  if (!canBuy(game, id)) return game;
  if (id === 'city') return { ...game, money: game.money - CITY_PRICE, cityBuilt: true, goal: null };
  return { ...game, money: game.money - PIECES[id].own, owned: [...game.owned, id], goal: game.goal === id ? null : game.goal };
}

export const bossMoney = accepted => accepted.reduce((s, o) => s + o.amount, 0);

// Build the design. Boss money pays first; the child's own money covers only
// what is still missing. Returns null when there is not enough.
export function buildPlane(game, design, accepted, ownMoney) {
  const d = tidyDesign(design, game.owned);
  if (JSON.stringify(d) !== JSON.stringify(tidyDesign(design, Object.keys(PIECES)))) return null;
  if (!Number.isInteger(ownMoney) || ownMoney < 0 || ownMoney > game.money) return null;
  if (!accepted.every(o => Number.isInteger(o.amount) && o.amount >= 0)) return null;
  const gap = Math.max(0, buildCost(d) - bossMoney(accepted));
  if (gap > ownMoney) return null;
  const funders = accepted.filter(o => o.amount > 0 && Object.hasOwn(BOSSES, o.bossId)).map(o => o.bossId);
  return { ...game, money: game.money - gap, plane: { design, funders: [...new Set(funders)] }, wish: null };
}

// What the piggy bank is saving for: the child's pick, else the cheapest
// piece not yet owned, else the city.
export function nextGoal(game) {
  if (game.goal === 'city' && !game.cityBuilt) return 'city';
  if (game.goal && Object.hasOwn(PIECES, game.goal) && !game.owned.includes(game.goal)) return game.goal;
  const next = Object.keys(PIECES).filter(id => !game.owned.includes(id)).sort((a, b) => PIECES[a].own - PIECES[b].own)[0];
  return next ?? (game.cityBuilt ? null : 'city');
}

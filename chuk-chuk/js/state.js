// The saved game. Everything stays on this device.

import { PIECES, STARTER, KINDS, BOSSES } from './data.js';
import { tidyDesign } from './plane.js';

const KEY = 'chuk-chuk-v1';
const START_OWNED = KINDS.map(k => STARTER[k]);

export function newGame() {
  return {
    money: 0,
    owned: [...START_OWNED],
    design: { ...STARTER, stickers: [] }, // what is on the workshop table
    plane: null,       // the built plane: { design, funders: [boss ids] }
    wish: null,        // { bossId, pieceId }: what one boss is wishing for
    goal: null,        // what the piggy bank is saving for
    cityBuilt: false,
    flights: 0,
    flightSeq: 0,      // goes up at each take-off...
    lastPaidSeq: -1,   // ...so each flight is paid only once
    muted: false,
  };
}

const whole = (n, low = 0) => (Number.isInteger(n) && n >= low ? n : low);

// Turn whatever was saved into a game that cannot break anything.
export function sanitize(raw) {
  const g = newGame();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return g;
  g.money = Number.isFinite(raw.money) && raw.money > 0 ? Math.floor(raw.money) : 0;
  if (Array.isArray(raw.owned)) {
    for (const id of raw.owned) if (typeof id === 'string' && Object.hasOwn(PIECES, id) && !g.owned.includes(id)) g.owned.push(id);
  }
  g.design = tidyDesign(raw.design, g.owned);
  if (raw.plane && typeof raw.plane === 'object') {
    const funders = Array.isArray(raw.plane.funders) ? [...new Set(raw.plane.funders.filter(b => typeof b === 'string' && Object.hasOwn(BOSSES, b)))] : [];
    g.plane = { design: tidyDesign(raw.plane.design, g.owned), funders };
  }
  const w = raw.wish;
  if (w && typeof w === 'object' && typeof w.bossId === 'string' && Object.hasOwn(BOSSES, w.bossId) && g.owned.includes(w.pieceId) && w.pieceId !== 'none' && w.pieceId !== 'plain') g.wish = { bossId: w.bossId, pieceId: w.pieceId };
  if (raw.goal === 'city' || (typeof raw.goal === 'string' && Object.hasOwn(PIECES, raw.goal))) g.goal = raw.goal;
  g.cityBuilt = raw.cityBuilt === true;
  g.flights = whole(raw.flights);
  g.flightSeq = whole(raw.flightSeq);
  g.lastPaidSeq = Math.min(whole(raw.lastPaidSeq, -1), g.flightSeq); // a flight not yet flown is not yet paid
  g.muted = raw.muted === true;
  return g;
}

export function load(storage, key = KEY) {
  try {
    storage ??= globalThis.localStorage;
    const raw = storage.getItem(key);
    return raw === null ? newGame() : sanitize(JSON.parse(raw));
  } catch {
    return newGame();
  }
}

export function save(game, storage, key = KEY) {
  try {
    storage ??= globalThis.localStorage;
    storage.setItem(key, JSON.stringify(game));
  } catch {
    // Saving is blocked or full. The game still plays.
  }
}

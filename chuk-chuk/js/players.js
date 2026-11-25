// Who is playing? Several children can share one iPad, each with their own
// saved game. A player is only a jellyfish colour and an optional nickname.
// Everything stays on this device.

const LIST_KEY = 'chuk-chuk-players';
const SAVE_KEY = 'chuk-chuk-v1';

export const MAX_PLAYERS = 6;
export const NAME_LENGTH = 10;
export const JELLY_COUNT = 6;

const isId = id => typeof id === 'string' && /^p[1-9]\d{0,3}$/.test(id);

export const slotKey = id => (id === 'p1' ? SAVE_KEY : `${SAVE_KEY}:${id}`);
export const displayName = (player, index) => player.name || `Player ${index + 1}`;

function tidy(p) {
  return {
    id: p.id,
    name: typeof p.name === 'string' ? Array.from(p.name.trim()).slice(0, NAME_LENGTH).join('').trim() : '',
    jelly: Number.isInteger(p.jelly) && p.jelly >= 0 && p.jelly < JELLY_COUNT ? p.jelly : 0,
  };
}

export function loadPlayers(storage) {
  try {
    storage ??= globalThis.localStorage;
    const list = JSON.parse(storage.getItem(LIST_KEY) ?? '[]');
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list
      .filter(p => p && typeof p === 'object' && isId(p.id) && !seen.has(p.id) && seen.add(p.id))
      .slice(0, MAX_PLAYERS).map(tidy);
  } catch {
    return [];
  }
}

export function savePlayers(players, storage) {
  try {
    storage ??= globalThis.localStorage;
    storage.setItem(LIST_KEY, JSON.stringify(players));
  } catch { /* saving is blocked: players are forgotten on reload */ }
}

export function addPlayer(players, { name = '', jelly = 0 } = {}) {
  if (players.length >= MAX_PLAYERS) return players;
  const next = Math.max(0, ...players.map(p => Number(p.id.slice(1)))) + 1;
  return [...players, tidy({ id: `p${next}`, name, jelly })];
}

// Take a player off the list and delete their saved game. A grown-up action.
export function removePlayer(players, id, storage) {
  if (!players.some(p => p.id === id)) return players;
  try {
    storage ??= globalThis.localStorage;
    storage.removeItem(slotKey(id));
  } catch { /* nothing to delete */ }
  return players.filter(p => p.id !== id);
}

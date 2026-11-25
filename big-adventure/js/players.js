// Who is playing? Several children can share one iPad, each with their own
// saved adventure. Everything stays on this device: a player is only a chef
// look, a card colour and an optional name.
//
// This game shares its website (and so its storage) with Food Make. It uses
// key names of its own and never reads or writes a `food-make` key: a Food
// Make save is not turned into a player here.

const LIST_KEY = 'big-adventure-players';
const FIRST_SAVE = 'big-adventure-v1';

export const MAX_PLAYERS = 6;
export const NAME_LENGTH = 10;
export const CARD_COLOURS = ['#FFD3DF', '#CFE9FF', '#D8F5E9', '#FFF3C4', '#E4DBFF', '#FFE0C2'];
// The two chef looks (art.js draws them with chef(holding, look)).
export const PICTURES = ['chef-a', 'chef-b'];

const isId = id => typeof id === 'string' && /^p[1-9]\d{0,3}$/.test(id);

// Where a player's game is saved.
export const slotKey = id => (id === 'p1' ? FIRST_SAVE : `${FIRST_SAVE}:${id}`);

export const displayName = (player, index) => player.name || `Player ${index + 1}`;

function tidy(p) {
  return {
    id: p.id,
    name: typeof p.name === 'string' ? p.name.trim().slice(0, NAME_LENGTH).trim() : '',
    pic: PICTURES.includes(p.pic) ? p.pic : PICTURES[0],
    colour: Number.isInteger(p.colour) && p.colour >= 0 && p.colour < CARD_COLOURS.length ? p.colour : 0,
  };
}

// The saved players. Nobody yet means an empty list.
export function loadPlayers(storage) {
  try {
    storage ??= globalThis.localStorage;
    const list = JSON.parse(storage.getItem(LIST_KEY));
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
  } catch {
    // Saving is blocked. The game still plays; the players are forgotten on reload.
  }
}

// A new player gets the next number after the highest one in use.
export function addPlayer(players, { name = '', pic, colour = 0 } = {}) {
  if (players.length >= MAX_PLAYERS) return players;
  const next = Math.max(0, ...players.map(p => Number(p.id.slice(1)))) + 1;
  return [...players, tidy({ id: `p${next}`, name, pic, colour })];
}

// Take a player off the list and delete their saved game. A grown-up action.
export function removePlayer(players, id, storage) {
  if (!players.some(p => p.id === id)) return players;
  try {
    storage ??= globalThis.localStorage;
    storage.removeItem(slotKey(id));
  } catch { /* nothing to delete, or deleting is blocked */ }
  return players.filter(p => p.id !== id);
}

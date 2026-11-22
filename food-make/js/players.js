// Who is playing? Several children can share one iPad, each with their own
// saved game. Everything stays on this device: a player is only a picture, a
// card colour and an optional nickname.

import { MONSTERS } from './data.js';

const LIST_KEY = 'food-make-players';
const FIRST_SAVE = 'food-make-v1'; // the first player keeps the save from before players existed

export const MAX_PLAYERS = 6;
export const NAME_LENGTH = 10;
export const CARD_COLOURS = ['#FFD3DF', '#CFE9FF', '#D8F5E9', '#FFF3C4', '#E4DBFF', '#FFE0C2'];
export const PICTURES = Object.keys(MONSTERS);

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

// The saved players. A game saved before players existed becomes the first
// player, with its save left exactly where it is.
export function loadPlayers(storage) {
  try {
    storage ??= globalThis.localStorage;
    const raw = storage.getItem(LIST_KEY);
    if (raw === null) return storage.getItem(FIRST_SAVE) === null ? [] : [tidy({ id: 'p1' })];
    const list = JSON.parse(raw);
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

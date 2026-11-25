// The flight, as numbers only: where the plane, stars and clouds are.
// The plane flies to the right by itself and follows the finger up and down.
// Nothing can go wrong: no crashing, and the flight ends by distance.

import { STARS_PER_FLIGHT } from './data.js';

export const PLANE_X = 300;   // where the plane sits on the 1024-wide screen
export const SPEED = 260;     // stage pixels a second
export const LENGTH = 7800;   // how far a flight is (about 30 seconds)
const TOP = 90, BOTTOM = 678; // how high and low the plane can go
const MAX_STEP = 50;          // a long pause between frames counts as this many ms
const REACH_X = 80, REACH_Y = 66;
const DRAGON_X = 110, DRAGON_Y = 95; // the baby dragon is easy to pick up

export const WEATHERS = ['clear', 'rain', 'windy', 'rainbow', 'snow'];

// A small random-number maker, so the same seed gives the same flight.
function seeded(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function newFlight(seed = 1, sky = 'day') {
  const r = seeded(seed);
  const gap = (LENGTH - 1500) / STARS_PER_FLIGHT;
  const stars = Array.from({ length: STARS_PER_FLIGHT }, (_, i) => ({
    x: Math.round(900 + i * gap + (r() - 0.5) * gap * 0.4),
    y: Math.round(110 + r() * 548),
    got: false,
  }));
  const clouds = Array.from({ length: 7 }, (_, i) => ({ x: Math.round(700 + i * 1050 + r() * 500), y: Math.round(80 + r() * 600), s: +(0.55 + r() * 0.4).toFixed(2) }));
  // Weather is only for looks, except that a rainbow brings a little luck.
  // Glitter snow falls only at night.
  const roll = r();
  const weather = roll < 0.4 ? 'clear' : roll < 0.6 ? 'rain' : roll < 0.75 ? 'windy' : roll < 0.9 ? 'rainbow' : sky === 'night' ? 'snow' : 'clear';
  // On about half the flights a lost baby dragon is waiting for a ride.
  const lost = r() < 0.5;
  const dragon = { x: Math.round(3000 + r() * 2500), y: Math.round(150 + r() * 460), got: false };
  return { t: 0, dist: 0, y: 384, caught: 0, stars, clouds, weather, dragon: lost ? dragon : null, done: false };
}

export function step(flight, dtMs, targetY) {
  if (flight.done) return flight;
  const dt = Math.max(0, Math.min(MAX_STEP, dtMs));
  const want = Math.max(TOP, Math.min(BOTTOM, Number.isFinite(targetY) ? targetY : flight.y));
  const y = flight.y + (want - flight.y) * Math.min(1, dt * 0.009);
  const dist = Math.min(LENGTH, flight.dist + SPEED * dt / 1000);
  let caught = flight.caught;
  let stars = flight.stars;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    if (!s.got && Math.abs(s.x - dist - PLANE_X) < REACH_X && Math.abs(s.y - y) < REACH_Y) {
      if (stars === flight.stars) stars = stars.slice();
      stars[i] = { ...s, got: true };
      caught++;
    }
  }
  let dragon = flight.dragon;
  if (dragon && !dragon.got && Math.abs(dragon.x - dist - PLANE_X) < DRAGON_X && Math.abs(dragon.y - y) < DRAGON_Y) dragon = { ...dragon, got: true };
  return { ...flight, t: flight.t + dt, dist, y, caught, stars, dragon, done: dist >= LENGTH };
}

export const progress = flight => Math.min(1, flight.dist / LENGTH);

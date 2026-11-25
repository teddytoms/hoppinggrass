// Starts the game, keeps track of who is playing, and switches screens.

import './compat.js';
import { load, save, newGame } from './state.js';
import { slotKey } from './players.js';
import { defs, icon } from './art.js';
import { unlock, tune, setMuted, sfx } from './audio.js';
import * as who from './screens/who.js';
import * as hangar from './screens/hangar.js';
import * as workshop from './screens/workshop.js';
import * as bosses from './screens/bosses.js';
import * as build from './screens/build.js';
import * as map from './screens/map.js';
import * as flight from './screens/flight.js';
import * as earnings from './screens/earnings.js';
import * as shop from './screens/shop.js';
import * as finale from './screens/finale.js';

const screens = { who, hangar, workshop, bosses, build, map, flight, earnings, shop, finale };
const TUNES = { flight: 'flight', finale: 'finale' };
const stage = document.getElementById('stage');
const fit = document.getElementById('fit');

// Only `game` is saved. The rest is where the player is right now.
const ctx = {
  player: null,     // { id, name, jelly }
  game: newGame(),  // a stand-in until a player is picked; never saved
  scale: 1,         // how much the stage is shrunk or grown to fit the screen
  accepted: [],     // the offers the child said yes to: [{ bossId, amount }]
  place: null,      // where the flight is going
  result: null,     // { placeId, stars } of the flight that just landed
};

// Each player's game is also kept here, so nothing is lost while the game
// is open even if the iPad will not let the page save.
const games = new Map();
ctx.players = null;                 // the player list, once it has been read
ctx.forget = id => games.delete(id); // a removed player's game goes too

// Every change to the game goes through here, so it is always saved.
function update(game) {
  ctx.game = game;
  if (!ctx.player) return;
  games.set(ctx.player.id, game);
  save(game, undefined, slotKey(ctx.player.id));
}

// The speaker button sits on the stage itself, so it stays put whatever a
// screen redraws.
const mute = document.createElement('button');
mute.className = 'btn mute';
function drawMute() {
  mute.innerHTML = `<span class="pic">${icon(ctx.game.muted ? 'sound-off' : 'sound-on')}</span>`;
  mute.setAttribute('aria-label', ctx.game.muted ? 'Turn sound on' : 'Turn sound off');
}
mute.addEventListener('click', () => {
  update({ ...ctx.game, muted: !ctx.game.muted });
  setMuted(ctx.game.muted);
  sfx('tap');
  drawMute();
});

let lastScreenChange = 0;
let leave = null; // what the screen on show wants done when it goes away

function go(name) {
  lastScreenChange = performance.now();
  leave?.();
  const key = Object.hasOwn(screens, name) ? name : 'hangar';
  if (key === 'who') ctx.player = null; // nobody is playing until a card is picked
  // Each screen gets a brand new box to draw in, so nothing is left behind.
  const root = document.createElement('div');
  root.className = 'screen';
  stage.querySelector('.screen')?.remove();
  stage.prepend(root);
  if (!mute.isConnected) stage.append(mute);
  stage.dataset.screen = key;
  try {
    leave = screens[key].render(root, ctx, go, update) ?? null;
  } catch (err) {
    // A screen that cannot draw must never leave a child looking at nothing.
    console.error(err);
    leave = null;
    if (key !== 'hangar' && key !== 'who') return go(ctx.player ? 'hangar' : 'who');
  }
  drawMute();
  tune(TUNES[key] ?? 'hangar');
}

// Fit the 1024 x 768 stage inside the window, whatever its shape.
function resize() {
  ctx.scale = Math.min(fit.clientWidth / 1024, fit.clientHeight / 768) || 1;
  stage.style.transform = `scale(${ctx.scale})`;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
if (globalThis.ResizeObserver) new ResizeObserver(resize).observe(fit);

// A double tap on a button that changes the screen must not also press
// whatever appears under the finger on the next screen.
stage.addEventListener('click', e => {
  if (performance.now() - lastScreenChange < 350) { e.stopPropagation(); e.preventDefault(); }
}, { capture: true });

for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
  window.addEventListener(type, () => unlock(), { capture: true, passive: true });
}
for (const type of ['contextmenu', 'gesturestart', 'dragstart']) {
  document.addEventListener(type, e => e.preventDefault());
}

// A player's card was tapped on "Who is playing?": open their own saved game.
ctx.choose = player => {
  ctx.player = player;
  ctx.game = games.get(player.id) ?? load(undefined, slotKey(player.id));
  ctx.accepted = [];
  ctx.place = null;
  ctx.result = null;
  setMuted(ctx.game.muted);
  go('hangar');
};

document.body.insertAdjacentHTML('afterbegin', defs());
// Paper grain over every screen, like the approved picture.
stage.insertAdjacentHTML('beforeend', '<svg class="grain" aria-hidden="true"><rect width="100%" height="100%" filter="url(#cc-grain)" opacity="0.5"/></svg>');
resize();
go('who');

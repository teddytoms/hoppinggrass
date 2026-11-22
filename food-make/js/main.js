// Starts the game, remembers where the player is in a round, and switches screens.

import { START_PRICE } from './data.js';
import { load, save, dayOver, newGame } from './state.js';
import { slotKey } from './players.js';
import * as who from './screens/who.js';
import { collect } from './stickers.js';
import { sfx } from './audio.js';
import { item } from './art.js';
import { unlock, tune, setMuted } from './audio.js';
import { tooSoon } from './gesture.js';
import * as restaurant from './screens/restaurant.js';
import * as garden from './screens/garden.js';
import * as kitchen from './screens/kitchen.js';
import * as price from './screens/price.js';
import * as shop from './screens/shop.js';
import * as dayend from './screens/dayend.js';
import * as book from './screens/book.js';

const screens = { restaurant, garden, kitchen, price, shop, dayend, book, who };
const stage = document.getElementById('stage');
const fit = document.getElementById('fit');

// Everything about the round being played. Only `game` is saved; a reload
// keeps the money and recipes and starts again with a fresh order.
const ctx = {
  player: null,       // who is playing: { id, name, pic, colour }. Nobody until a card is picked.
  game: newGame(),    // a stand-in until a player is picked; it is never saved
  order: null,        // { monsterId, foodId }
  basket: {},         // ingredient id -> how many were picked
  hasSparkle: false,
  remake: false,      // true after a "yuck": make the same food again
  price: START_PRICE,
  scale: 1,           // how much the stage is shrunk or grown to fit the screen
  other: null,        // the monster at the second table
  back: 'restaurant', // where "Back" in the shop and sticker book returns to
};

// Pop-ups for new stickers live outside the screens, so they stay up while
// the screen changes. They never block a tap.
const toasts = document.createElement('div');
toasts.className = 'toasts';
toasts.setAttribute('aria-live', 'polite');

function showSticker(id) {
  const t = document.createElement('div');
  t.className = 'toast card';
  t.innerHTML = `<span class="pic">${book.stickerPic(id)}</span><div><b class="baloo">New sticker!</b><span>${book.stickerName(id)}</span></div>`;
  toasts.append(t);
  setTimeout(() => t.remove(), 4200);
}

// Every change to the game goes through here: it is saved, and any sticker
// the player has just earned is handed over.
function update(game) {
  if (!ctx.player) { ctx.game = game; return; } // nobody is playing yet: nothing to save
  const { game: checked, fresh } = collect(game);
  ctx.game = checked;
  save(checked, undefined, slotKey(ctx.player.id));
  if (fresh.length) {
    fresh.forEach(showSticker);
    sfx('sticker');
  }
}

function addMuteButton(root) {
  const b = document.createElement('button');
  b.className = 'btn mute';
  const draw = () => {
    b.innerHTML = `<span class="pic">${item(ctx.game.muted ? 'sound-off' : 'sound-on')}</span>`;
    b.setAttribute('aria-label', ctx.game.muted ? 'Turn sound on' : 'Turn sound off');
  };
  b.addEventListener('click', () => {
    update({ ...ctx.game, muted: !ctx.game.muted });
    setMuted(ctx.game.muted);
    draw();
  });
  draw();
  root.append(b);
}

let lastScreenChange = 0;

function go(name) {
  lastScreenChange = performance.now();
  const screen = screens[name] ?? screens.restaurant;
  // Each screen gets a brand new box to draw in, so nothing from the last
  // screen (pictures or tap handlers) is left behind.
  const root = document.createElement('div');
  root.className = 'screen';
  // Swap only the screen: the sticker pop-ups stay where they are, so they do not start again.
  stage.querySelector('.screen')?.remove();
  stage.prepend(root);
  if (!toasts.isConnected) stage.append(toasts);
  stage.dataset.screen = name;
  screen.render(root, ctx, go, update);
  addMuteButton(root);
  tune(name === 'garden' ? 'garden' : 'cafe');
}

// Fit the 1024 x 768 stage inside the window, whatever its shape.
function resize() {
  ctx.scale = Math.min(fit.clientWidth / 1024, fit.clientHeight / 768) || 1;
  stage.style.transform = `scale(${ctx.scale})`;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);
// Watching the box itself catches rotations that report their new size late.
if (globalThis.ResizeObserver) new ResizeObserver(resize).observe(fit);

// A double tap on a button that changes the screen must not also press
// whatever appears under the finger on the next screen.
stage.addEventListener('click', e => {
  if (tooSoon(performance.now(), lastScreenChange)) { e.stopPropagation(); e.preventDefault(); }
}, { capture: true });

// The iPad only lets a page make sound after the player touches it.
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
  window.addEventListener(type, () => unlock(), { capture: true, passive: true });
}
// No pinch zoom, long-press menu or dragging pictures out of the game.
for (const type of ['contextmenu', 'gesturestart', 'dragstart']) {
  document.addEventListener(type, e => e.preventDefault());
}

// A player's card was tapped on "Who is playing?": open their own saved game.
ctx.choose = player => {
  ctx.player = player;
  ctx.game = load(undefined, slotKey(player.id));
  ctx.order = null;
  ctx.back = 'restaurant';
  toasts.replaceChildren();
  setMuted(ctx.game.muted);
  // A game closed on the end-of-day page opens there again, not on a sixth monster.
  go(dayOver(ctx.game) ? 'dayend' : 'restaurant');
  // A game saved before the sticker book existed gets the stickers it has already earned.
  update(ctx.game);
};

resize();
go('who');

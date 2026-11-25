// Starts the game, remembers where the player is in a round, and switches screens.

import { START_PRICE, RUSH_SECONDS, LAMP_SLOW, LAST_CHAPTER } from './data.js';
import { load, save, dayOver, newGame } from './state.js';
import { chapterOf, hasUpgrade } from './chapters.js';
import { slotKey } from './players.js';
import { COMICS } from './comics.js';
import * as who from './screens/who.js';
import { item } from './art.js';
import { unlock, tune, setMuted } from './audio.js';
import { tooSoon } from './gesture.js';
import * as comic from './screens/comic.js';
import * as mycomic from './screens/mycomic.js';
import * as place from './screens/place.js';
import * as friends from './screens/friends.js';
import * as moonname from './screens/moonname.js';
import * as garden from './screens/garden.js';
import * as kitchen from './screens/kitchen.js';
import * as price from './screens/price.js';
import * as shop from './screens/shop.js';
import * as dayend from './screens/dayend.js';

const screens = { who, comic, mycomic, place, friends, moonname, garden, kitchen, price, shop, dayend };
const stage = document.getElementById('stage');
const fit = document.getElementById('fit');

// Everything about the round being played. Only `game` is saved; a reload
// keeps the money, plates and recipes, and the same customer sits waiting.
const ctx = {
  player: null,       // who is playing: { id, name, pic, colour }. Nobody until a card is picked.
  game: newGame(),    // a stand-in until a player is picked; it is never saved
  order: null,        // { monsterId, foodId, surprise }, the order being made
  basket: {},         // ingredient id -> how many were picked
  hasSparkle: false,
  remake: false,      // true after a "yuck": make the same food again
  price: START_PRICE,
  golden: false,      // the golden ingredient was picked (garden.js)
  scale: 1,           // how much the stage is shrunk or grown to fit the screen
  back: 'place',      // where "Back" in the shop and My comic returns to
  comic: null,        // the comic being read: { id, then }
};

/* ---------- The lunch-rush sun ----------
   A small smiling sun slides across the top over RUSH_SECONDS (LAMP_SLOW times
   as long with the star lamp), then sets quietly. No numbers, no alarm, nothing bad. It lives outside the screens so it
   keeps going while the screen changes, and it never blocks a tap. */

const sun = document.createElement('div');
sun.className = 'rush-sun';
sun.setAttribute('aria-hidden', 'true');
// A little smiling sun, drawn in the same thick-outline style as js/art.js.
const SUN = `<svg viewBox="0 0 64 64"><g stroke="#1B1B1F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 3v8M32 53v8M3 32h8M53 32h8M11 11l6 6M47 47l6 6M53 11l-6 6M17 47l-6 6" fill="none"/><circle cx="32" cy="32" r="16" fill="#FFC93C"/><circle cx="26" cy="29" r="2" fill="#1B1B1F" stroke-width="1"/><circle cx="38" cy="29" r="2" fill="#1B1B1F" stroke-width="1"/><path d="M25 36Q32 44 39 36" fill="none"/></g></svg>`;
sun.innerHTML = `<span class="rush-sun-body pic">${SUN}</span>`;
let rush = { seq: null, over: false, timer: null };

function stopRush() {
  clearTimeout(rush.timer);
  rush = { seq: null, over: false, timer: null };
  sun.classList.remove('is-on', 'is-set');
}

// A lunch-rush order has sat down: the sun starts again. Calling it again for
// the same order (coming back from the shop, say) does not restart the clock.
ctx.startRush = () => {
  if (ctx.order?.surprise?.kind !== 'rush') return;
  const seq = `${ctx.player?.id ?? ''}:${ctx.game.orderSeq}`;
  if (rush.seq === seq) return;
  stopRush();
  rush.seq = seq;
  sun.classList.remove('is-on', 'is-set');
  void sun.offsetWidth; // so the slide starts from the beginning
  const seconds = RUSH_SECONDS * (hasUpgrade(ctx.game, 'lamp') ? LAMP_SLOW : 1);
  sun.style.setProperty('--rush-time', `${seconds}s`);
  sun.classList.add('is-on');
  rush.timer = setTimeout(() => { rush.over = true; sun.classList.add('is-set'); }, seconds * 1000);
};
ctx.stopRush = stopRush;
// True until the sun has set. (Only meaningful for a rush order.)
ctx.rushInTime = () => !rush.over;

// The sun only shows while the order being made is a rush order.
function syncSun() {
  if (ctx.order?.surprise?.kind !== 'rush' || stage.dataset.screen === 'who') stopRush();
}

ctx.chefName = () => ctx.player?.name ?? '';
ctx.chefLook = () => ctx.player?.pic ?? 'chef-a';
// What a comic needs to fill in its words and draw the right chef.
ctx.vars = () => ({ name: ctx.chefName(), look: ctx.chefLook(), moon: ctx.game.moonName });

// The moon monster is named on arriving in the last chapter: asked once per
// visit to the game (per player), and never again once it has a name.
const moonAsked = new Set();
ctx.moonAsked = () => moonAsked.add(ctx.player?.id ?? '');
const needsMoonName = () => !!ctx.player && chapterOf(ctx.game).id === LAST_CHAPTER
  && !ctx.game.moonName && !moonAsked.has(ctx.player.id);

// Every change to the game goes through here: it is saved, and ctx.game is the new game.
function update(game) {
  ctx.game = game;
  if (!ctx.player) return; // nobody is playing yet: nothing to save
  save(game, undefined, slotKey(ctx.player.id));
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
  // On the way to the moon diner for the first time: "What is my name?" comes first.
  if (name === 'place' && needsMoonName()) name = 'moonname';
  if (!Object.hasOwn(screens, name)) name = 'place';
  const screen = screens[name];
  // Each screen gets a brand new box to draw in, so nothing from the last
  // screen (pictures or tap handlers) is left behind.
  const root = document.createElement('div');
  root.className = 'screen';
  // Swap only the screen: the rush sun stays where it is, so it does not start again.
  stage.querySelector('.screen')?.remove();
  stage.prepend(root);
  if (!sun.isConnected) stage.append(sun);
  stage.dataset.screen = name;
  // On "Who is playing?" nobody is playing: nothing may be saved under the last player's name.
  if (name === 'who') { ctx.player = null; ctx.order = null; }
  screen.render(root, ctx, go, update);
  addMuteButton(root);
  syncSun();
  tune(name === 'garden' ? 'garden' : 'cafe');
}

// Show comic `id` on the comic screen, then call `then`.
ctx.playComic = (id, then) => {
  ctx.comic = { id, then };
  go('comic');
};

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
// The comics not yet read play first (the cover, then this chapter's opening),
// then the place, or the end-of-day page for a game closed on it.
ctx.choose = player => {
  ctx.player = player;
  ctx.game = load(undefined, slotKey(player.id));
  ctx.order = null;
  ctx.back = 'place';
  ctx.comic = null;
  stopRush();
  setMuted(ctx.game.muted);
  const queue = ['cover', `ch${chapterOf(ctx.game).id}-open`]
    .filter(id => COMICS[id] && !ctx.game.comicsSeen.includes(id));
  const next = () => {
    const id = queue.shift();
    if (id) ctx.playComic(id, next);
    else go(dayOver(ctx.game) ? 'dayend' : 'place');
  };
  next();
};

resize();
go('who');

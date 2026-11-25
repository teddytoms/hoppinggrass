// The place: where the chef is cooking right now (the food cart, the cafe, the dining car,
// the boat, the moon diner). A customer sits down, says hello and orders; one big glowing
// button says "Make". Here too: the customer's name and hearts, Victoria and what she says,
// the keepsake shelf, a thank-you gift when hearts are full, the "SUDDENLY!" panel before a
// surprise, the travel button when a chapter's plates are done, the ending (the last comic,
// then the Golden Spoon card) and after it the Map.
// Styles are in css/adventure.css.

import { FOODS, UPGRADES, DAYS, DAY_LENGTH, START_PRICE, RUSH_LENGTH, CHAPTERS, PLATES_TO_WIN } from '../data.js';
import { pickOrder } from '../orders.js';
import { startOrder, orderWaiting, skipRush, setVisit } from '../state.js';
import { chapterOf, canTravel, wonBet, placeOf, monsterName, monstersHere, foodsForSale, upgradesForSale, travel } from '../chapters.js';
import { FRIENDS, GIFT_COINS, giftDue, giveGift, greeting, victoriaSays, fill } from '../friends.js';
import { COMICS } from '../comics.js';
import { scene, SPOTS, monster, chef, critic, mystery, waiter, food, item, vehicle, upgrade, sfx as sfxWord } from '../art.js';
import { sfx } from '../audio.js';
import { rainBonus } from '../economy.js';
import { plateCounter, coinBox, heartsRow } from './hud.js';
import { teaching, coach } from './coach.js';

// Some monsters are drawn smaller: Fife is tiny.
const MONSTER_SIZE = { fife: 0.72 };
const CUSTOMER = { w: 236, h: 300 };
const CHEF = { w: 220, h: 330 };

const TRAVEL_WORDS = { balloon: 'Up, up and away!', train: 'All aboard!', boat: 'Set sail!', rocket: 'Blast off!', home: 'Home we go!' };
const VEHICLE_PIC = { balloon: 'balloon', train: 'train', boat: 'boat', rocket: 'rocket', home: 'rocket' };
const TRAVEL_SOUND = { boat: 'splash', rocket: 'rocket' };
// Short names for the Map.
const MAP_NAME = { cart: 'The park', cafe: 'Italy', train: 'India', boat: 'The sea', moon: 'The moon' };
const NUMBER_WORD = { 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five' };

// The surprise panels: [picture, one short line].
const SUDDEN = {
  rush: o => [item('sun'), 'Lunch rush! Serve before the sun sets for golden plates!'],
  mystery: () => [mystery('peek'), 'A mystery guest!'],
  big: o => [food(o.foodId), 'A big order!'],
  golden: () => [item('star'), 'A golden treat is waiting on the farm!'],
  critic: () => [critic('idle'), 'The food critic is here!'],
};

// What is remembered between visits to this screen (not saved: a reload simply shows things again).
let announced = '';   // the order whose "SUDDENLY!" panel has been shown
let lastSaid = null;   // what Victoria said last, so she does not say it twice running

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const many = name => (/(i|salmon)$/i.test(name) ? name : `${name}s`);
const playIf = (ctx, id, then) => (COMICS[id] ? ctx.playComic(id, then) : then());

function words(order) {
  const f = FOODS[order.foodId];
  switch (order.surprise?.kind) {
    case 'mystery': return `${cap(f.riddle)}, please!`;
    case 'big': return `${NUMBER_WORD[order.surprise.count] ?? 'Three'} ${many(f.name.toLowerCase())} for a party!`;
    case 'critic': return `${f.name}, if you please.`;
    default: return `${f.name}, please!`;
  }
}

function customerArt(order) {
  const kind = order.surprise?.kind;
  if (kind === 'critic') return critic('idle');
  if (kind === 'mystery') return mystery('idle');
  return monster(order.monsterId, 'idle', 1);
}

// The customer's bubble: its name and hearts on a tag, its hello, then the order.
// A guest in disguise (the mystery guest, the critic) has no tag and no hello.
function bubble(order, game, chefName) {
  const kind = order.surprise?.kind;
  const disguised = kind === 'mystery' || kind === 'critic';
  const pic = kind === 'mystery' ? '' : `<span class="pic pl-food">${food(order.foodId)}</span>`;
  const badge = kind === 'big' ? `<span class="pl-x3">x${order.surprise.count ?? 3}</span>` : '';
  const hello = disguised ? '' : greeting(game, order.monsterId, chefName);
  const tag = disguised ? '' : `<div class="pl-tag"><b>${esc(monsterName(order.monsterId, game))}</b>${heartsRow(game, order.monsterId)}</div>`;
  return `<div class="cm-bubble pl-bubble${kind === 'mystery' ? ' is-riddle' : ''}">${tag}${badge}
${hello ? `<p class="pl-hello">${esc(hello)}</p>` : ''}
<div class="pl-order">${pic}<span class="pl-words">${words(order)}</span></div></div>`;
}

function weatherSign(game) {
  const day = DAYS[game.day.kind];
  const foods = day.foods.filter(f => game.owned.includes(f));
  const rain = rainBonus(game);
  if (!foods.length && rain) return `<div class="pl-sign"><span class="pic">${item(day.pic)}</span><span>${day.name}! Umbrella: $${rain} more on every sale</span><span class="pic">${upgrade('umbrella')}</span></div>`;
  if (!foods.length) return '';
  return `<div class="pl-sign"><span class="pic">${item(day.pic)}</span><span>${day.name}! More coins for</span>${foods.map(f => `<span class="pic">${food(f)}</span>`).join('')}</div>`;
}

// Can the player buy something in the shop right now? Then the Shop button glows.
function canAfford(game) {
  return foodsForSale(game).some(f => game.money >= FOODS[f].recipePrice)
    || upgradesForSale(game).some(u => game.money >= UPGRADES[u].price);
}

function sudden(order) {
  const kind = order.surprise.kind;
  const [pic, line] = SUDDEN[kind](order);
  const badge = kind === 'big' ? `<span class="pl-x3 is-big">x${order.surprise.count ?? 3}</span>` : '';
  const skip = kind === 'rush' ? '<button class="btn white" data-notoday>Not today</button>' : '';
  return `<div class="pl-over pl-sudden" data-sudden><div class="pl-sudden-panel cm-panel">
<span class="pic pl-sudden-word">${sfxWord('SUDDENLY!', '#FFE066')}</span>
<span class="pic pl-sudden-pic">${pic}${badge}</span>
<p class="pl-sudden-line">${line}</p>
<div class="pl-sudden-buttons"><button class="btn pink hint" data-ok>${kind === 'rush' ? "Let's go!" : 'OK!'}</button>${skip}</div></div></div>`;
}

// A thank-you gift from a monster whose three hearts are full.
function giftPanel(id, game, chefName) {
  const f = FRIENDS[id];
  const name = esc(monsterName(id, game));
  return `<div class="pl-over pl-gift" data-gift="${id}"><div class="pl-gift-panel cm-panel">
<span class="pic pl-gift-who">${monster(id, 'love')}</span>
<div class="pl-gift-text">
<div class="cm-bubble pl-gift-say">${esc(fill('Thank you, Chef {name}!', chefName).replace('Chef !', 'Chef!'))}</div>
<div class="pl-gift-row"><span class="pic pl-gift-pic">${item(f.keepsake.id)}</span><span class="pl-gift-name">${esc(f.keepsake.name)} for your shelf!</span><span class="pl-gift-coins"><span class="pic">${item('coin')}</span>+$${GIFT_COINS}</span></div>
<div class="pl-fact"><b>${name}'s secret</b><span>${esc(f.fact.replace(/^This shy friend/, monsterName(id, game)))}</span></div>
<button class="btn pink hint pl-gift-ok" data-thanks>Thank you!</button></div>
<div class="pl-gift-hearts">${heartsRow(game, id)}</div></div></div>`;
}

// The bet is won: the Golden Spoon.
const spoon = (game, look) => `<div class="pl-over pl-tbc" data-spoon><div class="pl-tbc-panel cm-panel">
<h1 class="pl-tbc-title">You won the bet!</h1>
<div class="pl-spoon-row"><span class="pic pl-spoon-chef">${chef('spoon', look, 'cheer')}</span><span class="pic pl-spoon-pic">${item('golden-spoon')}</span><span class="pic pl-spoon-chef">${waiter()}</span></div>
<p class="pl-tbc-big">${Math.max(PLATES_TO_WIN, game.plates)} happy plates!</p>
<button class="btn pink hint" data-keep>Keep cooking</button></div></div>`;

// The Map: five places to cook in, once the bet is won.
function mapPanel(game) {
  const here = placeOf(game);
  return `<div class="pl-over pl-map" data-map><div class="pl-map-panel cm-panel">
<h2 class="pl-map-title">Where shall we cook?</h2>
<div class="pl-map-row">${CHAPTERS.map(c => `<button class="pl-map-card${c.place === here ? ' is-here' : ''}" data-visit="${c.id}"><span class="pic">${scene(c.place)}</span><span>${MAP_NAME[c.place] ?? c.title}</span></button>`).join('')}</div>
<button class="btn white" data-mapback>Back</button></div></div>`;
}

export function render(stage, ctx, go, update) {
  ctx.back = 'place';

  // A monster sits down. After a reload the order that was waiting is back, the same one.
  let isNew = false;
  if (!ctx.order) {
    let order = orderWaiting(ctx.game);
    if (!order) {
      update(startOrder(ctx.game, pickOrder(ctx.game)));
      order = orderWaiting(ctx.game);
      if (!order) {
        // pickOrder gave something the rules refused: fall back to the plainest order.
        update(startOrder(ctx.game, { monsterId: monstersHere(ctx.game)[0] ?? 'ella', foodId: 'orange-juice', surprise: null }));
        order = orderWaiting(ctx.game);
      }
    }
    ctx.order = order;
    ctx.basket = {};
    ctx.hasSparkle = false;
    ctx.remake = false;
    ctx.price = START_PRICE;
    ctx.golden = false;
    isNew = true;
  }

  const game = ctx.game;
  const order = ctx.order;
  const kind = order.surprise?.kind ?? null;
  const here = chapterOf(game);
  // After the bet is won the Map may have picked another place to cook in.
  const spot = CHAPTERS.find(c => c.place === placeOf(game)) ?? here;
  const learning = teaching(ctx);
  const chefName = ctx.chefName();
  const key = `${ctx.player?.id ?? ''}:${game.orderSeq}`;

  const disguised = kind === 'mystery' || kind === 'critic';
  const k = disguised ? 1 : MONSTER_SIZE[order.monsterId] ?? 1;
  const cw = CUSTOMER.w * k, ch = CUSTOMER.h * k;
  const box = (art, spot, w, h, cls) =>
    `<span class="pic ${cls}" style="left:${spot.x - w / 2}px;top:${spot.y - h}px;width:${w}px;height:${h}px">${art}</span>`;

  const travelling = canTravel(game);
  const going = travelling ? here.travel : null;
  const won = wonBet(game);
  const finish = won && !game.comicsSeen.includes('ending');
  const map = won && !finish;
  const said = learning ? { kind: 'tip', text: 'A customer! Tap Make!' } : victoriaSays(game, order, Math.random, lastSaid);
  lastSaid = said.text;
  const shelf = (Array.isArray(game.gifts) ? game.gifts : []).filter(m => FRIENDS[m]);
  const dots = Array.from({ length: DAY_LENGTH }, (_, i) => `<i class="${i < game.day.served ? 'full' : ''}"></i>`).join('');
  const caption = kind === 'rush' ? `Lunch rush at ${spot.where}...` : `Meanwhile, at ${spot.where}...`;

  stage.innerHTML = `<div class="pl-wrap is-${placeOf(game)}">
<span class="pic pl-scene">${scene(spot.place)}</span>
<button class="pl-victoria" data-victoria aria-label="Victoria. Tap her to hear more."><span class="pic">${waiter()}</span></button>
<div class="cm-bubble pl-says is-${said.kind}" aria-live="polite">${esc(said.text)}</div>
<div class="pl-customer${isNew ? ' is-new' : ''}">${box(customerArt(order), SPOTS.customer, cw, ch, 'pl-guest')}</div>
${box(chef('spoon', ctx.chefLook()), SPOTS.chef, CHEF.w, CHEF.h, 'pl-chef')}
<div class="cm-caption ad-caption pl-caption">${caption}</div>
${weatherSign(game)}
<div class="pl-hud">${coinBox(game)}${plateCounter(game)}</div>
${shelf.length ? `<div class="pl-shelf" aria-label="Presents from friends">${shelf.map(m => `<span class="pic">${item(FRIENDS[m].keepsake.id)}</span>`).join('')}</div>` : ''}
<div class="pl-side">
${learning ? '' : `<button class="btn pl-shop${canAfford(game) ? ' hint' : ''}" data-shop>Shop</button>
<button class="btn mint pl-friends" data-friends><span class="pic">${item('heart')}</span>Friends</button>
<button class="btn white pl-comic" data-comic>My comic</button>
${map ? '<button class="btn white pl-mapbtn" data-openmap>Map</button>' : ''}`}
<button class="pl-who" data-who aria-label="Change who is playing"><span class="pic">${chef('spoon', ctx.chefLook())}</span></button></div>
<div class="pl-bubble-box${isNew ? ' is-new' : ''}">${bubble(order, game, chefName)}</div>
${going ? `<button class="btn mint pl-travel hint" data-travel><span class="pic">${vehicle(VEHICLE_PIC[going] ?? 'balloon')}</span>${TRAVEL_WORDS[going] ?? "Let's go!"}</button>` : ''}
${finish ? `<button class="btn mint pl-travel hint" data-finish><span class="pic">${vehicle('rocket')}</span>${TRAVEL_WORDS.home}</button>` : ''}
<button class="btn pink pl-make hint" data-make>Make</button>
<div class="pl-dots cm-panel" aria-label="Day ${game.day.n}: ${game.day.served} of ${DAY_LENGTH} monsters served"><span>Day ${game.day.n}</span>${dots}</div>
</div>`;

  const bubbleBox = stage.querySelector('.pl-bubble-box');
  const guest = stage.querySelector('.pl-customer');

  // ---- what pops up, one thing at a time: the Golden Spoon, a gift, a surprise ----
  // The surprise panel shows once per order; a rush only announces itself on its first order.
  const wantsPanel = kind && !(kind === 'rush' && order.surprise.left !== RUSH_LENGTH);
  const busy = () => !!stage.querySelector('[data-sudden], [data-spoon], [data-gift]');
  function showSpoon() {
    // Shown once, after the last comic. It is remembered in the save, so a reload cannot lose it.
    if (!wonBet(ctx.game) || !ctx.game.comicsSeen.includes('ending') || ctx.game.spoon === true || busy()) return false;
    stage.insertAdjacentHTML('beforeend', spoon(ctx.game, ctx.chefLook()));
    sfx('spoon');
    return true;
  }
  function showGift() {
    if (learning || busy()) return false;
    const id = monstersHere(ctx.game).find(m => FRIENDS[m] && giftDue(ctx.game, m));
    if (!id) return false;
    stage.insertAdjacentHTML('beforeend', giftPanel(id, ctx.game, chefName));
    sfx('gift');
    return true;
  }
  function showSudden() {
    if (!wantsPanel || announced === key || busy()) return false;
    announced = key;
    stage.insertAdjacentHTML('beforeend', sudden(order));
    sfx('suddenly');
    return true;
  }
  function afterSudden() {
    if (kind === 'rush') ctx.startRush?.();
  }
  // Show the next thing that is due; true if something is now up.
  const nextPanel = () => showSpoon() || showGift() || showSudden();

  if (!nextPanel()) {
    announced = kind ? key : announced;
    if (isNew && !kind) sfx('hello');
    else if (isNew) sfx('pop');
    afterSudden();
  }
  if (learning) coach(stage, { step: 1, target: '.pl-make', text: 'Tap!' });

  // ---- the mystery guest's own recipes ----
  function openPicker() {
    if (stage.querySelector('[data-pick]')) return; // already open: a second tap does nothing
    pickerAt = performance.now();
    const foods = game.owned.filter(f => FOODS[f]);
    stage.insertAdjacentHTML('beforeend', `<div class="pl-over pl-pick" data-pick><div class="pl-pick-panel cm-panel">
<h2 class="pl-pick-title">What shall we make?</h2>
<div class="pl-pick-row">${foods.map(f => `<button class="pk-btn" data-food="${f}" aria-label="${FOODS[f].name}"><span class="pic">${food(f)}</span><span>${FOODS[f].name}</span></button>`).join('')}</div>
<button class="btn white pl-pick-back" data-pickback>Back</button></div></div>`);
  }
  let hush = null;
  let pickerAt = 0; // when the picker opened: the second tap of a double tap on Make must not choose a food
  function notThat() {
    const words = bubbleBox.querySelector('.pl-words');
    words.textContent = 'Hmm, not that one!';
    guest.classList.remove('shake'); void guest.offsetWidth; guest.classList.add('shake');
    clearTimeout(hush);
    hush = setTimeout(() => { if (words.isConnected) words.textContent = `${cap(FOODS[order.foodId].riddle)}, please!`; }, 2200);
    sfx('pop');
  }

  // ---- taps ----
  let starting = false;
  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    const d = b.dataset;
    if ('make' in d) {
      if (kind === 'mystery') openPicker();
      else { sfx('pop'); go('garden'); }
    } else if (d.food) {
      if (performance.now() - pickerAt < 450) return;
      if (d.food === order.foodId) { sfx('pop'); go('garden'); }
      else notThat();
    } else if ('pickback' in d) {
      stage.querySelector('[data-pick]')?.remove();
    } else if ('ok' in d) {
      stage.querySelector('[data-sudden]')?.remove();
      sfx('pop');
      afterSudden();
    } else if ('notoday' in d) {
      update(skipRush(ctx.game));
      ctx.order = ctx.game.order ?? ctx.order;
      ctx.stopRush?.();
      stage.querySelector('[data-sudden]')?.remove();
      stage.querySelector('.pl-caption').textContent = `Meanwhile, at ${spot.where}...`;
      sfx('pop');
    } else if ('keep' in d) {
      if (ctx.game.spoon !== true) update({ ...ctx.game, spoon: true });
      stage.querySelector('[data-spoon]')?.remove();
      sfx('pop');
      if (!nextPanel()) afterSudden();
    } else if ('thanks' in d) {
      // giveGift only works once, so a double tap gives one gift and $10, not two.
      const panel = b.closest('[data-gift]');
      if (!panel) return;
      const id = panel.dataset.gift;
      panel.remove();
      if (giftDue(ctx.game, id)) {
        update(giveGift(ctx.game, id));
        sfx('coin');
        stage.querySelector('.hud-coins').outerHTML = coinBox(ctx.game);
        stage.querySelector('.pl-shelf')?.remove();
        stage.querySelector('.pl-side').insertAdjacentHTML('beforebegin', `<div class="pl-shelf" aria-label="Presents from friends">${ctx.game.gifts.filter(m => FRIENDS[m]).map(m => `<span class="pic${m === id ? ' is-new' : ''}">${item(FRIENDS[m].keepsake.id)}</span>`).join('')}</div>`);
      }
      if (!nextPanel()) afterSudden();
    } else if ('victoria' in d) {
      if (learning) return;
      const more = victoriaSays(ctx.game, order, Math.random, lastSaid);
      lastSaid = more.text;
      const says = stage.querySelector('.pl-says');
      says.className = `cm-bubble pl-says is-${more.kind}`;
      says.textContent = more.text;
      says.classList.remove('pop'); void says.offsetWidth; says.classList.add('pop');
      sfx('pop');
    } else if ('openmap' in d) {
      if (!stage.querySelector('[data-map]') && !busy()) { stage.insertAdjacentHTML('beforeend', mapPanel(ctx.game)); sfx('pop'); }
    } else if ('mapback' in d) {
      stage.querySelector('[data-map]')?.remove();
    } else if (d.visit) {
      if (starting) return;
      starting = true;
      update(setVisit(ctx.game, Number(d.visit)));
      sfx('travel');
      go('place');
    } else if ('shop' in d) { go('shop'); }
    else if ('friends' in d) { go('friends'); }
    else if ('comic' in d) { go('mycomic'); }
    else if ('who' in d) { go('who'); }
    else if ('travel' in d) {
      // The chapter this button was drawn for: a double tap travels only once.
      const from = here.id;
      if (starting) return;
      starting = true;
      playIf(ctx, `ch${from}-end`, () => {
        update(travel(ctx.game, from));
        sfx(TRAVEL_SOUND[here.travel] ?? 'travel');
        playIf(ctx, `ch${from + 1}-open`, () => go('place'));
      });
    } else if ('finish' in d) {
      if (starting) return;
      starting = true;
      playIf(ctx, 'ending', () => go('place'));
    }
  });
}

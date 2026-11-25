// Choose the price, then see what the customer thinks. A comic panel: sound words for the reaction,
// plates that fly to the counter, and (for a mystery guest) the disguise coming off.
// The child's chef stands at the counter too: a cheer for a happy plate, a shrug for a "yuck".
// A happy monster's three hearts show, and a newly filled one pops.

import { FOODS, MONSTERS, DAYS, CRITIC_BONUS } from '../data.js';
import { clampPrice, profitLabel, react, isDayFood, rainBonus, costOf } from '../economy.js';
import { sell, dayOver } from '../state.js';
import { platesFor } from '../plates.js';
import { monsterName } from '../chapters.js';
import { FRIENDS, hearts, fill } from '../friends.js';
import { monster, critic, mystery, chef, food, item, plate, sfx as word } from '../art.js';
import { sfx } from '../audio.js';
import { plateCounter, heartsRow } from './hud.js';
import { teaching, coach, uncoach } from './coach.js';

const calm = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const MONSTER_SIZE = { fife: 0.72 };
const WHO = { w: 320, h: 407 }; // the customer, with room beside it for the chef
const MAX_FLYING = 6; // never more than this many plate pictures in the air at once

// Why a plate is golden, in a few words.
function goldenWhy({ golden, rush, tip, favourite, kind }) {
  if (golden && !rush) return 'Golden treat!';
  if (rush) return 'Fast in the rush!';
  if (favourite) return 'Favourite food!';
  if (kind === 'love') return 'Loves the sparkle!';
  if (tip > 0) return 'Kind price!';
  return 'Golden treat!';
}

export function render(stage, ctx, go, update) {
  if (!ctx.order) { go('place'); return; }
  const { monsterId, foodId } = ctx.order;
  const surprise = ctx.order.surprise ?? null;
  const recipe = FOODS[foodId];
  const isCritic = surprise?.kind === 'critic';
  const isMystery = surprise?.kind === 'mystery';
  const count = surprise?.kind === 'big' ? (surprise.count ?? 3) : 1;
  // The moon monster's name is typed by the player: it only ever reaches the page as plain text.
  const name = isCritic ? 'The food critic' : isMystery ? 'The mystery guest' : monsterName(monsterId, ctx.game);
  const cost = costOf(foodId, ctx.game);
  const look = ctx.chefLook?.() ?? 'chef-a';
  const teach = teaching(ctx); // the first order: it stays true on this screen after the sale, for step 5
  // 'choosing' (also after "TOO MUCH!"), then 'reacting' once the customer has decided.
  let state = 'choosing';
  const dayKind = ctx.game.day.kind;
  const dayBadge = isDayFood(foodId, dayKind)
    ? `<div class="pr-day"><span class="pic">${item(DAYS[dayKind].pic)}</span><span>${DAYS[dayKind].name}: pays more today!</span></div>`
    : '';
  const rain = rainBonus(ctx.game);
  const rainBadge = rain ? `<div class="pr-day"><span class="pic">${item('rain')}</span><span>Umbrella: $${rain} more today!</span></div>` : '';
  const size = isCritic || isMystery ? 1 : MONSTER_SIZE[monsterId] ?? 1;

  // Who is standing there (and who it turns out to be).
  const who = mood => {
    if (isCritic) return critic(mood === 'happy' || mood === 'love' ? 'happy' : 'idle');
    if (isMystery) return mystery('idle');
    return monster(monsterId, mood, 1);
  };

  stage.innerHTML = `<div class="pr-wrap">
<div class="pl-frame" aria-hidden="true"></div>
<div class="cm-caption pl-caption pr-caption">Meanwhile, at the counter...</div>
<div class="pr-plates">${plateCounter(ctx.game)}</div>
<div class="pr-left">
  <div class="pr-guest">
    <div class="cm-bubble pr-bubble" aria-live="polite">Yum! How much?</div>
    <div class="pr-hearts"></div>
    <div class="pr-who" style="width:${WHO.w * size}px;height:${WHO.h * size}px">${who('idle')}</div>
  </div>
  <div class="pr-chef fill" aria-hidden="true">${chef('spoon', look, 'idle')}</div>
  <div class="pr-word" aria-hidden="true"></div>
</div>
<div class="pr-card${teach ? ' is-teaching' : ''}">
  <h1 class="cm-title">Choose your price</h1>
  <div class="pr-cost"><span class="pic">${food(foodId)}</span><span>It cost you $${cost} to make${count > 1 ? ' each' : ''}</span></div>${dayBadge}${rainBadge}
  <div class="pr-chips"></div>
  <div class="pr-controls">
    <button class="pl-btn pl-round pr-minus" aria-label="Lower the price">&minus;</button>
    <div class="pr-coin"><span class="pr-coin-text"></span>${count > 1 ? `<span class="pr-x3">x${count}</span>` : ''}</div>
    <button class="pl-btn pl-round pr-plus" aria-label="Raise the price">+</button>
  </div>
  ${count > 1 ? '<div class="pr-times"></div>' : ''}
  <div class="pr-piggy"><span class="pic">${item('piggy')}</span><span class="pr-keep" aria-live="polite"></span></div>
  <div class="pr-action"><button class="pl-btn pl-mint pr-sell">Sell it!</button></div>
</div></div>`;

  const $ = sel => stage.querySelector(sel);
  const bubble = $('.pr-bubble'), whoEl = $('.pr-who'), wordEl = $('.pr-word'), coin = $('.pr-coin');
  const coinText = $('.pr-coin-text'), keep = $('.pr-keep'), times = $('.pr-times');
  const minus = $('.pr-minus'), plus = $('.pr-plus'), sellBtn = $('.pr-sell'), action = $('.pr-action');
  const wrap = $('.pr-wrap'), chips = $('.pr-chips'), card = $('.pr-card'), left = $('.pr-left');
  const chefEl = $('.pr-chef'), heartsEl = $('.pr-hearts');
  let revealing = false;
  let chefMood = 'idle';

  // The chef at the counter: 'idle', 'cheer' (a happy plate) or 'oops' (a shrug, never sad).
  function chefIs(mood) {
    if (mood === chefMood && mood === 'idle') return;
    chefMood = mood;
    chefEl.innerHTML = chef('spoon', look, mood);
    chefEl.className = 'pr-chef fill';
    void chefEl.offsetWidth;
    if (mood === 'cheer') chefEl.classList.add('pl-dance');
    if (mood === 'oops') chefEl.classList.add('pl-bump');
  }

  // The monster's three hearts, as they are after the sale. One that has just filled pops.
  function showHearts(id, before) {
    const now = hearts(ctx.game, id);
    heartsEl.innerHTML = heartsRow(ctx.game, id);
    heartsEl.classList.add('pl-pop');
    if (now <= before) return;
    const filled = [...heartsEl.querySelectorAll('.hud-heart')].slice(before, now);
    setTimeout(() => {
      if (!heartsEl.isConnected) return;
      for (const h of filled) h.classList.add('is-new', 'pr-newheart');
      sfx('heart');
    }, 450);
  }

  // Teaching, steps 4 and 5: an arrow on the price buttons, then Sell, then the happy plate.
  function point(step, target, text) {
    if (teach) coach(stage, { step, target, text });
  }

  function say(text, loud = false) {
    bubble.textContent = text;
    bubble.classList.toggle('is-loud', loud);
  }

  // A drawn comic sound word beside the customer.
  function shout(text, colour) {
    wordEl.innerHTML = text ? word(text, colour) : '';
    wordEl.classList.remove('pl-slam');
    void wordEl.offsetWidth;
    if (text) wordEl.classList.add('pl-slam');
  }

  function show(mood, words, moveClass = '') {
    whoEl.innerHTML = who(mood);
    whoEl.className = 'pr-who';
    void whoEl.offsetWidth; // so the same move can play twice in a row
    whoEl.className = `pr-who ${moveClass}`;
    say(words, moveClass !== '');
  }

  function drawPrice() {
    coinText.textContent = `$${ctx.price}`;
    if (times) times.textContent = `${count} x $${ctx.price}`;
    keep.textContent = profitLabel(ctx.price * count, cost * count);
  }

  function changePrice(by) {
    if (state !== 'choosing') return;
    ctx.price = clampPrice(ctx.price + by);
    show('idle', 'Yum! How much?'); // a shocked customer calms down as soon as the price changes
    chefIs('idle');
    shout('');
    point(4, sellBtn, 'Sell it!');
    drawPrice();
    coin.classList.remove('pl-bump');
    void coin.offsetWidth;
    coin.classList.add('pl-bump');
  }

  // The next button appears after a moment, so fast taps on "Sell it!" cannot skip the fun.
  function offerNext(label, colour, delay, onTap) {
    setTimeout(() => {
      if (!action.isConnected) return;
      action.innerHTML = `<button class="pl-btn ${colour} pr-next hint pl-hint">${label}</button>`;
      action.firstChild.addEventListener('click', onTap, { once: true });
    }, delay);
  }

  // Plate pictures fly from the customer to the counter; then the counter shows the new number.
  // Returns how long it takes (ms).
  function flyPlates(n, isGolden, why) {
    const refresh = () => {
      const old = stage.querySelector('.hud-plates');
      if (old) old.outerHTML = plateCounter(ctx.game);
      const fresh = stage.querySelector('.hud-plates');
      fresh?.classList.add('pl-bump');
    };
    if (why) chips.insertAdjacentHTML('beforeend', `<div class="pr-chip pr-why pl-pop"><span class="pic">${item('star')}</span>${why}</div>`);
    if (calm() || !n) { refresh(); sfx(isGolden ? 'golden' : 'plate'); return 300; }
    const fly = Math.min(n, MAX_FLYING);
    const base = stage.getBoundingClientRect();
    const s = ctx.scale || 1;
    const at = r => [(r.left + r.width / 2 - base.left) / s, (r.top + r.height / 2 - base.top) / s];
    const [x0, y0] = at(whoEl.getBoundingClientRect());
    const target = stage.querySelector('.hud-plates svg') ?? stage.querySelector('.hud-plates') ?? $('.pr-plates');
    const [x1, y1] = at(target.getBoundingClientRect());
    for (let i = 0; i < fly; i++) {
      const p = document.createElement('span');
      p.className = 'pic pr-fly';
      p.innerHTML = plate(isGolden);
      p.style.left = `${x0}px`; p.style.top = `${y0}px`;
      wrap.append(p);
      const delay = 350 + i * 170;
      p.animate?.([
        { transform: 'translate(-50%, -50%) scale(.3)', opacity: 0 },
        { transform: `translate(calc(-50% + ${(x1 - x0) * 0.3}px), calc(-50% + ${Math.min(y1 - y0, 0) - 70}px)) scale(1.1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(.55)`, opacity: 1 },
      ], { duration: 650, delay, easing: 'ease-in-out', fill: 'both' });
      setTimeout(() => { p.remove(); if (stage.isConnected) sfx(isGolden ? 'golden' : 'plate'); }, delay + 660);
    }
    const total = 350 + (fly - 1) * 170 + 660;
    setTimeout(() => { if (stage.isConnected) refresh(); }, total);
    return total;
  }

  // Coins hop from the big coin into the piggy bank while the number counts up.
  function payIn(gained) {
    if (calm()) return;
    const base = stage.getBoundingClientRect(), s = ctx.scale || 1;
    const at = r => [(r.left + r.width / 2 - base.left) / s, (r.top + r.height / 2 - base.top) / s];
    const [x0, y0] = at(coin.getBoundingClientRect());
    const [x1, y1] = at($('.pr-piggy .pic').getBoundingClientRect());
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('span');
      c.className = 'pr-coinfly';
      c.style.left = `${x0}px`; c.style.top = `${y0}px`;
      wrap.append(c);
      c.animate?.([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${(x1 - x0) * 0.5 + (i - 2) * 22}px), calc(-50% + ${(y1 - y0) * 0.3}px)) scale(1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(calc(-50% + ${x1 - x0}px), calc(-50% + ${y1 - y0}px)) scale(.4)`, opacity: 0.2 },
      ], { duration: 600, delay: i * 90, easing: 'ease-in', fill: 'both' });
      setTimeout(() => c.remove(), 700 + i * 90);
    }
    let shown = 0;
    const tick = setInterval(() => {
      shown = Math.min(gained, shown + Math.max(1, Math.ceil(gained / 10)));
      if (keep.isConnected) keep.textContent = `+$${shown}`;
      if (shown >= gained || !keep.isConnected) clearInterval(tick);
    }, 60);
    keep.textContent = '+$0';
  }

  function sellIt() {
    if (state !== 'choosing' || revealing) return;
    const result = react(monsterId, foodId, ctx.price, ctx.hasSparkle, ctx.game, surprise);

    if (result.kind === 'too-much') {
      show(isCritic || isMystery ? 'idle' : 'shocked', 'Too much! Try a lower price.', 'pl-jump');
      shout('TOO MUCH!', '#FF8A73');
      sfx('too-much');
      chefIs('oops');
      point(4, minus, 'Lower!');
      return; // the player can change the price and try again, as often as they like
    }

    state = 'reacting';
    for (const b of [minus, plus, sellBtn]) b.disabled = true;
    if (teach) uncoach(stage);

    if (result.kind === 'yuck') {
      show('yuck', 'Blech! What is in this?', 'pl-shake');
      shout('YUCK!', '#B5D96A');
      sfx('yuck');
      chefIs('oops');
      offerNext('Make it again', 'pl-white', 2000, () => {
        ctx.remake = true;
        ctx.hasSparkle = false;
        go('kitchen');
      });
      return;
    }

    const { kind, tip } = result;
    const rushOk = surprise?.kind === 'rush' && !!ctx.rushInTime?.();
    const golden = ctx.golden === true || rushOk;
    const { plates, golden: isGolden } = platesFor({ kind, tip, monsterId, foodId, golden, count, bonus: isCritic ? CRITIC_BONUS : 0 });
    const favourite = MONSTERS[monsterId].favourite === foodId;
    // Whose hearts fill: the monster's (under the hat too), never the critic's.
    const friend = isCritic ? null : isMystery && surprise.who && MONSTERS[surprise.who] ? surprise.who : monsterId;
    const heartsBefore = friend ? hearts(ctx.game, friend) : 0;
    const before = ctx.game.money;
    update(sell(ctx.game, foodId, result.pays, { tip, monsterId, kind, plates, count }));
    const gained = ctx.game.money - before; // includes the umbrella bonus and the count

    // Reaction: words, a happy dance, sound words.
    const happyWord = isCritic ? 'DELICIOUS!' : kind === 'love' ? 'I LOVE IT!' : 'YUM!';
    if (isMystery) {
      // The disguise comes off, then the real monster giggles.
      revealing = true;
      whoEl.innerHTML = mystery('reveal');
      whoEl.className = 'pr-who pl-jump';
      say('Mmm! Delicious!');
      sfx('reveal');
      const real = friend;
      setTimeout(() => {
        if (!stage.isConnected) return;
        whoEl.innerHTML = monster(real, 'happy', 1);
        whoEl.className = `pr-who pl-dance${real === 'ghuy' ? ' pl-wiggle' : ''}`;
        say(`Tee hee! It was me, ${monsterName(real, ctx.game)}!`, true);
        bubble.setAttribute('aria-label', `${monsterName(real, ctx.game)} says`);
        showHearts(real, heartsBefore); // only once the disguise is off
        revealing = false;
      }, 1100);
    } else {
      const yum = fill(FRIENDS[monsterId]?.yum, ctx.chefName?.()) || 'Yum! Thank you!';
      show(isCritic ? 'happy' : kind, isCritic ? 'Delicious! A fine meal.' : yum, monsterId === 'ghuy' && !isCritic ? 'pl-dance pl-wiggle' : 'pl-dance');
      if (friend) showHearts(friend, heartsBefore);
    }
    chefIs('cheer');
    shout(happyWord, isCritic ? '#FFC93C' : kind === 'love' ? '#FF8FB1' : '#FFE066');
    coinText.textContent = `$${result.pays}`;
    coin.classList.add('pl-pop');
    keep.textContent = gained >= 0 ? `+$${gained}` : `You lose $${-gained}`;
    $('.pr-piggy').classList.add('paid');
    sfx('happy');
    if (gained > 0) {
      payIn(gained);
      sfx('coin');
      setTimeout(() => {
        if (stage.isConnected && state === 'reacting') {
          left.insertAdjacentHTML('beforeend', `<div class="pr-kaching">${word('KA-CHING!', '#5ED6B0')}</div>`);
        }
      }, 500);
    }
    if (tip > 0) {
      chips.insertAdjacentHTML('beforeend', `<div class="pr-chip pr-tip pl-pop"><span class="pic">${item('star')}</span>Kind price! +$${tip} tip</div>`);
      sfx('tip');
    }
    card.classList.add('is-sold'); // the "what it cost" lines make room for the good news
    if (isCritic) chips.insertAdjacentHTML('beforeend', `<div class="pr-chip pr-critic pl-pop"><span class="pic">${plate(true)}</span>+${CRITIC_BONUS} plates</div>`);

    let why = isGolden ? goldenWhy({ golden: ctx.golden === true, rush: rushOk, tip, favourite, kind }) : '';
    if (why === 'Kind price!' && tip > 0) why = ''; // the tip chip has already said so
    if (isMystery) chips.insertAdjacentHTML('beforeend', `<div class="pr-chip pl-pop"><span class="pic">${item('coin')}</span>Mystery guest pays ${result.pays >= ctx.price * 3 ? 'triple' : 'double'}!</div>`);
    const flight = flyPlates(plates, isGolden, why);
    // Step 5: the plate lands on the counter.
    if (teach) setTimeout(() => { if (stage.isConnected) point(5, '.hud-plates', 'A happy plate!'); }, flight + 60);
    offerNext('Next', 'pl-pink', Math.max(isMystery ? 2200 : 1200, flight + 500), () => {
      ctx.order = null; // a new customer will come
      go(dayOver(ctx.game) ? 'dayend' : 'place'); // after the day's last customer, the restaurant closes
    });
  }

  minus.addEventListener('click', () => changePrice(-1));
  plus.addEventListener('click', () => changePrice(1));
  sellBtn.addEventListener('click', sellIt);
  drawPrice();
  point(4, '.pr-controls', 'Pick a price!');
  bubble.setAttribute('aria-label', `${name} says`);
}

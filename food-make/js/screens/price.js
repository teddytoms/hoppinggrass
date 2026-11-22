// Choose the price, then see what the monster thinks.

import { FOODS, MONSTERS, DAYS } from '../data.js';
import { clampPrice, profitLabel, react, isDayFood } from '../economy.js';
import { sell, note, dayOver } from '../state.js';
import { MONSTER_SIZE } from './restaurant.js';
import { monster, food, item } from '../art.js';
import { sfx } from '../audio.js';

const calm = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const HEART = '<svg viewBox="0 0 32 30"><path d="M16 28L3 15a7.5 7.5 0 0 1 13-8a7.5 7.5 0 0 1 13 8z" fill="#EF476F" stroke="#3B2A4A" stroke-width="3" stroke-linejoin="round"/></svg>';

export function render(stage, ctx, go, update) {
  const { monsterId, foodId } = ctx.order;
  const recipe = FOODS[foodId];
  const name = MONSTERS[monsterId].name;
  // 'choosing' (also after "TOO MUCH!"), then 'reacting' once the monster has decided.
  let state = 'choosing';
  const dayKind = ctx.game.day.kind;
  // On a special day the day's foods sell for more: say so with the day's picture.
  const dayBadge = isDayFood(foodId, dayKind)
    ? `<div class="p-day baloo"><span class="pic">${item(DAYS[dayKind].pic)}</span><span>${DAYS[dayKind].name}: pays more today!</span></div>`
    : '';
  const size = MONSTER_SIZE[monsterId] ?? 1;

  stage.innerHTML = `<div class="p-wrap">
<div class="p-left">
  <div class="bubble p-bubble" aria-live="polite">Yum! How much?</div>
  <div class="p-monster fill" style="width:${400 * size}px;height:${509 * size}px">${monster(monsterId, 'idle', 1)}</div>
</div>
<div class="p-card card">
  <h1 class="baloo">Choose your price</h1>
  <div class="p-cost baloo"><span class="pic">${food(foodId)}</span><span>It cost you $${recipe.cost} to make</span></div>${dayBadge}
  <div class="p-controls">
    <button class="btn round p-minus" aria-label="Lower the price">&minus;</button>
    <div class="p-coin baloo"></div>
    <button class="btn round p-plus" aria-label="Raise the price">+</button>
  </div>
  <div class="p-piggy baloo"><span class="pic">${item('piggy')}</span><span class="p-keep" aria-live="polite"></span></div>
  <div class="p-action"><button class="btn mint p-sell">Sell it!</button></div>
</div></div>`;

  const $ = sel => stage.querySelector(sel);
  const bubble = $('.p-bubble'), monsterEl = $('.p-monster'), coin = $('.p-coin'), keep = $('.p-keep');
  const minus = $('.p-minus'), plus = $('.p-plus'), sellBtn = $('.p-sell'), action = $('.p-action');

  function show(mood, words, bubbleClass = '', monsterClass = '') {
    monsterEl.innerHTML = monster(monsterId, mood, 1);
    monsterEl.className = 'p-monster fill';
    void monsterEl.offsetWidth; // so the same move can play twice in a row
    monsterEl.className = `p-monster fill ${monsterClass}`;
    bubble.textContent = words;
    bubble.className = `bubble p-bubble ${bubbleClass}`;
  }

  function drawPrice() {
    coin.textContent = `$${ctx.price}`;
    keep.textContent = profitLabel(ctx.price, recipe.cost);
  }

  function changePrice(by) {
    if (state !== 'choosing') return;
    ctx.price = clampPrice(ctx.price + by);
    show('idle', 'Yum! How much?'); // a shocked monster calms down as soon as the price changes
    drawPrice();
    coin.classList.remove('bump');
    void coin.offsetWidth;
    coin.classList.add('bump');
  }

  // The next button appears after a moment, so fast taps on "Sell it!" cannot skip the fun.
  function offerNext(label, colour, delay, onTap) {
    setTimeout(() => {
      if (!action.isConnected) return;
      action.innerHTML = `<button class="btn ${colour} p-next popin hint">${label}</button>`;
      action.firstChild.addEventListener('click', onTap, { once: true });
    }, delay);
  }

  function sellIt() {
    if (state !== 'choosing') return;
    const result = react(monsterId, foodId, ctx.price, ctx.hasSparkle, dayKind);

    if (result.kind === 'too-much') {
      show('shocked', 'TOO MUCH!', 'loud', 'jump');
      sfx('too-much');
      return; // the player can change the price and try again, as often as they like
    }

    state = 'reacting';
    for (const b of [minus, plus, sellBtn]) b.disabled = true;

    if (result.kind === 'yuck') {
      show('yuck', 'Yuck!', 'loud', 'shake');
      sfx('yuck');
      update(note(ctx.game, `${monsterId}-yuck`)); // finding a monster's secret is a discovery
      offerNext('Make it again', '', 2000, () => {
        ctx.remake = true;
        ctx.hasSparkle = false;
        go('kitchen');
      });
      return;
    }

    const before = ctx.game.money;
    update(sell(ctx.game, foodId, result.pays, { tip: result.tip, monsterId, kind: result.kind }));
    const gained = ctx.game.money - before;
    show(result.kind, result.kind === 'love' ? 'I LOVE it!' : 'Yum! Thank you!', result.kind === 'love' ? 'loud' : '', monsterId === 'ghuy' ? 'dance wiggle' : 'dance');
    coin.textContent = `$${result.pays}`;
    coin.classList.add('popin');
    keep.textContent = gained >= 0 ? `+$${gained}` : `You lose $${-gained}`;
    if (gained > 0) payIn(gained);
    if (result.kind === 'love') floatHearts();
    if (result.tip > 0) {
      bubble.insertAdjacentHTML('beforebegin', `<div class="p-tip baloo popin"><span class="pic">${item('star')}</span>Kind price! +$${result.tip} tip</div>`);
      sfx('tip');
    }
    $('.p-piggy').classList.add('paid');
    sfx('happy');
    if (gained > 0) sfx('coin');
    offerNext('Next', 'pink', 1200, () => {
      ctx.order = null; // a new monster will sit down
      go(dayOver(ctx.game) ? 'dayend' : 'restaurant'); // after the day's last monster, the restaurant closes
    });
  }

  // Coins hop from the big coin into the piggy bank while the number counts up.
  function payIn(gained) {
    if (calm()) return;
    const card = $('.p-card'), box = card.getBoundingClientRect();
    const from = coin.getBoundingClientRect(), to = $('.p-piggy .pic').getBoundingClientRect();
    const at = r => [(r.left + r.width / 2 - box.left) / ctx.scale, (r.top + r.height / 2 - box.top) / ctx.scale];
    const [x0, y0] = at(from), [x1, y1] = at(to);
    for (let i = 0; i < 5; i++) {
      const c = document.createElement('span');
      c.className = 'p-fly';
      c.style.left = `${x0}px`; c.style.top = `${y0}px`;
      card.append(c);
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

  function floatHearts() {
    const left = $('.p-left');
    for (let i = 0; i < 6; i++) {
      const h = document.createElement('span');
      h.className = 'p-heart';
      h.innerHTML = HEART;
      h.style.left = `${40 + i * 62}px`;
      h.style.animationDelay = `${i * 0.35}s`;
      left.append(h);
    }
  }

  minus.addEventListener('click', () => changePrice(-1));
  plus.addEventListener('click', () => changePrice(1));
  sellBtn.addEventListener('click', sellIt);
  drawPrice();
  bubble.setAttribute('aria-label', `${name} says`);
}

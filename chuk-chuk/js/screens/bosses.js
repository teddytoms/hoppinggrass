// The Investor Bosses visit. Each looks for what they love and offers money
// for a slice of the ticket money. The child says "Yes please" or "No thanks".

import { BOSSES, BOSS_ORDER, LOVE_HINTS, WISH_BONUS } from '../data.js';
import { offer, pickWish } from '../bosses.js';
import { plane, boss, icon, pieceIcon, coin } from '../art.js';
import { el, button, moneyChip, backButton, pips } from '../ui.js';
import { sfx } from '../audio.js';

export function render(root, ctx, go, update) {
  root.classList.add('pad');
  if (!ctx.game.wish) update({ ...ctx.game, wish: pickWish(ctx.game.owned) });
  const design = ctx.game.design, wish = ctx.game.wish;
  ctx.accepted = [];
  let busy = false;
  let shownAt = 0; // taps just after a boss arrives are ignored, so mashing does not answer the next one
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function show(i) {
    busy = false;
    shownAt = performance.now();
    if (i >= BOSS_ORDER.length) return go('build');
    const id = BOSS_ORDER[i], b = BOSSES[id];
    const o = offer(id, design, wish);
    const wishing = wish.bossId === id;
    const line = b.lines[(ctx.game.flights + i) % b.lines.length];
    const total = ctx.accepted.reduce((s, a) => s + a.amount, 0);
    root.innerHTML = `
<h2 class="title abs" style="left:110px;top:18px">${b.name} is here!</h2>
<div class="hud"><span class="hand" style="font-size:24px">Boss money</span><span class="faces row" style="gap:0">${ctx.accepted.map(a => `<span style="width:40px;height:48px">${boss(a.bossId, 'happy')}</span>`).join('')}</span><span class="jar">${moneyChip(total)}</span></div>
<span class="abs float" style="left:20px;top:210px;width:400px;height:352px;rotate:-5deg">${plane(design, { popped: true })}</span>
<div class="bossbox" style="right:30px;width:280px"><span class="float" style="display:block;width:100%;height:100%">${boss(id, o.amount > 0 ? 'happy' : 'idle')}</span></div>
${wishing ? `<div class="abs bubble thought pop" style="right:90px;top:84px;width:max-content;padding:6px 14px;display:flex;align-items:center;gap:8px;font-size:22px"><span>My wish:</span><span style="width:80px;height:60px">${pieceIcon(wish.pieceId)}</span></div>` : ''}
<div class="abs col" style="left:356px;top:${wishing ? 150 : 120}px;width:376px;gap:18px">
<div class="bubble rise">
  <p style="font-size:21px;color:#4A4E5C">${line}</p>
  <div class="row" style="margin:6px 0 4px"><span style="width:50px;height:50px;flex:none">${icon(b.loves)}</span><span class="hand" style="font-size:30px;line-height:1">I love ${b.loves.toUpperCase()}!</span></div>
  ${pips(Math.min(o.stars, 12), Math.max(6, Math.min(o.stars, 12)))}
  ${o.wishMet ? `<p class="hand" style="font-size:23px;color:var(--purple);margin-top:4px">You made my wish! +$${WISH_BONUS}</p>` : ''}
  ${o.amount > 0
    ? `<div class="row" style="margin-top:4px;gap:10px"><span>I will give you</span><span class="offer">$${o.amount}</span></div><p>for a slice of your ticket money.</p>`
    : `<p style="margin-top:8px">${LOVE_HINTS[b.loves]}</p><p style="font-size:21px;color:#4A4E5C">Maybe next time!</p>`}
</div>
<div class="row acts" style="gap:16px;justify-content:center"></div>
</div>`;
    root.append(backButton(() => go('workshop')));
    const acts = root.querySelector('.acts');
    const next = () => later(() => show(i + 1), 900);
    if (o.amount > 0) {
      acts.append(
        button({ label: 'Yes please', picture: icon('ok'), cls: 'go pulse', tap: () => {
          if (busy || performance.now() - shownAt < 400) return;
          busy = true;
          ctx.accepted = [...ctx.accepted, { bossId: id, amount: o.amount }];
          sfx('yes');
          for (let c = 0; c < 6; c++) {
            const fly = el(`<span class="coin-fly" style="left:${760 - c * 14}px;top:${330 + c * 10}px;--dx:${150 + c * 10}px;--dy:${-300 - c * 10}px;animation-delay:${c * 70}ms">${coin()}</span>`);
            root.append(fly);
          }
          later(() => {
            sfx('coin');
            root.querySelector('.jar').innerHTML = moneyChip(total + o.amount);
            root.querySelector('.faces').insertAdjacentHTML('beforeend', `<span class="pop" style="width:40px;height:48px">${boss(id, 'happy')}</span>`);
          }, 500);
          next();
        } }),
        button({ label: 'No thanks', cls: 'small', tap: () => { if (busy || performance.now() - shownAt < 400) return; busy = true; sfx('no'); next(); } }),
      );
    } else {
      acts.append(button({ label: 'OK', cls: 'big go', tap: () => { if (busy || performance.now() - shownAt < 400) return; busy = true; next(); } }));
    }
    sfx('whoosh');
    // A secret: tickle the boss.
    const box = root.querySelector('.bossbox');
    box.addEventListener('click', () => {
      sfx(id === 'ityul' ? 'poof' : 'star');
      box.classList.remove('wiggle');
      void box.offsetWidth;
      box.classList.add('wiggle');
      root.querySelector('.tickle')?.remove();
      root.append(el(`<div class="abs bubble pop tickle" style="right:50px;top:530px;width:max-content;font-size:24px">${b.tickle}</div>`));
    });
  }

  show(0);
  return () => timers.forEach(clearTimeout);
}

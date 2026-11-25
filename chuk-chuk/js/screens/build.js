// Build what the money allows. If it is short, swap a fancy piece for a
// cheaper one, or put in some of your own savings.

import { KINDS, PIECES } from '../data.js';
import { buildCost, setPiece, cheaper, stats } from '../plane.js';
import { buildPlane, bossMoney } from '../economy.js';
import { plane, pieceIcon, icon, jelly, sparkleArt, boss } from '../art.js';
import { el, button, pic, moneyChip, backButton } from '../ui.js';
import { sfx } from '../audio.js';

export function render(root, ctx, go, update) {
  root.classList.add('pad');
  let design = ctx.game.design;
  let own = 0;
  let built = false;
  const timers = [];
  const boss$ = bossMoney(ctx.accepted);

  function draw() {
    const cost = buildCost(design), have = boss$ + own, gap = Math.max(0, cost - have);
    const s = stats(design);
    const swaps = KINDS.filter(k => cheaper(design, k, ctx.game.owned).length);
    root.innerHTML = `
<h2 class="title abs" style="left:110px;top:18px">${gap ? 'Not enough money yet' : 'Ready to build!'}</h2>
<span class="abs" style="left:30px;top:110px;width:470px;height:406px;rotate:-5deg">${plane(design, { popped: true })}</span>
<div class="abs row" style="left:60px;top:540px;gap:10px">${['fast', 'pretty', 'comfy', 'seat'].map((f, i) => `<span class="chip">${pic(icon(f))}<span>${[s.fast, s.pretty, s.comfy, s.seats][i]}</span></span>`).join('')}</div>
<div class="abs card" style="right:30px;top:96px;width:470px;padding:16px 18px">
  <div class="col" style="gap:8px;font-size:26px">
    <div class="row" style="justify-content:space-between"><span class="hand">The plane costs</span>${moneyChip(cost)}</div>
    <div class="row" style="justify-content:space-between"><span class="hand row" style="gap:4px">Boss money ${ctx.accepted.map(a => `<span style="width:34px;height:40px">${boss(a.bossId)}</span>`).join('')}</span>${moneyChip(boss$)}</div>
    ${own ? `<div class="row" style="justify-content:space-between"><span class="hand">My money</span>${moneyChip(own)}</div>` : ''}
    <div class="bar" style="height:30px"><i style="width:${cost ? Math.min(100, Math.round(have / cost * 100)) : 100}%;background-color:${gap ? 'var(--orange)' : 'var(--green)'}"></i></div>
    <p class="hand" style="font-size:28px;color:${gap ? '#C2261A' : 'var(--green)'}">${gap ? `$${gap} short` : 'You have enough!'}</p>
  </div>
</div>
<div class="abs col fix" style="right:30px;top:340px;width:470px;gap:10px;align-items:flex-start"></div>
<div class="abs row acts" style="left:60px;bottom:22px;gap:18px"></div>`;
    root.append(backButton(() => go('workshop')));
    const fix = root.querySelector('.fix');
    if (gap) {
      fix.append(el('<p class="hand" style="font-size:26px">Swap for a cheaper piece:</p>'));
      const row = el('<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;width:100%"></div>');
      for (const k of swaps) {
        const to = cheaper(design, k, ctx.game.owned)[0];
        const save = PIECES[design[k]].build - PIECES[to].build;
        const b = el(`<button class="btn small" style="padding:4px 8px;gap:6px" aria-label="Swap ${PIECES[design[k]].name} for ${PIECES[to].name}, saves $${save}">
<span style="width:56px;height:50px;flex:none">${pieceIcon(design[k])}</span><span style="font-size:24px">→</span><span style="width:56px;height:50px;flex:none">${pieceIcon(to)}</span><span style="color:var(--green)">−$${save}</span></button>`);
        b.addEventListener('click', () => { design = setPiece(design, to); sfx('snap'); draw(); });
        row.append(b);
      }
      fix.append(row);
      if (ctx.game.money > own) {
        fix.append(button({ label: `Add my money: $${Math.min(gap, ctx.game.money - own)}`, picture: icon('piggy'), cls: 'small lilac', tap: () => { own += Math.min(gap, ctx.game.money - own); sfx('coin'); draw(); } }));
      }
      if (!swaps.length && ctx.game.money <= own) fix.append(el('<p style="font-size:24px">Go back to the workshop and show the bosses again.</p>'));
    } else if (design !== ctx.game.design || own) {
      fix.append(button({ label: 'Start again', cls: 'small', tap: () => { design = ctx.game.design; own = 0; draw(); } }));
    }
    const acts = root.querySelector('.acts');
    acts.append(button({ label: 'Build it!', picture: icon('workshop'), cls: `big go ${gap ? '' : 'pulse'}`, tap: build }));
    if (gap) acts.lastChild.disabled = true;
    acts.append(button({ label: 'Back to workshop', cls: 'small', tap: () => go('workshop') }));
  }

  function build() {
    if (built) return;
    const next = buildPlane(ctx.game, design, ctx.accepted, own);
    if (!next) return;
    built = true;
    update(next);
    ctx.accepted = [];
    // The builders put it together one piece at a time: chuk, chuk, chuk!
    const STEPS = [[], ['wings'], ['wings', 'engines'], ['wings', 'engines', 'nose'], ['wings', 'engines', 'nose', 'paint'], ['wings', 'engines', 'nose', 'paint', 'top'], null];
    const still = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    root.innerHTML = `
<h2 class="logo abs pop" style="left:0;right:0;top:40px;text-align:center;font-size:84px">Chuk chuk <b>chuk!</b></h2>
<span class="abs slot" style="left:212px;top:170px;width:600px;height:518px;rotate:-5deg"></span>
${[[150, 250, 0], [800, 230, 1], [120, 520, 3], [830, 500, 4]].map(([x, y, c], i) => `<span class="abs dance" style="left:${x}px;top:${y}px;width:96px;height:112px;animation-delay:${-i * 0.2}s">${jelly(c, 'wow')}</span><span class="abs wiggle" style="left:${x + (i % 2 ? -44 : 84)}px;top:${y + 6}px;width:58px;height:58px;animation-duration:.35s">${icon('workshop')}</span>`).join('')}
<div class="abs sparks" style="inset:0;pointer-events:none"></div>
<div class="abs center" style="left:0;right:0;bottom:30px"></div>`;
    const slot = root.querySelector('.slot');
    const step = i => {
      const last = i >= STEPS.length - 1;
      slot.innerHTML = plane(design, { popped: last, show: STEPS[i] });
      slot.classList.remove('thump');
      void slot.offsetWidth; // start the little bump again
      slot.classList.add('thump');
      if (!last) {
        sfx(i % 2 ? 'snap' : 'chuk');
        timers.push(setTimeout(() => step(i + 1), 560));
        return;
      }
      sfx('fanfare');
      root.querySelector('.sparks').innerHTML = [[300, 200], [700, 260], [520, 180], [380, 560], [680, 540]].map(([x, y], n) => `<span class="abs" style="left:${x}px;top:${y}px;width:44px;height:44px;animation-delay:${-n * 0.3}s">${sparkleArt(n % 2 ? '#FFD91A' : '#FF2E9A')}</span>`).join('');
      root.querySelector('.center').append(button({ label: 'Wow!', cls: 'big go pulse', tap: () => go('hangar') }));
    };
    step(still ? STEPS.length - 1 : 0);
  }

  draw();
  return () => timers.forEach(clearTimeout);
}

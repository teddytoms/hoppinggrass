// After landing: add up the tickets, stars and tips, give the bosses their
// slices, and see what you keep.

import { BOSSES } from '../data.js';
import { earnings, placeById, canBuy, nextGoal } from '../economy.js';
import { stats } from '../plane.js';
import { backdrop, icon, coin, star, boss, jelly, placePic, dragon } from '../art.js';
import { button, pic, moneyChip } from '../ui.js';
import { sfx } from '../audio.js';

// The pie: each boss who paid for the plane has one slice in ten.
function pie(funders) {
  const wedge = i => {
    const a0 = (i * 36 - 90) * Math.PI / 180, a1 = ((i + 1) * 36 - 90) * Math.PI / 180;
    return `<path d="M0,0 L${(60 * Math.cos(a0)).toFixed(1)},${(60 * Math.sin(a0)).toFixed(1)} A60,60 0 0 1 ${(60 * Math.cos(a1)).toFixed(1)},${(60 * Math.sin(a1)).toFixed(1)} Z" fill="${['#A66A3C', '#FF2E9A', '#C6A2F2'][i]}" stroke="#16161A" stroke-width="2.5"/>`;
  };
  return `<svg viewBox="-66 -66 132 132" class="art"><g filter="url(#cc-wob2)"><circle r="60" fill="#FFD91A" stroke="#16161A" stroke-width="4"/><circle r="60" fill="url(#cc-hatchA)"/>${funders.map((_, i) => wedge(i)).join('')}</g></svg>`;
}

export function render(root, ctx, go) {
  const r = ctx.result, g = ctx.game;
  const place = r && placeById(r.placeId);
  if (!r || !place) { queueMicrotask(() => go('hangar')); return; }
  const e = earnings(r.design, place, r.stars, r.funders, r.extras);
  const s = stats(r.design);
  const timers = [];
  const lines = [
    [coin(), `Tickets: ${s.seats} × $${place.ticket}`, `$${e.tickets}`, ''],
    [star(), `Stars: ${e.stars}`, `+ $${e.stars}`, ''],
    ...(e.tips ? [[icon('comfy'), 'Happy customer tips', `+ $${e.tips}`, '']] : []),
    ...(e.dragon ? [[dragon(), 'A baby dragon came too!', `+ $${e.dragon}`, '']] : []),
    ...(e.rainbow ? [[icon('pretty'), 'Rainbow luck', `+ $${e.rainbow}`, '']] : []),
    ...e.slices.map(sl => [boss(sl.bossId), `${BOSSES[sl.bossId].name}'s slice`, `− $${sl.amount}`, 'minus']),
    [icon('piggy'), 'You keep', `$${e.keep}`, 'keep'],
  ];
  const goal = nextGoal(g);
  root.innerHTML = `${backdrop(place.sky)}
<div class="abs row" style="left:30px;top:18px;gap:14px"><span class="disc" style="width:92px;height:92px;border-radius:50%;overflow:hidden;border:4px solid #16161A;display:block">${placePic(place.id)}</span><h2 class="title card" style="font-size:40px;padding:2px 18px;text-shadow:none;box-shadow:4px 5px 0 var(--ink)">You flew to ${place.name}!</h2></div>
<div class="abs card sum" style="left:40px;top:128px;padding:10px 22px">${lines.map(([p, label, amount, cls], i) => `<div class="line rise ${cls}" style="animation-delay:${i * 0.45}s">${pic(p)}<span>${label}</span><span>${amount}</span></div>`).join('')}</div>
<div class="abs card pop" style="right:40px;top:128px;width:360px;padding:14px;text-align:center;animation-delay:.6s">
  <span style="display:block;width:190px;height:190px;margin:0 auto">${pie(e.slices)}</span>
  <p class="hand" style="font-size:24px;line-height:1.15;margin-top:6px">${e.slices.length ? `Each boss who paid for your plane takes 1 coin in every 10.` : 'No bosses paid for this plane, so the whole pie is yours!'}</p>
</div>
${[0, 1, 2, 3].map(i => `<span class="abs dance" style="right:${50 + i * 86}px;top:470px;width:76px;height:90px;animation-delay:${-i * 0.17}s">${jelly((i * 2 + 1) % 6, 'happy')}</span>`).join('')}
<div class="hud">${moneyChip(g.money)}</div>
<div class="abs row acts" style="left:40px;right:110px;bottom:22px;gap:18px"></div>`;
  lines.forEach((_, i) => timers.push(setTimeout(() => sfx(i === lines.length - 1 ? 'yes' : 'coin'), i * 450 + 150)));
  root.querySelector('.acts').append(
    button({ label: 'Fly again', picture: icon('fly'), cls: 'go', tap: () => go('map') }),
    button({ label: 'Piece shop', picture: icon('shop'), cls: `teal ${goal && canBuy(g, goal) ? 'pulse' : ''}`, tap: () => go('shop') }),
    button({ label: 'Workshop', picture: icon('workshop'), cls: 'lilac', tap: () => go('workshop') }),
  );
  return () => timers.forEach(clearTimeout);
}

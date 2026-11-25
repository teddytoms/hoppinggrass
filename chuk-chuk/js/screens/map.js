// The map of the jellyfish world. Further places need more Fast stars and
// pay more for each ticket.

import { PLACES } from '../data.js';
import { stats } from '../plane.js';
import { canReach, fastNeeded, startFlight } from '../economy.js';
import { backdrop, placePic, icon, coin, cloud } from '../art.js';
import { el, pic, backButton } from '../ui.js';
import { sfx } from '../audio.js';

const AT = { hills: [140, 590], cloud: [300, 400], heart: [460, 580], zigzag: [600, 370], falls: [770, 560], lagoon: [880, 320], city: [660, 150] };

export function render(root, ctx, go, update) {
  const g = ctx.game;
  if (!g.plane) { queueMicrotask(() => go('hangar')); return; }
  const seats = stats(g.plane.design).seats;
  const order = ['hills', 'cloud', 'heart', 'zigzag', 'falls', 'lagoon'].map(id => AT[id].join(',')).join(' ');
  root.innerHTML = `${backdrop('day').replace(/<g transform="translate\(512 470\)[^]*?<\/g>/, '')}
<svg class="abs" viewBox="0 0 1024 768" style="inset:0;width:1024px;height:768px"><polyline points="${order}" fill="none" stroke="#16161A" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round" filter="url(#cc-wob)"/></svg>
<span class="abs float" style="left:380px;top:200px;width:150px;height:100px">${cloud()}</span>
<h2 class="title abs" style="left:110px;top:18px">Where to?</h2>
<div class="hud"><span class="chip">${pic(icon('seat'))}<span>${seats} seats</span></span><span class="chip">${pic(icon('fast'))}<span>${stats(g.plane.design).fast}</span></span></div>`;
  root.append(backButton(() => go('hangar')));
  let gone = false;
  for (const p of PLACES) {
    const ok = canReach(p, g.plane, g);
    const [x, y] = AT[p.id];
    const need = p.needsCity ? `<span class="chip">${pic(icon('lock'))}<span>a dream</span></span>` : `<span class="chip">${pic(icon('lock'))}<span>needs</span>${pic(icon('fast'))}<span>${fastNeeded(p, g.plane)} more</span></span>`;
    const spot = el(`<button class="spot ${ok ? '' : 'far'}" style="left:${x}px;top:${y}px" aria-label="${p.name}${ok ? `, $${p.ticket} a ticket` : ', too far for this plane'}">
<span class="disc ${ok ? 'float' : ''}" style="animation-delay:${-x / 300}s">${placePic(p.id)}</span><span class="name">${p.name}</span>
${ok ? `<span class="chip money">${pic(coin())}<span>$${p.ticket} a ticket</span></span>` : need}</button>`);
    spot.addEventListener('click', () => {
      if (!ok) { sfx('no'); spot.classList.add('wiggle'); setTimeout(() => spot.classList.remove('wiggle'), 900); return; }
      if (gone) return;
      gone = true;
      ctx.place = p.id;
      update(startFlight(ctx.game));
      sfx('tap');
      go('flight');
    });
    root.append(spot);
  }
}

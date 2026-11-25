// The hangar: your plane on the runway, your piggy bank, and where to go next.

import { BOSSES } from '../data.js';
import { plane, planeShadow, backdrop, jelly, icon, cloud, heart, boss, pieceIcon, city } from '../art.js';
import { nextGoal, priceOf } from '../economy.js';
import { el, button, moneyChip } from '../ui.js';
import { sfx } from '../audio.js';

export function goalHtml(game) {
  const goal = nextGoal(game);
  if (!goal) return '';
  const price = priceOf(goal);
  const pct = Math.min(100, Math.round(game.money / price * 100));
  return `<div class="card" style="padding:8px 12px;display:grid;grid-template-columns:64px 150px;gap:10px;align-items:center;box-shadow:4px 5px 0 var(--ink);border-width:3px">
<span style="width:64px;height:56px">${goal === 'city' ? city() : pieceIcon(goal)}</span>
<div><div class="hand" style="font-size:20px">${game.money >= price ? 'You can buy it!' : `$${game.money} of $${price}`}</div><div class="bar"><i style="width:${pct}%"></i></div></div></div>`;
}

export function render(root, ctx, go) {
  const g = ctx.game;
  const design = g.plane?.design ?? g.design;
  root.innerHTML = `${backdrop('day')}
<span class="abs float skycloud" style="left:90px;top:70px;width:230px;height:150px">${cloud()}</span>
<span class="abs float skycloud" style="left:640px;top:190px;width:170px;height:110px;animation-delay:-1.4s">${cloud()}</span>
<span class="abs" style="left:26px;bottom:26px;width:64px;height:56px;rotate:8deg">${heart('#FFD91A')}</span>
${g.cityBuilt ? `<span class="abs float" style="left:30px;top:250px;width:210px;height:198px">${city()}</span>` : ''}
<span class="abs" style="left:250px;top:250px;width:620px;height:540px;rotate:-6deg;translate:26px 34px">${planeShadow(design)}</span>
<span class="abs myplane ${g.plane ? 'float' : ''}" style="left:250px;top:250px;width:620px;height:540px;rotate:-6deg;${g.plane ? '' : 'opacity:.4;filter:grayscale(1)'}">${plane(design, { popped: false })}</span>
<div class="hud">${goalHtml(g)}${moneyChip(g.money)}</div>
<div class="abs row" style="left:110px;top:18px"></div>
<div class="abs row acts" style="left:0;right:0;top:150px;justify-content:center;gap:26px"></div>`;

  // Secrets: tap a cloud for purple rain; tap the plane five times for a loop-the-loop.
  root.querySelectorAll('.skycloud').forEach(cl => cl.addEventListener('click', () => {
    sfx('poof');
    const box = cl.getBoundingClientRect(), base = root.getBoundingClientRect();
    for (let i = 0; i < 14; i++) {
      const drop = el(`<i class="raindrop" style="left:${(box.left - base.left) / ctx.scale + 20 + i * 13}px;top:${(box.bottom - base.top) / ctx.scale - 34}px;animation-delay:${(i % 5) * 0.12}s"></i>`);
      root.append(drop);
      setTimeout(() => drop.remove(), 2000);
    }
  }));
  let taps = 0;
  const mine = root.querySelector('.myplane');
  mine.addEventListener('click', () => {
    if (!g.plane || ++taps < 5) return;
    taps = 0;
    sfx('whoosh');
    mine.classList.remove('float');
    mine.classList.add('loop');
    setTimeout(() => { mine.classList.remove('loop'); mine.classList.add('float'); }, 1300);
  });

  const me = el(`<button class="btn small round backbtn" aria-label="Change player" style="padding:6px">${jelly(ctx.player?.jelly ?? 0)}</button>`);
  me.addEventListener('click', () => go('who'));
  root.append(me);

  if (g.plane) {
    const fund = g.plane.funders;
    root.append(el(`<div class="abs chip" style="left:110px;top:26px;padding:4px 14px">${fund.length ? fund.map(b => `<span class="pic" style="width:44px;height:52px" title="${BOSSES[b].name}">${boss(b)}</span>`).join('') + `<span style="font-size:20px">get a slice</span>` : `<span style="font-size:20px;padding:6px">All the ticket money is yours!</span>`}</div>`));
  } else {
    root.append(el(`<div class="abs bubble pop" style="left:330px;top:300px;width:max-content;font-size:30px;rotate:-3deg">Design your first plane!</div>`));
  }

  const acts = root.querySelector('.acts');
  acts.append(
    button({ label: 'Workshop', picture: icon('workshop'), cls: `big lilac ${g.plane ? '' : 'pulse'}`, tap: () => go('workshop') }),
    ...(g.plane ? [button({ label: 'Fly!', picture: icon('fly'), cls: 'big go pulse', tap: () => go('map') })] : []),
    button({ label: 'Piece shop', picture: icon('shop'), cls: 'big teal', tap: () => go('shop') }),
  );
}

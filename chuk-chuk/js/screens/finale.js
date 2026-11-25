// The big dream comes true: the flying jellyfish city rises, everyone moves
// in, and the three bosses dance.

import { BOSS_ORDER } from '../data.js';
import { city, jelly, boss, sparkleArt, heart } from '../art.js';
import { button } from '../ui.js';
import { sfx } from '../audio.js';

export function render(root, ctx, go) {
  root.classList.add('night');
  const sparks = Array.from({ length: 26 }, (_, i) => `<span class="abs" style="left:${(i * 137) % 980 + 10}px;top:${(i * 89) % 560 + 20}px;width:${18 + (i % 4) * 8}px;height:${18 + (i % 4) * 8}px;animation-delay:${-(i % 9) * 0.2}s">${sparkleArt(['#FFF6B0', '#fff', '#FF8FE0', '#39F0D0'][i % 4])}</span>`).join('');
  root.innerHTML = `${sparks}
<h2 class="logo abs pop" style="left:0;right:0;top:22px;text-align:center;font-size:62px;rotate:-2deg">You built the <b>Flying Jellyfish City!</b></h2>
<span class="abs cityrise" style="left:262px;top:120px;width:500px;height:472px;animation:cityrise 3.2s cubic-bezier(.2,.8,.3,1) both"><span class="float" style="display:block;width:100%;height:100%">${city()}</span></span>
${[0, 1, 2, 3, 4, 5].map(i => `<span class="abs float" style="left:${[70, 170, 790, 880, 120, 850][i]}px;top:${[200, 380, 180, 360, 520, 520][i]}px;width:84px;height:100px;animation-delay:${-i * 0.5}s">${jelly(i, 'wow')}</span>`).join('')}
${BOSS_ORDER.map((b, i) => `<span class="abs dance" style="left:${170 + i * 150}px;bottom:16px;width:120px;height:144px;animation-delay:${-i * 0.23}s">${boss(b, 'happy')}</span>`).join('')}
<span class="abs" style="left:24px;top:24px;width:64px;height:56px">${heart('#FF2E9A')}</span>
<div class="abs" style="right:110px;bottom:22px"></div>`;
  root.lastElementChild.append(button({ label: 'Keep playing', cls: 'big go pulse', tap: () => go('hangar') }));
  sfx('fanfare');
}

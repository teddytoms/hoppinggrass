// The sticker book: every sticker the player has won, and grey outlines of
// the ones still to win, so they are goals to come back for.

import { STICKERS } from '../data.js';
import { monster, waiter, food, item, decor } from '../art.js';

const PICS = {
  'first-sale': () => item('coin'),
  'juice-5': () => food('orange-juice'),
  'pizza-5': () => food('pizza'),
  'pie-5': () => food('pie'),
  'lassi-5': () => food('mango-lassi'),
  'bella-secret': () => monster('bella', 'love'),
  'ella-secret': () => monster('ella', 'yuck'),
  'tips-5': () => item('star'),
  'hot-seller': () => item('sun'),
  'decor-1': () => decor('balloons'),
  'decor-all': () => decor('disco'),
  'meet-all': () => monster('fife', 'happy'),
  'save-100': () => item('piggy'),
  'best-day-50': () => item('twinkle'),
  'all-recipes': () => item('tick'),
  'days-10': () => waiter(),
};

export const stickerPic = id => PICS[id]?.() ?? item('star');
export const stickerName = id => STICKERS.find(s => s.id === id)?.name ?? '';

export function render(stage, ctx, go) {
  const won = ctx.game.stickers;
  const cells = STICKERS.map(s => {
    const has = won.includes(s.id);
    return `<div class="b-cell${has ? ' won' : ''}" aria-label="${s.name}${has ? ', won' : ', not won yet'}">
<span class="b-disc"><span class="pic">${stickerPic(s.id)}</span></span><span class="b-name">${s.name}</span></div>`;
  }).join('');
  stage.innerHTML = `<div class="b-wrap">
<div class="b-top"><button class="btn white" data-back>Back</button><h1 class="baloo">My sticker book</h1>
<div class="b-count card baloo"><span class="pic">${item('star')}</span>${won.length} of ${STICKERS.length}</div></div>
<div class="b-grid card">${cells}</div></div>`;
  stage.querySelector('[data-back]').addEventListener('click', () => go(ctx.back === 'dayend' ? 'dayend' : 'restaurant'));
}

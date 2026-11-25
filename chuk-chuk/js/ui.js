// Little helpers the screens share for making buttons and labels.

import { icon, coin } from './art.js';
import { sfx } from './audio.js';

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const pic = (markup, cls = '') => `<span class="pic ${cls}">${markup}</span>`;

// A button with a picture and a word. `tap` runs once per press.
export function button({ label = '', picture = '', cls = '', tap, aria }) {
  const b = el(`<button class="btn ${cls}">${picture ? pic(picture) : ''}${label ? `<span>${label}</span>` : ''}</button>`);
  if (aria || !label) b.setAttribute('aria-label', aria ?? '');
  b.addEventListener('click', () => { sfx('tap'); tap?.(b); });
  return b;
}

export const moneyChip = (amount, cls = 'money') => `<span class="chip ${cls}">${pic(coin())}<span>$${amount}</span></span>`;

export const backButton = tap => { const b = button({ picture: icon('back'), cls: 'small round backbtn', tap, aria: 'Back' }); return b; };

// A row of filled and empty dots, for Fast, Pretty and Comfy stars.
export const pips = (n, max) => `<span class="pips">${Array.from({ length: max }, (_, i) => `<i class="pip ${i < n ? 'on' : ''}"></i>`).join('')}</span>`;

export const GIVES = [['fast', 'fast'], ['pretty', 'pretty'], ['comfy', 'comfy'], ['seats', 'seat']];
// What a piece adds, as little pictures with numbers.
export const givesHtml = piece => `<span class="gives">${GIVES.filter(([f]) => piece[f] > 0).map(([f, i]) => `<span>${pic(icon(i))}${piece[f]}</span>`).join('')}</span>`;

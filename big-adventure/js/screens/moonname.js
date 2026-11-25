// "What is my name?" The moon monster asks the chef for a name, the first time
// the chef lands on the moon. Typing one is optional: "Moony is fine" keeps
// the name it came with. Either way the game goes on to the moon diner.
// The name is typed by the player: it only ever reaches the page as an
// input's value or through escaping. Styles are in css/friends.css.

import { MONSTERS } from '../data.js';
import { setMoonName, MOON_NAME_LENGTH } from '../state.js';
import { fill } from '../friends.js';
import { monster, scene } from '../art.js';
import { sfx } from '../audio.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

export function render(stage, ctx, go, update) {
  const plain = MONSTERS.moon?.name ?? 'Moony';
  stage.innerHTML = `<div class="ad-page mn-wrap">
<span class="pic mn-scene">${scene('moon')}</span>
<div class="cm-caption ad-caption">Meanwhile, on the moon...</div>
<div class="mn-panel cm-panel">
<span class="pic mn-pic">${monster('moon', 'happy')}</span>
<div class="mn-right">
<div class="cm-bubble mn-say">${esc(fill('Hello, {name}! What is my name?', ctx.chefName()))}</div>
<label class="mn-label">Type a name, if you like
<input class="w-input mn-input" maxlength="${MOON_NAME_LENGTH}" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="done" placeholder="${esc(plain)}"></label>
<div class="mn-buttons"><button class="btn pink hint mn-ok" data-name>That's the name!</button>
<button class="btn white mn-plain" data-plain>${esc(plain)} is fine</button></div></div></div></div>`;

  const input = stage.querySelector('.mn-input');
  let done = false;
  // Once only, however fast the buttons are tapped.
  function finish(name) {
    if (done) return;
    done = true;
    ctx.moonAsked();
    update(setMoonName(ctx.game, name.trim() || plain));
    sfx('boing');
    go('place');
  }

  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    if ('name' in b.dataset) finish(input.value);
    else if ('plain' in b.dataset) finish(plain);
  });
  // "Done" on the iPad keyboard closes the keyboard; the big button says yes.
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
}

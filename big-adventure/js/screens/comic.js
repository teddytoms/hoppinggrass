// Reads one comic (ctx.comic.id, set by ctx.playComic) a panel at a time.
// Every tap on the big button, or on the page, pops in the next panel with a sound.
// After the last panel the button says "Let's go!"; tapping it marks the comic as
// read and calls the `then` it was given, once.

import { COMICS } from '../comics.js';
import { renderPage } from '../comic.js';
import { seeComic } from '../state.js';
import { sfx } from '../audio.js';

const PAUSE = 300; // ms: a fast double tap must not skip a panel or finish twice

export function render(stage, ctx, go, update) {
  const { id, then } = ctx.comic ?? {};
  const pages = COMICS[id] ?? [];
  let page = -1, shown = 0, last = -Infinity, done = false;

  stage.innerHTML = `<div class="ad-page cv-wrap">
<div class="cv-page"></div>
<div class="cv-bar"><button class="btn pink cv-next hint" data-next>Next</button></div></div>`;
  const holder = stage.querySelector('.cv-page');
  const button = stage.querySelector('.cv-next');
  const panels = () => [...holder.querySelectorAll('.comic-panel')];

  function words() {
    if (shown < panels().length) return 'Next';
    return page < pages.length - 1 ? 'Next page' : "Let's go!";
  }

  function drawPage(n) {
    page = n;
    shown = 0;
    // One page in the document at a time: panels of the same size share their clip ids.
    holder.innerHTML = renderPage(pages[n], ctx.vars());
    panels().forEach(p => p.classList.add('is-hidden'));
  }

  function reveal() {
    const p = panels()[shown];
    if (p) {
      p.classList.remove('is-hidden');
      p.classList.add('pop');
      sfx('page');
      shown++;
    }
    button.textContent = words();
  }

  function finish() {
    if (done) return;
    done = true;
    update(seeComic(ctx.game, id));
    then?.();
  }

  function advance() {
    if (done) return;
    const now = performance.now();
    if (now - last < PAUSE) return;
    last = now;
    if (!pages.length) { finish(); return; }
    if (shown < panels().length) reveal();
    else if (page < pages.length - 1) { drawPage(page + 1); reveal(); }
    else finish();
  }

  holder.addEventListener('click', advance);
  button.addEventListener('click', advance);

  if (pages.length) {
    drawPage(0);
    last = performance.now();
    reveal();
  } else {
    button.textContent = "Let's go!";
  }
}

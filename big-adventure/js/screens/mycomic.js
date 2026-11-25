// "My comic": a shelf of every comic read so far. Tap one to read it again.

import { COMICS } from '../comics.js';
import { CHAPTERS } from '../data.js';
import { scene, vehicle, item } from '../art.js';
import { sfx } from '../audio.js';

// A title and a small picture for each comic id.
function about(id) {
  const m = /^ch(\d+)-(open|end)$/.exec(id);
  const chapter = m ? CHAPTERS.find(c => c.id === Number(m[1])) : null;
  if (id === 'cover') return { title: 'The cover', pic: vehicle('balloon') };
  if (id === 'ending') return { title: 'The Golden Spoon', pic: item('golden-spoon'), cls: ' is-gold' };
  if (chapter && m[2] === 'open') return { title: `${chapter.id}. ${chapter.title}`, pic: scene(chapter.place) };
  if (chapter) return { title: `${chapter.id}. Off we go!`, pic: vehicle(chapter.travel === 'home' ? 'rocket' : chapter.travel) };
  return { title: id, pic: vehicle('balloon') };
}

export function render(stage, ctx, go) {
  const seen = Object.keys(COMICS).filter(id => ctx.game.comicsSeen.includes(id));
  const cards = seen.map(id => {
    const a = about(id);
    return `<button class="mc-card" data-read="${id}"><span class="pic mc-pic${a.cls ?? ''}">${a.pic}</span><span class="mc-title">${a.title}</span></button>`;
  }).join('');
  stage.innerHTML = `<div class="ad-page mc-wrap">
<div class="cm-caption ad-caption">Chef's bookshelf...</div>
<h1 class="cm-title mc-h">My comic</h1>
<div class="mc-shelf">${cards || '<p class="mc-none">No comics yet.</p>'}</div>
<button class="btn white mc-back" data-back>Back</button></div>`;
  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    if ('back' in b.dataset) { go(ctx.back || 'place'); return; }
    const id = b.dataset.read;
    if (id && COMICS[id]) { sfx('pop'); ctx.playComic(id, () => go('mycomic')); }
  });
}

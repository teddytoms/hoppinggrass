// Who is playing? One card per child, each with their own saved game.

import { loadPlayers, savePlayers, addPlayer, removePlayer, displayName, MAX_PLAYERS, NAME_LENGTH, JELLY_COUNT } from '../players.js';
import { jelly, heart, plane, icon } from '../art.js';
import { STARTER } from '../data.js';
import { el, button, pic } from '../ui.js';
import { sfx } from '../audio.js';

const DEMO = { ...STARTER, body: 'long', wings: 'swoosh', engines: 'turbo', nose: 'pointy', paint: 'rainbow', top: 'popup' };

export function render(root, ctx, go) {
  root.classList.add('pad');
  let players = ctx.players ?? loadPlayers();
  ctx.players = players;
  let grownUp = false;

  const corners = `<span class="abs" style="left:24px;top:24px;width:70px;height:62px;rotate:-12deg">${heart('#FFAD96')}</span><span class="abs" style="right:24px;top:24px;width:70px;height:62px;rotate:10deg">${heart('#2433B8')}</span><span class="abs" style="left:24px;bottom:24px;width:70px;height:62px;rotate:8deg">${heart('#FFD91A')}</span>`;

  function list() {
    root.innerHTML = `${corners}
<div class="abs" style="left:0;right:0;top:36px;display:flex;justify-content:center;align-items:center;gap:26px">
  <span style="width:250px;height:190px;rotate:-10deg" class="float logoplane">${plane(DEMO, { popped: true })}</span>
  <h1 class="logo">Chuk <b>Chuk</b></h1>
</div>
<h2 class="title abs" style="left:0;right:0;top:250px;text-align:center">Who is playing?</h2>
<div class="abs center" style="left:0;right:0;top:330px"><div class="players"></div></div>
<div class="abs" style="left:0;right:0;bottom:14px;text-align:center"><button class="link grown">${grownUp ? 'Done' : 'Grown-ups'}</button></div>`;
    // A secret: tap the name three times and the plane zooms round the screen.
    let logoTaps = 0;
    root.querySelector('.logo').addEventListener('click', () => {
      if (++logoTaps % 3) return;
      sfx('whoosh');
      const pl = root.querySelector('.logoplane');
      pl.classList.remove('float');
      pl.classList.add('zoom');
      setTimeout(() => { pl.classList.remove('zoom'); pl.classList.add('float'); }, 1600);
    });
    const box = root.querySelector('.players');
    players.forEach((p, i) => {
      const card = el(`<button class="card pcard ${i % 2 ? 'tilt-r' : 'tilt-l'}">${pic(jelly(p.jelly))}<span>${displayName(p, i).replace(/[<>&]/g, '')}</span></button>`);
      card.addEventListener('click', () => { if (!grownUp) { sfx('yes'); ctx.choose(p); } });
      if (grownUp) {
        const rm = button({ label: 'Remove', cls: 'small pink', tap: () => confirmRemove(p, i) });
        rm.style.cssText = 'position:absolute;left:50%;bottom:-30px;translate:-50% 0';
        card.style.position = 'relative';
        card.append(rm);
      }
      box.append(card);
    });
    if (players.length < MAX_PLAYERS && !grownUp) {
      const add = el(`<button class="card pcard new">${pic(icon('plus'))}<span>New player</span></button>`);
      add.addEventListener('click', () => { sfx('tap'); create(); });
      box.append(add);
    }
    root.querySelector('.grown').addEventListener('click', () => {
      if (grownUp) { grownUp = false; list(); } else askSum(1);
    });
  }

  function create() {
    let chosen = players.length % JELLY_COUNT;
    root.innerHTML = `${corners}<div class="abs col center" style="inset:0;gap:26px">
<h2 class="title">Pick your jellyfish</h2><div class="row picks"></div>
<input class="name" maxlength="${NAME_LENGTH}" placeholder="Your name" autocomplete="off" autocapitalize="words" spellcheck="false" aria-label="Your name (you can leave it empty)">
<div class="row acts"></div></div>`;
    const picks = root.querySelector('.picks');
    for (let i = 0; i < JELLY_COUNT; i++) {
      const b = el(`<button class="pick ${i === chosen ? 'on' : ''}" aria-label="Jellyfish ${i + 1}">${jelly(i)}</button>`);
      b.addEventListener('click', () => { chosen = i; sfx('tap'); picks.querySelectorAll('.pick').forEach((x, j) => x.classList.toggle('on', j === i)); });
      picks.append(b);
    }
    const acts = root.querySelector('.acts');
    acts.append(
      button({ picture: icon('back'), cls: 'round', aria: 'Back', tap: list }),
      button({ label: "Let's go!", cls: 'go big', tap: () => {
        players = addPlayer(players, { name: root.querySelector('.name').value, jelly: chosen });
        ctx.players = players;
        savePlayers(players);
        sfx('yes');
        ctx.choose(players.at(-1));
      } }),
    );
  }

  // Removing a player is for grown-ups: a sum first, then "Are you sure?".
  function askSum(round = 1) {
    const a = (round === 1 ? 6 : 13) + Math.floor(Math.random() * 6), b = (round === 1 ? 5 : 8) + Math.floor(Math.random() * 6);
    const answers = [a + b, a + b + 2, a + b - 3].sort(() => Math.random() - 0.5);
    root.innerHTML = `<div class="abs col center" style="inset:0;gap:30px"><h2 class="title">Grown-ups: what is ${a} + ${b}?</h2><div class="row opts"></div></div>`;
    const opts = root.querySelector('.opts');
    for (const n of answers) opts.append(button({ label: String(n), cls: 'big', tap: () => { if (n !== a + b) return list(); if (round === 1) return askSum(2); grownUp = true; list(); } }));
    opts.append(button({ picture: icon('back'), cls: 'round', aria: 'Back', tap: list }));
  }

  function confirmRemove(p, i) {
    root.innerHTML = `<div class="abs col center" style="inset:0;gap:30px"><span style="width:140px;height:160px">${jelly(p.jelly)}</span><h2 class="title">Remove ${displayName(p, i).replace(/[<>&]/g, '')} and their saved game?</h2><div class="row opts"></div></div>`;
    const opts = root.querySelector('.opts');
    opts.append(
      button({ label: 'No, keep it', cls: 'go big', tap: list }),
      button({ label: 'Yes, remove', cls: 'pink', tap: () => { players = removePlayer(players, p.id); ctx.players = players; ctx.forget(p.id); savePlayers(players); if (!players.length) grownUp = false; list(); } }),
    );
  }

  list();
}

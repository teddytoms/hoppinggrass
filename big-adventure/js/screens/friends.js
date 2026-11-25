// "Friends": a comic page of every monster met so far. Each card shows the
// monster, its name, its three hearts and what it is like, its favourite food
// once that has been found out ("?" until then), and its present once given.
// Tap a card for a big look: the fact card opens with full hearts.
// Styles are in css/friends.css.

import { FOODS, MONSTERS } from '../data.js';
import { monstersHere, monsterName } from '../chapters.js';
import { FRIENDS, HEART_STEPS, hearts, visits, knowsFavourite } from '../friends.js';
import { monster, food, item } from '../art.js';
import { sfx } from '../audio.js';
import { heartsRow } from './hud.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const COLOURS = ['#FFD3DF', '#CFE9FF', '#D8F5E9', '#FFF3C4', '#E4DBFF', '#FFE0C2', '#DDF3FF'];

// Everyone who has come along so far, in the order they joined, plus anyone
// the save says has been served.
function met(game) {
  const here = monstersHere(game);
  const served = Array.isArray(game?.counts?.met) ? game.counts.met : [];
  return Object.keys(FRIENDS).filter(id => MONSTERS[id] && (here.includes(id) || served.includes(id)));
}

const given = (game, id) => Array.isArray(game?.gifts) && game.gifts.includes(id);
const fact = (id, name) => FRIENDS[id].fact.replace(/^This shy friend/, name);

function favourite(game, id, cls) {
  const f = MONSTERS[id].favourite;
  return knowsFavourite(game, id) && FOODS[f]
    ? `<span class="fr-chip ${cls}" aria-label="Loves ${esc(FOODS[f].name)} best"><span class="pic">${food(f)}</span></span>`
    : `<span class="fr-chip is-unknown ${cls}" aria-label="Favourite food: not found out yet">?</span>`;
}

function keepsake(game, id, cls) {
  return given(game, id)
    ? `<span class="fr-chip ${cls}" aria-label="${esc(FRIENDS[id].keepsake.name)}"><span class="pic">${item(FRIENDS[id].keepsake.id)}</span></span>`
    : `<span class="fr-chip is-unknown ${cls}" aria-label="No present yet">?</span>`;
}

function card(game, id, i) {
  const name = esc(monsterName(id, game));
  return `<button class="fr-card cm-panel" data-friend="${id}" style="background:${COLOURS[i % COLOURS.length]}">
<span class="pic fr-pic">${monster(id, hearts(game, id) ? 'happy' : 'idle')}</span>
<span class="fr-name">${name}</span>
${heartsRow(game, id)}
<span class="fr-trait">${esc(FRIENDS[id].trait)}</span>
<span class="fr-chips">${favourite(game, id, 'is-fav')}${keepsake(game, id, 'is-gift')}</span></button>`;
}

// How many more happy plates fill the next heart (0 when all are full).
function toNextHeart(game, id) {
  const n = visits(game, id);
  const next = HEART_STEPS.find(step => n < step);
  return next ? next - n : 0;
}

function detail(game, id, i) {
  const f = FRIENDS[id];
  const name = esc(monsterName(id, game));
  const fav = MONSTERS[id].favourite;
  const knows = knowsFavourite(game, id) && FOODS[fav];
  const full = hearts(game, id) === HEART_STEPS.length;
  const left = toNextHeart(game, id);
  return `<div class="fr-over" data-detail><div class="fr-big cm-panel" style="background:${COLOURS[i % COLOURS.length]}">
<div class="fr-big-left"><span class="pic fr-big-pic">${monster(id, 'happy')}</span>${heartsRow(game, id)}</div>
<div class="fr-big-right">
<h2 class="fr-big-name">${name}</h2>
<p class="fr-big-trait">${esc(f.trait)}</p>
<div class="fr-line">${favourite(game, id, 'is-fav')}<span>${knows ? `Loves ${esc(FOODS[fav].name.toLowerCase())} best!` : 'Favourite food? Find out!'}</span></div>
<div class="fr-line">${keepsake(game, id, 'is-gift')}<span>${given(game, id) ? `${esc(f.keepsake.name)}, a present for you!` : left ? `${left} more happy ${left === 1 ? 'plate' : 'plates'} for a heart!` : 'A present is coming!'}</span></div>
<div class="pl-fact fr-fact${full ? '' : ' is-shut'}"><b>${name}'s secret</b><span>${full ? esc(fact(id, monsterName(id, game))) : 'Fill three hearts to find out!'}</span></div>
<button class="btn pink fr-close" data-close>OK!</button></div></div></div>`;
}

export function render(stage, ctx, go) {
  const game = ctx.game;
  const ids = met(game);
  stage.innerHTML = `<div class="ad-page fr-wrap">
<div class="cm-caption ad-caption">Meanwhile, among friends...</div>
<h1 class="cm-title fr-h">Friends</h1>
<div class="fr-grid" data-count="${ids.length}">${ids.map((id, i) => card(game, id, i)).join('') || '<p class="mc-none">No friends yet. Soon!</p>'}</div>
<button class="btn white fr-back" data-back>Back</button></div>`;

  let leaving = false;
  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    const d = b.dataset;
    if ('back' in d) {
      if (leaving) return;
      leaving = true;
      go('place');
    } else if ('close' in d) {
      stage.querySelector('[data-detail]')?.remove();
    } else if (d.friend && FRIENDS[d.friend] && !stage.querySelector('[data-detail]')) {
      stage.querySelector('.fr-wrap').insertAdjacentHTML('beforeend', detail(game, d.friend, ids.indexOf(d.friend)));
      sfx('pop');
    }
  });
}

// "Who is playing?" Several children can share one iPad. Each picks their
// card and gets their own saved game. A new player types the chef's name
// (optional), picks one of the two chef looks and a card colour. Removing a player is for grown-ups:
// it sits behind a sum and an "Are you sure?".

import { MAX_PLAYERS, NAME_LENGTH, CARD_COLOURS, PICTURES, loadPlayers, savePlayers, addPlayer, removePlayer, displayName } from '../players.js';
import { chef } from '../art.js';
import { sfx } from '../audio.js';

const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

export function render(stage, ctx) {
  let players = loadPlayers();
  let view = 'list';           // 'list', 'new', 'gate' or 'manage'
  let draft = null;            // the player being made: { pic, colour, name }
  let sum = null;              // the grown-ups' question: { a, b, answers }
  let asking = null;           // the player a grown-up is about to remove

  const card = (p, i, managing) => `<div class="w-slot">
<button class="w-card" data-play="${p.id}" style="background:${CARD_COLOURS[p.colour]}"${managing ? ' disabled' : ''}>
<span class="pic">${chef('spoon', p.pic)}</span><span class="w-name baloo">${esc(displayName(p, i))}</span></button>
${managing ? `<button class="btn white w-remove" data-remove="${p.id}">Remove</button>` : ''}</div>`;

  function listView(managing) {
    const add = !managing && players.length < MAX_PLAYERS
      ? `<div class="w-slot"><button class="w-card w-add${players.length ? '' : ' hint'}" data-new><span class="w-plus baloo">+</span><span class="w-name baloo">New player</span></button></div>`
      : '';
    const foot = managing ? '<button class="btn mint w-done" data-done>Done</button>'
      : players.length ? '<button class="w-grown" data-gate>Grown-ups</button>' : '';
    return `<div class="cm-caption ad-caption">${managing ? 'Grown-ups at work...' : 'Meanwhile, at the food cart...'}</div>
<h1 class="cm-title w-title">${managing ? 'Remove a player' : 'Who is playing?'}</h1>
<div class="w-cards">${players.map((p, i) => card(p, i, managing)).join('')}${add}</div>${foot}`;
  }

  function newView() {
    const pics = PICTURES.map((id, i) => `<button class="w-pick${draft.pic === id ? ' on' : ''}" data-pic="${id}" aria-label="Chef look ${i + 1}" aria-pressed="${draft.pic === id}"><span class="pic">${chef('spoon', id)}</span></button>`).join('');
    const colours = CARD_COLOURS.map((c, i) => `<button class="w-colour${draft.colour === i ? ' on' : ''}" data-colour="${i}" style="background:${c}" aria-label="Colour ${i + 1}" aria-pressed="${draft.colour === i}"></button>`).join('');
    return `<div class="cm-caption ad-caption">A new chef joins the adventure...</div>
<h1 class="cm-title w-title">New player</h1>
<div class="w-new cm-panel" style="background:${CARD_COLOURS[draft.colour]}">
<label class="w-label baloo">Chef's name, if you like <input class="w-input" maxlength="${NAME_LENGTH}" autocomplete="off" autocapitalize="words" spellcheck="false" value="${esc(draft.name)}"></label>
<h2 class="baloo">Pick your chef</h2><div class="w-row">${pics}</div>
<h2 class="baloo">Pick your colour</h2><div class="w-row">${colours}</div>
</div>
<div class="w-buttons"><button class="btn white" data-cancel>Back</button><button class="btn mint w-go hint" data-create>Play!</button></div>`;
  }

  function gateView() {
    return `<div class="cm-caption ad-caption">Just a quick question...</div>
<h1 class="cm-title w-title">Grown-ups only</h1>
<div class="w-gate cm-panel"><h2 class="baloo">What is ${sum.a} + ${sum.b}?</h2>
<div class="w-row">${sum.answers.map(n => `<button class="btn white" data-answer="${n}">${n}</button>`).join('')}</div></div>
<div class="w-buttons"><button class="btn white" data-cancel>Back</button></div>`;
  }

  function draw() {
    const mute = stage.querySelector('.mute');
    const body = view === 'new' ? newView() : view === 'gate' ? gateView() : listView(view === 'manage');
    const ask = asking ? `<div class="s-ask"><div class="s-ask-box cm-panel">
<h2 class="baloo">Remove ${esc(displayName(asking, players.indexOf(asking)))}?</h2><p>Their coins, plates and recipes will be gone for good.</p>
<div class="s-ask-buttons"><button class="btn mint" data-keep>No, keep it</button><button class="btn white" data-really>Yes, remove</button></div>
</div></div>` : '';
    stage.innerHTML = `<div class="ad-page w-wrap">${body}</div>${ask}`;
    if (mute) stage.append(mute);
  }

  const keepName = () => { if (draft) draft.name = stage.querySelector('.w-input')?.value ?? draft.name; };

  stage.addEventListener('click', e => {
    const b = e.target.closest?.('button');
    if (!b) return;
    const d = b.dataset;
    if (d.play) {
      const p = players.find(x => x.id === d.play);
      if (p) ctx.choose(p);
      return;
    }
    if ('new' in d) {
      // Start on a monster nobody has picked yet, so two players are easy to tell apart.
      const free = PICTURES.find(id => !players.some(p => p.pic === id)) ?? PICTURES[0];
      draft = { pic: free, colour: players.length % CARD_COLOURS.length, name: '' };
      view = 'new';
    } else if (d.pic) { keepName(); draft.pic = d.pic; sfx('pop'); }
    else if (d.colour) { keepName(); draft.colour = Number(d.colour); sfx('pop'); }
    else if ('create' in d) {
      keepName();
      const next = addPlayer(players, draft);
      if (next.length > players.length) {
        players = next;
        savePlayers(players);
        ctx.choose(players.at(-1));
        return;
      }
      view = 'list';
    } else if ('cancel' in d) { view = 'list'; draft = null; }
    else if ('gate' in d) {
      const a = 4 + Math.floor(Math.random() * 5), bb = 5 + Math.floor(Math.random() * 5);
      sum = { a, b: bb, answers: [a + bb - 2, a + bb, a + bb + 3].sort(() => Math.random() - 0.5) };
      view = 'gate';
    } else if (d.answer) { view = Number(d.answer) === sum.a + sum.b ? 'manage' : 'list'; }
    else if ('done' in d) { view = 'list'; }
    else if (d.remove) { asking = players.find(p => p.id === d.remove) ?? null; }
    else if ('keep' in d) { asking = null; }
    else if ('really' in d && asking) {
      players = removePlayer(players, asking.id);
      savePlayers(players);
      asking = null;
      if (!players.length) view = 'list';
    } else return;
    draw();
  });

  draw();
}

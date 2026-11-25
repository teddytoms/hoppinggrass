// The workshop: drag (or tap) pieces onto the plane, like Lego.

import { KINDS, KIND_NAMES, PIECES, STICKER_IDS, MAX_STICKERS } from '../data.js';
import { stats, buildCost, setPiece, addSticker, removeSticker } from '../plane.js';
import { plane, pieceIcon, icon, sticker, heart } from '../art.js';
import { el, button, pic, moneyChip, backButton, pips, givesHtml } from '../ui.js';
import { sfx } from '../audio.js';

const VB_W = 220, VB_H = 190, ZONE_W = 640, ZONE_H = 440, ZONE_X = 90, ZONE_Y = 70;
const K = Math.min(ZONE_W / VB_W, ZONE_H / VB_H); // stage pixels for one unit of the plane picture
const MAXES = { fast: 8, pretty: 12, comfy: 5 };
const SPOTS = [[-0.35, -0.12], [0.1, 0.12], [0.35, -0.1], [-0.1, 0.14], [-0.5, 0.08], [0.22, -0.02]];

export function render(root, ctx, go, update) {
  root.classList.add('pad');
  let tab = 'body';
  let ghost = null;
  let dragBusy = false; // one drag at a time, whichever card it started on

  const applyPiece = id => {
    const next = setPiece(ctx.game.design, id);
    if (next === ctx.game.design) return;
    update({ ...ctx.game, design: next });
    sfx('snap');
    draw();
  };
  const applySticker = (id, x, y) => {
    const d = ctx.game.design;
    if (d.stickers.length >= MAX_STICKERS) { sfx('no'); return; }
    const free = SPOTS.find(([px, py]) => !d.stickers.some(s => s.x === px && s.y === py)) ?? SPOTS[0];
    const [sx, sy] = x === undefined ? free : [x, y];
    update({ ...ctx.game, design: addSticker(d, id, sx, sy) });
    sfx('snap');
    draw();
    // A secret: one of every sticker makes you a sticker master.
    const kinds = list => new Set(list.map(s => s.id)).size;
    if (kinds(ctx.game.design.stickers) === STICKER_IDS.length && kinds(d.stickers) < STICKER_IDS.length) {
      sfx('fanfare');
      root.append(el('<div class="abs bubble pop" style="left:300px;top:20px;width:max-content;font-size:30px;rotate:-3deg;z-index:40">Sticker master!</div>'));
      for (let i = 0; i < 12; i++) root.append(el(`<span class="coin-fly" style="left:400px;top:280px;--dx:${Math.round(Math.cos(i * 0.52) * 300)}px;--dy:${Math.round(Math.sin(i * 0.52) * 240)}px;animation-duration:1.2s">${sticker(STICKER_IDS[i % 4])}</span>`));
    }
  };

  // Where on the stage a finger is.
  const stagePoint = e => {
    const r = root.getBoundingClientRect();
    return [(e.clientX - r.left) / ctx.scale, (e.clientY - r.top) / ctx.scale];
  };
  const dropGhost = () => { ghost?.remove(); ghost = null; dragBusy = false; root.querySelector('.dropzone')?.classList.remove('hot'); };

  // A card that can be dragged onto the plane, or just tapped.
  function draggable(card, picture, drop) {
    let start = null, moved = false;
    const overZone = (x, y) => x > ZONE_X && x < ZONE_X + ZONE_W && y > ZONE_Y && y < ZONE_Y + ZONE_H;
    card.addEventListener('pointerdown', e => {
      if (start || dragBusy) return; // a second finger does nothing
      dragBusy = true;
      start = { id: e.pointerId, at: stagePoint(e) };
      moved = false;
      card.setPointerCapture?.(e.pointerId);
    });
    card.addEventListener('pointermove', e => {
      if (!start || e.pointerId !== start.id) return;
      const [x, y] = stagePoint(e);
      if (!moved && Math.hypot(x - start.at[0], y - start.at[1]) < 12) return;
      if (!moved) { moved = true; ghost = el(`<span class="ghost">${picture}</span>`); root.append(ghost); }
      if (!ghost) return; // the screen was redrawn under the finger
      ghost.style.left = `${x}px`;
      ghost.style.top = `${y}px`;
      root.querySelector('.dropzone').classList.toggle('hot', overZone(x, y));
    });
    const end = (e, cancelled) => {
      if (!start || e.pointerId !== start.id) return;
      const [x, y] = stagePoint(e);
      const wasDrag = moved;
      start = null;
      dropGhost();
      if (cancelled) return;
      const r = card.getBoundingClientRect();
      const onCard = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!wasDrag || (onCard && !overZone(x, y))) drop(undefined, undefined); // a tap, even a smeared one
      else if (overZone(x, y)) drop(x, y);
    };
    card.addEventListener('pointerup', e => end(e, false));
    card.addEventListener('pointercancel', e => end(e, true));
  }

  function draw() {
    dropGhost();
    const g = ctx.game, d = g.design, s = stats(d);
    root.innerHTML = `
<span class="abs" style="right:300px;top:24px;width:60px;height:52px;rotate:10deg">${heart('#FFAD96')}</span>
<h2 class="title abs" style="left:110px;top:18px">Workshop</h2>
<div class="dropzone">${plane(d, { popped: true })}</div>
<div class="side card">
  <div class="col" style="gap:8px">
    ${['fast', 'pretty', 'comfy'].map(f => `<div class="meter">${pic(icon(f))}<div><div style="text-transform:capitalize;line-height:1">${f}</div>${pips(s[f], MAXES[f])}</div></div>`).join('')}
    <div class="meter">${pic(icon('seat'))}<div style="font-size:28px">${s.seats} seats</div></div>
    <div class="row" style="justify-content:space-between;border-top:3px dashed #16161a33;padding-top:8px"><span class="hand" style="font-size:24px">To build</span>${moneyChip(buildCost(d))}</div>
  </div>
</div>
<div class="abs showbtn" style="right:18px;top:424px"></div>
<div class="tray"><div class="tabs"></div><div class="pieces"></div></div>`;
    root.append(backButton(() => go('hangar')));
    root.querySelector('.showbtn').append(button({ label: 'Show the bosses', cls: 'go pulse', tap: () => go('bosses') }));

    // Stickers on the plane can be tapped off again.
    const zone = root.querySelector('.dropzone');
    d.stickers.forEach((st, i) => {
      const hit = el(`<button class="stickhit" aria-label="Take off the ${st.id} sticker"></button>`);
      hit.style.left = `${ZONE_W / 2 + st.x * 100 * K}px`;
      hit.style.top = `${ZONE_H / 2 + st.y * 80 * K}px`;
      hit.addEventListener('click', () => { update({ ...ctx.game, design: removeSticker(ctx.game.design, i) }); sfx('poof'); draw(); });
      zone.append(hit);
    });

    const tabs = root.querySelector('.tabs');
    for (const k of [...KINDS, 'stickers']) {
      const t = el(`<button class="tab ${k === tab ? 'on' : ''}">${k === 'stickers' ? 'Stickers' : KIND_NAMES[k]}</button>`);
      t.addEventListener('click', () => { tab = k; sfx('tap'); draw(); });
      tabs.append(t);
    }

    const row = root.querySelector('.pieces');
    if (tab === 'stickers') {
      for (const id of STICKER_IDS) {
        const card = el(`<button class="card pc sticker" aria-label="${id} sticker">${pic(sticker(id))}<b>free</b></button>`);
        draggable(card, sticker(id), (x, y) => {
          if (x === undefined) return applySticker(id);
          applySticker(id, Math.max(-1, Math.min(1, (x - ZONE_X - ZONE_W / 2) / K / 100)), Math.max(-1, Math.min(1, (y - ZONE_Y - ZONE_H / 2) / K / 80)));
        });
        row.append(card);
      }
      row.append(el(`<p style="align-self:center;font-size:22px;max-width:300px">Drag a sticker where you want it. Tap it on the plane to take it off.</p>`));
      return;
    }
    for (const [id, p] of Object.entries(PIECES).filter(([, x]) => x.kind === tab)) {
      const owned = g.owned.includes(id);
      const card = el(`<button class="card pc ${d[tab] === id ? 'on' : ''} ${owned ? '' : 'locked'}" aria-label="${p.name}${owned ? '' : ', not yours yet'}">
${pic(pieceIcon(id), 'main')}<b>${p.name}</b>${givesHtml(p)}
<span class="tag">${owned ? moneyChip(p.build) : `<span class="chip">${pic(icon('lock'))}<span>$${p.own}</span></span>`}</span></button>`);
      if (owned) draggable(card, pieceIcon(id), () => applyPiece(id));
      else card.addEventListener('click', () => { sfx('no'); card.classList.add('wiggle'); setTimeout(() => card.classList.remove('wiggle'), 900); });
      row.append(card);
    }
  }

  draw();
  return dropGhost;
}

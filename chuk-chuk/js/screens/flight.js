// The flight, seen from above. The plane flies by itself to the right and
// follows the finger up and down. Catch the gold stars. Nothing can go wrong.

import { stats } from '../plane.js';
import { placeById, landFlight, canReach } from '../economy.js';
import { newFlight, step, progress, PLANE_X, SPEED } from '../flight.js';
import { plane, planeShadow, star, cloud, cloudShadow, groundStrip, skyPalette, standalone, placePic, icon, jelly, dragon } from '../art.js';
import { button, pic } from '../ui.js';
import { sfx } from '../audio.js';

const W = 1024, H = 768, GROUND_W = 2048;
const TRAILS = [['#FF2E9A', -62], ['#FFD91A', -44], ['#22C3C9', 44], ['#B46BFF', 62]];

const image = (markup, w, h) => new Promise(done => {
  const img = new Image();
  // Draw it once onto its own little canvas, so the wobbly pen filters are
  // worked out a single time and not again on every frame.
  img.onload = () => {
    try {
      const baked = document.createElement('canvas');
      baked.width = w;
      baked.height = h;
      baked.getContext('2d').drawImage(img, 0, 0, w, h);
      done(baked);
    } catch { done(img); }
  };
  img.onerror = () => done(null);
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(standalone(markup, w, h))}`;
});

export function render(root, ctx, go, update) {
  const g = ctx.game, place = placeById(ctx.place);
  if (!g.plane || !place || !canReach(place, g.plane, g)) { queueMicrotask(() => go('hangar')); return; }
  const design = g.plane.design, funders = g.plane.funders;
  const pal = skyPalette(place.sky);
  const seats = stats(design).seats;
  const still = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  let f = newFlight(g.flightSeq * 7919 + 13, place.sky);
  const WEATHER_WORDS = { rain: 'Purple rain today!', windy: 'A windy day!', rainbow: 'A lucky rainbow day!', snow: 'Glitter snow tonight!' };
  let rode = false; // has the baby dragon hopped on?

  root.innerHTML = `<canvas class="sky" width="${W}" height="${H}" aria-label="Your plane is flying. Move your finger up and down to catch stars."></canvas>
<div class="hud" style="left:18px;right:auto"><span class="chip money">${pic(star())}<span class="count">0</span></span><span class="chip">${pic(icon('seat'))}<span>${seats}</span></span></div>
<div class="abs flightbar" style="left:300px;right:130px;top:26px;height:60px">
  <div style="position:absolute;left:44px;right:84px;top:27px;border-top:6px dotted #16161A"></div>
  <span class="abs marker" style="left:0;top:-2px;width:76px;height:64px">${plane(design)}</span>
  <span class="abs" style="right:6px;top:-2px;width:64px;height:64px;border-radius:50%;overflow:hidden;border:4px solid #16161A">${placePic(place.id)}</span>
</div>
<div class="abs col center intro" style="inset:0;gap:20px;background:#fbfaf5e6">
  <div class="row">${Array.from({ length: Math.min(seats, 8) }, (_, i) => `<span class="float" style="width:70px;height:84px;animation-delay:${-i * 0.3}s">${jelly(i % 6, 'happy')}</span>`).join('')}</div>
  <h2 class="title">${seats} jellyfish on board for ${place.name}!</h2>
  <p style="font-size:26px">Move your finger up and down. Catch the stars!</p>
  ${WEATHER_WORDS[f.weather] ? `<p class="hand chip" style="font-size:28px;padding:4px 18px">${WEATHER_WORDS[f.weather]}</p>` : ''}
  <div class="start"></div>
</div>`;
  const canvas = root.querySelector('canvas');
  const c = canvas.getContext('2d');
  const countEl = root.querySelector('.count'), markEl = root.querySelector('.marker');

  let sprites = null, raf = 0, last = 0, started = false, ended = false;
  let target = 384;
  const hist = [];      // where the plane has been, for the sparkle trails
  const bits = [];      // glitter flying off caught stars
  const poofed = new Set();
  const POP_AT = design.top === 'popup' ? 1300 : 0;
  let popped = false;

  Promise.all([
    image(plane(design, { popped: true }), 440, 380), image(planeShadow(design), 440, 380), image(star(), 144, 144),
    image(cloud(pal.streak, pal.cloud), 272, 184), image(cloudShadow(), 264, 198), image(groundStrip(place.sky), GROUND_W, H),
    image(plane(design, { popped: false }), 440, 380), image(dragon('lost'), 192, 174), image(dragon('happy'), 192, 174),
  ]).then(([p, sh, st, cl, cs, gr, p0, dl, dh]) => { sprites = { p, sh, st, cl, cs, gr, p0, dl, dh }; if (!started) draw(); });

  const setTarget = e => {
    const r = canvas.getBoundingClientRect();
    target = (e.clientY - r.top) / r.height * H;
  };
  // One finger steers. A second finger is ignored.
  let finger = null;
  root.addEventListener('pointerdown', e => { if (finger === null) { finger = e.pointerId; setTarget(e); } });
  root.addEventListener('pointermove', e => { if (finger === null || e.pointerId === finger) setTarget(e); });
  const lift = e => { if (e.pointerId === finger) finger = null; };
  root.addEventListener('pointerup', lift);
  root.addEventListener('pointercancel', lift);
  const onKey = e => {
    if (e.key === 'ArrowUp') target = Math.max(90, target - 60);
    if (e.key === 'ArrowDown') target = Math.min(678, target + 60);
  };
  window.addEventListener('keydown', onKey);

  function spark(x, y, s, colour, a = 1) {
    c.save();
    c.globalAlpha = a;
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(0, -7); c.quadraticCurveTo(1, -1, 7, 0); c.quadraticCurveTo(1, 1, 0, 7); c.quadraticCurveTo(-1, 1, -7, 0); c.quadraticCurveTo(-1, -1, 0, -7);
    c.fill();
    c.restore();
  }


  // Weather, drawn fresh each frame. It is only for looks.
  function drawRainbow(t) {
    const cols = ['#E8341F', '#FF7A12', '#FFD91A', '#3CCB4A', '#1877F2', '#7A22C4'];
    c.save();
    c.globalAlpha = 0.42;
    c.lineWidth = 22;
    cols.forEach((col, i) => {
      c.strokeStyle = col;
      c.beginPath();
      c.arc(620 - (f.dist * 0.08) % 200, 980, 760 - i * 22, Math.PI * 1.12, Math.PI * 1.9);
      c.stroke();
    });
    c.restore();
    void t;
  }
  function drawWeather(t) {
    if (f.weather === 'rain') {
      c.strokeStyle = pal.glow ? '#D9B8FF' : '#A66BE8';
      c.lineWidth = 5;
      c.lineCap = 'round';
      c.globalAlpha = 0.6;
      for (let i = 0; i < 70; i++) {
        const x = ((i * 173 - t * 620) % (W + 240) + W + 240) % (W + 240) - 120;
        const y = (i * 97 + t * 780) % (H + 60) - 30;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x - 9, y + 26); c.stroke();
      }
      c.globalAlpha = 1;
    } else if (f.weather === 'windy') {
      c.strokeStyle = '#fff';
      c.lineWidth = 4;
      c.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const x = ((i * 311 - t * 1100) % (W + 500) + W + 500) % (W + 500) - 250;
        const y = 60 + (i * 149) % (H - 120);
        c.globalAlpha = 0.25 + (i % 3) * 0.15;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 70, y - 16, x + 150, y); c.quadraticCurveTo(x + 176, y + 12, x + 160, y + 22); c.stroke();
      }
      c.globalAlpha = 1;
    } else if (f.weather === 'snow') {
      for (let i = 0; i < 46; i++) {
        const x = ((i * 211 - t * 150 + Math.sin(t + i) * 30) % (W + 80) + W + 80) % (W + 80) - 40;
        const y = (i * 131 + t * 90) % (H + 40) - 20;
        spark(x, y, 0.6 + (i % 4) * 0.25, ['#fff', '#FFF6B0', '#FF8FE0', '#39F0D0'][i % 4], 0.85);
      }
    }
  }

  function draw() {
    const s = sprites;
    c.fillStyle = pal.ground;
    c.fillRect(0, 0, W, H);
    if (!s) return;
    const t = f.t / 1000;
    if (s.gr) {
      const gx = -((f.dist * 0.6) % GROUND_W);
      c.drawImage(s.gr, gx, 0, GROUND_W, H);
      c.drawImage(s.gr, gx + GROUND_W, 0, GROUND_W, H);
    }
    if (f.weather === 'rainbow') drawRainbow(t);
    const clouds = f.clouds.map((cl, i) => ({ i, x: cl.x * 1.15 - f.dist * 1.15 + 300, y: cl.y, s: cl.s }));
    if (s.cs) for (const cl of clouds) if (cl.x > -300 && cl.x < W + 300) c.drawImage(s.cs, cl.x - 132 * cl.s + 40, cl.y - 99 * cl.s + 56, 264 * cl.s, 198 * cl.s);
    const bob = still ? 0 : Math.sin(t * 2) * 5;
    const py = f.y + bob;
    if (s.sh) c.drawImage(s.sh, PLANE_X - 170 + 34, py - 147 + 52, 340, 294);

    // Rainbow sparkle trails from the engines.
    c.lineCap = 'round';
    c.lineWidth = 7;
    for (const [colour, off] of TRAILS) {
      for (let i = 1; i < hist.length; i++) {
        if ((i + Math.floor(f.dist / 14)) % 4 === 0) continue; // dashes that slide back
        c.globalAlpha = Math.max(0, 0.85 * (1 - i / hist.length));
        c.strokeStyle = colour;
        c.beginPath();
        c.moveTo(PLANE_X - 50 - (i - 1) * 7, hist[i - 1] + off * 0.78 + Math.sin((i + f.dist / 20) * 0.5) * 3);
        c.lineTo(PLANE_X - 50 - i * 7, hist[i] + off * 0.78 + Math.sin((i + 1 + f.dist / 20) * 0.5) * 3);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
    if (pal.glow) {
      const glow = c.createRadialGradient(PLANE_X, py, 20, PLANE_X, py, 230);
      glow.addColorStop(0, 'rgba(255,246,176,0.35)');
      glow.addColorStop(1, 'rgba(255,246,176,0)');
      c.fillStyle = glow;
      c.fillRect(PLANE_X - 240, py - 240, 480, 480);
    }
    const body = f.t < POP_AT && s.p0 ? s.p0 : s.p; // the pop-up level rises just after take-off
    if (body) c.drawImage(body, PLANE_X - 170, py - 147, 340, 294);
    if (s.cl) for (const cl of clouds) if (cl.x > -300 && cl.x < W + 300) c.drawImage(s.cl, cl.x - 136 * cl.s, cl.y - 92 * cl.s, 272 * cl.s, 184 * cl.s);

    // Gold stars to catch.
    for (const st of f.stars) {
      const x = st.x - f.dist;
      if (st.got || x < -80 || x > W + 80 || !s.st) continue;
      const size = 104 + (still ? 0 : Math.sin(t * 4 + st.x) * 10);
      c.save();
      c.translate(x, st.y);
      c.rotate(still ? 0 : Math.sin(t * 2.4 + st.x) * 0.18);
      if (pal.glow) { c.globalCompositeOperation = 'lighter'; c.drawImage(s.st, -size * 0.7, -size * 0.7, size * 1.4, size * 1.4); c.globalCompositeOperation = 'source-over'; }
      c.drawImage(s.st, -size / 2, -size / 2, size, size);
      c.restore();
      if (!still) spark(x + 46 * Math.cos(t * 3 + st.x), st.y + 46 * Math.sin(t * 3 + st.x), 0.9, '#fff', 0.9);
    }
    for (const b of bits) spark(b.x, b.y, b.s, b.colour, Math.max(0, b.life));

    // The baby dragon: waiting with a little "?" until you fly close, then riding on the tail.
    const dr = f.dragon;
    if (dr && !dr.got && s.dl) {
      const dx = dr.x - f.dist, dy = dr.y + (still ? 0 : Math.sin(t * 5) * 8);
      if (dx > -120 && dx < W + 120) {
        c.drawImage(s.dl, dx - 62, dy - 56, 124, 112);
        c.fillStyle = '#fff'; c.strokeStyle = '#16161A'; c.lineWidth = 3;
        c.beginPath(); c.arc(dx + 52, dy - 56, 20, 0, Math.PI * 2); c.fill(); c.stroke();
        c.fillStyle = '#16161A'; c.font = '28px "Marker Felt", "Chalkboard SE", sans-serif'; c.textAlign = 'center'; c.fillText('?', dx + 52, dy - 46);
      }
    }
    if (dr && dr.got && s.dh) c.drawImage(s.dh, PLANE_X - 150, py - 42 + (still ? 0 : Math.sin(t * 6) * 3), 84, 76);
    drawWeather(t);

    // Darker edges, like the approved picture.
    const vig = c.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 720);
    vig.addColorStop(0, 'rgba(20,32,74,0)');
    vig.addColorStop(1, 'rgba(20,32,74,0.34)');
    c.fillStyle = vig;
    c.fillRect(0, 0, W, H);
  }

  function frame(now) {
    if (ended) return;
    const dt = last ? now - last : 16;
    last = now;
    const before = f.caught;
    f = step(f, dt, target);
    hist.unshift(f.y);
    if (POP_AT && !popped && f.t >= POP_AT) {
      popped = true;
      sfx('snap');
      for (let i = 0; i < 10; i++) bits.push({ x: PLANE_X - 30, y: f.y, vx: Math.cos(i * 0.63) * 150, vy: Math.sin(i * 0.63) * 150, s: 0.9, life: 1, colour: i % 2 ? '#FFE833' : '#fff' });
    }
    if (hist.length > 38) hist.pop();
    if (f.caught > before) {
      sfx('star');
      countEl.textContent = f.caught;
      for (let i = 0; i < 14; i++) bits.push({ x: PLANE_X + 60, y: f.y, vx: Math.cos(i * 0.45) * (120 + i * 12), vy: Math.sin(i * 0.45) * (120 + i * 12), s: 0.8 + (i % 3) * 0.5, life: 1, colour: ['#FFD91A', '#fff', '#FF2E9A', '#22C3C9'][i % 4] });
    }
    for (const b of bits) { b.x += b.vx * dt / 1000 - SPEED * dt / 1000 * 0.4; b.y += b.vy * dt / 1000; b.life -= dt / 700; }
    for (let i = bits.length - 1; i >= 0; i--) if (bits[i].life <= 0) bits.splice(i, 1);
    if (f.dragon && f.dragon.got && !rode) {
      rode = true;
      sfx('yes');
      for (let i = 0; i < 16; i++) bits.push({ x: PLANE_X - 100, y: f.y, vx: Math.cos(i * 0.4) * 170, vy: Math.sin(i * 0.4) * 170, s: 1.1, life: 1.2, colour: ['#FF2E9A', '#3AD6C0', '#FFE833', '#fff'][i % 4] });
    }
    // Clouds are soft: flying through one just goes "poof".
    f.clouds.forEach((cl, i) => {
      const x = cl.x * 1.15 - f.dist * 1.15 + 300;
      if (!poofed.has(i) && Math.abs(x - PLANE_X) < 90 && Math.abs(cl.y - f.y) < 70) { poofed.add(i); sfx('poof'); }
    });
    markEl.style.left = `calc((100% - 150px) * ${progress(f).toFixed(3)})`;
    draw();
    if (f.done) return land();
    raf = requestAnimationFrame(frame);
  }

  function land() {
    if (ended) return;
    ended = true;
    const extras = { dragon: !!(f.dragon && f.dragon.got), rainbow: f.weather === 'rainbow' };
    update(landFlight(ctx.game, place.id, f.caught, extras));
    ctx.result = { placeId: place.id, stars: f.caught, design, funders, extras };
    sfx('fanfare');
    go('earnings');
  }

  root.querySelector('.start').append(button({ label: 'Take off!', picture: icon('fly'), cls: 'big go pulse', tap: () => {
    if (started) return;
    started = true;
    root.querySelector('.intro').remove();
    sfx('whoosh');
    last = 0;
    raf = requestAnimationFrame(frame);
  } }));

  return () => { ended = true; cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
}

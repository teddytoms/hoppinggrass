// Sounds and tunes, made with Web Audio. Nothing is downloaded.
// The iPad only lets a page make sound after the first touch (see unlock()).

let ac = null, master = null, muted = false, tuneTimer = null, tuneName = null;

const NOTE = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5 };

export function unlock() {
  try {
    const AC = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!AC) return;
    if (!ac) {
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ac.destination);
    }
    if (ac.state !== 'running') ac.resume();
  } catch { /* no sound on this device */ }
}

export function setMuted(m) {
  muted = !!m;
  if (master) master.gain.value = muted ? 0 : 1;
}

function beep(freq, at, len, { type = 'triangle', vol = 0.16, to = null } = {}) {
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  const t = ac.currentTime + at;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + len);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + len + 0.03);
}

const SOUNDS = {
  tap: () => beep(520, 0, 0.07, { vol: 0.1 }),
  snap: () => { beep(330, 0, 0.06, { type: 'square', vol: 0.08 }); beep(660, 0.05, 0.1); },
  coin: () => { beep(NOTE.E5, 0, 0.08); beep(NOTE.A5, 0.07, 0.16); },
  chuk: () => { for (let i = 0; i < 3; i++) beep(150, i * 0.16, 0.09, { type: 'sawtooth', vol: 0.12, to: 90 }); },
  star: () => { beep(NOTE.C6, 0, 0.09, { vol: 0.12 }); beep(NOTE.E5 * 2, 0.07, 0.18, { vol: 0.1 }); },
  poof: () => beep(240, 0, 0.22, { type: 'sine', vol: 0.08, to: 120 }),
  yes: () => { beep(NOTE.C5, 0, 0.1); beep(NOTE.E5, 0.09, 0.1); beep(NOTE.G5, 0.18, 0.2); },
  no: () => { beep(NOTE.E4, 0, 0.12, { vol: 0.1 }); beep(NOTE.C4, 0.11, 0.18, { vol: 0.1 }); },
  build: () => { for (let i = 0; i < 6; i++) beep(140 + (i % 2) * 40, i * 0.14, 0.08, { type: 'sawtooth', vol: 0.11, to: 90 }); beep(NOTE.G5, 0.9, 0.3); },
  fanfare: () => [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => beep(f, i * 0.14, i === 3 ? 0.6 : 0.16, { vol: 0.15 })),
  whoosh: () => beep(180, 0, 0.5, { type: 'sawtooth', vol: 0.06, to: 720 }),
};
export const SFX_NAMES = Object.keys(SOUNDS);

export function sfx(name) {
  try { if (ac && !muted && Object.hasOwn(SOUNDS, name)) SOUNDS[name](); } catch { /* never let a sound stop the game */ }
}

// Quiet looping tunes: [note, beats] pairs.
const TUNES = {
  hangar: { beat: 0.3, notes: [['C4', 1], ['E4', 1], ['G4', 1], ['E4', 1], ['A4', 1], ['G4', 1], ['E4', 2], ['D4', 1], ['F4', 1], ['A4', 1], ['F4', 1], ['G4', 1], ['E4', 1], ['C4', 2]] },
  flight: { beat: 0.22, notes: [['G4', 1], ['C5', 1], ['E5', 1], ['C5', 1], ['D5', 1], ['G4', 1], ['B4', 2], ['A4', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1], ['D5', 1], ['C5', 2]] },
  finale: { beat: 0.2, notes: [['C5', 1], ['E5', 1], ['G5', 1], ['C6', 2], ['A5', 1], ['G5', 1], ['E5', 1], ['G5', 2], ['D5', 1], ['G5', 1], ['C6', 3]] },
};
export const TUNE_NAMES = Object.keys(TUNES);

export function tune(name) {
  if (name === tuneName) return;
  tuneName = Object.hasOwn(TUNES, name ?? '') ? name : null;
  if (tuneTimer) { clearTimeout(tuneTimer); tuneTimer = null; }
  if (!tuneName || typeof setTimeout !== 'function' || !globalThis.document) return;
  const mine = tuneName;
  const play = () => {
    if (tuneName !== mine) return;
    const { beat, notes } = TUNES[mine];
    let at = 0;
    if (ac && !muted) for (const [n, b] of notes) { beep(NOTE[n], at, beat * b * 0.9, { type: 'sine', vol: 0.045 }); at += beat * b; }
    else at = notes.reduce((s, [, b]) => s + beat * b, 0);
    tuneTimer = setTimeout(play, (at + beat * 2) * 1000);
  };
  play();
}

// Sounds and music, all made by the computer (no sound files).
// Everything here is safe to call at any time: before the first tap, when
// muted, or on a device with no sound at all, the calls simply do nothing.

const NOTES = {
  C3: 130.81, F3: 174.61, G3: 196, A3: 220,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};

const TUNES = {
  cafe: {
    beat: 0.26, type: 'triangle',
    mel: ['C5', 'E5', 'G5', 'E5', 'C5', 'E5', 'D5', 0, 'A4', 'C5', 'E5', 'C5', 'D5', 'B4', 'G4', 0,
      'C5', 'E5', 'G5', 'E5', 'C5', 'E5', 'D5', 0, 'F4', 'A4', 'G4', 'B4', 'C5', 0, 'C5', 0],
    bass: ['C3', 'G3', 'A3', 'G3', 'C3', 'G3', 'F3', 'C3'],
  },
  garden: {
    beat: 0.5, type: 'sine',
    mel: ['E4', 'G4', 'C5', 'G4', 'A4', 'C5', 'E5', 'C5', 'F4', 'A4', 'C5', 'A4', 'G4', 'B4', 'D5', 0],
    bass: ['C3', 'A3', 'F3', 'G3'],
  },
};

// Each note is [pitch, start, length, wave shape, loudness, slide-to pitch].
const run = (pitches, gap, length, type, vol) => pitches.map((f, i) => [f, i * gap, length, type, vol]);
const SFX = {
  hello: [[300, 0, 0.18, 'square', 0.12, 520], [520, 0.2, 0.25, 'square', 0.12, 380]],
  pop: [[400, 0, 0.09, 'sine', 0.3, 1200]],
  twinkle: run([1568, 2093, 1760, 2637, 2093, 3136], 0.07, 0.18, 'sine', 0.12),
  squish: [[700, 0, 0.35, 'sawtooth', 0.1, 120], [180, 0.3, 0.2, 'sine', 0.2, 90]],
  ding: [[880, 0, 0.15, 'sine', 0.2], [1318.5, 0.12, 0.4, 'sine', 0.2]],
  coin: [[987.77, 0, 0.08, 'square', 0.1], [1318.5, 0.08, 0.45, 'square', 0.1]],
  happy: run([523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5], 0.11, 0.16, 'triangle', 0.2),
  'too-much': [[1200, 0, 0.5, 'sine', 0.2, 200], [110, 0.5, 0.35, 'triangle', 0.25, 330]],
  sticker: run([783.99, 1046.5, 1318.5, 1568, 2093], 0.09, 0.22, 'triangle', 0.18),
  tip: [[1318.5, 0, 0.1, 'sine', 0.18], [1760, 0.1, 0.3, 'sine', 0.18]],
  party: run([523.25, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5], 0.14, 0.2, 'square', 0.1),
  yuck: [[220, 0, 0.3, 'sawtooth', 0.1, 150], [150, 0.3, 0.45, 'sawtooth', 0.1, 80]],
};

const TUNE_VOLUME = 0.5; // music is half as loud as the sound effects

let ac = null;       // the one shared AudioContext
let master = null;   // everything plays through this, so mute is one switch
let muted = false;
let wanted = null;   // the tune the game has asked for
let playing = null;  // the tune that is really playing: { name, gain, next, timer }

function tone(out, [freq, start, dur, type = 'sine', vol = 0.2, endFreq], t0) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  const t = t0 + start;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out);
  o.start(t); o.stop(t + dur + 0.05);
}

function stopTune() {
  if (!playing) return;
  clearInterval(playing.timer);
  playing.gain.gain.value = 0;
  playing.gain.disconnect();
  playing = null;
}

function startTune() {
  stopTune();
  const t = TUNES[wanted];
  if (!t) return;
  const gain = ac.createGain();
  gain.gain.value = TUNE_VOLUME;
  gain.connect(master);
  const length = t.mel.length * t.beat;
  const bassBeats = t.mel.length / t.bass.length;
  const p = { name: wanted, gain, next: ac.currentTime + 0.05, timer: null };
  // Loop by booking the next pass on the audio clock a little before it is due.
  const pump = () => {
    try {
      if (p.next < ac.currentTime) p.next = ac.currentTime + 0.05;
      while (p.next < ac.currentTime + 1) {
        t.mel.forEach((n, i) => { if (n) tone(gain, [NOTES[n], i * t.beat, t.beat * 0.9, t.type, 0.12], p.next); });
        t.bass.forEach((n, i) => tone(gain, [NOTES[n], i * bassBeats * t.beat, bassBeats * t.beat * 0.95, 'sine', 0.1], p.next));
        p.next += length;
      }
    } catch { /* sound is never worth breaking the game for */ }
  };
  playing = p;
  pump();
  p.timer = setInterval(pump, 250);
  p.timer.unref?.();
}

// Call on every tap. The iPad only allows sound after the player touches the screen.
export function unlock(AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  try {
    if (!ac) {
      if (!AudioContextClass) return;
      ac = new AudioContextClass();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ac.destination);
    }
    if (ac.state !== 'running') ac.resume?.()?.catch?.(() => {});
    if (wanted !== (playing?.name ?? null)) startTune();
  } catch { /* no sound on this device: the game still plays */ }
}

export function sfx(name) {
  if (!ac || muted || !SFX[name]) return;
  try {
    for (const note of SFX[name]) tone(master, note, ac.currentTime);
  } catch { /* ignore */ }
}

export function tune(name) {
  wanted = name ?? null;
  if (!ac || (playing?.name ?? null) === wanted) return;
  try { startTune(); } catch { /* ignore */ }
}

export function setMuted(b) {
  muted = b === true;
  if (master) master.gain.value = muted ? 0 : 1;
}

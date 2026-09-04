// A small procedural audio layer for the Dungeon Forge raid — tones for
// musical beats, filtered noise bursts for physical impacts, and a very
// quiet looping drone for dungeon atmosphere. No audio files: everything is
// synthesized, so there is nothing to load and nothing that can 404.
//
// Every entry point swallows its own errors — a blocked/unavailable
// AudioContext (autoplay policy, sandboxed preview) must never affect
// gameplay, per the design brief's "remains playable without audio".

export type SfxKind =
  | 'tap'
  | 'door'
  | 'footstep'
  | 'trapTrigger'
  | 'monsterAppear'
  | 'heroAttack'
  | 'hit'
  | 'statusPoison'
  | 'statusChill'
  | 'statusWeaken'
  | 'pain'
  | 'death'
  | 'win'
  | 'lose'
  | 'escape';

let ctx: AudioContext | null = null;
let failed = false;
let noiseBuffer: AudioBuffer | null = null;
let ambientNodes: { osc: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  if (failed || typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    failed = true;
    return null;
  }
  try {
    ctx = new Ctor();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
  } catch (e) {
    failed = true;
    return null;
  }
  return ctx;
}

function tone(audio: AudioContext, start: number, freq: number, duration: number, type: OscillatorType, gain: number, glideTo?: number): void {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noiseBurst(audio: AudioContext, start: number, duration: number, gain: number, filterFreq: number): void {
  if (!noiseBuffer) return;
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const g = audio.createGain();
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(audio.destination);
  src.start(start);
  src.stop(start + duration + 0.02);
}

export function playSfx(kind: SfxKind): void {
  try {
    const audio = getCtx();
    if (!audio) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const t = audio.currentTime;

    switch (kind) {
      case 'tap':
        tone(audio, t, 640, 0.05, 'square', 0.05);
        break;
      case 'door':
        tone(audio, t, 130, 0.24, 'triangle', 0.08);
        noiseBurst(audio, t, 0.18, 0.03, 800);
        break;
      case 'footstep':
        noiseBurst(audio, t, 0.06, 0.05, 350);
        break;
      case 'trapTrigger':
        noiseBurst(audio, t, 0.12, 0.09, 2200);
        tone(audio, t, 900, 0.06, 'square', 0.05);
        break;
      case 'monsterAppear':
        tone(audio, t, 180, 0.3, 'sawtooth', 0.06, 90);
        break;
      case 'heroAttack':
        noiseBurst(audio, t, 0.08, 0.06, 3000);
        tone(audio, t, 500, 0.08, 'square', 0.04, 250);
        break;
      case 'hit':
        tone(audio, t, 140, 0.09, 'square', 0.08);
        noiseBurst(audio, t, 0.05, 0.05, 500);
        break;
      case 'statusPoison':
        tone(audio, t, 300, 0.1, 'sine', 0.05, 220);
        break;
      case 'statusChill':
        tone(audio, t, 900, 0.12, 'sine', 0.05, 1300);
        break;
      case 'statusWeaken':
        tone(audio, t, 260, 0.14, 'sawtooth', 0.05, 160);
        break;
      case 'pain':
        tone(audio, t, 380, 0.07, 'square', 0.06);
        break;
      case 'death':
        tone(audio, t, 220, 0.35, 'sawtooth', 0.08, 80);
        tone(audio, t + 0.08, 160, 0.4, 'sawtooth', 0.06, 60);
        break;
      case 'win':
        tone(audio, t, 440, 0.14, 'triangle', 0.08);
        tone(audio, t + 0.1, 660, 0.26, 'triangle', 0.08);
        break;
      case 'lose':
        tone(audio, t, 300, 0.18, 'sawtooth', 0.07, 150);
        tone(audio, t + 0.14, 200, 0.32, 'sawtooth', 0.07, 100);
        break;
      case 'escape':
        tone(audio, t, 500, 0.08, 'square', 0.06);
        tone(audio, t + 0.06, 400, 0.1, 'square', 0.05);
        break;
    }
  } catch (e) {
    // audio is a non-essential enhancement
  }
}

// A very quiet dungeon-atmosphere drone, meant to run for the duration of a
// raid. Safe to call repeatedly — starting an already-running drone is a
// no-op, and it can only be started from a user gesture (browser policy).
export function startAmbient(): void {
  try {
    const audio = getCtx();
    if (!audio || ambientNodes) return;
    const osc = audio.createOscillator();
    const osc2 = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc2.type = 'sine';
    osc.frequency.value = 55;
    osc2.frequency.value = 58;
    gain.gain.value = 0;
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc2.start();
    gain.gain.linearRampToValueAtTime(0.02, audio.currentTime + 1.2);
    ambientNodes = { osc, osc2, gain };
  } catch (e) {
    // non-essential
  }
}

export function stopAmbient(): void {
  try {
    if (!ambientNodes || !ctx) return;
    const { osc, osc2, gain } = ambientNodes;
    const t = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(0, t + 0.5);
    osc.stop(t + 0.6);
    osc2.stop(t + 0.6);
    ambientNodes = null;
  } catch (e) {
    // non-essential
  }
}

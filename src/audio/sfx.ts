export type SfxKind = 'door' | 'pain' | 'death' | 'rage' | 'win' | 'lose' | 'escape';

interface Tone {
  freq: number;
  duration: number;
  type: OscillatorType;
  gain: number;
}

const PROFILES: Record<SfxKind, Tone[]> = {
  door: [{ freq: 140, duration: 0.22, type: 'triangle', gain: 0.08 }],
  pain: [{ freq: 260, duration: 0.06, type: 'sawtooth', gain: 0.06 }],
  death: [
    { freq: 220, duration: 0.32, type: 'sawtooth', gain: 0.08 },
    { freq: 110, duration: 0.4, type: 'sawtooth', gain: 0.07 }
  ],
  rage: [{ freq: 90, duration: 0.25, type: 'sawtooth', gain: 0.09 }],
  win: [
    { freq: 440, duration: 0.14, type: 'triangle', gain: 0.08 },
    { freq: 660, duration: 0.24, type: 'triangle', gain: 0.08 }
  ],
  lose: [
    { freq: 300, duration: 0.18, type: 'sawtooth', gain: 0.07 },
    { freq: 200, duration: 0.32, type: 'sawtooth', gain: 0.07 }
  ],
  escape: [
    { freq: 500, duration: 0.08, type: 'square', gain: 0.06 },
    { freq: 400, duration: 0.1, type: 'square', gain: 0.05 }
  ]
};

let ctx: AudioContext | null = null;
let ctxFailed = false;

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  if (ctxFailed || typeof window === 'undefined') return null;
  var Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    ctxFailed = true;
    return null;
  }
  try {
    ctx = new Ctor();
  } catch (e) {
    ctxFailed = true;
    return null;
  }
  return ctx;
}

// Small procedural cues (no audio assets) for the raid's key beats. Subtle by
// design and never blocking: any failure (blocked autoplay, no AudioContext,
// a sandboxed preview) is swallowed and the game stays fully playable silent.
export function playSfx(kind: SfxKind): void {
  try {
    var audio = getCtx();
    if (!audio) return;
    if (audio.state === 'suspended') audio.resume().catch(function () {});

    var tones = PROFILES[kind];
    var t = audio.currentTime;
    tones.forEach(function (tone, i) {
      var osc = audio!.createOscillator();
      var gain = audio!.createGain();
      osc.type = tone.type;
      osc.frequency.value = tone.freq;
      var start = t + i * 0.05;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(tone.gain, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
      osc.connect(gain);
      gain.connect(audio!.destination);
      osc.start(start);
      osc.stop(start + tone.duration + 0.02);
    });
  } catch (e) {
    // audio is a non-essential enhancement; never let it break the raid
  }
}

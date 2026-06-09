// =============================================================
//  SONS  ·  áudio sintetizado com Web Audio API (sem arquivos).
//  Tudo gerado por código: sirene, coleta, depósito, tique, impacto.
//  O navegador só libera áudio após um gesto do usuário, por isso
//  chamamos desbloquearAudio() nos primeiros cliques (Menu/Setup).
// =============================================================
let ctx = null;
let mudo = false;

function ac() {
  if (mudo) return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function desbloquearAudio() { ac(); }
export function alternarMudo() { mudo = !mudo; return mudo; }
export function estaMudo() { return mudo; }

// envelope rápido (ataque + decay exponencial)
function blip(freqIni, freqFim, tipo, pico, dur) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freqIni, t0);
  if (freqFim !== freqIni) osc.frequency.exponentialRampToValueAtTime(freqFim, t0 + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(pico, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g); g.connect(a.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

// Sirene de ataque aéreo: wail que sobe e desce algumas vezes.
export function sirene(dur = 2.8) {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = 'sawtooth';
  osc.connect(g); g.connect(a.destination);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(0.16, t0 + 0.15);

  let t = t0;
  osc.frequency.setValueAtTime(420, t0);
  while (t < t0 + dur - 0.9) {
    osc.frequency.linearRampToValueAtTime(900, t + 0.5);
    osc.frequency.linearRampToValueAtTime(430, t + 1.0);
    t += 1.0;
  }
  g.gain.setValueAtTime(0.16, t0 + dur - 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}

export function coleta(raro = false) {
  blip(raro ? 620 : 500, raro ? 1280 : 900, 'triangle', 0.12, raro ? 0.22 : 0.15);
  if (raro) blip(960, 1500, 'triangle', 0.08, 0.18);
}

export function deposito() {
  const a = ac(); if (!a) return;
  [440, 660].forEach((f, i) => {
    const t0 = a.currentTime + i * 0.09;
    const osc = a.createOscillator(); const g = a.createGain();
    osc.type = 'square'; osc.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(0.08, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.13);
    osc.connect(g); g.connect(a.destination);
    osc.start(t0); osc.stop(t0 + 0.15);
  });
}

export function tique() {
  blip(900, 900, 'square', 0.06, 0.06);
}

// Impacto/explosão: ruído filtrado com decay (boom abafado).
export function impacto() {
  const a = ac(); if (!a) return;
  const t0 = a.currentTime;
  const dur = 0.9;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  }
  const src = a.createBufferSource(); src.buffer = buf;
  const filtro = a.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 480;
  const g = a.createGain();
  g.gain.setValueAtTime(0.45, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filtro); filtro.connect(g); g.connect(a.destination);
  src.start(t0); src.stop(t0 + dur);
}

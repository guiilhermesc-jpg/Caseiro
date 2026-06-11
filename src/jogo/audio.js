// =============================================================
//  ÁUDIO (RV4.8) · efeitos e ambiente 100% SINTETIZADOS (WebAudio).
//  Zero arquivos: osciladores + ruído filtrado. Volume baixo de
//  propósito (game-feel, não fanfarra). Botão 🔊 liga/desliga e a
//  escolha fica salva (localStorage venor_som).
//  O contexto só nasce no 1º clique/toque (regra dos navegadores).
// =============================================================

export function criaAudio() {
  let ctx = null, master = null;
  let ligado = localStorage.getItem('venor_som') !== 'off';

  function garante() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.22; // discreto — o jogo fala baixo
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  document.addEventListener('pointerdown', garante, { once: true });

  // nota simples: oscilador com envelope curto (e deslize opcional de tom)
  function blip(freq, dur = 0.1, tipo = 'sine', vol = 0.5, slideTo = 0, atraso = 0) {
    if (!ligado || !garante()) return;
    const t0 = ctx.currentTime + atraso;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = tipo; osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }
  // sopro de ruído filtrado (água, vento, impacto)
  function sopro(dur = 0.25, freqCentro = 800, vol = 0.3, atraso = 0) {
    if (!ligado || !garante()) return;
    const t0 = ctx.currentTime + atraso;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freqCentro; f.Q.value = 1.2;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  const sons = {
    golpe() { blip(130, 0.07, 'square', 0.55, 55); sopro(0.06, 1800, 0.18); },        // impacto seco
    erro() { blip(220, 0.1, 'sawtooth', 0.25, 160); },                                  // golpe no ar
    moeda() { blip(880, 0.07, 'triangle', 0.4); blip(1318, 0.1, 'triangle', 0.32, 0, 0.06); },
    dor() { blip(170, 0.16, 'sawtooth', 0.45, 80); },                                   // levou dano
    tesouro() { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.14, 'triangle', 0.35, 0, i * 0.08)); },
    agua() { sopro(0.45, 520, 0.4); sopro(0.3, 900, 0.25, 0.12); },                     // barca/mergulho
    corda() { blip(190, 0.05, 'square', 0.3); blip(160, 0.05, 'square', 0.3, 0, 0.09); },
    grilo() { for (let i = 0; i < 3; i++) blip(4200, 0.025, 'sine', 0.1, 0, i * 0.07); },
    passaro() { blip(1900, 0.09, 'sine', 0.14, 2600); blip(2300, 0.07, 'sine', 0.12, 1800, 0.12); },
    coruja() { blip(430, 0.22, 'sine', 0.14, 370); blip(400, 0.3, 'sine', 0.12, 340, 0.32); },
  };

  // AMBIENTE: pássaros de dia, grilos (e uma coruja de vez em quando) à noite
  let pegaNoite = () => false;
  setInterval(() => {
    if (!ligado || !ctx || document.hidden) return;
    if (pegaNoite()) {
      const r = Math.random();
      if (r < 0.55) sons.grilo(); else if (r < 0.65) sons.coruja();
    } else if (Math.random() < 0.4) sons.passaro();
  }, 3800);

  // botão 🔊 (abaixo do 💾)
  const b = document.createElement('div');
  b.textContent = ligado ? '🔊' : '🔇';
  b.title = 'Som ligado/desligado';
  b.style.cssText = 'position:fixed;top:126px;left:14px;width:48px;height:48px;z-index:41;display:flex;'
    + 'align-items:center;justify-content:center;font-size:20px;cursor:pointer;user-select:none;'
    + 'background:rgba(16,22,32,.8);border:1px solid #3a4654;border-radius:12px;';
  b.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    ligado = !ligado;
    localStorage.setItem('venor_som', ligado ? 'on' : 'off');
    b.textContent = ligado ? '🔊' : '🔇';
    if (ligado) { garante(); sons.moeda(); }
  });
  document.body.appendChild(b);

  return { ...sons, defineNoite(fn) { pegaNoite = fn; } };
}

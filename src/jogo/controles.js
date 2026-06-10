// =============================================================
//  CONTROLES  ·  mover + câmera orbital + pular/correr/abaixar.
//
//  PC:    WASD/setas mover · arrastar mouse gira câmera ·
//         Espaço pular · Shift correr · C abaixar · E agir.
//  Mobile: metade ESQUERDA = joystick (mover); metade DIREITA =
//          arrastar gira câmera; PINÇA de 2 dedos = zoom da câmera;
//          botões compactos com ÍCONE (sem texto) no canto direito.
//  O zoom de página do navegador (duplo-toque/pinça do iOS) é BLOQUEADO.
//  Expõe: vetorMov(), cam{yaw,pitch}, querPular(), querAgir(),
//         correndo(), abaixado(), pegaPinch().
// =============================================================
export function criaControles(dom) {
  const teclas = {};
  const cam = { yaw: 0, pitch: 0.55 };
  const PITCH_MIN = 0.08, PITCH_MAX = 1.30;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const joy = { ativo: false, id: null, baseX: 0, baseY: 0, dx: 0, dz: 0 };
  const look = { ativo: false, id: null, lastX: 0, lastY: 0 };
  let correrToggle = false, abaixarToggle = false, pularFlag = false, agirFlag = false;

  // BLOQUEIA o zoom de página do navegador (duplo-toque no iPad dava zoom
  // sem volta; pinça idem) — o jogo controla o próprio zoom.
  let _ultimoToque = 0;
  document.addEventListener('touchend', (e) => {
    const agora = Date.now();
    if (agora - _ultimoToque < 350) e.preventDefault(); // duplo-toque
    _ultimoToque = agora;
  }, { passive: false });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    teclas[e.code] = true;
    if (e.code === 'Space') pularFlag = true;
    if (e.code === 'KeyE') agirFlag = true;
  });
  window.addEventListener('keyup', (e) => { teclas[e.code] = false; });

  // joystick visual
  let base, thumb;
  function garante() {
    if (base) return;
    base = document.createElement('div');
    base.style.cssText = 'position:fixed;width:120px;height:120px;border:3px solid rgba(255,255,255,.28);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);display:none;z-index:10';
    thumb = document.createElement('div');
    thumb.style.cssText = 'position:fixed;width:52px;height:52px;background:rgba(255,255,255,.32);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);display:none;z-index:11';
    document.body.appendChild(base); document.body.appendChild(thumb);
  }
  function mostraJoy(bx, by, tx, ty) {
    garante();
    base.style.left = bx + 'px'; base.style.top = by + 'px'; base.style.display = 'block';
    thumb.style.left = tx + 'px'; thumb.style.top = ty + 'px'; thumb.style.display = 'block';
  }
  function escondeJoy() { if (base) { base.style.display = 'none'; thumb.style.display = 'none'; } }

  // PINÇA (2 dedos) = zoom da câmera — main3d consome via pegaPinch()
  const toques = new Map();
  let pinchDist = 0, pinchFator = 1;

  dom.addEventListener('pointerdown', (e) => {
    const touch = e.pointerType === 'touch';
    if (touch) toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touch && !joy.ativo && toques.size === 2) { // virou pinça: solta a câmera
      look.ativo = false;
      const [a, b] = [...toques.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      return;
    }
    if (touch && e.clientX < window.innerWidth / 2) {
      joy.ativo = true; joy.id = e.pointerId; joy.baseX = e.clientX; joy.baseY = e.clientY; joy.dx = 0; joy.dz = 0;
      mostraJoy(e.clientX, e.clientY, e.clientX, e.clientY);
    } else {
      look.ativo = true; look.id = e.pointerId; look.lastX = e.clientX; look.lastY = e.clientY;
    }
  });
  dom.addEventListener('pointermove', (e) => {
    if (toques.has(e.pointerId)) toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!joy.ativo && toques.size === 2 && pinchDist > 0) { // pinça ativa
      const [a, b] = [...toques.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 10) { pinchFator *= pinchDist / d; pinchDist = d; }
      return;
    }
    if (joy.ativo && e.pointerId === joy.id) {
      let ox = e.clientX - joy.baseX, oy = e.clientY - joy.baseY;
      const dist = Math.hypot(ox, oy), R = 60;
      if (dist > R) { ox = ox / dist * R; oy = oy / dist * R; }
      joy.dx = ox / R; joy.dz = oy / R;
      mostraJoy(joy.baseX, joy.baseY, joy.baseX + ox, joy.baseY + oy);
    } else if (look.ativo && e.pointerId === look.id) {
      const dx = e.clientX - look.lastX, dy = e.clientY - look.lastY;
      look.lastX = e.clientX; look.lastY = e.clientY;
      cam.yaw -= dx * 0.005;
      cam.pitch = clamp(cam.pitch + dy * 0.005, PITCH_MIN, PITCH_MAX);
    }
  });
  const up = (e) => {
    toques.delete(e.pointerId);
    if (toques.size < 2) pinchDist = 0;
    if (joy.id === e.pointerId) { joy.ativo = false; joy.dx = 0; joy.dz = 0; escondeJoy(); }
    if (look.id === e.pointerId) { look.ativo = false; }
  };
  dom.addEventListener('pointerup', up);
  dom.addEventListener('pointercancel', up);

  // BOTÕES compactos com ÍCONE (alinhados em arco no canto inferior direito)
  function botao(icone, titulo, css, onTap) {
    const b = document.createElement('div');
    b.textContent = icone;
    b.title = titulo;
    b.style.cssText = 'position:fixed;border-radius:50%;background:rgba(16,22,32,.5);border:2px solid rgba(255,255,255,.35);'
      + 'display:flex;align-items:center;justify-content:center;z-index:12;user-select:none;touch-action:none;'
      + 'box-shadow:0 3px 10px rgba(0,0,0,.35);' + css;
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); onTap(b); });
    b.addEventListener('touchend', (e) => e.preventDefault(), { passive: false }); // sem zoom de toque repetido
    document.body.appendChild(b);
    return b;
  }
  // AÇÃO (dourado, principal) + PULAR ao lado; CORRER/ABAIXAR menores acima
  const btnAcao = botao('✋', 'Ação (E)', 'right:96px;bottom:28px;width:66px;height:66px;font-size:28px;background:rgba(230,180,60,.35);border-color:rgba(255,210,90,.75);', () => {
    agirFlag = true;
    btnAcao.style.background = 'rgba(255,210,90,.6)';
    setTimeout(() => { btnAcao.style.background = 'rgba(230,180,60,.35)'; }, 120);
  });
  botao('⬆️', 'Pular (Espaço)', 'right:22px;bottom:76px;width:58px;height:58px;font-size:24px;', () => { pularFlag = true; });
  botao('🏃', 'Correr (Shift)', 'right:104px;bottom:104px;width:46px;height:46px;font-size:20px;', (b) => {
    correrToggle = !correrToggle;
    b.style.background = correrToggle ? 'rgba(120,220,120,.5)' : 'rgba(16,22,32,.5)';
  });
  botao('🔽', 'Abaixar (C)', 'right:32px;bottom:142px;width:44px;height:44px;font-size:18px;', (b) => {
    abaixarToggle = !abaixarToggle;
    b.style.background = abaixarToggle ? 'rgba(120,180,255,.5)' : 'rgba(16,22,32,.5)';
  });

  function vetorMov() {
    let x = 0, z = 0;
    if (teclas['KeyA'] || teclas['ArrowLeft']) x -= 1;
    if (teclas['KeyD'] || teclas['ArrowRight']) x += 1;
    if (teclas['KeyW'] || teclas['ArrowUp']) z -= 1;
    if (teclas['KeyS'] || teclas['ArrowDown']) z += 1;
    if (joy.ativo) { x += joy.dx; z += joy.dz; }
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    return { x, z };
  }

  return {
    vetorMov,
    cam,
    querPular: () => { if (pularFlag) { pularFlag = false; return true; } return false; },
    querAgir: () => { if (agirFlag) { agirFlag = false; return true; } return false; },
    correndo: () => !!(teclas['ShiftLeft'] || teclas['ShiftRight'] || correrToggle),
    abaixado: () => !!(teclas['KeyC'] || abaixarToggle),
    // fator de pinça acumulado desde o último frame (1 = sem mudança)
    pegaPinch: () => { const f = pinchFator; pinchFator = 1; return f; },
  };
}

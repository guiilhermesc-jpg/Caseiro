// =============================================================
//  CONTROLES  ·  mover (teclado/joystick) + câmera orbital (arrasto).
//
//  Desktop: WASD/setas movem; arrastar o mouse gira a câmera.
//  Mobile:  metade ESQUERDA da tela = joystick (mover);
//           metade DIREITA = arrastar pra girar a câmera.
//  Expõe: vetorMov() -> {x,z} (input bruto) e cam {yaw, pitch}.
// =============================================================
export function criaControles(dom) {
  const teclas = {};
  window.addEventListener('keydown', (e) => { teclas[e.code] = true; });
  window.addEventListener('keyup', (e) => { teclas[e.code] = false; });

  const cam = { yaw: 0, pitch: 0.55 };
  const PITCH_MIN = 0.08, PITCH_MAX = 1.30; // até onde dá pra subir/baixar a visão
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const joy = { ativo: false, id: null, baseX: 0, baseY: 0, dx: 0, dz: 0 };
  const look = { ativo: false, id: null, lastX: 0, lastY: 0 };

  let base, thumb;
  function garante() {
    if (base) return;
    base = document.createElement('div');
    base.style.cssText = 'position:fixed;width:130px;height:130px;border:3px solid rgba(255,255,255,.28);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);display:none;z-index:10';
    thumb = document.createElement('div');
    thumb.style.cssText = 'position:fixed;width:58px;height:58px;background:rgba(255,255,255,.32);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);display:none;z-index:11';
    document.body.appendChild(base); document.body.appendChild(thumb);
  }
  function mostraJoy(bx, by, tx, ty) {
    garante();
    base.style.left = bx + 'px'; base.style.top = by + 'px'; base.style.display = 'block';
    thumb.style.left = tx + 'px'; thumb.style.top = ty + 'px'; thumb.style.display = 'block';
  }
  function escondeJoy() { if (base) { base.style.display = 'none'; thumb.style.display = 'none'; } }

  dom.addEventListener('pointerdown', (e) => {
    const touch = e.pointerType === 'touch';
    if (touch && e.clientX < window.innerWidth / 2) {
      joy.ativo = true; joy.id = e.pointerId; joy.baseX = e.clientX; joy.baseY = e.clientY; joy.dx = 0; joy.dz = 0;
      mostraJoy(e.clientX, e.clientY, e.clientX, e.clientY);
    } else {
      look.ativo = true; look.id = e.pointerId; look.lastX = e.clientX; look.lastY = e.clientY;
    }
  });
  dom.addEventListener('pointermove', (e) => {
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
    if (joy.id === e.pointerId) { joy.ativo = false; joy.dx = 0; joy.dz = 0; escondeJoy(); }
    if (look.id === e.pointerId) { look.ativo = false; }
  };
  dom.addEventListener('pointerup', up);
  dom.addEventListener('pointercancel', up);

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

  return { vetorMov, cam };
}

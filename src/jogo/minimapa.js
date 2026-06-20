// =============================================================
//  MINIMAPA / MAPA-MUNDI · HUD no canto + painel ampliado clicável.
//  Radar pequeno fica centrado no jogador; clique/toque nele abre o mapa
//  inteiro em escala real do mundo, com cidades, lojas, marcos e destino.
//  Norte fixo (mapa não gira), linguagem próxima de automap de RPG clássico.
// =============================================================
const MARCO_COR = {
  igreja: '#ededed', hospital: '#e24a4a', delegacia: '#4a78e2', escola: '#e2c24a',
};
const corHex = (c) => '#' + ((c >>> 0) & 0xffffff).toString(16).padStart(6, '0');

export function criaMinimapa({ obstaculos = [], ruas = [], marcos = [], lugares = [], lojas = [], rotas = [], veios = [], pedrasVeio = [], regiao = null, alcance = 90, onMarcar = null, onLimpar = null }) {
  const TAM = 150;
  const MAP_W = 980, MAP_H = 640;
  const mundo = regiao || { minX: -430, maxX: 830, minZ: -490, maxZ: 490 };
  const cnv = document.createElement('canvas');
  cnv.width = TAM; cnv.height = TAM;
  cnv.style.cssText = `position:fixed;top:14px;right:14px;width:${TAM}px;height:${TAM}px;`
    + 'border:2px solid rgba(255,255,255,.5);border-radius:12px;z-index:20;'
    + 'background:#5c7d44;box-shadow:0 4px 16px rgba(0,0,0,.45);pointer-events:auto;'
    + 'display:none;cursor:pointer;touch-action:manipulation;';
  cnv.title = 'Abrir mapa do mundo';
  document.body.appendChild(cnv);

  const ctx = cnv.getContext('2d');
  const cx = TAM / 2, cy = TAM / 2;
  let alc = alcance;                  // alcance ATUAL (muda com o zoom)
  let esc = (TAM / 2 - 6) / alc;      // mundo -> pixels
  let ultimoAvatar = null, ultimosOutros = null;
  let destino = null;

  // ZOOM do minimapa: botões 🔍 colados no mapa (canto direito, logo abaixo)
  function zoom(f) { alc = Math.max(45, Math.min(360, alc * f)); esc = (TAM / 2 - 6) / alc; }
  const botoes = [];
  function botaoZoom(txt, right, f) {
    const b = document.createElement('div');
    b.textContent = txt;
    b.style.cssText = `position:fixed;top:${14 + TAM + 6}px;right:${right}px;width:38px;height:34px;z-index:21;display:none;`
      + 'align-items:center;justify-content:center;font-size:15px;cursor:pointer;user-select:none;'
      + 'background:rgba(16,22,32,.85);border:1px solid #3a4654;border-radius:9px;color:#fff;';
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); zoom(f); });
    document.body.appendChild(b); botoes.push(b);
  }
  botaoZoom('🔍+', 58, 0.72); // aproxima (vê menos área, maior detalhe)
  botaoZoom('🔍−', 14, 1.38); // afasta (vê mais área)

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:70;display:none;align-items:center;justify-content:center;'
    + 'background:rgba(5,8,12,.72);font-family:Arial,sans-serif;color:#eef3f8;touch-action:none;';
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) fechaMapa(); });
  const painel = document.createElement('div');
  painel.style.cssText = 'width:min(94vw,1040px);max-height:92vh;background:#101822;border:1px solid #425063;'
    + 'border-radius:8px;box-shadow:0 18px 60px rgba(0,0,0,.65);padding:12px;display:flex;flex-direction:column;gap:9px;';
  painel.addEventListener('pointerdown', (e) => e.stopPropagation());
  const topo = document.createElement('div');
  topo.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;';
  const titulo = document.createElement('div');
  titulo.innerHTML = '<b style="font-size:16px;">🗺️ Mapa de Venor</b>'
    + '<span style="display:block;font-size:12px;color:#aeb9c8;margin-top:2px;">clique no mapa para marcar um destino; Esc fecha</span>';
  const acoesTopo = document.createElement('div');
  acoesTopo.style.cssText = 'display:flex;gap:7px;align-items:center;';
  const limpar = document.createElement('button');
  limpar.textContent = 'Limpar destino';
  limpar.title = 'Remover marcação do mapa';
  limpar.style.cssText = 'height:32px;border-radius:8px;border:1px solid #445266;'
    + 'background:#172334;color:#e8eef7;font-size:12px;cursor:pointer;padding:0 10px;';
  limpar.addEventListener('pointerdown', (e) => { e.stopPropagation(); limpaDestino(); });
  const fechar = document.createElement('button');
  fechar.textContent = '✕';
  fechar.title = 'Fechar mapa';
  fechar.style.cssText = 'width:36px;height:32px;border-radius:8px;border:1px solid #445266;'
    + 'background:#172334;color:#e8eef7;font-size:17px;cursor:pointer;';
  fechar.addEventListener('pointerdown', (e) => { e.stopPropagation(); fechaMapa(); });
  acoesTopo.appendChild(limpar); acoesTopo.appendChild(fechar);
  topo.appendChild(titulo); topo.appendChild(acoesTopo);
  const mapa = document.createElement('canvas');
  mapa.width = MAP_W; mapa.height = MAP_H;
  mapa.style.cssText = 'width:100%;height:auto;max-height:72vh;aspect-ratio:980/640;background:#5c7d44;'
    + 'border:1px solid #344458;border-radius:6px;cursor:crosshair;touch-action:none;';
  const legenda = document.createElement('div');
  legenda.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px 16px;color:#b9c6d8;font-size:12px;line-height:1.35;';
  legenda.innerHTML = '<span>▲ você</span><span>◎ destino</span><span>■ cidade/construção</span><span>⚒️/💰 lojas</span><span>texto dourado = região</span>';
  painel.appendChild(topo); painel.appendChild(mapa); painel.appendChild(legenda);
  overlay.appendChild(painel); document.body.appendChild(overlay);
  const mctx = mapa.getContext('2d');

  function mostra() { cnv.style.display = 'block'; botoes.forEach((b) => { b.style.display = 'flex'; }); }
  function esconde() { cnv.style.display = 'none'; botoes.forEach((b) => { b.style.display = 'none'; }); fechaMapa(); }
  function abreMapa() { overlay.style.display = 'flex'; desenhaMapaGrande(); }
  function fechaMapa() { overlay.style.display = 'none'; }
  function toggleMapa() { overlay.style.display === 'none' ? abreMapa() : fechaMapa(); }
  function limpaDestino(silencioso = false) {
    destino = null;
    desenhaMapaGrande();
    if (onLimpar) onLimpar(silencioso);
  }

  cnv.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); abreMapa(); });
  window.addEventListener('keydown', (e) => { if (e.code === 'Escape' && overlay.style.display !== 'none') fechaMapa(); });

  const sxM = (x) => (x - mundo.minX) / (mundo.maxX - mundo.minX) * MAP_W;
  const syM = (z) => (z - mundo.minZ) / (mundo.maxZ - mundo.minZ) * MAP_H;
  const wxM = (x) => mundo.minX + x / MAP_W * (mundo.maxX - mundo.minX);
  const wzM = (y) => mundo.minZ + y / MAP_H * (mundo.maxZ - mundo.minZ);

  mapa.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const r = mapa.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width * MAP_W;
    const py = (e.clientY - r.top) / r.height * MAP_H;
    const x = wxM(px), z = wzM(py);
    const perto = lugares.reduce((best, L) => {
      const d = Math.hypot(L.x - x, L.z - z);
      return d < best.d ? { L, d } : best;
    }, { L: null, d: Infinity });
    destino = { x, z, nome: perto.d < 38 ? perto.L.nome : 'Destino marcado' };
    desenhaMapaGrande();
    if (onMarcar && ultimoAvatar) {
      const dist = Math.round(Math.hypot(x - ultimoAvatar.position.x, z - ultimoAvatar.position.z));
      onMarcar({ ...destino, dist });
    }
  });

  function setaCentro(rot) {
    const fx = Math.sin(rot), fy = Math.cos(rot), rx = -fy, ry = fx;
    ctx.beginPath();
    ctx.moveTo(cx + fx * 8, cy + fy * 8);
    ctx.lineTo(cx - fx * 4 + rx * 5, cy - fy * 4 + ry * 5);
    ctx.lineTo(cx - fx * 4 - rx * 5, cy - fy * 4 - ry * 5);
    ctx.closePath();
    ctx.fillStyle = '#ffd23f'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#1a1a1a'; ctx.stroke();
  }

  function setaMapa(x, y, rot, cor = '#ffd23f') {
    const fx = Math.sin(rot), fy = Math.cos(rot), rx = -fy, ry = fx;
    mctx.beginPath();
    mctx.moveTo(x + fx * 10, y + fy * 10);
    mctx.lineTo(x - fx * 6 + rx * 6, y - fy * 6 + ry * 6);
    mctx.lineTo(x - fx * 6 - rx * 6, y - fy * 6 - ry * 6);
    mctx.closePath();
    mctx.fillStyle = cor; mctx.fill();
    mctx.lineWidth = 2; mctx.strokeStyle = '#111'; mctx.stroke();
  }

  function textoMapa(txt, x, y, cor = '#ffe9b0', maxW = 130) {
    mctx.font = 'bold 12px Arial'; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
    const w = Math.min(maxW, mctx.measureText(txt).width + 8);
    mctx.fillStyle = 'rgba(10,14,20,.7)';
    mctx.fillRect(x - w / 2, y - 8, w, 16);
    mctx.fillStyle = cor;
    mctx.fillText(txt, x, y);
  }

  function desenhaMapaGrande() {
    mctx.clearRect(0, 0, MAP_W, MAP_H);
    mctx.fillStyle = '#5c7d44'; mctx.fillRect(0, 0, MAP_W, MAP_H);
    // textura sutil de mapa antigo/grama, determinística pelo grid
    for (let x = 0; x < MAP_W; x += 28) {
      for (let y = 0; y < MAP_H; y += 28) {
        const n = ((x * 31 + y * 17) % 97) / 97;
        mctx.fillStyle = n > 0.5 ? 'rgba(95,130,74,.28)' : 'rgba(70,96,54,.18)';
        mctx.fillRect(x, y, 28, 28);
      }
    }
    mctx.strokeStyle = 'rgba(20,26,34,.22)'; mctx.lineWidth = 1;
    for (let gx = Math.ceil(mundo.minX / 100) * 100; gx <= mundo.maxX; gx += 100) {
      const x = sxM(gx); mctx.beginPath(); mctx.moveTo(x, 0); mctx.lineTo(x, MAP_H); mctx.stroke();
    }
    for (let gz = Math.ceil(mundo.minZ / 100) * 100; gz <= mundo.maxZ; gz += 100) {
      const y = syM(gz); mctx.beginPath(); mctx.moveTo(0, y); mctx.lineTo(MAP_W, y); mctx.stroke();
    }
    // rotas principais
    mctx.strokeStyle = 'rgba(80,78,72,.92)'; mctx.lineCap = 'round';
    for (const r of rotas) {
      mctx.lineWidth = Math.max(3, (r.w || 8) * MAP_W / (mundo.maxX - mundo.minX));
      mctx.beginPath(); mctx.moveTo(sxM(r.x1), syM(r.z1)); mctx.lineTo(sxM(r.x2), syM(r.z2)); mctx.stroke();
    }
    // VEIOS sentidos (RV9.1): as "linhas reais" da Veia ligando os nós —
    // desenhadas com brilho na cor do veio, só depois de SENTIDAS
    for (const v of veios) {
      if (!v.sentido || (v.segredo && !v.revelado) || !v.pts || v.pts.length < 2) continue;
      const hx = corHex(v.cor);
      mctx.strokeStyle = hx; mctx.lineWidth = 2.6; mctx.globalAlpha = 0.92;
      mctx.shadowColor = hx; mctx.shadowBlur = 9; mctx.lineCap = 'round'; mctx.lineJoin = 'round';
      mctx.beginPath();
      v.pts.forEach((p, i) => { const X = sxM(p[0]), Y = syM(p[1]); i ? mctx.lineTo(X, Y) : mctx.moveTo(X, Y); });
      mctx.stroke();
      mctx.shadowBlur = 0; mctx.globalAlpha = 1;
    }
    // Pedras-Veio (nós): glifo gravado, brilha quando sentido, cinza quando não
    for (const p of pedrasVeio) {
      if (p.segredo && !p.revelado && !p.sentido) continue; // a Boca só aparece após revelada
      const X = sxM(p.x), Y = syM(p.z); const hx = corHex(p.cor);
      mctx.beginPath(); mctx.arc(X, Y, 5.5, 0, Math.PI * 2);
      mctx.fillStyle = p.sentido ? hx : 'rgba(140,140,150,.85)';
      if (p.sentido) { mctx.shadowColor = hx; mctx.shadowBlur = 10; }
      mctx.fill(); mctx.shadowBlur = 0;
      mctx.lineWidth = 1.5; mctx.strokeStyle = '#0a0a0a'; mctx.stroke();
    }

    // construções e cidades
    mctx.fillStyle = 'rgba(31,38,48,.56)';
    for (const o of obstaculos) {
      const x = sxM(o.minX), y = syM(o.minZ);
      const w = (o.maxX - o.minX) / (mundo.maxX - mundo.minX) * MAP_W;
      const h = (o.maxZ - o.minZ) / (mundo.maxZ - mundo.minZ) * MAP_H;
      if (w < 0.8 || h < 0.8) continue;
      mctx.fillRect(x, y, w, h);
    }
    // marcos
    for (const m of marcos) {
      mctx.fillStyle = MARCO_COR[m.tipo] || '#e8eef7';
      const x = sxM(m.x), y = syM(m.z);
      mctx.fillRect(x - 4, y - 4, 8, 8);
      mctx.strokeStyle = 'rgba(0,0,0,.55)'; mctx.lineWidth = 1; mctx.strokeRect(x - 4, y - 4, 8, 8);
    }
    // lojas
    mctx.font = '16px Arial'; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
    for (const L of lojas) mctx.fillText(L.icone, sxM(L.x), syM(L.z));
    // lugares: desenha em ordem do próprio jogo, mas evita nomes na borda
    for (const L of lugares) {
      const x = sxM(L.x), y = syM(L.z);
      if (x < 18 || x > MAP_W - 18 || y < 14 || y > MAP_H - 14) continue;
      textoMapa(L.nome, x, y);
    }
    if (destino) {
      const x = sxM(destino.x), y = syM(destino.z);
      mctx.beginPath(); mctx.arc(x, y, 9, 0, Math.PI * 2);
      mctx.strokeStyle = '#ffdf5a'; mctx.lineWidth = 3; mctx.stroke();
      mctx.beginPath(); mctx.moveTo(x - 13, y); mctx.lineTo(x + 13, y); mctx.moveTo(x, y - 13); mctx.lineTo(x, y + 13); mctx.stroke();
      textoMapa(destino.nome, x, y - 18, '#ffdf5a', 160);
    }
    if (ultimosOutros) {
      for (const [, o] of ultimosOutros) {
        const p = o.grupo.position;
        mctx.beginPath(); mctx.arc(sxM(p.x), syM(p.z), 4.5, 0, Math.PI * 2);
        mctx.fillStyle = corHex(o.cor ?? 0xffffff); mctx.fill();
        mctx.strokeStyle = '#111'; mctx.stroke();
      }
    }
    if (ultimoAvatar) setaMapa(sxM(ultimoAvatar.position.x), syM(ultimoAvatar.position.z), ultimoAvatar.rotation.y);
  }

  function atualiza(avatar, outros) {
    ultimoAvatar = avatar; ultimosOutros = outros || null;
    const ax = avatar.position.x, az = avatar.position.z;
    const sx = (wx) => cx + (wx - ax) * esc;   // relativo ao jogador
    const sy = (wz) => cy + (wz - az) * esc;
    const perto = (x, z, m = alc * 1.4) => Math.abs(x - ax) < m && Math.abs(z - az) < m;

    ctx.clearRect(0, 0, TAM, TAM);
    ctx.fillStyle = '#5c7d44'; ctx.fillRect(0, 0, TAM, TAM);

    // ruas (faixas largura 8)
    ctx.fillStyle = 'rgba(70,76,82,.85)';
    const w = 8 * esc;
    for (const c of ruas) {
      ctx.fillRect(0, sy(c) - w / 2, TAM, w);
      ctx.fillRect(sx(c) - w / 2, 0, w, TAM);
    }

    // praça central
    const pw = 30 * esc;
    ctx.fillStyle = 'rgba(154,144,130,.92)';
    ctx.fillRect(sx(0) - pw / 2, sy(0) - pw / 2, pw, pw);

    // construções próximas
    ctx.fillStyle = 'rgba(38,44,52,.55)';
    for (const o of obstaculos) {
      const ox = (o.minX + o.maxX) / 2, oz = (o.minZ + o.maxZ) / 2;
      if (!perto(ox, oz)) continue;
      ctx.fillRect(sx(o.minX), sy(o.minZ), (o.maxX - o.minX) * esc, (o.maxZ - o.minZ) * esc);
    }

    // marcos coloridos
    for (const m of marcos) {
      if (!perto(m.x, m.z)) continue;
      ctx.fillStyle = MARCO_COR[m.tipo] || '#fff';
      ctx.fillRect(sx(m.x) - 4.5, sy(m.z) - 4.5, 9, 9);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.5)';
      ctx.strokeRect(sx(m.x) - 4.5, sy(m.z) - 4.5, 9, 9);
    }

    // LOJAS com ícone (estilo Tibia: ⚒️ ferreiro, ✨ runas, 🏹 arco, 🧪 poções, 💰 mercador)
    if (lojas.length) {
      ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const L of lojas) {
        if (!perto(L.x, L.z, alc)) continue;
        const px = sx(L.x), py = sy(L.z);
        if (px < 7 || px > TAM - 7 || py < 7 || py > TAM - 7) continue;
        ctx.fillText(L.icone, px, py);
      }
    }

    // rótulos de ruas/lugares (nomes), só os próximos e dentro do quadro
    if (lugares.length) {
      ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const L of lugares) {
        if (!perto(L.x, L.z, alc)) continue;
        const px = sx(L.x), py = sy(L.z);
        if (px < 6 || px > TAM - 6 || py < 7 || py > TAM - 5) continue;
        const w = ctx.measureText(L.nome).width;
        ctx.fillStyle = 'rgba(12,16,22,.66)';
        ctx.fillRect(px - w / 2 - 2, py - 6, w + 4, 12);
        ctx.fillStyle = '#ffe9b0';
        ctx.fillText(L.nome, px, py);
      }
    }

    // outros jogadores
    if (outros) {
      for (const [, o] of outros) {
        const p = o.grupo.position;
        if (!perto(p.x, p.z)) continue;
        ctx.beginPath();
        ctx.arc(sx(p.x), sy(p.z), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = corHex(o.cor ?? 0xffffff); ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.stroke();
      }
    }

    if (destino) {
      const px = sx(destino.x), py = sy(destino.z);
      ctx.strokeStyle = '#ffdf5a'; ctx.lineWidth = 2;
      if (px >= 8 && px <= TAM - 8 && py >= 8 && py <= TAM - 8) {
        ctx.beginPath(); ctx.arc(px, py, 5.5, 0, Math.PI * 2); ctx.stroke();
      } else {
        const dx = destino.x - ax, dy = destino.z - az;
        const a = Math.atan2(dy, dx);
        const ex = cx + Math.cos(a) * (TAM / 2 - 13), ey = cy + Math.sin(a) * (TAM / 2 - 13);
        ctx.beginPath();
        ctx.moveTo(ex + Math.cos(a) * 6, ey + Math.sin(a) * 6);
        ctx.lineTo(ex + Math.cos(a + 2.55) * 6, ey + Math.sin(a + 2.55) * 6);
        ctx.lineTo(ex + Math.cos(a - 2.55) * 6, ey + Math.sin(a - 2.55) * 6);
        ctx.closePath(); ctx.fillStyle = '#ffdf5a'; ctx.fill();
      }
    }

    // VOCÊ (sempre no centro)
    setaCentro(avatar.rotation.y);
    if (overlay.style.display !== 'none') desenhaMapaGrande();
  }

  return { atualiza, mostra, esconde, zoom, abreMapa, fechaMapa, toggleMapa, limpaDestino, el: cnv };
}

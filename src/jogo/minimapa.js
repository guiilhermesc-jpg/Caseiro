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
  titulo.innerHTML = '<b style="font-size:16px;">Mapa Continental - Pacto 01/30</b>'
    + '<span style="display:block;font-size:12px;color:#aeb9c8;margin-top:2px;">Venor, rotas, hunts e ilhas flutuantes; clique para marcar destino; Esc fecha</span>';
  mapa.style.cssText = 'width:100%;height:auto;max-height:72vh;aspect-ratio:980/640;background:#152b38;'
    + 'border:1px solid #6b5a3a;border-radius:6px;cursor:crosshair;touch-action:none;';
  legenda.innerHTML = '<span>triangulo = voce</span><span>circulo = destino</span><span>quadrado = cidade/base</span><span>linha dourada = rota</span><span>ilha clara = zona aerea</span><span>texto dourado = regiao/hunt</span>';
  painel.appendChild(topo); painel.appendChild(mapa); painel.appendChild(legenda);
  overlay.appendChild(painel); document.body.appendChild(overlay);
  const mctx = mapa.getContext('2d');

  function mostra() { cnv.style.display = 'block'; botoes.forEach((b) => { b.style.display = 'flex'; }); }
  function esconde() { cnv.style.display = 'none'; botoes.forEach((b) => { b.style.display = 'none'; }); fechaMapa(); }
  function abreMapa() { overlay.style.display = 'flex'; desenhaMapaGrandePremium(); }
  function fechaMapa() { overlay.style.display = 'none'; }
  function toggleMapa() { overlay.style.display === 'none' ? abreMapa() : fechaMapa(); }
  function limpaDestino(silencioso = false) {
    destino = null;
    desenhaMapaGrandePremium();
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

  function desenhaMapaGrandePremium() {
    const W = MAP_W, H = MAP_H;
    const mundoW = mundo.maxX - mundo.minX;
    const mundoH = mundo.maxZ - mundo.minZ;
    const px = (x) => sxM(x);
    const py = (z) => syM(z);
    const continente = [
      [-890, -255], [-830, -390], [-650, -450], [-475, -382], [-305, -438],
      [-120, -360], [80, -430], [260, -384], [455, -430], [690, -318],
      [815, -118], [802, 78], [710, 224], [760, 406], [570, 468],
      [338, 436], [136, 492], [-82, 414], [-270, 462], [-436, 322],
      [-640, 264], [-816, 92], [-878, -86],
    ];

    const pathMundo = (pts) => {
      mctx.beginPath();
      pts.forEach(([x, z], i) => { i ? mctx.lineTo(px(x), py(z)) : mctx.moveTo(px(x), py(z)); });
      mctx.closePath();
    };

    const poligonoMundo = (pts, fill, stroke = 'rgba(38,25,12,.75)', lw = 2) => {
      pathMundo(pts);
      mctx.fillStyle = fill; mctx.fill();
      mctx.lineWidth = lw; mctx.strokeStyle = stroke; mctx.stroke();
    };

    const elipseMundo = (x, z, rx, rz, fill, stroke = null, lw = 1) => {
      mctx.beginPath();
      mctx.ellipse(px(x), py(z), rx / mundoW * W, rz / mundoH * H, 0, 0, Math.PI * 2);
      mctx.fillStyle = fill; mctx.fill();
      if (stroke) { mctx.lineWidth = lw; mctx.strokeStyle = stroke; mctx.stroke(); }
    };

    const linhaMundo = (pts, stroke, lw, sombra = null) => {
      mctx.save();
      if (sombra) { mctx.shadowColor = sombra; mctx.shadowBlur = 9; }
      mctx.strokeStyle = stroke; mctx.lineWidth = lw; mctx.lineCap = 'round'; mctx.lineJoin = 'round';
      mctx.beginPath();
      pts.forEach(([x, z], i) => { i ? mctx.lineTo(px(x), py(z)) : mctx.moveTo(px(x), py(z)); });
      mctx.stroke();
      mctx.restore();
    };

    const etiqueta = (txt, x, y, opt = {}) => {
      const tam = opt.tam || 12;
      const font = opt.font || 'Georgia,serif';
      const cor = opt.cor || '#f5ddb0';
      const maxW = opt.maxW || 170;
      mctx.save();
      mctx.font = `${opt.bold === false ? '' : 'bold '}${tam}px ${font}`;
      mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
      const w = Math.min(maxW, mctx.measureText(txt).width + 14);
      const h = tam + 9;
      mctx.fillStyle = opt.fundo || 'rgba(31,23,15,.76)';
      mctx.strokeStyle = opt.borda || 'rgba(231,196,118,.42)';
      mctx.lineWidth = 1;
      mctx.fillRect(x - w / 2, y - h / 2, w, h);
      mctx.strokeRect(x - w / 2, y - h / 2, w, h);
      mctx.shadowColor = 'rgba(0,0,0,.75)'; mctx.shadowBlur = 5;
      mctx.fillStyle = cor; mctx.fillText(txt, x, y + 0.5);
      mctx.restore();
    };

    const etiquetaMundo = (txt, x, z, opt = {}) => etiqueta(txt, px(x), py(z), opt);

    const montanha = (x, z, s = 1, neve = false, cor = '#6f6d61') => {
      const X = px(x), Y = py(z), b = 18 * s, h = 32 * s;
      mctx.beginPath();
      mctx.moveTo(X - b, Y + h * 0.38);
      mctx.lineTo(X, Y - h);
      mctx.lineTo(X + b, Y + h * 0.38);
      mctx.closePath();
      mctx.fillStyle = cor; mctx.fill();
      mctx.strokeStyle = 'rgba(34,24,16,.55)'; mctx.lineWidth = 1.2; mctx.stroke();
      if (neve) {
        mctx.beginPath();
        mctx.moveTo(X - b * 0.32, Y - h * 0.35);
        mctx.lineTo(X, Y - h);
        mctx.lineTo(X + b * 0.34, Y - h * 0.35);
        mctx.closePath();
        mctx.fillStyle = 'rgba(230,238,235,.86)'; mctx.fill();
      }
    };

    const floresta = (x, z, r, cor = '#244b31') => {
      const X = px(x), Y = py(z), rr = r / mundoW * W;
      for (let i = 0; i < 34; i++) {
        const a = i * 2.399;
        const d = rr * (0.18 + ((i * 37) % 100) / 130);
        const tx = X + Math.cos(a) * d * 1.35;
        const ty = Y + Math.sin(a) * d * 0.72;
        mctx.beginPath();
        mctx.moveTo(tx, ty - 7);
        mctx.lineTo(tx - 5, ty + 5);
        mctx.lineTo(tx + 5, ty + 5);
        mctx.closePath();
        mctx.fillStyle = i % 3 ? cor : '#315f3a';
        mctx.fill();
      }
    };

    const ilhaFlutuante = (x, y, w, h, nome, detalhe) => {
      mctx.save();
      mctx.shadowColor = 'rgba(120,170,255,.55)'; mctx.shadowBlur = 18;
      const grad = mctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
      grad.addColorStop(0, '#e4d5a8'); grad.addColorStop(0.55, '#91815b'); grad.addColorStop(1, '#493821');
      mctx.beginPath();
      mctx.ellipse(x, y, w / 2, h / 2, -0.08, 0, Math.PI * 2);
      mctx.fillStyle = grad; mctx.fill();
      mctx.strokeStyle = 'rgba(255,239,190,.62)'; mctx.lineWidth = 1.5; mctx.stroke();
      mctx.shadowBlur = 0;
      mctx.beginPath();
      mctx.moveTo(x - w * 0.28, y + h * 0.28);
      mctx.lineTo(x - w * 0.06, y + h * 0.86);
      mctx.lineTo(x + w * 0.14, y + h * 0.24);
      mctx.closePath();
      mctx.fillStyle = '#4a3520'; mctx.fill();
      mctx.strokeStyle = 'rgba(16,12,9,.7)'; mctx.stroke();
      mctx.strokeStyle = 'rgba(159,207,255,.45)'; mctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        mctx.beginPath(); mctx.moveTo(x + i * w * 0.16, y + h * 0.34); mctx.lineTo(x + i * w * 0.13, y + h * 1.28); mctx.stroke();
      }
      mctx.fillStyle = '#343029';
      mctx.fillRect(x - 14, y - h * 0.38, 28, 20);
      mctx.fillRect(x - 4, y - h * 0.72, 8, 34);
      etiqueta(nome, x, y - h * 0.82, { tam: 11, maxW: 150, cor: '#f8edc5', fundo: 'rgba(20,24,35,.78)' });
      if (detalhe) etiqueta(detalhe, x, y + h * 0.74, { tam: 10, bold: false, maxW: 170, cor: '#c7dcff', fundo: 'rgba(20,24,35,.58)', borda: 'rgba(130,170,255,.28)' });
      mctx.restore();
    };

    mctx.clearRect(0, 0, W, H);
    const mar = mctx.createLinearGradient(0, 0, W, H);
    mar.addColorStop(0, '#102b3a');
    mar.addColorStop(0.42, '#1f5160');
    mar.addColorStop(0.75, '#14364d');
    mar.addColorStop(1, '#0b1b2a');
    mctx.fillStyle = mar; mctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 160; i++) {
      const x = (i * 73) % W;
      const y = (i * 149) % H;
      const a = 0.035 + ((i * 19) % 40) / 900;
      mctx.fillStyle = `rgba(229,216,172,${a})`;
      mctx.fillRect(x, y, 1 + (i % 3), 1);
    }

    // mares e margens: duas sombras deixam a costa menos "debug" e mais mapa pintado.
    pathMundo(continente);
    mctx.save();
    mctx.shadowColor = 'rgba(248,223,159,.36)'; mctx.shadowBlur = 14;
    mctx.strokeStyle = 'rgba(242,214,148,.62)'; mctx.lineWidth = 6; mctx.stroke();
    mctx.restore();
    const terra = mctx.createLinearGradient(0, 70, W, H - 40);
    terra.addColorStop(0, '#776b43');
    terra.addColorStop(0.28, '#3f6b3f');
    terra.addColorStop(0.55, '#8a7444');
    terra.addColorStop(0.76, '#b89459');
    terra.addColorStop(1, '#5e4632');
    poligonoMundo(continente, terra, 'rgba(44,27,12,.84)', 2.4);

    mctx.save();
    pathMundo(continente);
    mctx.clip();
    elipseMundo(-520, -70, 250, 210, 'rgba(25,79,43,.56)');
    elipseMundo(-350, -12, 180, 110, 'rgba(35,87,61,.42)');
    elipseMundo(70, 5, 260, 155, 'rgba(99,133,70,.38)');
    elipseMundo(575, 246, 280, 230, 'rgba(210,165,83,.48)');
    elipseMundo(118, 310, 210, 160, 'rgba(102,54,32,.42)');
    elipseMundo(-666, -290, 240, 150, 'rgba(186,205,207,.38)');
    elipseMundo(530, -210, 240, 120, 'rgba(76,70,62,.34)');
    mctx.restore();

    // Relevo, florestas e marcos de escala.
    floresta(-500, -80, 150, '#244f31');
    floresta(-365, 88, 110, '#315934');
    floresta(-52, -58, 120, '#395f35');
    for (let i = 0; i < 9; i++) montanha(-720 + i * 38, -332 + (i % 2) * 20, 0.9 + (i % 3) * 0.12, true, '#6b7c82');
    for (let i = 0; i < 8; i++) montanha(70 + i * 34, 266 + (i % 2) * 18, 1.05, false, '#754633');
    for (let i = 0; i < 7; i++) montanha(472 + i * 34, -246 + (i % 2) * 16, 0.85, false, '#5e5852');
    linhaMundo([[-260, 22], [-380, 112], [-520, 168], [-710, 120]], 'rgba(88,164,182,.58)', 3.2);
    linhaMundo([[40, -160], [140, -72], [185, 10], [130, 72], [36, 110]], 'rgba(78,154,178,.55)', 3);
    linhaMundo([[510, 180], [650, 245], [765, 324]], 'rgba(236,203,124,.44)', 2.2);

    // Camada das ilhas aereas: visivel no mapa, mesmo sendo altitude e nao solo plano.
    mctx.save();
    const ceu = mctx.createLinearGradient(470, 16, 940, 200);
    ceu.addColorStop(0, 'rgba(95,130,190,.08)');
    ceu.addColorStop(1, 'rgba(149,114,215,.16)');
    mctx.fillStyle = ceu;
    mctx.fillRect(438, 24, 500, 190);
    mctx.strokeStyle = 'rgba(178,207,255,.22)';
    mctx.strokeRect(438, 24, 500, 190);
    ilhaFlutuante(574, 88, 132, 48, 'AURELIA', 'cidade nas nuvens');
    ilhaFlutuante(735, 126, 116, 42, 'ILHAS DO VENTO', 'rota de voo');
    ilhaFlutuante(872, 78, 86, 34, 'OBSERVATORIO', 'nivel alto');
    mctx.restore();

    // Rotas do jogo, agora com cara de estrada/cartografia.
    for (const r of rotas) {
      const lw = Math.max(2.6, (r.w || 8) * W / mundoW);
      linhaMundo([[r.x1, r.z1], [r.x2, r.z2]], 'rgba(47,32,20,.76)', lw + 2.6);
      linhaMundo([[r.x1, r.z1], [r.x2, r.z2]], 'rgba(219,176,91,.78)', lw);
    }

    // Malha de referencia bem discreta: orienta sem virar planilha verde.
    mctx.strokeStyle = 'rgba(234,210,151,.09)'; mctx.lineWidth = 1;
    for (let gx = Math.ceil(mundo.minX / 200) * 200; gx <= mundo.maxX; gx += 200) {
      const x = px(gx); mctx.beginPath(); mctx.moveTo(x, 0); mctx.lineTo(x, H); mctx.stroke();
    }
    for (let gz = Math.ceil(mundo.minZ / 200) * 200; gz <= mundo.maxZ; gz += 200) {
      const y = py(gz); mctx.beginPath(); mctx.moveTo(0, y); mctx.lineTo(W, y); mctx.stroke();
    }

    // Veios magicos e pedras seguem funcionais, mas viram glifos de mapa.
    for (const v of veios) {
      if (!v.sentido || (v.segredo && !v.revelado) || !v.pts || v.pts.length < 2) continue;
      const hx = corHex(v.cor);
      linhaMundo(v.pts, hx, 2.8, hx);
    }
    for (const p of pedrasVeio) {
      if (p.segredo && !p.revelado && !p.sentido) continue;
      const X = px(p.x), Y = py(p.z); const hx = corHex(p.cor);
      mctx.save();
      if (p.sentido) { mctx.shadowColor = hx; mctx.shadowBlur = 12; }
      mctx.beginPath(); mctx.arc(X, Y, 6.2, 0, Math.PI * 2);
      mctx.fillStyle = p.sentido ? hx : 'rgba(150,145,128,.86)';
      mctx.fill();
      mctx.shadowBlur = 0;
      mctx.lineWidth = 1.6; mctx.strokeStyle = '#140d07'; mctx.stroke();
      mctx.restore();
    }

    // Bases construidas: apenas massas relevantes, sem transformar o mapa em debug de colisao.
    for (const o of obstaculos) {
      const x = px(o.minX), y = py(o.minZ);
      const w = (o.maxX - o.minX) / mundoW * W;
      const h = (o.maxZ - o.minZ) / mundoH * H;
      if (w * h < 22 || w < 2.2 || h < 2.2) continue;
      mctx.fillStyle = 'rgba(32,27,22,.34)';
      mctx.strokeStyle = 'rgba(226,188,111,.16)';
      mctx.lineWidth = 1;
      mctx.fillRect(x, y, w, h);
      mctx.strokeRect(x, y, w, h);
    }

    for (const m of marcos) {
      const x = px(m.x), y = py(m.z);
      mctx.fillStyle = MARCO_COR[m.tipo] || '#e8eef7';
      mctx.fillRect(x - 5, y - 5, 10, 10);
      mctx.strokeStyle = 'rgba(19,12,6,.8)'; mctx.lineWidth = 1.2; mctx.strokeRect(x - 5, y - 5, 10, 10);
    }

    mctx.font = '16px Arial'; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
    for (const L of lojas) {
      const x = px(L.x), y = py(L.z);
      mctx.fillStyle = 'rgba(20,14,9,.72)';
      mctx.beginPath(); mctx.arc(x, y, 12, 0, Math.PI * 2); mctx.fill();
      mctx.fillStyle = '#f4e9c8';
      mctx.fillText(L.icone, x, y + 1);
    }

    const canon = [
      ['VENOR', 0, 0, 18], ['VENORE', -330, -30, 15], ['NOCTARIA', -660, -30, 15],
      ['THAIS', 565, 0, 15], ['PICO DO DRAGAO', 110, 300, 13],
      ['ERMO DAS CINZAS', -650, -30, 12], ['AREIAS DO VEIO SECO', 610, 258, 12],
      ['BREJO PROFUNDO', -305, -18, 12], ['COSTA DO FAROL', -10, -220, 12],
      ['AURELIA ACIMA DAS NUVENS', 590, -392, 12],
    ];
    for (const [nome, x, z, tam] of canon) etiquetaMundo(nome, x, z, { tam, maxW: 210, cor: tam >= 15 ? '#ffe9b8' : '#e6d195' });

    const usados = [];
    for (const L of lugares) {
      const x = px(L.x), y = py(L.z);
      if (x < 22 || x > W - 22 || y < 20 || y > H - 20) continue;
      let colide = false;
      for (const u of usados) if (Math.hypot(u.x - x, u.y - y) < 34) { colide = true; break; }
      if (colide) continue;
      usados.push({ x, y });
      etiqueta(L.nome, x, y, { tam: 11, maxW: 128, cor: '#f5ddb0', fundo: 'rgba(38,27,14,.66)' });
    }

    // Moldura, rosa dos ventos e assinatura do patch.
    mctx.save();
    mctx.strokeStyle = 'rgba(226,187,111,.78)'; mctx.lineWidth = 3; mctx.strokeRect(8, 8, W - 16, H - 16);
    mctx.strokeStyle = 'rgba(58,37,17,.8)'; mctx.lineWidth = 1; mctx.strokeRect(15, 15, W - 30, H - 30);
    const cxR = W - 84, cyR = H - 74;
    mctx.translate(cxR, cyR);
    mctx.strokeStyle = 'rgba(239,211,143,.58)'; mctx.fillStyle = 'rgba(239,211,143,.8)';
    mctx.beginPath(); mctx.arc(0, 0, 30, 0, Math.PI * 2); mctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      mctx.beginPath(); mctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); mctx.lineTo(Math.cos(a) * (i % 2 ? 22 : 30), Math.sin(a) * (i % 2 ? 22 : 30)); mctx.stroke();
    }
    mctx.font = 'bold 11px Georgia,serif'; mctx.textAlign = 'center'; mctx.fillText('N', 0, -39);
    mctx.restore();
    etiqueta('PACTO 01/30 - VENOR E ARREDORES', 182, 35, { tam: 13, maxW: 280, cor: '#ffe9b8', fundo: 'rgba(28,20,13,.78)' });

    if (destino) {
      const x = px(destino.x), y = py(destino.z);
      mctx.save();
      mctx.shadowColor = '#ffdf5a'; mctx.shadowBlur = 10;
      mctx.beginPath(); mctx.arc(x, y, 10, 0, Math.PI * 2);
      mctx.strokeStyle = '#ffdf5a'; mctx.lineWidth = 3; mctx.stroke();
      mctx.beginPath(); mctx.moveTo(x - 14, y); mctx.lineTo(x + 14, y); mctx.moveTo(x, y - 14); mctx.lineTo(x, y + 14); mctx.stroke();
      mctx.restore();
      etiqueta(destino.nome, x, y - 21, { tam: 12, cor: '#ffdf5a', maxW: 170, fundo: 'rgba(33,25,12,.86)' });
    }
    if (ultimosOutros) {
      for (const [, o] of ultimosOutros) {
        const p = o.grupo.position;
        mctx.beginPath(); mctx.arc(px(p.x), py(p.z), 5.2, 0, Math.PI * 2);
        mctx.fillStyle = corHex(o.cor ?? 0xffffff); mctx.fill();
        mctx.strokeStyle = '#111'; mctx.stroke();
      }
    }
    if (ultimoAvatar) setaMapa(px(ultimoAvatar.position.x), py(ultimoAvatar.position.z), ultimoAvatar.rotation.y);
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
    if (overlay.style.display !== 'none') desenhaMapaGrandePremium();
  }

  return { atualiza, mostra, esconde, zoom, abreMapa, fechaMapa, toggleMapa, limpaDestino, el: cnv };
}

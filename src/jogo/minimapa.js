// =============================================================
//  MINIMAPA / RADAR  ·  HUD no canto (canvas 2D), CENTRADO NO JOGADOR.
//  Mostra um alcance fixo em volta de você (funciona com mundo de
//  qualquer tamanho): ruas, praça, construções, MARCOS coloridos,
//  outros jogadores (pontos) e VOCÊ (seta amarela no centro).
//  Norte fixo (mapa não gira). Só de leitura (pointer-events:none).
// =============================================================
const MARCO_COR = {
  igreja: '#ededed', hospital: '#e24a4a', delegacia: '#4a78e2', escola: '#e2c24a',
};
const corHex = (c) => '#' + ((c >>> 0) & 0xffffff).toString(16).padStart(6, '0');

export function criaMinimapa({ obstaculos = [], ruas = [], marcos = [], lugares = [], alcance = 90 }) {
  const TAM = 150;
  const cnv = document.createElement('canvas');
  cnv.width = TAM; cnv.height = TAM;
  cnv.style.cssText = `position:fixed;top:14px;right:14px;width:${TAM}px;height:${TAM}px;`
    + 'border:2px solid rgba(255,255,255,.5);border-radius:12px;z-index:20;'
    + 'background:#5c7d44;box-shadow:0 4px 16px rgba(0,0,0,.45);pointer-events:none;display:none;';
  document.body.appendChild(cnv);

  const ctx = cnv.getContext('2d');
  const cx = TAM / 2, cy = TAM / 2;
  const esc = (TAM / 2 - 6) / alcance; // mundo -> pixels

  function mostra() { cnv.style.display = 'block'; }
  function esconde() { cnv.style.display = 'none'; }

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

  function atualiza(avatar, outros) {
    const ax = avatar.position.x, az = avatar.position.z;
    const sx = (wx) => cx + (wx - ax) * esc;   // relativo ao jogador
    const sy = (wz) => cy + (wz - az) * esc;
    const perto = (x, z, m = alcance * 1.4) => Math.abs(x - ax) < m && Math.abs(z - az) < m;

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

    // rótulos de ruas/lugares (nomes), só os próximos e dentro do quadro
    if (lugares.length) {
      ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const L of lugares) {
        if (!perto(L.x, L.z, alcance)) continue;
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

    // VOCÊ (sempre no centro)
    setaCentro(avatar.rotation.y);
  }

  return { atualiza, mostra, esconde, el: cnv };
}

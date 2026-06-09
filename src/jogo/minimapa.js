// =============================================================
//  MINIMAPA  ·  HUD no canto (canvas 2D), visão de cima da cidade.
//  Mostra ruas, praça, construções e MARCOS coloridos para orientação,
//  a SUA posição (seta amarela apontando pra frente) e os OUTROS
//  jogadores (pontos da cor da roupa). Norte fixo (mapa não gira).
//  Só de leitura: pointer-events:none (não atrapalha câmera/toque).
// =============================================================
const MARCO_COR = {
  igreja: '#ededed', hospital: '#e24a4a', delegacia: '#4a78e2', escola: '#e2c24a',
};
const corHex = (c) => '#' + ((c >>> 0) & 0xffffff).toString(16).padStart(6, '0');

export function criaMinimapa({ obstaculos = [], ruas = [], marcos = [], limite = 80 }) {
  const TAM = 150;            // tamanho do minimapa em pixels
  const RAIO = limite + 8;    // alcance do mundo mapeado (com margem)
  const cnv = document.createElement('canvas');
  cnv.width = TAM; cnv.height = TAM;
  cnv.style.cssText = `position:fixed;top:14px;right:14px;width:${TAM}px;height:${TAM}px;`
    + 'border:2px solid rgba(255,255,255,.5);border-radius:12px;z-index:20;'
    + 'background:#5c7d44;box-shadow:0 4px 16px rgba(0,0,0,.45);pointer-events:none;display:none;';
  document.body.appendChild(cnv);

  const ctx = cnv.getContext('2d');
  const cx = TAM / 2, cy = TAM / 2;
  const esc = (TAM / 2 - 6) / RAIO;        // mundo -> pixels
  const sx = (wx) => cx + wx * esc;        // eixo X do mundo -> X da tela
  const sy = (wz) => cy + wz * esc;        // eixo Z do mundo -> Y da tela (norte = -z = topo)

  function mostra() { cnv.style.display = 'block'; }
  function esconde() { cnv.style.display = 'none'; }

  function seta(px, py, rot) {
    const fx = Math.sin(rot), fy = Math.cos(rot); // frente no mundo (x,z)
    const rx = -fy, ry = fx;                       // perpendicular
    ctx.beginPath();
    ctx.moveTo(px + fx * 8, py + fy * 8);
    ctx.lineTo(px - fx * 4 + rx * 5, py - fy * 4 + ry * 5);
    ctx.lineTo(px - fx * 4 - rx * 5, py - fy * 4 - ry * 5);
    ctx.closePath();
    ctx.fillStyle = '#ffd23f'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#1a1a1a'; ctx.stroke();
  }

  function atualiza(avatar, outros) {
    ctx.clearRect(0, 0, TAM, TAM);
    ctx.fillStyle = '#5c7d44'; ctx.fillRect(0, 0, TAM, TAM); // grama

    // ruas em grade (faixas de largura 8 no mundo)
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

    // construções (colisores) como blocos sutis
    ctx.fillStyle = 'rgba(38,44,52,.55)';
    for (const o of obstaculos) {
      ctx.fillRect(sx(o.minX), sy(o.minZ), (o.maxX - o.minX) * esc, (o.maxZ - o.minZ) * esc);
    }

    // marcos coloridos (igreja/hospital/delegacia/escola)
    for (const m of marcos) {
      ctx.fillStyle = MARCO_COR[m.tipo] || '#fff';
      ctx.fillRect(sx(m.x) - 4.5, sy(m.z) - 4.5, 9, 9);
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.5)';
      ctx.strokeRect(sx(m.x) - 4.5, sy(m.z) - 4.5, 9, 9);
    }

    // outros jogadores
    if (outros) {
      for (const [, o] of outros) {
        const p = o.grupo.position;
        ctx.beginPath();
        ctx.arc(sx(p.x), sy(p.z), 3.5, 0, Math.PI * 2);
        ctx.fillStyle = corHex(o.cor ?? 0xffffff); ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.stroke();
      }
    }

    // VOCÊ (seta amarela apontando pra frente)
    seta(sx(avatar.position.x), sy(avatar.position.z), avatar.rotation.y);
  }

  return { atualiza, mostra, esconde, el: cnv };
}

// =============================================================
//  HUD  ·  nível + barra de XP + contagem de itens coletados (loot).
//  Aparece ao entrar no jogo. ganhaXP() sobe de nível; addItem() conta.
// =============================================================
export function criaHUD() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;top:14px;left:72px;z-index:30;display:none;font-family:Arial,sans-serif;color:#fff;pointer-events:none;';
  // barra de VIDA
  const vidaEl = document.createElement('div');
  vidaEl.style.cssText = 'font-weight:bold;font-size:13px;text-shadow:0 1px 3px #000;';
  const vidaBar = document.createElement('div');
  vidaBar.style.cssText = 'width:170px;height:12px;background:rgba(0,0,0,.55);border:1px solid #3a4654;border-radius:6px;margin:2px 0 5px;overflow:hidden;';
  const vidaFill = document.createElement('div');
  vidaFill.style.cssText = 'height:100%;width:100%;background:linear-gradient(90deg,#c0392b,#e74c3c);transition:width .15s;';
  vidaBar.appendChild(vidaFill);

  const ouroEl = document.createElement('div');
  ouroEl.style.cssText = 'font-weight:bold;font-size:13px;color:#ffd23f;text-shadow:0 1px 3px #000;margin-bottom:2px;';
  ouroEl.textContent = '🪙 0';
  const nivelEl = document.createElement('div');
  nivelEl.style.cssText = 'font-weight:bold;font-size:14px;text-shadow:0 1px 3px #000;';
  const barra = document.createElement('div');
  barra.style.cssText = 'width:170px;height:11px;background:rgba(0,0,0,.55);border:1px solid #3a4654;border-radius:6px;margin-top:3px;overflow:hidden;';
  const fill = document.createElement('div');
  fill.style.cssText = 'height:100%;width:0;background:linear-gradient(90deg,#4aa0d8,#7bd07b);transition:width .2s;';
  barra.appendChild(fill);
  const itensEl = document.createElement('div');
  itensEl.style.cssText = 'margin-top:5px;font-size:12px;text-shadow:0 1px 3px #000;max-width:200px;line-height:1.5;';
  wrap.append(vidaEl, vidaBar, ouroEl, nivelEl, barra, itensEl);
  document.body.appendChild(wrap);

  let nivel = 1, xp = 0, prox = 20;
  const itens = {};
  function render() {
    nivelEl.textContent = `Nível ${nivel}  ·  ${xp}/${prox} XP`;
    fill.style.width = Math.min(100, (xp / prox) * 100) + '%';
    itensEl.textContent = Object.entries(itens).map(([k, v]) => `${k}: ${v}`).join('   ');
  }
  return {
    mostra() { wrap.style.display = 'block'; render(); },
    ganhaXP(n) { xp += n; while (xp >= prox) { xp -= prox; nivel++; prox = Math.round(prox * 1.5); } render(); },
    // morte estilo Tibia: perde ~30% do XP do nível atual (pode até DESCER de nível)
    perdeXP() {
      let perda = Math.round(prox * 0.3);
      const total = perda;
      while (perda > 0) {
        if (xp > 0) { const tira = Math.min(xp, perda); xp -= tira; perda -= tira; }
        else if (nivel > 1) { nivel--; prox = Math.max(20, Math.round(prox / 1.5)); xp = prox; }
        else break; // nível 1 com 0 XP: não desce mais
      }
      render();
      return total;
    },
    addItem(tipo) { itens[tipo] = (itens[tipo] || 0) + 1; render(); },
    vida(cur, max) { vidaEl.textContent = `❤️ Vida ${Math.max(0, Math.ceil(cur))}/${max}`; vidaFill.style.width = Math.max(0, (cur / max) * 100) + '%'; },
    ouro(n) { ouroEl.textContent = `🪙 ${n}`; },
    // SAVE: exporta/restaura nível e XP (conta local do jogador)
    estado() { return { nivel, xp, prox }; },
    carrega(s) { nivel = s.nivel || 1; xp = s.xp || 0; prox = s.prox || 20; render(); },
  };
}

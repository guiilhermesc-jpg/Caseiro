// =============================================================
//  PAINEL DO PERSONAGEM (RV14) — janela estilo TIBIA: nível, vocação,
//  vida/mana, XP, EQUIPAMENTO (vê as armaduras) e o DRAGÃO companheiro
//  (retrato premium, vida, poderes, afinidade dia/noite, estágio).
//  Botão 📜 / tecla C. Atualiza ao vivo enquanto aberto.
// =============================================================
const SLOTS = [
  { id: 'cabeca', nome: 'Elmo', emoji: '🪖' },
  { id: 'tronco', nome: 'Peitoral', emoji: '🛡️' },
  { id: 'maoDir', nome: 'Arma', emoji: '⚔️' },
  { id: 'maoEsq', nome: 'Escudo', emoji: '🔰' },
  { id: 'pes', nome: 'Botas', emoji: '🥾' },
  { id: 'colar', nome: 'Amuleto', emoji: '📿' },
  { id: 'anel', nome: 'Anel', emoji: '💍' },
];

export function criaPainelPersonagem({ getDados }) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:58;display:none;align-items:center;justify-content:center;'
    + 'background:rgba(6,4,10,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);font-family:Arial,sans-serif;';

  const cx = document.createElement('div');
  cx.style.cssText = 'width:min(95vw,560px);max-height:90vh;overflow:auto;color:#f0e9d6;'
    + 'background:linear-gradient(180deg,rgba(26,20,34,.97),rgba(12,10,18,.98));'
    + 'border:1px solid rgba(201,167,90,.45);border-radius:18px;padding:22px 24px 18px;'
    + 'box-shadow:0 24px 80px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.06);';
  ov.appendChild(cx);
  document.body.appendChild(ov);

  const fechar = () => { ov.style.display = 'none'; };
  ov.addEventListener('click', (e) => { if (e.target === ov) fechar(); });

  const bar = (cor, pct) => `<div style="height:13px;background:rgba(0,0,0,.5);border:1px solid rgba(0,0,0,.6);border-radius:7px;overflow:hidden;">`
    + `<div style="height:100%;width:${Math.max(0, Math.min(100, pct))}%;background:${cor};transition:width .2s;"></div></div>`;

  function render() {
    const d = getDados() || {};
    const vocLabel = d.vocacao || 'Aventureiro';
    const eq = d.equipados || {};
    const slotsHTML = SLOTS.map((s) => {
      const it = eq[s.id];
      const cheio = it && it.nome;
      return `<div title="${s.nome}${cheio ? ': ' + it.nome : ''}" style="display:flex;flex-direction:column;align-items:center;gap:3px;">`
        + `<div style="width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;`
        + `border:2px solid ${cheio ? 'rgba(201,167,90,.7)' : 'rgba(120,110,90,.25)'};`
        + `background:${cheio ? 'radial-gradient(circle at 50% 35%,rgba(201,167,90,.22),rgba(8,8,14,.7))' : 'rgba(8,8,14,.55)'};">`
        + `${cheio ? (it.icone || '▪️') : `<span style="opacity:.32;">${s.emoji}</span>`}</div>`
        + `<div style="font-size:9.5px;color:#9b8f74;">${s.nome}</div></div>`;
    }).join('');

    const dr = d.dragao;
    let dragaoHTML;
    if (dr && dr.tem) {
      const af = dr.afinidade === 'noite'
        ? '<span style="color:#7aa2ff;">🌙 Noturno</span>'
        : '<span style="color:#ffcf5a;">☀️ Diurno</span>';
      dragaoHTML = `<div style="display:flex;gap:14px;align-items:center;">`
        + `<div style="flex:0 0 96px;width:96px;height:96px;border-radius:12px;overflow:hidden;border:1px solid rgba(201,167,90,.4);background:radial-gradient(circle at 50% 30%,rgba(60,40,90,.5),rgba(8,6,14,.9));display:flex;align-items:center;justify-content:center;">`
        + (dr.img ? `<img src="${dr.img}" alt="${dr.nome}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 3px 8px rgba(0,0,0,.6));">` : '<span style="font-size:42px;">🐲</span>')
        + `</div>`
        + `<div style="flex:1;min-width:0;">`
        + `<div style="font:800 16px Georgia,serif;color:#f4e3b0;">${dr.nome}</div>`
        + `<div style="font-size:11.5px;color:#bcae8e;margin:2px 0 6px;">${dr.estagioNome || ''} · Nv ${dr.nivel || 1} · ${af}</div>`
        + `<div style="font-size:10.5px;color:#9b8f74;margin-bottom:2px;">Vida do dragão</div>`
        + bar('linear-gradient(90deg,#7a1f1f,#e0584e)', dr.vidaMax ? (dr.vida / dr.vidaMax) * 100 : 0)
        + `<div style="font-size:10.5px;color:#9b8f74;margin:6px 0 2px;">Crescimento (XP)</div>`
        + bar('linear-gradient(90deg,#6a4ad0,#b98cff)', dr.prox ? (dr.xp / dr.prox) * 100 : 0)
        + `<div style="margin-top:7px;display:flex;flex-wrap:wrap;gap:5px;">${(dr.poderes || []).map((p) => `<span style="font-size:10.5px;background:rgba(201,167,90,.14);border:1px solid rgba(201,167,90,.3);border-radius:6px;padding:2px 7px;color:#e8d9af;">${p}</span>`).join('')}</div>`
        + `</div>`;
    } else {
      dragaoHTML = `<div style="text-align:center;color:#8c8268;font-size:12.5px;padding:14px 6px;line-height:1.6;">`
        + `🥚 Você ainda não tem um dragão companheiro.<br>Choque um ovo ou dome um filhote para começar a criar o seu — e faça-o crescer junto da sua jornada.</div>`;
    }

    cx.innerHTML =
      `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">`
      + `<h2 style="margin:0;font:900 22px/1 Georgia,serif;letter-spacing:2px;color:#f4e9c8;text-shadow:0 0 22px rgba(201,167,90,.45);">${d.nome || 'Herói'}</h2>`
      + `<span id="painelX" style="cursor:pointer;color:#b9a98a;font-size:18px;">✕</span></div>`
      + `<div style="color:#c9a75a;font:italic 12.5px Georgia,serif;margin-bottom:14px;">${vocLabel} · Nível ${d.nivel || 1}</div>`
      + `<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px 18px;margin-bottom:16px;">`
      + `<div><div style="font-size:10.5px;color:#9b8f74;margin-bottom:2px;">❤️ Vida ${Math.ceil(d.vida || 0)}/${d.vidaMax || 0}</div>${bar('linear-gradient(90deg,#c0392b,#e74c3c)', d.vidaMax ? (d.vida / d.vidaMax) * 100 : 0)}</div>`
      + `<div><div style="font-size:10.5px;color:#9b8f74;margin-bottom:2px;">🔮 Mana ${Math.floor(d.mana || 0)}/${d.manaMax || 0}</div>${bar('linear-gradient(90deg,#2a5adf,#4aa0f0)', d.manaMax ? (d.mana / d.manaMax) * 100 : 0)}</div>`
      + `<div style="grid-column:1 / -1;"><div style="font-size:10.5px;color:#9b8f74;margin-bottom:2px;">⭐ Experiência ${d.xp || 0}/${d.prox || 0}</div>${bar('linear-gradient(90deg,#4aa0d8,#7bd07b)', d.prox ? (d.xp / d.prox) * 100 : 0)}</div>`
      + `<div style="font-size:12px;color:#cdbf9c;">🛡️ Defesa <b style="color:#f0e3bf;">${d.defesa || 0}</b></div>`
      + `<div style="font-size:12px;color:#cdbf9c;">🪙 Ouro <b style="color:#ffd23f;">${d.ouro || 0}</b></div>`
      + `</div>`
      + `<div style="font:800 12px Georgia,serif;letter-spacing:2px;color:#c9a75a;margin-bottom:8px;">EQUIPAMENTO</div>`
      + `<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:18px;">${slotsHTML}</div>`
      + `<div style="font:800 12px Georgia,serif;letter-spacing:2px;color:#c9a75a;margin-bottom:8px;">🐲 DRAGÃO COMPANHEIRO</div>`
      + `<div style="background:rgba(8,8,14,.5);border:1px solid rgba(201,167,90,.2);border-radius:12px;padding:12px;">${dragaoHTML}</div>`;

    cx.querySelector('#painelX').onclick = fechar;
  }

  let timer = null;
  function abre() { render(); ov.style.display = 'flex'; clearInterval(timer); timer = setInterval(() => { if (ov.style.display !== 'none') render(); }, 600); }

  // botão flutuante 📜
  const botao = document.createElement('button');
  botao.textContent = '📜';
  botao.title = 'Personagem (C)';
  botao.style.cssText = 'position:fixed;right:14px;bottom:312px;z-index:40;width:46px;height:46px;border-radius:50%;'
    + 'border:1px solid rgba(201,167,90,.5);background:rgba(16,12,22,.85);color:#fff;font-size:21px;cursor:pointer;display:none;'
    + 'box-shadow:0 6px 18px rgba(0,0,0,.5);';
  botao.onclick = abre;
  document.body.appendChild(botao);

  return {
    abre, fecha: fechar,
    mostraBotao() { botao.style.display = 'block'; },
    escondeBotao() { botao.style.display = 'none'; fechar(); },
    get aberto() { return ov.style.display === 'flex'; },
  };
}

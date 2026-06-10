// =============================================================
//  INVENTÁRIO / EQUIPAMENTO + MOCHILA  ·  estilo Tibia.
//  Slots do corpo: colar, cabeça, tocha, mão esq., tronco, mão dir.,
//  anel, pernas, pés. + MOCHILA de 20 slots (itens empilham).
//  Abre com 🎒 ou tecla I.
// =============================================================
const SLOTS = [
  { id: 'colar', nome: 'Colar', icone: '📿', col: 1, row: 1 },
  { id: 'cabeca', nome: 'Cabeça', icone: '🪖', col: 2, row: 1 },
  { id: 'tocha', nome: 'Tocha', icone: '🔦', col: 3, row: 1 },
  { id: 'maoEsq', nome: 'Mão esq.', icone: '🛡️', col: 1, row: 2 },
  { id: 'tronco', nome: 'Tronco', icone: '🥼', col: 2, row: 2 },
  { id: 'maoDir', nome: 'Mão dir.', icone: '⚔️', col: 3, row: 2 },
  { id: 'anel', nome: 'Anel', icone: '💍', col: 1, row: 3 },
  { id: 'pernas', nome: 'Pernas', icone: '👖', col: 2, row: 3 },
  { id: 'pes', nome: 'Pés', icone: '🥾', col: 2, row: 4 },
];
const N_MOCHILA = 20;

export function criaInventario({ aoEquipar } = {}) {
  const equipado = {};
  const slotEls = {};
  const mochila = []; // [{nome, icone, qtd}]

  const painel = document.createElement('div');
  painel.style.cssText = 'position:fixed;top:50%;right:16px;transform:translateY(-50%);z-index:40;display:none;'
    + 'background:rgba(16,22,32,.96);border:1px solid #3a4654;border-radius:14px;padding:14px;'
    + 'max-height:92vh;overflow:auto;box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:Arial,sans-serif;color:#dfe7f0;';
  painel.innerHTML = '<div style="text-align:center;font-weight:bold;letter-spacing:1px;margin-bottom:10px;">EQUIPAMENTO</div>';

  const grade = document.createElement('div');
  grade.style.cssText = 'display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(4,58px);gap:7px;justify-content:center;';
  painel.appendChild(grade);
  SLOTS.forEach((s) => {
    const cel = document.createElement('div');
    cel.title = s.nome;
    cel.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
      + 'background:#0e141c;border:1px solid #2c3845;border-radius:9px;font-size:20px;opacity:.55;';
    cel.style.gridColumn = s.col; cel.style.gridRow = s.row;
    cel.innerHTML = `<div>${s.icone}</div><div style="font-size:8px;opacity:.8;">${s.nome}</div>`;
    grade.appendChild(cel); slotEls[s.id] = cel;
  });

  const tit = document.createElement('div');
  tit.textContent = '🎒 Mochila';
  tit.style.cssText = 'text-align:center;font-weight:bold;margin:12px 0 8px;letter-spacing:1px;';
  painel.appendChild(tit);
  const gradeM = document.createElement('div');
  gradeM.style.cssText = 'display:grid;grid-template-columns:repeat(4,42px);grid-template-rows:repeat(5,42px);gap:5px;justify-content:center;';
  painel.appendChild(gradeM);
  const mochilaEls = [];
  for (let i = 0; i < N_MOCHILA; i++) {
    const cel = document.createElement('div');
    cel.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;'
      + 'background:#0e141c;border:1px solid #2c3845;border-radius:7px;font-size:18px;cursor:pointer;';
    cel.addEventListener('click', () => { // clicar = usar/equipar
      const it = mochila[i];
      if (it && it.slot && aoEquipar) {
        const consumir = aoEquipar(it); // false = item só "usado" (ex.: tocha), fica na mochila
        if (consumir !== false) { if (it.qtd > 1) it.qtd--; else mochila.splice(i, 1); }
        renderMochila();
      }
    });
    gradeM.appendChild(cel); mochilaEls.push(cel);
  }
  document.body.appendChild(painel);

  const btn = document.createElement('div');
  btn.textContent = '🎒';
  btn.style.cssText = 'position:fixed;top:14px;left:14px;width:48px;height:48px;z-index:41;display:none;'
    + 'align-items:center;justify-content:center;font-size:24px;cursor:pointer;user-select:none;'
    + 'background:rgba(16,22,32,.8);border:1px solid #3a4654;border-radius:12px;';
  document.body.appendChild(btn);

  let aberto = false;
  function alterna() { aberto = !aberto; painel.style.display = aberto ? 'block' : 'none'; }
  btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); alterna(); });
  window.addEventListener('keydown', (e) => { if (e.code === 'KeyI') alterna(); });

  function renderMochila() {
    mochilaEls.forEach((cel, i) => {
      const it = mochila[i];
      cel.innerHTML = it
        ? `${it.icone || '▫️'}${it.qtd > 1 ? `<span style="position:absolute;right:2px;bottom:0;font-size:10px;font-weight:bold;color:#ffd23f;">${it.qtd}</span>` : ''}`
        : '';
      cel.title = it ? it.nome : '';
    });
  }

  return {
    alterna,
    mostra() { btn.style.display = 'flex'; },
    equipa(slot, item) {
      equipado[slot] = item;
      const cel = slotEls[slot]; const def = SLOTS.find((s) => s.id === slot);
      if (!cel) return;
      if (item) { cel.style.opacity = '1'; cel.innerHTML = `<div style="font-size:24px;">${item.icone || '▪️'}</div><div style="font-size:8px;">${item.nome}</div>`; }
      else if (def) { cel.style.opacity = '.55'; cel.innerHTML = `<div>${def.icone}</div><div style="font-size:8px;opacity:.8;">${def.nome}</div>`; }
    },
    // adiciona à mochila (empilha por nome). Retorna false se cheia.
    addItem(item) {
      const ex = mochila.find((m) => m.nome === item.nome);
      if (ex) { ex.qtd++; renderMochila(); return true; }
      if (mochila.length >= N_MOCHILA) return false;
      mochila.push({ ...item, qtd: 1 }); renderMochila(); return true; // guarda props (slot/defesa/id)
    },
  };
}

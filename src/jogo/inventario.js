// =============================================================
//  INVENTÁRIO / EQUIPAMENTO  ·  painel estilo Tibia.
//  Slots do corpo: cabeça, mão esq., tronco, mão dir., pernas, pés.
//  Por enquanto é a INTERFACE (vazia) — equipar de verdade entra
//  quando os itens existirem (loot dos bichos). Abre com 🎒 ou tecla I.
// =============================================================
const SLOTS = [
  { id: 'cabeca', nome: 'Cabeça', icone: '🪖', col: 2, row: 1 },
  { id: 'maoEsq', nome: 'Mão esq.', icone: '🛡️', col: 1, row: 2 },
  { id: 'tronco', nome: 'Tronco', icone: '🥼', col: 2, row: 2 },
  { id: 'maoDir', nome: 'Mão dir.', icone: '⚔️', col: 3, row: 2 },
  { id: 'pernas', nome: 'Pernas', icone: '👖', col: 2, row: 3 },
  { id: 'pes', nome: 'Pés', icone: '🥾', col: 2, row: 4 },
];

export function criaInventario() {
  const equipado = {};
  const slotEls = {};

  const painel = document.createElement('div');
  painel.style.cssText = 'position:fixed;top:50%;right:16px;transform:translateY(-50%);z-index:40;display:none;'
    + 'background:rgba(16,22,32,.95);border:1px solid #3a4654;border-radius:14px;padding:16px;'
    + 'box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:Arial,sans-serif;color:#dfe7f0;';
  painel.innerHTML = '<div style="text-align:center;font-weight:bold;letter-spacing:1px;margin-bottom:12px;">EQUIPAMENTO</div>';

  const grade = document.createElement('div');
  grade.style.cssText = 'display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(4,64px);gap:8px;';
  painel.appendChild(grade);

  SLOTS.forEach((s) => {
    const cel = document.createElement('div');
    cel.title = s.nome;
    cel.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
      + 'background:#0e141c;border:1px solid #2c3845;border-radius:10px;font-size:24px;opacity:.55;';
    cel.style.gridColumn = s.col; cel.style.gridRow = s.row;
    cel.innerHTML = `<div>${s.icone}</div><div style="font-size:9px;opacity:.8;margin-top:2px;">${s.nome}</div>`;
    grade.appendChild(cel);
    slotEls[s.id] = cel;
  });

  const dica = document.createElement('div');
  dica.style.cssText = 'text-align:center;font-size:11px;color:#67748a;margin-top:10px;';
  dica.textContent = 'itens entram aqui conforme você encontra';
  painel.appendChild(dica);
  document.body.appendChild(painel);

  // botão 🎒 (abre/fecha) — escondido até o jogo começar
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

  function mostra() { btn.style.display = 'flex'; }

  function equipa(slot, item) {
    equipado[slot] = item;
    const cel = slotEls[slot];
    if (!cel) return;
    if (item) {
      cel.style.opacity = '1';
      cel.innerHTML = `<div style="width:30px;height:30px;border-radius:6px;background:${item.cor || '#888'};"></div>`
        + `<div style="font-size:9px;margin-top:2px;">${item.nome || ''}</div>`;
    }
  }

  return { alterna, mostra, equipa, equipado };
}

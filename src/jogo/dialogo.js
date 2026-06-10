// =============================================================
//  DIÁLOGO  ·  caixa de conversa ao clicar num NPC (estilo Tibia).
//  abre(nome, linha, opcoes) — opcoes = [{ texto, onClick }].
//  Cada onClick pode chamar abre() de novo (ramificar) ou fecha().
// =============================================================
export function criaDialogo() {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:60;display:none;'
    + 'width:min(92vw,440px);background:rgba(14,20,28,.96);border:1px solid #3a4654;border-radius:14px;'
    + 'padding:16px 18px;box-shadow:0 12px 40px rgba(0,0,0,.55);font-family:Arial,sans-serif;color:#e6edf5;';

  const cab = document.createElement('div');
  cab.style.cssText = 'font-weight:bold;font-size:16px;color:#cfe0a0;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;';
  const nomeEl = document.createElement('span');
  const fechar = document.createElement('span');
  fechar.textContent = '✕'; fechar.style.cssText = 'cursor:pointer;color:#8aa;font-size:15px;';
  fechar.onclick = () => fecha();
  cab.appendChild(nomeEl); cab.appendChild(fechar);
  ov.appendChild(cab);

  const txt = document.createElement('div');
  txt.style.cssText = 'font-size:15px;line-height:1.5;margin-bottom:14px;min-height:42px;';
  ov.appendChild(txt);

  const ops = document.createElement('div');
  ops.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
  ov.appendChild(ops);

  document.body.appendChild(ov);

  function fecha() { ov.style.display = 'none'; ops.innerHTML = ''; }

  function abre(nome, linha, opcoes) {
    nomeEl.textContent = nome;
    txt.textContent = linha;
    ops.innerHTML = '';
    (opcoes || [{ texto: 'Tchau', onClick: fecha }]).forEach((o) => {
      const b = document.createElement('button');
      b.textContent = o.texto;
      b.style.cssText = 'padding:9px 14px;border:1px solid #46566a;border-radius:9px;background:#1b2533;'
        + 'color:#e6edf5;font-size:14px;cursor:pointer;';
      b.onmouseenter = () => { b.style.background = '#27384c'; };
      b.onmouseleave = () => { b.style.background = '#1b2533'; };
      b.onclick = () => o.onClick();
      ops.appendChild(b);
    });
    ov.style.display = 'block';
  }

  return { abre, fecha, get aberto() { return ov.style.display === 'block'; } };
}

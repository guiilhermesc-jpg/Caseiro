// =============================================================
//  CUSTOMIZAR  ·  painel aberto ao CLICAR no próprio boneco (cor)
//  ou no PET (trocar de bicho). Pode mudar quando quiser, in-game.
// =============================================================
import { PALETAS } from './selecao.js';
import { MODELOS, MODELO_NOME } from './avatar.js';

const hex = (c) => '#' + c.toString(16).padStart(6, '0');
const PETS_LISTA = [
  { id: 'gato', nome: '🐱 Gato' },
  { id: 'cachorro', nome: '🐶 Cachorro' },
  { id: 'coelho', nome: '🐰 Coelho' },
];

export function criaCustomizar({ cores, aoMudarCor, aoMudarPet, getPet }) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:60;display:none;'
    + 'width:min(92vw,380px);background:rgba(16,22,32,.96);border:1px solid #3a4654;border-radius:16px;'
    + 'padding:20px 22px;box-shadow:0 12px 44px rgba(0,0,0,.55);font-family:Arial,sans-serif;color:#fff;';

  const topo = document.createElement('div');
  topo.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;';
  topo.innerHTML = '<b style="letter-spacing:1px;">PERSONAGEM</b>';
  const fechar = document.createElement('span');
  fechar.textContent = '✕'; fechar.style.cssText = 'cursor:pointer;color:#8aa;font-size:16px;';
  fechar.onclick = () => fecha();
  topo.appendChild(fechar);
  ov.appendChild(topo);

  function grupoCor(label, tipo) {
    const wrap = document.createElement('div'); wrap.style.cssText = 'margin-bottom:14px;';
    const t = document.createElement('div'); t.textContent = label;
    t.style.cssText = 'font-size:13px;color:#9fb0c0;margin-bottom:6px;'; wrap.appendChild(t);
    const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    PALETAS[tipo].forEach((c) => {
      const b = document.createElement('div');
      b.style.cssText = `width:38px;height:38px;border-radius:9px;background:${hex(c)};cursor:pointer;border:3px solid ${c === cores[tipo] ? '#fff' : 'transparent'};`;
      b.onclick = () => {
        cores[tipo] = c;
        [...linha.children].forEach((el, j) => { el.style.borderColor = (PALETAS[tipo][j] === c ? '#fff' : 'transparent'); });
        aoMudarCor(tipo, c);
      };
      linha.appendChild(b);
    });
    wrap.appendChild(linha); return wrap;
  }
  ov.appendChild(grupoCor('Roupa', 'casaco'));
  ov.appendChild(grupoCor('Pele', 'pele'));
  ov.appendChild(grupoCor('Cabelo', 'cabelo'));

  function escolha(label, opcoes, chave) {
    const wrap = document.createElement('div'); wrap.style.cssText = 'margin-bottom:14px;';
    const t = document.createElement('div'); t.textContent = label; t.style.cssText = 'font-size:13px;color:#9fb0c0;margin-bottom:6px;'; wrap.appendChild(t);
    const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
    opcoes.forEach(([val, txt]) => {
      const b = document.createElement('button'); b.textContent = txt;
      b.style.cssText = `flex:1;min-width:64px;padding:8px 5px;border-radius:9px;border:2px solid ${cores[chave] === val ? '#fff' : '#3a4654'};background:#0e141c;color:#fff;font-size:12px;cursor:pointer;`;
      b.onclick = () => { cores[chave] = val; [...linha.children].forEach((el, j) => { el.style.borderColor = (opcoes[j][0] === val ? '#fff' : '#3a4654'); }); aoMudarCor(chave, val); };
      linha.appendChild(b);
    });
    wrap.appendChild(linha); return wrap;
  }
  ov.appendChild(escolha('Sexo', [['homem', '♂ Homem'], ['mulher', '♀ Mulher']], 'sexo'));
  ov.appendChild(escolha('Modelo', MODELOS.map((m) => [m, MODELO_NOME[m]]), 'tipo'));

  const petTit = document.createElement('div');
  petTit.textContent = 'Pet'; petTit.style.cssText = 'font-size:13px;color:#9fb0c0;margin:4px 0 6px;';
  ov.appendChild(petTit);
  const petLinha = document.createElement('div'); petLinha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
  const petBtns = {};
  PETS_LISTA.forEach((p) => {
    const b = document.createElement('button');
    b.textContent = p.nome;
    b.style.cssText = 'padding:8px 12px;border-radius:9px;border:2px solid #3a4654;background:#0e141c;color:#fff;cursor:pointer;font-size:13px;';
    b.onclick = () => { aoMudarPet(p.id); marcaPet(p.id); };
    petLinha.appendChild(b); petBtns[p.id] = b;
  });
  ov.appendChild(petLinha);
  document.body.appendChild(ov);

  function marcaPet(id) {
    Object.entries(petBtns).forEach(([k, b]) => { b.style.borderColor = (k === id ? '#7bd07b' : '#3a4654'); });
  }

  function fecha() { ov.style.display = 'none'; }
  function abre() { marcaPet(getPet ? getPet() : 'gato'); ov.style.display = 'block'; }

  return { abre, fecha, get aberto() { return ov.style.display === 'block'; } };
}

// =============================================================
//  TELA DE SELEÇÃO  ·  nome + aparência (overlay PREMIUM, RV12.0).
//  Fundo = arte-chave épica (splash.png gerada por IA) + modal lapidado
//  em ouro. A 1ª impressão do jogo.
// =============================================================
import { MODELOS, MODELO_NOME } from './avatar.js';

export const PALETAS = {
  casaco: [0x556b2f, 0x3a5a8a, 0x7a4632, 0x6a2a3a, 0x445162, 0x2a2a30],
  pele:   [0xf2d6b8, 0xe0b088, 0xc89060, 0x9c6a42, 0x6e4628],
  cabelo: [0x241c14, 0x5a3a1c, 0xc8a24e, 0xa33a22, 0xb8b8b8],
};
const hex = (c) => '#' + c.toString(16).padStart(6, '0');
const OURO = '#c9a75a', OURO_CLARO = '#f4e9c8';

export function criaSelecao({ cores, aoMudarCor, aoEntrar }) {
  const ov = document.createElement('div');
  ov.id = 'selecao';
  ov.style.cssText =
    'position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;'
    + 'font-family:Arial,sans-serif;color:#fff;overflow:auto;padding:24px 12px;box-sizing:border-box;'
    + "background:radial-gradient(ellipse at 50% 30%, rgba(8,6,12,.25), rgba(6,4,10,.78) 75%),"
    + "linear-gradient(180deg, rgba(8,6,12,.35) 0%, rgba(8,6,12,.2) 35%, rgba(6,4,10,.85) 100%),"
    + "url('/splash.jpg') center/cover no-repeat, #0c0a14;";

  const painel = document.createElement('div');
  painel.style.cssText =
    'background:linear-gradient(180deg, rgba(22,17,30,.93), rgba(11,9,17,.96));'
    + 'border:1px solid rgba(201,167,90,.4);border-radius:18px;padding:26px 30px;width:min(94vw,430px);'
    + 'box-shadow:0 24px 80px rgba(0,0,0,.75), 0 0 0 1px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07);'
    + 'backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);';

  const titulo = document.createElement('div');
  titulo.innerHTML =
    '<h1 style="margin:0;font:900 46px/1 Georgia,serif;letter-spacing:10px;text-align:center;'
    + 'color:' + OURO_CLARO + ';text-shadow:0 2px 10px #000,0 0 34px rgba(201,167,90,.55);">VENOR</h1>'
    + '<p style="margin:8px 0 20px;text-align:center;color:' + OURO + ';font:700 12px/1 Georgia,serif;'
    + 'letter-spacing:5px;">⚔ ERA DOS DRAGÕES ⚔</p>';
  painel.appendChild(titulo);

  const inp = document.createElement('input');
  inp.placeholder = 'Seu nome de herói';
  inp.maxLength = 16;
  inp.style.cssText = 'width:100%;box-sizing:border-box;padding:13px 15px;margin-bottom:16px;border-radius:10px;'
    + 'border:1px solid rgba(201,167,90,.35);background:rgba(8,10,16,.85);color:#fff;font-size:16px;outline:none;';
  inp.onfocus = () => { inp.style.borderColor = OURO; };
  inp.onblur = () => { inp.style.borderColor = 'rgba(201,167,90,.35)'; };
  painel.appendChild(inp);

  function escolha(label, opcoes, chave) {
    const wrap = document.createElement('div'); wrap.style.cssText = 'margin-bottom:14px;';
    const t = document.createElement('div'); t.textContent = label;
    t.style.cssText = 'font:700 12px/1 Georgia,serif;color:' + OURO + ';letter-spacing:2px;margin-bottom:7px;text-transform:uppercase;';
    wrap.appendChild(t);
    const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    opcoes.forEach(([val, txt]) => {
      const b = document.createElement('button'); b.textContent = txt;
      const sel = () => cores[chave] === val;
      b.style.cssText = `flex:1;min-width:70px;padding:10px 6px;border-radius:9px;border:1.5px solid ${sel() ? OURO : 'rgba(201,167,90,.22)'};background:${sel() ? 'rgba(201,167,90,.14)' : 'rgba(8,10,16,.7)'};color:#fff;font-size:13px;cursor:pointer;transition:all .12s;`;
      b.onclick = () => { cores[chave] = val; [...linha.children].forEach((el, j) => { const s = opcoes[j][0] === val; el.style.borderColor = s ? OURO : 'rgba(201,167,90,.22)'; el.style.background = s ? 'rgba(201,167,90,.14)' : 'rgba(8,10,16,.7)'; }); aoMudarCor(chave, val); };
      linha.appendChild(b);
    });
    wrap.appendChild(linha); return wrap;
  }
  painel.appendChild(escolha('Sexo', [['homem', '♂ Homem'], ['mulher', '♀ Mulher']], 'sexo'));
  const escolhaVoc = escolha('Vocação', MODELOS.map((m) => [m, MODELO_NOME[m]]), 'tipo');
  painel.appendChild(escolhaVoc);
  const DESC_VOC = {
    cavaleiro: '⚔️ Linha de frente: nasce com Adaga e Escudo. Aguenta porrada e devolve em dobro.',
    paladino: '🏹 Atirador: nasce com Arco e 24 Flechas. Caça de LONGE — e Virotes batem ainda mais forte.',
    feiticeiro: '🔮 Conjurador arcano: nasce com 2 Runas de Fogo. As magias (teclas 1-5) são sua arma.',
    druida: '🌿 Guardião da natureza: nasce com 3 Poções de Vida. Cura, doma e sobrevive a tudo.',
  };
  const descVoc = document.createElement('div');
  descVoc.style.cssText = 'margin:-4px 0 14px;padding:10px 13px;border-radius:9px;background:rgba(8,10,16,.7);border:1px solid rgba(201,167,90,.18);color:#cdb98c;font-size:12.5px;line-height:1.5;min-height:34px;';
  const atualizaDesc = () => { descVoc.textContent = DESC_VOC[cores.tipo] || ''; };
  atualizaDesc();
  escolhaVoc.addEventListener('click', () => setTimeout(atualizaDesc, 0));
  painel.appendChild(descVoc);

  function grupo(label, tipo) {
    const wrap = document.createElement('div'); wrap.style.cssText = 'margin-bottom:14px;';
    const t = document.createElement('div'); t.textContent = label;
    t.style.cssText = 'font:700 12px/1 Georgia,serif;color:' + OURO + ';letter-spacing:2px;margin-bottom:7px;text-transform:uppercase;';
    wrap.appendChild(t);
    const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    PALETAS[tipo].forEach((c) => {
      const b = document.createElement('div');
      b.style.cssText = `width:40px;height:40px;border-radius:9px;background:${hex(c)};cursor:pointer;border:3px solid ${c === cores[tipo] ? OURO : 'transparent'};box-shadow:0 2px 6px rgba(0,0,0,.4);transition:border-color .1s;`;
      b.onclick = () => {
        cores[tipo] = c;
        [...linha.children].forEach((el, j) => { el.style.borderColor = (PALETAS[tipo][j] === c ? OURO : 'transparent'); });
        aoMudarCor(tipo, c);
      };
      linha.appendChild(b);
    });
    wrap.appendChild(linha); return wrap;
  }
  painel.appendChild(grupo('Roupa', 'casaco'));
  painel.appendChild(grupo('Pele', 'pele'));
  painel.appendChild(grupo('Cabelo', 'cabelo'));

  const btn = document.createElement('button');
  btn.textContent = '⚔  ENTRAR EM VENOR';
  btn.style.cssText = 'width:100%;margin-top:10px;padding:15px;border:none;border-radius:11px;'
    + 'background:linear-gradient(180deg,#d9b25a,#b0832f);color:#2a1c06;font:800 17px/1 Georgia,serif;'
    + 'letter-spacing:2px;cursor:pointer;box-shadow:0 8px 24px rgba(176,131,47,.4),inset 0 1px 0 rgba(255,255,255,.4);transition:filter .12s;';
  btn.onmouseenter = () => { btn.style.filter = 'brightness(1.1)'; };
  btn.onmouseleave = () => { btn.style.filter = 'none'; };
  let entrando = false;
  const entrar = () => {
    if (entrando) return;
    entrando = true;
    btn.disabled = true;
    btn.style.opacity = '0.75';
    ov.remove();
    aoEntrar((inp.value || 'Sobrevivente').trim().slice(0, 16));
  };
  btn.addEventListener('pointerup', (e) => { e.preventDefault(); e.stopPropagation(); entrar(); });
  btn.addEventListener('click', (e) => { e.preventDefault(); entrar(); });
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') entrar(); });
  painel.appendChild(btn);

  const dica = document.createElement('p');
  dica.textContent = 'Forje sua lenda nas terras de Venor.';
  dica.style.cssText = 'margin:12px 0 0;text-align:center;color:#8a7d5e;font:italic 12px/1 Georgia,serif;';
  painel.appendChild(dica);

  const nov = document.createElement('div');
  nov.innerHTML = '<b style="cursor:pointer;color:' + OURO + ';">📜 A Saga até aqui ▾</b>'
    + '<div id="novLista" style="display:none;margin-top:8px;text-align:left;color:#a99e82;font-size:12px;line-height:1.7;">'
    + '• VENORE, a capital do pântano, e THAIS ao longe — viagens entre reinos<br>'
    + '• 4 VOCAÇÕES, montarias, pets e o Filhote de Dragão da profecia<br>'
    + '• Masmorras, AS IRMÃS AFUNDADAS além-mar e o DESERTO DO VEIO SECO<br>'
    + '• A Catedral da Lua Coada, o Códice da Veia e chefes com itens LENDÁRIOS<br>'
    + '• Conta na NUVEM (☁️ nome + PIN), ciclo dia/noite e visual de cinema</div>';
  nov.style.cssText = 'margin:12px 0 0;text-align:center;font:700 13px/1 Georgia,serif;';
  nov.querySelector('b').onclick = () => {
    const l = nov.querySelector('#novLista');
    l.style.display = l.style.display === 'none' ? 'block' : 'none';
  };
  painel.appendChild(nov);

  ov.appendChild(painel);
  document.body.appendChild(ov);
}

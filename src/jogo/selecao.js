// =============================================================
//  TELA DE SELEÇÃO  ·  nome + aparência do personagem (overlay).
//  Prepara o multiplayer: cada jogador terá nome e cores próprios.
// =============================================================
import { MODELOS, MODELO_NOME } from './avatar.js';

export const PALETAS = {
  casaco: [0x556b2f, 0x3a5a8a, 0x7a4632, 0x6a2a3a, 0x445162, 0x2a2a30],
  pele:   [0xf2d6b8, 0xe0b088, 0xc89060, 0x9c6a42, 0x6e4628],
  cabelo: [0x241c14, 0x5a3a1c, 0xc8a24e, 0xa33a22, 0xb8b8b8],
};
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

export function criaSelecao({ cores, aoMudarCor, aoEntrar }) {
  const ov = document.createElement('div');
  ov.id = 'selecao';
  ov.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(10,16,24,.45);font-family:Arial,sans-serif;color:#fff;';

  const painel = document.createElement('div');
  painel.style.cssText = 'background:rgba(16,22,32,.94);border:1px solid #3a4654;border-radius:16px;padding:24px 28px;width:min(92vw,420px);box-shadow:0 12px 44px rgba(0,0,0,.55);';
  const titulo = document.createElement('div');
  titulo.innerHTML = '<h1 style="margin:0 0 2px;font-size:34px;letter-spacing:2px;text-align:center;">VENOR</h1><p style="margin:0 0 18px;text-align:center;color:#9fb0c0;font-size:14px;">crie seu personagem</p>';
  painel.appendChild(titulo);

  const inp = document.createElement('input');
  inp.placeholder = 'Seu nome';
  inp.maxLength = 16;
  inp.style.cssText = 'width:100%;box-sizing:border-box;padding:12px 14px;margin-bottom:16px;border-radius:10px;border:1px solid #3a4654;background:#0e141c;color:#fff;font-size:16px;outline:none;';
  painel.appendChild(inp);

  // Sexo + Modelo (estilo Tibia): atualiza o preview ao escolher
  function escolha(label, opcoes, chave) {
    const wrap = document.createElement('div'); wrap.style.cssText = 'margin-bottom:14px;';
    const t = document.createElement('div'); t.textContent = label; t.style.cssText = 'font-size:13px;color:#9fb0c0;margin-bottom:6px;'; wrap.appendChild(t);
    const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    opcoes.forEach(([val, txt]) => {
      const b = document.createElement('button'); b.textContent = txt;
      const sel = () => cores[chave] === val;
      b.style.cssText = `flex:1;min-width:70px;padding:9px 6px;border-radius:9px;border:2px solid ${sel() ? '#fff' : '#3a4654'};background:#0e141c;color:#fff;font-size:13px;cursor:pointer;`;
      b.onclick = () => { cores[chave] = val; [...linha.children].forEach((el, j) => { el.style.borderColor = (opcoes[j][0] === val ? '#fff' : '#3a4654'); }); aoMudarCor(chave, val); };
      linha.appendChild(b);
    });
    wrap.appendChild(linha); return wrap;
  }
  painel.appendChild(escolha('Sexo', [['homem', '♂ Homem'], ['mulher', '♀ Mulher']], 'sexo'));
  const escolhaVoc = escolha('Vocação', MODELOS.map((m) => [m, MODELO_NOME[m]]), 'tipo');
  painel.appendChild(escolhaVoc);
  // RV5.2: descrição da vocação (o jogador novo entende o que está escolhendo)
  const DESC_VOC = {
    cavaleiro: '⚔️ Linha de frente: nasce com Adaga e Escudo. Aguenta porrada e devolve em dobro.',
    paladino: '🏹 Atirador: nasce com Arco e 24 Flechas. Caça de LONGE — e Virotes batem ainda mais forte.',
    feiticeiro: '🔮 Conjurador arcano: nasce com 2 Runas de Fogo. As magias (teclas 1-5) são sua arma.',
    druida: '🌿 Guardião da natureza: nasce com 3 Poções de Vida. Cura, doma e sobrevive a tudo.',
  };
  const descVoc = document.createElement('div');
  descVoc.style.cssText = 'margin:-6px 0 14px;padding:9px 12px;border-radius:9px;background:#0e141c;border:1px solid #26303e;color:#b8c6d6;font-size:12.5px;line-height:1.5;min-height:34px;';
  const atualizaDesc = () => { descVoc.textContent = DESC_VOC[cores.tipo] || ''; };
  atualizaDesc();
  escolhaVoc.addEventListener('click', () => setTimeout(atualizaDesc, 0));
  painel.appendChild(descVoc);

  function grupo(label, tipo) {
    const wrap = document.createElement('div'); wrap.style.cssText = 'margin-bottom:14px;';
    const t = document.createElement('div'); t.textContent = label;
    t.style.cssText = 'font-size:13px;color:#9fb0c0;margin-bottom:6px;'; wrap.appendChild(t);
    const linha = document.createElement('div'); linha.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    PALETAS[tipo].forEach((c) => {
      const b = document.createElement('div');
      b.style.cssText = `width:40px;height:40px;border-radius:9px;background:${hex(c)};cursor:pointer;border:3px solid ${c === cores[tipo] ? '#fff' : 'transparent'};transition:border-color .1s;`;
      b.onclick = () => {
        cores[tipo] = c;
        [...linha.children].forEach((el, j) => { el.style.borderColor = (PALETAS[tipo][j] === c ? '#fff' : 'transparent'); });
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
  btn.textContent = 'ENTRAR EM VENOR';
  btn.style.cssText = 'width:100%;margin-top:8px;padding:14px;border:none;border-radius:10px;background:#3a7a4a;color:#fff;font-size:17px;font-weight:bold;cursor:pointer;';
  btn.onmouseenter = () => { btn.style.background = '#479158'; };
  btn.onmouseleave = () => { btn.style.background = '#3a7a4a'; };
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
  dica.textContent = 'o boneco ao fundo mostra sua aparência';
  dica.style.cssText = 'margin:12px 0 0;text-align:center;color:#67748a;font-size:12px;';
  painel.appendChild(dica);

  // RV5.3: vitrine do lançamento — o que chegou no Patch 1
  const nov = document.createElement('div');
  nov.innerHTML = '<b style="cursor:pointer;color:#e8d9a0;">📜 Novidades do Patch 1 ▾</b>'
    + '<div id="novLista" style="display:none;margin-top:8px;text-align:left;color:#9fb0c0;font-size:12px;line-height:1.7;">'
    + '• VENORE, a capital do pântano: canal, catedral, guildas e porto<br>'
    + '• 4 VOCAÇÕES com kits próprios (e Virotes pro atirador!)<br>'
    + '• Catacumbas de 2 andares + Cripta do tesouro<br>'
    + '• Montarias, pets de combate e o Filhote de Dragão da profecia<br>'
    + '• 13 missões, Guilda, Depósito, rede de Barcas e chefes com itens LENDÁRIOS<br>'
    + '• A LORE em 6 tomos — e o TERCEIRO SINAL espera os corajosos...<br>'
    + '• Conta na NUVEM (☁️ nome + PIN), noite escura, som e visual de cinema</div>';
  nov.style.cssText = 'margin:12px 0 0;text-align:center;font-size:13px;';
  nov.querySelector('b').onclick = () => {
    const l = nov.querySelector('#novLista');
    l.style.display = l.style.display === 'none' ? 'block' : 'none';
  };
  painel.appendChild(nov);

  ov.appendChild(painel);
  document.body.appendChild(ov);
}

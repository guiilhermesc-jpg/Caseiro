// =============================================================
//  BESTIÁRIO DOS DRAGÕES (RV13.1) — a arte premium (gerada por IA) + a
//  história de cada dragão, amarrada ao cânone da Veia. Overlay premium,
//  botão 🐲. As lendas que o maestro pediu.
// =============================================================
const DRAGOES = [
  { id: 'anciao', nome: 'Vaelthryx, o Dragão-Ancião', cor: '#d9b25a',
    hist: 'O primeiro a respirar fogo. Vaelthryx não nasceu de ovo — desprendeu-se da própria Veia-Mãe quando o mundo ainda era brasa. Reina em AURÉLIA, a cidade nas nuvens, guardando os ovos que ainda dormem. Quem passa na Prova de Fogo, ele chama de "Amigo da Chama".' },
  { id: 'fogo', nome: 'O Dragão do Forno', cor: '#ff6a2a',
    hist: 'Filho dos Três Ovos do Pico. Suas escamas são crosta de lava sobre sangue incandescente — a Veia-Mãe correndo por fora. Onde ele pousa, a terra lembra que já foi fornalha.' },
  { id: 'veia', nome: 'O Dragão da Veia', cor: '#9a4fd0',
    hist: 'Não é um dragão que TEM a Veia: é a Veia que virou dragão. Translúcido, com rios de ouro e violeta pulsando sob as escamas, é o que a terra sonha em ser quando acorda. Poucos o viram. Nenhum o esqueceu.' },
  { id: 'gelo', nome: 'O Dragão da Geada', cor: '#8fc8e8',
    hist: 'Dos confins gelados, onde a Veia esfriou em cristal. Seu sopro não queima: PARA. Congela a memória que corre, prende a água no instante. O oposto exato do Forno.' },
  { id: 'pantano', nome: 'A Serpe do Lodo', cor: '#7a9a4a',
    hist: 'A serpe velha de Venore, enrodilhada no brejo desde antes da cidade existir. Bebe a Veia turva do pântano. Não voa alto — não precisa. O pântano é dela, e ela é paciente.' },
  { id: 'sombra', nome: 'O Dragão de Obsidiana', cor: '#9a6aff',
    hist: 'Quando a Lua se partiu, um dragão bebeu da Fenda e ficou negro como obsidiana, com a luz roxa por dentro. É o pai dos Drakari — a sombra que a Vigília de Noctaria nunca para de vigiar.' },
  { id: 'drakari', nome: 'Os Drakari', cor: '#b0a090',
    hist: 'Nem homem, nem dragão: as duas idades de um corpo só. Guerreiros de escama e obsidiana que servem à Fenda da Lua Partida. Vê um Drakari e verás o que um dragão vira quando aprende a empunhar uma lâmina.' },
  { id: 'filhote', nome: 'O Filhote da Profecia', cor: '#6fd06f',
    hist: 'O ovo que a profecia guardou. Pequeno, redondo, de olhos grandes — mas é cria de Ancião. Quem o cria desde a casca ganha as asas mais velozes de Venor. O futuro dos dragões cabe na palma da mão.' },
];

export function criaBestiario() {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;'
    + 'background:rgba(6,4,10,.78);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);font-family:Arial,sans-serif;';
  const cx = document.createElement('div');
  cx.style.cssText = 'width:min(94vw,620px);max-height:88vh;overflow:auto;background:linear-gradient(180deg,rgba(22,17,30,.96),rgba(11,9,17,.98));'
    + 'border:1px solid rgba(201,167,90,.4);border-radius:18px;padding:22px 22px 16px;box-shadow:0 24px 80px rgba(0,0,0,.75);';
  cx.innerHTML = '<h2 style="margin:0 0 4px;text-align:center;font:900 26px/1 Georgia,serif;letter-spacing:4px;color:#f4e9c8;text-shadow:0 0 24px rgba(201,167,90,.5);">🐲 BESTIÁRIO DOS DRAGÕES</h2>'
    + '<p style="margin:0 0 16px;text-align:center;color:#c9a75a;font:italic 12px Georgia,serif;">As linhagens de fogo da Veia Viva</p>';
  for (const d of DRAGOES) {
    const card = document.createElement('div');
    card.style.cssText = 'display:flex;gap:14px;align-items:center;margin-bottom:14px;padding:10px;border-radius:12px;'
      + 'background:rgba(8,10,16,.6);border:1px solid rgba(201,167,90,.18);';
    card.innerHTML =
      `<img src="/assets/dragoes/${d.id}.png" alt="${d.nome}" loading="lazy" style="width:96px;height:96px;flex:0 0 96px;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(0,0,0,.6));">`
      + `<div><div style="font:800 16px Georgia,serif;color:${d.cor};margin-bottom:4px;">${d.nome}</div>`
      + `<div style="color:#cdbf9c;font-size:12.5px;line-height:1.5;">${d.hist}</div></div>`;
    cx.appendChild(card);
  }
  const fechar = document.createElement('button');
  fechar.textContent = 'Fechar';
  fechar.style.cssText = 'display:block;margin:6px auto 0;padding:10px 26px;border:none;border-radius:10px;background:linear-gradient(180deg,#d9b25a,#b0832f);color:#2a1c06;font:800 14px Georgia,serif;cursor:pointer;';
  fechar.onclick = () => { ov.style.display = 'none'; };
  cx.appendChild(fechar);
  ov.appendChild(cx);
  ov.addEventListener('click', (e) => { if (e.target === ov) ov.style.display = 'none'; });
  document.body.appendChild(ov);

  const botao = document.createElement('button');
  botao.textContent = '🐲';
  botao.title = 'Bestiário dos Dragões';
  botao.style.cssText = 'position:fixed;right:14px;bottom:256px;z-index:40;width:46px;height:46px;border-radius:50%;'
    + 'border:1px solid rgba(201,167,90,.5);background:rgba(16,12,22,.85);color:#fff;font-size:22px;cursor:pointer;display:none;'
    + 'box-shadow:0 6px 18px rgba(0,0,0,.5);';
  botao.onclick = () => { ov.style.display = 'flex'; };
  document.body.appendChild(botao);

  return {
    mostra() { botao.style.display = 'block'; },
    esconde() { botao.style.display = 'none'; ov.style.display = 'none'; },
    abre() { ov.style.display = 'flex'; },
  };
}

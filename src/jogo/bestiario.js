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
  { id: 'furia_noite', nome: 'A Fúria da Noite', cor: '#7aa2ff',
    hist: 'Escamas negras como o céu entre as estrelas, olhos verdes que enxergam no escuro. Caça quando a Lua Partida desperta e dorme ao primeiro sol. Dizem que a Veia, ao correr fria sob a noite, sonhou este dragão para ser o guardião do silêncio. Dócil com quem o cria desde filhote — implacável com quem ameaça seu cavaleiro.' },
  { id: 'furia_dia', nome: 'A Fúria do Dia', cor: '#ffcf5a',
    hist: 'Espelho da Fúria da Noite: escamas de pérola e ouro que bebem a luz e a devolvem em sopro flamejante. Voa mais forte sob o sol a pino. Onde a Noturna é a sombra que protege, a Diurna é o farol que avança. As duas linhagens nasceram do mesmo ovo partido — e se reconhecem como irmãs.' },
  { id: 'tres_cabecas', nome: 'O Trífauce', cor: '#e0584e',
    hist: 'Três cabeças, três fomes, uma só vontade. Quando a Veia se feriu fundo, a dor coagulou em três pescoços de um corpo só — e cada cabeça lembra de uma era do mundo. Domá-lo é raro e perigoso: é preciso convencer TRÊS mentes ao mesmo tempo. Quem consegue monta a lenda viva de Venor.' },
  { id: 'colosso', nome: 'O Colosso', cor: '#c89a5a',
    hist: 'Tão grande que o confundem com uma montanha que respira. Suas escamas são placas de rocha; entre elas, a Veia corre como lava à flor da pele. Quando estende as asas, o dia escurece; quando pousa, vilarejos inteiros tremem. Não se doma um Colosso — no máximo, conquista-se o seu respeito.' },
  { id: 'coracao', nome: 'O Guardião do Coração', cor: '#b98cff',
    hist: 'No peito carrega um cristal pulsando ouro e violeta: um fragmento vivo da própria Veia-Mãe. É o último guardião do Coração de Dragão — o item que consagra a sela capaz de domar um adulto. Derrotá-lo não é matar uma fera: é arrancar da terra a permissão de cavalgar os céus.' },
];

const CRIATURAS_GRANDE_ONDA = [
  { nome: 'Sentinela Celeste', glifo: 'S', cor: '#bfa6ff',
    hist: 'Guarda armada dos corredores altos de Aurelia. Luta em linha reta, prepara a lanca e pune quem entra no calabouco sem ler o chao.',
    funcao: 'Porta de entrada da hunt: ensina telegraph, alcance e valor de posicionamento.',
    loot: 'Pena Celeste, Elmo da Sentinela Celeste.' },
  { nome: 'Golem de Cristal', glifo: 'G', cor: '#9b72ff',
    hist: 'Pedra viva com cristais de vento presos no peito. E lento, pesado e feito para segurar sala, nao para perseguir corredor vazio.',
    funcao: 'Tanque de masmorra: golpe anunciado, vida alta e recompensa economica forte.',
    loot: 'Nucleo de Cristal Vivo, Anel de Cristal Vivo.' },
  { nome: 'Wyvern Celeste', glifo: 'W', cor: '#78a8ff',
    hist: 'Parente menor dos dragoes, adaptada aos rasgos de vento entre ilhas. Nao e montaria ainda: e predadora de altura.',
    funcao: 'Ameaca de mobilidade e pressagio das hunts aereas futuras.',
    loot: 'Escama de Wyvern Celeste, Capa de Asa Celeste.' },
  { nome: 'Guardiao do Primeiro Vento', glifo: 'V', cor: '#d6bcff',
    hist: 'O boss que mantem o primeiro selo do voo. Guarda a memoria de quando os homens aprenderam a subir montados em dragao.',
    funcao: 'Final do primeiro calabouco grande: escala, preparo, boss gate e sigilo de progressao.',
    loot: 'Selo do Primeiro Vento, Lanca do Primeiro Vento.' },
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
  const subtitulo = document.createElement('h3');
  subtitulo.textContent = 'Criaturas da Grande Onda';
  subtitulo.style.cssText = 'margin:18px 0 10px;text-align:center;font:800 18px Georgia,serif;color:#e8d9a0;letter-spacing:2px;';
  cx.appendChild(subtitulo);
  for (const c of CRIATURAS_GRANDE_ONDA) {
    const card = document.createElement('div');
    card.style.cssText = 'display:flex;gap:14px;align-items:flex-start;margin-bottom:12px;padding:12px;border-radius:12px;'
      + 'background:rgba(8,10,16,.66);border:1px solid rgba(154,112,255,.2);';
    card.innerHTML =
      `<div style="width:64px;height:64px;flex:0 0 64px;border-radius:14px;display:flex;align-items:center;justify-content:center;`
      + `background:radial-gradient(circle at 45% 35%,${c.cor},#111827 68%);color:#fff;font:900 28px Georgia,serif;`
      + `box-shadow:0 0 24px rgba(154,112,255,.32), inset 0 0 16px rgba(255,255,255,.16);">${c.glifo}</div>`
      + `<div><div style="font:800 15px Georgia,serif;color:${c.cor};margin-bottom:4px;">${c.nome}</div>`
      + `<div style="color:#cdbf9c;font-size:12.5px;line-height:1.5;">${c.hist}</div>`
      + `<div style="margin-top:6px;color:#91a9c7;font-size:12px;line-height:1.45;"><b>Funcao:</b> ${c.funcao}<br><b>Loot:</b> ${c.loot}</div></div>`;
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

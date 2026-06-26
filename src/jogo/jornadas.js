// Fonte unica para as jornadas de mundo.
// A ideia e tirar rotas, habitats e risco/recompensa do "achismo" e tratar
// cada caminho como uma peca de design calculavel.

export const ROTAS_JORNADA = [
  {
    id: 'venor-venore',
    nome: 'Estrada do Pantano',
    origem: { nome: 'Vilarejo de Venor', x: -86, z: -30 },
    destino: { nome: 'Venore', x: -258, z: -30 },
    mapa: { x1: -86, z1: -30, x2: -258, z2: -30, w: 8 },
    nivel: '1-4',
    risco: 2,
    tempo: '3-5 min',
    funcao: 'primeira viagem com sensacao de saida de casa e chegada a capital mercante',
    biomas: ['campo', 'mato baixo', 'pantano leve'],
    encontros: ['ratos', 'lobos isolados', 'coleta de ervas', 'mascate quando o calendario permite'],
    recompensa: ['ervas', 'cogumelos', 'primeiro dinheiro', 'acesso ao deposito e barcas'],
    criterio: 'deve ensinar rota, coleta, venda e retorno sem parecer corredor vazio',
  },
  {
    id: 'venor-thais',
    nome: 'Estrada da Vigia',
    origem: { nome: 'Vilarejo de Venor', x: 72, z: 0 },
    destino: { nome: 'Thais', x: 500, z: 0 },
    mapa: { x1: 72, z1: 0, x2: 500, z2: 0, w: 8 },
    nivel: '2-7',
    risco: 3,
    tempo: '6-9 min',
    funcao: 'viagem longa classica: torre, ponte, fazenda, cemiterio e perigo noturno',
    biomas: ['campo aberto', 'ponte', 'cemiterio', 'ruinas'],
    encontros: ['lobos da ponte', 'fazenda de Gildren', 'esqueletos a noite', 'bandidos na curva'],
    recompensa: ['quests iniciais', 'itens de caca', 'acesso a loja de Thais', 'lore dos viajantes'],
    criterio: 'o jogador deve lembrar de 3 marcos visuais antes de chegar',
  },
  {
    id: 'venor-praia',
    nome: 'Trilha do Sal',
    origem: { nome: 'Vilarejo de Venor', x: 0, z: -116 },
    destino: { nome: 'Praia de Venor', x: 0, z: -218 },
    mapa: { x1: 0, z1: -116, x2: 0, z2: -218, w: 6 },
    nivel: '1-5',
    risco: 1,
    tempo: '2-4 min',
    funcao: 'rota calma para pesca, conchas, tutorial de economia e pausa visual',
    biomas: ['trilha', 'areia', 'costa'],
    encontros: ['caranguejos', 'coleta de conchas', 'pesca', 'barca de retorno'],
    recompensa: ['peixes', 'conchas', 'dinheiro seguro', 'descoberta do porto'],
    criterio: 'deve ser bonita, relaxante e lucrativa sem virar exploit',
  },
  {
    id: 'venore-noctaria',
    nome: 'Caminho das Cinzas',
    origem: { nome: 'Venore', x: -424, z: -30 },
    destino: { nome: 'Noctaria', x: -552, z: -30 },
    mapa: { x1: -424, z1: -30, x2: -552, z2: -30, w: 8 },
    nivel: '6-12',
    risco: 5,
    tempo: '5-8 min',
    funcao: 'travessia de transicao para conteudo sombrio, com risco real e preparo',
    biomas: ['pantano denso', 'cinzas', 'ruinas negras'],
    encontros: ['Drakari', 'guardas elite', 'luz baixa', 'veneno e lava perto da Lua Partida'],
    recompensa: ['escamas drakari', 'obsidiana', 'cadeia de quests de alto nivel'],
    criterio: 'deve avisar perigo antes de punir; quem entrar fraco entende por que morreu',
  },
  {
    id: 'noctaria-lua-partida',
    nome: 'Passagem da Lua Partida',
    origem: { nome: 'Noctaria', x: -690, z: -30 },
    destino: { nome: 'Santuario da Lua Partida', x: -742, z: -30 },
    mapa: { x1: -690, z1: -30, x2: -742, z2: -30, w: 7 },
    nivel: '10-14',
    risco: 6,
    tempo: '2-3 min',
    funcao: 'curta, tensa e memoravel: o caminho final antes do chefe da era',
    biomas: ['obsidiana', 'fenda', 'lava'],
    encontros: ['Drakari elite', 'Arconte Drakari quando invocado', 'campos de dano'],
    recompensa: ['drops raros', 'Selo da Lua Partida', 'prestigio de guilda'],
    criterio: 'precisa parecer fronteira de boss, nao apenas mais uma estrada',
  },
  {
    id: 'ruinas-pico-dragao',
    nome: 'Trilha do Pico',
    origem: { nome: 'Ruinas Antigas', x: 150, z: 250 },
    destino: { nome: 'Pico do Dragao', x: 110, z: 300 },
    mapa: { x1: 150, z1: 250, x2: 110, z2: 300, w: 5 },
    nivel: '7-13',
    risco: 5,
    tempo: '4-7 min',
    funcao: 'rota vertical de montanha: lava, caverna, dragao e materiais raros',
    biomas: ['rocha', 'montanha', 'lava', 'ninho'],
    encontros: ['trolls', 'escorpioes', 'dragao', 'Troll Anciao'],
    recompensa: ['escamas', 'Cristal do Pico', 'acesso ao pet da profecia'],
    criterio: 'o jogador deve ver o perigo de longe e querer subir mesmo assim',
  },
  {
    id: 'passo-ciclope',
    nome: 'Passo do Ciclope',
    origem: { nome: 'Ponte de Pedra', x: 120, z: 12 },
    destino: { nome: 'Contraforte Norte', x: 205, z: 170 },
    mapa: { x1: 120, z1: 12, x2: 205, z2: 170, w: 5 },
    nivel: '5-10',
    risco: 4,
    tempo: '5-8 min',
    funcao: 'rota de montanha intermediaria com cyclops guardando minerio e passagem',
    biomas: ['encosta', 'pinheiros', 'pedra solta'],
    encontros: ['cyclops fixos', 'lobos famintos', 'veios de pedra', 'acampamento de cacador'],
    recompensa: ['ossos grandes', 'minerio bruto', 'atalho visual para o Pico'],
    criterio: 'deve ser dificil o suficiente para exigir comida/pocao, mas nao ser parede de progressao',
  },
  {
    id: 'rede-barcaria',
    nome: 'Rede de Barcas',
    origem: { nome: 'Porto de Venore', x: -322, z: -82 },
    destino: { nome: 'Cais do Vilarejo', x: 45, z: 62 },
    mapa: { x1: -322, z1: -82, x2: 45, z2: 62, w: 4 },
    nivel: '1+',
    risco: 0,
    tempo: 'instantaneo pago',
    funcao: 'atalho pago que respeita tempo do jogador sem matar o valor das estradas',
    biomas: ['canal', 'porto', 'costa'],
    encontros: ['NPC de barca', 'pesca no cais', 'rotas de comercio'],
    recompensa: ['economia de tempo', 'custo de oportunidade', 'ciclo porto-venda'],
    criterio: 'barca deve economizar tempo, mas a estrada deve render descoberta e loot',
  },
  {
    id: 'aurelia-primeiros-ventos',
    nome: 'Rota dos Primeiros Ventos',
    origem: { nome: 'Aurelia', x: -720, z: 720 },
    destino: { nome: 'Portao dos Primeiros Ventos', x: -612, z: 700 },
    mapa: { x1: -720, z1: 720, x2: -612, z2: 700, w: 5 },
    nivel: '16-22',
    risco: 8,
    tempo: 'rota vertical / entrada de calabouco',
    funcao: 'primeiro conteudo de alturas: prepara voo, medo de queda, visao de mundo e boss de era',
    biomas: ['ilhas suspensas', 'pontes de pedra', 'cristais violetas', 'vento sagrado'],
    encontros: ['Sentinelas Celestes', 'Golems de Cristal', 'Wyverns Celestes', 'Guardiao do Primeiro Vento'],
    recompensa: ['Pena Celeste', 'Nucleo de Cristal Vivo', 'Selo do Primeiro Vento', 'sigilo de voo futuro'],
    criterio: 'deve parecer uma grande viagem curta: cada ponte precisa de leitura, risco e recompensa',
  },
  {
    id: 'aurelia-ilhas-perdidas',
    nome: 'Arquipelago Suspenso',
    origem: { nome: 'Aurelia', x: -720, z: 720 },
    destino: { nome: 'Mirante do Voo Rasante', x: -664, z: 802 },
    mapa: { x1: -720, z1: 720, x2: -664, z2: 802, w: 4 },
    nivel: '14-20',
    risco: 7,
    tempo: 'exploracao aberta',
    funcao: 'laboratorio do voo draconico: lugar bonito, perigoso e grande o bastante para voltar depois',
    biomas: ['jardins suspensos', 'obeliscos de linhagem', 'mirantes', 'neblina alta'],
    encontros: ['patrulhas celestes', 'cristais de afinidade', 'lore dos primeiros dragoeiros'],
    recompensa: ['atalhos visuais', 'memorias antigas', 'preparacao para montarias voadoras'],
    criterio: 'deve vender a promessa do voo sem liberar voo livre antes da hora',
  },
];

export const HABITATS_FIXOS = [
  {
    id: 'ponte-lobos',
    nome: 'Covil dos Lobos da Ponte',
    x: 116, z: 8, raio: 34, nivel: '2-5', risco: 2,
    criaturas: ['lobo'],
    raro: 'lobo alfa futuro',
    respawn: 'baixo e constante',
    valor: 'primeira caca real, couro e quest do Brannar',
  },
  {
    id: 'cemiterio',
    nome: 'Cemiterio Abandonado',
    x: 130, z: -60, raio: 44, nivel: '3-7', risco: 3,
    criaturas: ['esqueleto'],
    raro: 'morto noturno',
    respawn: 'mais forte a noite',
    valor: 'morte, lore, quest do Tovaryn e risco por horario',
  },
  {
    id: 'ninho-aranhas',
    nome: 'Ninho das Aranhas',
    x: 40, z: 330, raio: 42, nivel: '4-8', risco: 3,
    criaturas: ['aranha pequena', 'aranha tecela'],
    raro: 'Manto de Seda',
    respawn: 'medio, com mini-boss',
    valor: 'seda para economia de arco/runa',
  },
  {
    id: 'ruinas-orcs',
    nome: 'Ruinas da Estrada',
    x: 150, z: 250, raio: 58, nivel: '6-10', risco: 4,
    criaturas: ['orc veterano', 'Senhor da Guerra'],
    raro: 'Machado do Senhor da Guerra',
    respawn: 'elite em ponto fixo',
    valor: 'camp de grupo pequeno e trofeu de rota',
  },
  {
    id: 'pico-dragao',
    nome: 'Pico do Dragao',
    x: 110, z: 300, raio: 72, nivel: '8-14', risco: 6,
    criaturas: ['dragao', 'troll anciao', 'escorpiao'],
    raro: 'Escudo do Dragao e Clava de Magma',
    respawn: 'lento, alta recompensa',
    valor: 'lugar aspiracional, pet da profecia, lava e boss',
  },
  {
    id: 'passo-ciclope',
    nome: 'Passo do Ciclope',
    x: 205, z: 170, raio: 50, nivel: '5-10', risco: 4,
    criaturas: ['cyclops'],
    raro: 'olho polido futuro',
    respawn: 'fixo por montanha',
    valor: 'midgame de montanha para minerio e viagem memoravel',
  },
  {
    id: 'brejo-profundo',
    nome: 'Brejo Profundo',
    x: 225, z: -95, raio: 62, nivel: '4-9', risco: 3,
    criaturas: ['cobra', 'troll'],
    raro: 'Dente do Profundo',
    respawn: 'veneno e emboscada',
    valor: 'material venenoso, quest da Mara Veyr e leitura de bioma',
  },
  {
    id: 'lua-partida',
    nome: 'Santuario da Lua Partida',
    x: -742, z: -30, raio: 70, nivel: '10-14', risco: 6,
    criaturas: ['Drakari elite', 'Arconte Drakari'],
    raro: 'Lamina da Lua Partida',
    respawn: 'boss por invocacao de quest',
    valor: 'conteudo de era, preparo e prestigio social',
  },
  {
    id: 'calabouco-primeiros-ventos',
    nome: 'Calabouco dos Primeiros Ventos',
    x: -1010, z: 840, raio: 120, nivel: '16-22', risco: 8,
    criaturas: ['Sentinela Celeste', 'Golem de Cristal', 'Wyvern Celeste', 'Guardiao do Primeiro Vento'],
    raro: 'Lanca do Primeiro Vento',
    respawn: 'salas densas, boss lento e rota de retorno por Aurelia',
    valor: 'primeiro calabouco grande: quest, loot caro, prova de grupo e preparacao para voo',
  },
  {
    id: 'mirante-voo-rasante',
    nome: 'Mirante do Voo Rasante',
    x: -664, z: 802, raio: 44, nivel: '14-20', risco: 6,
    criaturas: ['patrulhas celestes futuras', 'dragoes de treino futuros'],
    raro: 'Sigilo do Voo Rasante',
    respawn: 'baixo, mais exploracao que farm',
    valor: 'define onde o jogador sente pela primeira vez que voar sera possivel',
  },
];

export const SISTEMAS_RPG_PRIORITARIOS = [
  {
    id: 'casas',
    nome: 'Casas e familia',
    objetivo: 'comprar, decorar, guardar, convidar amigos e criar identidade social',
    falta: 'posse persistente por lote, decoracao, permissoes e aluguel/manutencao',
  },
  {
    id: 'mercado',
    nome: 'Mercado de jogadores',
    objetivo: 'criar economia viva sem depender so de NPC',
    falta: 'ordens de compra/venda, historico de preco, taxas e limites anti-inflacao',
  },
  {
    id: 'profissoes',
    nome: 'Coleta e profissao',
    objetivo: 'fazer cada viagem render material, reputacao e plano',
    falta: 'mineracao, herbalismo, pesca avancada, refinamento e receitas',
  },
  {
    id: 'rotina-npc',
    nome: 'NPCs com agenda',
    objetivo: 'dar valor ao tempo: dia, noite, semana, clima e eventos',
    falta: 'rotina por NPC, estoque por dia, rumores e deslocamento real pelo mapa',
  },
  {
    id: 'guildas',
    nome: 'Guildas e grupos',
    objetivo: 'coordenar boss, rotas perigosas, casas de grupo e eventos',
    falta: 'party, cargo, cofre de guilda, contrato de viagem e quadro de eventos',
  },
  {
    id: 'morte',
    nome: 'Morte justa e memoravel',
    objetivo: 'criar tensao sem frustrar: risco calculavel, perda recuperavel e protecao cara',
    falta: 'bencao/seguro, penalidade por nivel, corpo com marcador e custo de resgate',
  },
  {
    id: 'criaturas',
    nome: 'Habitats e raros',
    objetivo: 'cada criatura pertence a um lugar e tem motivo economico',
    falta: 'tabela unica de spawn por habitat, horario, raridade, loot esperado e respawn',
  },
  {
    id: 'offline-online',
    nome: 'Offline com online opcional',
    objetivo: 'jogar como Minecraft: mundo local primeiro, multiplayer depois quando quiser',
    falta: 'resolucao de conflito entre save local/nuvem e snapshot de mundo por conta',
  },
];

export const CONTRATOS_VIAGEM_RV174 = [
  {
    id: 'caravana-venore',
    nome: 'Caravana do Pantano',
    origem: 'Venor',
    destino: 'Venore',
    custo: 18,
    requisito: 'nivel 1+',
    funcao: 'atalho barato para comercio, mas com menos loot que caminhar pela estrada',
    risco: 'baixo',
  },
  {
    id: 'carroca-thais',
    nome: 'Carroca da Vigia',
    origem: 'Venor',
    destino: 'Thais',
    custo: 46,
    requisito: 'nivel 4+',
    funcao: 'economiza tempo quando o jogador ja conhece a rota e quer voltar ao objetivo',
    risco: 'moderado',
  },
  {
    id: 'barca-sal',
    nome: 'Barca do Sal',
    origem: 'Portos',
    destino: 'Praia de Venor',
    custo: 22,
    requisito: 'porto descoberto',
    funcao: 'liga pesca, conchas e comercio sem apagar o valor da trilha costeira',
    risco: 'seguro',
  },
  {
    id: 'subida-aurelia',
    nome: 'Ritual de Subida',
    origem: 'Pico do Dragao',
    destino: 'Aurelia',
    custo: 120,
    requisito: 'Manto do Mago Viajante',
    funcao: 'viagem premium para conteudo de alturas; prepara a futura montaria voadora',
    risco: 'alto',
  },
];

export function rotasParaMapa() {
  return ROTAS_JORNADA.map((rota) => ({
    ...rota.mapa,
    nome: rota.nome,
    risco: rota.risco,
    id: rota.id,
  }));
}

export function pontosJornadaParaMapa() {
  return HABITATS_FIXOS.map((h) => ({ nome: h.nome, x: h.x, z: h.z }));
}

export function riscoTexto(risco) {
  if (risco <= 1) return 'segura';
  if (risco <= 3) return 'moderada';
  if (risco <= 5) return 'perigosa';
  return 'mortal';
}

export function calculaValorRota(rota) {
  const risco = Math.max(0, rota.risco || 0);
  const encontros = (rota.encontros || []).length;
  const recompensas = (rota.recompensa || []).length;
  return risco * 2 + encontros + recompensas;
}

export function criaQuadroJornadas({ onMarcarDestino = null, onAbrirMapa = null } = {}) {
  const botao = document.createElement('button');
  botao.textContent = 'ROTAS';
  botao.title = 'Quadro de jornadas, habitats e valor das viagens';
  botao.style.cssText = 'position:fixed;right:14px;bottom:146px;z-index:80;display:none;'
    + 'border:1px solid rgba(232,217,160,.55);background:linear-gradient(180deg,rgba(32,39,45,.96),rgba(12,16,20,.96));'
    + 'color:#f4e9c8;border-radius:10px;padding:10px 12px;font:800 12px Georgia,serif;letter-spacing:.8px;'
    + 'box-shadow:0 8px 24px rgba(0,0,0,.45);cursor:pointer;touch-action:none;';
  document.body.appendChild(botao);

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:122;display:none;align-items:center;justify-content:center;'
    + 'background:rgba(4,8,12,.74);font-family:Arial,sans-serif;color:#f4ead2;padding:16px;';

  const card = document.createElement('div');
  card.style.cssText = 'width:min(1080px,95vw);max-height:90vh;overflow:auto;border:1px solid rgba(232,217,160,.38);'
    + 'background:linear-gradient(180deg,rgba(28,24,18,.98),rgba(12,15,18,.99));border-radius:14px;'
    + 'box-shadow:0 18px 70px rgba(0,0,0,.68);';
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  function rotaHtml(rota) {
    const valor = calculaValorRota(rota);
    return `<article style="border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);border-radius:10px;padding:13px;display:flex;flex-direction:column;gap:8px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div>
          <div style="font:800 16px Georgia,serif;color:#f4e9c8;">${rota.nome}</div>
          <div style="font-size:12px;color:#9fb0c0;">${rota.origem.nome} -> ${rota.destino.nome}</div>
        </div>
        <div style="font:800 11px Arial,sans-serif;color:#101820;background:#e8d9a0;border-radius:999px;padding:5px 8px;white-space:nowrap;">Risco ${rota.risco} - ${riscoTexto(rota.risco)}</div>
      </div>
      <div style="color:#c8d3df;font-size:13px;line-height:1.45;">${rota.funcao}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:#afbbc8;font-size:12px;line-height:1.45;">
        <div><b style="color:#d8c889;">Encontros:</b> ${rota.encontros.join(', ')}</div>
        <div><b style="color:#d8c889;">Valor:</b> ${rota.recompensa.join(', ')}</div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px;">
        <div style="font-size:11px;color:#8795a5;">nivel ${rota.nivel} - ${rota.tempo} - indice ${valor}</div>
        <button data-destino="${rota.id}" style="border:1px solid #5b6a7a;background:#172334;color:#edf4ff;border-radius:8px;padding:8px 10px;font-weight:800;cursor:pointer;">Marcar destino</button>
      </div>
    </article>`;
  }

  function habitatHtml(h) {
    return `<article style="border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.16);border-radius:9px;padding:10px;">
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <b style="color:#f4e9c8;font-size:13px;">${h.nome}</b>
        <span style="font-size:11px;color:#e8d9a0;">risco ${h.risco}</span>
      </div>
      <div style="font-size:12px;color:#aeb9c8;line-height:1.45;margin-top:5px;">${h.criaturas.join(', ')} - ${h.valor}</div>
      <div style="font-size:11px;color:#8795a5;margin-top:5px;">raro: ${h.raro} - ${h.respawn}</div>
    </article>`;
  }

  function contratoHtml(c) {
    return `<article style="border:1px solid rgba(232,217,160,.16);background:rgba(232,217,160,.05);border-radius:9px;padding:10px;">
      <div style="display:flex;justify-content:space-between;gap:8px;">
        <b style="color:#f4e9c8;font-size:13px;">${c.nome}</b>
        <span style="font-size:11px;color:#e8d9a0;">${c.custo} moedas</span>
      </div>
      <div style="font-size:12px;color:#aeb9c8;line-height:1.45;margin-top:5px;">${c.origem} -> ${c.destino} - ${c.funcao}</div>
      <div style="font-size:11px;color:#8795a5;margin-top:5px;">requisito: ${c.requisito} - risco: ${c.risco}</div>
    </article>`;
  }

  function render() {
    card.innerHTML = `
      <div style="padding:20px 22px 16px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
        <div>
          <div style="font:700 12px Georgia,serif;letter-spacing:4px;color:#e8d9a0;">PATCH RV17.5</div>
          <div style="font:900 34px Georgia,serif;line-height:1;color:#fff;text-shadow:0 3px 16px #000;">A Grande Onda Expandida</div>
          <p style="margin:10px 0 0;color:#b7c3cf;line-height:1.55;max-width:720px;">
            Distancia agora tem custo, funcao e escolha. O RV17.2-RV17.5 transforma hunts,
            interiores, contratos de viagem e moradias em sistemas mais proximos de MMO classico.
          </p>
        </div>
        <button id="jornadas-fechar" style="width:36px;height:34px;border-radius:8px;border:1px solid #445266;background:#172334;color:#e8eef7;font-size:16px;cursor:pointer;">X</button>
      </div>
      <div style="padding:18px 22px;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:18px;">
        <section>
          <h2 style="margin:0 0 10px;font:800 18px Georgia,serif;color:#f4e9c8;">Rotas principais</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:12px;">
            ${ROTAS_JORNADA.map(rotaHtml).join('')}
          </div>
        </section>
        <aside>
          <h2 style="margin:0 0 10px;font:800 18px Georgia,serif;color:#f4e9c8;">Habitats fixos</h2>
          <div style="display:flex;flex-direction:column;gap:9px;">${HABITATS_FIXOS.map(habitatHtml).join('')}</div>
          <h2 style="margin:14px 0 10px;font:800 18px Georgia,serif;color:#f4e9c8;">Contratos de viagem</h2>
          <div style="display:flex;flex-direction:column;gap:9px;">${CONTRATOS_VIAGEM_RV174.map(contratoHtml).join('')}</div>
          <div style="margin-top:14px;border:1px solid rgba(232,217,160,.22);border-radius:10px;padding:12px;background:rgba(232,217,160,.055);">
            <b style="display:block;color:#e8d9a0;margin-bottom:5px;">Regra do patch</b>
            <div style="color:#c8d3df;font-size:12px;line-height:1.55;">
              Monstro bom tem casa, horario, loot, risco e motivo. Se nao muda uma decisao do jogador, nao entra.
            </div>
          </div>
          <button id="jornadas-mapa" style="margin-top:12px;width:100%;border:1px solid #5b6a7a;background:#172334;color:#edf4ff;border-radius:9px;padding:10px;font-weight:900;cursor:pointer;">Abrir mapa do mundo</button>
        </aside>
      </div>`;

    card.querySelector('#jornadas-fechar').addEventListener('pointerdown', fecha);
    card.querySelector('#jornadas-mapa').addEventListener('pointerdown', () => {
      fecha();
      if (onAbrirMapa) onAbrirMapa();
    });
    card.querySelectorAll('[data-destino]').forEach((b) => {
      b.addEventListener('pointerdown', () => {
        const rota = ROTAS_JORNADA.find((r) => r.id === b.getAttribute('data-destino'));
        if (!rota || !onMarcarDestino) return;
        fecha();
        onMarcarDestino({ nome: rota.destino.nome, x: rota.destino.x, z: rota.destino.z, rota: rota.nome });
      });
    });
  }

  function abre() { render(); overlay.style.display = 'flex'; }
  function fecha() { overlay.style.display = 'none'; }
  function mostra() { botao.style.display = 'block'; }
  function esconde() { botao.style.display = 'none'; fecha(); }

  botao.addEventListener('pointerdown', (e) => { e.stopPropagation(); abre(); });
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) fecha(); });

  return { abre, fecha, mostra, esconde, el: botao };
}

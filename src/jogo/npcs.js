// =============================================================
//  NPCs de VENORE  ·  elenco no padrão Tibia: cada morador tem
//  OFÍCIO, POSTO fixo (perto do que faz) e DIÁLOGO de papel.
//  Perambulam de leve em volta do posto (sem travar), com humor.
//  Clicáveis: userData.tipo='npc', .ref = dados (nome/prof/falas...).
// =============================================================
import * as THREE from 'three';
import { criaAvatar, animaAvatar, giraSuave } from './avatar.js';

const TAU = Math.PI * 2;
const PELE = [0xf2d6b8, 0xe0b088, 0xc89060, 0x9c6a42, 0x6e4628];
const CABELO = [0x241c14, 0x5a3a1c, 0xc8a24e, 0xa33a22, 0xb8b8b8];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Elenco distribuído pela cidade (cada ofício no seu lugar)
// Cada NPC fica NO SEU comércio/posto (espalhados pela cidade, não no meio da praça)
// RV5.7: acampamento do Mascate sorteado a cada sessão (os 3 pontos têm
// fogueira na beira da estrada de Thais)
const POSTO_MASCATE = [[122, 17], [210, -17], [382, 19]][Math.floor(Math.random() * 3)];

const ROSTER = [
  { nome: 'Otto', prof: 'Mercador', post: { x: 17, z: 11 }, cor: 0x7a4632, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Minha banca fica aqui na Rua do Mercado. Compro seu loot!', dica: 'Quanto mais você me vende, mais coisa RARA eu consigo trazer pras prateleiras.' },
    ofertas: [{ precisa: 20, item: { nome: 'Amuleto da Fortuna', icone: '📿', preco: 150, slot: 'colar', defesa: 4 } }] },
  { nome: 'Greta', prof: 'Padeira', post: { x: 4, z: -104 }, cor: 0xd8c4a0, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Assando pão no mercado coberto do Bairro do Comércio. Sinta o cheiro!', dica: 'Queijo fresco atrai ratos... e aventureiros famintos.' } },
  { nome: 'Bram', prof: 'Ferreiro', post: { x: -17, z: 11 }, cor: 0x445162, humor: 'mau', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Minha forja fica na Rua do Ferreiro. Aço de verdade — escolha sua arma.', dica: 'Traga COURO, OSSO e PRESAS da caça: com matéria-prima eu forjo armas melhores pra te vender!' },
    loja: [
      { nome: 'Adaga', icone: '🗡️', preco: 25, slot: 'maoDir', dano: 8, arma: true },
      { nome: 'Espada', icone: '⚔️', preco: 60, slot: 'maoDir', dano: 12, arma: true },
      { nome: 'Machado', icone: '🪓', preco: 100, slot: 'maoDir', dano: 16, arma: true },
    ],
    compra: ['Couro', 'Osso', 'Presa do Boss', 'Escama de Dragão', 'Coração de Dragão'],
    ofertas: [
      { precisa: 12, item: { nome: 'Espada Longa', icone: '🗡️', preco: 220, slot: 'maoDir', dano: 20, arma: true } },
      { precisa: 30, item: { nome: 'Machado de Guerra', icone: '🪓', preco: 480, slot: 'maoDir', dano: 26, arma: true } },
    ] },
  { nome: 'Sira', prof: 'Curandeira', post: { x: 30, z: 3 }, cor: 0xeef0f2, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Atendo DENTRO do hospital — entre pela porta da praça. Poções frescas todo dia.', dica: 'Me traga ERVAS e COGUMELOS da mata: com bons ingredientes eu preparo poções mais fortes.' },
    loja: [{ nome: 'Poção de Vida', icone: '🧪', preco: 8, slot: 'pocao', usavel: 'pocao' }],
    compra: ['Erva', 'Cogumelo', 'Frasco'],
    ofertas: [{ precisa: 10, item: { nome: 'Poção Grande', icone: '🧉', preco: 20, slot: 'pocao', usavel: 'pocaoGrande' } }] },
  // --- LOJAS estilo Tibia (cada vendedor com sua finalidade) ---
  { nome: 'Eldra', prof: 'Vendedora de Runas', post: { x: -22, z: 17 }, cor: 0x5a2a8a, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Runas mágicas! Cura na hora ou fogo nos inimigos — escolha a sua.', dica: 'Ervas, frascos e relíquias de monstro viram TINTA DE RUNA: me venda e eu gravo runas mais poderosas.' },
    loja: [
      { nome: 'Runa de Cura', icone: '✨', preco: 15, slot: 'runa', usavel: 'runaCura' },
      { nome: 'Runa de Fogo', icone: '🔥', preco: 20, slot: 'runa', usavel: 'runaFogo' },
    ],
    compra: ['Erva', 'Frasco', 'Olho do Beholder', 'Seda de Aranha'],
    ofertas: [{ precisa: 10, item: { nome: 'Runa Explosiva', icone: '💣', preco: 60, slot: 'runa', usavel: 'runaExplosiva' } }] },
  { nome: 'Falk', prof: 'Arqueiro', post: { x: 22, z: -15 }, cor: 0x3a5a2a, humor: 'bom', sexo: 'homem', tipo: 'cacador',
    falas: { trabalho: 'Arcos e flechas de primeira. Com um arco você caça de LONGE.', dica: 'Couro e seda de aranha fazem cordas melhores — me venda que eu monto um ARCO LONGO pra você.' },
    loja: [
      { nome: 'Arco', icone: '🏹', preco: 80, slot: 'maoDir', dano: 10, arma: true, arco: true },
      { nome: 'Flechas (12)', icone: '➹', preco: 10, pacote: { nome: 'Flecha', icone: '➹', qtd: 12 } },
      { nome: 'Virotes (12)', icone: '🏹', preco: 18, pacote: { nome: 'Virote', icone: '🏹', qtd: 12 } },
    ],
    compra: ['Couro', 'Seda de Aranha', 'Osso'],
    ofertas: [{ precisa: 12, item: { nome: 'Arco Longo', icone: '🏹', preco: 260, slot: 'maoDir', dano: 15, arma: true, arco: true, alcance: 18 } }] },
  { nome: 'Tobias', prof: 'Sacerdote', post: { x: 0, z: -34 }, cor: 0x6a4a8a, humor: 'bom', sexo: 'homem', tipo: 'mago',
    falas: { trabalho: 'Sirvo dentro do Templo Sagrado, junto ao altar.', dica: 'Quando alguém cai em batalha, os deuses o trazem de volta a este templo. Mas há um preço: experiência e a mochila ficam para trás...' } },
  { nome: 'Lia', prof: 'Escriba', post: { x: 3, z: 23 }, cor: 0x3a5a8a, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Ensino as crianças aqui na escola e copio os velhos livros.', dica: 'O cristal arcano reage a quem tem dom. Já tentou examiná-lo?' } },
  { nome: 'Marta', prof: 'Fazendeira', post: { x: 16, z: -15 }, cor: 0x556b2f, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Cuido das hortas e deste poço. Água limpa é vida.', dica: 'As flores azuis só nascem à beira d’água.' } },
  { nome: 'Vasco', prof: 'Guarda', post: { x: -24, z: -3 }, cor: 0x2a3a6a, humor: 'mau', sexo: 'homem', tipo: 'cavaleiro',
    falas: { trabalho: 'Posto fixo na delegacia. Vigio os bueiros: coisas sobem de lá à noite.', dica: 'A estrada a leste leva a Thais. Longa e perigosa — leve poções.' } },
  { nome: 'Nuno', prof: 'Aldeão', post: { x: 28, z: 18 }, cor: 0x6a2a3a, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Eu? Só vivo por aqui, vendo a vida passar.', dica: 'Venore já foi maior. As montanhas guardam segredos.' } },
  { nome: 'Inês', prof: 'Aldeã', post: { x: -28, z: -18 }, cor: 0x8a6a2a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Costuro e cuido das ruas do lado oeste.', dica: 'Dizem que há cidades além das montanhas.' } },
  { nome: 'Caio', prof: 'Pescador', post: { x: 43, z: 64 }, cor: 0x2a6a5a, humor: 'bom', sexo: 'homem', tipo: 'cacador',
    falas: { trabalho: 'Pesco aqui do cais do porto. Paciência é tudo.', dica: 'Cada lago tem seus peixes — e a Yara de Thais paga bem pelos raros.' } },
  // --- moradores de THAIS (cidade distante, agora em x≈560) ---
  { nome: 'Dorian', prof: 'Guardião do Portão', post: { x: 520, z: 6 }, home: { x: 548, z: -12 }, cor: 0x6a5a3a, humor: 'mau', sexo: 'homem', tipo: 'cavaleiro',
    falas: { trabalho: 'Guardo o portão de Thais dia e noite. Não passa quem não deve.', dica: 'A estrada que te trouxe é infestada de trolls e bandidos. Sorte sua.' } },
  // Yara agora atende DENTRO da loja de poções (interior de verdade, atrás do balcão)
  { nome: 'Yara', prof: 'Mercadora', post: { x: 572, z: -21.2 }, home: { x: 572, z: -12 }, cor: 0xb8902a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Esta loja é minha: poções e especiarias de terras distantes. Thais vive do comércio.', dica: 'Em Venore o pão é melhor, mas aqui o ouro corre solto.' },
    loja: [
      { nome: 'Poção de Vida', icone: '🧪', preco: 8, slot: 'pocao', usavel: 'pocao' },
      { nome: 'Flechas (12)', icone: '➹', preco: 10, pacote: { nome: 'Flecha', icone: '➹', qtd: 12 } },
    ],
    ofertas: [{ precisa: 20, item: { nome: 'Botas Reforçadas', icone: '🥾', preco: 150, slot: 'pes', defesa: 4 } }] },
  { nome: 'Aldo', prof: 'Sacerdote de Thais', post: { x: 560, z: 9 }, home: { x: 556, z: -10 }, cor: 0x2f7d72, humor: 'bom', sexo: 'homem', tipo: 'mago',
    falas: { trabalho: 'Cuido do templo no alto da praça. Suba os degraus e descanse.', dica: 'Dizem que sob Thais há catacumbas tão fundas quanto o esgoto de Venore.' } },
  { nome: 'Khan', prof: 'Caçador', post: { x: 546, z: -10 }, home: { x: 548, z: -12 }, cor: 0x4a6a2a, humor: 'bom', sexo: 'homem', tipo: 'cacador',
    falas: { trabalho: 'Caço nas terras selvagens entre as duas cidades.', dica: 'O ciclope do vale dá um bom couro — se você sobreviver a ele.' } },
  { nome: 'Bibi', prof: 'Aldeã', post: { x: 566, z: -10 }, home: { x: 572, z: -12 }, cor: 0xc05a7a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Nasci em Thais e nunca saí. Pra que sair de um lugar tão bonito?', dica: 'A fonte da praça nunca seca, dizem que é abençoada.' } },
  // --- moradores do CAMINHO (entre as duas cidades) ---
  { nome: 'Bruno', prof: 'Vigia da Estrada', post: { x: 122, z: -2 }, home: { x: 122, z: -6 }, cor: 0x2a3a6a, humor: 'mau', sexo: 'homem', tipo: 'cavaleiro',
    falas: { trabalho: 'Vigio a estrada do alto da torre. O braseiro fica aceso a noite toda.', dica: 'Daqui até Thais são mais de 400 passos. Cuidado na ponte: lobos rondam, e além do rio a estrada só piora.' } },
  { nome: 'Gil', prof: 'Lavrador', post: { x: 105, z: 53 }, home: { x: 105, z: 50 }, cor: 0x8a6a2a, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Planto trigo nesta terra desde moleque. O espantalho? Chama-se Zé.', dica: 'Não vá ao cemitério depois do anoitecer. Os mortos lá não descansam.' } },
  // --- VENORE, a Cidade Mercante do Pântano (RV4.0 — cidade PRINCIPAL) ---
  { nome: 'Anselmo', prof: 'Mercador', post: { x: -320, z: -13 }, home: { x: -322, z: -44 }, cor: 0x8a6a2a, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'O Grande Mercado é meu: tudo que o pântano e a estrada trazem passa por esta banca.', dica: 'O canal leva as barcas até o porto. Sem ele, Venore afundava na lama.' },
    ofertas: [{ precisa: 25, item: { nome: 'Anel do Mercador', icone: '💍', preco: 180, slot: 'anel', defesa: 3 } }] },
  { nome: 'Berta', prof: 'Alquimista', post: { x: -284, z: -47.3 }, home: { x: -284, z: -38 }, cor: 0x7a3a6a, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Minha loja destila o que o brejo dá: poções, essências e uns vapores melhor não perguntar.', dica: 'Erva e cogumelo do pântano rendem o dobro na minha banca.' },
    loja: [{ nome: 'Poção de Vida', icone: '🧪', preco: 8, slot: 'pocao', usavel: 'pocao' }],
    compra: ['Erva', 'Cogumelo', 'Frasco'],
    ofertas: [{ precisa: 10, item: { nome: 'Poção Grande', icone: '🧉', preco: 20, slot: 'pocao', usavel: 'pocaoGrande' } }] },
  { nome: 'Grom', prof: 'Ferreiro', post: { x: -308, z: -53.4 }, home: { x: -340, z: -42 }, cor: 0x445162, humor: 'mau', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Minha FORJA fica na praça — entre e veja o forno aceso. A melhor têmpera do reino.', dica: 'Couro e osso da caça viram cabo e empunhadura. Traga que eu pago.' },
    loja: [
      { nome: 'Adaga', icone: '🗡️', preco: 25, slot: 'maoDir', dano: 8, arma: true },
      { nome: 'Espada', icone: '⚔️', preco: 60, slot: 'maoDir', dano: 12, arma: true },
      { nome: 'Machado', icone: '🪓', preco: 100, slot: 'maoDir', dano: 16, arma: true },
    ],
    compra: ['Couro', 'Osso', 'Presa do Boss', 'Escama de Dragão'],
    ofertas: [{ precisa: 15, item: { nome: 'Martelo de Guerra', icone: '🔨', preco: 420, slot: 'maoDir', dano: 24, arma: true } }] },
  { nome: 'Ilda', prof: 'Arcanista', post: { x: -343.4, z: -12 }, home: { x: -376, z: -20 }, cor: 0x5a2a8a, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Minha loja arcana fica na beira do canal — entre. Grafo runas com tinta de lodo do pântano.', dica: 'Dizem que o Dragão Ancião perto de Thais guarda uma runa que ninguém leu.' },
    loja: [
      { nome: 'Runa de Cura', icone: '✨', preco: 15, slot: 'runa', usavel: 'runaCura' },
      { nome: 'Runa de Fogo', icone: '🔥', preco: 20, slot: 'runa', usavel: 'runaFogo' },
    ],
    compra: ['Erva', 'Frasco', 'Olho do Beholder', 'Seda de Aranha'],
    ofertas: [{ precisa: 10, item: { nome: 'Runa Explosiva', icone: '💣', preco: 60, slot: 'runa', usavel: 'runaExplosiva' } }] },
  { nome: 'Tonho', prof: 'Pescador', post: { x: -322, z: -81 }, home: { x: -272, z: -20 }, cor: 0x2a6a5a, humor: 'bom', sexo: 'homem', tipo: 'cacador',
    falas: { trabalho: 'Pesco no porto desde menino. A lagoa devolve o que o canal traz.', dica: 'Peixe raro eu pago em ouro vivo. Dourado e pintado, principalmente.' },
    loja: [
      { nome: 'Flechas (12)', icone: '➹', preco: 10, pacote: { nome: 'Flecha', icone: '➹', qtd: 12 } },
      { nome: 'Virotes (12)', icone: '🏹', preco: 18, pacote: { nome: 'Virote', icone: '🏹', qtd: 12 } },
    ],
    compra: ['Lambari', 'Tilápia', 'Traíra', 'Carpa', 'Bagre', 'Tucunaré', 'Dourado', 'Pintado', 'Concha'] },
  { nome: 'Dona Ema', prof: 'Padeira', post: { x: -326, z: -10 }, home: { x: -392, z: -20 }, cor: 0xd8c4a0, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Pão de fubá do brejo, quentinho do Grande Mercado. Prove e me diga.', dica: 'O relógio do Depósito atrasa cinco minutos há vinte anos. Ninguém conserta por carinho.' } },
  { nome: 'Capitã Mara', prof: 'Guarda do Canal', post: { x: -256, z: -34 }, home: { x: -296, z: -46 }, cor: 0x2a3a6a, humor: 'mau', sexo: 'mulher', tipo: 'cavaleiro',
    falas: { trabalho: 'Patrulho a entrada e o canal. Em Venore o ouro corre — e ladrão corre atrás.', dica: 'O Brejo Profundo ao sul anda infestado de cobras. Se tiver coragem, me procure.' } },
  // RV4.1 — distrito norte + armazéns (a capital cresceu)
  { nome: 'Tessa', prof: 'Armadureira', post: { x: -286.8, z: 22 }, home: { x: -340, z: 28 }, cor: 0x6a5a4a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Minha loja fica no Largo das Guildas — entre e se vista: elmo, peitoral e bota que aguentam dente de dragão.', dica: 'Couro curtido no lodo do brejo fica duas vezes mais rijo. Segredo da casa.' },
    loja: [
      { nome: 'Elmo de Ferro', icone: '🪖', preco: 70, slot: 'cabeca', defesa: 3 },
      { nome: 'Peitoral de Ferro', icone: '🛡️', preco: 120, slot: 'tronco', defesa: 5 },
      { nome: 'Calças de Couro', icone: '👖', preco: 50, slot: 'pernas', defesa: 2 },
      { nome: 'Botas de Couro', icone: '🥾', preco: 40, slot: 'pes', defesa: 2 },
    ],
    compra: ['Couro', 'Escama de Dragão', 'Seda de Aranha'],
    ofertas: [{ precisa: 18, item: { nome: 'Peitoral de Escamas', icone: '🐲', preco: 380, slot: 'tronco', defesa: 8 } }] },
  { nome: 'Ulric', prof: 'Mestre da Guilda', post: { x: -320, z: 27 }, home: { x: -320, z: 30 }, cor: 0x7a1f2a, humor: 'mau', sexo: 'homem', tipo: 'cavaleiro',
    falas: { trabalho: 'O Salão das Guildas reúne os aventureiros de Venore. Prove seu valor e terá um lugar.', dica: 'Quem derrota um dragão entra pra história. Quem derrota DOIS entra pra guilda.' } },
  { nome: 'Hela', prof: 'Sacerdotisa', post: { x: -386, z: 16 }, home: { x: -390, z: 12 }, cor: 0x4a3a7a, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Cuido da Catedral de Venore. O sino dela se ouve do outro lado do canal.', dica: 'Os deuses do pântano são antigos. O templo do vilarejo ainda guarda o renascimento.' } },
  { nome: 'Beto', prof: 'Estivador', post: { x: -292, z: -82 }, home: { x: -300, z: -78 }, cor: 0x5a4a3a, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Carrego caixa e barril o dia inteiro entre o cais e os armazéns. Braço não falta.', dica: 'A barca cobra 5 moedas, mas nadar no canal sai bem mais caro.' } },
  // RV4.5 — moradores que dão VIDA às ruas da capital (recolhem à noite)
  { nome: 'Rosa', prof: 'Florista', post: { x: -316, z: 14 }, home: { x: -376, z: 44 }, cor: 0xc05a7a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Vendo flores do brejo no Largo das Guildas. Até no pântano nasce beleza.', dica: 'A Travessa das Guildas é o caminho mais bonito da cidade ao entardecer.' } },
  { nome: 'Nilo', prof: 'Cronista', post: { x: -326, z: -36 }, home: { x: -272, z: 30 }, cor: 0x3a5a8a, humor: 'bom', sexo: 'homem', tipo: 'mago',
    falas: { trabalho: 'Anoto tudo que acontece em Venore: chegadas, partidas e os boatos do mercado.', dica: 'Dizem que o Rei Esqueleto das catacumbas usava uma coroa que vale uma fortuna.' } },
  { nome: 'Iva', prof: 'Lavadeira', post: { x: -346, z: -2 }, home: { x: -396, z: 44 }, cor: 0x6a8a5a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Lavo roupa na beira do canal desde menina. A água conta segredos.', dica: 'As barcaças trazem especiarias de manhã cedinho. O cheiro toma o calçadão.' } },
  // RV5.7: o MASCATE VIAJANTE — cada sessão ele acampa num ponto diferente
  // da estrada de Thais (procure as fogueiras!) com mercadoria que só ele tem
  { nome: 'Zé das Rotas', prof: 'Mascate', post: { x: POSTO_MASCATE[0], z: POSTO_MASCATE[1] }, home: { x: POSTO_MASCATE[0], z: POSTO_MASCATE[1] }, cor: 0x9c6a2a, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Compro ali, vendo aqui, durmo onde a fogueira deixa. A estrada é minha loja.', dica: 'Amanhã? Amanhã eu já tô noutro acampamento. Mascate parado é mascate pobre.' },
    loja: [
      { nome: 'Poção Grande', icone: '🧉', preco: 18, slot: 'pocao', usavel: 'pocaoGrande' },
      { nome: 'Virotes (12)', icone: '🏹', preco: 15, pacote: { nome: 'Virote', icone: '🏹', qtd: 12 } },
      { nome: 'Capa do Viajante', icone: '🧥', preco: 120, slot: 'tronco', defesa: 4 },
    ] },
];

// casas (residências) — pontos LIVRES na rua em frente às casas (os antigos
// caíam DENTRO dos prédios e o NPC andava contra a parede a noite inteira!)
const HOMES = [[24, 24], [-24, 24], [24, -24], [-24, -24], [56, 8], [-56, 8], [8, 56], [8, -56], [24, 40], [-24, 40], [40, -24]];
const NOTURNOS = new Set(['Otto', 'Greta', 'Bram', 'Vasco', 'Dorian', 'Yara', 'Bruno', 'Tobias', 'Eldra', 'Falk',
  'Anselmo', 'Berta', 'Grom', 'Ilda', 'Capitã Mara', 'Tessa', 'Ulric', 'Hela']); // lojistas/templo/guarda viram a noite no posto

function nomeSprite(texto) {
  const cnv = document.createElement('canvas');
  cnv.width = 256; cnv.height = 64;
  const ctx = cnv.getContext('2d');
  ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = Math.min(248, ctx.measureText(texto).width + 24);
  ctx.fillStyle = 'rgba(20,28,16,.55)'; ctx.fillRect((256 - w) / 2, 16, w, 32);
  ctx.fillStyle = '#dfe7cf'; ctx.fillText(texto, 128, 33);
  const tex = new THREE.CanvasTexture(cnv); tex.minFilter = THREE.LinearFilter;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(2.4, 0.6, 1); sp.position.y = 3.6; sp.renderOrder = 998;
  return sp;
}

function alvoPertoDoPosto(post, colide) {
  for (let t = 0; t < 12; t++) {
    const a = Math.random() * TAU, r = Math.random() * 4;
    const x = post.x + Math.cos(a) * r, z = post.z + Math.sin(a) * r;
    if (!colide(x, z)) return { x, z };
  }
  return { x: post.x, z: post.z };
}

export function criaNPCs(scene, colide) {
  const npcs = [];
  ROSTER.forEach((d, i) => {
    const g = criaAvatar({ casaco: d.cor, pele: pick(PELE), cabelo: pick(CABELO), sexo: d.sexo, tipo: d.tipo });
    let sx = d.post.x, sz = d.post.z;
    for (let t = 0; t < 16; t++) {
      const a = Math.random() * TAU, r = Math.random() * 3;
      const x = d.post.x + Math.cos(a) * r, z = d.post.z + Math.sin(a) * r;
      if (!colide(x, z)) { sx = x; sz = z; break; }
    }
    g.position.set(sx, 0, sz);
    g.add(nomeSprite(d.nome));
    scene.add(g);
    const h = d.home || { x: HOMES[i % HOMES.length][0], z: HOMES[i % HOMES.length][1] };
    const npc = {
      g, post: d.post, home: h, noturno: NOTURNOS.has(d.nome),
      nome: d.nome, prof: d.prof, humor: d.humor, falas: d.falas,
      alvo: alvoPertoDoPosto(d.post, colide), pausa: Math.random() * 3, tempo: Math.random() * 10,
    };
    g.userData.tipo = 'npc'; g.userData.ref = npc;
    npcs.push(npc);
  });
  return npcs;
}

const DESVIOS = [0, 0.6, -0.6, 1.2, -1.2, 2.0, -2.0];

export function atualizaNPCs(npcs, dt, colide, noite = false) {
  for (const n of npcs) {
    const g = n.g;
    n.tempo += dt;
    n.vy = (n.vy || 0) - 20 * dt;
    g.position.y += n.vy * dt;
    if (g.position.y <= 0) { g.position.y = 0; n.vy = 0; n.noChao = true; }

    const base = (noite && !n.noturno) ? n.home : n.post; // à noite vai pra casa (exceto lojistas/guarda)
    if (n.pausa > 0) { n.pausa -= dt; animaAvatar(g, false, n.tempo); continue; }
    if (Math.hypot(g.position.x - base.x, g.position.z - base.z) > 7) n.alvo = { x: base.x, z: base.z };
    const dx = n.alvo.x - g.position.x, dz = n.alvo.z - g.position.z, dist = Math.hypot(dx, dz);
    if (dist < 0.5) { n.pausa = (noite ? 3 : 1.5) + Math.random() * 3; n.alvo = alvoPertoDoPosto(base, colide); animaAvatar(g, false, n.tempo); continue; }
    // ANTI-PRESO: se em ~2.5s ele não se aproximou do alvo, desiste e re-mira
    // (acaba com o "andando infinitamente contra a parede")
    if (n.distAnt !== undefined && dist > n.distAnt - 0.012) n.preso = (n.preso || 0) + dt; else n.preso = 0;
    n.distAnt = dist;
    if (n.preso > 2.5) {
      n.preso = 0; n.distAnt = undefined;
      n.alvo = alvoPertoDoPosto(base, colide); n.pausa = 0.6 + Math.random();
      animaAvatar(g, false, n.tempo); continue;
    }

    const vel = 2.4, ang = Math.atan2(dx, dz);
    let andou = false;
    for (const off of DESVIOS) {
      const a = ang + off, mx = Math.sin(a), mz = Math.cos(a);
      const nx = g.position.x + mx * vel * dt, nz = g.position.z + mz * vel * dt;
      const livreX = !colide(nx, g.position.z), livreZ = !colide(g.position.x, nz);
      if (livreX || livreZ) {
        if (livreX) g.position.x = nx;
        if (livreZ) g.position.z = nz;
        giraSuave(g, Math.atan2(mx, mz), dt * 9); // vira macio
        andou = true; break;
      }
    }
    if (!andou) {
      if (n.noChao) { n.vy = 6; n.noChao = false; }
      n.alvo = alvoPertoDoPosto(base, colide); n.pausa = 0.3; // re-mira perto de onde DEVE estar (posto de dia, casa à noite)
    }
    animaAvatar(g, andou && n.noChao, n.tempo);
  }
}

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
  { nome: 'Yara', prof: 'Mercadora', post: { x: 552, z: 10 }, home: { x: 572, z: -12 }, cor: 0xb8902a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Trago especiarias de terras distantes. Thais vive do comércio.', dica: 'Em Venore o pão é melhor, mas aqui o ouro corre solto.' },
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
];

// casas (residências) — pontos LIVRES na rua em frente às casas (os antigos
// caíam DENTRO dos prédios e o NPC andava contra a parede a noite inteira!)
const HOMES = [[24, 24], [-24, 24], [24, -24], [-24, -24], [56, 8], [-56, 8], [8, 56], [8, -56], [24, 40], [-24, 40], [40, -24]];
const NOTURNOS = new Set(['Otto', 'Greta', 'Bram', 'Vasco', 'Dorian', 'Yara', 'Bruno', 'Tobias', 'Eldra', 'Falk']); // lojistas/templo viram a noite no posto

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

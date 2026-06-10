// =============================================================
//  NPCs de VENORE  ·  elenco no padrão Tibia: cada morador tem
//  OFÍCIO, POSTO fixo (perto do que faz) e DIÁLOGO de papel.
//  Perambulam de leve em volta do posto (sem travar), com humor.
//  Clicáveis: userData.tipo='npc', .ref = dados (nome/prof/falas...).
// =============================================================
import * as THREE from 'three';
import { criaAvatar, animaAvatar } from './avatar.js';

const TAU = Math.PI * 2;
const PELE = [0xf2d6b8, 0xe0b088, 0xc89060, 0x9c6a42, 0x6e4628];
const CABELO = [0x241c14, 0x5a3a1c, 0xc8a24e, 0xa33a22, 0xb8b8b8];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Elenco distribuído pela cidade (cada ofício no seu lugar)
// Cada NPC fica NO SEU comércio/posto (espalhados pela cidade, não no meio da praça)
const ROSTER = [
  { nome: 'Otto', prof: 'Mercador', post: { x: 17, z: 11 }, cor: 0x7a4632, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Minha banca fica aqui na Rua do Mercado. Compro seu loot!', dica: 'Há quem pague por caudas de rato do esgoto.' } },
  { nome: 'Greta', prof: 'Padeira', post: { x: 4, z: -104 }, cor: 0xd8c4a0, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Assando pão no mercado coberto do Bairro do Comércio. Sinta o cheiro!', dica: 'Queijo fresco atrai ratos... e aventureiros famintos.' } },
  { nome: 'Bram', prof: 'Ferreiro', post: { x: -17, z: 11 }, cor: 0x445162, humor: 'mau', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Minha forja fica na Rua do Ferreiro. Martelo ferro o dia todo.', dica: 'Esse graveto não vai longe. Volte quando eu tiver aço.' } },
  { nome: 'Sira', prof: 'Curandeira', post: { x: 27, z: 10 }, cor: 0xeef0f2, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Atendo na porta do hospital. Pague quando puder.', dica: 'Se descer no esgoto, leve uma TOCHA. E cuidado com algo grande lá embaixo.' } },
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
    falas: { trabalho: 'Trago especiarias de terras distantes. Thais vive do comércio.', dica: 'Em Venore o pão é melhor, mas aqui o ouro corre solto.' } },
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

// casas (residências) e quem trabalha à noite (lojistas/guarda continuam no posto)
const HOMES = [[28, 28], [-28, 28], [28, -28], [-28, -28], [60, 6], [-60, 6], [6, 60], [6, -60], [34, 34], [-34, 34], [34, -34]];
const NOTURNOS = new Set(['Otto', 'Greta', 'Bram', 'Vasco', 'Dorian', 'Yara', 'Bruno', 'Tobias']); // Tobias guarda o templo a noite toda

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

    const vel = 2.4, ang = Math.atan2(dx, dz);
    let andou = false;
    for (const off of DESVIOS) {
      const a = ang + off, mx = Math.sin(a), mz = Math.cos(a);
      const nx = g.position.x + mx * vel * dt, nz = g.position.z + mz * vel * dt;
      const livreX = !colide(nx, g.position.z), livreZ = !colide(g.position.x, nz);
      if (livreX || livreZ) {
        if (livreX) g.position.x = nx;
        if (livreZ) g.position.z = nz;
        g.rotation.y = Math.atan2(mx, mz);
        andou = true; break;
      }
    }
    if (!andou) {
      if (n.noChao) { n.vy = 6; n.noChao = false; }
      n.alvo = alvoPertoDoPosto(n.post, colide); n.pausa = 0.3;
    }
    animaAvatar(g, andou && n.noChao, n.tempo);
  }
}

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
const ROSTER = [
  { nome: 'Otto', prof: 'Mercador', post: { x: 12, z: 9 }, cor: 0x7a4632, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Compro e vendo de tudo um pouco. Em breve abro comércio de verdade!', dica: 'Há quem pague por caudas de rato do esgoto.' } },
  { nome: 'Greta', prof: 'Padeira', post: { x: 12, z: -9 }, cor: 0xd8c4a0, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Faço o pão de Venore desde menina. Sinta o cheiro!', dica: 'Queijo fresco atrai ratos... e aventureiros famintos.' } },
  { nome: 'Bram', prof: 'Ferreiro', post: { x: -12, z: 9 }, cor: 0x445162, humor: 'mau', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Martelo ferro o dia todo. Um dia forjo uma espada digna.', dica: 'Esse graveto não vai longe. Volte quando eu tiver aço.' } },
  { nome: 'Sira', prof: 'Curandeira', post: { x: 22, z: 2 }, cor: 0xeef0f2, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Cuido dos feridos no hospital. Pague quando puder.', dica: 'Se descer no esgoto, leve uma TOCHA. E cuidado com algo grande lá embaixo.' } },
  { nome: 'Tobias', prof: 'Sacerdote', post: { x: 4, z: -19 }, cor: 0x6a4a8a, humor: 'bom', sexo: 'homem', tipo: 'mago',
    falas: { trabalho: 'Toco o sino e guardo a fé de Venore.', dica: 'Aquele baú perto da igreja só abre com a chave certa.' } },
  { nome: 'Lia', prof: 'Escriba', post: { x: 4, z: 22 }, cor: 0x3a5a8a, humor: 'bom', sexo: 'mulher', tipo: 'mago',
    falas: { trabalho: 'Ensino as crianças e copio os velhos livros.', dica: 'O cristal arcano reage a quem tem dom. Já tentou examiná-lo?' } },
  { nome: 'Marta', prof: 'Fazendeira', post: { x: 13, z: -17 }, cor: 0x556b2f, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Cuido das hortas e do poço. Água limpa é vida.', dica: 'As flores azuis só nascem à beira d’água.' } },
  { nome: 'Vasco', prof: 'Guarda', post: { x: 20, z: -30 }, cor: 0x2a3a6a, humor: 'mau', sexo: 'homem', tipo: 'cavaleiro',
    falas: { trabalho: 'Vigio os bueiros. Coisas sobem de lá à noite.', dica: 'A estrada a leste leva a Thais. Longa e perigosa.' } },
  { nome: 'Nuno', prof: 'Aldeão', post: { x: 7, z: 7 }, cor: 0x6a2a3a, humor: 'bom', sexo: 'homem', tipo: 'aldeao',
    falas: { trabalho: 'Eu? Só vivo por aqui, vendo a vida passar.', dica: 'Venore já foi maior. As montanhas guardam segredos.' } },
  { nome: 'Inês', prof: 'Aldeã', post: { x: -7, z: 7 }, cor: 0x8a6a2a, humor: 'bom', sexo: 'mulher', tipo: 'aldeao',
    falas: { trabalho: 'Costuro e cuido da praça. Gosto da fonte.', dica: 'Dizem que há cidades além das montanhas.' } },
  { nome: 'Caio', prof: 'Pescador', post: { x: 38, z: 70 }, cor: 0x2a6a5a, humor: 'bom', sexo: 'homem', tipo: 'cacador',
    falas: { trabalho: 'Passo o dia pescando no lago. Paciência é tudo.', dica: 'Logo dá pra pescar de verdade. Cada lago tem seus peixes.' } },
];

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
  for (const d of ROSTER) {
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
    const npc = {
      g, post: d.post, nome: d.nome, prof: d.prof, humor: d.humor, falas: d.falas,
      alvo: alvoPertoDoPosto(d.post, colide), pausa: Math.random() * 3, tempo: Math.random() * 10,
    };
    g.userData.tipo = 'npc'; g.userData.ref = npc;
    npcs.push(npc);
  }
  return npcs;
}

const DESVIOS = [0, 0.6, -0.6, 1.2, -1.2, 2.0, -2.0];

export function atualizaNPCs(npcs, dt, colide) {
  for (const n of npcs) {
    const g = n.g;
    n.tempo += dt;
    n.vy = (n.vy || 0) - 20 * dt;
    g.position.y += n.vy * dt;
    if (g.position.y <= 0) { g.position.y = 0; n.vy = 0; n.noChao = true; }

    if (n.pausa > 0) { n.pausa -= dt; animaAvatar(g, false, n.tempo); continue; }
    if (Math.hypot(g.position.x - n.post.x, g.position.z - n.post.z) > 7) n.alvo = { x: n.post.x, z: n.post.z };
    const dx = n.alvo.x - g.position.x, dz = n.alvo.z - g.position.z, dist = Math.hypot(dx, dz);
    if (dist < 0.5) { n.pausa = 1.5 + Math.random() * 3; n.alvo = alvoPertoDoPosto(n.post, colide); animaAvatar(g, false, n.tempo); continue; }

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

// =============================================================
//  NPCs  ·  moradores de Venore com POSTO fixo (ficam por perto),
//  perambulam de leve em volta do posto (sem marchar contra paredes),
//  têm NOME, HUMOR (bom/mau) e talvez uma HISTÓRIA pra contar.
//  Clicáveis: cada grupo carrega userData.tipo='npc' e .ref = dados.
// =============================================================
import * as THREE from 'three';
import { criaAvatar, animaAvatar } from './avatar.js';

const TAU = Math.PI * 2;
const PALETA = {
  casaco: [0x556b2f, 0x3a5a8a, 0x7a4632, 0x6a2a3a, 0x445162, 0x8a6a2a, 0x4a6a5a],
  pele: [0xf2d6b8, 0xe0b088, 0xc89060, 0x9c6a42, 0x6e4628],
  cabelo: [0x241c14, 0x5a3a1c, 0xc8a24e, 0xa33a22, 0xb8b8b8],
};
const NOMES = ['Bartolo', 'Inês', 'Vasco', 'Marta', 'Tomé', 'Linda', 'Gil', 'Branca', 'Olívia', 'Nuno'];
const HISTORIAS = [
  'Dizem que há algo trancado naquele baú perto da igreja...',
  'Meu avô ajudou a erguer a estátua da praça. Tenho orgulho disso.',
  'Cuidado com o bueiro velho — ouvem-se barulhos lá embaixo à noite.',
  'O cristal perto da escola brilha mais quando vai chover. Estranho, não?',
  'Já fui pescador no lago. Hoje só cuido das minhas flores.',
  'Venore já foi maior. As ruas guardam muitas histórias.',
];
// POSTOS: pontos de trabalho/convívio (perto de mercado, praça, poço, marcos, lago)
const POSTOS = [
  { x: 13, z: 11 }, { x: 13, z: -11 }, { x: -13, z: 11 },   // mercado (barracas)
  { x: 6, z: 6 }, { x: -6, z: -6 },                          // praça
  { x: 13, z: -16 }, { x: -13, z: -16 },                     // poço / estátua
  { x: 6, z: -27 }, { x: -6, z: 27 },                        // igreja / escola
  { x: 16, z: 73 },                                          // junto da ponte/lago
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

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
    const a = Math.random() * TAU, r = Math.random() * 5;
    const x = post.x + Math.cos(a) * r, z = post.z + Math.sin(a) * r;
    if (!colide(x, z)) return { x, z };
  }
  return { x: post.x, z: post.z };
}

export function criaNPCs(scene, colide, n = 6) {
  const npcs = [];
  for (let i = 0; i < n; i++) {
    const g = criaAvatar({ casaco: pick(PALETA.casaco), pele: pick(PALETA.pele), cabelo: pick(PALETA.cabelo) });
    const post = POSTOS[i % POSTOS.length];
    // nasce perto do posto, em ponto livre
    let sx = post.x, sz = post.z;
    for (let t = 0; t < 16; t++) {
      const a = Math.random() * TAU, r = Math.random() * 4;
      const x = post.x + Math.cos(a) * r, z = post.z + Math.sin(a) * r;
      if (!colide(x, z)) { sx = x; sz = z; break; }
    }
    g.position.set(sx, 0, sz);
    g.add(nomeSprite(NOMES[i % NOMES.length]));
    scene.add(g);
    const npc = {
      g, post,
      alvo: alvoPertoDoPosto(post, colide),
      pausa: Math.random() * 3,
      tempo: Math.random() * 10,
      nome: NOMES[i % NOMES.length],
      humor: Math.random() < 0.6 ? 'bom' : 'mau',
      historia: pick(HISTORIAS),
      contaHistoria: Math.random() < 0.45,
    };
    g.userData.tipo = 'npc';
    g.userData.ref = npc;
    npcs.push(npc);
  }
  return npcs;
}

export function atualizaNPCs(npcs, dt, colide) {
  for (const n of npcs) {
    const g = n.g;
    n.tempo += dt;
    if (n.pausa > 0) { n.pausa -= dt; animaAvatar(g, false, n.tempo); continue; }
    let dx = n.alvo.x - g.position.x, dz = n.alvo.z - g.position.z;
    let dist = Math.hypot(dx, dz);
    // se vagou longe do posto, volta pra perto dele
    if (Math.hypot(g.position.x - n.post.x, g.position.z - n.post.z) > 7) {
      n.alvo = { x: n.post.x, z: n.post.z };
      dx = n.alvo.x - g.position.x; dz = n.alvo.z - g.position.z; dist = Math.hypot(dx, dz);
    }
    if (dist < 0.5) { n.pausa = 1.5 + Math.random() * 3; n.alvo = alvoPertoDoPosto(n.post, colide); animaAvatar(g, false, n.tempo); continue; }
    const vel = 2.4, mx = dx / dist, mz = dz / dist;
    const nx = g.position.x + mx * vel * dt, nz = g.position.z + mz * vel * dt;
    let mexeu = false;
    if (!colide(nx, g.position.z)) { g.position.x = nx; mexeu = true; }
    if (!colide(g.position.x, nz)) { g.position.z = nz; mexeu = true; }
    if (!mexeu) { n.alvo = alvoPertoDoPosto(n.post, colide); n.pausa = 0.4; } // travou -> novo alvo
    g.rotation.y = Math.atan2(mx, mz);
    animaAvatar(g, true, n.tempo);
  }
}

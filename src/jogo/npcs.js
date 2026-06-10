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
// POSTOS: pontos abertos de trabalho/convívio (validados fora de colisores)
const POSTOS = [
  { x: 12, z: 9 }, { x: 12, z: -9 }, { x: -12, z: 9 },   // frente das barracas (mercado)
  { x: 7, z: 7 }, { x: -7, z: 7 },                        // praça
  { x: 13, z: -17 }, { x: -13, z: -17 },                  // perto do poço / estátua
  { x: 4, z: -19 }, { x: 4, z: 22 },                      // frente da igreja / escola (fora do colisor)
  { x: 20, z: -30 },                                      // vigia perto do bueiro
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

// desvios de heading testados quando o caminho direto está bloqueado
const DESVIOS = [0, 0.6, -0.6, 1.2, -1.2, 2.0, -2.0];

export function atualizaNPCs(npcs, dt, colide) {
  for (const n of npcs) {
    const g = n.g;
    n.tempo += dt;
    // gravidade + pulo (quando encurralado, dá um salto)
    n.vy = (n.vy || 0) - 20 * dt;
    g.position.y += n.vy * dt;
    if (g.position.y <= 0) { g.position.y = 0; n.vy = 0; n.noChao = true; }

    if (n.pausa > 0) { n.pausa -= dt; animaAvatar(g, false, n.tempo); continue; }
    // se vagou longe do posto, mira de volta
    if (Math.hypot(g.position.x - n.post.x, g.position.z - n.post.z) > 7) n.alvo = { x: n.post.x, z: n.post.z };
    const dx = n.alvo.x - g.position.x, dz = n.alvo.z - g.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.5) { n.pausa = 1.5 + Math.random() * 3; n.alvo = alvoPertoDoPosto(n.post, colide); animaAvatar(g, false, n.tempo); continue; }

    const vel = 2.4, ang = Math.atan2(dx, dz); // direção desejada
    let andou = false;
    for (const off of DESVIOS) { // tenta direto; se travar, contorna pelos lados
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
    if (!andou) { // totalmente preso: PULA o obstáculo e escolhe novo caminho
      if (n.noChao) { n.vy = 6; n.noChao = false; }
      n.alvo = alvoPertoDoPosto(n.post, colide);
      n.pausa = 0.3;
    }
    animaAvatar(g, andou && n.noChao, n.tempo);
  }
}

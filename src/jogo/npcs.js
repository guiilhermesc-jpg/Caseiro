// =============================================================
//  NPCs  ·  moradores de Venor que perambulam pela cidade.
//  Reaproveitam criaAvatar/animaAvatar (mesmo boneco dos jogadores),
//  com cores variadas e um "passeio" simples: escolhem um alvo,
//  caminham até lá (respeitando colisão), pausam e escolhem outro.
//  Cada NPC tem um NOME flutuante — vira gancho de diálogo/quest depois.
// =============================================================
import * as THREE from 'three';
import { criaAvatar, animaAvatar } from './avatar.js';

const PALETA = {
  casaco: [0x556b2f, 0x3a5a8a, 0x7a4632, 0x6a2a3a, 0x445162, 0x8a6a2a, 0x4a6a5a],
  pele: [0xf2d6b8, 0xe0b088, 0xc89060, 0x9c6a42, 0x6e4628],
  cabelo: [0x241c14, 0x5a3a1c, 0xc8a24e, 0xa33a22, 0xb8b8b8],
};
const NOMES = ['Bartolo', 'Inês', 'Vasco', 'Marta', 'Tomé', 'Linda', 'Gil', 'Branca', 'Olívia', 'Nuno'];
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

function novoAlvo() {
  const a = Math.random() * Math.PI * 2, r = 6 + Math.random() * 52;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r };
}

export function criaNPCs(scene, colide, n = 6) {
  const npcs = [];
  for (let i = 0; i < n; i++) {
    const g = criaAvatar({ casaco: pick(PALETA.casaco), pele: pick(PALETA.pele), cabelo: pick(PALETA.cabelo) });
    let x = 0, z = 0;
    for (let t = 0; t < 20; t++) {
      const a = Math.random() * Math.PI * 2, r = 10 + Math.random() * 45;
      x = Math.cos(a) * r; z = Math.sin(a) * r;
      if (!colide(x, z)) break;
    }
    g.position.set(x, 0, z);
    g.add(nomeSprite(NOMES[i % NOMES.length]));
    scene.add(g);
    npcs.push({ g, alvo: novoAlvo(), pausa: Math.random() * 3, tempo: Math.random() * 10 });
  }
  return npcs;
}

export function atualizaNPCs(npcs, dt, tempo, colide) {
  for (const n of npcs) {
    const g = n.g;
    if (n.pausa > 0) { n.pausa -= dt; animaAvatar(g, false, n.tempo); continue; }
    const dx = n.alvo.x - g.position.x, dz = n.alvo.z - g.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.6) { n.pausa = 1 + Math.random() * 3; n.alvo = novoAlvo(); animaAvatar(g, false, n.tempo); continue; }
    const vel = 2.6, mx = dx / dist, mz = dz / dist;
    n.tempo += dt;
    const nx = g.position.x + mx * vel * dt, nz = g.position.z + mz * vel * dt;
    let mexeu = false;
    if (!colide(nx, g.position.z)) { g.position.x = nx; mexeu = true; }
    if (!colide(g.position.x, nz)) { g.position.z = nz; mexeu = true; }
    if (!mexeu) { n.alvo = novoAlvo(); n.pausa = 0.5; } // preso -> novo alvo
    g.rotation.y = Math.atan2(mx, mz);
    animaAvatar(g, true, n.tempo);
  }
}

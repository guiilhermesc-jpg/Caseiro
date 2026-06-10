// =============================================================
//  RATOS  ·  primeiro bicho (esgoto). Vida 20, fáceis de matar.
//  Perambulam dentro dos limites do esgoto; animam as patas.
//  Cada um tem material próprio (corpoMat) para PISCAR ao levar dano.
//  Vivem em y = -40 (subsolo do esgoto).
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

const Y = -40;

export function criaRato(x, z) {
  const g = new THREE.Group(); g.position.set(x, Y, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x6b6258, roughness: 0.85 });
  const escuro = mat(0x44403a);

  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.85), corpoMat);
  corpo.position.y = 0.3; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.38, 0.4), corpoMat);
  cabeca.position.set(0, 0.34, 0.55); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), mat(0xc89a9a));
  focinho.position.set(0, 0.28, 0.78); g.add(focinho);
  [-0.14, 0.14].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), escuro);
    or.position.set(ox, 0.56, 0.5); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), mat(0x100808));
    olho.position.set(ox * 0.6, 0.36, 0.74); g.add(olho);
  });
  const patas = [];
  [[-0.16, 0.28], [0.16, 0.28], [-0.16, -0.28], [0.16, -0.28]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.12, 0.28, 0.12); geo.translate(0, -0.14, 0);
    const pa = new THREE.Mesh(geo, escuro); pa.position.set(px, 0.28, pz); g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.7, 5), mat(0xb88a8a));
  rabo.position.set(0, 0.3, -0.72); rabo.rotation.x = Math.PI / 2.3; g.add(rabo);

  g.userData = { patas, rabo, corpoMat, tipo: 'rato' };
  return g;
}

function novoAlvoRato(b) {
  return { x: b.minX + 1 + Math.random() * (b.maxX - b.minX - 2), z: b.minZ + 1 + Math.random() * (b.maxZ - b.minZ - 2) };
}

export function criaRatos(n, bounds) {
  const ratos = [];
  for (let i = 0; i < n; i++) {
    const a = novoAlvoRato(bounds);
    ratos.push({ g: criaRato(a.x, a.z), hp: 20, hpMax: 20, xp: 5, vel: 1.9, bounds, y0: Y, alvo: novoAlvoRato(bounds), pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0 });
  }
  return ratos;
}

// usa o bounds PRÓPRIO de cada criatura (esgoto OU região na superfície)
export function atualizaRatos(ratos, dt) {
  for (const r of ratos) {
    if (!r.vivo) continue;
    const g = r.g, b = r.bounds; r.tempo += dt;
    if (r.piscar > 0) { r.piscar -= dt; if (r.piscar <= 0) g.userData.corpoMat.emissive.setHex(0x000000); }
    if (r.pausa > 0) { r.pausa -= dt; continue; }
    const dx = r.alvo.x - g.position.x, dz = r.alvo.z - g.position.z, dist = Math.hypot(dx, dz);
    if (dist < 0.4) { r.pausa = 0.5 + Math.random() * 1.6; r.alvo = novoAlvoRato(b); continue; }
    const vel = r.vel || 1.9, mx = dx / dist, mz = dz / dist;
    g.position.x = Math.max(b.minX + 0.7, Math.min(b.maxX - 0.7, g.position.x + mx * vel * dt));
    g.position.z = Math.max(b.minZ + 0.7, Math.min(b.maxZ - 0.7, g.position.z + mz * vel * dt));
    g.rotation.y = Math.atan2(mx, mz);
    const p = g.userData.patas;
    if (p) { const s = Math.sin(r.tempo * 16) * 0.6; for (let i = 0; i < p.length; i++) p[i].rotation.x = (i % 2 ? -s : s); }
    if (g.userData.segs) g.userData.segs.forEach((sg, i) => { sg.position.x = Math.sin(r.tempo * 6 + i * 0.7) * 0.25; });
  }
}

// ===== CRIATURAS DA SUPERFÍCIE (região selvagem) — vivem em y = 0 =====
function olhos(g, ox, oy, oz, raio, cor) {
  [-ox, ox].forEach((x) => { const o = new THREE.Mesh(new THREE.SphereGeometry(raio, 8, 8), mat(cor)); o.position.set(x, oy, oz); g.add(o); });
}

export function criaTroll(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x5a7a3a, roughness: 0.9 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.6), corpoMat); torso.position.y = 1.0; torso.castShadow = true; g.add(torso);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.6), corpoMat); cabeca.position.y = 1.7; cabeca.castShadow = true; g.add(cabeca);
  olhos(g, 0.16, 1.75, 0.32, 0.08, 0xe0d040);
  const presa = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), mat(0xeee0c0)); presa.position.set(0.12, 1.5, 0.32); presa.rotation.x = Math.PI; g.add(presa);
  [-0.62, 0.62].forEach((ox) => { const geo = new THREE.BoxGeometry(0.26, 0.9, 0.26); geo.translate(0, -0.45, 0); const b = new THREE.Mesh(geo, corpoMat); b.position.set(ox, 1.5, 0); b.castShadow = true; g.add(b); });
  const patas = [];
  [-0.24, 0.24].forEach((ox) => { const geo = new THREE.BoxGeometry(0.3, 0.7, 0.3); geo.translate(0, -0.35, 0); const p = new THREE.Mesh(geo, corpoMat); p.position.set(ox, 0.7, 0); p.castShadow = true; g.add(p); patas.push(p); });
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

export function criaCyclops(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 1.2), corpoMat); torso.position.y = 2.6; torso.castShadow = true; g.add(torso);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.1), corpoMat); cabeca.position.y = 4.2; cabeca.castShadow = true; g.add(cabeca);
  const olho = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), mat(0xe0d040)); olho.position.set(0, 4.3, 0.58); g.add(olho);
  const pup = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat(0x101010)); pup.position.set(0, 4.3, 0.78); g.add(pup);
  [-1.2, 1.2].forEach((ox) => { const geo = new THREE.BoxGeometry(0.5, 2.0, 0.5); geo.translate(0, -1.0, 0); const b = new THREE.Mesh(geo, corpoMat); b.position.set(ox, 3.5, 0); b.castShadow = true; g.add(b); });
  const patas = [];
  [-0.5, 0.5].forEach((ox) => { const geo = new THREE.BoxGeometry(0.6, 1.6, 0.6); geo.translate(0, -0.8, 0); const p = new THREE.Mesh(geo, corpoMat); p.position.set(ox, 1.6, 0); p.castShadow = true; g.add(p); patas.push(p); });
  const clava = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.2, 8), mat(0x6e4a2a)); clava.position.set(1.5, 3.0, 0.3); clava.rotation.z = 0.4; g.add(clava);
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

export function criaAranhaGigante(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x2a1f2a, roughness: 0.7 });
  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 10), corpoMat); abdomen.position.set(0, 0.9, -0.7); abdomen.scale.z = 1.3; abdomen.castShadow = true; g.add(abdomen);
  const cefalo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), corpoMat); cefalo.position.set(0, 0.8, 0.5); cefalo.castShadow = true; g.add(cefalo);
  olhos(g, 0.2, 1.0, 0.95, 0.1, 0xc0202a);
  const patas = [];
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 1.4, 5), corpoMat);
    perna.position.set(s * 0.7, 0.8, 0.4 - i * 0.45); perna.rotation.z = s * 1.0; perna.castShadow = true; g.add(perna); patas.push(perna);
  }
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

export function criaAranhaPequena(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x3a2a3a, roughness: 0.7 });
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), corpoMat); corpo.position.y = 0.3; corpo.scale.z = 1.3; corpo.castShadow = true; g.add(corpo);
  const patas = [];
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.5, 4), corpoMat);
    perna.position.set(s * 0.25, 0.3, 0.15 - i * 0.13); perna.rotation.z = s * 0.9; g.add(perna); patas.push(perna);
  }
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// BOSS: cobra (rastejante) e crocodilo — maiores, mais vida/XP/loot.
export function criaCobra(x, z) {
  const g = new THREE.Group(); g.position.set(x, Y, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x3f7a3a, roughness: 0.7 });
  const segs = [];
  for (let i = 0; i < 7; i++) {
    const r = 0.45 - i * 0.04;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), corpoMat);
    seg.position.set(0, 0.35, -i * 0.6); seg.scale.z = 1.3; seg.castShadow = true; g.add(seg); segs.push(seg);
  }
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.7), corpoMat);
  cabeca.position.set(0, 0.4, 0.6); cabeca.castShadow = true; g.add(cabeca);
  [-0.16, 0.16].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), mat(0xd8c020));
    olho.position.set(ox, 0.52, 0.85); g.add(olho);
  });
  const lingua = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.3), mat(0xd83a5a));
  lingua.position.set(0, 0.38, 1.05); g.add(lingua);
  g.userData = { segs, corpoMat, tipo: 'boss' };
  return g;
}

export function criaCrocodilo(x, z) {
  const g = new THREE.Group(); g.position.set(x, Y, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x4a5a38, roughness: 0.8 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 2.4), corpoMat);
  corpo.position.y = 0.35; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.1), corpoMat);
  cabeca.position.set(0, 0.32, 1.5); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.7), corpoMat);
  focinho.position.set(0, 0.24, 2.1); g.add(focinho);
  [-0.22, 0.22].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), mat(0xe0d040));
    olho.position.set(ox, 0.55, 1.4); g.add(olho);
  });
  const patas = [];
  [[-0.45, 0.9], [0.45, 0.9], [-0.45, -0.9], [0.45, -0.9]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.2, 0.3, 0.2); geo.translate(0, -0.15, 0);
    const pa = new THREE.Mesh(geo, corpoMat); pa.position.set(px, 0.3, pz); g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 1.2), corpoMat);
  rabo.position.set(0, 0.3, -1.6); g.add(rabo);
  g.userData = { patas, corpoMat, tipo: 'boss' };
  return g;
}

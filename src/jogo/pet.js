// =============================================================
//  PET  ·  um gatinho blocky que acompanha o avatar.
// =============================================================
import * as THREE from 'three';
import { criaLobo, criaDragao } from './ratos.js';

function m(c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }); }

export function criaGato() {
  const g = new THREE.Group();
  const cor = 0xd98f4a, escuro = 0x6a4a2a;

  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.92), m(cor));
  corpo.position.y = 0.48; corpo.castShadow = true; g.add(corpo);

  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.44), m(cor));
  cabeca.position.set(0, 0.64, 0.62); cabeca.castShadow = true; g.add(cabeca);

  [-0.14, 0.14].forEach((ox) => {
    const o = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 4), m(cor));
    o.position.set(ox, 0.9, 0.62); g.add(o);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), m(0x2a4a2a));
    olho.position.set(ox * 0.7, 0.66, 0.84); g.add(olho);
  });

  const patas = [];
  [[-0.18, 0.32], [0.18, 0.32], [-0.18, -0.32], [0.18, -0.32]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.14, 0.42, 0.14); geo.translate(0, -0.21, 0);
    const pa = new THREE.Mesh(geo, m(escuro)); pa.position.set(px, 0.42, pz); pa.castShadow = true;
    g.add(pa); patas.push(pa);
  });

  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.62), m(cor));
  rabo.position.set(0, 0.6, -0.78); g.add(rabo);

  g.userData = { patas, rabo };
  return g;
}

export function criaCachorro() {
  const g = new THREE.Group();
  const cor = 0x8a5a2a, escuro = 0x5a3a1a;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 1.05), m(cor));
  corpo.position.y = 0.56; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.5), m(cor));
  cabeca.position.set(0, 0.72, 0.7); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), m(escuro));
  focinho.position.set(0, 0.64, 0.98); g.add(focinho);
  [-0.2, 0.2].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.06), m(escuro)); // orelha caída
    or.position.set(ox, 0.82, 0.66); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), m(0x201810));
    olho.position.set(ox * 0.7, 0.78, 0.94); g.add(olho);
  });
  const patas = [];
  [[-0.2, 0.38], [0.2, 0.38], [-0.2, -0.38], [0.2, -0.38]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.16, 0.48, 0.16); geo.translate(0, -0.24, 0);
    const pa = new THREE.Mesh(geo, m(escuro)); pa.position.set(px, 0.5, pz); pa.castShadow = true;
    g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.5), m(cor));
  rabo.position.set(0, 0.72, -0.82); rabo.rotation.x = -0.5; g.add(rabo);
  g.userData = { patas, rabo };
  return g;
}

export function criaCoelho() {
  const g = new THREE.Group();
  const cor = 0xeae6df, escuro = 0xc9c2b6;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.6), m(cor));
  corpo.position.y = 0.4; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), m(cor));
  cabeca.position.set(0, 0.62, 0.4); cabeca.castShadow = true; g.add(cabeca);
  [-0.1, 0.1].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.08), m(cor)); // orelha longa
    or.position.set(ox, 0.96, 0.36); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), m(0x884444));
    olho.position.set(ox * 1.4, 0.64, 0.56); g.add(olho);
  });
  const patas = [];
  [[-0.13, 0.2], [0.13, 0.2], [-0.13, -0.2], [0.13, -0.2]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.12, 0.3, 0.12); geo.translate(0, -0.15, 0);
    const pa = new THREE.Mesh(geo, m(escuro)); pa.position.set(px, 0.3, pz); pa.castShadow = true;
    g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), m(0xffffff));
  rabo.position.set(0, 0.42, -0.34); g.add(rabo);
  g.userData = { patas, rabo };
  return g;
}

// BURRO (montaria clássica de início, estilo Tibia)
export function criaBurro() {
  const g = new THREE.Group();
  const cor = 0x9a8f85, escuro = 0x6a6058;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.62, 1.3), m(cor));
  corpo.position.y = 0.95; corpo.castShadow = true; g.add(corpo);
  const pescoco = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 0.4), m(cor));
  pescoco.position.set(0, 1.35, 0.6); pescoco.rotation.x = 0.5; g.add(pescoco);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.66), m(cor));
  cabeca.position.set(0, 1.6, 0.92); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.3), m(escuro));
  focinho.position.set(0, 1.5, 1.26); g.add(focinho);
  [-0.12, 0.12].forEach((ox) => { // orelhas COMPRIDAS de burro
    const or = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.08), m(cor));
    or.position.set(ox, 1.95, 0.82); or.rotation.z = ox > 0 ? -0.2 : 0.2; g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), m(0x201810));
    olho.position.set(ox * 1.3, 1.66, 1.12); g.add(olho);
  });
  const crina = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), m(0x4a4038));
  crina.position.set(0, 1.5, 0.55); crina.rotation.x = 0.5; g.add(crina);
  const patas = [];
  [[-0.2, 0.45], [0.2, 0.45], [-0.2, -0.45], [0.2, -0.45]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.16, 0.66, 0.16); geo.translate(0, -0.33, 0);
    const pa = new THREE.Mesh(geo, m(escuro)); pa.position.set(px, 0.66, pz); pa.castShadow = true;
    g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.55, 0.07), m(0x4a4038));
  rabo.position.set(0, 0.95, -0.72); rabo.rotation.x = 0.4; g.add(rabo);
  g.userData = { patas, rabo };
  return g;
}

// fábrica de pets (domar pra ter! lobo = o de ratos.js; dragãozinho = dragão mini)
export const PETS = {
  gato: criaGato, cachorro: criaCachorro, coelho: criaCoelho,
  lobo: () => criaLobo(0, 0),
  burro: criaBurro,
  dragaozinho: () => { const d = criaDragao(0, 0); d.scale.setScalar(0.16); return d; },
};

// segue o alvo (avatar) mantendo distância; anima patas e rabo
export function atualizaGato(gato, alvo, dt, tempo) {
  const dx = alvo.position.x - gato.position.x;
  const dz = alvo.position.z - gato.position.z;
  const dist = Math.hypot(dx, dz);
  const u = gato.userData;

  if (dist > 3) {
    const v = Math.min(dist - 2.6, 11 * dt);
    gato.position.x += (dx / dist) * v;
    gato.position.z += (dz / dist) * v;
    gato.rotation.y = Math.atan2(dx, dz);
    if (u.patas && u.patas.length >= 4) {
      const s = Math.sin(tempo * 16) * 0.6;
      u.patas[0].rotation.x = s; u.patas[3].rotation.x = s;
      u.patas[1].rotation.x = -s; u.patas[2].rotation.x = -s;
    }
  } else if (u.patas) {
    u.patas.forEach((p) => { p.rotation.x *= 0.8; });
  }
  if (u.rabo) u.rabo.rotation.y = Math.sin(tempo * 3) * 0.4; // rabo sempre balança (se tiver)
}

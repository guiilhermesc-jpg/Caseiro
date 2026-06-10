// =============================================================
//  NATUREZA / BIOMAS  ·  água e vegetação por região.
//  Lago + riacho + ponte; plantas de beira d'água (juncos, salgueiro,
//  vitórias-régias), árvores de copa, pedras, cogumelos e flores do campo.
//  Cada função devolve { grupo, colisores:[...], animados?:[...] }.
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

const AGUA = new THREE.MeshStandardMaterial({ color: 0x3f86c0, roughness: 0.15, metalness: 0.35, transparent: true, opacity: 0.82 });

// --- lago (areia + água), colisor quadrado aproximando o círculo ---
export function criaLago(x, z, r = 15) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const areia = new THREE.Mesh(new THREE.CircleGeometry(r + 2.2, 30), mat(0xcabf94, 1));
  areia.rotation.x = -Math.PI / 2; areia.position.y = 0.04; areia.receiveShadow = true; g.add(areia);
  const agua = new THREE.Mesh(new THREE.CircleGeometry(r, 30), AGUA);
  agua.rotation.x = -Math.PI / 2; agua.position.y = 0.1; g.add(agua);
  const c = r * 0.72;
  return { grupo: g, colisores: [{ minX: x - c, maxX: x + c, minZ: z - c, maxZ: z + c }] };
}

// --- riacho (faixa de água ao longo de X), com vão para a ponte ---
export function criaRiacho({ xIni, xFim, z, larg = 5, gapX = null, gapW = 7 }) {
  const g = new THREE.Group();
  const comp = xFim - xIni, cx = (xIni + xFim) / 2;
  const margem = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.06, larg + 1.4), mat(0x7a6a4a, 1));
  margem.position.set(cx, 0.03, z); margem.receiveShadow = true; g.add(margem);
  const agua = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.06, larg), AGUA);
  agua.position.set(cx, 0.09, z); g.add(agua);
  const colisores = [];
  if (gapX == null) {
    colisores.push({ minX: xIni, maxX: xFim, minZ: z - larg / 2, maxZ: z + larg / 2 });
  } else {
    colisores.push({ minX: xIni, maxX: gapX - gapW / 2, minZ: z - larg / 2, maxZ: z + larg / 2 });
    colisores.push({ minX: gapX + gapW / 2, maxX: xFim, minZ: z - larg / 2, maxZ: z + larg / 2 });
  }
  return { grupo: g, colisores };
}

// --- ponte de madeira (atravessável, rente ao chão) ---
export function criaPonte(x, z, larguraZ = 8) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const mad = mat(0x8a6a44);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, larguraZ), mad);
  deck.position.y = 0.13; deck.castShadow = true; deck.receiveShadow = true; g.add(deck);
  for (let i = 0; i < 8; i++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, larguraZ / 8 - 0.06), mat(0x7a5c3a));
    t.position.set(0, 0.22, -larguraZ / 2 + (i + 0.5) * (larguraZ / 8)); g.add(t);
  }
  [-1.6, 1.6].forEach((px) => {
    const trav = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, larguraZ), mad);
    trav.position.set(px, 0.85, 0); g.add(trav);
    [-larguraZ / 2 + 0.4, 0, larguraZ / 2 - 0.4].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), mad);
      post.position.set(px, 0.45, pz); post.castShadow = true; g.add(post);
    });
  });
  return { grupo: g, colisores: [] };
}

// --- juncos / taboas de beira d'água (decorativo) ---
export function criaJunco(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  for (let i = 0; i < 5; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 0.4, h = 1.2 + Math.random() * 0.8;
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, h, 4), mat(0x4f7a3a));
    blade.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    blade.rotation.z = (Math.random() - 0.5) * 0.3; g.add(blade);
    if (i % 2 === 0) {
      const esp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 6), mat(0x6b4226));
      esp.position.set(Math.cos(a) * r, h, Math.sin(a) * r); g.add(esp);
    }
  }
  return { grupo: g, colisores: [] };
}

// --- salgueiro (árvore chorona de beira de lago) ---
export function criaSalgueiro(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 3.2, 8), mat(0x5a4326));
  tronco.position.y = 1.6; tronco.castShadow = true; g.add(tronco);
  const corFolha = 0x6f9a4a;
  const copa = new THREE.Mesh(new THREE.SphereGeometry(2.6, 10, 8), mat(corFolha));
  copa.position.y = 4.2; copa.scale.y = 0.7; copa.castShadow = true; g.add(copa);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const ramo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 2.4, 4), mat(corFolha));
    ramo.position.set(Math.cos(a) * 2.2, 3.0, Math.sin(a) * 2.2); g.add(ramo);
  }
  return { grupo: g, colisores: [{ minX: x - 0.9, maxX: x + 0.9, minZ: z - 0.9, maxZ: z + 0.9 }] };
}

// --- árvore de copa redonda (variedade além dos pinheiros) ---
export function criaArvore(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.6, 7), mat(0x6b4a2a));
  tronco.position.y = 1.3; tronco.castShadow = true; g.add(tronco);
  const cor = 0x4f8a3e;
  [[1.9, 3.6, 0, 0], [1.4, 4.6, 0.8, 0.5], [1.3, 4.4, -0.7, -0.6]].forEach(([r, y, ox, oz]) => {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(cor));
    c.position.set(ox, y, oz); c.castShadow = true; g.add(c);
  });
  return { grupo: g, colisores: [{ minX: x - 0.9, maxX: x + 0.9, minZ: z - 0.9, maxZ: z + 0.9 }] };
}

// --- vitória-régia (folha + flor) que boia e balança de leve ---
export function criaNenufar(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pad = new THREE.Mesh(new THREE.CircleGeometry(0.5, 10), mat(0x3f7a3a, 1));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.12; g.add(pad);
  if (Math.random() < 0.5) {
    const flor = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), mat(0xf2a7c4));
    flor.position.set(0, 0.22, 0); g.add(flor);
  }
  return { grupo: g, colisores: [], animados: [{ mesh: g, flutua: true, baseY: 0, fase: Math.random() * 6 }] };
}

// --- pedra / pedregulho ---
export function criaPedra(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const rocha = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), mat(0x8b8b86, 1));
  rocha.position.y = s * 0.5; rocha.rotation.set(Math.random(), Math.random(), Math.random());
  rocha.castShadow = true; rocha.receiveShadow = true; g.add(rocha);
  return { grupo: g, colisores: [{ minX: x - s * 0.8, maxX: x + s * 0.8, minZ: z - s * 0.8, maxZ: z + s * 0.8 }] };
}

// --- cogumelo (detalhe de floresta) ---
export function criaCogumelo(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const cau = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6), mat(0xe8e0d0));
  cau.position.y = 0.2; g.add(cau);
  const chap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xc23a2a));
  chap.position.y = 0.4; g.add(chap);
  return { grupo: g, colisores: [] };
}

// --- moita de flores altas do campo ---
export function criaFlorAlta(x, z, cor = 0xf2c14e) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  for (let i = 0; i < 4; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 0.3, h = 0.7 + Math.random() * 0.5;
    const cau = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, h, 5), mat(0x3a6b30));
    cau.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); g.add(cau);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), mat(cor));
    fl.position.set(Math.cos(a) * r, h, Math.sin(a) * r); g.add(fl);
  }
  return { grupo: g, colisores: [] };
}

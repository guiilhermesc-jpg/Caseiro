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
  return { grupo: g, colisores: [{ minX: x - c, maxX: x + c, minZ: z - c, maxZ: z + c }], lago: { x, z, r } };
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

// --- montanha (emoldura o mundo; bloqueia passagem) ---
export function criaMontanha(x, z, esc = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const rocha = mat(0x6e6a62, 1), rochaEsc = mat(0x4a473f, 1), rochaClara = mat(0x827d72, 1), neve = mat(0xeef2f5, 1);
  const h = 28 * esc, r = 18 * esc;
  const base = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), rocha);
  base.position.y = h / 2; base.rotation.y = Math.random(); base.scale.x = 1.12; base.castShadow = true; base.receiveShadow = true; g.add(base);
  // sub-picos (relevo irregular)
  [[-r * 0.55, -r * 0.25, 0.62, rochaEsc], [r * 0.6, r * 0.15, 0.72, rochaClara], [-r * 0.2, r * 0.5, 0.5, rochaEsc]].forEach(([ox, oz, s, m]) => {
    const p = new THREE.Mesh(new THREE.ConeGeometry(r * s, h * s * 1.1, 6), m);
    p.position.set(ox, h * s * 1.1 / 2, oz); p.rotation.y = Math.random(); p.castShadow = true; g.add(p);
  });
  // penhasco (face de rocha)
  const cliff = new THREE.Mesh(new THREE.BoxGeometry(r * 0.9, h * 0.5, r * 0.5), rochaEsc);
  cliff.position.set(r * 0.2, h * 0.28, r * 0.5); cliff.rotation.y = 0.3; cliff.castShadow = true; g.add(cliff);
  // pedregulhos na base
  for (let i = 0; i < 4; i++) {
    const a = Math.random() * Math.PI * 2, rr = r * (0.7 + Math.random() * 0.3);
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r * (0.12 + Math.random() * 0.1), 0), rochaClara);
    b.position.set(Math.cos(a) * rr, r * 0.1, Math.sin(a) * rr); b.rotation.set(Math.random(), Math.random(), Math.random()); b.castShadow = true; g.add(b);
  }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.42, h * 0.24, 6), neve);
  cap.position.y = h * 0.88; cap.rotation.y = Math.random(); g.add(cap);
  const c = r * 0.6;
  return { grupo: g, colisores: [{ minX: x - c, maxX: x + c, minZ: z - c, maxZ: z + c }] };
}

// --- estrada de pedra (andável) ao longo de X ---
export function criaEstrada(xIni, xFim, z, larg = 7) {
  const g = new THREE.Group();
  const comp = xFim - xIni, cx = (xIni + xFim) / 2;
  const via = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.08, larg), mat(0x6b6258, 1));
  via.position.set(cx, 0.05, z); via.receiveShadow = true; g.add(via);
  [-larg / 2 - 0.3, larg / 2 + 0.3].forEach((oz) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.22, 0.4), mat(0x54514a, 1));
    b.position.set(cx, 0.11, z + oz); g.add(b);
  });
  return { grupo: g, colisores: [] };
}

// --- placa de madeira com texto (ex.: "→ THAIS") ---
export function criaPlaca(x, z, texto = '→ THAIS', rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.4, 6), mat(0x6e4a2a));
  poste.position.y = 1.2; poste.castShadow = true; g.add(poste);
  const cnv = document.createElement('canvas'); cnv.width = 256; cnv.height = 96;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = '#7a5a32'; ctx.fillRect(0, 0, 256, 96);
  ctx.fillStyle = '#f0e8d0'; ctx.font = 'bold 34px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 128, 48);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.12),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnv), roughness: 0.9 }));
  tab.position.y = 2.0; tab.castShadow = true; g.add(tab);
  return { grupo: g, colisores: [{ minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3 }] };
}

// --- cais de madeira (píer andável p/ dentro d'água) + barco amarrado ---
export function criaCais(x, z, comp = 12) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const mad = mat(0x6e4a2a), madEsc = mat(0x4f3318);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3, 0.16, comp), mad);
  deck.position.set(0, 0.22, comp / 2); deck.receiveShadow = true; deck.castShadow = true; g.add(deck);
  for (let i = 0; i <= comp / 2; i++) {
    [-1.3, 1.3].forEach((px) => {
      const e = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 6), madEsc);
      e.position.set(px, -0.25, i * 2); g.add(e);
    });
  }
  // barril + caixa no fim do cais
  const barril = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.9, 10), mad);
  barril.position.set(-0.9, 0.75, comp - 1.5); g.add(barril);
  // barquinho amarrado (boia de leve)
  const boat = new THREE.Group(); boat.position.set(2.6, 0.16, comp - 2);
  const casco = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 3.4), mad);
  casco.position.y = 0.2; boat.add(casco);
  const interior = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 3.0), madEsc);
  interior.position.y = 0.35; boat.add(interior);
  const remo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 6), mad);
  remo.position.set(0.7, 0.5, 0); remo.rotation.z = 0.5; boat.add(remo);
  g.add(boat);
  return { grupo: g, colisores: [], animados: [{ mesh: boat, flutua: true, baseY: 0.16, fase: Math.random() * 6 }] };
}

// --- fogueira de acampamento (roda de pedras + lenha + chamas) ---
export function criaFogueira(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  for (let i = 0; i < 7; i++) { // roda de pedras
    const a = (i / 7) * Math.PI * 2;
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + Math.random() * 0.08, 0), mat(0x8b8b86, 1));
    p.position.set(Math.cos(a) * 0.85, 0.16, Math.sin(a) * 0.85); p.rotation.set(Math.random(), Math.random(), Math.random()); g.add(p);
  }
  [-0.3, 0.3].forEach((o, k) => { // lenha cruzada
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.3, 6), mat(0x5a3f24));
    l.position.set(o, 0.22, 0); l.rotation.set(0, k ? Math.PI / 3 : -Math.PI / 3, Math.PI / 2 + 0.15 * (k ? 1 : -1)); g.add(l);
  });
  const fogoMat = new THREE.MeshStandardMaterial({ color: 0xff8a2a, emissive: 0xff5a1a, emissiveIntensity: 1 });
  [[0, 0.45, 0.7], [0.2, 0.35, 0.5], [-0.18, 0.3, 0.45]].forEach(([ox, h, s]) => {
    const f = new THREE.Mesh(new THREE.ConeGeometry(s * 0.35, h, 6), fogoMat);
    f.position.set(ox, 0.3 + h / 2, 0); g.add(f);
  });
  return { grupo: g, colisores: [] };
}

// --- carroça de madeira (caída na estrada; detalhe de jornada) ---
export function criaCarroca(x, z, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const mad = mat(0x6e4a2a), madEsc = mat(0x4f3318);
  const cacamba = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 1.8), mad);
  cacamba.position.y = 1.0; cacamba.castShadow = true; g.add(cacamba);
  [-0.9, 0.9].forEach((px) => { // tábuas laterais
    const t = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 0.1), madEsc);
    t.position.set(0, 1.4, px); g.add(t);
  });
  [[-1.0, -1.0], [1.0, -1.0], [-1.0, 1.0], [1.0, 1.0]].forEach(([wx, wz]) => { // rodas
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.18, 12), madEsc);
    r.position.set(wx, 0.7, wz); r.rotation.x = Math.PI / 2; r.castShadow = true; g.add(r);
  });
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 6), mad); // timão
  haste.position.set(2.4, 0.7, 0); haste.rotation.z = Math.PI / 2 - 0.25; g.add(haste);
  return { grupo: g, colisores: [{ minX: x - 1.8, maxX: x + 1.8, minZ: z - 1.2, maxZ: z + 1.2 }] };
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

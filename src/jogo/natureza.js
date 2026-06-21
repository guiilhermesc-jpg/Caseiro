// =============================================================
//  NATUREZA / BIOMAS  ·  água e vegetação por região.
//  Lago + riacho + ponte; plantas de beira d'água (juncos, salgueiro,
//  vitórias-régias), árvores de copa, pedras, cogumelos e flores do campo.
//  Cada função devolve { grupo, colisores:[...], animados?:[...] }.
// =============================================================
import * as THREE from 'three';
import { mat, matFlat, desloca, aplicaTexturaReal } from './construcoes.js';
import { matPBR } from './texturas.js'; // RV11.9: casca de árvore com relevo (compartilhada)
const CASCA_PBR = matPBR(0x5a4326, { tipo: 'madeira', repeat: 1, rough: 0.95, relevo: 0.7 });
const CASCA2_PBR = matPBR(0x4f3a22, { tipo: 'madeira', repeat: 1.4, rough: 0.95, relevo: 0.8 });
const CASCA3_PBR = matPBR(0x6b4a2a, { tipo: 'madeira', repeat: 1, rough: 0.95, relevo: 0.7 });

const AGUA = new THREE.MeshStandardMaterial({ color: 0x3f86c0, roughness: 0.15, metalness: 0.35, transparent: true, opacity: 0.82 });

// --- lago (areia + água), colisor quadrado aproximando o círculo ---
export function criaLago(x, z, r = 15) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const areia = new THREE.Mesh(new THREE.CircleGeometry(r + 2.2, 30), mat(0xcabf94, 1));
  areia.rotation.x = -Math.PI / 2; areia.position.y = 0.04; areia.receiveShadow = true; g.add(areia);
  const agua = new THREE.Mesh(new THREE.CircleGeometry(r, 30), AGUA);
  agua.rotation.x = -Math.PI / 2; agua.position.y = 0.1; g.add(agua);
  const espuma = new THREE.Mesh(new THREE.RingGeometry(r - 0.7, r + 0.4, 30),
    new THREE.MeshStandardMaterial({ color: 0xeaf6fa, transparent: true, opacity: 0.45, roughness: 0.5, depthWrite: false }));
  espuma.rotation.x = -Math.PI / 2; espuma.position.y = 0.115; g.add(espuma); // espuma da margem
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
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 3.2, 8), CASCA_PBR);
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

// --- ÁRVORE GRANDE (estilo Tibia/Albion): tronco alto, raízes na base e
//     copa frondosa em vários blobs — preenche a floresta ao redor das cidades ---
export function criaArvoreGrande(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const casca = CASCA2_PBR;
  const PALETAS = [[0x3e7032, 0x4f8a3e, 0x32592a], [0x4a8a3a, 0x5d9c4b, 0x3a6e2e], [0x57924a, 0x6aa85a, 0x447238], [0x6a9a3a, 0x7cab4b, 0x54802e]];
  const pal = PALETAS[Math.floor(Math.random() * PALETAS.length)]; // cada árvore com seu tom
  const folha = matFlat(pal[0]), folhaClara = matFlat(pal[1]), folhaEsc = matFlat(pal[2]);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.55 * s, 0.95 * s, 7.5 * s, 7), casca);
  tronco.position.y = 3.75 * s; tronco.castShadow = true; g.add(tronco);
  // raízes salientes na base (dão peso visual)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const raiz = new THREE.Mesh(new THREE.BoxGeometry(0.4 * s, 0.9 * s, 1.3 * s), casca);
    raiz.position.set(Math.cos(a) * 0.85 * s, 0.4 * s, Math.sin(a) * 0.85 * s);
    raiz.rotation.y = -a; raiz.rotation.x = 0.25; g.add(raiz);
  }
  // galho lateral grosso
  const galho = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.32 * s, 3.2 * s, 6), casca);
  galho.position.set(1.4 * s, 6.2 * s, 0.4 * s); galho.rotation.z = -1.0; galho.castShadow = true; g.add(galho);
  // copa frondosa (5 blobs grandes em alturas variadas)
  [[0, 9.5, 0, 3.4, folha], [2.4, 8.4, 0.8, 2.4, folhaClara], [-2.2, 8.6, -0.6, 2.5, folhaEsc],
   [0.6, 10.8, 1.6, 2.2, folhaClara], [-0.8, 8.0, 2.0, 2.1, folha]].forEach(([ox, oy, oz, r, m]) => {
    const c = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(r * s, 0), r * s * 0.34), m);
    c.position.set(ox * s, oy * s, oz * s); c.rotation.y = Math.random() * 2; c.castShadow = true; g.add(c);
  });
  return { grupo: g, colisores: [{ minX: x - 1.2 * s, maxX: x + 1.2 * s, minZ: z - 1.2 * s, maxZ: z + 1.2 * s }] };
}

// --- árvore de copa redonda (variedade além dos pinheiros) ---
export function criaArvore(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.6, 7), CASCA3_PBR);
  tronco.position.y = 1.3; tronco.castShadow = true; g.add(tronco);
  const cor = [0x4f8a3e, 0x5d9c4b, 0x447238, 0x6a9a3a][Math.floor(Math.random() * 4)];
  [[1.9, 3.6, 0, 0], [1.4, 4.6, 0.8, 0.5], [1.3, 4.4, -0.7, -0.6]].forEach(([r, y, ox, oz]) => {
    const c = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(r, 0), r * 0.34), matFlat(cor));
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
  const rocha = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(s, 0), s * 0.32), matFlat(0x8b8b86));
  rocha.position.y = s * 0.5; rocha.rotation.set(Math.random(), Math.random(), Math.random());
  rocha.castShadow = true; rocha.receiveShadow = true; g.add(rocha);
  if (Math.random() < 0.45) { // musgo no topo (assinatura dos packs premium)
    const musgo = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(s * 0.55, 0), s * 0.2), matFlat(0x5d8f46));
    musgo.position.y = s * 1.05; musgo.scale.y = 0.45; g.add(musgo);
  }
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
// materiais COM TEXTURA DE ROCHA compartilhados por todas as montanhas
const MAT_ROCHA = new THREE.MeshStandardMaterial({ color: 0x8d877c, roughness: 1 });
const MAT_ROCHA_ESC = new THREE.MeshStandardMaterial({ color: 0x6a6359, roughness: 1, flatShading: true });
const MAT_ROCHA_CLARA = new THREE.MeshStandardMaterial({ color: 0xa39c8e, roughness: 1 });
aplicaTexturaReal(MAT_ROCHA, 'montanha', 5, 4, false);     // RV12.2: textura montanha (rocha+neve) real
aplicaTexturaReal(MAT_ROCHA_ESC, 'montanha', 4.5, 3.5, false);
aplicaTexturaReal(MAT_ROCHA_CLARA, 'montanha', 5.5, 4.2, false);
export function criaMontanha(x, z, esc = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const rocha = MAT_ROCHA, rochaEsc = MAT_ROCHA_ESC, rochaClara = MAT_ROCHA_CLARA, neve = mat(0xeef2f5, 1);
  const h = 28 * esc, r = 18 * esc;
  const base = new THREE.Mesh(desloca(new THREE.ConeGeometry(r, h, 14, 4), r * 0.10), rocha);
  base.position.y = h / 2; base.rotation.y = Math.random(); base.scale.set(1.25, 1, 1.18); base.castShadow = true; base.receiveShadow = true; g.add(base);
  // sub-picos (relevo irregular, deslocado = craggy)
  [[-r * 0.55, -r * 0.25, 0.62, rochaEsc], [r * 0.6, r * 0.15, 0.72, rochaClara], [-r * 0.2, r * 0.5, 0.5, rochaEsc]].forEach(([ox, oz, s, m]) => {
    const p = new THREE.Mesh(desloca(new THREE.ConeGeometry(r * s, h * s * 1.1, 12, 3), r * s * 0.12), m);
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
  const cap = new THREE.Mesh(desloca(new THREE.ConeGeometry(r * 0.46, h * 0.30, 12, 2), r * 0.05), neve);
  cap.position.y = h * 0.86; cap.rotation.y = Math.random(); cap.castShadow = true; g.add(cap);
  const c = r * 0.7;
  return { grupo: g, colisores: [{ minX: x - c, maxX: x + c, minZ: z - c, maxZ: z + c }] };
}

// --- estrada de terra batida (andável) ao longo de X ---
export function criaEstrada(xIni, xFim, z, larg = 7) {
  const g = new THREE.Group();
  const comp = xFim - xIni, cx = (xIni + xFim) / 2;
  const viaMat = new THREE.MeshStandardMaterial({ color: 0x7f6546, roughness: 1 });
  aplicaTexturaReal(viaMat, 'terra', Math.max(6, comp / 7), 1.65); // terra REAL ao longo do caminho
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x6d5a42, roughness: 1, flatShading: true });
  const trilhaMat = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1, flatShading: true });
  const bordaMat = new THREE.MeshStandardMaterial({ color: 0x4f5a36, roughness: 1, flatShading: true });
  const transicaoMat = new THREE.MeshStandardMaterial({ color: 0x6f7442, roughness: 1, transparent: true, opacity: 0.78, depthWrite: false });
  const lamaMat = new THREE.MeshStandardMaterial({ color: 0x3f2d20, roughness: 1, transparent: true, opacity: 0.62, depthWrite: false });
  const folhaMat = new THREE.MeshStandardMaterial({ color: 0x8a6740, roughness: 1, flatShading: true });
  const base = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.05, larg + 2.8), baseMat);
  base.position.set(cx, 0.035, z); base.receiveShadow = true; g.add(base);
  const via = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.08, larg), viaMat);
  via.position.set(cx, 0.075, z); via.receiveShadow = true; g.add(via);
  [-larg * 0.25, larg * 0.25].forEach((oz) => {
    const trilha = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.035, 0.72), trilhaMat);
    trilha.position.set(cx, 0.13, z + oz); trilha.receiveShadow = true; g.add(trilha);
  });
  const centro = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.026, 0.52), new THREE.MeshStandardMaterial({ color: 0x9a815e, roughness: 1 }));
  centro.position.set(cx, 0.145, z); centro.receiveShadow = true; g.add(centro);
  [-larg / 2 - 0.55, larg / 2 + 0.55].forEach((oz) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.18, 0.5), bordaMat);
    b.position.set(cx, 0.14, z + oz); b.receiveShadow = true; g.add(b);
  });
  [-larg / 2 - 1.18, larg / 2 + 1.18].forEach((oz) => {
    const faixa = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.024, 1.15), transicaoMat);
    faixa.position.set(cx, 0.108, z + oz); faixa.receiveShadow = true; g.add(faixa);
  });
  const pedraGeo = new THREE.DodecahedronGeometry(0.18, 0);
  const pedraMat = matFlat(0x787065, 1);
  const n = Math.max(8, Math.min(72, Math.floor(Math.abs(comp) / 7)));
  const pedras = new THREE.InstancedMesh(pedraGeo, pedraMat, n);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5 + (Math.random() - 0.5) * 0.55) / n;
    const x = xIni + comp * t;
    const lado = i % 2 ? 1 : -1;
    dummy.position.set(x, 0.23, z + lado * (larg / 2 + 0.95 + Math.random() * 0.65));
    dummy.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.4);
    const s = 0.7 + Math.random() * 1.2;
    dummy.scale.set(s * (1.1 + Math.random() * 0.6), 0.35 + Math.random() * 0.45, s);
    dummy.updateMatrix();
    pedras.setMatrixAt(i, dummy.matrix);
  }
  pedras.castShadow = pedras.receiveShadow = true;
  g.add(pedras);

  const nPocas = Math.max(4, Math.min(22, Math.floor(Math.abs(comp) / 32)));
  for (let i = 0; i < nPocas; i++) {
    const t = (i + 0.35 + Math.random() * 0.45) / nPocas;
    const poca = new THREE.Mesh(new THREE.CircleGeometry(0.8 + Math.random() * 0.85, 14), lamaMat);
    poca.rotation.x = -Math.PI / 2;
    poca.rotation.z = Math.random() * Math.PI;
    poca.scale.set(1.45 + Math.random() * 1.3, 0.55 + Math.random() * 0.45, 1);
    poca.position.set(xIni + comp * t, 0.162, z + (Math.random() - 0.5) * (larg * 0.58));
    poca.receiveShadow = true;
    g.add(poca);
  }

  const pegadasN = Math.max(12, Math.min(96, Math.floor(Math.abs(comp) / 5.8)));
  const pegadas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.026, 0.42), lamaMat, pegadasN);
  for (let i = 0; i < pegadasN; i++) {
    const t = (i + 0.5) / pegadasN;
    const passo = i % 2 ? -1 : 1;
    dummy.position.set(
      xIni + comp * t + (Math.random() - 0.5) * 0.45,
      0.174,
      z + passo * (0.58 + Math.random() * 0.18)
    );
    dummy.rotation.set(0, passo * (0.16 + Math.random() * 0.12), 0);
    dummy.scale.set(0.9 + Math.random() * 0.35, 1, 0.8 + Math.random() * 0.25);
    dummy.updateMatrix();
    pegadas.setMatrixAt(i, dummy.matrix);
  }
  pegadas.receiveShadow = true;
  g.add(pegadas);

  const detritosN = Math.max(10, Math.min(80, Math.floor(Math.abs(comp) / 6)));
  const detritos = new THREE.InstancedMesh(new THREE.BoxGeometry(0.36, 0.022, 0.12), folhaMat, detritosN);
  for (let i = 0; i < detritosN; i++) {
    const lado = i % 2 ? 1 : -1;
    dummy.position.set(
      xIni + comp * ((i + Math.random()) / detritosN),
      0.185,
      z + lado * (larg / 2 + 1.35 + Math.random() * 0.8)
    );
    dummy.rotation.set(0, Math.random() * Math.PI, 0);
    dummy.scale.set(0.7 + Math.random() * 1.4, 1, 0.7 + Math.random() * 1.1);
    dummy.updateMatrix();
    detritos.setMatrixAt(i, dummy.matrix);
  }
  detritos.receiveShadow = true;
  g.add(detritos);
  return { grupo: g, colisores: [] };
}

// --- placa de madeira com texto (ex.: "→ THAIS") ---
export function criaPlaca(x, z, texto = '→ THAIS', rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.4, 6), mat(0x6e4a2a));
  poste.position.y = 1.2; poste.castShadow = true; g.add(poste);
  const cnv = document.createElement('canvas'); cnv.width = 256; cnv.height = 96;
  const ctx = cnv.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 96);
  grad.addColorStop(0, '#8a683c'); grad.addColorStop(1, '#5f4022');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 96);
  for (let y = 14; y < 96; y += 24) {
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, y, 256, 2);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, y + 3, 256, 2);
  }
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)';
    ctx.fillRect(Math.random() * 256, Math.random() * 96, 1 + Math.random() * 5, 1);
  }
  ctx.strokeStyle = '#2f1d10'; ctx.lineWidth = 8; ctx.strokeRect(5, 5, 246, 86);
  ctx.fillStyle = '#24170d'; [22, 234].forEach((px) => { ctx.beginPath(); ctx.arc(px, 18, 5, 0, Math.PI * 2); ctx.fill(); });
  const tamFonte = texto.length > 24 ? 18 : (texto.length > 16 ? 24 : 34);
  ctx.fillStyle = '#f0e8d0'; ctx.font = `bold ${tamFonte}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 128, 48);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.12),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnv), roughness: 0.9 }));
  tab.position.y = 2.0; tab.castShadow = true; g.add(tab);
  const mold = mat(0x3b2616);
  [[0, 2.48, 0.16, 2.48], [0, 2.48, 0.16, 1.52], [-1.28, 0.16, 1.02, 2], [1.28, 0.16, 1.02, 2]]
    .forEach(([px, w, h, py]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), mold);
      b.position.set(px, py, 0.07); b.castShadow = true; g.add(b);
    });
  return { grupo: g, colisores: [{ minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3 }] };
}

// --- cais de madeira (píer andável p/ dentro d'água) + barco amarrado ---
export function criaCais(x, z, comp = 12) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const mad = mat(0x6e4a2a), madEsc = mat(0x4f3318);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 1 });
  aplicaTexturaReal(deckMat, 'madeira', 1, 4); // tábuas REAIS no píer
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3, 0.16, comp), deckMat);
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

// --- RIO (corre ao longo de Z; corta o caminho entre as cidades) com vão p/ ponte ---
export function criaRio({ zIni, zFim, x, larg = 8, gapZ = null, gapW = 8 }) {
  const g = new THREE.Group();
  const comp = zFim - zIni, cz = (zIni + zFim) / 2;
  const margem = new THREE.Mesh(new THREE.BoxGeometry(larg + 1.6, 0.06, comp), mat(0x7a6a4a, 1));
  margem.position.set(x, 0.03, cz); margem.receiveShadow = true; g.add(margem);
  const agua = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.06, comp), AGUA);
  agua.position.set(x, 0.09, cz); g.add(agua);
  const colisores = [];
  if (gapZ == null) {
    colisores.push({ minX: x - larg / 2, maxX: x + larg / 2, minZ: zIni, maxZ: zFim });
  } else {
    colisores.push({ minX: x - larg / 2, maxX: x + larg / 2, minZ: zIni, maxZ: gapZ - gapW / 2 });
    colisores.push({ minX: x - larg / 2, maxX: x + larg / 2, minZ: gapZ + gapW / 2, maxZ: zFim });
  }
  return { grupo: g, colisores };
}

// --- PONTE DE PEDRA (atravessa o rio no sentido X) ---
//  AJUSTADA: tablado quase na largura da ESTRADA (7.4) com parapeitos finos
//  nas bordas → passagem larga (≈5.4 útil), sem funil que travava o jogador;
//  deck rente ao chão (o avatar não "afunda").
export function criaPonteDePedra(x, z, comp = 12) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x8a8276, 1), pedraEsc = mat(0x6a6258, 1);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.22, 7.4), pedra);
  deck.position.y = 0.11; deck.castShadow = deck.receiveShadow = true; g.add(deck);
  // arco por baixo (vão da água) — AFUNDADO: antes a meia-lua atravessava o
  // tablado e virava uma "corcova de pedra" no meio da ponte
  const arco = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 6.6, 12, 1, false, 0, Math.PI), pedraEsc);
  arco.rotation.z = Math.PI / 2; arco.rotation.y = Math.PI / 2; arco.position.y = -1.95; g.add(arco);
  const colisores = [];
  [-3.55, 3.55].forEach((oz) => { // parapeitos finos na BORDA (não cai na água)
    const par = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.85, 0.3), pedraEsc);
    par.position.set(0, 0.64, oz); par.castShadow = true; g.add(par);
    colisores.push({ minX: x - comp / 2, maxX: x + comp / 2, minZ: z + oz - 0.15, maxZ: z + oz + 0.15 });
  });
  [[-comp / 2 + 0.4, -3.55], [comp / 2 - 0.4, -3.55], [-comp / 2 + 0.4, 3.55], [comp / 2 - 0.4, 3.55]].forEach(([px, pz]) => {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.3, 0.6), pedra);
    pil.position.set(px, 0.65, pz); pil.castShadow = true; g.add(pil);
  });
  return { grupo: g, colisores };
}

// --- TORRE DE VIGIA da estrada (posto de guarda; ameias + braseiro) ---
export function criaTorreVigia(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x8a8276, 1), pedraEsc = mat(0x6a6258, 1);
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 11, 10), pedra);
  corpo.position.y = 5.5; corpo.castShadow = corpo.receiveShadow = true; g.add(corpo);
  const topo = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.2, 10), pedraEsc);
  topo.position.y = 11.6; g.add(topo);
  for (let i = 0; i < 8; i++) { // ameias
    const a = (i / 8) * Math.PI * 2;
    const am = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.5), pedra);
    am.position.set(Math.cos(a) * 2.5, 12.6, Math.sin(a) * 2.5); am.rotation.y = -a; g.add(am);
  }
  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.6, 0.3), mat(0x4a2f1a));
  porta.position.set(0, 1.3, 2.5); g.add(porta);
  [3.6, 6.4, 9.2].forEach((y) => { const seteira = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.2), mat(0x14100c)); seteira.position.set(0, y, 2.45); g.add(seteira); });
  // braseiro aceso no topo (farol da estrada)
  const taca = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 0.5, 8), pedraEsc); taca.position.y = 13.3; g.add(taca);
  const fogo = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0xff8a2a, emissive: 0xff5a1a, emissiveIntensity: 1 }));
  fogo.position.y = 13.9; g.add(fogo);
  return { grupo: g, colisores: [{ minX: x - 2.4, maxX: x + 2.4, minZ: z - 2.4, maxZ: z + 2.4 }] };
}

// --- CEMITÉRIO abandonado (lápides, cruzes, cova aberta; clima Tibia) ---
export function criaCemiterio(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x7d786e, 1), pedraEsc = mat(0x5a564e, 1), terra = mat(0x3e3228, 1);
  const chao = new THREE.Mesh(new THREE.BoxGeometry(26, 0.12, 20), mat(0x4e5743, 1));
  chao.position.y = 0.05; chao.receiveShadow = true; g.add(chao);
  const colisores = [];
  // muretas (3 lados; entrada ao sul)
  [[0, -10, 26, 0.6], [-13, 0, 0.6, 20], [13, 0, 0.6, 20]].forEach(([cx, cz, w, d]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), pedraEsc);
    m.position.set(cx, 0.55, cz); m.castShadow = true; g.add(m);
    colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  });
  // portão de entrada (2 pilares + arco)
  [[-2.2, 10], [2.2, 10]].forEach(([px, pz]) => { const pil = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 0.8), pedra); pil.position.set(px, 1.3, pz); pil.castShadow = true; g.add(pil); });
  const arco = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 0.6), pedraEsc); arco.position.set(0, 2.8, 10); g.add(arco);
  // lápides em fileiras (mistura pedra/cruz, algumas tortas)
  for (let fx = -10; fx <= 10; fx += 4) for (let fz = -7; fz <= 5; fz += 4) {
    if (Math.abs(fx) < 3 && fz > 3) continue; // corredor da entrada
    const tipo = Math.random();
    if (tipo < 0.5) {
      const lap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.22), pedra);
      lap.position.set(fx, 0.65, fz); lap.rotation.z = (Math.random() - 0.5) * 0.18; lap.castShadow = true; g.add(lap);
      const topoL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 10, 1, false, 0, Math.PI), pedra);
      topoL.rotation.z = Math.PI / 2; topoL.rotation.y = Math.PI / 2; topoL.position.set(fx, 1.3, fz); g.add(topoL);
    } else {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 0.18), pedra); v.position.set(fx, 0.7, fz); v.rotation.z = (Math.random() - 0.5) * 0.2; g.add(v);
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.18), pedra); h.position.set(fx, 1.0, fz); h.rotation.z = v.rotation.z; g.add(h);
    }
    const monte = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 2.0), terra); monte.position.set(fx, 0.12, fz + 1.2); g.add(monte);
  }
  // cova aberta (de onde os esqueletos saem...)
  const cova = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 2.2), mat(0x0a0806, 1)); cova.position.set(7, 0.12, 6); g.add(cova);
  return { grupo: g, colisores };
}

// --- PÂNTANO (poças verdes, névoa de juncos, troncos podres) ---
export function criaPantano(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const lama = new THREE.MeshStandardMaterial({ color: 0x4a5a30, roughness: 0.4, metalness: 0.15, transparent: true, opacity: 0.9 });
  const chao = new THREE.Mesh(new THREE.CircleGeometry(22, 24), mat(0x55603e, 1));
  chao.rotation.x = -Math.PI / 2; chao.position.y = 0.04; chao.receiveShadow = true; g.add(chao);
  [[0, 0, 8], [-10, 6, 5], [9, -7, 6], [-6, -10, 4], [11, 8, 4.5]].forEach(([px, pz, r]) => {
    const poca = new THREE.Mesh(new THREE.CircleGeometry(r, 18), lama);
    poca.rotation.x = -Math.PI / 2; poca.position.set(px, 0.1, pz); g.add(poca);
  });
  // troncos podres atravessados
  [[-4, 3, 0.7], [6, 6, -0.4], [2, -9, 1.2]].forEach(([px, pz, rot]) => {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 3.6, 7), mat(0x4a3a26, 1));
    tr.position.set(px, 0.3, pz); tr.rotation.set(Math.PI / 2, 0, rot); tr.castShadow = true; g.add(tr);
  });
  return { grupo: g, colisores: [] };
}

// --- FAZENDA: plantação em fileiras + espantalho + cerca (vida rural no caminho) ---
export function criaFazenda(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const colisores = [];
  const terraM = mat(0x4a3526, 1), trigoM = mat(0xd8b04a, 1), mad = mat(0x6e4a2a);
  // 5 fileiras de trigo (canteiro de terra + tufos dourados)
  for (let i = 0; i < 5; i++) {
    const fz = -8 + i * 4;
    const leira = new THREE.Mesh(new THREE.BoxGeometry(18, 0.25, 1.6), terraM);
    leira.position.set(0, 0.12, fz); leira.receiveShadow = true; g.add(leira);
    for (let k = -8; k <= 8; k += 2) {
      const tufo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.9 + Math.random() * 0.4, 5), trigoM);
      tufo.position.set(k, 0.65, fz); g.add(tufo);
    }
  }
  // cerca de madeira em volta (com porteira ao sul)
  function cerca(cx, cz, w, d) {
    const trave = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, 0.14), 0.14, Math.max(d, 0.14)), mad);
    trave.position.set(cx, 0.85, cz); g.add(trave);
    const trave2 = trave.clone(); trave2.position.y = 0.45; g.add(trave2);
    colisores.push({ minX: x + cx - w / 2 - 0.1, maxX: x + cx + w / 2 + 0.1, minZ: z + cz - d / 2 - 0.1, maxZ: z + cz + d / 2 + 0.1 });
  }
  cerca(0, -11, 21, 0.1); cerca(-10.5, 0, 0.1, 22); cerca(10.5, 0, 0.1, 22);
  cerca(-7, 11, 7, 0.1); cerca(7, 11, 7, 0.1); // vão da porteira no meio
  for (let px = -10.5; px <= 10.5; px += 3.5) [[px, -11], [px, 11]].forEach(([cx, cz]) => {
    if (cz > 0 && Math.abs(cx) < 3) return;
    const poste = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), mad); poste.position.set(cx, 0.55, cz); g.add(poste);
  });
  // ESPANTALHO (braços abertos, chapéu de palha, corvo no ombro)
  const esp = new THREE.Group(); esp.position.set(0, 0, 0);
  const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.6, 6), mad); mastro.position.y = 1.3; esp.add(mastro);
  const bracos = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 6), mad); bracos.rotation.z = Math.PI / 2; bracos.position.y = 1.9; esp.add(bracos);
  const camisa = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), mat(0x8a4632)); camisa.position.y = 1.6; esp.add(camisa);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), trigoM); cab.position.y = 2.45; esp.add(cab);
  const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.07, 10), mat(0xc8a24e, 1)); aba.position.y = 2.66; esp.add(aba);
  const copa = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 10), mat(0xc8a24e, 1)); copa.position.y = 2.88; esp.add(copa);
  const corvo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat(0x14141a)); corvo.position.set(0.8, 2.05, 0); corvo.scale.z = 1.5; esp.add(corvo);
  g.add(esp);
  colisores.push({ minX: x - 0.4, maxX: x + 0.4, minZ: z - 0.4, maxZ: z + 0.4 });
  return { grupo: g, colisores };
}

// --- MARCO DE DISTÂNCIA (pedra de légua com a metragem; estilo estrada real) ---
export function criaMarcoDistancia(x, z, texto) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const cnv = document.createElement('canvas'); cnv.width = 128; cnv.height = 128;
  const c = cnv.getContext('2d');
  c.fillStyle = '#8a8276'; c.fillRect(0, 0, 128, 128);
  c.fillStyle = '#2e2a24'; c.font = 'bold 26px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  texto.split('\n').forEach((l, i) => c.fillText(l, 64, 48 + i * 30));
  const pedra = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.5),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnv), roughness: 1 }));
  pedra.position.y = 0.6; pedra.rotation.z = (Math.random() - 0.5) * 0.08; pedra.castShadow = true; g.add(pedra);
  const baseM = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.7), mat(0x6a6258, 1));
  baseM.position.y = 0.12; g.add(baseM);
  return { grupo: g, colisores: [{ minX: x - 0.6, maxX: x + 0.6, minZ: z - 0.4, maxZ: z + 0.4 }] };
}

// --- árvore morta/carbonizada (cenário das terras do dragão) ---
export function criaArvoreMorta(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const m = mat(0x2a241e);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.6, 6), m);
  tronco.position.y = 1.8; tronco.castShadow = true; g.add(tronco);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 1.6, 5), m);
    gal.position.set(Math.cos(a) * 0.5, 2.9, Math.sin(a) * 0.5);
    gal.rotation.set(Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6 + (i % 2 ? 0.8 : -0.8)); g.add(gal);
  }
  return { grupo: g, colisores: [{ minX: x - 0.6, maxX: x + 0.6, minZ: z - 0.6, maxZ: z + 0.6 }] };
}

// --- ruínas antigas (colunas quebradas + arco; clima D&D, andável entre elas) ---
export function criaRuinas(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x8a8276, 1), pedraEsc = mat(0x6a6258, 1);
  const base = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 14), pedraEsc); base.position.y = 0.15; base.receiveShadow = true; g.add(base);
  const colisores = [];
  [[-5, -5, 4.5], [5, -5, 3.0], [-5, 5, 2.0], [5, 5, 4.0], [0, -5, 3.6], [-5, 0, 1.2]].forEach(([cx, cz, h]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, h, 10), pedra);
    c.position.set(cx, h / 2, cz); c.castShadow = true; g.add(c);
    if (h > 3) { const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), pedra); cap.position.set(cx, h + 0.2, cz); g.add(cap); }
    colisores.push({ minX: x + cx - 0.6, maxX: x + cx + 0.6, minZ: z + cz - 0.6, maxZ: z + cz + 0.6 });
  });
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + Math.random() * 0.6, 0), pedraEsc); b.position.set((Math.random() - 0.5) * 12, 0.5, (Math.random() - 0.5) * 12); b.rotation.set(Math.random(), Math.random(), Math.random()); g.add(b); }
  const arcoL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 0.6), pedra); arcoL.position.set(-2, 2, 5.5); arcoL.castShadow = true; g.add(arcoL);
  const arcoR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3, 0.6), pedra); arcoR.position.set(2, 1.5, 5.5); g.add(arcoR);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.6, 0.6), pedra); lintel.position.set(-0.3, 3.7, 5.5); lintel.rotation.z = -0.25; g.add(lintel);
  return { grupo: g, colisores };
}

// --- COVIL DO DRAGÃO: vulcão escuro com cratera de lava, caverna e tesouro ---
export function criaCovilDragao(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const rocha = mat(0x3a322e, 1), rochaEsc = mat(0x241e1a, 1);
  const lavaMat = new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0xff3a00, emissiveIntensity: 0.9, roughness: 0.6 });
  const ouroMat = new THREE.MeshStandardMaterial({ color: 0xe8c020, metalness: 0.75, roughness: 0.32, emissive: 0x4a3a00, emissiveIntensity: 0.25 });
  const h = 46, r = 28;
  const mont = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), rocha);
  mont.position.y = h / 2; mont.rotation.y = Math.random(); mont.castShadow = mont.receiveShadow = true; g.add(mont);
  // cratera de lava no topo (pulsa)
  const crat = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 3, 12), lavaMat); crat.position.y = h - 1.4; g.add(crat);
  // veios de lava escorrendo pela encosta
  [0.7, 2.0, 4.3].forEach((a) => { const veio = new THREE.Mesh(new THREE.BoxGeometry(0.8, h * 0.7, 0.4), lavaMat); veio.position.set(Math.cos(a) * r * 0.5, h * 0.42, Math.sin(a) * r * 0.5); veio.lookAt(0, h, 0); g.add(veio); });
  // boca da caverna (arco escuro virado p/ -Z) + buraco preto
  const arco = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 3), rochaEsc); arco.position.set(0, 3.5, -r * 0.82); arco.castShadow = true; g.add(arco);
  const buraco = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 1), mat(0x050505, 1)); buraco.position.set(0, 2.8, -r * 0.82 - 1.3); g.add(buraco);
  // poça de lava na frente da caverna
  const poca = new THREE.Mesh(new THREE.CircleGeometry(6.5, 22), lavaMat); poca.rotation.x = -Math.PI / 2; poca.position.set(0, 0.1, -r * 0.82 - 9); g.add(poca);
  // TESOURO do dragão (pilha de ouro + moedas + gemas) na boca da caverna
  const tz = -r * 0.82 + 2;
  const pilha = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.1, 14), ouroMat); pilha.position.set(0, 0.55, tz); g.add(pilha);
  for (let i = 0; i < 16; i++) { const a = Math.random() * Math.PI * 2, rr = 1 + Math.random() * 2.6; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), ouroMat); c.position.set(Math.cos(a) * rr, 0.06, tz + Math.sin(a) * rr); c.rotation.x = Math.random(); g.add(c); }
  [[0x6fe6ff, -1.2, 0.4], [0xff5d8f, 1.0, -0.5], [0x7affa0, 0.2, 1.0]].forEach(([cor, ox, oz]) => { const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.4, roughness: 0.2 })); gema.position.set(ox, 0.5, tz + oz); g.add(gema); });
  // pedregulhos ao redor
  for (let i = 0; i < 7; i++) { const a = Math.random() * Math.PI * 2, rr = r * 0.7; const b = new THREE.Mesh(new THREE.IcosahedronGeometry(2 + Math.random() * 2, 0), rochaEsc); b.position.set(Math.cos(a) * rr, 1, Math.sin(a) * rr); b.rotation.set(Math.random(), Math.random(), Math.random()); b.castShadow = true; g.add(b); }
  const c = r * 0.6;
  return {
    grupo: g, colisores: [{ minX: x - c, maxX: x + c, minZ: z - c, maxZ: z + c }],
    animados: [{ mesh: crat, pulsa: lavaMat, fase: 0 }],
    interativo: { x, z: z + tz, raio: 4.5, titulo: '🐉 Tesouro do Dragão', acao: 'Examinar o tesouro 🐉', msg: 'Ouro a perder de vista... e o dragão sente sua presença. Lute ou fuja!' },
  };
}

// --- COQUEIRO (praia): tronco curvado, folhas longas e cocos ---
export function criaCoqueiro(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const casca = mat(0x8a7048), folha = mat(0x3f8a3e);
  const curva = (Math.random() - 0.5) * 1.6; // cada coqueiro pende pra um lado
  let px = 0;
  for (let i = 0; i < 6; i++) { // tronco em segmentos (curva suave)
    const seg = new THREE.Mesh(new THREE.CylinderGeometry((0.22 - i * 0.02) * s, (0.26 - i * 0.02) * s, 1.5 * s, 7), casca);
    px += curva * (i / 6) * 0.35 * s;
    seg.position.set(px, (0.7 + i * 1.4) * s, 0);
    seg.rotation.z = -curva * 0.12; seg.castShadow = true; g.add(seg);
  }
  const topoY = 9.2 * s, topoX = px;
  for (let i = 0; i < 7; i++) { // folhas longas caídas em leque
    const a = (i / 7) * Math.PI * 2;
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.5 * s, 0.06, 3.2 * s), folha);
    f.position.set(topoX + Math.cos(a) * 1.3 * s, topoY, Math.sin(a) * 1.3 * s);
    f.rotation.y = -a + Math.PI / 2; f.rotation.x = 0.45; f.castShadow = true; g.add(f);
  }
  for (let i = 0; i < 3; i++) { // cocos
    const a = i * 2.1;
    const coco = new THREE.Mesh(new THREE.SphereGeometry(0.22 * s, 8, 8), mat(0x5a4226));
    coco.position.set(topoX + Math.cos(a) * 0.4 * s, topoY - 0.35 * s, Math.sin(a) * 0.4 * s); g.add(coco);
  }
  return { grupo: g, colisores: [{ minX: x - 0.5, maxX: x + 0.5, minZ: z - 0.5, maxZ: z + 0.5 }] };
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

// --- CACHOEIRA (estilo pack premium): penhasco facetado + véu d'água + espuma ---
export function criaCachoeira(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  [[0, 3.2, 0.6, 4.6], [-2.8, 2.2, 1.2, 3.1], [2.8, 2.2, 1.2, 3.1]].forEach(([ox, oy, oz, s2]) => {
    const r = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(s2, 0), s2 * 0.3), matFlat(0x6e6a62));
    r.position.set(ox, oy, oz); r.castShadow = r.receiveShadow = true; g.add(r);
  });
  const aguaV = new THREE.MeshStandardMaterial({ color: 0x9fd4ec, roughness: 0.12, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const veu = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 6.6), aguaV);
  veu.position.set(0, 3.1, -2.5); veu.rotation.x = -0.08; g.add(veu);
  const veu2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 5.4), aguaV);
  veu2.position.set(-1.6, 2.6, -2.3); g.add(veu2);
  const espumaMat = new THREE.MeshStandardMaterial({ color: 0xeef6fa, transparent: true, opacity: 0.8, roughness: 0.4 });
  const animados = [];
  for (let i = 0; i < 6; i++) { // borbulhas na base (sobem e descem)
    const e = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(0.4 + Math.random() * 0.3, 0), 0.12), espumaMat);
    e.position.set(-1.6 + i * 0.65, 0.22, -2.9 - Math.random() * 0.9);
    g.add(e); animados.push({ mesh: e, flutua: true, baseY: 0.22, fase: Math.random() * 6 });
  }
  return { grupo: g, colisores: [{ minX: x - 3.4, maxX: x + 3.4, minZ: z - 1.2, maxZ: z + 2.6 }], animados };
}

// --- CRÂNIO DE DRAGÃO (RV3.0) — marco-troféu nas terras selvagens:
// uma ossada GIGANTE meio enterrada conta a história do mundo ---
export function criaCranioDragao(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const osso = matFlat(0xe8e0cc, 0.6), ossoEsc = matFlat(0xcfc4a8, 0.7);
  // calota do crânio (icosaedro orgânico achatado)
  const calota = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(2.6, 1), 0.5), osso);
  calota.scale.set(1.15, 0.85, 1.35); calota.position.set(0, 2.0, 0); calota.rotation.y = 0.3;
  calota.castShadow = calota.receiveShadow = true; g.add(calota);
  // focinho/maxila
  const focinho = new THREE.Mesh(desloca(new THREE.BoxGeometry(2.2, 1.3, 2.8), 0.3), osso);
  focinho.position.set(0, 1.45, 2.6); focinho.castShadow = true; g.add(focinho);
  // mandíbula caída no chão (entreaberta)
  const mandibula = new THREE.Mesh(desloca(new THREE.BoxGeometry(1.9, 0.55, 3.0), 0.25), ossoEsc);
  mandibula.position.set(0.2, 0.35, 2.9); mandibula.rotation.x = 0.18; mandibula.receiveShadow = true; g.add(mandibula);
  // órbitas vazias (escuras)
  [-0.95, 0.95].forEach((ox) => {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 10), mat(0x14110c, 1));
    orb.position.set(ox, 2.1, 1.3); g.add(orb);
  });
  // presas na maxila + chifres curvados pra trás
  [-0.8, -0.3, 0.3, 0.8].forEach((ox) => {
    const presa = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.7, 6), osso);
    presa.position.set(ox, 0.85, 3.6); presa.rotation.x = Math.PI; g.add(presa);
  });
  [-1, 1].forEach((s) => {
    const chifre = new THREE.Mesh(new THREE.ConeGeometry(0.3, 2.2, 7), ossoEsc);
    chifre.position.set(s * 1.9, 3.0, -0.8); chifre.rotation.z = s * 0.9; chifre.rotation.x = -0.5;
    chifre.castShadow = true; g.add(chifre);
  });
  // costelas gigantes meio enterradas atrás (a espinha segue pro horizonte)
  for (let i = 0; i < 4; i++) {
    const costela = new THREE.Mesh(new THREE.TorusGeometry(2.2 - i * 0.25, 0.16, 6, 14, Math.PI), ossoEsc);
    costela.position.set(0, 0.2, -3.4 - i * 1.5); costela.castShadow = true; g.add(costela);
  }
  return { grupo: g, colisores: [{ minX: x - 2.6, maxX: x + 2.6, minZ: z - 1.8, maxZ: z + 3.4 }] };
}

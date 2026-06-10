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

// --- montanha (emoldura o mundo; bloqueia passagem) ---
export function criaMontanha(x, z, esc = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const rocha = mat(0x6e6a62, 1), rochaEsc = mat(0x54514a, 1), neve = mat(0xeef2f5, 1);
  const h = 26 * esc, r = 17 * esc;
  const base = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), rocha);
  base.position.y = h / 2; base.castShadow = true; base.receiveShadow = true; g.add(base);
  [[-r * 0.5, -r * 0.3, 0.6], [r * 0.55, r * 0.2, 0.7]].forEach(([ox, oz, s]) => {
    const p = new THREE.Mesh(new THREE.ConeGeometry(r * s, h * s, 6), rochaEsc);
    p.position.set(ox, h * s / 2, oz); p.castShadow = true; g.add(p);
  });
  const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.4, h * 0.22, 7), neve);
  cap.position.y = h * 0.9; g.add(cap);
  const c = r * 0.62;
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

// --- cidade distante (fachada com muralha + portão; ainda não entra) ---
export function criaCidadeDistante(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x9a8e7a, 1), telha = mat(0x7a3a2a, 1);
  const muro = new THREE.Mesh(new THREE.BoxGeometry(42, 9, 2), pedra);
  muro.position.set(0, 4.5, 0); muro.castShadow = true; g.add(muro);
  for (let i = -19; i <= 19; i += 3) {
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 2.2), pedra);
    a.position.set(i, 9.5, 0); g.add(a);
  }
  const portao = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 2.2), mat(0x3a2a1a));
  portao.position.set(0, 3, 0.1); g.add(portao);
  [-21, 21].forEach((tx) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 14, 10), pedra);
    t.position.set(tx, 7, 0); t.castShadow = true; g.add(t);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.7, 4, 10), telha);
    cone.position.set(tx, 16, 0); g.add(cone);
  });
  for (let i = 0; i < 9; i++) {
    const bx = (Math.random() - 0.5) * 34, bz = 5 + Math.random() * 18, alt = 4 + Math.random() * 5;
    const casa = new THREE.Mesh(new THREE.BoxGeometry(4, alt, 4), pedra);
    casa.position.set(bx, alt / 2, bz); casa.castShadow = true; g.add(casa);
    const tel = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.4, 4), telha);
    tel.position.set(bx, alt + 1.2, bz); tel.rotation.y = Math.PI / 4; g.add(tel);
  }
  return { grupo: g, colisores: [{ minX: x - 23, maxX: x + 23, minZ: z - 1.5, maxZ: z + 9 }] };
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

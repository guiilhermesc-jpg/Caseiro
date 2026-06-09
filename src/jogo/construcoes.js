// =============================================================
//  CONSTRUÇÕES MODULARES  ·  peças reutilizáveis (economia!).
//  Proporções pensadas para o avatar (~3 unidades de altura).
//  Cada função devolve { grupo, colisores:[{minX,maxX,minZ,maxZ}] }.
// =============================================================
import * as THREE from 'three';

const matCache = {};
export function mat(cor, rough = 0.9) {
  const k = cor + '_' + rough;
  if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color: cor, roughness: rough });
  return matCache[k];
}

// prédio de vilarejo: corpo + telhado piramidal + porta (cabe o avatar) + janelas
export function criaPredio(opts) {
  const {
    x = 0, z = 0, larg = 9, prof = 9, alt = 7,
    cor = 0xcab79a, corTelhado = 0x884b2a, rot = 0, janelas = true,
  } = opts;
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;

  const corpo = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, prof), mat(cor));
  corpo.position.y = alt / 2; corpo.castShadow = true; corpo.receiveShadow = true; g.add(corpo);

  const telhado = new THREE.Mesh(new THREE.ConeGeometry(Math.max(larg, prof) * 0.82, alt * 0.5, 4), mat(corTelhado));
  telhado.position.y = alt + alt * 0.25; telhado.rotation.y = Math.PI / 4; telhado.castShadow = true; g.add(telhado);

  // porta proporcional ao avatar (~3,2 de altura)
  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.2, 0.25), mat(0x3a2a1a));
  porta.position.set(0, 1.6, prof / 2 + 0.02); g.add(porta);

  if (janelas) {
    const jmat = mat(0x9fd0e0, 0.4);
    [-larg * 0.3, larg * 0.3].forEach((jx) => {
      const j = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.2), jmat);
      j.position.set(jx, alt * 0.62, prof / 2 + 0.02); g.add(j);
    });
  }

  const girado = Math.abs(Math.sin(rot)) > 0.5;
  const wA = girado ? prof : larg, dA = girado ? larg : prof;
  const colisores = [{ minX: x - wA / 2, maxX: x + wA / 2, minZ: z - dA / 2, maxZ: z + dA / 2 }];
  return { grupo: g, colisores };
}

// marcos (variações + adereços) — alturas mais imponentes
export function criaMarco(tipo, opts) {
  const base = { x: 0, z: 0, rot: 0, ...opts };
  let res;
  if (tipo === 'igreja') {
    res = criaPredio({ ...base, larg: 14, prof: 20, alt: 12, cor: 0xddd6c4, corTelhado: 0x6a4a8a });
    const torre = new THREE.Mesh(new THREE.BoxGeometry(4, 24, 4), mat(0xddd6c4));
    torre.position.set(-5, 12, -8); torre.castShadow = true; res.grupo.add(torre);
    const topo = new THREE.Mesh(new THREE.ConeGeometry(3.4, 5, 4), mat(0x6a4a8a));
    topo.position.set(-5, 26.5, -8); topo.rotation.y = Math.PI / 4; res.grupo.add(topo);
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 0.35), mat(0xf0e8c0)); cv.position.set(-5, 31, -8);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.35), mat(0xf0e8c0)); ch.position.set(-5, 31.4, -8);
    res.grupo.add(cv, ch);
  } else if (tipo === 'hospital') {
    res = criaPredio({ ...base, larg: 16, prof: 13, alt: 10, cor: 0xeef0f2, corTelhado: 0xb0b6bc });
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.2, 0.2), mat(0xd83a3a)); cv.position.set(0, 6.2, 13 / 2 + 0.03);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.2), mat(0xd83a3a)); ch.position.set(0, 6.2, 13 / 2 + 0.03);
    res.grupo.add(cv, ch);
  } else if (tipo === 'delegacia') {
    res = criaPredio({ ...base, larg: 13, prof: 11, alt: 8, cor: 0x8a98a8, corTelhado: 0x3a4656 });
  } else if (tipo === 'escola') {
    res = criaPredio({ ...base, larg: 22, prof: 12, alt: 7, cor: 0xc88a5a, corTelhado: 0x7a3a2a });
  } else {
    res = criaPredio(base);
  }
  return res;
}

// ---- plantas (modelos reutilizáveis) ----
export function criaArvore(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 3, 6), mat(0x6b4a2a));
  tronco.position.y = 1.5; tronco.castShadow = true; g.add(tronco);
  const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(2.3, 0), mat(0x4a7a3a));
  copa.position.y = 4.4; copa.castShadow = true; g.add(copa);
  return { grupo: g, colisores: [{ minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.7, maxZ: z + 0.7 }] };
}

export function criaPinheiro(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 6), mat(0x5a3f24));
  tronco.position.y = 1; tronco.castShadow = true; g.add(tronco);
  const corFolha = 0x36622f;
  [[2.6, 2.4, 2.8], [2.0, 2.2, 4.4], [1.4, 2.0, 5.8]].forEach(([r, h, y]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat(corFolha));
    c.position.y = y; c.castShadow = true; g.add(c);
  });
  return { grupo: g, colisores: [{ minX: x - 0.6, maxX: x + 0.6, minZ: z - 0.6, maxZ: z + 0.6 }] };
}

export function criaArbusto(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const b1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 0), mat(0x4f7e3e));
  b1.position.y = 0.9; b1.castShadow = true; g.add(b1);
  const b2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), mat(0x568a44));
  b2.position.set(0.7, 0.7, 0.3); b2.castShadow = true; g.add(b2);
  return { grupo: g, colisores: [] }; // arbusto não bloqueia (decorativo)
}

// fonte central com água animável (a mesh da água vai em userData)
export function criaFonte(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.4, 1.2, 16), mat(0x9a9488));
  base.position.y = 0.6; base.castShadow = true; base.receiveShadow = true; g.add(base);

  const aguaMat = new THREE.MeshStandardMaterial({ color: 0x3f8fd0, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.8 });
  const agua = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.4, 16), aguaMat);
  agua.position.y = 1.15; agua.userData.baseY = 1.15; agua.userData.fase = Math.random() * 6.28; g.add(agua);

  const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 2.4, 8), mat(0x9a9488));
  pilar.position.y = 2; g.add(pilar);
  const jato = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), aguaMat);
  jato.position.y = 3.2; g.add(jato);

  return { grupo: g, colisores: [{ minX: x - 3.4, maxX: x + 3.4, minZ: z - 3.4, maxZ: z + 3.4 }], agua };
}

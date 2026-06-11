// =============================================================
//  ESGOTO  ·  subsolo (y = -40) sob a cidade, ESCURO (precisa de tocha).
//  Rede de TÚNEIS em grade, um sob cada rua de Venore: blocos maciços
//  entre as ruas deixam corredores; câmara central aberta (boss/ratos).
//  Várias escadas de acesso (cada uma volta a um bueiro na superfície).
//  Devolve { grupo, colisores, bounds, salaBounds, corredores, acessos }.
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

const Y = -40;

export function criaEsgoto() {
  const g = new THREE.Group();
  const E = 52, alt = 5, t = 0.8;          // extensão, pé-direito, espessura de parede
  const pedra = mat(0x3f443f, 1), pedraEsc = mat(0x2a2e28, 1);

  // piso + teto cobrindo todo o subsolo
  const piso = new THREE.Mesh(new THREE.BoxGeometry(E * 2, 0.4, E * 2), pedra);
  piso.position.set(0, Y - 0.2, 0); piso.receiveShadow = true; g.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(E * 2, 0.4, E * 2), pedraEsc);
  teto.position.set(0, Y + alt, 0); g.add(teto);

  const colisores = [];
  function bloco(cx, cz, w, d, m = pedra) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), m);
    mesh.position.set(cx, Y + alt / 2, cz); mesh.receiveShadow = true; g.add(mesh);
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }

  // 8 BLOCOS maciços entre as ruas (±16/±48) → TÚNEIS sob cada rua, em grade.
  // câmara central (0,0) fica ABERTA (junção em cruz + sala do boss).
  const centros = [-32, 0, 32];
  for (const bx of centros) for (const bz of centros) {
    if (bx === 0 && bz === 0) continue;
    bloco(bx, bz, 24, 24);
  }
  // paredes perimetrais fechando as pontas dos corredores
  bloco(0, -E, E * 2, t); bloco(0, E, E * 2, t);
  bloco(-E, 0, t, E * 2); bloco(E, 0, t, E * 2);

  // canais de água escorrendo pelos corredores (z=16 e x=-16) + poça central
  const aguaMat = new THREE.MeshStandardMaterial({ color: 0x2f4a2f, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 });
  const canalA = new THREE.Mesh(new THREE.BoxGeometry(E * 2 - 2, 0.08, 2.4), aguaMat); canalA.position.set(0, Y + 0.05, 16); g.add(canalA);
  const canalB = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, E * 2 - 2), aguaMat); canalB.position.set(-16, Y + 0.05, 0); g.add(canalB);
  const poca = new THREE.Mesh(new THREE.BoxGeometry(16, 0.08, 16), aguaMat); poca.position.set(0, Y + 0.04, 0); g.add(poca);

  // colunas ladeando a câmara central
  for (const cx of [-10, 10]) for (const cz of [-10, 10]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, alt, 8), pedraEsc);
    col.position.set(cx, Y + alt / 2, cz); col.castShadow = true; g.add(col);
    colisores.push({ minX: cx - 0.6, maxX: cx + 0.6, minZ: cz - 0.6, maxZ: cz + 0.6 });
  }

  // ACESSOS (escadas) em cruzamentos de túnel — voltam à superfície (bueiros).
  // Os 2 últimos sobem nos bueiros de THAIS (a rede de esgoto liga as cidades!)
  const acessos = [{ x: 16, z: -16 }, { x: -16, z: 16 }, { x: 48, z: 16 }, { x: -48, z: -16 }, { x: 16, z: 16 }, { x: -16, z: -16 }, { x: -48, z: 16 }];
  acessos.forEach((a) => {
    // CORDA pendurada (estilo Tibia: sobe/desce de corda) no lugar da escada
    const esc = new THREE.Group(); esc.position.set(a.x, Y, a.z);
    const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, alt - 0.2, 6), mat(0x9a7a44, 1));
    corda.position.y = (alt - 0.2) / 2; esc.add(corda);
    for (let i = 1; i <= 4; i++) { // nós de apoio pra escalar
      const no = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 6, 10), mat(0x6e5228, 1));
      no.position.y = i * (alt / 5); no.rotation.x = Math.PI / 2; esc.add(no);
    }
    const argola = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 6, 12), mat(0x3a3a3a, 1));
    argola.position.y = alt - 0.12; argola.rotation.x = Math.PI / 2; esc.add(argola); // presa no teto/bueiro
    g.add(esc);
    // CLARIDADE da entrada: feixe de luz do dia descendo pelo bueiro + luz real
    const feixe = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.6, alt, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }));
    feixe.position.set(a.x, Y + alt / 2, a.z); g.add(feixe);
    const luzEntrada = new THREE.PointLight(0xbfd8ff, 1.2, 13, 2);
    luzEntrada.position.set(a.x, Y + alt - 0.6, a.z); g.add(luzEntrada);
  });

  return {
    grupo: g, colisores,
    bounds: { minX: -E, maxX: E, minZ: -E, maxZ: E },     // limite do jogador (grade toda)
    salaBounds: { minX: -12, maxX: 12, minZ: -12, maxZ: 12 }, // câmara central (boss/ratos)
    corredores: [                                          // corredores abertos p/ ratos de patrulha
      { minX: 12, maxX: 20, minZ: -44, maxZ: 44 },         // túnel x=16
      { minX: -20, maxX: -12, minZ: -44, maxZ: 44 },       // túnel x=-16
      { minX: -44, maxX: 44, minZ: 12, maxZ: 20 },         // túnel z=16
    ],
    acessos,
  };
}

// =============================================================
//  CATACUMBAS DE VENORE (RV4.4) · cripta sob a Catedral (y = -40).
//  Salão de tumbas com sarcófagos, pilares, velas acesas e a CÂMARA
//  DO TRONO do Rei Esqueleto no fundo. Uma corda de acesso no leste
//  (sobe pra cripta atrás da Catedral). Mesmo contrato do esgoto:
//  { grupo, colisores, bounds, acessos, saidas }.
// =============================================================
export function criaCatacumbas() {
  const g = new THREE.Group();
  const CX = -330, CZ = -10;            // centro do salão (sob Venore)
  const W = 66, D = 38, alt = 5, t = 0.8;
  const pedra = mat(0x3a3a42, 1), pedraEsc = mat(0x26262e, 1), osso = mat(0xd8d0ba, 0.7);

  // piso + teto
  const piso = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), pedra);
  piso.position.set(CX, -40 - 0.2, CZ); piso.receiveShadow = true; g.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), pedraEsc);
  teto.position.set(CX, -40 + alt, CZ); g.add(teto);

  const colisores = [];
  function bloco(cx, cz, w, d, m = pedra) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), m);
    mesh.position.set(cx, -40 + alt / 2, cz); mesh.receiveShadow = true; g.add(mesh);
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  // paredes perimetrais
  bloco(CX, CZ - D / 2, W, t); bloco(CX, CZ + D / 2, W, t);
  bloco(CX - W / 2, CZ, t, D); bloco(CX + W / 2, CZ, t, D);

  // SARCÓFAGOS em duas alas (tampas entreabertas = clima)
  for (const fila of [-11, 11]) {
    for (let i = 0; i < 4; i++) {
      const sx = CX - 18 + i * 11, sz = CZ + fila;
      const caixa = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.3), pedra);
      caixa.position.set(sx, -40 + 0.5, sz); caixa.castShadow = caixa.receiveShadow = true; g.add(caixa);
      const tampa = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.18, 1.4), pedraEsc);
      tampa.position.set(sx + 0.25, -40 + 1.1, sz); tampa.rotation.z = 0.07; g.add(tampa);
      colisores.push({ minX: sx - 1.4, maxX: sx + 1.4, minZ: sz - 0.8, maxZ: sz + 0.8 });
      // vela acesa em cima (emissiva — pontinhos de vida na escuridão)
      const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.3, 6), mat(0xe8e0d0, 0.6));
      vela.position.set(sx - 0.6, -40 + 1.35, sz); g.add(vela);
      const chama = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffc46a, emissive: 0xff9a2a, emissiveIntensity: 1.0 }));
      chama.position.set(sx - 0.6, -40 + 1.55, sz); g.add(chama);
    }
  }
  // pilares centrais
  for (const px of [CX - 14, CX, CX + 14]) for (const pz of [CZ - 4, CZ + 4]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, alt, 8), pedraEsc);
    col.position.set(px, -40 + alt / 2, pz); col.castShadow = true; g.add(col);
    colisores.push({ minX: px - 0.65, maxX: px + 0.65, minZ: pz - 0.65, maxZ: pz + 0.65 });
  }
  // ossadas espalhadas
  [[-12, -6], [4, 7], [-22, 5], [14, -8], [-2, -13]].forEach(([ox, oz]) => {
    const ossada = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 0.24), osso);
    ossada.position.set(CX + ox, -40 + 0.12, CZ + oz); ossada.rotation.y = Math.random() * 2; g.add(ossada);
  });
  // CÂMARA DO TRONO (oeste): estrado + trono do Rei Esqueleto
  const estrado = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 10), pedraEsc);
  estrado.position.set(CX - 27, -40 + 0.25, CZ); estrado.receiveShadow = true; g.add(estrado);
  const trono = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.0), pedra);
  trono.position.set(CX - 30, -40 + 1.5, CZ); trono.castShadow = true; g.add(trono);
  colisores.push({ minX: CX - 31, maxX: CX - 29, minZ: CZ - 0.8, maxZ: CZ + 0.8 });
  // luzes quentes e fracas (3 — a cripta continua pedindo tocha)
  [[CX - 27, CZ], [CX, CZ - 12], [CX + 18, CZ + 10]].forEach(([lx, lz]) => {
    const luz = new THREE.PointLight(0xffb46a, 0.9, 10, 2);
    luz.position.set(lx, -40 + alt - 1, lz); g.add(luz);
  });

  // ACESSO: corda no leste (mesma do esgoto) — sobe pra cripta da Catedral
  const a = { x: CX + 28, z: CZ };
  const esc = new THREE.Group(); esc.position.set(a.x, -40, a.z);
  const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, alt - 0.2, 6), mat(0x9a7a44, 1));
  corda.position.y = (alt - 0.2) / 2; esc.add(corda);
  for (let i = 1; i <= 4; i++) {
    const no = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 6, 10), mat(0x6e5228, 1));
    no.position.y = i * (alt / 5); no.rotation.x = Math.PI / 2; esc.add(no);
  }
  g.add(esc);
  const luzEntrada = new THREE.PointLight(0xbfd8ff, 1.0, 11, 2);
  luzEntrada.position.set(a.x, -40 + alt - 0.6, a.z); g.add(luzEntrada);

  return {
    grupo: g, colisores,
    bounds: { minX: CX - W / 2 + 1, maxX: CX + W / 2 - 1, minZ: CZ - D / 2 + 1, maxZ: CZ + D / 2 - 1 },
    acessos: [a],
    saidas: [{ x: -398, z: 33 }], // cripta atrás da Catedral
  };
}

// =============================================================
//  CRIPTA PROFUNDA (RV4.7) · o 2º andar das catacumbas (y = -80):
//  o cofre dos reis antigos — monte de ouro, BAÚ ANCESTRAL e dois
//  Esqueletos Ancestrais de guarda. Sobe/desce por corda a partir
//  da câmara do trono. { grupo, colisores, bounds, acessos:[] }.
// =============================================================
export function criaCriptaProfunda() {
  const g = new THREE.Group();
  const CX = -346, CZ = -10, YP = -80;
  const W = 32, D = 24, alt = 4.6, t = 0.8;
  const pedra = mat(0x33333b, 1), pedraEsc = mat(0x202027, 1);

  const piso = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), pedra);
  piso.position.set(CX, YP - 0.2, CZ); piso.receiveShadow = true; g.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), pedraEsc);
  teto.position.set(CX, YP + alt, CZ); g.add(teto);

  const colisores = [];
  function parede(cx, cz, w, d) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), pedra);
    mesh.position.set(cx, YP + alt / 2, cz); mesh.receiveShadow = true; g.add(mesh);
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  parede(CX, CZ - D / 2, W, t); parede(CX, CZ + D / 2, W, t);
  parede(CX - W / 2, CZ, t, D); parede(CX + W / 2, CZ, t, D);
  for (const px of [CX - 9, CX + 3]) for (const pz of [CZ - 6, CZ + 6]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, alt, 8), pedraEsc);
    col.position.set(px, YP + alt / 2, pz); g.add(col);
    colisores.push({ minX: px - 0.6, maxX: px + 0.6, minZ: pz - 0.6, maxZ: pz + 0.6 });
  }
  // O TESOURO DOS REIS: monte de ouro + BAÚ ANCESTRAL no fundo oeste
  const ouroMat = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.65, roughness: 0.35, emissive: 0x4a3404, emissiveIntensity: 0.35 });
  const monte = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.5, 12), ouroMat);
  monte.position.set(CX - 11, YP + 0.75, CZ + 4); monte.castShadow = true; g.add(monte);
  for (let i = 0; i < 8; i++) {
    const moeda = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 8), ouroMat);
    moeda.position.set(CX - 11 + (Math.random() - 0.5) * 5, YP + 0.05, CZ + 4 + (Math.random() - 0.5) * 4);
    moeda.rotation.x = (Math.random() - 0.5) * 0.6; g.add(moeda);
  }
  const bau = new THREE.Group(); bau.position.set(CX - 8, YP, CZ - 4);
  const caixaB = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.0, 1.1), mat(0x5a3a22, 1));
  caixaB.position.y = 0.5; caixaB.castShadow = true; bau.add(caixaB);
  const tampaB = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.35, 1.15), mat(0x4a2f1a, 1));
  tampaB.position.set(0, 1.1, -0.18); tampaB.rotation.x = -0.5; bau.add(tampaB);
  const fecho = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.08), ouroMat);
  fecho.position.set(0, 0.62, 0.58); bau.add(fecho);
  g.add(bau);
  colisores.push({ minX: CX - 9, maxX: CX - 7, minZ: CZ - 4.8, maxZ: CZ - 3.2 });
  // velas + luz baixa dourada (clima de cofre)
  [[CX - 11, CZ + 1], [CX + 6, CZ - 7], [CX + 8, CZ + 7]].forEach(([vx, vz]) => {
    const chama = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffc46a, emissive: 0xff9a2a, emissiveIntensity: 1.0 }));
    chama.position.set(vx, YP + 0.5, vz); g.add(chama);
  });
  const luzOuro = new THREE.PointLight(0xffc46a, 1.1, 12, 2);
  luzOuro.position.set(CX - 10, YP + 2.6, CZ + 2); g.add(luzOuro);
  // corda de volta (canto leste — sobe pra câmara do trono)
  const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, alt - 0.2, 6), mat(0x9a7a44, 1));
  corda.position.set(CX + 12, YP + (alt - 0.2) / 2, CZ); g.add(corda);

  return {
    grupo: g, colisores,
    bounds: { minX: CX - W / 2 + 1, maxX: CX + W / 2 - 1, minZ: CZ - D / 2 + 1, maxZ: CZ + D / 2 - 1 },
    acessos: [], // sobe-se pela CORDA própria (interativo), não pela saída genérica
  };
}

// =============================================================
//  CAVERNAS DO PICO (RV5.8) · a 3ª masmorra (y = -40), cavada POR
//  DENTRO da Montanha do Dragão: rios de LAVA (o calor que choca os
//  ovos lá em cima), cristais que brilham no escuro, estalagmites e
//  trolls das profundezas. Boca de caverna na encosta sul.
//  Mesmo contrato dos subsolos: { grupo, colisores, bounds, acessos,
//  saidas, lavas } (lavas viram CAMPOS que queimam, no main3d).
// =============================================================
export function criaCavernasPico() {
  const g = new THREE.Group();
  const CX = 100, CZ = 290, YC = -40;
  const W = 56, D = 42, alt = 5.5, t = 0.8;
  const rocha = mat(0x3a332e, 1), rochaEsc = mat(0x241f1b, 1);

  const piso = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), rocha);
  piso.position.set(CX, YC - 0.2, CZ); piso.receiveShadow = true; g.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), rochaEsc);
  teto.position.set(CX, YC + alt, CZ); g.add(teto);

  const colisores = [];
  function parede(cx, cz, w, d) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), rocha);
    mesh.position.set(cx, YC + alt / 2, cz); mesh.receiveShadow = true; g.add(mesh);
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  parede(CX, CZ - D / 2, W, t); parede(CX, CZ + D / 2, W, t);
  parede(CX - W / 2, CZ, t, D); parede(CX + W / 2, CZ, t, D);

  // RIOS DE LAVA cruzando a caverna (visual emissivo; o dano vem dos CAMPOS)
  const lavaMat = new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0xff3a00, emissiveIntensity: 1.0, roughness: 0.55 });
  const lavas = [];
  [[CX - 14, CZ + 6, 4.2], [CX + 8, CZ - 9, 3.4], [CX + 18, CZ + 11, 2.8]].forEach(([lx, lz, lr]) => {
    const poca = new THREE.Mesh(new THREE.CircleGeometry(lr, 16), lavaMat);
    poca.rotation.x = -Math.PI / 2; poca.position.set(lx, YC + 0.04, lz); g.add(poca);
    lavas.push({ x: lx, z: lz, r: lr, y: YC });
    const luzL = new THREE.PointLight(0xff6a2a, 1.3, lr * 4.5, 2);
    luzL.position.set(lx, YC + 2.2, lz); g.add(luzL);
  });
  // CRISTAIS do Pico (azuis/roxos, emissivos — os tesouros da montanha)
  [[CX - 22, CZ - 12, 0x6ab0ff], [CX + 2, CZ + 14, 0x9a6aff], [CX + 21, CZ - 4, 0x6ab0ff], [CX - 6, CZ - 16, 0x9a6aff]].forEach(([cx2, cz2, cor]) => {
    const cr = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 6),
      new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.5, roughness: 0.25 }));
    cr.position.set(cx2, YC + 0.9, cz2); cr.rotation.z = (Math.random() - 0.5) * 0.4; g.add(cr);
  });
  // estalagmites (colisores — o caminho serpenteia)
  [[CX - 8, CZ + 1], [CX + 12, CZ + 4], [CX - 18, CZ - 4], [CX + 4, CZ - 13], [CX + 20, CZ - 14]].forEach(([sx, sz]) => {
    const est = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.6, 7), rochaEsc);
    est.position.set(sx, YC + 1.8, sz); est.castShadow = true; g.add(est);
    const estT = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.4, 7), rochaEsc);
    estT.position.set(sx, YC + alt - 1.2, sz); estT.rotation.x = Math.PI; g.add(estT);
    colisores.push({ minX: sx - 0.9, maxX: sx + 0.9, minZ: sz - 0.9, maxZ: sz + 0.9 });
  });
  // corda de acesso (sul — sobe pra boca da caverna na encosta)
  const a = { x: CX - 20, z: CZ + 17 };
  const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, alt - 0.2, 6), mat(0x9a7a44, 1));
  corda.position.set(a.x, YC + (alt - 0.2) / 2, a.z); g.add(corda);
  const luzEntrada = new THREE.PointLight(0xbfd8ff, 1.0, 11, 2);
  luzEntrada.position.set(a.x, YC + alt - 0.6, a.z); g.add(luzEntrada);

  return {
    grupo: g, colisores, lavas,
    bounds: { minX: CX - W / 2 + 1, maxX: CX + W / 2 - 1, minZ: CZ - D / 2 + 1, maxZ: CZ + D / 2 - 1 },
    acessos: [a],
    saidas: [{ x: 60, z: 266 }], // boca da caverna na encosta sul do Pico
  };
}

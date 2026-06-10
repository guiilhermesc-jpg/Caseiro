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
    const esc = new THREE.Group(); esc.position.set(a.x, Y, a.z);
    for (let i = 0; i < 5; i++) {
      const deg = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.6), mat(0x6a6258, 1));
      deg.position.set(0, 0.15 + i * 0.5, -0.8 + i * 0.5); deg.castShadow = true; esc.add(deg);
    }
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

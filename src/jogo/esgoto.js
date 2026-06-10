// =============================================================
//  ESGOTO  ·  subsolo (y = -40) acessado pelo BUEIRO. Sala de pedra
//  com canal de água, colunas e tochas. Lar dos ratos.
//  Devolve { grupo, colisores, bounds, entrada, saida }.
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

const Y = -40;

export function criaEsgoto() {
  const g = new THREE.Group();
  const minX = -14, maxX = 14, minZ = -11, maxZ = 11, alt = 5, t = 0.6;
  const pedra = mat(0x4a4f4a, 1), pedraEsc = mat(0x33372f, 1);

  const piso = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX, 0.4, maxZ - minZ), pedra);
  piso.position.set(0, Y - 0.2, 0); piso.receiveShadow = true; g.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX, 0.4, maxZ - minZ), pedraEsc);
  teto.position.set(0, Y + alt, 0); g.add(teto);

  const agua = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX - 2, 0.1, 3),
    new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.8 }));
  agua.position.set(0, Y + 0.06, 0); g.add(agua);

  const colisores = [];
  function parede(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), pedra);
    m.position.set(cx, Y + alt / 2, cz); g.add(m);
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  parede(0, minZ, maxX - minX, t); parede(0, maxZ, maxX - minX, t);
  parede(minX, 0, t, maxZ - minZ); parede(maxX, 0, t, maxZ - minZ);

  [[-7, -5], [7, -5], [-7, 5], [7, 5]].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, alt, 8), pedraEsc);
    col.position.set(cx, Y + alt / 2, cz); col.castShadow = true; g.add(col);
    colisores.push({ minX: cx - 0.7, maxX: cx + 0.7, minZ: cz - 0.7, maxZ: cz + 0.7 });
  });

  // tochas (luz alaranjada)
  [[-12.5, 0], [12.5, 0]].forEach(([lx, lz]) => {
    const luz = new THREE.PointLight(0xffa84a, 1.4, 24, 2);
    luz.position.set(lx, Y + 3, lz); g.add(luz);
    const cham = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffa84a, emissive: 0xff7a2a, emissiveIntensity: 1 }));
    cham.position.copy(luz.position); g.add(cham);
  });

  // escada de saída (volta à superfície)
  const escada = new THREE.Mesh(new THREE.BoxGeometry(1.4, alt, 0.4), mat(0x6e4a2a));
  escada.position.set(0, Y + alt / 2, maxZ - 0.7); g.add(escada);

  return {
    grupo: g, colisores,
    bounds: { minX, maxX, minZ, maxZ },
    entrada: { x: 0, z: minZ + 2.5 },          // cai longe da escada
    saida: { x: 0, z: maxZ - 0.7, raio: 2.6 },  // escada (volta à superfície)
  };
}

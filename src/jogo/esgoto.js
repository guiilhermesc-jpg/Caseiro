// =============================================================
//  ESGOTO  ·  subsolo (y = -40) sob a cidade, ESCURO (precisa de tocha).
//  Sala grande de pedra com colunas e canais de água. VÁRIAS escadas
//  de acesso (cada uma volta a um bueiro na superfície).
//  Devolve { grupo, colisores, bounds, acessos:[{x,z}] }.
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

const Y = -40;

export function criaEsgoto() {
  const g = new THREE.Group();
  const minX = -30, maxX = 30, minZ = -24, maxZ = 24, alt = 5, t = 0.8;
  const pedra = mat(0x3f443f, 1), pedraEsc = mat(0x2a2e28, 1);

  const piso = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX, 0.4, maxZ - minZ), pedra);
  piso.position.set(0, Y - 0.2, 0); piso.receiveShadow = true; g.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX, 0.4, maxZ - minZ), pedraEsc);
  teto.position.set(0, Y + alt, 0); g.add(teto);

  // canais de água em cruz
  const aguaMat = new THREE.MeshStandardMaterial({ color: 0x2f4a2f, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.85 });
  const canalH = new THREE.Mesh(new THREE.BoxGeometry(maxX - minX - 4, 0.1, 3), aguaMat);
  canalH.position.set(0, Y + 0.06, 0); g.add(canalH);
  const canalV = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, maxZ - minZ - 4), aguaMat);
  canalV.position.set(0, Y + 0.06, 0); g.add(canalV);

  const colisores = [];
  function parede(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), pedra);
    m.position.set(cx, Y + alt / 2, cz); g.add(m);
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  parede(0, minZ, maxX - minX, t); parede(0, maxZ, maxX - minX, t);
  parede(minX, 0, t, maxZ - minZ); parede(maxX, 0, t, maxZ - minZ);

  // grade de colunas
  for (let cx = -18; cx <= 18; cx += 12) for (let cz = -14; cz <= 14; cz += 14) {
    if (Math.abs(cx) < 2 && Math.abs(cz) < 2) continue;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, alt, 8), pedraEsc);
    col.position.set(cx, Y + alt / 2, cz); col.castShadow = true; g.add(col);
    colisores.push({ minX: cx - 0.7, maxX: cx + 0.7, minZ: cz - 0.7, maxZ: cz + 0.7 });
  }

  // VÁRIOS acessos (escadas de pedra com degraus) — voltam à superfície
  const acessos = [{ x: -24, z: -18 }, { x: 24, z: -18 }, { x: -24, z: 18 }, { x: 24, z: 18 }, { x: 0, z: 0 }];
  acessos.forEach((a) => {
    const esc = new THREE.Group(); esc.position.set(a.x, Y, a.z);
    for (let i = 0; i < 5; i++) {
      const deg = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.6), mat(0x6a6258, 1));
      deg.position.set(0, 0.15 + i * 0.5, -0.8 + i * 0.5); deg.castShadow = true; esc.add(deg);
    }
    g.add(esc);
  });

  return { grupo: g, colisores, bounds: { minX, maxX, minZ, maxZ }, acessos };
}

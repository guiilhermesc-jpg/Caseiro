// =============================================================
//  PET  ·  um gatinho blocky que acompanha o avatar.
// =============================================================
import * as THREE from 'three';

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
    const s = Math.sin(tempo * 16) * 0.6;
    u.patas[0].rotation.x = s; u.patas[3].rotation.x = s;
    u.patas[1].rotation.x = -s; u.patas[2].rotation.x = -s;
  } else {
    u.patas.forEach((p) => { p.rotation.x *= 0.8; });
  }
  u.rabo.rotation.y = Math.sin(tempo * 3) * 0.4; // rabo sempre balança
}

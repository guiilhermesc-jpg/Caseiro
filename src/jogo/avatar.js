// =============================================================
//  AVATAR BLOCKY  ·  boneco montado em caixas (estilo Roblox).
//  Fácil de editar: mude cores/tamanhos aqui e pronto.
// =============================================================
import * as THREE from 'three';

// paleta do sobrevivente (civil em zona de guerra)
const COR = {
  pele: 0xd9a066,
  casaco: 0x556b2f,  // verde-militar gasto
  calca: 0x2e3440,
  cabelo: 0x3a2c20,
};

function mat(c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }); }

// membro com pivô no TOPO (pra girar a partir do ombro/quadril)
function membro(larg, alt, material) {
  const geo = new THREE.BoxGeometry(larg, alt, larg);
  geo.translate(0, -alt / 2, 0);
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true;
  return m;
}

export function criaAvatar() {
  const g = new THREE.Group();

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.55), mat(COR.casaco));
  torso.position.y = 1.5; torso.castShadow = true; g.add(torso);

  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), mat(COR.pele));
  cabeca.position.y = 2.52; cabeca.castShadow = true; g.add(cabeca);

  // cabelo (fatia fina no topo)
  const cabelo = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.18, 0.82), mat(COR.cabelo));
  cabelo.position.y = 2.92; cabelo.castShadow = true; g.add(cabelo);

  const bracoEsq = membro(0.32, 1.0, mat(COR.casaco)); bracoEsq.position.set(-0.66, 2.05, 0);
  const bracoDir = membro(0.32, 1.0, mat(COR.casaco)); bracoDir.position.set(0.66, 2.05, 0);
  const pernaEsq = membro(0.36, 0.95, mat(COR.calca)); pernaEsq.position.set(-0.26, 0.9, 0);
  const pernaDir = membro(0.36, 0.95, mat(COR.calca)); pernaDir.position.set(0.26, 0.9, 0);
  g.add(bracoEsq, bracoDir, pernaEsq, pernaDir);

  g.userData.partes = { bracoEsq, bracoDir, pernaEsq, pernaDir };
  return g;
}

// anima a caminhada (balanço de braços/pernas)
export function animaAvatar(avatar, movendo, tempo) {
  const p = avatar.userData.partes;
  if (!p) return;
  if (movendo) {
    const s = Math.sin(tempo * 9) * 0.7;
    p.pernaEsq.rotation.x = s; p.pernaDir.rotation.x = -s;
    p.bracoEsq.rotation.x = -s; p.bracoDir.rotation.x = s;
  } else {
    ['pernaEsq', 'pernaDir', 'bracoEsq', 'bracoDir'].forEach((k) => { p[k].rotation.x *= 0.8; });
  }
}

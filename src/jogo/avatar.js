// =============================================================
//  AVATAR BLOCKY  ·  boneco em caixas (estilo Roblox), com ROSTO.
//  Fácil de editar: mude cores/tamanhos no objeto COR e nas peças.
// =============================================================
import * as THREE from 'three';

const COR = {
  pele: 0xe0b088,
  casaco: 0x556b2f,
  calca: 0x2e3440,
  cabelo: 0x3a2c20,
  bota: 0x241d16,
};

function mat(c, r = 0.85) { return new THREE.MeshStandardMaterial({ color: c, roughness: r }); }

// membro com pivô no TOPO (gira a partir do ombro/quadril)
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

  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.78), mat(COR.pele));
  cabeca.position.y = 2.55; cabeca.castShadow = true; g.add(cabeca);

  const cabelo = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.24, 0.84), mat(COR.cabelo));
  cabelo.position.y = 2.98; cabelo.castShadow = true; g.add(cabelo);

  // --- ROSTO (frente da cabeça, +z local) ---
  const fz = 0.4;
  const branco = mat(0xffffff, 0.4), pupila = mat(0x202020, 0.3);
  [-0.2, 0.2].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), branco);
    olho.position.set(ox, 2.62, fz); g.add(olho);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pupila);
    pup.position.set(ox, 2.62, fz + 0.07); g.add(pup);
    const sob = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.05), mat(COR.cabelo));
    sob.position.set(ox, 2.80, fz + 0.02); g.add(sob);
  });
  const boca = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.05), mat(0x884444));
  boca.position.set(0, 2.34, fz + 0.02); g.add(boca);

  // --- braços + mãos ---
  const bracoEsq = membro(0.3, 0.95, mat(COR.casaco)); bracoEsq.position.set(-0.66, 2.05, 0);
  const bracoDir = membro(0.3, 0.95, mat(COR.casaco)); bracoDir.position.set(0.66, 2.05, 0);
  [bracoEsq, bracoDir].forEach((b) => {
    const mao = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.32), mat(COR.pele));
    mao.position.y = -0.95; mao.castShadow = true; b.add(mao);
  });

  // --- pernas + botas ---
  const pernaEsq = membro(0.34, 0.9, mat(COR.calca)); pernaEsq.position.set(-0.26, 0.9, 0);
  const pernaDir = membro(0.34, 0.9, mat(COR.calca)); pernaDir.position.set(0.26, 0.9, 0);
  [pernaEsq, pernaDir].forEach((p) => {
    const bota = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.22, 0.52), mat(COR.bota));
    bota.position.set(0, -0.9, 0.08); bota.castShadow = true; p.add(bota);
  });

  g.add(bracoEsq, bracoDir, pernaEsq, pernaDir);
  g.userData.partes = { bracoEsq, bracoDir, pernaEsq, pernaDir };
  return g;
}

// anima a caminhada/corrida (balanço de braços e pernas)
export function animaAvatar(avatar, movendo, tempo, correndo = false) {
  const p = avatar.userData.partes;
  if (!p) return;
  if (movendo) {
    const vel = correndo ? 14 : 9;
    const amp = correndo ? 1.0 : 0.7;
    const s = Math.sin(tempo * vel) * amp;
    p.pernaEsq.rotation.x = s; p.pernaDir.rotation.x = -s;
    p.bracoEsq.rotation.x = -s; p.bracoDir.rotation.x = s;
  } else {
    ['pernaEsq', 'pernaDir', 'bracoEsq', 'bracoDir'].forEach((k) => { p[k].rotation.x *= 0.8; });
  }
}

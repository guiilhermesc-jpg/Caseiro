// =============================================================
//  AVATAR  ·  boneco blocky com mais qualidade (rosto/cabelo/mãos/pés),
//  SEXO (homem/mulher) e 4 MODELOS estilo Tibia (outfit no corpo):
//  aldeao · cacador · mago · cavaleiro.
//  cores = { casaco, pele, cabelo, calca?, sexo?, tipo? }.
//  Mantém userData.partes = { bracoEsq, bracoDir, pernaEsq, pernaDir }.
// =============================================================
import * as THREE from 'three';

export const MODELOS = ['aldeao', 'cacador', 'mago', 'cavaleiro'];
export const MODELO_NOME = { aldeao: 'Aldeão', cacador: 'Caçador', mago: 'Mago', cavaleiro: 'Cavaleiro' };

const PADRAO = { pele: 0xe0b088, casaco: 0x556b2f, calca: 0x2e3440, cabelo: 0x3a2c20, bota: 0x241d16 };
function mat(c, r = 0.85) { return new THREE.MeshStandardMaterial({ color: c, roughness: r }); }
function metal(c) { return new THREE.MeshStandardMaterial({ color: c, metalness: 0.7, roughness: 0.35 }); }

function membro(larg, alt, material) {
  const geo = new THREE.BoxGeometry(larg, alt, larg);
  geo.translate(0, -alt / 2, 0);
  const m = new THREE.Mesh(geo, material); m.castShadow = true; return m;
}

export function criaAvatar(cores = {}) {
  const sexo = cores.sexo || 'homem';
  const tipo = MODELOS.includes(cores.tipo) ? cores.tipo : 'aldeao';
  const C = {
    pele: cores.pele ?? PADRAO.pele,
    casaco: cores.casaco ?? PADRAO.casaco,
    calca: cores.calca ?? PADRAO.calca,
    cabelo: cores.cabelo ?? PADRAO.cabelo,
    bota: PADRAO.bota,
  };
  const fem = sexo === 'mulher';
  const g = new THREE.Group();

  // TRONCO (proporção por sexo)
  const torsoW = fem ? 0.82 : 1.0, torsoD = fem ? 0.48 : 0.55;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(torsoW, 1.2, torsoD), mat(C.casaco));
  torso.position.y = 1.5; torso.castShadow = true; g.add(torso);
  if (fem) {
    const cintura = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.32, 0.46), mat(C.casaco));
    cintura.position.y = 0.96; g.add(cintura);
  }

  // PESCOÇO + CABEÇA
  const pescoco = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.32), mat(C.pele));
  pescoco.position.y = 2.2; g.add(pescoco);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.78), mat(C.pele));
  cabeca.position.y = 2.6; cabeca.castShadow = true; g.add(cabeca);

  // ROSTO (olhos + pupila + sobrancelha + nariz + boca)
  const fz = 0.4, branco = mat(0xffffff, 0.4), pupila = mat(0x202020, 0.3);
  [-0.2, 0.2].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), branco); olho.position.set(ox, 2.66, fz); g.add(olho);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), pupila); pup.position.set(ox, 2.66, fz + 0.07); g.add(pup);
    const sob = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.05), mat(C.cabelo)); sob.position.set(ox, 2.83, fz + 0.02); g.add(sob);
  });
  const nariz = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.12), mat(C.pele)); nariz.position.set(0, 2.55, fz + 0.04); g.add(nariz);
  const boca = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.05), mat(0x9a4a4a)); boca.position.set(0, 2.38, fz + 0.02); g.add(boca);

  // CABELO (homem curto / mulher comprido)
  const topo = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.26, 0.86), mat(C.cabelo));
  topo.position.y = 3.04; topo.castShadow = true; g.add(topo);
  if (fem) {
    const costas = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.8, 0.34), mat(C.cabelo)); costas.position.set(0, 2.6, -0.34); g.add(costas);
    [-0.46, 0.46].forEach((ox) => { const lado = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.5), mat(C.cabelo)); lado.position.set(ox, 2.55, 0.04); g.add(lado); });
  } else {
    const franja = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.16, 0.18), mat(C.cabelo)); franja.position.set(0, 2.92, 0.36); g.add(franja);
  }

  // BRAÇOS + mãos
  const bracoW = fem ? 0.26 : 0.3, ombroX = torsoW / 2 + bracoW / 2;
  const bracoEsq = membro(bracoW, 0.95, mat(C.casaco)); bracoEsq.position.set(-ombroX, 2.05, 0);
  const bracoDir = membro(bracoW, 0.95, mat(C.casaco)); bracoDir.position.set(ombroX, 2.05, 0);
  [bracoEsq, bracoDir].forEach((b) => {
    const mao = new THREE.Mesh(new THREE.BoxGeometry(bracoW + 0.04, 0.28, bracoW + 0.06), mat(C.pele));
    mao.position.y = -0.95; mao.castShadow = true; b.add(mao);
  });

  // PERNAS + botas
  const pernaEsq = membro(0.34, 0.9, mat(C.calca)); pernaEsq.position.set(-0.22, 0.9, 0);
  const pernaDir = membro(0.34, 0.9, mat(C.calca)); pernaDir.position.set(0.22, 0.9, 0);
  [pernaEsq, pernaDir].forEach((p) => {
    const bota = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.56), mat(C.bota));
    bota.position.set(0, -0.82, 0.08); bota.castShadow = true; p.add(bota);
    const solado = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.6), mat(0x14100c));
    solado.position.set(0, -0.94, 0.09); p.add(solado);
  });
  g.add(bracoEsq, bracoDir, pernaEsq, pernaDir);

  aplicaOutfit(g, tipo, C);

  g.userData.partes = { bracoEsq, bracoDir, pernaEsq, pernaDir };
  return g;
}

// OUTFIT por modelo — aparece no corpo (Tibia-like)
function aplicaOutfit(g, tipo, C) {
  if (tipo === 'cacador') {
    const capuz = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.5, 0.94), mat(0x415035)); capuz.position.y = 2.96; capuz.castShadow = true; g.add(capuz);
    const bico = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 4), mat(0x415035)); bico.position.set(0, 3.05, -0.32); bico.rotation.x = -0.6; g.add(bico);
    const colete = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.92, 0.62), mat(0x6e4a2a)); colete.position.y = 1.58; g.add(colete);
  } else if (tipo === 'mago') {
    const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.08, 12), mat(0x342a66)); aba.position.y = 3.12; g.add(aba);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.15, 12), mat(0x342a66)); cone.position.y = 3.7; cone.castShadow = true; g.add(cone);
    const manto = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.92, 1.6, 10), mat(C.casaco)); manto.position.y = 0.8; manto.castShadow = true; g.add(manto);
    const gola = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.6), mat(0x342a66)); gola.position.y = 2.05; g.add(gola);
  } else if (tipo === 'cavaleiro') {
    const peito = new THREE.Mesh(new THREE.BoxGeometry(1.14, 1.02, 0.64), metal(0xb8bcc4)); peito.position.y = 1.55; peito.castShadow = true; g.add(peito);
    [-0.66, 0.66].forEach((ox) => { const om = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.62), metal(0xc8ccd4)); om.position.set(ox, 2.04, 0); om.castShadow = true; g.add(om); });
    const elmo = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.92, 0.9), metal(0xb0b4bc)); elmo.position.y = 2.6; elmo.castShadow = true; g.add(elmo);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.05), mat(0x101010)); visor.position.set(0, 2.62, 0.44); g.add(visor);
    const crista = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.5), mat(0xc0202a)); crista.position.set(0, 3.18, 0); g.add(crista);
  }
  // aldeao: base (sem peças extras)
}

export function animaAvatar(avatar, movendo, tempo, correndo = false) {
  const p = avatar.userData.partes;
  if (!p) return;
  if (movendo) {
    const vel = correndo ? 14 : 9, amp = correndo ? 1.0 : 0.7;
    const s = Math.sin(tempo * vel) * amp;
    p.pernaEsq.rotation.x = s; p.pernaDir.rotation.x = -s;
    p.bracoEsq.rotation.x = -s; p.bracoDir.rotation.x = s;
  } else {
    ['pernaEsq', 'pernaDir', 'bracoEsq', 'bracoDir'].forEach((k) => { p[k].rotation.x *= 0.8; });
  }
}

// =============================================================
//  PET  ·  um gatinho blocky que acompanha o avatar.
// =============================================================
import * as THREE from 'three';
import { criaLobo, criaDragao } from './ratos.js';

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

export function criaCachorro() {
  const g = new THREE.Group();
  const cor = 0x8a5a2a, escuro = 0x5a3a1a;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 1.05), m(cor));
  corpo.position.y = 0.56; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.5), m(cor));
  cabeca.position.set(0, 0.72, 0.7); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), m(escuro));
  focinho.position.set(0, 0.64, 0.98); g.add(focinho);
  [-0.2, 0.2].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.06), m(escuro)); // orelha caída
    or.position.set(ox, 0.82, 0.66); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), m(0x201810));
    olho.position.set(ox * 0.7, 0.78, 0.94); g.add(olho);
  });
  const patas = [];
  [[-0.2, 0.38], [0.2, 0.38], [-0.2, -0.38], [0.2, -0.38]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.16, 0.48, 0.16); geo.translate(0, -0.24, 0);
    const pa = new THREE.Mesh(geo, m(escuro)); pa.position.set(px, 0.5, pz); pa.castShadow = true;
    g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.5), m(cor));
  rabo.position.set(0, 0.72, -0.82); rabo.rotation.x = -0.5; g.add(rabo);
  g.userData = { patas, rabo };
  return g;
}

export function criaCoelho() {
  const g = new THREE.Group();
  const cor = 0xeae6df, escuro = 0xc9c2b6;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.6), m(cor));
  corpo.position.y = 0.4; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.36), m(cor));
  cabeca.position.set(0, 0.62, 0.4); cabeca.castShadow = true; g.add(cabeca);
  [-0.1, 0.1].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.08), m(cor)); // orelha longa
    or.position.set(ox, 0.96, 0.36); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), m(0x884444));
    olho.position.set(ox * 1.4, 0.64, 0.56); g.add(olho);
  });
  const patas = [];
  [[-0.13, 0.2], [0.13, 0.2], [-0.13, -0.2], [0.13, -0.2]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.12, 0.3, 0.12); geo.translate(0, -0.15, 0);
    const pa = new THREE.Mesh(geo, m(escuro)); pa.position.set(px, 0.3, pz); pa.castShadow = true;
    g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), m(0xffffff));
  rabo.position.set(0, 0.42, -0.34); g.add(rabo);
  g.userData = { patas, rabo };
  return g;
}

// BURRO (montaria clássica de início, estilo Tibia)
export function criaBurro() {
  const g = new THREE.Group();
  const cor = 0x9a8f85, escuro = 0x6a6058;
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.62, 1.3), m(cor));
  corpo.position.y = 0.95; corpo.castShadow = true; g.add(corpo);
  const pescoco = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 0.4), m(cor));
  pescoco.position.set(0, 1.35, 0.6); pescoco.rotation.x = 0.5; g.add(pescoco);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.66), m(cor));
  cabeca.position.set(0, 1.6, 0.92); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.3), m(escuro));
  focinho.position.set(0, 1.5, 1.26); g.add(focinho);
  [-0.12, 0.12].forEach((ox) => { // orelhas COMPRIDAS de burro
    const or = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.08), m(cor));
    or.position.set(ox, 1.95, 0.82); or.rotation.z = ox > 0 ? -0.2 : 0.2; g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), m(0x201810));
    olho.position.set(ox * 1.3, 1.66, 1.12); g.add(olho);
  });
  const crina = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.5), m(0x4a4038));
  crina.position.set(0, 1.5, 0.55); crina.rotation.x = 0.5; g.add(crina);
  const patas = [];
  [[-0.2, 0.45], [0.2, 0.45], [-0.2, -0.45], [0.2, -0.45]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.16, 0.66, 0.16); geo.translate(0, -0.33, 0);
    const pa = new THREE.Mesh(geo, m(escuro)); pa.position.set(px, 0.66, pz); pa.castShadow = true;
    g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.55, 0.07), m(0x4a4038));
  rabo.position.set(0, 0.95, -0.72); rabo.rotation.x = 0.4; g.add(rabo);
  g.userData = { patas, rabo };
  return g;
}

// fábrica de pets (domar pra ter! lobo = o de ratos.js; dragãozinho = dragão mini)
// CORUJA GIGANTE: montaria rara de vigia/torre. Silhueta grande, asas abertas
// e olhos luminosos para combinar com rotas noturnas.
export function criaCorujaGigante() {
  const g = new THREE.Group();
  const pena = m(0x8a7a62), claro = m(0xd8c9a8), escuro = m(0x3c3328);
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 10), pena);
  corpo.position.y = 1.05; corpo.scale.set(0.85, 1.05, 0.72); corpo.castShadow = true; g.add(corpo);
  const peito = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), claro);
  peito.position.set(0, 0.98, 0.42); peito.scale.set(0.86, 1.05, 0.35); g.add(peito);
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 10), pena);
  cabeca.position.set(0, 1.78, 0.2); cabeca.scale.set(1.05, 0.82, 0.9); cabeca.castShadow = true; g.add(cabeca);
  [-0.28, 0.28].forEach((ox) => {
    const disco = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), claro);
    disco.position.set(ox, 1.8, 0.56); disco.scale.set(1, 1, 0.25); g.add(disco);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf4d15a, emissive: 0xc08010, emissiveIntensity: 0.55 }));
    olho.position.set(ox, 1.82, 0.72); g.add(olho);
    const penacho = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 4), escuro);
    penacho.position.set(ox * 1.35, 2.18, 0.08); penacho.rotation.z = ox > 0 ? -0.35 : 0.35; g.add(penacho);
  });
  const bico = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 4), m(0xd99a32));
  bico.position.set(0, 1.68, 0.82); bico.rotation.x = Math.PI / 2; g.add(bico);
  const asas = [];
  [-1, 1].forEach((s) => {
    const asa = new THREE.Group();
    asa.position.set(s * 0.45, 1.18, 0);
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.95 + i * 0.12), i % 2 ? escuro : pena);
      p.position.set(s * (0.32 + i * 0.22), -i * 0.035, -0.08 - i * 0.03);
      p.rotation.y = s * (0.28 + i * 0.04); p.rotation.z = s * -0.35; p.castShadow = true; asa.add(p);
    }
    g.add(asa); asas.push(asa);
  });
  const patas = [];
  [-0.18, 0.18].forEach((ox) => {
    const pa = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), m(0xd4a04a));
    pa.position.set(ox, 0.45, 0.02); pa.castShadow = true; g.add(pa); patas.push(pa);
  });
  g.userData = { patas, asas, vooBaixo: true };
  return g;
}

// MORCEGO GRANDE: montaria exotica de Noctaria/cinzas, com olhos emissivos.
export function criaMorcegoGrande() {
  const g = new THREE.Group();
  const pele = new THREE.MeshStandardMaterial({ color: 0x22202c, roughness: 0.7 });
  const membrana = new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.85, side: THREE.DoubleSide });
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 8), pele);
  corpo.position.y = 0.96; corpo.scale.set(0.75, 1, 0.65); corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), pele);
  cabeca.position.set(0, 1.42, 0.38); g.add(cabeca);
  [-0.16, 0.16].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshStandardMaterial({ color: 0xb0224a, emissive: 0x8a1030, emissiveIntensity: 0.8 }));
    olho.position.set(ox, 1.44, 0.68); g.add(olho);
    const or = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 4), pele);
    or.position.set(ox * 1.2, 1.72, 0.28); or.rotation.z = ox > 0 ? -0.25 : 0.25; g.add(or);
  });
  const asas = [];
  [-1, 1].forEach((s) => {
    const asa = new THREE.Group();
    asa.position.set(s * 0.36, 1.08, 0.02);
    const osso = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 0.08), pele);
    osso.position.set(s * 0.82, 0.04, 0); osso.rotation.z = s * -0.18; asa.add(osso);
    const membr = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.72), membrana);
    membr.position.set(s * 0.78, -0.16, 0.03); membr.rotation.y = s * 0.28; membr.rotation.z = s * -0.18; asa.add(membr);
    g.add(asa); asas.push(asa);
  });
  const patas = [];
  [-0.16, 0.16].forEach((ox) => {
    const pa = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 0.09), pele);
    pa.position.set(ox, 0.48, -0.1); g.add(pa); patas.push(pa);
  });
  g.userData = { patas, asas, vooBaixo: true };
  return g;
}

// DRAPTOR autoral de Venor: raptor draconico, raro e aspiracional.
export function criaDraptor(lendario = false) {
  const g = new THREE.Group();
  const corpoMat = new THREE.MeshStandardMaterial({
    color: lendario ? 0x283f56 : 0x5b6f3b,
    roughness: 0.62,
    metalness: lendario ? 0.08 : 0,
    emissive: lendario ? 0x102040 : 0x000000,
    emissiveIntensity: lendario ? 0.24 : 0,
  });
  const ventre = m(lendario ? 0xd7c389 : 0xc4a96a);
  const escama = new THREE.MeshStandardMaterial({ color: lendario ? 0x8ad7ff : 0x2d3f24, roughness: 0.7, emissive: lendario ? 0x1a6688 : 0x000000, emissiveIntensity: lendario ? 0.45 : 0 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 1.85), corpoMat);
  corpo.position.y = 1.15; corpo.castShadow = true; g.add(corpo);
  const peito = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.56, 0.72), ventre);
  peito.position.set(0, 1.12, 0.72); g.add(peito);
  const pescoco = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.76, 0.42), corpoMat);
  pescoco.position.set(0, 1.62, 0.78); pescoco.rotation.x = -0.38; g.add(pescoco);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.48, 0.82), corpoMat);
  cabeca.position.set(0, 1.98, 1.18); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.46), ventre);
  focinho.position.set(0, 1.88, 1.76); g.add(focinho);
  [-0.18, 0.18].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: lendario ? 0x9df2ff : 0xffd35a, emissive: lendario ? 0x4ac8ff : 0xaa7010, emissiveIntensity: 0.9 }));
    olho.position.set(ox, 2.03, 1.63); g.add(olho);
    const chifre = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 5), escama);
    chifre.position.set(ox * 1.25, 2.28, 1.0); chifre.rotation.x = -0.55; g.add(chifre);
  });
  const patas = [];
  [[-0.28, 0.54, 0.35], [0.28, 0.54, 0.35], [-0.34, 0.75, -0.55], [0.34, 0.75, -0.55]].forEach(([px, py, pz], i) => {
    const geo = new THREE.BoxGeometry(i < 2 ? 0.18 : 0.22, i < 2 ? 0.78 : 1.05, i < 2 ? 0.18 : 0.22);
    geo.translate(0, -(i < 2 ? 0.39 : 0.52), 0);
    const pa = new THREE.Mesh(geo, corpoMat);
    pa.position.set(px, py, pz); pa.castShadow = true; g.add(pa); patas.push(pa);
    const garra = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.32), escama);
    garra.position.set(px, 0.08, pz + 0.12); g.add(garra);
  });
  const cauda = new THREE.Group();
  cauda.position.set(0, 1.12, -1.04);
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.42 - i * 0.045, 0.32 - i * 0.025, 0.56), corpoMat);
    seg.position.set(0, 0.05 - i * 0.025, -i * 0.44); seg.castShadow = true; cauda.add(seg);
  }
  g.add(cauda);
  for (let i = 0; i < (lendario ? 9 : 6); i++) {
    const esp = new THREE.Mesh(new THREE.ConeGeometry(lendario ? 0.1 : 0.08, lendario ? 0.38 : 0.28, 5), escama);
    esp.position.set(0, 1.72 - i * 0.05, 0.45 - i * 0.35); esp.rotation.x = -0.65; g.add(esp);
  }
  if (lendario) {
    [-0.42, 0.42].forEach((ox) => {
      const runa = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshStandardMaterial({ color: 0x9df2ff, emissive: 0x45caff, emissiveIntensity: 1.2 }));
      runa.position.set(ox, 1.38, 0.1); g.add(runa);
    });
  }
  g.userData = { patas, rabo: cauda, cauda, corpoMat, lendario, tipo: lendario ? 'draptorLendario' : 'draptor' };
  g.scale.setScalar(lendario ? 1.18 : 1);
  return g;
}

function criaDragaoVariante(cor = 0x6fd06f, emissivo = 0x000000, escala = 0.16, lord = false) {
  const d = criaDragao(0, 0, lord);
  d.scale.setScalar(escala);
  d.userData.baseScale = escala;
  d.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    o.material = o.material.clone();
    if (o.material.color) o.material.color.lerp(new THREE.Color(cor), 0.72);
    if (o.material.emissive && emissivo) {
      o.material.emissive.setHex(emissivo);
      o.material.emissiveIntensity = Math.max(o.material.emissiveIntensity || 0, 0.35);
    }
  });
  if (d.userData && d.userData.corpoMat && d.userData.corpoMat.color) {
    d.userData.corpoMat = d.userData.corpoMat.clone();
    d.userData.corpoMat.color.setHex(cor);
    if (emissivo) { d.userData.corpoMat.emissive.setHex(emissivo); d.userData.corpoMat.emissiveIntensity = 0.35; }
  }
  return d;
}

export const PETS = {
  gato: criaGato, cachorro: criaCachorro, coelho: criaCoelho,
  lobo: () => criaLobo(0, 0),
  burro: criaBurro,
  coruja: criaCorujaGigante,
  morcego: criaMorcegoGrande,
  draptor: () => criaDraptor(false),
  draptorLendario: () => criaDraptor(true),
  furiaDoDia: () => criaDragaoVariante(0xf0d878, 0xff9d2a, 0.18, false),
  furiaDaNoite: () => criaDragaoVariante(0x2a2730, 0x5b4cff, 0.18, false),
  dragaoPantano: () => criaDragaoVariante(0x3f7a4a, 0x36d06f, 0.17, false),
  dragaoGelo: () => criaDragaoVariante(0x9fd7ff, 0x66cfff, 0.17, false),
  dragaoVeia: () => criaDragaoVariante(0xc9a75a, 0x8e5cff, 0.19, true),
  dragaozinho: () => { const d = criaDragao(0, 0); d.scale.setScalar(0.16); d.userData.baseScale = 0.16; return d; },
};

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
    if (u.patas && u.patas.length >= 4) {
      const s = Math.sin(tempo * 16) * 0.6;
      u.patas[0].rotation.x = s; u.patas[3].rotation.x = s;
      u.patas[1].rotation.x = -s; u.patas[2].rotation.x = -s;
    }
  } else if (u.patas) {
    u.patas.forEach((p) => { p.rotation.x *= 0.8; });
  }
  if (u.asas) {
    const a = Math.sin(tempo * 5.5) * 0.38;
    u.asas.forEach((asa, i) => {
      asa.rotation.z = (i ? -1 : 1) * (0.12 + a);
      asa.rotation.y = (i ? -1 : 1) * (0.08 + Math.abs(a) * 0.18);
    });
  }
  if (u.cauda) u.cauda.rotation.y = Math.sin(tempo * 2.4) * 0.18;
  if (u.rabo) u.rabo.rotation.y = Math.sin(tempo * 3) * 0.4; // rabo sempre balança (se tiver)
}

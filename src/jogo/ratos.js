// =============================================================
//  RATOS  ·  primeiro bicho (esgoto). Vida 20, fáceis de matar.
//  Perambulam dentro dos limites do esgoto; animam as patas.
//  Cada um tem material próprio (corpoMat) para PISCAR ao levar dano.
//  Vivem em y = -40 (subsolo do esgoto).
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';
import { giraSuave } from './avatar.js';

const Y = -40;

export function criaRato(x, z) {
  const g = new THREE.Group(); g.position.set(x, Y, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x6b6258, roughness: 0.85 });
  const escuro = mat(0x44403a);

  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.85), corpoMat);
  corpo.position.y = 0.3; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.38, 0.4), corpoMat);
  cabeca.position.set(0, 0.34, 0.55); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), mat(0xc89a9a));
  focinho.position.set(0, 0.28, 0.78); g.add(focinho);
  [-0.14, 0.14].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), escuro);
    or.position.set(ox, 0.56, 0.5); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), mat(0x100808));
    olho.position.set(ox * 0.6, 0.36, 0.74); g.add(olho);
  });
  const patas = [];
  [[-0.16, 0.28], [0.16, 0.28], [-0.16, -0.28], [0.16, -0.28]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.12, 0.28, 0.12); geo.translate(0, -0.14, 0);
    const pa = new THREE.Mesh(geo, escuro); pa.position.set(px, 0.28, pz); g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.7, 5), mat(0xb88a8a));
  rabo.position.set(0, 0.3, -0.72); rabo.rotation.x = Math.PI / 2.3; g.add(rabo);

  g.userData = { patas, rabo, corpoMat, tipo: 'rato' };
  return g;
}

function novoAlvoRato(b) {
  return { x: b.minX + 1 + Math.random() * (b.maxX - b.minX - 2), z: b.minZ + 1 + Math.random() * (b.maxZ - b.minZ - 2) };
}

export function criaRatos(n, bounds) {
  const ratos = [];
  for (let i = 0; i < n; i++) {
    const a = novoAlvoRato(bounds);
    ratos.push({ g: criaRato(a.x, a.z), hp: 20, hpMax: 20, xp: 5, dano: 3, vel: 1.9, bounds, y0: Y, alvo: novoAlvoRato(bounds), pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0 });
  }
  return ratos;
}

// usa o bounds PRÓPRIO de cada criatura. jog = {x,y,z} do jogador (persegue se perto).
// podeAndar(x, z, y) = checagem de colisão com o cenário (padrão Tibia/Albion:
// bicho NÃO atravessa parede/árvore; se bater, escolhe outro rumo).
export function atualizaRatos(ratos, dt, jog, podeAndar) {
  for (const r of ratos) {
    if (!r.vivo || r.voando) continue; // voando = controlado pelo voo do dragão
    const g = r.g, b = r.bounds; r.tempo += dt;
    if (r.piscar > 0) { r.piscar -= dt; if (r.piscar <= 0 && g.userData.corpoMat) g.userData.corpoMat.emissive.setHex(0x000000); }
    // asas (dragão) batem de leve mesmo parado
    if (g.userData.asas) { const f = Math.sin(r.tempo * 3.5) * 0.5; g.userData.asas[0].rotation.z = 0.2 - f; g.userData.asas[1].rotation.z = -0.2 + f; }
    // PERSEGUIÇÃO: se o jogador está perto e no mesmo "andar", caça-o
    r.contato = false;
    if (jog && Math.abs(r.y0 - jog.y) < 6) {
      const pdx = jog.x - g.position.x, pdz = jog.z - g.position.z, pd = Math.hypot(pdx, pdz);
      if (pd < 12) {
        r.pausa = 0;
        if (pd < 1.7) {
          r.contato = true; g.rotation.y = Math.atan2(pdx, pdz);
          const p = g.userData.patas; if (p) { const s = Math.sin(r.tempo * 18) * 0.5; for (let i = 0; i < p.length; i++) p[i].rotation.x = (i % 2 ? -s : s); }
          continue;
        }
        r.alvo = { x: jog.x, z: jog.z };
      }
    }
    if (r.pausa > 0) { r.pausa -= dt; continue; }
    const dx = r.alvo.x - g.position.x, dz = r.alvo.z - g.position.z, dist = Math.hypot(dx, dz);
    if (dist < 0.4) { r.pausa = 0.5 + Math.random() * 1.6; r.alvo = novoAlvoRato(b); continue; }
    const vel = r.vel || 1.9, mx = dx / dist, mz = dz / dist;
    const nx = Math.max(b.minX + 0.7, Math.min(b.maxX - 0.7, g.position.x + mx * vel * dt));
    const nz = Math.max(b.minZ + 0.7, Math.min(b.maxZ - 0.7, g.position.z + mz * vel * dt));
    if (podeAndar && !podeAndar(nx, nz, g.position.y)) {
      // bateu no cenário: desiste do rumo e escolhe outro (não fica preso na parede)
      r.alvo = novoAlvoRato(b); r.pausa = 0.3 + Math.random() * 0.8;
      continue;
    }
    g.position.x = nx; g.position.z = nz;
    giraSuave(g, Math.atan2(mx, mz), dt * 8); // vira macio (sem "pular" o ângulo)
    const p = g.userData.patas;
    if (p) { const s = Math.sin(r.tempo * 16) * 0.6; for (let i = 0; i < p.length; i++) p[i].rotation.x = (i % 2 ? -s : s); }
    if (g.userData.segs) g.userData.segs.forEach((sg, i) => { sg.position.x = Math.sin(r.tempo * 6 + i * 0.7) * 0.25; });
  }
}

// ===== CRIATURAS DA SUPERFÍCIE (região selvagem) — vivem em y = 0 =====
function olhos(g, ox, oy, oz, raio, cor) {
  [-ox, ox].forEach((x) => { const o = new THREE.Mesh(new THREE.SphereGeometry(raio, 8, 8), mat(cor)); o.position.set(x, oy, oz); g.add(o); });
}

export function criaTroll(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x5a7a3a, roughness: 0.9 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.6), corpoMat); torso.position.y = 1.0; torso.castShadow = true; g.add(torso);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.6), corpoMat); cabeca.position.y = 1.7; cabeca.castShadow = true; g.add(cabeca);
  olhos(g, 0.16, 1.75, 0.32, 0.08, 0xe0d040);
  const presa = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), mat(0xeee0c0)); presa.position.set(0.12, 1.5, 0.32); presa.rotation.x = Math.PI; g.add(presa);
  [-0.62, 0.62].forEach((ox) => { const geo = new THREE.BoxGeometry(0.26, 0.9, 0.26); geo.translate(0, -0.45, 0); const b = new THREE.Mesh(geo, corpoMat); b.position.set(ox, 1.5, 0); b.castShadow = true; g.add(b); });
  const patas = [];
  [-0.24, 0.24].forEach((ox) => { const geo = new THREE.BoxGeometry(0.3, 0.7, 0.3); geo.translate(0, -0.35, 0); const p = new THREE.Mesh(geo, corpoMat); p.position.set(ox, 0.7, 0); p.castShadow = true; g.add(p); patas.push(p); });
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// CYCLOPS — VERSÃO 50x: GIGANTE de UM OLHO estilo Tibia. ~7m de altura,
// mandíbula com presas pra cima, tanga de couro, clava com cravos.
export function criaCyclops(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x9a7250, roughness: 0.85 });
  const couro = mat(0x5a4226), osso = mat(0xeee0c0, 0.6);
  // TORSO enorme (barrigudo) + peitoral
  const torso = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.9, 1.8), corpoMat);
  torso.position.y = 3.9; torso.castShadow = true; g.add(torso);
  const barriga = new THREE.Mesh(new THREE.SphereGeometry(1.3, 12, 10), corpoMat);
  barriga.position.set(0, 3.3, 0.45); barriga.scale.set(1.1, 1, 0.8); g.add(barriga);
  // TANGA de couro
  const tanga = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.6), couro);
  tanga.position.y = 2.35; g.add(tanga);
  // CABEÇA com UM OLHO gigante + presas inferiores pra cima (Tibia!)
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 1.5), corpoMat);
  cabeca.position.y = 6.1; cabeca.castShadow = true; g.add(cabeca);
  const escl = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), mat(0xf0ece0, 0.4));
  escl.position.set(0, 6.3, 0.72); g.add(escl);
  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), mat(0x9a6a10));
  iris.position.set(0, 6.3, 1.0); g.add(iris);
  const pup = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat(0x080808));
  pup.position.set(0, 6.3, 1.14); g.add(pup);
  const sob = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.3), mat(0x6a4a30)); // sobrancelha única brava
  sob.position.set(0, 6.78, 0.72); g.add(sob);
  const queixo = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.2), corpoMat);
  queixo.position.set(0, 5.45, 0.25); g.add(queixo);
  [-0.42, 0.42].forEach((ox) => { // presas inferiores PRA CIMA
    const presa = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 5), osso);
    presa.position.set(ox, 5.85, 0.78); g.add(presa);
  });
  [-0.85, 0.85].forEach((ox) => { // orelhas grandes
    const or = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 4), corpoMat);
    or.position.set(ox, 6.35, 0); or.rotation.z = ox > 0 ? -1.3 : 1.3; g.add(or);
  });
  // BRAÇOS grossos + CLAVA com cravos na mão direita
  [-1.75, 1.75].forEach((ox) => {
    const geo = new THREE.BoxGeometry(0.75, 2.7, 0.75); geo.translate(0, -1.35, 0);
    const b = new THREE.Mesh(geo, corpoMat); b.position.set(ox, 5.1, 0); b.castShadow = true; g.add(b);
    const mao = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), corpoMat);
    mao.position.set(ox, 2.3, 0); g.add(mao);
  });
  const clava = new THREE.Group(); clava.position.set(2.1, 2.3, 0.4); clava.rotation.z = 0.5;
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.6, 8), couro);
  cabo.position.y = 1.0; clava.add(cabo);
  const ponta = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), mat(0x6e4a2a));
  ponta.position.y = 2.4; ponta.scale.y = 1.25; clava.add(ponta);
  for (let i = 0; i < 6; i++) { // cravos
    const a = (i / 6) * Math.PI * 2;
    const cravo = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 4), mat(0xb8bcc4, 0.4));
    cravo.position.set(Math.cos(a) * 0.6, 2.4, Math.sin(a) * 0.6);
    cravo.rotation.z = -Math.cos(a) * 1.4; cravo.rotation.x = Math.sin(a) * 1.4; clava.add(cravo);
  }
  g.add(clava);
  // PERNAS troncudas
  const patas = [];
  [-0.7, 0.7].forEach((ox) => {
    const geo = new THREE.BoxGeometry(0.85, 2.0, 0.9); geo.translate(0, -1.0, 0);
    const p = new THREE.Mesh(geo, corpoMat); p.position.set(ox, 2.0, 0); p.castShadow = true; g.add(p); patas.push(p);
  });
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// GIANT SPIDER — VERSÃO 50x (Tibia): ENORME, feroz e rápida. Pernas
// ARTICULADAS em arco (2 segmentos), quelíceras com presas, marca
// vermelha no abdômen, 6 olhos em brasa. Cria filhotes na caça (main3d).
export function criaAranhaGigante(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x231423, roughness: 0.6 });
  const escuro = mat(0x140a14);
  // ABDÔMEN gigante com marca vermelha + cerdas
  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(1.9, 16, 12), corpoMat);
  abdomen.position.set(0, 2.1, -1.7); abdomen.scale.set(1, 0.95, 1.35); abdomen.castShadow = true; g.add(abdomen);
  const marca = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xc02020, emissive: 0x600808, emissiveIntensity: 0.4 }));
  marca.position.set(0, 3.55, -1.7); marca.scale.set(1, 0.35, 1.6); g.add(marca);
  for (let i = 0; i < 8; i++) { // cerdas espetadas no abdômen
    const a = (i / 8) * Math.PI * 2;
    const cerda = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.55, 4), escuro);
    cerda.position.set(Math.cos(a) * 1.4, 2.6 + Math.sin(a * 2) * 0.4, -1.7 + Math.sin(a) * 1.6);
    cerda.rotation.z = -Math.cos(a) * 1.2; g.add(cerda);
  }
  // CEFALOTÓRAX + QUELÍCERAS com presas curvas
  const cefalo = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 12), corpoMat);
  cefalo.position.set(0, 1.75, 0.9); cefalo.castShadow = true; g.add(cefalo);
  [-0.32, 0.32].forEach((ox) => {
    const quel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.7, 6), escuro);
    quel.position.set(ox, 1.25, 1.75); quel.rotation.x = 0.5; g.add(quel);
    const presa = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 5), mat(0xe8e0d0));
    presa.position.set(ox, 0.8, 2.0); presa.rotation.x = Math.PI - 0.35; g.add(presa);
  });
  // 6 OLHOS em brasa (2 grandes + 4 menores)
  const olhoMat = new THREE.MeshStandardMaterial({ color: 0xd02020, emissive: 0x900a0a, emissiveIntensity: 0.9 });
  [[-0.3, 2.15, 0.15], [0.3, 2.15, 0.15], [-0.55, 2.0, 0.1], [0.55, 2.0, 0.1], [-0.18, 2.35, 0.08], [0.18, 2.35, 0.08]].forEach(([ox, oy, r]) => {
    const o = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), olhoMat);
    o.position.set(ox, oy, 1.78); g.add(o);
  });
  // 8 PERNAS ARTICULADAS em arco (fêmur sobe + tíbia desce — silhueta de aranha)
  const patas = [];
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const perna = new THREE.Group();
    perna.position.set(s * 0.9, 2.0, 0.8 - i * 0.85);
    const aFrente = (i - 1.5) * 0.35; // pernas abrem em leque
    const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 2.2, 6), corpoMat);
    femur.position.set(s * 0.95, 0.55, 0); femur.rotation.z = s * 1.05; femur.rotation.y = -s * aFrente; femur.castShadow = true; perna.add(femur);
    const joelho = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), escuro);
    joelho.position.set(s * 1.9, 1.05, -Math.sin(aFrente) * 1.9 * s * s); perna.add(joelho);
    const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 2.4, 5), corpoMat);
    tibia.position.set(s * 2.5, -0.05, joelho.position.z * 1.5); tibia.rotation.z = s * 0.55; tibia.rotation.y = -s * aFrente; tibia.castShadow = true; perna.add(tibia);
    g.add(perna); patas.push(perna);
  }
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

export function criaAranhaPequena(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x3a2a3a, roughness: 0.7 });
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), corpoMat); corpo.position.y = 0.3; corpo.scale.z = 1.3; corpo.castShadow = true; g.add(corpo);
  const patas = [];
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.5, 4), corpoMat);
    perna.position.set(s * 0.25, 0.3, 0.15 - i * 0.13); perna.rotation.z = s * 0.9; g.add(perna); patas.push(perna);
  }
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

export function criaLadrao(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x3a3a42, roughness: 0.9 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.45), corpoMat); torso.position.y = 1.3; torso.castShadow = true; g.add(torso);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.58), mat(0xe0b088)); cabeca.position.y = 2.0; g.add(cabeca);
  const capuz = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), corpoMat); capuz.position.y = 2.22; capuz.castShadow = true; g.add(capuz);
  olhos(g, 0.13, 2.0, 0.3, 0.05, 0x222222);
  const patas = [];
  [-0.18, 0.18].forEach((ox) => { const geo = new THREE.BoxGeometry(0.24, 0.8, 0.24); geo.translate(0, -0.4, 0); const p = new THREE.Mesh(geo, mat(0x2a2a30)); p.position.set(ox, 0.85, 0); p.castShadow = true; g.add(p); patas.push(p); });
  [-0.46, 0.46].forEach((ox) => { const geo = new THREE.BoxGeometry(0.2, 0.75, 0.2); geo.translate(0, -0.38, 0); const b = new THREE.Mesh(geo, corpoMat); b.position.set(ox, 1.7, 0); g.add(b); });
  const adaga = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), mat(0xc0c4cc, 0.3)); adaga.position.set(0.52, 1.0, 0.1); g.add(adaga);
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

export function criaEscorpiao(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x6a3a1a, roughness: 0.8 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.9), corpoMat); corpo.position.y = 0.3; corpo.castShadow = true; g.add(corpo);
  for (let i = 0; i < 4; i++) { const seg = new THREE.Mesh(new THREE.SphereGeometry(0.12 - i * 0.015, 8, 6), corpoMat); seg.position.set(0, 0.4 + i * 0.18, -0.5 - i * 0.12); g.add(seg); }
  const ferrao = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), mat(0x2a1a0a)); ferrao.position.set(0, 1.05, -0.95); ferrao.rotation.x = -1; g.add(ferrao);
  [-0.35, 0.35].forEach((ox) => { const garra = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.3), corpoMat); garra.position.set(ox, 0.28, 0.55); g.add(garra); });
  const patas = [];
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.4, 4), corpoMat); perna.position.set(s * 0.3, 0.25, 0.2 - i * 0.25); perna.rotation.z = s * 0.9; g.add(perna); patas.push(perna); }
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// LOBO: quadrúpede cinza, rápido, caça em bando (florestas e beira de estrada).
export function criaLobo(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: 0.85 });
  const escuro = mat(0x44444a);
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 1.25), corpoMat);
  corpo.position.y = 0.75; corpo.castShadow = true; g.add(corpo);
  const peito = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.5), corpoMat);
  peito.position.set(0, 0.78, 0.5); g.add(peito);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.5), corpoMat);
  cabeca.position.set(0, 1.05, 0.95); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.3), escuro);
  focinho.position.set(0, 0.98, 1.3); g.add(focinho);
  [-0.14, 0.14].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), escuro); or.position.set(ox, 1.32, 0.85); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), mat(0xe0c020)); olho.position.set(ox * 0.8, 1.1, 1.2); g.add(olho);
  });
  const patas = [];
  [[-0.2, 0.45], [0.2, 0.45], [-0.2, -0.45], [0.2, -0.45]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.14, 0.55, 0.14); geo.translate(0, -0.27, 0);
    const p = new THREE.Mesh(geo, escuro); p.position.set(px, 0.55, pz); g.add(p); patas.push(p);
  });
  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.55), escuro);
  rabo.position.set(0, 0.85, -0.85); rabo.rotation.x = 0.45; g.add(rabo);
  g.userData = { patas, rabo, corpoMat, tipo: 'monstro' };
  return g;
}

// URSO: parrudo e lento, bate forte (florestas e sopé das montanhas).
export function criaUrso(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.9 });
  const escuro = mat(0x3a2412);
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.8), corpoMat);
  corpo.position.y = 1.0; corpo.castShadow = true; g.add(corpo);
  const giba = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.8), corpoMat); // corcova
  giba.position.set(0, 1.6, -0.3); g.add(giba);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.62, 0.66), corpoMat);
  cabeca.position.set(0, 1.45, 1.15); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.3), escuro);
  focinho.position.set(0, 1.32, 1.55); g.add(focinho);
  [-0.22, 0.22].forEach((ox) => {
    const or = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), escuro); or.position.set(ox, 1.8, 1.0); g.add(or);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), mat(0x141008)); olho.position.set(ox * 0.7, 1.52, 1.48); g.add(olho);
  });
  const patas = [];
  [[-0.4, 0.6], [0.4, 0.6], [-0.4, -0.6], [0.4, -0.6]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.3, 0.6, 0.34); geo.translate(0, -0.3, 0);
    const p = new THREE.Mesh(geo, escuro); p.position.set(px, 0.6, pz); g.add(p); patas.push(p);
  });
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// ESQUELETO: morto-vivo do cemitério (ossos brancos, olheiras fundas).
export function criaEsqueleto(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0xe6e0d0, roughness: 0.7 });
  const sombra = mat(0x1a1a1a);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.32), corpoMat);
  torso.position.y = 1.45; torso.castShadow = true; g.add(torso);
  for (let i = 0; i < 3; i++) { // costelas marcadas
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.07, 0.36), sombra);
    c.position.set(0, 1.25 + i * 0.22, 0); g.add(c);
  }
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.3), corpoMat); pelvis.position.y = 0.92; g.add(pelvis);
  const cranio = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.5), corpoMat);
  cranio.position.y = 2.2; cranio.castShadow = true; g.add(cranio);
  const queixo = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.4), corpoMat); queixo.position.set(0, 1.92, 0.04); g.add(queixo);
  [-0.12, 0.12].forEach((ox) => { const olho = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.06), sombra); olho.position.set(ox, 2.26, 0.26); g.add(olho); });
  const nariz = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.06), sombra); nariz.position.set(0, 2.1, 0.26); g.add(nariz);
  [-0.4, 0.4].forEach((ox) => { const geo = new THREE.BoxGeometry(0.13, 0.8, 0.13); geo.translate(0, -0.4, 0); const b = new THREE.Mesh(geo, corpoMat); b.position.set(ox, 1.85, 0); b.castShadow = true; g.add(b); });
  const patas = [];
  [-0.16, 0.16].forEach((ox) => { const geo = new THREE.BoxGeometry(0.15, 0.8, 0.15); geo.translate(0, -0.4, 0); const p = new THREE.Mesh(geo, corpoMat); p.position.set(ox, 0.82, 0); p.castShadow = true; g.add(p); patas.push(p); });
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// ORC: guerreiro verde com presas e machadinha (guarda as ruínas).
export function criaOrc(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x4a7a2a, roughness: 0.85 });
  const couro = mat(0x5a4226);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.0, 0.55), corpoMat);
  torso.position.y = 1.35; torso.castShadow = true; g.add(torso);
  const colete = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.6), couro); colete.position.y = 1.2; g.add(colete);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.6, 0.6), corpoMat);
  cabeca.position.y = 2.2; cabeca.castShadow = true; g.add(cabeca);
  olhos(g, 0.15, 2.28, 0.32, 0.06, 0xd03020);
  [-0.14, 0.14].forEach((ox) => { const presa = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 4), mat(0xeee0c0)); presa.position.set(ox, 2.0, 0.3); g.add(presa); });
  [-0.6, 0.6].forEach((ox) => { const geo = new THREE.BoxGeometry(0.26, 0.9, 0.26); geo.translate(0, -0.45, 0); const b = new THREE.Mesh(geo, corpoMat); b.position.set(ox, 1.75, 0); b.castShadow = true; g.add(b); });
  const patas = [];
  [-0.24, 0.24].forEach((ox) => { const geo = new THREE.BoxGeometry(0.3, 0.85, 0.3); geo.translate(0, -0.42, 0); const p = new THREE.Mesh(geo, couro); p.position.set(ox, 0.85, 0); p.castShadow = true; g.add(p); patas.push(p); });
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), couro); cabo.position.set(0.75, 1.0, 0.15); g.add(cabo);
  const lamina = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.06), mat(0xb8bcc4, 0.35)); lamina.position.set(0.75, 1.5, 0.15); g.add(lamina);
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// CARANGUEJO da praia (fraquinho; anda de lado com as garras pra cima)
export function criaCaranguejo(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0xc24a2a, roughness: 0.7 });
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), corpoMat);
  corpo.position.y = 0.32; corpo.scale.set(1.4, 0.6, 1); corpo.castShadow = true; g.add(corpo);
  [-0.18, 0.18].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), mat(0x101010));
    olho.position.set(ox, 0.62, 0.3); g.add(olho);
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 4), corpoMat);
    haste.position.set(ox, 0.52, 0.28); g.add(haste);
  });
  [-0.55, 0.55].forEach((ox) => { // garras erguidas
    const garra = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), corpoMat);
    garra.position.set(ox, 0.5, 0.4); garra.scale.set(1, 0.8, 1.3); garra.castShadow = true; g.add(garra);
    const pinca = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 4), corpoMat);
    pinca.position.set(ox, 0.62, 0.62); g.add(pinca);
  });
  const patas = [];
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const perna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.45, 4), corpoMat);
    perna.position.set(s * 0.5, 0.22, 0.15 - i * 0.2); perna.rotation.z = s * 1.1; g.add(perna); patas.push(perna);
  }
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// BEHOLDER — VERSÃO 50x: GRANDE, imponente e assustador. Olho gigante com
// pupila em fenda, bocarra cheia de presas, 8 tentáculos-olho e espinhos.
// ATIRA rajadas mágicas no jogador (campo `atira` no main3d).
export function criaBeholder(x, z) {
  // v3 — estilo LIVRO de D&D: pele escura e verrugosa, bocarra TORTA com
  // dentes irregulares, olhão vermelho raivoso sob placas de quitina,
  // 10 tentáculos retorcidos. Sombrio e ameaçador (nada de "fofo").
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x4a3340, roughness: 0.9 });   // pele parda-arroxeada ESCURA
  const quitina = mat(0x261a22, 0.95);                                                     // placas quase pretas
  const dente = mat(0xcfc4a8, 0.7);                                                        // marfim sujo
  const Y0 = 3.6;
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(2.1, 18, 16), corpoMat);
  corpo.position.y = Y0; corpo.scale.set(1.05, 0.92, 1); corpo.castShadow = true; g.add(corpo);
  // VERRUGAS/CALOMBOS espalhados (pele doente)
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI - Math.PI / 2;
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.14 + Math.random() * 0.16, 6, 5), quitina);
    v.position.set(Math.cos(a) * Math.cos(b) * 2.05, Y0 + Math.sin(b) * 1.85, Math.sin(a) * Math.cos(b) * 2.0 - 0.2);
    g.add(v);
  }
  // BOCARRA TORTA: rasgo escuro irregular + dentes de tamanhos DIFERENTES
  for (let i = 0; i < 6; i++) {
    const px = -1.05 + i * 0.42;
    const rasgo = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34 + Math.sin(i * 2.1) * 0.14, 0.3), quitina);
    rasgo.position.set(px, Y0 - 0.72 + Math.sin(i * 1.7) * 0.1, 1.78 - Math.abs(px) * 0.42);
    rasgo.rotation.z = (Math.sin(i * 3.1)) * 0.25; g.add(rasgo);
  }
  for (let i = 0; i < 8; i++) {
    const px = -1.0 + i * 0.28;
    const tam = 0.18 + Math.abs(Math.sin(i * 2.3)) * 0.22; // dentes desiguais
    const dCima = new THREE.Mesh(new THREE.ConeGeometry(0.07 + tam * 0.18, tam, 4), dente);
    dCima.position.set(px, Y0 - 0.52, 1.86 - Math.abs(px) * 0.4); dCima.rotation.x = Math.PI - 0.25; g.add(dCima);
    if (i % 2) {
      const dBaixo = new THREE.Mesh(new THREE.ConeGeometry(0.06, tam * 0.7, 4), dente);
      dBaixo.position.set(px + 0.1, Y0 - 1.02, 1.76 - Math.abs(px) * 0.4); dBaixo.rotation.x = 0.25; g.add(dBaixo);
    }
  }
  // OLHÃO central raivoso: esclera amarelada com VEIAS, íris vermelha, fenda
  const escl = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 14), mat(0xd8cfa8, 0.5));
  escl.position.set(0, Y0 + 0.5, 1.3); g.add(escl);
  for (let i = 0; i < 5; i++) { // veias
    const veia = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.04), mat(0x8a2a1a, 0.8));
    const a = (i / 5) * Math.PI * 2;
    veia.position.set(Math.cos(a) * 0.6, Y0 + 0.5 + Math.sin(a) * 0.55, 2.05);
    veia.rotation.z = a + Math.PI / 2; g.add(veia);
  }
  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0xa01515, emissive: 0x6a0a0a, emissiveIntensity: 0.7 }));
  iris.position.set(0, Y0 + 0.5, 1.92); g.add(iris);
  const fenda = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.1), mat(0x050505));
  fenda.position.set(0, Y0 + 0.5, 2.32); g.add(fenda);
  // SOBRANCELHA pesada de quitina (raiva permanente)
  const browL = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.3, 0.55), quitina);
  browL.position.set(-0.55, Y0 + 1.3, 1.4); browL.rotation.z = -0.42; g.add(browL);
  const browR = browL.clone(); browR.position.x = 0.55; browR.rotation.z = 0.42; g.add(browR);
  // ESPINHOS no queixo
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const esp = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.55 + (i % 2) * 0.2, 5), quitina);
    esp.position.set(Math.cos(a) * 1.2, Y0 - 1.8, Math.sin(a) * 1.1); esp.rotation.x = Math.PI; g.add(esp);
  }
  // 10 TENTÁCULOS retorcidos (segmento + cotovelo + olhinho raivoso)
  const patas = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const stalk = new THREE.Group();
    stalk.position.set(Math.cos(a) * 1.45, Y0 + 1.35 + Math.sin(i * 2.7) * 0.3, Math.sin(a) * 1.4);
    const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.1, 6), corpoMat);
    seg1.position.y = 0.55; seg1.rotation.z = Math.cos(a) * 0.5; seg1.rotation.x = -Math.sin(a) * 0.5; stalk.add(seg1);
    const cotovelo = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), quitina);
    cotovelo.position.set(Math.cos(a) * 0.45, 1.05, Math.sin(a) * 0.42); stalk.add(cotovelo);
    const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.9, 5), corpoMat);
    seg2.position.set(Math.cos(a) * 0.7, 1.4, Math.sin(a) * 0.66);
    seg2.rotation.z = -Math.cos(a) * 0.7; seg2.rotation.x = Math.sin(a) * 0.7; stalk.add(seg2);
    const olhinho = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xb03020, emissive: 0x701510, emissiveIntensity: 0.6 }));
    olhinho.position.set(Math.cos(a) * 0.95, 1.72, Math.sin(a) * 0.9); stalk.add(olhinho);
    stalk.castShadow = true; g.add(stalk); patas.push(stalk);
  }
  g.userData = { patas, corpoMat, tipo: 'monstro' };
  return g;
}

// DRAGÃO (chefão) — VERSÃO 50x: GRANDE e detalhado (chifres curvos, mandíbula
// com dentes, barriga blindada, asas com dedos, garras, cauda com lâmina).
// VERDE = dragão comum (estilo Tibia); lord=true = DRAGON LORD vermelho 5×.
export function criaDragao(x, z, lord = false) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const s = lord ? 2.0 : 1.7; // ESCALA: dragão imponente (o antigo era pequeno)
  const corpoMat = new THREE.MeshStandardMaterial({ color: lord ? 0x9a2a1a : 0x3a7a2a, roughness: 0.55 });
  const escuro = mat(lord ? 0x5a1810 : 0x24481a);
  const barriga = mat(lord ? 0xd8a05a : 0xc8c07a, 0.7);
  const osso = mat(0xe8e0c8, 0.6);
  const olhoMat = new THREE.MeshStandardMaterial({ color: lord ? 0xff4a00 : 0xffd000, emissive: lord ? 0xff3000 : 0xcc9900, emissiveIntensity: 0.8 });

  // CORPO musculoso + placas da barriga
  const corpo = new THREE.Mesh(new THREE.SphereGeometry(1.4 * s, 16, 12), corpoMat);
  corpo.position.set(0, 1.9 * s, -0.3 * s); corpo.scale.set(1, 0.92, 1.6); corpo.castShadow = true; g.add(corpo);
  for (let i = 0; i < 5; i++) {
    const placa = new THREE.Mesh(new THREE.BoxGeometry(0.95 * s, 0.3 * s, 0.42 * s), barriga);
    placa.position.set(0, 0.95 * s, (1.1 - i * 0.62) * s); placa.rotation.x = 0.12; g.add(placa);
  }
  // PESCOÇO em arco + CABEÇA com mandíbula e dentes
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry((0.66 - i * 0.06) * s, 10, 8), corpoMat);
    seg.position.set(0, (2.3 + i * 0.5) * s, (1.0 + i * 0.42) * s); seg.castShadow = true; g.add(seg);
  }
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.8 * s, 0.62 * s, 1.15 * s), corpoMat);
  cabeca.position.set(0, 4.5 * s, 3.05 * s); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.56 * s, 0.4 * s, 0.66 * s), corpoMat);
  focinho.position.set(0, 4.42 * s, 3.85 * s); g.add(focinho);
  const mandibula = new THREE.Mesh(new THREE.BoxGeometry(0.5 * s, 0.16 * s, 0.85 * s), escuro);
  mandibula.position.set(0, 4.12 * s, 3.6 * s); mandibula.rotation.x = 0.22; g.add(mandibula); // boca entreaberta
  for (let i = 0; i < 4; i++) [-1, 1].forEach((ld) => { // dentes
    const dente = new THREE.Mesh(new THREE.ConeGeometry(0.045 * s, 0.16 * s, 4), osso);
    dente.position.set(ld * 0.18 * s, 4.27 * s, (3.35 + i * 0.2) * s); dente.rotation.x = Math.PI; g.add(dente);
  });
  // narinas com brasa (Lord) ou verde-musgo
  [-0.13, 0.13].forEach((ox) => { const n = new THREE.Mesh(new THREE.SphereGeometry(0.05 * s, 6, 6), escuro); n.position.set(ox * s, 4.5 * s, 4.16 * s); g.add(n); });
  // CHIFRES curvos (2 segmentos angulados) + cristas da testa
  [-1, 1].forEach((ld) => {
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.11 * s, 0.6 * s, 6), osso);
    c1.position.set(ld * 0.28 * s, 4.95 * s, 2.75 * s); c1.rotation.x = -0.7; c1.castShadow = true; g.add(c1);
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.07 * s, 0.5 * s, 6), osso);
    c2.position.set(ld * 0.3 * s, 5.3 * s, 2.5 * s); c2.rotation.x = -1.15; g.add(c2);
    const sob = new THREE.Mesh(new THREE.BoxGeometry(0.22 * s, 0.07 * s, 0.3 * s), escuro);
    sob.position.set(ld * 0.24 * s, 4.78 * s, 3.4 * s); g.add(sob);
  });
  // OLHOS que brilham
  [-0.26, 0.26].forEach((ox) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 8, 8), olhoMat); o.position.set(ox * s, 4.62 * s, 3.5 * s); g.add(o); });
  // ASAS GRANDES com dedos ósseos e membrana dupla (batem via userData.asas)
  const asas = [];
  [-1, 1].forEach((ld) => {
    const asa = new THREE.Group(); asa.position.set(ld * 1.15 * s, 3.0 * s, -0.3 * s);
    const braco = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.07 * s, 2.2 * s, 6), corpoMat);
    braco.rotation.z = ld * (Math.PI / 2 - 0.35); braco.position.set(ld * 1.0 * s, 0.35 * s, 0); asa.add(braco);
    const membrana = new THREE.Mesh(new THREE.BoxGeometry(3.6 * s, 0.07 * s, 2.8 * s), escuro);
    membrana.position.set(ld * 2.2 * s, 0.1 * s, -0.2 * s); membrana.rotation.z = ld * 0.12; membrana.castShadow = true; asa.add(membrana);
    [-1.1, -0.1, 0.9].forEach((oz, i) => { // dedos da asa
      const dedo = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.03 * s, (3.4 - i * 0.5) * s, 5), corpoMat);
      dedo.rotation.z = Math.PI / 2; dedo.position.set(ld * 2.1 * s, 0.16 * s, oz * s); asa.add(dedo);
    });
    g.add(asa); asas.push(asa);
  });
  // 4 PATAS grossas com 3 GARRAS cada
  const patas = [];
  [[-0.95, 0.8], [0.95, 0.8], [-0.95, -1.3], [0.95, -1.3]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.5 * s, 1.45 * s, 0.5 * s); geo.translate(0, -0.72 * s, 0);
    const p = new THREE.Mesh(geo, corpoMat); p.position.set(px * s, 1.45 * s, pz * s); p.castShadow = true; g.add(p); patas.push(p);
    [-0.14, 0, 0.14].forEach((gx) => {
      const garra = new THREE.Mesh(new THREE.ConeGeometry(0.06 * s, 0.24 * s, 4), osso);
      garra.position.set(gx * s, -1.4 * s, 0.3 * s); garra.rotation.x = 1.25; p.add(garra);
    });
  });
  // CAUDA longa com lâmina na ponta + ESPINHOS do pescoço à cauda
  for (let i = 0; i < 8; i++) {
    const t = new THREE.Mesh(new THREE.SphereGeometry((0.52 - i * 0.05) * s, 8, 6), corpoMat);
    t.position.set(0, (1.5 - i * 0.06) * s, (-1.8 - i * 0.55) * s); t.castShadow = true; g.add(t);
  }
  const lamina = new THREE.Mesh(new THREE.ConeGeometry(0.22 * s, 0.9 * s, 4), osso);
  lamina.position.set(0, 1.1 * s, -6.2 * s); lamina.rotation.x = -Math.PI / 2; g.add(lamina);
  for (let i = 0; i < 9; i++) {
    const e = new THREE.Mesh(new THREE.ConeGeometry((0.16 - i * 0.008) * s, (0.6 - i * 0.03) * s, 4), escuro);
    e.position.set(0, (3.0 - i * 0.14) * s, (0.8 - i * 0.62) * s); g.add(e);
  }
  g.userData = { patas, asas, corpoMat, tipo: 'boss' };
  return g;
}

// BOSS: cobra (rastejante) e crocodilo — maiores, mais vida/XP/loot.
export function criaCobra(x, z) {
  const g = new THREE.Group(); g.position.set(x, Y, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x3f7a3a, roughness: 0.7 });
  const segs = [];
  for (let i = 0; i < 7; i++) {
    const r = 0.45 - i * 0.04;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), corpoMat);
    seg.position.set(0, 0.35, -i * 0.6); seg.scale.z = 1.3; seg.castShadow = true; g.add(seg); segs.push(seg);
  }
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.7), corpoMat);
  cabeca.position.set(0, 0.4, 0.6); cabeca.castShadow = true; g.add(cabeca);
  [-0.16, 0.16].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), mat(0xd8c020));
    olho.position.set(ox, 0.52, 0.85); g.add(olho);
  });
  const lingua = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.3), mat(0xd83a5a));
  lingua.position.set(0, 0.38, 1.05); g.add(lingua);
  g.userData = { segs, corpoMat, tipo: 'boss' };
  return g;
}

export function criaCrocodilo(x, z) {
  const g = new THREE.Group(); g.position.set(x, Y, z);
  const corpoMat = new THREE.MeshStandardMaterial({ color: 0x4a5a38, roughness: 0.8 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 2.4), corpoMat);
  corpo.position.y = 0.35; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.1), corpoMat);
  cabeca.position.set(0, 0.32, 1.5); cabeca.castShadow = true; g.add(cabeca);
  const focinho = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.7), corpoMat);
  focinho.position.set(0, 0.24, 2.1); g.add(focinho);
  [-0.22, 0.22].forEach((ox) => {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), mat(0xe0d040));
    olho.position.set(ox, 0.55, 1.4); g.add(olho);
  });
  const patas = [];
  [[-0.45, 0.9], [0.45, 0.9], [-0.45, -0.9], [0.45, -0.9]].forEach(([px, pz]) => {
    const geo = new THREE.BoxGeometry(0.2, 0.3, 0.2); geo.translate(0, -0.15, 0);
    const pa = new THREE.Mesh(geo, corpoMat); pa.position.set(px, 0.3, pz); g.add(pa); patas.push(pa);
  });
  const rabo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 1.2), corpoMat);
  rabo.position.set(0, 0.3, -1.6); g.add(rabo);
  g.userData = { patas, corpoMat, tipo: 'boss' };
  return g;
}

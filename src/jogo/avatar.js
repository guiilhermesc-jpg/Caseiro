// =============================================================
//  AVATAR  ·  boneco blocky com mais qualidade (rosto/cabelo/mãos/pés),
//  SEXO (homem/mulher) e 4 MODELOS estilo Tibia (outfit no corpo):
//  aldeao · cacador · mago · cavaleiro.
//  cores = { casaco, pele, cabelo, calca?, sexo?, tipo? }.
//  Mantém userData.partes = { bracoEsq, bracoDir, pernaEsq, pernaDir }.
// =============================================================
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// RV3.0: caixa de cantos ARREDONDADOS — tira o look "caixote" do boneco
// (usada nas peças grandes; detalhes pequenos seguem em Box, mais barato)
const RBox = (w, h, d) => new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.18);

// GIRO SUAVE: interpola a rotação pelo arco mais curto (sem "teleportar" o
// ângulo) — usado pelo jogador, NPCs e monstros pra um andar de qualidade.
export function giraSuave(obj, alvo, f) {
  const d = Math.atan2(Math.sin(alvo - obj.rotation.y), Math.cos(alvo - obj.rotation.y));
  obj.rotation.y += d * Math.min(1, f);
}

// RV5.1 — AS QUATRO VOCAÇÕES (arquetipos clássicos do gênero, visual NOSSO):
// corpo-a-corpo, atirador, e dois conjuradores (e SEM chapéu de mago).
// Os tipos antigos (aldeao/cacador/mago) seguem existindo pra NPCs e saves.
export const MODELOS = ['cavaleiro', 'paladino', 'feiticeiro', 'druida'];
export const MODELO_NOME = {
  cavaleiro: 'Cavaleiro', paladino: 'Paladino', feiticeiro: 'Feiticeiro', druida: 'Druida',
  aldeao: 'Aldeão', cacador: 'Caçador', mago: 'Mago',
};
const LEGADOS = ['aldeao', 'cacador', 'mago'];

const PADRAO = { pele: 0xe0b088, casaco: 0x556b2f, calca: 0x2e3440, cabelo: 0x3a2c20, bota: 0x241d16 };
function mat(c, r = 0.85) { return new THREE.MeshStandardMaterial({ color: c, roughness: r }); }
function metal(c) { return new THREE.MeshStandardMaterial({ color: c, metalness: 0.7, roughness: 0.35 }); }
const matVerdeFolha = new THREE.MeshStandardMaterial({ color: 0x5d8f46, roughness: 0.9 }); // folhas do druida

function membro(larg, alt, material) {
  const geo = RBox(larg, alt, larg);
  geo.translate(0, -alt / 2, 0);
  const m = new THREE.Mesh(geo, material); m.castShadow = true; return m;
}

export function criaAvatar(cores = {}) {
  const sexo = cores.sexo || 'homem';
  const tipo = (MODELOS.includes(cores.tipo) || LEGADOS.includes(cores.tipo)) ? cores.tipo : 'cavaleiro';
  const C = {
    pele: cores.pele ?? PADRAO.pele,
    casaco: cores.casaco ?? PADRAO.casaco,
    calca: cores.calca ?? PADRAO.calca,
    cabelo: cores.cabelo ?? PADRAO.cabelo,
    bota: PADRAO.bota,
  };
  const fem = sexo === 'mulher';
  const g = new THREE.Group();

  // TRONCO (proporção por sexo) — RV3.0: cantos arredondados
  const torsoW = fem ? 0.82 : 1.0, torsoD = fem ? 0.48 : 0.55;
  const torso = new THREE.Mesh(RBox(torsoW, 1.2, torsoD), mat(C.casaco));
  torso.position.y = 1.5; torso.castShadow = true; g.add(torso);
  if (fem) {
    const cintura = new THREE.Mesh(RBox(0.7, 0.32, 0.46), mat(C.casaco));
    cintura.position.y = 0.96; g.add(cintura);
  }

  // PESCOÇO + CABEÇA
  const pescoco = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.32), mat(C.pele));
  pescoco.position.y = 2.2; g.add(pescoco);
  const cabeca = new THREE.Mesh(RBox(0.8, 0.8, 0.78), mat(C.pele));
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
    const mao = new THREE.Mesh(RBox(bracoW + 0.04, 0.28, bracoW + 0.06), mat(C.pele));
    mao.position.y = -0.95; mao.castShadow = true; b.add(mao);
  });

  // PERNAS + botas
  const pernaEsq = membro(0.34, 0.9, mat(C.calca)); pernaEsq.position.set(-0.22, 0.9, 0);
  const pernaDir = membro(0.34, 0.9, mat(C.calca)); pernaDir.position.set(0.22, 0.9, 0);
  [pernaEsq, pernaDir].forEach((p) => {
    const bota = new THREE.Mesh(RBox(0.38, 0.26, 0.56), mat(C.bota));
    bota.position.set(0, -0.82, 0.08); bota.castShadow = true; p.add(bota);
    const solado = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.6), mat(0x14100c));
    solado.position.set(0, -0.94, 0.09); p.add(solado);
  });
  g.add(bracoEsq, bracoDir, pernaEsq, pernaDir);

  const capa = aplicaOutfit(g, tipo, C);

  // tronco e capa entram nas partes: respiração no idle + capa que balança
  g.userData.partes = { bracoEsq, bracoDir, pernaEsq, pernaDir, tronco: torso, cabeca, capa };
  return g;
}

// CAPA com pivô no OMBRO (gira de cima, como pano de verdade) — RV3.0
function criaCapa(cor, h = 1.7) {
  const geo = RBox(1.0, h, 0.08);
  geo.translate(0, -h / 2, 0); // pivô em cima → balança como capa
  const capa = new THREE.Mesh(geo, mat(cor));
  capa.position.set(0, 2.32, -0.34);
  capa.rotation.x = 0.07;
  capa.castShadow = true;
  return capa;
}

// OUTFIT por modelo — aparece no corpo (Tibia-like). Devolve a CAPA (ou null)
// pra animaAvatar dar o balanço de pano. RV3.0: detalhes de DRAGÃO por classe.
function aplicaOutfit(g, tipo, C) {
  let capa = null;
  // CINTO + fivela (todos os modelos) — quebra o "bloco" do torso
  const cinto = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.18, 0.6), mat(0x3a2a1a));
  cinto.position.y = 0.98; g.add(cinto);
  const fivela = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.05), mat(0xd9a522, 0.3));
  fivela.position.set(0, 0.98, 0.31); g.add(fivela);

  if (tipo === 'aldeao') {
    const gola = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.6), mat(0xe8e0d0)); gola.position.y = 2.02; g.add(gola);
    const bolso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.04), mat(0x44521f)); bolso.position.set(-0.25, 1.42, 0.3); g.add(bolso);
    const remendo = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.04), mat(0x6a7a3a)); remendo.position.set(0.3, 1.7, 0.3); g.add(remendo);
  } else if (tipo === 'cacador') {
    const capuz = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.55, 0.96), mat(0x415035)); capuz.position.y = 2.98; capuz.castShadow = true; g.add(capuz);
    const bico = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.55, 4), mat(0x415035)); bico.position.set(0, 3.1, -0.34); bico.rotation.x = -0.6; g.add(bico);
    const colete = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.95, 0.64), mat(0x6e4a2a)); colete.position.y = 1.6; g.add(colete);
    [-0.5, 0.5].forEach((s) => { const tira = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.66), mat(0x4a3018)); tira.position.y = 1.6; tira.rotation.z = s * 0.5; g.add(tira); });
    const aljava = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 8), mat(0x5a3a1a)); aljava.position.set(0.35, 2.0, -0.42); aljava.rotation.x = 0.3; g.add(aljava);
    // RV3.0: COLAR COM PRESA DE DRAGÃO (troféu de caçador)
    const cordao = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 14), mat(0x4a3018));
    cordao.position.set(0, 2.06, 0.18); cordao.rotation.x = 1.25; g.add(cordao);
    const presa = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 6), mat(0xf0e8d6, 0.5));
    presa.position.set(0, 1.82, 0.34); presa.rotation.x = Math.PI; g.add(presa);
    capa = criaCapa(0x2f3d28, 1.5); g.add(capa); // capa de mata do caçador
  } else if (tipo === 'mago') {
    const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.08, 14), mat(0x342a66)); aba.position.y = 3.12; g.add(aba);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.2, 14), mat(0x342a66)); cone.position.y = 3.74; cone.castShadow = true; g.add(cone);
    const estrela = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat(0xffe27a, 0.3)); estrela.position.set(0, 3.5, 0.42); g.add(estrela);
    const manto = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.0, 1.7, 12), mat(C.casaco)); manto.position.y = 0.85; manto.castShadow = true; g.add(manto);
    capa = criaCapa(0x241a4a, 1.8); g.add(capa);
    // RV3.0: runa de dragão brilhando na capa do mago
    const runa = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x9a6aff, emissive: 0x6a3aff, emissiveIntensity: 0.7, roughness: 0.3 }));
    runa.position.set(0, -0.7, -0.08); capa.add(runa); // filha da capa → balança junto
    const gola = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.32, 0.62), mat(0x241a4a)); gola.position.y = 2.06; g.add(gola);
  } else if (tipo === 'paladino') {
    // PALADINO (RV5.1): atirador de elite — couro leve, bandoleira, aljava
    // farta e manto curto de campo. Faixa na testa (visão livre pra mirar).
    const colete = new THREE.Mesh(RBox(1.08, 1.0, 0.62), mat(0x7a5a34)); colete.position.y = 1.58; colete.castShadow = true; g.add(colete);
    [-0.3, 0, 0.3].forEach((oy) => { // tachas de metal no couro
      const tacha = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), metal(0xb8bcc4));
      tacha.position.set(0.34, 1.58 + oy, 0.33); g.add(tacha);
    });
    const bandoleira = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.3, 0.7), mat(0x4a3018));
    bandoleira.position.set(0, 1.6, 0); bandoleira.rotation.z = 0.55; g.add(bandoleira);
    const ombreira = new THREE.Mesh(RBox(0.42, 0.3, 0.62), mat(0x5a4326)); // só no braço do arco
    ombreira.position.set(-0.62, 2.05, 0); ombreira.castShadow = true; g.add(ombreira);
    const aljava = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.0, 8), mat(0x5a3a1a));
    aljava.position.set(0.32, 2.0, -0.42); aljava.rotation.x = 0.28; g.add(aljava);
    [-0.06, 0.04, 0.12].forEach((ox, i) => { // flechas aparecendo na aljava
      const pena = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 4), mat([0xc23a2a, 0xe8e0d0, 0x2a6ba0][i]));
      pena.position.set(0.32 + ox, 2.56, -0.56 - i * 0.02); g.add(pena);
    });
    const faixa = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.12, 0.82), mat(0x2a5a3a));
    faixa.position.y = 2.86; g.add(faixa);
    capa = criaCapa(0x3d5a35, 1.15); g.add(capa); // manto curto de campo
  } else if (tipo === 'feiticeiro') {
    // FEITICEIRO (RV5.1): robe arcano SEM chapéu — gola alta, livro no
    // cinto e runa viva no peito (o poder mora nele, não no figurino).
    const manto = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.0, 1.7, 12), mat(0x3a2a5a)); manto.position.y = 0.85; manto.castShadow = true; g.add(manto);
    const gola = new THREE.Mesh(RBox(0.7, 0.42, 0.7), mat(0x2a1e44)); gola.position.y = 2.1; g.add(gola);
    const runaPeito = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x9a6aff, emissive: 0x6a3aff, emissiveIntensity: 0.8, roughness: 0.3 }));
    runaPeito.position.set(0, 1.78, 0.34); g.add(runaPeito);
    const livro = new THREE.Mesh(RBox(0.34, 0.42, 0.14), mat(0x6a1f2a)); // grimório no cinto
    livro.position.set(-0.5, 1.02, 0.26); livro.rotation.z = 0.18; g.add(livro);
    [-0.26, 0.26].forEach((ox) => { // detalhes bordados na barra do robe
      const borda = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.06), mat(0xd9a522, 0.4));
      borda.position.set(ox, 0.4, 0.55); g.add(borda);
    });
    capa = criaCapa(0x241a4a, 1.8); g.add(capa);
  } else if (tipo === 'druida') {
    // DRUIDA (RV5.1): túnica de musgo, cinto de corda, coroa de folhas e
    // bolsa de ervas — a floresta anda com ele.
    const tunica = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.95, 1.65, 12), mat(0x4a6a3a)); tunica.position.y = 0.88; tunica.castShadow = true; g.add(tunica);
    const corda = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 14), mat(0x9a7a44));
    corda.position.y = 1.05; corda.rotation.x = Math.PI / 2; g.add(corda);
    const bolsa = new THREE.Mesh(RBox(0.3, 0.34, 0.18), mat(0x6e4a2a)); // ervas da cura
    bolsa.position.set(0.46, 0.96, 0.3); g.add(bolsa);
    for (let i = 0; i < 8; i++) { // COROA DE FOLHAS
      const a = (i / 8) * Math.PI * 2;
      const folha = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 4), matVerdeFolha);
      folha.position.set(Math.cos(a) * 0.42, 3.0, Math.sin(a) * 0.4);
      folha.rotation.z = Math.cos(a) * 0.5; folha.rotation.x = -Math.sin(a) * 0.5; g.add(folha);
    }
    [-0.6, 0.6].forEach((ox) => { // folhagem nos ombros
      const tufo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), matVerdeFolha);
      tufo.position.set(ox, 2.16, 0); g.add(tufo);
    });
    capa = criaCapa(0x39512f, 1.4); g.add(capa);
  } else if (tipo === 'cavaleiro') {
    capa = criaCapa(0x8a1a1a, 1.7); g.add(capa);
    // RV3.0: emblema DOURADO do dragão costurado na capa (balança junto)
    const emblema = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.04), mat(0xd9a522, 0.35));
    emblema.position.set(0, -0.6, -0.07); capa.add(emblema);
    const peito = new THREE.Mesh(RBox(1.16, 1.04, 0.66), metal(0xb8bcc4)); peito.position.y = 1.55; peito.castShadow = true; g.add(peito);
    const placa = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.46, 0.68), metal(0xa0a4ac)); placa.position.y = 1.2; g.add(placa);
    [-0.68, 0.68].forEach((ox) => {
      const om = new THREE.Mesh(RBox(0.46, 0.34, 0.66), metal(0xc8ccd4)); om.position.set(ox, 2.05, 0); om.castShadow = true; g.add(om);
      // RV3.0: ESPINHO DE DRAGÃO nas ombreiras
      const esp = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 6), metal(0xc8ccd4));
      esp.position.set(ox, 2.3, 0); g.add(esp);
    });
    const gorja = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), metal(0x9a9ea6)); gorja.position.y = 2.12; g.add(gorja);
    const elmo = new THREE.Mesh(RBox(0.92, 0.92, 0.9), metal(0xb0b4bc)); elmo.position.y = 2.6; elmo.castShadow = true; g.add(elmo);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.05), mat(0x101010)); visor.position.set(0, 2.62, 0.45); g.add(visor);
    // RV3.0: CHIFRES DE DRAGÃO no elmo + crista
    [-0.34, 0.34].forEach((ox) => {
      const chifre = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 6), mat(0xf0e8d6, 0.5));
      chifre.position.set(ox, 3.12, 0.1); chifre.rotation.z = ox > 0 ? -0.4 : 0.4; g.add(chifre);
    });
    const crista = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.36, 0.5), mat(0xc0202a)); crista.position.set(0, 3.2, 0); g.add(crista);
  }
  return capa;
}

export function animaAvatar(avatar, movendo, tempo, correndo = false) {
  const p = avatar.userData.partes;
  if (!p) return;
  if (movendo) {
    const vel = correndo ? 14 : 9, amp = correndo ? 1.0 : 0.7;
    const s = Math.sin(tempo * vel) * amp;
    const pisada = Math.abs(Math.sin(tempo * vel));
    p.pernaEsq.rotation.x = s; p.pernaDir.rotation.x = -s;
    p.bracoEsq.rotation.x = -s; p.bracoDir.rotation.x = s;
    if (p.tronco) {
      p.tronco.rotation.x += ((correndo ? -0.1 : -0.055) - p.tronco.rotation.x) * 0.18;
      p.tronco.position.y = 1.5 + pisada * 0.025;
    }
    if (p.cabeca) {
      p.cabeca.rotation.x += ((correndo ? -0.045 : -0.025) - p.cabeca.rotation.x) * 0.14;
      p.cabeca.position.y = 2.6 + pisada * 0.018;
    }
    // RV3.0: capa VOA atrás ao andar/correr (pano de verdade)
    if (p.capa) p.capa.rotation.x = (correndo ? 0.5 : 0.28) + Math.sin(tempo * vel * 0.5) * 0.08;
  } else {
    ['pernaEsq', 'pernaDir', 'bracoEsq', 'bracoDir'].forEach((k) => { p[k].rotation.x *= 0.8; });
    // RV3.0: parado o boneco RESPIRA (tronco sobe/desce sutil) e a capa assenta
    if (p.capa) p.capa.rotation.x += (0.07 + Math.sin(tempo * 1.6) * 0.03 - p.capa.rotation.x) * 0.1;
    if (p.tronco) p.tronco.rotation.x *= 0.84;
    if (p.cabeca) {
      p.cabeca.rotation.x *= 0.86;
      p.cabeca.position.y += (2.6 + Math.sin(tempo * 2.2) * 0.012 - p.cabeca.position.y) * 0.16;
    }
  }
  if (p.tronco && !movendo) p.tronco.position.y = 1.5 + Math.sin(tempo * 2.2) * 0.022;
}

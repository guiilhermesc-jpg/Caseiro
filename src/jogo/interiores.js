// =============================================================
//  INTERIORES  ·  casa que dá pra ENTRAR.
//  Paredes ocas (axis-aligned) com vão de PORTA num lado; a porta
//  abre/fecha na AÇÃO (animada). O telhado é devolvido à parte para
//  SUMIR quando o jogador entra. Interior mobiliado.
//  Devolve { grupo, colisores, interativo (porta), animados, casa }.
// =============================================================
import * as THREE from 'three';
import { mat, criaJanela, texturaPedra } from './construcoes.js';

export function criaCasaInterior(x, z, opts = {}) {
  const { larg = 9, prof = 9, alt = 4, frente = 'sul', cor = 0xd8c4a0, corTelhado = 0x8a4632 } = opts;
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const t = 0.3, hx = larg / 2, hz = prof / 2, gw = 4.6; // vão BEM largo (entrada fácil)
  const paredeMat = mat(cor);
  const colisores = [];

  // chão de tábua
  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.1, prof), mat(0x8a6a44));
  chao.position.y = 0.05; chao.receiveShadow = true; g.add(chao);

  // segmento de parede (caixa) + colisor em coords do mundo
  function muro(cx, cz, w, d, semCol) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), paredeMat);
    m.position.set(cx, alt / 2, cz); m.castShadow = true; m.receiveShadow = true; g.add(m);
    if (!semCol) colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  }
  function ladoCheio(lado) {
    if (lado === 'sul') muro(0, -hz, larg, t);
    else if (lado === 'norte') muro(0, hz, larg, t);
    else if (lado === 'oeste') muro(-hx, 0, t, prof);
    else muro(hx, 0, t, prof);
  }
  function ladoComVao(lado) {
    const vert = alt - 2.6; // verga acima da porta
    if (lado === 'sul' || lado === 'norte') {
      const cz = lado === 'sul' ? -hz : hz, seg = (larg - gw) / 2;
      muro(-(gw / 2 + seg / 2), cz, seg, t); // laterais sólidas; só o vão da porta abre
      muro(gw / 2 + seg / 2, cz, seg, t);
      const verga = new THREE.Mesh(new THREE.BoxGeometry(gw, vert, t), paredeMat);
      verga.position.set(0, alt - vert / 2, cz); g.add(verga);
    } else {
      const cx = lado === 'oeste' ? -hx : hx, seg = (prof - gw) / 2;
      muro(cx, -(gw / 2 + seg / 2), t, seg);
      muro(cx, gw / 2 + seg / 2, t, seg);
      const verga = new THREE.Mesh(new THREE.BoxGeometry(t, vert, gw), paredeMat);
      verga.position.set(cx, alt - vert / 2, 0); g.add(verga);
    }
  }
  ['sul', 'norte', 'oeste', 'leste'].forEach((l) => { if (l === frente) ladoComVao(l); else ladoCheio(l); });

  // janelas variadas nas paredes que não têm a porta
  ['sul', 'norte', 'oeste', 'leste'].forEach((l) => {
    if (l === frente) return;
    const j = criaJanela({ cruz: true, shutters: Math.random() < 0.6, floreira: Math.random() < 0.4 });
    if (l === 'sul') j.position.set(0, 1.9, -hz - 0.07);
    else if (l === 'norte') { j.position.set(0, 1.9, hz + 0.07); j.rotation.y = Math.PI; }
    else if (l === 'oeste') { j.position.set(-hx - 0.07, 1.9, 0); j.rotation.y = -Math.PI / 2; }
    else { j.position.set(hx + 0.07, 1.9, 0); j.rotation.y = Math.PI / 2; }
    g.add(j);
  });

  // PORTA (folha) com dobradiça na borda do vão
  const dobr = new THREE.Group();
  const folhaMat = mat(0x5a3a22);
  let folha, dpx = x, dpz = z;
  if (frente === 'sul' || frente === 'norte') {
    const cz = frente === 'sul' ? -hz : hz;
    dobr.position.set(-gw / 2, 0, cz);
    folha = new THREE.Mesh(new THREE.BoxGeometry(gw, 2.4, t * 0.8), folhaMat);
    folha.position.set(gw / 2, 1.2, 0);
    dpz = z + cz;
  } else {
    const cx = frente === 'oeste' ? -hx : hx;
    dobr.position.set(cx, 0, -gw / 2);
    folha = new THREE.Mesh(new THREE.BoxGeometry(t * 0.8, 2.4, gw), folhaMat);
    folha.position.set(0, 1.2, gw / 2);
    dpx = x + cx;
  }
  folha.castShadow = true;
  const macaneta = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mat(0xd9a522, 0.3));
  macaneta.position.set(folha.position.x * 1.6, 1.2, folha.position.z * 1.6);
  dobr.add(folha); dobr.add(macaneta); g.add(dobr);

  // estado/animação da porta (lerp suave no loop via animaProps)
  const angAberto = 1.45 * ((frente === 'sul' || frente === 'leste') ? 1 : -1);
  const animPorta = { mesh: dobr, porta: true, alvo: angAberto }; // porta começa ABERTA (entrada livre)

  // MOBÍLIA (decorativa; interior fica livre pra andar)
  const mad = mat(0x6e4a2a), tecido = mat(0x9a4a4a);
  // cama
  const cama = new THREE.Group();
  cama.add(meshBox(1.8, 0.5, 2.4, mad, 0, 0.25, 0));
  cama.add(meshBox(1.7, 0.18, 2.2, tecido, 0, 0.55, 0));
  cama.add(meshBox(1.6, 0.22, 0.5, mat(0xeae0d0), 0, 0.62, -0.85)); // travesseiro
  cama.position.set(-(hx - 1.3), 0, -(hz - 1.6)); g.add(cama);
  // mesa + 2 cadeiras
  const mesa = new THREE.Group();
  mesa.add(meshBox(1.6, 0.15, 1.0, mad, 0, 0.95, 0));
  [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]].forEach(([px, pz]) => mesa.add(meshBox(0.12, 0.95, 0.12, mad, px, 0.47, pz)));
  mesa.position.set(hx - 2.6, 0, 0.4); g.add(mesa);
  [[-0.9], [0.9]].forEach(([oz]) => {
    const cad = new THREE.Group();
    cad.add(meshBox(0.6, 0.1, 0.6, mad, 0, 0.55, 0));
    cad.add(meshBox(0.6, 0.7, 0.1, mad, 0, 0.85, -0.25));
    cad.position.set(hx - 2.6, 0, 0.4 + oz); g.add(cad);
  });
  // lareira (parede oposta à porta, num canto)
  const lar = new THREE.Group();
  lar.add(meshBox(1.6, 1.6, 0.6, mat(0x8a8276), 0, 0.8, 0));
  lar.add(meshBox(1.0, 0.9, 0.3, mat(0x201510), 0, 0.55, 0.2));
  lar.add(meshBox(0.6, 0.4, 0.2, mat(0xff7a2a), 0, 0.4, 0.3)); // fogo
  lar.position.set(hx - 1.0, 0, hz - 0.6); g.add(lar);
  // tapete
  const tapete = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 1.8), mat(0x7a3a3a));
  tapete.position.set(0, 0.11, 0); g.add(tapete);

  // telhado piramidal (SOME quando o jogador entra)
  const hTelh = alt * 0.55 + 1.2;
  const telhado = new THREE.Mesh(new THREE.ConeGeometry(Math.max(larg, prof) * 0.78, hTelh, 4), mat(corTelhado));
  telhado.position.set(0, alt + hTelh / 2 - 0.1, 0); telhado.rotation.y = Math.PI / 4; telhado.castShadow = true; g.add(telhado);

  // marcador flutuante 🏠 (achar a entrada de longe)
  const cnv = document.createElement('canvas'); cnv.width = 128; cnv.height = 128;
  const cx2 = cnv.getContext('2d'); cx2.font = '90px Arial'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle'; cx2.fillText('🏠', 64, 70);
  const marc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthTest: false }));
  marc.scale.set(2.2, 2.2, 1); marc.position.y = alt + hTelh + 1.5; marc.renderOrder = 997; g.add(marc);
  // 🚪 no ponto exato de entrar
  const cnv2 = document.createElement('canvas'); cnv2.width = 128; cnv2.height = 128;
  const c2 = cnv2.getContext('2d'); c2.font = '88px Arial'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('🚪', 64, 70);
  const marcP = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv2), transparent: true, depthTest: false }));
  marcP.scale.set(1.6, 1.6, 1); marcP.position.set((dpx - x) * 1.1, 2.7, (dpz - z) * 1.1); marcP.renderOrder = 997; g.add(marcP);

  // colisor do VÃO da porta — bloqueia quando FECHADA, libera quando abre perto
  const portaCol = (frente === 'sul' || frente === 'norte')
    ? { minX: x - gw / 2, maxX: x + gw / 2, minZ: dpz - 0.45, maxZ: dpz + 0.45 }
    : { minX: dpx - 0.45, maxX: dpx + 0.45, minZ: z - gw / 2, maxZ: z + gw / 2 };

  const box = { minX: x - hx + 0.5, maxX: x + hx - 0.5, minZ: z - hz + 0.5, maxZ: z + hz - 0.5 };
  return {
    grupo: g, colisores,
    animados: [animPorta],
    casa: { roof: telhado, box, portaAnim: animPorta, angAberto, px: dpx, pz: dpz, portaCol, aberta: true }, // nasce ABERTA
  };
}

function meshBox(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}

// =============================================================
//  HOSPITAL de Venore · ENTRÁVEL (a porta que se vê AGORA FUNCIONA).
//  Macas com lençol, mesa de poções e armário; a curandeira atende
//  lá dentro. Telhado some ao entrar. Cruz vermelha na fachada.
// =============================================================
export function criaHospitalInterior(x, z) {
  const larg = 13, prof = 16, alt = 7, gw = 4.2, t = 0.4;
  const hx = larg / 2, hz = prof / 2;
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const parede = mat(0xeef0f2), branco = mat(0xf8f8f8, 0.8), mad = mat(0x8a6a44);
  const colisores = [];

  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.1, prof), mat(0xd8d8d2, 1));
  chao.position.y = 0.05; chao.receiveShadow = true; g.add(chao);

  function muro(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), parede);
    m.position.set(cx, alt / 2, cz); m.castShadow = m.receiveShadow = true; g.add(m);
    colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  }
  muro(0, -hz, larg, t); muro(0, hz, larg, t);   // norte/sul
  muro(hx, 0, t, prof);                            // leste (fundo)
  const seg = (prof - gw) / 2;                     // OESTE com vão (porta vira pra praça)
  muro(-hx, -(gw / 2 + seg / 2), t, seg); muro(-hx, gw / 2 + seg / 2, t, seg);
  const verga = new THREE.Mesh(new THREE.BoxGeometry(t, alt - 3.4, gw), parede);
  verga.position.set(-hx, alt - (alt - 3.4) / 2, 0); g.add(verga);

  // CRUZ VERMELHA na fachada (acima da porta)
  const cruzMat = mat(0xd83a3a);
  const cv = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.6), cruzMat); cv.position.set(-hx - 0.1, 5.2, 0); g.add(cv);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 2.2), cruzMat); ch.position.set(-hx - 0.1, 5.2, 0); g.add(ch);

  // janelas nas paredes norte/sul
  [[-2.5, -hz], [2.5, -hz], [-2.5, hz], [2.5, hz]].forEach(([jx, jz]) => {
    const j = criaJanela({ cruz: true });
    j.position.set(jx, 2.6, jz + (jz > 0 ? 0.07 : -0.07));
    if (jz > 0) j.rotation.y = Math.PI;
    g.add(j);
  });

  // MACAS (3) encostadas na parede leste: estrutura + colchão + manta vermelha
  for (let i = 0; i < 3; i++) {
    const mz = -4.5 + i * 4.5;
    const maca = new THREE.Group(); maca.position.set(hx - 1.7, 0, mz);
    maca.add(meshBox(2.4, 0.5, 1.3, mad, 0, 0.3, 0));
    maca.add(meshBox(2.3, 0.16, 1.2, branco, 0, 0.62, 0));
    maca.add(meshBox(1.3, 0.1, 1.18, mat(0xc23a3a), -0.4, 0.7, 0));
    maca.add(meshBox(0.5, 0.14, 0.9, branco, 0.85, 0.68, 0)); // travesseiro
    g.add(maca);
    colisores.push({ minX: x + hx - 2.9, maxX: x + hx - 0.5, minZ: z + mz - 0.7, maxZ: z + mz + 0.7 });
  }
  // MESA DE POÇÕES + frascos coloridos brilhando de leve
  const mesa = new THREE.Group(); mesa.position.set(-hx + 1.6, 0, -hz + 1.8);
  mesa.add(meshBox(2.2, 0.12, 1.0, mad, 0, 1.0, 0));
  [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]].forEach(([px, pz]) => mesa.add(meshBox(0.1, 1.0, 0.1, mad, px, 0.5, pz)));
  [0xd84a4a, 0x4ad86a, 0x4a8ad8].forEach((cor, i) => {
    const frasco = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.25, transparent: true, opacity: 0.9 }));
    frasco.position.set(-0.6 + i * 0.6, 1.22, 0); mesa.add(frasco);
  });
  g.add(mesa);
  colisores.push({ minX: x - hx + 0.4, maxX: x - hx + 2.8, minZ: z - hz + 1.2, maxZ: z - hz + 2.4 });
  // armário de remédios
  const arm = meshBox(1.2, 2.6, 0.6, mad, hx - 0.9, 1.3, hz - 0.8); g.add(arm);
  colisores.push({ minX: x + hx - 1.6, maxX: x + hx - 0.3, minZ: z + hz - 1.2, maxZ: z + hz - 0.4 });

  // telhado duas águas cinza-azulado (some ao entrar)
  const roof = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-hx - 0.6, 0); shape.lineTo(hx + 0.6, 0); shape.lineTo(0, 3.4); shape.closePath();
  const geoT = new THREE.ExtrudeGeometry(shape, { depth: prof + 1.2, bevelEnabled: false });
  geoT.translate(0, 0, -(prof + 1.2) / 2);
  const telh = new THREE.Mesh(geoT, mat(0xb0b6bc));
  telh.position.y = alt; telh.castShadow = true; roof.add(telh);
  g.add(roof);

  // marcador 🏥
  const cnv = document.createElement('canvas'); cnv.width = 128; cnv.height = 128;
  const cx2 = cnv.getContext('2d'); cx2.font = '90px Arial'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle'; cx2.fillText('🏥', 64, 70);
  const marc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthTest: false }));
  marc.scale.set(2.4, 2.4, 1); marc.position.y = alt + 4.6; marc.renderOrder = 997; g.add(marc);

  const box = { minX: x - hx + 0.5, maxX: x + hx - 0.5, minZ: z - hz + 0.5, maxZ: z + hz - 0.5 };
  return {
    grupo: g, colisores,
    casa: { roof, box, px: x - hx, pz: z, aberta: true }, // porta oeste sempre aberta
  };
}

// =============================================================
//  TEMPLO SAGRADO de Venore · ENTRÁVEL, com altar, vitrais, bancos
//  e velas. É o ponto de RENASCIMENTO quando o jogador morre.
//  Porta (vão largo) virada pra praça; telhado+torre somem ao entrar.
// =============================================================
export function criaTemploSagrado(x, z) {
  const larg = 16, prof = 20, alt = 6.5, gw = 5, t = 0.4;
  const hx = larg / 2, hz = prof / 2;
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0xded8c8), pedraEsc = mat(0xb8b0a0, 1), ouroM = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.75, roughness: 0.3 });
  const colisores = [];

  // piso de pedra calçada
  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.12, prof),
    new THREE.MeshStandardMaterial({ map: texturaPedra(5), roughness: 1 }));
  chao.position.y = 0.06; chao.receiveShadow = true; g.add(chao);

  function muro(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), pedra);
    m.position.set(cx, alt / 2, cz); m.castShadow = m.receiveShadow = true; g.add(m);
    colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  }
  muro(0, -hz, larg, t);                       // fundo (sul)
  muro(-hx, 0, t, prof); muro(hx, 0, t, prof); // laterais
  const seg = (larg - gw) / 2;                 // frente (norte) com vão largo
  muro(-(gw / 2 + seg / 2), hz, seg, t); muro(gw / 2 + seg / 2, hz, seg, t);
  const verga = new THREE.Mesh(new THREE.BoxGeometry(gw, alt - 3.4, t), pedra);
  verga.position.set(0, alt - (alt - 3.4) / 2, hz); g.add(verga);
  // colunas flanqueando a entrada
  [-gw / 2 - 0.6, gw / 2 + 0.6].forEach((cx) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 3.6, 10), pedraEsc);
    c.position.set(cx, 1.8, hz + 0.8); c.castShadow = true; g.add(c);
  });

  // VITRAIS coloridos nas laterais (brilham de leve)
  const coresVitral = [0x7a4ad8, 0x4a8ad8, 0xd84a6a, 0x4ad88a];
  [-1, 1].forEach((lado, li) => {
    [-5, 0, 5].forEach((vz, vi) => {
      const vid = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 1.2),
        new THREE.MeshStandardMaterial({ color: coresVitral[(li * 2 + vi) % 4], roughness: 0.2, metalness: 0.1, emissive: coresVitral[(li * 2 + vi) % 4], emissiveIntensity: 0.35, transparent: true, opacity: 0.85 }));
      vid.position.set(lado * (hx + 0.03), 3.4, vz); g.add(vid);
      const mold = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.0, 1.5), pedraEsc);
      mold.position.set(lado * (hx + 0.01), 3.4, vz); g.add(mold);
    });
  });

  // ALTAR no fundo: plataforma + mesa + CRISTAL dourado (pulsa) + estátua
  const plat = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 4), pedraEsc);
  plat.position.set(0, 0.25, -hz + 2.6); g.add(plat);
  const mesa = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 1.2), pedra);
  mesa.position.set(0, 1.05, -hz + 2.4); mesa.castShadow = true; g.add(mesa);
  colisores.push({ minX: x - 1.3, maxX: x + 1.3, minZ: z - hz + 1.8, maxZ: z - hz + 3.0 });
  const cristalMat = new THREE.MeshStandardMaterial({ color: 0xffe27a, emissive: 0xffc83a, emissiveIntensity: 0.8, roughness: 0.2 });
  const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), cristalMat);
  cristal.position.set(0, 2.3, -hz + 2.4); g.add(cristal);
  // estátua do guardião (dourada) atrás do altar
  const est = new THREE.Group(); est.position.set(0, 0.5, -hz + 0.9);
  est.add(meshBox(0.9, 1.6, 0.5, ouroM, 0, 1.3, 0));
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), ouroM); cab.position.y = 2.45; est.add(cab);
  est.add(meshBox(1.4, 0.18, 0.18, ouroM, 0, 1.9, 0)); // braços abertos (bênção)
  g.add(est);

  // BANCOS (2 colunas × 3 fileiras) virados pro altar + tapete central
  const mad = mat(0x6e4a2a);
  for (const bx of [-3.8, 3.8]) for (let fz = -2; fz <= 6; fz += 4) { // corredor central largo (renascer confortável)
    const banco = new THREE.Group(); banco.position.set(bx, 0, fz);
    banco.add(meshBox(3.4, 0.16, 0.9, mad, 0, 0.62, 0));
    banco.add(meshBox(3.4, 0.8, 0.14, mad, 0, 1.0, 0.45));
    [-1.4, 1.4].forEach((px) => banco.add(meshBox(0.16, 0.62, 0.8, mad, px, 0.31, 0)));
    g.add(banco);
    colisores.push({ minX: x + bx - 1.7, maxX: x + bx + 1.7, minZ: z + fz - 0.5, maxZ: z + fz + 0.6 });
  }
  const tapete = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, prof - 4), mat(0x8a2a2a));
  tapete.position.set(0, 0.13, 1); g.add(tapete);

  // VELAS nos cantos (chama emissiva)
  [[-hx + 1.2, -hz + 1.4], [hx - 1.2, -hz + 1.4], [-hx + 1.2, hz - 1.6], [hx - 1.2, hz - 1.6]].forEach(([vx, vz]) => {
    const cand = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.5, 8), pedraEsc);
    cand.position.set(vx, 0.75, vz); g.add(cand);
    const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 8), mat(0xf0ead8));
    vela.position.set(vx, 1.65, vz); g.add(vela);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffb04a, emissive: 0xff7a2a, emissiveIntensity: 1 }));
    chama.position.set(vx, 1.92, vz); g.add(chama);
  });

  // TELHADO duas águas + torre sineira com cruz dourada (somem ao entrar)
  const roof = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-hx - 0.6, 0); shape.lineTo(hx + 0.6, 0); shape.lineTo(0, 4.2); shape.closePath();
  const geoT = new THREE.ExtrudeGeometry(shape, { depth: prof + 1.2, bevelEnabled: false });
  geoT.translate(0, 0, -(prof + 1.2) / 2);
  const telh = new THREE.Mesh(geoT, mat(0x6a4a8a));
  telh.position.y = alt; telh.castShadow = true; roof.add(telh);
  const torre = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4, 2.6), pedra);
  torre.position.set(0, alt + 4.4, -hz + 2.4); torre.castShadow = true; roof.add(torre);
  const topoT = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.2, 4), mat(0x6a4a8a));
  topoT.position.set(0, alt + 7.5, -hz + 2.4); topoT.rotation.y = Math.PI / 4; roof.add(topoT);
  const cv = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.6, 0.22), ouroM); cv.position.set(0, alt + 9.3, -hz + 2.4); roof.add(cv);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.22), ouroM); ch.position.set(0, alt + 9.5, -hz + 2.4); roof.add(ch);
  g.add(roof);

  // marcador ⛪ flutuante
  const cnv = document.createElement('canvas'); cnv.width = 128; cnv.height = 128;
  const cx2 = cnv.getContext('2d'); cx2.font = '90px Arial'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle'; cx2.fillText('⛪', 64, 70);
  const marc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthTest: false }));
  marc.scale.set(2.6, 2.6, 1); marc.position.y = alt + 11; marc.renderOrder = 997; g.add(marc);

  const box = { minX: x - hx + 0.5, maxX: x + hx - 0.5, minZ: z - hz + 0.5, maxZ: z + hz - 0.5 };
  return {
    grupo: g, colisores,
    animados: [{ mesh: cristal, pulsa: cristalMat, gira: 0.8, fase: 0 }],
    casa: { roof, box, px: x, pz: z + hz, aberta: true }, // sem porta: o templo é sempre aberto
    interativo: { x, z: z - hz + 4, raio: 3.2, titulo: '⛪ Altar Sagrado', acao: 'Orar 🙏', msg: 'Uma paz profunda toma conta de você. É aqui que os caídos renascem.' },
  };
}

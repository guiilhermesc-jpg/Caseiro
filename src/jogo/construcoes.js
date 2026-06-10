// =============================================================
//  CONSTRUÇÕES MODULARES  ·  peças reutilizáveis (economia!).
//  Proporções pensadas para o avatar (~3 unidades de altura).
//  Cada função devolve { grupo, colisores:[{minX,maxX,minZ,maxZ}], ... }.
// =============================================================
import * as THREE from 'three';

const matCache = {};
export function mat(cor, rough = 0.9) {
  const k = cor + '_' + rough;
  if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color: cor, roughness: rough });
  return matCache[k];
}

// VIDRO de janela compartilhado (leve reflexo + brilho fraco → "vidro" de verdade)
export const VIDRO = new THREE.MeshStandardMaterial({ color: 0x9fd0e0, roughness: 0.18, metalness: 0.18, emissive: 0x24506a, emissiveIntensity: 0.3 });

// textura procedural de PEDRA/calçamento (paralelepípedos com junta) p/ praças e pisos
let _texPedra = null;
export function texturaPedra(rep = 6) {
  if (!_texPedra) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#6f675c'; x.fillRect(0, 0, 128, 128); // junta escura
    const cell = 32, tons = ['#9a9183', '#8a8175', '#a39a8a', '#857c70', '#938a7c'];
    for (let gy = 0; gy < 128; gy += cell) {
      const off = (gy / cell) % 2 ? cell / 2 : 0; // fiada deslocada (alvenaria)
      for (let gx = -cell; gx < 128; gx += cell) {
        x.fillStyle = tons[Math.floor(Math.random() * tons.length)];
        x.fillRect(gx + off + 2, gy + 2, cell - 4, cell - 4);
      }
    }
    for (let i = 0; i < 500; i++) { x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }
    _texPedra = new THREE.CanvasTexture(c);
    _texPedra.wrapS = _texPedra.wrapT = THREE.RepeatWrapping;
  }
  const t = _texPedra.clone(); t.needsUpdate = true; t.repeat.set(rep, rep); return t;
}

function _jbox(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); return m;
}

// JANELA variada (vidro + moldura; opcional cruzeta, postigos, floreira c/ flores).
// O vidro fica virado para +Z; o chamador posiciona/gira na parede.
export function criaJanela(opts = {}) {
  const { w = 1.3, h = 1.3, cruz = true, shutters = false, floreira = false, cor = 0x9fd0e0 } = opts;
  const g = new THREE.Group();
  const moldura = mat(0xede6d2), vidro = VIDRO, fr = 0.1;
  g.add(_jbox(w, h, 0.06, vidro, 0, 0, 0));
  g.add(_jbox(w + fr, fr, 0.12, moldura, 0, h / 2, 0));
  g.add(_jbox(w + fr, fr, 0.12, moldura, 0, -h / 2, 0));
  g.add(_jbox(fr, h + fr, 0.12, moldura, -w / 2, 0, 0));
  g.add(_jbox(fr, h + fr, 0.12, moldura, w / 2, 0, 0));
  if (cruz) { g.add(_jbox(w, 0.06, 0.1, moldura, 0, 0, 0)); g.add(_jbox(0.06, h, 0.1, moldura, 0, 0, 0)); }
  if (shutters) [-1, 1].forEach((s) => {
    g.add(_jbox(w * 0.52, h, 0.05, mat(0x6a4a8a), s * (w * 0.52 / 2 + w / 2 + 0.03), 0, 0.05));
  });
  if (floreira) {
    g.add(_jbox(w + 0.2, 0.22, 0.3, mat(0x6e4a2a), 0, -h / 2 - 0.16, 0.16));
    const cores = [0xe85d75, 0xf2c14e, 0xd06ad0, 0xff8a4c];
    [-0.35, 0, 0.35].forEach((ox) => {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), mat(cores[Math.floor(Math.random() * cores.length)]));
      fl.position.set(ox, -h / 2 - 0.02, 0.24); g.add(fl);
    });
  }
  return g;
}

// telhado de DUAS ÁGUAS com beiral (cobre o retângulo certinho -> bordas coerentes)
function telhadoDuasAguas(larg, prof, hTelh, cor, baseY) {
  const ov = 0.5; // beiral (overhang)
  const shape = new THREE.Shape();
  shape.moveTo(-larg / 2 - ov, 0);
  shape.lineTo(larg / 2 + ov, 0);
  shape.lineTo(0, hTelh);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: prof + ov * 2, bevelEnabled: false });
  geo.translate(0, 0, -(prof + ov * 2) / 2);
  const m = new THREE.Mesh(geo, mat(cor));
  m.position.y = baseY; m.castShadow = true;
  return m;
}

// prédio de vilarejo: corpo + telhado piramidal + porta + janelas
export function criaPredio(opts) {
  const {
    x = 0, z = 0, larg = 9, prof = 9, alt = 7,
    cor = 0xcab79a, corTelhado = 0x884b2a, rot = 0, janelas = true,
  } = opts;
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;

  const corpo = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, prof), mat(cor));
  corpo.position.y = alt / 2; corpo.castShadow = true; corpo.receiveShadow = true; g.add(corpo);

  g.add(telhadoDuasAguas(larg, prof, Math.max(2.4, alt * 0.42), corTelhado, alt));

  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.2, 0.25), mat(0x3a2a1a));
  porta.position.set(0, 1.6, prof / 2 + 0.02); g.add(porta);

  if (janelas) {
    const estilo = () => ({ cruz: true, shutters: Math.random() < 0.5, floreira: Math.random() < 0.35 });
    const yJ = Math.min(alt * 0.6, alt - 1.4);
    // frente
    [-larg * 0.28, larg * 0.28].forEach((jx) => {
      const j = criaJanela(estilo()); j.position.set(jx, yJ, prof / 2 + 0.07); g.add(j);
    });
    // laterais (prédios mais fundos ganham janelas nos lados)
    if (prof >= 9) {
      [-prof * 0.24, prof * 0.24].forEach((jz) => {
        const jE = criaJanela(estilo()); jE.position.set(-larg / 2 - 0.07, yJ, jz); jE.rotation.y = -Math.PI / 2; g.add(jE);
        const jD = criaJanela(estilo()); jD.position.set(larg / 2 + 0.07, yJ, jz); jD.rotation.y = Math.PI / 2; g.add(jD);
      });
    }
  }

  const girado = Math.abs(Math.sin(rot)) > 0.5;
  const wA = girado ? prof : larg, dA = girado ? larg : prof;
  const colisores = [{ minX: x - wA / 2, maxX: x + wA / 2, minZ: z - dA / 2, maxZ: z + dA / 2 }];
  return { grupo: g, colisores };
}

// marcos (variações + adereços)
export function criaMarco(tipo, opts) {
  const base = { x: 0, z: 0, rot: 0, ...opts };
  let res;
  if (tipo === 'igreja') {
    res = criaPredio({ ...base, larg: 14, prof: 20, alt: 12, cor: 0xddd6c4, corTelhado: 0x6a4a8a });
    // torre com campanário aberto + SINO + topo
    const torre = new THREE.Mesh(new THREE.BoxGeometry(4, 20, 4), mat(0xddd6c4));
    torre.position.set(-5, 10, -8); torre.castShadow = true; res.grupo.add(torre);
    // 4 pilares do campanário (espaço aberto onde o sino aparece)
    [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([dx, dz]) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), mat(0xddd6c4));
      p.position.set(-5 + dx, 22, -8 + dz); res.grupo.add(p);
    });
    // SINO (dourado), pendurado no campanário
    const bellMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.7, roughness: 0.35 });
    const sino = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.4, 1.8, 12, 1, true), bellMat);
    sino.position.set(-5, 22.1, -8); res.grupo.add(sino);
    const badalo = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), bellMat);
    badalo.position.set(-5, 21.1, -8); res.grupo.add(badalo);
    // topo + cruz
    const topo = new THREE.Mesh(new THREE.ConeGeometry(3.4, 5, 4), mat(0x6a4a8a));
    topo.position.set(-5, 26.5, -8); topo.rotation.y = Math.PI / 4; topo.castShadow = true; res.grupo.add(topo);
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 0.35), mat(0xf0e8c0)); cv.position.set(-5, 31, -8);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.35), mat(0xf0e8c0)); ch.position.set(-5, 31.4, -8);
    res.grupo.add(cv, ch);
  } else if (tipo === 'hospital') {
    res = criaPredio({ ...base, larg: 16, prof: 13, alt: 10, cor: 0xeef0f2, corTelhado: 0xb0b6bc });
    const cv = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.2, 0.2), mat(0xd83a3a)); cv.position.set(0, 6.2, 13 / 2 + 0.03);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.2), mat(0xd83a3a)); ch.position.set(0, 6.2, 13 / 2 + 0.03);
    res.grupo.add(cv, ch);
  } else if (tipo === 'delegacia') {
    res = criaPredio({ ...base, larg: 13, prof: 11, alt: 8, cor: 0x8a98a8, corTelhado: 0x3a4656 });
  } else if (tipo === 'escola') {
    res = criaPredio({ ...base, larg: 22, prof: 12, alt: 7, cor: 0xc88a5a, corTelhado: 0x7a3a2a });
  } else {
    res = criaPredio(base);
  }
  return res;
}

// ---- plantas ----
export function criaPinheiro(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 2.2, 6), mat(0x5a3f24));
  tronco.position.y = 1.1; tronco.castShadow = true; g.add(tronco);
  const corFolha = 0x356130;
  [[2.8, 2.6, 3.0], [2.1, 2.4, 4.8], [1.4, 2.2, 6.3]].forEach(([r, h, y]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat(corFolha));
    c.position.y = y; c.castShadow = true; g.add(c);
  });
  return { grupo: g, colisores: [{ minX: x - 1.0, maxX: x + 1.0, minZ: z - 1.0, maxZ: z + 1.0 }] };
}

export function criaArbusto(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const b1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 0), mat(0x4f7e3e));
  b1.position.y = 0.95; b1.castShadow = true; g.add(b1);
  const b2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 0), mat(0x568a44));
  b2.position.set(0.7, 0.7, 0.3); b2.castShadow = true; g.add(b2);
  // flores
  const coresFlor = [0xe85d75, 0xf2c14e, 0xefefef, 0xd06ad0, 0xff8a4c];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + Math.random();
    const r = 0.9 + Math.random() * 0.2;
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), mat(coresFlor[i % coresFlor.length]));
    f.position.set(Math.cos(ang) * r, 1.0 + Math.random() * 0.5, Math.sin(ang) * r);
    g.add(f);
  }
  return { grupo: g, colisores: [{ minX: x - 1.0, maxX: x + 1.0, minZ: z - 1.0, maxZ: z + 1.0 }] };
}

// fonte com 2 taças + jatos de água animados (gotas)
export function criaFonte(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x9a9488);
  const aguaMat = new THREE.MeshStandardMaterial({ color: 0x3f8fd0, roughness: 0.12, metalness: 0.25, transparent: true, opacity: 0.85 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 1.2, 20), pedra);
  base.position.y = 0.6; base.castShadow = true; base.receiveShadow = true; g.add(base);
  const agua1 = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.4, 20), aguaMat);
  agua1.position.y = 1.15; agua1.userData.baseY = 1.15; agua1.userData.fase = 0; g.add(agua1);

  const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 2.2, 10), pedra);
  pilar.position.y = 2.1; g.add(pilar);
  const taca = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.0, 0.5, 16), pedra);
  taca.position.y = 3.1; taca.castShadow = true; g.add(taca);
  const agua2 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.25, 16), aguaMat);
  agua2.position.y = 3.4; agua2.userData.baseY = 3.4; agua2.userData.fase = 1.5; g.add(agua2);

  // gotas dos jatos (animadas no loop: sobem do topo e caem na taça)
  const gotas = [];
  for (let i = 0; i < 16; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), aguaMat);
    d.userData = { t: i / 16, ang: Math.random() * Math.PI * 2, vel: 0.7 + Math.random() * 0.5 };
    g.add(d); gotas.push(d);
  }

  return { grupo: g, colisores: [{ minX: x - 3.8, maxX: x + 3.8, minZ: z - 3.8, maxZ: z + 3.8 }], aguas: [agua1, agua2], gotas };
}

// banco de praça
export function criaBanco(x = 0, z = 0, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const mad = mat(0x7a5230), ferro = mat(0x3a3a3a);
  const assento = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.24, 1.1), mad); assento.position.y = 0.78; assento.castShadow = true; g.add(assento);
  const encosto = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 0.2), mad); encosto.position.set(0, 1.4, -0.45); encosto.castShadow = true; g.add(encosto);
  [-1.5, 1.5].forEach((s) => { const pe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 1.0), ferro); pe.position.set(s, 0.39, 0); g.add(pe); });
  // colisão do banco (respeita a rotação: 3.6 de largura x 1.1 de profundidade)
  const girado = Math.abs(Math.sin(rot)) > 0.5;
  const wA = girado ? 1.1 : 3.6, dA = girado ? 3.6 : 1.1;
  return { grupo: g, colisores: [{ minX: x - wA / 2, maxX: x + wA / 2, minZ: z - dA / 2, maxZ: z + dA / 2 }] };
}

// MOINHO de vento (marco com pás que GIRAM) — frente vira p/ -Z
export function criaMoinho(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.0, 8, 16), mat(0xded3bd));
  corpo.position.y = 4; corpo.castShadow = corpo.receiveShadow = true; g.add(corpo);
  const cinta = new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.65, 0.5, 16), mat(0x8a6a44));
  cinta.position.y = 5.4; g.add(cinta);
  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.2), mat(0x5a3a22));
  porta.position.set(0, 1.2, 2.85); g.add(porta);
  [[1.7, 3.0], [-1.7, 3.0]].forEach(([jx, jy]) => { // janelinhas
    const j = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.1), VIDRO);
    j.position.set(jx * 0.8, jy + 2.4, 2.4); g.add(j);
  });
  const teto = new THREE.Mesh(new THREE.ConeGeometry(2.95, 3, 16), mat(0x7a3a2a));
  teto.position.y = 9.5; teto.castShadow = true; g.add(teto);
  // cubo + 4 pás (giram no plano XY, viradas p/ -Z)
  const hub = new THREE.Group(); hub.position.set(0, 7.6, -2.7); g.add(hub);
  const eixo = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 8), mat(0x4a3a2a));
  eixo.rotation.x = Math.PI / 2; hub.add(eixo);
  for (let i = 0; i < 4; i++) {
    const pa = new THREE.Group(); pa.rotation.z = i * Math.PI / 2; hub.add(pa);
    const haste = new THREE.Mesh(new THREE.BoxGeometry(0.16, 4.6, 0.16), mat(0x6e4a2a));
    haste.position.y = 2.3; pa.add(haste);
    const vela = new THREE.Mesh(new THREE.BoxGeometry(0.95, 3.8, 0.06), mat(0xeae0cc, 0.85));
    vela.position.set(0.62, 2.5, 0.05); pa.add(vela);
  }
  return { grupo: g, colisores: [{ minX: x - 2.9, maxX: x + 2.9, minZ: z - 2.9, maxZ: z + 2.9 }], animados: [{ mesh: hub, giraZ: 0.5 }] };
}

// FAROL (marco do porto; lanterna brilhante no topo)
export function criaFarol(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.9, 2, 16), mat(0x8a8276));
  base.position.y = 1; base.castShadow = base.receiveShadow = true; g.add(base);
  const faixa = [0xefefef, 0xc0392b];
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(1.4 - i * 0.12, 1.7 - i * 0.12, 2.4, 16), mat(faixa[i % 2]));
    seg.position.y = 3.2 + i * 2.4; seg.castShadow = true; g.add(seg);
  }
  const topY = 2 + 5 * 2.4;
  const varanda = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.3, 16), mat(0x4a4a4a));
  varanda.position.y = topY; g.add(varanda);
  const lantMat = new THREE.MeshStandardMaterial({ color: 0xfff2b0, emissive: 0xffd24a, emissiveIntensity: 1.1, roughness: 0.2 });
  const lant = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.6, 12), lantMat);
  lant.position.y = topY + 1.0; g.add(lant);
  const cupula = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.4, 12), mat(0x2a2a2a));
  cupula.position.y = topY + 2.5; cupula.castShadow = true; g.add(cupula);
  return { grupo: g, colisores: [{ minX: x - 2.6, maxX: x + 2.6, minZ: z - 2.6, maxZ: z + 2.6 }] };
}

// MERCADO COBERTO (pavilhão aberto: pilares + telhado; anda por baixo)
export function criaMercado(x = 0, z = 0, w = 11, d = 8) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const mad = mat(0x6e4a2a); const hx = w / 2, hz = d / 2;
  const colisores = [];
  [[-hx, -hz], [hx, -hz], [-hx, hz], [hx, hz], [0, -hz], [0, hz]].forEach(([px, pz]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 4.2, 8), mad);
    p.position.set(px, 2.1, pz); p.castShadow = true; g.add(p);
    colisores.push({ minX: x + px - 0.3, maxX: x + px + 0.3, minZ: z + pz - 0.3, maxZ: z + pz + 0.3 });
  });
  const viga = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.3, d + 0.6), mad);
  viga.position.y = 4.2; g.add(viga);
  g.add(telhadoDuasAguas(w, d, 2.4, 0x9a4a3a, 4.3));
  // bancadas internas com mercadorias
  [[-hx + 1.6, 0], [hx - 1.6, 0]].forEach(([bx, bz]) => {
    const bal = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, d - 1.6), mad);
    bal.position.set(bx, 0.5, bz); bal.castShadow = true; g.add(bal);
    for (let i = 0; i < 4; i++) {
      const fruta = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), mat([0xd23a2a, 0xe0b020, 0x7a3a9a, 0x3a8a4a][i]));
      fruta.position.set(bx, 1.12, -hz + 1.6 + i * 1.4); g.add(fruta);
    }
  });
  return { grupo: g, colisores };
}

// poste de luz (luminária emissiva + PointLight controlada pelo ciclo dia/noite)
export function criaPoste(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const metal = mat(0x33373d);
  const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 6, 8), metal); mastro.position.y = 3; mastro.castShadow = true; g.add(mastro);
  const lumMat = new THREE.MeshStandardMaterial({ color: 0xffe6a0, emissive: 0xffcf6a, emissiveIntensity: 0.6, roughness: 0.4 });
  const lum = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), lumMat); lum.position.y = 6.1; g.add(lum);
  const luz = new THREE.PointLight(0xffd27f, 0.0, 20, 2); luz.position.set(0, 6, 0); g.add(luz);
  return { grupo: g, colisores: [{ minX: x - 0.4, maxX: x + 0.4, minZ: z - 0.4, maxZ: z + 0.4 }], luz, lumMat };
}

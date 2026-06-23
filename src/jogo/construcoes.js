// =============================================================
//  CONSTRUÇÕES MODULARES  ·  peças reutilizáveis (economia!).
//  Proporções pensadas para o avatar (~3 unidades de altura).
//  Cada função devolve { grupo, colisores:[{minX,maxX,minZ,maxZ}], ... }.
// =============================================================
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { matPBR } from './texturas.js';

const matCache = {};
export function mat(cor, rough = 0.9) {
  const k = cor + '_' + rough;
  if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color: cor, roughness: rough });
  return matCache[k];
}

// MATERIAL FACETADO (flat shading) — a assinatura visual dos packs low-poly
// premium: cada face pega a luz separada e o modelo ganha "lapidação"
const matFlatCache = {};
export function matFlat(cor, rough = 0.95) {
  const k = cor + '_' + rough;
  if (!matFlatCache[k]) matFlatCache[k] = new THREE.MeshStandardMaterial({ color: cor, roughness: rough, flatShading: true });
  return matFlatCache[k];
}

// DESLOCA os vértices aleatoriamente: geometria perfeita → forma ORGÂNICA
// (cada árvore/pedra fica única, como nos packs profissionais)
export function desloca(geo, amp) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i,
      p.getX(i) + (Math.random() - 0.5) * amp,
      p.getY(i) + (Math.random() - 0.5) * amp,
      p.getZ(i) + (Math.random() - 0.5) * amp);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// TEXTURA REAL (gerada por IA em public/texturas/): troca o mapa do material
// quando o arquivo carrega; se faltar, fica a procedural (fallback seguro).
// O renderer é registrado pra SUBIR a textura pra GPU JÁ no carregamento —
// sem isso o upload acontecia no 1º uso em cena e dava a "travadinha de
// imagem" andando pelo mapa.
let _rendererTex = null;
export function defineRendererTexturas(r) { _rendererTex = r; }
const _loaderTex = new THREE.TextureLoader();
// RV11.5: NORMAL MAP derivado da luminância do albedo (uma vez por arquivo,
// 256px = barato). Faz a luz "morder" toda superfície texturizada (muralhas,
// calçamento, telhados, grama) sem baixar mapas extras. Same-origin → sem CORS.
const _normCache = {};
function normalDoAlbedo(img, arquivo, forca = 2.2) {
  if (_normCache[arquivo] !== undefined) return _normCache[arquivo];
  try {
    const w = Math.min(256, img.width || 256), h = Math.min(256, img.height || 256);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, w, h);
    const sd = cx.getImageData(0, 0, w, h).data;
    const out = document.createElement('canvas'); out.width = w; out.height = h;
    const octx = out.getContext('2d'); const o = octx.createImageData(w, h);
    const lum = (x, y) => { x = (x + w) % w; y = (y + h) % h; const i = (y * w + x) * 4; return (sd[i] + sd[i + 1] + sd[i + 2]) / 765; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (lum(x - 1, y) - lum(x + 1, y)) * forca;
      const dy = (lum(x, y - 1) - lum(x, y + 1)) * forca;
      const len = Math.hypot(dx, dy, 1); const i = (y * w + x) * 4;
      o.data[i] = (dx / len * 0.5 + 0.5) * 255; o.data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
      o.data[i + 2] = (1 / len * 0.5 + 0.5) * 255; o.data[i + 3] = 255;
    }
    octx.putImageData(o, 0, 0);
    const nt = new THREE.CanvasTexture(out); nt.wrapS = nt.wrapT = THREE.RepeatWrapping;
    _normCache[arquivo] = nt; return nt;
  } catch (e) { _normCache[arquivo] = null; return null; }
}
export function aplicaTexturaReal(material, arquivo, rx, rz, manterCor = false, comNormal = false) {
  _loaderTex.load('texturas/' + arquivo + '.png', (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, rz);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8; // NITIDEZ em ângulo raso (o chão não borra mais ao longe)
    if (_rendererTex) _rendererTex.initTexture(t); // GPU agora, não no 1º uso
    material.map = t;
    if (!manterCor) material.color.set(0xffffff);
    // RELEVO (normal map) SÓ onde paga (chão/calçamento) — RV12.1: o normal em
    // TODA superfície empilhava 2º sampler e travava no PC. Agora é opt-in.
    if (comNormal) {
      const nrm = normalDoAlbedo(t.image, arquivo);
      if (nrm) {
        const nc = nrm.clone(); nc.needsUpdate = true; nc.wrapS = nc.wrapT = THREE.RepeatWrapping;
        nc.repeat.set(rx, rz); nc.anisotropy = 8;
        if (_rendererTex) _rendererTex.initTexture(nc);
        material.normalMap = nc; material.normalScale = new THREE.Vector2(0.42, 0.42);
      }
    }
    material.needsUpdate = true;
  }, undefined, () => {});
}

// VIDRO de janela compartilhado: reflexo, não lâmpada. Emissivo alto fazia
// casas e rostos "estourarem" com bloom no PC.
export const VIDRO = new THREE.MeshStandardMaterial({ color: 0x8bb6c4, roughness: 0.14, metalness: 0.22, emissive: 0x07131a, emissiveIntensity: 0.035 });

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
  const t = _texPedra.clone(); t.needsUpdate = true; t.repeat.set(rep, rep); t.anisotropy = 8; return t;
}

function _jbox(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); return m;
}

// FUMAÇA compartilhada das chaminés (RV4.6) — novelos cinza translúcidos
const MAT_FUMACA = new THREE.MeshStandardMaterial({ color: 0xcfcfd4, transparent: true, opacity: 0.32, roughness: 1, depthWrite: false });

// JANELA variada (vidro + moldura; opcional cruzeta, postigos, floreira c/ flores).
// O vidro fica virado para +Z; o chamador posiciona/gira na parede.
export function criaJanela(opts = {}) {
  const { w = 1.3, h = 1.3, cruz = true, shutters = false, floreira = false } = opts;
  const g = new THREE.Group();
  const moldura = mat(0xede6d2), vidro = VIDRO, fr = 0.1;
  // RV4.3: moldura+cruzeta viram UMA geometria mesclada (era a maior fonte
  // de mini-meshes do jogo — toda casa tem 2-8 janelas)
  const gb = (w2, h2, d2, x2, y2, z2) => { const ge = new THREE.BoxGeometry(w2, h2, d2); ge.translate(x2, y2, z2); return ge; };
  const geosM = [
    gb(w + fr, fr, 0.12, 0, h / 2, 0),
    gb(w + fr, fr, 0.12, 0, -h / 2, 0),
    gb(fr, h + fr, 0.12, -w / 2, 0, 0),
    gb(fr, h + fr, 0.12, w / 2, 0, 0),
  ];
  if (cruz) { geosM.push(gb(w, 0.06, 0.1, 0, 0, 0)); geosM.push(gb(0.06, h, 0.1, 0, 0, 0)); }
  const mold = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(geosM), moldura);
  g.add(mold);
  g.add(_jbox(w, h, 0.06, vidro, 0, 0, 0));
  if (shutters) {
    const sw = w * 0.52, geosS = [-1, 1].map((s) => gb(sw, h, 0.05, s * (sw / 2 + w / 2 + 0.03), 0, 0.05));
    g.add(new THREE.Mesh(BufferGeometryUtils.mergeGeometries(geosS), mat(0x6a4a8a)));
  }
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

// textura procedural de TELHA (fileiras escalonadas com sombra) — dá vida aos
// telhados; gerada 1x e tingida pela cor do material (qualidade sem custo)
let _texTelha = null;
function texturaTelha() {
  if (_texTelha) return _texTelha;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#b0b0b0'; x.fillRect(0, 0, 128, 128);
  const fila = 16, tw = 32;
  for (let fy = 0; fy < 128; fy += fila) {
    const off = (fy / fila) % 2 ? tw / 2 : 0;
    for (let fx = -tw; fx < 128; fx += tw) {
      x.fillStyle = ['#c4c4c4', '#bcbcbc', '#cacaca'][Math.floor(Math.random() * 3)];
      x.fillRect(fx + off + 1, fy + 1, tw - 2, fila - 2);
      x.fillStyle = 'rgba(0,0,0,.22)';
      x.fillRect(fx + off + 1, fy + fila - 3, tw - 2, 2); // sombra da fileira de cima
    }
  }
  _texTelha = new THREE.CanvasTexture(c);
  _texTelha.wrapS = _texTelha.wrapT = THREE.RepeatWrapping; _texTelha.repeat.set(2, 2);
  return _texTelha;
}
// REBOCO procedural (RV4.5): tira o "plástico liso" das paredes — ruído de
// argamassa + manchas de tempo, tingido pela cor de cada casa (1 canvas só)
let _texReboco = null;
function texturaReboco() {
  if (_texReboco) return _texReboco;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#b4b4b4'; x.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2600; i++) {
    const v = 150 + Math.floor(Math.random() * 70);
    x.fillStyle = `rgba(${v},${v},${v},0.5)`;
    x.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
  }
  for (let i = 0; i < 12; i++) { // manchas de umidade/tempo
    x.fillStyle = 'rgba(90,90,90,.06)';
    x.beginPath(); x.arc(Math.random() * 128, Math.random() * 128, 6 + Math.random() * 14, 0, Math.PI * 2); x.fill();
  }
  _texReboco = new THREE.CanvasTexture(c);
  _texReboco.wrapS = _texReboco.wrapT = THREE.RepeatWrapping; _texReboco.repeat.set(2, 2);
  return _texReboco;
}
// RV14.1: ESTILOS de parede premium (gerados por IA). 'reboco' = estuque
// claro tingido pela cor da casa; 'pedra_castelo'/'madeira_viga' = textura
// PRÓPRIA (cor real do material, com relevo). [arquivo, rx, rz, manterCor, normal]
const PAREDE_ESTILO = {
  reboco:        ['reboco', 2, 2, true, false],
  pedra_castelo: ['pedra_castelo', 3, 2.6, false, true],
  madeira_viga:  ['madeira_viga', 2, 2, false, true],
};
const matParedeCache = {};
export function matParedeEstilo(cor, estilo = 'reboco') {
  const key = cor + '_' + estilo;
  if (!matParedeCache[key]) {
    const [arq, rx, rz, manter, normal] = PAREDE_ESTILO[estilo] || PAREDE_ESTILO.reboco;
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.92, map: texturaReboco() });
    aplicaTexturaReal(m, arq, rx, rz, manter, normal);
    matParedeCache[key] = m;
  }
  return matParedeCache[key];
}
export function matParede(cor) { return matParedeEstilo(cor, 'reboco'); }

// ESTILOS de telhado: 'telha' (terracota tingida), 'ardosia' (ardósia escura),
// 'palha' (colmo dourado) — texturas próprias.
const TELHA_ESTILO = {
  telha:   ['telha', 2, 2, true],
  ardosia: ['telhado_ardosia', 3, 3, false],
  palha:   ['palha', 2.4, 2.4, false],
};
const matTelhaCache = {};
export function matTelhaEstilo(cor, estilo = 'telha') {
  const key = cor + '_' + estilo;
  if (!matTelhaCache[key]) {
    const [arq, rx, rz, manter] = TELHA_ESTILO[estilo] || TELHA_ESTILO.telha;
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9, map: texturaTelha() });
    aplicaTexturaReal(m, arq, rx, rz, manter);
    matTelhaCache[key] = m;
  }
  return matTelhaCache[key];
}
export function matTelha(cor) { return matTelhaEstilo(cor, 'telha'); }

// telhado de DUAS ÁGUAS com beiral (cobre o retângulo certinho -> bordas coerentes)
function telhadoDuasAguas(larg, prof, hTelh, cor, baseY, estiloTelhado = 'telha') {
  const ov = 0.5; // beiral (overhang)
  const shape = new THREE.Shape();
  shape.moveTo(-larg / 2 - ov, 0);
  shape.lineTo(larg / 2 + ov, 0);
  shape.lineTo(0, hTelh);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: prof + ov * 2, bevelEnabled: false });
  geo.translate(0, 0, -(prof + ov * 2) / 2);
  const m = new THREE.Mesh(geo, matTelhaEstilo(cor, estiloTelhado)); // telhas texturizadas em TODOS os telhados
  m.position.y = baseY; m.castShadow = true;
  return m;
}

// prédio de vilarejo: corpo + telhado piramidal + porta + janelas
export function criaPredio(opts) {
  const {
    x = 0, z = 0, larg = 9, prof = 9, alt = 7,
    cor = 0xcab79a, corTelhado = 0x884b2a, rot = 0, janelas = true,
    estiloParede = 'reboco', estiloTelhado = 'telha',
  } = opts;
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;

  const madeira = mat(0x5a4632), pedraBase = mat(0x6f675c), portaMat = mat(0x4a2f1a);
  const FB = 0.7; // altura do alicerce
  // RV4.3: peças do MESMO material viram UMA geometria mesclada por casa
  // (madeira: vigas/batentes/guarda-corpo · pedra: alicerce/chaminé/degrau)
  // — cada prédio caiu de ~20 pecinhas pra 2 meshes nesses materiais.
  const geosMad = [], geosPed = [];
  const gbox = (lista, w2, h2, d2, x2, y2, z2) => { const ge = new THREE.BoxGeometry(w2, h2, d2); ge.translate(x2, y2, z2); lista.push(ge); };

  // alicerce de pedra (assenta a casa no chão; quebra o "caixote")
  gbox(geosPed, larg + 0.4, FB, prof + 0.4, 0, FB / 2, 0);
  // corpo (sobre o alicerce) — parede com REBOCO procedural (RV4.5)
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, prof), matParedeEstilo(cor, estiloParede));
  corpo.position.y = FB + alt / 2; corpo.castShadow = true; corpo.receiveShadow = true; g.add(corpo);
  const topo = FB + alt; // topo das paredes
  // enxaimel: viga horizontal (divisória de andar) + montantes de canto (look medieval)
  gbox(geosMad, larg + 0.08, 0.28, prof + 0.08, 0, FB + alt * 0.52, 0);
  gbox(geosMad, larg + 0.35, 0.22, 0.34, 0, topo + 0.05, prof / 2 + 0.18);
  gbox(geosMad, larg + 0.35, 0.22, 0.34, 0, topo + 0.05, -prof / 2 - 0.18);
  gbox(geosMad, 0.34, 0.22, prof + 0.35, -larg / 2 - 0.18, topo + 0.05, 0);
  gbox(geosMad, 0.34, 0.22, prof + 0.35, larg / 2 + 0.18, topo + 0.05, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    gbox(geosMad, 0.3, alt, 0.3, sx * larg / 2, FB + alt / 2, sz * prof / 2);
  });
  if (estiloParede === 'madeira_viga') {
    [[-0.34, -1], [0.34, 1]].forEach(([ang, sx]) => {
      const diag = new THREE.Mesh(new THREE.BoxGeometry(0.18, alt * 0.82, 0.14), madeira);
      diag.position.set(sx * larg * 0.24, FB + alt * 0.52, prof / 2 + 0.12);
      diag.rotation.z = ang;
      diag.castShadow = true;
      g.add(diag);
    });
    [[-0.34, 1], [0.34, -1]].forEach(([ang, sx]) => {
      const diag = new THREE.Mesh(new THREE.BoxGeometry(0.18, alt * 0.62, 0.12), madeira);
      diag.position.set(sx * larg * 0.23, FB + alt * 0.52, -prof / 2 - 0.12);
      diag.rotation.z = ang;
      diag.castShadow = true;
      g.add(diag);
    });
  }
  // telhado de duas águas + cumeeira
  g.add(telhadoDuasAguas(larg, prof, Math.max(2.6, alt * 0.45), corTelhado, topo, estiloTelhado));
  // chaminé com fumeiro
  gbox(geosPed, 0.8, 2.0, 0.8, larg * 0.28, topo + 1.5, -prof * 0.18);
  gbox(geosMad, 1.0, 0.3, 1.0, larg * 0.28, topo + 2.6, -prof * 0.18);

  // PORTA (frente +Z) com batentes, verga, degrau de pedra e maçaneta
  const fz = prof / 2;
  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.0, 0.2), portaMat);
  porta.position.set(0, FB + 1.5, fz + 0.04); g.add(porta);
  [-0.42, 0, 0.42].forEach((px) => {
    const friso = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.72, 0.045), mat(0x2f1d11));
    friso.position.set(px, FB + 1.5, fz + 0.17); g.add(friso);
  });
  [FB + 0.72, FB + 1.55, FB + 2.38].forEach((py) => {
    const travessa = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.07, 0.045), mat(0x2f1d11));
    travessa.position.set(0, py, fz + 0.18); g.add(travessa);
  });
  [-0.92, 0.92].forEach((ox) => gbox(geosMad, 0.24, 3.3, 0.36, ox, FB + 1.55, fz + 0.05));
  gbox(geosMad, 2.2, 0.32, 0.38, 0, FB + 3.25, fz + 0.05); // verga
  gbox(geosPed, 2.0, 0.25, 0.8, 0, 0.32, fz + 0.5);        // degrau
  const macaneta = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mat(0xd9a522, 0.3)); macaneta.position.set(0.5, FB + 1.5, fz + 0.16); g.add(macaneta);
  // RV6.7: entrada habitada. Mesmo prédio decorativo precisa parecer lugar:
  // caminho de pedra, canteiros, vasos e lamparina emissiva na fachada.
  for (let i = 0; i < 4; i++) {
    const laje = new THREE.Mesh(new THREE.BoxGeometry(2.2 - i * 0.08, 0.055, 0.72), mat(0x8a8175, 1));
    laje.position.set((i % 2 ? 0.08 : -0.05), 0.08, fz + 0.95 + i * 0.72);
    laje.rotation.y = (i % 2 ? 0.08 : -0.06);
    laje.receiveShadow = true;
    g.add(laje);
  }
  [-1.75, 1.75].forEach((ox, idx) => {
    const caixaFlor = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 0.38), mat(0x6e4a2a, 1));
    caixaFlor.position.set(ox, 0.25, fz + 0.34); caixaFlor.castShadow = true; g.add(caixaFlor);
    for (let k = 0; k < 3; k++) {
      const flor = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 5), mat([0xe85d75, 0xf2c14e, 0xd06ad0][(idx + k) % 3], 0.6));
      flor.position.set(ox + (k - 1) * 0.26, 0.46, fz + 0.38); g.add(flor);
    }
  });
  const luzPorta = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xff9f2a, emissiveIntensity: 0.75, roughness: 0.45 }));
  luzPorta.position.set(-0.95, FB + 2.35, fz + 0.22); g.add(luzPorta);
  if (Math.random() < 0.58) {
    const tecido = new THREE.MeshStandardMaterial({
      color: [0x9a3f2f, 0x2f5e7a, 0x4d6f3f, 0x7a5b2f][Math.floor(Math.random() * 4)],
      roughness: 0.96,
      flatShading: true,
    });
    const toldo = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.16, 0.86), tecido);
    toldo.position.set(0, FB + 3.46, fz + 0.46);
    toldo.rotation.x = -0.22;
    toldo.castShadow = true;
    g.add(toldo);
    for (let i = -2; i <= 2; i++) {
      const barra = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.92), madeira);
      barra.position.set(i * 0.5, FB + 3.5, fz + 0.47);
      barra.rotation.x = -0.22;
      g.add(barra);
    }
  }

  if (Math.random() < 0.52) {
    const folhagem = new THREE.MeshStandardMaterial({ color: 0x3f6b36, roughness: 1, flatShading: true });
    const lado = Math.random() < 0.5 ? -1 : 1;
    for (let i = 0; i < 6; i++) {
      const folha = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12 + (i % 3) * 0.035, 0), folhagem);
      folha.scale.set(1.25, 0.65, 0.85);
      folha.position.set(lado * (larg / 2 - 0.55 - (i % 2) * 0.18), FB + 1.1 + i * 0.42, fz + 0.18);
      folha.castShadow = true;
      g.add(folha);
    }
  }

  if (janelas) {
    const estilo = () => ({ cruz: true, shutters: Math.random() < 0.5, floreira: Math.random() < 0.35 });
    const yJ = Math.min(FB + alt * 0.45, topo - 1.4);
    // frente
    [-larg * 0.28, larg * 0.28].forEach((jx) => {
      const j = criaJanela(estilo()); j.position.set(jx, yJ, fz + 0.07); g.add(j);
    });
    // laterais (prédios mais fundos ganham janelas nos lados)
    if (prof >= 9) {
      [-prof * 0.24, prof * 0.24].forEach((jz) => {
        const jE = criaJanela(estilo()); jE.position.set(-larg / 2 - 0.07, yJ, jz); jE.rotation.y = -Math.PI / 2; g.add(jE);
        const jD = criaJanela(estilo()); jD.position.set(larg / 2 + 0.07, yJ, jz); jD.rotation.y = Math.PI / 2; g.add(jD);
      });
    }
    // 2º ANDAR de verdade: prédios altos ganham fileira superior de janelas
    // acima da viga de enxaimel (a praça de Venore é a 1ª tela do jogo)
    if (alt >= 8) {
      const yJ2 = Math.min(FB + alt * 0.78, topo - 0.9);
      [-larg * 0.28, larg * 0.28].forEach((jx) => {
        const j = criaJanela({ cruz: true, floreira: Math.random() < 0.3 });
        j.position.set(jx, yJ2, fz + 0.07); g.add(j);
      });
    }
  }

  // === SILHUETA VARIADA (18ª rodada): sacada OU torrinha — fim do "caixote"
  if (alt >= 8 && Math.random() < 0.6) {
    // SACADA com guarda-corpo sobre a porta + porta-janela do 2º andar
    const yS = FB + alt * 0.55;
    gbox(geosPed, 2.6, 0.18, 1.0, 0, yS, fz + 0.5); // piso da sacada
    const portaJ = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.12), portaMat);
    portaJ.position.set(0, yS + 1.0, fz + 0.07); g.add(portaJ);
    gbox(geosMad, 2.6, 0.09, 0.09, 0, yS + 0.95, fz + 0.96); // corrimão
    for (let bi = -2; bi <= 2; bi++) gbox(geosMad, 0.07, 0.86, 0.07, bi * 0.58, yS + 0.5, fz + 0.96); // balaústres
    [-1, 1].forEach((s) => gbox(geosMad, 0.09, 0.09, 0.92, s * 1.26, yS + 0.95, fz + 0.5)); // laterais
  } else if (Math.random() < 0.45) {
    // TORRINHA de canto pendurada na quina frontal (silhueta medieval)
    const tx = (Math.random() < 0.5 ? -1 : 1) * (larg / 2 - 0.3);
    const hT2 = alt * 0.5;
    const corpoT2 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.6, hT2, 8), matParede(cor));
    corpoT2.position.set(tx, FB + alt - hT2 / 2 + 0.4, fz - 0.3); corpoT2.castShadow = true; g.add(corpoT2);
    const chapeu = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.9, 8), matTelha(corTelhado));
    chapeu.position.set(tx, FB + alt + 1.35, fz - 0.3); chapeu.castShadow = true; g.add(chapeu);
  }

  // RV4.6: FUMAÇA na chaminé (nem toda casa acende o fogão) — 3 novelos
  // que sobem em loop, crescem e derivam no vento (animaProps cuida)
  const animados = [];
  if (Math.random() < 0.8) { // RV15.6: mais casas FUMEGAM (vila viva) — era 0.45
    const fumaca = [];
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.26 + i * 0.05, 6, 5), MAT_FUMACA);
      puff.position.set(larg * 0.28, topo + 2.9, -prof * 0.18); g.add(puff);
      fumaca.push(puff);
    }
    animados.push({ fumaca, baseY: topo + 2.9, baseX: larg * 0.28, fase: Math.random() * 6 });
  }

  // RV4.3: mescla os baldes — 2 meshes no lugar de ~20 pecinhas por casa
  if (geosMad.length) {
    const mMad = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(geosMad), madeira);
    mMad.castShadow = true; g.add(mMad);
  }
  if (geosPed.length) {
    const mPed = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(geosPed), pedraBase);
    mPed.castShadow = mPed.receiveShadow = true; g.add(mPed);
  }

  const girado = Math.abs(Math.sin(rot)) > 0.5;
  const wA = girado ? prof : larg, dA = girado ? larg : prof;
  const colisores = [{ minX: x - wA / 2, maxX: x + wA / 2, minZ: z - dA / 2, maxZ: z + dA / 2 }];
  return { grupo: g, colisores, animados };
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
    // topo + ORBE DA VEIA (RV14.2: Templo Sagrado de Venor — sem cruz; o
    // símbolo é a Veia viva pulsando ouro e violeta no alto do campanário)
    const topo = new THREE.Mesh(new THREE.ConeGeometry(3.4, 5, 8), mat(0x6a4a8a));
    topo.position.set(-5, 26.5, -8); topo.rotation.y = Math.PI / 8; topo.castShadow = true; res.grupo.add(topo);
    const orbe = new THREE.Mesh(new THREE.SphereGeometry(1.15, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xc9a75a, emissive: 0x7a4fd0, emissiveIntensity: 0.85, roughness: 0.3, metalness: 0.45 }));
    orbe.position.set(-5, 30.6, -8); res.grupo.add(orbe);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.16, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xd9b25a, metalness: 0.8, roughness: 0.3, emissive: 0x3a2a08, emissiveIntensity: 0.3 }));
    aro.position.set(-5, 30.6, -8); aro.rotation.x = Math.PI / 2.4; res.grupo.add(aro);
    const luzOrbe = new THREE.PointLight(0xa66fff, 0.7, 22, 2); luzOrbe.position.set(-5, 30.6, -8); res.grupo.add(luzOrbe);
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

// RV14.5: MURALHA DE CASTELO reutilizável — cidades viram castelos murados,
// com PORTÕES (vãos) nos lados pedidos. Geometria mesclada (2 meshes + torres).
// Devolve { grupo, colisores } pra cidade somar aos sólidos.
export function criaMuralha(cx, cz, opts = {}) {
  const { HX = 88, HZ = 88, ALT = 9, ESP = 2.4, gw = 13, portoes = ['leste'], estilo = 'muralha_castelo', corTorre = 0x3a4a6a } = opts;
  const g = new THREE.Group(); g.position.set(cx, 0, cz);
  const colisores = [];
  const col = (lx, lz, w, d) => colisores.push({ minX: cx + lx - w / 2, maxX: cx + lx + w / 2, minZ: cz + lz - d / 2, maxZ: cz + lz + d / 2 });
  const corpo = [], merlao = [];
  const push = (lista, w, h, d, lx, ly, lz) => { const ge = new THREE.BoxGeometry(w, h, d); ge.translate(lx, ly, lz); lista.push(ge); };
  function ameias(lx, lz, comp, eixo) {
    const n = Math.max(1, Math.floor(comp / 4.4));
    for (let i = 0; i < n; i++) {
      const t = -comp / 2 + comp / n / 2 + i * (comp / n);
      push(merlao, eixo === 'x' ? 1.3 : ESP + 0.3, 1.3, eixo === 'x' ? ESP + 0.3 : 1.3, lx + (eixo === 'x' ? t : 0), ALT + 0.65, lz + (eixo === 'x' ? 0 : t));
    }
  }
  function muro(lx, lz, w, d) { push(corpo, w, ALT, d, lx, ALT / 2, lz); col(lx, lz, w, d); ameias(lx, lz, w > d ? w : d, w > d ? 'x' : 'z'); }
  function fazLado(lado) {
    const portao = portoes.includes(lado);
    if (lado === 'norte' || lado === 'sul') {
      const lz = lado === 'norte' ? HZ : -HZ;
      if (!portao) muro(0, lz, HX * 2, ESP);
      else { const seg = (HX * 2 - gw) / 2; muro(-(gw / 2 + seg / 2), lz, seg, ESP); muro(gw / 2 + seg / 2, lz, seg, ESP); }
    } else {
      const lx = lado === 'leste' ? HX : -HX;
      if (!portao) muro(lx, 0, ESP, HZ * 2);
      else { const seg = (HZ * 2 - gw) / 2; muro(lx, -(gw / 2 + seg / 2), ESP, seg); muro(lx, gw / 2 + seg / 2, ESP, seg); }
    }
  }
  ['norte', 'sul', 'leste', 'oeste'].forEach(fazLado);
  const matPedra = new THREE.MeshStandardMaterial({ color: 0xb9b2a4, roughness: 1 });
  aplicaTexturaReal(matPedra, estilo, 8, 1.6, true, true);
  const mc = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(corpo), matPedra); mc.castShadow = true; mc.receiveShadow = true; g.add(mc);
  const mm = new THREE.Mesh(BufferGeometryUtils.mergeGeometries(merlao), mat(0xd9d2c2, 1)); mm.castShadow = true; g.add(mm);
  [[-HX, -HZ], [HX, -HZ], [-HX, HZ], [HX, HZ]].forEach(([tx, tz]) => {
    const h = ALT + 5;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.4, h, 12), matPedra); t.position.set(tx, h / 2, tz); t.castShadow = true; g.add(t);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.8, h * 0.42, 12), mat(corTorre, 0.9)); cone.position.set(tx, h + h * 0.21, tz); g.add(cone);
    col(tx, tz, 5, 5);
  });
  return { grupo: g, colisores };
}

// PORTAO DE CIDADE premium: torres, arco, grades, brasao e luzes.
// O vao central fica livre; colisao so nas torres e pilares laterais.
export function criaPortaoCidade(x = 0, z = 0, opts = {}) {
  const {
    rot = 0,
    nome = 'VENOR',
    largura = 15,
    altura = 12,
    corPedra = 0xb9b2a4,
    corTelhado = 0x5c476f,
    corBandeira = 0x8f2f2a,
    estiloPedra = 'muralha_castelo',
    estiloTelhado = 'ardosia',
  } = opts;

  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  const colisores = [];
  const animados = [];

  const pedra = new THREE.MeshStandardMaterial({ color: corPedra, roughness: 1 });
  aplicaTexturaReal(pedra, estiloPedra, 3.2, 2.2, true, true);
  const pedraClara = mat(0xd8d0bd, 0.95);
  const madeira = new THREE.MeshStandardMaterial({ color: 0x684524, roughness: 0.88 });
  aplicaTexturaReal(madeira, 'madeira', 1.6, 1.2, true, true);
  const ferro = new THREE.MeshStandardMaterial({ color: 0x24272d, metalness: 0.75, roughness: 0.32 });
  const ouro = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.72, roughness: 0.34, emissive: 0x241500, emissiveIntensity: 0.18 });
  const chamaMat = new THREE.MeshStandardMaterial({ color: 0xffd078, emissive: 0xff8a22, emissiveIntensity: 1.1, roughness: 0.35 });
  const hx = largura / 2;
  const torreX = hx + 1.55;

  const addBox = (w, h, d, material, px, py, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(px, py, pz);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
    return m;
  };

  addBox(largura + 7.5, 0.7, 4.6, pedra, 0, 0.35, 0);
  addBox(largura - 2.6, 2.1, 3.4, pedra, 0, altura - 1.05, 0);
  addBox(1.15, altura - 1.4, 3.3, pedra, -hx + 1.0, (altura - 1.4) / 2, 0);
  addBox(1.15, altura - 1.4, 3.3, pedra, hx - 1.0, (altura - 1.4) / 2, 0);

  [-1, 1].forEach((s) => {
    const torre = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.65, altura + 2.0, 16), pedra);
    torre.position.set(s * torreX, (altura + 2.0) / 2, 0);
    torre.castShadow = torre.receiveShadow = true;
    g.add(torre);

    const cintaBaixa = new THREE.Mesh(new THREE.CylinderGeometry(2.72, 2.72, 0.35, 16), pedraClara);
    cintaBaixa.position.set(s * torreX, 2.4, 0);
    cintaBaixa.castShadow = true;
    g.add(cintaBaixa);
    const cintaAlta = cintaBaixa.clone();
    cintaAlta.position.y = altura - 1.2;
    g.add(cintaAlta);

    const teto = new THREE.Mesh(new THREE.ConeGeometry(3.0, 4.3, 16), matTelhaEstilo(corTelhado, estiloTelhado));
    teto.position.set(s * torreX, altura + 3.15, 0);
    teto.castShadow = true;
    g.add(teto);

    const ponta = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), ouro);
    ponta.position.set(s * torreX, altura + 5.65, 0);
    ponta.castShadow = true;
    g.add(ponta);

    const bannerMat = new THREE.MeshStandardMaterial({ color: corBandeira, roughness: 0.82, side: THREE.DoubleSide });
    const pano = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0, 3, 4), bannerMat);
    pano.position.set(s * (hx - 2.05), altura - 4.0, 1.78);
    pano.castShadow = true;
    g.add(pano);
    animados.push({ mesh: pano, balanca: true, fase: Math.random() * 6 });

    const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.92, 8), chamaMat);
    lamp.position.set(s * (hx - 2.35), 4.7, 1.92);
    lamp.castShadow = true;
    g.add(lamp);
    animados.push({ chama: lamp, chamaMat, fase: Math.random() * 6 });
  });

  // Portas abertas: leitura de entrada, sem fechar a passagem do jogador.
  [-1, 1].forEach((s) => {
    const folha = new THREE.Group();
    folha.position.set(s * 1.0, 0, 1.55);
    folha.rotation.y = s * -0.58;
    const painel = addBox(2.7, 5.45, 0.34, madeira, s * 1.45, 2.9, 0);
    folha.add(painel);
    [1.45, 2.85, 4.25].forEach((yy) => folha.add(addBox(2.8, 0.16, 0.42, ferro, s * 1.45, yy, 0.03)));
    const cravoGeo = new THREE.SphereGeometry(0.08, 6, 6);
    for (let i = 0; i < 8; i++) {
      const cravo = new THREE.Mesh(cravoGeo, ferro);
      cravo.position.set(s * (0.45 + (i % 2) * 2.0), 1.35 + Math.floor(i / 2) * 0.85, 0.24);
      folha.add(cravo);
    }
    g.add(folha);
  });

  // Grade elevada no arco, dando cara de fortificacao sem bloquear.
  const grade = new THREE.Group();
  grade.position.set(0, 5.9, 1.66);
  for (let i = -3; i <= 3; i++) {
    const barra = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 0.16), ferro);
    barra.position.x = i * 0.72;
    grade.add(barra);
  }
  [-1.25, 0, 1.25].forEach((yy) => grade.add(addBox(5.0, 0.1, 0.18, ferro, 0, yy, 0)));
  g.add(grade);

  // Tabuleta de chegada com brasao desenhado no canvas.
  const cnv = document.createElement('canvas');
  cnv.width = 512; cnv.height = 160;
  const c = cnv.getContext('2d');
  c.fillStyle = '#4a311d'; c.fillRect(0, 0, 512, 160);
  c.fillStyle = '#70502e'; c.fillRect(14, 14, 484, 132);
  c.strokeStyle = '#d9b25a'; c.lineWidth = 8; c.strokeRect(22, 22, 468, 116);
  c.fillStyle = '#f4e4ba'; c.font = 'bold 42px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(nome.toUpperCase(), 256, 92);
  c.fillStyle = '#d9b25a';
  c.beginPath(); c.moveTo(256, 24); c.lineTo(287, 55); c.lineTo(256, 47); c.lineTo(225, 55); c.closePath(); c.fill();
  const tabMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnv), roughness: 0.82 });
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2.1), tabMat);
  tab.position.set(0, altura - 2.85, 1.82);
  tab.castShadow = true;
  g.add(tab);

  const brasao = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 0), ouro);
  brasao.position.set(0, altura + 0.45, 1.95);
  brasao.rotation.y = Math.PI / 4;
  g.add(brasao);
  animados.push({ mesh: brasao, gira: 0.28, flutua: true, baseY: altura + 0.45, fase: Math.random() * 6 });

  const cos = Math.cos(rot), sin = Math.sin(rot);
  const world = (lx, lz) => ({ x: x + lx * cos + lz * sin, z: z - lx * sin + lz * cos });
  const col = (lx, lz, w, d) => {
    const p = world(lx, lz);
    const girado = Math.abs(sin) > 0.5;
    const ww = girado ? d : w;
    const dd = girado ? w : d;
    colisores.push({ minX: p.x - ww / 2, maxX: p.x + ww / 2, minZ: p.z - dd / 2, maxZ: p.z + dd / 2 });
  };
  col(-torreX, 0, 4.6, 4.6);
  col(torreX, 0, 4.6, 4.6);
  col(-hx + 1.0, 0, 1.35, 3.7);
  col(hx - 1.0, 0, 1.35, 3.7);

  return { grupo: g, colisores, animados };
}

// ---- plantas ----
export function criaPinheiro(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 2.2, 6), mat(0x5a3f24));
  tronco.position.y = 1.1; tronco.castShadow = true; g.add(tronco);
  const corFolha = [0x356130, 0x2e6e3a, 0x3d7a36][Math.floor(Math.random() * 3)];
  [[2.8, 2.6, 3.0], [2.1, 2.4, 4.8], [1.4, 2.2, 6.3]].forEach(([r, h, y]) => {
    const c = new THREE.Mesh(desloca(new THREE.ConeGeometry(r, h, 7), r * 0.16), matFlat(corFolha));
    c.position.y = y; c.castShadow = true; g.add(c);
  });
  return {
    grupo: g,
    colisores: [{ minX: x - 1.0, maxX: x + 1.0, minZ: z - 1.0, maxZ: z + 1.0 }],
    animados: [{ mesh: g, sway: true, amp: 0.018 + Math.random() * 0.012, vel: 0.55 + Math.random() * 0.25, fase: Math.random() * 6 }],
  };
}

export function criaArbusto(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const b1 = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(1.15, 0), 0.3), matFlat(0x4f7e3e));
  b1.position.y = 0.95; b1.castShadow = true; g.add(b1);
  const b2 = new THREE.Mesh(desloca(new THREE.IcosahedronGeometry(0.8, 0), 0.22), matFlat(0x568a44));
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
  return {
    grupo: g,
    colisores: [{ minX: x - 1.0, maxX: x + 1.0, minZ: z - 1.0, maxZ: z + 1.0 }],
    animados: [{ mesh: g, sway: true, amp: 0.028 + Math.random() * 0.018, vel: 0.9 + Math.random() * 0.4, fase: Math.random() * 6 }],
  };
}

// fonte com 2 taças + jatos de água animados (gotas)
export function criaFonte(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = matPBR(0x8f897e, { tipo: 'pedra', repeat: 1.8, rough: 0.96, relevo: 0.72 });
  const pedraEsc = matPBR(0x5f5a52, { tipo: 'pedra', repeat: 1.4, rough: 0.98, relevo: 0.78 });
  const musgo = new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: 1, flatShading: true });
  const aguaMat = new THREE.MeshStandardMaterial({
    color: 0x74b7d6,
    emissive: 0x0b3550,
    emissiveIntensity: 0.08,
    roughness: 0.08,
    metalness: 0.18,
    transparent: true,
    opacity: 0.78,
  });
  const espumaMat = new THREE.MeshStandardMaterial({ color: 0xe5f5f8, roughness: 0.55, transparent: true, opacity: 0.52, depthWrite: false });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.45, 3.95, 1.05, 32), pedraEsc);
  base.position.y = 0.52; base.castShadow = true; base.receiveShadow = true; g.add(base);
  const bordaBaixa = new THREE.Mesh(new THREE.TorusGeometry(3.48, 0.18, 10, 36), pedra);
  bordaBaixa.position.y = 1.08; bordaBaixa.rotation.x = Math.PI / 2; bordaBaixa.castShadow = true; bordaBaixa.receiveShadow = true; g.add(bordaBaixa);
  const bordaBase = new THREE.Mesh(new THREE.TorusGeometry(3.72, 0.12, 8, 36), pedraEsc);
  bordaBase.position.y = 0.16; bordaBase.rotation.x = Math.PI / 2; bordaBase.receiveShadow = true; g.add(bordaBase);
  const agua1 = new THREE.Mesh(new THREE.CylinderGeometry(2.95, 2.95, 0.18, 32), aguaMat);
  agua1.position.y = 1.16; agua1.userData.baseY = 1.16; agua1.userData.fase = 0; g.add(agua1);
  const espuma1 = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.035, 6, 48), espumaMat);
  espuma1.position.y = 1.29; espuma1.rotation.x = Math.PI / 2; g.add(espuma1);

  const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.65, 2.2, 16), pedraEsc);
  pilar.position.y = 2.08; pilar.castShadow = true; pilar.receiveShadow = true; g.add(pilar);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const friso = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.05, 0.08), pedra);
    friso.position.set(Math.cos(a) * 0.5, 2.1, Math.sin(a) * 0.5);
    friso.rotation.y = -a;
    friso.castShadow = true;
    g.add(friso);
  }
  const taca = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.03, 0.48, 24), pedra);
  taca.position.y = 3.08; taca.castShadow = true; taca.receiveShadow = true; g.add(taca);
  const bordaTaca = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.11, 8, 28), pedraEsc);
  bordaTaca.position.y = 3.36; bordaTaca.rotation.x = Math.PI / 2; bordaTaca.castShadow = true; g.add(bordaTaca);
  const agua2 = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.12, 24), aguaMat);
  agua2.position.y = 3.43; agua2.userData.baseY = 3.43; agua2.userData.fase = 1.5; g.add(agua2);
  const espuma2 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.028, 6, 32), espumaMat);
  espuma2.position.y = 3.52; espuma2.rotation.x = Math.PI / 2; g.add(espuma2);

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + (i % 3) * 0.035, 0), musgo);
    m.scale.set(1.35, 0.32, 0.78);
    m.position.set(Math.cos(a) * (3.02 + (i % 2) * 0.22), 1.19 + (i % 2) * 0.04, Math.sin(a) * (3.02 + (i % 2) * 0.22));
    m.rotation.y = a;
    g.add(m);
  }

  // gotas dos jatos (animadas no loop: sobem do topo e caem na taça)
  const gotas = [];
  for (let i = 0; i < 32; i++) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(0.08 + (i % 3) * 0.018, 7, 6), aguaMat);
    d.userData = { t: i / 32, ang: Math.random() * Math.PI * 2, vel: 0.65 + Math.random() * 0.55 };
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

// MANSÃO alugável: casa grande, simétrica, com alas laterais, varanda e jardim.
// Visualmente ela deve parecer "prêmio", não só uma casa esticada.
export function criaMansao(x = 0, z = 0, opts = {}) {
  const {
    rot = 0, cor = 0xd7c7a5, corTelhado = 0x65406f,
    estiloParede = 'pedra_castelo', estiloTelhado = 'ardosia',
    luxo = 1,
  } = opts;
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const parede = matParedeEstilo(cor, estiloParede);
  const pedra = mat(0x8d8576, 1);
  const madeira = mat(0x5e4228, 0.9);
  const ouro = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.68, roughness: 0.32, emissive: 0x302000, emissiveIntensity: 0.22 });
  const portaMat = mat(0x3b2416, 0.85);
  const animados = [];

  const addBox = (w, h, d, material, px, py, pz) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m); return m;
  };

  addBox(20, 0.75, 15.5, pedra, 0, 0.38, 0);
  addBox(14.8, 9.8, 12.8, parede, 0, 5.65, 0);
  addBox(5.2, 7.6, 10.8, parede, -9.3, 4.55, -0.8);
  addBox(5.2, 7.6, 10.8, parede, 9.3, 4.55, -0.8);
  const tetoCentro = telhadoDuasAguas(15.2, 13.2, 4.2, corTelhado, 10.55, estiloTelhado);
  const tetoE = telhadoDuasAguas(5.8, 11.4, 3.3, corTelhado, 8.35, estiloTelhado); tetoE.position.x = -9.3;
  const tetoD = telhadoDuasAguas(5.8, 11.4, 3.3, corTelhado, 8.35, estiloTelhado); tetoD.position.x = 9.3;
  g.add(tetoCentro, tetoE, tetoD);

  // pórtico frontal com colunas e sacada
  addBox(7.8, 0.35, 2.4, pedra, 0, 0.86, 7.55);
  [-3.0, -1.0, 1.0, 3.0].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4.2, 10), pedra);
    col.position.set(px, 3.0, 7.2); col.castShadow = true; g.add(col);
  });
  addBox(8.5, 0.32, 2.2, pedra, 0, 5.2, 7.25);
  addBox(8.1, 0.14, 0.16, madeira, 0, 6.05, 8.22);
  for (let i = -4; i <= 4; i++) addBox(0.1, 0.75, 0.1, madeira, i, 5.65, 8.2);

  const porta = addBox(2.0, 3.3, 0.22, portaMat, 0, 2.55, 6.54);
  porta.castShadow = true;
  addBox(0.18, 3.5, 0.26, madeira, -1.15, 2.55, 6.68);
  addBox(0.18, 3.5, 0.26, madeira, 1.15, 2.55, 6.68);
  addBox(2.6, 0.22, 0.28, madeira, 0, 4.34, 6.7);
  const brasao = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), ouro);
  brasao.position.set(0, 6.2, 6.72); g.add(brasao);
  animados.push({ mesh: brasao, gira: 0.35, pulsa: ouro, fase: Math.random() * 6 });

  // janelas alinhadas, não aleatórias
  [-5.1, -2.6, 2.6, 5.1].forEach((jx) => {
    const j = criaJanela({ w: 1.25, h: 1.45, shutters: true, floreira: true });
    j.position.set(jx, 4.1, 6.47); g.add(j);
    const j2 = criaJanela({ w: 1.15, h: 1.25, shutters: false, floreira: false });
    j2.position.set(jx, 7.35, 6.47); g.add(j2);
  });
  [-9.3, 9.3].forEach((sx) => {
    [-1.7, 1.7].forEach((jz) => {
      const jl = criaJanela({ w: 1.05, h: 1.2, shutters: true, floreira: true });
      jl.position.set(sx, 3.95, jz); jl.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2; g.add(jl);
    });
  });

  // jardim frontal e lamparinas
  [-6.4, 6.4].forEach((px) => {
    addBox(2.4, 0.32, 1.1, mat(0x5a3a22, 1), px, 0.22, 8.9);
    for (let k = 0; k < 6; k++) {
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), mat([0xe85d75, 0xf2c14e, 0xd06ad0, 0xefefef][k % 4]));
      fl.position.set(px - 0.9 + k * 0.36, 0.58, 8.92); g.add(fl);
    }
  });
  [-4.0, 4.0].forEach((px) => {
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffb84a, emissiveIntensity: 0.9, roughness: 0.4 });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lampMat);
    lamp.position.set(px, 4.75, 6.82); g.add(lamp);
    animados.push({ chama: lamp, chamaMat: lampMat, fase: Math.random() * 6 });
  });

  if (luxo > 1) {
    [-6.2, 6.2].forEach((px) => {
      const torre = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.45, 8.5, 10), parede);
      torre.position.set(px, 8.6, -6.6); torre.castShadow = torre.receiveShadow = true; g.add(torre);
      const chapeu = new THREE.Mesh(new THREE.ConeGeometry(1.75, 3.0, 10), matTelhaEstilo(corTelhado, estiloTelhado));
      chapeu.position.set(px, 14.35, -6.6); chapeu.castShadow = true; g.add(chapeu);
    });
  }

  const fuma = [];
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.26 + i * 0.06, 6, 5), MAT_FUMACA);
    puff.position.set(5.0, 12.0, -3.2); g.add(puff); fuma.push(puff);
  }
  addBox(0.8, 2.0, 0.8, pedra, 5.0, 11.1, -3.2);
  animados.push({ fumaca: fuma, baseY: 12.1, baseX: 5.0, baseZ: -3.2, fase: Math.random() * 6 });

  const w = luxo > 1 ? 22 : 20, d = 18;
  const girado = Math.abs(Math.sin(rot)) > 0.5;
  const wA = girado ? d : w, dA = girado ? w : d;
  return { grupo: g, colisores: [{ minX: x - wA / 2, maxX: x + wA / 2, minZ: z - dA / 2, maxZ: z + dA / 2 }], animados };
}

// Guildhouse: salão grande, torres, estandartes e leitura de "base de grupo".
export function criaGuildHouse(x = 0, z = 0, opts = {}) {
  const { rot = 0, cor = 0xbfae86, corTelhado = 0x5b3568 } = opts;
  const res = criaMansao(x, z, { rot, cor, corTelhado, estiloParede: 'pedra_castelo', estiloTelhado: 'ardosia', luxo: 2 });
  const g = res.grupo;
  const ouro = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.78, roughness: 0.28, emissive: 0x2a1b04, emissiveIntensity: 0.28 });
  const emblema = new THREE.Group(); emblema.position.set(0, 9.0, 6.85);
  const escudo = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.95, 0.22, 5), ouro);
  escudo.rotation.x = Math.PI / 2; emblema.add(escudo);
  const dente = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.25, 5), mat(0xf0e4c2, 0.45));
  dente.position.set(0, -0.1, 0.16); dente.rotation.x = Math.PI; emblema.add(dente);
  g.add(emblema);
  [-8.5, 8.5].forEach((px) => {
    const bandeira = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.2), new THREE.MeshStandardMaterial({ color: px < 0 ? 0x7a1f1f : 0x243f74, roughness: 0.9, side: THREE.DoubleSide }));
    bandeira.position.set(px, 8.3, 7.0); g.add(bandeira);
    res.animados.push({ mesh: bandeira, balanca: true, fase: Math.random() * 6 });
  });
  // colisão um pouco mais larga para as alas de guilda.
  res.colisores = [{ minX: x - 13, maxX: x + 13, minZ: z - 10, maxZ: z + 10 }];
  return res;
}

// poste de luz (luminária emissiva + PointLight controlada pelo ciclo dia/noite)
export function criaPoste(x = 0, z = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const metal = new THREE.MeshStandardMaterial({ color: 0x2b2f35, roughness: 0.72, metalness: 0.38, flatShading: true });
  const madeira = mat(0x4b3827);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.58, 0.34, 8), mat(0x655f55, 1));
  base.position.y = 0.17; base.castShadow = base.receiveShadow = true; g.add(base);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.7, 8), metal);
  pedestal.position.y = 0.62; pedestal.castShadow = true; g.add(pedestal);
  const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 5.55, 10), metal);
  mastro.position.y = 3.25; mastro.castShadow = true; g.add(mastro);
  [1.28, 3.25, 5.7].forEach((py) => {
    const aro = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 10), metal);
    aro.position.y = py; aro.castShadow = true; g.add(aro);
  });
  const braco = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.12, 0.12), metal);
  braco.position.set(0.46, 5.82, 0); braco.rotation.z = -0.22; braco.castShadow = true; g.add(braco);
  const suporte = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.0, 6), metal);
  suporte.position.set(0.18, 5.43, 0); suporte.rotation.z = -0.72; suporte.castShadow = true; g.add(suporte);
  const lumMat = new THREE.MeshStandardMaterial({ color: 0xffdf9a, emissive: 0xffb84a, emissiveIntensity: 0.55, roughness: 0.32, transparent: true, opacity: 0.92 });
  const vidro = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.78, 6), lumMat);
  vidro.position.set(1.02, 5.43, 0); vidro.castShadow = false; g.add(vidro);
  const tampa = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.42, 6), metal);
  tampa.position.set(1.02, 6.02, 0); tampa.castShadow = true; g.add(tampa);
  const fundo = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.16, 6), metal);
  fundo.position.set(1.02, 4.94, 0); fundo.castShadow = true; g.add(fundo);
  [-1, 1].forEach((s) => {
    const haste = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.86, 0.06), madeira);
    haste.position.set(1.02 + s * 0.33, 5.43, 0); haste.castShadow = true; g.add(haste);
  });
  const luz = new THREE.PointLight(0xffd27f, 0.0, 24, 2); luz.position.set(1.02, 5.42, 0); g.add(luz);
  return { grupo: g, colisores: [{ minX: x - 0.4, maxX: x + 0.4, minZ: z - 0.4, maxZ: z + 0.4 }], luz, lumMat };
}

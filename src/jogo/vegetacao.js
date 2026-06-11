// =============================================================
//  VEGETAÇÃO INSTANCIADA · a floresta inteira em ~9 draw calls.
//  Antes: cada árvore grande = ~11 meshes (≈900 meshes no mundo).
//  Agora: arquétipos com CORES POR VÉRTICE (flat shading) desenhados
//  via InstancedMesh — instancing OBRIGATÓRIO do plano da 18ª rodada.
//  SLOTS GLB (mesma receita do dragao.glb): solte em public/modelos/
//    arvore1.glb  → troca TODAS as árvores grandes
//    pinheiro.glb → troca TODOS os pinheiros
//    pedra.glb    → troca TODAS as pedras
//  (Quaternius Ultimate Nature / Stylized Nature — poly.pizza, CC0)
// =============================================================
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { desloca } from './construcoes.js';

const MAT_VEG = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });

// pinta a geometria inteira de uma cor e remove o índice (pré-merge)
function pinta(geo, cor) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(cor);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

// ---- arquétipos (mesma silhueta das funções de natureza.js/construcoes.js) ----
const CASCA = 0x4f3a22;
const PALETAS = [[0x3e7032, 0x4f8a3e, 0x32592a], [0x4a8a3a, 0x5d9c4b, 0x3a6e2e], [0x57924a, 0x6aa85a, 0x447238], [0x6a9a3a, 0x7cab4b, 0x54802e]];

function geoArvoreGrande(pal) {
  const partes = [];
  const tronco = pinta(new THREE.CylinderGeometry(0.55, 0.95, 7.5, 7), CASCA);
  tronco.translate(0, 3.75, 0); partes.push(tronco);
  for (let i = 0; i < 4; i++) { // raízes salientes
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const raiz = pinta(new THREE.BoxGeometry(0.4, 0.9, 1.3), CASCA);
    raiz.rotateX(0.25); raiz.rotateY(-a);
    raiz.translate(Math.cos(a) * 0.85, 0.4, Math.sin(a) * 0.85); partes.push(raiz);
  }
  const galho = pinta(new THREE.CylinderGeometry(0.22, 0.32, 3.2, 6), CASCA);
  galho.rotateZ(-1.0); galho.translate(1.4, 6.2, 0.4); partes.push(galho);
  // copa frondosa (5 blobs orgânicos)
  [[0, 9.5, 0, 3.4, pal[0]], [2.4, 8.4, 0.8, 2.4, pal[1]], [-2.2, 8.6, -0.6, 2.5, pal[2]],
   [0.6, 10.8, 1.6, 2.2, pal[1]], [-0.8, 8.0, 2.0, 2.1, pal[0]]].forEach(([ox, oy, oz, r, cor]) => {
    const c = pinta(desloca(new THREE.IcosahedronGeometry(r, 0), r * 0.34), cor);
    c.rotateY(Math.random() * 2); c.translate(ox, oy, oz); partes.push(c);
  });
  return BufferGeometryUtils.mergeGeometries(partes);
}

function geoPinheiro(corFolha) {
  const partes = [];
  const tronco = pinta(new THREE.CylinderGeometry(0.3, 0.42, 2.2, 6), 0x5a3f24);
  tronco.translate(0, 1.1, 0); partes.push(tronco);
  [[2.8, 2.6, 3.0], [2.1, 2.4, 4.8], [1.4, 2.2, 6.3]].forEach(([r, h, y]) => {
    const c = pinta(desloca(new THREE.ConeGeometry(r, h, 7), r * 0.16), corFolha);
    c.translate(0, y, 0); partes.push(c);
  });
  return BufferGeometryUtils.mergeGeometries(partes);
}

function geoMoita(pal) {
  const partes = [];
  [[0, 0.62, 0, 1.05], [0.7, 0.46, 0.3, 0.7], [-0.6, 0.42, -0.28, 0.62]].forEach(([ox, oy, oz, r], i) => {
    const b = pinta(desloca(new THREE.IcosahedronGeometry(r, 0), r * 0.3), pal[i % pal.length]);
    b.translate(ox, oy, oz); partes.push(b);
  });
  return BufferGeometryUtils.mergeGeometries(partes);
}

// CAPIM 3D (RV4.0): tufo de lâminas SÓLIDAS inclinadas — profundidade de
// verdade no chão, misturado aos cartazes de mato (fim do "papel de parede")
function geoCapim(cor) {
  const partes = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const h = 0.55 + (i % 3) * 0.22;
    const folha = pinta(new THREE.ConeGeometry(0.05, h, 4), cor);
    folha.rotateX(0.32); folha.rotateY(a);
    folha.translate(Math.cos(a) * 0.16, h / 2, Math.sin(a) * 0.16);
    partes.push(folha);
  }
  return BufferGeometryUtils.mergeGeometries(partes);
}

// FLOR 3D (RV5.4): caule + corola de 5 pétalas + miolo — o campo deixa de
// ser só textura e ganha flores DE VERDADE (instanciadas, ~1 draw call/cor)
function geoFlor(corPetala) {
  const partes = [];
  const caule = pinta(new THREE.CylinderGeometry(0.025, 0.035, 0.5, 5), 0x4a7a36);
  caule.translate(0, 0.25, 0); partes.push(caule);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const pet = pinta(new THREE.SphereGeometry(0.075, 6, 5), corPetala);
    pet.scale(1, 0.55, 1);
    pet.translate(Math.cos(a) * 0.09, 0.52, Math.sin(a) * 0.09);
    partes.push(pet);
  }
  const miolo = pinta(new THREE.SphereGeometry(0.055, 6, 5), 0xf2c14e);
  miolo.translate(0, 0.54, 0); partes.push(miolo);
  return BufferGeometryUtils.mergeGeometries(partes);
}

// BIOMAS (RV5.6): cada região com sua planta típica — tudo instanciado
// JUNCO: lâminas finas verticais + espigas marrons (beira d'água)
function geoJunco() {
  const partes = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4, r = 0.12 + (i % 3) * 0.08;
    const h = 1.1 + (i % 3) * 0.35;
    const lam = pinta(new THREE.CylinderGeometry(0.03, 0.045, h, 4), 0x4f7a3a);
    lam.rotateZ((i % 2 ? 1 : -1) * 0.12);
    lam.translate(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    partes.push(lam);
    if (i % 2 === 0) {
      const esp = pinta(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 5), 0x6b4226);
      esp.translate(Math.cos(a) * r, h + 0.12, Math.sin(a) * r);
      partes.push(esp);
    }
  }
  return BufferGeometryUtils.mergeGeometries(partes);
}
// COGUMELOS: dupla de cogumelos no pé das árvores (floresta)
function geoCogu(corChapeu) {
  const partes = [];
  [[0, 0.34, 0.2], [0.32, 0.22, 0.13]].forEach(([ox, hC, rC]) => {
    const caule = pinta(new THREE.CylinderGeometry(rC * 0.4, rC * 0.5, hC, 5), 0xe8e0d0);
    caule.translate(ox, hC / 2, 0); partes.push(caule);
    const chap = pinta(new THREE.SphereGeometry(rC, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2), corChapeu);
    chap.translate(ox, hC, 0); partes.push(chap);
  });
  return BufferGeometryUtils.mergeGeometries(partes);
}
// TRIGO: caule fino + espiga dourada (fazenda)
function geoTrigo() {
  const partes = [];
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 0.14, h = 0.85 + (i % 2) * 0.18;
    const caule = pinta(new THREE.CylinderGeometry(0.018, 0.026, h, 4), 0xb8a14e);
    caule.rotateZ((i - 1) * 0.08);
    caule.translate(ox, h / 2, 0); partes.push(caule);
    const espiga = pinta(new THREE.ConeGeometry(0.06, 0.3, 5), 0xd9b95c);
    espiga.translate(ox, h + 0.12, 0); partes.push(espiga);
  }
  return BufferGeometryUtils.mergeGeometries(partes);
}

function geoPedra(comMusgo) {
  const partes = [];
  const rocha = pinta(desloca(new THREE.IcosahedronGeometry(1, 0), 0.32), 0x8b8b86);
  rocha.rotateX(Math.random()); rocha.rotateY(Math.random());
  rocha.translate(0, 0.5, 0); partes.push(rocha);
  if (comMusgo) { // musgo no topo (assinatura dos packs premium)
    const musgo = pinta(desloca(new THREE.IcosahedronGeometry(0.55, 0), 0.2), 0x5d8f46);
    musgo.scale(1, 0.45, 1); musgo.translate(0, 1.05, 0); partes.push(musgo);
  }
  return BufferGeometryUtils.mergeGeometries(partes);
}

// posições: arvores/pedras/moitas/capim/flores/seixos/juncos/cogus/trigo = [x, z, s], pinheiros = [x, z]
export function criaVegetacaoInstanciada({ arvores = [], pinheiros = [], pedras = [], moitas = [], capim = [], flores = [], seixos = [], juncos = [], cogus = [], trigo = [] }, alturaSolo) {
  const g = new THREE.Group();
  const colisores = [];
  const dummy = new THREE.Object3D();
  const registros = []; // { todas: Matrix4[], meshes } — p/ trocar pelo GLB mantendo as instâncias

  function lote(posicoes, geos, raioCol, alvoGLB, arquivoGLB) {
    const porArq = geos.map(() => []);
    const todas = [];
    posicoes.forEach(([x, z, s = 1], i) => {
      dummy.position.set(x, alturaSolo ? alturaSolo(x, z) : 0, z);
      dummy.rotation.set(0, ((i * 73) % 360) * Math.PI / 180, 0); // variação determinística
      dummy.scale.setScalar(s * (0.92 + ((i * 37) % 17) / 100));
      dummy.updateMatrix();
      porArq[i % geos.length].push(dummy.matrix.clone());
      todas.push(dummy.matrix.clone());
      if (raioCol > 0) colisores.push({ minX: x - raioCol * s, maxX: x + raioCol * s, minZ: z - raioCol * s, maxZ: z + raioCol * s });
    });
    const meshes = [];
    porArq.forEach((mats, k) => {
      if (!mats.length) return;
      const im = new THREE.InstancedMesh(geos[k], MAT_VEG, mats.length);
      mats.forEach((m, j) => im.setMatrixAt(j, m));
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
      g.add(im); meshes.push(im);
    });
    registros.push({ todas, meshes, alvoGLB, arquivoGLB });
  }

  lote(arvores, PALETAS.map((p) => geoArvoreGrande(p)), 1.2, 11, 'arvore1');
  lote(pinheiros, [0x356130, 0x2e6e3a, 0x3d7a36].map((c) => geoPinheiro(c)), 1.0, 7.5, 'pinheiro');
  lote(pedras, [geoPedra(true), geoPedra(false)], 0.8, 1.5, 'pedra');
  // moitas/capim/flores/seixos: SEM colisor (atravessáveis) e sem slot GLB
  lote(moitas, [geoMoita([0x4f7e3e, 0x568a44, 0x3f6e34]), geoMoita([0x5d8f46, 0x4a7a38, 0x6a9a50])], 0, 0, '');
  lote(capim, [0x4e7c3a, 0x5d8f46, 0x447034].map((c) => geoCapim(c)), 0, 0, '');
  lote(flores, [0xe85d75, 0xf2c14e, 0xd06ad0, 0xefefef].map((c) => geoFlor(c)), 0, 0, '');
  lote(seixos, [geoPedra(false), geoPedra(true)], 0, 0, '');
  // BIOMAS (RV5.6): junco na água, cogumelo na floresta, trigo na fazenda
  lote(juncos, [geoJunco(), geoJunco()], 0, 0, '');
  lote(cogus, [geoCogu(0xc23a2a), geoCogu(0x8a5a3a)], 0, 0, '');
  lote(trigo, [geoTrigo(), geoTrigo()], 0, 0, '');

  // SLOT GLB: ao carregar, a espécie inteira troca pelo modelo profissional
  // (auto-escala pela altura, base no chão, mesmas matrizes de instância)
  registros.forEach((reg) => {
    if (!reg.todas.length || !reg.arquivoGLB) return;
    new GLTFLoader().load(`modelos/${reg.arquivoGLB}.glb`, (gltf) => {
      const cena = gltf.scene; cena.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(cena);
      const tam = new THREE.Vector3(); bb.getSize(tam);
      const centro = new THREE.Vector3(); bb.getCenter(centro);
      const esc = reg.alvoGLB / (tam.y || 1);
      const norm = new THREE.Matrix4().makeScale(esc, esc, esc)
        .multiply(new THREE.Matrix4().makeTranslation(-centro.x, -bb.min.y, -centro.z));
      const novos = [];
      cena.traverse((o) => {
        if (!o.isMesh) return;
        const geo = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(norm, o.matrixWorld));
        const im = new THREE.InstancedMesh(geo, o.material, reg.todas.length);
        reg.todas.forEach((m, j) => im.setMatrixAt(j, m));
        im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
        novos.push(im);
      });
      if (!novos.length) return;
      reg.meshes.forEach((m) => g.remove(m)); // o procedural sai de cena
      novos.forEach((m) => g.add(m));
      reg.meshes = novos;
    }, undefined, () => { /* sem arquivo: visual procedural continua */ });
  });

  return { grupo: g, colisores };
}

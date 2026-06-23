// =============================================================
//  AURÉLIA, A CIDADE NAS NUVENS  ·  a base dos dragões (RV13.0).
//  Cidade flutuante de mármore e ouro acima de um mar de nuvens, onde
//  vivem os Dragões-Anciões — o berço da linhagem de fogo da Veia.
//  Zona CARREGADA (y=-40, coords locais), como as masmorras/Irmãs, mas
//  com LUZ CELESTE própria. Alcançada ascendendo do platô da Montanha do
//  Dragão. Devolve { grupo, colisores, bounds, acessos, saidas, lord,
//  arena, ovos, dragoes[] } pro main3d montar a quest e os bichos.
// =============================================================
import * as THREE from 'three';
import { mat, aplicaTexturaReal } from './construcoes.js';

const Y = -40;
const CX = -720, CZ = 720; // região local, longe de tudo (NW)

export function criaCidadeNuvens() {
  const g = new THREE.Group();
  const colisores = [];
  const col = (x, z, w, d) => colisores.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });

  // ---- materiais (mármore + ouro celeste) ----
  const marmoreMat = new THREE.MeshStandardMaterial({ color: 0xeae4d8, roughness: 0.45, metalness: 0.06 });
  aplicaTexturaReal(marmoreMat, 'pedra_nuvem', 6, 6, false, true); // mármore com veios de ouro (quando carregar)
  const ouroMat = new THREE.MeshStandardMaterial({ color: 0xd9b25a, metalness: 0.85, roughness: 0.28, emissive: 0x3a2a08, emissiveIntensity: 0.25 });
  const nuvemMat = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, roughness: 1, transparent: true, opacity: 0.92, emissive: 0xdfe8f2, emissiveIntensity: 0.15 });

  // ---- MAR DE NUVENS (discos achatados em volta e abaixo da cidade) ----
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2, rr = 46 + Math.random() * 30;
    const s = 7 + Math.random() * 12;
    const nuv = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 7), nuvemMat);
    nuv.position.set(CX + Math.cos(a) * rr, Y - 4 - Math.random() * 5, CZ + Math.sin(a) * rr);
    nuv.scale.y = 0.4; g.add(nuv);
  }
  // colchão de nuvens sob a cidade
  const baseNuv = new THREE.Mesh(new THREE.CylinderGeometry(44, 30, 6, 24), nuvemMat);
  baseNuv.position.set(CX, Y - 4, CZ); g.add(baseNuv);

  // ---- PLATAFORMA de mármore (a cidade) ----
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(40, 38, 1.2, 28), marmoreMat);
  plat.position.set(CX, Y - 0.2, CZ); plat.receiveShadow = true; g.add(plat);
  // borda dourada
  const borda = new THREE.Mesh(new THREE.TorusGeometry(40, 0.7, 8, 40), ouroMat);
  borda.rotation.x = Math.PI / 2; borda.position.set(CX, Y + 0.4, CZ); g.add(borda);

  // ---- ESPIRAIS / TORRES douradas em volta do rim ----
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, tx = CX + Math.cos(a) * 33, tz = CZ + Math.sin(a) * 33;
    const h = 14 + (i % 3) * 4;
    const torre = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, h, 12), marmoreMat);
    torre.position.set(tx, Y + h / 2, tz); torre.castShadow = true; g.add(torre);
    const topo = new THREE.Mesh(new THREE.ConeGeometry(2.0, 4, 12), ouroMat);
    topo.position.set(tx, Y + h + 2, tz); g.add(topo);
    col(tx, tz, 3.2, 3.2);
  }

  // ---- TEMPLO CENTRAL (salão do Dragão-Ancião) ----
  const tplZ = CZ - 18;
  const estrado = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, 1.0, 20), marmoreMat);
  estrado.position.set(CX, Y + 0.5, tplZ); g.add(estrado);
  for (let i = 0; i < 8; i++) { // colunas
    const a = (i / 8) * Math.PI * 2, px = CX + Math.cos(a) * 9, pz = tplZ + Math.sin(a) * 9;
    const cluna = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 11, 12), marmoreMat);
    cluna.position.set(px, Y + 6, pz); cluna.castShadow = true; g.add(cluna);
    col(px, pz, 1.4, 1.4);
  }
  const domo = new THREE.Mesh(new THREE.SphereGeometry(10, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), ouroMat);
  domo.position.set(CX, Y + 11.5, tplZ); g.add(domo);
  const pináculo = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 10), ouroMat);
  pináculo.position.set(CX, Y + 17.5, tplZ); g.add(pináculo);

  // ---- NINHOS / OVOS DE DRAGÃO (a base de criação) ----
  const ovos = [];
  const ovoMat = new THREE.MeshStandardMaterial({ color: 0xe8d0a0, roughness: 0.5, emissive: 0xff7a2a, emissiveIntensity: 0.5 });
  [[CX - 22, CZ + 8], [CX + 22, CZ + 6], [CX - 6, CZ + 26], [CX + 12, CZ + 24]].forEach(([nx, nz]) => {
    const ninho = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.7, 7, 14), mat(0x6e5230, 1));
    ninho.rotation.x = Math.PI / 2; ninho.position.set(nx, Y + 0.5, nz); g.add(ninho);
    const ovo = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 12), ovoMat);
    ovo.scale.y = 1.35; ovo.position.set(nx, Y + 1.2, nz); ovo.castShadow = true; g.add(ovo);
    ovos.push(ovo);
    const luz = new THREE.PointLight(0xff8a3a, 0.7, 10, 2); luz.position.set(nx, Y + 2, nz); g.add(luz);
  });

  // ---- luz celeste de entrada + faróis dourados ----
  const luzCentral = new THREE.PointLight(0xfff0d0, 1.0, 60, 2); luzCentral.position.set(CX, Y + 20, CZ); g.add(luzCentral);

  // RV17: inicio do arquipelago celeste. Ainda e a mesma zona tecnica, mas
  // visualmente ja cria o "mundo nas alturas" que vai justificar o voo.
  const ilhas = [];
  function ilhaCeleste(x, z, r, nome, cor = 0xeae4d8) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.72, 2.0, 20), new THREE.MeshStandardMaterial({ color: cor, roughness: 0.58, metalness: 0.03 }));
    aplicaTexturaReal(base.material, 'pedra_nuvem', 7, 7, false, true);
    base.position.set(x, Y - 0.55, z); base.receiveShadow = true; g.add(base);
    const bordaI = new THREE.Mesh(new THREE.TorusGeometry(r, 0.38, 7, 28), ouroMat);
    bordaI.rotation.x = Math.PI / 2; bordaI.position.set(x, Y + 0.5, z); g.add(bordaI);
    for (let i = 0; i < Math.max(5, Math.floor(r / 2)); i++) {
      const a = (i / Math.max(5, Math.floor(r / 2))) * Math.PI * 2;
      const ped = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45 + (i % 3) * 0.16, 0), marmoreMat);
      ped.position.set(x + Math.cos(a) * (r * 0.62), Y + 0.38, z + Math.sin(a) * (r * 0.62));
      ped.scale.y = 0.45 + (i % 2) * 0.3; g.add(ped);
    }
    ilhas.push({ nome, x, z, r });
  }
  function ponteCeleste(x1, z1, x2, z2, w = 5) {
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.42, len), marmoreMat);
    p.position.set((x1 + x2) / 2, Y + 0.36, (z1 + z2) / 2);
    p.rotation.y = ang; p.receiveShadow = true; g.add(p);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.6, len), ouroMat);
    b1.position.set(-w / 2, 0.4, 0); p.add(b1);
    const b2 = b1.clone(); b2.position.x = w / 2; p.add(b2);
  }
  ilhaCeleste(CX - 94, CZ + 22, 18, 'Jardins Suspensos');
  ilhaCeleste(CX + 108, CZ - 20, 22, 'Portao dos Primeiros Ventos', 0xd8d1c8);
  ilhaCeleste(CX + 56, CZ + 82, 16, 'Mirante do Voo Rasante');
  ilhaCeleste(CX - 58, CZ - 86, 15, 'Obelisco da Linhagem');
  ponteCeleste(CX - 38, CZ + 6, CX - 94, CZ + 22, 4.8);
  ponteCeleste(CX + 36, CZ - 8, CX + 108, CZ - 20, 5.2);
  ponteCeleste(CX + 18, CZ + 36, CX + 56, CZ + 82, 4.3);
  ponteCeleste(CX - 18, CZ - 34, CX - 58, CZ - 86, 4.0);

  const entradaVentos = { x: CX + 108, z: CZ - 20 };
  const arco = new THREE.Group(); arco.position.set(entradaVentos.x, Y + 0.6, entradaVentos.z); g.add(arco);
  const obs = new THREE.MeshStandardMaterial({ color: 0x17151f, roughness: 0.5, metalness: 0.2, emissive: 0x24125a, emissiveIntensity: 0.18 });
  [-1, 1].forEach((ld) => {
    const colu = new THREE.Mesh(new THREE.BoxGeometry(2.2, 12.5, 2.2), obs);
    colu.position.set(ld * 5.0, 6.25, 0); colu.castShadow = true; arco.add(colu);
    col(entradaVentos.x + ld * 5.0, entradaVentos.z, 2.4, 2.4);
  });
  const topoGate = new THREE.Mesh(new THREE.BoxGeometry(12.5, 2.4, 2.2), obs);
  topoGate.position.set(0, 12.3, 0); arco.add(topoGate);
  const portalMat = new THREE.MeshBasicMaterial({ color: 0x9a70ff, transparent: true, opacity: 0.38, depthWrite: false });
  const portal = new THREE.Mesh(new THREE.CircleGeometry(4.2, 32), portalMat);
  portal.position.set(0, 5.8, 0.1); portal.scale.y = 1.45; arco.add(portal);
  const luzPortal = new THREE.PointLight(0x9a70ff, 1.3, 34, 2); luzPortal.position.set(entradaVentos.x, Y + 7.0, entradaVentos.z); g.add(luzPortal);
  const altarVoo = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.8, 16), ouroMat);
  altarVoo.position.set(CX + 56, Y + 0.8, CZ + 82); g.add(altarVoo);
  const cristalVoo = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), new THREE.MeshStandardMaterial({ color: 0x8e63ff, emissive: 0x6a36ff, emissiveIntensity: 1.2, roughness: 0.22, metalness: 0.05 }));
  cristalVoo.position.set(CX + 56, Y + 3.0, CZ + 82); g.add(cristalVoo);

  const a = { x: CX, z: CZ + 30 }; // chegada (rim sul) — perto da borda, virado pro templo

  return {
    grupo: g, colisores,
    bounds: { minX: CX - 126, maxX: CX + 138, minZ: CZ - 106, maxZ: CZ + 106 },
    acessos: [a],
    saidas: [{ x: 110, z: 300 }],   // volta ao platô da Montanha do Dragão
    lord: { x: CX, z: tplZ + 6 },   // onde fica o Dragão-Ancião (NPC/boss da quest)
    arena: { x: CX, z: tplZ },      // centro do templo (luta)
    ovos,
    centro: { x: CX, z: CZ },
    ilhas,
    calaboucoEntrada: entradaVentos,
    miranteVoo: { x: CX + 56, z: CZ + 82 },
  };
}

export function criaCalaboucoVentos() {
  const Y2 = -80;
  const DX = -1010, DZ = 840;
  const g = new THREE.Group();
  const colisores = [];
  const pois = [];
  const col = (x, z, w, d) => colisores.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });

  const pisoMat = new THREE.MeshStandardMaterial({ color: 0x34303a, roughness: 0.82, metalness: 0.05 });
  const paredeMat = new THREE.MeshStandardMaterial({ color: 0x16151d, roughness: 0.62, metalness: 0.18, emissive: 0x120826, emissiveIntensity: 0.08 });
  const ouroVelho = new THREE.MeshStandardMaterial({ color: 0xa9873e, roughness: 0.42, metalness: 0.55, emissive: 0x211605, emissiveIntensity: 0.15 });
  const cristalMat = new THREE.MeshStandardMaterial({ color: 0x8e63ff, emissive: 0x5226d8, emissiveIntensity: 0.95, roughness: 0.24, metalness: 0.08 });

  function parede(x, z, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 4.6, d), paredeMat);
    m.position.set(x, Y2 + 2.15, z); m.castShadow = true; m.receiveShadow = true; g.add(m);
    col(x, z, w, d);
  }
  function sala(x, z, w, d, nome) {
    const piso = new THREE.Mesh(new THREE.BoxGeometry(w, 0.34, d), pisoMat);
    piso.position.set(x, Y2, z); piso.receiveShadow = true; g.add(piso);
    const gap = 8;
    parede(x - (w + gap) / 4, z - d / 2, (w - gap) / 2, 1.2);
    parede(x + (w + gap) / 4, z - d / 2, (w - gap) / 2, 1.2);
    parede(x - (w + gap) / 4, z + d / 2, (w - gap) / 2, 1.2);
    parede(x + (w + gap) / 4, z + d / 2, (w - gap) / 2, 1.2);
    parede(x - w / 2, z - (d + gap) / 4, 1.2, (d - gap) / 2);
    parede(x - w / 2, z + (d + gap) / 4, 1.2, (d - gap) / 2);
    parede(x + w / 2, z - (d + gap) / 4, 1.2, (d - gap) / 2);
    parede(x + w / 2, z + (d + gap) / 4, 1.2, (d - gap) / 2);
    pois.push({ nome, x, z, raio: Math.min(5, Math.max(3, Math.min(w, d) * 0.1)) });
  }
  function corredor(x, z, w, d) {
    const piso = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), pisoMat);
    piso.position.set(x, Y2 + 0.02, z); piso.receiveShadow = true; g.add(piso);
  }
  function pilar(x, z, h = 8, r = 0.8) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, h, 10), paredeMat);
    m.position.set(x, Y2 + h / 2, z); m.castShadow = true; g.add(m); col(x, z, r * 2, r * 2);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.6, r * 1.3, 0.6, 10), ouroVelho);
    top.position.set(x, Y2 + h + 0.15, z); g.add(top);
  }
  function cristal(x, z, s = 1) {
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), cristalMat);
    c.position.set(x, Y2 + 1.4 + s * 0.2, z); c.castShadow = true; g.add(c);
    const l = new THREE.PointLight(0x8e63ff, 0.55, 12, 2); l.position.set(x, Y2 + 2.8, z); g.add(l);
  }

  sala(DX, DZ, 34, 28, 'Vestibulo dos Ventos');
  sala(DX + 54, DZ - 8, 40, 34, 'Galeria das Armas Antigas');
  sala(DX + 108, DZ + 18, 48, 42, 'Nave dos Golems de Cristal');
  sala(DX + 166, DZ - 18, 46, 46, 'Arena do Primeiro Vento');
  corredor(DX + 27, DZ - 4, 22, 8);
  corredor(DX + 82, DZ + 4, 26, 8);
  corredor(DX + 137, DZ, 26, 8);

  [[DX - 12, DZ - 8], [DX + 12, DZ + 8], [DX + 42, DZ - 22], [DX + 68, DZ + 8], [DX + 96, DZ + 3], [DX + 120, DZ + 34], [DX + 148, DZ - 34], [DX + 184, DZ + 8]].forEach(([x, z], i) => pilar(x, z, 6 + (i % 3) * 1.2));
  [[DX - 6, DZ + 10, 0.9], [DX + 54, DZ - 8, 1.1], [DX + 105, DZ + 32, 1.4], [DX + 132, DZ + 4, 1.0], [DX + 166, DZ - 18, 1.8]].forEach(([x, z, s]) => cristal(x, z, s));

  const mesa = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.8, 0.7, 18), ouroVelho);
  mesa.position.set(DX + 54, Y2 + 0.62, DZ - 8); g.add(mesa);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const arma = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 4.2), i % 2 ? ouroVelho : cristalMat);
    arma.position.set(DX + 54 + Math.cos(a) * 3.2, Y2 + 1.08, DZ - 8 + Math.sin(a) * 3.2);
    arma.rotation.y = a; g.add(arma);
  }

  const portal = new THREE.Mesh(new THREE.CircleGeometry(5.2, 36), new THREE.MeshBasicMaterial({ color: 0xbfa6ff, transparent: true, opacity: 0.34, depthWrite: false }));
  portal.position.set(DX + 166, Y2 + 5.2, DZ - 38); portal.scale.y = 1.5; g.add(portal);
  const luz = new THREE.PointLight(0xbfa6ff, 1.4, 50, 2); luz.position.set(DX + 166, Y2 + 5.5, DZ - 18); g.add(luz);

  return {
    grupo: g,
    colisores,
    bounds: { minX: DX - 24, maxX: DX + 192, minZ: DZ - 48, maxZ: DZ + 48 },
    acessos: [{ x: DX - 12, z: DZ }],
    saidas: [{ x: 110, z: 300 }],
    retornoAurelia: { x: CX + 104, z: CZ - 20 },
    pois,
    spawns: {
      sentinelas: [{ x: DX + 34, z: DZ - 8 }, { x: DX + 74, z: DZ + 8 }, { x: DX + 136, z: DZ - 4 }],
      golems: [{ x: DX + 102, z: DZ + 16 }, { x: DX + 122, z: DZ + 32 }],
      wyverns: [{ x: DX + 150, z: DZ - 28 }, { x: DX + 180, z: DZ + 12 }],
      boss: { x: DX + 166, z: DZ - 18 },
    },
  };
}

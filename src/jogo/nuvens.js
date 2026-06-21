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

  const a = { x: CX, z: CZ + 30 }; // chegada (rim sul) — perto da borda, virado pro templo

  return {
    grupo: g, colisores,
    bounds: { minX: CX - 38, maxX: CX + 38, minZ: CZ - 38, maxZ: CZ + 38 },
    acessos: [a],
    saidas: [{ x: 110, z: 300 }],   // volta ao platô da Montanha do Dragão
    lord: { x: CX, z: tplZ + 6 },   // onde fica o Dragão-Ancião (NPC/boss da quest)
    arena: { x: CX, z: tplZ },      // centro do templo (luta)
    ovos,
    centro: { x: CX, z: CZ },
  };
}

// =============================================================
//  AS IRMÃS AFUNDADAS  ·  a Segunda Terra de Venor (Fase 3 / RV10.5)
//  Zona CARREGADA (y = -40), igual às masmorras: coords LOCAIS próprias,
//  iluminação própria, minimapa escondido. Não estende a superfície (o
//  motor trava o avatar em ±900) — é uma cena à parte, alcançada pela
//  Boca da Veia (rota marítima do sul). Cânone: "sair do organismo de
//  Venor e nadar até outro corpo-mundo" (codice.js, O Quarto Veio).
//
//  ILHA 1 — A QUEBRA-MAR (a Vértebra do Sal): a primeira vértebra da
//  espinha quebrada, coalhada de naufrágios da frota que "nunca volta".
//  Devolve { grupo, colisores, bounds, acessos, saidas, lavas, sino, placa }.
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

const Y = -40;                       // mesmo nível das outras zonas carregadas
const CX = 720, CZ = -700;           // centro da ilha (região vazia, dentro de ±900)

export function criaIrmasIlha1() {
  const g = new THREE.Group();
  const colisores = [];

  // ---- MAR morno e escuro (a água preta "como sangue" do cânone) ----
  const marMat = new THREE.MeshStandardMaterial({ color: 0x140a12, roughness: 0.5, metalness: 0.1, emissive: 0x1c0a08, emissiveIntensity: 0.14 });
  const mar = new THREE.Mesh(new THREE.BoxGeometry(220, 0.4, 220), marMat);
  mar.position.set(CX, Y - 0.7, CZ); mar.receiveShadow = true; g.add(mar);
  // anel de espuma/rebentação em volta da ilha (mais claro)
  const espuma = new THREE.Mesh(new THREE.RingGeometry(40, 47, 48),
    new THREE.MeshBasicMaterial({ color: 0x4a3a40, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  espuma.rotation.x = -Math.PI / 2; espuma.position.set(CX, Y - 0.35, CZ); g.add(espuma);

  // ---- AREIA da ilha (a vértebra exposta na maré) ----
  const areia = new THREE.Mesh(new THREE.CircleGeometry(43, 40), mat(0x9a8460, 1));
  areia.rotation.x = -Math.PI / 2; areia.position.set(CX, Y, CZ); areia.receiveShadow = true; g.add(areia);
  // poças de maré salgadas (escuras, espelhadas)
  [[-16, 10, 4], [12, -14, 3], [20, 12, 2.5], [-22, -8, 2.2]].forEach(([dx, dz, r]) => {
    const poca = new THREE.Mesh(new THREE.CircleGeometry(r, 18),
      new THREE.MeshStandardMaterial({ color: 0x10151a, roughness: 0.2, metalness: 0.4 }));
    poca.rotation.x = -Math.PI / 2; poca.position.set(CX + dx, Y + 0.02, CZ + dz); g.add(poca);
  });

  // ---- ROCHEDOS de sal (escuros, cristal esbranquiçado) ----
  const rocha = mat(0x3a3036, 1);
  [[-30, 6, 2.2], [28, -18, 2.6], [-8, 24, 1.8], [33, 14, 2.0], [-26, -22, 2.4]].forEach(([dx, dz, s]) => {
    const x = CX + dx, z = CZ + dz;
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s), rocha);
    r.position.set(x, Y + s * 0.55, z); r.rotation.set(Math.random(), Math.random(), Math.random());
    r.castShadow = true; g.add(r);
    // crosta de sal cristalizada no topo
    const sal = new THREE.Mesh(new THREE.ConeGeometry(s * 0.4, s * 0.7, 6),
      new THREE.MeshStandardMaterial({ color: 0xd8e0e4, emissive: 0x223035, emissiveIntensity: 0.3, roughness: 0.3 }));
    sal.position.set(x, Y + s * 1.05, z); g.add(sal);
    colisores.push({ minX: x - s, maxX: x + s, minZ: z - s, maxZ: z + s });
  });

  // ---- NAUFRÁGIOS (a frota que "nunca volta" — barcos dos que tentaram antes) ----
  const madeira = mat(0x4b3a26, 1), madeiraEsc = mat(0x32271a, 1);
  function naufragio(dx, dz, rot, escala = 1) {
    const x = CX + dx, z = CZ + dz;
    const casco = new THREE.Group(); casco.position.set(x, Y, z); casco.rotation.y = rot; casco.rotation.z = 0.18 * escala;
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(9 * escala, 2.4 * escala, 3.4 * escala), madeira);
    corpo.position.y = 0.8 * escala; corpo.castShadow = true; casco.add(corpo);
    // costelas do casco partido
    for (let i = -1; i <= 1; i++) {
      const cst = new THREE.Mesh(new THREE.TorusGeometry(1.6 * escala, 0.16, 6, 10, Math.PI), madeiraEsc);
      cst.position.set(i * 2.6 * escala, 0.8 * escala, 0); cst.rotation.x = Math.PI / 2; casco.add(cst);
    }
    // mastro quebrado, caído
    const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6 * escala, 7), madeiraEsc);
    mastro.position.set(1.5 * escala, 1.8 * escala, 0); mastro.rotation.z = 0.9; casco.add(mastro);
    g.add(casco);
    colisores.push({ minX: x - 5 * escala, maxX: x + 5 * escala, minZ: z - 2.4 * escala, maxZ: z + 2.4 * escala });
  }
  naufragio(-28, -4, 0.7, 1.1);
  naufragio(30, 8, -1.1, 0.9);
  naufragio(-4, 30, 2.4, 1.0);

  // ---- O SINO DE BRONZE do porto inacabado de Venor (badala com a maré) ----
  const sinoX = CX + 6, sinoZ = CZ - 6;
  const poste = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.2, 0.5), madeira);
  poste.position.set(sinoX, Y + 2.6, sinoZ); poste.castShadow = true; g.add(poste);
  const trave = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 0.4), madeira);
  trave.position.set(sinoX + 0.9, Y + 4.9, sinoZ); g.add(trave);
  const sino = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 1.8, 14),
    new THREE.MeshStandardMaterial({ color: 0x9a7b3a, metalness: 0.8, roughness: 0.4, emissive: 0x2a1e08, emissiveIntensity: 0.3 }));
  sino.position.set(sinoX + 1.6, Y + 3.7, sinoZ); sino.castShadow = true; g.add(sino);
  colisores.push({ minX: sinoX - 0.6, maxX: sinoX + 0.6, minZ: sinoZ - 0.6, maxZ: sinoZ + 0.6 });

  // ---- PLACA DE LORE (a primeira lápide das Irmãs) ----
  const placaX = CX - 6, placaZ = CZ + 8;
  const laje = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x6a6a72, roughness: 0.85 }));
  laje.position.set(placaX, Y + 1.2, placaZ); laje.rotation.z = 0.05; laje.castShadow = true; g.add(laje);

  // ---- DOCA DE VOLTA (acesso): tábuas que entram na água preta ----
  const ax = CX - 30, az = CZ + 26;             // ponto de chegada/saída
  const doca = new THREE.Group(); doca.position.set(ax, Y, az); g.add(doca);
  for (let i = 0; i < 5; i++) {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.1), madeira);
    tab.position.set(-i * 1.15, 0.08, 0); doca.add(tab);
  }
  const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 6), madeiraEsc);
  pilar.position.set(0.4, -0.4, 0); doca.add(pilar);
  // farol fraco que marca a saída (igual à luz de corda das masmorras)
  const luzSaida = new THREE.PointLight(0xffcaa0, 1.0, 16, 2); luzSaida.position.set(ax, Y + 3, az); g.add(luzSaida);

  // ---- LUZES de clima (warm nos naufrágios, fill frio do mar) ----
  const luzNauf = new THREE.PointLight(0xff8a4a, 0.7, 26, 2); luzNauf.position.set(CX, Y + 4, CZ); g.add(luzNauf);
  const fillFrio = new THREE.PointLight(0x4a6a8a, 0.5, 60, 2); fillFrio.position.set(CX, Y + 16, CZ + 30); g.add(fillFrio);

  return {
    grupo: g, colisores, lavas: [],
    bounds: { minX: CX - 30, maxX: CX + 30, minZ: CZ - 30, maxZ: CZ + 30 },
    acessos: [{ x: ax, z: az }],
    saidas: [{ x: 0, z: -206 }],     // volta à praia, ao pé da Pedra da Boca
    sino: { x: sinoX, z: sinoZ },
    placa: { x: placaX, z: placaZ },
  };
}

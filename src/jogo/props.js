// =============================================================
//  PROPS / ADORNOS  ·  detalhes que dão vida e riqueza à cidade.
//  Inclui ITENS VALIOSOS (baú, cristal) — ganchos para quests futuras.
//  Materiais comuns vêm do cache de construcoes.js (economia de memória).
//  Cada função devolve { grupo, colisores:[...], animados?:[...] }.
//  "animados" = peças animadas no loop (gira / flutua / pulsa / balanca).
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

// --- barril de madeira ---
export function criaBarril(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.1, 12), mat(0x6b4a2a));
  corpo.position.y = 0.55; corpo.castShadow = true; corpo.receiveShadow = true; g.add(corpo);
  [0.15, 0.55, 0.95].forEach((y) => {
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 6, 16), mat(0x30343a));
    aro.position.y = y; aro.rotation.x = Math.PI / 2; g.add(aro);
  });
  return { grupo: g, colisores: [{ minX: x - 0.5, maxX: x + 0.5, minZ: z - 0.5, maxZ: z + 0.5 }] };
}

// --- engradado (caixa) ---
export function criaCaixa(x, z, s = 0.9, rot = Math.random() * 0.6) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const cx = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat(0xa07c44));
  cx.position.y = s / 2; cx.castShadow = true; cx.receiveShadow = true; g.add(cx);
  const rip = mat(0x6e5128), e = s * 0.5 + 0.01;
  [e, -e].forEach((pz) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(s * 1.02, 0.12, 0.06), rip);
    f.position.set(0, s * 0.78, pz); g.add(f);
    const f2 = f.clone(); f2.position.y = s * 0.2; g.add(f2);
  });
  return { grupo: g, colisores: [{ minX: x - s / 2 - 0.1, maxX: x + s / 2 + 0.1, minZ: z - s / 2 - 0.1, maxZ: z + s / 2 + 0.1 }] };
}

// --- poço de pedra (com telhadinho) ---
export function criaPoco(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x8a8276);
  const anel = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 1.0, 16), pedra);
  anel.position.y = 0.5; anel.castShadow = true; anel.receiveShadow = true; g.add(anel);
  const agua = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.1, 16), mat(0x2f6f9f, 0.2));
  agua.position.y = 0.55; g.add(agua);
  [-1.1, 1.1].forEach((px) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.0, 0.18), mat(0x5a3f24));
    p.position.set(px, 1.5, 0); p.castShadow = true; g.add(p);
  });
  const telha = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.9, 4), mat(0x7a3a2a));
  telha.position.y = 3.0; telha.rotation.y = Math.PI / 4; telha.castShadow = true; g.add(telha);
  return { grupo: g, colisores: [{ minX: x - 1.3, maxX: x + 1.3, minZ: z - 1.3, maxZ: z + 1.3 }] };
}

// --- barraca de mercado (toldo listrado + mercadorias) ---
export function criaBarraca(x, z, rot = 0, cor = 0xb23a3a) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const madeira = mat(0x6e4f2a);
  [[-1.3, -0.8], [1.3, -0.8], [-1.3, 0.8], [1.3, 0.8]].forEach(([px, pz]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.2, 0.14), madeira);
    p.position.set(px, 1.1, pz); p.castShadow = true; g.add(p);
  });
  const balcao = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 1.0), madeira);
  balcao.position.set(0, 1.0, 0.7); balcao.castShadow = true; g.add(balcao);
  for (let i = 0; i < 6; i++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 2.0), mat(i % 2 ? 0xf0ece0 : cor));
    t.position.set(-1.25 + i * 0.5, 2.3, 0); t.castShadow = true; g.add(t);
  }
  const mercad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), mat(0x9c7a45));
  mercad.position.set(-0.7, 1.3, 0.7); g.add(mercad);
  [[0.4, 0xd23a2a], [0.85, 0xe0b020]].forEach(([fx, c]) => {
    const fruta = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), mat(c));
    fruta.position.set(fx, 1.28, 0.7); g.add(fruta);
  });
  return { grupo: g, colisores: [{ minX: x - 1.5, maxX: x + 1.5, minZ: z - 1.1, maxZ: z + 1.1 }] };
}

// --- estátua de herói em pedestal (MARCO único) ---
export function criaEstatua(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x9a9488);
  const bronze = new THREE.MeshStandardMaterial({ color: 0x6e5a32, metalness: 0.6, roughness: 0.45 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 2.2), pedra);
  base.position.y = 0.6; base.castShadow = true; base.receiveShadow = true; g.add(base);
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), pedra);
  base2.position.y = 1.4; g.add(base2);
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.8, 10), bronze);
  corpo.position.y = 2.5; corpo.castShadow = true; g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), bronze);
  cabeca.position.y = 3.6; g.add(cabeca);
  const braco = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, 0.18), bronze);
  braco.position.set(0.45, 3.1, 0); braco.rotation.z = -0.7; g.add(braco);
  const espada = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), mat(0xbfc6cf, 0.3));
  espada.position.set(0.95, 3.85, 0); g.add(espada);
  return { grupo: g, colisores: [{ minX: x - 1.2, maxX: x + 1.2, minZ: z - 1.2, maxZ: z + 1.2 }] };
}

// --- canteiro de flores ---
export function criaCanteiro(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const borda = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 2.2), mat(0x7a5a3a));
  borda.position.y = 0.17; borda.receiveShadow = true; g.add(borda);
  const terra = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.36, 1.9), mat(0x4a3526));
  terra.position.y = 0.2; g.add(terra);
  const cores = [0xe85d75, 0xf2c14e, 0xefefef, 0xd06ad0, 0xff8a4c, 0x6ab0ff];
  for (let i = 0; i < 9; i++) {
    const fx = (Math.random() - 0.5) * 1.7, fz = (Math.random() - 0.5) * 1.7;
    const cau = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 5), mat(0x3a6b30));
    cau.position.set(fx, 0.5, fz); g.add(cau);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), mat(cores[i % cores.length]));
    fl.position.set(fx, 0.72, fz); g.add(fl);
  }
  return { grupo: g, colisores: [{ minX: x - 1.1, maxX: x + 1.1, minZ: z - 1.1, maxZ: z + 1.1 }] };
}

// --- estandarte/bandeira em mastro (balança levemente) ---
export function criaBandeira(x, z, cor = 0x9c2a2a) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 8), mat(0x4a3a2a));
  mastro.position.y = 2.5; mastro.castShadow = true; g.add(mastro);
  const ponta = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat(0xd9a522, 0.3));
  ponta.position.y = 5.05; g.add(ponta);
  // RV3.0: EMBLEMA DO DRAGÃO costurado no pano (estandarte do reino)
  const cnvB = document.createElement('canvas'); cnvB.width = 128; cnvB.height = 96;
  const cb = cnvB.getContext('2d');
  cb.fillStyle = '#' + cor.toString(16).padStart(6, '0'); cb.fillRect(0, 0, 128, 96);
  cb.strokeStyle = 'rgba(255,235,180,.4)'; cb.lineWidth = 5; cb.strokeRect(5, 5, 118, 86);
  cb.font = '50px Arial'; cb.textAlign = 'center'; cb.textBaseline = 'middle'; cb.fillText('🐉', 64, 50);
  const texB = new THREE.CanvasTexture(cnvB); texB.colorSpace = THREE.SRGBColorSpace;
  const panoMat = new THREE.MeshStandardMaterial({ map: texB, roughness: 0.85, side: THREE.DoubleSide });
  const pano = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), panoMat);
  pano.position.set(0.78, 4.1, 0); pano.castShadow = true; g.add(pano);
  return {
    grupo: g,
    colisores: [{ minX: x - 0.3, maxX: x + 0.3, minZ: z - 0.3, maxZ: z + 0.3 }],
    animados: [{ mesh: pano, balanca: true, fase: Math.random() * 6 }],
  };
}

// === ITENS VALIOSOS (ganchos de quest) =======================

// --- baú do tesouro (fechadura brilhante) ---
export function criaBau(x, z, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
  const mad = mat(0x6b3f1f);
  const ouro = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.8, roughness: 0.3 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.8), mad);
  corpo.position.y = 0.35; corpo.castShadow = true; g.add(corpo);
  const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12, 1, false, 0, Math.PI), mad);
  tampa.rotation.z = Math.PI / 2; tampa.position.y = 0.7; tampa.castShadow = true; g.add(tampa);
  [-0.4, 0.4].forEach((px) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.82), ouro);
    c.position.set(px, 0.4, 0); g.add(c);
  });
  const gemaMat = new THREE.MeshStandardMaterial({ color: 0xffe27a, emissive: 0xffc83a, emissiveIntensity: 0.7, roughness: 0.3 });
  const gema = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), gemaMat);
  gema.position.set(0, 0.45, 0.42); g.add(gema);
  return {
    grupo: g,
    colisores: [{ minX: x - 0.8, maxX: x + 0.8, minZ: z - 0.6, maxZ: z + 0.6 }],
    animados: [{ mesh: gema, pulsa: gemaMat, gira: 1.5, fase: Math.random() * 6 }],
    interativo: { x, z, raio: 2.6, titulo: '🪙 Baú do Tesouro', acao: 'Examinar baú 🪙', msg: 'Está trancado. Você precisa de uma chave...' },
  };
}

// --- cristal arcano em pedestal (flutua, gira e pulsa) ---
export function criaCristal(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0x8a8478);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.4, 8), pedra);
  ped.position.y = 0.7; ped.castShadow = true; ped.receiveShadow = true; g.add(ped);
  const topo = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.6, 0.25, 8), pedra);
  topo.position.y = 1.5; g.add(topo);
  const cristalMat = new THREE.MeshStandardMaterial({ color: 0x6fe6ff, emissive: 0x29b6d8, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.9 });
  const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), cristalMat);
  cristal.position.y = 2.4; cristal.castShadow = true; g.add(cristal);
  return {
    grupo: g,
    colisores: [{ minX: x - 0.8, maxX: x + 0.8, minZ: z - 0.8, maxZ: z + 0.8 }],
    animados: [{ mesh: cristal, pulsa: cristalMat, gira: 0.8, flutua: true, baseY: 2.4, fase: Math.random() * 6 }],
    interativo: { x, z, raio: 2.6, titulo: '🔮 Cristal Arcano', acao: 'Examinar cristal 🔮', msg: 'Pulsa com uma energia estranha. Algo aqui é importante...' },
  };
}

// Atualiza as peças animadas (chamada no loop principal).
export function animaProps(animados, dt, tempo) {
  for (const a of animados) {
    if (a.gira) a.mesh.rotation.y += dt * a.gira;
    if (a.giraZ) a.mesh.rotation.z += dt * a.giraZ; // pás de moinho
    if (a.flutua) a.mesh.position.y = a.baseY + Math.sin(tempo * 2 + a.fase) * 0.12;
    if (a.pulsa) a.pulsa.emissiveIntensity = 0.55 + Math.sin(tempo * 3 + a.fase) * 0.35;
    if (a.balanca) a.mesh.rotation.y = Math.sin(tempo * 1.5 + a.fase) * 0.25;
    if (a.porta) a.mesh.rotation.y += (a.alvo - a.mesh.rotation.y) * Math.min(1, dt * 8); // abre/fecha suave
    if (a.fumaca) { // RV4.6: novelos de fumaça subindo da chaminé (loop infinito)
      for (let i = 0; i < a.fumaca.length; i++) {
        const p = a.fumaca[i];
        const t = (tempo * 0.22 + a.fase + i * 0.34) % 1;
        p.position.y = a.baseY + t * 3.4;
        p.position.x = a.baseX + Math.sin(tempo * 0.8 + i) * 0.25 * t; // deriva no vento
        p.scale.setScalar(0.5 + t * 1.3); // cresce e "dissolve" ao subir
      }
    }
  }
}

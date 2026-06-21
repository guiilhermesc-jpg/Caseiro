// =============================================================
//  MUNDO 3D  ·  cena, luz, chão e cenário blocky (dá o "espaço").
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from '../config3d.js';

// TEXTURA PROCEDURAL (RV10.6): grão de ruído gerado em canvas (sem API/asset
// externo) — dá detalhe real às superfícies chapadas. Cacheado por cor.
const _texCache = new Map();
export function texturaRuido(corBase, contraste = 16, tam = 128) {
  const chave = corBase + '_' + contraste;
  if (_texCache.has(chave)) return _texCache.get(chave).clone();
  const c = (typeof document !== 'undefined') ? document.createElement('canvas') : null;
  if (!c) return null;
  c.width = c.height = tam;
  const ctx = c.getContext('2d');
  const base = new THREE.Color(corBase);
  const img = ctx.createImageData(tam, tam);
  for (let i = 0; i < tam * tam; i++) {
    // ruído de 2 oitavas: grão fino + manchas largas
    const mancha = (Math.sin(i * 12.9898) * 43758.5453 % 1) * contraste * 0.6;
    const n = (Math.random() - 0.5) * contraste + (mancha - contraste * 0.15);
    img.data[i * 4] = Math.max(0, Math.min(255, base.r * 255 + n));
    img.data[i * 4 + 1] = Math.max(0, Math.min(255, base.g * 255 + n));
    img.data[i * 4 + 2] = Math.max(0, Math.min(255, base.b * 255 + n));
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  _texCache.set(chave, t);
  return t.clone();
}

export function criaMundo() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG3D.cores.ceu);
  scene.fog = new THREE.Fog(CONFIG3D.cores.ceu, 45, 130);

  // luz ambiente + sol (com sombra)
  scene.add(new THREE.AmbientLight(0xaab4c0, 0.7));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.25);
  sun.position.set(30, 55, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(3072, 3072); // RV11.6: sombras mais nítidas (PC)
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; // mata o "shadow acne" sem peter-panning
  const d = 95;
  sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
  sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 230;
  scene.add(sun);

  // chão (com grão procedural — RV10.6)
  const chaoMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  const texChao = texturaRuido(CONFIG3D.cores.chao, 18);
  if (texChao) { texChao.repeat.set(28, 28); chaoMat.map = texChao; } else chaoMat.color.set(CONFIG3D.cores.chao);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), chaoMat);
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  scene.add(chao);

  // cenário blocky (prédios/destroços) em anel ao redor -> profundidade.
  // Sem rotação: mantém a colisão AABB (caixa alinhada) precisa.
  const cores = [0x5a4a3a, 0x474a55, 0x3a4a45, 0x55504a, 0x4a3f3a];
  const texBloco = cores.map((cor) => { const t = texturaRuido(cor, 24); if (t) t.repeat.set(2, 4); return t; });
  const obstaculos = [];
  for (let i = 0; i < 42; i++) {
    const w = 3 + Math.random() * 6;
    const h = 4 + Math.random() * 16;
    const dp = 3 + Math.random() * 6;
    const tex = texBloco[i % cores.length];
    const blocoMat = new THREE.MeshStandardMaterial({ color: tex ? 0xffffff : cores[i % cores.length], roughness: 0.9 });
    if (tex) blocoMat.map = tex;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, dp), blocoMat);
    const ang = Math.random() * Math.PI * 2;
    const raio = 24 + Math.random() * 58;
    const px = Math.cos(ang) * raio;
    const pz = Math.sin(ang) * raio;
    mesh.position.set(px, h / 2, pz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    obstaculos.push({ mesh, minX: px - w / 2, maxX: px + w / 2, minZ: pz - dp / 2, maxZ: pz + dp / 2 });
  }

  return { scene, sun, obstaculos };
}

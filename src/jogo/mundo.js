// =============================================================
//  MUNDO 3D  ·  cena, luz, chão e cenário blocky (dá o "espaço").
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from '../config3d.js';

export function criaMundo() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG3D.cores.ceu);
  scene.fog = new THREE.Fog(CONFIG3D.cores.ceu, 45, 130);

  // luz ambiente + sol (com sombra)
  scene.add(new THREE.AmbientLight(0xaab4c0, 0.7));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.25);
  sun.position.set(30, 55, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const d = 95;
  sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
  sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 230;
  scene.add(sun);

  // chão
  const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({ color: CONFIG3D.cores.chao, roughness: 1 }),
  );
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  scene.add(chao);

  // cenário blocky (prédios/destroços) em anel ao redor -> profundidade.
  // Sem rotação: mantém a colisão AABB (caixa alinhada) precisa.
  const cores = [0x5a4a3a, 0x474a55, 0x3a4a45, 0x55504a, 0x4a3f3a];
  const obstaculos = [];
  for (let i = 0; i < 42; i++) {
    const w = 3 + Math.random() * 6;
    const h = 4 + Math.random() * 16;
    const dp = 3 + Math.random() * 6;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, dp),
      new THREE.MeshStandardMaterial({ color: cores[i % cores.length], roughness: 0.9 }),
    );
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

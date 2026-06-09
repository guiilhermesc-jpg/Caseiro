// =============================================================
//  ENTRADA 3D  ·  monta renderer, mundo, avatar, controles e loop.
//  Movimento livre 360° + câmera third-person (estilo Roblox).
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from './config3d.js';
import { criaCidade } from './jogo/cidade.js';
import { criaAvatar, animaAvatar } from './jogo/avatar.js';
import { criaControles } from './jogo/controles.js';

const container = document.getElementById('game');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 320);

const { scene, obstaculos, solidos, aguas } = criaCidade();
const raycaster = new THREE.Raycaster();
const RAIO_AVATAR = 0.7;

// colisão: o ponto (x,z) bate em algum obstáculo (caixa expandida pelo raio)?
function colide(x, z) {
  for (const o of obstaculos) {
    if (x > o.minX - RAIO_AVATAR && x < o.maxX + RAIO_AVATAR &&
        z > o.minZ - RAIO_AVATAR && z < o.maxZ + RAIO_AVATAR) return true;
  }
  return false;
}

const avatar = criaAvatar();
avatar.position.set(8, 0, 12); // spawn na praça de Venor (longe da fonte)
scene.add(avatar);

const controles = criaControles(renderer.domElement);
const relogio = new THREE.Clock();
let tempo = 0;

function loop() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  tempo += dt;

  const inp = controles.vetorMov();
  const cam = controles.cam;
  const movendo = (inp.x !== 0 || inp.z !== 0);
  if (movendo) {
    // movimento relativo à câmera (anda pra onde você está olhando)
    const frenteX = -Math.sin(cam.yaw), frenteZ = -Math.cos(cam.yaw);
    const direitaX = Math.cos(cam.yaw), direitaZ = -Math.sin(cam.yaw);
    let mx = frenteX * (-inp.z) + direitaX * inp.x;
    let mz = frenteZ * (-inp.z) + direitaZ * inp.x;
    const len = Math.hypot(mx, mz);
    if (len > 0) { mx /= len; mz /= len; }
    const passo = CONFIG3D.velocidade * dt;
    const lim = CONFIG3D.limiteMundo;
    const nx = Math.max(-lim, Math.min(lim, avatar.position.x + mx * passo));
    if (!colide(nx, avatar.position.z)) avatar.position.x = nx;
    const nz = Math.max(-lim, Math.min(lim, avatar.position.z + mz * passo));
    if (!colide(avatar.position.x, nz)) avatar.position.z = nz;
    avatar.rotation.y = Math.atan2(mx, mz);
  }
  animaAvatar(avatar, movendo, tempo);
  // água da fonte (efeito sutil: ondula e gira)
  for (const ag of aguas) {
    ag.position.y = ag.userData.baseY + Math.sin(tempo * 2 + ag.userData.fase) * 0.07;
    ag.rotation.y += dt * 0.4;
  }

  // câmera orbital (yaw/pitch do arrasto) + anti-oclusão (raycast)
  const alvo = avatar.position;
  const foco = new THREE.Vector3(alvo.x, alvo.y + 2.4, alvo.z);
  const DIST = 13;
  const cosP = Math.cos(cam.pitch);
  const desejada = new THREE.Vector3(
    foco.x + Math.sin(cam.yaw) * cosP * DIST,
    foco.y + Math.sin(cam.pitch) * DIST,
    foco.z + Math.cos(cam.yaw) * cosP * DIST,
  );
  const dir = desejada.clone().sub(foco);
  const distMax = dir.length();
  dir.normalize();
  raycaster.set(foco, dir);
  raycaster.far = distMax;
  const hits = raycaster.intersectObjects(solidos, true);
  let dist = distMax;
  if (hits.length && hits[0].distance < distMax) dist = Math.max(3, hits[0].distance - 0.6);
  const posCam = foco.clone().add(dir.multiplyScalar(dist));
  camera.position.lerp(posCam, 0.2);
  camera.lookAt(foco.x, foco.y, foco.z);

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// apoio a depuração
window.__jogo = { THREE, scene, avatar, camera, renderer, controles, obstaculos, colide };

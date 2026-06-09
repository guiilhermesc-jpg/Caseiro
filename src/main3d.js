// =============================================================
//  ENTRADA 3D  ·  monta renderer, mundo, avatar, controles e loop.
//  Movimento livre 360° + câmera third-person (estilo Roblox).
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from './config3d.js';
import { criaCidade } from './jogo/cidade.js';
import { criaAvatar, animaAvatar } from './jogo/avatar.js';
import { criaControles } from './jogo/controles.js';
import { criaGato, atualizaGato } from './jogo/pet.js';

const container = document.getElementById('game');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 320);

const { scene, obstaculos, solidos, aguas, nuvens, fonteGotas } = criaCidade();
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
let vy = 0, noChao = true; // física de pulo

const gato = criaGato();
gato.position.set(6, 0, 10);
scene.add(gato);

const controles = criaControles(renderer.domElement);
const relogio = new THREE.Clock();
let tempo = 0;

function loop() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  tempo += dt;

  const inp = controles.vetorMov();
  const cam = controles.cam;
  const correndo = controles.correndo();
  const abaixado = controles.abaixado();
  const movendo = (inp.x !== 0 || inp.z !== 0);
  if (movendo) {
    // movimento relativo à câmera (anda pra onde você está olhando)
    const frenteX = -Math.sin(cam.yaw), frenteZ = -Math.cos(cam.yaw);
    const direitaX = Math.cos(cam.yaw), direitaZ = -Math.sin(cam.yaw);
    let mx = frenteX * (-inp.z) + direitaX * inp.x;
    let mz = frenteZ * (-inp.z) + direitaZ * inp.x;
    const len = Math.hypot(mx, mz);
    if (len > 0) { mx /= len; mz /= len; }
    let vel = CONFIG3D.velocidade;
    if (correndo) vel *= 1.8;
    if (abaixado) vel *= 0.55;
    const passo = vel * dt;
    const lim = CONFIG3D.limiteMundo;
    const nx = Math.max(-lim, Math.min(lim, avatar.position.x + mx * passo));
    if (!colide(nx, avatar.position.z)) avatar.position.x = nx;
    const nz = Math.max(-lim, Math.min(lim, avatar.position.z + mz * passo));
    if (!colide(avatar.position.x, nz)) avatar.position.z = nz;
    avatar.rotation.y = Math.atan2(mx, mz);
  }
  // pulo (gravidade)
  if (controles.querPular() && noChao) { vy = 9; noChao = false; }
  vy -= 25 * dt;
  avatar.position.y += vy * dt;
  if (avatar.position.y <= 0) { avatar.position.y = 0; vy = 0; noChao = true; }
  // abaixar (agacha suave)
  const escalaY = abaixado ? 0.6 : 1;
  avatar.scale.y += (escalaY - avatar.scale.y) * Math.min(1, dt * 12);
  animaAvatar(avatar, movendo && noChao, tempo, correndo);
  // água da fonte (efeito sutil: ondula e gira)
  for (const ag of aguas) {
    ag.position.y = ag.userData.baseY + Math.sin(tempo * 2 + ag.userData.fase) * 0.07;
    ag.rotation.y += dt * 0.4;
  }
  // nuvens andam com o vento
  for (const nv of nuvens) {
    nv.position.x += dt * 2.2;
    if (nv.position.x > 190) nv.position.x = -190;
  }
  // jatos da fonte (parábola: sobem do topo e caem na taça)
  for (const gt of fonteGotas) {
    gt.userData.t += dt * gt.userData.vel;
    if (gt.userData.t > 1) gt.userData.t -= 1;
    const t = gt.userData.t;
    const r = 0.2 + t * 2.6;
    gt.position.x = Math.cos(gt.userData.ang) * r;
    gt.position.z = Math.sin(gt.userData.ang) * r;
    gt.position.y = 3.7 + Math.sin(t * Math.PI) * 0.9 - t * 2.4;
  }
  // pet (gato) segue o avatar
  atualizaGato(gato, avatar, dt, tempo);

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

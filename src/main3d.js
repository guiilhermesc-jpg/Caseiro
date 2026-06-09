// =============================================================
//  ENTRADA 3D  ·  tela de seleção -> jogo em Venor.
//  Modo SELEÇÃO: boneco girando em preview + overlay de aparência.
//  Modo JOGO: movimento livre, câmera orbital, pular/correr/abaixar.
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from './config3d.js';
import { criaCidade } from './jogo/cidade.js';
import { criaAvatar, animaAvatar } from './jogo/avatar.js';
import { criaControles } from './jogo/controles.js';
import { criaGato, atualizaGato } from './jogo/pet.js';
import { criaSelecao } from './jogo/selecao.js';
import { conectarRede } from './jogo/rede.js';
import { criaMinimapa } from './jogo/minimapa.js';

const container = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 320);

const { scene, obstaculos, solidos, aguas, nuvens, fonteGotas, ruas, marcos } = criaCidade();
const raycaster = new THREE.Raycaster();
const RAIO_AVATAR = 0.7;
function colide(x, z) {
  for (const o of obstaculos) {
    if (x > o.minX - RAIO_AVATAR && x < o.maxX + RAIO_AVATAR &&
        z > o.minZ - RAIO_AVATAR && z < o.maxZ + RAIO_AVATAR) return true;
  }
  return false;
}

// avatar (recriado quando muda a aparência na tela de seleção)
const coresJogador = { casaco: 0x556b2f, pele: 0xe0b088, cabelo: 0x3a2c20 };
let avatar;
function montaAvatar() {
  if (avatar) scene.remove(avatar);
  avatar = criaAvatar(coresJogador);
  avatar.position.set(8, 0, 12);
  scene.add(avatar);
}
montaAvatar();

let vy = 0, noChao = true;
let jogoIniciado = false;
let nomeJogador = '';

// --- multiplayer ---
let rede = null;
let ultimoAnim = { mov: false, corr: false, abx: false };
const ehLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
const urlMP = ehLocal ? `ws://${location.hostname}:8080` : CONFIG3D.servidorMP;
function estadoLocal() {
  return {
    nome: nomeJogador,
    cores: { ...coresJogador },
    x: avatar.position.x, y: avatar.position.y, z: avatar.position.z,
    rotY: avatar.rotation.y,
    anim: ultimoAnim,
  };
}

const gato = criaGato();
gato.position.set(6, 0, 10);
scene.add(gato);

const controles = criaControles(renderer.domElement);
const minimapa = criaMinimapa({ obstaculos, ruas, marcos, limite: CONFIG3D.limiteMundo });

criaSelecao({
  cores: coresJogador,
  aoMudarCor: () => montaAvatar(),
  aoEntrar: (nome) => {
    nomeJogador = nome; jogoIniciado = true; avatar.rotation.y = Math.PI;
    minimapa.mostra();
    if (urlMP) rede = conectarRede({ url: urlMP, scene, getEstadoLocal: estadoLocal });
  },
});

const relogio = new THREE.Clock();
let tempo = 0;

function loop() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  tempo += dt;

  if (!jogoIniciado) {
    // --- modo SELEÇÃO: boneco girando para preview ---
    avatar.rotation.y += dt * 0.6;
    animaAvatar(avatar, false, tempo, false);
    const f = avatar.position;
    camera.position.lerp(new THREE.Vector3(f.x + 0.01, f.y + 3, f.z + 7), 0.08);
    camera.lookAt(f.x, f.y + 1.7, f.z);
  } else {
    // --- modo JOGO ---
    const inp = controles.vetorMov();
    const cam = controles.cam;
    const correndo = controles.correndo();
    const abaixado = controles.abaixado();
    const movendo = (inp.x !== 0 || inp.z !== 0);
    if (movendo) {
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
    if (controles.querPular() && noChao) { vy = 9; noChao = false; }
    vy -= 25 * dt;
    avatar.position.y += vy * dt;
    if (avatar.position.y <= 0) { avatar.position.y = 0; vy = 0; noChao = true; }
    const escalaY = abaixado ? 0.6 : 1;
    avatar.scale.y += (escalaY - avatar.scale.y) * Math.min(1, dt * 12);
    animaAvatar(avatar, movendo && noChao, tempo, correndo);
    ultimoAnim = { mov: movendo && noChao, corr: correndo, abx: abaixado };

    // câmera orbital + anti-oclusão
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
    const distMax = dir.length(); dir.normalize();
    raycaster.set(foco, dir); raycaster.far = distMax;
    const hits = raycaster.intersectObjects(solidos, true);
    let dist = distMax;
    if (hits.length && hits[0].distance < distMax) dist = Math.max(3, hits[0].distance - 0.6);
    const posCam = foco.clone().add(dir.multiplyScalar(dist));
    camera.position.lerp(posCam, 0.2);
    camera.lookAt(foco.x, foco.y, foco.z);
  }

  // ambiente vivo (sempre): nuvens, jatos da fonte, gato
  for (const nv of nuvens) { nv.position.x += dt * 2.2; if (nv.position.x > 190) nv.position.x = -190; }
  for (const gt of fonteGotas) {
    gt.userData.t += dt * gt.userData.vel; if (gt.userData.t > 1) gt.userData.t -= 1;
    const t = gt.userData.t; const r = 0.2 + t * 2.6;
    gt.position.x = Math.cos(gt.userData.ang) * r; gt.position.z = Math.sin(gt.userData.ang) * r;
    gt.position.y = 3.7 + Math.sin(t * Math.PI) * 0.9 - t * 2.4;
  }
  atualizaGato(gato, avatar, dt, tempo);
  if (rede) rede.atualiza(dt);
  if (jogoIniciado) minimapa.atualiza(avatar, rede ? rede.outros : null);

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.__jogo = {
  THREE, scene, camera, renderer, controles, obstaculos, colide,
  get avatar() { return avatar; },
  get jogoIniciado() { return jogoIniciado; },
};

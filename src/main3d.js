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
import { criaGato, atualizaGato, PETS } from './jogo/pet.js';
import { criaSelecao } from './jogo/selecao.js';
import { conectarRede } from './jogo/rede.js';
import { criaMinimapa } from './jogo/minimapa.js';
import { criaNPCs, atualizaNPCs } from './jogo/npcs.js';
import { animaProps } from './jogo/props.js';
import { criaInventario } from './jogo/inventario.js';
import { criaDialogo } from './jogo/dialogo.js';
import { criaCustomizar } from './jogo/customizar.js';
import { criaEsgoto } from './jogo/esgoto.js';
import { criaRatos, atualizaRatos } from './jogo/ratos.js';
import { criaHUD } from './jogo/hud.js';

const container = document.getElementById('game');

// Se o navegador não conseguir iniciar o 3D (WebGL desligado / sem aceleração
// de hardware), mostra um aviso claro em vez de tela preta e muda.
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  container.innerHTML = '<div style="position:fixed;inset:0;display:flex;align-items:center;'
    + 'justify-content:center;padding:24px;font-family:Arial,sans-serif;color:#e6edf5;text-align:center;">'
    + '<div style="max-width:440px;background:rgba(16,22,32,.92);border:1px solid #3a4654;'
    + 'border-radius:16px;padding:28px;">'
    + '<h2 style="margin:0 0 10px;font-size:22px;">Não foi possível iniciar o 3D 😕</h2>'
    + '<p style="margin:0 0 14px;color:#9fb0c0;font-size:15px;line-height:1.5;">'
    + 'Seu navegador não conseguiu ligar o <b>WebGL</b> (o gráfico 3D do jogo).</p>'
    + '<p style="margin:0;color:#9fb0c0;font-size:14px;line-height:1.6;text-align:left;">Tente:<br>'
    + '• Ativar <b>Aceleração de hardware</b> em Configurações do Chrome → Sistema, e reabrir;<br>'
    + '• Atualizar a página (F5);<br>'
    + '• Abrir em <b>outro navegador</b> ou no <b>celular</b>.</p>'
    + '</div></div>';
  throw e; // interrompe o resto da inicialização
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// qualidade de imagem: tonemapping cinematográfico + cor correta
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 320);

const { scene, obstaculos, solidos, aguas, nuvens, fonteGotas, ruas, marcos, animados, interativos, casas } = criaCidade();
const raycaster = new THREE.Raycaster();
const RAIO_AVATAR = 0.7;
const LIM = CONFIG3D.limiteMundo;
// colisão/altura/limite ATIVOS (mudam ao descer pro esgoto)
let colisoresAtivos = obstaculos;
let areaAtiva = { minX: -LIM, maxX: LIM, minZ: -LIM, maxZ: LIM };
let chaoY = 0;
let noEsgoto = false;
function colide(x, z) {
  for (const o of colisoresAtivos) {
    if (x > o.minX - RAIO_AVATAR && x < o.maxX + RAIO_AVATAR &&
        z > o.minZ - RAIO_AVATAR && z < o.maxZ + RAIO_AVATAR) return true;
  }
  return false;
}

// --- esgoto (subsolo) + ratos + loot ---
const esgoto = criaEsgoto(); scene.add(esgoto.grupo); solidos.push(esgoto.grupo);
const ratos = criaRatos(8, esgoto.bounds); ratos.forEach((r) => scene.add(r.g));
const lootChao = [];
let armado = false;

// avatar (recriado quando muda a aparência na tela de seleção)
const coresJogador = { casaco: 0x556b2f, pele: 0xe0b088, cabelo: 0x3a2c20 };
let avatar;
function montaAvatar() {
  // preserva posição/rotação ao recriar (troca de cor in-game não teleporta)
  const pos = avatar ? avatar.position.clone() : new THREE.Vector3(8, 0, 12);
  const rotY = avatar ? avatar.rotation.y : 0;
  if (avatar) scene.remove(avatar);
  avatar = criaAvatar(coresJogador);
  avatar.position.copy(pos);
  avatar.rotation.y = rotY;
  avatar.userData.tipo = 'jogador'; // clicável (abre customização)
  if (armado) poeArmaNaMao();       // mantém o graveto ao recriar (troca de cor)
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

let gato = criaGato();
gato.position.set(6, 0, 10);
gato.userData.tipo = 'pet'; // clicável (trocar de pet)
scene.add(gato);

const controles = criaControles(renderer.domElement);
const minimapa = criaMinimapa({ obstaculos, ruas, marcos, limite: CONFIG3D.limiteMundo });
const npcs = criaNPCs(scene, colide, 6);
const inventario = criaInventario();

// --- mensagens (toast) + ação/interação ---
let gesto = 0;
let msgEl, msgTimer;
function mostraMensagem(txt) {
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.style.cssText = 'position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:45;'
      + 'background:rgba(16,22,32,.92);border:1px solid #3a4654;border-radius:10px;padding:10px 16px;'
      + 'color:#eef3f8;font:14px Arial;max-width:80vw;text-align:center;pointer-events:none;transition:opacity .3s;';
    document.body.appendChild(msgEl);
  }
  msgEl.textContent = txt;
  msgEl.style.opacity = '1';
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => { msgEl.style.opacity = '0'; }, 2600);
}
function achaInterativo() {
  let melhor = null, melhorD = Infinity;
  for (const it of interativos) {
    const d = Math.hypot(it.x - avatar.position.x, it.z - avatar.position.z);
    if (d <= it.raio && d < melhorD) { melhorD = d; melhor = it; }
  }
  return melhor;
}

// --- diálogo (NPC), customização (você) e troca de pet ---
const dialogo = criaDialogo();
let petTipo = 'gato';
function trocaPet(tipo) {
  if (!PETS[tipo] || tipo === petTipo) return;
  const pos = gato.position.clone();
  scene.remove(gato);
  gato = PETS[tipo]();
  gato.position.copy(pos);
  gato.userData.tipo = 'pet';
  scene.add(gato);
  petTipo = tipo;
}
const customizar = criaCustomizar({
  cores: coresJogador,
  aoMudarCor: () => montaAvatar(),
  aoMudarPet: (t) => trocaPet(t),
  getPet: () => petTipo,
});
function abreDialogo(npc) {
  // vira de frente pro jogador e pausa pra conversar
  npc.g.rotation.y = Math.atan2(avatar.position.x - npc.g.position.x, avatar.position.z - npc.g.position.z);
  npc.pausa = 4;
  const saud = npc.humor === 'bom' ? 'Olá! Que bom te ver por aqui. 😊' : 'Hm? O que você quer?';
  dialogo.abre(npc.nome, saud, [
    {
      texto: 'Tudo bem?', onClick: () => {
        const linha = npc.contaHistoria ? npc.historia
          : (npc.humor === 'bom' ? 'Tudo ótimo! Venore é um bom lugar pra viver.' : 'Já tive dias melhores... mas vou levando.');
        dialogo.abre(npc.nome, linha, [{ texto: 'Entendi. Até!', onClick: () => dialogo.fecha() }]);
      },
    },
    { texto: 'Tchau', onClick: () => dialogo.fecha() },
  ]);
}
// CLIQUE/TOQUE: tap curto (sem arrasto) seleciona NPC / você / pet
const rayTap = new THREE.Raycaster();
function achaTipo(obj) { while (obj) { if (obj.userData && obj.userData.tipo) return obj; obj = obj.parent; } return null; }
let tapIni = null;
renderer.domElement.addEventListener('pointerdown', (e) => { tapIni = { x: e.clientX, y: e.clientY, t: performance.now() }; });
renderer.domElement.addEventListener('pointerup', (e) => {
  const ini = tapIni; tapIni = null;
  if (!ini || !jogoIniciado || dialogo.aberto || customizar.aberto) return;
  if (Math.hypot(e.clientX - ini.x, e.clientY - ini.y) > 8 || performance.now() - ini.t > 350) return;
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  rayTap.setFromCamera(ndc, camera);
  for (const h of rayTap.intersectObjects(scene.children, true)) {
    const alvo = achaTipo(h.object);
    if (!alvo) continue;
    if (alvo.userData.tipo === 'npc') abreDialogo(alvo.userData.ref); else customizar.abre();
    break;
  }
});

// --- COMBATE: HUD, bueiro, gravetos, descer/subir, atacar, loot ---
const hud = criaHUD();
const MAT_MADEIRA = new THREE.MeshStandardMaterial({ color: 0x7a5a2a, roughness: 0.9 });
const BUEIRO = { x: 20, z: -36 };
{
  const b = new THREE.Group(); b.position.set(BUEIRO.x, 0, BUEIRO.z);
  const aro = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 }));
  aro.position.y = 0.12; b.add(aro);
  const buraco = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x080808 }));
  buraco.position.y = 0.2; b.add(buraco);
  scene.add(b);
  interativos.push({ x: BUEIRO.x, z: BUEIRO.z, raio: 2.4, titulo: '🕳️ Bueiro', msg: 'Escuro lá embaixo...', onAcao: () => desce() });
}
[[26, 24], [-22, 26], [26, -22], [10, 54], [54, 10]].forEach(([gx, gz]) => {
  const grp = new THREE.Group(); grp.position.set(gx, 0, gz);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.2, 6), MAT_MADEIRA);
  stick.rotation.z = Math.PI / 2; stick.position.y = 0.1; grp.add(stick);
  scene.add(grp);
  const it = { x: gx, z: gz, raio: 2, titulo: '🪵 Graveto', msg: 'Um galho resistente.' };
  it.onAcao = () => { scene.remove(grp); const i = interativos.indexOf(it); if (i >= 0) interativos.splice(i, 1); equipaGraveto(); };
  interativos.push(it);
});

function desce() {
  chaoY = -40; colisoresAtivos = esgoto.colisores; areaAtiva = esgoto.bounds; noEsgoto = true;
  avatar.position.set(esgoto.entrada.x, -40, esgoto.entrada.z); vy = 0; noChao = true;
  minimapa.esconde(); mostraMensagem('Você desce ao esgoto... cuidado com os ratos! 🐀');
}
function sobe() {
  chaoY = 0; colisoresAtivos = obstaculos; areaAtiva = { minX: -LIM, maxX: LIM, minZ: -LIM, maxZ: LIM }; noEsgoto = false;
  avatar.position.set(BUEIRO.x, 0, BUEIRO.z + 2.5); vy = 0; noChao = true;
  minimapa.mostra(); mostraMensagem('Você volta à superfície.');
}
function poeArmaNaMao() {
  const p = avatar.userData.partes; if (!p || p.bracoDir.getObjectByName('arma')) return;
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.2, 6), MAT_MADEIRA);
  stick.name = 'arma'; stick.position.set(0, -1.0, 0.18); stick.rotation.x = 0.4; p.bracoDir.add(stick);
}
function equipaGraveto() {
  if (armado) return; armado = true; poeArmaNaMao();
  inventario.equipa('maoDir', { nome: 'Graveto', cor: '#7a5a2a' });
  mostraMensagem('Pegou um graveto! Seus golpes agora dão 5. ⚔️');
}
const LOOT_TAB = [
  { tipo: '🍖 Carne', cor: 0xc0432a, ch: 0.5 },
  { tipo: '🧀 Queijo', cor: 0xe6c84a, ch: 0.2 },
  { tipo: '🪙 Moeda', cor: 0xd9a522, ch: 0.25 },
  { tipo: '〰️ Cauda de rato', cor: 0x7a5a4a, ch: 0.08 },
];
function dropaLoot(x, z) {
  LOOT_TAB.forEach((it) => {
    if (Math.random() < it.ch) {
      const gx = x + (Math.random() - 0.5) * 1.2, gz = z + (Math.random() - 0.5) * 1.2;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), new THREE.MeshStandardMaterial({ color: it.cor, roughness: 0.6 }));
      m.position.set(gx, -40 + 0.25, gz); m.castShadow = true; scene.add(m);
      lootChao.push({ grupo: m, x: gx, z: gz, tipo: it.tipo });
    }
  });
}
function atacar() {
  const dano = armado ? 5 : 2;
  const fx = Math.sin(avatar.rotation.y), fz = Math.cos(avatar.rotation.y);
  let melhor = null, melhorD = 2.4;
  for (const r of ratos) {
    if (!r.vivo) continue;
    const dx = r.g.position.x - avatar.position.x, dz = r.g.position.z - avatar.position.z, d = Math.hypot(dx, dz);
    if (d > 2.4 || (dx * fx + dz * fz) / (d || 1) < 0) continue; // perto e na frente
    if (d < melhorD) { melhorD = d; melhor = r; }
  }
  if (!melhor) { mostraMensagem('Golpe no ar!'); return; }
  melhor.hp -= dano; melhor.piscar = 0.15; melhor.g.userData.corpoMat.emissive.setHex(0x882020);
  if (melhor.hp <= 0) mataRato(melhor);
  else mostraMensagem(`Acertou o rato! (-${dano}, vida ${Math.max(0, melhor.hp)})`);
}
function mataRato(r) {
  r.vivo = false; scene.remove(r.g);
  hud.ganhaXP(5); dropaLoot(r.g.position.x, r.g.position.z);
  mostraMensagem('Rato derrotado! +5 XP 🎉');
}

criaSelecao({
  cores: coresJogador,
  aoMudarCor: () => montaAvatar(),
  aoEntrar: (nome) => {
    nomeJogador = nome; jogoIniciado = true; avatar.rotation.y = Math.PI;
    // espalha o nascimento pela praça (evita dois jogadores no mesmo ponto)
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, r = 7 + Math.random() * 6;
      const tx = Math.cos(a) * r, tz = Math.sin(a) * r;
      if (!colide(tx, tz)) { avatar.position.set(tx, 0, tz); break; }
    }
    minimapa.mostra();
    inventario.mostra();
    hud.mostra();
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
      const nx = Math.max(areaAtiva.minX, Math.min(areaAtiva.maxX, avatar.position.x + mx * passo));
      if (!colide(nx, avatar.position.z)) avatar.position.x = nx;
      const nz = Math.max(areaAtiva.minZ, Math.min(areaAtiva.maxZ, avatar.position.z + mz * passo));
      if (!colide(avatar.position.x, nz)) avatar.position.z = nz;
      avatar.rotation.y = Math.atan2(mx, mz);
    }
    if (controles.querPular() && noChao) { vy = 9; noChao = false; }
    vy -= 25 * dt;
    avatar.position.y += vy * dt;
    if (avatar.position.y <= chaoY) { avatar.position.y = chaoY; vy = 0; noChao = true; }
    const escalaY = abaixado ? 0.6 : 1;
    avatar.scale.y += (escalaY - avatar.scale.y) * Math.min(1, dt * 12);
    animaAvatar(avatar, movendo && noChao, tempo, correndo);
    ultimoAnim = { mov: movendo && noChao, corr: correndo, abx: abaixado };

    // AÇÃO: gesto do braço + interação com item próximo
    if (controles.querAgir()) {
      gesto = 1;
      if (noEsgoto) {
        if (Math.hypot(avatar.position.x - esgoto.saida.x, avatar.position.z - esgoto.saida.z) < esgoto.saida.raio) sobe();
        else atacar();
      } else {
        const alvo = achaInterativo();
        if (alvo) { if (alvo.onAcao) alvo.onAcao(); else mostraMensagem(alvo.titulo + ' — ' + alvo.msg); }
      }
    }
    if (gesto > 0) {
      gesto = Math.max(0, gesto - dt * 3);
      const p = avatar.userData.partes;
      if (p) p.bracoDir.rotation.x = -Math.sin((1 - gesto) * Math.PI) * 1.6;
    }

    // INTERIORES: esconde o telhado da casa em que você está + aproxima a câmera
    let dentroCasa = false;
    for (const c of casas) {
      const d = avatar.position.x > c.box.minX && avatar.position.x < c.box.maxX
             && avatar.position.z > c.box.minZ && avatar.position.z < c.box.maxZ;
      c.roof.visible = !d;
      if (d) dentroCasa = true;
    }

    // câmera orbital + anti-oclusão
    const alvo = avatar.position;
    const foco = new THREE.Vector3(alvo.x, alvo.y + 2.4, alvo.z);
    const DIST = dentroCasa ? 6.5 : 13;
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
  if (!noEsgoto) atualizaGato(gato, avatar, dt, tempo); // pet espera na superfície
  animaProps(animados, dt, tempo);
  atualizaNPCs(npcs, dt, colide);
  atualizaRatos(ratos, dt, esgoto.bounds);
  if (noEsgoto) {
    for (let i = lootChao.length - 1; i >= 0; i--) {
      const L = lootChao[i];
      if (Math.hypot(L.x - avatar.position.x, L.z - avatar.position.z) < 1.3) {
        scene.remove(L.grupo); hud.addItem(L.tipo); mostraMensagem('Pegou ' + L.tipo); lootChao.splice(i, 1);
      }
    }
  }
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

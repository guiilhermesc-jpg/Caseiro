// =============================================================
//  ENTRADA 3D  ·  tela de seleção -> jogo em Venor.
//  Modo SELEÇÃO: boneco girando em preview + overlay de aparência.
//  Modo JOGO: movimento livre, câmera orbital, pular/correr/abaixar.
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from './config3d.js';
import { criaCidade } from './jogo/cidade.js';
import { criaAvatar, animaAvatar, giraSuave } from './jogo/avatar.js';
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
import { criaRato, criaRatos, atualizaRatos, criaCobra, criaCrocodilo, criaTroll, criaCyclops, criaAranhaGigante, criaAranhaPequena, criaLadrao, criaEscorpiao, criaBeholder, criaDragao, criaLobo, criaUrso, criaEsqueleto, criaOrc, criaCaranguejo } from './jogo/ratos.js';
import { criaHUD } from './jogo/hud.js';
import { aplicaTexturaReal } from './jogo/construcoes.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('game');
// celular/tablet → modo leve (sem sombras, menos luz, menos pixels) p/ fluidez
const ehMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024);

// Se o navegador não conseguir iniciar o 3D (WebGL desligado / sem aceleração
// de hardware), mostra um aviso claro em vez de tela preta e muda.
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: !ehMobile, powerPreference: 'high-performance' });
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, ehMobile ? 1.4 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = !ehMobile; // sombras só no PC (no celular pesa muito)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// qualidade de imagem: tonemapping cinematográfico + cor correta
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92; // sem estourar o horizonte/céu de branco
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 900);

// === RENDERIZAÇÃO PREMIUM ===
// BLOOM (PC): lava, runas, tochas e olhos de monstro IRRADIAM luz de verdade.
// No mobile fica o caminho direto (fluidez primeiro).
let composer = null;
if (!ehMobile) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(null, camera)); // a cena entra logo abaixo (criaCidade)
  // bloom SÓ para emissores de verdade (lava/chamas/olhos/lampiões):
  // threshold 1.0 = nada de céu, flor ou parede clara brilhando
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.4, 1.0));
}

const { scene, ceu, hemi, sun, skyMat, lua, luaLuz, luaMat, estrelas, postes, obstaculos, solidos, aguas, nuvens, fonteGotas, ruas, marcos, animados, interativos, casas, lagos, montanhaDragao } = criaCidade();
// liga o bloom na cena + ILUMINAÇÃO DE AMBIENTE (IBL): metais, vidros e água
// passam a refletir o entorno — o salto de "protótipo" pra "premium"
if (composer) {
  composer.passes[0].scene = scene;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3; // reflexo sutil (0.55 clareava demais os rostos)
}
// ALTURA DO TERRENO: plano em todo o mapa, exceto a Montanha do Dragão (rampa
// cônica escalável até o platô). O avatar "gruda" nessa altura ao andar.
function alturaTerreno(x, z) {
  const r = Math.hypot(x - montanhaDragao.x, z - montanhaDragao.z);
  if (r >= montanhaDragao.r) return 0;
  if (r <= montanhaDragao.topo) return montanhaDragao.h;
  return montanhaDragao.h * (1 - (r - montanhaDragao.topo) / (montanhaDragao.r - montanhaDragao.topo));
}
const raycaster = new THREE.Raycaster();
const RAIO_AVATAR = 0.7;
// tamanho do mundo (ajustável no jogo) + colisão/altura/limite ATIVOS
let limiteMundo = CONFIG3D.limiteMundo;
function areaSuperficie() { return { minX: -limiteMundo, maxX: limiteMundo, minZ: -limiteMundo, maxZ: limiteMundo }; }
let areaAtiva = areaSuperficie();
let chaoY = 0;
let noEsgoto = false;
let zoomDist = 13; // distância da câmera (scroll do mouse)

// GRADE ESPACIAL de colisão: o mundo cresceu (centenas de obstáculos) e varrer
// a lista inteira a cada passo travava — agora cada célula de 24u guarda só os
// colisores que a tocam, e cada checagem olha ~5-20 caixas em vez de ~700.
const CELULA = 24, gradeCol = new Map();
for (const o of obstaculos) {
  const x0 = Math.floor((o.minX - 1.2) / CELULA), x1 = Math.floor((o.maxX + 1.2) / CELULA);
  const z0 = Math.floor((o.minZ - 1.2) / CELULA), z1 = Math.floor((o.maxZ + 1.2) / CELULA);
  for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
    const k = cx * 4096 + cz;
    let arr = gradeCol.get(k); if (!arr) gradeCol.set(k, arr = []);
    arr.push(o);
  }
}
function colide(x, z) {
  if (noEsgoto) { // subsolo: lista pequena, varre direto
    for (const o of esgoto.colisores) {
      if (x > o.minX - RAIO_AVATAR && x < o.maxX + RAIO_AVATAR &&
          z > o.minZ - RAIO_AVATAR && z < o.maxZ + RAIO_AVATAR) return true;
    }
    return false;
  }
  const arr = gradeCol.get(Math.floor(x / CELULA) * 4096 + Math.floor(z / CELULA));
  if (arr) for (const o of arr) {
    if (x > o.minX - RAIO_AVATAR && x < o.maxX + RAIO_AVATAR &&
        z > o.minZ - RAIO_AVATAR && z < o.maxZ + RAIO_AVATAR) return true;
  }
  for (const c of casas) { // vão de porta (só bloqueia se fechada — hoje ficam abertas)
    if (!c.aberta && c.portaCol &&
        x > c.portaCol.minX - RAIO_AVATAR && x < c.portaCol.maxX + RAIO_AVATAR &&
        z > c.portaCol.minZ - RAIO_AVATAR && z < c.portaCol.maxZ + RAIO_AVATAR) return true;
  }
  return false;
}
// colisão dos BICHOS com o cenário (padrão Tibia/Albion: monstro não atravessa
// parede/árvore). y decide o andar: esgoto (fundo) ou superfície (grade).
function podeAndarBicho(x, z, y) {
  if (y < -10) {
    for (const o of esgoto.colisores) {
      if (x > o.minX - 0.5 && x < o.maxX + 0.5 && z > o.minZ - 0.5 && z < o.maxZ + 0.5) return false;
    }
    return true;
  }
  const arr = gradeCol.get(Math.floor(x / CELULA) * 4096 + Math.floor(z / CELULA));
  if (arr) for (const o of arr) {
    if (x > o.minX - 0.5 && x < o.maxX + 0.5 && z > o.minZ - 0.5 && z < o.maxZ + 0.5) return false;
  }
  return true;
}

// --- esgoto (subsolo escuro) + ratos + boss + tocha ---
const esgoto = criaEsgoto(); scene.add(esgoto.grupo); solidos.push(esgoto.grupo);
esgoto.grupo.visible = false; // só renderiza a grade de túneis quando você está lá embaixo (perf)
const ratos = criaRatos(6, esgoto.salaBounds);                       // ratos na câmara central
esgoto.corredores.forEach((b) => criaRatos(2, b).forEach((r) => ratos.push(r))); // ratos patrulhando os túneis
const boss = { g: criaCobra(0, -10), hp: 60, hpMax: 60, xp: 25, dano: 10, vel: 1.6, forte: true, bounds: esgoto.salaBounds, y0: -40, alvo: { x: 0, z: -10 }, pausa: 0, tempo: 0, vivo: true, piscar: 0, boss: true, forma: 'cobra' };
ratos.push(boss);
// CRIATURAS DA SUPERFÍCIE (região selvagem entre Venore e a cidade distante)
function areaMon(x, z, r) { return { minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r }; }
function addMonstro(g, hp, xp, dano, vel, forte, b, extra) {
  const r = { g, hp, hpMax: hp, xp, dano, vel, forte, bounds: b, y0: 0, alvo: { x: g.position.x, z: g.position.z }, pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0, ...extra };
  ratos.push(r);
  return r;
}

// CAMPOS DE CHÃO (estilo Tibia): pisar na LAVA queima; pisar no LODO do
// pântano ENVENENA (dano contínuo por 8s). Aranhas/escorpiões/cobras também
// envenenam ao morder.
const CAMPOS = [
  { tipo: 'lava', x: 40, z: 330, r: 7, y: 0 },     // lava do Covil do Dragão
  { tipo: 'lava', x: 34, z: 324, r: 4, y: 0 },
  { tipo: 'lava', x: 104, z: 296, r: 2.8, y: 34 }, // poças de lava no platô do Pico
  { tipo: 'lava', x: 116, z: 305, r: 2.4, y: 34 },
  { tipo: 'veneno', x: 225, z: -95, r: 8, y: 0 },  // poças do Pântano da Serpente
  { tipo: 'veneno', x: 215, z: -89, r: 5, y: 0 },
  { tipo: 'veneno', x: 234, z: -102, r: 6, y: 0 },
  { tipo: 'veneno', x: 219, z: -105, r: 4, y: 0 },
  { tipo: 'veneno', x: 236, z: -87, r: 4.5, y: 0 },
];
let envenenadoAte = 0, proxTickLava = 0, proxTickVeneno = 0;
[[150, 30], [185, -25], [215, 45], [250, 10]].forEach(([x, z]) => addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 14)));
[[245, -20], [285, 30]].forEach(([x, z]) => addMonstro(criaCyclops(x, z), 150, 60, 18, 1.3, true, areaMon(x, z, 16))); // GIGANTES de um olho
// GIANT SPIDER (Tibia): ENORME, feroz, RÁPIDA (3.2 — corre atrás!), difícil
// de matar (300hp) e CRIA FILHOTES durante a caça (mecânica no loop)
const aX = 170, aZ = 95;
const aranhaMae = addMonstro(criaAranhaGigante(aX, aZ), 300, 150, 20, 3.2, true, areaMon(aX, aZ, 22), { veneno: true, lootEspecial: { nome: 'Seda de Aranha', icone: '🕸️' } });
[[aX - 5, aZ + 4], [aX + 6, aZ - 3], [aX - 3, aZ - 6], [aX + 4, aZ + 6]].forEach(([x, z]) => addMonstro(criaAranhaPequena(x, z), 10, 3, 3, 2.8, false, areaMon(aX, aZ, 22), { veneno: true, filhote: true }));
[[160, 8], [205, -10], [235, 18]].forEach(([x, z]) => addMonstro(criaLadrao(x, z), 30, 12, 7, 2.2, false, areaMon(x, z, 16)));
[[140, -32], [185, 42], [225, -38]].forEach(([x, z]) => addMonstro(criaEscorpiao(x, z), 18, 6, 5, 2.0, false, areaMon(x, z, 14), { veneno: true }));
// BEHOLDERS (agora GRANDES e imponentes) no Vale dos Monstros — ATIRAM
// rajadas mágicas que vêm na sua direção (dá pra esquivar correndo!)
[[255, 95], [175, 120], [300, 70]].forEach(([x, z]) => {
  ratos.push({ g: criaBeholder(x, z), hp: 170, hpMax: 170, xp: 80, dano: 12, vel: 1.3, forte: true, bounds: areaMon(x, z, 18), y0: 0, alvo: { x, z }, pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0, lootEspecial: { nome: 'Olho do Beholder', icone: '👁️' }, atira: 'magia', alcanceTiro: 18, danoTiro: 12, cadencia: 2.6 });
});
// DRAGÃO (chefão D&D) guardando o Covil do Dragão, ao norte — muito forte, loot lendário
// DRAGÃO VERDE (estilo Tibia) no TOPO da Montanha do Dragão — suba a rampa pra
// enfrentá-lo. De tempos em tempos ele VOA sobre Venore atrás de comida.
const DRX = montanhaDragao.x, DRZ = montanhaDragao.z, DRY = montanhaDragao.h;
const dragao = { g: criaDragao(DRX, DRZ), hp: 220, hpMax: 220, xp: 120, dano: 22, vel: 1.6, forte: true, boss: true, dragao: true, lord: false, bounds: areaMon(DRX, DRZ, montanhaDragao.topo - 1), y0: DRY, alvo: { x: DRX, z: DRZ }, pausa: Math.random() * 2, tempo: 0, vivo: true, piscar: 0, lootEspecial: { nome: 'Escama de Dragão', icone: '🐲' }, atira: 'fogo', alcanceTiro: 16, danoTiro: 18, cadencia: 4 };
dragao.g.position.y = DRY;
ratos.push(dragao);
const vooDragao = { ativo: false, t: 0, proximo: 45 + Math.random() * 50 }; // 1º voo logo no começo (pra você ver!)
// DRAGÃO 3D PROFISSIONAL (opcional): se existir o arquivo
// public/modelos/dragao.glb (ex.: "Dragon Evolved" do Quaternius, CC0,
// baixável em poly.pizza/m/LlwD0QNUPj), ele SUBSTITUI o dragão de blocos
// automaticamente — com animação esquelética de verdade.
let mixerDragao = null;
new GLTFLoader().load('modelos/dragao.glb', (gltf) => {
  const modelo = gltf.scene;
  modelo.scale.setScalar(3.4);
  modelo.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  while (dragao.g.children.length) dragao.g.remove(dragao.g.children[0]); // tira as peças blocky
  dragao.g.add(modelo);
  dragao.g.userData = { tipo: 'boss' }; // sem corpoMat (os guards cuidam do "piscar")
  if (gltf.animations && gltf.animations.length) {
    mixerDragao = new THREE.AnimationMixer(modelo);
    const anim = gltf.animations.find((a) => /idle|fly/i.test(a.name)) || gltf.animations[0];
    mixerDragao.clipAction(anim).play();
  }
  mostraMensagem('🐲 Dragão 3D profissional carregado!');
}, undefined, () => { /* sem arquivo: segue o dragão padrão */ });
// FAUNA DO CAMINHO (cada região com seus bichos, estilo Tibia)
// matilha de lobos rondando a ponte do rio + lobos na floresta oeste
[[170, 14], [191, 16], [188, -18], [-96, 26]].forEach(([x, z]) => addMonstro(criaLobo(x, z), 20, 7, 5, 2.6, false, areaMon(x, z, 15)));
// ursos na floresta e no sopé das montanhas (fortes)
[[-104, 42], [72, 192]].forEach(([x, z]) => addMonstro(criaUrso(x, z), 55, 18, 11, 1.7, true, areaMon(x, z, 14)));
// esqueletos no cemitério abandonado (saem da cova...)
[[124, -56], [136, -64], [128, -67], [138, -55]].forEach(([x, z]) => addMonstro(criaEsqueleto(x, z), 30, 12, 7, 1.8, false, areaMon(130, -60, 14)));
// orcs guardando as ruínas (norte e sudoeste)
[[146, 246], [156, 254]].forEach(([x, z]) => addMonstro(criaOrc(x, z), 35, 14, 8, 2.1, false, areaMon(150, 250, 14)));
[[-184, -86], [-176, -94], [-180, -98]].forEach(([x, z]) => addMonstro(criaOrc(x, z), 35, 14, 8, 2.1, false, areaMon(-180, -90, 14)));
// cobras na lama do Pântano da Serpente
[[220, -90], [230, -100], [214, -102]].forEach(([x, z]) => {
  const c = criaCobra(x, z); c.position.y = 0; // a cobra nasce no esgoto (y=-40); aqui vive na superfície
  addMonstro(c, 28, 10, 8, 1.5, false, areaMon(225, -95, 16), { veneno: true });
});
// mais ladrões no acampamento bandido (além dos que já rondam a estrada)
[[248, 46], [256, 52]].forEach(([x, z]) => addMonstro(criaLadrao(x, z), 30, 12, 7, 2.2, false, areaMon(252, 48, 14)));
// SEGUNDA METADE da viagem (depois do rio): mais selvagem e perigosa
[[340, 25], [390, -18], [455, 22]].forEach(([x, z]) => addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 14)));
[[396, -66], [404, -74], [430, 28]].forEach(([x, z]) => addMonstro(criaOrc(x, z), 35, 14, 8, 2.1, false, areaMon(x, z, 14)));
[[300, 20], [470, -20], [476, -14]].forEach(([x, z]) => addMonstro(criaLobo(x, z), 20, 7, 5, 2.6, false, areaMon(x, z, 15)));
[[360, -30], [490, 30]].forEach(([x, z]) => addMonstro(criaEscorpiao(x, z), 18, 6, 5, 2.0, false, areaMon(x, z, 14)));
addMonstro(criaCyclops(415, 50), 150, 60, 18, 1.3, true, areaMon(415, 50, 16)); // ciclope da mata fechada
// caranguejos na Praia do Sul (fraquinhos — primeiro alvo de quem chega)
[[-30, -225], [20, -230], [60, -218], [-85, -228], [110, -222]].forEach(([x, z]) => addMonstro(criaCaranguejo(x, z), 12, 4, 3, 2.2, false, areaMon(x, z, 13)));
ratos.forEach((r) => scene.add(r.g));
let armado = false;
const luzTocha = new THREE.PointLight(0xffa54a, 0, 32, 2); scene.add(luzTocha); // luz principal do esgoto
let tochaOn = false;
let tochaCarga = 1; // 1 = tocha nova; QUEIMA acesa (raio encolhe) e recupera apagada
let vida = 100; const VIDA_MAX = 100; let defesa = 0; // defesa sobe ao equipar armadura
const equipados = {}; // slot -> item de armadura
let ouro = 0; // moeda do jogo (loot/pesca) — compra casas
let danoArma = 2; // 2 = mãos · 5 = graveto · espadas etc. sobem
const MAT_METAL = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 0.6, roughness: 0.4 });

// avatar (recriado quando muda a aparência na tela de seleção)
const coresJogador = { casaco: 0x556b2f, pele: 0xe0b088, cabelo: 0x3a2c20, sexo: 'homem', tipo: 'aldeao' };
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
  if (tochaOn) poeTochaNaMao(true); // mantém a tocha acesa
  poeCorpoEquip();                  // mantém as armaduras no corpo
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
// rótulos de lugares no minimapa (só aparecem quando você está por perto)
const LUGARES_MAPA = [
  { nome: 'Praça', x: 0, z: 0 }, { nome: 'Mercado', x: 18, z: 4 }, { nome: 'Ferreiro', x: -18, z: 4 },
  { nome: 'Templo', x: 0, z: -30 }, { nome: 'Escola', x: 0, z: 30 },
  { nome: 'Bairro Sul', x: 0, z: -95 }, { nome: 'Moinho', x: -44, z: -74 },
  { nome: 'Porto', x: 45, z: 64 }, { nome: 'Farol', x: 66, z: 84 }, { nome: 'Ponte', x: 16, z: 80 },
  { nome: 'Thais', x: 560, z: 0 }, { nome: 'Templo', x: 560, z: 19 },
  { nome: 'Ruínas', x: 150, z: 250 }, { nome: 'Covil', x: 40, z: 330 }, { nome: 'Pico do Dragão', x: 110, z: 300 },
  { nome: 'Rio Fundo', x: 180, z: 0 }, { nome: 'Torre', x: 122, z: -9 },
  { nome: 'Fazenda', x: 105, z: 38 }, { nome: 'Cemitério', x: 130, z: -60 },
  { nome: 'Pântano', x: 225, z: -95 }, { nome: 'Bandidos', x: 252, z: 48 },
  { nome: 'Praia', x: 0, z: -218 },
];
const minimapa = criaMinimapa({ obstaculos, ruas, marcos, lugares: LUGARES_MAPA, alcance: 90 });
const npcs = criaNPCs(scene, colide);
const inventario = criaInventario({ aoEquipar: (item) => aoEquipar(item) });

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
    if (it._off) continue; // coletável colhido (esperando renascer)
    if (Math.abs((it.y || 0) - avatar.position.y) > 6) continue; // mesmo "andar" (superfície × esgoto)
    const d = Math.hypot(it.x - avatar.position.x, it.z - avatar.position.z);
    if (d <= it.raio && d < melhorD) { melhorD = d; melhor = it; }
  }
  return melhor;
}

// AVISO de ação flutuante (estilo Roblox): "[E] Abrir porta"
let promptEl;
function mostraPrompt(dica) {
  if (!promptEl) {
    promptEl = document.createElement('div');
    promptEl.style.cssText = 'position:fixed;left:50%;bottom:130px;transform:translateX(-50%);z-index:46;display:none;'
      + 'background:rgba(20,28,40,.92);border:1px solid #5aa06a;border-radius:12px;padding:9px 16px;text-align:center;'
      + 'color:#eaffea;font-family:Arial;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.4);';
    document.body.appendChild(promptEl);
  }
  if (dica) {
    promptEl.innerHTML = `<b style="font-size:15px;">${dica}</b>`
      + '<div style="font-size:11px;opacity:.85;margin-top:2px;">aperte <b>E</b> ou o botão <b>AÇÃO</b></div>';
    promptEl.style.display = 'block';
  } else { promptEl.style.display = 'none'; }
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
// TABELA DE COMPRA dos mercadores (estilo Tibia: caçar → saquear → vender)
const PRECOS = {
  'Cauda de rato': 2, 'Osso': 2, 'Couro': 4, 'Erva': 3, 'Frasco': 5,
  'Cogumelo': 2, 'Concha': 4, 'Coco': 3,
  'Presa do Boss': 20, 'Olho do Beholder': 40, 'Escama de Dragão': 90, 'Coração de Dragão': 400,
  'Rubi': 30, 'Safira': 30, 'Esmeralda': 30, 'Pérola': 22, 'Âmbar': 18, 'Anel de Ouro': 35,
  'Lambari': 1, 'Tilápia': 2, 'Traíra': 3, 'Carpa': 3, 'Bagre': 3, 'Tucunaré': 6, 'Dourado': 12, 'Pintado': 16,
};
function abreDialogo(npc) {
  // vira de frente pro jogador e pausa pra conversar
  npc.g.rotation.y = Math.atan2(avatar.position.x - npc.g.position.x, avatar.position.z - npc.g.position.z);
  npc.pausa = 4;
  const opcoes = [
    { texto: 'Como vai?', onClick: () => dialogo.abre(npc.nome, npc.humor === 'bom' ? 'Tudo tranquilo por aqui. 🙂' : 'Já tive dias melhores...', opcoes) },
    { texto: 'Seu ofício?', onClick: () => dialogo.abre(npc.nome, npc.falas.trabalho, opcoes) },
    { texto: 'Novidades?', onClick: () => dialogo.abre(npc.nome, npc.falas.dica, opcoes) },
    { texto: 'Tchau', onClick: () => dialogo.fecha() },
  ];
  // MERCADORES compram seus tesouros (loot de caça, gemas e peixes)
  if (npc.prof === 'Mercador' || npc.prof === 'Mercadora') {
    opcoes.splice(3, 0, { texto: '💰 Vender tesouros', onClick: () => {
      const v = inventario.vendeItens(PRECOS);
      if (v.itens) { ouro += v.ouro; hud.ouro(ouro); }
      dialogo.abre(npc.nome, v.itens
        ? `Negócio fechado! ${v.itens} item(s) por ${v.ouro} 🪙. Volte quando caçar mais!`
        : 'Hmm... você não tem nada que me interesse. Caça, gemas e peixes pagam bem!', opcoes);
    } });
  }
  // LOJA do NPC (estilo Tibia: cada vendedor tem sua mercadoria — armas na
  // forja, runas com a Eldra, flechas com o Falk, poções com a Sira...)
  if (npc.loja) {
    for (const produto of npc.loja) {
      opcoes.splice(opcoes.length - 1, 0, { texto: `${produto.icone} ${produto.nome} — ${produto.preco}🪙`, onClick: () => {
        if (ouro < produto.preco) { dialogo.abre(npc.nome, `Custa ${produto.preco} 🪙 e você tem ${ouro}. Venda loot pra juntar!`, opcoes); return; }
        const primeiro = produto.pacote
          ? inventario.addItem({ nome: produto.pacote.nome, icone: produto.pacote.icone })
          : inventario.addItem({ ...produto });
        if (!primeiro) { dialogo.abre(npc.nome, 'Sua mochila está cheia! Venda ou use algo antes.', opcoes); return; }
        ouro -= produto.preco; hud.ouro(ouro);
        if (produto.pacote) for (let q = 1; q < produto.pacote.qtd; q++) inventario.addItem({ nome: produto.pacote.nome, icone: produto.pacote.icone });
        dialogo.abre(npc.nome, `${produto.icone} ${produto.nome} — bom proveito! (${produto.preco} 🪙)`, opcoes);
      } });
    }
  }
  const saud = npc.humor === 'bom'
    ? `Saudações! Sou ${npc.nome}, ${npc.prof.toLowerCase()} de Venore. 😊`
    : `${npc.nome}, ${npc.prof.toLowerCase()}. O que você quer?`;
  dialogo.abre(npc.nome, saud, opcoes);
}
// CLIQUE/TOQUE: tap curto (sem arrasto) seleciona NPC / você / pet
const rayTap = new THREE.Raycaster();
function achaTipo(obj) { while (obj) { if (obj.userData && obj.userData.tipo) return obj; obj = obj.parent; } return null; }
let tapIni = null;
renderer.domElement.addEventListener('pointerdown', (e) => { tapIni = { x: e.clientX, y: e.clientY, t: performance.now() }; });
// CLIQUE = AÇÃO (estilo Roblox): clicar em NPC conversa, em bicho ataca/saqueia,
// em você customiza; clicar no mundo executa a ação do lugar (abrir/pegar/pescar).
renderer.domElement.addEventListener('pointerup', (e) => {
  const ini = tapIni; tapIni = null;
  if (!ini || !jogoIniciado || dialogo.aberto || customizar.aberto) return;
  if (Math.hypot(e.clientX - ini.x, e.clientY - ini.y) > 8 || performance.now() - ini.t > 350) return;
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  rayTap.setFromCamera(ndc, camera);
  for (const h of rayTap.intersectObjects(scene.children, true)) {
    const alvo = achaTipo(h.object);
    if (!alvo) continue;
    const tipo = alvo.userData.tipo;
    if (tipo === 'npc') {
      const npc = alvo.userData.ref;
      const d = Math.hypot(npc.g.position.x - avatar.position.x, npc.g.position.z - avatar.position.z);
      if (d < 7) abreDialogo(npc); else mostraMensagem('Chegue mais perto pra conversar. 💬');
      return;
    }
    if (tipo === 'jogador' || tipo === 'pet') { customizar.abre(); return; }
    if (tipo === 'rato' || tipo === 'monstro' || tipo === 'boss') { // clicou no bicho
      const r = ratos.find((m) => m.g === alvo);
      if (r) {
        const d = Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
        if (r.corpse && d < 2.6) { saqueia(r); return; }
        if (r.vivo && d < alcanceAtaque() + 0.2) { // vira pro alvo e golpeia/atira
          avatar.rotation.y = Math.atan2(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
          gesto = 1; atacar(); return;
        }
        mostraMensagem('Chegue mais perto! 🏃'); return;
      }
    }
    break;
  }
  executaAcao(); // clicou no mundo → mesma ação da tecla E / botão AÇÃO
});

// AÇÃO do lugar (compartilhada entre tecla E, botão AÇÃO e clique do mouse)
function executaAcao() {
  gesto = 1;
  if (noEsgoto) {
    let subiu = false;
    for (let i = 0; i < esgoto.acessos.length; i++) {
      const a = esgoto.acessos[i];
      if (Math.hypot(avatar.position.x - a.x, avatar.position.z - a.z) < 2.8) { sobe(i); subiu = true; break; }
    }
    if (!subiu) {
      const itEsg = achaInterativo(); // ex.: sua mochila caída no esgoto
      if (itEsg && itEsg.onAcao) { itEsg.onAcao(); return; }
      const c = corpseProximo(); if (c) saqueia(c); else atacar();
    }
  } else {
    const alvo = achaInterativo();
    if (alvo) {
      if (alvo.onAcao) { alvo.onAcao(); if (alvo.msgAcao) mostraMensagem(alvo.msgAcao); }
      else mostraMensagem(alvo.titulo + ' — ' + alvo.msg);
    } else { // sem interativo: saquear / atacar / pescar
      const c = corpseProximo();
      if (c) saqueia(c); else if (alvoRato(alcanceAtaque())) atacar(); else if (pertoDaAgua()) pescar();
    }
  }
}

// --- COMBATE: HUD, bueiro, gravetos, descer/subir, atacar, loot ---
const hud = criaHUD();
const MAT_MADEIRA = new THREE.MeshStandardMaterial({ color: 0x7a5a2a, roughness: 0.9 });
// BUEIROS validados: cada um fica NA RUA, exatamente em cima da escada do
// esgoto (descida/subida vertical coerente). Os 2 últimos ficam em THAIS —
// a rede de esgoto liga as duas cidades, igual no Tibia!
const BUEIROS = [
  { x: 16, z: -16 }, { x: -16, z: 16 }, { x: 48, z: 16 }, { x: -48, z: -16 }, { x: 18, z: 18 },
  { x: 552, z: -2 }, { x: 570, z: 4 },
];
BUEIROS.forEach((bp, i) => {
  const b = new THREE.Group(); b.position.set(bp.x, 0, bp.z);
  const aro = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.9 }));
  aro.position.y = 0.12; b.add(aro);
  const buraco = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0x080808 }));
  buraco.position.y = 0.2; b.add(buraco);
  scene.add(b);
  interativos.push({ x: bp.x, z: bp.z, raio: 2.4, titulo: '🕳️ Bueiro', acao: 'Descer ao esgoto 🕳️', msg: 'Escuro lá embaixo...', onAcao: () => desce(i) });
});
[[26, 24], [-22, 26], [26, -22], [10, 54], [54, 10]].forEach(([gx, gz]) => {
  const grp = new THREE.Group(); grp.position.set(gx, 0, gz);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.2, 6), MAT_MADEIRA);
  stick.rotation.z = Math.PI / 2; stick.position.y = 0.1; grp.add(stick);
  scene.add(grp);
  const it = { x: gx, z: gz, raio: 2.2, titulo: '🪵 Graveto', acao: 'Pegar graveto 🪵', msg: 'Um galho resistente.' };
  it.onAcao = () => { scene.remove(grp); const i = interativos.indexOf(it); if (i >= 0) interativos.splice(i, 1); equipaGraveto(); };
  interativos.push(it);
});

// === COLETÁVEIS pelo mundo (colher → vender no mercador → renascem em 90s) ===
const TIPOS_COLETA = {
  Erva: { icone: '🌿', cria: () => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 5), new THREE.MeshStandardMaterial({ color: 0x3fa050, roughness: 0.9 })); m.position.y = 0.28; return m; } },
  Cogumelo: { icone: '🍄', cria: () => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.32, 6), new THREE.MeshStandardMaterial({ color: 0xe8e0d0 })); c.position.y = 0.16; g.add(c); const ch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc23a2a })); ch.position.y = 0.32; g.add(ch); return g; } },
  Concha: { icone: '🐚', cria: () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf0e2d0, roughness: 0.5 })); m.position.y = 0.06; m.scale.y = 0.5; return m; } },
  Coco: { icone: '🥥', cria: () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshStandardMaterial({ color: 0x5a4226, roughness: 0.9 })); m.position.y = 0.2; return m; } },
};
[
  ['Erva', [[-84, 8], [-90, 36], [120, 30], [160, -24], [310, 24], [-120, -40], [430, -26]]],
  ['Cogumelo', [[-86, 20], [-92, -10], [135, 26], [365, 64], [-118, 60]]],
  ['Concha', [[-50, -206], [-10, -212], [30, -208], [70, -214], [105, -206], [-90, -210]]],
  ['Coco', [[-58, -212], [17, -216], [97, -214], [-138, -214]]],
].forEach(([tipo, pontos]) => pontos.forEach(([cx, cz]) => {
  const def = TIPOS_COLETA[tipo];
  const mesh = def.cria();
  mesh.position.set(cx, mesh.position.y, cz);
  scene.add(mesh);
  const it = { x: cx, z: cz, raio: 2.2, titulo: `${def.icone} ${tipo}`, acao: `Colher ${tipo} ${def.icone}` };
  it.onAcao = () => {
    if (!inventario.addItem({ nome: tipo, icone: def.icone })) { mostraMensagem('Mochila cheia! 🎒'); return; }
    mesh.visible = false; it._off = true;
    mostraMensagem(`${def.icone} Colheu ${tipo}! (vende no mercador)`);
    setTimeout(() => { mesh.visible = true; it._off = false; }, 90000); // renasce em 90s
  };
  interativos.push(it);
}));

// CASAS À VENDA (compra com ouro; depois personaliza o telhado)
const TELHADOS = [0x8a4632, 0x4a5666, 0x6a4a8a, 0x3a6b30, 0x2a5a9c, 0x7a3a2a];
[{ x: 43, z: 6, casaIdx: 0 }, { x: -43, z: 6, casaIdx: 1 }].forEach((cv) => { // placas junto às portas novas (lado da rua)
  cv.custo = 15; cv.corIdx = 0;
  const placa = new THREE.Group(); placa.position.set(cv.x, 0, cv.z);
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), MAT_MADEIRA); poste.position.y = 0.9; placa.add(poste);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.08), new THREE.MeshStandardMaterial({ color: 0xc0392b })); tab.position.y = 1.6; placa.add(tab);
  scene.add(placa);
  const it = { x: cv.x, z: cv.z, raio: 2.6, titulo: 'Casa', acao: `Comprar casa (${cv.custo} 🪙)` };
  it.onAcao = () => {
    if (!cv.comprada) {
      if (ouro >= cv.custo) { ouro -= cv.custo; cv.comprada = true; it.acao = 'Personalizar telhado 🎨'; hud.ouro(ouro); tab.material = new THREE.MeshStandardMaterial({ color: 0x2e7d32 }); mostraMensagem('🏠 Casa comprada! Agora é sua — entre e use AÇÃO aqui pra mudar o telhado.'); }
      else mostraMensagem(`Faltam moedas: ${ouro}/${cv.custo} 🪙. Lute e pesque pra juntar!`);
    } else {
      const casa = casas[cv.casaIdx];
      if (casa) { cv.corIdx = (cv.corIdx + 1) % TELHADOS.length; casa.roof.material = new THREE.MeshStandardMaterial({ color: TELHADOS[cv.corIdx], roughness: 0.9 }); mostraMensagem('🎨 Telhado repintado!'); }
    }
  };
  interativos.push(it);
});

let acessoAtual = 0;
function desce(i = 0) {
  acessoAtual = i;
  esgoto.grupo.visible = true;
  chaoY = -40; areaAtiva = esgoto.bounds; noEsgoto = true;
  const a = esgoto.acessos[i] || esgoto.acessos[0];
  avatar.position.set(a.x, -40, a.z + (a.z > 0 ? -3 : 3)); vy = 0; noChao = true;
  hemi.intensity = 0.08; sun.intensity = 0.05; // ESGOTO ESCURO — acenda a tocha (T)
  minimapa.esconde();
  mostraMensagem(tochaOn ? 'Você desce ao esgoto. 🐀' : 'Está escuro! Acenda a tocha — tecla T 🔦');
}
function sobe(i = acessoAtual) {
  esgoto.grupo.visible = false;
  chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false;
  const b = BUEIROS[i] || BUEIROS[0];
  avatar.position.set(b.x, 0, b.z + 2.5); vy = 0; noChao = true;
  minimapa.mostra(); mostraMensagem('Você volta à superfície. ☀️'); // luz volta pelo ciclo dia/noite
}

// CICLO DIA/NOITE (discreto): muda sol/ambiente/céu/neblina e acende os lampiões
const C_TOPO_DIA = new THREE.Color(0x4f86c0), C_BASE_DIA = new THREE.Color(0xdce9f2);
const C_TOPO_NOITE = new THREE.Color(0x0a1530), C_BASE_NOITE = new THREE.Color(0x16233f);
const C_FOG_DIA = new THREE.Color(0xcfe0ee), C_FOG_NOITE = new THREE.Color(0x111b2e);
let tempoDia = 0.3; // começa de manhã
let ehNoite = false;
function aplicaDiaNoite(dt) {
  tempoDia = (tempoDia + dt / 300) % 1; // ciclo ~5 min
  const d = (Math.sin((tempoDia - 0.25) * Math.PI * 2) + 1) / 2; // 0=noite, 1=meio-dia
  ehNoite = d < 0.35;
  sun.intensity = 0.12 + d * 1.25;
  hemi.intensity = 0.22 + d * 0.72;
  if (ceu.material.map) { // céu panorâmico: tinge do dia (branco) pra noite (azul-escuro)
    ceu.material.color.setRGB(0.16 + d * 0.84, 0.2 + d * 0.8, 0.34 + d * 0.66);
  } else {
    skyMat.uniforms.corTopo.value.copy(C_TOPO_NOITE).lerp(C_TOPO_DIA, d);
    skyMat.uniforms.corBase.value.copy(C_BASE_NOITE).lerp(C_BASE_DIA, d);
  }
  if (scene.fog) scene.fog.color.copy(C_FOG_NOITE).lerp(C_FOG_DIA, d);
  const noite = 1 - d;
  // LUAR: a lua brilha mais à noite (mas fica visível de dia, pálida) + estrelas surgem
  luaLuz.intensity = (ehMobile ? 0.35 : 0.6) * Math.max(0, noite - 0.12);
  if (luaMat) luaMat.emissiveIntensity = 0.35 + noite * 0.85;
  if (estrelas) estrelas.material.opacity = Math.min(1, Math.max(0, noite - 0.3) * 1.4);
  for (const p of postes) {
    // só acende a PointLight dos postes PERTO do jogador (limita luzes dinâmicas → perf no PC)
    const pp = p.luz.parent ? p.luz.parent.position : null;
    const perto = pp && Math.abs(pp.x - avatar.position.x) < 55 && Math.abs(pp.z - avatar.position.z) < 55;
    p.luz.intensity = (!ehMobile && noite > 0.45 && perto) ? (noite - 0.45) * 3.4 : 0; // sem point-lights no mobile
    if (p.lumMat) p.lumMat.emissiveIntensity = 0.25 + noite * 0.9; // a luminária emissiva brilha em todos (barato)
  }
}
// CADA ARMA TEM SEU DESIGN (adaga ≠ espada ≠ machado ≠ arco ≠ graveto):
// a peça na mão precisa PARECER o que é.
const MAT_OURO = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.75, roughness: 0.3 });
const MAT_COURO = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.9 });
function poeArmaNaMao() {
  const p = avatar.userData.partes; if (!p) return;
  const old = p.bracoDir.getObjectByName('arma'); if (old) p.bracoDir.remove(old);
  const item = equipados.maoDir;
  const m = new THREE.Group(); m.name = 'arma';
  const nome = item ? item.nome : null;
  if (item && item.arco) { // ARCO: haste curva + corda tensionada
    const haste = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 12, Math.PI), MAT_MADEIRA);
    haste.rotation.z = -Math.PI / 2; m.add(haste);
    const corda = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.1, 0.02), MAT_METAL);
    m.add(corda);
    m.position.set(0, -1.0, 0.2); m.rotation.x = 0.2;
  } else if (nome === 'Machado') { // MACHADO: cabo longo + cabeça LARGA de duas lâminas
    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.5, 6), MAT_MADEIRA);
    cabo.position.y = 0.2; m.add(cabo);
    const olhoM = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.16), MAT_METAL);
    olhoM.position.y = 0.85; m.add(olhoM);
    [-1, 1].forEach((ld) => { // duas lâminas em leque
      const lamina = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 10, 1, false, ld > 0 ? -Math.PI / 2.6 : Math.PI - Math.PI / 2.6, Math.PI / 1.3), MAT_METAL);
      lamina.rotation.x = Math.PI / 2; lamina.position.set(ld * 0.28, 0.85, 0); m.add(lamina);
    });
    m.position.set(0, -1.05, 0.28); m.rotation.x = -0.45;
  } else if (nome === 'Espada') { // ESPADA: lâmina longa + guarda dourada + punho + pomo
    const lamina = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.05, 0.04), MAT_METAL);
    lamina.position.y = 0.62; m.add(lamina);
    const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 4), MAT_METAL);
    ponta.position.y = 1.22; ponta.rotation.y = Math.PI / 4; m.add(ponta);
    const fio = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.05, 0.055), MAT_METAL); // vinco central
    fio.position.set(0, 0.62, 0); m.add(fio);
    const guarda = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.07, 0.1), MAT_OURO);
    guarda.position.y = 0.07; m.add(guarda);
    const punho = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.3, 8), MAT_COURO);
    punho.position.y = -0.12; m.add(punho);
    const pomo = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), MAT_OURO);
    pomo.position.y = -0.3; m.add(pomo);
    m.position.set(0, -1.0, 0.28); m.rotation.x = -0.5;
  } else if (nome === 'Adaga') { // ADAGA: curta e ágil
    const lamina = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.03), MAT_METAL);
    lamina.position.y = 0.32; m.add(lamina);
    const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 4), MAT_METAL);
    ponta.position.y = 0.64; m.add(ponta);
    const guarda = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.08), MAT_METAL);
    guarda.position.y = 0.05; m.add(guarda);
    const punho = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 8), MAT_COURO);
    punho.position.y = -0.1; m.add(punho);
    m.position.set(0, -1.0, 0.26); m.rotation.x = -0.5;
  } else { // GRAVETO
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.2, 6), MAT_MADEIRA);
    m.add(stick);
    m.position.set(0, -1.0, 0.18); m.rotation.x = 0.4;
  }
  p.bracoDir.add(m);
}
function equipaGraveto() {
  if (armado) return; armado = true; danoArma = 5; poeArmaNaMao();
  inventario.equipa('maoDir', { nome: 'Graveto', icone: '🪵' });
  mostraMensagem('Pegou um graveto! Seus golpes agora dão 5. ⚔️');
}
// ARMADURAS — caem de bichos fortes; clique na mochila p/ equipar (aparece no corpo + defesa)
const ARMADURAS = [
  { id: 'elmo', nome: 'Elmo de Ferro', icone: '🪖', slot: 'cabeca', defesa: 3 },
  { id: 'peitoral', nome: 'Peitoral', icone: '🥋', slot: 'tronco', defesa: 6 },
  { id: 'escudo', nome: 'Escudo', icone: '🛡️', slot: 'maoEsq', defesa: 4 },
  { id: 'botas', nome: 'Botas de Aço', icone: '🥾', slot: 'pes', defesa: 2 },
  { id: 'amuleto', nome: 'Amuleto', icone: '📿', slot: 'colar', defesa: 2 },
  { id: 'aneldef', nome: 'Anel de Defesa', icone: '💍', slot: 'anel', defesa: 1 },
];
const ARMAS = [
  { nome: 'Adaga', icone: '🗡️', slot: 'maoDir', dano: 8, arma: true },
  { nome: 'Espada', icone: '⚔️', slot: 'maoDir', dano: 12, arma: true },
  { nome: 'Machado', icone: '🪓', slot: 'maoDir', dano: 16, arma: true },
];
function aoEquipar(item) {
  if (item.usavel === 'tocha') { alternaTocha(); return false; } // acende/apaga, não consome
  if (item.usavel === 'pocao') { // poção de vida: cura na hora (consome 1)
    if (vida >= VIDA_MAX) { mostraMensagem('Você já está com a vida cheia. ❤️'); return false; }
    vida = Math.min(VIDA_MAX, vida + 35); hud.vida(vida, VIDA_MAX);
    mostraMensagem('🧪 Glub glub... +35 de vida! ❤️');
    return true;
  }
  if (item.usavel === 'runaCura') { // runa de cura: +50 na hora
    if (vida >= VIDA_MAX) { mostraMensagem('Você já está com a vida cheia. ❤️'); return false; }
    vida = Math.min(VIDA_MAX, vida + 50); hud.vida(vida, VIDA_MAX);
    mostraMensagem('✨ Runa de Cura! +50 ❤️');
    return true;
  }
  if (item.usavel === 'runaFogo') { // runa de fogo: explosão queima TODOS por perto
    let acertou = 0;
    for (const r of ratos) {
      if (!r.vivo || Math.abs(r.g.position.y - avatar.position.y) > 6) continue;
      const d = Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
      if (d > 5) continue;
      r.hp -= 30; r.piscar = 0.2; if (r.g.userData.corpoMat) r.g.userData.corpoMat.emissive.setHex(0xa03010);
      if (r.hp <= 0) mataBicho(r);
      acertou++;
    }
    explosaoFogo();
    mostraMensagem(acertou ? `🔥 Runa de Fogo! ${acertou} bicho(s) queimado(s) (-30)` : '🔥 A runa explode... sem alvos por perto.');
    return true;
  }
  if (item.arma) { // arma de mão
    armado = true; danoArma = item.dano; equipados.maoDir = item; poeArmaNaMao();
    inventario.equipa('maoDir', { nome: item.nome, icone: item.icone });
    mostraMensagem(`Empunhou ${item.nome} (dano ${item.dano}) ⚔️`); return true;
  }
  const slot = item.slot;
  if (equipados[slot]) { defesa -= equipados[slot].defesa || 0; inventario.addItem(equipados[slot]); }
  equipados[slot] = item; defesa += item.defesa || 0;
  inventario.equipa(slot, { nome: item.nome, icone: item.icone });
  poeCorpoEquip();
  mostraMensagem(`Equipou ${item.nome} (+${item.defesa} def) 🛡️`);
  return true;
}
function poeCorpoEquip() {
  const p = avatar.userData.partes; if (!p) return;
  avatar.children.filter((c) => c.name === 'equipCorpo').forEach((c) => avatar.remove(c));
  p.bracoEsq.children.filter((c) => c.name === 'equipCorpo').forEach((c) => p.bracoEsq.remove(c));
  if (equipados.cabeca) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.6, 0.9), MAT_METAL); m.name = 'equipCorpo'; m.position.y = 2.72; m.castShadow = true; avatar.add(m); } // elmo ASSENTA na cabeça
  if (equipados.tronco) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.0, 0.62), MAT_METAL); m.name = 'equipCorpo'; m.position.y = 1.5; m.castShadow = true; avatar.add(m); }
  if (equipados.maoEsq) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.7), MAT_METAL); m.name = 'equipCorpo'; m.position.set(0, -0.4, 0.3); p.bracoEsq.add(m); }
}
// TOCHA (acende o esgoto escuro)
function poeTochaNaMao(on) {
  const p = avatar.userData.partes; if (!p) return;
  const existe = p.bracoEsq.getObjectByName('tocha');
  if (on && !existe) {
    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), MAT_MADEIRA);
    cabo.name = 'tocha'; cabo.position.set(0, -0.85, 0.26); cabo.rotation.x = 0.3;
    const chama = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffb04a, emissive: 0xff7a2a, emissiveIntensity: 1 }));
    chama.position.y = 0.5; cabo.add(chama); p.bracoEsq.add(cabo); // chama no TOPO do cabo (antes ficava sob a mão)
  } else if (!on && existe) { existe.parent.remove(existe); }
}
function alternaTocha() {
  tochaOn = !tochaOn;
  luzTocha.intensity = tochaOn ? 1.9 : 0;
  inventario.equipa('tocha', tochaOn ? { nome: 'Tocha', icone: '🔦' } : null);
  poeTochaNaMao(tochaOn);
  mostraMensagem(tochaOn ? '🔦 Tocha acesa' : 'Tocha apagada');
}
window.addEventListener('keydown', (e) => { if (e.code === 'KeyT') alternaTocha(); });

const LOOT_TAB = [
  { nome: 'Carne', icone: '🍖', ch: 0.45 },
  { nome: 'Queijo', icone: '🧀', ch: 0.18 },
  { nome: 'Moeda', icone: '🪙', ch: 0.30 },
  { nome: 'Cauda de rato', icone: '〰️', ch: 0.08 },
  { nome: 'Osso', icone: '🦴', ch: 0.14 },
  { nome: 'Couro', icone: '🟫', ch: 0.12 },
  { nome: 'Erva', icone: '🌿', ch: 0.12 },
  { nome: 'Frasco', icone: '⚗️', ch: 0.05 },
  { nome: 'Poção de Vida', icone: '🧪', ch: 0.07, slot: 'pocao', usavel: 'pocao' }, // clicar na mochila cura
];
// tesouros raros (gemas, joias, bolsa) — bichos fortes/boss e chance baixa nos comuns
const LOOT_RARO = [
  { nome: 'Rubi', icone: '🔴' }, { nome: 'Safira', icone: '🔵' }, { nome: 'Esmeralda', icone: '🟢' },
  { nome: 'Pérola', icone: '⚪' }, { nome: 'Âmbar', icone: '🟠' }, { nome: 'Anel de Ouro', icone: '💍' },
  { nome: 'Bolsa de Ouro', icone: '💰' },
];
const pickRaro = () => ({ ...LOOT_RARO[Math.floor(Math.random() * LOOT_RARO.length)] });
function rollLoot(ehBoss) {
  const out = [];
  LOOT_TAB.forEach((it) => { if (Math.random() < (ehBoss ? it.ch + 0.2 : it.ch)) out.push({ ...it }); });
  if (ehBoss) {
    out.push({ nome: 'Presa do Boss', icone: '🦷' });
    if (Math.random() < 0.55) out.push(pickRaro());                                            // gema/joia
    if (Math.random() < 0.4) out.push({ ...ARMADURAS[Math.floor(Math.random() * ARMADURAS.length)] }); // armadura
    if (Math.random() < 0.3) out.push({ ...ARMAS[Math.floor(Math.random() * ARMAS.length)] });  // ou arma
  } else if (Math.random() < 0.1) {
    out.push(pickRaro()); // chance pequena de tesouro em bicho comum
  }
  return out;
}
function alcanceAtaque() { return (equipados.maoDir && equipados.maoDir.arco) ? 14 : 2.6; } // arco atira de LONGE
function alvoRato(alcance = 2.6) {
  const fx = Math.sin(avatar.rotation.y), fz = Math.cos(avatar.rotation.y);
  let melhor = null, melhorD = alcance;
  for (const r of ratos) {
    if (!r.vivo || Math.abs(r.g.position.y - avatar.position.y) > 6) continue; // mesmo "andar"
    const dx = r.g.position.x - avatar.position.x, dz = r.g.position.z - avatar.position.z, d = Math.hypot(dx, dz);
    if (d > alcance || (dx * fx + dz * fz) / (d || 1) < 0) continue; // no alcance e na frente
    if (d < melhorD) { melhorD = d; melhor = r; }
  }
  return melhor;
}
// FLECHAS voando (projétil visual do arco)
const flechasVoando = [];
function disparaFlecha(r) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.95, 4), MAT_MADEIRA);
  const de = avatar.position.clone(); de.y += 2.0;
  const ate = r.g.position.clone(); ate.y += 1.2;
  m.position.copy(de);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ate.clone().sub(de).normalize());
  scene.add(m);
  flechasVoando.push({ m, de, ate, t: 0 });
}
// === PROJÉTEIS DOS BICHOS (beholder = magia roxa; dragão = BOLA DE FOGO
// que às vezes deixa LAVA no chão por 12s — quem pisar QUEIMA)
const projeteis = [];
const camposTemp = [];
const MAT_PROJ_FOGO = new THREE.MeshStandardMaterial({ color: 0xff7a2a, emissive: 0xff4a00, emissiveIntensity: 1 });
const MAT_PROJ_MAGIA = new THREE.MeshStandardMaterial({ color: 0xc44aff, emissive: 0x8a2ad8, emissiveIntensity: 1 });
const MAT_LAVA_CHAO = new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0xff3a00, emissiveIntensity: 0.9, roughness: 0.6 });
aplicaTexturaReal(MAT_LAVA_CHAO, 'lava', 1.5, 1.5, true);
function disparaBicho(r) {
  const fogo = r.atira === 'fogo';
  const m = new THREE.Mesh(new THREE.SphereGeometry(fogo ? 0.5 : 0.36, 10, 10), fogo ? MAT_PROJ_FOGO : MAT_PROJ_MAGIA);
  const de = r.g.position.clone(); de.y += fogo ? 7.4 : 4.2; // sai da boca/olho
  const ate = avatar.position.clone(); ate.y += 1.4;          // mira onde você ESTÁ (corre pra esquivar!)
  m.position.copy(de); scene.add(m);
  projeteis.push({ m, de, ate, t: 0, dur: Math.max(0.3, de.distanceTo(ate) / 22), dano: r.danoTiro || 10, fogo });
}
function criaLavaTemp(x, z, y) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(2, 14), MAT_LAVA_CHAO);
  m.rotation.x = -Math.PI / 2; m.position.set(x, y + 0.09, z); scene.add(m);
  camposTemp.push({ tipo: 'lava', x, z, r: 2, y, expiraAt: tempo + 12, mesh: m });
}

// EXPLOSÃO da Runa de Fogo (esfera que cresce e some)
const explosoes = [];
function explosaoFogo() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.7, depthWrite: false }));
  m.position.copy(avatar.position); m.position.y += 1.2;
  scene.add(m);
  explosoes.push({ m, t: 0 });
}
function atacar() {
  const dano = danoArma;
  if (equipados.maoDir && equipados.maoDir.arco) { // ARCO: tiro à distância (gasta 1 flecha)
    const melhor = alvoRato(14);
    if (!melhor) { mostraMensagem('Nenhum alvo ao alcance do arco. 🏹'); return; }
    if (!inventario.consomeItem('Flecha')) { mostraMensagem('Sem flechas! Compre com Falk (Venore) ou Yara (Thais). ➹'); return; }
    disparaFlecha(melhor);
    melhor.hp -= dano; melhor.piscar = 0.15; if (melhor.g.userData.corpoMat) melhor.g.userData.corpoMat.emissive.setHex(0x882020);
    if (melhor.hp <= 0) mataBicho(melhor);
    else mostraMensagem(`🏹 Flechada! (-${dano}, vida ${Math.max(0, melhor.hp)})`);
    return;
  }
  const melhor = alvoRato();
  if (!melhor) { mostraMensagem('Golpe no ar!'); return; }
  melhor.hp -= dano; melhor.piscar = 0.15; if (melhor.g.userData.corpoMat) melhor.g.userData.corpoMat.emissive.setHex(0x882020);
  if (melhor.hp <= 0) mataBicho(melhor);
  else mostraMensagem(`Acertou ${melhor.boss ? 'o BOSS' : 'o bicho'}! (-${dano}, vida ${Math.max(0, melhor.hp)})`);
}
function mataBicho(r) {
  r.vivo = false; r.corpse = true;
  r.g.rotation.z = Math.PI / 2;      // tomba (corpo no chão)
  if (r.g.userData.corpoMat) r.g.userData.corpoMat.emissive.setHex(0x000000);
  r.loot = rollLoot(r.boss || r.forte);
  if (r.lootEspecial && Math.random() < 0.7) r.loot.push({ ...r.lootEspecial }); // drop único (ex.: Olho do Beholder)
  r.despawnAt = tempo + 30;          // some em 30s se não saquear
  const xp = r.xp || 5;
  hud.ganhaXP(xp);
  mostraMensagem(`${r.boss || r.forte ? 'Criatura poderosa derrotada!' : 'Derrotado!'} +${xp} XP — AÇÃO no corpo p/ saquear`);
}
function corpseProximo() {
  let melhor = null, melhorD = 2.4;
  for (const r of ratos) {
    if (!r.corpse || Math.abs(r.g.position.y - avatar.position.y) > 6) continue;
    const d = Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
    if (d < melhorD) { melhorD = d; melhor = r; }
  }
  return melhor;
}
function saqueia(r) {
  let pegou = 0;
  for (const it of (r.loot || [])) {
    if (it.nome === 'Moeda') { ouro += 1 + Math.floor(Math.random() * 3); hud.ouro(ouro); pegou++; }
    else if (it.nome === 'Bolsa de Ouro') { ouro += 10 + Math.floor(Math.random() * 16); hud.ouro(ouro); pegou++; }
    else if (inventario.addItem(it)) pegou++;
  }
  r.loot = []; r.corpse = false; r.g.visible = false; r.respawnAt = tempo + (r.boss ? 60 : 25);
  mostraMensagem(pegou ? `Saqueou ${pegou} item(s) 🎒` : 'O corpo estava vazio.');
}
// CORPOS CAÍDOS: ao morrer a mochila fica no chão onde você caiu, por 10
// MINUTOS (cada morte deixa o SEU corpo — morrer de novo não apaga o anterior)
const corposCaidos = [];
function derrubaMochila(pos, itens) {
  const g = new THREE.Group(); g.position.copy(pos);
  const saco = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.6, 0.65), MAT_MADEIRA);
  saco.position.y = 0.3; saco.rotation.z = 0.35; saco.castShadow = true; g.add(saco);
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 6, 12), MAT_MADEIRA);
  alca.position.set(0.3, 0.62, 0); g.add(alca);
  const cnvM = document.createElement('canvas'); cnvM.width = 128; cnvM.height = 128;
  const cm = cnvM.getContext('2d'); cm.font = '88px Arial'; cm.textAlign = 'center'; cm.textBaseline = 'middle'; cm.fillText('🎒', 64, 70);
  const marc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnvM), transparent: true, depthTest: false }));
  marc.scale.set(1.6, 1.6, 1); marc.position.y = 2.2; marc.renderOrder = 997; g.add(marc);
  scene.add(g);
  const it = {
    x: pos.x, z: pos.z, y: pos.y, raio: 2.6,
    titulo: '🎒 Seus pertences', acao: 'Recuperar seus itens 🎒',
    onAcao: () => {
      let dev = 0;
      for (const item of itens) for (let q = 0; q < item.qtd; q++) { if (inventario.addItem(item)) dev++; }
      scene.remove(g);
      const ix = interativos.indexOf(it); if (ix >= 0) interativos.splice(ix, 1);
      const ic = corposCaidos.findIndex((c) => c.it === it); if (ic >= 0) corposCaidos.splice(ic, 1);
      mostraMensagem(`🎒 Você recuperou ${dev} item(s)!`);
    },
  };
  interativos.push(it);
  corposCaidos.push({ mesh: g, it, expiraAt: tempo + 600 }); // o corpo dura 10 MINUTOS
}
// MORTE estilo Tibia: perde XP (pode descer de nível), derruba a mochila onde
// caiu (dá pra voltar e recuperar) e RENASCE no Templo Sagrado de Venore.
function morre() {
  const perdidos = inventario.esvaziaMochila();
  if (perdidos.length) derrubaMochila(avatar.position.clone(), perdidos);
  const xpPerdido = hud.perdeXP();
  vida = VIDA_MAX;
  if (noEsgoto) { chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false; esgoto.grupo.visible = false; minimapa.mostra(); }
  avatar.position.set(0, 0, -30); vy = 0; noChao = true; // dentro do Templo Sagrado
  hud.vida(vida, VIDA_MAX);
  mostraMensagem(`💀 Você caiu! Os deuses te trazem ao Templo Sagrado. (-${xpPerdido} XP${perdidos.length ? ' · sua mochila ficou onde você morreu 🎒' : ''})`);
  salvaJogo(); // grava o estado pós-morte na conta
}
function reviveBicho(r) {
  if (r.dragao) {
    // raramente (20%), no lugar do dragão verde nasce o DRAGON LORD vermelho,
    // 5× mais forte; quando o Lord morre, volta o dragão verde de sempre.
    scene.remove(r.g);
    r.lord = !r.lord && Math.random() < 0.2;
    r.g = criaDragao(DRX, DRZ, r.lord);
    r.g.position.y = DRY;
    scene.add(r.g);
    if (r.lord) {
      r.hpMax = 1100; r.xp = 600; r.dano = 55; r.vel = 1.9; r.danoTiro = 40; r.cadencia = 3;
      r.lootEspecial = { nome: 'Coração de Dragão', icone: '❤️‍🔥' };
      mostraMensagem('🔥 Um DRAGON LORD pousou no pico da montanha!');
    } else {
      r.hpMax = 220; r.xp = 120; r.dano = 22; r.vel = 1.6; r.danoTiro = 18; r.cadencia = 4;
      r.lootEspecial = { nome: 'Escama de Dragão', icone: '🐲' };
      mostraMensagem('🐲 Um dragão voltou ao pico da montanha.');
    }
    r.hp = r.hpMax; r.vivo = true; r.respawnAt = null; r.alvo = { x: DRX, z: DRZ };
    return;
  }
  if (r.boss && r.forma) { // só o boss do esgoto troca de forma (cobra↔croc)
    scene.remove(r.g);
    r.forma = r.forma === 'cobra' ? 'croc' : 'cobra';
    r.g = (r.forma === 'cobra' ? criaCobra : criaCrocodilo)(0, -10);
    scene.add(r.g);
    mostraMensagem('🐍 Algo desperta no fundo do esgoto...');
  } else {
    const b = r.bounds;
    r.g.rotation.z = 0; r.g.visible = true;
    r.g.position.set(b.minX + 3 + Math.random() * (b.maxX - b.minX - 6), r.y0, b.minZ + 3 + Math.random() * (b.maxZ - b.minZ - 6));
  }
  r.hp = r.hpMax; r.vivo = true; r.respawnAt = null; r.alvo = { x: r.g.position.x, z: r.g.position.z };
}

// =============================================================
//  CONTA LOCAL / SAVE — cada NOME de personagem é uma "conta" salva no
//  navegador (localStorage): nível, XP, ouro, mochila, posição e visual
//  NÃO resetam mais. Auto-salva a cada 10s, ao fechar e ao morrer; o
//  botão 💾 salva na hora. (Conta online de verdade = próximo passo,
//  precisa de banco no servidor.)
// =============================================================
function salvaJogo() {
  if (!jogoIniciado) return;
  try {
    localStorage.setItem('venor_conta_' + nomeJogador.trim().toLowerCase(), JSON.stringify({
      v: 1, cores: { ...coresJogador },
      x: avatar.position.x, z: avatar.position.z,
      ouro, vida, hud: hud.estado(), mochila: inventario.estado(),
      equip: Object.values(equipados).filter(Boolean),
    }));
  } catch (e) { /* armazenamento cheio/indisponível: segue o jogo */ }
}
function carregaJogo(nome) {
  try {
    const raw = localStorage.getItem('venor_conta_' + nome.trim().toLowerCase());
    if (!raw) return false;
    const d = JSON.parse(raw);
    ouro = d.ouro || 0; vida = d.vida || VIDA_MAX;
    Object.assign(coresJogador, d.cores || {});
    montaAvatar();
    if (typeof d.x === 'number' && typeof d.z === 'number') {
      avatar.position.set(d.x, alturaTerreno(d.x, d.z), d.z);
    }
    hud.carrega(d.hud || {});
    inventario.carrega(d.mochila || []);
    (d.equip || []).forEach((it) => inventario.addItem({ ...it })); // equipamento volta pra mochila (re-equipe com 1 clique)
    hud.ouro(ouro); hud.vida(vida, VIDA_MAX);
    return true;
  } catch (e) { return false; }
}
setInterval(salvaJogo, 10000);                       // auto-save a cada 10s
window.addEventListener('beforeunload', salvaJogo);  // salva ao fechar/atualizar
{ // botão 💾 (abaixo da mochila 🎒)
  const b = document.createElement('div');
  b.textContent = '💾';
  b.title = 'Salvar agora';
  b.style.cssText = 'position:fixed;top:70px;left:14px;width:48px;height:48px;z-index:41;display:none;'
    + 'align-items:center;justify-content:center;font-size:22px;cursor:pointer;user-select:none;'
    + 'background:rgba(16,22,32,.8);border:1px solid #3a4654;border-radius:12px;';
  b.addEventListener('pointerdown', (e) => { e.stopPropagation(); salvaJogo(); mostraMensagem('💾 Progresso salvo!'); });
  document.body.appendChild(b);
  window.__btnSalvar = b;
}

// =============================================================
//  CONTA DEV/GM (igual GM do Tibia) — entre com o nome "gm", "adm"
//  ou "dev" na criação do personagem. Tecla G abre o painel com os
//  poderes: teleporte, cura, ouro, XP, imortal, velocidade, spawn
//  e extermínio de bichos.
// =============================================================
let gmMode = false, gmImortal = false, gmVel = false, gmPainel = null;
function tpGM(x, z) {
  if (noEsgoto) { chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false; esgoto.grupo.visible = false; minimapa.mostra(); }
  avatar.position.set(x, alturaTerreno(x, z), z); vy = 0; noChao = true;
  mostraMensagem('🌀 Teleportado!');
}
function spawnGM(tipo) {
  const px = avatar.position.x + Math.sin(avatar.rotation.y) * 5;
  const pz = avatar.position.z + Math.cos(avatar.rotation.y) * 5;
  let g2, hp = 20, xp = 5, dn = 3, vl = 1.9, forte = false;
  if (tipo === 'rato') { g2 = criaRato(px, pz); }
  else if (tipo === 'troll') { g2 = criaTroll(px, pz); hp = 25; xp = 8; dn = 6; vl = 2.0; }
  else { g2 = criaDragao(px, pz); hp = 220; xp = 120; dn = 22; vl = 1.6; forte = true; }
  g2.position.y = avatar.position.y;
  ratos.push({ g: g2, hp, hpMax: hp, xp, dano: dn, vel: vl, forte, bounds: areaMon(px, pz, 14), y0: avatar.position.y, alvo: { x: px, z: pz }, pausa: 0, tempo: 0, vivo: true, piscar: 0 });
  scene.add(g2);
  mostraMensagem(`✨ GM: ${tipo} invocado!`);
}
function ativaGM() {
  if (gmMode) return; gmMode = true;
  gmPainel = document.createElement('div');
  gmPainel.style.cssText = 'position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:60;display:none;'
    + 'flex-direction:column;gap:5px;background:rgba(16,22,32,.95);border:1px solid #d9a522;border-radius:12px;padding:10px;'
    + 'font-family:Arial;max-height:88vh;overflow:auto;';
  const tit = document.createElement('div');
  tit.textContent = '🛡️ PAINEL GM';
  tit.style.cssText = 'color:#ffd23f;font-weight:bold;text-align:center;font-size:13px;margin-bottom:2px;';
  gmPainel.appendChild(tit);
  function B(txt, fn) {
    const b = document.createElement('div');
    b.textContent = txt;
    b.style.cssText = 'background:#1c2836;border:1px solid #3a4654;border-radius:8px;color:#eef3f8;'
      + 'padding:7px 12px;font-size:12px;cursor:pointer;user-select:none;white-space:nowrap;';
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); fn(b); });
    gmPainel.appendChild(b);
    return b;
  }
  B('🌀 Ir: Venore', () => tpGM(0, 2));
  B('🌀 Ir: Thais', () => tpGM(560, -2));
  B('🌀 Ir: Pico do Dragão', () => tpGM(110, 300));
  B('🌀 Ir: Praia', () => tpGM(0, -208));
  B('❤️ Curar tudo', () => { vida = VIDA_MAX; hud.vida(vida, VIDA_MAX); mostraMensagem('❤️ GM: vida cheia'); });
  B('🪙 +100 de ouro', () => { ouro += 100; hud.ouro(ouro); });
  B('⭐ +100 de XP', () => hud.ganhaXP(100));
  B('💀 Exterminar próximos', () => {
    let n = 0;
    for (const r of ratos) {
      if (!r.vivo || Math.abs(r.g.position.y - avatar.position.y) > 8) continue;
      if (Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z) > 16) continue;
      r.hp = 0; mataBicho(r); n++;
    }
    mostraMensagem(`💀 GM: ${n} bicho(s) exterminado(s)`);
  });
  B('🐀 Invocar rato', () => spawnGM('rato'));
  B('🧌 Invocar troll', () => spawnGM('troll'));
  B('🐲 Invocar dragão', () => spawnGM('dragao'));
  B('🛡️ Imortal: OFF', (b) => { gmImortal = !gmImortal; b.textContent = `🛡️ Imortal: ${gmImortal ? 'ON' : 'OFF'}`; });
  B('⚡ Velocidade ×3: OFF', (b) => { gmVel = !gmVel; b.textContent = `⚡ Velocidade ×3: ${gmVel ? 'ON' : 'OFF'}`; });
  document.body.appendChild(gmPainel);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyG' && gmMode) gmPainel.style.display = gmPainel.style.display === 'none' ? 'flex' : 'none';
  });
}

// NOMES DE LUGARES (estilo Tibia) — mostra o bairro/rua onde você está
const DISTRITOS = [
  { nome: 'Praça Central de Venore', x: 0, z: 0, raio: 18 },
  { nome: 'Rua do Mercado', x: 16, z: 0, raio: 16 },
  { nome: 'Templo Sagrado de Venore', x: 0, z: -30, raio: 15 },
  { nome: 'Largo da Escola', x: 0, z: 28, raio: 15 },
  { nome: 'Ponte do Riacho', x: 16, z: 78, raio: 14 },
  { nome: 'Beira do Lago', x: 45, z: 80, raio: 22 },
  { nome: 'Floresta do Oeste', x: -88, z: 0, raio: 45 },
  { nome: 'Bairro do Comércio', x: 0, z: -95, raio: 26 },
  { nome: 'Moinho de Venore', x: -44, z: -74, raio: 12 },
  { nome: 'Porto de Venore', x: 45, z: 64, raio: 14 },
  { nome: 'Farol do Porto', x: 66, z: 84, raio: 10 },
  { nome: 'Caminho de Thais', x: 300, z: 0, raio: 250 },
  { nome: 'Vale dos Monstros', x: 200, z: 90, raio: 70 },
  { nome: 'Portão de Thais', x: 506, z: 0, raio: 14 },
  { nome: 'Cidade de Thais', x: 560, z: 0, raio: 54 },
  { nome: 'Praia de Venore', x: 0, z: -222, raio: 90 },
  { nome: 'Templo de Thais', x: 560, z: 18, raio: 12 },
  { nome: 'Ruínas da Estrada', x: 400, z: -70, raio: 18 },
  { nome: 'Ruínas Antigas', x: 150, z: 250, raio: 20 },
  { nome: 'Terras do Dragão', x: 40, z: 300, raio: 45 },
  { nome: 'Covil do Dragão', x: 40, z: 330, raio: 22 },
  { nome: 'Pico do Dragão', x: 110, z: 300, raio: 50 },
  { nome: 'Ponte do Rio Fundo', x: 180, z: 0, raio: 12 },
  { nome: 'Rio Fundo', x: 180, z: -50, raio: 14 },
  { nome: 'Torre de Vigia', x: 122, z: -9, raio: 11 },
  { nome: 'Fazenda do Caminho', x: 105, z: 38, raio: 17 },
  { nome: 'Cemitério Abandonado', x: 130, z: -60, raio: 17 },
  { nome: 'Pântano da Serpente', x: 225, z: -95, raio: 26 },
  { nome: 'Acampamento Bandido', x: 252, z: 48, raio: 15 },
];
let localEl, localNome = '';
function atualizaLocal() {
  let nome = 'Venore', melhorD = Infinity;
  if (noEsgoto) nome = 'Esgoto de Venore';
  else for (const d of DISTRITOS) { const dist = Math.hypot(avatar.position.x - d.x, avatar.position.z - d.z); if (dist < d.raio && dist < melhorD) { melhorD = dist; nome = d.nome; } }
  if (nome === localNome) return;
  localNome = nome;
  if (!localEl) {
    localEl = document.createElement('div');
    localEl.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:35;'
      + 'background:rgba(16,22,32,.7);border:1px solid #3a4654;border-radius:10px;padding:6px 16px;'
      + 'color:#dfe7f0;font:bold 14px Arial;pointer-events:none;text-shadow:0 1px 2px #000;transition:opacity .4s;';
    document.body.appendChild(localEl);
  }
  localEl.textContent = '📍 ' + nome; localEl.style.opacity = '1';
  clearTimeout(localEl._t); localEl._t = setTimeout(() => { localEl.style.opacity = '0.35'; }, 3000);
}

// scroll do mouse = zoom da câmera
renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomDist = Math.max(5, Math.min(45, zoomDist + e.deltaY * 0.02));
}, { passive: false });

// ZOOM DO MINIMAPA também pelas teclas + / − (os botões 🔍 ficam COLADOS no
// mapa, canto direito — os antigos 🗺️ da esquerda mudavam o tamanho do MUNDO
// e confundiam; foram removidos)
window.addEventListener('keydown', (e) => {
  if (e.code === 'Equal' || e.code === 'NumpadAdd') minimapa.zoom(0.72);
  if (e.code === 'Minus' || e.code === 'NumpadSubtract') minimapa.zoom(1.38);
});

// === PESCA (em qualquer lago) — espécies reais ===
const PEIXES = [
  { nome: 'Lambari', icone: '🐟', ch: 0.30, xp: 2 },
  { nome: 'Tilápia', icone: '🐟', ch: 0.22, xp: 3 },
  { nome: 'Traíra', icone: '🐟', ch: 0.15, xp: 4 },
  { nome: 'Carpa', icone: '🐠', ch: 0.12, xp: 5 },
  { nome: 'Bagre', icone: '🐟', ch: 0.10, xp: 5 },
  { nome: 'Tucunaré', icone: '🐠', ch: 0.06, xp: 8 },
  { nome: 'Dourado', icone: '🐠', ch: 0.03, xp: 12 },
  { nome: 'Pintado', icone: '🐠', ch: 0.015, xp: 16 },
  { nome: 'Bota velha', icone: '🥾', ch: 0.06, xp: 0 },
];
let pescandoAte = 0;
function pertoDaAgua() {
  for (const L of lagos) { if (Math.hypot(avatar.position.x - L.x, avatar.position.z - L.z) < L.r + 4) return L; }
  return null;
}
function pescar() {
  if (pescandoAte > 0) return;
  pescandoAte = tempo + 1.5 + Math.random() * 2.2;
  gesto = 1;
  mostraMensagem('🎣 Pescando... aguarde a fisgada');
}
function resolvePesca() {
  pescandoAte = 0;
  let r = Math.random(), soma = 0, peixe = PEIXES[0];
  for (const p of PEIXES) { soma += p.ch; if (r <= soma) { peixe = p; break; } }
  if (peixe.xp > 0) {
    inventario.addItem({ nome: peixe.nome, icone: peixe.icone });
    hud.ganhaXP(peixe.xp);
    mostraMensagem(`🎣 Fisgou: ${peixe.nome}! +${peixe.xp} XP`);
  } else {
    mostraMensagem('🎣 Hm... só uma bota velha. 🥾');
  }
}

criaSelecao({
  cores: coresJogador,
  aoMudarCor: () => montaAvatar(),
  aoEntrar: (nome) => {
    nomeJogador = nome; jogoIniciado = true; avatar.rotation.y = Math.PI;
    minimapa.mostra();
    inventario.mostra();
    hud.mostra();
    const temConta = carregaJogo(nome); // CONTA LOCAL: mesmo nome = mesmo progresso
    if (!temConta) {
      // personagem NOVO: nasce na praça com o kit inicial
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2, r = 7 + Math.random() * 6;
        const tx = Math.cos(a) * r, tz = Math.sin(a) * r;
        if (!colide(tx, tz)) { avatar.position.set(tx, 0, tz); break; }
      }
      inventario.addItem({ nome: 'Tocha', icone: '🔦', slot: 'tocha', usavel: 'tocha' }); // clicar acende/apaga
      inventario.addItem({ nome: 'Vara de pesca', icone: '🎣' }); // e uma vara pra pescar nos lagos
      hud.vida(vida, VIDA_MAX); hud.ouro(ouro);
      mostraMensagem('Você tem 🔦 Tocha (T) e 🎣 Vara — chegue num lago e use AÇÃO pra pescar.');
    } else {
      mostraMensagem(`💾 Bem-vindo de volta, ${nome}! Sua conta foi carregada.`);
    }
    if (window.__btnSalvar) window.__btnSalvar.style.display = 'flex';
    // CONTA DEV/GM: entrar com o nome "gm", "adm" ou "dev" libera os poderes
    if (['gm', 'adm', 'dev'].includes(nome.trim().toLowerCase())) {
      ativaGM();
      mostraMensagem('🛡️ Conta DEV/GM ativada — aperte G pra abrir o painel de poderes!');
    }
    if (urlMP) rede = conectarRede({ url: urlMP, scene, getEstadoLocal: estadoLocal });
  },
});

// PRÉ-COMPILA todos os shaders agora (no carregamento). Sem isto, o three.js
// compila o shader de cada material novo na PRIMEIRA vez que ele aparece na
// tela — era a "travada do nada" ao explorar o mapa.
// (esgoto visível durante o compile p/ a 1ª descida não engasgar)
esgoto.grupo.visible = true;
renderer.compile(scene, camera);
esgoto.grupo.visible = false;

const relogio = new THREE.Clock();
let tempo = 0;

function passo() {
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
    const pf = controles.pegaPinch(); // PINÇA de 2 dedos = zoom (igual scroll no PC)
    if (pf !== 1) zoomDist = Math.max(5, Math.min(45, zoomDist * pf));
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
      if (gmVel) vel *= 3; // GM: velocidade ×3
      const passo = vel * dt;
      const nx = Math.max(areaAtiva.minX, Math.min(areaAtiva.maxX, avatar.position.x + mx * passo));
      if (!colide(nx, avatar.position.z)) avatar.position.x = nx;
      const nz = Math.max(areaAtiva.minZ, Math.min(areaAtiva.maxZ, avatar.position.z + mz * passo));
      if (!colide(avatar.position.x, nz)) avatar.position.z = nz;
      giraSuave(avatar, Math.atan2(mx, mz), dt * 14); // giro macio (qualidade no andar)
    }
    if (controles.querPular() && noChao) { vy = 9; noChao = false; }
    vy -= 25 * dt;
    avatar.position.y += vy * dt;
    const solo = noEsgoto ? chaoY : alturaTerreno(avatar.position.x, avatar.position.z);
    if (avatar.position.y <= solo) { avatar.position.y = solo; vy = 0; noChao = true; }
    const escalaY = abaixado ? 0.6 : 1;
    avatar.scale.y += (escalaY - avatar.scale.y) * Math.min(1, dt * 12);
    animaAvatar(avatar, movendo && noChao, tempo, correndo);
    ultimoAnim = { mov: movendo && noChao, corr: correndo, abx: abaixado };

    // AÇÃO (tecla E / botão): mesma rotina do clique do mouse
    if (controles.querAgir()) executaAcao();
    if (gesto > 0) {
      gesto = Math.max(0, gesto - dt * 3);
      const p = avatar.userData.partes;
      if (p) p.bracoDir.rotation.x = -Math.sin((1 - gesto) * Math.PI) * 1.6;
    }

    // DICA de ação (Roblox-style): o que a tecla E / botão AÇÃO faz aqui perto
    let dica = null;
    if (noEsgoto) {
      for (const a of esgoto.acessos) { if (Math.hypot(avatar.position.x - a.x, avatar.position.z - a.z) < 2.8) { dica = 'Subir 🪜'; break; } }
      if (!dica) { const itE = achaInterativo(); if (itE) dica = itE.acao || itE.titulo; }
      if (!dica && corpseProximo()) dica = 'Saquear o corpo 💀';
      if (!dica && alvoRato(alcanceAtaque())) dica = alcanceAtaque() > 3 ? 'Atirar 🏹' : 'Atacar ⚔️';
    } else {
      const it = achaInterativo();
      if (it) dica = it.acao || it.titulo;
      else if (corpseProximo()) dica = 'Saquear o corpo 💀';
      else if (alvoRato(alcanceAtaque())) dica = alcanceAtaque() > 3 ? 'Atirar 🏹' : 'Atacar ⚔️';
      else if (pertoDaAgua()) dica = 'Pescar 🎣';
    }
    mostraPrompt(dica);
    atualizaLocal();

    // INTERIORES: esconde o telhado da casa em que você está + aproxima a câmera
    let dentroCasa = false;
    for (const c of casas) {
      const d = avatar.position.x > c.box.minX && avatar.position.x < c.box.maxX
             && avatar.position.z > c.box.minZ && avatar.position.z < c.box.maxZ;
      c.roof.visible = !d;
      if (d) dentroCasa = true;
      // PORTA SEMPRE ABERTA (pedido do maestro: entrar tem que ser fácil)
      if (c.portaAnim) { c.portaAnim.alvo = c.angAberto; c.aberta = true; }
    }

    // câmera orbital + anti-oclusão
    const alvo = avatar.position;
    const foco = new THREE.Vector3(alvo.x, alvo.y + 2.4, alvo.z);
    const DIST = dentroCasa ? Math.min(6.5, zoomDist) : zoomDist;
    const cosP = Math.cos(cam.pitch);
    const desejada = new THREE.Vector3(
      foco.x + Math.sin(cam.yaw) * cosP * DIST,
      foco.y + Math.sin(cam.pitch) * DIST,
      foco.z + Math.cos(cam.yaw) * cosP * DIST,
    );
    const dir = desejada.clone().sub(foco);
    const distMax = dir.length(); dir.normalize();
    raycaster.set(foco, dir); raycaster.far = distMax;
    // anti-oclusão só contra o que está PERTO (no esgoto, só a sala) — evita raycast no mundo todo
    const occ = noEsgoto ? [esgoto.grupo] : solidos.filter((s) => s.position.distanceToSquared(avatar.position) < 500);
    const hits = raycaster.intersectObjects(occ, true);
    let dist = distMax;
    if (hits.length && hits[0].distance < distMax) dist = Math.max(3, hits[0].distance - 0.6);
    const posCam = foco.clone().add(dir.multiplyScalar(dist));
    camera.position.lerp(posCam, 0.2);
    camera.lookAt(foco.x, foco.y, foco.z);
  }

  // ambiente vivo (sempre): ciclo dia/noite (na superfície), nuvens, fonte, gato
  if (!noEsgoto) aplicaDiaNoite(dt);
  for (const nv of nuvens) { nv.position.x += dt * 2.2; if (nv.position.x > 190) nv.position.x = -190; }
  for (const gt of fonteGotas) {
    gt.userData.t += dt * gt.userData.vel; if (gt.userData.t > 1) gt.userData.t -= 1;
    const t = gt.userData.t; const r = 0.2 + t * 2.6;
    gt.position.x = Math.cos(gt.userData.ang) * r; gt.position.z = Math.sin(gt.userData.ang) * r;
    gt.position.y = 3.7 + Math.sin(t * Math.PI) * 0.9 - t * 2.4;
  }
  if (!noEsgoto) atualizaGato(gato, avatar, dt, tempo); // pet espera na superfície
  animaProps(animados, dt, tempo);
  atualizaNPCs(npcs, dt, colide, ehNoite);
  atualizaRatos(ratos, dt, jogoIniciado ? { x: avatar.position.x, y: avatar.position.y, z: avatar.position.z } : null, podeAndarBicho);

  // VOO DO DRAGÃO: de tempos em tempos ele decola do pico, plana sobre Venore
  // atrás de comida e volta — dá pra ver ele cruzando o céu da cidade!
  if (dragao.vivo && !dragao.corpse) {
    if (!vooDragao.ativo) {
      vooDragao.proximo -= dt;
      if (vooDragao.proximo <= 0) { vooDragao.ativo = true; vooDragao.t = 0; dragao.voando = true; mostraMensagem('🐉 O dragão levantou voo da montanha...'); }
    } else {
      vooDragao.t += dt / 28; // ~28s de voo (ida até a praça e volta)
      const t = vooDragao.t;
      if (t >= 1) {
        vooDragao.ativo = false; dragao.voando = false;
        vooDragao.proximo = 75 + Math.random() * 90;
        dragao.g.position.set(DRX, DRY, DRZ);
      } else {
        const k = Math.sin(t * Math.PI);            // 0→1→0 (quão longe do pico)
        const cx = DRX + (0 - DRX) * k, cz = DRZ + (0 - DRZ) * k; // rumo à praça de Venore
        const px = cx + Math.sin(t * Math.PI * 2) * 16 * k;       // serpenteia no ar
        const pz = cz + Math.cos(t * Math.PI * 2) * 10 * k;
        const py = DRY + (62 - DRY) * Math.min(1, k * 1.6);       // sobe até ~62 de altura
        const antX = dragao.g.position.x, antZ = dragao.g.position.z;
        dragao.g.position.set(px, py, pz);
        dragao.g.rotation.y = Math.atan2(px - antX, pz - antZ);
        const asas = dragao.g.userData.asas;
        if (asas) { const w = 0.45 + Math.sin(tempo * 9) * 0.5; asas[0].rotation.z = w; asas[1].rotation.z = -w; }
      }
    }
  }
  // BICHOS ATIRADORES (beholder mágico / dragão de fogo): miram e disparam
  if (jogoIniciado) for (const r of ratos) {
    if (!r.atira || !r.vivo || r.voando || r.corpse) continue;
    if (Math.abs(r.g.position.y - avatar.position.y) > 8) continue;
    const dT = Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
    if (dT < 2.5 || dT > r.alcanceTiro) continue;
    if (tempo > (r.proxTiro || 0)) {
      r.proxTiro = tempo + (r.cadencia || 3);
      r.g.rotation.y = Math.atan2(avatar.position.x - r.g.position.x, avatar.position.z - r.g.position.z);
      disparaBicho(r);
    }
  }
  // projéteis dos bichos voando → impacto (esquivou = erra!)
  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i]; p.t += dt / p.dur;
    if (p.t < 1) { p.m.position.lerpVectors(p.de, p.ate, p.t); continue; }
    scene.remove(p.m); projeteis.splice(i, 1);
    const dI = Math.hypot(p.ate.x - avatar.position.x, p.ate.z - avatar.position.z);
    if (dI < 1.9 && !gmImortal && jogoIniciado) {
      vida -= p.dano; hud.vida(vida, VIDA_MAX);
      mostraMensagem(p.fogo ? `🔥 Bola de fogo do dragão! (-${p.dano})` : `🔮 Rajada mágica do beholder! (-${p.dano})`);
      if (vida <= 0) { morre(); }
    }
    if (p.fogo && Math.random() < 0.5) criaLavaTemp(p.ate.x, p.ate.z, alturaTerreno(p.ate.x, p.ate.z)); // fogo vira LAVA no chão
  }
  // lava temporária do dragão evapora
  for (let i = camposTemp.length - 1; i >= 0; i--) {
    if (tempo > camposTemp[i].expiraAt) { scene.remove(camposTemp[i].mesh); camposTemp.splice(i, 1); }
  }
  // GIANT SPIDER: quando caça alguém por perto, CHAMA FILHOTES (máx. 4 vivos)
  if (jogoIniciado && aranhaMae.vivo && tempo > (aranhaMae.proxCria || 0)) {
    const dM = Math.hypot(aranhaMae.g.position.x - avatar.position.x, aranhaMae.g.position.z - avatar.position.z);
    if (dM < 20 && Math.abs(aranhaMae.g.position.y - avatar.position.y) < 6) {
      aranhaMae.proxCria = tempo + 7;
      if (ratos.filter((r) => r.filhote && r.vivo).length < 4) {
        const f = addMonstro(criaAranhaPequena(aranhaMae.g.position.x + 2, aranhaMae.g.position.z + 2), 10, 3, 3, 2.8, false, aranhaMae.bounds, { veneno: true, filhote: true });
        scene.add(f.g);
        mostraMensagem('🕷️ A Aranha Gigante chamou um FILHOTE!');
      }
    }
  }
  // flechas voando + explosões de runa
  for (let i = flechasVoando.length - 1; i >= 0; i--) {
    const f = flechasVoando[i]; f.t += dt * 5;
    if (f.t >= 1) { scene.remove(f.m); flechasVoando.splice(i, 1); continue; }
    f.m.position.lerpVectors(f.de, f.ate, f.t);
  }
  for (let i = explosoes.length - 1; i >= 0; i--) {
    const e = explosoes[i]; e.t += dt * 3;
    if (e.t >= 1) { scene.remove(e.m); explosoes.splice(i, 1); continue; }
    e.m.scale.setScalar(1 + e.t * 4.5); e.m.material.opacity = 0.7 * (1 - e.t);
  }
  if (jogoIniciado) {
    for (const r of ratos) {
      if (r.vivo && r.contato && tempo > (r.proxAtaque || 0)) {
        r.proxAtaque = tempo + 1.1;
        if (!gmImortal) { // GM imortal não toma dano
          vida -= Math.max(1, (r.dano || 5) - defesa);
          hud.vida(vida, VIDA_MAX);
          if (r.veneno && Math.random() < 0.35 && tempo > envenenadoAte) { // mordida venenosa
            envenenadoAte = tempo + 6;
            mostraMensagem('🕷️ Você foi ENVENENADO pela mordida! (6s)');
          }
          if (vida <= 0) { morre(); break; }
        }
      }
    }
    // CAMPOS DE CHÃO (Tibia): lava queima na hora; lodo do pântano envenena
    if (!gmImortal && noChao && !noEsgoto) {
      for (const c of CAMPOS.concat(camposTemp)) { // fixos + lava do dragão
        if (Math.abs(avatar.position.y - c.y) > 2.5) continue;
        if (Math.hypot(avatar.position.x - c.x, avatar.position.z - c.z) > c.r) continue;
        if (c.tipo === 'lava') {
          if (tempo > proxTickLava) {
            proxTickLava = tempo + 0.6;
            vida -= 8; hud.vida(vida, VIDA_MAX);
            mostraMensagem('🔥 A LAVA QUEIMA! (-8) Saia já!');
            if (vida <= 0) morre();
          }
        } else if (tempo > envenenadoAte - 7) { // renova o veneno enquanto pisa
          if (tempo > envenenadoAte) mostraMensagem('🟢 Você pisou no lodo VENENOSO! (8s de veneno)');
          envenenadoAte = tempo + 8;
        }
        break;
      }
    }
    // VENENO ativo: perde 2 de vida por segundo até passar o efeito
    if (!gmImortal && tempo < envenenadoAte && tempo > proxTickVeneno) {
      proxTickVeneno = tempo + 1;
      vida -= 2; hud.vida(vida, VIDA_MAX);
      mostraMensagem(`🟢 Veneno... (-2) ${Math.ceil(envenenadoAte - tempo)}s`);
      if (vida <= 0) morre();
    }
    if (vida < VIDA_MAX) { vida = Math.min(VIDA_MAX, vida + dt * 1.5); hud.vida(vida, VIDA_MAX); } // regen lenta
  }
  // TOCHA: ilumina FORTE quando nova e vai QUEIMANDO (raio/força encolhem);
  // apagada, ela "descansa" e recupera. (~4 min acesa até ficar fraca)
  if (tochaOn) {
    luzTocha.position.set(avatar.position.x, avatar.position.y + 2.6, avatar.position.z);
    tochaCarga = Math.max(0.12, tochaCarga - dt / 240);
    luzTocha.intensity = 1.1 + tochaCarga * 2.3;
    luzTocha.distance = 10 + tochaCarga * 24;
  } else if (tochaCarga < 1) {
    tochaCarga = Math.min(1, tochaCarga + dt / 120);
  }
  if (pescandoAte > 0 && tempo > pescandoAte) resolvePesca(); // fisgada da pesca
  // corpos SEUS (mochila derrubada) expiram em 10 minutos
  for (let i = corposCaidos.length - 1; i >= 0; i--) {
    if (tempo > corposCaidos[i].expiraAt) {
      scene.remove(corposCaidos[i].mesh);
      const ix = interativos.indexOf(corposCaidos[i].it); if (ix >= 0) interativos.splice(ix, 1);
      corposCaidos.splice(i, 1);
    }
  }
  // corpos de bicho somem em 30s; respawn calibrado (rato 25s, boss 60s)
  for (const r of ratos) {
    if (r.corpse && tempo > r.despawnAt) { r.corpse = false; r.g.visible = false; r.respawnAt = tempo + (r.boss ? 60 : 25); }
    if (!r.vivo && !r.corpse && r.respawnAt && tempo > r.respawnAt) reviveBicho(r);
  }
  if (mixerDragao) mixerDragao.update(dt); // animação esquelética do dragão 3D (se o .glb existir)
  if (rede) rede.atualiza(dt);
  if (jogoIniciado) minimapa.atualiza(avatar, rede ? rede.outros : null);
  ceu.position.copy(camera.position); // céu sempre em volta da câmera (mundo grande)

}

// LOOP BLINDADO: uma exceção em qualquer sistema NÃO congela mais o jogo —
// o frame com problema é pulado, a RENDERIZAÇÃO continua sempre, e o erro
// aparece na tela pra gente saber exatamente o que corrigir.
let erroAvisado = false;
function loop() {
  try { passo(); } catch (e) {
    console.error('Erro no frame:', e);
    if (!erroAvisado) {
      erroAvisado = true;
      mostraMensagem('⚠️ Erro interno: ' + (e && e.message ? e.message : e) + ' — me mande um print disto!');
    }
  }
  try { if (composer) composer.render(); else renderer.render(scene, camera); } catch (e2) { /* nunca para de desenhar */ }
  requestAnimationFrame(loop);
}
window.addEventListener('error', (ev) => {
  console.error('Erro global:', ev.message);
  if (!erroAvisado) { erroAvisado = true; mostraMensagem('⚠️ Erro: ' + ev.message + ' — me mande um print!'); }
});
loop();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) composer.setSize(window.innerWidth, window.innerHeight);
});

window.__jogo = {
  THREE, scene, camera, renderer, controles, obstaculos, colide,
  get avatar() { return avatar; },
  get jogoIniciado() { return jogoIniciado; },
};

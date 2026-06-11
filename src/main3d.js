// =============================================================
//  ENTRADA 3D  ·  tela de seleção -> jogo em Venor.
//  Modo SELEÇÃO: boneco girando em preview + overlay de aparência.
//  Modo JOGO: movimento livre, câmera orbital, pular/correr/abaixar.
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from './config3d.js';
import { criaCidade } from './jogo/cidade.js';
import { alturaColinas } from './jogo/terreno.js';
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
import { criaEsgoto, criaCatacumbas, criaCriptaProfunda } from './jogo/esgoto.js';
import { criaAudio } from './jogo/audio.js';
import { criaRato, criaRatos, atualizaRatos, criaCobra, criaCrocodilo, criaTroll, criaCyclops, criaAranhaGigante, criaAranhaPequena, criaLadrao, criaEscorpiao, criaBeholder, criaDragao, criaLobo, criaUrso, criaEsqueleto, criaOrc, criaCaranguejo } from './jogo/ratos.js';
import { criaHUD } from './jogo/hud.js';
import { aplicaTexturaReal, defineRendererTexturas } from './jogo/construcoes.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

const container = document.getElementById('game');
// celular/tablet → modo leve (sem sombras, menos luz, menos pixels) p/ fluidez
const ehMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024);

// Se o navegador não conseguir iniciar o 3D (WebGL desligado / sem aceleração
// de hardware), mostra um aviso claro em vez de tela preta e muda.
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: !ehMobile,
    powerPreference: 'high-performance',
    precision: ehMobile ? 'mediump' : 'highp',
  });
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ehMobile ? 1.08 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = !ehMobile; // sombras só no PC (no celular pesa muito)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// qualidade de imagem: tonemapping cinematográfico + cor correta
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.84; // pastel premium (bloom 1.0 segura os estouros)
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);
defineRendererTexturas(renderer); // texturas IA sobem pra GPU no load (sem engasgo no 1º uso)
// SELO DE VERSÃO na tela: acabou a dúvida de "atualizou ou não?" —
// se o número daqui não bater com o do chat, é cache (Ctrl+Shift+R)
const VERSAO = 'RV5.2 (v37)';
{ // TÍTULO do Patch 1 na tela de entrada (some quando o jogo começa)
  const titulo = document.createElement('div');
  titulo.id = 'tituloVenor';
  titulo.innerHTML = 'VENOR'
    + '<div style="font-size:15px;letter-spacing:6px;color:#e8d9a0;margin-top:2px;">ERA DOS DRAGÕES</div>'
    + '<div style="font-size:11px;letter-spacing:2px;color:#9fb0c0;margin-top:6px;">— PATCH 1 —</div>';
  titulo.style.cssText = 'position:fixed;top:7%;left:50%;transform:translateX(-50%);z-index:36;'
    + 'font:bold 54px Georgia,serif;letter-spacing:10px;color:#f4e9c8;text-align:center;'
    + 'text-shadow:0 2px 6px #000,0 0 28px rgba(217,165,34,.45);pointer-events:none;';
  document.body.appendChild(titulo);
}
{
  const selo = document.createElement('div');
  selo.textContent = VERSAO;
  selo.style.cssText = 'position:fixed;bottom:4px;left:6px;z-index:90;font:bold 11px Arial;'
    + 'color:rgba(255,255,255,.45);text-shadow:0 1px 2px #000;pointer-events:none;';
  document.body.appendChild(selo);
}
renderer.domElement.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  mostraMensagem('⚠️ O 3D perdeu o contexto no aparelho. Recarregue a página; reduzi a carga mobile nesta versão.');
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  mostraMensagem('3D restaurado. Pode continuar jogando.');
});

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 900);

// === RENDERIZAÇÃO PREMIUM ===
// BLOOM (PC): lava, runas, tochas e olhos de monstro IRRADIAM luz de verdade.
// No mobile fica o caminho direto (fluidez primeiro).
let composer = null;

const { scene, ceu, hemi, sun, skyMat, lua, luaLuz, luaMat, estrelas, vagalumes, postes, obstaculos, solidos, aguas, nuvens, fonteGotas, ruas, marcos, animados, interativos, casas, lagos, montanhaDragao } = criaCidade();
scene.add(sun.target); // o alvo da sombra do sol acompanha o jogador (ver loop)
// liga o bloom na cena + ILUMINAÇÃO DE AMBIENTE (IBL): metais, vidros e água
// passam a refletir o entorno — o salto de "protótipo" pra "premium"
if (!ehMobile) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Bloom contido: só emissores reais devem atravessar o threshold.
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.16, 0.32, 1.08));
  // COLOR GRADING CINEMATOGRÁFICO (PC) — receita das referências premium:
  // S-curve fílmica (contraste com pivô, clamp = NUNCA estoura branco),
  // saturação +12%, split-tone (sombras frias / altas levemente quentes),
  // VINHETA de cinema e dither anti-banding no céu/neblina.
  composer.addPass(new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; uniform sampler2D tDiffuse;\n'
      + 'void main(){\n'
      + '  vec4 c = texture2D(tDiffuse, vUv);\n'
      + '  vec3 col = c.rgb;\n'
      + '  col = clamp((col - 0.5) * 1.09 + 0.506, 0.0, 1.0);\n'                                  // S-curve fílmica leve
      + '  float luma = dot(col, vec3(0.299, 0.587, 0.114));\n'
      + '  col = mix(vec3(luma), col, 1.12);\n'                                                    // saturação
      + '  col += vec3(0.012, 0.014, 0.030) * (1.0 - smoothstep(vec3(0.0), vec3(0.4), col));\n'    // sombras frias
      + '  col = mix(col, col * vec3(1.045, 1.0, 0.94), smoothstep(0.55, 1.0, luma) * 0.45);\n'    // altas quentes
      + '  col = clamp(col, 0.0, 1.0);\n'
      + '  float d = distance(vUv, vec2(0.5));\n'
      + '  col *= 1.0 - 0.22 * smoothstep(0.38, 0.80, d);\n'                                       // vinheta de cinema
      + '  col += (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\n'     // dither anti-banding
      + '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);\n'
      + '}',
  }));
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.18; // reflexo sutil; sem clarear rostos/grama
}
// ALTURA DO TERRENO: colinas procedurais no campo (terreno.js — a malha do
// chão usa a MESMA função, nada flutua) + Montanha do Dragão (rampa cônica
// escalável até o platô). O avatar "gruda" nessa altura ao andar.
function alturaTerreno(x, z) {
  const r = Math.hypot(x - montanhaDragao.x, z - montanhaDragao.z);
  if (r < montanhaDragao.r) {
    if (r <= montanhaDragao.topo) return montanhaDragao.h;
    return montanhaDragao.h * (1 - (r - montanhaDragao.topo) / (montanhaDragao.r - montanhaDragao.topo));
  }
  return alturaColinas(x, z);
}
const raycaster = new THREE.Raycaster();
// ⚠️ FIX DA "TELA TRAVADA": Sprite.raycast LÊ raycaster.camera.matrixWorld.
// Sem a câmera setada, qualquer sprite (marcador 🏠/🚪 das casas entráveis)
// perto do jogador estourava "matrixWorld null" TODO FRAME na anti-oclusão —
// o passo() morria antes da câmera (boneco andava, tela parada).
raycaster.camera = camera;
const occTmp = []; // buffer reutilizado da anti-oclusão (zero alocação por frame)
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
  if (noEsgoto) { // subsolo (esgoto OU catacumbas): lista pequena, varre direto
    for (const o of subsoloAtual.colisores) {
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
  if (y < -10) { // bichos do subsolo: esgoto E catacumbas (regiões disjuntas)
    for (const o of esgoto.colisores) {
      if (x > o.minX - 0.5 && x < o.maxX + 0.5 && z > o.minZ - 0.5 && z < o.maxZ + 0.5) return false;
    }
    for (const o of catacumbas.colisores) {
      if (x > o.minX - 0.5 && x < o.maxX + 0.5 && z > o.minZ - 0.5 && z < o.maxZ + 0.5) return false;
    }
    for (const o of criptaProfunda.colisores) {
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
// CATACUMBAS DE VENORE (RV4.4): segundo subsolo, sob a Catedral.
// `subsoloAtual` diz em qual andar-de-baixo o jogador está (colisão/saídas).
const catacumbas = criaCatacumbas(); scene.add(catacumbas.grupo);
catacumbas.grupo.visible = false;
// CRIPTA PROFUNDA (RV4.7): o cofre dos reis, 2º andar abaixo do trono (y=-80)
const criptaProfunda = criaCriptaProfunda(); scene.add(criptaProfunda.grupo);
criptaProfunda.grupo.visible = false;
{ // boca da descida (marca escura no chão da câmara do trono)
  const buraco = new THREE.Mesh(new THREE.CircleGeometry(1.1, 14), new THREE.MeshBasicMaterial({ color: 0x05050a }));
  buraco.rotation.x = -Math.PI / 2; buraco.position.set(-344, -39.97, -16);
  catacumbas.grupo.add(buraco);
}
let subsoloAtual = esgoto;
// SOM sintetizado (RV4.8): efeitos + ambiente dia/noite, botão 🔊
const sons = criaAudio();
sons.defineNoite(() => ehNoite && !noEsgoto);
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
[[150, 30], [185, -25], [215, 45], [250, 10]].forEach(([x, z]) => addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 14), { especie: 'troll' }));
[[245, -20], [285, 30]].forEach(([x, z]) => addMonstro(criaCyclops(x, z), 150, 60, 18, 1.3, true, areaMon(x, z, 16), { especie: 'ciclope' })); // GIGANTES de um olho
// GIANT SPIDER (Tibia): ENORME, feroz, RÁPIDA (3.2 — corre atrás!), difícil
// de matar (300hp) e CRIA FILHOTES durante a caça (mecânica no loop)
const aX = 170, aZ = 95;
const aranhaMae = addMonstro(criaAranhaGigante(aX, aZ), 300, 150, 20, 3.2, true, areaMon(aX, aZ, 22), { veneno: true, especie: 'aranha', lootEspecial: { nome: 'Seda de Aranha', icone: '🕸️' } });
[[aX - 5, aZ + 4], [aX + 6, aZ - 3], [aX - 3, aZ - 6], [aX + 4, aZ + 6]].forEach(([x, z]) => addMonstro(criaAranhaPequena(x, z), 10, 3, 3, 2.8, false, areaMon(aX, aZ, 22), { veneno: true, filhote: true, especie: 'aranhaPequena' }));
[[160, 8], [205, -10], [235, 18]].forEach(([x, z]) => addMonstro(criaLadrao(x, z), 30, 12, 7, 2.2, false, areaMon(x, z, 16), { especie: 'ladrao' }));
[[140, -32], [185, 42], [225, -38]].forEach(([x, z]) => addMonstro(criaEscorpiao(x, z), 18, 6, 5, 2.0, false, areaMon(x, z, 14), { veneno: true, especie: 'escorpiao' }));
// BEHOLDERS (agora GRANDES e imponentes) no Vale dos Monstros — ATIRAM
// rajadas mágicas que vêm na sua direção (dá pra esquivar correndo!)
[[255, 95], [175, 120], [300, 70]].forEach(([x, z]) => {
  ratos.push({ g: criaBeholder(x, z), hp: 170, hpMax: 170, xp: 80, dano: 12, vel: 1.3, forte: true, bounds: areaMon(x, z, 18), y0: 0, alvo: { x, z }, pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0, lootEspecial: { nome: 'Olho do Beholder', icone: '👁️' }, especie: 'beholder', atira: 'magia', alcanceTiro: 18, danoTiro: 12, cadencia: 2.6 });
});
// DRAGÃO (chefão D&D) guardando o Covil do Dragão, ao norte — muito forte, loot lendário
// DRAGÃO VERDE (estilo Tibia) no TOPO da Montanha do Dragão — suba a rampa pra
// enfrentá-lo. De tempos em tempos ele VOA sobre Venore atrás de comida.
const DRX = montanhaDragao.x, DRZ = montanhaDragao.z, DRY = montanhaDragao.h;
const dragao = { g: criaDragao(DRX, DRZ), hp: 220, hpMax: 220, xp: 120, dano: 22, vel: 1.6, forte: true, boss: true, dragao: true, lord: false, especie: 'dragao', bounds: areaMon(DRX, DRZ, montanhaDragao.topo - 1), y0: DRY, alvo: { x: DRX, z: DRZ }, pausa: Math.random() * 2, tempo: 0, vivo: true, piscar: 0, lootEspecial: { nome: 'Escama de Dragão', icone: '🐲' }, atira: 'fogo', alcanceTiro: 16, danoTiro: 18, cadencia: 4, tiroAltura: 10.5 };
dragao.g.position.y = DRY;
ratos.push(dragao);
const vooDragao = { ativo: false, t: 0, proximo: 45 + Math.random() * 50 }; // 1º voo logo no começo (pra você ver!)
// DRAGÃO 3D PROFISSIONAL (opcional): se existir o arquivo
// public/modelos/dragao.glb (ex.: "Dragon Evolved" do Quaternius, CC0,
// baixável em poly.pizza/m/LlwD0QNUPj), ele SUBSTITUI o dragão de blocos
// automaticamente — com animação esquelética de verdade.
let mixerDragao = null, modeloDragaoGLB = null;
// ANIMAÇÃO VIVA dos dragões GLB: o modelo veio sem clipes, então animamos os
// OSSOS direto (cabeça olha em volta, cauda balança, asas tremem); se o
// esqueleto não tiver nomes reconhecíveis, o corpo "respira" (escala sutil)
const dragoesVivos = [];
function achaOssos(modelo) {
  const ossos = { cabeca: null, cauda: [], asas: [] };
  modelo.traverse((o) => {
    if (!o.isBone) return;
    const n = (o.name || '').toLowerCase();
    if (!ossos.cabeca && /head|neck|cabeca|pescoco/.test(n)) ossos.cabeca = o;
    if (/tail|cauda/.test(n)) ossos.cauda.push(o);
    if (/wing|asa/.test(n)) ossos.asas.push(o);
  });
  return ossos;
}
function registraDragaoVivo(modelo) {
  dragoesVivos.push({ ossos: achaOssos(modelo), raiz: modelo, fase: Math.random() * 6, escalaBase: modelo.scale.y });
}
// veste o modelo GLB no grupo do dragão (também usado no RESPAWN/Dragon Lord)
function aplicaModeloDragao() {
  if (!modeloDragaoGLB) return;
  while (dragao.g.children.length) dragao.g.remove(dragao.g.children[0]); // tira as peças blocky
  dragao.g.add(modeloDragaoGLB);
  dragao.g.userData = { tipo: 'boss' }; // sem corpoMat (os guards cuidam do "piscar")
  // Dragon LORD = brasas na pele; verde = normal
  modeloDragaoGLB.traverse((o) => {
    if (o.isMesh && o.material && o.material.emissive) o.material.emissive.setHex(dragao.lord ? 0x6a1408 : 0x000000);
  });
}
new GLTFLoader().load('modelos/dragao.glb', (gltf) => {
  const modelo = gltf.scene;
  // AUTO-ESCALA: mede o modelo (cada GLB vem num tamanho) e escala pra
  // porte de CHEFE (~12u), assentado no chão e centralizado
  const cx1 = new THREE.Box3().setFromObject(modelo);
  const tam = new THREE.Vector3(); cx1.getSize(tam);
  const s = 12 / (Math.max(tam.x, tam.y, tam.z) || 1);
  modelo.scale.setScalar(s);
  const cx2 = new THREE.Box3().setFromObject(modelo);
  const centro = new THREE.Vector3(); cx2.getCenter(centro);
  modelo.position.x -= centro.x; modelo.position.z -= centro.z;
  modelo.position.y -= cx2.min.y;
  modelo.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.frustumCulled = false; // skinned some com culling errado
      o.raycast = () => {};    // FORA do raycast: osso nulo do GLB quebrava o clique ("matrixWorld" null)
    }
  });
  modeloDragaoGLB = modelo;
  aplicaModeloDragao();
  registraDragaoVivo(modelo); // cabeça/cauda ganham vida no loop
  if (gltf.animations && gltf.animations.length) {
    mixerDragao = new THREE.AnimationMixer(modelo);
    const anim = gltf.animations.find((a) => /idle|fly/i.test(a.name)) || gltf.animations[0];
    mixerDragao.clipAction(anim).play();
  }
  mostraMensagem('🐲 Dragão 3D profissional carregado!');
}, undefined, () => { /* sem arquivo: segue o dragão padrão */ });

// DRAGÕES REGIONAIS (dragao2.glb): um AZULADO perto de Thais ("Dragão Ancião")
// e um verde-natural perto de Venore — guardam território no chão (sem voo).
new GLTFLoader().load('modelos/dragao2.glb', (gltf) => {
  const base = gltf.scene;
  const cb1 = new THREE.Box3().setFromObject(base);
  const tamB = new THREE.Vector3(); cb1.getSize(tamB);
  base.scale.setScalar(10 / (Math.max(tamB.x, tamB.y, tamB.z) || 1));
  const cb2 = new THREE.Box3().setFromObject(base);
  const centroB = new THREE.Vector3(); cb2.getCenter(centroB);
  base.position.x -= centroB.x; base.position.z -= centroB.z;
  base.position.y -= cb2.min.y;
  [
    { x: 470, z: 70, tinta: 0x2a4a8a, nomeMsg: '🐲 Um Dragão Ancião azulado guarda os arredores de Thais...' },
    { x: -70, z: 132, tinta: null, nomeMsg: '🐲 Um dragão ronda as colinas ao norte de Venore!' },
  ].forEach(({ x, z, tinta, nomeMsg }) => {
    const inst = cloneSkinned(base);
    inst.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true; o.frustumCulled = false;
        o.raycast = () => {}; // mesmo guard do matrixWorld
        if (tinta && o.material) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(tinta), 0.45); }
      }
    });
    const g = new THREE.Group(); g.position.set(x, 0, z); g.add(inst);
    g.userData = { tipo: 'boss' };
    ratos.push({ g, hp: 220, hpMax: 220, xp: 120, dano: 22, vel: 1.5, forte: true, boss: true, especie: 'dragao', bounds: areaMon(x, z, 14), y0: 0, alvo: { x, z }, pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0, lootEspecial: { nome: 'Escama de Dragão', icone: '🐲' }, atira: 'fogo', alcanceTiro: 15, danoTiro: 18, cadencia: 4.5, tiroAltura: 6.5 });
    scene.add(g);
    registraDragaoVivo(inst); // idle vivo também nos regionais
  });
  mostraMensagem('🐲 Dragões regionais chegaram (Thais e Venore)!');
}, undefined, () => {});

// =============================================================
//  MODELOS 3D DE MONSTROS (genérico — mesmo padrão do dragão):
//  solte um .glb em public/modelos/ com o nome da espécie e o bicho
//  TROCA DE VISUAL sozinho (auto-escala, sombra, sem raycast).
//  Nomes: aranha.glb, lobo.glb, urso.glb, esqueleto.glb, orc.glb,
//  ciclope.glb, troll.glb, beholder.glb, rato.glb, caranguejo.glb,
//  escorpiao.glb, ladrao.glb, cobra.glb
// =============================================================
const MODELOS_MONSTROS = [
  { arquivo: 'aranha', especie: 'aranha', tam: 7 },
  { arquivo: 'aranha', especie: 'aranhaPequena', tam: 2.2 },
  { arquivo: 'lobo', especie: 'lobo', tam: 2.6 },
  { arquivo: 'urso', especie: 'urso', tam: 3.8 },
  { arquivo: 'esqueleto', especie: 'esqueleto', tam: 3.2 },
  { arquivo: 'orc', especie: 'orc', tam: 3.4 },
  { arquivo: 'ciclope', especie: 'ciclope', tam: 7.5 },
  { arquivo: 'troll', especie: 'troll', tam: 3 },
  { arquivo: 'beholder', especie: 'beholder', tam: 6 },
  { arquivo: 'rato', especie: 'rato', tam: 1.3 },
  { arquivo: 'caranguejo', especie: 'caranguejo', tam: 1.5 },
  { arquivo: 'escorpiao', especie: 'escorpiao', tam: 2 },
  { arquivo: 'ladrao', especie: 'ladrao', tam: 3.1 },
  { arquivo: 'cobra', especie: 'cobra', tam: 2.6 },
];
const baseGLBPorEspecie = {}; // espécie -> base pronta (spawns novos também vestem)
function preparaBaseGLB(gltf, tam) {
  const base = gltf.scene;
  const b1 = new THREE.Box3().setFromObject(base);
  const tb = new THREE.Vector3(); b1.getSize(tb);
  base.scale.setScalar(tam / (Math.max(tb.x, tb.y, tb.z) || 1));
  const b2 = new THREE.Box3().setFromObject(base);
  const cc = new THREE.Vector3(); b2.getCenter(cc);
  base.position.x -= cc.x; base.position.z -= cc.z; base.position.y -= b2.min.y;
  base.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; o.raycast = () => {}; } });
  return base;
}
function aplicaGLBEm(r) { // veste o modelo da espécie num bicho (spawn novo incluso)
  const base = baseGLBPorEspecie[r.especie];
  if (!base) return false;
  const inst = cloneSkinned(base);
  // o .clone() NÃO carrega o override de raycast — re-blinda o clone novo
  inst.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; o.raycast = () => {}; } });
  const tipoAntigo = (r.g.userData && r.g.userData.tipo) || 'monstro';
  while (r.g.children.length) r.g.remove(r.g.children[0]);
  r.g.add(inst);
  r.g.userData = { tipo: tipoAntigo };
  return true;
}
MODELOS_MONSTROS.forEach(({ arquivo, especie, tam }) => {
  new GLTFLoader().load(`modelos/${arquivo}.glb`, (gltf) => {
    baseGLBPorEspecie[especie] = preparaBaseGLB(gltf, tam);
    let n = 0;
    for (const r of ratos) { if (r.especie === especie && aplicaGLBEm(r)) n++; }
    if (n) mostraMensagem(`✨ Modelo 3D aplicado: ${especie} (${n} bicho${n > 1 ? 's' : ''})`);
  }, undefined, () => { /* sem arquivo: visual procedural continua */ });
});
// FAUNA DO CAMINHO (cada região com seus bichos, estilo Tibia)
// matilha de lobos rondando a ponte do rio + lobos na floresta oeste
[[170, 14], [191, 16], [188, -18], [-96, 26]].forEach(([x, z]) => addMonstro(criaLobo(x, z), 20, 7, 5, 2.6, false, areaMon(x, z, 15), { especie: 'lobo' }));
// ursos na floresta e no sopé das montanhas (fortes)
[[-104, 42], [72, 192]].forEach(([x, z]) => addMonstro(criaUrso(x, z), 55, 18, 11, 1.7, true, areaMon(x, z, 14), { especie: 'urso' }));
// esqueletos no cemitério abandonado (saem da cova...)
[[124, -56], [136, -64], [128, -67], [138, -55]].forEach(([x, z]) => addMonstro(criaEsqueleto(x, z), 30, 12, 7, 1.8, false, areaMon(130, -60, 14), { especie: 'esqueleto' }));
// orcs guardando as ruínas (norte e sudoeste)
[[146, 246], [156, 254]].forEach(([x, z]) => addMonstro(criaOrc(x, z), 35, 14, 8, 2.1, false, areaMon(150, 250, 14), { especie: 'orc' }));
[[-184, -86], [-176, -94], [-180, -98]].forEach(([x, z]) => addMonstro(criaOrc(x, z), 35, 14, 8, 2.1, false, areaMon(-180, -90, 14), { especie: 'orc' }));
// cobras na lama do Pântano da Serpente
[[220, -90], [230, -100], [214, -102]].forEach(([x, z]) => {
  const c = criaCobra(x, z); c.position.y = 0; // a cobra nasce no esgoto (y=-40); aqui vive na superfície
  addMonstro(c, 28, 10, 8, 1.5, false, areaMon(225, -95, 16), { veneno: true, especie: 'cobra' });
});
// mais ladrões no acampamento bandido (além dos que já rondam a estrada)
[[248, 46], [256, 52]].forEach(([x, z]) => addMonstro(criaLadrao(x, z), 30, 12, 7, 2.2, false, areaMon(252, 48, 14), { especie: 'ladrao' }));
// SEGUNDA METADE da viagem (depois do rio): mais selvagem e perigosa
[[340, 25], [390, -18], [455, 22]].forEach(([x, z]) => addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 14), { especie: 'troll' }));
[[396, -66], [404, -74], [430, 28]].forEach(([x, z]) => addMonstro(criaOrc(x, z), 35, 14, 8, 2.1, false, areaMon(x, z, 14), { especie: 'orc' }));
[[300, 20], [470, -20], [476, -14]].forEach(([x, z]) => addMonstro(criaLobo(x, z), 20, 7, 5, 2.6, false, areaMon(x, z, 15), { especie: 'lobo' }));
[[360, -30], [490, 30]].forEach(([x, z]) => addMonstro(criaEscorpiao(x, z), 18, 6, 5, 2.0, false, areaMon(x, z, 14)));
addMonstro(criaCyclops(415, 50), 150, 60, 18, 1.3, true, areaMon(415, 50, 16), { especie: 'ciclope' }); // ciclope da mata fechada
// caranguejos na Praia do Sul (fraquinhos — primeiro alvo de quem chega)
[[-30, -225], [20, -230], [60, -218], [-85, -228], [110, -222]].forEach(([x, z]) => addMonstro(criaCaranguejo(x, z), 12, 4, 3, 2.2, false, areaMon(x, z, 13), { especie: 'caranguejo' }));
// BREJO PROFUNDO (RV4.1): o covil ao sul de Venore — cobras venenosas e trolls
[[-276, -122], [-288, -132], [-264, -118], [-296, -114]].forEach(([x, z]) => {
  const c = criaCobra(x, z); c.position.y = 0;
  addMonstro(c, 28, 10, 8, 1.5, false, areaMon(-278, -124, 18), { veneno: true, especie: 'cobra' });
});
[[-252, -134], [-304, -124]].forEach(([x, z]) => addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 13), { especie: 'troll' }));
// FORTE DOS ORCS (RV5.2): as Ruínas da Estrada têm dono — caça de ELITE
// pra quem já tem nível: veteranos fortes + o SENHOR DA GUERRA no comando
[[392, -78], [408, -62], [414, -76]].forEach(([x, z]) => {
  const vet = criaOrc(x, z); vet.scale.setScalar(1.15);
  addMonstro(vet, 60, 24, 16, 2.0, true, areaMon(403, -70, 14), { especie: 'orc' });
});
{
  const warlord = criaOrc(403, -72); warlord.scale.setScalar(1.5);
  addMonstro(warlord, 400, 120, 26, 1.6, true, areaMon(403, -70, 12), {
    boss: true, especie: 'orcWarlord',
    lootEspecial: { nome: 'Estandarte Orc', icone: '🚩' },
  });
}
// CATACUMBAS DE VENORE (RV4.4): esqueletos guardam as tumbas (y = -40)
[[-318, -18], [-330, -2], [-342, -16], [-312, -4]].forEach(([x, z]) => {
  const e = criaEsqueleto(x, z); e.position.y = -40;
  addMonstro(e, 34, 14, 8, 1.8, false, areaMon(x, z, 11), { especie: 'esqueleto', y0: -40 });
});
// NINHO DAS ARANHAS (RV4.6): a Tecelã e as crias na Floresta do Oeste
[[-148, -62], [-141, -68], [-152, -70]].forEach(([x, z]) => addMonstro(criaAranhaPequena(x, z), 12, 4, 4, 2.6, false, areaMon(-146, -66, 13), { veneno: true, especie: 'aranhaPequena' }));
{
  const tecela = criaAranhaGigante(-146, -67); tecela.scale.setScalar(0.8);
  addMonstro(tecela, 180, 55, 14, 2.6, true, areaMon(-146, -66, 12), { veneno: true, especie: 'aranha', lootEspecial: { nome: 'Seda de Aranha', icone: '🕸️' } });
}
{ // REI ESQUELETO: boss do trono — dropa a COROA ANTIGA (vale 250🪙)
  const rei = criaEsqueleto(-350, -10); rei.position.y = -40; rei.scale.setScalar(1.75);
  addMonstro(rei, 320, 90, 24, 1.4, true, areaMon(-348, -10, 11), {
    boss: true, especie: 'reiEsqueleto', y0: -40,
    lootEspecial: { nome: 'Coroa Antiga', icone: '👑' },
  });
}
// CRIPTA PROFUNDA (RV4.7): os Ancestrais guardam o tesouro (y = -80)
[[-352, -6], [-340, -16]].forEach(([x, z]) => {
  const anc = criaEsqueleto(x, z); anc.position.y = -80; anc.scale.setScalar(1.3);
  addMonstro(anc, 80, 30, 14, 1.7, true, areaMon(-346, -10, 12), { especie: 'esqueleto', y0: -80 });
});
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
const coresJogador = { casaco: 0x556b2f, pele: 0xe0b088, cabelo: 0x3a2c20, sexo: 'homem', tipo: 'cavaleiro' };
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

// PETS estilo Tibia: você começa SEM companheiro — eles vivem SELVAGENS pelo
// mundo e cada um é DOMADO com um item específico (quanto mais raro, mais difícil)
let gato = null;
const petsDomados = []; // espécies já domadas (vai pro save)

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
// LOJAS identificadas (estilo Tibia): ícone no MINIMAPA + marcador flutuante na cena
const LOJAS_MAPA = [
  { x: 17, z: 11, icone: '💰' },   // Otto (mercador — compra tudo)
  { x: -17, z: 11, icone: '⚒️' },  // Bram (forja: armas; compra couro/osso/presas)
  { x: -22, z: 17, icone: '✨' },  // Eldra (runas; compra erva/frasco/relíquias)
  { x: 22, z: -15, icone: '🏹' },  // Falk (arco & flecha; compra couro/seda)
  { x: 32, z: 0, icone: '🧪' },    // Sira (poções, dentro do hospital; compra ervas)
  { x: 552, z: 10, icone: '💰' },  // Yara (mercadora de Thais)
];
const minimapa = criaMinimapa({ obstaculos, ruas, marcos, lugares: LUGARES_MAPA, lojas: LOJAS_MAPA, alcance: 90 });
LOJAS_MAPA.forEach((L) => { // marcador flutuante em cima de cada loja
  const cnvL = document.createElement('canvas'); cnvL.width = 128; cnvL.height = 128;
  const cL = cnvL.getContext('2d'); cL.font = '88px Arial'; cL.textAlign = 'center'; cL.textBaseline = 'middle'; cL.fillText(L.icone, 64, 70);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnvL), transparent: true, depthTest: false }));
  sp.scale.set(1.9, 1.9, 1); sp.position.set(L.x, 5.4, L.z); sp.renderOrder = 996; scene.add(sp);
});
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
let petTipo = null;
function trocaPet(tipo) {
  if (!PETS[tipo] || tipo === petTipo) return;
  if (!petsDomados.includes(tipo)) { mostraMensagem('🐾 Você ainda não domou esse bicho — encontre-o no mundo!'); return; }
  const pos = gato ? gato.position.clone() : avatar.position.clone().add(new THREE.Vector3(2, 0, 2));
  if (gato) scene.remove(gato);
  gato = PETS[tipo]();
  gato.position.copy(pos);
  gato.userData.tipo = 'pet';
  scene.add(gato);
  petTipo = tipo;
}

// === PETS SELVAGENS DOMÁVEIS (estilo Tibia: cada um tem seu ITEM de domar;
// quanto mais rara a montaria, mais difícil — do gato ao FILHOTE DE DRAGÃO)
const DOMAVEIS = [
  { tipo: 'gato', nome: 'Gato', emoji: '🐱', x: 10, z: 18, item: 'Lambari', chance: 0.7, dica: 'pesque um Lambari' },
  { tipo: 'cachorro', nome: 'Cachorro', emoji: '🐶', x: 8, z: -92, item: 'Osso', chance: 0.7, dica: 'ossos caem da caça' },
  { tipo: 'coelho', nome: 'Coelho', emoji: '🐰', x: 97, z: 52, item: 'Cenoura', chance: 0.6, dica: 'cenouras crescem na fazenda' },
  { tipo: 'lobo', nome: 'Lobo', emoji: '🐺', x: -98, z: 12, item: 'Carne', chance: 0.5, dica: 'carne cai da caça' },
  { tipo: 'burro', nome: 'Burro', emoji: '🐴', x: 117, z: 44, item: 'Cenoura', chance: 0.5, dica: 'cenouras da fazenda' },
  { tipo: 'dragaozinho', nome: 'Filhote de Dragão', emoji: '🐲', x: 104, z: 308, y: 34, item: 'Escama de Dragão', chance: 0.3, dica: 'derrote o dragão do pico' },
];
const domaveisVivos = [];
DOMAVEIS.forEach((d) => {
  if (!PETS[d.tipo]) return;
  const g = PETS[d.tipo]();
  g.position.set(d.x, d.y || alturaTerreno(d.x, d.z), d.z);
  scene.add(g);
  // crachá discreto (a pata gigante "roxa" na praça era feia): bolinha escura
  // translúcida com borda branca e a pata menor dentro, flutuando mais alto
  const cnvD = document.createElement('canvas'); cnvD.width = 128; cnvD.height = 128;
  const cD = cnvD.getContext('2d');
  cD.beginPath(); cD.arc(64, 64, 50, 0, Math.PI * 2); cD.fillStyle = 'rgba(22,28,38,.6)'; cD.fill();
  cD.lineWidth = 5; cD.strokeStyle = 'rgba(255,255,255,.85)'; cD.stroke();
  cD.font = '58px Arial'; cD.textAlign = 'center'; cD.textBaseline = 'middle'; cD.fillText('🐾', 64, 68);
  const spD = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnvD), transparent: true, depthTest: false }));
  spD.scale.set(0.62, 0.62, 1); spD.position.y = 2.3; spD.renderOrder = 996; g.add(spD);
  domaveisVivos.push({ ...d, g, base: { x: d.x, z: d.z }, alvo: { x: d.x, z: d.z }, pausa: Math.random() * 3, fase: Math.random() * 6 });
});
function domavelProximo() {
  for (const d of domaveisVivos) {
    if (Math.abs((d.y || 0) - avatar.position.y) > 6) continue;
    if (Math.hypot(d.g.position.x - avatar.position.x, d.g.position.z - avatar.position.z) < 2.8) return d;
  }
  return null;
}
function tentaDomar(d) {
  if (!inventario.temItem(d.item)) { mostraMensagem(`🐾 O ${d.nome} quer ${d.item}! (${d.dica})`); return; }
  inventario.consomeItem(d.item);
  if (Math.random() < d.chance) { // domou!
    petsDomados.push(d.tipo);
    scene.remove(d.g);
    domaveisVivos.splice(domaveisVivos.indexOf(d), 1);
    trocaPet(d.tipo);
    mostraMensagem(`✨ Você DOMOU o ${d.nome}! ${d.emoji} Ele agora te segue. (clique em você pra trocar de pet)`);
    salvaJogo();
  } else {
    mostraMensagem(`💨 O ${d.nome} comeu ${d.item} e escapuliu... tente de novo!`);
  }
}

// === MONTARIA + PET DE COMBATE (estilo Tibia: cada raça tem seu papel) ===
// Montar: clique no SEU pet ou tecla M — velocidade por raça; o pet vira a
// "sela" embaixo do avatar. Lutar: o pet corre pro bicho que VOCÊ atacou e
// morde junto (dano por raça). Desmonta ao descer no esgoto e ao morrer.
const MONTARIA_VEL = { gato: 1.25, coelho: 1.35, cachorro: 1.45, lobo: 1.7, burro: 1.85, dragaozinho: 2.0 };
const MONTARIA_SELA = { gato: 0.5, coelho: 0.45, cachorro: 0.6, lobo: 0.8, burro: 1.25, dragaozinho: 0.9 };
const PET_DANO = { gato: 2, coelho: 1, cachorro: 3, lobo: 5, burro: 4, dragaozinho: 8 };
const PET_NOMES = { gato: 'Gato', cachorro: 'Cachorro', coelho: 'Coelho', lobo: 'Lobo', burro: 'Burro', dragaozinho: 'Filhote de Dragão' };
let montado = false;
let petAlvo = null, petProxMordida = 0;
function montaOuDesmonta() {
  if (!gato) { mostraMensagem('🐾 Você precisa DOMAR um bicho primeiro (procure os crachás 🐾 pelo mundo).'); return; }
  if (noEsgoto) { mostraMensagem('Aqui embaixo não dá pra montar. 🪢'); return; }
  montado = !montado;
  if (montado) {
    petAlvo = null;
    const fator = MONTARIA_VEL[petTipo] || 1.3;
    mostraMensagem(`🏇 Montou no ${PET_NOMES[petTipo] || petTipo}! Velocidade ×${fator} — clique nele (ou tecla M) pra descer.`);
  } else {
    mostraMensagem('Você desmontou. 🐾');
  }
}
window.addEventListener('keydown', (e) => { if (e.code === 'KeyM' && jogoIniciado && !morto && !dialogo.aberto) montaOuDesmonta(); });

// === QUESTS (estilo Tibia: fale com o NPC, cumpra, volte pra recompensa) ===
const QUESTS = [
  { id: 'lobosPonte', npc: 'Bruno', tipo: 'matar', especie: 'lobo', meta: 4,
    titulo: 'Lobos da Ponte', pede: 'Os lobos rondam a Ponte de Pedra e ninguém cruza em paz. Cace 4 lobos e a estrada agradece.',
    fala: 'E aí, deu conta dos lobos?', recompensa: { ouro: 40, xp: 30 } },
  { id: 'cenourasGil', npc: 'Gil', tipo: 'coletar', item: 'Cenoura', meta: 3,
    titulo: 'Colheita do Gil', pede: 'O burro comeu metade da minha colheita! Me traga 3 Cenouras que eu pago bem.',
    fala: 'Trouxe minhas cenouras?', recompensa: { ouro: 25, xp: 15, item: { nome: 'Poção de Vida', icone: '🧪', usavel: 'pocao' } } },
  { id: 'esqueletosTobias', npc: 'Tobias', tipo: 'matar', especie: 'esqueleto', meta: 3,
    titulo: 'Descanso dos Mortos', pede: 'O cemitério da estrada anda agitado... Devolva 3 esqueletos ao descanso e os deuses recompensarão.',
    fala: 'Os mortos já descansam?', recompensa: { ouro: 60, xp: 50 } },
  // RV5.2: o caçador de Thais quer a cabeça do Senhor da Guerra
  { id: 'senhorGuerra', npc: 'Khan', tipo: 'matar', especie: 'orcWarlord', meta: 1,
    titulo: 'O Senhor da Guerra', pede: 'Os orcs das Ruínas da Estrada ganharam um COMANDANTE — e comandante junta exército. Derrube o Senhor da Guerra antes que ele marche sobre Thais.',
    fala: 'O estandarte deles ainda tremula?', recompensa: { ouro: 140, xp: 100 } },
  // RV4.6: o arqueiro do vilarejo precisa de seda pro arco
  { id: 'sedaFalk', npc: 'Falk', tipo: 'coletar', item: 'Seda de Aranha', meta: 3,
    titulo: 'Cordas de Seda', pede: 'O Ninho das Aranhas, na Floresta do Oeste, tem a melhor seda do reino. Traga 3 Sedas de Aranha — corda de arco boa não se faz sozinha.',
    fala: 'Conseguiu minha seda?', recompensa: { ouro: 45, xp: 35 } },
  // RV4.4: a sacerdotisa quer paz nas catacumbas sob a Catedral
  { id: 'pazCatacumbas', npc: 'Hela', tipo: 'matar', especie: 'reiEsqueleto', meta: 1,
    titulo: 'Paz nas Catacumbas', pede: 'Algo acordou sob a Catedral... O REI ESQUELETO senta num trono entre as tumbas. Devolva-o ao descanso (a descida fica na cripta atrás da Catedral).',
    fala: 'O rei voltou a dormir?', recompensa: { ouro: 120, xp: 80, item: { nome: 'Amuleto Sagrado', icone: '📿', slot: 'colar', defesa: 5 } } },
  // RV5.1: o PET DA PROFECIA — cadeia da Hela (liga o Fragmento Profético aos ovos do Pico)
  { id: 'guardiaoOvo', npc: 'Hela', requer: 'pazCatacumbas', tipo: 'coletar', item: 'Escama de Dragão', meta: 1,
    titulo: 'O Guardião do Ovo', pede: 'Você leu o Fragmento das Ruínas? "Três ovos ao calor da lava..." Pois um deles CHOCOU — e o filhote não pode cair em mãos erradas. Traga-me 1 Escama de Dragão como prova de força, e ele será SEU pra criar.',
    fala: 'Trouxe a escama? O filhote não para quieto...', recompensa: { ouro: 0, xp: 120, pet: 'dragaozinho' } },
  // RV4.1: limpeza do Brejo Profundo (a Capitã de Venore paga bem)
  { id: 'brejoMara', npc: 'Capitã Mara', tipo: 'matar', especie: 'cobra', meta: 3,
    titulo: 'Limpeza do Brejo', pede: 'O Brejo Profundo, ao sul do porto, está infestado de cobras venenosas. Mate 3 e Venore te paga como soldado.',
    fala: 'O brejo já está mais limpo?', recompensa: { ouro: 50, xp: 40 } },
  // RV3.0: a QUEST ÉPICA do tema — derrote um DRAGÃO de verdade
  { id: 'cacaDragao', npc: 'Dorian', tipo: 'matar', especie: 'dragao', meta: 1,
    titulo: 'A Caça ao Dragão', pede: 'Os dragões voltaram a dominar estas terras — o do Pico cospe fogo até sobre Venore. Derrote UM dragão e Thais te honrará com o ELMO DO DRAGÃO.',
    fala: 'O dragão ainda voa?', recompensa: { ouro: 150, xp: 100, item: { nome: 'Elmo do Dragão', icone: '🐲', slot: 'cabeca', defesa: 6 } } },
];
const questEstado = {}; // id -> { aceita, prog, feita } (vai no save)
// GUILDA DE VENORE (RV4.2): 2 dragões abatidos = entrada + Manto da Guilda
let dragoesMortos = 0, guildaMembro = false;
const contaItem = (nome) => (inventario.estado() || []).reduce((s, it) => s + (it && it.nome === nome ? (it.qtd || 1) : 0), 0);
function progressoQuest(q, e) { return q.tipo === 'matar' ? e.prog : Math.min(q.meta, contaItem(q.item)); }
function questDe(npc) {
  // cadeia: quests com `requer` só aparecem depois do pré-requisito feito
  return QUESTS.find((qq) => qq.npc === npc.nome && !(questEstado[qq.id] || {}).feita
    && (!qq.requer || (questEstado[qq.requer] || {}).feita));
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
  'Cogumelo': 2, 'Concha': 4, 'Coco': 3, 'Cenoura': 2,
  'Presa do Boss': 20, 'Olho do Beholder': 40, 'Escama de Dragão': 90, 'Coração de Dragão': 400, 'Coroa Antiga': 250, 'Olho Lapidado': 180, 'Estandarte Orc': 220,
  'Rubi': 30, 'Safira': 30, 'Esmeralda': 30, 'Pérola': 22, 'Âmbar': 18, 'Anel de Ouro': 35,
  'Lambari': 1, 'Tilápia': 2, 'Traíra': 3, 'Carpa': 3, 'Bagre': 3, 'Tucunaré': 6, 'Dourado': 12, 'Pintado': 16,
};
// ESTOQUE REGIONAL: o que você vende pra cada NPC fica registrado (e salvo);
// ao atingir a meta, a OFERTA RARA dele entra na loja pra sempre.
const economia = {}; // nomeNpc -> { total, liberadas: [] }
function registraVenda(npc, qtd) {
  const e = economia[npc.nome] || (economia[npc.nome] = { total: 0, liberadas: [] });
  e.total += qtd;
  const novas = [];
  (npc.ofertas || []).forEach((of) => {
    if (e.total >= of.precisa && !e.liberadas.includes(of.item.nome)) {
      e.liberadas.push(of.item.nome);
      npc.loja = npc.loja || [];
      npc.loja.push({ ...of.item });
      novas.push(`${of.item.icone} ${of.item.nome}`);
    }
  });
  return novas;
}
function restauraEconomia() { // pós-load: reinjeta as ofertas já liberadas
  for (const n of npcs) {
    const e = economia[n.nome];
    if (!e || !n.ofertas) continue;
    n.ofertas.forEach((of) => {
      if (e.liberadas.includes(of.item.nome) && !(n.loja || []).some((it) => it.nome === of.item.nome)) {
        n.loja = n.loja || []; n.loja.push({ ...of.item });
      }
    });
  }
}
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
  // QUEST do NPC (estilo Tibia: aceitar → cumprir → voltar pra recompensa)
  const q = questDe(npc);
  if (q) {
    const e = questEstado[q.id] || (questEstado[q.id] = { aceita: false, prog: 0, feita: false });
    const rotulo = !e.aceita ? `📜 Missão: ${q.titulo}` : `📜 ${q.titulo} (${progressoQuest(q, e)}/${q.meta})`;
    opcoes.splice(opcoes.length - 1, 0, { texto: rotulo, onClick: () => {
      if (!e.aceita) {
        e.aceita = true; salvaJogo();
        dialogo.abre(npc.nome, `${q.pede} (são ${q.meta} no total — eu anoto aqui)`, opcoes);
        return;
      }
      const pr = progressoQuest(q, e);
      if (pr < q.meta) { dialogo.abre(npc.nome, `${q.fala} Ainda falta${q.meta - pr > 1 ? 'm' : ''} ${q.meta - pr}.`, opcoes); return; }
      if (q.tipo === 'coletar') for (let i = 0; i < q.meta; i++) inventario.consomeItem(q.item);
      e.feita = true;
      ouro += q.recompensa.ouro; hud.ouro(ouro); hud.ganhaXP(q.recompensa.xp);
      if (q.recompensa.item) inventario.addItem({ ...q.recompensa.item });
      if (q.recompensa.pet && !petsDomados.includes(q.recompensa.pet)) { // PET de quest (RV5.1)
        petsDomados.push(q.recompensa.pet);
        for (let i = domaveisVivos.length - 1; i >= 0; i--) {
          if (domaveisVivos[i].tipo === q.recompensa.pet) { scene.remove(domaveisVivos[i].g); domaveisVivos.splice(i, 1); }
        }
        trocaPet(q.recompensa.pet);
        sons.tesouro();
      }
      salvaJogo();
      dialogo.abre(npc.nome, `Excelente trabalho! 🏅 +${q.recompensa.ouro}🪙 e +${q.recompensa.xp} XP`
        + (q.recompensa.item ? ` + ${q.recompensa.item.icone} ${q.recompensa.item.nome}` : '')
        + (q.recompensa.pet ? ' 🐲 O FILHOTE DE DRAGÃO agora é seu — ele te segue (e aceita sela: tecla M)!' : '') + '.', opcoes);
    } });
  }
  // GUILDA DE VENORE (RV4.2): o Mestre Ulric aceita quem provou valor
  if (npc.nome === 'Ulric') {
    const rotuloG = guildaMembro ? '🛡️ Guilda: você é MEMBRO' : `🛡️ Entrar para a Guilda (${Math.min(dragoesMortos, 2)}/2 dragões)`;
    opcoes.splice(opcoes.length - 1, 0, { texto: rotuloG, onClick: () => {
      if (guildaMembro) { dialogo.abre(npc.nome, 'Você já é dos nossos, caçador de dragões. O Salão é sua casa.', opcoes); return; }
      if (dragoesMortos < 2) { dialogo.abre(npc.nome, `O Salão não aceita qualquer um. Derrote mais ${2 - dragoesMortos} dragão(ões) e volte.`, opcoes); return; }
      guildaMembro = true;
      inventario.addItem({ nome: 'Manto da Guilda', icone: '🛡️', slot: 'tronco', defesa: 6 });
      hud.ganhaXP(120); salvaJogo();
      dialogo.abre(npc.nome, '🏅 BEM-VINDO À GUILDA DE VENORE! Seu MANTO DA GUILDA (defesa 6) está na mochila — vista com orgulho. +120 XP', opcoes);
    } });
  }
  // ECONOMIA CIRCULAR (estilo Tibia): mercadores compram TUDO; lojistas
  // compram a CATEGORIA deles (couro→ferreiro, erva→curandeira, seda→runas)
  // e o que você vende ABASTECE o NPC → destrava OFERTAS RARAS na loja dele!
  const ehMercador = npc.prof === 'Mercador' || npc.prof === 'Mercadora';
  if (ehMercador || npc.compra) {
    const tabela = ehMercador ? PRECOS : Object.fromEntries(npc.compra.filter((n) => PRECOS[n]).map((n) => [n, PRECOS[n]]));
    opcoes.splice(opcoes.length - 1, 0, { texto: ehMercador ? '💰 Vender tesouros' : '💰 Vender materiais', onClick: () => {
      const v = inventario.vendeItens(tabela);
      if (v.itens) {
        ouro += v.ouro; hud.ouro(ouro);
        const novas = registraVenda(npc, v.itens);
        dialogo.abre(npc.nome, `Negócio fechado! ${v.itens} item(s) por ${v.ouro} 🪙.`
          + (novas.length ? ` ✨ Com o material que você trouxe, ${novas.join(' e ')} AGORA À VENDA aqui!` : ' Continue me abastecendo que eu consigo coisa RARA.'), opcoes);
      } else {
        dialogo.abre(npc.nome, ehMercador
          ? 'Hmm... você não tem nada que me interesse. Caça, gemas e peixes pagam bem!'
          : `Procuro por: ${npc.compra.join(', ')}. Traga da caça que eu pago bem — e libero itens raros na loja!`, opcoes);
      }
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
    ? `Saudações! Sou ${npc.nome}, ${npc.prof.toLowerCase()}. 😊`
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
  if (!ini || !jogoIniciado || morto || dialogo.aberto || customizar.aberto) return;
  if (Math.hypot(e.clientX - ini.x, e.clientY - ini.y) > 8 || performance.now() - ini.t > 350) return;
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  rayTap.setFromCamera(ndc, camera);
  let hitsTap = [];
  try { hitsTap = rayTap.intersectObjects(scene.children, true); }
  catch (err) { console.error('raycast do clique:', err); hitsTap = []; } // GLB com osso nulo não derruba o clique
  for (const h of hitsTap) {
    const alvo = achaTipo(h.object);
    if (!alvo) continue;
    const tipo = alvo.userData.tipo;
    if (tipo === 'npc') {
      const npc = alvo.userData.ref;
      const d = Math.hypot(npc.g.position.x - avatar.position.x, npc.g.position.z - avatar.position.z);
      if (d < 7) abreDialogo(npc); else mostraMensagem('Chegue mais perto pra conversar. 💬');
      return;
    }
    if (tipo === 'pet') { montaOuDesmonta(); return; } // clicar no SEU pet = montar/desmontar
    if (tipo === 'jogador') { customizar.abre(); return; }
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
    for (let i = 0; i < subsoloAtual.acessos.length; i++) {
      const a = subsoloAtual.acessos[i];
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
    } else { // sem interativo: domar / saquear / atacar / pescar
      const dom = domavelProximo();
      if (dom) { tentaDomar(dom); return; }
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
  // CORDA amarrada numa estaca, caindo no buraco (analogia do Tibia)
  const estaca = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.9, 6), MAT_MADEIRA);
  estaca.position.set(1.35, 0.45, 0); estaca.rotation.z = -0.15; b.add(estaca);
  const cordaB = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 6), new THREE.MeshStandardMaterial({ color: 0x9a7a44, roughness: 1 }));
  cordaB.position.set(0.62, 0.5, 0); cordaB.rotation.z = 1.05; b.add(cordaB); // da estaca até a boca do buraco
  const rolinho = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 12), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 1 }));
  rolinho.position.set(1.32, 0.92, 0); rolinho.rotation.x = Math.PI / 2; b.add(rolinho); // rolo de corda na estaca
  scene.add(b);
  interativos.push({ x: bp.x, z: bp.z, raio: 2.4, titulo: '🕳️ Bueiro', acao: 'Descer pela corda 🪢', msg: 'Escuro lá embaixo...', onAcao: () => desce(i) });
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

// === REDE DE BARCAS ⛵ (RV4.3): o Porto de Venore virou HUB com 2 rotas
// (vilarejo 5🪙 / praia 8🪙); vilarejo e praia têm a volta — fast-travel
// clássico de capital mercante, pago e salvo.
function viajaBarca(dx, dz, custo, nomeDestino) {
  if (ouro < custo) { mostraMensagem(`A passagem custa ${custo} 🪙 — venda um peixe pro Tonho!`); return; }
  ouro -= custo; hud.ouro(ouro);
  sons.agua();
  montado = false; petAlvo = null;
  avatar.position.set(dx, alturaTerreno(dx, dz), dz); vy = 0; noChao = true;
  salvaJogo();
  mostraMensagem(`⛵ A barca corta as águas... bem-vindo: ${nomeDestino}!`);
}
{
  const itPV = { x: -322, z: -82, raio: 3.4, titulo: '⛵ Barcas de Venore', acao: 'Ver rotas da barca ⛵' };
  itPV.onAcao = () => {
    const ops = [
      { texto: '⛵ Cais do Vilarejo — 5🪙', onClick: () => { dialogo.fecha(); viajaBarca(47, 57, 5, 'Cais do Vilarejo'); } },
      { texto: '⛵ Praia de Venor — 8🪙', onClick: () => { dialogo.fecha(); viajaBarca(-20, -203, 8, 'Praia de Venor'); } },
      { texto: 'Ficar no porto', onClick: () => dialogo.fecha() },
    ];
    dialogo.abre('⛵ Barcas de Venore', 'Pra onde vamos? O canal leva a barca até o mar.', ops);
  };
  interativos.push(itPV);
}
[
  { x: 45, z: 62, alvo: { x: -318, z: -80 }, custo: 5, alvoNome: 'Porto de Venore' },
  { x: -20, z: -206, alvo: { x: -318, z: -80 }, custo: 8, alvoNome: 'Porto de Venore' },
].forEach((rota) => {
  const it = { x: rota.x, z: rota.z, raio: 3.4, titulo: '⛵ Barca', acao: `Viajar p/ ${rota.alvoNome} — ${rota.custo}🪙 ⛵` };
  it.onAcao = () => viajaBarca(rota.alvo.x, rota.alvo.z, rota.custo, rota.alvoNome);
  interativos.push(it);
});

// === DEPÓSITO DE VENORE 🧰 (RV4.0): cofre na Torre do Depósito — guarda
// itens em segurança (vai no save; morrer NÃO derruba o que está no cofre)
const cofre = []; // { nome, icone, qtd, ...campos de equipamento }
function depositaNoCofre(item) {
  const e = cofre.find((c) => c.nome === item.nome);
  if (e) e.qtd++;
  else cofre.push({ ...item, qtd: 1 });
}
function abreCofre() {
  const lista = cofre.length
    ? cofre.map((c) => `${c.icone || '▪'} ${c.nome}${c.qtd > 1 ? ' ×' + c.qtd : ''}`).join(' · ')
    : '(vazio)';
  const opcoes = [
    { texto: '📥 Guardar a mochila no cofre', onClick: () => {
      let n = 0;
      for (const item of (inventario.estado() || [])) {
        if (!item) continue;
        for (let q = 0; q < (item.qtd || 1); q++) {
          if (!inventario.consomeItem(item.nome)) break;
          depositaNoCofre(item); n++;
        }
      }
      salvaJogo();
      dialogo.abre('🧰 Depósito de Venore', n ? `Guardei ${n} item(ns). Estão seguros aqui.` : 'Sua mochila está vazia.', opcoes);
    } },
    { texto: '📤 Retirar tudo do cofre', onClick: () => {
      let n = 0;
      for (let i = cofre.length - 1; i >= 0; i--) {
        const c = cofre[i];
        while (c.qtd > 0 && inventario.addItem({ ...c, qtd: undefined })) { c.qtd--; n++; }
        if (c.qtd <= 0) cofre.splice(i, 1);
      }
      salvaJogo();
      dialogo.abre('🧰 Depósito de Venore', n ? `Devolvi ${n} item(ns) pra sua mochila.` : (cofre.length ? 'Mochila cheia! Libere espaço antes.' : 'Seu cofre está vazio.'), opcoes);
    } },
    { texto: 'Fechar', onClick: () => dialogo.fecha() },
  ];
  dialogo.abre('🧰 Depósito de Venore', `No cofre: ${lista}`, opcoes);
}
{
  const it = { x: -296, z: -46.6, raio: 3.0, titulo: '🧰 Depósito de Venore', acao: 'Abrir seu cofre 🧰' };
  it.onAcao = () => abreCofre();
  interativos.push(it);
}

// =============================================================
//  LORE DE VENOR (RV4.9) · 6 TOMOS espalhados pelo mundo contam a
//  ERA DOS DRAGÕES — história ORIGINAL nossa, amarrando tudo que
//  existe no mapa (Ossada, Rei Esqueleto, ovos do Pico, pântano...).
//  Cada livro abre no diálogo com "páginas" (Continuar lendo →).
// =============================================================
const TOMOS = [
  { x: 4, z: 26, lugar: 'Escola do Vilarejo', titulo: '📕 Crônica da Fundação', paginas: [
    'Antes das muralhas, antes do templo, havia só um poço e quatro famílias teimosas. Chamaram o lugar de VENOR, palavra antiga para "ficar". Os dragões já dominavam os céus naquele tempo — e mesmo assim, ninguém partiu.',
    'O vilarejo cresceu devagar, como cresce o que é teimoso: uma praça, um mercado, um sino. Quando perguntavam ao velho fundador por que erguer casas sob a sombra de asas, ele respondia: "porque é nossa".',
    'Dizem que o chafariz da praça nunca secou. Os mais antigos juram que é porque a água lembra de quem ficou.' ] },
  { x: -388, z: 12, lugar: 'Catedral de Venore', titulo: '📗 A Era dos Dragões', paginas: [
    'No princípio desta era, os dragões não eram lenda: eram o CLIMA. Escureciam o meio-dia, e colheita era o que sobrava depois que passavam. A Ossada que jaz no campo a leste pertenceu a Vorag, o primeiro a cair.',
    'Foi a queda de Vorag que ensinou aos homens a palavra "possível". Dela nasceram as ordens de caçadores, e das ordens, as guildas. O Salão que hoje vês no Largo é neto daquele osso.',
    'Mas lembra, leitor: caçamos os dragões até as montanhas, não até o fim. No Pico, um ninho ainda guarda três ovos. A Catedral reza para que nunca esqueçamos — e para que eles não lembrem de nós.' ] },
  { x: -340, z: -6, y: -40, lugar: 'Catacumbas (junto ao trono)', titulo: '📘 O Último Rei', paginas: [
    'Aqui jaz — e não descansa — Ossivaldo II, o Último Rei de Venore Antiga. Em vida, taxou até a chuva; em morte, sentou-se de novo no trono e nunca mais se levantou.',
    'Quando o pântano engoliu a primeira Venore, o rei recusou-se a partir com o povo. "Um rei não abandona o cofre", disse. O cofre, como sabes, está um andar abaixo. A coroa, ele usa até hoje.',
    'Se leres isto à luz de tocha, com os guardiões acordados ao redor: foge. Se já os venceste: a sacerdotisa Hela paga bem pela paz deles.' ] },
  { x: -290, z: -54, lugar: 'Torre do Depósito', titulo: '📙 Cartas de um Mercador', paginas: [
    '"Querida Ema: o brejo é horrível, o ar morde, e eu nunca vi tanto OURO em toda a minha vida. Vamos ficar." — assim começa a primeira carta de Anselmo, o Velho, avô do atual.',
    'A nova Venore nasceu da teimosia dos mercadores: se o pântano engoliu a cidade antiga, a nova andaria POR CIMA dele. Canal, calçadão, barcas — a água que nos venceu virou estrada.',
    'A última carta termina assim: "construímos a torre alta não pela vaidade, mas para que quem fugiu veja de longe que voltamos. O relógio atrasa cinco minutos. Deixei assim. É o tempo que um mercador honesto deve ao passado."' ] },
  { x: 124, z: -4, lugar: 'Torre de Vigia', titulo: '📒 Diário do Vigia', paginas: [
    'Dia 1: a estrada para Thais é longa, e o braseiro é meu único colega. Lobos na ponte, de novo. Conto-os como quem conta ovelhas, mas ao contrário: quando termino, é que não durmo.',
    'Dia 40: passou um viajante a cavalo de BURRO, rindo, mais rápido que a guarda inteira. Anotei: arranjar um burro.',
    'Dia 113: à noite o dragão voou para o lado de Venor cuspindo brasa. O céu ficou bonito e errado ao mesmo tempo. Reacendi o braseiro. Enquanto houver luz na torre, a estrada tem dono.' ] },
  { x: 154, z: 246, lugar: 'Ruínas Antigas', titulo: '📓 Fragmento Profético', paginas: [
    '...e quando a coroa voltar a brilhar sob a terra, e a seda voltar a cobrir a floresta, sabei: é o TERCEIRO SINAL. (o resto da página está queimado)',
    '...três ovos ao calor da lava, pacientes como só a pedra. O primeiro a nascer chamará os outros. O que dorme no covil do norte é apenas o avô deles...',
    '...não temais o fogo no céu. Temei o dia em que ele POUSAR. (aqui o fragmento termina; alguém rabiscou embaixo, com letra recente: "contar pra Hela?")' ] },
];
const MAT_LIVRO = new THREE.MeshStandardMaterial({ color: 0x7a3a2a, roughness: 0.7 });
const MAT_PEDESTAL = new THREE.MeshStandardMaterial({ color: 0x6f675c, roughness: 1 });
TOMOS.forEach((tomo) => {
  // livrinho físico sobre um pedestal baixinho
  const gL = new THREE.Group(); gL.position.set(tomo.x, (tomo.y || 0), tomo.z);
  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.5), MAT_PEDESTAL);
  ped.position.y = 0.45; gL.add(ped);
  const livro = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.38), MAT_LIVRO);
  livro.position.y = 0.95; livro.rotation.y = 0.4; gL.add(livro);
  const paginaM = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.32), new THREE.MeshStandardMaterial({ color: 0xeee6cc, roughness: 0.9 }));
  paginaM.position.y = 1.0; paginaM.rotation.y = 0.4; gL.add(paginaM);
  if (!tomo.y) gL.position.y = alturaTerreno(tomo.x, tomo.z);
  scene.add(gL);
  const it = { x: tomo.x, z: tomo.z, y: tomo.y || 0, raio: 2.6, titulo: tomo.titulo, acao: `Ler ${tomo.titulo}` };
  it.onAcao = () => {
    let pag = 0;
    const mostra = () => {
      const ops = [];
      if (pag < tomo.paginas.length - 1) ops.push({ texto: 'Continuar lendo →', onClick: () => { pag++; mostra(); } });
      ops.push({ texto: 'Fechar o livro', onClick: () => dialogo.fecha() });
      dialogo.abre(`${tomo.titulo} (${pag + 1}/${tomo.paginas.length})`, tomo.paginas[pag], ops);
    };
    mostra();
  };
  interativos.push(it);
});

// === COLETÁVEIS pelo mundo (colher → vender no mercador → renascem em 90s) ===
const TIPOS_COLETA = {
  Erva: { icone: '🌿', cria: () => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 5), new THREE.MeshStandardMaterial({ color: 0x3fa050, roughness: 0.9 })); m.position.y = 0.28; return m; } },
  Cogumelo: { icone: '🍄', cria: () => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.32, 6), new THREE.MeshStandardMaterial({ color: 0xe8e0d0 })); c.position.y = 0.16; g.add(c); const ch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc23a2a })); ch.position.y = 0.32; g.add(ch); return g; } },
  Concha: { icone: '🐚', cria: () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf0e2d0, roughness: 0.5 })); m.position.y = 0.06; m.scale.y = 0.5; return m; } },
  Cenoura: { icone: '🥕', cria: () => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0xe8762a, roughness: 0.9 })); c.position.y = 0.12; c.rotation.x = Math.PI; g.add(c); const f = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 5), new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.9 })); f.position.y = 0.36; g.add(f); return g; } },
  Coco: { icone: '🥥', cria: () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshStandardMaterial({ color: 0x5a4226, roughness: 0.9 })); m.position.y = 0.2; return m; } },
};
[
  ['Erva', [[-84, 8], [-90, 36], [120, 30], [160, -24], [310, 24], [-120, -40], [430, -26]]],
  ['Cogumelo', [[-86, 20], [-92, -10], [135, 26], [365, 64], [-118, 60]]],
  ['Concha', [[-50, -206], [-10, -212], [30, -208], [70, -214], [105, -206], [-90, -210]]],
  ['Coco', [[-58, -212], [17, -216], [97, -214], [-138, -214]]],
  ['Cenoura', [[100, 33], [108, 37], [102, 43], [111, 30]]],
].forEach(([tipo, pontos]) => pontos.forEach(([cx, cz]) => {
  const def = TIPOS_COLETA[tipo];
  const mesh = def.cria();
  mesh.position.set(cx, mesh.position.y + alturaTerreno(cx, cz), cz);
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
  if (montado) { montado = false; mostraMensagem('Você desmontou pra descer. 🐾'); }
  acessoAtual = i;
  subsoloAtual = esgoto;
  esgoto.grupo.visible = true;
  chaoY = -40; areaAtiva = esgoto.bounds; noEsgoto = true;
  const a = esgoto.acessos[i] || esgoto.acessos[0];
  avatar.position.set(a.x, -40, a.z + (a.z > 0 ? -3 : 3)); vy = 0; noChao = true;
  hemi.intensity = 0.08; sun.intensity = 0.05; // ESGOTO ESCURO — acenda a tocha (T)
  minimapa.esconde();
  sons.corda();
  mostraMensagem(tochaOn ? 'Você desce pela corda. 🪢🐀' : 'Está escuro! Acenda a tocha — tecla T 🔦');
}
function sobe(i = acessoAtual) {
  subsoloAtual.grupo.visible = false;
  chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false;
  // cada subsolo tem suas SAÍDAS pareadas com os acessos (esgoto = bueiros)
  const b = (subsoloAtual.saidas && subsoloAtual.saidas[i]) || BUEIROS[i] || BUEIROS[0];
  avatar.position.set(b.x, alturaTerreno(b.x, b.z + 2.5), b.z + 2.5); vy = 0; noChao = true;
  subsoloAtual = esgoto;
  minimapa.mostra(); sons.corda(); mostraMensagem('Você sobe pela corda de volta à superfície. 🪢☀️'); // luz volta pelo ciclo dia/noite
}
// CATACUMBAS (RV4.4): descida própria, pela cripta atrás da Catedral
function desceCatacumbas() {
  if (montado) { montado = false; mostraMensagem('Você desmontou pra descer. 🐾'); }
  acessoAtual = 0;
  subsoloAtual = catacumbas;
  catacumbas.grupo.visible = true;
  chaoY = -40; areaAtiva = catacumbas.bounds; noEsgoto = true;
  const a = catacumbas.acessos[0];
  avatar.position.set(a.x - 2.5, -40, a.z); vy = 0; noChao = true;
  hemi.intensity = 0.08; sun.intensity = 0.05;
  minimapa.esconde();
  mostraMensagem(tochaOn ? '🪦 Você desce à cripta... os mortos não gostam de visitas.' : 'Está escuro! Acenda a tocha — tecla T 🔦');
}
{
  const it = { x: -398, z: 33, raio: 2.8, titulo: '🪦 Catacumbas de Venore', acao: 'Descer às Catacumbas 🪦' };
  it.onAcao = () => desceCatacumbas();
  interativos.push(it);
}
// CRIPTA PROFUNDA (RV4.7): descida na câmara do trono e corda de volta
function desceCripta() {
  subsoloAtual = criptaProfunda;
  catacumbas.grupo.visible = false; criptaProfunda.grupo.visible = true;
  chaoY = -80; areaAtiva = criptaProfunda.bounds; // noEsgoto continua true
  avatar.position.set(-340, -80, -10); vy = 0; noChao = true;
  mostraMensagem('🕳️ Você desce ainda mais fundo... o ar pesa e algo brilha no escuro.');
}
function sobeDaCripta() {
  subsoloAtual = catacumbas;
  criptaProfunda.grupo.visible = false; catacumbas.grupo.visible = true;
  chaoY = -40; areaAtiva = catacumbas.bounds;
  avatar.position.set(-344, -40, -13); vy = 0; noChao = true;
  mostraMensagem('🪢 De volta à câmara do trono.');
}
{
  const desce2 = { x: -344, z: -16, y: -40, raio: 2.4, titulo: '🕳️ Cripta Profunda', acao: 'Descer à Cripta Profunda 🕳️' };
  desce2.onAcao = () => desceCripta();
  interativos.push(desce2);
  const sobe2 = { x: -334, z: -10, y: -80, raio: 2.6, titulo: '🪢 Corda', acao: 'Subir pela corda 🪢' };
  sobe2.onAcao = () => sobeDaCripta();
  interativos.push(sobe2);
}
// BAÚ ANCESTRAL: o tesouro dos reis (UMA vez por conta — vai no save)
let bauCriptaAberto = false;
{
  const it = { x: -354, z: -14, y: -80, raio: 2.8, titulo: '🧰 Baú Ancestral', acao: 'Abrir o Baú Ancestral 👑' };
  it.onAcao = () => {
    if (bauCriptaAberto) { mostraMensagem('O baú já foi saqueado... por você mesmo. 👑'); return; }
    bauCriptaAberto = true;
    sons.tesouro();
    ouro += 180; hud.ouro(ouro);
    inventario.addItem({ nome: 'Rubi', icone: '💎' });
    inventario.addItem({ nome: 'Esmeralda', icone: '💎' });
    salvaJogo();
    mostraMensagem('👑 O tesouro dos reis antigos! +180🪙, um Rubi e uma Esmeralda.');
  };
  interativos.push(it);
}

// CICLO DIA/NOITE (discreto): muda sol/ambiente/céu/neblina e acende os lampiões
const C_TOPO_DIA = new THREE.Color(0x4f86c0), C_BASE_DIA = new THREE.Color(0xdce9f2);
const C_TOPO_NOITE = new THREE.Color(0x0a1530), C_BASE_NOITE = new THREE.Color(0x16233f);
const C_FOG_DIA = new THREE.Color(0xcfe0ee), C_FOG_NOITE = new THREE.Color(0x111b2e);
let tempoDia = 0.3; // começa de manhã
let ehNoite = false;
let avisoNoite = false; // lembrete da tocha (1× por noite)
function aplicaDiaNoite(dt) {
  tempoDia = (tempoDia + dt / 300) % 1; // ciclo ~5 min
  const d = (Math.sin((tempoDia - 0.25) * Math.PI * 2) + 1) / 2; // 0=noite, 1=meio-dia
  ehNoite = d < 0.35;
  // NOITE ESTILO OT (RV4.2): madrugada ESCURA de verdade — a tocha, os
  // lampiões e o luar viram a diferença entre andar e tropeçar
  sun.intensity = 0.04 + d * 1.01;
  hemi.intensity = 0.07 + d * 0.57;
  if (ceu.material.map) { // céu panorâmico: tinge do dia (branco) pra noite (azul-escuro)
    ceu.material.color.setRGB(0.16 + d * 0.84, 0.2 + d * 0.8, 0.34 + d * 0.66);
  } else {
    skyMat.uniforms.corTopo.value.copy(C_TOPO_NOITE).lerp(C_TOPO_DIA, d);
    skyMat.uniforms.corBase.value.copy(C_BASE_NOITE).lerp(C_BASE_DIA, d);
  }
  if (scene.fog) {
    scene.fog.color.copy(C_FOG_NOITE).lerp(C_FOG_DIA, d);
    scene.fog.near = 110 + d * 150; // a escuridão FECHA o horizonte à noite
    scene.fog.far = 340 + d * 380;  // (dia: 260/720 — igual antes)
  }
  const noite = 1 - d;
  // aviso de sobrevivência (1× por noite): acende a tocha!
  if (ehNoite && !tochaOn && !noEsgoto && jogoIniciado && !avisoNoite) {
    avisoNoite = true; mostraMensagem('🌙 A noite caiu de verdade — acenda a tocha (tecla T)!');
  }
  if (!ehNoite) avisoNoite = false;
  // LUAR: a lua brilha mais à noite (mas fica visível de dia, pálida) + estrelas surgem
  luaLuz.intensity = (ehMobile ? 0.35 : 0.6) * Math.max(0, noite - 0.12);
  if (luaMat) luaMat.emissiveIntensity = 0.35 + noite * 0.85;
  if (estrelas) estrelas.material.opacity = Math.min(1, Math.max(0, noite - 0.3) * 1.4);
  if (vagalumes) { // RV3.0: vagalumes acordam à noite e flutuam de leve
    vagalumes.material.opacity = Math.min(0.95, Math.max(0, noite - 0.45) * 1.8);
    vagalumes.position.y = Math.sin(tempo * 0.7) * 0.5;
  }
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
  if (item.usavel === 'pocaoGrande') { // poção grande (oferta rara da Sira): +80
    if (vida >= VIDA_MAX) { mostraMensagem('Você já está com a vida cheia. ❤️'); return false; }
    vida = Math.min(VIDA_MAX, vida + 80); hud.vida(vida, VIDA_MAX);
    mostraMensagem('🧉 GOLE GRANDE! +80 de vida! ❤️');
    return true;
  }
  if (item.usavel === 'runaExplosiva') { // runa explosiva (oferta rara da Eldra): 50 em área 6
    let acertou = 0;
    for (const r of ratos) {
      if (!r.vivo || Math.abs(r.g.position.y - avatar.position.y) > 6) continue;
      if (Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z) > 6) continue;
      r.hp -= 50; r.piscar = 0.2; if (r.g.userData.corpoMat) r.g.userData.corpoMat.emissive.setHex(0xa03010);
      if (r.hp <= 0) mataBicho(r);
      acertou++;
    }
    explosaoFogo();
    mostraMensagem(acertou ? `💣 RUNA EXPLOSIVA! ${acertou} bicho(s) devastado(s) (-50)` : '💣 BOOM... sem alvos por perto.');
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
function alcanceAtaque() { return (equipados.maoDir && equipados.maoDir.arco) ? (equipados.maoDir.alcance || 14) : 2.6; } // Arco Longo alcança 18
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
  const de = r.g.position.clone(); de.y += r.tiroAltura ?? (fogo ? 7.4 : 4.2); // sai da boca/olho
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
    const melhor = alvoRato(alcanceAtaque());
    if (!melhor) { mostraMensagem('Nenhum alvo ao alcance do arco. 🏹'); return; }
    // VIROTE (RV5.1): munição PESADA — se tiver na mochila, sai primeiro e bate +4
    const usouVirote = inventario.consomeItem('Virote');
    if (!usouVirote && !inventario.consomeItem('Flecha')) { mostraMensagem('Sem munição! Flechas/Virotes com Falk (vilarejo), Tonho (Venore) ou Yara (Thais). ➹'); return; }
    const danoTiro = dano + (usouVirote ? 4 : 0);
    petAlvo = melhor; // o pet entra na briga junto
    sons.golpe();
    disparaFlecha(melhor);
    melhor.hp -= danoTiro; melhor.piscar = 0.15; if (melhor.g.userData.corpoMat) melhor.g.userData.corpoMat.emissive.setHex(0x882020);
    if (melhor.hp <= 0) mataBicho(melhor);
    else mostraMensagem(`${usouVirote ? '🏹 VIROTAÇO!' : '🏹 Flechada!'} (-${danoTiro}, vida ${Math.max(0, melhor.hp)})`);
    return;
  }
  const melhor = alvoRato();
  if (!melhor) { mostraMensagem('Golpe no ar!'); sons.erro(); return; }
  sons.golpe();
  petAlvo = melhor; // o pet entra na briga junto
  melhor.hp -= dano; melhor.piscar = 0.15; if (melhor.g.userData.corpoMat) melhor.g.userData.corpoMat.emissive.setHex(0x882020);
  if (melhor.hp <= 0) mataBicho(melhor);
  else mostraMensagem(`Acertou ${melhor.boss ? 'o BOSS' : 'o bicho'}! (-${dano}, vida ${Math.max(0, melhor.hp)})`);
}
// === RARIDADES (RV4.9): cada chefe guarda UM tesouro lendário — chance
// baixa, aviso ✨ na tela, e cada um amarra na LORE dos tomos
const RAROS = {
  reiEsqueleto: { chance: 0.06, item: { nome: 'Lâmina da Era Antiga', icone: '🗡️', slot: 'maoDir', dano: 22, arma: true } },
  aranha: { chance: 0.08, item: { nome: 'Manto de Seda', icone: '🧥', slot: 'tronco', defesa: 6 } },
  dragao: { chance: 0.07, item: { nome: 'Égide do Dragão', icone: '🛡️', slot: 'maoEsq', defesa: 7 } },
  beholder: { chance: 0.1, item: { nome: 'Olho Lapidado', icone: '🔮' } },
  cobra: { chance: 0.02, item: { nome: 'Dente do Profundo', icone: '🦷', slot: 'colar', defesa: 3 } },
  orcWarlord: { chance: 0.08, item: { nome: 'Machado do Senhor da Guerra', icone: '🪓', slot: 'maoDir', dano: 28, arma: true } },
};
function mataBicho(r) {
  r.vivo = false; r.corpse = true;
  r.g.rotation.z = Math.PI / 2;      // tomba (corpo no chão)
  if (r.g.userData.corpoMat) r.g.userData.corpoMat.emissive.setHex(0x000000);
  r.loot = rollLoot(r.boss || r.forte);
  if (r.lootEspecial && Math.random() < 0.7) r.loot.push({ ...r.lootEspecial }); // drop único (ex.: Olho do Beholder)
  const raroDef = RAROS[r.especie];
  if (raroDef && Math.random() < raroDef.chance) {
    r.loot.push({ ...raroDef.item });
    sons.tesouro();
    setTimeout(() => mostraMensagem(`✨ DROP RARO! ${raroDef.item.icone} ${raroDef.item.nome} caiu no corpo — SAQUEIE!`), 900);
  }
  r.despawnAt = tempo + 30;          // some em 30s se não saquear
  const xp = r.xp || 5;
  hud.ganhaXP(xp);
  mostraMensagem(`${r.boss || r.forte ? 'Criatura poderosa derrotada!' : 'Derrotado!'} +${xp} XP — AÇÃO no corpo p/ saquear`);
  if (r.especie === 'dragao') dragoesMortos++; // currículo pra Guilda de Venore
  // progresso de QUEST de caça (conta também as mordidas do pet)
  for (const q of QUESTS) {
    const e = questEstado[q.id];
    if (e && e.aceita && !e.feita && q.tipo === 'matar' && r.especie === q.especie && e.prog < q.meta) {
      e.prog++;
      mostraMensagem(`📜 ${q.titulo}: ${e.prog}/${q.meta}${e.prog >= q.meta ? ' — volte ao ' + q.npc + '! ✅' : ''}`);
    }
  }
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
  if (pegou) sons.moeda();
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
// TELA DE MORTE (estilo Tibia) com ESTADO de morte de verdade:
// morreu → o jogo te pausa (nada te machuca nem te move) → o BOTÃO faz o
// RESET completo e te leva ao Templo (se não clicar, volta sozinho em 12s).
let telaMorte = null, morto = false, mortoAuto = 0;
function mostraTelaMorte(xpPerdido, perdeuItens) {
  if (!telaMorte) {
    telaMorte = document.createElement('div');
    telaMorte.style.cssText = 'position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;'
      + 'background:radial-gradient(ellipse at center, rgba(70,0,0,.8), rgba(8,0,0,.94));touch-action:none;';
    document.body.appendChild(telaMorte);
  }
  telaMorte.innerHTML = `<div style="text-align:center;font-family:Arial;color:#f2e6e6;max-width:82vw;">
    <div style="font-size:52px;margin-bottom:4px;">💀</div>
    <div style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#ff6a5a;text-shadow:0 2px 12px #500;">VOCÊ MORREU</div>
    <div style="margin:14px 0 20px;font-size:15px;color:#d8b8b8;line-height:1.8;">
      Perdeu <b style="color:#ffd23f;">${xpPerdido} XP</b>${perdeuItens
        ? '<br>Sua <b>mochila caiu onde você morreu</b> 🎒 — você tem <b>10 minutos</b> pra voltar e recuperar!'
        : ''}
    </div>
    <div id="btnRenascer" style="display:inline-block;background:#7a1f14;border:2px solid #ff8a6a;border-radius:14px;
      padding:14px 32px;font-size:17px;font-weight:bold;color:#ffe9e2;cursor:pointer;user-select:none;touch-action:none;
      box-shadow:0 6px 24px rgba(0,0,0,.6);">🙏 Renascer no Templo Sagrado</div>
    <div style="margin-top:10px;font-size:12px;color:#a88;">(voltando automaticamente em alguns segundos…)</div>
  </div>`;
  telaMorte.style.display = 'flex';
  const btn = telaMorte.querySelector('#btnRenascer');
  const vai = (e) => { e.preventDefault(); e.stopPropagation(); renasce(); };
  btn.addEventListener('pointerdown', vai);
  btn.addEventListener('click', vai); // redundância de clique (PC e touch)
}
// RENASCER = o reset de verdade: limpa efeitos, restaura recursos e
// teleporta pro Templo Sagrado — disparado pelo BOTÃO (ou automático)
function renasce() {
  if (!morto) return;
  morto = false;
  montado = false; petAlvo = null; // a morte desmonta e chama o pet de volta
  if (telaMorte) telaMorte.style.display = 'none';
  envenenadoAte = 0; escudoAte = 0; escudoHP = 0; // nenhum efeito atravessa a morte
  vida = VIDA_MAX; mana = Math.max(mana, 15);
  if (noEsgoto) { chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false; esgoto.grupo.visible = false; catacumbas.grupo.visible = false; criptaProfunda.grupo.visible = false; subsoloAtual = esgoto; minimapa.mostra(); }
  avatar.position.set(0, 0, -30); vy = 0; noChao = true; // dentro do Templo Sagrado
  hud.vida(vida, VIDA_MAX); hud.mana(mana, MANA_MAX);
  mostraMensagem('🙏 Os deuses te devolvem ao Templo Sagrado.');
  salvaJogo();
}
// MORTE estilo Tibia: perde XP (pode descer de nível), derruba a mochila onde
// caiu, e entra no ESTADO morto até o botão (ou o tempo) renascer.
function morre() {
  if (morto) return; // não morre duas vezes
  morto = true; mortoAuto = tempo + 12;
  const perdidos = inventario.esvaziaMochila();
  if (perdidos.length) derrubaMochila(avatar.position.clone(), perdidos);
  const xpPerdido = hud.perdeXP();
  mostraTelaMorte(xpPerdido, perdidos.length > 0);
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
      r.hpMax = 1100; r.xp = 600; r.dano = 55; r.vel = 1.9; r.danoTiro = 40; r.cadencia = 3; r.tiroAltura = 12.4;
      r.lootEspecial = { nome: 'Coração de Dragão', icone: '❤️‍🔥' };
      mostraMensagem('🔥 Um DRAGON LORD pousou no pico da montanha!');
    } else {
      r.hpMax = 220; r.xp = 120; r.dano = 22; r.vel = 1.6; r.danoTiro = 18; r.cadencia = 4; r.tiroAltura = 10.5;
      r.lootEspecial = { nome: 'Escama de Dragão', icone: '🐲' };
      mostraMensagem('🐲 Um dragão voltou ao pico da montanha.');
    }
    r.hp = r.hpMax; r.vivo = true; r.respawnAt = null; r.alvo = { x: DRX, z: DRZ };
    aplicaModeloDragao(); // respawn continua com o modelo 3D (Lord ganha brasas na pele)
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
      economia, // estoque regional dos NPCs (ofertas raras liberadas)
      pet: petTipo, pets: petsDomados, // companheiros domados
      quests: questEstado, // missões aceitas/cumpridas
      cofre, // Depósito de Venore (itens guardados em segurança)
      dragoes: dragoesMortos, guilda: guildaMembro, // currículo + Guilda de Venore
      bauCripta: bauCriptaAberto, // tesouro dos reis é um só por conta
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
    Object.assign(economia, d.economia || {});
    restauraEconomia(); // ofertas raras já conquistadas voltam pras lojas
    Object.assign(questEstado, d.quests || {}); // missões continuam de onde pararam
    cofre.length = 0; (d.cofre || []).forEach((c) => cofre.push({ ...c })); // Depósito volta intacto
    dragoesMortos = d.dragoes || 0; guildaMembro = !!d.guilda; // Guilda de Venore
    bauCriptaAberto = !!d.bauCripta; // Baú Ancestral (uma vez por conta)
    (d.pets || []).forEach((t) => { if (!petsDomados.includes(t)) petsDomados.push(t); });
    for (let i = domaveisVivos.length - 1; i >= 0; i--) { // domado não fica mais selvagem
      if (petsDomados.includes(domaveisVivos[i].tipo)) { scene.remove(domaveisVivos[i].g); domaveisVivos.splice(i, 1); }
    }
    if (d.pet && PETS[d.pet]) trocaPet(d.pet);
    hud.ouro(ouro); hud.vida(vida, VIDA_MAX);
    return true;
  } catch (e) { return false; }
}
setInterval(() => {
  salvaJogo();                                       // auto-save local a cada 10s
  if (nuvemPin) enviaSaveNuvem(nuvemPin, false);     // ☁️ vinculou? sobe junto
}, 10000);
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
  if (noEsgoto) { chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false; esgoto.grupo.visible = false; catacumbas.grupo.visible = false; criptaProfunda.grupo.visible = false; subsoloAtual = esgoto; minimapa.mostra(); }
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
  // ⚠️ destinos FORA das fontes das praças (o jogador caía DENTRO da água)
  B('🌀 Ir: VENORE (capital)', () => tpGM(-312, -34));
  B('🌀 Ir: Vilarejo de Venor', () => tpGM(10, 14));
  B('🌀 Ir: Thais', () => tpGM(560, -8));
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

// =============================================================
//  MAGIAS (estilo Tibia) + BARRA estilo Diablo
//  Desbloqueiam por NÍVEL, custam MANA (regenera), têm cooldown.
//  Operacional nas DUAS plataformas: teclas 1-5 no PC, toque nos
//  slots no celular — o cálculo de dano/cura é o MESMO.
// =============================================================
let mana = 50; const MANA_MAX = 50;
let escudoAte = 0, escudoHP = 0, luxAte = 0, manaMostrada = -1, proxAttBarra = 0;
const luzLux = new THREE.PointLight(0xcfe2ff, 0, 30, 2); scene.add(luzLux);
const cdMagias = {};
// BALANCEAMENTO Tibia: recurso é FINITO — mana recupera devagar e cada
// magia tem cooldown de 6 a 24s conforme a força (nada de spam infinito)
const MAGIAS = [
  { id: 'lux', nome: 'Lux', icone: '💡', nivel: 1, mana: 5, cd: 6, desc: 'Luz mágica por 60s (melhor que tocha)' },
  { id: 'exura', nome: 'Exura', icone: '💚', nivel: 2, mana: 18, cd: 8, desc: 'Cura +40 de vida' },
  { id: 'exori', nome: 'Exori', icone: '💥', nivel: 3, mana: 22, cd: 12, desc: 'Golpe em ÁREA: 25 de dano em volta' },
  { id: 'utamo', nome: 'Utamo', icone: '🔵', nivel: 4, mana: 28, cd: 24, desc: 'ESCUDO: absorve 40 de dano por 20s' },
  { id: 'flam', nome: 'Exori Flam', icone: '🔥', nivel: 5, mana: 26, cd: 14, desc: 'BOLA DE FOGO no alvo (35, alcance 14)' },
];
// DANO CENTRALIZADO (mesmo cálculo em todo lugar): Utamo absorve primeiro.
// Devolve true se o golpe MATOU o jogador.
function recebeDano(n) {
  if (gmImortal || morto || n <= 0) return false; // morto = nada machuca até renascer
  if (tempo < escudoAte && escudoHP > 0) {
    const abs = Math.min(escudoHP, n);
    escudoHP -= abs; n -= abs;
    if (escudoHP <= 0) mostraMensagem('🔵 Seu escudo mágico se desfez!');
    if (n <= 0) return false;
  }
  vida -= n; hud.vida(vida, VIDA_MAX);
  sons.dor(); // game-feel: dano dói no ouvido também
  if (vida <= 0) { morre(); return true; }
  return false;
}
// alvo mais próximo em QUALQUER direção (magias não exigem mirar)
function alvoMaisProximo(alc) {
  let melhor = null, melhorD = alc;
  for (const r of ratos) {
    if (!r.vivo || Math.abs(r.g.position.y - avatar.position.y) > 6) continue;
    const d = Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
    if (d < melhorD) { melhorD = d; melhor = r; }
  }
  return melhor;
}
function lancaMagia(m) {
  if (!jogoIniciado || morto) return;
  if (hud.estado().nivel < m.nivel) { mostraMensagem(`🔒 ${m.nome} desbloqueia no nível ${m.nivel}!`); return; }
  if (tempo < (cdMagias[m.id] || 0)) { mostraMensagem(`⏳ ${m.nome} recarregando (${Math.ceil(cdMagias[m.id] - tempo)}s)`); return; }
  if (mana < m.mana) { mostraMensagem(`🔮 Sem mana (${Math.floor(mana)}/${m.mana}) — ela regenera com o tempo.`); return; }
  if (m.id === 'lux') {
    luxAte = tempo + 60;
    mostraMensagem('💡 Lux! Uma luz mágica te envolve por 60s.');
  } else if (m.id === 'exura') {
    if (vida >= VIDA_MAX) { mostraMensagem('Vida já cheia. ❤️'); return; }
    vida = Math.min(VIDA_MAX, vida + 40); hud.vida(vida, VIDA_MAX);
    mostraMensagem('💚 Exura! +40 de vida.');
  } else if (m.id === 'exori') {
    let acertou = 0;
    for (const r of ratos) {
      if (!r.vivo || Math.abs(r.g.position.y - avatar.position.y) > 6) continue;
      if (Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z) > 4.5) continue;
      r.hp -= 25; r.piscar = 0.2; if (r.g.userData.corpoMat) r.g.userData.corpoMat.emissive.setHex(0x882020);
      if (r.hp <= 0) mataBicho(r);
      acertou++;
    }
    explosaoFogo();
    mostraMensagem(acertou ? `💥 Exori! ${acertou} bicho(s) atingido(s) (-25)` : '💥 Exori! ...nenhum alvo por perto.');
  } else if (m.id === 'utamo') {
    escudoAte = tempo + 20; escudoHP = 40;
    mostraMensagem('🔵 Utamo Vita! Escudo mágico absorve 40 de dano (20s).');
  } else if (m.id === 'flam') {
    const alvo = alvoMaisProximo(14);
    if (!alvo) { mostraMensagem('🔥 Exori Flam... sem alvo no alcance (14).'); return; }
    giraSuave(avatar, Math.atan2(alvo.g.position.x - avatar.position.x, alvo.g.position.z - avatar.position.z), 1);
    const mFogo = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), MAT_PROJ_FOGO);
    const de = avatar.position.clone(); de.y += 2.0;
    const ate = alvo.g.position.clone(); ate.y += 1.4;
    mFogo.position.copy(de); scene.add(mFogo);
    flechasVoando.push({ m: mFogo, de, ate, t: 0 }); // visual voa; dano aplicado já
    alvo.hp -= 35; alvo.piscar = 0.2; if (alvo.g.userData.corpoMat) alvo.g.userData.corpoMat.emissive.setHex(0xa03010);
    if (alvo.hp <= 0) mataBicho(alvo);
    else mostraMensagem(`🔥 Exori Flam! (-35, vida ${Math.max(0, alvo.hp)})`);
  }
  mana -= m.mana; cdMagias[m.id] = tempo + m.cd;
  hud.mana(mana, MANA_MAX);
}
// BARRA DE MAGIAS (estilo Diablo): slots clicáveis no centro-inferior
const slotsMagia = [];
const barraMagias = document.createElement('div');
barraMagias.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:42;display:none;gap:7px;';
document.body.appendChild(barraMagias);
MAGIAS.forEach((m, i) => {
  const s = document.createElement('div');
  s.style.cssText = 'position:relative;width:54px;height:54px;border-radius:10px;background:rgba(12,18,28,.85);'
    + 'border:2px solid #3a4654;display:flex;align-items:center;justify-content:center;font-size:24px;'
    + 'cursor:pointer;user-select:none;touch-action:none;box-shadow:0 3px 10px rgba(0,0,0,.4);';
  s.innerHTML = `<span>${m.icone}</span>`
    + `<span style="position:absolute;top:1px;left:5px;font:bold 10px Arial;color:#9fb0c0;">${i + 1}</span>`
    + '<span class="cd" style="position:absolute;left:0;bottom:0;width:100%;height:0;background:rgba(8,12,18,.78);border-radius:0 0 8px 8px;pointer-events:none;"></span>'
    + '<span class="lk" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:16px;background:rgba(8,10,14,.72);border-radius:8px;">🔒</span>';
  s.title = `${m.nome} — ${m.desc} (nível ${m.nivel} · ${m.mana} mana · ${m.cd}s)`;
  s.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); lancaMagia(m); });
  s.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
  barraMagias.appendChild(s); slotsMagia.push(s);
});
window.addEventListener('keydown', (e) => {
  const k = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4 }[e.code];
  if (k !== undefined && jogoIniciado) lancaMagia(MAGIAS[k]);
});

// NOMES DE LUGARES (estilo Tibia) — mostra o bairro/rua onde você está
const DISTRITOS = [
  // VENORE — a CIDADE MERCANTE (RV4.0, principal). Entradas mais específicas
  // primeiro (a checagem pega a mais próxima dentro do raio).
  { nome: 'Praça do Grande Mercado', x: -320, z: -30, raio: 17 },
  { nome: 'Canal de Venore', x: -352, z: -20, raio: 13 },
  { nome: 'Porto de Venore', x: -330, z: -90, raio: 17 },
  { nome: 'Torre do Depósito', x: -296, z: -54, raio: 11 },
  { nome: 'Portão de Venore', x: -240, z: -30, raio: 12 },
  { nome: 'Largo das Guildas', x: -320, z: 20, raio: 14 },
  { nome: 'Catedral de Venore', x: -390, z: 16, raio: 14 },
  { nome: 'Cripta da Catedral', x: -398, z: 33, raio: 7 },
  { nome: 'Bairro dos Armazéns', x: -294, z: -86, raio: 18 },
  { nome: 'Brejo Profundo', x: -278, z: -126, raio: 26 },
  { nome: 'VENORE — Cidade Mercante', x: -330, z: -20, raio: 112 },
  { nome: 'Estrada do Pântano', x: -168, z: -30, raio: 80 },
  // Vilarejo de Venor (a antiga cidadezinha onde tudo começou)
  { nome: 'Praça do Vilarejo de Venor', x: 0, z: 0, raio: 18 },
  { nome: 'Rua do Mercado', x: 16, z: 0, raio: 16 },
  { nome: 'Templo Sagrado', x: 0, z: -30, raio: 15 },
  { nome: 'Largo da Escola', x: 0, z: 28, raio: 15 },
  { nome: 'Ponte do Riacho', x: 16, z: 78, raio: 14 },
  { nome: 'Beira do Lago', x: 45, z: 80, raio: 22 },
  { nome: 'Floresta do Oeste', x: -88, z: 0, raio: 45 },
  { nome: 'Ninho das Aranhas', x: -146, z: -66, raio: 16 },
  { nome: 'Bairro do Comércio', x: 0, z: -95, raio: 26 },
  { nome: 'Moinho de Venor', x: -44, z: -74, raio: 12 },
  { nome: 'Cais do Vilarejo', x: 45, z: 64, raio: 14 },
  { nome: 'Farol do Porto', x: 66, z: 84, raio: 10 },
  { nome: 'Caminho de Thais', x: 300, z: 0, raio: 250 },
  { nome: 'Vale dos Monstros', x: 200, z: 90, raio: 70 },
  { nome: 'Portão de Thais', x: 502, z: 0, raio: 14 },
  { nome: 'Cidade de Thais', x: 560, z: 0, raio: 60 },
  { nome: 'Praia de Venor', x: 0, z: -222, raio: 90 },
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
  let nome = 'Terras de Venor', melhorD = Infinity;
  if (noEsgoto) nome = subsoloAtual === catacumbas ? 'Catacumbas de Venore' : 'Esgoto';
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
    { const tEl = document.getElementById('tituloVenor'); if (tEl) tEl.remove(); } // título sai de cena
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
      // KIT POR VOCAÇÃO (RV5.1): cada vocação nasce com a SUA identidade
      const voc = coresJogador.tipo;
      if (voc === 'cavaleiro') {
        inventario.addItem({ nome: 'Adaga', icone: '🗡️', slot: 'maoDir', dano: 8, arma: true });
        inventario.addItem({ nome: 'Escudo', icone: '🛡️', slot: 'maoEsq', defesa: 4 });
        setTimeout(() => mostraMensagem('⚔️ CAVALEIRO: Adaga e Escudo na mochila — clique pra equipar e vá pro corpo a corpo!'), 2600);
      } else if (voc === 'paladino') {
        inventario.addItem({ nome: 'Arco', icone: '🏹', slot: 'maoDir', dano: 10, arma: true, arco: true });
        for (let q = 0; q < 24; q++) inventario.addItem({ nome: 'Flecha', icone: '➹' });
        setTimeout(() => mostraMensagem('🏹 PALADINO: Arco + 24 Flechas — cace de LONGE! Virotes (Falk/Tonho) batem +4.'), 2600);
      } else if (voc === 'feiticeiro') {
        inventario.addItem({ nome: 'Runa de Fogo', icone: '🔥', slot: 'runa', usavel: 'runaFogo' });
        inventario.addItem({ nome: 'Runa de Fogo', icone: '🔥', slot: 'runa', usavel: 'runaFogo' });
        setTimeout(() => mostraMensagem('🔮 FEITICEIRO: 2 Runas de Fogo — e as magias (teclas 1-5) são sua verdadeira arma.'), 2600);
      } else if (voc === 'druida') {
        for (let q = 0; q < 3; q++) inventario.addItem({ nome: 'Poção de Vida', icone: '🧪', slot: 'pocao', usavel: 'pocao' });
        setTimeout(() => mostraMensagem('🌿 DRUIDA: 3 Poções de Vida — a natureza cura quem cuida dela.'), 2600);
      }
    } else {
      mostraMensagem(`💾 Bem-vindo de volta, ${nome}! Sua conta foi carregada.`);
    }
    if (window.__btnSalvar) window.__btnSalvar.style.display = 'flex';
    barraMagias.style.display = 'flex'; // barra de magias estilo Diablo (teclas 1-5 / toque)
    hud.mana(mana, MANA_MAX);
    // CONTA DEV/GM: entrar com o nome "gm", "adm" ou "dev" libera os poderes
    if (['gm', 'adm', 'dev'].includes(nome.trim().toLowerCase())) {
      ativaGM();
      mostraMensagem('🛡️ Conta DEV/GM ativada — aperte G pra abrir o painel de poderes!');
    }
    if (urlMP) {
      rede = conectarRede({ url: urlMP, scene, getEstadoLocal: estadoLocal });
      // ☁️ CONTA NA NUVEM (RV5.0): trata as respostas do servidor de contas
      rede.defineOuvinteConta((msg) => {
        if (msg.acao === 'salvar') {
          if (!msg.ok) mostraMensagem('☁️ A nuvem recusou: ' + (msg.erro || 'erro desconhecido'));
        } else if (msg.acao === 'carregar') {
          if (!msg.ok) { mostraMensagem('☁️ ' + (msg.erro || 'Nada salvo na nuvem ainda.')); return; }
          localStorage.setItem('venor_conta_' + nomeJogador.trim().toLowerCase(), msg.dados);
          mostraMensagem('☁️ Save da nuvem aplicado — recarregando o jogo...');
          setTimeout(() => location.reload(), 1400);
        }
      });
    }
  },
});

// =============================================================
//  ☁️ CONTA NA NUVEM (RV5.0) · nome + PIN guardam o save no servidor
//  (Railway). Depois do 1º envio, o autosave de 10s sobe junto.
// =============================================================
let nuvemPin = null;
function pegaPinNuvem() {
  const chave = 'venor_pin_' + nomeJogador.trim().toLowerCase();
  let pin = nuvemPin || localStorage.getItem(chave) || '';
  if (!/^\d{4,10}$/.test(pin)) {
    pin = (window.prompt('☁️ PIN da conta (4 a 10 dígitos — crie um novo ou informe o seu):') || '').trim();
    if (!/^\d{4,10}$/.test(pin)) { mostraMensagem('PIN inválido — use só dígitos (4 a 10).'); return null; }
    localStorage.setItem(chave, pin);
  }
  nuvemPin = pin;
  return pin;
}
function enviaSaveNuvem(pin, avisa) {
  salvaJogo();
  const dados = localStorage.getItem('venor_conta_' + nomeJogador.trim().toLowerCase());
  if (!dados || !rede || !rede.conectado) return;
  rede.enviaConta({ tipo: 'contaSalvar', nome: nomeJogador.trim().toLowerCase(), pin, dados });
  if (avisa) mostraMensagem('☁️ Save enviado pra nuvem! (agora sobe sozinho a cada 10s)');
}
function abreNuvem() {
  if (!jogoIniciado) { mostraMensagem('Entre no jogo primeiro. ☁️'); return; }
  if (!rede || !rede.conectado) { mostraMensagem('☁️ Sem conexão com o servidor agora — tente de novo em instantes.'); return; }
  const ops = [
    { texto: '📤 Enviar meu save pra nuvem', onClick: () => { dialogo.fecha(); const pin = pegaPinNuvem(); if (pin) enviaSaveNuvem(pin, true); } },
    { texto: '📥 Baixar da nuvem (substitui o local)', onClick: () => { dialogo.fecha(); const pin = pegaPinNuvem(); if (pin) rede.enviaConta({ tipo: 'contaCarregar', nome: nomeJogador.trim().toLowerCase(), pin }); } },
    { texto: 'Fechar', onClick: () => dialogo.fecha() },
  ];
  dialogo.abre('☁️ Conta na Nuvem', 'Vincule sua conta com um PIN: o save fica guardado no servidor e você joga de QUALQUER aparelho com o mesmo nome + PIN.', ops);
}
{ // botão ☁️ (abaixo do 🔊)
  const b = document.createElement('div');
  b.textContent = '☁️';
  b.title = 'Conta na nuvem (save no servidor)';
  b.style.cssText = 'position:fixed;top:182px;left:14px;width:48px;height:48px;z-index:41;display:flex;'
    + 'align-items:center;justify-content:center;font-size:20px;cursor:pointer;user-select:none;'
    + 'background:rgba(16,22,32,.8);border:1px solid #3a4654;border-radius:12px;';
  b.addEventListener('pointerdown', (e) => { e.stopPropagation(); abreNuvem(); });
  document.body.appendChild(b);
}

// PRÉ-COMPILA todos os shaders agora (no carregamento). Sem isto, o three.js
// compila o shader de cada material novo na PRIMEIRA vez que ele aparece na
// tela — era a "travada do nada" ao explorar o mapa.
// No celular, compilar o mapa inteiro de uma vez pode derrubar o WebGL; fazemos
// aquecimento leve/assíncrono e deixamos o primeiro frame entrar sem travar.
if (!ehMobile) {
  esgoto.grupo.visible = true; // inclui o subsolo no aquecimento do PC
  renderer.compile(scene, camera);
  esgoto.grupo.visible = false;
} else if (renderer.compileAsync) {
  const vis = esgoto.grupo.visible;
  esgoto.grupo.visible = false;
  renderer.compileAsync(scene, camera).catch(() => {}).finally(() => { esgoto.grupo.visible = vis; });
}

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
    if (movendo && !morto) { // morto não anda
      const frenteX = -Math.sin(cam.yaw), frenteZ = -Math.cos(cam.yaw);
      const direitaX = Math.cos(cam.yaw), direitaZ = -Math.sin(cam.yaw);
      let mx = frenteX * (-inp.z) + direitaX * inp.x;
      let mz = frenteZ * (-inp.z) + direitaZ * inp.x;
      const len = Math.hypot(mx, mz);
      if (len > 0) { mx /= len; mz /= len; }
      let vel = CONFIG3D.velocidade;
      if (correndo) vel *= 1.8;
      if (abaixado) vel *= 0.55;
      if (montado && !noEsgoto) vel *= MONTARIA_VEL[petTipo] || 1.3; // MONTARIA: velocidade por raça
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
    let solo = noEsgoto ? chaoY : alturaTerreno(avatar.position.x, avatar.position.z);
    if (montado && !noEsgoto) solo += MONTARIA_SELA[petTipo] || 0.6; // sela: avatar sobe na garupa
    if (avatar.position.y <= solo) { avatar.position.y = solo; vy = 0; noChao = true; }
    const escalaY = abaixado ? 0.6 : 1;
    avatar.scale.y += (escalaY - avatar.scale.y) * Math.min(1, dt * 12);
    animaAvatar(avatar, movendo && noChao, tempo, correndo);
    ultimoAnim = { mov: movendo && noChao, corr: correndo, abx: abaixado };

    // AÇÃO (tecla E / botão): mesma rotina do clique do mouse
    if (controles.querAgir() && !morto) executaAcao();
    if (gesto > 0) {
      gesto = Math.max(0, gesto - dt * 3);
      const p = avatar.userData.partes;
      if (p) p.bracoDir.rotation.x = -Math.sin((1 - gesto) * Math.PI) * 1.6;
    }

    // DICA de ação (Roblox-style): o que a tecla E / botão AÇÃO faz aqui perto
    let dica = null;
    if (noEsgoto) {
      for (const a of subsoloAtual.acessos) { if (Math.hypot(avatar.position.x - a.x, avatar.position.z - a.z) < 2.8) { dica = 'Subir pela corda 🪢'; break; } }
      if (!dica) { const itE = achaInterativo(); if (itE) dica = itE.acao || itE.titulo; }
      if (!dica && corpseProximo()) dica = 'Saquear o corpo 💀';
      if (!dica && alvoRato(alcanceAtaque())) dica = alcanceAtaque() > 3 ? 'Atirar 🏹' : 'Atacar ⚔️';
    } else {
      const it = achaInterativo();
      const domD = domavelProximo();
      if (it) dica = it.acao || it.titulo;
      else if (domD) dica = `Domar ${domD.nome} (${domD.item}) 🐾`;
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
    // sem alocar array novo a cada frame (o .filter criava lixo pro GC 60×/s
    // → picos de pausa = "imagem trava mas o boneco continua andando")
    occTmp.length = 0;
    if (noEsgoto) occTmp.push(esgoto.grupo);
    else for (const s of solidos) { if (s.position.distanceToSquared(avatar.position) < 500) occTmp.push(s); }
    const occ = occTmp;
    const hits = raycaster.intersectObjects(occ, true);
    let dist = distMax;
    // sprites (marcadores 🏠/🚪/🐾) NÃO ocluem a câmera — só geometria sólida
    for (const h of hits) {
      if (h.object.isSprite) continue;
      if (h.distance < distMax) dist = Math.max(3, h.distance - 0.6);
      break;
    }
    // OLHAR PRO CÉU (Roblox/Minecraft): com pitch negativo a câmera desceria
    // pro subsolo — em vez disso ela DESLIZA pelo raio e para rente ao chão,
    // apontando pra cima (o personagem fica na base da tela e o céu aparece).
    if (dir.y < 0) {
      const chaoFoco = (noEsgoto ? chaoY : alturaTerreno(foco.x, foco.z)) + 0.45;
      const tChao = (foco.y - chaoFoco) / -dir.y;
      if (tChao < dist) dist = Math.max(1.1, tChao);
    }
    const posCam = foco.clone().add(dir.multiplyScalar(dist));
    // segurança extra nas encostas: nunca deixa a câmera abaixo do chão local
    const chaoCam = (noEsgoto ? chaoY : alturaTerreno(posCam.x, posCam.z)) + 0.35;
    if (posCam.y < chaoCam) posCam.y = chaoCam;
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
  if (gato && !noEsgoto) {
    const uG = gato.userData;
    if (montado) {
      // MONTADO: o pet vira a "sela" — fica exatamente embaixo do avatar
      gato.position.set(avatar.position.x, alturaTerreno(avatar.position.x, avatar.position.z), avatar.position.z);
      gato.rotation.y = avatar.rotation.y;
      const dxm = gato.position.x - (uG._px ?? gato.position.x), dzm = gato.position.z - (uG._pz ?? gato.position.z);
      const trotando = Math.hypot(dxm, dzm) > 0.01;
      uG._px = gato.position.x; uG._pz = gato.position.z;
      if (uG.patas) { const sp = trotando ? Math.sin(tempo * 14) * 0.7 : 0; uG.patas.forEach((p, i) => { p.rotation.x = i % 2 ? -sp : sp; }); }
    } else if (petAlvo && petAlvo.vivo && !petAlvo.corpse) {
      // PET DE COMBATE: corre pro bicho que você atacou e morde junto
      const pg = petAlvo.g;
      // desiste se o alvo ficou longe OU está noutro "andar" (ex.: rato do esgoto)
      if (Math.hypot(pg.position.x - avatar.position.x, pg.position.z - avatar.position.z) > 16
        || Math.abs(pg.position.y - gato.position.y) > 6) petAlvo = null;
      else {
        const dxp = pg.position.x - gato.position.x, dzp = pg.position.z - gato.position.z, dp = Math.hypot(dxp, dzp);
        if (dp > 1.5) {
          const vP = Math.min(dp - 1.2, 6.5 * dt);
          gato.position.x += (dxp / dp) * vP; gato.position.z += (dzp / dp) * vP;
          gato.rotation.y = Math.atan2(dxp, dzp);
          if (uG.patas) { const sp = Math.sin(tempo * 16) * 0.6; uG.patas.forEach((p, i) => { p.rotation.x = i % 2 ? -sp : sp; }); }
        } else if (tempo > petProxMordida) {
          petProxMordida = tempo + 1.2;
          const dnP = PET_DANO[petTipo] || 2;
          petAlvo.hp -= dnP; petAlvo.piscar = 0.15;
          if (pg.userData.corpoMat) pg.userData.corpoMat.emissive.setHex(0x882020);
          if (petAlvo.hp <= 0) { mataBicho(petAlvo); petAlvo = null; }
        }
      }
      gato.position.y = alturaTerreno(gato.position.x, gato.position.z);
    } else {
      if (petAlvo && (!petAlvo.vivo || petAlvo.corpse)) petAlvo = null;
      atualizaGato(gato, avatar, dt, tempo); // pet (se domado) espera na superfície
      gato.position.y = alturaTerreno(gato.position.x, gato.position.z); // gruda no relevo
    }
  }
  // SOMBRAS NO MUNDO TODO: a câmera de sombra do sol acompanha o jogador
  // (antes ficava presa na origem — Thais, praia e colinas ficavam sem sombra)
  if (!ehMobile) {
    sun.position.set(avatar.position.x + 70, 100, avatar.position.z + 50);
    sun.target.position.set(avatar.position.x, 0, avatar.position.z);
  }
  // pets selvagens perambulam perto do ponto deles (esperando um domador)
  for (const d of domaveisVivos) {
    d.pausa -= dt;
    if (d.pausa > 0) continue;
    const ddx = d.alvo.x - d.g.position.x, ddz = d.alvo.z - d.g.position.z, dd = Math.hypot(ddx, ddz);
    if (dd < 0.3) { d.pausa = 1 + Math.random() * 3; d.alvo = { x: d.base.x + (Math.random() - 0.5) * 7, z: d.base.z + (Math.random() - 0.5) * 7 }; continue; }
    d.g.position.x += (ddx / dd) * 1.2 * dt;
    d.g.position.z += (ddz / dd) * 1.2 * dt;
    if (!d.y) d.g.position.y = alturaTerreno(d.g.position.x, d.g.position.z); // segue o relevo
    d.g.rotation.y = Math.atan2(ddx, ddz);
    const uD = d.g.userData;
    if (uD.patas) { const sp = Math.sin(tempo * 10 + d.fase) * 0.45; uD.patas.forEach((p, i) => { p.rotation.x = i % 2 ? -sp : sp; }); }
  }
  animaProps(animados, dt, tempo);
  atualizaNPCs(npcs, dt, colide, ehNoite);
  atualizaRatos(ratos, dt, jogoIniciado ? { x: avatar.position.x, y: avatar.position.y, z: avatar.position.z } : null, podeAndarBicho, alturaTerreno);

  // VOO DO DRAGÃO: de tempos em tempos ele decola do pico, plana sobre Venore
  // atrás de comida e volta — dá pra ver ele cruzando o céu da cidade!
  if (dragao.vivo && !dragao.corpse) {
    if (!vooDragao.ativo) {
      vooDragao.proximo -= dt;
      if (vooDragao.proximo <= 0) { vooDragao.ativo = true; vooDragao.t = 0; vooDragao.avisou = false; dragao.voando = true; mostraMensagem('🐉 O dragão levantou voo da montanha...'); }
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
        // RV3.0: o voo virou PERIGO de verdade — sobre a cidade ele cospe
        // fogo que vira LAVA no chão (campos temporários queimam ao pisar)
        if (t > 0.42 && t < 0.78) {
          if (!vooDragao.avisou) { vooDragao.avisou = true; mostraMensagem('🔥 O dragão mergulha CUSPINDO FOGO sobre Venore — saia do caminho!'); }
          if (Math.random() < 0.008) criaLavaTemp(px + (Math.random() - 0.5) * 12, pz + (Math.random() - 0.5) * 12, alturaTerreno(px, pz));
        }
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
    if (dI < 1.9 && jogoIniciado) {
      mostraMensagem(p.fogo ? `🔥 Bola de fogo do dragão! (-${p.dano})` : `🔮 Rajada mágica do beholder! (-${p.dano})`);
      recebeDano(p.dano); // Utamo absorve primeiro
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
        const f = addMonstro(criaAranhaPequena(aranhaMae.g.position.x + 2, aranhaMae.g.position.z + 2), 10, 3, 3, 2.8, false, aranhaMae.bounds, { veneno: true, filhote: true, especie: 'aranhaPequena' });
        scene.add(f.g);
        aplicaGLBEm(f); // nasce já com o modelo 3D, se a espécie tiver .glb
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
          if (r.veneno && Math.random() < 0.35 && tempo > envenenadoAte) { // mordida venenosa
            envenenadoAte = tempo + 6;
            mostraMensagem('🕷️ Você foi ENVENENADO pela mordida! (6s)');
          }
          if (recebeDano(Math.max(1, (r.dano || 5) - defesa))) break; // Utamo absorve primeiro
        }
      }
    }
    // CAMPOS DE CHÃO (Tibia): lava queima na hora; lodo do pântano envenena
    if (!gmImortal && noChao && !noEsgoto) {
      for (let ci = 0; ci < CAMPOS.length + camposTemp.length; ci++) { // fixos + lava do dragão (sem concat/alocação)
        const c = ci < CAMPOS.length ? CAMPOS[ci] : camposTemp[ci - CAMPOS.length];
        if (Math.abs(avatar.position.y - c.y) > 2.5) continue;
        if (Math.hypot(avatar.position.x - c.x, avatar.position.z - c.z) > c.r) continue;
        if (c.tipo === 'lava') {
          if (tempo > proxTickLava) {
            proxTickLava = tempo + 0.6;
            mostraMensagem('🔥 A LAVA QUEIMA! (-8) Saia já!');
            recebeDano(8);
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
      mostraMensagem(`🟢 Veneno... (-2) ${Math.ceil(envenenadoAte - tempo)}s`);
      recebeDano(2);
    }
    if (!morto && vida < VIDA_MAX) { vida = Math.min(VIDA_MAX, vida + dt * 0.5); hud.vida(vida, VIDA_MAX); } // regen lenta (morto não regenera)
    if (morto && tempo > mortoAuto) renasce(); // rede de segurança: volta sozinho em 12s
    // MANA regenera + LUX te acompanha + barra de magias (cadeado/cooldown)
    mana = Math.min(MANA_MAX, mana + dt * 0.35); // regen LENTA (Tibia): mana cheia leva ~2,4 min
    if (Math.floor(mana) !== manaMostrada) { manaMostrada = Math.floor(mana); hud.mana(mana, MANA_MAX); }
    if (tempo < luxAte) {
      luzLux.intensity = 1.8;
      luzLux.position.set(avatar.position.x, avatar.position.y + 2.8, avatar.position.z);
    } else luzLux.intensity = 0;
    if (tempo > proxAttBarra) {
      proxAttBarra = tempo + 0.15;
      const nv = hud.estado().nivel;
      MAGIAS.forEach((mg, i) => {
        const s = slotsMagia[i];
        s.querySelector('.lk').style.display = nv >= mg.nivel ? 'none' : 'flex';
        const resta = (cdMagias[mg.id] || 0) - tempo;
        s.querySelector('.cd').style.height = resta > 0 ? Math.min(100, (resta / mg.cd) * 100) + '%' : '0';
      });
    }
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
  // dragões GLB VIVOS: cabeça olha em volta, cauda balança, asas tremem
  for (const dv of dragoesVivos) {
    const tD = tempo + dv.fase;
    if (dv.ossos.cabeca) {
      dv.ossos.cabeca.rotation.y = Math.sin(tD * 0.7) * 0.35;
      dv.ossos.cabeca.rotation.x = Math.sin(tD * 0.45) * 0.14;
    } else dv.raiz.scale.y = dv.escalaBase * (1 + Math.sin(tD * 1.6) * 0.02); // sem osso: respira
    dv.ossos.cauda.forEach((b, i) => { b.rotation.y = Math.sin(tD * 1.1 + i * 0.6) * 0.16; });
    dv.ossos.asas.forEach((b, i) => { b.rotation.z = (i % 2 ? -1 : 1) * Math.sin(tD * 2.2) * 0.22; });
  }
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
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Promessa rejeitada:', ev.reason);
  if (!erroAvisado) {
    erroAvisado = true;
    const msg = ev.reason && ev.reason.message ? ev.reason.message : ev.reason;
    mostraMensagem('⚠️ Erro interno: ' + msg + ' — me mande um print!');
  }
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

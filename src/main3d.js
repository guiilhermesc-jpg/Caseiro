// =============================================================
//  ENTRADA 3D  ·  tela de seleção -> jogo em Venor.
//  Modo SELEÇÃO: boneco girando em preview + overlay de aparência.
//  Modo JOGO: movimento livre, câmera orbital, pular/correr/abaixar.
// =============================================================
import * as THREE from 'three';
import { CONFIG3D } from './config3d.js';
import { criaCidade } from './jogo/cidade.js';
import { alturaColinas, REGIAO } from './jogo/terreno.js';
import { criaAvatar, animaAvatar, giraSuave, MODELO_NOME } from './jogo/avatar.js';
import { criaControles } from './jogo/controles.js';
import { criaGato, atualizaGato, PETS, criaDraptor } from './jogo/pet.js';
import { criaSelecao } from './jogo/selecao.js';
import { conectarRede } from './jogo/rede.js';
import { criaMinimapa } from './jogo/minimapa.js';
import { criaPatchNotes } from './jogo/patchNotes.js';
import { criaQuadroJornadas, pontosJornadaParaMapa, rotasParaMapa } from './jogo/jornadas.js';
import { criaCodice, PEDRAS_VEIO, TESSITURA, VEIOS_MAPA, RELIQUIAS } from './jogo/codice.js';
import { criaBestiario } from './jogo/bestiario.js';
import { precoCompra } from './jogo/calendario.js';
import { criaNPCs, atualizaNPCs } from './jogo/npcs.js';
import { animaProps } from './jogo/props.js';
import { criaInventario } from './jogo/inventario.js';
import { criaDialogo } from './jogo/dialogo.js';
import { criaCustomizar } from './jogo/customizar.js';
import { criaPainelPersonagem } from './jogo/painel.js';
import { criaDragaoData, statsDragao, ganhaXpDragao, hpMaxDe, ESPECIES_DRAGAO, ESTAGIO_INFO } from './jogo/dragoes-companheiro.js';
import { criaEsgoto, criaCatacumbas, criaCriptaProfunda, criaCavernasPico } from './jogo/esgoto.js';
import { criaIrmasIlha1 } from './jogo/irmas.js'; // 🌊 As Irmãs Afundadas (Fase 3)
import { criaDeserto, criaCatedralInterior } from './jogo/deserto.js'; // 🏜️ As Areias do Veio Seco (Fase 3)
import { criaCidadeNuvens } from './jogo/nuvens.js'; // ☁️🐉 Aurélia, a Cidade nas Nuvens
import { criaAtmosfera } from './jogo/atmosfera.js'; // ✨ poeira/pólen no ar (RV11.0)
import { texPBR } from './jogo/texturas.js'; // 💧 normal map de ondas da água (RV11.7)
import { criaMansaoInterior, criaGuildHouseInterior } from './jogo/interiores.js';
import { criaAudio } from './jogo/audio.js';
import { criaRato, criaRatos, atualizaRatos, criaCobra, criaCrocodilo, criaTroll, criaCyclops, criaAranhaGigante, criaAranhaPequena, criaLadrao, criaEscorpiao, criaBeholder, criaDragao, criaDrakari, criaLobo, criaUrso, criaEsqueleto, criaOrc, criaCaranguejo } from './jogo/ratos.js';
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ehMobile ? 1.08 : 1.5)); // RV12.1: PC cap 2->1.5 destrava
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = !ehMobile; // sombras só no PC (no celular pesa muito)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// qualidade de imagem: tonemapping cinematográfico + cor correta
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.80; // contraste mais rico sem estourar branco
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);
defineRendererTexturas(renderer); // texturas IA sobem pra GPU no load (sem engasgo no 1º uso)
// SELO DE VERSÃO na tela: acabou a dúvida de "atualizou ou não?" —
// se o número daqui não bater com o do chat, é cache (Ctrl+Shift+R)
const VERSAO = 'RV16.6 (v117)';
{ // TÍTULO do Patch 2 na tela de entrada (some quando o jogo começa)
  const titulo = document.createElement('div');
  titulo.id = 'tituloVenor';
  titulo.innerHTML = 'VENOR'
    + '<div style="font-size:15px;letter-spacing:6px;color:#e8d9a0;margin-top:2px;">ERA DOS DRAGÕES</div>'
    + '<div style="font-size:11px;letter-spacing:2px;color:#9fb0c0;margin-top:6px;">— PATCH 2 —</div>';
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
const patchNotes = criaPatchNotes();
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
// 💧 ÁGUA VIVA (RV11.7): normal map de ondas COMPARTILHADO em todas as águas;
// o UV desliza no loop → ripples e reflexo (IBL) que se movem de verdade.
const aguaNormal = texPBR(0x33586e, { tipo: 'areia', repeat: 7, contraste: 26, normalForca: 1.5 }).normalMap;
if (aguaNormal) for (const ag of aguas) {
  if (ag && ag.material && !Array.isArray(ag.material)) {
    ag.material.normalMap = aguaNormal;
    ag.material.normalScale = new THREE.Vector2(0.5, 0.5);
    ag.material.roughness = Math.min(ag.material.roughness ?? 0.15, 0.1);
    ag.material.metalness = Math.max(ag.material.metalness ?? 0.3, 0.35);
    ag.material.envMapIntensity = 1.3; // reflete mais o céu/ambiente (só a água)
    ag.material.needsUpdate = true;
  }
}
// RV6.5: luz de recorte "adventure premium". Ela segue a câmera e desenha a
// silhueta do jogador/monstros sem lavar o cenário inteiro.
const luzRecorte = new THREE.DirectionalLight(0xbfd8ff, ehMobile ? 0.14 : 0.46);
luzRecorte.position.set(-28, 28, -28);
luzRecorte.target.position.set(0, 1.8, 0);
scene.add(luzRecorte, luzRecorte.target);
const luzPreenchimentoEstilizado = new THREE.HemisphereLight(0xfff1d2, 0x32442f, ehMobile ? 0.08 : 0.16);
scene.add(luzPreenchimentoEstilizado);
const tmpLuzRecorte = new THREE.Vector3();
let fatorDiaVisual = 0.82;
// liga o bloom na cena + ILUMINAÇÃO DE AMBIENTE (IBL): metais, vidros e água
// passam a refletir o entorno — o salto de "protótipo" pra "premium"
const pcFraco = !ehMobile && ((navigator.hardwareConcurrency || 4) <= 4); // RV12.1: PC de poucos núcleos pula o grading
if (!ehMobile) {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Bloom contido: só emissores reais devem atravessar o threshold.
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 0.34, 0.85, 0.95)); // RV12.1: meia-res = ~1/4 do custo
  // COLOR GRADING CINEMATOGRÁFICO (PC) — receita das referências premium:
  // S-curve fílmica (contraste com pivô, clamp = NUNCA estoura branco),
  // saturação +12%, split-tone (sombras frias / altas levemente quentes),
  // VINHETA de cinema e dither anti-banding no céu/neblina.
  if (!pcFraco) composer.addPass(new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; uniform sampler2D tDiffuse;\n'
      + 'void main(){\n'
      + '  vec4 c = texture2D(tDiffuse, vUv);\n'
      + '  vec3 col = c.rgb;\n'
      + '  col = clamp((col - 0.5) * 1.13 + 0.502, 0.0, 1.0);\n'                                  // S-curve fílmica leve
      + '  float luma = dot(col, vec3(0.299, 0.587, 0.114));\n'
      + '  col = mix(vec3(luma), col, 1.16);\n'                                                    // saturação
      + '  vec3 styl = floor(col * 18.0 + 0.5) / 18.0;\n'
      + '  col = mix(col, styl, 0.12);\n'                                                          // leve lapidação toon
      + '  col += vec3(0.014, 0.018, 0.038) * (1.0 - smoothstep(vec3(0.0), vec3(0.42), col));\n'   // sombras frias
      + '  col = mix(col, col * vec3(1.055, 1.0, 0.93), smoothstep(0.55, 1.0, luma) * 0.48);\n'    // altas quentes
      + '  col = pow(col, vec3(0.965));\n'
      + '  col = clamp(col, 0.0, 1.0);\n'
      + '  float d = distance(vUv, vec2(0.5));\n'
      + '  col *= 1.0 - 0.17 * smoothstep(0.42, 0.84, d);\n'                                       // vinheta de cinema
      + '  col += (fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;\n'     // dither anti-banding
      + '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);\n'
      + '}',
  }));
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.14; // reflexo sutil; sem clarear rostos/grama
}
// ✨ ATMOSFERA (RV11.0): poeira/pólen flutuando no ar, segue o jogador (só PC)
const atmosfera = criaAtmosfera(ehMobile);
scene.add(atmosfera.grupo);
// 🐉 DRAGÃO MAJESTOSO circulando o céu (RV12.3): a arte premium (dragao.png)
// como billboard distante — a sensação épica de "Era dos Dragões".
// RV15.0: o dragão que sobrevoa Venor é um MODELO 3D ANIMADO (asas batendo),
// não mais uma imagem estática. criaDragao(lord) = pele escura + brasa na boca.
const dragaoCeu = criaDragao(0, 0, true);
dragaoCeu.scale.setScalar(7);
dragaoCeu.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; if (o.material) o.material.fog = false; } });
scene.add(dragaoCeu);
function lapidaMaterialPremium(material, forca = 1) {
  if (!material) return;
  const lista = Array.isArray(material) ? material : [material];
  for (const m of lista) {
    if (!m || m.userData?.rv65Lapidado) continue;
    if ('roughness' in m && typeof m.roughness === 'number') {
      m.roughness = Math.min(1, Math.max(0.72, m.roughness + 0.05 * forca));
    }
    if ('metalness' in m && typeof m.metalness === 'number' && m.metalness < 0.18) {
      m.metalness = Math.max(0, m.metalness * 0.55);
    }
    if ('envMapIntensity' in m) m.envMapIntensity = Math.min(0.2, m.envMapIntensity ?? 0.12);
    m.userData = { ...(m.userData || {}), rv65Lapidado: true };
    m.needsUpdate = true;
  }
}
function lapidaObjetoPremium(root, forca = 1) {
  root.traverse((o) => { if (o.isMesh) lapidaMaterialPremium(o.material, forca); });
}
lapidaObjetoPremium(scene, 0.7);
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
const GEO_SOMBRA_CONTATO = new THREE.CircleGeometry(1, 28);
const sombrasContato = [];
let sombraAvatar = null, sombraPet = null;
function criaSombraContato(alvo, rx = 0.82, rz = 0.56, op = 0.18) {
  const matSombra = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: op,
    depthWrite: false,
    fog: false,
  });
  const mesh = new THREE.Mesh(GEO_SOMBRA_CONTATO, matSombra);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 0;
  scene.add(mesh);
  const s = { mesh, mat: matSombra, alvo, rx, rz, op };
  sombrasContato.push(s);
  return s;
}
function sombraBicho(r) {
  const boss = r.boss || r.dragao;
  const grande = r.especie === 'aranha' || r.especie === 'beholder' || r.especie === 'ciclope' || r.especie === 'vorag' || r.especie === 'arconteDrakari';
  const rx = r.dragao ? 4.6 : boss ? 2.1 : grande ? 1.55 : 0.78;
  const rz = r.dragao ? 3.1 : boss ? 1.35 : grande ? 1.05 : 0.52;
  const op = r.dragao ? 0.2 : boss ? 0.18 : 0.13;
  r.sombraContato = criaSombraContato(r.g, rx, rz, op);
  return r.sombraContato;
}
function atualizaSombrasContato() {
  for (const s of sombrasContato) {
    const a = s.alvo;
    if (!a) { s.mesh.visible = false; continue; }
    const visivel = a.visible !== false && !!a.parent && a.parent.visible !== false;
    if (!visivel) { s.mesh.visible = false; continue; }
    let y = a.position.y;
    if (!noEsgoto && y > -5) y = alturaTerreno(a.position.x, a.position.z);
    const altitude = Math.max(0, a.position.y - y);
    const escalaAlt = 1 + Math.min(1.45, altitude * 0.022);
    s.mesh.visible = true;
    s.mesh.position.set(a.position.x, y + 0.035, a.position.z);
    s.mesh.scale.set(s.rx * escalaAlt, s.rz * escalaAlt, 1);
    s.mat.opacity = s.op * Math.max(0.18, 1 - altitude * 0.018);
  }
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
let velAvatarX = 0, velAvatarZ = 0;

// GRADE ESPACIAL de colisão: o mundo cresceu (centenas de obstáculos) e varrer
// a lista inteira a cada passo travava — agora cada célula de 24u guarda só os
// colisores que a tocam, e cada checagem olha ~5-20 caixas em vez de ~700.
const CELULA = 24, gradeCol = new Map();
function indexaCol(o) {
  const x0 = Math.floor((o.minX - 1.2) / CELULA), x1 = Math.floor((o.maxX + 1.2) / CELULA);
  const z0 = Math.floor((o.minZ - 1.2) / CELULA), z1 = Math.floor((o.maxZ + 1.2) / CELULA);
  for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
    const k = cx * 4096 + cz;
    let arr = gradeCol.get(k); if (!arr) gradeCol.set(k, arr = []);
    arr.push(o);
  }
}
for (const o of obstaculos) indexaCol(o);
// colisor adicionado DEPOIS da grade (ex.: estruturas do deserto) entra na
// lista E no índice espacial — senão não colide.
function addColisorMundo(o) { obstaculos.push(o); indexaCol(o); }
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
    for (const o of cavernasPico.colisores) {
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
// CAVERNAS DO PICO (RV5.8): a 3ª masmorra, por dentro da Montanha do Dragão
const cavernasPico = criaCavernasPico(); scene.add(cavernasPico.grupo);
cavernasPico.grupo.visible = false;
// AS IRMÃS AFUNDADAS (RV10.5): Ilha 1 — A Quebra-Mar, zona carregada além-mar
const irmas1 = criaIrmasIlha1(); scene.add(irmas1.grupo);
irmas1.grupo.visible = false;
// AS AREIAS DO VEIO SECO (RV10.7): deserto do sudeste + Catedral da Lua Coada.
// Colisores entram no índice tardio (a grade já foi montada acima).
const deserto = criaDeserto(); scene.add(deserto.grupo);
deserto.colisores.forEach(addColisorMundo);
// A NAVE PROFANADA (RV10.8): interior da Catedral da Lua Coada, zona carregada
const catedralI = criaCatedralInterior(); scene.add(catedralI.grupo);
catedralI.grupo.visible = false;
// AURÉLIA, A CIDADE NAS NUVENS (RV13.0): base dos dragões, zona carregada celeste
const aurelia = criaCidadeNuvens(); scene.add(aurelia.grupo);
aurelia.grupo.visible = false;
// emissivos que PULSAM com o bloom (RV11.2): a Veia presa, a rosácea e os vitrais
// respiram — efeito mágico premium.
const glowsPulsantes = [...(deserto.glows || []), ...(catedralI.glows || [])];
glowsPulsantes.forEach((m, i) => { m.userData._base = m.emissiveIntensity; m.userData._ph = i * 1.3; });
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
  sombraBicho(r);
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
  { tipo: 'lava', x: -747, z: -32, r: 4.2, y: 0 },   // Fenda da Lua Partida
  { tipo: 'lava', x: -737, z: -25, r: 3.4, y: 0 },
  { tipo: 'veneno', x: -716, z: -58, r: 5.2, y: 0 }, // cinza toxica do ermo
  { tipo: 'veneno', x: -770, z: -54, r: 4.6, y: 0 },
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
const visuaisDragao = [];
function estilizaMalhaDragao(o, lord = false, tinta = null) {
  if (!o.isMesh || !o.material) return;
  o.material = o.material.clone();
  if (o.material.color) {
    if (tinta) o.material.color.lerp(new THREE.Color(tinta), 0.48);
    else o.material.color.lerp(new THREE.Color(lord ? 0x8e2419 : 0x4f7a43), 0.22);
  }
  o.material.roughness = Math.min(0.96, Math.max(0.68, o.material.roughness ?? 0.78));
  o.material.metalness = Math.min(0.08, o.material.metalness ?? 0.02);
  if ('flatShading' in o.material) o.material.flatShading = true;
  if (o.material.emissive) {
    o.material.emissive.setHex(lord ? 0x3a0900 : 0x071407);
    o.material.emissiveIntensity = lord ? 0.16 : 0.055;
  }
  lapidaMaterialPremium(o.material, 0.8);
  o.material.needsUpdate = true;
}
function criaBrasaDragao(lord = false, escala = 1) {
  const g = new THREE.Group();
  g.name = 'brasaDragaoPremium';
  const cor = lord ? 0xff3d12 : 0xff8f24;
  const matNucleo = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.74, depthWrite: false });
  const matHalo = new THREE.MeshBasicMaterial({ color: lord ? 0xff7a22 : 0xffcf64, transparent: true, opacity: 0.34, depthWrite: false });
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.2 * escala, 10, 8), matNucleo);
  g.add(nucleo);
  const chama = new THREE.Mesh(new THREE.ConeGeometry(0.24 * escala, 0.9 * escala, 7), matHalo);
  chama.rotation.x = Math.PI / 2;
  chama.position.z = 0.42 * escala;
  g.add(chama);
  const fumaca = [];
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry((0.05 + i * 0.018) * escala, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0x2d2a26, transparent: true, opacity: 0.18, depthWrite: false }));
    p.position.set((Math.random() - 0.5) * 0.36 * escala, (Math.random() - 0.5) * 0.18 * escala, (-0.1 - i * 0.22) * escala);
    g.add(p); fumaca.push(p);
  }
  const luz = new THREE.PointLight(cor, ehMobile ? 0 : 1.1, 16 * escala, 2.2);
  g.add(luz);
  g.userData = { nucleo, chama, fumaca, matNucleo, matHalo, luz, fase: Math.random() * 6, escala };
  visuaisDragao.push(g);
  return g;
}
function instalaBrasaDragao(grupo, modelo, lord = false, escala = 1) {
  const antigo = grupo.getObjectByName('brasaDragaoPremium');
  if (antigo) grupo.remove(antigo);
  const box = new THREE.Box3().setFromObject(modelo || grupo);
  const tam = new THREE.Vector3(); box.getSize(tam);
  const brasa = criaBrasaDragao(lord, escala);
  brasa.position.set(0, Math.max(3.4, tam.y * 0.62), Math.max(2.2, tam.z * 0.38));
  grupo.add(brasa);
  grupo.userData.fogoBoca = brasa;
}
// veste o modelo GLB no grupo do dragão (também usado no RESPAWN/Dragon Lord)
function aplicaModeloDragao() {
  if (!modeloDragaoGLB) return;
  while (dragao.g.children.length) dragao.g.remove(dragao.g.children[0]); // tira as peças blocky
  dragao.g.add(modeloDragaoGLB);
  dragao.g.userData = { tipo: 'boss' }; // sem corpoMat (os guards cuidam do "piscar")
  // Dragon LORD = brasas na pele; verde = normal
  modeloDragaoGLB.traverse((o) => {
    estilizaMalhaDragao(o, dragao.lord);
  });
  instalaBrasaDragao(dragao.g, modeloDragaoGLB, dragao.lord, dragao.lord ? 1.35 : 1.15);
}
new GLTFLoader().load('modelos/dragao.glb', (gltf) => {
  const modelo = gltf.scene;
  // AUTO-ESCALA: mede o modelo (cada GLB vem num tamanho) e escala pra
  // porte de CHEFE (~12u), assentado no chão e centralizado
  const cx1 = new THREE.Box3().setFromObject(modelo);
  const tam = new THREE.Vector3(); cx1.getSize(tam);
  const s = 15.2 / (Math.max(tam.x, tam.y, tam.z) || 1);
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
      estilizaMalhaDragao(o, dragao.lord);
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
  base.scale.setScalar(13.4 / (Math.max(tamB.x, tamB.y, tamB.z) || 1));
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
        estilizaMalhaDragao(o, false, tinta);
      }
    });
    const g = new THREE.Group(); g.position.set(x, 0, z); g.add(inst);
    g.userData = { tipo: 'boss' };
    instalaBrasaDragao(g, inst, false, tinta ? 1.0 : 0.92);
    const rDrag = { g, hp: 220, hpMax: 220, xp: 120, dano: 22, vel: 1.5, forte: true, boss: true, especie: 'dragao', bounds: areaMon(x, z, 14), y0: 0, alvo: { x, z }, pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0, lootEspecial: { nome: 'Escama de Dragão', icone: '🐲' }, atira: 'fogo', alcanceTiro: 15, danoTiro: 18, cadencia: 4.5, tiroAltura: 6.5 };
    ratos.push(rDrag); sombraBicho(rDrag);
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
  { arquivo: 'drakari', especie: 'drakari', tam: 3.8 },
  { arquivo: 'drakari', especie: 'drakariElite', tam: 4.6 },
  { arquivo: 'drakari', especie: 'arconteDrakari', tam: 8.4 },
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
  base.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true; o.frustumCulled = false; o.raycast = () => {};
      lapidaMaterialPremium(o.material, 0.9);
    }
  });
  return base;
}
function aplicaGLBEm(r) { // veste o modelo da espécie num bicho (spawn novo incluso)
  const base = baseGLBPorEspecie[r.especie];
  if (!base) return false;
  const inst = cloneSkinned(base);
  // o .clone() NÃO carrega o override de raycast — re-blinda o clone novo
  inst.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true; o.frustumCulled = false; o.raycast = () => {};
      lapidaMaterialPremium(o.material, 0.9);
    }
  });
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
// CAVERNAS DO PICO (RV5.8): escorpiões e trolls no calor da lava (y = -40)
[[88, 282], [112, 298], [104, 278]].forEach(([x, z]) => {
  const e = criaEscorpiao(x, z); e.position.y = -40;
  addMonstro(e, 22, 8, 6, 2.1, false, areaMon(100, 290, 18), { veneno: true, especie: 'escorpiao', y0: -40 });
});
[[90, 298], [116, 284]].forEach(([x, z]) => {
  const tr = criaTroll(x, z); tr.position.y = -40;
  addMonstro(tr, 40, 14, 9, 1.9, false, areaMon(100, 290, 16), { especie: 'troll', y0: -40 });
});
{ // TROLL ANCIÃO: o dono das cavernas — guarda os cristais há gerações
  const anciao = criaTroll(100, 302); anciao.position.y = -40; anciao.scale.setScalar(1.6);
  addMonstro(anciao, 300, 110, 22, 1.5, true, areaMon(100, 296, 14), {
    boss: true, especie: 'trollAnciao', y0: -40,
    lootEspecial: { nome: 'Cristal do Pico', icone: '💠' },
  });
}
// EVENTO NOTURNO (RV5.7): os mortos do Cemitério Abandonado se ERGUEM à
// noite e viram pó ao amanhecer — o aviso da Gil sempre foi verdade
const ESQUELETOS_NOTURNOS = [];
[[126, -52], [134, -66], [140, -58]].forEach(([x, z]) => {
  const e = criaEsqueleto(x, z);
  const r = addMonstro(e, 30, 12, 7, 1.9, false, areaMon(130, -60, 22), { especie: 'esqueleto', noturno: true });
  r.vivo = false; r.g.visible = false; // dormem de dia
  ESQUELETOS_NOTURNOS.push(r);
});
// NINHO DAS ARANHAS (RV4.6): a Tecelã e as crias na Floresta do Oeste
[[-148, -62], [-141, -68], [-152, -70]].forEach(([x, z]) => addMonstro(criaAranhaPequena(x, z), 12, 4, 4, 2.6, false, areaMon(-146, -66, 13), { veneno: true, especie: 'aranhaPequena' }));
{
  const tecela = criaAranhaGigante(-146, -67); tecela.scale.setScalar(0.8);
  addMonstro(tecela, 180, 55, 14, 2.6, true, areaMon(-146, -66, 12), { veneno: true, especie: 'aranha', lootEspecial: { nome: 'Seda de Aranha', icone: '🕸️' } });
}
// NOCTARIA / ERMO DAS CINZAS (RV6.0): Drakari sao a primeira raca inimiga
// organizada do jogo. Batedores caçam na estrada; elites protegem a Fenda.
[
  [-522, -34, false], [-548, -48, false], [-575, -20, false],
  [-666, -70, false], [-690, -10, false], [-716, -56, true],
  [-734, -4, true], [-770, -36, true],
].forEach(([x, z, elite]) => {
  const d = criaDrakari(x, z, elite);
  if (elite) d.scale.setScalar(1.18);
  addMonstro(d, elite ? 190 : 110, elite ? 90 : 55, elite ? 24 : 17, elite ? 2.05 : 2.35, elite, areaMon(x, z, elite ? 20 : 18), {
    especie: elite ? 'drakariElite' : 'drakari',
    atira: elite ? 'magia' : null,
    alcanceTiro: elite ? 15 : 0,
    danoTiro: elite ? 15 : 0,
    cadencia: elite ? 3.0 : 0,
    lootEspecial: { nome: elite ? 'Fragmento de Obsidiana' : 'Escama Drakari', icone: elite ? '💠' : '🐉' },
  });
});
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
// AS IRMÃS AFUNDADAS · Ilha 1 — A QUEBRA-MAR (RV10.5): fauna do bioma marinho
// (y = -40, na região da zona carregada). Risco baixo, mas o herói que abre a
// Boca já é forte — nada de tutorial: caranguejos/escorpiões/ratos das poças +
// os NÁUFRAGOS DO SAL (a frota que tentou antes, memória cristalizada no sal).
const IRX = 720, IRZ = -700;
const _SAL = new THREE.Color(0xbcd0cf);
function naufragoDoSal(x, z) {
  const e = criaEsqueleto(x, z); e.position.y = -40;
  e.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material) || !o.material.clone) return;
    o.material = o.material.clone(); // não mexer no material compartilhado
    if (o.material.color) o.material.color.lerp(_SAL, 0.6);
    if (o.material.emissive) { o.material.emissive.set(0x16323a); o.material.emissiveIntensity = 0.3; }
  });
  return e;
}
[[IRX - 14, IRZ + 8], [IRX + 16, IRZ - 6], [IRX + 4, IRZ + 16]].forEach(([x, z]) =>
  addMonstro(naufragoDoSal(x, z), 46, 18, 10, 1.8, false, areaMon(IRX, IRZ, 25), { especie: 'esqueleto', y0: -40 }));
[[IRX - 8, IRZ - 12], [IRX + 12, IRZ + 10], [IRX - 18, IRZ + 2]].forEach(([x, z]) => {
  const c = criaCaranguejo(x, z); c.position.y = -40;
  addMonstro(c, 22, 7, 5, 2.2, false, areaMon(IRX, IRZ, 25), { especie: 'caranguejo', y0: -40 });
});
[[IRX + 18, IRZ + 4], [IRX - 4, IRZ - 18]].forEach(([x, z]) => {
  const s = criaEscorpiao(x, z); s.position.y = -40;
  addMonstro(s, 28, 9, 7, 2.1, false, areaMon(IRX, IRZ, 25), { veneno: true, especie: 'escorpiao', y0: -40 });
});
[[IRX + 8, IRZ - 16], [IRX - 16, IRZ - 6]].forEach(([x, z]) => {
  const r2 = criaRato(x, z); r2.position.y = -40;
  addMonstro(r2, 16, 5, 4, 2.4, false, areaMon(IRX, IRZ, 25), { especie: 'rato', y0: -40 });
});
// AS AREIAS DO VEIO SECO · caça do deserto (RV10.7, superfície y=0). Escalada
// de fora pra dentro: escorpiões na borda → cobras/trolls no meio → ciclopes
// guardando a Cidade Soterrada. Posições fora dos colisores das estruturas.
[[550, -100], [572, -125], [558, -148], [500, -330], [470, -290], [645, -360], [590, -420]].forEach(([x, z]) =>
  addMonstro(criaEscorpiao(x, z), 18, 6, 5, 2.0, false, areaMon(x, z, 16), { veneno: true, especie: 'escorpiao' }));
[[520, -265], [585, -300], [545, -345], [640, -390]].forEach(([x, z]) =>
  addMonstro(criaCobra(x, z), 28, 10, 8, 1.5, false, areaMon(x, z, 16), { veneno: true, especie: 'cobra' }));
[[590, -200], [615, -250], [545, -280]].forEach(([x, z]) =>
  addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 14), { especie: 'troll' }));
[[672, -310], [648, -322], [665, -296]].forEach(([x, z]) =>
  addMonstro(criaCyclops(x, z), 150, 60, 18, 1.3, true, areaMon(660, -310, 18), { especie: 'ciclope' }));
// A NAVE PROFANADA · culto da Vigília-Decaída (RV10.8, y=-40 na zona da catedral).
// Drakari e acólitos guardam o altar; VAEL dorme no relicário até despertar.
let vaelCatedral = null;
{
  const rel = catedralI.relicario; // (800, ~-415)
  const vg = criaEsqueleto(rel.x, rel.z + 2); vg.position.y = -40; vg.scale.setScalar(1.9);
  vg.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material) || !o.material.clone) return;
    o.material = o.material.clone();
    if (o.material.color) o.material.color.lerp(new THREE.Color(0x2a2030), 0.7);
    if (o.material.emissive) { o.material.emissive.set(0x4a1f7a); o.material.emissiveIntensity = 0.4; }
  });
  vaelCatedral = addMonstro(vg, 380, 110, 26, 1.3, true, areaMon(rel.x, rel.z + 2, 12), {
    boss: true, especie: 'vaelSanto', y0: -40, lootEspecial: { nome: 'Sudário da Lua Coada', icone: '🌒' },
  });
  vaelCatedral.vivo = false; vaelCatedral.g.visible = false; // dorme até o relicário
  [[793, -395], [807, -398], [795, -406]].forEach(([x, z]) => {
    const d = criaDrakari(x, z); d.position.y = -40;
    addMonstro(d, 110, 55, 17, 2.35, false, areaMon(x, z, 10), { especie: 'drakari', y0: -40, lootEspecial: { nome: 'Escama Drakari', icone: '🐉' } });
  });
  { const de = criaDrakari(806, -410, true); de.position.y = -40; de.scale.setScalar(1.18);
    addMonstro(de, 190, 90, 24, 2.05, true, areaMon(806, -410, 10), {
      especie: 'drakariElite', y0: -40, atira: 'magia', alcanceTiro: 15, danoTiro: 15, cadencia: 3.0,
      lootEspecial: { nome: 'Fragmento de Obsidiana', icone: '💠' } }); }
  [[794, -388], [806, -390], [797, -407], [803, -386]].forEach(([x, z]) => {
    const e = criaEsqueleto(x, z); e.position.y = -40;
    addMonstro(e, 34, 14, 8, 1.8, false, areaMon(x, z, 9), { especie: 'esqueleto', y0: -40 });
  });
}
// AURÉLIA · os DRAGÕES da cidade nas nuvens (RV13.0, y=-40 na zona celeste).
// 2 guardiões patrulham; o GUARDIÃO ANCIÃO dorme no templo até a Prova de Fogo.
let dragaoNuvens = null;
{
  const ar = aurelia.arena, ce = aurelia.centro;
  const dg = criaDragao(ar.x, ar.z); dg.position.y = -40; dg.scale.setScalar(1.5);
  dragaoNuvens = addMonstro(dg, 1200, 600, 46, 1.6, true, areaMon(ar.x, ar.z, 14), {
    boss: true, especie: 'dragao', dragao: true, atira: 'fogo', alcanceTiro: 40, danoTiro: 30, cadencia: 2.4, y0: -40,
    lootEspecial: { nome: 'Coração de Dragão Ancião', icone: '🐉' },
  });
  dragaoNuvens.vivo = false; dragaoNuvens.g.visible = false; // dorme até a prova
  [[ce.x - 24, ce.z + 6], [ce.x + 24, ce.z - 4]].forEach(([x, z]) => {
    const d = criaDragao(x, z); d.position.y = -40; d.scale.setScalar(1.15);
    addMonstro(d, 320, 150, 26, 1.8, true, areaMon(x, z, 16), { especie: 'dragao', dragao: true, atira: 'fogo', alcanceTiro: 34, danoTiro: 20, cadencia: 3.0, y0: -40, lootEspecial: { nome: 'Escama de Ouro', icone: '✨' } });
  });
}
ratos.forEach((r) => { scene.add(r.g); if (!r.sombraContato) sombraBicho(r); });
let armado = false;
const luzTocha = new THREE.PointLight(0xffa54a, 0, 32, 2); scene.add(luzTocha); // luz principal do esgoto
let tochaOn = false;
let tochaCarga = 1; // 1 = tocha nova; QUEIMA acesa (raio encolhe) e recupera apagada
let vida = 100; const VIDA_MAX = 100; let defesa = 0; // defesa sobe ao equipar armadura
const equipados = {}; // slot -> item de armadura
let ouro = 0; // moeda do jogo (loot/pesca) — compra casas
let bancoOuro = 0; // ouro guardado em banco/depot de imóveis
const imoveisEstado = {}; // id -> contrato/cor/sono (salvo por conta)
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
  avatar.userData.tipo = 'jogador'; // clique direito/atalho; clique comum segue ações do mundo
  if (armado) poeArmaNaMao();       // mantém o graveto ao recriar (troca de cor)
  if (tochaOn) poeTochaNaMao(true); // mantém a tocha acesa
  poeCorpoEquip();                  // mantém as armaduras no corpo
  scene.add(avatar);
  if (!sombraAvatar) sombraAvatar = criaSombraContato(avatar, 0.68, 0.48, 0.18);
  else sombraAvatar.alvo = avatar;
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
  { nome: 'Noctaria', x: -620, z: -30 }, { nome: 'Ermo das Cinzas', x: -690, z: -50 },
  { nome: 'Lua Partida', x: -742, z: -30 },
];
// LOJAS identificadas (estilo Tibia): ícone no MINIMAPA + marcador flutuante na cena
const LUGARES_JORNADA = pontosJornadaParaMapa();
const LOJAS_MAPA = [
  { x: 17, z: 11, icone: '💰' },   // Otto (mercador — compra tudo)
  { x: -17, z: 11, icone: '⚒️' },  // Bram (forja: armas; compra couro/osso/presas)
  { x: -22, z: 17, icone: '✨' },  // Eldra (runas; compra erva/frasco/relíquias)
  { x: 22, z: -15, icone: '🏹' },  // Falk (arco & flecha; compra couro/seda)
  { x: 32, z: 0, icone: '🧪' },    // Sira (poções, dentro do hospital; compra ervas)
  { x: 552, z: 10, icone: '💰' },  // Yara (mercadora de Thais)
  { x: -590, z: -52, icone: '⚒️' }, // Calder (forja sombria de Noctaria)
  { x: -588, z: -10, icone: '💰' },  // Mira Noctar (suprimentos)
];
const ROTAS_MAPA = rotasParaMapa();
/* const ROTAS_MAPA_LEGACY = [
  { x1: -86, z1: -30, x2: -258, z2: -30, w: 8 },   // Vilarejo -> Venore
  { x1: 72, z1: 0, x2: 500, z2: 0, w: 8 },         // Vilarejo -> Thais
  { x1: 0, z1: -116, x2: 0, z2: -218, w: 6 },      // trilha da praia
  { x1: -424, z1: -30, x2: -552, z2: -30, w: 8 },  // Venore -> Noctaria
  { x1: -690, z1: -30, x2: -742, z2: -30, w: 7 },  // Noctaria -> Lua Partida
  { x1: 180, z1: -126, x2: 180, z2: 66, w: 5 },    // Rio Fundo / referência de travessia
];
*/
// VEIOS no mapa (RV9.1): arrays VIVOS que o mapa-mundi lê a cada desenho;
// main3d marca `sentido`/`revelado` ao tocar uma Pedra-Veio ou ao carregar.
const VEIOS_MAPA_LIVE = VEIOS_MAPA.map((v) => ({ ...v, sentido: false, revelado: false }));
const PEDRAS_MAPA_LIVE = PEDRAS_VEIO.map((p) => ({ x: p.x, z: p.z, cor: p.cor, id: p.id, segredo: !!p.segredo, sentido: false, revelado: false }));
const minimapa = criaMinimapa({
  obstaculos, ruas, marcos, lugares: [...LUGARES_MAPA, ...LUGARES_JORNADA], lojas: LOJAS_MAPA, rotas: ROTAS_MAPA,
  veios: VEIOS_MAPA_LIVE, pedrasVeio: PEDRAS_MAPA_LIVE, regiao: REGIAO, alcance: 90,
  onMarcar: (destino) => defineDestinoMapa(destino),
  onLimpar: (silencioso) => limpaDestinoMapa(silencioso),
});
function sincronizaVeiosMapa() {
  for (const v of VEIOS_MAPA_LIVE) { v.sentido = codice.jaSentiu(v.id) || (v.segredo && codice.segredoJaRevelado()); v.revelado = !v.segredo || codice.segredoJaRevelado(); }
  for (const p of PEDRAS_MAPA_LIVE) { p.sentido = codice.jaSentiu(p.id) || (p.segredo && codice.segredoJaRevelado()); p.revelado = !p.segredo || codice.segredoJaRevelado(); }
}
LOJAS_MAPA.forEach((L) => { // marcador flutuante em cima de cada loja
  const cnvL = document.createElement('canvas'); cnvL.width = 128; cnvL.height = 128;
  const cL = cnvL.getContext('2d'); cL.font = '88px Arial'; cL.textAlign = 'center'; cL.textBaseline = 'middle'; cL.fillText(L.icone, 64, 70);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnvL), transparent: true, depthTest: false }));
  sp.scale.set(1.9, 1.9, 1); sp.position.set(L.x, 5.4, L.z); sp.renderOrder = 996; scene.add(sp);
});
const luzesUrbanas = [];
function texturaLuzUrbana() {
  const cnv = document.createElement('canvas'); cnv.width = cnv.height = 96;
  const ctx = cnv.getContext('2d');
  const grd = ctx.createRadialGradient(48, 48, 4, 48, 48, 46);
  grd.addColorStop(0, 'rgba(255,221,128,0.95)');
  grd.addColorStop(0.34, 'rgba(255,170,70,0.55)');
  grd.addColorStop(1, 'rgba(255,140,40,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 96, 96);
  return new THREE.CanvasTexture(cnv);
}
const TEX_LUZ_URBANA = texturaLuzUrbana();
function addLuzUrbana(x, z, y = 3.3, s = 2.4, cor = 0xffd98a) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX_LUZ_URBANA, color: cor, transparent: true, opacity: 0, depthWrite: false, depthTest: true }));
  sp.position.set(x, y, z); sp.scale.set(s, s, 1); sp.renderOrder = 18; scene.add(sp);
  luzesUrbanas.push({ sp, base: s, fase: Math.random() * Math.PI * 2 });
}
[
  [-18, 11, 3.4, 2.2], [18, 11, 3.4, 2.2], [22, -15, 3.2, 2.1], [-22, 17, 3.2, 2.1],
  [43, 6, 3.2, 1.8], [-43, 6, 3.2, 1.8], [0, -30, 4.8, 2.5], [0, 30, 3.8, 2.2],
  [-296, -46, 7.2, 3.4], [-322, -82, 4.2, 2.6], [-388, 12, 6.2, 3.2], [-590, -52, 4.2, 2.3],
  [-588, -10, 4.2, 2.3], [-620, -30, 5.6, 3.0], [552, 10, 4.0, 2.2], [560, 19, 4.6, 2.4],
  [118, 12, 3.8, 2.4], [374, 14, 3.8, 2.2], [45, 62, 3.4, 2.0], [-20, -206, 3.2, 1.8],
].forEach(([x, z, y, s]) => addLuzUrbana(x, z, y, s));
const npcs = criaNPCs(scene, colide);
npcs.forEach((n) => { if (n.g) n.sombraContato = criaSombraContato(n.g, 0.58, 0.42, 0.12); });
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
let destinoMapa = null, destinoEl = null, destinoSetaEl = null, destinoTextoEl = null;
function garanteDestinoHUD() {
  if (destinoEl) return;
  destinoEl = document.createElement('div');
  destinoEl.style.cssText = 'position:fixed;top:52px;left:50%;transform:translateX(-50%);z-index:44;display:none;'
    + 'align-items:center;gap:9px;background:rgba(16,22,32,.88);border:1px solid #d9a522;border-radius:10px;'
    + 'padding:7px 10px;color:#f6e7b0;font:13px Arial;box-shadow:0 4px 18px rgba(0,0,0,.45);pointer-events:auto;';
  destinoSetaEl = document.createElement('div');
  destinoSetaEl.textContent = '▲';
  destinoSetaEl.style.cssText = 'width:22px;height:22px;display:flex;align-items:center;justify-content:center;'
    + 'font-size:19px;color:#ffdf5a;text-shadow:0 1px 2px #000;transform-origin:center;';
  destinoTextoEl = document.createElement('div');
  destinoTextoEl.style.cssText = 'min-width:128px;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  const fechar = document.createElement('button');
  fechar.textContent = '×';
  fechar.title = 'Limpar destino';
  fechar.style.cssText = 'width:24px;height:24px;border-radius:7px;border:1px solid #5a4a2a;background:#211a12;'
    + 'color:#ffe6a0;cursor:pointer;font-size:16px;line-height:18px;';
  fechar.addEventListener('pointerdown', (e) => { e.stopPropagation(); minimapa.limpaDestino(); });
  destinoEl.appendChild(destinoSetaEl); destinoEl.appendChild(destinoTextoEl); destinoEl.appendChild(fechar);
  document.body.appendChild(destinoEl);
}
function defineDestinoMapa(destino) {
  destinoMapa = destino;
  garanteDestinoHUD();
  destinoEl.style.display = 'flex';
  mostraMensagem(`🗺️ ${destino.nome}: aproximadamente ${destino.dist} passos daqui.`);
  atualizaDestinoMapa();
}
function limpaDestinoMapa(silencioso = false) {
  destinoMapa = null;
  if (destinoEl) destinoEl.style.display = 'none';
  if (!silencioso) mostraMensagem('🗺️ Destino removido.');
}
function atualizaDestinoMapa() {
  if (!destinoMapa || !destinoEl || !jogoIniciado || morto) return;
  const dx = destinoMapa.x - avatar.position.x;
  const dz = destinoMapa.z - avatar.position.z;
  const dist = Math.round(Math.hypot(dx, dz));
  const rel = Math.atan2(dx, dz) - controles.cam.yaw;
  destinoSetaEl.style.transform = `rotate(${rel}rad)`;
  destinoTextoEl.textContent = `${destinoMapa.nome} · ${dist} passos`;
  if (dist < 7) {
    const nome = destinoMapa.nome;
    minimapa.limpaDestino(true);
    mostraMensagem(`🗺️ Você chegou perto de ${nome}.`);
  }
}
const quadroJornadas = criaQuadroJornadas({
  onAbrirMapa: () => minimapa.abreMapa(),
  onMarcarDestino: (destino) => {
    const dist = Math.round(Math.hypot(destino.x - avatar.position.x, destino.z - avatar.position.z));
    defineDestinoMapa({ ...destino, dist });
  },
});
// === O CÓDICE DA VEIA (RV9.0): a cosmologia profunda de Venor ===
const codice = criaCodice();
const bestiario = criaBestiario();
function achaInterativo() {
  let melhor = null, melhorD = Infinity;
  for (const it of interativos) {
    if (it.zona && (!noEsgoto || !subsoloAtual || subsoloAtual.id !== it.zona)) continue;
    if (it._off) continue; // coletável colhido (esperando renascer)
    if (Math.abs((it.y || 0) - avatar.position.y) > 6) continue; // mesmo "andar" (superfície × esgoto)
    const d = Math.hypot(it.x - avatar.position.x, it.z - avatar.position.z);
    if (d <= it.raio && d < melhorD) { melhorD = d; melhor = it; }
  }
  return melhor;
}
function achaInterativoNoPonto(x, z) {
  let melhor = null, melhorD = Infinity;
  for (const it of interativos) {
    if (it.zona && (!noEsgoto || !subsoloAtual || subsoloAtual.id !== it.zona)) continue;
    if (it._off) continue;
    if (Math.abs((it.y || 0) - avatar.position.y) > 6) continue;
    const dPonto = Math.hypot(it.x - x, it.z - z);
    if (dPonto > Math.max(2.4, (it.raio || 2) + 1.4)) continue;
    if (dPonto < melhorD) { melhorD = dPonto; melhor = it; }
  }
  return melhor;
}
function executaInterativo(alvo, clicado = false) {
  if (!alvo) return false;
  const dJogador = Math.hypot(alvo.x - avatar.position.x, alvo.z - avatar.position.z);
  if (dJogador > (alvo.raio || 2) + 0.8) {
    if (clicado) mostraMensagem(`Chegue mais perto para ${alvo.acao || alvo.titulo}.`);
    return clicado;
  }
  gesto = 1;
  if (alvo.onAcao) {
    alvo.onAcao();
    if (alvo.msgAcao) mostraMensagem(alvo.msgAcao);
  } else {
    mostraMensagem(alvo.titulo + ' — ' + alvo.msg);
  }
  return true;
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

// RV5.9: presença de chefe. Além da barra pequena sobre o monstro, chefes
// ganham uma barra grande de RPG online no topo, com nome e fase.
let bossHudEl = null, bossHudFill = null, bossHudNome = null, bossHudInfo = null, bossHudAte = 0, bossHudAlvo = null;
const NOMES_CHEFES = {
  dragao: 'Dragão do Pico',
  vorag: 'Vorag, o Primeiro',
  reiEsqueleto: 'Rei Esqueleto',
  orcWarlord: 'Senhor da Guerra',
  trollAnciao: 'Troll Ancião',
  aranha: 'Aranha Tecelã',
  cobra: 'Guardião do Esgoto',
  arconteDrakari: 'Arconte Drakari',
};
Object.assign(NOMES_CHEFES, {
  draptor: 'Draptor Invasor',
  draptorLendario: 'Draptor Lendário',
});
function nomeChefe(r) {
  if (!r) return 'Chefe';
  if (r.lord) return 'Dragon Lord';
  return NOMES_CHEFES[r.especie] || (r.boss ? 'Criatura Poderosa' : 'Criatura');
}
function garanteBossHud() {
  if (bossHudEl) return;
  bossHudEl = document.createElement('div');
  bossHudEl.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:47;'
    + 'width:min(86vw,680px);display:none;pointer-events:none;font-family:Arial,sans-serif;color:#f4ead6;'
    + 'filter:drop-shadow(0 8px 18px rgba(0,0,0,.55));';
  const painel = document.createElement('div');
  painel.style.cssText = 'background:linear-gradient(180deg,rgba(32,20,17,.94),rgba(12,14,18,.92));'
    + 'border:1px solid rgba(245,180,90,.55);border-radius:8px;padding:8px 10px 10px;';
  bossHudNome = document.createElement('div');
  bossHudNome.style.cssText = 'font-weight:bold;text-align:center;font-size:14px;letter-spacing:0;';
  bossHudInfo = document.createElement('div');
  bossHudInfo.style.cssText = 'text-align:center;font-size:11px;color:#d7b98b;margin:2px 0 7px;';
  const trilho = document.createElement('div');
  trilho.style.cssText = 'height:12px;background:#1b1110;border:1px solid rgba(255,255,255,.16);border-radius:5px;overflow:hidden;';
  bossHudFill = document.createElement('div');
  bossHudFill.style.cssText = 'height:100%;width:100%;background:linear-gradient(90deg,#b52820,#f0822d,#ffd06a);'
    + 'box-shadow:0 0 12px rgba(255,96,24,.55);transition:width .16s;';
  trilho.appendChild(bossHudFill);
  painel.appendChild(bossHudNome); painel.appendChild(bossHudInfo); painel.appendChild(trilho);
  bossHudEl.appendChild(painel);
  document.body.appendChild(bossHudEl);
}
function mostraBossHud(r, dur = 5) {
  if (!r || !r.boss || !r.vivo) return;
  garanteBossHud();
  bossHudAlvo = r;
  bossHudAte = Math.max(bossHudAte, tempo + dur);
  bossHudEl.style.display = 'block';
  const f = Math.max(0, Math.min(1, r.hp / r.hpMax));
  bossHudFill.style.width = `${Math.max(1, f * 100)}%`;
  bossHudFill.style.background = f > 0.5
    ? 'linear-gradient(90deg,#b52820,#f0822d,#ffd06a)'
    : f > 0.25
      ? 'linear-gradient(90deg,#9d1f1a,#e0502a,#f2b13c)'
      : 'linear-gradient(90deg,#611313,#b21d1d,#ff5a2a)';
  bossHudNome.textContent = nomeChefe(r);
  const fase = r.atira === 'fogo'
    ? (f < 0.35 ? 'Fúria: fogo acelerado' : 'Sopro de fogo')
    : r.forte ? 'Elite' : 'Chefe';
  bossHudInfo.textContent = `${Math.max(0, Math.ceil(r.hp))}/${r.hpMax} PV · ${fase}`;
  if (r.boss && r.atira === 'fogo' && f < 0.35 && !r._faseFuria) {
    r._faseFuria = true;
    mostraMensagem(`🔥 ${nomeChefe(r)} entrou em fúria!`);
  }
}
function atualizaBossHud() {
  if (!bossHudEl || !bossHudAlvo) return;
  if (!bossHudAlvo.vivo || bossHudAlvo.corpse || tempo > bossHudAte) {
    bossHudEl.style.display = 'none';
    bossHudAlvo = null;
    return;
  }
  mostraBossHud(bossHudAlvo, 0);
}

// --- diálogo (NPC), customização (você) e troca de pet ---
const dialogo = criaDialogo();
let petTipo = null;
// === DRAGÃO-COMPANHEIRO (RV14): o pet-dragão tem ficha própria que CRESCE ===
let dragaoCompanheiro = null; // ficha serializável (dragoes-companheiro.js)
const DRAGOES_PET = new Set(['dragaozinho', 'draptor', 'draptorLendario']);
const FICHA_DE_PET = { dragaozinho: 'dragaozinho', draptor: 'furiaDoDia', draptorLendario: 'dragaoTresCabecas' };
function ehDragaoPet(t) { return DRAGOES_PET.has(t) || !!ESPECIES_DRAGAO[t]; }
// garante que, quando um pet-dragão está ativo, exista a ficha do companheiro
function sincronizaDragaoCompanheiro() {
  if (!ehDragaoPet(petTipo)) return;
  if (!dragaoCompanheiro || dragaoCompanheiro.petTipo !== petTipo) {
    const fichaTipo = FICHA_DE_PET[petTipo] || petTipo;
    dragaoCompanheiro = criaDragaoData(fichaTipo, null, tempo);
    dragaoCompanheiro.petTipo = petTipo;
  }
  aplicaEstagioNoModelo();
}
// escala o modelo 3D do dragão pelo estágio (filhote/jovem/adulto) — só o
// dragaozinho procedural escala limpo; draptor mantém escala base.
function aplicaEstagioNoModelo() {
  if (!gato || !dragaoCompanheiro || !ehDragaoPet(petTipo)) return;
  const base = gato.userData.baseScale || (dragaoCompanheiro.petTipo === 'dragaozinho' ? 0.16 : null);
  if (!base) return; // draptors mantêm escala própria
  const est = ESTAGIO_INFO[dragaoCompanheiro.estagio] || ESTAGIO_INFO.filhote;
  const s = base * (est.escala / ESTAGIO_INFO.filhote.escala);
  gato.scale.setScalar(s);
}
function trocaPet(tipo) {
  if (!PETS[tipo] || tipo === petTipo) return;
  if (!petsDomados.includes(tipo)) { mostraMensagem('🐾 Você ainda não domou esse bicho — encontre-o no mundo!'); return; }
  const pos = gato ? gato.position.clone() : avatar.position.clone().add(new THREE.Vector3(2, 0, 2));
  if (gato) scene.remove(gato);
  gato = PETS[tipo]();
  gato.position.copy(pos);
  gato.userData.tipo = 'pet';
  scene.add(gato);
  if (!sombraPet) sombraPet = criaSombraContato(gato, 0.7, 0.48, 0.14);
  else sombraPet.alvo = gato;
  petTipo = tipo;
  sincronizaDragaoCompanheiro();
}
// chamado quando o herói ganha XP: o dragão ATIVO cresce junto (metade do XP)
function evoluiDragaoComHeroi(xpHeroi) {
  if (!dragaoCompanheiro || !ehDragaoPet(petTipo)) return;
  const r = ganhaXpDragao(dragaoCompanheiro, Math.round(xpHeroi * 0.5));
  if (r && r.evoluiu) {
    aplicaEstagioNoModelo();
    const nome = ESTAGIO_INFO[dragaoCompanheiro.estagio].nome;
    mostraMensagem(`🐉 Seu dragão evoluiu para ${nome.toUpperCase()}! Mais forte, maior — e novos poderes.`);
    try { sons.tesouro(); } catch (e) {}
  }
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
DOMAVEIS.push(
  { tipo: 'coruja', nome: 'Coruja Gigante', emoji: 'O', x: 124, z: -12, item: 'Dourado', chance: 0.18, dica: 'um Dourado pescado no Rio Fundo' },
  { tipo: 'morcego', nome: 'Morcego Grande', emoji: 'M', x: -690, z: -54, item: 'Fragmento de Obsidiana', chance: 0.16, dica: 'fragmentos dos Drakari no Ermo das Cinzas' },
  { tipo: 'furiaDoDia', nome: 'Fúria do Dia', emoji: 'D', x: 566, z: 74, item: 'Escama de Ouro', chance: 0.09, dica: 'escamas douradas dos guardiões de Aurélia' },
  { tipo: 'furiaDaNoite', nome: 'Fúria da Noite', emoji: 'N', x: -742, z: -62, item: 'Selo da Lua Partida', chance: 0.07, dica: 'a cadeia do Arconte precisa estar avançada' },
  { tipo: 'dragaoPantano', nome: 'Dragão do Pântano', emoji: 'P', x: -410, z: 20, item: 'Gota da Veia', chance: 0.10, dica: 'sentir os veios antigos pode revelar uma gota viva' },
  { tipo: 'dragaoGelo', nome: 'Dragão de Gelo', emoji: 'G', x: 118, z: 336, y: 36, item: 'Cristal do Pico', chance: 0.08, dica: 'cristais raros das cavernas do Pico' },
  { tipo: 'dragaoVeia', nome: 'Dragão da Veia', emoji: 'V', x: -6, z: -38, item: 'Relíquia de Vorag', chance: 0.035, dica: 'relíquia lendária da cadeia de Vorag' },
);
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
  const domavel = { ...d, g, base: { x: d.x, z: d.z }, alvo: { x: d.x, z: d.z }, pausa: Math.random() * 3, fase: Math.random() * 6 };
  domavel.sombraContato = criaSombraContato(g, d.tipo === 'burro' ? 0.95 : 0.62, d.tipo === 'burro' ? 0.62 : 0.42, 0.12);
  domaveisVivos.push(domavel);
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
    mostraMensagem(`✨ Você DOMOU o ${d.nome}! ${d.emoji} Ele agora te segue. Use o botão 👤 para trocar pet/cores.`);
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
Object.assign(MONTARIA_VEL, { coruja: 2.05, morcego: 2.1, draptor: 2.45, draptorLendario: 2.85 });
Object.assign(MONTARIA_SELA, { coruja: 1.55, morcego: 1.25, draptor: 1.35, draptorLendario: 1.55 });
Object.assign(PET_DANO, { coruja: 6, morcego: 7, draptor: 12, draptorLendario: 18 });
Object.assign(PET_NOMES, { coruja: 'Coruja Gigante', morcego: 'Morcego Grande', draptor: 'Draptor', draptorLendario: 'Draptor Lendário' });
Object.assign(MONTARIA_VEL, { furiaDoDia: 2.25, furiaDaNoite: 2.3, dragaoPantano: 2.1, dragaoGelo: 2.15, dragaoVeia: 2.55 });
Object.assign(MONTARIA_SELA, { furiaDoDia: 1.1, furiaDaNoite: 1.1, dragaoPantano: 1.05, dragaoGelo: 1.05, dragaoVeia: 1.2 });
Object.assign(PET_DANO, { furiaDoDia: 12, furiaDaNoite: 13, dragaoPantano: 12, dragaoGelo: 13, dragaoVeia: 18 });
Object.assign(PET_NOMES, { furiaDoDia: 'Fúria do Dia', furiaDaNoite: 'Fúria da Noite', dragaoPantano: 'Dragão do Pântano', dragaoGelo: 'Dragão de Gelo', dragaoVeia: 'Dragão da Veia' });
let montado = false;
let petAlvo = null, petProxMordida = 0;
function animaCompanheiro(g, movendo, ritmo = 1, voando = false) {
  const u = g && g.userData;
  if (!u) return;
  const dtAtaque = u._ataquePulso !== undefined ? tempo - u._ataquePulso : Infinity;
  if (dtAtaque < 0.34) {
    const golpe = Math.sin((dtAtaque / 0.34) * Math.PI);
    g.rotation.x = (u._ataqueBaseRotX || 0) - golpe * 0.22;
    g.scale.z = (u._ataqueBaseScaleZ || g.scale.z) * (1 + golpe * 0.12);
    if (u.pescoco) u.pescoco.rotation.x = (u._ataqueBasePescocoX || 0) - golpe * 0.22;
  } else if (dtAtaque < 0.58) {
    const volta = (dtAtaque - 0.34) / 0.24;
    g.rotation.x = (g.rotation.x || 0) + ((u._ataqueBaseRotX || 0) - (g.rotation.x || 0)) * volta;
    if (u._ataqueBaseScaleZ) g.scale.z += (u._ataqueBaseScaleZ - g.scale.z) * volta;
    if (u.pescoco && u._ataqueBasePescocoX != null) u.pescoco.rotation.x += (u._ataqueBasePescocoX - u.pescoco.rotation.x) * volta;
  } else if (u._ataquePulso !== undefined) {
    g.rotation.x = u._ataqueBaseRotX || 0;
    if (u._ataqueBaseScaleZ) g.scale.z = u._ataqueBaseScaleZ;
    if (u.pescoco && u._ataqueBasePescocoX != null) u.pescoco.rotation.x = u._ataqueBasePescocoX;
    delete u._ataquePulso; delete u._ataqueBaseRotX; delete u._ataqueBaseScaleZ; delete u._ataqueBasePescocoX;
  }
  if (u.patas) {
    // ao VOAR o dragão recolhe as patas; no chão, anda
    const sp = voando ? 0.5 : (movendo ? Math.sin(tempo * 12 * ritmo) * 0.65 : 0);
    u.patas.forEach((p, i) => { p.rotation.x = i % 2 ? -sp : sp; });
  }
  if (u.asas) {
    // RV14.3: batida de asa AMPLA e rápida ao voar; leve no chão
    const amp = voando ? 0.9 : 0.42, vel = voando ? 7.6 : 5.8;
    const a = Math.sin(tempo * vel * ritmo) * amp;
    u.asas.forEach((asa, i) => {
      asa.rotation.z = (i ? -1 : 1) * (0.12 + a);
      asa.rotation.y = (i ? -1 : 1) * (0.08 + Math.abs(a) * 0.18);
    });
  }
  if (u.garganta) { // respira — mas FLAMEJA (incha) ao cuspir fogo (_flare)
    const fl = u.garganta.userData._flare;
    if (fl !== undefined && tempo - fl < 0.3) u.garganta.scale.setScalar(1 + (1 - (tempo - fl) / 0.3) * 1.8);
    else u.garganta.scale.setScalar(1 + Math.sin(tempo * 3) * 0.06);
  }
  if (Array.isArray(u.cauda)) { // RV15.2: ONDA propagada na cauda do dragão (segmentos defasados)
    for (let i = 0; i < u.cauda.length; i++) {
      u.cauda[i].rotation.y = Math.sin(tempo * 2.4 * ritmo - i * 0.5) * 0.16;
      u.cauda[i].rotation.x = 0.06 + Math.sin(tempo * 1.8 - i * 0.4) * 0.05;
    }
  } else if (u.cauda) u.cauda.rotation.y = Math.sin(tempo * 2.8 * ritmo) * 0.2;
  else if (u.rabo) u.rabo.rotation.y = Math.sin(tempo * 3 * ritmo) * 0.38;
}
function marcaAtaqueCompanheiro(g) {
  const u = g && g.userData;
  if (!u) return;
  u._ataquePulso = tempo;
  u._ataqueBaseRotX = g.rotation.x || 0;
  u._ataqueBaseScaleZ = g.scale.z || 1;
  if (u.pescoco) u._ataqueBasePescocoX = u.pescoco.rotation.x || 0;
  if (u.garganta) u.garganta.userData._flare = tempo;
}
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
    // RV14.3: o dragão ABAIXA pra você descer (agacha por um instante)
    if (gato && ehDragaoPet(petTipo)) {
      const s0 = gato.scale.y;
      gato.scale.y = s0 * 0.72;
      setTimeout(() => { if (gato) gato.scale.y = s0; }, 430);
      try { sons.corda(); } catch (e) {}
    }
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
  // RV5.3: O FINALE DA LORE — a Ossada se ergue (cereja do Patch 1)
  { id: 'terceiroSinal', npc: 'Hela', requer: 'guardiaoOvo', tipo: 'matar', especie: 'vorag', meta: 1, invoca: 'vorag',
    titulo: 'O Terceiro Sinal', pede: 'A coroa brilhou sob a terra. A seda cobriu a floresta. E agora o filhote anda ao seu lado... O TERCEIRO SINAL se cumpriu — e a Ossada no campo a leste NÃO está mais dormindo. Vá. Termine o que a profecia começou.',
    fala: 'Os ossos ainda andam?', recompensa: { ouro: 300, xp: 200, item: { nome: 'Relíquia de Vorag', icone: '🦴', slot: 'anel', defesa: 5 } } },
  // RV5.8: o Mestre da Guilda quer os cristais das profundezas
  { id: 'profundezasPico', npc: 'Ulric', tipo: 'matar', especie: 'trollAnciao', meta: 1,
    titulo: 'Profundezas do Pico', pede: 'Acharam uma boca de caverna na encosta sul do Pico — e o que mora lá dentro não paga aluguel. Derrube o TROLL ANCIÃO e a Guilda fica devendo uma.',
    fala: 'As cavernas já têm dono novo?', recompensa: { ouro: 160, xp: 120 } },
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
  // RV6.0: primeira questline de alto nivel em Noctaria.
  { id: 'batedoresDrakari', npc: 'Nerion', nivel: 6, tipo: 'matar', especie: 'drakari', meta: 3,
    titulo: 'Batedores de Obsidiana', pede: 'Os Drakari testam nossos portões todas as noites. Mate 3 batedores no Ermo das Cinzas e volte vivo. Se você ainda é fraco, não saia da estrada.',
    fala: 'Os batedores ainda rondam?', recompensa: { ouro: 120, xp: 110 } },
  { id: 'guardasDaFenda', npc: 'Nerion', requer: 'batedoresDrakari', nivel: 9, tipo: 'matar', especie: 'drakariElite', meta: 2,
    titulo: 'Guardas da Fenda', pede: 'Agora você viu o tamanho do problema. Dois guardas elite protegem o Santuário da Lua Partida. Derrube-os para quebrar a primeira camada do selo.',
    fala: 'A primeira camada caiu?', recompensa: { ouro: 180, xp: 170, item: { nome: 'Fragmento de Obsidiana', icone: '💠' } } },
  { id: 'arconteLuaPartida', npc: 'Nerion', requer: 'guardasDaFenda', nivel: 12, tipo: 'matar', especie: 'arconteDrakari', meta: 1, invoca: 'arconteDrakari',
    titulo: 'A Lua Partida', pede: 'A Fenda respondeu. O Arconte Drakari vai acordar no santuário a oeste. Ele é o grande desafio desta era: fogo negro, magia e muita vida. Vá apenas se estiver pronto.',
    fala: 'O Arconte ainda respira?', recompensa: { ouro: 420, xp: 360, item: { nome: 'Selo da Lua Partida', icone: '🌑', slot: 'anel', defesa: 7 } } },
];
QUESTS.push({
  id: 'selaDraptor',
  npc: 'Hela',
  requer: 'arconteLuaPartida',
  nivel: 14,
  tipo: 'coletar',
  item: 'Coração de Obsidiana',
  meta: 1,
  titulo: 'A Sela do Draptor',
  pede: 'A história dos dragões não terminou no Arconte. Traga 1 Coração de Obsidiana: com ele consagro uma Sela Dracônica. Só ela permite tentar domar um Draptor durante as invasões.',
  fala: 'Trouxe o coração da fenda?',
  recompensa: { ouro: 0, xp: 420, item: { nome: 'Sela Dracônica', icone: 'S' } },
});
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
// PAINEL DO PERSONAGEM (RV14, estilo Tibia): nível, vocação, vida/mana, XP,
// equipamento e o DRAGÃO companheiro. Botão 📜 / tecla C.
const fichaPersonagem = criaPainelPersonagem({
  getDados: () => {
    const e = hud.estado ? hud.estado() : { nivel: 1, xp: 0, prox: 20 };
    return {
      nome: nomeJogador || 'Herói',
      vocacao: MODELO_NOME[coresJogador.tipo] || 'Aventureiro',
      nivel: e.nivel, xp: e.xp, prox: e.prox,
      vida, vidaMax: VIDA_MAX, mana, manaMax: MANA_MAX,
      defesa, ouro, equipados,
      dragao: dragaoCompanheiro ? statsDragao(dragaoCompanheiro) : { tem: false },
    };
  },
  aoTrocaAfinidade: (af) => {
    if (!dragaoCompanheiro) return;
    dragaoCompanheiro.afinidade = af;
    mostraMensagem(af === 'noite' ? '🌙 Seu dragão agora é da NOITE — +50% de dano à noite.' : '☀️ Seu dragão agora é do DIA — +50% de dano de dia.');
    salvaJogo();
  },
});
// TABELA DE COMPRA dos mercadores (estilo Tibia: caçar → saquear → vender)
const PRECOS = {
  'Cauda de rato': 2, 'Osso': 2, 'Couro': 4, 'Erva': 3, 'Frasco': 5,
  'Cogumelo': 2, 'Concha': 4, 'Coco': 3, 'Cenoura': 2,
  'Presa do Boss': 20, 'Olho do Beholder': 40, 'Escama de Dragão': 90, 'Coração de Dragão': 400, 'Coroa Antiga': 250, 'Olho Lapidado': 180, 'Estandarte Orc': 220, 'Coração Ancestral': 500, 'Cristal do Pico': 150,
  'Escama Drakari': 70, 'Fragmento de Obsidiana': 140, 'Coração de Obsidiana': 650,
  'Rubi': 30, 'Safira': 30, 'Esmeralda': 30, 'Pérola': 22, 'Âmbar': 18, 'Anel de Ouro': 35,
  'Lambari': 1, 'Tilápia': 2, 'Traíra': 3, 'Carpa': 3, 'Bagre': 3, 'Tucunaré': 6, 'Dourado': 12, 'Pintado': 16,
};
function tabelaComEscassez(tabela) {
  return Object.fromEntries(Object.entries(tabela).map(([nome, base]) => [nome, precoCompra(base)]));
}
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
    const rotulo = !e.aceita ? `📜 Missão: ${q.titulo}${q.nivel ? ` (nível ${q.nivel}+)` : ''}` : `📜 ${q.titulo} (${progressoQuest(q, e)}/${q.meta})`;
    opcoes.splice(opcoes.length - 1, 0, { texto: rotulo, onClick: () => {
      if (!e.aceita) {
        const nivelAtual = hud.estado().nivel || 1;
        if (q.nivel && nivelAtual < q.nivel) {
          dialogo.abre(npc.nome, `Volte no nível ${q.nivel}. Esta missão é feita para personagem preparado; hoje você está no nível ${nivelAtual}.`, opcoes);
          return;
        }
        e.aceita = true; salvaJogo();
        if (q.invoca === 'vorag') invocaVorag(); // RV5.3: a Ossada se ergue AGORA
        if (q.invoca === 'arconteDrakari') invocaArconteDrakari(); // RV6.0: a Fenda acorda sob demanda
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
    const tabelaBase = ehMercador ? PRECOS : Object.fromEntries(npc.compra.filter((n) => PRECOS[n]).map((n) => [n, PRECOS[n]]));
    const tabela = tabelaComEscassez(tabelaBase);
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
function abreEditorPersonagem() {
  if (!jogoIniciado) { mostraMensagem('Entre no jogo primeiro. 👤'); return; }
  if (morto) return;
  if (dialogo.aberto) { mostraMensagem('Feche a conversa antes de editar o personagem. 👤'); return; }
  customizar.abre();
}
// CLIQUE/TOQUE: tap curto (sem arrasto) seleciona NPC / você / pet
const rayTap = new THREE.Raycaster();
const planoTap = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const pontoTap = new THREE.Vector3();
function achaTipo(obj) { while (obj) { if (obj.userData && obj.userData.tipo) return obj; obj = obj.parent; } return null; }
let tapIni = null;
function pontoChaoDoClique() {
  planoTap.constant = -avatar.position.y;
  const p = rayTap.ray.intersectPlane(planoTap, pontoTap);
  return p ? { x: p.x, z: p.z } : null;
}
renderer.domElement.addEventListener('pointerdown', (e) => { tapIni = { x: e.clientX, y: e.clientY, t: performance.now() }; });
// CLIQUE = AÇÃO (estilo Roblox): clicar em NPC conversa, em bicho ataca/saqueia,
// em pet monta/desmonta; clicar no mundo executa a ação do lugar (abrir/pegar/pescar).
// Customização saiu do clique comum: botão 👤, tecla P ou clique direito no boneco.
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
    if (tipo === 'jogador') break; // clique comum no boneco continua caindo na AÇÃO do lugar
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
  const pChao = pontoChaoDoClique();
  if (pChao) {
    const itClicado = achaInterativoNoPonto(pChao.x, pChao.z);
    if (itClicado && executaInterativo(itClicado, true)) return;
  }
  executaAcao(); // clicou no mundo → mesma ação da tecla E / botão AÇÃO
});
renderer.domElement.addEventListener('contextmenu', (e) => {
  e.preventDefault(); e.stopPropagation();
  if (!jogoIniciado || morto || dialogo.aberto || customizar.aberto) return;
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  rayTap.setFromCamera(ndc, camera);
  let hitsTap = [];
  try { hitsTap = rayTap.intersectObjects(scene.children, true); }
  catch (err) { console.error('raycast do clique direito:', err); hitsTap = []; }
  for (const h of hitsTap) {
    const alvo = achaTipo(h.object);
    if (!alvo) continue;
    if (alvo.userData.tipo === 'jogador') { abreEditorPersonagem(); return; }
    break;
  }
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
      if (executaInterativo(itEsg)) return;
      const c = corpseProximo(); if (c) saqueia(c); else atacar();
    }
  } else {
    const alvo = achaInterativo();
    if (executaInterativo(alvo)) {
      return;
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

// === CARROCAS DE VIAGEM: transporte terrestre pago, inspirado em hubs de MMO.
// Economiza tempo, mas custa mais que caminhar; a estrada ainda vale por loot,
// risco e descoberta.
function viajaCarroca(dx, dz, custo, nomeDestino) {
  if (ouro < custo) { mostraMensagem(`A carroça custa ${custo} moedas. Venda loot ou pesque antes de viajar.`); return; }
  ouro -= custo; hud.ouro(ouro);
  montado = false; petAlvo = null;
  avatar.position.set(dx, alturaTerreno(dx, dz), dz); vy = 0; noChao = true;
  salvaJogo();
  mostraMensagem(`Carroca pronta. A estrada passa depressa... destino: ${nomeDestino}.`);
}
[
  { x: 118, z: 12, titulo: 'Carroças da Estrada da Vigia', rotas: [
    { nome: 'Thais', x: 552, z: 8, custo: 12 },
    { nome: 'Venore', x: -294, z: -82, custo: 10 },
  ] },
  { x: 374, z: 14, titulo: 'Carroça para o Vilarejo', rotas: [
    { nome: 'Vilarejo de Venor', x: 118, z: 12, custo: 12 },
  ] },
  { x: -294, z: -90, titulo: 'Carroças de Venore', rotas: [
    { nome: 'Vilarejo de Venor', x: 118, z: 12, custo: 10 },
    { nome: 'Noctaria', x: -604, z: -40, custo: 24 },
  ] },
  { x: -604, z: -40, titulo: 'Carroça Sombria de Noctaria', rotas: [
    { nome: 'Venore', x: -294, z: -90, custo: 24 },
  ] },
].forEach((posto) => {
  const it = { x: posto.x, z: posto.z, raio: 4.0, titulo: posto.titulo, acao: 'Ver viagens de carroça' };
  it.onAcao = () => {
    const ops = posto.rotas.map((r) => ({
      texto: `${r.nome} - ${r.custo} moedas`,
      onClick: () => { dialogo.fecha(); viajaCarroca(r.x, r.z, r.custo, r.nome); },
    }));
    ops.push({ texto: 'Ficar aqui', onClick: () => dialogo.fecha() });
    dialogo.abre(posto.titulo, 'Viagem terrestre rápida. Caminhar rende loot; a carroça compra tempo.', ops);
  };
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

// === PEDRAS-VEIO (RV9.0 — "A Tessitura de Venor"): monólitos gravados nos
// nós geográficos da Veia Viva; usar AÇÃO numa pedra "sente" aquele veio e o
// desbloqueia no Códice. A Pedra da Boca (sul, na praia) é a CHAVE do
// segredo-semente — só revela O Quarto Veio com os 5 veios já sentidos.
const MAT_PEDRA_VEIO = new THREE.MeshStandardMaterial({ color: 0x6a6660, roughness: 1, flatShading: true });
PEDRAS_VEIO.forEach((pv) => {
  const gP = new THREE.Group();
  gP.position.set(pv.x, (typeof pv.y === 'number') ? pv.y : alturaTerreno(pv.x, pv.z), pv.z);
  const mono = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.82, 3.4, 6), MAT_PEDRA_VEIO);
  mono.position.y = 1.6; mono.rotation.y = (pv.x * 0.7 + pv.z) % 6; mono.castShadow = mono.receiveShadow = true; gP.add(mono);
  const ombro = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.95, 0.5, 6), MAT_PEDRA_VEIO);
  ombro.position.y = 0.25; gP.add(ombro); // pé alargado (fincada no chão)
  // glifo GRAVADO, emissivo na cor do veio
  const cnv = document.createElement('canvas'); cnv.width = cnv.height = 96;
  const cg = cnv.getContext('2d'); cg.font = '72px serif'; cg.textAlign = 'center'; cg.textBaseline = 'middle';
  cg.fillText(pv.glifo, 48, 56);
  const glifo = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.92),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, color: pv.cor, emissive: pv.cor, emissiveIntensity: 0.9, roughness: 0.4 }));
  glifo.position.set(0, 2.05, 0.84); gP.add(glifo);
  const luz = new THREE.PointLight(pv.cor, 0.5, 9, 2); luz.position.y = 3.0; gP.add(luz);
  // anel rúnico gravado no chão ao redor da base (premium, RV9.1)
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.5, 28),
    new THREE.MeshBasicMaterial({ color: pv.cor, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; gP.add(ring);
  scene.add(gP);
  const it = { x: pv.x, z: pv.z, y: pv.y || 0, raio: 2.8, titulo: `🪨 ${pv.nome}`, acao: `Tocar a ${pv.nome}` };
  it.onAcao = () => {
    if (pv.segredo) { // a Pedra da Boca — chave do Quarto Veio
      if (!codice.todosPrincipaisSentidos()) {
        dialogo.abre(pv.nome, `${pv.fragmento}\n\nMas há um silêncio aqui que os cinco veios não preenchem. Sinta TODAS as Pedras-Veio antes de voltar.`, [{ texto: 'Afastar-se', onClick: () => dialogo.fecha() }]);
        return;
      }
      if (codice.revelaSegredo()) {
        if (!inventario.temItem('Gota da Veia')) inventario.addItem({ nome: 'Gota da Veia', icone: '💧' });
        sons.tesouro();
      }
      sincronizaVeiosMapa();
      const m = TESSITURA.misterios[0];
      dialogo.abre('🌑 ' + m.nome, `${pv.fragmento}\n\n${m.texto}\n\n${m.profecia}`, [{ texto: 'Guardar no Códice 📖', onClick: () => dialogo.fecha() }]);
      salvaJogo();
      return;
    }
    const veio = TESSITURA.veios.find((v) => v.id === pv.id);
    if (codice.marcaVeio(pv.id)) sons.corda();
    sincronizaVeiosMapa();
    const completou = codice.todosPrincipaisSentidos() && !codice.segredoJaRevelado();
    dialogo.abre(pv.nome, `${pv.fragmento}\n\n— Veio sentido: ${veio ? veio.nome : pv.id}. Abra o 📖 Códice (canto direito) pra ler a linha inteira da Veia.`
      + (completou ? '\n\n🌊 Você sentiu os cinco veios. Falta uma pedra, ao sul, onde o mar começa...' : ''),
      [{ texto: 'Continuar', onClick: () => dialogo.fecha() }]);
    salvaJogo();
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

// IMÓVEIS ALUGÁVEIS (RV16.0): casa deixa de ser cosmético e vira progressão.
// Inspiração: casas/guildhalls de MMORPG clássico, mas com função própria em Venor.
const TELHADOS = [0x8a4632, 0x4a5666, 0x6a4a8a, 0x3a6b30, 0x2a5a9c, 0x7a3a2a];
const placasImoveis = [];
const IMOVEIS = [
  { id: 'casa_leste_venor', nome: 'Casa do Portão Leste', tipo: 'Casa', x: 43, z: 6, custo: 85, aluguel: 8, casaIdx: 0, ml: 1, xpDragao: 80,
    beneficios: { depot: true, lixo: true, dormir: true } },
  { id: 'casa_oeste_venor', nome: 'Casa do Portão Oeste', tipo: 'Casa', x: -43, z: 6, custo: 85, aluguel: 8, casaIdx: 1, ml: 1, xpDragao: 80,
    beneficios: { depot: true, lixo: true, dormir: true } },
  { id: 'mansao_ponte', nome: 'Mansão da Ponte', tipo: 'Mansão', x: 101, z: 57, custo: 340, aluguel: 28, ml: 3, xpDragao: 220,
    beneficios: { depot: true, banco: true, lixo: true, dormir: true } },
  { id: 'mansao_fundadores', nome: 'Mansão dos Fundadores', tipo: 'Mansão', x: -101, z: 57, custo: 380, aluguel: 32, ml: 4, xpDragao: 260,
    beneficios: { depot: true, banco: true, lixo: true, dormir: true } },
  { id: 'solar_canal', nome: 'Solar do Canal', tipo: 'Mansão', x: -352, z: 68, custo: 520, aluguel: 44, ml: 5, xpDragao: 340,
    beneficios: { depot: true, banco: true, lixo: true, dormir: true } },
  { id: 'guildhouse_venore', nome: 'Salão das Guildas', tipo: 'Guildhouse', x: -312, z: 27, custo: 920, aluguel: 75, ml: 8, xpDragao: 620, requerGuilda: true,
    beneficios: { depot: true, banco: true, lixo: true, dormir: true, guilda: true } },
];
const interioresImoveis = {};
function acaoInteriorImovel(def, kind) {
  if (kind === 'sair') { saiInteriorImovel(def); return; }
  if (kind === 'depot') { abreCofre(); return; }
  if (kind === 'banco') { abreBancoImovel(def); return; }
  if (kind === 'lixo') { limpaLixoImovel(def); return; }
  if (kind === 'dormir') { dormirNoImovel(def); return; }
  if (kind === 'guilda') {
    dialogo.abre('Mesa de Conselho', 'Rotas, hunts e tarefas da guilda ficam marcadas aqui. Este salao ja serve como base social; nas proximas rodadas ele vira centro de missoes de grupo.', [
      { texto: 'Entendi', onClick: () => dialogo.fecha() },
    ]);
  }
}
function preparaInteriorImovel(def, idx) {
  if (def.tipo !== 'Mansão' && def.tipo !== 'Guildhouse') return;
  const y = def.tipo === 'Guildhouse' ? -170 : -120 - idx * 34;
  const interior = def.tipo === 'Guildhouse'
    ? criaGuildHouseInterior({ id: def.id, nome: def.nome, y })
    : criaMansaoInterior({ id: def.id, nome: def.nome, y });
  interior.saidas = [{ x: def.x, z: def.z }];
  interior.grupo.visible = false;
  scene.add(interior.grupo);
  (interior.animados || []).forEach((a) => animados.push(a));
  (interior.interativos || []).forEach((p) => {
    interativos.push({ ...p, zona: interior.id, onAcao: () => acaoInteriorImovel(def, p.kind) });
  });
  interioresImoveis[def.id] = interior;
}
IMOVEIS.forEach(preparaInteriorImovel);
function escondeZonasCarregadas() {
  [esgoto, catacumbas, criptaProfunda, cavernasPico, irmas1, catedralI, aurelia, ...Object.values(interioresImoveis)]
    .forEach((z) => { if (z && z.grupo) z.grupo.visible = false; });
}
function estadoImovel(id) {
  if (!imoveisEstado[id]) imoveisEstado[id] = { alugado: false, corIdx: 0, ultimoSono: -9999 };
  return imoveisEstado[id];
}
function sincronizaPlacasImoveis() {
  for (const p of placasImoveis) {
    const st = estadoImovel(p.def.id);
    p.tab.material.color.setHex(st.alugado ? 0x2e7d32 : (p.def.tipo === 'Guildhouse' ? 0x6a4a8a : 0xc0392b));
    p.it.acao = st.alugado ? 'Administrar imóvel 🏠' : `Alugar ${p.def.tipo.toLowerCase()} (${p.def.custo} 🪙)`;
  }
}
function beneficiosTexto(def) {
  const b = [];
  if (def.beneficios.depot) b.push('Depósito');
  if (def.beneficios.banco) b.push('Banco');
  if (def.beneficios.lixo) b.push('Lixeira');
  if (def.beneficios.dormir) b.push(`Dormir: +${def.ml} ML do dragão`);
  if (def.beneficios.guilda) b.push('Base de guilda');
  return b.join(' · ');
}
function abreBancoImovel(def) {
  const dep = (n) => {
    if (ouro < n) { dialogo.abre(def.nome, `Você tem ${ouro} 🪙 na mão. Não dá para depositar ${n}.`, [{ texto: 'Voltar', onClick: () => abreBancoImovel(def) }]); return; }
    ouro -= n; bancoOuro += n; hud.ouro(ouro); salvaJogo(); abreBancoImovel(def);
  };
  const sac = (n) => {
    if (bancoOuro < n) { dialogo.abre(def.nome, `Seu banco tem ${bancoOuro} 🪙. Não dá para sacar ${n}.`, [{ texto: 'Voltar', onClick: () => abreBancoImovel(def) }]); return; }
    bancoOuro -= n; ouro += n; hud.ouro(ouro); salvaJogo(); abreBancoImovel(def);
  };
  dialogo.abre('🏦 Banco do Imóvel', `Na mão: ${ouro} 🪙\nGuardado: ${bancoOuro} 🪙`, [
    { texto: 'Depositar 50 🪙', onClick: () => dep(50) },
    { texto: 'Depositar 200 🪙', onClick: () => dep(200) },
    { texto: 'Sacar 50 🪙', onClick: () => sac(50) },
    { texto: 'Sacar 200 🪙', onClick: () => sac(200) },
    { texto: 'Voltar', onClick: () => abreImovel(def) },
  ]);
}
function limpaLixoImovel(def) {
  const descartaveis = ['Cauda de rato', 'Osso', 'Frasco', 'Cogumelo', 'Concha', 'Coco', 'Erva'];
  let n = 0;
  for (const nome of descartaveis) while (inventario.consomeItem(nome)) n++;
  mostraMensagem(n ? `🗑️ Lixeira de ${def.nome}: ${n} item(ns) barato(s) descartado(s).` : '🗑️ Nada barato para descartar.');
  salvaJogo();
}
function dormirNoImovel(def) {
  const st = estadoImovel(def.id);
  if (tempo - st.ultimoSono < 300) {
    const falta = Math.ceil((300 - (tempo - st.ultimoSono)) / 60);
    mostraMensagem(`🛏️ Você já descansou aqui há pouco. Volte em ~${falta} min.`);
    return;
  }
  st.ultimoSono = tempo;
  vida = Math.min(VIDA_MAX, vida + 35 + def.ml * 4);
  mana = Math.min(MANA_MAX, mana + 24 + def.ml * 3);
  hud.vida(vida, VIDA_MAX); hud.mana(mana, MANA_MAX);
  if (dragaoCompanheiro) {
    dragaoCompanheiro.ml = (dragaoCompanheiro.ml || 0) + def.ml;
    ganhaXpDragao(dragaoCompanheiro, def.xpDragao);
    dragaoCompanheiro.hpMax = hpMaxDe(dragaoCompanheiro);
    dragaoCompanheiro.hp = dragaoCompanheiro.hpMax;
    aplicaEstagioNoModelo();
    mostraMensagem(`🛏️ Descanso profundo: seu dragão ganhou +${def.ml} ML e +${def.xpDragao} XP.`);
  } else {
    mostraMensagem('🛏️ Você descansou e recuperou vida/mana. Com um dragão, a cama também treina ML.');
  }
  salvaJogo();
}
function alugaImovel(def) {
  const st = estadoImovel(def.id);
  if (st.alugado) { abreImovel(def); return; }
  if (def.requerGuilda && !guildaMembro) {
    dialogo.abre(def.nome, 'A Guildhouse só aceita membro reconhecido da Guilda de Venore. Derrube dragões e fale com o Mestre da Guilda.', [{ texto: 'Entendi', onClick: () => dialogo.fecha() }]);
    return;
  }
  if (ouro < def.custo) {
    dialogo.abre(def.nome, `Contrato inicial: ${def.custo} 🪙.\nVocê tem ${ouro} 🪙.`, [{ texto: 'Voltar', onClick: () => dialogo.fecha() }]);
    return;
  }
  ouro -= def.custo; hud.ouro(ouro);
  st.alugado = true; st.desde = Math.floor(tempo); st.aluguel = def.aluguel;
  sincronizaPlacasImoveis(); sons.tesouro(); salvaJogo();
  mostraMensagem(`🏠 Você alugou ${def.nome}. Agora esse lugar tem valor real.`);
  abreImovel(def);
}
function entraInteriorImovel(def) {
  const interior = interioresImoveis[def.id];
  if (!interior) { mostraMensagem('Este imovel ainda usa interior direto na superficie.'); return; }
  if (montado) { montado = false; mostraMensagem('Voce desmontou para entrar no imovel.'); }
  Object.values(interioresImoveis).forEach((z) => { if (z && z.grupo) z.grupo.visible = false; });
  interior.grupo.visible = true;
  subsoloAtual = interior;
  chaoY = interior.y;
  areaAtiva = interior.bounds;
  noEsgoto = true;
  const sp = interior.spawn || { x: 0, z: 0 };
  avatar.position.set(sp.x, interior.y, sp.z);
  velAvatarX = 0; velAvatarZ = 0; vy = 0; noChao = true;
  hemi.intensity = 0.2; sun.intensity = 0.05;
  minimapa.esconde();
  sons.porta();
  mostraMensagem(`Voce entrou em ${def.nome}.`);
}
function saiInteriorImovel(def) {
  const interior = interioresImoveis[def.id];
  if (interior && interior.grupo) interior.grupo.visible = false;
  chaoY = 0;
  areaAtiva = areaSuperficie();
  noEsgoto = false;
  subsoloAtual = esgoto;
  const sx = def.x, sz = def.z;
  avatar.position.set(sx, alturaTerreno(sx, sz), sz);
  velAvatarX = 0; velAvatarZ = 0; vy = 0; noChao = true;
  minimapa.mostra();
  sons.porta();
  mostraMensagem(`Voce saiu de ${def.nome}.`);
}
function abreImovel(def) {
  const st = estadoImovel(def.id);
  if (!st.alugado) {
    dialogo.abre(def.nome, `${def.tipo} disponível.\nContrato inicial: ${def.custo} 🪙 · aluguel-base: ${def.aluguel} 🪙.\nBenefícios: ${beneficiosTexto(def)}.`, [
      { texto: `Alugar por ${def.custo} 🪙`, onClick: () => alugaImovel(def) },
      { texto: 'Deixar para depois', onClick: () => dialogo.fecha() },
    ]);
    return;
  }
  const ops = [];
  if (interioresImoveis[def.id]) ops.push({ texto: 'Entrar no interior', onClick: () => { dialogo.fecha(); entraInteriorImovel(def); } });
  if (def.beneficios.dormir) ops.push({ texto: `Dormir e treinar dragão (+${def.ml} ML) 🛏️`, onClick: () => { dialogo.fecha(); dormirNoImovel(def); } });
  if (def.beneficios.depot) ops.push({ texto: 'Abrir depósito 🧰', onClick: () => { dialogo.fecha(); abreCofre(); } });
  if (def.beneficios.banco) ops.push({ texto: 'Abrir banco 🏦', onClick: () => abreBancoImovel(def) });
  if (def.beneficios.lixo) ops.push({ texto: 'Usar lixeira 🗑️', onClick: () => { dialogo.fecha(); limpaLixoImovel(def); } });
  if (typeof def.casaIdx === 'number') ops.push({ texto: 'Repintar telhado 🎨', onClick: () => {
    const casa = casas[def.casaIdx], est = estadoImovel(def.id);
    if (casa && casa.roof) {
      est.corIdx = (est.corIdx + 1) % TELHADOS.length;
      casa.roof.material = new THREE.MeshStandardMaterial({ color: TELHADOS[est.corIdx], roughness: 0.9 });
      salvaJogo(); mostraMensagem('🎨 Telhado repintado!');
    }
    dialogo.fecha();
  } });
  ops.push({ texto: 'Fechar', onClick: () => dialogo.fecha() });
  dialogo.abre(def.nome, `Contrato ativo.\nAluguel-base: ${def.aluguel} 🪙.\nBenefícios: ${beneficiosTexto(def)}.\nBanco: ${bancoOuro} 🪙 guardado.`, ops);
}
function registraImovel(def) {
  const placa = new THREE.Group(); placa.position.set(def.x, 0, def.z);
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), MAT_MADEIRA); poste.position.y = 0.9; placa.add(poste);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(def.tipo === 'Guildhouse' ? 1.7 : 1.35, 0.62, 0.08), new THREE.MeshStandardMaterial({ color: 0xc0392b }));
  tab.position.y = 1.6; placa.add(tab);
  const topo = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.34, 4), new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.6, roughness: 0.35 }));
  topo.position.y = 2.1; placa.add(topo);
  scene.add(placa);
  const it = { x: def.x, z: def.z, raio: def.tipo === 'Guildhouse' ? 4.2 : 3.0, titulo: `🏠 ${def.nome}`, acao: `Alugar ${def.tipo.toLowerCase()} (${def.custo} 🪙)` };
  it.onAcao = () => abreImovel(def);
  interativos.push(it);
  placasImoveis.push({ def, it, tab });
}
IMOVEIS.forEach(registraImovel);
sincronizaPlacasImoveis();

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
  // RV8.3 FIX: cada masmorra define suas SAÍDAS; o ESGOTO (rede que liga as
  // cidades) sobe pelo BUEIRO MAIS PRÓXIMO da posição atual — antes o
  // pareamento por índice surgia o jogador em Thais saindo de Venore.
  let b;
  if (subsoloAtual.saidas && subsoloAtual.saidas[i]) {
    b = subsoloAtual.saidas[i];
  } else {
    b = BUEIROS[0]; let melhor = Infinity;
    for (const bp of BUEIROS) {
      const dd = (bp.x - avatar.position.x) ** 2 + (bp.z - avatar.position.z) ** 2;
      if (dd < melhor) { melhor = dd; b = bp; }
    }
  }
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
// CAVERNAS DO PICO (RV5.8): descida pela boca de caverna na encosta sul
function desceCavernas() {
  if (montado) { montado = false; mostraMensagem('Você desmontou pra descer. 🐾'); }
  acessoAtual = 0;
  subsoloAtual = cavernasPico;
  cavernasPico.grupo.visible = true;
  chaoY = -40; areaAtiva = cavernasPico.bounds; noEsgoto = true;
  const a = cavernasPico.acessos[0];
  avatar.position.set(a.x + 2.5, -40, a.z - 2); vy = 0; noChao = true;
  hemi.intensity = 0.08; sun.intensity = 0.05;
  minimapa.esconde();
  sons.corda();
  mostraMensagem(tochaOn ? '🌋 O calor sobe das profundezas... cuidado onde pisa.' : 'Está escuro! Acenda a tocha — tecla T 🔦');
}
{
  const it = { x: 60, z: 266, raio: 3.0, titulo: '🌋 Cavernas do Pico', acao: 'Entrar nas Cavernas do Pico 🌋' };
  it.onAcao = () => desceCavernas();
  interativos.push(it);
}
// a LAVA das cavernas QUEIMA de verdade (entra nos campos de chão)
cavernasPico.lavas.forEach((L) => CAMPOS.push({ tipo: 'lava', x: L.x, z: L.z, r: L.r, y: L.y }));

// =============================================================
// AS IRMÃS AFUNDADAS (RV10.5): A BOCA SE ABRE.
// Tocar a Pedra da Boca (0,-206) com os 5 veios sentidos já entrega a "Gota
// da Veia" (RV9.0). Com ela na mochila, a corrente reconhece o herói como
// "nervo próprio" e a Boca deixa zarpar para a Segunda Terra (Ilha 1).
// =============================================================
function zarpaIrmas() {
  if (montado) { montado = false; mostraMensagem('Você desmontou pra embarcar. 🐾'); }
  acessoAtual = 0;
  subsoloAtual = irmas1;
  irmas1.grupo.visible = true;
  chaoY = -40; areaAtiva = irmas1.bounds; noEsgoto = true;
  const a = irmas1.acessos[0];
  avatar.position.set(a.x + 2, -40, a.z - 2); vy = 0; noChao = true;
  hemi.intensity = 0.34; sun.intensity = 0.16; // mar morno e escuro — sem tocha
  minimapa.esconde(); petAlvo = null; sons.agua();
  dialogo.abre('🌊 Você cruza a Boca',
    'A água fica preta e MORNA, como sangue. O céu mostra a Lua Partida refletida só de um lado. Ao sul descem silhuetas de ilhas que não existem em nenhum mapa de Venor.\n\nVocê acabou de sair do corpo do mundo. À frente, a primeira vértebra da espinha quebrada: A QUEBRA-MAR.',
    [{ texto: 'Pisar em terra estranha 🏝️', onClick: () => dialogo.fecha() }]);
}
// DOCA DA BOCA (superfície): a doca que ninguém terminou, na franja sul ao
// pé da Pedra da Boca — Mestre Calço, o barqueiro-renegado, a terminou.
{
  const docaSup = new THREE.Group(); docaSup.position.set(8, 0, -232); scene.add(docaSup);
  const madeira = new THREE.MeshStandardMaterial({ color: 0x4b3a26, roughness: 0.9 });
  for (let i = 0; i < 5; i++) {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 1.2), madeira);
    tab.position.set(0, 0.12, -i * 1.25); docaSup.add(tab);
  }
  const casco = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 4.2), new THREE.MeshStandardMaterial({ color: 0x32271a, roughness: 0.9 }));
  casco.position.set(2.6, 0.4, -4); casco.rotation.y = 0.3; docaSup.add(casco);
  const lampiao = new THREE.PointLight(0xffb060, 1.1, 14, 2); lampiao.position.set(0, 2.4, -1); docaSup.add(lampiao);
  const it = { x: 8, z: -234, raio: 3.4, titulo: '⛴️ Doca da Boca', acao: 'Zarpar para o Fundo 🌊' };
  it.onAcao = () => {
    if (!inventario.temItem('Gota da Veia')) {
      dialogo.abre('⛴️ Mestre Calço, o barqueiro',
        '— Pra cruzar a Boca não basta querer, forasteiro. A corrente só deixa passar quem ela reconhece como NERVO PRÓPRIO. Traga a Gota da Veia: sinta os cinco veios pelas Pedras e toque a Pedra da Boca, ali na areia. Aí eu solto as amarras.\n\n(A Vigília observa de longe — eles guardam a Fenda pra impedir que alguém REÚNA o que está partido.)',
        [{ texto: 'Entendi 🌑', onClick: () => dialogo.fecha() }]);
      return;
    }
    zarpaIrmas();
  };
  interativos.push(it);
}
// DOCA DE VOLTA (dentro da Ilha 1): retorna à praia, ao pé da Pedra da Boca
{
  const a = irmas1.acessos[0];
  const it = { x: a.x, z: a.z, y: -40, raio: 2.8, titulo: '⛴️ Doca de volta', acao: 'Voltar pela Boca 🌊' };
  it.onAcao = () => { if (subsoloAtual === irmas1) sobe(0); };
  interativos.push(it);
}
// O SINO da Quebra-Mar: o sino do porto inacabado de Venor, levado pela
// corrente — prova de que a Boca SEMPRE ligou os dois lados.
{
  const it = { x: irmas1.sino.x, z: irmas1.sino.z, y: -40, raio: 2.6, titulo: '🔔 Sino da Maré', acao: 'Badalar o sino 🔔' };
  it.onAcao = () => {
    sons.corda();
    dialogo.abre('🔔 O sino do porto inacabado',
      'Você reconhece o bronze: é o sino do porto que NINGUÉM terminou de construir, lá na Boca de Venor. A corrente o trouxe até aqui.\n\nEle badala — e o som volta de longe, do fundo do mar, como se OUTRO sino respondesse. Os dois lados sempre se ouviram.',
      [{ texto: 'Guardar o som 🌊', onClick: () => dialogo.fecha() }]);
  };
  interativos.push(it);
}
// A PLACA da Quebra-Mar: a primeira lápide das Irmãs (lore)
{
  const it = { x: irmas1.placa.x, z: irmas1.placa.z, y: -40, raio: 2.6, titulo: '🪧 Lápide de Sal', acao: 'Ler a lápide 🪧' };
  it.onAcao = () => dialogo.abre('🪧 A Lápide de Sal',
    '"Aqui descansa a frota que jurou voltar.\nNão voltaram para Venor — voltaram para CÁ.\nO sal lhes prendeu a memória em vez de deixá-la correr:\npor isso ainda caminham, e não lembram por quê.\n\nViajante: a água lembra. O sal aprisiona.\nNão deixe o Fundo te cristalizar."',
    [{ texto: 'Seguir descendo a espinha 🦴', onClick: () => dialogo.fecha() }]);
  interativos.push(it);
}
// AS AREIAS DO VEIO SECO · interativos de POI (RV10.7/10.8): cada ponto conta
// sua história; a Catedral oferece DESCER à Nave Profanada.
for (const poiDes of deserto.pois) {
  const it = { x: poiDes.x, z: poiDes.z, raio: poiDes.raio || 3.4, titulo: poiDes.titulo, acao: poiDes.acao };
  const p = poiDes;
  it.onAcao = () => {
    const botoes = [{ texto: 'Seguir 🏜️', onClick: () => dialogo.fecha() }];
    if (p.tipo === 'catedral') botoes.unshift({ texto: 'Descer à Nave Profanada 🕯️', onClick: () => { dialogo.fecha(); desceCatedral(); } });
    dialogo.abre(p.titulo, p.texto, botoes);
  };
  interativos.push(it);
}
// A NAVE PROFANADA (RV10.8): descida pela corda atrás do altar + corda de volta
// + o relicário que DESPERTA Vael (boss por invocação, padrão do Arconte).
function desceCatedral() {
  if (montado) { montado = false; mostraMensagem('Você desmontou pra entrar. 🐾'); }
  acessoAtual = 0;
  subsoloAtual = catedralI;
  catedralI.grupo.visible = true;
  chaoY = -40; areaAtiva = catedralI.bounds; noEsgoto = true;
  const a = catedralI.acessos[0];
  avatar.position.set(a.x, -40, a.z - 2); vy = 0; noChao = true;
  hemi.intensity = 0.18; sun.intensity = 0.08; // nave escura — vitrais e a Veia presa iluminam
  minimapa.esconde(); petAlvo = null; sons.corda();
  mostraMensagem('🕯️ Você desce à Nave Profanada... o ar cheira a mirra e morte.');
}
{
  const a = catedralI.acessos[0];
  const it = { x: a.x, z: a.z, y: -40, raio: 2.8, titulo: '🪢 Corda', acao: 'Subir ao adro 🪢' };
  it.onAcao = () => { if (subsoloAtual === catedralI) sobe(0); };
  interativos.push(it);
}
{
  const r = catedralI.relicario;
  const it = { x: r.x, z: r.z, y: -40, raio: 2.8, titulo: '⚱️ Relicário de Vael', acao: 'Tocar o relicário ⚱️' };
  it.onAcao = () => {
    if (subsoloAtual !== catedralI || !vaelCatedral) return;
    if (vaelCatedral._despertado) {
      mostraMensagem(vaelCatedral.vivo ? 'Vael já despertou — termine o que começou. ⚔️' : 'A costura foi desfeita. Vael descansa enfim. 🌒');
      return;
    }
    vaelCatedral._despertado = true;
    vaelCatedral.vivo = true; vaelCatedral.g.visible = true; vaelCatedral.hp = vaelCatedral.hpMax;
    dialogo.abre('⚱️ A Costura se Rompe',
      'Você toca o relicário. A Veia presa PULSA — e o que estava embalsamado abre os olhos.\n\nVAEL, o Santo Embalsamado, ergue-se: nem vivo nem morto, a agulha que tentaram usar pra costurar a Lua Partida e que nunca parou de doer. Desfaça a costura.',
      [{ texto: 'Empunhar a arma ⚔️', onClick: () => dialogo.fecha() }]);
  };
  interativos.push(it);
}

// ☁️🐉 AURÉLIA, A CIDADE NAS NUVENS (RV13.0): ascende do platô da Montanha do
// Dragão. Quest "A PROVA DE FOGO": o Ancião manda despertar e vencer o Guardião.
let provaFogoFeita = false;
function ascendeNuvens() {
  if (montado) { montado = false; }
  acessoAtual = 0;
  subsoloAtual = aurelia;
  aurelia.grupo.visible = true;
  chaoY = -40; areaAtiva = aurelia.bounds; noEsgoto = true;
  const a = aurelia.acessos[0];
  avatar.position.set(a.x, -40, a.z - 3); vy = 0; noChao = true;
  hemi.intensity = 0.9; sun.intensity = 0.72; // LUZ CELESTE (clara, dourada)
  minimapa.esconde(); petAlvo = null; sons.corda();
  dialogo.abre('☁️ Aurélia, a Cidade nas Nuvens',
    'O chão some sob você — só um mar de nuvens até o horizonte. Erguida em mármore e ouro acima da tempestade, AURÉLIA flutua: o berço da linhagem de fogo, onde os Dragões-Anciões guardam os ovos que ainda não nasceram.\n\nNo templo ao norte, algo imenso e antigo abre os olhos ao te ver chegar.',
    [{ texto: 'Caminhar entre os dragões 🐉', onClick: () => dialogo.fecha() }]);
}
{ // PORTAL no platô da Montanha do Dragão (110,300): o redemoinho que sobe
  const it = { x: 110, z: 308, y: 34, raio: 3.4, titulo: '🌪️ Ascensão às Nuvens', acao: 'Ascender a Aurélia ☁️' };
  it.onAcao = () => ascendeNuvens();
  interativos.push(it);
}
{ // descer de volta ao platô do Pico
  const a = aurelia.acessos[0];
  const it = { x: a.x, z: a.z, y: -40, raio: 3.0, titulo: '🌪️ Descer da cidade', acao: 'Descer ao Pico 🏔️' };
  it.onAcao = () => { if (subsoloAtual === aurelia) sobe(0); };
  interativos.push(it);
}
{ // O DRAGÃO-ANCIÃO (lord): dá a Prova de Fogo e desperta o Guardião
  const lo = aurelia.lord;
  const it = { x: lo.x, z: lo.z, y: -40, raio: 4.5, titulo: '🐉 Vaelthryx, o Dragão-Ancião', acao: 'Falar com o Ancião 🐉' };
  it.onAcao = () => {
    if (subsoloAtual !== aurelia || !dragaoNuvens) return;
    if (provaFogoFeita) {
      dialogo.abre('🐉 Vaelthryx, o Dragão-Ancião', 'Você passou na Prova de Fogo, mortal. Aurélia te reconhece como AMIGO DA CHAMA — os céus de Venor são seus.', [{ texto: 'Inclinar a cabeça', onClick: () => dialogo.fecha() }]);
      return;
    }
    if (dragaoNuvens._desperto && dragaoNuvens.vivo) { mostraMensagem('O Guardião ruge — termine a Prova! 🔥'); return; }
    dialogo.abre('🐉 Vaelthryx, o Dragão-Ancião',
      'Uma voz como trovão enche o templo:\n— "Pequeno andante da terra. Subiste à casa dos dragões. Mas só o FOGO reconhece o fogo. Desperta o GUARDIÃO no centro do templo e prova teu valor. Vence, e Aurélia se abre a ti. Falha, e voltarás a ser pó."',
      [{ texto: 'Aceitar a Prova de Fogo 🔥', onClick: () => {
        dialogo.fecha();
        dragaoNuvens._desperto = true; dragaoNuvens.vivo = true; dragaoNuvens.g.visible = true; dragaoNuvens.hp = dragaoNuvens.hpMax;
        mostraMensagem('🔥 O GUARDIÃO desperta! A Prova de Fogo começou!');
      } }, { texto: 'Ainda não...', onClick: () => dialogo.fecha() }]);
  };
  interativos.push(it);
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
const C_TOPO_NOITE = new THREE.Color(0x0a1530), C_BASE_NOITE = new THREE.Color(0x1e2e4d);
const C_FOG_DIA = new THREE.Color(0xc4d6e3), C_FOG_NOITE = new THREE.Color(0x1c2a40); // RV12.1: névoa noturna menos preta
// RV14.7: CÉU PRÓPRIO POR REGIÃO — cada lugar com seu céu (gerado por IA).
// Troca o panorama conforme a região; o ciclo dia/noite tinge por cima.
const CEUS_REGIAO = [
  { tex: 'ceu_pantano', cx: -330, cz: -30, r: 155 },  // Venore: brejo
  { tex: 'ceu_noctaria', cx: -660, cz: -30, r: 210 }, // Noctaria/Santuário: Lua Partida
  { tex: 'ceu_pico', cx: 110, cz: 300, r: 130 },      // Montanha do Dragão: vulcânico
];
const _ceuCache = {};
const _texLoaderCeu = new THREE.TextureLoader();
function carregaCeuTex(nome) {
  if (_ceuCache[nome]) return _ceuCache[nome];
  const t = _texLoaderCeu.load('texturas/' + nome + '.png', (tt) => { tt.colorSpace = THREE.SRGBColorSpace; });
  _ceuCache[nome] = t; return t;
}
let _ceuRegiaoAtual = null, _ceuPadrao = null;
function atualizaCeuRegiao() {
  if (noEsgoto || !ceu.material || !ceu.material.map) return; // subsolo tem luz própria
  if (!_ceuPadrao) _ceuPadrao = ceu.material.map; // guarda o céu azul base
  let alvo = null;
  for (const c of CEUS_REGIAO) {
    if (Math.hypot(avatar.position.x - c.cx, avatar.position.z - c.cz) < c.r) { alvo = c.tex; break; }
  }
  if (alvo !== _ceuRegiaoAtual) {
    _ceuRegiaoAtual = alvo;
    const novo = alvo ? carregaCeuTex(alvo) : _ceuPadrao;
    if (novo) { ceu.material.map = novo; ceu.material.needsUpdate = true; }
  }
}
let tempoDia = 0.3; // começa de manhã
let ehNoite = false;
let avisoNoite = false; // lembrete da tocha (1× por noite)
let noiteAnterior = false; // detecta a VIRADA do dia (eventos noturnos)
function aplicaDiaNoite(dt) {
  tempoDia = (tempoDia + dt / 300) % 1; // ciclo ~5 min
  const d = (Math.sin((tempoDia - 0.25) * Math.PI * 2) + 1) / 2; // 0=noite, 1=meio-dia
  fatorDiaVisual = d;
  ehNoite = d < 0.35;
  // NOITE ESTILO OT (RV4.2): madrugada ESCURA de verdade — a tocha, os
  // lampiões e o luar viram a diferença entre andar e tropeçar
  sun.intensity = 0.12 + d * 0.93;  // RV12.1: piso de noite +3x (era 0.04) — navegável
  hemi.intensity = 0.18 + d * 0.46;
  // RV8.3: a EXPOSIÇÃO do tonemap também escurece à noite (antes ficava fixa
  // em 0.80 o tempo todo) — a "madrugada de verdade" agora bate com o grading.
  renderer.toneMappingExposure = 0.68 + d * 0.12; // RV12.1: noite ~0.68 (era 0.58), dia ~0.80
  if (ceu.material.map) { // céu panorâmico: tinge do dia (branco) pra noite (azul-escuro)
    atualizaCeuRegiao(); // RV14.7: troca o panorama pela região (pântano/cinzas/vulcânico)
    ceu.material.color.setRGB(0.16 + d * 0.84, 0.2 + d * 0.8, 0.34 + d * 0.66);
  } else {
    skyMat.uniforms.corTopo.value.copy(C_TOPO_NOITE).lerp(C_TOPO_DIA, d);
    skyMat.uniforms.corBase.value.copy(C_BASE_NOITE).lerp(C_BASE_DIA, d);
  }
  if (scene.fog) {
    scene.fog.color.copy(C_FOG_NOITE).lerp(C_FOG_DIA, d);
    scene.fog.near = 165 + d * 95;  // RV12.1: névoa não fecha tanto à noite (era 110)
    scene.fog.far = 500 + d * 220;  // (vê-se MUITO mais longe de madrugada agora)
  }
  const noite = 1 - d;
  // aviso de sobrevivência (1× por noite): acende a tocha!
  if (ehNoite && !tochaOn && !noEsgoto && jogoIniciado && !avisoNoite) {
    avisoNoite = true; mostraMensagem('🌙 A noite caiu de verdade — acenda a tocha (tecla T)!');
  }
  if (!ehNoite) avisoNoite = false;
  // EVENTO NOTURNO (RV5.7): a virada do dia comanda os mortos do cemitério
  if (ehNoite !== noiteAnterior) {
    noiteAnterior = ehNoite;
    if (ehNoite) {
      for (const r of ESQUELETOS_NOTURNOS) {
        if (!r.corpse) { r.vivo = true; r.g.visible = true; r.hp = r.hpMax; }
      }
      if (jogoIniciado) setTimeout(() => mostraMensagem('💀 Os mortos se ergueram no Cemitério Abandonado...'), 2600);
    } else {
      for (const r of ESQUELETOS_NOTURNOS) {
        r.vivo = false; r.corpse = false; r.g.visible = false; r.respawnAt = null;
        if (r.barraHP) r.barraHP.visible = false;
      }
    }
  }
  // LUAR: a lua brilha mais à noite (mas fica visível de dia, pálida) + estrelas surgem
  luaLuz.intensity = (ehMobile ? 0.5 : 0.78) * Math.max(0, noite - 0.12); // RV12.1: luar mais forte
  if (luaMat) luaMat.emissiveIntensity = 0.4 + noite * 1.65; // RV11.3: Lua Partida BRILHA à noite (bloom), discreta de dia
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
    if (p.lumMat) p.lumMat.emissiveIntensity = 0.15 + noite * 1.85; // emissivo forte tambem no mobile
  }
  const aceso = Math.min(1, Math.max(0, (noite - 0.22) * 1.65));
  for (const l of luzesUrbanas) {
    const pulso = 1 + Math.sin(tempo * 2.2 + l.fase) * 0.035;
    l.sp.material.opacity = aceso * 0.82;
    l.sp.scale.setScalar(l.base * (0.85 + aceso * 0.35) * pulso);
  }
}
function atualizaLuzRecorte() {
  if (!avatar || !camera) return;
  tmpLuzRecorte.subVectors(camera.position, avatar.position);
  if (tmpLuzRecorte.lengthSq() < 0.001) tmpLuzRecorte.set(0, 0, 1);
  tmpLuzRecorte.normalize();
  luzRecorte.position.set(
    avatar.position.x - tmpLuzRecorte.x * 42,
    avatar.position.y + 24,
    avatar.position.z - tmpLuzRecorte.z * 42,
  );
  luzRecorte.target.position.set(avatar.position.x, avatar.position.y + 1.7, avatar.position.z);
  const noite = 1 - fatorDiaVisual;
  luzRecorte.intensity = noEsgoto ? 0 : (ehMobile ? 0.13 : 0.48) * (0.76 + noite * 0.28);
  luzPreenchimentoEstilizado.intensity = noEsgoto ? 0.03 : (ehMobile ? 0.08 : 0.16) * (0.86 + fatorDiaVisual * 0.2);
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
      registraFlinchBicho(r, avatar.position, 0.26, 0.22);
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
      registraFlinchBicho(r, avatar.position, 0.22, 0.2);
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
// RV13.5: a ROUPA/ARMADURA equipada aparece com a CARA DO ITEM real (Minecraft):
// couro=marrom, ferro=cinza, dragão=obsidiana, ouro/guilda=dourado, manto=pano.
function estiloEquip(item) {
  const n = ((item && item.nome) || '').toLowerCase();
  if (n.includes('drag')) return { cor: 0x2a2730, metal: 0.55, rough: 0.45 };
  if (n.includes('ouro') || n.includes('dourad') || n.includes('guilda')) return { cor: 0xc99a2e, metal: 0.82, rough: 0.3 };
  if (n.includes('obsidiana') || n.includes('sombra') || n.includes('lua')) return { cor: 0x1d1a22, metal: 0.42, rough: 0.5 };
  if (n.includes('couro') || n.includes('manto') || n.includes('túnica') || n.includes('tunica') || n.includes('seda')) return { cor: 0x6e4a2a, metal: 0.0, rough: 0.92 };
  return { cor: 0xb8bcc4, metal: 0.62, rough: 0.36 }; // ferro/aço/placa (padrão)
}
function matEquipItem(item) { const e = estiloEquip(item); return new THREE.MeshStandardMaterial({ color: e.cor, metalness: e.metal, roughness: e.rough, envMapIntensity: 0.16 }); }
function poeCorpoEquip() {
  const p = avatar.userData.partes; if (!p) return;
  // limpa as peças anteriores em TODAS as partes que recebem equip (senão acumula)
  [avatar, p.bracoEsq, p.bracoDir, p.pernaEsq, p.pernaDir].forEach((o) => o.children.filter((c) => c.name === 'equipCorpo').forEach((c) => o.remove(c)));
  // RV13.6: o TORSO REAL vira a armadura (não um caixote por cima) — Minecraft.
  // Sem peito equipado, volta exatamente à cor do casaco escolhido.
  if (p.tronco) p.tronco.material = equipados.tronco ? matEquipItem(equipados.tronco) : (p.troncoMatBase || p.tronco.material);
  if (equipados.cabeca) { // ELMO com a cara do item + crista
    const mt = matEquipItem(equipados.cabeca);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.62, 0.92), mt); m.name = 'equipCorpo'; m.position.y = 2.74; m.castShadow = true; avatar.add(m);
    const cr = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), mt); cr.name = 'equipCorpo'; cr.position.y = 3.18; avatar.add(cr);
  }
  if (equipados.tronco) { // OMBREIRAS (volume) — o peito já está re-skinado acima
    const mt = matEquipItem(equipados.tronco);
    [-0.66, 0.66].forEach((ox) => { const om = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.62), mt); om.name = 'equipCorpo'; om.position.set(ox, 2.04, 0); om.castShadow = true; avatar.add(om); });
  }
  if (equipados.pes) { // BOTAS reais nas duas pernas
    const mt = matEquipItem(equipados.pes);
    [p.pernaEsq, p.pernaDir].forEach((pn) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.6), mt); b.name = 'equipCorpo'; b.position.set(0, -0.82, 0.08); b.castShadow = true; pn.add(b); });
  }
  if (equipados.maoEsq) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.92, 0.72), matEquipItem(equipados.maoEsq)); m.name = 'equipCorpo'; m.position.set(0, -0.4, 0.3); p.bracoEsq.add(m); }
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
const avisosFogo = [];
const avisosMonstro = [];
const PERFIS_MONSTRO_RV70 = {
  lobo: { aggro: 18, dist: 7.5, cd: 5.0, aviso: 0.48, dur: 0.26, alcance: 2.0, mult: 1.15, raio: 1.35, cor: 0xffd166, msg: 'O lobo abaixa o corpo e avança!' },
  orc: { aggro: 17, dist: 6.6, cd: 5.8, aviso: 0.55, dur: 0.3, alcance: 2.15, mult: 1.22, raio: 1.55, cor: 0xf08a32, msg: 'O orc puxa o golpe pesado!' },
  orcWarlord: { aggro: 24, dist: 8.4, cd: 6.3, aviso: 0.7, dur: 0.34, alcance: 2.65, mult: 1.35, raio: 2.25, cor: 0xff5b38, msg: 'O Senhor da Guerra investe com o machado!' },
  drakari: { aggro: 20, dist: 7.2, cd: 5.3, aviso: 0.52, dur: 0.28, alcance: 2.2, mult: 1.2, raio: 1.55, cor: 0xff6f3c, msg: 'O Drakari finca a lança e dispara!' },
  drakariElite: { aggro: 22, dist: 7.8, cd: 6.0, aviso: 0.64, dur: 0.32, alcance: 2.45, mult: 1.3, raio: 1.95, cor: 0xff3434, msg: 'O guarda Drakari prepara uma estocada ritual!' },
  troll: { aggro: 16, dist: 6.0, cd: 6.2, aviso: 0.62, dur: 0.32, alcance: 2.25, mult: 1.28, raio: 1.7, cor: 0xb4d36a, msg: 'O troll junta força para esmagar!' },
  trollAnciao: { aggro: 22, dist: 7.4, cd: 6.5, aviso: 0.72, dur: 0.36, alcance: 2.7, mult: 1.38, raio: 2.25, cor: 0xff9b3a, msg: 'O Troll Ancião bate no chão e avança!' },
  ciclope: { aggro: 20, dist: 7.0, cd: 6.8, aviso: 0.78, dur: 0.38, alcance: 2.8, mult: 1.42, raio: 2.35, cor: 0xf4c46a, msg: 'O ciclope ergue a clava!' },
  urso: { aggro: 18, dist: 6.6, cd: 6.0, aviso: 0.58, dur: 0.32, alcance: 2.35, mult: 1.25, raio: 1.85, cor: 0xd09a62, msg: 'O urso baixa a cabeça e atropela!' },
  aranha: { aggro: 20, dist: 7.4, cd: 5.5, aviso: 0.5, dur: 0.3, alcance: 2.25, mult: 1.18, raio: 1.8, cor: 0xba55ff, msg: 'A aranha se encolhe para saltar!' },
  esqueleto: { aggro: 15, dist: 5.6, cd: 6.0, aviso: 0.54, dur: 0.3, alcance: 2.0, mult: 1.18, raio: 1.35, cor: 0xd8d0b0, msg: 'O esqueleto range e corta de lado!' },
  reiEsqueleto: { aggro: 22, dist: 7.5, cd: 6.4, aviso: 0.68, dur: 0.34, alcance: 2.55, mult: 1.34, raio: 2.15, cor: 0xe8d68a, msg: 'O Rei Esqueleto chama um golpe antigo!' },
  arconteDrakari: { aggro: 28, dist: 8.8, cd: 6.8, aviso: 0.78, dur: 0.38, alcance: 2.9, mult: 1.45, raio: 2.55, cor: 0xff2e1f, msg: 'O Arconte dobra a luz da fenda e investe!' },
};
Object.assign(PERFIS_MONSTRO_RV70, {
  draptor: { aggro: 28, dist: 9.2, cd: 5.7, aviso: 0.58, dur: 0.36, alcance: 2.75, mult: 1.42, raio: 2.35, cor: 0x7fe06a, msg: 'O Draptor raspa as garras no chão e dispara!' },
  draptorLendario: { aggro: 34, dist: 10.4, cd: 5.2, aviso: 0.54, dur: 0.34, alcance: 3.05, mult: 1.6, raio: 2.8, cor: 0x68d8ff, msg: 'O Draptor Lendário dobra a luz e investe!' },
});
const MAT_PROJ_FOGO = new THREE.MeshStandardMaterial({ color: 0xff7a2a, emissive: 0xff4a00, emissiveIntensity: 1 });
const MAT_PROJ_MAGIA = new THREE.MeshStandardMaterial({ color: 0xc44aff, emissive: 0x8a2ad8, emissiveIntensity: 1 });
const MAT_LAVA_CHAO = new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0xff3a00, emissiveIntensity: 0.9, roughness: 0.6 });
aplicaTexturaReal(MAT_LAVA_CHAO, 'lava', 1.5, 1.5, true);
function criaProjetilFogoVisual(fogo) {
  const g = new THREE.Group();
  if (fogo) {
    const matCore = new THREE.MeshBasicMaterial({ color: 0xffd05a, transparent: true, opacity: 0.95, depthWrite: false });
    const matHalo = new THREE.MeshBasicMaterial({ color: 0xff5a16, transparent: true, opacity: 0.42, depthWrite: false });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), matCore);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.74, 14, 10), matHalo);
    const cauda = new THREE.Mesh(new THREE.ConeGeometry(0.44, 1.25, 8), matHalo);
    cauda.rotation.x = -Math.PI / 2; cauda.position.z = -0.72;
    g.add(halo, core, cauda);
    if (!ehMobile) g.add(new THREE.PointLight(0xff6a1a, 1.2, 18, 2.3));
    g.userData = { fogo: true, matCore, matHalo, core, halo, cauda, fase: Math.random() * 6 };
  } else {
    const matCore = new THREE.MeshBasicMaterial({ color: 0xe0a8ff, transparent: true, opacity: 0.92, depthWrite: false });
    const matHalo = new THREE.MeshBasicMaterial({ color: 0x7e31ff, transparent: true, opacity: 0.34, depthWrite: false });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), matCore);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 12, 10), matHalo);
    g.add(halo, core);
    g.userData = { fogo: false, matCore, matHalo, core, halo, fase: Math.random() * 6 };
  }
  return g;
}
function avisoFogoNoChao(x, z, y, r = 2.35) {
  const matAlvo = new THREE.MeshBasicMaterial({ color: 0xff6a24, transparent: true, opacity: 0.52, side: THREE.DoubleSide, depthWrite: false });
  const alvo = new THREE.Mesh(new THREE.RingGeometry(r * 0.62, r, 28), matAlvo);
  alvo.rotation.x = -Math.PI / 2;
  alvo.position.set(x, y + 0.14, z);
  alvo.renderOrder = 8;
  scene.add(alvo);
  avisosFogo.push({ mesh: alvo, mat: matAlvo, t: 0, dur: 0.78 });
}
function perfilMonstroRV70(r) {
  if (!r || r.filhote || r.voando) return null;
  return PERFIS_MONSTRO_RV70[r.especie] || null;
}
function avisoMonstroNoChao(x, z, y, raio, cor, dur = 0.75) {
  const matAlvo = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false });
  const alvo = new THREE.Mesh(new THREE.RingGeometry(raio * 0.52, raio, 26), matAlvo);
  alvo.rotation.x = -Math.PI / 2;
  alvo.position.set(x, y + 0.16, z);
  alvo.renderOrder = 9;
  scene.add(alvo);
  avisosMonstro.push({ mesh: alvo, mat: matAlvo, t: 0, dur, base: raio });
}
function atualizaAvisosMonstro(dt) {
  for (let i = avisosMonstro.length - 1; i >= 0; i--) {
    const a = avisosMonstro[i];
    a.t += dt;
    const f = Math.min(1, a.t / a.dur);
    const pulso = 1 + Math.sin(f * Math.PI) * 0.22;
    a.mesh.scale.setScalar(pulso);
    a.mat.opacity = 0.42 * (1 - f);
    if (f >= 1) { scene.remove(a.mesh); avisosMonstro.splice(i, 1); }
  }
}
function agendaInvestidaMonstro(r, p, dx, dz, dist) {
  const mx = dx / dist, mz = dz / dist;
  const alvoX = avatar.position.x + mx * 1.15;
  const alvoZ = avatar.position.z + mz * 1.15;
  if (podeAndarBicho && !podeAndarBicho(alvoX, alvoZ, r.g.position.y)) return;
  const durTotal = p.aviso + p.dur + 0.08;
  r.pausa = Math.max(r.pausa || 0, durTotal);
  r._rv70Investida = {
    p,
    x0: r.g.position.x,
    z0: r.g.position.z,
    x1: alvoX,
    z1: alvoZ,
    inicio: tempo,
    dispara: tempo + p.aviso,
    fim: tempo + p.aviso + p.dur,
    bateu: false,
  };
  r._rv70ProxInvestida = tempo + p.cd;
  r.g.rotation.y = Math.atan2(dx, dz);
  avisoMonstroNoChao(r.g.position.x, r.g.position.z, r.g.position.y, p.raio, p.cor, p.aviso);
  avisoMonstroNoChao(alvoX, alvoZ, avatar.position.y, p.raio * 0.92, p.cor, p.aviso + p.dur);
  if (tempo > (r._rv70MsgAte || 0)) {
    r._rv70MsgAte = tempo + 4.5;
    mostraMensagem(p.msg);
  }
  if (r.boss) mostraBossHud(r, 4.5);
}
function danoInvestidaMonstro(r, p) {
  if (r.veneno && Math.random() < 0.45 && tempo > envenenadoAte) {
    envenenadoAte = tempo + 6;
    mostraMensagem('Mordida venenosa: você foi envenenado por 6s.');
  }
  const dano = Math.max(1, Math.round((r.dano || 5) * p.mult) - defesa);
  mostraMensagem(`Investida! (-${dano})`);
  return recebeDano(dano);
}
function atualizaPresencaMonstros(dt) {
  if (!jogoIniciado || morto) return;
  for (const r of ratos) {
    if (!r.vivo || r.corpse || r.voando) continue;
    const p = perfilMonstroRV70(r);
    if (!p || Math.abs(r.g.position.y - avatar.position.y) > 7) continue;
    const dx = avatar.position.x - r.g.position.x;
    const dz = avatar.position.z - r.g.position.z;
    const dist = Math.hypot(dx, dz);
    const inv = r._rv70Investida;
    if (inv) {
      r.pausa = Math.max(r.pausa || 0, 0.12);
      const u = r.g.userData;
      if (tempo < inv.dispara) { // RV15.4: WIND-UP — agacha e recolhe as patas (arma o bote)
        const w = Math.min(1, (tempo - inv.inicio) / Math.max(0.01, p.aviso));
        if (u) { u._golpePreparo = Math.max(u._golpePreparo || 0, w); u._golpeImpacto = 0; }
        r.g.scale.y *= (1 - w * 0.18); // atualizaRatos repõe a escala base no próximo frame (sem restore)
        if (u && u.patas) u.patas.forEach((pp) => { pp.rotation.x = -w * 0.5; });
        continue;
      }
      const f = Math.min(1, (tempo - inv.dispara) / p.dur);
      if (u) { u._golpePreparo = Math.max(0, 1 - f); u._golpeImpacto = Math.max(u._golpeImpacto || 0, Math.sin(f * Math.PI)); }
      r.g.scale.z *= (1 + Math.sin(f * Math.PI) * 0.2); // LUNGE — estica o corpo no golpe
      r.g.rotation.x = Math.sin(f * Math.PI) * 0.22;     // INCLINA pra frente no golpe (auto-reseta em f=1)
      const s = f * f * (3 - 2 * f);
      const nx = inv.x0 + (inv.x1 - inv.x0) * s;
      const nz = inv.z0 + (inv.z1 - inv.z0) * s;
      if (!podeAndarBicho || podeAndarBicho(nx, nz, r.g.position.y)) {
        r.g.position.x = nx; r.g.position.z = nz;
      }
      r.g.rotation.y = Math.atan2(inv.x1 - inv.x0, inv.z1 - inv.z0);
      const dh = Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
      if (!inv.bateu && dh < p.alcance) {
        inv.bateu = true;
        if (danoInvestidaMonstro(r, p)) return;
      }
      if (f >= 1) { if (u) { u._golpePreparo = 0; u._golpeImpacto = 0; } r._rv70Investida = null; }
      continue;
    }
    if (dist > p.aggro) continue;
    if (tempo > (r._rv70AlertaAte || 0)) {
      r._rv70AlertaAte = tempo + 3.4;
      avisoMonstroNoChao(r.g.position.x, r.g.position.z, r.g.position.y, p.raio * 0.84, p.cor, 0.55);
    }
    if (dist > 2.4 && dist < p.dist && tempo > (r._rv70ProxInvestida || 0)) {
      agendaInvestidaMonstro(r, p, dx, dz, dist);
    }
  }
}
function disparaBicho(r) {
  const fogo = r.atira === 'fogo';
  const m = criaProjetilFogoVisual(fogo);
  const de = r.g.position.clone(); de.y += r.tiroAltura ?? (fogo ? 7.4 : 4.2); // sai da boca/olho
  const ate = avatar.position.clone(); ate.y += 1.4;          // mira onde você ESTÁ (corre pra esquivar!)
  m.position.copy(de); m.lookAt(ate); scene.add(m);
  if (fogo) avisoFogoNoChao(ate.x, ate.z, avatar.position.y, r.boss ? 2.65 : 2.2);
  if (fogo && r.g.userData && r.g.userData.garganta) {
    r.g.userData.garganta.userData._flare = tempo; // RV15.3: garganta FLAMEJA ao cuspir
    r.g.userData._golpePreparo = 0.35;
    r.g.userData._golpeImpacto = 1;
  }
  if (r.boss) mostraBossHud(r, 5.5);
  projeteis.push({ m, de, ate, t: 0, dur: Math.max(0.3, de.distanceTo(ate) / 22), dano: r.danoTiro || 10, fogo });
}
function criaLavaTemp(x, z, y) {
  const m = new THREE.Group();
  const miolo = new THREE.Mesh(new THREE.CircleGeometry(2, 22), MAT_LAVA_CHAO);
  miolo.rotation.x = -Math.PI / 2; m.add(miolo);
  const crosta = new THREE.Mesh(new THREE.RingGeometry(1.7, 2.25, 22),
    new THREE.MeshStandardMaterial({ color: 0x251714, roughness: 1, flatShading: true }));
  crosta.rotation.x = -Math.PI / 2; crosta.position.y = 0.018; m.add(crosta);
  if (!ehMobile) {
    const luz = new THREE.PointLight(0xff4a14, 0.85, 10, 2.2);
    luz.position.y = 0.8; m.add(luz);
  }
  m.position.set(x, y + 0.09, z); scene.add(m);
  camposTemp.push({ tipo: 'lava', x, z, r: 2, y, expiraAt: tempo + 12, mesh: m });
}

// EXPLOSÃO da Runa de Fogo (esfera que cresce e some)
const explosoes = [];
function explosaoFogoEm(pos, escala = 1, yOff = 1.2) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.7, depthWrite: false }));
  m.position.copy(pos); m.position.y += yOff;
  m.scale.setScalar(escala);
  scene.add(m);
  explosoes.push({ m, t: 0, base: escala });
}
function explosaoFogo() { explosaoFogoEm(avatar.position, 1); }
function registraFlinchBicho(r, origem, forca = 0.18, dur = 0.18) {
  if (!r || !r.g || !origem) return;
  const dragaoFogo = r.dragao || r.especie === 'dragao' || (r.boss && r.atira === 'fogo');
  const u = r.g.userData || {};
  r._flinch = {
    t0: tempo,
    dur: dragaoFogo ? Math.max(dur, 0.3) : dur,
    forca: dragaoFogo ? Math.max(forca, 0.42) : forca,
    abaixa: dragaoFogo ? 0.12 : 0.08,
    inclina: dragaoFogo ? 0.22 : 0.12,
    dirX: r.g.position.x - origem.x,
    dirZ: r.g.position.z - origem.z,
  };
  if (dragaoFogo) {
    u._golpeImpacto = Math.max(u._golpeImpacto || 0, 0.85);
    if (u.garganta) u.garganta.userData._flare = tempo;
  }
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
    registraFlinchBicho(melhor, avatar.position, 0.16, 0.16);
    atualizaBarraHP(melhor);
    if (melhor.hp <= 0) mataBicho(melhor);
    else mostraMensagem(`${usouVirote ? '🏹 VIROTAÇO!' : '🏹 Flechada!'} (-${danoTiro}, vida ${Math.max(0, melhor.hp)})`);
    return;
  }
  const melhor = alvoRato();
  if (!melhor) { mostraMensagem('Golpe no ar!'); sons.erro(); return; }
  sons.golpe();
  petAlvo = melhor; // o pet entra na briga junto
  melhor.hp -= dano; melhor.piscar = 0.15; if (melhor.g.userData.corpoMat) melhor.g.userData.corpoMat.emissive.setHex(0x882020);
  registraFlinchBicho(melhor, avatar.position, 0.2, 0.18); // RV16.2: boss/dragao reage com peso maior
  atualizaBarraHP(melhor);
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
  vorag: { chance: 0.15, item: { nome: 'Presa de Vorag', icone: '🦴', slot: 'colar', defesa: 6 } },
  trollAnciao: { chance: 0.08, item: { nome: 'Clava de Magma', icone: '🌋', slot: 'maoDir', dano: 24, arma: true } },
  arconteDrakari: { chance: 0.16, item: { nome: 'Lâmina da Lua Partida', icone: '🗡️', slot: 'maoDir', dano: 38, arma: true } },
};
// === VORAG, O PRIMEIRO (RV5.3): o finale da lore — a Ossada SE ERGUE ===
// Invocado ao aceitar "O Terceiro Sinal" (e re-invocado no load, se a
// chama já foi acesa). Dragão osso-pálido, 2.2×, cospe fogo de longe.
Object.assign(RAROS, {
  draptor: { chance: 0.08, item: { nome: 'Garra de Draptor', icone: 'G', slot: 'colar', defesa: 5 } },
  draptorLendario: { chance: 0.18, item: { nome: 'Crista Lendária do Draptor', icone: 'C', slot: 'cabeca', defesa: 9 } },
});
function tentaCapturarDraptor(r) {
  if (!r || (r.especie !== 'draptor' && r.especie !== 'draptorLendario')) return;
  const questFeita = (questEstado.selaDraptor || {}).feita;
  if (!questFeita || !inventario.temItem('Sela Dracônica')) {
    mostraMensagem('O Draptor cai, mas ninguém consegue conter a fera sem a Sela Dracônica da Hela.');
    return;
  }
  const alvoPet = r.especie === 'draptorLendario' ? 'draptorLendario' : 'draptor';
  if (petsDomados.includes(alvoPet)) return;
  const chance = r.especie === 'draptorLendario' ? 0.04 : 0.10;
  if (Math.random() < chance) {
    inventario.consomeItem('Sela Dracônica');
    petsDomados.push(alvoPet);
    trocaPet(alvoPet);
    sons.tesouro();
    mostraMensagem(r.especie === 'draptorLendario'
      ? 'CAPTURA LENDÁRIA! O Draptor Lendário aceitou sua sela. Esta é a montaria mais rara de Venor.'
      : 'Você capturou um Draptor! Use M para montar e o painel de personagem para trocar montaria.');
    salvaJogo();
  } else {
    mostraMensagem('A Sela Dracônica brilhou, mas o Draptor resistiu. A captura continua rara.');
  }
}
let voragInvocado = false;
function invocaVorag() {
  if (voragInvocado) return;
  voragInvocado = true;
  const v = criaDragao(250, 120);
  v.scale.setScalar(2.2);
  v.traverse((o) => {
    if (o.isMesh && o.material && o.material.color) {
      o.material = o.material.clone();
      o.material.color.lerp(new THREE.Color(0xe8e0cc), 0.65); // pele de osso
    }
  });
  const r = addMonstro(v, 800, 300, 30, 1.4, true, areaMon(250, 120, 18), {
    boss: true, especie: 'vorag', atira: 'fogo', alcanceTiro: 18, danoTiro: 24, cadencia: 3.5, tiroAltura: 8,
    lootEspecial: { nome: 'Coração Ancestral', icone: '🫀' },
  });
  scene.add(r.g);
  sons.dor();
  mostraMensagem('🦴 A OSSADA SE ERGUE! Vorag, o Primeiro, renasceu no campo a leste — o Terceiro Sinal se cumpriu!');
}
// ARCONTE DRAKARI (RV6.0): boss final da primeira cadeia de Noctaria.
// Nasce somente quando o jogador aceita "A Lua Partida" e continua salvo.
let arconteInvocado = false;
function invocaArconteDrakari() {
  if (arconteInvocado) return;
  arconteInvocado = true;
  const g = criaDrakari(-742, -30, true);
  g.scale.setScalar(2.15);
  g.traverse((o) => {
    if (o.isMesh && o.material && o.material.emissive) {
      o.material = o.material.clone();
      o.material.emissive.setHex(0x6a160c);
      o.material.emissiveIntensity = Math.max(o.material.emissiveIntensity || 0, 0.45);
    }
  });
  const r = addMonstro(g, 1250, 620, 44, 1.55, true, areaMon(-742, -30, 24), {
    boss: true, especie: 'arconteDrakari',
    atira: 'fogo', alcanceTiro: 22, danoTiro: 34, cadencia: 3.1, tiroAltura: 6.6,
    lootEspecial: { nome: 'Coração de Obsidiana', icone: '🫀' },
  });
  scene.add(r.g);
  aplicaGLBEm(r);
  sons.dor();
  mostraMensagem('🌑 A LUA PARTIDA SE ABRE! O Arconte Drakari acordou no santuário a oeste de Noctaria.');
}
// BARRA DE VIDA flutuante (RV5.5): aparece sobre o bicho ao ser ferido e
// some sozinha em 4s — jogabilidade de verdade, sem ler número em texto
let proxInvasaoDraptor = 220 + Math.random() * 260;
let invasaoDraptorAtiva = null;
const PONTOS_INVASAO_DRAPTOR = [
  { nome: 'Ruínas da Estrada', x: 154, z: 246, r: 30 },
  { nome: 'Passo do Ciclope', x: 205, z: 170, r: 34 },
  { nome: 'Estrada das Cinzas', x: -690, z: -50, r: 36 },
  { nome: 'Trilha do Pico', x: 110, z: 300, r: 32 },
];
function iniciaInvasaoDraptor(forcar = false) {
  if (invasaoDraptorAtiva && invasaoDraptorAtiva.vivo && !invasaoDraptorAtiva.corpse) return;
  if (!forcar && (!jogoIniciado || noEsgoto || morto)) return;
  const p = PONTOS_INVASAO_DRAPTOR[Math.floor(Math.random() * PONTOS_INVASAO_DRAPTOR.length)];
  const lendario = Math.random() < 0.14;
  const g = criaDraptor(lendario);
  g.position.set(p.x, alturaTerreno(p.x, p.z), p.z);
  const r = addMonstro(g, lendario ? 1450 : 880, lendario ? 900 : 520, lendario ? 52 : 38, lendario ? 2.45 : 2.15, true, areaMon(p.x, p.z, p.r), {
    boss: true,
    especie: lendario ? 'draptorLendario' : 'draptor',
    invasao: true,
    lootEspecial: { nome: lendario ? 'Núcleo Prismático' : 'Escama de Draptor', icone: lendario ? 'N' : 'E' },
  });
  scene.add(r.g);
  invasaoDraptorAtiva = r;
  proxInvasaoDraptor = tempo + 420 + Math.random() * 420;
  mostraMensagem(lendario
    ? `INVASÃO RARA: o Draptor Lendário apareceu em ${p.nome}!`
    : `Invasão: um Draptor foi avistado em ${p.nome}.`);
  mostraBossHud(r, 8);
}
function atualizaInvasaoDraptor() {
  if (!jogoIniciado || noEsgoto || morto) return;
  if (invasaoDraptorAtiva && (!invasaoDraptorAtiva.vivo || invasaoDraptorAtiva.corpse)) {
    invasaoDraptorAtiva = null;
  }
  if (!invasaoDraptorAtiva && tempo > proxInvasaoDraptor) iniciaInvasaoDraptor();
}
function atualizaBarraHP(r) {
  if (!r || !r.vivo) return;
  if (r.boss) mostraBossHud(r, 6);
  if (!r.barraHP) {
    const cnv = document.createElement('canvas'); cnv.width = 64; cnv.height = 10;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthTest: false }));
    sp.scale.set(1.7, 0.26, 1); sp.renderOrder = 998;
    const box = new THREE.Box3().setFromObject(r.g);
    sp.position.y = Math.max(2.2, (box.max.y - r.g.position.y) + 0.7);
    r.g.add(sp); r.barraHP = sp; r.barraCnv = cnv;
  }
  const c = r.barraCnv.getContext('2d');
  c.clearRect(0, 0, 64, 10);
  c.fillStyle = 'rgba(10,14,20,.78)'; c.fillRect(0, 0, 64, 10);
  const f = Math.max(0, r.hp / r.hpMax);
  c.fillStyle = f > 0.5 ? '#46c46a' : f > 0.25 ? '#e0b020' : '#d84a3a';
  c.fillRect(2, 2, Math.max(1, 60 * f), 6);
  r.barraHP.material.map.needsUpdate = true;
  r.barraHP.visible = true;
  clearTimeout(r._barraTimer);
  r._barraTimer = setTimeout(() => { if (r.barraHP) r.barraHP.visible = false; }, 4000);
}
function mataBicho(r) {
  r.vivo = false; r.corpse = true;
  if (r.barraHP) r.barraHP.visible = false;
  if (bossHudAlvo === r && bossHudEl) { bossHudEl.style.display = 'none'; bossHudAlvo = null; }
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
  tentaCapturarDraptor(r);
  const xp = r.xp || 5;
  hud.ganhaXP(xp);
  evoluiDragaoComHeroi(xp); // o dragão-companheiro cresce junto (metade do XP)
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
  r.loot = []; r.corpse = false; r.g.visible = false; r.respawnAt = r.invasao ? null : tempo + (r.boss ? 60 : 25);
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
  if (noEsgoto) { chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false; escondeZonasCarregadas(); subsoloAtual = esgoto; minimapa.mostra(); }
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
  // RV8.3 FIX: ao renascer (dragão/boss do esgoto trocam o r.g), a barra de
  // vida antiga ficava órfã e o chefe renascia SEM barra — limpa pra recriar.
  if (r.barraHP) { clearTimeout(r._barraTimer); r.barraHP.parent && r.barraHP.parent.remove(r.barraHP); r.barraHP = null; r.barraCnv = null; r._barraTimer = null; }
  if (r.dragao) {
    // raramente (20%), no lugar do dragão verde nasce o DRAGON LORD vermelho,
    // 5× mais forte; quando o Lord morre, volta o dragão verde de sempre.
    scene.remove(r.g);
    r.lord = !r.lord && Math.random() < 0.2;
    r.g = criaDragao(DRX, DRZ, r.lord);
    r.g.position.y = DRY;
    scene.add(r.g);
    if (r.sombraContato) r.sombraContato.alvo = r.g; else sombraBicho(r);
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
    if (r.sombraContato) r.sombraContato.alvo = r.g; else sombraBicho(r);
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
// LOGIN (RV13.2): a senha entra na CHAVE da conta = vincula a senha ao
// personagem (nome+senha = personagem único). Sem senha = conta legada (só nome).
let contaSenha = '';
function hashSenha(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); }
function chaveConta(nome) { return 'venor_conta_' + nome.trim().toLowerCase() + (contaSenha ? '#' + hashSenha(contaSenha) : ''); }
function salvaJogo() {
  if (!jogoIniciado) return;
  try {
    // dentro de uma zona carregada (esgoto/catacumbas/cavernas/Irmãs), salva a
    // SAÍDA de superfície — senão o reload renasce o jogador num canto vazio
    // (as Irmãs ficam longe, em ~720,-700; cairia no meio do nada).
    const _sp = (noEsgoto && subsoloAtual && subsoloAtual.saidas && subsoloAtual.saidas[0])
      ? subsoloAtual.saidas[0] : avatar.position;
    localStorage.setItem(chaveConta(nomeJogador), JSON.stringify({
      v: 1, cores: { ...coresJogador },
      x: _sp.x, z: _sp.z,
      ouro, bancoOuro, vida, hud: hud.estado(), mochila: inventario.estado(),
      equip: Object.values(equipados).filter(Boolean),
      economia, // estoque regional dos NPCs (ofertas raras liberadas)
      pet: petTipo, pets: petsDomados, // companheiros domados
      dragaoComp: dragaoCompanheiro, // ficha do dragão-companheiro (cresce)
      quests: questEstado, // missões aceitas/cumpridas
      codice: codice.estado(), // Códice da Veia: veios sentidos + Quarto Veio
      cofre, // Depósito de Venore (itens guardados em segurança)
      imoveis: imoveisEstado, // casas/mansões/guildhouses alugadas
      dragoes: dragoesMortos, guilda: guildaMembro, // currículo + Guilda de Venore
      bauCripta: bauCriptaAberto, // tesouro dos reis é um só por conta
      vorag: voragInvocado, // a Ossada erguida não volta a dormir
      arconte: arconteInvocado, // o Arconte despertado também continua no mundo
    }));
  } catch (e) { /* armazenamento cheio/indisponível: segue o jogo */ }
}
function carregaJogo(nome) {
  try {
    const raw = localStorage.getItem(chaveConta(nome));
    if (!raw) return false;
    const d = JSON.parse(raw);
    ouro = d.ouro || 0; bancoOuro = d.bancoOuro || 0; vida = d.vida || VIDA_MAX;
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
    codice.carrega(d.codice); // Códice da Veia volta com os veios já sentidos
    sincronizaVeiosMapa(); atualizaReliquias(); // mapa e relíquias refletem o save
    cofre.length = 0; (d.cofre || []).forEach((c) => cofre.push({ ...c })); // Depósito volta intacto
    Object.keys(imoveisEstado).forEach((k) => delete imoveisEstado[k]);
    Object.assign(imoveisEstado, d.imoveis || {});
    sincronizaPlacasImoveis();
    dragoesMortos = d.dragoes || 0; guildaMembro = !!d.guilda; // Guilda de Venore
    bauCriptaAberto = !!d.bauCripta; // Baú Ancestral (uma vez por conta)
    if (d.vorag) invocaVorag(); // a Ossada erguida continua erguida
    if (d.arconte || ((questEstado.arconteLuaPartida || {}).aceita && !(questEstado.arconteLuaPartida || {}).feita)) invocaArconteDrakari();
    (d.pets || []).forEach((t) => { if (!petsDomados.includes(t)) petsDomados.push(t); });
    for (let i = domaveisVivos.length - 1; i >= 0; i--) { // domado não fica mais selvagem
      if (petsDomados.includes(domaveisVivos[i].tipo)) { scene.remove(domaveisVivos[i].g); domaveisVivos.splice(i, 1); }
    }
    if (d.dragaoComp) dragaoCompanheiro = d.dragaoComp; // restaura a ficha ANTES de trocaPet
    if (d.pet && PETS[d.pet]) trocaPet(d.pet);
    hud.ouro(ouro); hud.vida(vida, VIDA_MAX);
    return true;
  } catch (e) { return false; }
}
// RELÍQUIAS (RV9.1): revela no Códice a lore oculta dos itens lendários que
// o jogador obteve (mochila ou cofre) — "itens que conectam eras".
function temItemQualquer(nome) {
  return (inventario.temItem && inventario.temItem(nome)) || cofre.some((c) => c && c.nome === nome);
}
function atualizaReliquias() {
  for (const rl of RELIQUIAS) {
    if (codice.jaRevelouReliquia(rl.id)) continue;
    let tem = rl.alvos ? rl.alvos.some((n) => temItemQualquer(n)) : false;
    if (rl.gatilhoVeio) tem = tem || codice.jaSentiu(rl.gatilhoVeio);
    if (tem && codice.marcaReliquia(rl.id)) {
      mostraMensagem(`📖 Relíquia registrada no Códice: ${rl.nome.replace(/^\S+\s/, '')}`);
    }
  }
}
setInterval(() => {
  salvaJogo();                                       // auto-save local a cada 10s
  atualizaReliquias();                               // 📖 itens lendários revelam lore
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
{ // botão 👤: edição de personagem/pet SEM conflitar com AÇÃO do mundo
  const b = document.createElement('div');
  b.textContent = '👤';
  b.title = 'Editar personagem e pet (P)';
  b.style.cssText = 'position:fixed;top:238px;left:14px;width:48px;height:48px;z-index:41;display:none;'
    + 'align-items:center;justify-content:center;font-size:22px;cursor:pointer;user-select:none;touch-action:none;'
    + 'background:rgba(16,22,32,.8);border:1px solid #3a4654;border-radius:12px;';
  b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); abreEditorPersonagem(); });
  document.body.appendChild(b);
  window.__btnEditarPersonagem = b;
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyP' && jogoIniciado && !morto && !customizar.aberto) abreEditorPersonagem();
  if (e.code === 'KeyC' && jogoIniciado && !morto && !dialogo.aberto && !customizar.aberto) {
    if (fichaPersonagem.aberto) fichaPersonagem.fecha(); else fichaPersonagem.abre();
  }
});

// =============================================================
//  CONTA DEV/GM (igual GM do Tibia) — entre com o nome "gm", "adm"
//  ou "dev" na criação do personagem. Tecla G abre o painel com os
//  poderes: teleporte, cura, ouro, XP, imortal, velocidade, spawn
//  e extermínio de bichos.
// =============================================================
let gmMode = false, gmImortal = false, gmVel = false, gmPainel = null;
function tpGM(x, z) {
  if (noEsgoto) { chaoY = 0; areaAtiva = areaSuperficie(); noEsgoto = false; escondeZonasCarregadas(); subsoloAtual = esgoto; minimapa.mostra(); }
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
  const rGM = { g: g2, hp, hpMax: hp, xp, dano: dn, vel: vl, forte, bounds: areaMon(px, pz, 14), y0: avatar.position.y, alvo: { x: px, z: pz }, pausa: 0, tempo: 0, vivo: true, piscar: 0, especie: tipo === 'dragao' ? 'dragao' : tipo };
  ratos.push(rGM);
  sombraBicho(rGM);
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
  B('🌑 Ir: Noctaria', () => tpGM(-620, -30));
  B('🌑 Ir: Lua Partida', () => tpGM(-742, -30));
  B('❤️ Curar tudo', () => { vida = VIDA_MAX; hud.vida(vida, VIDA_MAX); mostraMensagem('❤️ GM: vida cheia'); });
  B('🪙 +100 de ouro', () => { ouro += 100; hud.ouro(ouro); });
  B('⭐ +100 de XP', () => hud.ganhaXP(100));
  B('🐲 Ganhar dragão-filhote', () => {
    if (!petsDomados.includes('dragaozinho')) petsDomados.push('dragaozinho');
    trocaPet('dragaozinho');
    mostraMensagem('🐲 GM: dragão-filhote concedido! Abra a ficha (tecla C) e monte (M).');
  });
  B('🐉 Evoluir dragão (máx)', () => {
    if (!dragaoCompanheiro) { mostraMensagem('🐲 Ganhe um dragão primeiro.'); return; }
    ganhaXpDragao(dragaoCompanheiro, 9000); aplicaEstagioNoModelo();
    mostraMensagem('🐉 GM: dragão evoluído a ADULTO!');
  });
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
      registraFlinchBicho(r, avatar.position, 0.2, 0.18);
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
    registraFlinchBicho(alvo, avatar.position, 0.24, 0.2);
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
  { nome: 'Estrada das Cinzas', x: -510, z: -30, raio: 74 },
  { nome: 'Noctaria, Cidadela da Vigília', x: -620, z: -30, raio: 78 },
  { nome: 'Ermo das Cinzas', x: -690, z: -52, raio: 58 },
  { nome: 'Santuário da Lua Partida', x: -742, z: -30, raio: 44 },
  // Vilarejo de Venor (a antiga cidadezinha onde tudo começou)
  { nome: 'Praça do Vilarejo de Venor', x: 0, z: 0, raio: 18 },
  { nome: 'Rua do Mercado', x: 16, z: 0, raio: 16 },
  { nome: 'Templo Sagrado', x: 0, z: -30, raio: 15 },
  { nome: 'Largo da Escola', x: 0, z: 28, raio: 15 },
  { nome: 'Ponte do Riacho', x: 16, z: 78, raio: 14 },
  { nome: 'Beira do Lago', x: 45, z: 80, raio: 22 },
  { nome: 'Floresta do Oeste', x: -88, z: 0, raio: 45 },
  { nome: 'Ninho das Aranhas', x: -146, z: -66, raio: 16 },
  { nome: 'Ossada do Dragão', x: 250, z: 120, raio: 20 },
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
  if (noEsgoto) {
    nome = subsoloAtual === catacumbas ? 'Catacumbas de Venore'
      : subsoloAtual === criptaProfunda ? 'Cripta Profunda'
      : subsoloAtual === cavernasPico ? 'Cavernas do Pico'
      : subsoloAtual === irmas1 ? 'As Irmãs Afundadas · A Quebra-Mar'
      : subsoloAtual === catedralI ? 'Catedral da Lua Coada · Nave Profanada'
      : subsoloAtual === aurelia ? '☁️ Aurélia · A Cidade nas Nuvens'
      : subsoloAtual && subsoloAtual.tipo === 'imovel' ? `Interior · ${subsoloAtual.nome}` : 'Esgoto';
  }
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
  aoEntrar: (nome, senha, lembrar) => {
    nomeJogador = nome; contaSenha = senha || ''; jogoIniciado = true; avatar.rotation.y = Math.PI;
    try { if (lembrar) localStorage.setItem('venor_login', JSON.stringify({ nome, senha: senha || '' })); else localStorage.removeItem('venor_login'); } catch (e) {} // 🔐 lembrar conta
    { const tEl = document.getElementById('tituloVenor'); if (tEl) tEl.remove(); } // título sai de cena
    minimapa.mostra();
    quadroJornadas.mostra();
    codice.mostra(); // 📖 Códice da Veia disponível ao entrar
    bestiario.mostra();
    inventario.mostra();
    hud.mostra();
    fichaPersonagem.mostraBotao(); // 📜 Ficha do personagem (tecla C)
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
    if (window.__btnEditarPersonagem) window.__btnEditarPersonagem.style.display = 'flex';
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
          localStorage.setItem(chaveConta(nomeJogador), msg.dados);
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
  const dados = localStorage.getItem(chaveConta(nomeJogador));
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
    // --- modo SELEÇÃO: boneco girando para PRÉVIA AO VIVO (RV13.4) ---
    avatar.rotation.y += dt * 0.6;
    animaAvatar(avatar, false, tempo, false);
    const f = avatar.position;
    // desloca o boneco pro lado (PC: painel à direita) pra ele não ficar atrás
    // do painel; no retrato fica centralizado (painel embaixo).
    const offX = (window.innerWidth >= window.innerHeight) ? 3.0 : 0;
    camera.position.lerp(new THREE.Vector3(f.x + offX + 0.01, f.y + 3, f.z + 7.5), 0.1);
    camera.lookAt(f.x + offX, f.y + 1.7, f.z);
  } else {
    // --- modo JOGO ---
    const pf = controles.pegaPinch(); // PINÇA de 2 dedos = zoom (igual scroll no PC)
    if (pf !== 1) zoomDist = Math.max(5, Math.min(45, zoomDist * pf));
    const inp = controles.vetorMov();
    const cam = controles.cam;
    const correndo = controles.correndo();
    const abaixado = controles.abaixado();
    const movendo = (inp.x !== 0 || inp.z !== 0);
    let alvoVX = 0, alvoVZ = 0;
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
      alvoVX = mx * vel; alvoVZ = mz * vel;
    }
    const respostaMov = 1 - Math.exp(-dt * (movendo ? 18 : 11));
    velAvatarX += (alvoVX - velAvatarX) * respostaMov;
    velAvatarZ += (alvoVZ - velAvatarZ) * respostaMov;
    if (morto) { velAvatarX *= 0.72; velAvatarZ *= 0.72; }
    const movPlano = Math.hypot(velAvatarX, velAvatarZ);
    if (movPlano > 0.025 && !morto) {
      const nx = Math.max(areaAtiva.minX, Math.min(areaAtiva.maxX, avatar.position.x + velAvatarX * dt));
      if (!colide(nx, avatar.position.z)) avatar.position.x = nx; else velAvatarX *= -0.08;
      const nz = Math.max(areaAtiva.minZ, Math.min(areaAtiva.maxZ, avatar.position.z + velAvatarZ * dt));
      if (!colide(avatar.position.x, nz)) avatar.position.z = nz; else velAvatarZ *= -0.08;
      giraSuave(avatar, Math.atan2(velAvatarX, velAvatarZ), dt * 16);
    }
    if (controles.querPular() && noChao) { vy = 9; noChao = false; }
    vy -= 25 * dt;
    avatar.position.y += vy * dt;
    let solo = noEsgoto ? chaoY : alturaTerreno(avatar.position.x, avatar.position.z);
    if (montado && !noEsgoto) solo += MONTARIA_SELA[petTipo] || 0.6; // sela: avatar sobe na garupa
    if (avatar.position.y <= solo) { avatar.position.y = solo; vy = 0; noChao = true; }
    const escalaY = abaixado ? 0.6 : 1;
    avatar.scale.y += (escalaY - avatar.scale.y) * Math.min(1, dt * 12);
    const movendoFisico = Math.hypot(velAvatarX, velAvatarZ) > 0.08 && !morto;
    animaAvatar(avatar, movendoFisico && noChao, tempo, correndo);
    ultimoAnim = { mov: movendoFisico && noChao, corr: correndo, abx: abaixado };

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
      if (d && !c._dentro) sons.porta(); // rangido ao cruzar a porta (RV5.5)
      c._dentro = d;
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
    if (noEsgoto) occTmp.push((subsoloAtual && subsoloAtual.grupo) || esgoto.grupo);
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
    camera.position.lerp(posCam, 1 - Math.exp(-dt * (dentroCasa ? 15 : 10)));
    camera.lookAt(foco.x, foco.y, foco.z);
  }

  // ambiente vivo (sempre): ciclo dia/noite (na superfície), nuvens, fonte, gato
  if (!noEsgoto) aplicaDiaNoite(dt);
  atualizaLuzRecorte();
  // ✨ poeira/pólen no ar segue o jogador (mais densa de dia/aberto, rala em zona)
  atmosfera.grupo.position.set(avatar.position.x, chaoY, avatar.position.z);
  atmosfera.atualiza(dt, tempo, noEsgoto ? 0.22 : 0.4 + fatorDiaVisual * 0.25);
  // 🐉 dragão do céu circula alto, seguindo o jogador (some em zona fechada)
  dragaoCeu.visible = !noEsgoto;
  if (!noEsgoto) {
    const ad = tempo * 0.045;
    dragaoCeu.position.set(avatar.position.x + Math.cos(ad) * 300, 175 + Math.sin(ad * 0.7) * 22, avatar.position.z + Math.sin(ad) * 300);
    dragaoCeu.rotation.y = -ad; // aponta na direção do voo (tangente do círculo)
    dragaoCeu.rotation.z = Math.sin(ad * 2.0) * 0.14; // banca as asas nas curvas
    animaCompanheiro(dragaoCeu, true, 1.1, true); // RV15.0: ASAS BATENDO de verdade
  }
  // 💧 água viva: marola suave (RV11.0) + ondas do normal map deslizando (RV11.7)
  if (aguaNormal) { aguaNormal.offset.x = (tempo * 0.018) % 1; aguaNormal.offset.y = (tempo * 0.012) % 1; }
  if (aguas) for (const ag of aguas) {
    if (ag.userData._by === undefined) { ag.userData._by = ag.position.y; ag.userData._ph = (ag.position.x + ag.position.z) % 6.28; }
    ag.position.y = ag.userData._by + Math.sin(tempo * 1.2 + ag.userData._ph) * 0.035;
  }
  // 🔮 glow pulsante (Veia/rosácea/vitrais respiram com o bloom) — RV11.2
  for (const m of glowsPulsantes) m.emissiveIntensity = m.userData._base * (0.82 + Math.sin(tempo * 1.8 + m.userData._ph) * 0.22);
  // 🐉 vitória da Prova de Fogo (RV13.0): o Guardião-Ancião caiu
  if (dragaoNuvens && dragaoNuvens._desperto && !provaFogoFeita && !dragaoNuvens.vivo) {
    provaFogoFeita = true;
    dialogo.abre('🔥 A Prova de Fogo — VENCIDA', 'O Guardião tomba e o templo treme com o rugido de mil dragões. Vaelthryx baixa a cabeça colossal:\n— "Ergue-te, AMIGO DA CHAMA. Carregas agora o Coração de um Ancião. Os céus de Venor te pertencem."', [{ texto: 'Erguer-se 🐉', onClick: () => dialogo.fecha() }]);
    salvaJogo();
  }
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
      animaCompanheiro(gato, trotando, montado ? 1.25 : 1, montado && ehDragaoPet(petTipo));
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
          animaCompanheiro(gato, true, 1.15);
        } else if (tempo > petProxMordida) {
          petProxMordida = tempo + 1.2;
          let dnP = PET_DANO[petTipo] || 2;
          // RV14.4: dragão usa o dano da FICHA (cresce com o estágio) + BÔNUS de
          // AFINIDADE quando o período (dia/noite) casa com o dele.
          if (dragaoCompanheiro && ehDragaoPet(petTipo)) {
            const sd = statsDragao(dragaoCompanheiro); dnP = sd.dano;
            if (sd.ml) dnP = Math.round(dnP * (1 + Math.min(30, sd.ml) * 0.025)); // ML treinado dormindo em imóveis
            if (sd.afinidade === (ehNoite ? 'noite' : 'dia')) dnP = Math.round(dnP * 1.5);
          }
          const golpeDragao = ehDragaoPet(petTipo);
          marcaAtaqueCompanheiro(gato);
          petAlvo.hp -= dnP; petAlvo.piscar = 0.15;
          petAlvo._flinch = {
            t0: tempo,
            dur: golpeDragao ? 0.24 : 0.16,
            forca: golpeDragao ? 0.34 : 0.18,
            abaixa: golpeDragao ? 0.15 : 0.08,
            dirX: petAlvo.g.position.x - gato.position.x,
            dirZ: petAlvo.g.position.z - gato.position.z,
          };
          atualizaBarraHP(petAlvo);
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
    animaCompanheiro(d.g, true, 0.85);
  }
  animaProps(animados, dt, tempo);
  atualizaNPCs(npcs, dt, colide, ehNoite);
  atualizaInvasaoDraptor();
  atualizaRatos(ratos, dt, jogoIniciado ? { x: avatar.position.x, y: avatar.position.y, z: avatar.position.z } : null, podeAndarBicho, alturaTerreno);
  // RV15.1: FLINCH — todo bicho RECUA e encolhe ao apanhar (leitura de impacto)
  for (const r of ratos) {
    const fl = r._flinch; if (!fl) continue;
    const f = (tempo - fl.t0) / fl.dur;
    if (f >= 1) {
      r._flinch = null;
      if (r.g) {
        r.g.scale.y = r._by || 1;
        if (r._rx !== undefined) r.g.rotation.x = r._rx;
      }
      continue;
    }
    if (r._by === undefined) r._by = r.g.scale.y;
    if (r._rx === undefined) r._rx = r.g.rotation.x || 0;
    const pulso = Math.sin(f * Math.PI);
    const k = pulso * (fl.forca || 0.18), d = Math.hypot(fl.dirX, fl.dirZ) || 1;
    r.g.position.x += (fl.dirX / d) * k * dt * 8;
    r.g.position.z += (fl.dirZ / d) * k * dt * 8;
    r.g.scale.y = (r._by || 1) * (1 - pulso * (fl.abaixa || 0.08));
    r.g.rotation.x = (r._rx || 0) + pulso * (fl.inclina || 0.12);
  }
  atualizaPresencaMonstros(dt); // RV7.0: aggro, telegraph e investida dos monstros principais

  if (jogoIniciado && !morto) {
    let chefePerto = null, chefeDist = Infinity;
    for (const r of ratos) {
      if (!r.boss || !r.vivo || r.corpse || Math.abs(r.g.position.y - avatar.position.y) > 8) continue;
      const d = Math.hypot(r.g.position.x - avatar.position.x, r.g.position.z - avatar.position.z);
      const alcance = r.dragao || r.atira === 'fogo' ? 42 : 24;
      if (d < alcance && d < chefeDist) { chefeDist = d; chefePerto = r; }
    }
    if (chefePerto && tempo > (chefePerto._bossHudCooldown || 0)) {
      chefePerto._bossHudCooldown = tempo + 2.2;
      mostraBossHud(chefePerto, 2.8);
    }
  }

  // VOO DO DRAGÃO: de tempos em tempos ele decola do pico, plana sobre Venore
  // atrás de comida e volta — dá pra ver ele cruzando o céu da cidade!
  if (dragao.vivo && !dragao.corpse) {
    if (!vooDragao.ativo) {
      vooDragao.proximo -= dt;
      animaCompanheiro(dragao.g, false, 0.8, false); // RV15.2: respira + balança a cauda parado (não é estátua)
      if (dragao.g.rotation.z) dragao.g.rotation.z *= 0.9; // desbanca ao pousar
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
        animaCompanheiro(dragao.g, true, 1.15, true); // RV15.2: asas amplas + cauda ondulando + patas recolhidas
        dragao.g.rotation.z = Math.sin(t * Math.PI * 2) * 0.26; // BANCA nas serpenteadas do voo
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
      const furia = r.boss && r.atira === 'fogo' && r.hp / r.hpMax < 0.35;
      r.proxTiro = tempo + (r.cadencia || 3) * (furia ? 0.72 : 1);
      r.g.rotation.y = Math.atan2(avatar.position.x - r.g.position.x, avatar.position.z - r.g.position.z);
      disparaBicho(r);
    }
  }
  // projéteis dos bichos voando → impacto (esquivou = erra!)
  for (let i = projeteis.length - 1; i >= 0; i--) {
    const p = projeteis[i]; p.t += dt / p.dur;
    const up = p.m.userData || {};
    if (up.core) {
      const pulso = 1 + Math.sin((tempo + up.fase) * (p.fogo ? 18 : 12)) * (p.fogo ? 0.13 : 0.08);
      up.core.scale.setScalar(pulso);
      if (up.halo) up.halo.scale.setScalar(1.05 + Math.sin((tempo + up.fase) * 9) * 0.1);
      if (up.cauda) up.cauda.rotation.z += dt * 8;
    }
    if (p.t < 1) { p.m.position.lerpVectors(p.de, p.ate, p.t); continue; }
    scene.remove(p.m); projeteis.splice(i, 1);
    if (p.fogo) {
      const impacto = p.ate.clone(); impacto.y = avatar.position.y;
      explosaoFogoEm(impacto, 1.15, 0.95);
    }
    const dI = Math.hypot(p.ate.x - avatar.position.x, p.ate.z - avatar.position.z);
    if (dI < 1.9 && jogoIniciado) {
      mostraMensagem(p.fogo ? `🔥 Bola de fogo! (-${p.dano})` : `🔮 Rajada mágica! (-${p.dano})`);
      recebeDano(p.dano); // Utamo absorve primeiro
    }
    if (p.fogo && Math.random() < 0.5) criaLavaTemp(p.ate.x, p.ate.z, alturaTerreno(p.ate.x, p.ate.z)); // fogo vira LAVA no chão
  }
  // lava temporária do dragão evapora
  for (let i = avisosFogo.length - 1; i >= 0; i--) {
    const a = avisosFogo[i]; a.t += dt;
    const f = a.t / a.dur;
    if (f >= 1) { scene.remove(a.mesh); avisosFogo.splice(i, 1); continue; }
    a.mesh.scale.setScalar(1 + Math.sin(f * Math.PI) * 0.18);
    a.mat.opacity = 0.5 * (1 - f);
  }
  atualizaAvisosMonstro(dt);
  atualizaBossHud();
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
    e.m.scale.setScalar((e.base || 1) * (1 + e.t * 4.5)); e.m.material.opacity = 0.7 * (1 - e.t);
  }
  if (jogoIniciado) {
    for (const r of ratos) {
      if (r.vivo && r.contato && !r._rv70Investida && tempo > (r.proxAtaque || 0)) { // RV8.3: investida não soma com mordida (fim do double-dip)
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
    if (r.corpse && tempo > r.despawnAt) {
      r.corpse = false; r.g.visible = false;
      r.respawnAt = r.invasao ? null : tempo + (r.boss ? 60 : 25);
    }
    if (r.invasao && !r.vivo && !r.corpse) continue;
    if (r.noturno && !ehNoite) continue; // mortos noturnos só voltam com a noite (RV5.7)
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
  for (let i = visuaisDragao.length - 1; i >= 0; i--) {
    const v = visuaisDragao[i];
    if (!v.parent) { visuaisDragao.splice(i, 1); continue; }
    const u = v.userData || {};
    const p = 1 + Math.sin((tempo + u.fase) * 8) * 0.18;
    if (u.nucleo) u.nucleo.scale.setScalar(p);
    if (u.chama) {
      u.chama.scale.set(1 + Math.sin((tempo + u.fase) * 11) * 0.15, 1 + Math.sin((tempo + u.fase) * 7) * 0.22, 1);
      u.chama.rotation.z += dt * 3.2;
    }
    if (u.luz) u.luz.intensity = ehMobile ? 0 : 0.75 + Math.sin((tempo + u.fase) * 5) * 0.25;
    if (u.fumaca) u.fumaca.forEach((f, idx) => {
      f.position.y = Math.sin(tempo * 1.7 + idx) * 0.05;
      f.position.z = (-0.1 - idx * 0.22) * (u.escala || 1) - Math.sin(tempo + idx) * 0.03;
    });
  }
  if (rede) rede.atualiza(dt);
  if (jogoIniciado) {
    minimapa.atualiza(avatar, rede ? rede.outros : null);
    atualizaDestinoMapa();
  }
  atualizaSombrasContato();
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
// RV10.0: esconde a tela de carregamento DEPOIS do 1º quadro 3D desenhado
// (a cena já aparece atrás da seleção, sem flash de tela preta).
requestAnimationFrame(() => requestAnimationFrame(() => { if (window.__esconderBoot) window.__esconderBoot(); }));

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

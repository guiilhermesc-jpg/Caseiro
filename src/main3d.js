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
import { criaRatos, atualizaRatos, criaCobra, criaCrocodilo, criaTroll, criaCyclops, criaAranhaGigante, criaAranhaPequena, criaLadrao, criaEscorpiao, criaBeholder, criaDragao, criaLobo, criaUrso, criaEsqueleto, criaOrc } from './jogo/ratos.js';
import { criaHUD } from './jogo/hud.js';

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
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 900);

const { scene, ceu, hemi, sun, skyMat, lua, luaLuz, luaMat, estrelas, postes, obstaculos, solidos, aguas, nuvens, fonteGotas, ruas, marcos, animados, interativos, casas, lagos } = criaCidade();
const raycaster = new THREE.Raycaster();
const RAIO_AVATAR = 0.7;
// tamanho do mundo (ajustável no jogo) + colisão/altura/limite ATIVOS
let limiteMundo = CONFIG3D.limiteMundo;
function areaSuperficie() { return { minX: -limiteMundo, maxX: limiteMundo, minZ: -limiteMundo, maxZ: limiteMundo }; }
let colisoresAtivos = obstaculos;
let areaAtiva = areaSuperficie();
let chaoY = 0;
let noEsgoto = false;
let zoomDist = 13; // distância da câmera (scroll do mouse)
function colide(x, z) {
  for (const o of colisoresAtivos) {
    if (x > o.minX - RAIO_AVATAR && x < o.maxX + RAIO_AVATAR &&
        z > o.minZ - RAIO_AVATAR && z < o.maxZ + RAIO_AVATAR) return true;
  }
  // portas fechadas bloqueiam o vão (na superfície); abrem ao chegar perto
  if (!noEsgoto) for (const c of casas) {
    if (!c.aberta && c.portaCol &&
        x > c.portaCol.minX - RAIO_AVATAR && x < c.portaCol.maxX + RAIO_AVATAR &&
        z > c.portaCol.minZ - RAIO_AVATAR && z < c.portaCol.maxZ + RAIO_AVATAR) return true;
  }
  return false;
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
function addMonstro(g, hp, xp, dano, vel, forte, b) {
  ratos.push({ g, hp, hpMax: hp, xp, dano, vel, forte, bounds: b, y0: 0, alvo: { x: g.position.x, z: g.position.z }, pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0 });
}
[[150, 30], [185, -25], [215, 45], [250, 10]].forEach(([x, z]) => addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 14)));
[[245, -20], [285, 30]].forEach(([x, z]) => addMonstro(criaCyclops(x, z), 80, 30, 15, 1.2, true, areaMon(x, z, 16)));
const aX = 170, aZ = 95;
addMonstro(criaAranhaGigante(aX, aZ), 100, 40, 9, 1.6, true, areaMon(aX, aZ, 16));
[[aX - 5, aZ + 4], [aX + 6, aZ - 3], [aX - 3, aZ - 6], [aX + 4, aZ + 6]].forEach(([x, z]) => addMonstro(criaAranhaPequena(x, z), 10, 3, 2, 2.4, false, areaMon(aX, aZ, 18)));
[[160, 8], [205, -10], [235, 18]].forEach(([x, z]) => addMonstro(criaLadrao(x, z), 30, 12, 7, 2.2, false, areaMon(x, z, 16)));
[[140, -32], [185, 42], [225, -38]].forEach(([x, z]) => addMonstro(criaEscorpiao(x, z), 18, 6, 5, 2.0, false, areaMon(x, z, 14)));
// BEHOLDERS (olhos flutuantes) no Vale dos Monstros — fortes, loot raro
[[255, 95], [175, 120], [300, 70]].forEach(([x, z]) => {
  ratos.push({ g: criaBeholder(x, z), hp: 70, hpMax: 70, xp: 35, dano: 12, vel: 1.4, forte: true, bounds: areaMon(x, z, 18), y0: 0, alvo: { x, z }, pausa: Math.random() * 2, tempo: Math.random() * 5, vivo: true, piscar: 0, lootEspecial: { nome: 'Olho do Beholder', icone: '👁️' } });
});
// DRAGÃO (chefão D&D) guardando o Covil do Dragão, ao norte — muito forte, loot lendário
const DRX = 40, DRZ = 305;
ratos.push({ g: criaDragao(DRX, DRZ), hp: 220, hpMax: 220, xp: 120, dano: 22, vel: 1.6, forte: true, boss: true, bounds: areaMon(DRX, DRZ, 16), y0: 0, alvo: { x: DRX, z: DRZ }, pausa: Math.random() * 2, tempo: 0, vivo: true, piscar: 0, lootEspecial: { nome: 'Escama de Dragão', icone: '🐲' } });
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
  addMonstro(c, 28, 10, 8, 1.5, false, areaMon(225, -95, 16));
});
// mais ladrões no acampamento bandido (além dos que já rondam a estrada)
[[248, 46], [256, 52]].forEach(([x, z]) => addMonstro(criaLadrao(x, z), 30, 12, 7, 2.2, false, areaMon(252, 48, 14)));
// SEGUNDA METADE da viagem (depois do rio): mais selvagem e perigosa
[[340, 25], [390, -18], [455, 22]].forEach(([x, z]) => addMonstro(criaTroll(x, z), 25, 8, 6, 2.0, false, areaMon(x, z, 14)));
[[396, -66], [404, -74], [430, 28]].forEach(([x, z]) => addMonstro(criaOrc(x, z), 35, 14, 8, 2.1, false, areaMon(x, z, 14)));
[[300, 20], [470, -20], [476, -14]].forEach(([x, z]) => addMonstro(criaLobo(x, z), 20, 7, 5, 2.6, false, areaMon(x, z, 15)));
[[360, -30], [490, 30]].forEach(([x, z]) => addMonstro(criaEscorpiao(x, z), 18, 6, 5, 2.0, false, areaMon(x, z, 14)));
addMonstro(criaCyclops(415, 50), 80, 30, 15, 1.2, true, areaMon(415, 50, 16)); // ciclope da mata fechada
ratos.forEach((r) => scene.add(r.g));
let armado = false;
const luzTocha = new THREE.PointLight(0xffa54a, 0, 18, 2); scene.add(luzTocha); // única luz do esgoto
let tochaOn = false;
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
  { nome: 'Igreja', x: 0, z: -30 }, { nome: 'Escola', x: 0, z: 30 },
  { nome: 'Bairro Sul', x: 0, z: -95 }, { nome: 'Moinho', x: -44, z: -74 },
  { nome: 'Porto', x: 45, z: 64 }, { nome: 'Farol', x: 66, z: 84 }, { nome: 'Ponte', x: 16, z: 80 },
  { nome: 'Thais', x: 560, z: 0 }, { nome: 'Templo', x: 560, z: 19 },
  { nome: 'Ruínas', x: 150, z: 250 }, { nome: 'Dragão', x: 40, z: 330 },
  { nome: 'Rio Fundo', x: 180, z: 0 }, { nome: 'Torre', x: 122, z: -9 },
  { nome: 'Fazenda', x: 105, z: 38 }, { nome: 'Cemitério', x: 130, z: -60 },
  { nome: 'Pântano', x: 225, z: -95 }, { nome: 'Bandidos', x: 252, z: 48 },
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
  'Presa do Boss': 20, 'Olho do Beholder': 40, 'Escama de Dragão': 90,
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
  // CURANDEIRA vende poção de vida
  if (npc.prof === 'Curandeira') {
    opcoes.splice(3, 0, { texto: '🧪 Comprar poção (8🪙)', onClick: () => {
      if (ouro >= 8) {
        ouro -= 8; hud.ouro(ouro);
        inventario.addItem({ nome: 'Poção de Vida', icone: '🧪', slot: 'pocao', usavel: 'pocao' });
        dialogo.abre(npc.nome, 'Aqui está. Clique nela na mochila pra beber (+35 ❤️).', opcoes);
      } else dialogo.abre(npc.nome, `Custa 8 🪙 e você tem ${ouro}. Venda seu loot pro Otto!`, opcoes);
    } });
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
        if (r.vivo && d < 2.8) { // vira pro alvo e golpeia
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
    if (!subiu) { const c = corpseProximo(); if (c) saqueia(c); else atacar(); }
  } else {
    const alvo = achaInterativo();
    if (alvo) {
      if (alvo.onAcao) { alvo.onAcao(); if (alvo.msgAcao) mostraMensagem(alvo.msgAcao); }
      else mostraMensagem(alvo.titulo + ' — ' + alvo.msg);
    } else { // sem interativo: saquear / atacar / pescar
      const c = corpseProximo();
      if (c) saqueia(c); else if (alvoRato()) atacar(); else if (pertoDaAgua()) pescar();
    }
  }
}

// --- COMBATE: HUD, bueiro, gravetos, descer/subir, atacar, loot ---
const hud = criaHUD();
const MAT_MADEIRA = new THREE.MeshStandardMaterial({ color: 0x7a5a2a, roughness: 0.9 });
// vários bueiros espalhados pela cidade (cada um liga a uma escada do esgoto)
const BUEIROS = [{ x: 20, z: -36 }, { x: -20, z: 40 }, { x: 44, z: 16 }, { x: -44, z: -16 }, { x: 10, z: 14 }];
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

// CASAS À VENDA (compra com ouro; depois personaliza o telhado)
const TELHADOS = [0x8a4632, 0x4a5666, 0x6a4a8a, 0x3a6b30, 0x2a5a9c, 0x7a3a2a];
[{ x: 32, z: 3, casaIdx: 0 }, { x: -32, z: 3, casaIdx: 1 }].forEach((cv) => {
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
  chaoY = -40; colisoresAtivos = esgoto.colisores; areaAtiva = esgoto.bounds; noEsgoto = true;
  const a = esgoto.acessos[i] || esgoto.acessos[0];
  avatar.position.set(a.x, -40, a.z + (a.z > 0 ? -3 : 3)); vy = 0; noChao = true;
  hemi.intensity = 0.08; sun.intensity = 0.05; // ESGOTO ESCURO — acenda a tocha (T)
  minimapa.esconde();
  mostraMensagem(tochaOn ? 'Você desce ao esgoto. 🐀' : 'Está escuro! Acenda a tocha — tecla T 🔦');
}
function sobe(i = acessoAtual) {
  esgoto.grupo.visible = false;
  chaoY = 0; colisoresAtivos = obstaculos; areaAtiva = areaSuperficie(); noEsgoto = false;
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
  skyMat.uniforms.corTopo.value.copy(C_TOPO_NOITE).lerp(C_TOPO_DIA, d);
  skyMat.uniforms.corBase.value.copy(C_BASE_NOITE).lerp(C_BASE_DIA, d);
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
function poeArmaNaMao() {
  const p = avatar.userData.partes; if (!p) return;
  const old = p.bracoDir.getObjectByName('arma'); if (old) p.bracoDir.remove(old);
  let m;
  if (danoArma > 6) { m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.06), MAT_METAL); m.position.set(0, -1.4, 0.18); } // espada/machado
  else { m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.2, 6), MAT_MADEIRA); m.position.set(0, -1.0, 0.18); m.rotation.x = 0.4; } // graveto
  m.name = 'arma'; p.bracoDir.add(m);
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
  if (equipados.cabeca) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.5, 0.86), MAT_METAL); m.name = 'equipCorpo'; m.position.y = 2.85; m.castShadow = true; avatar.add(m); }
  if (equipados.tronco) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.0, 0.62), MAT_METAL); m.name = 'equipCorpo'; m.position.y = 1.5; m.castShadow = true; avatar.add(m); }
  if (equipados.maoEsq) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.7), MAT_METAL); m.name = 'equipCorpo'; m.position.set(0, -0.4, 0.3); p.bracoEsq.add(m); }
}
// TOCHA (acende o esgoto escuro)
function poeTochaNaMao(on) {
  const p = avatar.userData.partes; if (!p) return;
  const existe = p.bracoEsq.getObjectByName('tocha');
  if (on && !existe) {
    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), MAT_MADEIRA);
    cabo.name = 'tocha'; cabo.position.set(0, -1.0, 0.18);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffb04a, emissive: 0xff7a2a, emissiveIntensity: 1 }));
    chama.position.y = -0.5; cabo.add(chama); p.bracoEsq.add(cabo);
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
function alvoRato() {
  const fx = Math.sin(avatar.rotation.y), fz = Math.cos(avatar.rotation.y);
  let melhor = null, melhorD = 2.6;
  for (const r of ratos) {
    if (!r.vivo || Math.abs(r.g.position.y - avatar.position.y) > 6) continue; // mesmo "andar"
    const dx = r.g.position.x - avatar.position.x, dz = r.g.position.z - avatar.position.z, d = Math.hypot(dx, dz);
    if (d > 2.6 || (dx * fx + dz * fz) / (d || 1) < 0) continue; // perto e na frente
    if (d < melhorD) { melhorD = d; melhor = r; }
  }
  return melhor;
}
function atacar() {
  const dano = danoArma;
  const melhor = alvoRato();
  if (!melhor) { mostraMensagem('Golpe no ar!'); return; }
  melhor.hp -= dano; melhor.piscar = 0.15; melhor.g.userData.corpoMat.emissive.setHex(0x882020);
  if (melhor.hp <= 0) mataBicho(melhor);
  else mostraMensagem(`Acertou ${melhor.boss ? 'o BOSS' : 'o rato'}! (-${dano}, vida ${Math.max(0, melhor.hp)})`);
}
function mataBicho(r) {
  r.vivo = false; r.corpse = true;
  r.g.rotation.z = Math.PI / 2;      // tomba (corpo no chão)
  r.g.userData.corpoMat.emissive.setHex(0x000000);
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
function morre() {
  vida = VIDA_MAX;
  if (noEsgoto) { chaoY = 0; colisoresAtivos = obstaculos; areaAtiva = areaSuperficie(); noEsgoto = false; esgoto.grupo.visible = false; minimapa.mostra(); }
  avatar.position.set(8, 0, 12); vy = 0; noChao = true;
  hud.vida(vida, VIDA_MAX);
  mostraMensagem('💀 Você caiu! Acorda na praça de Venore.');
}
function reviveBicho(r) {
  if (r.boss && r.forma) { // só o boss do esgoto troca de forma (cobra↔croc); dragão revive normal
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

// NOMES DE LUGARES (estilo Tibia) — mostra o bairro/rua onde você está
const DISTRITOS = [
  { nome: 'Praça Central de Venore', x: 0, z: 0, raio: 18 },
  { nome: 'Rua do Mercado', x: 16, z: 0, raio: 16 },
  { nome: 'Largo da Igreja', x: 0, z: -30, raio: 15 },
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
  { nome: 'Portão de Thais', x: 528, z: 0, raio: 14 },
  { nome: 'Cidade de Thais', x: 560, z: 0, raio: 30 },
  { nome: 'Templo de Thais', x: 560, z: 18, raio: 12 },
  { nome: 'Ruínas da Estrada', x: 400, z: -70, raio: 18 },
  { nome: 'Ruínas Antigas', x: 150, z: 250, raio: 20 },
  { nome: 'Terras do Dragão', x: 40, z: 300, raio: 45 },
  { nome: 'Covil do Dragão', x: 40, z: 330, raio: 22 },
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

// ajustar tamanho do mundo (ampliar/reduzir) — botões 🗺️ e teclas + / -
function ajustaMapa(fator) {
  limiteMundo = Math.max(80, Math.min(2000, Math.round(limiteMundo * fator)));
  if (!noEsgoto) areaAtiva = areaSuperficie();
  mostraMensagem('🗺️ Mapa: raio ' + limiteMundo);
}
window.addEventListener('keydown', (e) => {
  if (e.code === 'Equal' || e.code === 'NumpadAdd') ajustaMapa(1.25);
  if (e.code === 'Minus' || e.code === 'NumpadSubtract') ajustaMapa(0.8);
});
function botaoMapa(txt, bottom, fator) {
  const b = document.createElement('div');
  b.textContent = txt;
  b.style.cssText = `position:fixed;left:14px;bottom:${bottom}px;width:46px;height:46px;z-index:30;`
    + 'display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;user-select:none;'
    + 'background:rgba(16,22,32,.8);border:1px solid #3a4654;border-radius:10px;color:#fff;';
  b.addEventListener('pointerdown', (e) => { e.stopPropagation(); ajustaMapa(fator); });
  document.body.appendChild(b);
}
botaoMapa('🗺️+', 72, 1.25);
botaoMapa('🗺️−', 20, 0.8);

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
    // espalha o nascimento pela praça (evita dois jogadores no mesmo ponto)
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, r = 7 + Math.random() * 6;
      const tx = Math.cos(a) * r, tz = Math.sin(a) * r;
      if (!colide(tx, tz)) { avatar.position.set(tx, 0, tz); break; }
    }
    minimapa.mostra();
    inventario.mostra();
    inventario.addItem({ nome: 'Tocha', icone: '🔦', slot: 'tocha', usavel: 'tocha' }); // clicar acende/apaga
    inventario.addItem({ nome: 'Vara de pesca', icone: '🎣' }); // e uma vara pra pescar nos lagos
    hud.mostra(); hud.vida(vida, VIDA_MAX); hud.ouro(ouro);
    mostraMensagem('Você tem 🔦 Tocha (T) e 🎣 Vara — chegue num lago e use AÇÃO pra pescar.');
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
      if (!dica && corpseProximo()) dica = 'Saquear o corpo 💀';
      if (!dica && alvoRato()) dica = 'Atacar ⚔️';
    } else {
      const it = achaInterativo();
      if (it) dica = it.acao || it.titulo;
      else if (corpseProximo()) dica = 'Saquear o corpo 💀';
      else if (alvoRato()) dica = 'Atacar ⚔️';
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
  atualizaRatos(ratos, dt, jogoIniciado ? { x: avatar.position.x, y: avatar.position.y, z: avatar.position.z } : null);
  if (jogoIniciado) {
    for (const r of ratos) {
      if (r.vivo && r.contato && tempo > (r.proxAtaque || 0)) {
        r.proxAtaque = tempo + 1.1;
        vida -= Math.max(1, (r.dano || 5) - defesa);
        hud.vida(vida, VIDA_MAX);
        if (vida <= 0) { morre(); break; }
      }
    }
    if (vida < VIDA_MAX) { vida = Math.min(VIDA_MAX, vida + dt * 1.5); hud.vida(vida, VIDA_MAX); } // regen lenta
  }
  if (tochaOn) luzTocha.position.set(avatar.position.x, avatar.position.y + 2.6, avatar.position.z);
  if (pescandoAte > 0 && tempo > pescandoAte) resolvePesca(); // fisgada da pesca
  // corpos somem em 30s; respawn calibrado (rato 25s, boss 60s)
  for (const r of ratos) {
    if (r.corpse && tempo > r.despawnAt) { r.corpse = false; r.g.visible = false; r.respawnAt = tempo + (r.boss ? 60 : 25); }
    if (!r.vivo && !r.corpse && r.respawnAt && tempo > r.respawnAt) reviveBicho(r);
  }
  if (rede) rede.atualiza(dt);
  if (jogoIniciado) minimapa.atualiza(avatar, rede ? rede.outros : null);
  ceu.position.copy(camera.position); // céu sempre em volta da câmera (mundo grande)

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

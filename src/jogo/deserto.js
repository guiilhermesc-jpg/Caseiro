// =============================================================
//  AS AREIAS DO VEIO SECO  ·  o deserto do sudeste (Fase 3 / RV10.7)
//  Onde um veio da Veia SECOU: o sangue da terra escoou e nunca cicatrizou.
//  Tecido morto, ressecado, esquecido — o oposto da Fenda quente do oeste.
//  Chega-se descendo pelo Portão do Deserto, ao sul de Thais: a viagem mais
//  longa e solitária de Venor. Caça escalonada + 5 POIs + a Catedral da Lua
//  Coada. 100% original (cânone da Veia / Lua Partida / Drakari).
//
//  Devolve { grupo, colisores, pois } — main3d adiciona à cena, registra os
//  colisores no índice e cria os interativos/criaturas.
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';
import { texturaRuido } from './mundo.js'; // grão procedural (RV10.9)

export function criaDeserto() {
  const g = new THREE.Group();
  const colisores = [];
  const pois = [];
  const col = (x, z, w, d) => colisores.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });

  const areia = new THREE.MeshStandardMaterial({ color: 0xd9c089, roughness: 1 });
  const texAreia = texturaRuido(0xd9c089, 15);
  if (texAreia) { texAreia.repeat.set(44, 56); areia.map = texAreia; areia.color.set(0xffffff); }
  const areiaEsc = mat(0xc2a86d, 1);
  const arenito = mat(0xcab083, 1), arenitoEsc = mat(0x9c8050, 1);
  const osso = mat(0xe8e0c8, 1);
  const obsidiana = new THREE.MeshStandardMaterial({ color: 0x17161c, roughness: 0.5, metalness: 0.2, emissive: 0x3a1f5a, emissiveIntensity: 0.18 });

  // ---- CHÃO DE AREIA cobrindo o RET [470,-470,720,-150] ----
  const piso = new THREE.Mesh(new THREE.BoxGeometry(252, 0.3, 322), areia);
  piso.position.set(595, 0.04, -310); piso.receiveShadow = true; g.add(piso);
  // manchas de areia mais escura (variação visual, sem colisão)
  for (let i = 0; i < 16; i++) {
    const x = 490 + Math.random() * 210, z = -460 + Math.random() * 290, r = 6 + Math.random() * 12;
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14), areiaEsc);
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); g.add(m);
  }
  // estrada (areia batida, mais clara) — corredor de Thais até o deserto
  const estrada = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 96), mat(0xe7d3a6, 1));
  estrada.position.set(560, 0.07, -116); g.add(estrada);

  // ---- ROCHEDOS e DUNAS de borda (colisores — moldura natural do deserto) ----
  for (const [x, z, s] of [[700, -200, 6], [690, -440, 7], [500, -450, 6], [640, -440, 5], [480, -250, 5], [705, -330, 6]]) {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s), arenitoEsc);
    r.position.set(x, s * 0.5, z); r.rotation.set(Math.random(), Math.random(), 0); r.castShadow = true; g.add(r);
    col(x, z, s * 1.6, s * 1.6);
  }
  // pedras soltas menores (cover, sem colisão pesada)
  for (let i = 0; i < 10; i++) {
    const x = 490 + Math.random() * 210, z = -450 + Math.random() * 280;
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1 + Math.random()), arenito);
    r.position.set(x, 0.5, z); r.rotation.set(Math.random(), Math.random(), 0); g.add(r);
  }

  // ======== POI: BOCA DO DESERTO (560,-150) — portão de arenito ========
  function torre(x, z, w, h) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), arenito);
    t.position.set(x, h / 2, z); t.castShadow = true; g.add(t); col(x, z, w, w);
  }
  torre(551, -150, 5, 14); torre(569, -150, 5, 14);
  const viga = new THREE.Mesh(new THREE.BoxGeometry(23, 3, 4), arenitoEsc);
  viga.position.set(560, 12.5, -150); g.add(viga);
  pois.push({ x: 560, z: -147, raio: 4, titulo: '🏜️ Boca do Deserto', acao: 'Ler a inscrição 🪧',
    texto: '"Aqui a estrada morre. Adiante, a terra esqueceu de pulsar.\nLeve água — o Veio que corria sob estas areias SECOU,\ne o que seca não dá de beber a ninguém."' });

  // ======== POI: OÁSIS DO FÔLEGO (520,-235) ========
  const lago = new THREE.Mesh(new THREE.CircleGeometry(14, 24),
    new THREE.MeshStandardMaterial({ color: 0x2f6f6a, roughness: 0.2, metalness: 0.3 }));
  lago.rotation.x = -Math.PI / 2; lago.position.set(520, 0.08, -235); g.add(lago);
  function palmeira(x, z) {
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 7, 7), mat(0x7a5a32, 1));
    tronco.position.set(x, 3.5, z); tronco.rotation.z = (Math.random() - 0.5) * 0.3; tronco.castShadow = true; g.add(tronco);
    for (let k = 0; k < 6; k++) {
      const folha = new THREE.Mesh(new THREE.ConeGeometry(0.7, 4, 4), mat(0x6f8a3a, 1));
      folha.position.set(x, 7, z); folha.rotation.set(1.0, k * 1.05, 0); g.add(folha);
    }
    col(x, z, 1, 1);
  }
  palmeira(512, -228); palmeira(528, -242); palmeira(515, -246);
  const tenda = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3, 4), mat(0xb86a3a, 1));
  tenda.position.set(530, 1.5, -226); tenda.rotation.y = 0.6; g.add(tenda);
  pois.push({ x: 524, z: -230, raio: 4, titulo: '🌴 Oásis do Fôlego', acao: 'Descansar / falar com Sariq 💧',
    texto: 'Sariq, o último guia das areias, ergue os olhos:\n— Água, viajante? É a única que resta. O resto do deserto bebeu do mesmo veio que secou.\nDizem que a Cidade Soterrada, a leste, guarda uma lasca capaz de "reler" o veio morto. Mas os ciclopes a guardam. E a Tumba do Rei... essa é melhor não acordar.' });

  // ======== POI: OSSADA ENTERRADA (505,-405) — costelas gigantes ========
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI;
    const costela = new THREE.Mesh(new THREE.TorusGeometry(7, 0.5, 6, 12, Math.PI), osso);
    costela.position.set(505 + (i - 4) * 3.2, 0, -405); costela.rotation.set(0, 0, 0);
    costela.castShadow = true; g.add(costela);
  }
  pois.push({ x: 505, z: -399, raio: 4, titulo: '🦴 Ossada Enterrada', acao: 'Tocar as costelas 🦴',
    texto: 'Costelas brancas, gigantes, brotam da areia como um arco — irmãs da Ossada de Vorag, lá no leste.\nNão é osso de bicho: é CICATRIZ. A memória que a terra se recusa a fechar, mesmo onde a Veia já morreu.' });

  // ======== POI: CIDADE SOTERRADA (660,-310) — ruínas, covil de ciclopes ========
  for (const [dx, dz, w, h] of [[0, 0, 6, 5], [10, 4, 5, 4], [-8, 6, 7, 3], [4, -10, 5, 6], [-10, -6, 6, 4], [14, -4, 4, 5]]) {
    const par = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.4), arenitoEsc);
    par.position.set(660 + dx, h / 2 - 1.2, -310 + dz); par.rotation.y = Math.random() * 0.5; par.castShadow = true; g.add(par);
    col(660 + dx, -310 + dz, w, 1.6);
  }
  for (const [dx, dz, hh] of [[-4, 0, 6], [8, -8, 5], [12, 8, 4]]) {
    const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, hh, 10), arenito);
    coluna.position.set(660 + dx, hh / 2, -310 + dz); coluna.rotation.z = (Math.random() - 0.5) * 0.3; coluna.castShadow = true; g.add(coluna);
    col(660 + dx, -310 + dz, 1.6, 1.6);
  }
  pois.push({ x: 650, z: -305, raio: 4.5, titulo: '🏛️ Cidade Soterrada', acao: 'Vasculhar as ruínas 🏛️',
    texto: 'Uma cidade inteira engolida pela areia. Quem morava aqui MINERAVA o veio — bombeava o sangue da terra pra fora — até a terra desabar sobre eles.\nAgora os ciclopes fazem ninho entre as colunas. No salão, dizem, há uma Lasca de Arenito que ainda lembra o que o veio foi.' });

  // ======== POI: CRATERA SECA + PEDRA-VEIO SECA (560,-310) ========
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const laje = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 1.4), mat(0x8a7a64, 1));
    laje.position.set(560 + Math.cos(a) * 13, 0.2, -310 + Math.sin(a) * 13); laje.rotation.y = a; g.add(laje);
  }
  const obelisco = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.0, 6.5, 5), obsidiana);
  obelisco.position.set(560, 3, -310); obelisco.rotation.z = 0.14; obelisco.castShadow = true; g.add(obelisco);
  col(560, -310, 2, 2);
  pois.push({ x: 560, z: -304, raio: 4, titulo: '🪨 Pedra-Veio Seca', acao: 'Sentir o veio 🩶', tipo: 'pedraVeioSeca',
    texto: 'A sexta Pedra-Veio. Você encosta a mão — e não sente NADA.\nAs outras cinco pulsavam: lava, água, obsidiana, cicatriz, osso. Esta é fria como pedra de túmulo.\nÉ a lição que faltava no Códice: a Veia também pode MORRER. Aqui ela morreu. E o que matou ainda guarda a Tumba, ao sul.' });

  // ======== A CATEDRAL DA LUA COADA (610,-360) — marco sombrio imponente ========
  const pedraCat = mat(0x4a4038, 1), pedraCatEsc = mat(0x2a2630, 1);
  const texCat = texturaRuido(0x4a4038, 20);
  if (texCat) { texCat.repeat.set(5, 5); pedraCat.map = texCat; pedraCat.color.set(0xffffff); }
  // nave
  const nave = new THREE.Mesh(new THREE.BoxGeometry(26, 26, 44), pedraCat);
  nave.position.set(610, 13, -360); nave.castShadow = true; nave.receiveShadow = true; g.add(nave);
  col(610, -360, 26, 44);
  // cumeeira escura sobre a nave (silhueta de telhado)
  const cumeeira = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 45), pedraCatEsc);
  cumeeira.position.set(610, 28, -360); g.add(cumeeira);
  // contrafortes (botaréus) — 4 por lado
  for (let i = 0; i < 4; i++) {
    const z = -382 + 8 + i * 11;
    for (const lado of [-1, 1]) {
      const bot = new THREE.Mesh(new THREE.BoxGeometry(1.6, 16, 4), pedraCat);
      bot.position.set(610 + lado * 14, 8, z); bot.rotation.z = lado * 0.12; bot.castShadow = true; g.add(bot);
    }
  }
  // fachada sul (z=-382): rosácea + portal ogival
  const rosacea = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x1a1020, emissive: 0x3a1f5a, emissiveIntensity: 0.45, roughness: 0.4 }));
  rosacea.rotation.x = Math.PI / 2; rosacea.position.set(610, 17, -382.3); g.add(rosacea);
  const portal = new THREE.Mesh(new THREE.BoxGeometry(5, 9, 1.2), mat(0x140f0a, 1));
  portal.position.set(610, 4.5, -382.3); g.add(portal);
  // degraus do adro
  for (let i = 0; i < 3; i++) {
    const deg = new THREE.Mesh(new THREE.BoxGeometry(9 - i * 1.5, 0.5, 2), mat(0x6a6258, 1));
    deg.position.set(610, 0.25 + i * 0.0, -385 - i * 1.4); g.add(deg);
  }
  // CAMPANÁRIO (torre de 40u — o ponto mais alto do sudeste)
  const torreC = new THREE.Mesh(new THREE.BoxGeometry(6, 40, 6), pedraCat);
  torreC.position.set(605, 20, -382); torreC.castShadow = true; g.add(torreC);
  col(605, -382, 6, 6);
  // sino rachado, sem badalo
  const sino = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 2.4, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x6a5a30, metalness: 0.7, roughness: 0.5, side: THREE.DoubleSide }));
  sino.position.set(605, 38, -382); g.add(sino);
  // símbolo da Lua Partida (crescente quebrado) no topo, no lugar da cruz
  for (const off of [-0.5, 0.5]) {
    const arco = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.18, 6, 10, Math.PI * 0.9), osso);
    arco.position.set(605, 43 + Math.abs(off), -382); arco.rotation.set(Math.PI / 2, 0, off > 0 ? 0.5 : -0.5 + Math.PI); g.add(arco);
  }
  // adro (ao SUL, em frente ao portal): obeliscos quebrados ladeando a chegada
  for (const [dx, dz, tomb] of [[-6, -5, 0], [6, -5, 1], [-7, -12, 1], [7, -12, 0]]) {
    const ob = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1), mat(0x4a4640, 1));
    ob.position.set(610 + dx, tomb ? 0.6 : 2, -388 + dz); if (tomb) ob.rotation.z = 1.3; g.add(ob);
  }
  pois.push({ x: 610, z: -390, raio: 5, titulo: '⛪ Catedral da Lua Coada', acao: 'Aproximar-se da Catedral ⛪', tipo: 'catedral',
    texto: 'Uma basílica de arenito enegrecido crava o campanário no céu do deserto — visível desde a muralha de Thais. A rosácea de vitral negro encara a Lua Partida no horizonte.\n\nO sino lá no alto não tem badalo: alguém arrancou pra que a catedral NUNCA chamasse a Vigília de Noctaria a investigar o que fizeram aqui dentro.\n\n(A nave está selada. Dizem que se desce por uma corda atrás do altar — mas a porta só cede a quem traz a chave certa.)' });

  // ---- PLACAS de distância ao longo da estrada ----
  function placa(x, z, txt) {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 6), mat(0x6e4a2a, 1));
    poste.position.set(x, 1.2, z); g.add(poste);
    const cnv = document.createElement('canvas'); cnv.width = 192; cnv.height = 64;
    const c2 = cnv.getContext('2d'); c2.fillStyle = '#caa86a'; c2.fillRect(0, 0, 192, 64);
    c2.fillStyle = '#3a2a14'; c2.font = 'bold 22px Arial'; c2.textAlign = 'center'; c2.textBaseline = 'middle';
    c2.fillText(txt, 96, 34);
    const tex = new THREE.CanvasTexture(cnv);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 0.18), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }));
    tab.position.set(x, 2.2, z); g.add(tab);
  }
  placa(566, -96, 'DESERTO ↓ 250');
  placa(566, -160, 'VEIO SECO ↓ 160');
  placa(584, -250, 'CATEDRAL ↓ 110');
  placa(584, -330, 'CATEDRAL → 50');

  return { grupo: g, colisores, pois };
}

// =============================================================
//  A NAVE PROFANADA · interior da Catedral da Lua Coada (zona y=-40, RV10.8)
//  Onde a Vigília-Decaída embalsamou o santo Vael na Veia pra "costurar" a
//  Lua Partida — e o ritual virou prisão. Zona carregada (coords locais
//  próprias, longe de tudo), igual às masmorras. Boss: Vael, o Santo
//  Embalsamado, dormente no relicário até ser despertado.
//  Devolve { grupo, colisores, bounds, acessos, saidas, relicario, centro }.
// =============================================================
export function criaCatedralInterior() {
  const g = new THREE.Group();
  const CX = 800, CZ = -400, Y = -40;       // região local, longe de tudo
  const W = 24, D = 44, alt = 8, t = 0.8;
  const pedra = mat(0x322c34, 1), pedraEsc = mat(0x201c24, 1);
  const colisores = [];

  const piso = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), pedra);
  piso.position.set(CX, Y - 0.2, CZ); piso.receiveShadow = true; g.add(piso);
  const teto = new THREE.Mesh(new THREE.BoxGeometry(W, 0.4, D), pedraEsc);
  teto.position.set(CX, Y + alt, CZ); g.add(teto);
  function parede(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), pedra);
    m.position.set(cx, Y + alt / 2, cz); m.receiveShadow = true; g.add(m);
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  parede(CX, CZ - D / 2, W, t); parede(CX, CZ + D / 2, W, t);
  parede(CX - W / 2, CZ, t, D); parede(CX + W / 2, CZ, t, D);

  // duas fileiras de 6 pilares altos ladeando o corredor central
  for (let i = 0; i < 6; i++) {
    const z = CZ - 16 + i * 6.4;
    for (const lado of [-1, 1]) {
      const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, alt, 10), pedraEsc);
      pil.position.set(CX + lado * 7, Y + alt / 2, z); pil.castShadow = true; g.add(pil);
      colisores.push({ minX: CX + lado * 7 - 0.85, maxX: CX + lado * 7 + 0.85, minZ: z - 0.85, maxZ: z + 0.85 });
    }
  }
  // vitrais internos (painéis emissivos fracos — cor na escuridão)
  for (let i = 0; i < 5; i++) {
    const z = CZ - 14 + i * 7;
    for (const lado of [-1, 1]) {
      const cor = i % 2 ? 0x6a2fa0 : 0xb8862f;
      const vit = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3),
        new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.55, side: THREE.DoubleSide }));
      vit.position.set(CX + lado * (W / 2 - 0.45), Y + 4, z); vit.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(vit);
    }
  }
  // bancos tombados
  for (let i = 0; i < 4; i++) {
    const banco = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 0.8), pedraEsc);
    banco.position.set(CX + (i % 2 ? 3 : -3), Y + 0.3, CZ - 8 + i * 5); banco.rotation.z = (i % 2 ? 0.3 : -0.2); g.add(banco);
  }
  // ALTAR-VEIA no fundo norte: estrado + relicário de Vael + pilar de Veia presa
  const altarZ = CZ - D / 2 + 5;
  const estrado = new THREE.Mesh(new THREE.BoxGeometry(11, 0.6, 8), pedraEsc);
  estrado.position.set(CX, Y + 0.3, altarZ + 2); g.add(estrado);
  const relicario = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1.7), mat(0x4a4640, 1));
  relicario.position.set(CX, Y + 1.1, altarZ + 2); relicario.castShadow = true; g.add(relicario);
  const veiaPresa = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x6a2fa0, emissive: 0x6a2fa0, emissiveIntensity: 0.85, roughness: 0.3 }));
  veiaPresa.position.set(CX, Y + 3.2, altarZ); g.add(veiaPresa);
  const luzVeia = new THREE.PointLight(0x9a4fd0, 1.5, 24, 2); luzVeia.position.set(CX, Y + 4.2, altarZ); g.add(luzVeia);

  // corda de acesso (sul) + luz de entrada
  const a = { x: CX, z: CZ + D / 2 - 3 };
  const corda = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, alt - 0.2, 6), mat(0x9a7a44, 1));
  corda.position.set(a.x, Y + (alt - 0.2) / 2, a.z); g.add(corda);
  const luzEntrada = new THREE.PointLight(0xffcaa0, 0.8, 15, 2); luzEntrada.position.set(a.x, Y + alt - 1, a.z); g.add(luzEntrada);

  return {
    grupo: g, colisores,
    bounds: { minX: CX - W / 2 + 1, maxX: CX + W / 2 - 1, minZ: CZ - D / 2 + 1, maxZ: CZ + D / 2 - 1 },
    acessos: [a],
    saidas: [{ x: 610, z: -393 }],   // devolve ao adro da catedral (superfície)
    relicario: { x: CX, z: altarZ + 2 },
    centro: { x: CX, z: CZ },
  };
}

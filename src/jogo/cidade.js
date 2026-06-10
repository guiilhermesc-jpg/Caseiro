// =============================================================
//  VENOR  ·  vilarejo em GRADE (ruas padrão), normal e detalhado.
//  Praça central + marcos + casas diversas alinhadas + adereços.
// =============================================================
import * as THREE from 'three';
import { mat, criaPredio, criaMarco, criaPinheiro, criaArbusto, criaFonte, criaBanco, criaPoste, criaMoinho, criaFarol, criaMercado, texturaPedra } from './construcoes.js';
import { criaBarril, criaCaixa, criaPoco, criaBarraca, criaEstatua, criaCanteiro, criaBandeira, criaBau, criaCristal } from './props.js';
import { criaLago, criaRiacho, criaPonte, criaJunco, criaSalgueiro, criaArvore, criaArvoreGrande, criaNenufar, criaPedra, criaCogumelo, criaFlorAlta, criaMontanha, criaEstrada, criaPlaca, criaFogueira, criaCarroca, criaCais, criaArvoreMorta, criaRuinas, criaCovilDragao, criaRio, criaPonteDePedra, criaTorreVigia, criaCemiterio, criaPantano, criaFazenda, criaMarcoDistancia, criaCoqueiro } from './natureza.js';
import { criaCasaInterior, criaTemploSagrado } from './interiores.js';
import { criaThais } from './thais.js';

// textura procedural de grama (granulado de tons de verde) — dá vida ao chão
function texturaGrama(rep = 60) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#66924c'; x.fillRect(0, 0, 128, 128);
  const tons = ['#5d8744', '#6f9a52', '#5a8040', '#74a058', '#638e49', '#7aa85c'];
  for (let i = 0; i < 1100; i++) {
    x.fillStyle = tons[i % tons.length];
    x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  return t;
}

export function criaCidade() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfe0ee, 320, 780);

  // céu em gradiente (claro)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { corTopo: { value: new THREE.Color(0x4f86c0) }, corBase: { value: new THREE.Color(0xdce9f2) } },
    vertexShader: 'varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vPos; uniform vec3 corTopo; uniform vec3 corBase; void main(){ float h = clamp(normalize(vPos).y,0.0,1.0); gl_FragColor = vec4(mix(corBase, corTopo, pow(h,0.5)),1.0); }',
  });
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(600, 24, 16), skyMat);
  scene.add(ceu);

  const hemi = new THREE.HemisphereLight(0xcfe2f5, 0x6f6a52, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff6e6, 1.35);
  sun.position.set(70, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  const d = 100;
  sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
  sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 420;
  scene.add(sun);

  // === LUA + LUAR + ESTRELAS ===
  // A lua é filha do céu (que segue a câmera) → aparece IGUAL de qualquer lugar do mapa.
  // fog:false em tudo aqui pra a neblina não apagar o céu ao longe.
  const luaMat = new THREE.MeshStandardMaterial({ color: 0xeef0f5, emissive: 0xcfd6e8, emissiveIntensity: 0.6, roughness: 1, fog: false });
  const craterMat = new THREE.MeshStandardMaterial({ color: 0xc6cede, roughness: 1, fog: false });
  const lua = new THREE.Group();
  lua.add(new THREE.Mesh(new THREE.SphereGeometry(22, 28, 22), luaMat));
  for (let i = 0; i < 9; i++) { // crateras (em qualquer ângulo)
    const cr = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random() * 3, 10, 8), craterMat);
    cr.position.setFromSphericalCoords(21, Math.acos(2 * Math.random() - 1), Math.random() * Math.PI * 2); lua.add(cr);
  }
  const halo = new THREE.Mesh(new THREE.SphereGeometry(31, 22, 18), new THREE.MeshBasicMaterial({ color: 0xaab8da, transparent: true, opacity: 0.16, fog: false }));
  lua.add(halo);
  lua.position.set(190, 340, -250); ceu.add(lua); // posição fixa no céu (acompanha a câmera via ceu)
  const luaLuz = new THREE.DirectionalLight(0x8c9ed6, 0); // luar azulado (intensidade no ciclo dia/noite)
  luaLuz.position.set(-90, 130, -110); scene.add(luaLuz);
  // estrelas (hemisfério de cima do céu; só aparecem à noite)
  const NEST = 650, posE = new Float32Array(NEST * 3);
  for (let i = 0; i < NEST; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.acos(Math.random()), R = 560;
    posE[i * 3] = R * Math.sin(v) * Math.cos(u); posE[i * 3 + 1] = R * Math.cos(v) + 30; posE[i * 3 + 2] = R * Math.sin(v) * Math.sin(u);
  }
  const estrelasGeo = new THREE.BufferGeometry(); estrelasGeo.setAttribute('position', new THREE.BufferAttribute(posE, 3));
  const estrelas = new THREE.Points(estrelasGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  ceu.add(estrelas);

  // grama
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(4200, 4200), new THREE.MeshStandardMaterial({ map: texturaGrama(460), roughness: 1 }));
  grama.rotation.x = -Math.PI / 2; grama.receiveShadow = true; scene.add(grama);

  // ruas em GRADE — finas e quase no nível do chão (evita o avatar "afundar")
  const ruaMat = mat(0x595f66, 1);
  const faixaH = (z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(180, 0.1, 8), ruaMat); m.position.set(0, 0.02, z); m.receiveShadow = true; scene.add(m); };
  const faixaV = (x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 180), ruaMat); m.position.set(x, 0.02, 0); m.receiveShadow = true; scene.add(m); };
  const ruas = [-48, -16, 16, 48];
  ruas.forEach((c) => { faixaH(c); faixaV(c); });

  const pisoMat = new THREE.MeshStandardMaterial({ map: texturaPedra(7), roughness: 1 }); // calçamento das praças
  const praca = new THREE.Mesh(new THREE.BoxGeometry(30, 0.1, 30), pisoMat);
  praca.position.y = 0.03; praca.receiveShadow = true; scene.add(praca);

  const obstaculos = [], solidos = [], aguas = [], postes = [], nuvens = [], fonteGotas = [], animados = [], interativos = [], casas = [], lagos = [];
  const add = (res) => {
    scene.add(res.grupo); solidos.push(res.grupo);
    if (res.colisores) res.colisores.forEach((c) => obstaculos.push(c));
    if (res.agua) aguas.push(res.agua);
    if (res.aguas) res.aguas.forEach((a) => aguas.push(a));
    if (res.gotas) res.gotas.forEach((dg) => fonteGotas.push(dg));
    if (res.luz) postes.push({ luz: res.luz, lumMat: res.lumMat });
    if (res.animados) res.animados.forEach((a) => animados.push(a));
    if (res.interativo) interativos.push(res.interativo);
    if (res.casa) casas.push(res.casa);
    if (res.lago) lagos.push(res.lago);
  };

  // praça: fonte central + bancos + postes nas esquinas
  add(criaFonte(0, 0));
  add(criaBanco(0, 8, Math.PI));
  add(criaBanco(0, -8, 0));
  add(criaBanco(8, 0, -Math.PI / 2));
  add(criaBanco(-8, 0, Math.PI / 2));

  // marcos (virados PARA a praça)
  const marcos = [
    { tipo: 'igreja', x: 0, z: -32, rot: 0 },
    { tipo: 'hospital', x: 32, z: 0, rot: -Math.PI / 2 },
    { tipo: 'delegacia', x: -32, z: 0, rot: Math.PI / 2 },
    { tipo: 'escola', x: 0, z: 32, rot: Math.PI },
  ];
  // a igreja virou TEMPLO SAGRADO entrável (renascimento) — os outros marcos seguem
  marcos.forEach((m) => { if (m.tipo !== 'igreja') add(criaMarco(m.tipo, { x: m.x, z: m.z, rot: m.rot })); });
  add(criaTemploSagrado(0, -32));

  // casas diversas, ALINHADAS em ângulo reto (colisão correta) e viradas pro centro
  const cores = [0xd8c4a0, 0xc8a86a, 0xa8bcae, 0xd0a0a0, 0xb0b8c0, 0xe0d0a0, 0x9ab0a4, 0xcaa890];
  const telhados = [0x8a4632, 0x6a4a6a, 0x55636f, 0x7a3a2a, 0x4a5666, 0x6b4a2a];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const snap = (ang) => Math.round(ang / (Math.PI / 2)) * (Math.PI / 2); // alinha a 0/90/180/270
  const lotes = [
    [32, 32], [-32, 32], [32, -32], [-32, -32],
    [64, 0], [-64, 0], [0, 64], [0, -64],
    [64, 32], [64, -32], [-64, 32], [-64, -32],
    [32, 64], [-32, 64], [32, -64], [-32, -64],
    [64, 64], [-64, 64], [64, -64], [-64, -64],
  ];
  lotes.forEach(([x, z]) => add(criaPredio({
    x, z, larg: rnd(8, 13), prof: rnd(8, 12), alt: rnd(6, 11),
    cor: pick(cores), corTelhado: pick(telhados), rot: snap(Math.atan2(-x, -z)),
  })));

  // postes de luz nas esquinas das ruas
  [[16, 16], [-16, 16], [16, -16], [-16, -16], [48, 16], [-48, 16], [48, -16], [-48, -16], [16, 48], [-16, 48], [16, -48], [-16, -48]]
    .forEach(([x, z]) => add(criaPoste(x, z)));

  // pinheiros + arbustos (com flores) — LONGE das portas das casas (frentes livres)
  [[46, 46], [-46, 46], [46, -46], [-46, -46], [58, 16], [-58, 16], [20, 58], [20, -58], [56, 56], [-56, -56], [-56, 56], [56, -56]]
    .forEach(([x, z]) => add(criaPinheiro(x, z)));
  [[12, 5], [-12, 5], [5, -12], [-5, 12], [40, 40], [-40, 40], [40, -40], [-40, -40]]
    .forEach(([x, z]) => add(criaArbusto(x, z)));

  // --- DETALHES / ADORNOS (riqueza visual, linha Tibia) ---
  add(criaEstatua(-13, -13));        // herói de Venor (marco)
  add(criaPoco(13, -13));
  add(criaCanteiro(13, 13));
  add(criaCanteiro(-13, 13));
  // mercadinho na rua leste/oeste
  add(criaBarraca(16, 9, 0, 0xb23a3a));
  add(criaBarraca(16, -9, 0, 0x2a6ba0));
  add(criaBarraca(-16, 9, 0, 0x2a8a4a));
  // estandartes nas esquinas externas da praça
  add(criaBandeira(20, 20, 0x9c2a2a));
  add(criaBandeira(-20, 20, 0x2a5a9c));
  add(criaBandeira(20, -20, 0x2a8a4a));
  add(criaBandeira(-20, -20, 0xb8902a));
  // barris e caixas (depósitos nos cantos de rua)
  [[16, 40], [24, 48], [40, 24], [-16, 40], [-24, 48], [-40, 24], [40, -24], [-40, -24]]
    .forEach(([x, z]) => { add(criaBarril(x, z)); add(criaCaixa(x + 1.3, z + 0.2)); });
  // ITENS VALIOSOS (ganchos de quest futura)
  add(criaBau(0, -20, 0.2));         // tesouro à frente da igreja (fora do colisor dela)
  add(criaCristal(0, 21));           // cristal arcano à frente da escola (fora do colisor)

  // CASAS ENTRÁVEIS (porta abre na AÇÃO, telhado some ao entrar) — perto da praça
  add(criaCasaInterior(38, 0, { frente: 'oeste', cor: 0xd8c4a0, corTelhado: 0x8a4632 }));
  add(criaCasaInterior(-38, 0, { frente: 'leste', cor: 0xc8a86a, corTelhado: 0x4a5666 }));
  // LOJAS estilo Tibia (cada NPC com sua finalidade — runas, arco & flecha, forja)
  add(criaBarraca(-22, 14, 0, 0x6a2ab0));               // banca de RUNAS da Eldra
  add(criaPlaca(-26, 14, 'Runas — Eldra', Math.PI / 2));
  add(criaBarraca(22, -12, 0, 0x2a8a4a));               // banca de ARCO & FLECHA do Falk
  add(criaPlaca(26, -12, 'Arco & Flecha', -Math.PI / 2));
  add(criaPlaca(-21, 11, 'Forja — Armas', Math.PI / 2)); // armas com Bram, o ferreiro

  // placas de rua (estilo Tibia)
  add(criaPlaca(20, 6, 'Rua do Mercado', -Math.PI / 2));
  add(criaPlaca(4, -18, 'Templo Sagrado', 0));
  add(criaPlaca(-2, 18, 'Largo da Escola', Math.PI));
  add(criaPlaca(-20, 5, 'Rua do Ferreiro', Math.PI / 2));

  // === CRESCER VENORE: Bairro do Comércio (sul) + marcos únicos ===
  // ruas do bairro (conector ao sul + via principal) + praça
  const viaConector = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 30), ruaMat);
  viaConector.position.set(0, 0.02, -85); viaConector.receiveShadow = true; scene.add(viaConector);
  const viaBairro = new THREE.Mesh(new THREE.BoxGeometry(60, 0.1, 8), ruaMat);
  viaBairro.position.set(0, 0.02, -95); viaBairro.receiveShadow = true; scene.add(viaBairro);
  const pracaSul = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 22), pisoMat);
  pracaSul.position.set(0, 0.03, -95); pracaSul.receiveShadow = true; scene.add(pracaSul);
  // poço central + bancos do bairro
  add(criaPoco(0, -95));
  add(criaBanco(-7, -90, Math.PI)); add(criaBanco(7, -100, 0));
  // mercado coberto + barracas
  add(criaMercado(0, -107, 12, 7));
  add(criaBarraca(-7, -105, 0.4, 0x2a8a4a));
  add(criaBarraca(7, -105, -0.4, 0xb23a3a));
  // casas do bairro (viradas pra praça)
  [[-18, -84], [18, -84], [-26, -98], [26, -98], [-18, -110], [18, -110]].forEach(([x, z]) => add(criaPredio({
    x, z, larg: rnd(8, 12), prof: rnd(8, 11), alt: rnd(6, 10),
    cor: pick(cores), corTelhado: pick(telhados), rot: snap(Math.atan2(-x, -(z + 95))),
  })));
  // casas ENTRÁVEIS do bairro (porta aberta, telhado some ao entrar)
  add(criaCasaInterior(-40, -95, { frente: 'leste', cor: 0xd0a0a0, corTelhado: 0x6a4a6a }));
  add(criaCasaInterior(40, -95, { frente: 'oeste', cor: 0xa8bcae, corTelhado: 0x55636f }));
  // postes, canteiros e verde do bairro
  [[-11, -88], [11, -88], [-11, -102], [11, -102]].forEach(([x, z]) => add(criaPoste(x, z)));
  add(criaCanteiro(-9, -95)); add(criaCanteiro(9, -95));
  [[-32, -84], [32, -84], [-32, -108], [32, -108]].forEach(([x, z], i) => add(i % 2 ? criaArbusto(x, z) : criaPinheiro(x, z)));
  // placas de rua do bairro
  add(criaPlaca(10, -87, 'Bairro do Comércio', -Math.PI / 2));
  add(criaPlaca(-10, -103, 'Rua Sul', Math.PI / 2));

  // MARCOS ÚNICOS de Venore (personalidade): moinho, farol e cais do porto
  add(criaMoinho(-44, -74));   // moinho de vento (pás giram) nos campos do sudoeste
  add(criaFarol(66, 84));      // farol à beira do lago norte
  add(criaCais(45, 60, 12));   // cais do porto + barco no lago norte

  // === NATUREZA / BIOMAS (mundo expandido) ===
  // lago ao norte + riacho com ponte na rua x=16
  add(criaLago(45, 80, 15));
  add(criaRiacho({ xIni: -55, xFim: 30, z: 80, larg: 5, gapX: 16, gapW: 7 }));
  add(criaPonte(16, 80, 8));
  // BIOMA beira-d'água: salgueiros, juncos, vitórias-régias, flores azuis, pedras
  add(criaSalgueiro(24, 72));
  add(criaSalgueiro(54, 64));
  [[-40, 76], [-20, 84], [0, 76], [-50, 83], [33, 70], [40, 92], [52, 90]].forEach(([x, z]) => add(criaJunco(x, z)));
  [[42, 78], [48, 84], [38, 86], [50, 74], [44, 88]].forEach(([x, z]) => add(criaNenufar(x, z)));
  [[-45, 74], [10, 75], [-15, 86], [58, 72]].forEach(([x, z]) => add(criaFlorAlta(x, z, 0x6ab0ff)));
  [[30, 73, 1.2], [60, 88, 1.0], [-52, 76, 0.9]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));
  // BIOMA floresta (oeste): pinheiros + árvores de copa + cogumelos + pedras
  [[-82, 0], [-92, 18], [-78, -22], [-95, -8], [-86, 34], [-80, -40], [-93, 42], [-88, -28]]
    .forEach(([x, z]) => add(criaPinheiro(x, z)));
  [[-86, 10], [-90, -16], [-80, 26], [-94, 6], [-84, -34], [-90, 50]]
    .forEach(([x, z]) => add(criaArvore(x, z)));
  [[-83, 4], [-88, 22], [-85, -12], [-91, 30]].forEach(([x, z]) => add(criaCogumelo(x, z)));
  [[-80, 14, 1.4], [-94, -2, 1.1], [-86, -46, 1.2]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));
  // BIOMA campo florido (leste/sul): flores variadas + pedras
  [[80, 20], [88, -10], [76, 40], [84, 8], [70, -30], [82, -44], [-30, -80], [20, -84]]
    .forEach(([x, z], i) => add(criaFlorAlta(x, z, [0xf2c14e, 0xe85d75, 0xd06ad0, 0xff8a4c][i % 4])));
  [[88, -30, 1.3], [86, 28, 1.0], [72, -16, 1.5]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));

  // === MAPA AMPLIADO (estilo Tibia: Venore cercada por água, estrada p/ outra cidade, montanhas) ===
  // MONTANHAS emoldurando o mundo (norte/oeste/sul, ao longe)
  [[-70, 200, 1.3], [10, 220, 1.5], [90, 205, 1.2], [160, 215, 1.4], [-150, 185, 1.3],
   [-210, 40, 1.4], [-220, 130, 1.2], [-200, -60, 1.3], [-180, -150, 1.4], [205, -200, 1.3], [-205, -205, 1.2]]
    .forEach(([x, z, s]) => add(criaMontanha(x, z, s))); // sul abriu espaço pra PRAIA (montanhas viraram flancos)
  // LAGOS ao redor da cidade (Venore cercada por água) + beira d'água
  [[-95, -55, 16], [100, 95, 18], [-105, 70, 14], [-75, -110, 15]].forEach(([x, z, r]) => {
    add(criaLago(x, z, r));
    add(criaSalgueiro(x + r * 0.6, z));
    [[x - r, z + 2], [x + 2, z - r], [x - 4, z + r]].forEach(([jx, jz]) => add(criaJunco(jx, jz)));
    add(criaFlorAlta(x + 3, z + r * 0.7, 0x6ab0ff));
  });
  // === CAMINHO DE THAIS (a leste) — VIAGEM LONGA DE VERDADE (portão a x=504)
  add(criaEstrada(72, 504, 0, 8));               // estrada até o portão de Thais
  add(criaPlaca(74, -7, '→ THAIS'));
  add(criaPlaca(150, 7, 'THAIS  ⟶', Math.PI));
  add(criaPlaca(230, -7, '→ THAIS'));
  add(criaPlaca(350, -7, '→ THAIS'));
  add(criaPlaca(450, 7, 'THAIS  ⟶', Math.PI));
  // posto de descanso (acampamento) na beira da estrada
  add(criaFogueira(120, 14));
  add(criaBarraca(126, 16, -0.4, 0x9c6a2a));
  add(criaBarril(116, 16)); add(criaCaixa(118, 17));
  add(criaCarroca(118, 12, 0.3));
  // segundo acampamento + carroça quebrada mais adiante
  add(criaFogueira(208, -14));
  add(criaBarraca(214, -16, 0.5, 0x2a6ba0));
  add(criaCarroca(200, -12, -0.6));
  add(criaBarril(204, -16));
  // arvoredo ladeando a estrada (sombra na jornada)
  [[100, -16], [140, 18], [167, -18], [255, 16], [270, -14]].forEach(([x, z], i) => add(i % 2 ? criaArvore(x, z) : criaPinheiro(x, z)));

  // === RIO FUNDO — corta o caminho na METADE exata da viagem (x=180);
  // a PONTE DE PEDRA é a única travessia (ponto estratégico, estilo Tibia)
  add(criaRio({ zIni: -130, zFim: 70, x: 180, larg: 8, gapZ: 0, gapW: 8 }));
  add(criaPonteDePedra(180, 0, 13));
  [[176, 10], [185, -12], [177, -40], [184, 40], [176, 62]].forEach(([x, z]) => add(criaJunco(x, z)));
  add(criaSalgueiro(172, 26)); add(criaSalgueiro(189, -58));
  [[174, -90, 1.2], [187, 52, 1.0]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));

  // === TORRE DE VIGIA — guarda observa a estrada (1º terço do caminho)
  add(criaTorreVigia(122, -9));
  add(criaBandeira(126, -12, 0x2a5a9c));

  // === FAZENDA DO CAMINHO — vida rural antes do rio (norte da estrada)
  add(criaFazenda(105, 38));
  add(criaPoco(93, 52));
  add(criaCarroca(118, 50, 0.8));

  // === CEMITÉRIO ABANDONADO — desvio sombrio ao sul (esqueletos à noite...)
  add(criaCemiterio(130, -60));
  add(criaPlaca(124, -46, 'Cemitério', 0));
  [[120, -52], [142, -54], [138, -70]].forEach(([x, z]) => add(criaArvoreMorta(x, z)));

  // === PÂNTANO DA SERPENTE — brejo a sudeste, além do rio (cobras!)
  add(criaPantano(225, -95));
  [[212, -86], [236, -90], [222, -108], [231, -82], [214, -104]].forEach(([x, z]) => add(criaJunco(x, z)));
  [[208, -94], [238, -102]].forEach(([x, z]) => add(criaArvoreMorta(x, z)));
  add(criaPlaca(213, -78, 'Pântano — cuidado', -0.4));

  // === ACAMPAMENTO BANDIDO — covil dos ladrões da estrada (nordeste)
  add(criaFogueira(252, 48));
  add(criaBarraca(247, 52, 0.7, 0x3a3a42));
  add(criaBarraca(258, 51, -0.5, 0x3a3a42));
  add(criaBau(252, 43, 0.4));
  add(criaCaixa(246, 46)); add(criaBarril(259, 45));

  // === SEGUNDA METADE DA VIAGEM (depois do rio: mais selvagem e perigosa)
  // ruínas da estrada velha (orcs) + acampamentos de viajantes
  add(criaRuinas(400, -70));
  add(criaPlaca(394, -56, 'Ruínas da Estrada', 0.3));
  add(criaFogueira(380, 16));
  add(criaBarraca(386, 18, -0.3, 0x2a8a4a));
  add(criaCarroca(374, 14, 0.5));
  add(criaBarril(383, 12));
  add(criaFogueira(470, -14));
  add(criaBarraca(476, -16, 0.4, 0xb23a3a));
  add(criaCaixa(466, -12));

  // === MARCOS DE DISTÂNCIA na estrada (metragem REAL calculada do mapa)
  // praça de Venore fica em (0,0); portão de Thais em (504,0)
  add(criaMarcoDistancia(110, -6, 'THAIS 394\nVENORE 110'));
  add(criaMarcoDistancia(192, 6, 'THAIS 312\nVENORE 192'));
  add(criaMarcoDistancia(240, 6, 'THAIS 264\nVENORE 240'));
  add(criaMarcoDistancia(320, -6, 'THAIS 184\nVENORE 320'));
  add(criaMarcoDistancia(420, 6, 'THAIS 84\nVENORE 420'));
  add(criaMarcoDistancia(490, -6, 'THAIS 14\nVENORE 490'));

  // === PRAIA DO SUL + MAR (novo bioma: areia, coqueiros, conchas e caranguejos)
  const areia = new THREE.Mesh(new THREE.BoxGeometry(380, 0.08, 75), mat(0xd9c692, 1));
  areia.position.set(0, 0.04, -222); areia.receiveShadow = true; scene.add(areia);
  const mar = new THREE.Mesh(new THREE.BoxGeometry(460, 0.06, 160),
    new THREE.MeshStandardMaterial({ color: 0x2e6fa8, roughness: 0.12, metalness: 0.35, transparent: true, opacity: 0.88 }));
  mar.position.set(0, 0.09, -330); scene.add(mar);
  obstaculos.push({ minX: -230, maxX: 230, minZ: -410, maxZ: -258 }); // mar fundo: não entra
  lagos.push({ x: 0, z: -300, r: 95 }); // pescaria na beira do mar!
  // caminho de terra do Bairro do Comércio até a praia
  const trilha = new THREE.Mesh(new THREE.BoxGeometry(6, 0.07, 85), mat(0x9a7e54, 1));
  trilha.position.set(0, 0.04, -152); trilha.receiveShadow = true; scene.add(trilha);
  add(criaPlaca(6, -190, 'Praia de Venore'));
  // coqueiral
  [[-60, -210, 1.1], [-25, -222, 1.0], [15, -214, 1.2], [55, -226, 0.95], [95, -212, 1.1],
   [-100, -220, 1.0], [130, -224, 1.05], [-140, -212, 1.1], [35, -238, 1.0], [-70, -236, 0.95]]
    .forEach(([x, z, s]) => add(criaCoqueiro(x, z, s)));
  [[-45, -240, 1.1], [80, -242, 0.9], [-115, -238, 1.0]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));

  // === THAIS (cidade distante ENTRÁVEL) — agora BEM longe (centro x=560) ===
  add(criaThais(560, 0));
  add(criaFonte(560, 0));                         // praça central com fonte
  add(criaPlaca(510, -7, 'Bem-vindo a Thais'));   // logo após o portão
  // casas ENTRÁVEIS dentro de Thais (porta aberta, telhado some) — 4 no total
  add(criaCasaInterior(548, -18, { frente: 'norte', cor: 0xd2c19a, corTelhado: 0xc0653a }));
  add(criaCasaInterior(572, -18, { frente: 'norte', cor: 0xcab98e, corTelhado: 0x2f8d80 }));
  add(criaCasaInterior(534, 12, { frente: 'sul', cor: 0xd8c8a4, corTelhado: 0x9a4a3a }));
  add(criaCasaInterior(580, 0, { frente: 'oeste', cor: 0xdccfae, corTelhado: 0x2f8d80 }));
  // mercado, poço, estátua e estandartes (cores de Thais: turquesa/ouro) — frentes livres
  add(criaBarraca(550, 7, 0, 0xc0653a));
  add(criaBarraca(570, 7, 0, 0x2f8d80));
  add(criaPoco(576, -10));
  add(criaEstatua(544, 8));
  [[540, 26, 0x2f8d80], [580, 26, 0xd9a522], [540, -26, 0xd9a522], [580, -26, 0x2f8d80]]
    .forEach(([x, z, c]) => add(criaBandeira(x, z, c)));
  add(criaCanteiro(544, -4)); add(criaCanteiro(568, 10));
  // postes de luz na praça de Thais (acendem à noite)
  [[550, -8], [570, -8], [550, 12], [570, 12]].forEach(([x, z]) => add(criaPoste(x, z)));
  // montanhas emoldurando Thais e o fim do mundo a leste
  [[560, 95, 1.3], [560, -95, 1.2], [640, 40, 1.4], [630, -60, 1.3], [650, 130, 1.2], [635, -150, 1.3]]
    .forEach(([x, z, s]) => add(criaMontanha(x, z, s)));

  // === FLORESTA GRANDE (estilo Tibia/Albion): mata fechada ao redor de Venore
  const arvG = (x, z, s) => add(criaArvoreGrande(x, z, s));
  // anel oeste/noroeste (engrossa a Floresta do Oeste)
  [[-120, 10, 1.3], [-135, -25, 1.1], [-118, 55, 1.4], [-140, 90, 1.0], [-125, -90, 1.2],
   [-150, 40, 1.3], [-160, -15, 1.1], [-110, 115, 1.2], [-135, 135, 1.0], [-105, -35, 1.0]]
    .forEach(([x, z, s]) => arvG(x, z, s));
  // anel norte (entre a cidade e as montanhas; respeita lagos/riacho)
  [[-60, 120, 1.2], [-20, 130, 1.4], [20, 125, 1.1], [-40, 160, 1.0], [10, 170, 1.3], [60, 150, 1.1], [90, 140, 1.0]]
    .forEach(([x, z, s]) => arvG(x, z, s));
  // anel sul (cercando o Bairro do Comércio por fora)
  [[60, -90, 1.2], [85, -120, 1.0], [20, -130, 1.3], [-15, -140, 1.1], [-50, -150, 1.2],
   [95, -70, 1.0], [-120, -130, 1.1], [50, -160, 1.3], [-90, -160, 1.0]]
    .forEach(([x, z, s]) => arvG(x, z, s));
  // mata ladeando a ESTRADA inteira (sombra na viagem, sem invadir a pista)
  [[90, -22, 1.1], [150, -26, 1.3], [205, -24, 1.0], [300, -26, 1.2], [340, -20, 1.0],
   [385, -26, 1.3], [430, -22, 1.1], [505, -20, 1.2],
   [95, 20, 1.0], [140, 24, 1.2], [165, 28, 1.0], [200, 22, 1.3], [235, 26, 1.1],
   [270, 24, 1.0], [310, 28, 1.2], [355, 22, 1.3], [400, 26, 1.0], [445, 22, 1.2], [485, 28, 1.1]]
    .forEach(([x, z, s]) => arvG(x, z, s));
  // bolsões de mata fechada na 2ª metade (entre o rio e Thais)
  [[320, 60, 1.4], [360, -60, 1.2], [410, 70, 1.3], [450, -60, 1.0], [480, 50, 1.2],
   [350, 100, 1.1], [420, -100, 1.3], [500, 90, 1.0], [380, 140, 1.2], [460, 110, 1.1], [440, -130, 1.0]]
    .forEach(([x, z, s]) => arvG(x, z, s));
  // sub-bosque acompanhando (pinheiros e árvores comuns entremeados)
  [[110, 26], [160, -30], [290, 26], [330, -24], [420, 24], [495, -26], [365, 60], [395, -90], [465, 70], [-115, 70], [-130, -60], [35, -145]]
    .forEach(([x, z], i) => add(i % 2 ? criaArvore(x, z) : criaPinheiro(x, z)));
  // mais vegetação entre a cidade e as montanhas
  [[120, 60], [150, -40], [-130, 30], [110, -90], [-120, -70], [170, 80], [-160, 100], [140, 140], [-110, 150], [90, 170]]
    .forEach(([x, z], i) => add(i % 2 ? criaArvore(x, z) : criaPinheiro(x, z)));
  [[130, 20], [-100, -30], [160, -80], [-150, -110], [100, 130], [-130, 90], [180, 40], [-90, 120]]
    .forEach(([x, z], i) => add(criaFlorAlta(x, z, [0xf2c14e, 0xe85d75, 0xd06ad0, 0x6ab0ff][i % 4])));
  [[115, -20, 1.4], [-110, 50, 1.2], [145, 100, 1.6], [-170, -40, 1.3]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));

  // === TERRAS DO DRAGÃO (norte distante) — vulcão + tesouro + cenário carbonizado ===
  add(criaCovilDragao(40, 330));                  // covil ao norte (amplia o mapa)
  add(criaPlaca(40, 268, 'Covil do Dragao — PERIGO'));
  // montanhas escoltando o vale do dragão
  [[-40, 320, 1.5], [170, 330, 1.4], [40, 360, 1.6]].forEach(([x, z, s]) => add(criaMontanha(x, z, s)));

  // === MONTANHA DO DRAGÃO (escalável!) — rampa cônica até o platô do topo,
  // onde o dragão vive. A subida usa alturaTerreno() no main3d (mesmo perfil).
  const MD = { x: 110, z: 300, r: 46, topo: 8, h: 34 };
  const morro = new THREE.Mesh(new THREE.CylinderGeometry(MD.topo, MD.r, MD.h, 28), mat(0x6e6a62, 1));
  morro.position.set(MD.x, MD.h / 2, MD.z); morro.castShadow = morro.receiveShadow = true;
  scene.add(morro); solidos.push(morro);
  const plato = new THREE.Mesh(new THREE.CylinderGeometry(MD.topo + 0.8, MD.topo + 0.8, 0.5, 20), mat(0x55514a, 1));
  plato.position.set(MD.x, MD.h + 0.2, MD.z); scene.add(plato);
  // ossadas e pedras no pé da montanha (avisos de quem tentou subir)
  [[MD.x - MD.r - 3, MD.z + 6, 1.4], [MD.x + 4, MD.z + MD.r + 3, 1.2], [MD.x + MD.r + 2, MD.z - 5, 1.1]]
    .forEach(([x, z, s]) => add(criaPedra(x, z, s)));
  add(criaPlaca(MD.x - MD.r - 4, MD.z, 'Pico do Dragão — PERIGO', Math.PI / 2));
  // bosque carbonizado na aproximação (árvores mortas + pedras + caveiras de pedra)
  [[10, 280], [70, 285], [-10, 300], [80, 305], [25, 312], [55, 268], [-20, 262]].forEach(([x, z]) => add(criaArvoreMorta(x, z)));
  [[0, 290, 1.6], [90, 300, 1.4], [60, 320, 1.8], [20, 340, 1.3]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));

  // === RUÍNAS ANTIGAS (clima D&D; marcos de exploração no mapa amplo) ===
  add(criaRuinas(150, 250));                       // ruínas a caminho do dragão
  add(criaRuinas(-180, -90));                      // ruínas perdidas no sudoeste
  add(criaPlaca(150, 240, 'Ruinas Antigas'));

  // nuvens
  const nuvemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92 });
  for (let i = 0; i < 14; i++) {
    const nv = new THREE.Group();
    const n = 3 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random() * 3, 8, 6), nuvemMat);
      s.position.set((Math.random() - 0.5) * 11, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 7);
      s.scale.y = 0.55; nv.add(s);
    }
    nv.position.set((Math.random() - 0.5) * 330, 52 + Math.random() * 26, (Math.random() - 0.5) * 330);
    scene.add(nv); nuvens.push(nv);
  }

  return { scene, sun, hemi, skyMat, ceu, lua, luaLuz, luaMat, estrelas, obstaculos, solidos, aguas, postes, nuvens, fonteGotas, ruas, marcos, animados, interativos, casas, lagos, montanhaDragao: MD };
}

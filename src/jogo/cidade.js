// =============================================================
//  VENOR  ·  vilarejo em GRADE (ruas padrão), normal e detalhado.
//  Praça central + marcos + casas diversas alinhadas + adereços.
// =============================================================
import * as THREE from 'three';
import { mat, criaPredio, criaMarco, criaPinheiro, criaArbusto, criaFonte, criaBanco, criaPoste } from './construcoes.js';
import { criaBarril, criaCaixa, criaPoco, criaBarraca, criaEstatua, criaCanteiro, criaBandeira, criaBau, criaCristal } from './props.js';
import { criaLago, criaRiacho, criaPonte, criaJunco, criaSalgueiro, criaArvore, criaNenufar, criaPedra, criaCogumelo, criaFlorAlta } from './natureza.js';
import { criaCasaInterior } from './interiores.js';

// textura procedural de grama (granulado de tons de verde) — dá vida ao chão
function texturaGrama() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#66924c'; x.fillRect(0, 0, 128, 128);
  const tons = ['#5d8744', '#6f9a52', '#5a8040', '#74a058', '#638e49', '#7aa85c'];
  for (let i = 0; i < 1100; i++) {
    x.fillStyle = tons[i % tons.length];
    x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60);
  return t;
}

export function criaCidade() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfe0ee, 160, 380);

  // céu em gradiente (claro)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { corTopo: { value: new THREE.Color(0x4f86c0) }, corBase: { value: new THREE.Color(0xdce9f2) } },
    vertexShader: 'varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vPos; uniform vec3 corTopo; uniform vec3 corBase; void main(){ float h = clamp(normalize(vPos).y,0.0,1.0); gl_FragColor = vec4(mix(corBase, corTopo, pow(h,0.5)),1.0); }',
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(600, 24, 16), skyMat));

  const hemi = new THREE.HemisphereLight(0xcfe2f5, 0x6f6a52, 0.95);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff6e6, 1.35);
  sun.position.set(70, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const d = 145;
  sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
  sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 420;
  scene.add(sun);

  // grama
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(540, 540), new THREE.MeshStandardMaterial({ map: texturaGrama(), roughness: 1 }));
  grama.rotation.x = -Math.PI / 2; grama.receiveShadow = true; scene.add(grama);

  // ruas em GRADE — finas e quase no nível do chão (evita o avatar "afundar")
  const ruaMat = mat(0x595f66, 1);
  const faixaH = (z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(180, 0.1, 8), ruaMat); m.position.set(0, 0.02, z); m.receiveShadow = true; scene.add(m); };
  const faixaV = (x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 180), ruaMat); m.position.set(x, 0.02, 0); m.receiveShadow = true; scene.add(m); };
  const ruas = [-48, -16, 16, 48];
  ruas.forEach((c) => { faixaH(c); faixaV(c); });

  const praca = new THREE.Mesh(new THREE.BoxGeometry(30, 0.1, 30), mat(0x9a9082, 1));
  praca.position.y = 0.03; praca.receiveShadow = true; scene.add(praca);

  const obstaculos = [], solidos = [], aguas = [], postes = [], nuvens = [], fonteGotas = [], animados = [], interativos = [], casas = [];
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
  marcos.forEach((m) => add(criaMarco(m.tipo, { x: m.x, z: m.z, rot: m.rot })));

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

  // pinheiros + arbustos (com flores)
  [[24, 24], [-24, 24], [24, -24], [-24, -24], [56, 8], [-56, 8], [8, 56], [8, -56], [56, 56], [-56, -56], [-56, 56], [56, -56]]
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
  add(criaBau(0, -26, 0.2));         // tesouro perto da igreja
  add(criaCristal(0, 26));           // cristal arcano perto da escola

  // CASAS ENTRÁVEIS (porta abre na AÇÃO, telhado some ao entrar) — perto da praça
  add(criaCasaInterior(38, 0, { frente: 'oeste', cor: 0xd8c4a0, corTelhado: 0x8a4632 }));
  add(criaCasaInterior(-38, 0, { frente: 'leste', cor: 0xc8a86a, corTelhado: 0x4a5666 }));

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
  [[78, 0, 1.3], [86, 28, 1.0], [72, -16, 1.5]].forEach(([x, z, s]) => add(criaPedra(x, z, s)));

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

  return { scene, sun, hemi, skyMat, obstaculos, solidos, aguas, postes, nuvens, fonteGotas, ruas, marcos, animados, interativos, casas };
}

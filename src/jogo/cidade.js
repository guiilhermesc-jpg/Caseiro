// =============================================================
//  VENOR  ·  vilarejo em GRADE (ruas padrão), normal e detalhado.
//  Praça central + marcos + casas diversas alinhadas + adereços.
// =============================================================
import * as THREE from 'three';
import { mat, criaPredio, criaMarco, criaPinheiro, criaArbusto, criaFonte, criaBanco, criaPoste } from './construcoes.js';

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
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), mat(0x66924c, 1));
  grama.rotation.x = -Math.PI / 2; grama.receiveShadow = true; scene.add(grama);

  // ruas em GRADE — finas e quase no nível do chão (evita o avatar "afundar")
  const ruaMat = mat(0x595f66, 1);
  const faixaH = (z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(180, 0.1, 8), ruaMat); m.position.set(0, 0.02, z); m.receiveShadow = true; scene.add(m); };
  const faixaV = (x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 180), ruaMat); m.position.set(x, 0.02, 0); m.receiveShadow = true; scene.add(m); };
  [-48, -16, 16, 48].forEach((c) => { faixaH(c); faixaV(c); });

  const praca = new THREE.Mesh(new THREE.BoxGeometry(30, 0.1, 30), mat(0x9a9082, 1));
  praca.position.y = 0.03; praca.receiveShadow = true; scene.add(praca);

  const obstaculos = [], solidos = [], aguas = [], postes = [], nuvens = [], fonteGotas = [];
  const add = (res) => {
    scene.add(res.grupo); solidos.push(res.grupo);
    if (res.colisores) res.colisores.forEach((c) => obstaculos.push(c));
    if (res.agua) aguas.push(res.agua);
    if (res.aguas) res.aguas.forEach((a) => aguas.push(a));
    if (res.gotas) res.gotas.forEach((dg) => fonteGotas.push(dg));
    if (res.luz) postes.push({ luz: res.luz, lumMat: res.lumMat });
  };

  // praça: fonte central + bancos + postes nas esquinas
  add(criaFonte(0, 0));
  add(criaBanco(0, 8, Math.PI));
  add(criaBanco(0, -8, 0));
  add(criaBanco(8, 0, -Math.PI / 2));
  add(criaBanco(-8, 0, Math.PI / 2));

  // marcos (virados PARA a praça)
  add(criaMarco('igreja', { x: 0, z: -32, rot: 0 }));
  add(criaMarco('hospital', { x: 32, z: 0, rot: -Math.PI / 2 }));
  add(criaMarco('delegacia', { x: -32, z: 0, rot: Math.PI / 2 }));
  add(criaMarco('escola', { x: 0, z: 32, rot: Math.PI }));

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

  return { scene, sun, hemi, skyMat, obstaculos, solidos, aguas, postes, nuvens, fonteGotas };
}

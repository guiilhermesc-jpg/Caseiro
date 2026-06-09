// =============================================================
//  VENOR  ·  a cidade onde o jogo começa (vilarejo completo, normal).
//  Céu em gradiente, luz de céu, praça central, marcos, casas e plantas.
// =============================================================
import * as THREE from 'three';
import { mat, criaPredio, criaMarco, criaArvore, criaPinheiro, criaArbusto, criaFonte } from './construcoes.js';

export function criaCidade() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc2d6e4, 130, 330);

  // céu em gradiente (esfera por dentro) -> dá pra "ver o céu" ao girar a câmera
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      corTopo: { value: new THREE.Color(0x2e5a8a) },
      corBase: { value: new THREE.Color(0xc6d8e6) },
    },
    vertexShader: 'varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vPos; uniform vec3 corTopo; uniform vec3 corBase; void main(){ float h = clamp(normalize(vPos).y, 0.0, 1.0); gl_FragColor = vec4(mix(corBase, corTopo, pow(h, 0.55)), 1.0); }',
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(500, 24, 16), skyMat));

  // iluminação: céu (hemisphere) + sol direcional
  scene.add(new THREE.HemisphereLight(0xaecbe6, 0x6b6650, 0.75));
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.05);
  sun.position.set(60, 90, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const d = 130;
  sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
  sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 360;
  scene.add(sun);

  // grama base
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), mat(0x5f8a45, 1));
  grama.rotation.x = -Math.PI / 2; grama.receiveShadow = true; scene.add(grama);

  // ruas em cruz
  const faixa = (w, dd, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, dd), mat(0x5a5f66, 1));
    m.position.set(x, 0.08, z); m.receiveShadow = true; scene.add(m);
  };
  faixa(12, 240, 0, 0);
  faixa(240, 12, 0, 0);

  // praça central (pedra)
  const praca = new THREE.Mesh(new THREE.BoxGeometry(32, 0.2, 32), mat(0x9a9082, 1));
  praca.position.y = 0.1; praca.receiveShadow = true; scene.add(praca);

  const obstaculos = [];
  const solidos = [];
  const aguas = [];
  const add = (res) => {
    scene.add(res.grupo);
    solidos.push(res.grupo);
    if (res.colisores) res.colisores.forEach((c) => obstaculos.push(c));
    if (res.agua) aguas.push(res.agua);
  };

  add(criaFonte(0, 0));

  // marcos ao redor da praça (fachada virada pra praça)
  add(criaMarco('igreja', { x: 0, z: -46 }));
  add(criaMarco('hospital', { x: 46, z: 0, rot: -Math.PI / 2 }));
  add(criaMarco('delegacia', { x: -46, z: 0, rot: Math.PI / 2 }));
  add(criaMarco('escola', { x: 0, z: 46, rot: Math.PI }));

  // casas nas quadras (padronizadas)
  const coresCasa = [0xd8c4a0, 0xc8a888, 0xbcae90, 0xd0b0a0, 0xc0c0a8];
  const casas = [
    { x: 26, z: -26 }, { x: -26, z: -26 }, { x: 26, z: 26 }, { x: -26, z: 26 },
    { x: 64, z: -24 }, { x: 64, z: 24 }, { x: -64, z: -24 }, { x: -64, z: 24 },
    { x: 24, z: -64 }, { x: -24, z: -64 }, { x: 24, z: 64 }, { x: -24, z: 64 },
  ];
  casas.forEach((c, i) => add(criaPredio({
    x: c.x, z: c.z, larg: 9, prof: 9, alt: 7,
    cor: coresCasa[i % coresCasa.length], corTelhado: 0x7a4632,
  })));

  // vegetação variada (árvore, pinheiro, arbusto)
  const verdes = [
    ['arvore', 12, 12], ['pinheiro', -12, 12], ['arvore', 12, -12], ['pinheiro', -12, -12],
    ['arvore', 38, -38], ['pinheiro', -38, -38], ['arvore', 38, 38], ['pinheiro', -38, 38],
    ['arvore', 76, 6], ['pinheiro', -76, 6], ['arvore', 6, 76], ['pinheiro', 6, -76],
    ['arbusto', 8, 6], ['arbusto', -8, 6], ['arbusto', 6, -8], ['arbusto', -6, -8],
  ];
  verdes.forEach(([tipo, x, z]) => {
    if (tipo === 'arvore') add(criaArvore(x, z));
    else if (tipo === 'pinheiro') add(criaPinheiro(x, z));
    else add(criaArbusto(x, z));
  });

  return { scene, sun, obstaculos, solidos, aguas };
}

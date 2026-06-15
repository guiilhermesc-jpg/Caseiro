// =============================================================
//  VENOR  ·  vilarejo em GRADE (ruas padrão), normal e detalhado.
//  Praça central + marcos + casas diversas alinhadas + adereços.
// =============================================================
import * as THREE from 'three';
import { mat, criaPredio, criaMarco, criaPinheiro, criaArbusto, criaFonte, criaBanco, criaPoste, criaMoinho, criaFarol, criaMercado, texturaPedra, aplicaTexturaReal, desloca } from './construcoes.js';
import { criaBarril, criaCaixa, criaPoco, criaBarraca, criaEstatua, criaCanteiro, criaBandeira, criaBau, criaCristal } from './props.js';
import { criaLago, criaRiacho, criaPonte, criaJunco, criaSalgueiro, criaArvore, criaArvoreGrande, criaNenufar, criaPedra, criaCogumelo, criaFlorAlta, criaMontanha, criaEstrada, criaPlaca, criaFogueira, criaCarroca, criaCais, criaArvoreMorta, criaRuinas, criaCovilDragao, criaRio, criaPonteDePedra, criaTorreVigia, criaCemiterio, criaPantano, criaFazenda, criaMarcoDistancia, criaCoqueiro, criaCachoeira, criaCranioDragao } from './natureza.js';
import { criaCasaInterior, criaTemploSagrado, criaHospitalInterior } from './interiores.js';
import { criaThais } from './thais.js';
import { alturaColinas, REGIAO } from './terreno.js';
import { criaVegetacaoInstanciada } from './vegetacao.js';

// textura procedural de grama (granulado de tons de verde) — dá vida ao chão
function texturaGrama(rep = 60) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#66924c'; x.fillRect(0, 0, 128, 128);
  const tons = ['#5d8744', '#6f9a52', '#5a8040', '#74a058', '#638e49', '#7aa85c'];
  for (let i = 0; i < 1400; i++) {
    x.fillStyle = tons[i % tons.length];
    x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  // manchas de terra e capim seco (quebram a repetição do verde)
  for (let i = 0; i < 26; i++) {
    x.fillStyle = i % 2 ? 'rgba(122,104,68,.18)' : 'rgba(160,170,90,.16)';
    x.beginPath(); x.arc(Math.random() * 128, Math.random() * 128, 2 + Math.random() * 4, 0, Math.PI * 2); x.fill();
  }
  // florzinhas espalhadas (pontos coloridos sutis)
  const flores = ['#e8e8e8', '#f2c14e', '#e85d75', '#9ab0ff'];
  for (let i = 0; i < 40; i++) {
    x.fillStyle = flores[i % flores.length];
    x.fillRect(Math.random() * 128, Math.random() * 128, 1.6, 1.6);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  t.anisotropy = 8; // nitidez ao longe
  return t;
}

export function criaCidade() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc9d9e6, 250, 760); // neblina com mais profundidade e menos branco estourado

  // céu em gradiente (claro)
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { corTopo: { value: new THREE.Color(0x4f86c0) }, corBase: { value: new THREE.Color(0xdce9f2) } },
    vertexShader: 'varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec3 vPos; uniform vec3 corTopo; uniform vec3 corBase; void main(){ float h = clamp(normalize(vPos).y,0.0,1.0); gl_FragColor = vec4(mix(corBase, corTopo, pow(h,0.5)),1.0); }',
  });
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(600, 24, 16), skyMat);
  scene.add(ceu);
  // CÉU PREMIUM: panorama pintado (gerado por IA) substitui o gradiente quando
  // carregar; o ciclo dia/noite passa a TINGIR o panorama (main3d)
  new THREE.TextureLoader().load('texturas/ceu.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    ceu.material = new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false });
  }, undefined, () => {});

  const hemi = new THREE.HemisphereLight(0xc4dcf2, 0x5d6a44, 0.86);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe3b8, 1.42); // sol dourado com leitura mais cinematográfica
  sun.position.set(70, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); // sombras mais nítidas (só pesa no PC; mobile não usa sombra)
  const d = 100;
  sun.shadow.camera.left = -d; sun.shadow.camera.right = d;
  sun.shadow.camera.top = d; sun.shadow.camera.bottom = -d;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 420;
  sun.shadow.bias = -0.00018;
  sun.shadow.normalBias = 0.035;
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

  // VAGALUMES (RV3.0): pontinhos verdes que acordam à noite no campo/floresta
  // (opacidade controlada pelo ciclo dia/noite no main3d; flutuam de leve)
  const NVAGA = 110, posV = new Float32Array(NVAGA * 3);
  for (let i = 0; i < NVAGA; i++) {
    let vx = 0, vz = 0;
    for (let tent = 0; tent < 40; tent++) {
      vx = (Math.random() - 0.5) * 380; vz = (Math.random() - 0.5) * 330;
      if (!(Math.abs(vx) < 26 && Math.abs(vz) < 26)) break; // fora da praça
    }
    posV[i * 3] = vx; posV[i * 3 + 1] = alturaColinas(vx, vz) + 0.8 + Math.random() * 1.8; posV[i * 3 + 2] = vz;
  }
  const geoV = new THREE.BufferGeometry(); geoV.setAttribute('position', new THREE.BufferAttribute(posV, 3));
  const vagalumes = new THREE.Points(geoV, new THREE.PointsMaterial({ color: 0xb8ffa0, size: 2.8, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(vagalumes);

  // grama (procedural já; troca pela textura REAL gerada por IA quando carregar)
  const gramaMat = new THREE.MeshStandardMaterial({ map: texturaGrama(460), roughness: 1 });
  aplicaTexturaReal(gramaMat, 'grama', 300, 300);
  // plano-horizonte raso (some na neblina, levemente abaixo pra não brigar)
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(4200, 4200), gramaMat);
  grama.rotation.x = -Math.PI / 2; grama.position.y = -0.06; grama.receiveShadow = true; scene.add(grama);
  // === RELEVO: colinas procedurais (estilo pack premium) ===
  // malha segmentada cujos vértices seguem alturaColinas() — a MESMA função
  // que a física usa no main3d: cidades/estrada/praia/água ficam PLANAS.
  const LARG_R = REGIAO.maxX - REGIAO.minX, PROF_R = REGIAO.maxZ - REGIAO.minZ;
  const cxR = (REGIAO.maxX + REGIAO.minX) / 2, czR = (REGIAO.maxZ + REGIAO.minZ) / 2;
  const geoRelevo = new THREE.PlaneGeometry(LARG_R, PROF_R, 180, 140);
  geoRelevo.rotateX(-Math.PI / 2);
  const posR = geoRelevo.attributes.position, uvR = geoRelevo.attributes.uv;
  for (let i = 0; i < posR.count; i++) {
    posR.setY(i, alturaColinas(posR.getX(i) + cxR, posR.getZ(i) + czR));
    uvR.setXY(i, uvR.getX(i) * (LARG_R / 4200), uvR.getY(i) * (PROF_R / 4200)); // textura na mesma escala do horizonte
  }
  geoRelevo.computeVertexNormals();
  // CHÃO COM VIDA (RV5.4): variação de tom POR VÉRTICE assada na malha —
  // manchas largas de capim seco e de terra batida + respiro fino de verde
  // quebram o "papel de parede" da textura repetida
  const gramaMatCampo = gramaMat.clone();
  gramaMatCampo.vertexColors = true;
  aplicaTexturaReal(gramaMatCampo, 'grama', 300, 300);
  const coresR = new Float32Array(posR.count * 3);
  for (let i = 0; i < posR.count; i++) {
    const wx = posR.getX(i) + cxR, wz = posR.getZ(i) + czR;
    const n1 = Math.sin(wx * 0.013 + 1.7) * Math.cos(wz * 0.011 - 0.6); // manchas largas
    const n2 = Math.sin(wx * 0.047 - 0.8) * Math.cos(wz * 0.053 + 1.2); // granulado
    let r = 1, g2 = 1, b = 1;
    if (n1 > 0.55) { r = 1.12; g2 = 1.04; b = 0.82; }       // capim seco (amarelado)
    else if (n1 < -0.62) { r = 0.94; g2 = 0.82; b = 0.64; } // terra batida
    const v = 1 + n2 * 0.07;
    coresR[i * 3] = r * v; coresR[i * 3 + 1] = g2 * v; coresR[i * 3 + 2] = b * v;
  }
  geoRelevo.setAttribute('color', new THREE.BufferAttribute(coresR, 3));
  const relevo = new THREE.Mesh(geoRelevo, gramaMatCampo);
  relevo.position.set(cxR, 0, czR); relevo.receiveShadow = true; scene.add(relevo);

  // MATO 3D (padrão Tibia): tufos de capim espalhados pelo campo inteiro —
  // instanciados em 2 draw calls (320 moitas quase de graça)
  function texturaMato() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const x = c.getContext('2d');
    const verdes = ['#4e7c3a', '#5d8f46', '#6fa052', '#447034'];
    for (let i = 0; i < 16; i++) {
      x.strokeStyle = verdes[i % verdes.length];
      x.lineWidth = 2 + Math.random() * 1.6;
      x.beginPath();
      const bx = 20 + Math.random() * 24;
      x.moveTo(bx, 64);
      x.quadraticCurveTo(bx + (Math.random() - 0.5) * 26, 34, 8 + Math.random() * 48, 4 + Math.random() * 26);
      x.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  const matoMat = new THREE.MeshStandardMaterial({ map: texturaMato(), transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 1 });
  const matoGeo = new THREE.PlaneGeometry(1.7, 1.25); matoGeo.translate(0, 0.55, 0);
  const randX = () => REGIAO.minX + Math.random() * (REGIAO.maxX - REGIAO.minX);
  const randZ = () => REGIAO.minZ + Math.random() * (REGIAO.maxZ - REGIAO.minZ);
  function bloqueiaVegetacao(px, pz) {
    if (Math.abs(px) < 78 && Math.abs(pz) < 78) return true;     // vila central
    if (px > 60 && px < 620 && Math.abs(pz) < 15) return true;   // estrada para Thais
    if (pz < -178) return true;                                  // praia/mar
    if (Math.abs(px) < 42 && pz < -70) return true;              // bairro sul/trilha
    if (Math.hypot(px - 110, pz - 300) < 52) return true;        // Montanha do Dragão
    if (px > 498) return true;                                   // Thais
    if (px < -232 && pz > -152 && pz < 94) return true;          // Venore capital
    if (px > -260 && px < -80 && Math.abs(pz + 30) < 9) return true; // Estrada do Pântano
    if (px > -565 && px < -414 && Math.abs(pz + 30) < 12) return true; // Estrada das Cinzas
    if (px > -704 && px < -536 && pz > -94 && pz < 34) return true; // Noctaria
    if (px > -752 && px < -682 && Math.abs(pz + 30) < 10) return true; // trilha da Fenda
    if (Math.hypot(px + 742, pz + 30) < 46) return true;         // Santuário da Lua Partida
    return false;
  }
  const N_MATO = 700, dummyM = new THREE.Object3D(); // 2× mais denso (refs premium) — seguem 2 draw calls
  const mato1 = new THREE.InstancedMesh(matoGeo, matoMat, N_MATO);
  const mato2 = new THREE.InstancedMesh(matoGeo, matoMat, N_MATO);
  let mi = 0;
  for (let tent = 0; tent < 16000 && mi < N_MATO; tent++) {
    const px = randX(), pz = randZ();
    if (bloqueiaVegetacao(px, pz)) continue;
    dummyM.position.set(px, alturaColinas(px, pz), pz); // tufos assentam na colina
    dummyM.rotation.y = Math.random() * Math.PI;
    dummyM.scale.setScalar(0.7 + Math.random() * 0.9);
    dummyM.updateMatrix();
    mato1.setMatrixAt(mi, dummyM.matrix);
    dummyM.rotation.y += Math.PI / 2; dummyM.updateMatrix();
    mato2.setMatrixAt(mi, dummyM.matrix);
    mi++;
  }
  mato1.count = mi; mato2.count = mi;
  scene.add(mato1); scene.add(mato2);

  // ruas em GRADE — agora CALÇADAS de pedra (textura), quase no nível do chão
  function matRua(rx, rz) {
    const t = texturaPedra(1); t.repeat.set(rx, rz);
    const m = new THREE.MeshStandardMaterial({ map: t, color: 0x9a9a98, roughness: 1 });
    aplicaTexturaReal(m, 'pedra', rx, rz); // calçamento REAL quando carregar
    return m;
  }
  const guiaRuaMat = new THREE.MeshStandardMaterial({ color: 0x655f57, roughness: 1, flatShading: true });
  const juntaRuaMat = new THREE.MeshStandardMaterial({ color: 0x423d38, roughness: 1, transparent: true, opacity: 0.58, depthWrite: false });
  const ralinhoMat = new THREE.MeshStandardMaterial({ color: 0x24211f, roughness: 0.9, metalness: 0.05 });
  function detalhaRua(cx, cz, w, d, y = 0.095) {
    const horizontal = w >= d;
    const guiaGeo = horizontal ? new THREE.BoxGeometry(w, 0.04, 0.28) : new THREE.BoxGeometry(0.28, 0.04, d);
    const guiaOffsets = horizontal ? [[0, d / 2 + 0.1], [0, -d / 2 - 0.1]] : [[w / 2 + 0.1, 0], [-w / 2 - 0.1, 0]];
    guiaOffsets.forEach(([ox, oz]) => {
      const guia = new THREE.Mesh(guiaGeo, guiaRuaMat);
      guia.position.set(cx + ox, y, cz + oz);
      guia.receiveShadow = true;
      scene.add(guia);
    });
    const len = horizontal ? w : d;
    const cortes = Math.max(3, Math.min(18, Math.floor(len / 14)));
    const dRua = new THREE.Object3D();
    const juntas = new THREE.InstancedMesh(
      horizontal ? new THREE.BoxGeometry(0.16, 0.012, d * 0.92) : new THREE.BoxGeometry(w * 0.92, 0.012, 0.16),
      juntaRuaMat,
      cortes - 1
    );
    for (let i = 1; i < cortes; i++) {
      dRua.position.set(horizontal ? cx - w / 2 + w * (i / cortes) : cx, y + 0.028, horizontal ? cz : cz - d / 2 + d * (i / cortes));
      dRua.rotation.set(0, 0, 0);
      dRua.scale.set(1, 1, 1);
      dRua.updateMatrix();
      juntas.setMatrixAt(i - 1, dRua.matrix);
    }
    juntas.receiveShadow = true;
    scene.add(juntas);

    const ralos = Math.max(2, Math.min(10, Math.floor(len / 28)));
    const ralosMesh = new THREE.InstancedMesh(
      horizontal ? new THREE.BoxGeometry(0.78, 0.035, 0.22) : new THREE.BoxGeometry(0.22, 0.035, 0.78),
      ralinhoMat,
      ralos
    );
    for (let i = 0; i < ralos; i++) {
      const t = (i + 0.5) / ralos;
      const lado = i % 2 ? 1 : -1;
      dRua.position.set(
        horizontal ? cx - w / 2 + w * t : cx + lado * (w / 2 - 0.55),
        y + 0.038,
        horizontal ? cz + lado * (d / 2 - 0.55) : cz - d / 2 + d * t
      );
      dRua.rotation.set(0, 0, 0);
      dRua.scale.set(1, 1, 1);
      dRua.updateMatrix();
      ralosMesh.setMatrixAt(i, dRua.matrix);
    }
    ralosMesh.receiveShadow = true;
    scene.add(ralosMesh);
  }
  const ruaMatH = matRua(34, 1.6), ruaMatV = matRua(1.6, 34);
  const faixaH = (z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(180, 0.1, 8), ruaMatH); m.position.set(0, 0.02, z); m.receiveShadow = true; scene.add(m); detalhaRua(0, z, 180, 8); };
  const faixaV = (x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 180), ruaMatV); m.position.set(x, 0.02, 0); m.receiveShadow = true; scene.add(m); detalhaRua(x, 0, 8, 180); };
  const ruas = [-48, -16, 16, 48];
  ruas.forEach((c) => { faixaH(c); faixaV(c); });

  const pisoMat = new THREE.MeshStandardMaterial({ map: texturaPedra(7), roughness: 1 }); // calçamento das praças
  aplicaTexturaReal(pisoMat, 'pedra', 7, 7);
  const praca = new THREE.Mesh(new THREE.BoxGeometry(30, 0.1, 30), pisoMat);
  praca.position.y = 0.03; praca.receiveShadow = true; scene.add(praca);

  const obstaculos = [], solidos = [], aguas = [], postes = [], nuvens = [], fonteGotas = [], animados = [], interativos = [], casas = [], lagos = [];
  const add = (res) => {
    // o que nasce "no chão" (y=0) assenta na colina local (zonas planas = +0)
    if (res.grupo.position.y === 0) res.grupo.position.y = alturaColinas(res.grupo.position.x, res.grupo.position.z);
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
  // === VEGETAÇÃO INSTANCIADA: coleta as posições e desenha tudo em ~9 draw
  // calls (vegetacao.js) — antes eram ~900 meshes de árvore/pinheiro/pedra
  const VEG = { arvores: [], pinheiros: [], pedras: [] };
  const arvG = (x, z, s = 1) => VEG.arvores.push([x, z, s]);
  const pinh = (x, z) => VEG.pinheiros.push([x, z]);
  const pedr = (x, z, s = 1) => VEG.pedras.push([x, z, s]);

  // praça: fonte central + bancos + postes nas esquinas
  add(criaFonte(0, 0));
  // Bancos nos cantos da praca: o corredor central fica livre para templo,
  // hospital, escola e delegacia, principalmente no joystick do celular.
  add(criaBanco(-9, 8, Math.PI / 2));
  add(criaBanco(9, 8, -Math.PI / 2));
  add(criaBanco(-9, -8, Math.PI / 2));
  add(criaBanco(9, -8, -Math.PI / 2));

  // marcos (virados PARA a praça)
  const marcos = [
    { tipo: 'igreja', x: 0, z: -32, rot: 0 },
    { tipo: 'hospital', x: 32, z: 0, rot: -Math.PI / 2 },
    { tipo: 'delegacia', x: -32, z: 0, rot: Math.PI / 2 },
    { tipo: 'escola', x: 0, z: 32, rot: Math.PI },
  ];
  // igreja → TEMPLO SAGRADO entrável; hospital → HOSPITAL entrável (a porta
  // que se vê FUNCIONA — era ali que o jogador "travava" tentando entrar)
  marcos.forEach((m) => { if (m.tipo !== 'igreja' && m.tipo !== 'hospital') add(criaMarco(m.tipo, { x: m.x, z: m.z, rot: m.rot })); });
  add(criaTemploSagrado(0, -32));
  add(criaHospitalInterior(32, 0));

  // casas diversas, ALINHADAS em ângulo reto (colisão correta) e viradas pro centro
  const cores = [0xd8c4a0, 0xc8a86a, 0xa8bcae, 0xd0a0a0, 0xb0b8c0, 0xe0d0a0, 0x9ab0a4, 0xcaa890];
  const telhados = [0x8a4632, 0x6a4a6a, 0x55636f, 0x7a3a2a, 0x4a5666, 0x6b4a2a];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const snap = (ang) => Math.round(ang / (Math.PI / 2)) * (Math.PI / 2); // alinha a 0/90/180/270
  const lotes = [
    [32, 32], [-32, 32], [32, -32], [-32, -32],
    [-64, 0], [0, -64],
    [64, 32], [64, -32], [-64, 32], [-64, -32],
    [32, 64], [-32, 64], [32, -64], [-32, -64],
    [64, 64], [-64, 64], [64, -64], [-64, -64],
  ];
  lotes.forEach(([x, z]) => add(criaPredio({
    x, z, larg: rnd(8, 13), prof: rnd(8, 12), alt: rnd(6, 11),
    cor: pick(cores), corTelhado: pick(telhados), rot: snap(Math.atan2(-x, -z)),
  })));
  // RV5.4: dois lotes que eram decorativos viraram casas ENTRÁVEIS de verdade
  add(criaCasaInterior(64, 0, { frente: 'oeste', cor: 0xe0d0a0, corTelhado: 0x7a3a2a }));
  add(criaCasaInterior(0, 64, { frente: 'sul', cor: 0x9ab0a4, corTelhado: 0x4a5666 }));

  // === PORTÕES DO VILAREJO (RV5.4): paliçada de madeira com tabuleta nas
  // 3 entradas — a vila ganha rosto (e quem chega sabe onde chegou)
  function portaoVila(px, pz, rotY, nome) {
    const gP = new THREE.Group(); gP.position.set(px, 0, pz); gP.rotation.y = rotY;
    const madP = mat(0x6e4a2a, 1);
    [-5, 5].forEach((ox) => {
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 7.5, 8), madP);
      poste.position.set(ox, 3.75, 0); poste.castShadow = true; gP.add(poste);
      const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 8), madP);
      ponta.position.set(ox, 7.9, 0); gP.add(ponta);
    });
    const travessa = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.7, 0.7), madP);
    travessa.position.y = 6.6; travessa.castShadow = true; gP.add(travessa);
    const cnvP = document.createElement('canvas'); cnvP.width = 256; cnvP.height = 64;
    const cp = cnvP.getContext('2d');
    cp.fillStyle = '#7a5a32'; cp.fillRect(0, 0, 256, 64);
    cp.fillStyle = '#f0e8d0'; cp.font = 'bold 26px Arial'; cp.textAlign = 'center'; cp.textBaseline = 'middle';
    cp.fillText(nome, 128, 34);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.1, 0.18),
      new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnvP), roughness: 0.9 }));
    tab.position.y = 5.6; gP.add(tab);
    scene.add(gP); solidos.push(gP);
    const lados = Math.abs(Math.sin(rotY)) > 0.5 ? [[0, -5], [0, 5]] : [[-5, 0], [5, 0]];
    lados.forEach(([ox, oz]) => obstaculos.push({ minX: px + ox - 0.7, maxX: px + ox + 0.7, minZ: pz + oz - 0.7, maxZ: pz + oz + 0.7 }));
  }
  portaoVila(72, 0, Math.PI / 2, 'VILAREJO DE VENOR');      // leste (estrada de Thais)
  portaoVila(-86, -30, Math.PI / 2, 'VILAREJO DE VENOR');   // oeste (estrada de Venore)
  portaoVila(0, -116, 0, 'VILAREJO DE VENOR');              // sul (trilha da praia)

  // postes de luz nas esquinas das ruas
  // (4 postes deslocados: ficavam EXATAMENTE em cima dos bueiros do esgoto)
  [[16, 16], [-16, 22], [16, -22], [-16, -16], [48, 22], [-48, 16], [48, -16], [-48, -22], [16, 48], [-16, 48], [16, -48], [-16, -48]]
    .forEach(([x, z]) => add(criaPoste(x, z)));

  // pinheiros + arbustos (com flores) — LONGE das portas das casas (frentes livres)
  [[46, 46], [-46, 46], [46, -46], [-46, -46], [58, 16], [-58, 16], [20, 58], [20, -58], [56, 56], [-56, -56], [-56, 56], [56, -56]]
    .forEach(([x, z]) => pinh(x, z));
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
  // barris e caixas (depósitos AO LADO das ruas — 4 pares estavam NO MEIO da pista)
  [[22, 40], [24, 54], [40, 24], [-22, 40], [-24, 54], [-40, 24], [40, -24], [-40, -24]]
    .forEach(([x, z]) => { add(criaBarril(x, z)); add(criaCaixa(x + 1.3, z + 0.2)); });
  // ITENS VALIOSOS (ganchos de quest futura)
  add(criaBau(12, -18, 0.4));        // tesouro ao LADO do templo (corredor central livre)
  add(criaCristal(0, 21));           // cristal arcano à frente da escola (fora do colisor)

  // CASAS ENTRÁVEIS (porta aberta, telhado some ao entrar) — em lotes livres.
  // Antes ficavam em (±38, 0), sobrepondo hospital/delegacia e criando
  // "travadas" invisiveis na rota da praca. Agora ficam fora dos marcos.
  add(criaCasaInterior(78, 24, { frente: 'sul', cor: 0xd8c4a0, corTelhado: 0x8a4632 }));
  add(criaCasaInterior(-78, 24, { frente: 'leste', cor: 0xc8a86a, corTelhado: 0x4a5666 }));
  // LOJAS estilo Tibia (cada NPC com sua finalidade — runas, arco & flecha, forja)
  add(criaBarraca(-22, 14, 0, 0x6a2ab0));               // banca de RUNAS da Eldra
  add(criaPlaca(-26, 14, 'Runas — Eldra', Math.PI / 2));
  add(criaBarraca(22, -12, 0, 0x2a8a4a));               // banca de ARCO & FLECHA do Falk
  add(criaPlaca(26, -12, 'Arco & Flecha', -Math.PI / 2));
  add(criaPlaca(-21, 11, 'Forja — Armas', Math.PI / 2)); // armas com Bram, o ferreiro

  // placas de rua (estilo Tibia)
  add(criaPlaca(20, 6, 'Rua do Mercado', -Math.PI / 2));
  add(criaPlaca(-10, -19, 'Templo Sagrado', Math.PI / 2));
  add(criaPlaca(-2, 18, 'Largo da Escola', Math.PI));
  add(criaPlaca(-20, 5, 'Rua do Ferreiro', Math.PI / 2));

  // === CRESCER VENORE: Bairro do Comércio (sul) + marcos únicos ===
  // ruas do bairro (conector ao sul + via principal) + praça
  const viaConector = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 30), matRua(1.6, 6));
  viaConector.position.set(0, 0.02, -85); viaConector.receiveShadow = true; scene.add(viaConector);
  detalhaRua(0, -85, 8, 30);
  const viaBairro = new THREE.Mesh(new THREE.BoxGeometry(60, 0.1, 8), matRua(11, 1.6));
  viaBairro.position.set(0, 0.02, -95); viaBairro.receiveShadow = true; scene.add(viaBairro);
  detalhaRua(0, -95, 60, 8);
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
  [[-32, -84], [32, -84], [-32, -108], [32, -108]].forEach(([x, z], i) => (i % 2 ? add(criaArbusto(x, z)) : pinh(x, z)));
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
  add(criaCachoeira(45, 96)); // CACHOEIRA alimentando o lago norte (véu d'água + espuma)
  add(criaRiacho({ xIni: -55, xFim: 30, z: 80, larg: 5, gapX: 16, gapW: 7 }));
  add(criaPonte(16, 80, 8));
  // BIOMA beira-d'água: salgueiros, juncos, vitórias-régias, flores azuis, pedras
  add(criaSalgueiro(24, 72));
  add(criaSalgueiro(54, 64));
  [[-40, 76], [-20, 84], [0, 76], [-50, 83], [33, 70], [40, 92], [52, 90]].forEach(([x, z]) => add(criaJunco(x, z)));
  [[42, 78], [48, 84], [38, 86], [50, 74], [44, 88]].forEach(([x, z]) => add(criaNenufar(x, z)));
  [[-45, 74], [10, 75], [-15, 86], [58, 72]].forEach(([x, z]) => add(criaFlorAlta(x, z, 0x6ab0ff)));
  [[30, 73, 1.2], [60, 88, 1.0], [-52, 76, 0.9]].forEach(([x, z, s]) => pedr(x, z, s));
  // BIOMA floresta (oeste): pinheiros + árvores de copa + cogumelos + pedras
  [[-82, 0], [-92, 18], [-78, -22], [-95, -8], [-86, 34], [-80, -40], [-93, 42], [-88, -28]]
    .forEach(([x, z]) => pinh(x, z));
  [[-86, 10], [-90, -16], [-80, 38], [-94, 6], [-84, -34], [-90, 50]]
    .forEach(([x, z]) => add(criaArvore(x, z))); // (-80,26 caía DENTRO da casa entrável nova)
  [[-83, 4], [-88, 22], [-85, -12], [-91, 30]].forEach(([x, z]) => add(criaCogumelo(x, z)));
  [[-80, 14, 1.4], [-94, -2, 1.1], [-86, -46, 1.2]].forEach(([x, z, s]) => pedr(x, z, s));
  // BIOMA campo florido (leste/sul): flores variadas + pedras
  [[80, 20], [88, -10], [76, 40], [84, 8], [70, -30], [82, -44], [-30, -80], [20, -84]]
    .forEach(([x, z], i) => add(criaFlorAlta(x, z, [0xf2c14e, 0xe85d75, 0xd06ad0, 0xff8a4c][i % 4])));
  [[88, -30, 1.3], [86, 28, 1.0], [72, -16, 1.5]].forEach(([x, z, s]) => pedr(x, z, s));

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
  add(criaEstrada(72, 500, 0, 8));               // estrada até o portão de Thais (muralha HX=60 → portão em x=500)
  { // PEDRINHAS nas bordas da estrada (refs premium: caminho com pedras de
    // verdade demarcando o trajeto) — ~280 pedras em 1 draw call
    const geoPed = desloca(new THREE.IcosahedronGeometry(0.34, 0), 0.12);
    geoPed.scale(1.35, 0.55, 0.9);
    const matPed = new THREE.MeshStandardMaterial({ color: 0x8d877c, roughness: 1, flatShading: true });
    const NPED = 300, imPed = new THREE.InstancedMesh(geoPed, matPed, NPED);
    const dPed = new THREE.Object3D();
    let ip = 0;
    for (let px = 74; px <= 500 && ip < NPED; px += 2.9) {
      for (const lado of [-1, 1]) {
        if (ip >= NPED) break;
        if (Math.random() < 0.18) continue;     // falhas naturais
        if (Math.abs(px - 180) < 9) continue;   // vão da Ponte de Pedra
        dPed.position.set(px + (Math.random() - 0.5) * 1.4, 0.06, lado * (4.15 + (Math.random() - 0.5) * 0.5));
        dPed.rotation.y = Math.random() * Math.PI;
        dPed.scale.setScalar(0.7 + Math.random() * 0.8);
        dPed.updateMatrix();
        imPed.setMatrixAt(ip++, dPed.matrix);
      }
    }
    imPed.count = ip; imPed.castShadow = true; imPed.receiveShadow = true; scene.add(imPed);
  }
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
  [[100, -16], [140, 18], [167, -18], [255, 16], [270, -14]].forEach(([x, z], i) => (i % 2 ? add(criaArvore(x, z)) : pinh(x, z)));

  // === RIO FUNDO — corta o caminho na METADE exata da viagem (x=180);
  // a PONTE DE PEDRA é a única travessia (ponto estratégico, estilo Tibia)
  add(criaRio({ zIni: -130, zFim: 70, x: 180, larg: 8, gapZ: 0, gapW: 8 }));
  add(criaPonteDePedra(180, 0, 13));
  [[176, 10], [185, -12], [177, -40], [184, 40], [176, 62]].forEach(([x, z]) => add(criaJunco(x, z)));
  add(criaSalgueiro(172, 26)); add(criaSalgueiro(189, -58));
  [[174, -90, 1.2], [187, 52, 1.0]].forEach(([x, z, s]) => pedr(x, z, s));

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
  add(criaMarcoDistancia(110, -6, 'THAIS 390\nVENORE 110'));
  add(criaMarcoDistancia(192, 6, 'THAIS 308\nVENORE 192'));
  add(criaMarcoDistancia(240, 6, 'THAIS 260\nVENORE 240'));
  add(criaMarcoDistancia(320, -6, 'THAIS 180\nVENORE 320'));
  add(criaMarcoDistancia(420, 6, 'THAIS 80\nVENORE 420'));
  add(criaMarcoDistancia(490, -6, 'THAIS 10\nVENORE 490'));

  // === PRAIA DO SUL + MAR (novo bioma: areia, coqueiros, conchas e caranguejos)
  const areiaMat = new THREE.MeshStandardMaterial({ color: 0xd9c692, roughness: 1 });
  aplicaTexturaReal(areiaMat, 'areia', 30, 6);
  const areia = new THREE.Mesh(new THREE.BoxGeometry(380, 0.08, 75), areiaMat);
  areia.position.set(0, 0.04, -222); areia.receiveShadow = true; scene.add(areia);
  const mar = new THREE.Mesh(new THREE.BoxGeometry(460, 0.06, 160),
    new THREE.MeshStandardMaterial({ color: 0x2e6fa8, roughness: 0.12, metalness: 0.35, transparent: true, opacity: 0.88 }));
  mar.position.set(0, 0.09, -330); scene.add(mar);
  obstaculos.push({ minX: -230, maxX: 230, minZ: -410, maxZ: -258 }); // mar fundo: não entra
  lagos.push({ x: 0, z: -300, r: 95 }); // pescaria na beira do mar!
  // caminho de terra do Bairro do Comércio até a praia
  // ESPUMA da praia: faixa branca onde o mar encontra a areia
  const espumaMar = new THREE.Mesh(new THREE.BoxGeometry(380, 0.04, 2.4),
    new THREE.MeshStandardMaterial({ color: 0xeef6fa, transparent: true, opacity: 0.55, roughness: 0.5, depthWrite: false }));
  espumaMar.position.set(0, 0.1, -251); scene.add(espumaMar);
  // MANCHAS DE COR no campo (quebram a uniformidade do verde — visual premium)
  [[120, 60, 30, 0x4a7a36], [-95, 120, 26, 0x6f9a3e], [250, 40, 34, 0x55893c], [-130, -50, 28, 0x6a9440],
   [330, -60, 30, 0x4d7e38], [160, 130, 24, 0x71a14a], [-60, -150, 26, 0x5b8a3c], [430, 60, 28, 0x4a7a36],
   [80, -120, 22, 0x6f9a3e], [-160, 60, 30, 0x55893c], [280, 120, 26, 0x6a9440], [500, -40, 24, 0x5b8a3c]]
    .forEach(([mx, mz, r, cor]) => {
      // a mancha DEITA na colina (vértices seguem alturaColinas — sem clipping)
      const geoM = new THREE.CircleGeometry(r, 18); geoM.rotateX(-Math.PI / 2);
      const pM = geoM.attributes.position;
      for (let vi = 0; vi < pM.count; vi++) pM.setY(vi, alturaColinas(mx + pM.getX(vi), mz + pM.getZ(vi)) + 0.045);
      const m = new THREE.Mesh(geoM,
        new THREE.MeshStandardMaterial({ color: cor, transparent: true, opacity: 0.16, roughness: 1, depthWrite: false }));
      m.position.set(mx, 0, mz); scene.add(m);
    });
  const trilhaMat = new THREE.MeshStandardMaterial({ color: 0x9a7e54, roughness: 1 });
  aplicaTexturaReal(trilhaMat, 'terra', 1.5, 16);
  const trilha = new THREE.Mesh(new THREE.BoxGeometry(6, 0.07, 85), trilhaMat);
  trilha.position.set(0, 0.04, -152); trilha.receiveShadow = true; scene.add(trilha);
  {
    const bordaTrilhaMat = new THREE.MeshStandardMaterial({ color: 0xc7b47c, roughness: 1, transparent: true, opacity: 0.78, depthWrite: false });
    [-1, 1].forEach((lado) => {
      const borda = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.026, 85), bordaTrilhaMat);
      borda.position.set(lado * 3.38, 0.092, -152);
      borda.receiveShadow = true;
      scene.add(borda);
    });
    const pegadaMat = new THREE.MeshStandardMaterial({ color: 0x6f5233, roughness: 1, transparent: true, opacity: 0.58, depthWrite: false });
    const pegadas = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.024, 0.46), pegadaMat, 34);
    const dTrilha = new THREE.Object3D();
    for (let i = 0; i < 34; i++) {
      dTrilha.position.set((i % 2 ? -0.42 : 0.42) + (Math.random() - 0.5) * 0.18, 0.108, -193 + i * 2.45);
      dTrilha.rotation.set(0, (i % 2 ? -0.13 : 0.13) + (Math.random() - 0.5) * 0.08, 0);
      dTrilha.scale.set(0.9 + Math.random() * 0.25, 1, 0.8 + Math.random() * 0.2);
      dTrilha.updateMatrix();
      pegadas.setMatrixAt(i, dTrilha.matrix);
    }
    pegadas.receiveShadow = true;
    scene.add(pegadas);
    const conchas = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.11, 0), mat(0xe8d8a5, 1), 26);
    for (let i = 0; i < 26; i++) {
      const lado = i % 2 ? -1 : 1;
      dTrilha.position.set(lado * (3.8 + Math.random() * 1.0), 0.12, -194 + Math.random() * 82);
      dTrilha.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
      dTrilha.scale.set(0.65 + Math.random() * 0.75, 0.25 + Math.random() * 0.25, 0.65 + Math.random() * 0.75);
      dTrilha.updateMatrix();
      conchas.setMatrixAt(i, dTrilha.matrix);
    }
    conchas.castShadow = conchas.receiveShadow = true;
    scene.add(conchas);
  }
  add(criaPlaca(6, -190, 'Praia de Venore'));
  // coqueiral
  [[-60, -210, 1.1], [-25, -222, 1.0], [15, -214, 1.2], [55, -226, 0.95], [95, -212, 1.1],
   [-100, -220, 1.0], [130, -224, 1.05], [-140, -212, 1.1], [35, -238, 1.0], [-70, -236, 0.95]]
    .forEach(([x, z, s]) => add(criaCoqueiro(x, z, s)));
  [[-45, -240, 1.1], [80, -242, 0.9], [-115, -238, 1.0]].forEach(([x, z, s]) => pedr(x, z, s));

  // === THAIS (cidade distante ENTRÁVEL) — agora BEM longe (centro x=560) ===
  add(criaThais(560, 0));
  add(criaFonte(560, 0));                         // praça central com fonte
  add(criaPlaca(506, -7, 'Bem-vindo a Thais'));   // logo após o portão
  // casas ENTRÁVEIS dentro de Thais (porta aberta, telhado some) — 4 no total
  add(criaCasaInterior(548, -18, { frente: 'norte', cor: 0xd2c19a, corTelhado: 0xc0653a }));
  // LOJA DE POÇÕES da Yara — primeira loja com INTERIOR de verdade em Thais
  add(criaCasaInterior(572, -18, { frente: 'norte', cor: 0xcab98e, corTelhado: 0x2f8d80, loja: true }));
  add(criaPlaca(576, -12, 'Poções — Yara', Math.PI));
  // (528,0 bloqueava a rota portão→chafariz; ao lado colide com o casario —
  // posição calculada livre: sul da via, porta pro norte voltada pra rua)
  add(criaCasaInterior(524, -14, { frente: 'norte', cor: 0xd8c8a4, corTelhado: 0x9a4a3a }));
  add(criaCasaInterior(592, 0, { frente: 'oeste', cor: 0xdccfae, corTelhado: 0x2f8d80 }));
  // RV5.4: os "respiros" do casario viraram casas ENTRÁVEIS (6 em Thais agora)
  add(criaCasaInterior(588, 46, { frente: 'sul', cor: 0xd8c8a4, corTelhado: 0xc0653a }));
  add(criaCasaInterior(532, -48, { frente: 'norte', cor: 0xcdb892, corTelhado: 0x2f8d80 }));
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
  // (arvG/pinh/pedr alimentam a vegetação INSTANCIADA — ver topo da função)
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
    .forEach(([x, z], i) => (i % 2 ? add(criaArvore(x, z)) : pinh(x, z)));
  // mais vegetação entre a cidade e as montanhas
  [[120, 60], [150, -40], [-130, 30], [110, -90], [-120, -70], [170, 80], [-160, 100], [140, 140], [-110, 150], [90, 170]]
    .forEach(([x, z], i) => (i % 2 ? add(criaArvore(x, z)) : pinh(x, z)));
  [[130, 20], [-100, -30], [160, -80], [-150, -110], [100, 130], [-130, 90], [180, 40], [-90, 120]]
    .forEach(([x, z], i) => add(criaFlorAlta(x, z, [0xf2c14e, 0xe85d75, 0xd06ad0, 0x6ab0ff][i % 4])));
  [[115, -20, 1.4], [-110, 50, 1.2], [145, 100, 1.6], [-170, -40, 1.3]].forEach(([x, z, s]) => pedr(x, z, s));

  // === TERRAS DO DRAGÃO (norte distante) — vulcão + tesouro + cenário carbonizado ===
  add(criaCovilDragao(40, 330));                  // covil ao norte (amplia o mapa)
  add(criaPlaca(40, 268, 'Covil do Dragao — PERIGO'));
  // montanhas escoltando o vale do dragão
  [[-40, 320, 1.5], [170, 330, 1.4], [40, 360, 1.6]].forEach(([x, z, s]) => add(criaMontanha(x, z, s)));

  // === MONTANHA DO DRAGÃO (escalável!) — rampa cônica até o platô do topo,
  // onde o dragão vive. A subida usa alturaTerreno() no main3d (mesmo perfil).
  const MD = { x: 110, z: 300, r: 46, topo: 12, h: 34 }; // platô largo (dragão GRANDE mora lá)
  const rochaMat = new THREE.MeshStandardMaterial({ color: 0x6e6a62, roughness: 1 });
  aplicaTexturaReal(rochaMat, 'rocha', 7, 3); // rocha REAL na encosta
  const morro = new THREE.Mesh(new THREE.CylinderGeometry(MD.topo, MD.r, MD.h, 28), rochaMat);
  morro.position.set(MD.x, MD.h / 2, MD.z); morro.castShadow = morro.receiveShadow = true;
  scene.add(morro); solidos.push(morro);
  const plato = new THREE.Mesh(new THREE.CylinderGeometry(MD.topo + 0.8, MD.topo + 0.8, 0.5, 20), mat(0x55514a, 1));
  plato.position.set(MD.x, MD.h + 0.2, MD.z); scene.add(plato);
  // poças de LAVA no platô (pisar QUEIMA — campos tratados no main3d)
  const lavaMat2 = new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0xff3a00, emissiveIntensity: 0.9, roughness: 0.6 });
  aplicaTexturaReal(lavaMat2, 'lava', 2, 2, true); // lava REAL incandescente
  [[104, 296, 2.8], [116, 305, 2.4]].forEach(([lx, lz, lr]) => {
    const poça = new THREE.Mesh(new THREE.CircleGeometry(lr, 16), lavaMat2);
    poça.rotation.x = -Math.PI / 2; poça.position.set(lx, MD.h + 0.48, lz); scene.add(poça);
  });
  // ossadas de vítimas no platô (clima de covil)
  [[106, 304], [115, 297]].forEach(([lx, lz]) => {
    const ossada = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.25), mat(0xe8e0c8, 0.6));
    ossada.position.set(lx, MD.h + 0.55, lz); ossada.rotation.y = Math.random() * 2; scene.add(ossada);
  });
  // ossadas e pedras no pé da montanha (avisos de quem tentou subir)
  [[MD.x - MD.r - 3, MD.z + 6, 1.4], [MD.x + 4, MD.z + MD.r + 3, 1.2], [MD.x + MD.r + 2, MD.z - 5, 1.1]]
    .forEach(([x, z, s]) => pedr(x, z, s));
  add(criaPlaca(MD.x - MD.r - 4, MD.z, 'Pico do Dragão — PERIGO', Math.PI / 2));
  { // BOCA DAS CAVERNAS (RV5.8): entrada de pedra na encosta sul do Pico
    const yBoca = alturaColinas(60, 266);
    const rochaB = mat(0x4a473f, 1);
    [[-2.2, 0], [2.2, 0]].forEach(([ox]) => {
      const pilarB = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.6, 1.1), rochaB);
      pilarB.position.set(60 + ox, yBoca + 1.8, 264.6); pilarB.castShadow = true; scene.add(pilarB);
      obstaculos.push({ minX: 60 + ox - 0.7, maxX: 60 + ox + 0.7, minZ: 263.9, maxZ: 265.3 });
    });
    const vergaB = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.0, 1.3), rochaB);
    vergaB.position.set(60, yBoca + 3.9, 264.6); vergaB.castShadow = true; scene.add(vergaB);
    const escuro = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.2), new THREE.MeshBasicMaterial({ color: 0x05050a }));
    escuro.position.set(60, yBoca + 1.7, 265.3); escuro.rotation.y = Math.PI; scene.add(escuro);
    add(criaPlaca(55, 262, 'Cavernas do Pico — calor lá embaixo', 0.5));
  }
  // bosque carbonizado na aproximação (árvores mortas + pedras + caveiras de pedra)
  [[10, 280], [70, 285], [-10, 300], [80, 305], [25, 312], [55, 268], [-20, 262]].forEach(([x, z]) => add(criaArvoreMorta(x, z)));
  [[0, 290, 1.6], [90, 300, 1.4], [60, 320, 1.8], [20, 340, 1.3]].forEach(([x, z, s]) => pedr(x, z, s));

  // === RUÍNAS ANTIGAS (clima D&D; marcos de exploração no mapa amplo) ===
  add(criaRuinas(150, 250));                       // ruínas a caminho do dragão
  add(criaRuinas(-180, -90));                      // ruínas perdidas no sudoeste
  add(criaPlaca(150, 240, 'Ruinas Antigas'));

  // === OSSADA DO DRAGÃO (RV3.0) — crânio gigante meio enterrado no campo,
  // troféu de uma era em que os dragões dominavam estas terras
  add(criaCranioDragao(250, 120));
  add(criaPlaca(243, 112, 'Ossada do Dragao', 0.5));

  // === NINHO DAS ARANHAS (RV4.6) — covil na Floresta do Oeste: teias entre
  // as árvores, casulos de seda (vítimas...) e a Aranha Tecelã rondando
  {
    const cnvT = document.createElement('canvas'); cnvT.width = cnvT.height = 64;
    const xt = cnvT.getContext('2d');
    xt.strokeStyle = 'rgba(240,240,245,0.85)'; xt.lineWidth = 1.4;
    for (let i = 0; i < 10; i++) { // raios da teia
      const a = (i / 10) * Math.PI * 2;
      xt.beginPath(); xt.moveTo(32, 32); xt.lineTo(32 + Math.cos(a) * 32, 32 + Math.sin(a) * 32); xt.stroke();
    }
    for (let r = 6; r <= 30; r += 6) { xt.beginPath(); xt.arc(32, 32, r, 0, Math.PI * 2); xt.stroke(); }
    const teiaMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnvT), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    [[-150, -62, 0.4], [-141, -70, -0.7], [-148, -74, 1.2]].forEach(([tx, tz, rotT]) => {
      const teia = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), teiaMat);
      teia.position.set(tx, alturaColinas(tx, tz) + 1.7 + Math.random() * 0.7, tz);
      teia.rotation.y = rotT; scene.add(teia);
    });
    [[-146, -66], [-142, -61], [-151, -70]].forEach(([cx2, cz2]) => {
      const casulo = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), mat(0xeceae2, 0.8));
      casulo.scale.y = 1.6; casulo.position.set(cx2, alturaColinas(cx2, cz2) + 0.7, cz2);
      casulo.rotation.z = (Math.random() - 0.5) * 0.6; casulo.castShadow = true; scene.add(casulo);
    });
    add(criaPlaca(-138, -56, 'Ninho das Aranhas — PERIGO', -0.6));
  }

  // === NINHO DO DRAGÃO no platô do Pico (RV3.0): ovos que prometem futuro...
  {
    const ninho = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.5, 8, 16), mat(0x5a4326, 1));
    ninho.rotation.x = -Math.PI / 2; ninho.position.set(116, 34.45, 305); scene.add(ninho);
    const matOvo = new THREE.MeshStandardMaterial({ color: 0xe9e0c6, roughness: 0.55 });
    [[115.2, 304.4, 0.55], [116.8, 305.4, 0.62], [116.1, 304.0, 0.5]].forEach(([ox, oz, r]) => {
      const ovo = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), matOvo);
      ovo.scale.y = 1.35; ovo.position.set(ox, 34.4 + r * 0.8, oz); ovo.castShadow = true; scene.add(ovo);
    });
  }

  // ============================================================
  //  VENORE — A CIDADE MERCANTE DO PÂNTANO (RV4.0, cidade PRINCIPAL)
  //  Design ORIGINAL inspirado no estilo "cidade de comércio sobre o
  //  brejo": canal com pontes de tábuas, calçadão de madeira, Grande
  //  Mercado com TORRE DO DEPÓSITO, porto com cais, casario mercante
  //  alto (2 andares/sacadas) e pântano em volta. A cidade antiga
  //  passa a ser o VILAREJO DE VENOR.
  // ============================================================
  // estrada do pântano: liga o vilarejo (oeste) à nova capital
  add(criaEstrada(-250, -86, -30, 8));
  add(criaPlaca(-92, -37, '← VENORE', Math.PI));
  add(criaPlaca(-160, -23, 'VENORE ⟵'));
  add(criaPlaca(-254, -23, 'VENORE — Cidade Mercante'));
  add(criaMarcoDistancia(-170, -37, 'VENORE 150\nVENOR 84'));
  {
    const CVX = -320, CVZ = -30; // centro da praça do Grande Mercado
    // ruas de pedra: principal (leste-oeste) + transversal (norte-sul)
    const ruaP = new THREE.Mesh(new THREE.BoxGeometry(164, 0.1, 8), matRua(30, 1.6));
    ruaP.position.set(-328, 0.02, CVZ); ruaP.receiveShadow = true; scene.add(ruaP);
    detalhaRua(-328, CVZ, 164, 8);
    const ruaT = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 190), matRua(1.6, 34));
    ruaT.position.set(-300, 0.02, -18); ruaT.receiveShadow = true; scene.add(ruaT);
    detalhaRua(-300, -18, 8, 190);
    // praça do Grande Mercado (calçamento)
    const pracaV = new THREE.Mesh(new THREE.BoxGeometry(30, 0.12, 30), pisoMat);
    pracaV.position.set(CVX, 0.03, CVZ); pracaV.receiveShadow = true; scene.add(pracaV);

    // === CANAL DE VENORE (norte-sul) com margens de pedra e 2 pontes ===
    const aguaCanal = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 190),
      new THREE.MeshStandardMaterial({ color: 0x39707f, roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.85 }));
    aguaCanal.position.set(-352, 0.04, -5); scene.add(aguaCanal); aguas.push(aguaCanal);
    [-355.6, -348.4].forEach((mx) => {
      const margem = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.34, 190), pisoMat);
      margem.position.set(mx, 0.17, -5); margem.receiveShadow = true; scene.add(margem);
    });
    // o canal BLOQUEIA (cair na água não dá) — vãos livres só onde têm pontes
    [[-100, -33.5], [-26.5, 2.5], [9.5, 52.5], [59.5, 90]].forEach(([z0, z1]) => {
      obstaculos.push({ minX: -356.4, maxX: -347.6, minZ: z0, maxZ: z1 });
    });
    // pontes de tábuas (passa por cima; sem colisor)
    [[-30], [6], [56]].forEach(([pz]) => {
      const tabuas = new THREE.Mesh(new THREE.BoxGeometry(10, 0.12, 5.4), new THREE.MeshStandardMaterial({ color: 0x7a5a36, roughness: 1 }));
      tabuas.position.set(-352, 0.06, pz); tabuas.receiveShadow = true; scene.add(tabuas);
      [-2.9, 2.9].forEach((oz) => {
        const corr = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 0.16), mat(0x5a4326, 1));
        corr.position.set(-352, 0.6, pz + oz); scene.add(corr);
      });
    });
    // calçadão de madeira na beira leste do canal (passeio do comércio)
    const calcadao = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.09, 180), new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 1 }));
    aplicaTexturaReal(calcadao.material, 'madeira', 1.2, 30);
    calcadao.position.set(-345.6, 0.05, -8); calcadao.receiveShadow = true; scene.add(calcadao);

    // === TORRE DO DEPÓSITO (marco da cidade — visível de longe) ===
    {
      const base = new THREE.Mesh(new THREE.BoxGeometry(11, 11, 11), mat(0xb9a486, 1));
      base.position.set(-296, 5.5, -54); base.castShadow = base.receiveShadow = true; scene.add(base);
      const torre = new THREE.Mesh(new THREE.BoxGeometry(5.6, 11, 5.6), mat(0xc7b394, 1));
      torre.position.set(-296, 16.5, -54); torre.castShadow = true; scene.add(torre);
      const coroa = new THREE.Mesh(new THREE.ConeGeometry(4.6, 4.6, 4), matRua(2, 2));
      coroa.rotation.y = Math.PI / 4; coroa.position.set(-296, 24.2, -54); coroa.castShadow = true; scene.add(coroa);
      // relógio do depósito (canvas) virado pra praça
      const cnvR = document.createElement('canvas'); cnvR.width = cnvR.height = 64;
      const cr = cnvR.getContext('2d');
      cr.fillStyle = '#f0e8d0'; cr.beginPath(); cr.arc(32, 32, 30, 0, Math.PI * 2); cr.fill();
      cr.strokeStyle = '#3a2a1a'; cr.lineWidth = 4; cr.stroke();
      cr.beginPath(); cr.moveTo(32, 32); cr.lineTo(32, 12); cr.moveTo(32, 32); cr.lineTo(46, 36); cr.stroke();
      const relogio = new THREE.Mesh(new THREE.CircleGeometry(1.6, 18),
        new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnvR), roughness: 0.8 }));
      relogio.position.set(-296, 17, -51.1); scene.add(relogio);
      const portaD = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.4, 0.2), mat(0x4a2f1a));
      portaD.position.set(-296, 1.7, -48.4); scene.add(portaD);
      obstaculos.push({ minX: -301.5, maxX: -290.5, minZ: -59.5, maxZ: -48.5 });
    }

    // === GRANDE MERCADO (pavilhão coberto, lado norte da praça) ===
    add(criaMercado(CVX, -10, 16, 10));
    add(criaPlaca(-310, -16, 'Grande Mercado de Venore', -Math.PI / 2));

    // === CASARIO MERCANTE (alto: 2 andares + sacadas saem do criaPredio) ===
    [[-376, -44], [-340, -48], [-320, -54], [-258, -44], [-272, -44]]
      .forEach(([x, z]) => add(criaPredio({
        x, z, larg: rnd(10, 14), prof: rnd(9, 12), alt: rnd(9, 12),
        cor: pick(cores), corTelhado: pick(telhados), rot: snap(Math.atan2(-(x - CVX), -(z - CVZ))),
      })));
    // RV5.4: mais portas abertas na capital — decorativas viraram ENTRÁVEIS
    add(criaCasaInterior(-392, -44, { frente: 'leste', cor: 0xd8c4a0, corTelhado: 0x8a4632 }));
    add(criaCasaInterior(-376, -16, { frente: 'sul', cor: 0xb0b8c0, corTelhado: 0x55636f }));
    // LOJA ARCANA DA ILDA (RV4.3): runas atendidas em interior de verdade
    add(criaCasaInterior(-340, -12, { frente: 'leste', cor: 0xc7b394, corTelhado: 0x6a4a8a, loja: true }));
    add(criaPlaca(-334, -7, 'Runas — Ilda', -Math.PI / 2));
    // casas ENTRÁVEIS + a LOJA DA ALQUIMISTA (interior de loja de verdade)
    add(criaCasaInterior(-392, -16, { frente: 'leste', cor: 0xc8a86a, corTelhado: 0x55636f }));
    add(criaCasaInterior(-272, -16, { frente: 'sul', cor: 0xa8bcae, corTelhado: 0x6a4a6a }));
    add(criaCasaInterior(-284, -44, { frente: 'norte', cor: 0xd0a0a0, corTelhado: 0x8a4632, loja: true }));
    add(criaPlaca(-280, -38, 'Alquimia — Berta', Math.PI));

    // === PORTO DE VENORE (lagoa + cais; pesca!) ===
    add(criaLago(-330, -92, 14));
    add(criaCais(-322, -84, 12));
    add(criaPlaca(-314, -76, 'Porto de Venore', -Math.PI / 2));
    [[-342, -84], [-318, -98], [-338, -100], [-322, -78]].forEach(([x, z]) => add(criaJunco(x, z)));
    add(criaSalgueiro(-344, -96));

    // === FORJA DO GROM (RV4.2): oficina entrável com bigorna e forno aceso
    add(criaCasaInterior(-308, -50, { frente: 'norte', cor: 0x9a9282, corTelhado: 0x3a4656, forja: true }));
    add(criaPlaca(-303, -44, 'Forja — Grom', Math.PI));
    // === ARMADURAS DA TESSA (RV4.2): loja entrável no Largo das Guildas
    add(criaCasaInterior(-290, 22, { frente: 'oeste', cor: 0xb0a890, corTelhado: 0x55636f, loja: true }));
    add(criaPlaca(-296, 27, 'Armaduras — Tessa', Math.PI / 2));

    // === VIDA DE PRAÇA: barracas, poço, bancos, canteiros, bandeiras, postes
    add(criaBarraca(-330, -38, 0.2, 0xb23a3a));
    add(criaBarraca(-310, -22, -0.3, 0x2a6ba0));
    add(criaPoco(-330, -22));
    add(criaBanco(-312, -38, -Math.PI / 2)); add(criaBanco(-328, -22, Math.PI / 2));
    add(criaCanteiro(-312, -22)); add(criaCanteiro(-328, -38));
    [[-306, -44, 0x2a8a4a], [-334, -44, 0xd9a522], [-306, -16, 0xb8902a], [-334, -16, 0x9c2a2a]]
      .forEach(([x, z, c]) => add(criaBandeira(x, z, c)));
    [[-312, -30], [-328, -30], [-300, -50], [-300, -10], [-352, -38], [-352, 2]]
      .forEach(([x, z]) => add(criaPoste(x, z)));

    // === O PÂNTANO ABRAÇA A CIDADE (identidade de Venore) ===
    add(criaPantano(-262, 34));
    [[-368, 42], [-282, 40], [-398, -92], [-408, 10]].forEach(([x, z]) => add(criaSalgueiro(x, z)));
    [[-396, 30], [-254, -88], [-410, -60]].forEach(([x, z]) => add(criaArvoreMorta(x, z)));
    [[-372, 34], [-290, 44], [-404, -36], [-398, -78], [-260, 22]].forEach(([x, z]) => add(criaJunco(x, z)));

    // ====== RV4.1 — VENORE IMPONENTE (a capital cresce de verdade) ======
    // PORTÃO MONUMENTAL na entrada da estrada (2 torres + arco passável)
    {
      const pedraPort = mat(0xb9a486, 1);
      [[-240, -39.5], [-240, -20.5]].forEach(([tx, tz]) => {
        const torre = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 13, 10), pedraPort);
        torre.position.set(tx, 6.5, tz); torre.castShadow = torre.receiveShadow = true; scene.add(torre);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.8, 4.2, 10), mat(0x2f8d80, 1));
        cone.position.set(tx, 15.1, tz); cone.castShadow = true; scene.add(cone);
        obstaculos.push({ minX: tx - 2.2, maxX: tx + 2.2, minZ: tz - 2.2, maxZ: tz + 2.2 });
      });
      const arcoP = new THREE.Mesh(new THREE.BoxGeometry(3, 3.4, 17), pedraPort);
      arcoP.position.set(-240, 9.2, -30); arcoP.castShadow = true; scene.add(arcoP); // passa POR BAIXO
      add(criaBandeira(-244, -42, 0xd9a522)); add(criaBandeira(-244, -18, 0x9c2a2a));
    }

    // === DISTRITO NORTE: Largo das Guildas + Catedral + casario ===
    const largoG = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 16), pisoMat);
    largoG.position.set(-320, 0.03, 18); largoG.receiveShadow = true; scene.add(largoG);
    add(criaEstatua(-326, 18)); // herói fundador no Largo
    add(criaPredio({ x: -320, z: 36, larg: 16, prof: 13, alt: 12, cor: 0xcab98e, corTelhado: 0x6a4a6a, rot: Math.PI })); // SALÃO DAS GUILDAS
    add(criaPlaca(-312, 27, 'Salão das Guildas', Math.PI));
    add(criaMarco('igreja', { x: -390, z: 16, rot: Math.PI / 2 })); // CATEDRAL DE VENORE (campanário + sino)
    add(criaPlaca(-380, 8, 'Catedral de Venore', Math.PI / 2));
    { // CRIPTA atrás da Catedral (RV4.4): arco de pedra + boca de descida
      const pedraCr = mat(0x6f675c, 1);
      const boca = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.25, 2.6), mat(0x14110c, 1));
      boca.position.set(-398, 0.13, 33); scene.add(boca); // alçapão escuro
      [[-399.6, 0], [-396.4, 0]].forEach(([px]) => {
        const pilarCr = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.6, 0.6), pedraCr);
        pilarCr.position.set(px, 1.3, 31.4); pilarCr.castShadow = true; scene.add(pilarCr);
      });
      const vergaCr = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.7), pedraCr);
      vergaCr.position.set(-398, 2.9, 31.4); vergaCr.castShadow = true; scene.add(vergaCr);
      add(criaPlaca(-394, 30, 'Catacumbas — desça se ousar', Math.PI / 2));
    }
    [[-340, 24], [-340, 52], [-300, 46], [-264, 56], [-376, 40], [-376, 64], [-396, 46]]
      .forEach(([x, z]) => add(criaPredio({
        x, z, larg: rnd(10, 14), prof: rnd(9, 12), alt: rnd(8, 12),
        cor: pick(cores), corTelhado: pick(telhados), rot: snap(Math.atan2(-(x - CVX), -(z - 18))),
      })));
    add(criaCasaInterior(-296, 64, { frente: 'sul', cor: 0xd8c4a0, corTelhado: 0x4a5666 }));
    add(criaCasaInterior(-272, 28, { frente: 'oeste', cor: 0xcaa890, corTelhado: 0x6a4a6a })); // RV5.4
    [[-330, 10], [-310, 26], [-352, 64], [-300, 64]].forEach(([x, z]) => add(criaPoste(x, z)));
    [[-308, 12, 0x2a5a9c], [-332, 26, 0x2a8a4a]].forEach(([x, z, c]) => add(criaBandeira(x, z, c)));

    // === BAIRRO DOS ARMAZÉNS (porto que trabalha) ===
    [[-300, -76], [-284, -76], [-302, -104]].forEach(([x, z], i) => add(criaPredio({
      x, z, larg: 13, prof: 9, alt: 6, cor: [0xb0a890, 0xa89a84, 0x9a9282][i % 3], corTelhado: 0x55636f,
      rot: snap(Math.atan2(-(x + 330), -(z + 92))), janelas: false,
    })));
    add(criaCais(-342, -88, 10)); // segundo cais (o porto cresceu)
    [[-300, -88], [-286, -98]].forEach(([x, z]) => { add(criaBarril(x, z)); add(criaCaixa(x + 1.4, z + 0.4)); });
    add(criaCarroca(-294, -90, 0.4));
    add(criaPlaca(-292, -70, 'Bairro dos Armazéns', -Math.PI / 2));
    [[-310, -84], [-290, -106]].forEach(([x, z]) => add(criaPoste(x, z)));

    // === PASSARELA ELEVADA sobre o brejo (calçadão sul, com lampiões) ===
    {
      const tabuaMat = new THREE.MeshStandardMaterial({ color: 0x7a5a36, roughness: 1 });
      aplicaTexturaReal(tabuaMat, 'madeira', 1, 14);
      const passarela = new THREE.Mesh(new THREE.BoxGeometry(3, 0.14, 44), tabuaMat);
      passarela.position.set(-272, 0.08, -120); passarela.receiveShadow = true; scene.add(passarela);
      for (let pz = -104; pz >= -136; pz -= 8) { // estacas fincadas no brejo
        [-1.8, 1.8].forEach((ox) => {
          const estaca = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.4, 6), tabuaMat);
          estaca.position.set(-272 + ox, 0.2, pz); scene.add(estaca);
        });
      }
      add(criaPoste(-274.5, -112)); add(criaPoste(-269.5, -130));
    }

    // === BREJO PROFUNDO (sul da cidade — covil de perigo de verdade) ===
    add(criaLago(-262, -124, 9));
    add(criaLago(-296, -134, 8));
    add(criaPantano(-282, -126));
    [[-252, -116], [-306, -126], [-270, -142], [-290, -114]].forEach(([x, z]) => add(criaArvoreMorta(x, z)));
    [[-258, -130], [-300, -118], [-276, -136], [-264, -112], [-292, -142]].forEach(([x, z]) => add(criaJunco(x, z)));
    add(criaSalgueiro(-248, -136));
    add(criaPlaca(-276, -106, 'Brejo Profundo — PERIGO', Math.PI));

    // ====== RV4.5 — ACABAMENTO URBANO (Patch 1) ======
    add(criaFonte(-320, -30)); // chafariz do Grande Mercado (água viva e gotas na praça)
    // ruas secundárias pavimentadas ligando os distritos
    const ruaN = new THREE.Mesh(new THREE.BoxGeometry(96, 0.1, 6), matRua(18, 1.2));
    ruaN.position.set(-352, 0.02, 18); ruaN.receiveShadow = true; scene.add(ruaN); // Largo ↔ Catedral
    detalhaRua(-352, 18, 96, 6);
    const ruaA = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 66), matRua(1.2, 12));
    ruaA.position.set(-292, 0.02, -67); ruaA.receiveShadow = true; scene.add(ruaA); // rua dos Armazéns
    detalhaRua(-292, -67, 6, 66);
    // placas com NOME DE RUA (a capital se orienta)
    add(criaPlaca(-344, -26, 'Rua do Canal'));
    add(criaPlaca(-336, 14, 'Travessa das Guildas', Math.PI));
    add(criaPlaca(-296, -60, 'Beco dos Armazéns', Math.PI / 2));
    add(criaPlaca(-372, 13, 'Rua da Catedral', -Math.PI / 2));
    // BARCAÇAS ancoradas no canal (vida de cidade mercante)
    [[-352, -16, 0.15], [-352, 32, -0.2]].forEach(([bxx, bzz, rotB]) => {
      const barca = new THREE.Group(); barca.position.set(bxx, 0.12, bzz); barca.rotation.y = rotB;
      const casco = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 6.4), mat(0x6e4a2a, 1));
      casco.position.y = 0.25; casco.castShadow = true; barca.add(casco);
      const borda = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.18, 6.8), mat(0x5a3a22, 1));
      borda.position.y = 0.55; barca.add(borda);
      const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.4, 6), mat(0x4a3a2a, 1));
      mastro.position.y = 2.2; barca.add(mastro);
      const carga = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.4), mat(0x8a6a44, 1));
      carga.position.set(0, 0.9, -1.6); barca.add(carga);
      scene.add(barca);
    });
  }

  // ============================================================
  //  NOCTARIA + ERMO DAS CINZAS (RV6.0)
  //  Cidade-fortaleza sombria a oeste de Venore, com uma região inteira
  //  de progressão alta culminando no Santuário da Lua Partida.
  // ============================================================
  add(criaEstrada(-552, -424, -30, 8)); // prolonga a rota oeste de Venore
  add(criaEstrada(-742, -690, -30, 7)); // trilha final até a Fenda
  add(criaPlaca(-430, -23, 'NOCTARIA <-', Math.PI));
  add(criaPlaca(-552, -22, 'Noctaria - perigo'));
  add(criaMarcoDistancia(-506, -38, 'NOCTARIA 110\nVENORE 80'));
  add(criaMarcoDistancia(-650, -20, 'FENDA 90\nVENORE 230'));
  {
    const NX = -620, NZ = -30;
    const cinzaMat = new THREE.MeshStandardMaterial({ color: 0x343238, roughness: 1 });
    aplicaTexturaReal(cinzaMat, 'terra', 22, 14);
    const calcadaNoite = new THREE.MeshStandardMaterial({ color: 0x4d4650, roughness: 1, map: texturaPedra(5) });
    const pedraEscura = mat(0x2a2730, 1);
    const pedraClara = mat(0x58505a, 1);
    const brasaMat = new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0xff2600, emissiveIntensity: 0.75, roughness: 0.6 });

    const cidadeChao = new THREE.Mesh(new THREE.BoxGeometry(142, 0.08, 106), cinzaMat);
    cidadeChao.position.set(NX, 0.035, NZ - 3); cidadeChao.receiveShadow = true; scene.add(cidadeChao);
    const ruaNoctH = new THREE.Mesh(new THREE.BoxGeometry(126, 0.1, 7.2), matRua(24, 1.2));
    ruaNoctH.position.set(NX, 0.08, NZ); ruaNoctH.receiveShadow = true; scene.add(ruaNoctH);
    detalhaRua(NX, NZ, 126, 7.2, 0.155);
    const ruaNoctV = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.1, 78), matRua(1.2, 15));
    ruaNoctV.position.set(NX, 0.08, NZ - 5); ruaNoctV.receiveShadow = true; scene.add(ruaNoctV);
    detalhaRua(NX, NZ - 5, 7.2, 78, 0.155);
    const pracaNoct = new THREE.Mesh(new THREE.BoxGeometry(30, 0.12, 24), calcadaNoite);
    pracaNoct.position.set(NX, 0.1, NZ - 4); pracaNoct.receiveShadow = true; scene.add(pracaNoct);

    function muroNoct(x, z, w, d) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 5.8, d), pedraEscura);
      m.position.set(x, 2.9, z); m.castShadow = m.receiveShadow = true; scene.add(m); solidos.push(m);
      obstaculos.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
    }
    function torreNoct(x, z) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 11, 8), pedraEscura);
      t.position.set(x, 5.5, z); t.castShadow = t.receiveShadow = true; scene.add(t); solidos.push(t);
      const c = new THREE.Mesh(new THREE.ConeGeometry(4.1, 4.5, 8), mat(0x1b1720, 1));
      c.position.set(x, 13.2, z); c.castShadow = true; scene.add(c); solidos.push(c);
      obstaculos.push({ minX: x - 3.4, maxX: x + 3.4, minZ: z - 3.4, maxZ: z + 3.4 });
    }
    muroNoct(NX, 23, 140, 4);
    muroNoct(NX, -83, 140, 4);
    muroNoct(-690, -58, 4, 46); muroNoct(-690, -2, 4, 46);
    muroNoct(-550, -58, 4, 46); muroNoct(-550, -2, 4, 46);
    [[-690, 23], [-550, 23], [-690, -83], [-550, -83]].forEach(([x, z]) => torreNoct(x, z));
    add(criaPlaca(-548, -20, 'NOCTARIA', -Math.PI / 2));
  add(criaPlaca(-692, -20, 'SANTUÁRIO DA LUA PARTIDA  ⟶', Math.PI / 2)); // RV8.3: placa direcional (o santuário fica adiante, em -742)

    const ob = new THREE.Group(); ob.position.set(NX, 0, NZ - 4);
    const baseOb = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 0.8, 8), pedraClara);
    baseOb.position.y = 0.4; ob.add(baseOb);
    const corpoOb = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.15, 8.4, 5), pedraEscura);
    corpoOb.position.y = 4.8; corpoOb.castShadow = true; ob.add(corpoOb);
    const pontaOb = new THREE.Mesh(new THREE.OctahedronGeometry(1.25, 0),
      new THREE.MeshStandardMaterial({ color: 0x9bd1ff, emissive: 0x244a82, emissiveIntensity: 0.5, roughness: 0.35 }));
    pontaOb.position.y = 9.5; ob.add(pontaOb);
    scene.add(ob); solidos.push(ob);
    obstaculos.push({ minX: NX - 2.5, maxX: NX + 2.5, minZ: NZ - 6.5, maxZ: NZ - 1.5 });
    interativos.push({
      x: NX, z: NZ - 4, raio: 4.2,
      titulo: 'Obelisco da Vigília',
      acao: 'Ler as runas da Noite',
      msg: 'As runas falam dos Drakari: uma raça antiga que trocou sangue por obsidiana e guarda a Fenda para acordar seu Arconte.',
    });

    add(criaCasaInterior(-662, -58, { frente: 'leste', cor: 0x70666a, corTelhado: 0x25202a }));
    add(criaCasaInterior(-662, 0, { frente: 'leste', cor: 0x625b62, corTelhado: 0x1d1a22 }));
    add(criaCasaInterior(-586, -52, { frente: 'oeste', cor: 0x6a625c, corTelhado: 0x2a2422, forja: true }));
    add(criaCasaInterior(-586, -8, { frente: 'oeste', cor: 0x72685c, corTelhado: 0x2d2a1e, loja: true }));
    add(criaPredio({ x: -620, z: 8, larg: 20, prof: 12, alt: 10, cor: 0x5a5360, corTelhado: 0x1d1722, rot: Math.PI }));
    add(criaPlaca(-608, 0, 'Casa da Vigília', Math.PI));
    add(criaPredio({ x: -620, z: -64, larg: 18, prof: 11, alt: 8, cor: 0x4f4a42, corTelhado: 0x201b18, rot: 0 }));
    add(criaPlaca(-610, -56, 'Alojamento dos Guardas', 0));
    [[-640, -18], [-600, -18], [-640, -44], [-600, -44], [-674, -30], [-566, -30], [-620, 14]]
      .forEach(([x, z]) => add(criaPoste(x, z)));
    [[-635, -12, 0x5a2a8a], [-605, -12, 0x8a2a1a], [-635, -50, 0x222a5a], [-605, -50, 0x8a6a2a]]
      .forEach(([x, z, c]) => add(criaBandeira(x, z, c)));
    add(criaFogueira(-642, -64));
    add(criaBarraca(-646, -68, -0.4, 0x3a303a));
    add(criaBarril(-580, -18)); add(criaCaixa(-578, -14)); add(criaPoco(-606, -64));

    [[-496, -56, 24], [-570, -76, 30], [-700, -62, 26], [-730, 4, 30], [-760, -58, 24]]
      .forEach(([mx, mz, r]) => {
        const mancha = new THREE.Mesh(new THREE.CircleGeometry(r, 18),
          new THREE.MeshStandardMaterial({ color: 0x211f22, transparent: true, opacity: 0.34, roughness: 1, depthWrite: false }));
        mancha.rotation.x = -Math.PI / 2; mancha.position.set(mx, 0.11, mz); scene.add(mancha);
      });
    [[-522, -52], [-548, -64], [-574, -78], [-700, -8], [-716, -60], [-744, -68], [-768, -20],
     [-506, -10], [-610, -92], [-660, 18], [-726, 14], [-784, -46]]
      .forEach(([x, z]) => add(criaArvoreMorta(x, z)));
    [[-535, -44, 1.1], [-610, -74, 1.4], [-686, -50, 1.2], [-720, 10, 1.3], [-770, -62, 1.5], [-742, -8, 1.1]]
      .forEach(([x, z, s]) => pedr(x, z, s));
    add(criaRuinas(-706, -54));
    add(criaRuinas(-736, 8));
    add(criaCranioDragao(-710, -14));

    const sant = new THREE.Group(); sant.position.set(-742, 0, -30);
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(35, 37, 0.45, 28), pedraEscura);
    disco.position.y = 0.22; disco.receiveShadow = true; sant.add(disco);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 8 + (i % 2) * 2.2, 6), pedraClara);
      pilar.position.set(Math.cos(a) * 25, 4.2 + (i % 2) * 1.1, Math.sin(a) * 25);
      pilar.rotation.z = Math.sin(a) * 0.08; pilar.castShadow = true; sant.add(pilar);
      obstaculos.push({ minX: -742 + pilar.position.x - 1.1, maxX: -742 + pilar.position.x + 1.1,
        minZ: -30 + pilar.position.z - 1.1, maxZ: -30 + pilar.position.z + 1.1 });
    }
    const fenda = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.55, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x1b1018, emissive: 0x7a1f2a, emissiveIntensity: 0.65, roughness: 0.7 }));
    fenda.rotation.x = -Math.PI / 2; fenda.position.y = 0.68; sant.add(fenda);
    [[-5, -2], [5, 3], [0, 6]].forEach(([ox, oz], i) => {
      const br = new THREE.Mesh(new THREE.CircleGeometry(1.8 + i * 0.45, 14), brasaMat);
      br.rotation.x = -Math.PI / 2; br.position.set(ox, 0.72, oz); sant.add(br);
    });
    scene.add(sant); solidos.push(sant);
    interativos.push({
      x: -742, z: -30, raio: 8,
      titulo: 'Santuário da Lua Partida',
      acao: 'Examinar o selo',
      msg: 'O selo pulsa em vermelho. Sem a sequência da Vigília, este lugar só oferece morte: Drakari, fogo negro e um Arconte ainda preso.',
    });
    add(criaPlaca(-742, -72, 'Santuário da Lua Partida - nível alto', 0));
  }

  // MOITAS espalhadas pelo campo (refs premium: sub-bosque denso) — sem
  // colisor (atravessável, estilo capim alto do Tibia), 2 draw calls
  VEG.moitas = [];
  for (let tent = 0; tent < 12000 && VEG.moitas.length < 120; tent++) {
    const px = randX(), pz = randZ();
    if (bloqueiaVegetacao(px, pz)) continue;
    VEG.moitas.push([px, pz, 0.8 + Math.random() * 0.9]);
  }
  // CAPIM 3D (RV4.0): tufos SÓLIDOS misturados aos cartazes de mato —
  // profundidade real no chão do mundo inteiro (3 draw calls)
  VEG.capim = [];
  for (let tent = 0; tent < 20000 && VEG.capim.length < 260; tent++) {
    const px = randX(), pz = randZ();
    if (bloqueiaVegetacao(px, pz)) continue;
    VEG.capim.push([px, pz, 0.8 + Math.random() * 1.0]);
  }
  // FLORES 3D + SEIXOS soltos (RV5.4): o campo deixa de ser papel de parede —
  // flores de pétalas de verdade e pedrinhas espalhadas (instanciado, ~6 draw calls)
  VEG.flores = []; VEG.seixos = [];
  for (let tent = 0; tent < 24000 && VEG.flores.length < 260; tent++) {
    const px = randX(), pz = randZ();
    if (bloqueiaVegetacao(px, pz)) continue;
    VEG.flores.push([px, pz, 0.85 + Math.random() * 0.7]);
  }
  for (let tent = 0; tent < 18000 && VEG.seixos.length < 170; tent++) {
    const px = randX(), pz = randZ();
    if (bloqueiaVegetacao(px, pz)) continue;
    VEG.seixos.push([px, pz, 0.2 + Math.random() * 0.18]);
  }
  // MICROTERRENO (RV6.6): folhas, raízes, manchas de terra e capim baixo
  // tiram o chão da dependência de textura repetida. Continua instanciado.
  VEG.folhasChao = []; VEG.terraChao = []; VEG.raizesChao = []; VEG.capimRasteiro = [];
  const emFloresta = (x, z) => (x > -175 && x < -38 && z > 16 && z < 155)
    || (x > 36 && x < 175 && z > 126 && z < 270)
    || (x > -185 && x < -72 && z > -116 && z < -36);
  const emCampoAberto = (x, z) => !bloqueiaVegetacao(x, z) && z > -170 && z < 300 && x > -210 && x < 520;
  const emPantano = (x, z) => (x > -360 && x < -238 && z > -146 && z < -82)
    || (x > -118 && x < -58 && z > -128 && z < -44)
    || (x > -118 && x < -82 && z > 52 && z < 92)
    || (x > 82 && x < 122 && z > 76 && z < 116);
  for (let tent = 0; tent < 16000 && VEG.folhasChao.length < 360; tent++) {
    const px = randX(), pz = randZ();
    if (bloqueiaVegetacao(px, pz) || !emFloresta(px, pz)) continue;
    VEG.folhasChao.push([px, pz, 0.65 + Math.random() * 0.85]);
  }
  VEG.arvores.forEach(([ax, az], i) => {
    if (i % 2) return;
    const a = Math.random() * Math.PI * 2, rr = 0.65 + Math.random() * 0.85;
    const rx = ax + Math.cos(a) * rr, rz = az + Math.sin(a) * rr;
    if (!bloqueiaVegetacao(rx, rz)) VEG.raizesChao.push([rx, rz, 0.75 + Math.random() * 0.45]);
  });
  const zonasTerra = [
    [236, 38, 36, 22], [392, -60, 42, 26], [146, 246, 34, 28], [-184, -86, 34, 28],
    [380, 16, 34, 22], [470, -14, 28, 20], [-520, -28, 58, 24], [-720, -38, 54, 28],
    [120, 42, 46, 34], [315, 48, 58, 34], [-110, 92, 44, 32],
  ];
  for (let tent = 0; tent < 14000 && VEG.terraChao.length < 280; tent++) {
    const zt = zonasTerra[Math.floor(Math.random() * zonasTerra.length)];
    const px = zt[0] + (Math.random() - 0.5) * zt[2] * 2;
    const pz = zt[1] + (Math.random() - 0.5) * zt[3] * 2;
    if (bloqueiaVegetacao(px, pz)) continue;
    VEG.terraChao.push([px, pz, 0.55 + Math.random() * 0.8]);
  }
  for (let tent = 0; tent < 26000 && VEG.capimRasteiro.length < 760; tent++) {
    const px = randX(), pz = randZ();
    if (!emCampoAberto(px, pz)) continue;
    VEG.capimRasteiro.push([px, pz, 0.7 + Math.random() * 0.9]);
  }
  // RV6.9: volume por bioma. Mais silhueta e profundidade sem colisao:
  // samambaias no sub-bosque, capim alto no campo e flores no pantano.
  VEG.samambaias = []; VEG.capimAlto = []; VEG.floresPantano = []; VEG.arbustosAltos = [];
  for (let tent = 0; tent < 22000 && VEG.samambaias.length < 240; tent++) {
    const px = randX(), pz = randZ();
    if (bloqueiaVegetacao(px, pz) || !emFloresta(px, pz)) continue;
    VEG.samambaias.push([px, pz, 0.75 + Math.random() * 0.95]);
  }
  VEG.arvores.forEach(([ax, az], i) => {
    if (i % 3) return;
    const a = Math.random() * Math.PI * 2, rr = 2.4 + Math.random() * 2.6;
    const bx = ax + Math.cos(a) * rr, bz = az + Math.sin(a) * rr;
    if (!bloqueiaVegetacao(bx, bz)) VEG.arbustosAltos.push([bx, bz, 0.75 + Math.random() * 0.75]);
  });
  for (let tent = 0; tent < 30000 && VEG.capimAlto.length < 340; tent++) {
    const px = randX(), pz = randZ();
    if (!emCampoAberto(px, pz) || emFloresta(px, pz) || emPantano(px, pz)) continue;
    if (Math.random() < 0.35 && Math.abs(pz) < 24 && px > 60 && px < 520) continue;
    VEG.capimAlto.push([px, pz, 0.65 + Math.random() * 0.9]);
  }
  [[-95, -55, 16], [100, 95, 18], [-105, 70, 14], [-75, -110, 15], [45, 80, 15], [-330, -92, 14], [-262, -124, 9], [-296, -134, 8]]
    .forEach(([lx, lz, lr]) => {
      const n = Math.round(lr * 0.62);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.55;
        const rr = lr + 0.8 + Math.random() * 3.2;
        const fx = lx + Math.cos(a) * rr, fz = lz + Math.sin(a) * rr;
        if (!bloqueiaVegetacao(fx, fz)) VEG.floresPantano.push([fx, fz, 0.7 + Math.random() * 0.55]);
      }
    });
  for (let tent = 0; tent < 9000 && VEG.floresPantano.length < 170; tent++) {
    const px = -326 + (Math.random() - 0.5) * 120;
    const pz = -118 + (Math.random() - 0.5) * 70;
    if (bloqueiaVegetacao(px, pz) || !emPantano(px, pz)) continue;
    VEG.floresPantano.push([px, pz, 0.65 + Math.random() * 0.75]);
  }
  // BIOMAS (RV5.6): juncos abraçam TODA água, cogumelos nascem no pé das
  // árvores da floresta, e a fazenda ganha um CAMPO DE TRIGO de verdade
  VEG.juncos = []; VEG.cogus = []; VEG.trigo = [];
  // anéis de junco em volta de cada lago do mundo
  [[-95, -55, 16], [100, 95, 18], [-105, 70, 14], [-75, -110, 15], [45, 80, 15], [-330, -92, 14], [-262, -124, 9], [-296, -134, 8]]
    .forEach(([lx, lz, lr]) => {
      const n = Math.round(lr * 1.1);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
        const rr = lr + 1.5 + Math.random() * 2.5;
        VEG.juncos.push([lx + Math.cos(a) * rr, lz + Math.sin(a) * rr, 0.8 + Math.random() * 0.7]);
      }
    });
  // margens do Rio Fundo (com o vão livre da Ponte de Pedra)
  for (let jz = -126; jz <= 66; jz += 5.5) {
    if (Math.abs(jz) < 9) continue;
    if (Math.random() < 0.7) VEG.juncos.push([176 - Math.random() * 1.5, jz + (Math.random() - 0.5) * 2, 0.8 + Math.random() * 0.6]);
    if (Math.random() < 0.7) VEG.juncos.push([184 + Math.random() * 1.5, jz + (Math.random() - 0.5) * 2, 0.8 + Math.random() * 0.6]);
  }
  // cogumelos no pé de ~35% das árvores grandes (a floresta tem chão vivo)
  VEG.arvores.forEach(([ax, az]) => {
    if (Math.random() > 0.35) return;
    const a = Math.random() * Math.PI * 2, rr = 1.8 + Math.random() * 1.4;
    VEG.cogus.push([ax + Math.cos(a) * rr, az + Math.sin(a) * rr, 0.8 + Math.random() * 0.8]);
  });
  // campo de trigo da fazenda (grade com jitter; longe do poço)
  for (let tx = 86; tx <= 100; tx += 1.7) {
    for (let tz = 44; tz <= 58; tz += 1.7) {
      if (Math.hypot(tx - 93, tz - 52) < 3.5) continue; // respiro do poço
      VEG.trigo.push([tx + (Math.random() - 0.5) * 0.9, tz + (Math.random() - 0.5) * 0.9, 0.85 + Math.random() * 0.4]);
    }
  }
  // VEGETAÇÃO INSTANCIADA entra em cena (florestas todas em ~31 draw calls;
  // slots GLB arvore1/pinheiro/pedra trocam o visual da espécie inteira)
  add(criaVegetacaoInstanciada(VEG, alturaColinas));

  // nuvens — CLARAS de verdade (emissivas suaves): viravam blobs cinza-escuros
  // porque dependiam 100% da luz da cena (feio nos prints do maestro)
  const nuvemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf2f5fa, emissiveIntensity: 0.42, roughness: 1, transparent: true, opacity: 0.88 });
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

  return { scene, sun, hemi, skyMat, ceu, lua, luaLuz, luaMat, estrelas, vagalumes, obstaculos, solidos, aguas, postes, nuvens, fonteGotas, ruas, marcos, animados, interativos, casas, lagos, montanhaDragao: MD };
}

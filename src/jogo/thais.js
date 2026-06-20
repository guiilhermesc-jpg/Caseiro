// =============================================================
//  THAIS  ·  cidade distante ENTRÁVEL, a leste pelo Caminho de Thais.
//  Muralha de arenito com ameias e torres + PORTÃO passável (passa por
//  baixo do arco) + praça interna + TEMPLO + prédios e adornos.
//  Arquitetura mediterrânea (pedra clara, telhados terracota/turquesa),
//  distinta de Venore. Fonte, casas entráveis e NPCs são colocados à
//  parte (cidade.js / npcs.js). Devolve { grupo, colisores }.
//
//  18ª RODADA — GEOMETRIA MESCLADA POR MATERIAL: a cidade inteira
//  (muralha+ameias+torres+templo+~30 prédios) era ~300 meshes e
//  ENGASGAVA o teleporte GM→Thais na 1ª renderização; agora cada
//  material vira UM ÚNICO mesh (~12 draw calls). Colisores idênticos.
// =============================================================
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, matParede, texturaPedra, VIDRO, aplicaTexturaReal } from './construcoes.js';

export function criaThais(cx, cz, opts = {}) {
  const { HX = 60, HZ = 54, ALT = 9, ESP = 2, gw = 10 } = opts; // Thais maior e com portão/ruas folgados
  const g = new THREE.Group(); g.position.set(cx, 0, cz);
  const colisores = [];
  // colisor em coords do MUNDO (o grupo está transladado p/ cx,cz)
  const col = (lx, lz, w, d) => colisores.push({ minX: cx + lx - w / 2, maxX: cx + lx + w / 2, minZ: cz + lz - d / 2, maxZ: cz + lz + d / 2 });

  // BALDE DE GEOMETRIA: acumula caixas/cilindros por material e mescla no fim
  const baldes = new Map(); // material -> [geometrias já posicionadas]
  const addG = (geo, material, lx, ly, lz, rotY = 0) => {
    if (rotY) geo.rotateY(rotY);
    geo.translate(lx, ly, lz);
    let lista = baldes.get(material);
    if (!lista) baldes.set(material, lista = []);
    lista.push(geo);
  };

  // muralha com textura REAL de blocos de castelo (gerada por IA)
  const pedra = new THREE.MeshStandardMaterial({ color: 0xcfc09a, roughness: 1 });
  aplicaTexturaReal(pedra, 'muralha', 6, 1.6, true);
  const pedraEsc = mat(0xa9966f, 1), pedraClara = mat(0xe0d3b0, 1);
  const telha = mat(0xc0653a, 1), telhaT = mat(0x2f8d80, 1), madeira = mat(0x6e4a2a);

  // piso de pedra calçada (dentro das muralhas) — textura REAL quando carregar
  const pisoMatT = new THREE.MeshStandardMaterial({ map: texturaPedra(11), roughness: 1 });
  aplicaTexturaReal(pisoMatT, 'pedra', 14, 12);
  const piso = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 - 2, 0.12, HZ * 2 - 2), pisoMatT);
  piso.position.y = 0.06; piso.receiveShadow = true; g.add(piso);

  // --- MURALHA com ameias ---
  function ameias(lx, lz, comp, eixo) {
    const n = Math.max(1, Math.floor(comp / 4.2)); // metade das ameias (peso 50% menor, mesma silhueta)
    for (let i = 0; i < n; i++) {
      const t = -comp / 2 + comp / n / 2 + i * (comp / n);
      addG(new THREE.BoxGeometry(eixo === 'x' ? 1.2 : ESP + 0.3, 1.3, eixo === 'x' ? ESP + 0.3 : 1.2), pedraClara,
        lx + (eixo === 'x' ? t : 0), ALT + 0.65, lz + (eixo === 'x' ? 0 : t));
    }
  }
  function muro(lx, lz, w, d) {
    addG(new THREE.BoxGeometry(w, ALT, d), pedra, lx, ALT / 2, lz);
    col(lx, lz, w, d);
    ameias(lx, lz, w > d ? w : d, w > d ? 'x' : 'z');
  }
  muro(0, HZ, HX * 2, ESP);    // norte
  // SUL: 2 segmentos deixando o PORTÃO DO DESERTO no meio (RV10.7 — saída
  // para As Areias do Veio Seco). Espelha o portão oeste.
  const segXsul = (HX * 2 - gw) / 2;
  muro(-(gw / 2 + segXsul / 2), -HZ, segXsul, ESP);
  muro((gw / 2 + segXsul / 2), -HZ, segXsul, ESP);
  addG(new THREE.BoxGeometry(gw, ALT - 5, ESP + 0.5), pedraEsc, 0, ALT - (ALT - 5) / 2, -HZ); // arco (sem colisor)
  muro(HX, 0, ESP, HZ * 2);    // leste
  const segZ = (HZ * 2 - gw) / 2;     // oeste em 2 segmentos (vão = portão)
  muro(-HX, -(gw / 2 + segZ / 2), ESP, segZ);
  muro(-HX, (gw / 2 + segZ / 2), ESP, segZ);

  // arco do portão (passa por baixo — SEM colisor) + placa "THAIS"
  addG(new THREE.BoxGeometry(ESP + 0.5, ALT - 5, gw), pedraEsc, -HX, ALT - (ALT - 5) / 2, 0);
  const cnv = document.createElement('canvas'); cnv.width = 256; cnv.height = 80;
  const cc = cnv.getContext('2d');
  cc.fillStyle = '#7a5a32'; cc.fillRect(0, 0, 256, 80);
  cc.fillStyle = '#f0e8d0'; cc.font = 'bold 46px Arial'; cc.textAlign = 'center'; cc.textBaseline = 'middle';
  cc.fillText('THAIS', 128, 44);
  const placa = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.3, 4.4),
    new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnv), roughness: 0.9 }));
  placa.position.set(-HX - 0.25, ALT + 0.8, 0); g.add(placa);

  // TORRES (quinas + flanqueando o portão)
  function torre(lx, lz, r, h) {
    addG(new THREE.CylinderGeometry(r, r + 0.25, h, 12), pedra, lx, h / 2, lz);
    addG(new THREE.ConeGeometry(r + 0.6, h * 0.45, 12), telhaT, lx, h + h * 0.225, lz);
    col(lx, lz, r * 1.7, r * 1.7);
  }
  [[-HX, -HZ], [HX, -HZ], [-HX, HZ], [HX, HZ]].forEach(([tx, tz]) => torre(tx, tz, 2.6, ALT + 4));
  [-(gw / 2 + 1.8), gw / 2 + 1.8].forEach((tz) => torre(-HX, tz, 1.8, ALT + 5));

  // --- TEMPLO (marco de Thais, ao norte; fachada vira pra praça) ---
  // (peças locais ao templo: deslocadas pra lz=19 dentro do grupo)
  const TZ = 19;
  addG(new THREE.BoxGeometry(20, 1.2, 13), pedraClara, 0, 0.6, TZ);
  // Só o corpo do templo bloqueia; a plataforma/escadaria é piso caminhável.
  col(0, 20, 15, 10);
  [0, 1, 2].forEach((i) => { // escadaria na frente (sul)
    addG(new THREE.BoxGeometry(14 - i * 1.2, 0.4, 1.0), pedraClara, 0, 0.2 + i * 0.4, TZ - 6.5 - i * 0.9);
  });
  addG(new THREE.BoxGeometry(15, 8, 10), pedra, 0, 5.2, TZ + 1);
  for (let i = -3; i <= 3; i++) { // colunata frontal
    addG(new THREE.CylinderGeometry(0.5, 0.55, 7.4, 12), pedraClara, i * 2.3, 4.5, TZ - 5.4);
  }
  addG(new THREE.BoxGeometry(16, 1.4, 1.8), pedraClara, 0, 8.5, TZ - 5.4); // entablamento
  const teto = new THREE.ConeGeometry(12.5, 6, 4); teto.rotateY(Math.PI / 4); // telhado piramidal
  addG(teto, telha, 0, 11.5, TZ + 1);
  const pina = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.7, roughness: 0.3 }));
  pina.position.set(0, 14.8, TZ + 1); g.add(pina); // pináculo dourado

  // --- PRÉDIOS (fachada vira pro miolo; eixo 'x' p/ colunas leste/oeste) ---
  function predio(lx, lz, w, d, h, cor, corT, eixo = 'z') {
    addG(new THREE.BoxGeometry(w, h, d), matParede(cor), lx, h / 2, lz); // reboco (RV4.5)
    const tel = new THREE.ConeGeometry(Math.max(w, d) * 0.72, h * 0.5 + 1.4, 4); tel.rotateY(Math.PI / 4);
    addG(tel, mat(corT, 1), lx, h + (h * 0.5 + 1.4) / 2 - 0.1, lz);
    if (eixo === 'z') {
      const faceZ = lz >= 0 ? -1 : 1; // porta/janelas viram pro centro
      addG(new THREE.BoxGeometry(1.4, 2.8, 0.2), madeira, lx, 1.4, lz + faceZ * (d / 2 + 0.02));
      [-w * 0.28, w * 0.28].forEach((jx) => {
        addG(new THREE.BoxGeometry(1.1, 1.1, 0.08), VIDRO, lx + jx, h * 0.62, lz + faceZ * (d / 2 + 0.05));
      });
    } else {
      const faceX = lx >= 0 ? -1 : 1;
      addG(new THREE.BoxGeometry(0.2, 2.8, 1.4), madeira, lx + faceX * (w / 2 + 0.02), 1.4, lz);
      [-d * 0.28, d * 0.28].forEach((jz) => {
        addG(new THREE.BoxGeometry(0.08, 1.1, 1.1), VIDRO, lx + faceX * (w / 2 + 0.05), h * 0.62, lz + jz);
      });
    }
    col(lx, lz, w, d);
  }
  predio(-26, 18, 8.2, 8.2, 7, 0xd8c8a4, 0xc0653a);
  predio(26, 18, 8.2, 8.2, 8, 0xcdb892, 0x2f8d80);
  predio(-26, -20, 8.2, 8.2, 8, 0xd2c19a, 0x9a4a3a);
  predio(26, -20, 8.2, 8.2, 7, 0xcab98e, 0xc0653a);

  // CASARIO de Thais (proporção Tibia: MAIOR que Venore) — fileiras duplas
  // norte/sul, flanco oeste e coluna leste; vielas de 2.6u entre as fileiras
  const coresT = [0xd8c8a4, 0xcdb892, 0xd2c19a, 0xcab98e, 0xdccfae];
  const telhT = [0xc0653a, 0x2f8d80, 0x9a4a3a, 0xb8742a];
  let ci = 0;
  // Ruas largas e legíveis: fileiras nas bordas, centro vazado, corredor
  // principal de 12u e corredores transversais a cada 18u. O jogador nunca
  // deve "raspar" nas casas com o raio do avatar.
  for (const lz of [33, -35, 46, -48]) for (let lx = -42; lx <= 42; lx += 14) {
    if (Math.abs(lx) <= 7) { ci++; continue; } // avenida central norte-sul
    if (Math.abs(lx) === 28 && Math.abs(lz) > 40) { ci++; continue; } // respiros laterais
    predio(lx, lz, 7.2, 7.4, 6 + (ci % 3), coresT[ci % coresT.length], telhT[ci % telhT.length]); ci++;
  }
  [[-50, -18], [-50, 18]].forEach(([lx, lz]) => { predio(lx, lz, 7.4, 7.4, 7, coresT[ci % 5], telhT[ci % 4]); ci++; });
  [[50, -28], [50, -10], [50, 10], [50, 28]].forEach(([lx, lz]) => { predio(lx, lz, 7.6, 7.2, 6 + (ci % 3), coresT[ci % 5], telhT[ci % 4], 'x'); ci++; });

  // MESCLA: um único mesh por material — Thais inteira em ~12 draw calls
  baldes.forEach((geos, material) => {
    const unica = BufferGeometryUtils.mergeGeometries(geos);
    const m = new THREE.Mesh(unica, material);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  });

  return { grupo: g, colisores };
}

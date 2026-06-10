// =============================================================
//  THAIS  ·  cidade distante ENTRÁVEL, a leste pelo Caminho de Thais.
//  Muralha de arenito com ameias e torres + PORTÃO passável (passa por
//  baixo do arco) + praça interna + TEMPLO + prédios e adornos.
//  Arquitetura mediterrânea (pedra clara, telhados terracota/turquesa),
//  distinta de Venore. Fonte, casas entráveis e NPCs são colocados à
//  parte (cidade.js / npcs.js). Devolve { grupo, colisores }.
// =============================================================
import * as THREE from 'three';
import { mat } from './construcoes.js';

export function criaThais(cx, cz, opts = {}) {
  const { HX = 34, HZ = 30, ALT = 9, ESP = 2, gw = 8 } = opts;
  const g = new THREE.Group(); g.position.set(cx, 0, cz);
  const colisores = [];
  // colisor em coords do MUNDO (o grupo está transladado p/ cx,cz)
  const col = (lx, lz, w, d) => colisores.push({ minX: cx + lx - w / 2, maxX: cx + lx + w / 2, minZ: cz + lz - d / 2, maxZ: cz + lz + d / 2 });

  const pedra = mat(0xcfc09a, 1), pedraEsc = mat(0xa9966f, 1), pedraClara = mat(0xe0d3b0, 1);
  const telha = mat(0xc0653a, 1), telhaT = mat(0x2f8d80, 1), madeira = mat(0x6e4a2a);

  // piso de pedra (dentro das muralhas)
  const piso = new THREE.Mesh(new THREE.BoxGeometry(HX * 2 - 2, 0.12, HZ * 2 - 2), mat(0xbcb08f, 1));
  piso.position.y = 0.06; piso.receiveShadow = true; g.add(piso);

  // --- MURALHA com ameias ---
  function ameias(lx, lz, comp, eixo) {
    const n = Math.max(1, Math.floor(comp / 2.4));
    for (let i = 0; i < n; i++) {
      const t = -comp / 2 + comp / n / 2 + i * (comp / n);
      const a = new THREE.Mesh(new THREE.BoxGeometry(eixo === 'x' ? 1.2 : ESP + 0.3, 1.3, eixo === 'x' ? ESP + 0.3 : 1.2), pedraClara);
      a.position.set(lx + (eixo === 'x' ? t : 0), ALT + 0.65, lz + (eixo === 'x' ? 0 : t));
      g.add(a);
    }
  }
  function muro(lx, lz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, ALT, d), pedra);
    m.position.set(lx, ALT / 2, lz); m.castShadow = m.receiveShadow = true; g.add(m);
    col(lx, lz, w, d);
    ameias(lx, lz, w > d ? w : d, w > d ? 'x' : 'z');
  }
  muro(0, HZ, HX * 2, ESP);    // norte
  muro(0, -HZ, HX * 2, ESP);   // sul
  muro(HX, 0, ESP, HZ * 2);    // leste
  const segZ = (HZ * 2 - gw) / 2;     // oeste em 2 segmentos (vão = portão)
  muro(-HX, -(gw / 2 + segZ / 2), ESP, segZ);
  muro(-HX, (gw / 2 + segZ / 2), ESP, segZ);

  // arco do portão (passa por baixo — SEM colisor) + placa "THAIS"
  const arco = new THREE.Mesh(new THREE.BoxGeometry(ESP + 0.5, ALT - 5, gw), pedraEsc);
  arco.position.set(-HX, ALT - (ALT - 5) / 2, 0); arco.castShadow = true; g.add(arco);
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
    const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.25, h, 12), pedra);
    t.position.set(lx, h / 2, lz); t.castShadow = true; g.add(t);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r + 0.6, h * 0.45, 12), telhaT);
    cone.position.set(lx, h + h * 0.225, lz); cone.castShadow = true; g.add(cone);
    col(lx, lz, r * 1.7, r * 1.7);
  }
  [[-HX, -HZ], [HX, -HZ], [-HX, HZ], [HX, HZ]].forEach(([tx, tz]) => torre(tx, tz, 2.6, ALT + 4));
  [-(gw / 2 + 1.8), gw / 2 + 1.8].forEach((tz) => torre(-HX, tz, 1.8, ALT + 5));

  // --- TEMPLO (marco de Thais, ao norte; fachada vira pra praça) ---
  const templo = new THREE.Group(); templo.position.set(0, 0, 19); g.add(templo);
  const plat = new THREE.Mesh(new THREE.BoxGeometry(20, 1.2, 13), pedraClara);
  plat.position.y = 0.6; plat.receiveShadow = true; templo.add(plat);
  col(0, 19, 20, 13);
  [0, 1, 2].forEach((i) => { // escadaria na frente (sul)
    const deg = new THREE.Mesh(new THREE.BoxGeometry(14 - i * 1.2, 0.4, 1.0), pedraClara);
    deg.position.set(0, 0.2 + i * 0.4, -6.5 - i * 0.9); templo.add(deg);
  });
  const corpoT = new THREE.Mesh(new THREE.BoxGeometry(15, 8, 10), pedra);
  corpoT.position.set(0, 5.2, 1); corpoT.castShadow = corpoT.receiveShadow = true; templo.add(corpoT);
  for (let i = -3; i <= 3; i++) { // colunata frontal
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 7.4, 12), pedraClara);
    c.position.set(i * 2.3, 4.5, -5.4); c.castShadow = true; templo.add(c);
  }
  const arq = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 1.8), pedraClara); // entablamento
  arq.position.set(0, 8.5, -5.4); arq.castShadow = true; templo.add(arq);
  const teto = new THREE.Mesh(new THREE.ConeGeometry(12.5, 6, 4), telha);      // telhado piramidal
  teto.position.set(0, 11.5, 1); teto.rotation.y = Math.PI / 4; teto.castShadow = true; templo.add(teto);
  const pina = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.7, roughness: 0.3 }));
  pina.position.set(0, 14.8, 1); templo.add(pina); // pináculo dourado

  // --- PRÉDIOS decorativos (cantos internos; fachada vira pro miolo) ---
  function predio(lx, lz, w, d, h, cor, corT) {
    const p = new THREE.Group(); p.position.set(lx, 0, lz); g.add(p);
    const corpoP = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(cor, 1));
    corpoP.position.y = h / 2; corpoP.castShadow = corpoP.receiveShadow = true; p.add(corpoP);
    const tel = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, h * 0.5 + 1.4, 4), mat(corT, 1));
    tel.position.y = h + (h * 0.5 + 1.4) / 2 - 0.1; tel.rotation.y = Math.PI / 4; tel.castShadow = true; p.add(tel);
    const faceZ = lz >= 0 ? -1 : 1; // porta/janelas viram pro centro
    const porta = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.8, 0.2), madeira);
    porta.position.set(0, 1.4, faceZ * (d / 2 + 0.02)); p.add(porta);
    [-w * 0.28, w * 0.28].forEach((jx) => {
      const j = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.08), mat(0x9fd0e0, 0.35));
      j.position.set(jx, h * 0.62, faceZ * (d / 2 + 0.05)); p.add(j);
    });
    col(lx, lz, w, d);
  }
  predio(-23, 17, 9, 9, 7, 0xd8c8a4, 0xc0653a);
  predio(23, 17, 9, 9, 8, 0xcdb892, 0x2f8d80);
  predio(-23, -17, 9, 9, 8, 0xd2c19a, 0x9a4a3a);
  predio(23, -17, 9, 9, 7, 0xcab98e, 0xc0653a);

  return { grupo: g, colisores };
}

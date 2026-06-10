// =============================================================
//  INTERIORES  ·  casa que dá pra ENTRAR.
//  Paredes ocas (axis-aligned) com vão de PORTA num lado; a porta
//  abre/fecha na AÇÃO (animada). O telhado é devolvido à parte para
//  SUMIR quando o jogador entra. Interior mobiliado.
//  Devolve { grupo, colisores, interativo (porta), animados, casa }.
// =============================================================
import * as THREE from 'three';
import { mat, criaJanela } from './construcoes.js';

export function criaCasaInterior(x, z, opts = {}) {
  const { larg = 9, prof = 9, alt = 4, frente = 'sul', cor = 0xd8c4a0, corTelhado = 0x8a4632 } = opts;
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const t = 0.3, hx = larg / 2, hz = prof / 2, gw = 2.2;
  const paredeMat = mat(cor);
  const colisores = [];

  // chão de tábua
  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.1, prof), mat(0x8a6a44));
  chao.position.y = 0.05; chao.receiveShadow = true; g.add(chao);

  // segmento de parede (caixa) + colisor em coords do mundo
  function muro(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), paredeMat);
    m.position.set(cx, alt / 2, cz); m.castShadow = true; m.receiveShadow = true; g.add(m);
    colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  }
  function ladoCheio(lado) {
    if (lado === 'sul') muro(0, -hz, larg, t);
    else if (lado === 'norte') muro(0, hz, larg, t);
    else if (lado === 'oeste') muro(-hx, 0, t, prof);
    else muro(hx, 0, t, prof);
  }
  function ladoComVao(lado) {
    const vert = alt - 2.6; // verga acima da porta
    if (lado === 'sul' || lado === 'norte') {
      const cz = lado === 'sul' ? -hz : hz, seg = (larg - gw) / 2;
      muro(-(gw / 2 + seg / 2), cz, seg, t);
      muro(gw / 2 + seg / 2, cz, seg, t);
      const verga = new THREE.Mesh(new THREE.BoxGeometry(gw, vert, t), paredeMat);
      verga.position.set(0, alt - vert / 2, cz); g.add(verga);
    } else {
      const cx = lado === 'oeste' ? -hx : hx, seg = (prof - gw) / 2;
      muro(cx, -(gw / 2 + seg / 2), t, seg);
      muro(cx, gw / 2 + seg / 2, t, seg);
      const verga = new THREE.Mesh(new THREE.BoxGeometry(t, vert, gw), paredeMat);
      verga.position.set(cx, alt - vert / 2, 0); g.add(verga);
    }
  }
  ['sul', 'norte', 'oeste', 'leste'].forEach((l) => { if (l === frente) ladoComVao(l); else ladoCheio(l); });

  // janelas variadas nas paredes que não têm a porta
  ['sul', 'norte', 'oeste', 'leste'].forEach((l) => {
    if (l === frente) return;
    const j = criaJanela({ cruz: true, shutters: Math.random() < 0.6, floreira: Math.random() < 0.4 });
    if (l === 'sul') j.position.set(0, 1.9, -hz - 0.07);
    else if (l === 'norte') { j.position.set(0, 1.9, hz + 0.07); j.rotation.y = Math.PI; }
    else if (l === 'oeste') { j.position.set(-hx - 0.07, 1.9, 0); j.rotation.y = -Math.PI / 2; }
    else { j.position.set(hx + 0.07, 1.9, 0); j.rotation.y = Math.PI / 2; }
    g.add(j);
  });

  // PORTA (folha) com dobradiça na borda do vão
  const dobr = new THREE.Group();
  const folhaMat = mat(0x5a3a22);
  let folha, dpx = x, dpz = z;
  if (frente === 'sul' || frente === 'norte') {
    const cz = frente === 'sul' ? -hz : hz;
    dobr.position.set(-gw / 2, 0, cz);
    folha = new THREE.Mesh(new THREE.BoxGeometry(gw, 2.4, t * 0.8), folhaMat);
    folha.position.set(gw / 2, 1.2, 0);
    dpz = z + cz;
  } else {
    const cx = frente === 'oeste' ? -hx : hx;
    dobr.position.set(cx, 0, -gw / 2);
    folha = new THREE.Mesh(new THREE.BoxGeometry(t * 0.8, 2.4, gw), folhaMat);
    folha.position.set(0, 1.2, gw / 2);
    dpx = x + cx;
  }
  folha.castShadow = true;
  const macaneta = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mat(0xd9a522, 0.3));
  macaneta.position.set(folha.position.x * 1.6, 1.2, folha.position.z * 1.6);
  dobr.add(folha); dobr.add(macaneta); g.add(dobr);

  // estado/animação da porta (lerp suave no loop via animaProps)
  const angAberto = 1.45 * ((frente === 'sul' || frente === 'leste') ? 1 : -1);
  const animPorta = { mesh: dobr, porta: true, alvo: 0 };
  const estado = { aberta: false };
  const inter = { x: dpx, z: dpz, raio: 2.8, titulo: 'Porta', acao: 'Abrir / fechar porta 🚪' };
  inter.onAcao = () => {
    estado.aberta = !estado.aberta;
    animPorta.alvo = estado.aberta ? angAberto : 0;
    inter.msgAcao = estado.aberta ? '🚪 Porta aberta' : '🚪 Porta fechada';
  };

  // MOBÍLIA (decorativa; interior fica livre pra andar)
  const mad = mat(0x6e4a2a), tecido = mat(0x9a4a4a);
  // cama
  const cama = new THREE.Group();
  cama.add(meshBox(1.8, 0.5, 2.4, mad, 0, 0.25, 0));
  cama.add(meshBox(1.7, 0.18, 2.2, tecido, 0, 0.55, 0));
  cama.add(meshBox(1.6, 0.22, 0.5, mat(0xeae0d0), 0, 0.62, -0.85)); // travesseiro
  cama.position.set(-(hx - 1.3), 0, -(hz - 1.6)); g.add(cama);
  // mesa + 2 cadeiras
  const mesa = new THREE.Group();
  mesa.add(meshBox(1.6, 0.15, 1.0, mad, 0, 0.95, 0));
  [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]].forEach(([px, pz]) => mesa.add(meshBox(0.12, 0.95, 0.12, mad, px, 0.47, pz)));
  mesa.position.set(hx - 2.6, 0, 0.4); g.add(mesa);
  [[-0.9], [0.9]].forEach(([oz]) => {
    const cad = new THREE.Group();
    cad.add(meshBox(0.6, 0.1, 0.6, mad, 0, 0.55, 0));
    cad.add(meshBox(0.6, 0.7, 0.1, mad, 0, 0.85, -0.25));
    cad.position.set(hx - 2.6, 0, 0.4 + oz); g.add(cad);
  });
  // lareira (parede oposta à porta, num canto)
  const lar = new THREE.Group();
  lar.add(meshBox(1.6, 1.6, 0.6, mat(0x8a8276), 0, 0.8, 0));
  lar.add(meshBox(1.0, 0.9, 0.3, mat(0x201510), 0, 0.55, 0.2));
  lar.add(meshBox(0.6, 0.4, 0.2, mat(0xff7a2a), 0, 0.4, 0.3)); // fogo
  lar.position.set(hx - 1.0, 0, hz - 0.6); g.add(lar);
  // tapete
  const tapete = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 1.8), mat(0x7a3a3a));
  tapete.position.set(0, 0.11, 0); g.add(tapete);

  // telhado piramidal (SOME quando o jogador entra)
  const hTelh = alt * 0.55 + 1.2;
  const telhado = new THREE.Mesh(new THREE.ConeGeometry(Math.max(larg, prof) * 0.78, hTelh, 4), mat(corTelhado));
  telhado.position.set(0, alt + hTelh / 2 - 0.1, 0); telhado.rotation.y = Math.PI / 4; telhado.castShadow = true; g.add(telhado);

  const box = { minX: x - hx + 0.5, maxX: x + hx - 0.5, minZ: z - hz + 0.5, maxZ: z + hz - 0.5 };
  return {
    grupo: g, colisores,
    interativo: inter,
    animados: [animPorta],
    casa: { roof: telhado, box },
  };
}

function meshBox(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}

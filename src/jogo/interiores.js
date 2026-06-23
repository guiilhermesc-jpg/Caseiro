// =============================================================
//  INTERIORES  ·  casa que dá pra ENTRAR.
//  Paredes ocas (axis-aligned) com vão de PORTA num lado; a porta
//  abre/fecha na AÇÃO (animada). O telhado é devolvido à parte para
//  SUMIR quando o jogador entra. Interior mobiliado.
//  Devolve { grupo, colisores, interativo (porta), animados, casa }.
// =============================================================
import * as THREE from 'three';
import { mat, matParede, criaJanela, texturaPedra, aplicaTexturaReal } from './construcoes.js';

export function criaCasaInterior(x, z, opts = {}) {
  const { larg = 9, prof = 9, alt = 4, frente = 'sul', cor = 0xd8c4a0, corTelhado = 0x8a4632 } = opts;
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const t = 0.3, hx = larg / 2, hz = prof / 2, gw = 4.6; // vão BEM largo (entrada fácil)
  const paredeMat = matParede(cor); // reboco procedural (RV4.5)
  const colisores = [];

  // chão de tábua (textura REAL de madeira quando carregar)
  const chaoMat = new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 1 });
  aplicaTexturaReal(chaoMat, 'madeira', 2, 2);
  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.1, prof), chaoMat);
  chao.position.y = 0.05; chao.receiveShadow = true; g.add(chao);

  // segmento de parede (caixa) + colisor em coords do mundo
  function muro(cx, cz, w, d, semCol) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), paredeMat);
    m.position.set(cx, alt / 2, cz); m.castShadow = true; m.receiveShadow = true; g.add(m);
    if (!semCol) colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  }
  function ladoCheio(lado) {
    if (lado === 'sul') muro(0, -hz, larg, t);
    else if (lado === 'norte') muro(0, hz, larg, t);
    else if (lado === 'oeste') muro(-hx, 0, t, prof);
    else muro(hx, 0, t, prof);
  }
  function ladoComVao(lado) {
    const vert = alt - 2.6; // verga acima da porta
    const madV = mat(0x5a4632, 1), pedV = mat(0x6f675c, 1);
    if (lado === 'sul' || lado === 'norte') {
      const cz = lado === 'sul' ? -hz : hz, seg = (larg - gw) / 2;
      muro(-(gw / 2 + seg / 2), cz, seg, t); // laterais sólidas; só o vão da porta abre
      muro(gw / 2 + seg / 2, cz, seg, t);
      const verga = new THREE.Mesh(new THREE.BoxGeometry(gw, vert, t), paredeMat);
      verga.position.set(0, alt - vert / 2, cz); g.add(verga);
      // RV5.5: ENTRADA de verdade — batentes, verga de madeira e degrau de pedra
      const foraZ = lado === 'sul' ? -1 : 1;
      [-(gw / 2), gw / 2].forEach((ox) => {
        const bat = new THREE.Mesh(new THREE.BoxGeometry(0.26, 2.7, t + 0.26), madV);
        bat.position.set(ox, 1.35, cz); bat.castShadow = true; g.add(bat);
      });
      const vergaM = new THREE.Mesh(new THREE.BoxGeometry(gw + 0.3, 0.3, t + 0.26), madV);
      vergaM.position.set(0, 2.72, cz); g.add(vergaM);
      const degrau = new THREE.Mesh(new THREE.BoxGeometry(gw * 0.7, 0.22, 0.8), pedV);
      degrau.position.set(0, 0.11, cz + foraZ * (t / 2 + 0.4)); degrau.receiveShadow = true; g.add(degrau);
    } else {
      const cx = lado === 'oeste' ? -hx : hx, seg = (prof - gw) / 2;
      muro(cx, -(gw / 2 + seg / 2), t, seg);
      muro(cx, gw / 2 + seg / 2, t, seg);
      const verga = new THREE.Mesh(new THREE.BoxGeometry(t, vert, gw), paredeMat);
      verga.position.set(cx, alt - vert / 2, 0); g.add(verga);
      const foraX = lado === 'oeste' ? -1 : 1;
      [-(gw / 2), gw / 2].forEach((oz) => {
        const bat = new THREE.Mesh(new THREE.BoxGeometry(t + 0.26, 2.7, 0.26), madV);
        bat.position.set(cx, 1.35, oz); bat.castShadow = true; g.add(bat);
      });
      const vergaM = new THREE.Mesh(new THREE.BoxGeometry(t + 0.26, 0.3, gw + 0.3), madV);
      vergaM.position.set(cx, 2.72, 0); g.add(vergaM);
      const degrau = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, gw * 0.7), pedV);
      degrau.position.set(cx + foraX * (t / 2 + 0.4), 0.11, 0); degrau.receiveShadow = true; g.add(degrau);
    }
  }
  ['sul', 'norte', 'oeste', 'leste'].forEach((l) => { if (l === frente) ladoComVao(l); else ladoCheio(l); });

  // RV5.5: a casa entrável fala a MESMA língua dos prédios — montantes de
  // canto e vigas de topo externas (nada invade o interior)
  const madC = mat(0x5a4632, 1);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, alt, 0.32), madC);
    post.position.set(sx * hx, alt / 2, sz * hz); post.castShadow = true; g.add(post);
  });
  [[0, -hz - 0.12, larg + 0.3, 0.2], [0, hz + 0.12, larg + 0.3, 0.2],
   [-hx - 0.12, 0, 0.2, prof + 0.3], [hx + 0.12, 0, 0.2, prof + 0.3]]
    .forEach(([px2, pz2, w2, d2]) => {
      const viga = new THREE.Mesh(new THREE.BoxGeometry(w2, 0.24, d2), madC);
      viga.position.set(px2, alt - 0.1, pz2); g.add(viga);
    });

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

  // RV6.7: fachada habitada. A casa precisa parecer usada antes mesmo de
  // entrar: placa, caminho de pedra, vasos, canteiro e lanterna emissiva.
  const frenteInfo = (() => {
    if (frente === 'sul') return { fx: 0, fz: -hz, ox: 0, oz: -1, tx: 1, tz: 0, rot: Math.PI };
    if (frente === 'norte') return { fx: 0, fz: hz, ox: 0, oz: 1, tx: 1, tz: 0, rot: 0 };
    if (frente === 'oeste') return { fx: -hx, fz: 0, ox: -1, oz: 0, tx: 0, tz: 1, rot: -Math.PI / 2 };
    return { fx: hx, fz: 0, ox: 1, oz: 0, tx: 0, tz: 1, rot: Math.PI / 2 };
  })();
  const pontoFrente = (lado, fora, y) => ({
    x: frenteInfo.fx + frenteInfo.tx * lado + frenteInfo.ox * fora,
    y,
    z: frenteInfo.fz + frenteInfo.tz * lado + frenteInfo.oz * fora,
  });
  const pedraEntrada = mat(0x8a8175, 1), terraVaso = mat(0x5c442c, 1);
  for (let i = 0; i < 4; i++) {
    const p = pontoFrente(0, 0.85 + i * 0.82, 0.09);
    const laje = new THREE.Mesh(new THREE.BoxGeometry(frenteInfo.oz ? 2.35 : 0.82, 0.06, frenteInfo.oz ? 0.82 : 2.35), pedraEntrada);
    laje.position.set(p.x, p.y, p.z);
    laje.rotation.y = (i % 2 ? 0.06 : -0.05) * (frenteInfo.oz ? 1 : -1);
    laje.receiveShadow = true;
    g.add(laje);
  }
  [-gw / 2 - 0.85, gw / 2 + 0.85].forEach((lado, idx) => {
    const p = pontoFrente(lado, 0.48, 0.22);
    const canteiro = new THREE.Mesh(new THREE.BoxGeometry(frenteInfo.oz ? 1.25 : 0.42, 0.26, frenteInfo.oz ? 0.42 : 1.25), terraVaso);
    canteiro.position.set(p.x, p.y, p.z); canteiro.castShadow = true; g.add(canteiro);
    for (let k = 0; k < 3; k++) {
      const flor = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), mat([0xe85d75, 0xf2c14e, 0xd06ad0][(idx + k) % 3], 0.6));
      const pf = pontoFrente(lado + (k - 1) * 0.28, 0.52, 0.44);
      flor.position.set(pf.x, pf.y, pf.z); g.add(flor);
    }
  });
  [-gw / 2 - 0.42, gw / 2 + 0.42].forEach((lado, idx) => {
    const p = pontoFrente(lado, 0.88, 0.32);
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.42, 8), mat(0x7a4a2c, 1));
    vaso.position.set(p.x, p.y, p.z); vaso.castShadow = true; g.add(vaso);
    const planta = new THREE.Mesh(new THREE.IcosahedronGeometry(0.27, 0), mat(0x4f7e3e, 1));
    planta.position.set(p.x, 0.72, p.z); planta.castShadow = true; g.add(planta);
    if (idx === 0) {
      const lanP = pontoFrente(lado, 0.34, 2.35);
      const lanterna = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xff9f2a, emissiveIntensity: 0.8, roughness: 0.45 }));
      lanterna.position.set(lanP.x, lanP.y, lanP.z); g.add(lanterna);
    }
  });
  {
    const texto = opts.forja ? 'FORJA' : opts.loja ? 'LOJA' : 'CASA';
    const cnvP = document.createElement('canvas'); cnvP.width = 256; cnvP.height = 80;
    const ctxP = cnvP.getContext('2d');
    ctxP.fillStyle = '#5a3a22'; ctxP.fillRect(0, 0, 256, 80);
    ctxP.strokeStyle = '#d9b36a'; ctxP.lineWidth = 6; ctxP.strokeRect(6, 6, 244, 68);
    ctxP.fillStyle = '#f2dfb5'; ctxP.font = 'bold 34px Georgia,serif'; ctxP.textAlign = 'center'; ctxP.textBaseline = 'middle';
    ctxP.fillText(texto, 128, 42);
    const placa = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.58),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnvP), transparent: true }));
    const pp = pontoFrente(0, 0.22, 3.15);
    placa.position.set(pp.x, pp.y, pp.z); placa.rotation.y = frenteInfo.rot; g.add(placa);
  }

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
  const animPorta = { mesh: dobr, porta: true, alvo: angAberto }; // porta começa ABERTA (entrada livre)
  const flickers = []; // RV15.5: lamparina/lareira piscam (interior vivo)

  const mad = mat(0x6e4a2a), tecido = mat(0x9a4a4a);
  if (opts.forja) {
    // === FORJA (RV4.2): bigorna, forno ACESO e balcão de ferreiro ===
    const eixoZ = frente === 'norte' || frente === 'sul';
    const dirFundo = (frente === 'norte' || frente === 'leste') ? -1 : 1;
    const bw = (eixoZ ? larg : prof) - 3.6;
    const balcao = new THREE.Group();
    balcao.add(meshBox(eixoZ ? bw : 0.9, 1.05, eixoZ ? 0.9 : bw, mad, 0, 0.52, 0));
    balcao.add(meshBox(eixoZ ? bw + 0.2 : 1.1, 0.12, eixoZ ? 1.1 : bw + 0.2, mat(0x6f675c), 0, 1.12, 0)); // tampo de pedra
    const bx = eixoZ ? 0 : dirFundo * (hx - 2.2), bz = eixoZ ? dirFundo * (hz - 2.2) : 0;
    balcao.position.set(bx, 0, bz); g.add(balcao);
    colisores.push({
      minX: x + bx - (eixoZ ? bw / 2 : 0.55), maxX: x + bx + (eixoZ ? bw / 2 : 0.55),
      minZ: z + bz - (eixoZ ? 0.55 : bw / 2), maxZ: z + bz + (eixoZ ? 0.55 : bw / 2),
    });
    // BIGORNA no meio da oficina
    const big = new THREE.Group();
    big.add(meshBox(0.55, 0.5, 0.5, mat(0x3a3d42, 0.5), 0, 0.25, 0));
    big.add(meshBox(0.32, 0.22, 1.15, mat(0x52565e, 0.4), 0, 0.6, 0));
    big.position.set(eixoZ ? -1.6 : 0, 0, eixoZ ? 0 : -1.6); g.add(big);
    // FORNO aceso no canto do fundo (brasa emissiva)
    const forno = new THREE.Group();
    forno.add(meshBox(1.7, 1.9, 1.3, mat(0x6f675c), 0, 0.95, 0));
    const boca = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xff7a2a, emissive: 0xff4a00, emissiveIntensity: 0.85, roughness: 0.5 }));
    boca.position.set(0, 0.6, eixoZ ? -dirFundo * 0.7 : 0); if (!eixoZ) boca.position.x = -dirFundo * 0.7;
    if (!eixoZ) boca.rotation.y = Math.PI / 2;
    forno.add(boca);
    forno.position.set(eixoZ ? hx - 1.4 : dirFundo * (hx - 1.0), 0, eixoZ ? dirFundo * (hz - 1.0) : hz - 1.4);
    g.add(forno);
    // prateleira com lingotes de metal
    const pw = (eixoZ ? larg : prof) - 2.6;
    g.add(meshBox(eixoZ ? pw : 0.34, 0.08, eixoZ ? 0.34 : pw, mad,
      eixoZ ? 0 : dirFundo * (hx - 0.4), 1.9, eixoZ ? dirFundo * (hz - 0.4) : 0));
    for (let k = 0; k < 5; k++) {
      const t = -pw / 2 + 0.6 + k * ((pw - 1.2) / 4);
      g.add(meshBox(0.34, 0.12, 0.16, mat(0xb8bcc4, 0.35), eixoZ ? t : dirFundo * (hx - 0.4), 1.99, eixoZ ? dirFundo * (hz - 0.4) : t));
    }
    const tapF = new THREE.Mesh(new THREE.BoxGeometry(eixoZ ? 2.6 : 1.8, 0.04, eixoZ ? 1.8 : 2.6), mat(0x3a3026));
    tapF.position.set(0, 0.11, 0); g.add(tapF);
  } else if (opts.loja) {
    // === LOJA (estilo Tibia): balcão, prateleiras de poções e barris ===
    const eixoZ = frente === 'norte' || frente === 'sul';
    const dirFundo = (frente === 'norte' || frente === 'leste') ? -1 : 1; // fundo = oposto da porta
    const bw = (eixoZ ? larg : prof) - 3.6;
    const balcao = new THREE.Group();
    balcao.add(meshBox(eixoZ ? bw : 0.9, 1.05, eixoZ ? 0.9 : bw, mad, 0, 0.52, 0));
    balcao.add(meshBox(eixoZ ? bw + 0.2 : 1.1, 0.12, eixoZ ? 1.1 : bw + 0.2, mat(0x8a6a44), 0, 1.12, 0)); // tampo
    const bx = eixoZ ? 0 : dirFundo * (hx - 2.2), bz = eixoZ ? dirFundo * (hz - 2.2) : 0;
    balcao.position.set(bx, 0, bz); g.add(balcao);
    colisores.push({
      minX: x + bx - (eixoZ ? bw / 2 : 0.55), maxX: x + bx + (eixoZ ? bw / 2 : 0.55),
      minZ: z + bz - (eixoZ ? 0.55 : bw / 2), maxZ: z + bz + (eixoZ ? 0.55 : bw / 2),
    });
    // prateleiras na parede do fundo com fileiras de poções coloridas
    const coresPocao = [0xd64545, 0x4587d6, 0x45d68a, 0xd6a945, 0xb145d6];
    [1.6, 2.3].forEach((py, fi) => {
      const pw = (eixoZ ? larg : prof) - 2.6;
      g.add(meshBox(eixoZ ? pw : 0.34, 0.08, eixoZ ? 0.34 : pw, mad,
        eixoZ ? 0 : dirFundo * (hx - 0.4), py, eixoZ ? dirFundo * (hz - 0.4) : 0));
      for (let k = 0; k < 6; k++) {
        const corF = coresPocao[(k + fi) % coresPocao.length];
        const fr = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.26, 8),
          new THREE.MeshStandardMaterial({ color: corF, roughness: 0.3, emissive: corF, emissiveIntensity: 0.12 }));
        const t = -pw / 2 + 0.5 + k * ((pw - 1) / 5);
        fr.position.set(eixoZ ? t : dirFundo * (hx - 0.4), py + 0.17, eixoZ ? dirFundo * (hz - 0.4) : t);
        g.add(fr);
      }
    });
    // barril de estoque + tapete da entrada
    const barr = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.9, 10), mad);
    barr.position.set(eixoZ ? hx - 1.1 : dirFundo * (hx - 1.1), 0.45, eixoZ ? dirFundo * (hz - 1.1) : hz - 1.1);
    g.add(barr);
    const tapL = new THREE.Mesh(new THREE.BoxGeometry(eixoZ ? 2.6 : 1.8, 0.04, eixoZ ? 1.8 : 2.6), mat(0x7a3a3a));
    tapL.position.set(0, 0.11, 0); g.add(tapL);
  } else {
    // MOBÍLIA (decorativa; interior fica livre pra andar)
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
    // RV5.5: lamparina ACESA na mesa — casa habitada tem luz
    const lamparina = new THREE.Group(); lamparina.position.set(hx - 2.6, 1.03, 0.15);
    const corpoL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.22, 8), mat(0x8a6a2a, 0.5));
    corpoL.position.y = 0.11; lamparina.add(corpoL);
    const luzL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xffaa3a, emissiveIntensity: 0.95 }));
    luzL.position.y = 0.3; lamparina.add(luzL);
    flickers.push({ atualiza: (dt, t) => { luzL.material.emissiveIntensity = 0.95 * (0.78 + Math.sin(t * 9) * 0.18 + Math.sin(t * 23) * 0.07); } });
    g.add(lamparina);
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
    const fogoLar = meshBox(0.6, 0.4, 0.2, mat(0xff7a2a), 0, 0.4, 0.3); lar.add(fogoLar); // fogo
    flickers.push({ atualiza: (dt, t) => { fogoLar.scale.set(0.9 + Math.cos(t * 11) * 0.12, 0.8 + Math.sin(t * 13) * 0.22, 1); } });
    lar.position.set(hx - 1.0, 0, hz - 0.6); g.add(lar);
    // tapete
    const tapete = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 1.8), mat(0x7a3a3a));
    tapete.position.set(0, 0.11, 0); g.add(tapete);
  }

  // telhado piramidal (SOME quando o jogador entra)
  const hTelh = alt * 0.55 + 1.2;
  const telhado = new THREE.Mesh(new THREE.ConeGeometry(Math.max(larg, prof) * 0.78, hTelh, 4), mat(corTelhado));
  telhado.position.set(0, alt + hTelh / 2 - 0.1, 0); telhado.rotation.y = Math.PI / 4; telhado.castShadow = true; g.add(telhado);

  // marcador flutuante 🏠 (achar a entrada de longe)
  const cnv = document.createElement('canvas'); cnv.width = 128; cnv.height = 128;
  const cx2 = cnv.getContext('2d'); cx2.font = '90px Arial'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle'; cx2.fillText('🏠', 64, 70);
  const marc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthTest: false }));
  marc.scale.set(2.2, 2.2, 1); marc.position.y = alt + hTelh + 1.5; marc.renderOrder = 997; g.add(marc);
  // 🚪 no ponto exato de entrar
  const cnv2 = document.createElement('canvas'); cnv2.width = 128; cnv2.height = 128;
  const c2 = cnv2.getContext('2d'); c2.font = '88px Arial'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText('🚪', 64, 70);
  const marcP = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv2), transparent: true, depthTest: false }));
  marcP.scale.set(1.6, 1.6, 1); marcP.position.set((dpx - x) * 1.1, 2.7, (dpz - z) * 1.1); marcP.renderOrder = 997; g.add(marcP);

  // colisor do VÃO da porta — bloqueia quando FECHADA, libera quando abre perto
  const portaCol = (frente === 'sul' || frente === 'norte')
    ? { minX: x - gw / 2, maxX: x + gw / 2, minZ: dpz - 0.45, maxZ: dpz + 0.45 }
    : { minX: dpx - 0.45, maxX: dpx + 0.45, minZ: z - gw / 2, maxZ: z + gw / 2 };

  const box = { minX: x - hx + 0.5, maxX: x + hx - 0.5, minZ: z - hz + 0.5, maxZ: z + hz - 0.5 };
  return {
    grupo: g, colisores,
    animados: [animPorta, ...flickers],
    casa: { roof: telhado, box, portaAnim: animPorta, angAberto, px: dpx, pz: dpz, portaCol, aberta: true }, // nasce ABERTA
  };
}

function meshBox(w, h, d, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}

function placaCanvas(texto, cor = '#f2dfb5', fundo = '#4a2f1c') {
  const cnv = document.createElement('canvas');
  cnv.width = 512; cnv.height = 128;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = fundo; ctx.fillRect(0, 0, cnv.width, cnv.height);
  ctx.strokeStyle = '#d9b36a'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, 492, 108);
  ctx.fillStyle = cor; ctx.font = 'bold 34px Georgia,serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, 256, 66);
  return new THREE.CanvasTexture(cnv);
}

function criaTapete(w, d, x, y, z, cor = 0x7a2630) {
  const tapete = new THREE.Mesh(new THREE.BoxGeometry(w, 0.055, d), mat(cor, 0.9));
  tapete.position.set(x, y + 0.13, z);
  tapete.receiveShadow = true;
  return tapete;
}

function criaBauGrande(x, y, z, cor = 0x6e4a2a) {
  const g = new THREE.Group();
  const madeira = mat(cor, 0.85);
  const metal = new THREE.MeshStandardMaterial({ color: 0xb8a15f, metalness: 0.75, roughness: 0.32 });
  g.add(meshBox(2.0, 0.9, 1.1, madeira, 0, 0.45, 0));
  g.add(meshBox(2.1, 0.14, 1.18, metal, 0, 0.98, 0));
  g.add(meshBox(0.16, 0.95, 1.18, metal, -0.72, 0.5, 0));
  g.add(meshBox(0.16, 0.95, 1.18, metal, 0.72, 0.5, 0));
  const fech = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.12), metal);
  fech.position.set(0, 0.55, 0.62); g.add(fech);
  g.position.set(x, y, z);
  return g;
}

function criaBiblioteca(larg, y, z, lado = -1) {
  const g = new THREE.Group();
  const mad = mat(0x5f4027, 0.92);
  const papel = [0xb99052, 0x9c3a36, 0x2f5f75, 0x4f7a44, 0x6f4a8a];
  const x = lado * (larg / 2 - 1.0);
  for (let k = 0; k < 3; k++) {
    const pr = new THREE.Group();
    pr.add(meshBox(0.55, 3.0, 3.5, mad, 0, 1.5, 0));
    for (let i = 0; i < 12; i++) {
      const livro = meshBox(0.16, 0.58 + (i % 3) * 0.08, 0.12, mat(papel[i % papel.length], 0.8), 0, 0.7 + Math.floor(i / 4) * 0.78, -1.35 + (i % 4) * 0.82);
      pr.add(livro);
    }
    pr.position.set(x, y, z - 4.2 + k * 4.2);
    pr.rotation.y = lado < 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(pr);
  }
  return g;
}

function criaMesaConselho(y, guilda = false) {
  const g = new THREE.Group();
  const mad = mat(0x654326, 0.88);
  g.add(meshBox(guilda ? 10.5 : 5.5, 0.34, guilda ? 2.5 : 2.0, mad, 0, 1.08, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    g.add(meshBox(0.22, 1.05, 0.22, mad, sx * (guilda ? 4.7 : 2.35), 0.55, sz * (guilda ? 0.95 : 0.72)));
  });
  const mapa = new THREE.Mesh(new THREE.PlaneGeometry(guilda ? 7.2 : 3.6, guilda ? 1.45 : 1.0), new THREE.MeshBasicMaterial({ map: placaCanvas(guilda ? 'ROTAS E HUNTS' : 'CONTRATOS DA CASA'), transparent: false }));
  mapa.position.set(0, 1.28, 0.02);
  mapa.rotation.x = -Math.PI / 2;
  g.add(mapa);
  const cera = new THREE.MeshStandardMaterial({ color: 0xf0ead8, roughness: 0.8 });
  const chama = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xff8a22, emissiveIntensity: 0.95, roughness: 0.35 });
  [-1, 1].forEach((sx) => {
    const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.45, 8), cera);
    vela.position.set(sx * (guilda ? 4.5 : 2.1), 1.52, 0.72); g.add(vela);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), chama);
    fl.position.set(sx * (guilda ? 4.5 : 2.1), 1.82, 0.72); g.add(fl);
  });
  g.position.y = y;
  return g;
}

function criaCandelabro(y, guilda = false) {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x3a2b1c, metalness: 0.65, roughness: 0.35 });
  const chama = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xff8a22, emissiveIntensity: 1.15, roughness: 0.3 });
  const animados = [];
  const altura = guilda ? 7.2 : 6.0;
  const raio = guilda ? 2.9 : 2.1;
  const corrente = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.6, 6), metal);
  corrente.position.set(0, y + altura + 0.8, 0); g.add(corrente);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(raio, 0.055, 8, 34), metal);
  aro.position.set(0, y + altura, 0); aro.rotation.x = Math.PI / 2; g.add(aro);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.cos(a) * raio, z = Math.sin(a) * raio;
    const braco = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, raio, 6), metal);
    braco.position.set(x / 2, y + altura, z / 2);
    braco.rotation.z = Math.PI / 2;
    braco.rotation.y = -a;
    g.add(braco);
    const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.48, 8), mat(0xf0ead8, 0.8));
    vela.position.set(x, y + altura + 0.28, z); g.add(vela);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 6), chama.clone());
    fl.position.set(x, y + altura + 0.62, z); g.add(fl);
    animados.push({ chama: fl, chamaMat: fl.material, fase: Math.random() * 6 });
  }
  const luz = new THREE.PointLight(0xffbf6a, guilda ? 1.35 : 1.0, guilda ? 38 : 28, 2);
  luz.position.set(0, y + altura, 0);
  g.add(luz);
  return { grupo: g, animados };
}

function criaGaleriaSuperior(larg, prof, y, guilda = false) {
  const g = new THREE.Group();
  const hx = larg / 2, hz = prof / 2;
  const madeira = mat(0x5d3b23, 0.9), pedra = mat(0x8d8576, 1), ouro = mat(0xd9a522, 0.55);
  const matBase = guilda ? pedra : madeira;
  const yy = y + (guilda ? 5.45 : 4.85);
  const pisoFundo = meshBox(larg - 5.0, 0.26, 2.0, matBase, 0, yy, -hz + 2.2);
  const pisoE = meshBox(2.0, 0.26, prof - 8.0, matBase, -hx + 2.2, yy, 0.7);
  const pisoD = meshBox(2.0, 0.26, prof - 8.0, matBase, hx - 2.2, yy, 0.7);
  g.add(pisoFundo, pisoE, pisoD);
  const addRailing = (x0, z0, w, eixo = 'x') => {
    const corr = meshBox(eixo === 'x' ? w : 0.12, 0.12, eixo === 'x' ? 0.12 : w, ouro, x0, yy + 0.8, z0);
    g.add(corr);
    const n = Math.max(3, Math.floor(w / 1.3));
    for (let i = 0; i < n; i++) {
      const t = -w / 2 + (i + 0.5) * (w / n);
      g.add(meshBox(0.08, 0.78, 0.08, ouro, x0 + (eixo === 'x' ? t : 0), yy + 0.42, z0 + (eixo === 'x' ? 0 : t)));
    }
  };
  addRailing(0, -hz + 3.25, larg - 6.5, 'x');
  addRailing(-hx + 3.25, 0.7, prof - 8.8, 'z');
  addRailing(hx - 3.25, 0.7, prof - 8.8, 'z');
  for (let i = 0; i < 9; i++) {
    const deg = meshBox(3.2, 0.22, 1.0, madeira, -hx + 5.0 + i * 0.72, y + 0.26 + i * 0.42, hz - 7.0 - i * 0.9);
    deg.rotation.y = 0.08;
    g.add(deg);
  }
  return g;
}

function criaDecoracaoParede(larg, prof, y, guilda = false) {
  const g = new THREE.Group();
  const hx = larg / 2, hz = prof / 2;
  const cores = guilda ? [0x203e78, 0x7a2630, 0x202a44] : [0x7a2630, 0x295f50, 0x67407c];
  [-8, 0, 8].forEach((x, i) => {
    const pano = new THREE.Mesh(new THREE.PlaneGeometry(2.2, guilda ? 4.2 : 3.2, 2, 4), new THREE.MeshStandardMaterial({ color: cores[i % cores.length], roughness: 0.92, side: THREE.DoubleSide }));
    pano.position.set(x, y + (guilda ? 5.1 : 4.55), -hz + 0.04);
    g.add(pano);
    const sig = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mat(0xd9a522, 0.55));
    sig.position.set(x, y + (guilda ? 5.4 : 4.75), -hz + 0.18); g.add(sig);
  });
  [-1, 1].forEach((s) => {
    const quadro = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.0), new THREE.MeshBasicMaterial({ map: placaCanvas(s < 0 ? 'MAPA DE VENOR' : 'LINHAGENS'), transparent: false }));
    quadro.position.set(s * (hx - 0.06), y + 3.9, -2.0);
    quadro.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(quadro);
  });
  const feixeMat = new THREE.MeshBasicMaterial({ color: 0xffd89a, transparent: true, opacity: guilda ? 0.13 : 0.16, depthWrite: false, side: THREE.DoubleSide });
  const feixe = new THREE.Mesh(new THREE.PlaneGeometry(5.8, guilda ? 7.6 : 6.2), feixeMat);
  feixe.position.set(0, y + (guilda ? 3.8 : 3.2), hz - 0.35);
  feixe.rotation.x = -0.18;
  g.add(feixe);
  return g;
}

function criaPlantasInteriores(larg, prof, y, guilda = false) {
  const g = new THREE.Group();
  const hx = larg / 2, hz = prof / 2;
  const vasoMat = mat(0x6b4129, 0.9), folhaMat = mat(guilda ? 0x2e6845 : 0x3f7a4a, 1);
  [[-hx + 4, hz - 3.5], [hx - 4, hz - 3.5], [-hx + 4, -hz + 4.2], [hx - 4, -hz + 4.2]].forEach(([x, z], i) => {
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.8, 8), vasoMat);
    vaso.position.set(x, y + 0.4, z); g.add(vaso);
    for (let k = 0; k < 5; k++) {
      const folha = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.0 + (k % 2) * 0.28, 5), folhaMat);
      folha.position.set(x + Math.cos(k * 1.25) * 0.18, y + 1.05, z + Math.sin(k * 1.25) * 0.18);
      folha.rotation.z = Math.cos(k + i) * 0.28;
      folha.rotation.x = Math.sin(k) * 0.18;
      g.add(folha);
    }
  });
  return g;
}

function criaInteriorImovelBase(opts = {}) {
  const { id = 'imovel', nome = 'Imovel', y = -120, guilda = false, larg = guilda ? 44 : 34, prof = guilda ? 32 : 28 } = opts;
  const g = new THREE.Group();
  const hx = larg / 2, hz = prof / 2, alt = guilda ? 8.8 : 7.2, t = 0.5, porta = guilda ? 7.0 : 5.5;
  const colisores = [], animados = [], interativos = [];
  const parede = guilda ? mat(0xb9b2a4, 1) : mat(0xd7c7a5, 1);
  const madeira = mat(0x604027, 0.9);
  const pedra = mat(0x8d8576, 1);
  const metal = new THREE.MeshStandardMaterial({ color: 0x333840, metalness: 0.65, roughness: 0.38 });
  const ouro = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.72, roughness: 0.32, emissive: 0x241500, emissiveIntensity: 0.22 });

  const chaoMat = guilda ? new THREE.MeshStandardMaterial({ color: 0x7d776c, roughness: 1 }) : new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: 1 });
  aplicaTexturaReal(chaoMat, guilda ? 'pedra' : 'madeira', guilda ? 5 : 3, guilda ? 2.4 : 2, true, true);
  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.12, prof), chaoMat);
  chao.position.set(0, y + 0.06, 0); chao.receiveShadow = true; g.add(chao);

  function col(cx, cz, w, d) {
    colisores.push({ minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 });
  }
  function muro(cx, cz, w, d, material = parede) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), material);
    m.position.set(cx, y + alt / 2, cz); m.castShadow = m.receiveShadow = true; g.add(m);
    col(cx, cz, w, d);
  }
  muro(0, -hz, larg, t);
  muro(-hx, 0, t, prof);
  muro(hx, 0, t, prof);
  const seg = (larg - porta) / 2;
  muro(-(porta / 2 + seg / 2), hz, seg, t);
  muro(porta / 2 + seg / 2, hz, seg, t);
  const verga = new THREE.Mesh(new THREE.BoxGeometry(porta, alt - 3.4, t), parede);
  verga.position.set(0, y + alt - (alt - 3.4) / 2, hz); g.add(verga);

  [-hx + 2.2, hx - 2.2].forEach((x) => {
    [-hz + 2.2, hz - 2.2].forEach((z) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, alt - 0.6, 12), guilda ? pedra : madeira);
      c.position.set(x, y + (alt - 0.6) / 2, z); c.castShadow = true; g.add(c);
    });
  });
  g.add(criaTapete(guilda ? 5.0 : 3.6, prof - 5.6, 0, y, 0, guilda ? 0x263f6f : 0x7a2630));
  const titulo = new THREE.Mesh(new THREE.PlaneGeometry(guilda ? 7.0 : 5.0, 1.2), new THREE.MeshBasicMaterial({ map: placaCanvas(nome.toUpperCase()), transparent: false }));
  titulo.position.set(0, y + alt - 1.25, hz - 0.08);
  titulo.rotation.y = Math.PI;
  g.add(titulo);
  const cand = criaCandelabro(y, guilda);
  g.add(cand.grupo);
  cand.animados.forEach((a) => animados.push(a));
  g.add(criaGaleriaSuperior(larg, prof, y, guilda));
  g.add(criaDecoracaoParede(larg, prof, y, guilda));
  g.add(criaPlantasInteriores(larg, prof, y, guilda));

  if (!guilda) {
    muro(-hx + 10.5, -2.0, t, prof - 9.0, madeira);
    muro(hx - 10.5, -2.0, t, prof - 9.0, madeira);
    muro(0, -hz + 8.8, larg - 13.0, t, madeira);
  } else {
    muro(-hx + 12.5, -5.0, t, prof - 11.0, pedra);
    muro(hx - 12.5, -5.0, t, prof - 11.0, pedra);
    muro(0, -hz + 10.5, larg - 15.0, t, pedra);
  }

  const mesa = criaMesaConselho(y, guilda);
  mesa.position.z = guilda ? 1.8 : 1.2;
  g.add(mesa);
  col(0, mesa.position.z, guilda ? 11.0 : 6.0, guilda ? 3.0 : 2.4);
  const colunasCadeiras = guilda ? [-5, -3, -1, 1, 3, 5] : [-2.4, 0, 2.4];
  colunasCadeiras.forEach((x) => [-1, 1].forEach((s) => {
    const cad = new THREE.Group();
    cad.add(meshBox(0.72, 0.16, 0.72, madeira, 0, y + 0.6, 0));
    cad.add(meshBox(0.72, 0.82, 0.12, madeira, 0, y + 1.0, s * 0.3));
    cad.position.set(x, 0, mesa.position.z + s * (guilda ? 2.0 : 1.55));
    cad.rotation.y = s > 0 ? Math.PI : 0;
    g.add(cad);
  }));

  g.add(criaBiblioteca(larg, y, !guilda ? -2.0 : -4.0, -1));
  if (guilda) {
    for (let i = 0; i < 6; i++) {
      const rack = new THREE.Group();
      rack.position.set(hx - 5.2, y, -9 + i * 2.4);
      rack.add(meshBox(0.24, 2.6, 0.16, madeira, 0, 1.3, 0));
      const lam = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.48, 5), metal);
      lam.position.set(0, 2.95, 0); rack.add(lam);
      const esc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.12, 6), ouro);
      esc.position.set(-0.35, 1.45, 0.12); esc.rotation.z = Math.PI / 2; rack.add(esc);
      g.add(rack);
    }
  } else {
    const cama = new THREE.Group(); cama.position.set(hx - 5.4, y, -7.3);
    cama.add(meshBox(5.2, 0.65, 3.2, madeira, 0, 0.35, 0));
    cama.add(meshBox(5.0, 0.22, 3.0, mat(0x8f2f3a), 0, 0.78, 0));
    cama.add(meshBox(1.5, 0.25, 2.6, mat(0xf0ead8, 0.8), 1.6, 0.94, 0));
    g.add(cama); col(hx - 5.4, -7.3, 5.6, 3.6);
  }

  const bau = criaBauGrande(-hx + 5.0, y, hz - 5.8, guilda ? 0x4a3424 : 0x6e4a2a);
  g.add(bau); col(-hx + 5.0, hz - 5.8, 2.2, 1.4);
  for (let i = 0; i < 9; i++) {
    const moeda = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.035, 10), ouro);
    moeda.position.set(-hx + 4.35 + (i % 3) * 0.33, y + 1.05 + Math.floor(i / 3) * 0.035, hz - 5.95 + Math.floor(i / 3) * 0.22);
    moeda.rotation.x = Math.PI / 2;
    moeda.rotation.z = i * 0.4;
    g.add(moeda);
  }
  const banco = new THREE.Group(); banco.position.set(-hx + 9.0, y, hz - 5.6);
  banco.add(meshBox(2.4, 1.1, 1.1, pedra, 0, 0.55, 0));
  banco.add(meshBox(1.3, 1.0, 0.2, ouro, 0, 1.42, 0.0));
  g.add(banco); col(-hx + 9.0, hz - 5.6, 2.6, 1.4);
  const lixeira = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.85, 8), metal);
  lixeira.position.set(hx - 4.3, y + 0.43, hz - 5.8); g.add(lixeira); col(hx - 4.3, hz - 5.8, 1.0, 1.0);

  const ninho = new THREE.Group(); ninho.position.set(guilda ? 0 : hx - 5.0, y, guilda ? -hz + 5.2 : -hz + 5.8);
  const ninhoMat = mat(guilda ? 0x4a3a2a : 0x6a4a2a, 1);
  for (let i = 0; i < 10; i++) {
    const galho = meshBox(guilda ? 4.2 : 3.0, 0.18, 0.2, ninhoMat, 0, 0.22 + i * 0.015, 0);
    galho.rotation.y = i * 0.62;
    ninho.add(galho);
  }
  const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(guilda ? 0.58 : 0.42, 0), new THREE.MeshStandardMaterial({ color: 0xffd16a, emissive: 0xff8a22, emissiveIntensity: 0.75, roughness: 0.25 }));
  cristal.position.y = guilda ? 0.92 : 0.72; ninho.add(cristal);
  const luzNinho = new THREE.PointLight(0xffa34a, guilda ? 1.15 : 0.72, guilda ? 18 : 12, 2);
  luzNinho.position.set(0, guilda ? 1.15 : 0.9, 0);
  ninho.add(luzNinho);
  animados.push({ mesh: cristal, gira: 0.65, pulsa: cristal.material, fase: Math.random() * 6 });
  g.add(ninho); col(ninho.position.x, ninho.position.z, guilda ? 5.0 : 3.8, guilda ? 4.2 : 3.2);

  const trofeusZ = -hz + 0.35;
  [-6, -3, 0, 3, 6].forEach((x, i) => {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.22), madeira);
    base.position.set(x, y + 2.6, trofeusZ); g.add(base);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 6), i % 2 ? ouro : metal);
    horn.position.set(x, y + 3.25, trofeusZ + 0.1); horn.rotation.x = Math.PI; g.add(horn);
  });

  const luzMat = new THREE.MeshStandardMaterial({ color: 0xffd27a, emissive: 0xff9a2a, emissiveIntensity: 0.9, roughness: 0.35 });
  [[-hx + 2.4, hz - 2.4], [hx - 2.4, hz - 2.4], [-hx + 2.4, -hz + 2.4], [hx - 2.4, -hz + 2.4]].forEach(([lx, lz], i) => {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), luzMat);
    lamp.position.set(lx, y + 3.2, lz); g.add(lamp);
    animados.push({ chama: lamp, chamaMat: luzMat, fase: Math.random() * 6 + i });
  });

  const spawn = { x: 0, z: hz - 4.0 };
  const exit = { x: 0, z: hz - 2.0 };
  interativos.push({ kind: 'sair', x: exit.x, z: exit.z, y, raio: 3.4, titulo: `Porta de ${nome}`, acao: 'Sair para a superficie' });
  interativos.push({ kind: 'depot', x: -hx + 5.0, z: hz - 5.8, y, raio: 2.6, titulo: 'Deposito do imovel', acao: 'Abrir deposito' });
  interativos.push({ kind: 'banco', x: -hx + 9.0, z: hz - 5.6, y, raio: 2.6, titulo: 'Banco do imovel', acao: 'Abrir banco' });
  interativos.push({ kind: 'lixo', x: hx - 4.3, z: hz - 5.8, y, raio: 2.4, titulo: 'Lixeira do imovel', acao: 'Descartar itens baratos' });
  interativos.push({ kind: 'dormir', x: guilda ? 0 : hx - 5.0, z: guilda ? -hz + 5.2 : -7.3, y, raio: guilda ? 4.0 : 3.0, titulo: guilda ? 'Berco draconico' : 'Cama da mansao', acao: 'Descansar e treinar dragao' });
  if (guilda) interativos.push({ kind: 'guilda', x: 0, z: 2.0, y, raio: 4.0, titulo: 'Mesa de Conselho', acao: 'Rever plano da guilda' });

  return {
    id,
    nome,
    tipo: 'imovel',
    grupo: g,
    colisores,
    bounds: { minX: -hx + 1.0, maxX: hx - 1.0, minZ: -hz + 1.0, maxZ: hz - 1.0 },
    acessos: [],
    saidas: [],
    y,
    spawn,
    interativos,
    animados,
  };
}

export function criaMansaoInterior(opts = {}) {
  return criaInteriorImovelBase({ ...opts, guilda: false });
}

export function criaGuildHouseInterior(opts = {}) {
  return criaInteriorImovelBase({ ...opts, guilda: true });
}

// =============================================================
//  HOSPITAL de Venore · ENTRÁVEL (a porta que se vê AGORA FUNCIONA).
//  Macas com lençol, mesa de poções e armário; a curandeira atende
//  lá dentro. Telhado some ao entrar. Cruz vermelha na fachada.
// =============================================================
export function criaHospitalInterior(x, z) {
  const larg = 13, prof = 16, alt = 7, gw = 5.2, t = 0.4;
  const hx = larg / 2, hz = prof / 2;
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const parede = mat(0xeef0f2), branco = mat(0xf8f8f8, 0.8), mad = mat(0x8a6a44);
  const colisores = [];

  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.1, prof), mat(0xd8d8d2, 1));
  chao.position.y = 0.05; chao.receiveShadow = true; g.add(chao);

  function muro(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), parede);
    m.position.set(cx, alt / 2, cz); m.castShadow = m.receiveShadow = true; g.add(m);
    colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  }
  muro(0, -hz, larg, t); muro(0, hz, larg, t);   // norte/sul
  muro(hx, 0, t, prof);                            // leste (fundo)
  const seg = (prof - gw) / 2;                     // OESTE com vão (porta vira pra praça)
  muro(-hx, -(gw / 2 + seg / 2), t, seg); muro(-hx, gw / 2 + seg / 2, t, seg);
  const verga = new THREE.Mesh(new THREE.BoxGeometry(t, alt - 3.4, gw), parede);
  verga.position.set(-hx, alt - (alt - 3.4) / 2, 0); g.add(verga);

  // CRUZ VERMELHA na fachada (acima da porta)
  const cruzMat = mat(0xd83a3a);
  const cv = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.6), cruzMat); cv.position.set(-hx - 0.1, 5.2, 0); g.add(cv);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 2.2), cruzMat); ch.position.set(-hx - 0.1, 5.2, 0); g.add(ch);

  // janelas nas paredes norte/sul
  [[-2.5, -hz], [2.5, -hz], [-2.5, hz], [2.5, hz]].forEach(([jx, jz]) => {
    const j = criaJanela({ cruz: true });
    j.position.set(jx, 2.6, jz + (jz > 0 ? 0.07 : -0.07));
    if (jz > 0) j.rotation.y = Math.PI;
    g.add(j);
  });

  // MACAS (3) encostadas na parede leste: estrutura + colchão + manta vermelha
  for (let i = 0; i < 3; i++) {
    const mz = -4.5 + i * 4.5;
    const maca = new THREE.Group(); maca.position.set(hx - 1.7, 0, mz);
    maca.add(meshBox(2.4, 0.5, 1.3, mad, 0, 0.3, 0));
    maca.add(meshBox(2.3, 0.16, 1.2, branco, 0, 0.62, 0));
    maca.add(meshBox(1.3, 0.1, 1.18, mat(0xc23a3a), -0.4, 0.7, 0));
    maca.add(meshBox(0.5, 0.14, 0.9, branco, 0.85, 0.68, 0)); // travesseiro
    g.add(maca);
    colisores.push({ minX: x + hx - 2.9, maxX: x + hx - 0.5, minZ: z + mz - 0.7, maxZ: z + mz + 0.7 });
  }
  // MESA DE POÇÕES + frascos coloridos brilhando de leve
  const mesa = new THREE.Group(); mesa.position.set(-hx + 1.6, 0, -hz + 1.8);
  mesa.add(meshBox(2.2, 0.12, 1.0, mad, 0, 1.0, 0));
  [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]].forEach(([px, pz]) => mesa.add(meshBox(0.1, 1.0, 0.1, mad, px, 0.5, pz)));
  [0xd84a4a, 0x4ad86a, 0x4a8ad8].forEach((cor, i) => {
    const frasco = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.25, transparent: true, opacity: 0.9 }));
    frasco.position.set(-0.6 + i * 0.6, 1.22, 0); mesa.add(frasco);
  });
  g.add(mesa);
  colisores.push({ minX: x - hx + 0.4, maxX: x - hx + 2.8, minZ: z - hz + 1.2, maxZ: z - hz + 2.4 });
  // armário de remédios
  const arm = meshBox(1.2, 2.6, 0.6, mad, hx - 0.9, 1.3, hz - 0.8); g.add(arm);
  colisores.push({ minX: x + hx - 1.6, maxX: x + hx - 0.3, minZ: z + hz - 1.2, maxZ: z + hz - 0.4 });

  // telhado duas águas cinza-azulado (some ao entrar)
  const roof = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-hx - 0.6, 0); shape.lineTo(hx + 0.6, 0); shape.lineTo(0, 3.4); shape.closePath();
  const geoT = new THREE.ExtrudeGeometry(shape, { depth: prof + 1.2, bevelEnabled: false });
  geoT.translate(0, 0, -(prof + 1.2) / 2);
  const telh = new THREE.Mesh(geoT, mat(0xb0b6bc));
  telh.position.y = alt; telh.castShadow = true; roof.add(telh);
  g.add(roof);

  // marcador 🏥
  const cnv = document.createElement('canvas'); cnv.width = 128; cnv.height = 128;
  const cx2 = cnv.getContext('2d'); cx2.font = '90px Arial'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle'; cx2.fillText('🏥', 64, 70);
  const marc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthTest: false }));
  marc.scale.set(2.4, 2.4, 1); marc.position.y = alt + 4.6; marc.renderOrder = 997; g.add(marc);

  const box = { minX: x - hx + 0.5, maxX: x + hx - 0.5, minZ: z - hz + 0.5, maxZ: z + hz - 0.5 };
  return {
    grupo: g, colisores,
    casa: { roof, box, px: x - hx, pz: z, aberta: true }, // porta oeste sempre aberta
  };
}

// =============================================================
//  TEMPLO SAGRADO de Venore · ENTRÁVEL, com altar, vitrais, bancos
//  e velas. É o ponto de RENASCIMENTO quando o jogador morre.
//  Porta (vão largo) virada pra praça; telhado+torre somem ao entrar.
// =============================================================
export function criaTemploSagrado(x, z) {
  const larg = 16, prof = 20, alt = 6.5, gw = 6.4, t = 0.4;
  const hx = larg / 2, hz = prof / 2;
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const pedra = mat(0xded8c8), pedraEsc = mat(0xb8b0a0, 1), ouroM = new THREE.MeshStandardMaterial({ color: 0xd9a522, metalness: 0.75, roughness: 0.3 });
  const colisores = [];

  // piso de pedra calçada
  const chao = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.12, prof),
    new THREE.MeshStandardMaterial({ map: texturaPedra(5), roughness: 1 }));
  chao.position.y = 0.06; chao.receiveShadow = true; g.add(chao);

  function muro(cx, cz, w, d) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, alt, d), pedra);
    m.position.set(cx, alt / 2, cz); m.castShadow = m.receiveShadow = true; g.add(m);
    colisores.push({ minX: x + cx - w / 2, maxX: x + cx + w / 2, minZ: z + cz - d / 2, maxZ: z + cz + d / 2 });
  }
  muro(0, -hz, larg, t);                       // fundo (sul)
  muro(-hx, 0, t, prof); muro(hx, 0, t, prof); // laterais
  const seg = (larg - gw) / 2;                 // frente (norte) com vão largo
  muro(-(gw / 2 + seg / 2), hz, seg, t); muro(gw / 2 + seg / 2, hz, seg, t);
  const verga = new THREE.Mesh(new THREE.BoxGeometry(gw, alt - 3.4, t), pedra);
  verga.position.set(0, alt - (alt - 3.4) / 2, hz); g.add(verga);
  // colunas flanqueando a entrada
  [-gw / 2 - 0.6, gw / 2 + 0.6].forEach((cx) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 3.6, 10), pedraEsc);
    c.position.set(cx, 1.8, hz + 0.8); c.castShadow = true; g.add(c);
  });

  // VITRAIS coloridos nas laterais (brilham de leve)
  const coresVitral = [0x7a4ad8, 0x4a8ad8, 0xd84a6a, 0x4ad88a];
  [-1, 1].forEach((lado, li) => {
    [-5, 0, 5].forEach((vz, vi) => {
      const vid = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.6, 1.2),
        new THREE.MeshStandardMaterial({ color: coresVitral[(li * 2 + vi) % 4], roughness: 0.2, metalness: 0.1, emissive: coresVitral[(li * 2 + vi) % 4], emissiveIntensity: 0.35, transparent: true, opacity: 0.85 }));
      vid.position.set(lado * (hx + 0.03), 3.4, vz); g.add(vid);
      const mold = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.0, 1.5), pedraEsc);
      mold.position.set(lado * (hx + 0.01), 3.4, vz); g.add(mold);
    });
  });

  // ALTAR no fundo: plataforma + mesa + CRISTAL dourado (pulsa) + estátua
  const plat = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 4), pedraEsc);
  plat.position.set(0, 0.25, -hz + 2.6); g.add(plat);
  const mesa = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 1.2), pedra);
  mesa.position.set(0, 1.05, -hz + 2.4); mesa.castShadow = true; g.add(mesa);
  colisores.push({ minX: x - 1.3, maxX: x + 1.3, minZ: z - hz + 1.8, maxZ: z - hz + 3.0 });
  const cristalMat = new THREE.MeshStandardMaterial({ color: 0xffe27a, emissive: 0xffc83a, emissiveIntensity: 0.8, roughness: 0.2 });
  const cristal = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), cristalMat);
  cristal.position.set(0, 2.3, -hz + 2.4); g.add(cristal);
  // estátua do guardião (dourada) atrás do altar
  const est = new THREE.Group(); est.position.set(0, 0.5, -hz + 0.9);
  est.add(meshBox(0.9, 1.6, 0.5, ouroM, 0, 1.3, 0));
  const cab = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), ouroM); cab.position.y = 2.45; est.add(cab);
  est.add(meshBox(1.4, 0.18, 0.18, ouroM, 0, 1.9, 0)); // braços abertos (bênção)
  g.add(est);

  // BANCOS (2 colunas × 3 fileiras) virados pro altar + tapete central
  const mad = mat(0x6e4a2a);
  for (const bx of [-4.7, 4.7]) for (let fz = -2; fz <= 6; fz += 4) { // corredor central largo (renascer confortavel)
    const banco = new THREE.Group(); banco.position.set(bx, 0, fz);
    banco.add(meshBox(3.4, 0.16, 0.9, mad, 0, 0.62, 0));
    banco.add(meshBox(3.4, 0.8, 0.14, mad, 0, 1.0, 0.45));
    [-1.4, 1.4].forEach((px) => banco.add(meshBox(0.16, 0.62, 0.8, mad, px, 0.31, 0)));
    g.add(banco);
    colisores.push({ minX: x + bx - 1.7, maxX: x + bx + 1.7, minZ: z + fz - 0.5, maxZ: z + fz + 0.6 });
  }
  const tapete = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, prof - 4), mat(0x8a2a2a));
  tapete.position.set(0, 0.13, 1); g.add(tapete);

  // VELAS nos cantos (chama emissiva)
  [[-hx + 1.2, -hz + 1.4], [hx - 1.2, -hz + 1.4], [-hx + 1.2, hz - 1.6], [hx - 1.2, hz - 1.6]].forEach(([vx, vz]) => {
    const cand = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.5, 8), pedraEsc);
    cand.position.set(vx, 0.75, vz); g.add(cand);
    const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 8), mat(0xf0ead8));
    vela.position.set(vx, 1.65, vz); g.add(vela);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffb04a, emissive: 0xff7a2a, emissiveIntensity: 1 }));
    chama.position.set(vx, 1.92, vz); g.add(chama);
  });

  // TELHADO duas águas + torre sineira com cruz dourada (somem ao entrar)
  const roof = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-hx - 0.6, 0); shape.lineTo(hx + 0.6, 0); shape.lineTo(0, 4.2); shape.closePath();
  const geoT = new THREE.ExtrudeGeometry(shape, { depth: prof + 1.2, bevelEnabled: false });
  geoT.translate(0, 0, -(prof + 1.2) / 2);
  const telh = new THREE.Mesh(geoT, mat(0x6a4a8a));
  telh.position.y = alt; telh.castShadow = true; roof.add(telh);
  const torre = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4, 2.6), pedra);
  torre.position.set(0, alt + 4.4, -hz + 2.4); torre.castShadow = true; roof.add(torre);
  const topoT = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.2, 4), mat(0x6a4a8a));
  topoT.position.set(0, alt + 7.5, -hz + 2.4); topoT.rotation.y = Math.PI / 4; roof.add(topoT);
  const cv = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.6, 0.22), ouroM); cv.position.set(0, alt + 9.3, -hz + 2.4); roof.add(cv);
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.22), ouroM); ch.position.set(0, alt + 9.5, -hz + 2.4); roof.add(ch);
  g.add(roof);

  // marcador 🏛️ flutuante
  const cnv = document.createElement('canvas'); cnv.width = 128; cnv.height = 128;
  const cx2 = cnv.getContext('2d'); cx2.font = '90px Arial'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle'; cx2.fillText('🏛️', 64, 70);
  const marc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthTest: false }));
  marc.scale.set(2.6, 2.6, 1); marc.position.y = alt + 11; marc.renderOrder = 997; g.add(marc);

  const box = { minX: x - hx + 0.5, maxX: x + hx - 0.5, minZ: z - hz + 0.5, maxZ: z + hz - 0.5 };
  return {
    grupo: g, colisores,
    animados: [{ mesh: cristal, pulsa: cristalMat, gira: 0.8, fase: 0 }],
    casa: { roof, box, px: x, pz: z + hz, aberta: true }, // sem porta: o templo é sempre aberto
    interativo: { x, z: z - hz + 4, raio: 4.2, titulo: '🏛️ Altar Sagrado', acao: 'Orar 🙏', msg: 'Uma paz profunda toma conta de você. É aqui que os caídos renascem.' },
  };
}

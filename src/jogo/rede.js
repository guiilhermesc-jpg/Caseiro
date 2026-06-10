// =============================================================
//  REDE (multiplayer)  ·  cliente WebSocket do jogo Venor.
//  Conecta ao servidor, envia o estado do jogador local ~12x/seg
//  e renderiza os OUTROS jogadores (avatar + nome flutuante),
//  interpolando posições/rotação para um movimento suave.
//  Reconecta sozinho se a conexão cair.
// =============================================================
import * as THREE from 'three';
import { criaAvatar, animaAvatar } from './avatar.js';

// Crachá de nome flutuante: textura de canvas em um Sprite
// (sprites sempre olham para a câmera, sem custo de orientação).
function criaNomeSprite(texto) {
  const cnv = document.createElement('canvas');
  cnv.width = 256; cnv.height = 64;
  const ctx = cnv.getContext('2d');
  ctx.font = 'bold 34px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const larg = Math.min(248, ctx.measureText(texto).width + 28);
  ctx.fillStyle = 'rgba(10,16,24,.62)';
  ctx.fillRect((256 - larg) / 2, 14, larg, 36);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(texto, 128, 33);
  const tex = new THREE.CanvasTexture(cnv);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(2.6, 0.65, 1);
  sp.position.y = 3.7;
  sp.renderOrder = 999;
  return sp;
}

export function conectarRede({ url, scene, getEstadoLocal }) {
  const outros = new Map(); // id -> { grupo, alvo, anim, tempoAnim, escalaAlvo }
  let id = null;
  let ws = null;
  let aberto = false;
  let acumEnvio = 0;
  let tentativas = 0;
  let fechadoDeProposito = false;

  function adicionaOutro(e) {
    if (e.id === id || outros.has(e.id)) return;
    const grupo = criaAvatar(e.cores || {});
    grupo.position.set(e.x ?? 0, e.y ?? 0, e.z ?? 0);
    grupo.rotation.y = e.rotY ?? 0;
    grupo.add(criaNomeSprite(e.nome || '???'));
    scene.add(grupo);
    outros.set(e.id, {
      grupo,
      alvo: { x: grupo.position.x, y: grupo.position.y, z: grupo.position.z, rotY: grupo.rotation.y },
      anim: e.anim || {},
      cor: e.cores?.casaco ?? 0x888888, // cor do ponto no minimapa
      nome: e.nome || '???',
      coresSig: JSON.stringify(e.cores || {}),
      tempoAnim: 0,
      escalaAlvo: 1,
    });
  }

  function atualizaOutro(e) {
    let o = outros.get(e.id);
    if (!o) { adicionaOutro(e); o = outros.get(e.id); if (!o) return; }
    // mudou de aparência (cor/modelo/sexo)? recria o boneco mantendo posição
    const sig = JSON.stringify(e.cores || {});
    if (sig !== o.coresSig) {
      const pos = o.grupo.position.clone(), rotY = o.grupo.rotation.y, sy = o.grupo.scale.y;
      scene.remove(o.grupo);
      const novo = criaAvatar(e.cores || {});
      novo.position.copy(pos); novo.rotation.y = rotY; novo.scale.y = sy;
      novo.add(criaNomeSprite(o.nome));
      scene.add(novo);
      o.grupo = novo; o.coresSig = sig; o.cor = e.cores?.casaco ?? o.cor;
    }
    o.alvo.x = e.x ?? o.alvo.x;
    o.alvo.y = e.y ?? o.alvo.y;
    o.alvo.z = e.z ?? o.alvo.z;
    o.alvo.rotY = e.rotY ?? o.alvo.rotY;
    o.anim = e.anim || {};
    o.escalaAlvo = o.anim.abx ? 0.6 : 1;
  }

  function removeOutro(idRem) {
    const o = outros.get(idRem);
    if (!o) return;
    scene.remove(o.grupo);
    o.grupo.traverse((n) => {
      if (n.material) { n.material.map?.dispose?.(); n.material.dispose?.(); }
      n.geometry?.dispose?.();
    });
    outros.delete(idRem);
  }

  function conecta() {
    try { ws = new WebSocket(url); } catch { agendaReconexao(); return; }
    ws.onopen = () => { aberto = true; tentativas = 0; };
    ws.onmessage = (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.tipo === 'init') {
        id = msg.id;
        (msg.jogadores || []).forEach(adicionaOutro);
      } else if (msg.tipo === 'estado') {
        atualizaOutro(msg);
      } else if (msg.tipo === 'saiu') {
        removeOutro(msg.id);
      }
    };
    ws.onclose = () => { aberto = false; if (!fechadoDeProposito) agendaReconexao(); };
    ws.onerror = () => { try { ws.close(); } catch { /* ignora */ } };
  }

  function agendaReconexao() {
    tentativas++;
    const espera = Math.min(8000, 1000 * tentativas);
    setTimeout(() => { if (!fechadoDeProposito) conecta(); }, espera);
  }

  conecta();

  function atualiza(dt) {
    // 1) envia o estado local ~12x/seg
    acumEnvio += dt;
    if (aberto && acumEnvio >= 1 / 12) {
      acumEnvio = 0;
      const e = getEstadoLocal();
      if (e) { try { ws.send(JSON.stringify({ tipo: 'estado', ...e })); } catch { /* ignora */ } }
    }
    // 2) interpola e anima os outros jogadores
    const k = Math.min(1, dt * 12);
    for (const [, o] of outros) {
      const g = o.grupo;
      g.position.x += (o.alvo.x - g.position.x) * k;
      g.position.y += (o.alvo.y - g.position.y) * k;
      g.position.z += (o.alvo.z - g.position.z) * k;
      // rotação pelo caminho mais curto
      let d = o.alvo.rotY - g.rotation.y;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      g.rotation.y += d * k;
      g.scale.y += (o.escalaAlvo - g.scale.y) * k;
      o.tempoAnim += dt;
      animaAvatar(g, !!o.anim.mov, o.tempoAnim, !!o.anim.corr);
    }
  }

  function desconecta() {
    fechadoDeProposito = true;
    try { ws && ws.close(); } catch { /* ignora */ }
    for (const idRem of [...outros.keys()]) removeOutro(idRem);
  }

  return {
    atualiza,
    desconecta,
    outros,
    get id() { return id; },
    get conectado() { return aberto; },
  };
}

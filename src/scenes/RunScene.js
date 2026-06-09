// =============================================================
//  A SIRENE (a corrida)  ·  o coração da Camada 1.
//  Toque para andar. Pegue itens (limite de mochila) e leve
//  ao abrigo. Toque nas pessoas para que corram pro abrigo.
//  Mapa em apartamento + atmosfera, áudio, animação e partículas.
// =============================================================
import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { gameState } from '../state/gameState.js';
import { ITENS, RARIDADE, MAX_ITENS_MAPA } from '../data/itens.js';
import { FAMILIARES } from '../data/pessoas.js';
import { COMODOS, ABRIGO_RECT } from '../data/comodos.js';
import { sirene, coleta, deposito, tique, impacto } from '../systems/sons.js';

export class RunScene extends Phaser.Scene {
  constructor() { super('Run'); }

  create() {
    const tun = CONFIG.corrida;
    this.tempoRestante = tun.duracaoSegundos;
    this.pesoMochila = 0;
    this.mochila = [];      // itens coletados, ainda NÃO salvos
    this.coletaveis = [];   // o que está no mapa para pegar
    this.acabou = false;
    this.sireneIntensa = false;
    this.estaMovendo = false;
    this.bobT = 0;

    // limites verticais da área jogável (entre os HUDs)
    this.areaTopo = 250;
    this.areaBase = 1060;

    this.preparaTexturas();
    this.desenhaMapa();
    this.criaAbrigo();
    this.distribuiItens();
    if (gameState.modo === 'familia') this.distribuiFamilia();
    this.criaJogador();
    this.criaVinheta();
    this.criaHUD();
    this.criaBordaSirene();
    this.criaInput();
    this.flashSirene();
  }

  // gera uma textura de partícula (disco branco) uma única vez
  preparaTexturas() {
    if (this.textures.exists('particula')) return;
    try {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(6, 6, 6);
      g.generateTexture('particula', 12, 12);
      g.destroy();
    } catch (e) { /* sem partículas, segue o jogo */ }
  }

  // ---------- mapa ----------
  desenhaMapa() {
    const { largura } = CONFIG;
    this.add.rectangle(largura / 2, (this.areaTopo + this.areaBase) / 2,
      largura, this.areaBase - this.areaTopo + 12, 0x0e1318).setDepth(-3);

    const piso = this.add.graphics().setDepth(-2);
    const mob = this.add.graphics().setDepth(-1);

    COMODOS.forEach((c) => {
      piso.fillStyle(c.cor, 1);
      piso.fillRoundedRect(c.x, c.y, c.w, c.h, 10);
      piso.lineStyle(3, CONFIG.cores.comodoBorda, 1);
      piso.strokeRoundedRect(c.x, c.y, c.w, c.h, 10);

      this.add.text(c.x + 12, c.y + 8, c.nome, {
        fontFamily: 'Arial', fontSize: '20px', color: '#5b6878',
      }).setDepth(0);

      c.moveis.forEach((m) => {
        const mx = c.x + m.fx * c.w;
        const my = c.y + m.fy * c.h;
        const mw = m.fw * c.w;
        const mh = m.fh * c.h;
        mob.fillStyle(CONFIG.cores.movel, 1);
        mob.fillRoundedRect(mx, my, mw, mh, 6);
        mob.lineStyle(2, CONFIG.cores.movelBorda, 1);
        mob.strokeRoundedRect(mx, my, mw, mh, 6);
        if (m.ic) {
          this.add.text(mx + mw / 2, my + mh / 2, m.ic, { fontSize: '22px' })
            .setOrigin(0.5).setAlpha(0.85).setDepth(0);
        }
      });
    });
  }

  criaAbrigo() {
    const r = ABRIGO_RECT;
    this.abrigoRect = new Phaser.Geom.Rectangle(r.x, r.y, r.w, r.h);
    const g = this.add.graphics().setDepth(-1);
    g.fillStyle(CONFIG.cores.abrigo, 1);
    g.fillRoundedRect(r.x, r.y, r.w, r.h, 10);
    g.lineStyle(3, CONFIG.cores.abrigoBorda, 1);
    g.strokeRoundedRect(r.x, r.y, r.w, r.h, 10);

    const nome = gameState.abrigo === 'proprio' ? 'PORÃO' : 'ABRIGO';
    this.add.text(this.abrigoRect.centerX, this.abrigoRect.centerY, '⛨ ' + nome, {
      fontFamily: 'Arial', fontSize: '28px', color: '#bfeccf',
    }).setOrigin(0.5).setDepth(0);
  }

  pontoEm(c) {
    const m = 34;
    return {
      x: Phaser.Math.Between(c.x + m, c.x + c.w - m),
      y: Phaser.Math.Between(c.y + m, c.y + c.h - m),
    };
  }

  distribuiItens() {
    let spawns = [];
    ITENS.forEach((it) => {
      const r = RARIDADE[it.raridade] || RARIDADE.comum;
      const q = Phaser.Math.Between(r.qtdMin, r.qtdMax);
      for (let i = 0; i < q; i++) spawns.push(it);
    });
    Phaser.Utils.Array.Shuffle(spawns);
    spawns = spawns.slice(0, MAX_ITENS_MAPA); // teto -> escassez

    spawns.forEach((it) => {
      const r = RARIDADE[it.raridade] || RARIDADE.comum;
      const pref = COMODOS.filter((c) => c.itens && c.itens.includes(it.id));
      const comodo = pref.length
        ? Phaser.Utils.Array.GetRandom(pref)
        : Phaser.Utils.Array.GetRandom(COMODOS);
      const p = this.pontoEm(comodo);

      const objs = [];
      if (it.raridade === 'raro') {
        objs.push(this.add.circle(p.x, p.y, 27, r.borda, 0.18).setDepth(1)); // halo dourado
      }
      if (this.textures.exists('item_' + it.id)) {
        const spr = this.add.image(p.x, p.y, 'item_' + it.id).setDepth(2);
        spr.setDisplaySize(46, 46);
        objs.push(spr);
      } else {
        const circ = this.add.circle(p.x, p.y, 20, it.cor)
          .setStrokeStyle(r.larguraBorda, r.borda, r.alphaBorda).setDepth(2);
        const ic = this.add.text(p.x, p.y, it.icone, { fontSize: '26px' }).setOrigin(0.5).setDepth(2);
        objs.push(circ, ic);
      }
      this.coletaveis.push({ tipo: 'item', dado: it, x: p.x, y: p.y, objs, pego: false });
    });
  }

  distribuiFamilia() {
    FAMILIARES.forEach((f) => {
      const comodo = Phaser.Utils.Array.GetRandom(COMODOS);
      const p = this.pontoEm(comodo);
      const objs = [];
      if (this.textures.exists('pessoa_' + f.id)) {
        const spr = this.add.image(p.x, p.y, 'pessoa_' + f.id).setDepth(2);
        spr.setDisplaySize(58, 58);
        objs.push(spr);
      } else {
        objs.push(this.add.circle(p.x, p.y, 24, 0xc98b3a).setStrokeStyle(3, 0xffd98a).setDepth(2));
        objs.push(this.add.text(p.x, p.y, f.icone, { fontSize: '30px' }).setOrigin(0.5).setDepth(2));
      }
      objs.push(this.add.text(p.x, p.y + 34, f.nome, {
        fontFamily: 'Arial', fontSize: '18px', color: '#ffd98a',
      }).setOrigin(0.5).setDepth(2));
      this.coletaveis.push({ tipo: 'pessoa', dado: f, x: p.x, y: p.y, objs, pego: false });
    });
  }

  criaJogador() {
    const x = this.abrigoRect.centerX - 150;
    const y = this.abrigoRect.centerY - 8;
    this.jogador = this.add.container(x, y).setDepth(5);
    this.jogadorSombra = this.add.ellipse(0, 20, 44, 16, 0x000000, 0.4);

    let corpo;
    if (this.textures.exists('pessoa_jogador')) {
      corpo = this.add.image(0, 0, 'pessoa_jogador');
      corpo.setDisplaySize(58, 58);
    } else {
      const glow = this.add.circle(0, 0, 30, CONFIG.cores.jogador, 0.22);
      const c = this.add.circle(0, 0, 20, CONFIG.cores.jogador).setStrokeStyle(3, 0xffffff, 0.9);
      corpo = this.add.container(0, 0, [glow, c]);
    }
    this.jogadorCorpo = corpo;
    this.jogador.add([this.jogadorSombra, corpo]);
    this.alvo = { x, y };
  }

  // vinheta de atmosfera (escurece as bordas)
  criaVinheta() {
    const { largura, altura } = CONFIG;
    if (!this.textures.exists('vinheta')) {
      try {
        const c = document.createElement('canvas');
        c.width = largura; c.height = altura;
        const cx = c.getContext('2d');
        const grad = cx.createRadialGradient(
          largura / 2, altura / 2, altura * 0.30,
          largura / 2, altura / 2, altura * 0.64,
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.58)');
        cx.fillStyle = grad;
        cx.fillRect(0, 0, largura, altura);
        this.textures.addCanvas('vinheta', c);
      } catch (e) { return; }
    }
    this.add.image(largura / 2, altura / 2, 'vinheta').setDepth(8);
  }

  // ---------- HUD ----------
  criaHUD() {
    const { largura, altura } = CONFIG;

    this.add.rectangle(largura / 2, 70, largura, 140, CONFIG.cores.painel).setDepth(10);
    this.txtTimer = this.add.text(largura / 2, 46, '', {
      fontFamily: 'Arial Black', fontSize: '60px', color: CONFIG.cores.texto,
    }).setOrigin(0.5).setDepth(11);

    const cap = CONFIG.corrida.capacidadeMochila;
    const sw = 42, gap = 7;
    const total = cap * sw + (cap - 1) * gap;
    const startX = (largura - total) / 2 + sw / 2;
    this.slotRects = [];
    for (let i = 0; i < cap; i++) {
      const x = startX + i * (sw + gap);
      this.slotRects.push(
        this.add.rectangle(x, 110, sw, sw, CONFIG.cores.slotVazio)
          .setStrokeStyle(2, CONFIG.cores.slotBorda).setDepth(11),
      );
    }
    this.slotIcons = [];

    const by = altura - 96;
    this.add.rectangle(largura / 2, by, largura, 196, CONFIG.cores.painel).setDepth(10);
    const btn = this.add.rectangle(largura / 2, by, 470, 92, 0x2a3a2e)
      .setStrokeStyle(2, CONFIG.cores.abrigoBorda)
      .setInteractive({ useHandCursor: true }).setDepth(11);
    this.add.text(largura / 2, by, 'TRANCAR O ABRIGO', {
      fontFamily: 'Arial', fontSize: '32px', color: '#bfeccf',
    }).setOrigin(0.5).setDepth(12);
    btn.on('pointerup', () => this.terminar('manual'));

    this.atualizaHUD();
    this.desenhaMochila();

    this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
        if (this.acabou) return;
        this.tempoRestante--;
        this.atualizaHUD();
        if (this.tempoRestante <= 15 && !this.sireneIntensa) this.intensificaSirene();
        if (this.tempoRestante <= 5 && this.tempoRestante > 0) tique();
        if (this.tempoRestante <= 0) this.terminar('tempo');
      },
    });
  }

  atualizaHUD() {
    const m = Math.floor(this.tempoRestante / 60);
    const s = this.tempoRestante % 60;
    this.txtTimer.setText('⏱ ' + `${m}:${s.toString().padStart(2, '0')}`);
    this.txtTimer.setColor(this.tempoRestante <= 15 ? CONFIG.cores.perigo : CONFIG.cores.texto);
  }

  desenhaMochila() {
    const cap = CONFIG.corrida.capacidadeMochila;
    this.slotIcons.forEach((t) => t.destroy());
    this.slotIcons = [];
    this.slotRects.forEach((r) => r.setFillStyle(CONFIG.cores.slotVazio, 1));

    let slot = 0;
    this.mochila.forEach((it) => {
      const first = slot;
      for (let k = 0; k < it.peso && slot < cap; k++, slot++) {
        this.slotRects[slot].setFillStyle(it.cor, 0.55);
      }
      if (first < cap) {
        const r = this.slotRects[first];
        this.slotIcons.push(
          this.add.text(r.x, r.y, it.icone, { fontSize: '22px' }).setOrigin(0.5).setDepth(12),
        );
      }
    });
  }

  // ---------- input ----------
  criaInput() {
    this.input.on('pointerdown', (p) => {
      if (this.acabou) return;
      if (p.y < this.areaTopo - 6 || p.y > this.areaBase + 6) return;
      this.alvo = { x: p.x, y: Phaser.Math.Clamp(p.y, this.areaTopo, this.areaBase) };
    });
    this.teclas = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
  }

  // ---------- loop ----------
  update(time, delta) {
    if (this.acabou) return;
    this.moveJogador(delta);
    this.animaJogador(delta);
    this.checaColeta();
    this.checaDeposito();
  }

  moveJogador(delta) {
    const tun = CONFIG.corrida;
    const v = tun.velocidadeJogador * (delta / 1000);
    const px = this.jogador.x, py = this.jogador.y;

    let dx = 0, dy = 0;
    const t = this.teclas;
    if (t.A.isDown || t.LEFT.isDown) dx -= 1;
    if (t.D.isDown || t.RIGHT.isDown) dx += 1;
    if (t.W.isDown || t.UP.isDown) dy -= 1;
    if (t.S.isDown || t.DOWN.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      this.jogador.x += (dx / len) * v;
      this.jogador.y += (dy / len) * v;
      this.alvo = { x: this.jogador.x, y: this.jogador.y };
    } else {
      const ax = this.alvo.x - this.jogador.x;
      const ay = this.alvo.y - this.jogador.y;
      const dist = Math.hypot(ax, ay);
      if (dist > 2) {
        const passo = Math.min(v, dist);
        this.jogador.x += (ax / dist) * passo;
        this.jogador.y += (ay / dist) * passo;
      }
    }

    const { largura } = CONFIG;
    this.jogador.x = Phaser.Math.Clamp(this.jogador.x, 28, largura - 28);
    this.jogador.y = Phaser.Math.Clamp(this.jogador.y, this.areaTopo, this.areaBase);
    this.estaMovendo = Math.hypot(this.jogador.x - px, this.jogador.y - py) > 0.4;
  }

  animaJogador(delta) {
    if (!this.jogadorCorpo) return;
    this.bobT += delta / 1000;
    if (this.estaMovendo) {
      const b = Math.abs(Math.sin(this.bobT * 14));
      this.jogadorCorpo.y = -b * 5;
      if (this.jogadorSombra) this.jogadorSombra.scaleX = 1 - b * 0.18;
    } else {
      this.jogadorCorpo.y = 0;
      if (this.jogadorSombra) this.jogadorSombra.scaleX = 1;
    }
  }

  checaColeta() {
    const tun = CONFIG.corrida;
    this.coletaveis.forEach((c) => {
      if (c.pego) return;
      const d = Math.hypot(c.x - this.jogador.x, c.y - this.jogador.y);
      if (d >= tun.raioColeta) return;

      if (c.tipo === 'item') {
        if (this.pesoMochila + c.dado.peso > tun.capacidadeMochila) return; // não cabe
        this.pesoMochila += c.dado.peso;
        this.mochila.push(c.dado);
        const raro = c.dado.raridade === 'raro';
        this.flutua(c.x, c.y, raro ? '★ raro!' : '+1', raro ? '#ffd24a' : '#9fe6b0');
        this.flashColeta(c.x, c.y, c.dado.cor);
        this.particulas(c.x, c.y, c.dado.cor);
        coleta(raro);
        this.desenhaMochila();
      } else {
        gameState.salvos.pessoas++;
        this.flutua(c.x, c.y, '✓ a salvo', '#ffd98a');
        this.flashColeta(c.x, c.y, 0xffd98a);
        this.particulas(c.x, c.y, 0xffd98a);
        coleta(false);
      }
      c.pego = true;
      c.objs.forEach((o) => o.destroy());
    });
  }

  checaDeposito() {
    if (this.mochila.length === 0) return;
    if (!Phaser.Geom.Rectangle.Contains(this.abrigoRect, this.jogador.x, this.jogador.y)) return;
    this.mochila.forEach((it) => gameState.salvos.itens.push(it.id));
    this.mochila = [];
    this.pesoMochila = 0;
    this.flutua(this.abrigoRect.centerX, this.abrigoRect.top - 14, 'guardado!', '#9fe6b0');
    deposito();
    this.desenhaMochila();
  }

  // ---------- efeitos ----------
  particulas(x, y, cor) {
    if (!this.textures.exists('particula')) return;
    try {
      const e = this.add.particles(x, y, 'particula', {
        speed: { min: 50, max: 170 },
        angle: { min: 0, max: 360 },
        lifespan: 420,
        scale: { start: 0.9, end: 0 },
        quantity: 10,
        tint: cor,
        emitting: false,
      });
      e.setDepth(19);
      e.explode(10, x, y);
      this.time.delayedCall(520, () => e.destroy());
    } catch (err) { /* sem partículas, segue */ }
  }

  flutua(x, y, texto, cor) {
    const t = this.add.text(x, y, texto, {
      fontFamily: 'Arial', fontSize: '24px', color: cor,
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: y - 46, alpha: 0, duration: 720, onComplete: () => t.destroy() });
  }

  flashColeta(x, y, cor) {
    const ring = this.add.circle(x, y, 12).setStrokeStyle(3, cor, 1).setDepth(19);
    this.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
  }

  criaBordaSirene() {
    const { largura, altura } = CONFIG;
    this.bordaSirene = this.add.rectangle(largura / 2, altura / 2, largura - 6, altura - 6)
      .setStrokeStyle(8, CONFIG.cores.sirene).setDepth(28).setAlpha(0);
    this.tweenSirene = this.tweens.add({
      targets: this.bordaSirene, alpha: 0.30, duration: 950, yoyo: true, repeat: -1,
    });
  }

  intensificaSirene() {
    this.sireneIntensa = true;
    if (this.tweenSirene) this.tweenSirene.stop();
    this.bordaSirene.setStrokeStyle(12, CONFIG.cores.sirene);
    this.tweenSirene = this.tweens.add({
      targets: this.bordaSirene, alpha: 0.75, duration: 420, yoyo: true, repeat: -1,
    });
  }

  flashSirene() {
    const { largura, altura } = CONFIG;
    sirene();
    this.cameras.main.shake(600, 0.004);

    const o = this.add.rectangle(largura / 2, altura / 2, largura, altura, 0xff0000, 0.28).setDepth(30);
    this.tweens.add({ targets: o, alpha: 0, duration: 950, onComplete: () => o.destroy() });

    const aviso = this.add.text(largura / 2, (this.areaTopo + this.areaBase) / 2, '🚨 SIRENE!\ncorra', {
      fontFamily: 'Arial Black', fontSize: '56px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5).setDepth(31);
    this.tweens.add({ targets: aviso, alpha: 0, delay: 650, duration: 750, onComplete: () => aviso.destroy() });
  }

  // ---------- fim ----------
  terminar(motivo) {
    if (this.acabou) return;
    this.acabou = true;
    gameState.fimMotivo = motivo; // 'tempo' | 'manual'
    impacto();
    this.cameras.main.shake(420, 0.012);
    this.cameras.main.fade(450, 0, 0, 0);
    this.time.delayedCall(480, () => this.scene.start('Result'));
  }
}

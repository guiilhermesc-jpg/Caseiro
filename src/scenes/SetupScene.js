// =============================================================
//  SETUP  ·  as escolhas que moldam a partida.
//  (companhia + tipo de abrigo). Cada escolha mostra sua
//  consequência, pra dar peso à decisão.
// =============================================================
import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { gameState } from '../state/gameState.js';
import { criaBotao } from '../ui/widgets.js';
import { desbloquearAudio } from '../systems/sons.js';

export class SetupScene extends Phaser.Scene {
  constructor() { super('Setup'); }

  create() {
    const { largura, altura } = CONFIG;
    const cx = largura / 2;

    this.add.text(cx, 110, 'ANTES DA SIRENE', {
      fontFamily: 'Arial Black', fontSize: '54px', color: CONFIG.cores.texto,
    }).setOrigin(0.5);
    this.add.text(cx, 162, 'cada escolha muda a sua partida', {
      fontFamily: 'Arial', fontSize: '28px', color: CONFIG.cores.textoFraco,
    }).setOrigin(0.5);

    // ---- Pergunta 1: companhia ----
    this.add.text(cx, 290, 'Quem está com você?', {
      fontFamily: 'Arial', fontSize: '36px', color: CONFIG.cores.destaque,
    }).setOrigin(0.5);

    this.btnSozinho = criaBotao(this, cx - 172, 390, 'Sozinho',
      () => this.escolheModo('sozinho'), { largura: 300 });
    this.btnFamilia = criaBotao(this, cx + 172, 390, 'Família',
      () => this.escolheModo('familia'), { largura: 300 });

    this.descModo = this.add.text(cx, 470, '', {
      fontFamily: 'Arial', fontSize: '26px', color: CONFIG.cores.textoFraco,
      align: 'center', wordWrap: { width: largura - 110 },
    }).setOrigin(0.5, 0);

    // ---- Pergunta 2: abrigo ----
    this.add.text(cx, 640, 'Para onde correr?', {
      fontFamily: 'Arial', fontSize: '36px', color: CONFIG.cores.destaque,
    }).setOrigin(0.5);

    this.btnProprio = criaBotao(this, cx - 172, 740, 'Seu porão',
      () => this.escolheAbrigo('proprio'), { largura: 300, fontSize: '30px' });
    this.btnComunitario = criaBotao(this, cx + 172, 740, 'Abrigo\ncomunitário',
      () => this.escolheAbrigo('comunitario'), { largura: 300, fontSize: '28px' });

    this.descAbrigo = this.add.text(cx, 820, '', {
      fontFamily: 'Arial', fontSize: '26px', color: CONFIG.cores.textoFraco,
      align: 'center', wordWrap: { width: largura - 110 },
    }).setOrigin(0.5, 0);

    // ---- iniciar ----
    criaBotao(this, cx, altura - 130, 'TOCAR A SIRENE  ▶', () => {
      desbloquearAudio();
      this.scene.start('Run');
    }, { cor: 0x3a2030, corHover: 0x4a2838, largura: 470 });

    // estado inicial destacado
    this.escolheModo(gameState.modo);
    this.escolheAbrigo(gameState.abrigo);
  }

  escolheModo(modo) {
    gameState.modo = modo;
    this.descModo.setText(modo === 'sozinho'
      ? 'Mais ágil e leve — mas ninguém para ajudar, e a solidão pesa no abrigo.'
      : 'Mais mãos e mais vínculo — mas mais bocas para alimentar e proteger.');
    this.realca(this.btnSozinho, modo === 'sozinho');
    this.realca(this.btnFamilia, modo === 'familia');
  }

  escolheAbrigo(abrigo) {
    gameState.abrigo = abrigo;
    this.descAbrigo.setText(abrigo === 'proprio'
      ? 'Porão: privado e mais seguro — porém os recursos são só os seus.'
      : 'Igreja/escola: mais suprimentos e gente — mas tensão, ruído e risco de rebelião.');
    this.realca(this.btnProprio, abrigo === 'proprio');
    this.realca(this.btnComunitario, abrigo === 'comunitario');
  }

  realca(btn, ativo) {
    const fundo = btn.list[0];
    fundo.setStrokeStyle(ativo ? 4 : 2, ativo ? 0x3ad17a : 0x3a4654);
  }
}

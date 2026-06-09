// =============================================================
//  MENU  ·  tela de título.
// =============================================================
import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { gameState } from '../state/gameState.js';
import { criaBotao } from '../ui/widgets.js';
import { desbloquearAudio } from '../systems/sons.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { largura, altura } = CONFIG;
    const cx = largura / 2;

    this.add.text(cx, altura * 0.28, 'PROJETO\nSIRENE', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '92px', color: CONFIG.cores.texto, align: 'center',
      lineSpacing: -10,
    }).setOrigin(0.5);

    this.add.text(cx, altura * 0.28 + 130, 'sobreviver à guerra · protótipo (Camada 1)', {
      fontFamily: 'Arial', fontSize: '28px', color: CONFIG.cores.textoFraco,
    }).setOrigin(0.5);

    // sinal de alerta pulsando
    const alerta = this.add.text(cx, altura * 0.50, '⚠', { fontSize: '110px' }).setOrigin(0.5);
    this.tweens.add({ targets: alerta, alpha: 0.25, duration: 750, yoyo: true, repeat: -1 });

    criaBotao(this, cx, altura * 0.66, 'NOVO JOGO', () => {
      desbloquearAudio();
      gameState.reset();
      this.scene.start('Setup');
    });

    this.add.text(cx, altura - 64, 'um drama de sobrevivência civil', {
      fontFamily: 'Arial', fontSize: '26px', color: CONFIG.cores.textoFraco,
    }).setOrigin(0.5);
  }
}

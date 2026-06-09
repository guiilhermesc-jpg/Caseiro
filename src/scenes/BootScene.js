// =============================================================
//  BOOT  ·  carrega as ilustrações que existirem e segue pro Menu.
//  Sem ilustração, o jogo usa os placeholders (emoji/forma).
// =============================================================
import Phaser from 'phaser';
import { SPRITES_ITENS, SPRITES_PESSOAS } from '../data/sprites.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    SPRITES_ITENS.forEach((id) => this.load.image('item_' + id, `assets/itens/${id}.png`));
    SPRITES_PESSOAS.forEach((id) => this.load.image('pessoa_' + id, `assets/personagens/${id}.png`));

    // não trava se um arquivo faltar
    this.load.on('loaderror', (file) => {
      console.warn('[Projeto Sirene] sprite não encontrado: ' + file.key + ' (usando placeholder)');
    });
  }

  create() {
    this.scene.start('Menu');
  }
}

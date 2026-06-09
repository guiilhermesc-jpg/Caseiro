// =============================================================
//  PONTO DE ENTRADA  ·  cria o jogo e registra as cenas.
// =============================================================
import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { gameState } from './state/gameState.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { SetupScene } from './scenes/SetupScene.js';
import { RunScene } from './scenes/RunScene.js';
import { ResultScene } from './scenes/ResultScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: CONFIG.largura,
  height: CONFIG.altura,
  backgroundColor: CONFIG.cores.fundo,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, SetupScene, RunScene, ResultScene],
});

// --- apoio a depuração durante o desenvolvimento (remover antes de publicar) ---
if (typeof window !== 'undefined') {
  window.__game = game;
  window.__state = gameState;
}

export default game;

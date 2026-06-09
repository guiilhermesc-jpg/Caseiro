// =============================================================
//  WIDGETS DE UI  ·  peças reutilizáveis (botões etc.)
// =============================================================
import { CONFIG } from '../config.js';

// Cria um botão retangular com rótulo, hover e feedback de toque.
// Retorna um Container; o fundo é container.list[0].
export function criaBotao(scene, x, y, label, onClick, opts = {}) {
  const largura = opts.largura ?? 420;
  const altura = opts.altura ?? 92;
  const corBase = opts.cor ?? 0x222a34;
  const corHover = opts.corHover ?? 0x2f3a47;

  const cont = scene.add.container(x, y);

  const fundo = scene.add.rectangle(0, 0, largura, altura, corBase)
    .setStrokeStyle(2, 0x3a4654)
    .setInteractive({ useHandCursor: true });

  const txt = scene.add.text(0, 0, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: opts.fontSize ?? '34px',
    color: CONFIG.cores.texto,
    align: 'center',
    wordWrap: { width: largura - 36 },
  }).setOrigin(0.5);

  cont.add([fundo, txt]);
  cont.setSize(largura, altura);

  fundo.on('pointerover', () => fundo.setFillStyle(corHover));
  fundo.on('pointerout', () => fundo.setFillStyle(corBase));
  fundo.on('pointerdown', () => {
    scene.tweens.add({ targets: cont, scale: 0.96, duration: 70, yoyo: true });
  });
  fundo.on('pointerup', () => onClick());

  return cont;
}

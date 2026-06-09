// =============================================================
//  RESULTADO  ·  o que entrou no abrigo + um prognóstico
//  (gancho narrativo que vira a Camada 2: o abrigo).
// =============================================================
import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { gameState } from '../state/gameState.js';
import { ITENS } from '../data/itens.js';
import { criaBotao } from '../ui/widgets.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  create() {
    const { largura, altura } = CONFIG;
    const cx = largura / 2;

    this.add.text(cx, 110, 'A SIRENE PAROU', {
      fontFamily: 'Arial Black', fontSize: '58px', color: CONFIG.cores.texto,
    }).setOrigin(0.5);

    const motivo = gameState.fimMotivo === 'tempo'
      ? 'O tempo acabou. O que estava na sua mão ficou para trás.'
      : 'Você trancou o abrigo. Agora é esperar — e racionar.';
    this.add.text(cx, 168, motivo, {
      fontFamily: 'Arial', fontSize: '26px', color: CONFIG.cores.textoFraco,
      align: 'center', wordWrap: { width: largura - 110 },
    }).setOrigin(0.5);

    // conta os itens salvos
    const cont = {};
    gameState.salvos.itens.forEach((id) => { cont[id] = (cont[id] || 0) + 1; });

    this.add.text(cx, 250, 'NO ABRIGO', {
      fontFamily: 'Arial', fontSize: '30px', color: CONFIG.cores.destaque,
    }).setOrigin(0.5);

    let y = 308;
    if (gameState.modo === 'familia') {
      this.add.text(cx, y, `👪  Pessoas salvas: ${gameState.salvos.pessoas} / 3`, {
        fontFamily: 'Arial', fontSize: '30px', color: CONFIG.cores.texto,
      }).setOrigin(0.5);
      y += 52;
    }

    if (Object.keys(cont).length === 0) {
      this.add.text(cx, y, 'Nada. O abrigo está vazio.', {
        fontFamily: 'Arial', fontSize: '28px', color: CONFIG.cores.perigo,
      }).setOrigin(0.5);
      y += 50;
    } else {
      Object.entries(cont).forEach(([id, q]) => {
        const it = ITENS.find((i) => i.id === id);
        const nome = it ? it.nome : id;
        const icone = it ? it.icone : '•';
        this.add.text(cx, y, `${icone}  ${nome}   ×${q}`, {
          fontFamily: 'Arial', fontSize: '30px', color: CONFIG.cores.texto,
        }).setOrigin(0.5);
        y += 46;
      });
    }

    // prognóstico (semente da Camada 2)
    const tem = (id) => (cont[id] || 0) > 0;
    const prog = [];
    if (!tem('agua') && !tem('comida')) prog.push('Sem água nem comida, os primeiros dias serão brutais.');
    else if (tem('agua') && tem('comida')) prog.push('Com água e comida, você ganha alguns dias.');
    if (tem('remedio')) prog.push('O kit de remédios pode salvar uma vida.');
    if (tem('documentos') && tem('dinheiro')) prog.push('Documentos + dinheiro: uma rota de fuga é possível.');
    if (tem('combustivel')) prog.push('Com combustível, a fuga de carro entra no mapa.');
    if (tem('joias')) prog.push('Joias valem ouro no mercado negro.');
    if (prog.length === 0) prog.push('A sobrevivência vai depender de cada decisão lá dentro.');

    this.add.text(cx, y + 18, prog.join('\n'), {
      fontFamily: 'Arial', fontSize: '26px', color: '#9fb0c0',
      align: 'center', wordWrap: { width: largura - 130 }, lineSpacing: 6,
    }).setOrigin(0.5, 0);

    criaBotao(this, cx, altura - 230, 'PRÓXIMO: O ABRIGO   (Camada 2)', () => {
      this.mostraEmBreve();
    }, { cor: 0x1f2730, largura: 540, fontSize: '28px' });

    criaBotao(this, cx, altura - 118, 'JOGAR DE NOVO', () => {
      this.scene.start('Menu');
    }, { largura: 540 });
  }

  mostraEmBreve() {
    const { largura, altura } = CONFIG;
    const t = this.add.text(largura / 2, altura - 300, 'O abrigo chega na próxima camada 🙂', {
      fontFamily: 'Arial', fontSize: '24px', color: CONFIG.cores.destaque,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200, yoyo: true, hold: 1200, onComplete: () => t.destroy() });
  }
}

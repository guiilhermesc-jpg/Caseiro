// =============================================================
//  CONFIG GLOBAL  ·  todos os "dials" do jogo ficam aqui.
//  Mexer nestes números muda o equilíbrio sem tocar no resto.
// =============================================================
export const CONFIG = {
  // resolução base de design (retrato, formato de celular 9:16).
  // o Phaser escala isso pra qualquer tela mantendo a proporção.
  largura: 720,
  altura: 1280,

  cores: {
    fundo: '#0b0d10',
    painel: 0x161b22,
    parede: 0x2b3440,
    chao: 0x12161c,
    abrigo: 0x1e3a2a,
    abrigoBorda: 0x3ad17a,
    jogador: 0x4aa3ff,
    texto: '#e8eaed',
    textoFraco: '#8b95a3',
    perigo: '#ff5a5a',
    destaque: '#ffcf5a',
    comodoBorda: 0x39485a,
    movel: 0x2c3947,
    movelBorda: 0x47596b,
    sirene: 0xff3b3b,
    slotVazio: 0x1b2430,
    slotBorda: 0x3a4654,
  },

  corrida: {
    duracaoSegundos: 120,   // ajustável: 60 (1 min) … 600 (10 min). 120 = bom ritmo de teste
    capacidadeMochila: 6,   // peso total que cabe na mochila por viagem
    velocidadeJogador: 340, // pixels por segundo
    raioColeta: 34,         // distância pra "encostar" e pegar (menor = mais preciso)
  },
};

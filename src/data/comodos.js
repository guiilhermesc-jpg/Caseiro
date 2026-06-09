// =============================================================
//  LAYOUT DO APARTAMENTO  ·  CONTEÚDO editável (Motor × Conteúdo).
//
//  Cada cômodo é um retângulo (x,y,w,h em coordenadas de tela,
//  base 720x1280). Os móveis são decorativos e ficam em FRAÇÕES
//  (0..1) relativas ao cômodo. 'itens' lista os ids (de
//  data/itens.js) que costumam aparecer ali — dá sentido espacial
//  (comida na cozinha, remédio no banheiro...).
// =============================================================
export const COMODOS = [
  {
    id: 'cozinha', nome: 'cozinha', x: 36, y: 250, w: 318, h: 300, cor: 0x16242e,
    moveis: [
      { fx: 0.08, fy: 0.14, fw: 0.32, fh: 0.16, ic: '🍳' }, // fogão
      { fx: 0.66, fy: 0.12, fw: 0.24, fh: 0.30, ic: '🧊' }, // geladeira
      { fx: 0.28, fy: 0.64, fw: 0.44, fh: 0.22, ic: '🍽️' }, // mesa
    ],
    itens: ['comida', 'agua', 'agua_suja', 'biscoitos', 'fosforos', 'faca'],
  },
  {
    id: 'quarto', nome: 'quarto', x: 366, y: 250, w: 318, h: 300, cor: 0x231c2b,
    moveis: [
      { fx: 0.10, fy: 0.52, fw: 0.52, fh: 0.36, ic: '🛏️' }, // cama
      { fx: 0.68, fy: 0.12, fw: 0.24, fh: 0.40, ic: '🚪' }, // armário
      { fx: 0.10, fy: 0.12, fw: 0.18, fh: 0.16, ic: '💡' }, // criado-mudo
    ],
    itens: ['documentos', 'dinheiro', 'joias', 'cobertor', 'foto_familia', 'livro'],
  },
  {
    id: 'banheiro', nome: 'banheiro', x: 36, y: 562, w: 318, h: 248, cor: 0x14282b,
    moveis: [
      { fx: 0.12, fy: 0.16, fw: 0.22, fh: 0.26, ic: '🚽' },
      { fx: 0.60, fy: 0.14, fw: 0.28, fh: 0.20, ic: '🚰' },
      { fx: 0.58, fy: 0.52, fw: 0.32, fh: 0.36, ic: '🚿' },
    ],
    itens: ['remedio', 'primeiros_socorros', 'alcool', 'agua'],
  },
  {
    id: 'sala', nome: 'sala', x: 366, y: 562, w: 318, h: 248, cor: 0x26221a,
    moveis: [
      { fx: 0.10, fy: 0.58, fw: 0.52, fh: 0.28, ic: '🛋️' }, // sofá
      { fx: 0.68, fy: 0.16, fw: 0.24, fh: 0.30, ic: '📺' }, // tv
      { fx: 0.22, fy: 0.28, fw: 0.26, fh: 0.16, ic: '🪟' }, // estante/janela
    ],
    itens: ['radio', 'lanterna', 'pilhas', 'livro'],
  },
  {
    id: 'garagem', nome: 'garagem', x: 36, y: 822, w: 318, h: 150, cor: 0x1f2024,
    moveis: [
      { fx: 0.10, fy: 0.28, fw: 0.56, fh: 0.50, ic: '🚗' },
      { fx: 0.74, fy: 0.14, fw: 0.18, fh: 0.72, ic: '🧰' },
    ],
    itens: ['ferramentas', 'combustivel', 'lanterna', 'faca', 'pilhas'],
  },
];

// O destino: porão/abrigo (faixa inferior, ao lado da garagem).
export const ABRIGO_RECT = { x: 402, y: 822, w: 282, h: 150 };

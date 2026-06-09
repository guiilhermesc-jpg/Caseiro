// =============================================================
//  CATÁLOGO DE ITENS  ·  AQUI MORA A RIQUEZA DO JOGO.
//
//  Para adicionar um item, acrescente um objeto nesta lista.
//  O motor (corrida, inventário, resultado) lê daqui sozinho.
//
//  Campos:
//    id        identificador único (sem espaços)
//    nome      nome exibido
//    icone     emoji placeholder (vira arte na Camada 5)
//    cor       cor do marcador no mapa (hex 0xRRGGBB)
//    peso      espaço na mochila (1 = leve, 2 = pesado)
//    categoria 'recurso'|'saude'|'ferramenta'|'fuga'|'conforto'|'moral'
//    raridade  'comum'|'incomum'|'raro'  -> controla quanto aparece
//    uso       o que faz (já pensando na Camada 2: o abrigo)
// =============================================================

// Quanto cada raridade aparece + aparência do marcador no mapa.
export const RARIDADE = {
  comum:   { qtdMin: 1, qtdMax: 2, borda: 0x000000, alphaBorda: 0.35, larguraBorda: 2 },
  incomum: { qtdMin: 0, qtdMax: 1, borda: 0xa8c0d8, alphaBorda: 0.95, larguraBorda: 3 },
  raro:    { qtdMin: 0, qtdMax: 1, borda: 0xffd24a, alphaBorda: 1.0,  larguraBorda: 3 },
};

// Teto de itens no mapa por partida (evita lotar; cria escassez).
export const MAX_ITENS_MAPA = 22;

export const ITENS = [
  // ---- recursos (comida / água) ----
  { id: 'agua',       nome: 'Água potável',     icone: '💧', cor: 0x3aa0ff, peso: 1, categoria: 'recurso',    raridade: 'comum',   uso: 'Mata a sede. Essencial.' },
  { id: 'comida',     nome: 'Comida enlatada',  icone: '🥫', cor: 0xe0a030, peso: 1, categoria: 'recurso',    raridade: 'comum',   uso: 'Mata a fome. Dura muito.' },
  { id: 'agua_suja',  nome: 'Água suja',        icone: '🪣', cor: 0x6b8f6b, peso: 1, categoria: 'recurso',    raridade: 'comum',   uso: 'Só serve fervida — arriscada.' },
  { id: 'biscoitos',  nome: 'Biscoitos',        icone: '🍪', cor: 0xd8a860, peso: 1, categoria: 'recurso',    raridade: 'incomum', uso: 'Pouca caloria, mas anima.' },

  // ---- saúde ----
  { id: 'remedio',            nome: 'Remédios',           icone: '💊', cor: 0xff5555, peso: 1, categoria: 'saude', raridade: 'incomum', uso: 'Trata doenças.' },
  { id: 'primeiros_socorros', nome: 'Primeiros socorros', icone: '🩹', cor: 0xff8a8a, peso: 1, categoria: 'saude', raridade: 'raro',    uso: 'Estanca ferimentos graves.' },
  { id: 'alcool',             nome: 'Álcool',             icone: '🧴', cor: 0xc8d0d8, peso: 1, categoria: 'saude', raridade: 'incomum', uso: 'Desinfeta — e troca bem.' },

  // ---- ferramentas ----
  { id: 'radio',       nome: 'Rádio',               icone: '📻', cor: 0x9aa0a6, peso: 2, categoria: 'ferramenta', raridade: 'incomum', uso: 'Notícias e alerta de ataque.' },
  { id: 'lanterna',    nome: 'Lanterna',            icone: '🔦', cor: 0xf0d040, peso: 1, categoria: 'ferramenta', raridade: 'comum',   uso: 'Luz no escuro do abrigo.' },
  { id: 'pilhas',      nome: 'Pilhas',              icone: '🔋', cor: 0x86c232, peso: 1, categoria: 'ferramenta', raridade: 'comum',   uso: 'Energia pro rádio e lanterna.' },
  { id: 'fosforos',    nome: 'Fósforos',            icone: '🔥', cor: 0xff7a30, peso: 1, categoria: 'ferramenta', raridade: 'comum',   uso: 'Fogo: ferver água, aquecer.' },
  { id: 'faca',        nome: 'Faca',                icone: '🔪', cor: 0xb8c0c8, peso: 1, categoria: 'ferramenta', raridade: 'incomum', uso: 'Defesa e utilidade.' },
  { id: 'ferramentas', nome: 'Caixa de ferramentas', icone: '🧰', cor: 0xcf5a3a, peso: 2, categoria: 'ferramenta', raridade: 'incomum', uso: 'Conserta e reforça o abrigo.' },

  // ---- conforto / moral ----
  { id: 'cobertor',     nome: 'Cobertor',         icone: '🧣', cor: 0x9b6bcc, peso: 2, categoria: 'conforto', raridade: 'comum',   uso: 'Protege do frio.' },
  { id: 'livro',        nome: 'Livro',            icone: '📖', cor: 0x7ea0b0, peso: 1, categoria: 'moral',    raridade: 'incomum', uso: 'Distrai e acalma a mente.' },
  { id: 'foto_familia', nome: 'Foto da família',  icone: '🖼️', cor: 0xd9b08c, peso: 1, categoria: 'moral',    raridade: 'raro',    uso: 'Lembra por que resistir.' },

  // ---- fuga / valor ----
  { id: 'documentos',  nome: 'Documentos',  icone: '📄', cor: 0xdddace, peso: 1, categoria: 'fuga', raridade: 'raro',    uso: 'Sem eles, nenhuma fronteira.' },
  { id: 'dinheiro',    nome: 'Dinheiro',    icone: '💵', cor: 0x66cc66, peso: 1, categoria: 'fuga', raridade: 'incomum', uso: 'Compra quase tudo no mercado negro.' },
  { id: 'joias',       nome: 'Joias',       icone: '💎', cor: 0x5fd0e0, peso: 1, categoria: 'fuga', raridade: 'raro',    uso: 'Alto valor: suborno e troca.' },
  { id: 'combustivel', nome: 'Combustível', icone: '⛽', cor: 0xc04040, peso: 2, categoria: 'fuga', raridade: 'raro',    uso: 'A fuga de carro depende disso.' },
];

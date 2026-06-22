// =============================================================
//  DRAGÕES-COMPANHEIRO (RV14) — modelo de DADOS puro (sem THREE, 100%
//  serializável p/ o save). Define espécies, estágios de crescimento LENTO,
//  afinidade dia/noite, poderes e a progressão. O modelo 3D vive em pet.js/
//  ratos.js (criaDragao procedural); aqui é só a "ficha" do bicho.
// =============================================================

// Estágios de crescimento (filhote -> jovem -> adulto). Escala alimenta o
// .scale do modelo procedural; multHP/multDano escalam a força.
export const ESTAGIOS = ['filhote', 'jovem', 'adulto'];
export const ESTAGIO_INFO = {
  filhote: { nome: 'Filhote', escala: 0.30, multHP: 1.0, multDano: 1.0, montaria: false, voa: false, emoji: '🥚' },
  jovem:   { nome: 'Jovem',   escala: 0.62, multHP: 1.9, multDano: 1.7, montaria: true,  voa: false, emoji: '🐲' },
  adulto:  { nome: 'Adulto',  escala: 1.05, multHP: 3.4, multDano: 2.8, montaria: true,  voa: true,  emoji: '🐉' },
};

// Crescimento DIFÍCIL e LENTO: muito XP por estágio (ganha metade do XP do
// herói, então na prática é o dobro disto em caça).
export const XP_JOVEM = 1500, XP_ADULTO = 7000;
export function estagioPorXp(xp) { return xp >= XP_ADULTO ? 'adulto' : (xp >= XP_JOVEM ? 'jovem' : 'filhote'); }
export function proxXp(estagio) { return estagio === 'filhote' ? XP_JOVEM : (estagio === 'jovem' ? XP_ADULTO : XP_ADULTO); }

// Espécies. 'retrato' = arquivo em /assets/dragoes/. raridade guia a domação.
export const ESPECIES_DRAGAO = {
  dragaozinho:       { nome: 'Filhote de Dragão',      baseHP: 70,  baseDano: 9,  afinidade: 'dia',   raridade: 'comum',    cor: 0x6fd06f, retrato: 'noite_filhote' },
  furiaDoDia:        { nome: 'Fúria do Dia',           baseHP: 130, baseDano: 17, afinidade: 'dia',   raridade: 'raro',     cor: 0xf0d878, retrato: 'furia_dia' },
  furiaDaNoite:      { nome: 'Fúria da Noite',         baseHP: 140, baseDano: 19, afinidade: 'noite', raridade: 'raro',     cor: 0x2a2730, retrato: 'furia_noite' },
  dragaoTresCabecas: { nome: 'Dragão de Três Cabeças', baseHP: 240, baseDano: 30, afinidade: 'noite', raridade: 'lendario', cor: 0x7a1f1f, retrato: 'tres_cabecas' },
  colosso:           { nome: 'Colosso',                baseHP: 440, baseDano: 46, afinidade: 'dia',   raridade: 'mitico',   cor: 0x4a3a2a, retrato: 'colosso' },
};

export const PODERES = {
  filhote: ['Baforada de brasa'],
  jovem: ['Sopro de fogo', 'Voo rasante'],
  adulto_dia: ['Aurora Flamejante ☀️', 'Investida Solar', 'Voo Alto'],
  adulto_noite: ['Fúria Noturna 🌙', 'Sopro de Plasma', 'Voo Silencioso'],
};
export function poderesDe(estagio, afinidade) {
  if (estagio === 'adulto') return PODERES['adulto_' + afinidade] || PODERES.adulto_dia;
  return PODERES[estagio] || [];
}

let _seq = 0;
export function novoIdDragao(tempo) { _seq++; return 'd' + Math.floor((tempo || 0) * 1000) + '_' + _seq; }

// cria a ficha de um dragão novo (serializável)
export function criaDragaoData(tipo, afinidade, tempo) {
  const esp = ESPECIES_DRAGAO[tipo] || ESPECIES_DRAGAO.dragaozinho;
  const af = afinidade || esp.afinidade;
  const d = { id: novoIdDragao(tempo), tipo, nome: esp.nome, estagio: 'filhote', xp: 0, nivel: 1, afinidade: af };
  d.hpMax = hpMaxDe(d); d.hp = d.hpMax;
  return d;
}

export function hpMaxDe(d) {
  const esp = ESPECIES_DRAGAO[d.tipo] || ESPECIES_DRAGAO.dragaozinho;
  const est = ESTAGIO_INFO[d.estagio] || ESTAGIO_INFO.filhote;
  return Math.round(esp.baseHP * est.multHP * (1 + (d.nivel - 1) * 0.12));
}

// snapshot completo p/ UI/combate (deriva tudo da ficha)
export function statsDragao(d) {
  if (!d) return null;
  const esp = ESPECIES_DRAGAO[d.tipo] || ESPECIES_DRAGAO.dragaozinho;
  const est = ESTAGIO_INFO[d.estagio] || ESTAGIO_INFO.filhote;
  return {
    tem: true, id: d.id, tipo: d.tipo, nome: esp.nome,
    estagio: d.estagio, estagioNome: est.nome, escala: est.escala, emoji: est.emoji,
    montaria: est.montaria, voa: est.voa,
    nivel: d.nivel, xp: d.xp, prox: proxXp(d.estagio),
    afinidade: d.afinidade, cor: esp.cor, raridade: esp.raridade,
    img: '/assets/dragoes/' + esp.retrato + '.png',
    hp: d.hp != null ? d.hp : hpMaxDe(d), hpMax: hpMaxDe(d),
    dano: Math.round(esp.baseDano * est.multDano),
    poderes: poderesDe(d.estagio, d.afinidade),
  };
}

// ganha XP (LENTO) — sobe nível e evolui estágio. Devolve {evoluiu, estagio, nome}.
export function ganhaXpDragao(d, n) {
  if (!d) return null;
  const antes = d.estagio;
  d.xp = (d.xp || 0) + n;
  d.nivel = 1 + Math.floor(d.xp / 250);
  d.estagio = estagioPorXp(d.xp);
  d.hpMax = hpMaxDe(d);
  if (d.hp == null || d.estagio !== antes) d.hp = d.hpMax; // cura ao evoluir
  return { evoluiu: d.estagio !== antes, estagio: d.estagio, nome: (ESPECIES_DRAGAO[d.tipo] || {}).nome };
}

// =============================================================
//  CALENDARIO DE VENOR
//  Regras simples, mas com valor de jogo: nem todo vendedor existe sempre.
// =============================================================

export const DIAS_VENOR = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Dias reais por enquanto: deixa o teste simples e cria rotina semanal.
// Quando o mundo tiver tempo persistente por conta, esta funcao vira "dia do save".
export function diaVenor(date = new Date()) {
  const indice = date.getDay();
  return {
    indice,
    nome: DIAS_VENOR[indice],
    chave: DIAS_VENOR[indice].toLowerCase(),
  };
}

export const MASCATE_DIAS = new Set([2, 4, 6]); // terca, quinta, sabado
export const MASCATE_POSTOS = [
  { x: 122, z: 17, nome: 'Acampamento do Portão Leste' },
  { x: 210, z: -17, nome: 'Fogueira da Ponte Velha' },
  { x: 382, z: 19, nome: 'Curva da Estrada de Thais' },
];

export function mascateHoje(date = new Date()) {
  const dia = diaVenor(date);
  const aberto = MASCATE_DIAS.has(dia.indice);
  const posto = MASCATE_POSTOS[dia.indice % MASCATE_POSTOS.length];
  return {
    aberto,
    dia,
    posto,
    texto: aberto
      ? `Hoje é ${dia.nome}: Zé das Rotas está em ${posto.nome}.`
      : `Hoje é ${dia.nome}: o mascate não montou acampamento. Volte na terça, quinta ou sábado.`,
  };
}

export function modificadorEscassezPorDia(date = new Date()) {
  const d = diaVenor(date).indice;
  // Pequena oscilacao previsivel: cria janela de oportunidade sem quebrar economia.
  return [1.08, 1.0, 0.96, 1.04, 0.98, 1.1, 1.02][d] || 1;
}

export function precoCompra(base, date = new Date()) {
  return Math.max(1, Math.round(base * modificadorEscassezPorDia(date)));
}

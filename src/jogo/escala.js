// =============================================================
//  ESCALA DO MUNDO (RV12.4) — fator GLOBAL ancorado no Vilarejo (0,0).
//  Multiplicar toda coordenada-mundo por FATOR_ESCALA AFASTA as cidades
//  (estilo Tibia) sem deixá-las maiores: preserva direções e a geometria
//  relativa (deserto colado em Thais, estradas conectadas), só estica as
//  DISTÂNCIAS. Tabela CIDADES central = fonte única (fim dos literais soltos).
//
//  SEGURANÇA: começa em 1.0 (efeito NULO = jogo idêntico). Subir o fator só
//  depois que TODOS os subsistemas lerem esc(); senão coords não-migradas
//  viram órfãs (bicho no vazio, cidade em colina). Migração faseada.
// =============================================================
export const FATOR_ESCALA = 1.0; // 1.0 = idêntico. Tibia-alvo ~1.6–1.9.
export const esc = (v) => v * FATOR_ESCALA;

// Centros das cidades (valores ATUAIS — a fonte única que o resto deve ler).
export const CIDADES = {
  vilarejo:  { cx: 0,    cz: 0 },
  venore:    { cx: -330, cz: -30 },
  thais:     { cx: 560,  cz: 0 },
  noctaria:  { cx: -620, cz: -30 },
  santuario: { cx: -742, cz: -30 },
  pico:      { cx: 110,  cz: 300 },
  deserto:   { cx: 595,  cz: -310 },
};

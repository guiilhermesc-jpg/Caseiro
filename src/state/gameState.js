// =============================================================
//  ESTADO DA PARTIDA  ·  o que sobrevive de uma cena pra outra.
//  Aqui guardamos as escolhas do jogador e o que ele salvou.
//  (Na Camada 2 isso vira a base do abrigo e dos dias.)
// =============================================================
export const gameState = {
  modo: 'sozinho',      // 'sozinho' | 'familia'
  abrigo: 'proprio',    // 'proprio' | 'comunitario'
  salvos: { itens: [], pessoas: 0 },
  fimMotivo: null,      // 'tempo' | 'manual'

  reset() {
    this.modo = 'sozinho';
    this.abrigo = 'proprio';
    this.salvos = { itens: [], pessoas: 0 };
    this.fimMotivo = null;
  },
};

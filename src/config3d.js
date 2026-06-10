// =============================================================
//  CONFIG 3D  ·  dials do jogo 3D (estilo Roblox).
// =============================================================
export const CONFIG3D = {
  velocidade: 12,     // velocidade de caminhada (unidades/seg)
  limiteMundo: 900,   // raio inicial do mundo (Thais fica a ~560 de Venore — viagem longa de verdade)
  cores: {
    ceu: 0x1a2230,    // céu/atmosfera sombria de guerra
    chao: 0x39424f,   // asfalto/concreto
  },
  // URL do servidor multiplayer (Railway).
  // Em localhost o jogo ignora isto e usa ws://localhost:8080.
  servidorMP: 'wss://venor-servidor-production.up.railway.app',
};

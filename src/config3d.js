// =============================================================
//  CONFIG 3D  ·  dials do jogo 3D (estilo Roblox).
// =============================================================
export const CONFIG3D = {
  velocidade: 12,     // velocidade de caminhada (unidades/seg)
  limiteMundo: 78,    // até onde o avatar pode andar (raio)
  cores: {
    ceu: 0x1a2230,    // céu/atmosfera sombria de guerra
    chao: 0x39424f,   // asfalto/concreto
  },
  // URL do servidor multiplayer (Railway). Preencher após o deploy:
  // ex.: 'wss://venor-servidor-production.up.railway.app'
  // Em localhost o jogo ignora isto e usa ws://localhost:8080.
  servidorMP: '',
};

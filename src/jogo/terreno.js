// =============================================================
//  TERRENO · colinas procedurais (estilo Low Poly Environment Pack).
//  alturaColinas(x,z) é a FONTE ÚNICA da altura do campo: a malha do
//  chão (cidade.js) e a física do avatar/bichos (main3d.js) leem a
//  MESMA função — nada flutua, nada afunda.
//  Zonas PLANAS (cidades, estrada, praia, água, POIs) têm altura 0 com
//  borda suave; a Montanha do Dragão tem perfil próprio no main3d.
// =============================================================

// retângulos planos [minX, minZ, maxX, maxZ]
const RETS = [
  [-92, -80, 92, 80],        // Venore (grade + casas entráveis + arredores)
  [-50, -122, 50, -76],      // Bairro do Comércio
  [-12, -198, 12, -106],     // trilha da praia
  [-242, -420, 242, -176],   // praia + mar
  [56, -22, 512, 22],        // estrada Venore→Thais (acampamentos/marcos inclusos)
  [164, -138, 196, 78],      // Rio Fundo + margens
  [-64, 54, 80, 106],        // riacho + lago norte + cais + farol + cachoeira
  [84, 24, 130, 62],         // fazenda (cenouras, poço, burro, coelho)
  [110, -80, 152, -42],      // cemitério abandonado
  [236, 34, 270, 62],        // acampamento bandido
  [384, -88, 418, -52],      // ruínas da estrada
  [134, 232, 168, 268],      // ruínas do norte
  [-198, -108, -162, -72],   // ruínas do sudoeste
  [492, -74, 642, 70],       // Thais (muralha + casario + praça)
  [-424, -150, -236, 92],    // VENORE, a Cidade Mercante (RV4.1: distrito norte + armazéns + brejo)
  [-258, -52, -82, -8],      // Estrada do Pântano (vilarejo → Venore)
];
// círculos planos [cx, cz, raio]
const CIRCS = [
  [-95, -55, 27], [100, 95, 29], [-105, 70, 25], [-75, -110, 26], // lagos
  [45, 80, 27],     // lago norte (reforço além do retângulo)
  [225, -95, 28],   // Pântano da Serpente
  [40, 330, 46],    // Covil do Dragão
  [110, 300, 58],   // Montanha do Dragão (perfil próprio em alturaTerreno)
];
// o relevo morre suavemente nas bordas do mundo (a malha do chão cobre
// exatamente esta região; fora dela o plano-horizonte é raso)
export const REGIAO = { minX: -430, maxX: 830, minZ: -490, maxZ: 490 };

const BORDA = 18; // metros de rampa entre o plano e a colina

export function alturaColinas(x, z) {
  // distância até a zona plana mais próxima (0 = dentro de uma)
  let d = 1e9;
  for (let i = 0; i < RETS.length; i++) {
    const r = RETS[i];
    const dx = Math.max(r[0] - x, x - r[2], 0);
    const dz = Math.max(r[1] - z, z - r[3], 0);
    if (dx === 0 && dz === 0) return 0;
    const di = Math.sqrt(dx * dx + dz * dz);
    if (di < d) d = di;
  }
  for (let i = 0; i < CIRCS.length; i++) {
    const c = CIRCS[i];
    const di = Math.hypot(x - c[0], z - c[1]) - c[2];
    if (di <= 0) return 0;
    if (di < d) d = di;
  }
  const fb = Math.min((x - REGIAO.minX) / 60, (REGIAO.maxX - x) / 60, (z - REGIAO.minZ) / 60, (REGIAO.maxZ - z) / 60);
  if (fb <= 0) return 0;
  let m = Math.min(d / BORDA, 1, fb);
  m = m * m * (3 - 2 * m); // smoothstep (rampa suave, sem degrau)
  // duas oitavas de ondulação (comprimentos ~140u e ~300u) — só MORROS
  // (nunca cava abaixo de 0: praia/água/sobreposições ficam intactas)
  const n = Math.sin(x * 0.045 + 2.3) * Math.cos(z * 0.038 - 1.1) * 0.6
          + Math.sin(x * 0.021 - 0.7) * Math.cos(z * 0.024 + 0.4) * 0.4;
  return Math.pow(Math.max(0, n * 0.5 + 0.5), 1.5) * 3.6 * m;
}

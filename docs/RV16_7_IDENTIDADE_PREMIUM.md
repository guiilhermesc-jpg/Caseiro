# RV16.7 - Identidade Premium

Versao: RV16.7 (v118)  
Status: implementado no `main`, sem deploy.

## Objetivo

Comecar a repaginacao sistemica que o maestro pediu: tudo que ja existe precisa passar pela nova identidade,
dos bueiros aos interiores, bichos, mapa, UI e economia. Esta rodada ataca microdetalhes urbanos e cria
o cronograma que impede qualquer parte do jogo de ficar esquecida.

## Entregue

1. **Cronograma de identidade**
   - Criado `docs/CRONOGRAMA_IDENTIDADE_PREMIUM.md`.
   - As imagens de interior, criaturas e continente viraram trilhas formais de implementacao.
   - Regra registrada: imagem oficial precisa representar sistema real do jogo.

2. **Bueiros e ruas**
   - `detalhaRua()` agora desenha bueiros com tampa maior, moldura metalica, barras de grade e mancha de umidade.
   - Vapor dos bueiros ficou mais presente e com mais particulas.
   - O ganho vale para as ruas do vilarejo, Venore, Noctaria e demais trechos que usam o helper.

3. **Props com mais materialidade**
   - Barris ganharam tampas, frisos verticais e leitura de madeira/ferro.
   - Caixas ganharam travessas diagonais e selo visual.
   - Baus ganharam ferragens, cantos metalicos e moedas visiveis.

4. **Patch/offline**
   - `main3d.js` subiu para `RV16.7 (v118)`.
   - `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js` apontam para o RV16.7.
   - Cache offline subiu para `venor-rv16-7-offline-v1`.

## Arquivos principais

- `src/main3d.js`
- `src/jogo/cidade.js`
- `src/jogo/props.js`
- `src/jogo/patchNotes.js`
- `docs/CRONOGRAMA_IDENTIDADE_PREMIUM.md`
- `public/patches/rv16-7-identidade-premium.png`

## Criterios de aceite

1. Selo da tela mostra `RV16.7 (v118)`.
2. Painel de patch abre como `PATCH RV16.7`.
3. Bueiros deixam de parecer retangulo simples.
4. Barris, caixas e baus tem mais leitura de objeto de RPG.
5. Build passa sem erro.

## Proximas frentes recomendadas

1. RV16.8: interiores como realidade.
2. RV16.9: bichos e hunts como realidade.
3. RV16.10: continente e viagens.
4. RV16.11: moradias, aluguel e economia.

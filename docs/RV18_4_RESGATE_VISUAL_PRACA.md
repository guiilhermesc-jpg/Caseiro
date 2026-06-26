# RV18.4 - Resgate Visual da Praca

Motivo: o mundo jogavel ainda nao correspondia ao nivel das imagens oficiais. A primeira vista da
praca estava escura, com casas pesadas demais, fonte sem contexto suficiente e leitura visual abaixo
da promessa premium.

## Entrega real no canvas

- `src/main3d.js`: selo subiu para `RV18.4 (v136)`.
- Ciclo dia/noite ficou mais legivel: mais exposicao, mais luz ambiente, mais alcance de neblina e lampioes ativos tambem em mobile com intensidade reduzida.
- `src/jogo/cidade.js`: luz base da vila ficou mais quente, fog menos fechado e ruas/praca menos escuras.
- Praca inicial ganhou camada nobre real: bordas de pedra, canteiros baixos, flores, lampioes pequenos e composicao mais intencional.
- Casario de Venor ganhou paleta menos escura, escala um pouco maior e menos telhados pretos.
- `src/jogo/construcoes.js`: janelas passaram de vidro frio para luz quente; casas ganharam enxaimel mais visivel em todas as fachadas.

## Regra reforcada

Imagem oficial nao pode ser tratada como "arte bonita solta". Se ela cria expectativa, o mundo jogavel
precisa caminhar naquela direcao antes de novas promessas visuais.

## Proxima etapa

Validar no navegador publicado quando o maestro autorizar deploy. Se a primeira vista ainda estiver
distante, continuar em RV18.4.x antes de voltar para patcher/ranking/nuvem.

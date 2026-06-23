# RV16.4 - Luz & Detalhe

Versao: RV16.4 (v115)  
Status: implementado no `main`, sem deploy.

## Objetivo

Fazer a arte oficial se aproximar mais do que existe dentro do jogo. Esta rodada nao cria site ainda: a ideia
do portal estilo Tibia, com noticias, contas, personagens e progresso, fica planejada para o Patch 17.

## Entregue

1. **Arte oficial do patch**
   - Novo key art em `public/patches/rv16-4-luz-detalhe.png`.
   - Conectado em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e cache offline.

2. **Interiores com mais profundidade**
   - Galeria superior visual em mansoes e guildhouse.
   - Escadaria decorativa para dar leitura de segundo andar.
   - Balaustradas e volumes altos para quebrar a sensacao de sala plana.

3. **Iluminacao mais rica**
   - Candelabro central com velas.
   - PointLight no salao.
   - Feixe de luz vindo da porta.
   - Berco/ninho draconico com luz propria.

4. **Mais leitura de valor**
   - Cofre com moedas visiveis.
   - Tapecarias, mapas, quadros, plantas e armaria.
   - O interior comunica propriedade, status e preparacao para viagens/hunts.

## Arquivos principais

- `src/jogo/interiores.js`
- `src/main3d.js`
- `src/jogo/patchNotes.js`
- `public/patches/rv16-4-luz-detalhe.png`
- `public/sw.js`
- `public/manifest.webmanifest`
- `public/baixar.html`

## Criterios de aceite

1. Selo da tela mostra `RV16.4 (v115)`.
2. Painel de patch abre como `PATCH RV16.4`.
3. Build passa sem erro.
4. Interior de mansao/guildhouse mostra mais altura, luz, objetos e leitura de riqueza.
5. A arte oficial reflete elementos que existem no jogo: candelabro, galeria, escada, porta iluminada, cofre e ninho do dragao.

## Proximas frentes recomendadas

1. RV16.5: aluguel semanal com vencimento, renovacao e avisos.
2. RV16.6: hunt regional nova de dragao com territorio proprio.
3. RV16.7: doma de dragao adulto com Coracao/Sela Draconica.
4. Patch 17: site/portal publico com noticias de updates, contas, personagens e rankings.

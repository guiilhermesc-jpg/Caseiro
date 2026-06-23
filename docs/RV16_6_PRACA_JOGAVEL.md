# RV16.6 - Praca Jogavel

Versao: RV16.6 (v117)  
Status: implementado no `main`, sem deploy.

## Objetivo

Transformar a imagem aprovada pelo maestro em contrato visual do jogo. O patch deixa claro que a arte de update
precisa representar algo que o jogador realmente encontra: casas proporcionais, fonte central, praca densa,
props de mercado, vasos, estandartes, escadarias e materialidade de vila medieval.

## Entregue

1. **Arte oficial como alvo de mundo**
   - `public/patches/rv16-6-praca-jogavel.png` reutiliza a arte aprovada pelo maestro.
   - Conectado em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e cache offline.
   - A arte agora representa uma direcao obrigatoria para a praca jogavel, nao so uma tela bonita.

2. **Praca inicial mais densa**
   - Novas escadarias cenicas no eixo templo/escola.
   - Vasos nobres com folhagem e flores nas bordas da praca.
   - Mesas mercantes com pano, pacotes e lampiao.
   - Mais estandartes ao redor sem bloquear o corredor central.

3. **Casario mais proporcional**
   - Casas decorativas do vilarejo cresceram em largura, profundidade e altura.
   - Fachadas de enxaimel ganharam vigas diagonais.
   - Algumas fachadas recebem vegetacao subindo na parede para quebrar o visual de bloco limpo.

4. **Grande Mercado de Venore reforcado**
   - Chafariz da capital recebeu a mesma linguagem de praca viva.
   - Escadarias, vasos, mesas e estandartes criam leitura de centro mercante.
   - Elementos novos foram posicionados nas bordas para evitar travas e sobreposicoes com casas.

5. **Offline-first mantido**
   - Cache subiu para `venor-rv16-6-offline-v1`.
   - O jogo continua instalavel e jogavel solo sem internet; multiplayer segue opcional em fase posterior.

## Arquivos principais

- `src/main3d.js`
- `src/jogo/cidade.js`
- `src/jogo/construcoes.js`
- `src/jogo/patchNotes.js`
- `public/patches/rv16-6-praca-jogavel.png`
- `public/sw.js`
- `public/manifest.webmanifest`
- `public/baixar.html`

## Criterios de aceite

1. Selo da tela mostra `RV16.6 (v117)`.
2. Painel de patch abre como `PATCH RV16.6`.
3. A praca inicial tem mais densidade visual sem fechar o caminho.
4. Casas do vilarejo aparecem maiores e mais medievais.
5. Grande Mercado de Venore tem props e escadarias adicionais.
6. Build passa sem erro.

## Proximas frentes recomendadas

1. RV16.7: aluguel semanal com vencimento, renovacao, beneficios e perda temporaria sem apagar itens.
2. RV16.8: Hunt do Pantano Vivo com territorio proprio do Dragao do Pantano.
3. RV16.9: doma de dragao adulto com Coracao/Sela Draconica e boss de invasao.
4. Patch 17: site/portal publico com noticias, contas, personagens e rankings.

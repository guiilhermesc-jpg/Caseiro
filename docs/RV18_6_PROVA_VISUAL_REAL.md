# RV18.6 - Prova Visual Real de Venor

Objetivo: responder ao problema central apontado pelo maestro: imagem conceitual nao pode ser tratada como entrega se o gameplay real nao mostra a mesma direcao.

Este patch e uma prova publica dentro da primeira praca de Venor, nao uma conversao completa do jogo para nivel premium.

## Entrou no gameplay

- `src/jogo/construcoes.js`: `criaFonte()` aumentou escala, ganhou pedestal, bordas maiores, pilar mais alto, taca superior maior, coroa, quatro gargulas e jatos laterais.
- `src/jogo/cidade.js`: os quatro lotes principais da praca foram substituidos por mansoes/guildhouse maiores, com placas proprias.
- `src/jogo/cidade.js`: o dragao decorativo procedural da praca foi removido para nao manter leitura de prototipo.
- `src/main3d.js`: o modelo GLB de dragao agora tambem aparece em Venor como vitrine perto da Guildhouse, com brasa e animacao viva quando o modelo carrega.
- `src/main3d.js`: luz inicial e exposicao foram ajustadas para a primeira praca ficar clara o bastante para auditoria visual.
- Manifesto, service worker, launcher, portal e install profile subiram para `RV18.6`, build `138`, cache `venor-rv18-6-offline-v1`.

## Nao entrou

- Nao houve troca completa de todas as casas do continente.
- Nao houve troca completa de todos os monstros.
- Nao houve paridade visual com concept art.
- Nao houve sistema novo de voo, launcher nativo ou patcher delta.

## Como auditar

1. Abrir o launcher publico e atualizar o patch.
2. Confirmar no canto inferior esquerdo: `RV18.6 (v138)`.
3. Entrar em Venor e olhar a praca inicial.
4. Procurar especificamente:
   - fonte central maior;
   - mansoes/guildhouse ao redor da praca;
   - dragao GLB visivel perto da Guildhouse;
   - cena mais clara no primeiro carregamento.

Se esses quatro sinais nao aparecerem no navegador do jogador, o problema e cache ou deploy. Se aparecerem mas ainda parecerem insuficientes, o problema e qualidade/estrutura visual e precisa continuar por blocos maiores.

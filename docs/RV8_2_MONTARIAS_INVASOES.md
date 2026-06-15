# RV8.2 - Luzes, Carrocas e Draptor

Data: 2026-06-15

## Objetivo

Elevar a sensacao de mundo vivo: cidades acendem ao anoitecer, viagens ganham
carrocas terrestres, montarias passam a ter ecologia por regiao e o Draptor vira
a primeira montaria realmente aspiracional do jogo.

## Entregue

1. **Cidade acende a noite**
   - postes ganharam emissivo mais forte no ciclo dia/noite;
   - adicionada rede de luzes urbanas emissivas em lojas, templos, portos,
     torres, cidades e pontos de viagem;
   - funciona tambem no mobile, sem depender de muitas PointLights.

2. **Carrocas de viagem**
   - transporte terrestre pago entre Vilarejo, Thais, Venore e Noctaria;
   - barca segue como rota de agua;
   - carroca compra tempo, mas caminhar segue valendo por loot e descoberta.

3. **Montarias exoticas**
   - Coruja Gigante: rara, ligada a torre/rotas noturnas;
   - Morcego Grande: raro, ligado a Noctaria/Ermo das Cinzas;
   - Draptor: montaria rara de invasao;
   - Draptor Lendario: variante mais rara, com brilho e cristas especiais.

4. **Quest da Sela Draconica**
   - quest `A Sela do Draptor`;
   - NPC: Hela;
   - requisito: quest `A Lua Partida` concluida;
   - nivel minimo: 14;
   - pede `Coracao de Obsidiana`;
   - recompensa `Sela Draconica`, item-chave para tentar capturar Draptor.

5. **Invasao aleatoria do Draptor**
   - Draptor pode aparecer como boss em rotas perigosas;
   - chance pequena de variante lendaria;
   - captura rara somente se o jogador tiver feito a quest da sela.

## Criterios de aceite

1. Build passa.
2. Selo mostra `RV8.2 (v58)`.
3. Ao anoitecer, cidade e pontos de viagem ficam visivelmente acesos.
4. Carrocas abrem dialogo e teleportam cobrando moedas.
5. Coruja e morcego aparecem como domaveis raros em seus habitats.
6. Quest da Hela aparece apenas depois de `A Lua Partida`.
7. Invasao do Draptor aparece aleatoriamente e pode ser forcada pelo ciclo do jogo.
8. Draptor derrotado nao respawna como bicho comum; nova aparicao vem de nova invasao.

## Proxima camada premium

Substituir modelos procedurais por GLBs com licenca segura:

- Quaternius Animated Dinosaur Pack: base para Draptor/raptores.
- Quaternius Ultimate Animated Animal Pack: base para montarias terrestres.
- Quaternius Fantasy Props MegaKit / Medieval Village MegaKit: carrocas e props.
- Quaternius Animated Monster Pack / Ultimate Monsters: morcegos e criaturas raras.
- Kenney/Poly Pizza: complementar props, desde que licenca esteja documentada.

Regra: asset externo so entra se houver origem e licenca registrados em
`docs/ASSETS.md`.

# RV8.1 - Jornadas Valiosas

Status: em implementacao
Data: 2026-06-15

## Intencao

Este patch muda a regra de crescimento do mundo: Venor nao deve aumentar por
area, deve aumentar por valor. Toda viagem precisa ter leitura, risco, recompensa
e memoria.

Inspiracoes mecanicas:

- Tibia: cidade, viagem, deposito, casas, loot, morte, hunts e raros.
- Albion: economia, profissao, risco/recompensa e coordenacao de guilda.
- Pokemon/PokeX-like: criatura por habitat, raridade, domar e colecionar.
- Zelda: marco visual, descoberta, preparo e ambiente como problema.
- Minecraft: offline primeiro, online opcional e objetivo criado pelo jogador.

## Entregue nesta rodada

1. `src/jogo/jornadas.js`
   - tabela de rotas principais;
   - tabela de habitats fixos;
   - lista de sistemas RPG prioritarios;
   - funcao `rotasParaMapa()`;
   - funcao `pontosJornadaParaMapa()`;
   - painel visual `criaQuadroJornadas()`.

2. `src/main3d.js`
   - versao atualizada para `RV8.1 (v57)`;
   - minimapa passa a consumir rotas da tabela de jornadas;
   - habitats fixos entram como pontos de mapa;
   - botao `ROTAS` aparece quando o jogo comeca;
   - painel `Jornadas Valiosas` permite marcar destino.

3. Documentacao de produto
   - `docs/SISTEMAS_REFERENCIA_RPG.md`;
   - `docs/GAP_RPG_TIBIA_ALBION.md`;
   - este plano de patch.

## Rotas cadastradas

1. Estrada do Pantano: Vilarejo de Venor -> Venore.
2. Estrada da Vigia: Vilarejo de Venor -> Thais.
3. Trilha do Sal: Vilarejo de Venor -> Praia.
4. Caminho das Cinzas: Venore -> Noctaria.
5. Passagem da Lua Partida: Noctaria -> Santuario.
6. Trilha do Pico: Ruinas -> Pico do Dragao.
7. Passo do Ciclope: Ponte -> Contraforte Norte.
8. Rede de Barcas: Porto -> Cais, com custo de oportunidade.

## Habitats cadastrados

1. Covil dos Lobos da Ponte.
2. Cemiterio Abandonado.
3. Ninho das Aranhas.
4. Ruinas da Estrada.
5. Pico do Dragao.
6. Passo do Ciclope.
7. Brejo Profundo.
8. Santuario da Lua Partida.

## Criterios de aceite

1. Build passa sem erro.
2. Na tela do jogo, o selo mostra `RV8.1 (v57)`.
3. Ao entrar no jogo, o botao `ROTAS` aparece no canto direito.
4. O painel lista rotas e habitats sem quebrar layout no desktop.
5. Clicar em `Marcar destino` cria HUD de destino com distancia.
6. O mapa grande continua abrindo e mostra rotas principais.
7. O jogo continua funcionando offline depois do primeiro carregamento.

## Proximas entregas sobre esta base

### RV8.1.1 - Spawns por habitat

- mover respawn de criaturas para tabela unica;
- cada habitat define horario, quantidade, respawn, raro e loot esperado;
- primeiro alvo: Passo do Ciclope e Estrada da Vigia.

### RV8.1.2 - Casas reais

- lote com id unico;
- posse persistente no save;
- bau privado;
- decoracao modular;
- permissao de familia/grupo;
- aluguel/manutencao simples.

### RV8.1.3 - Profissoes de viagem

- mineracao no Passo do Ciclope;
- herbalismo no Pantano;
- pesca expandida na Trilha do Sal;
- refino basico em Venore;
- material vira receita e mercado.

### RV8.1.4 - Morte calculada

- seguro/bencao compravel em templo;
- perda proporcional por nivel;
- corpo com marcador e tempo claro;
- custo de resgate para quem nao quer buscar.

### RV8.2 - Interiores premium e UI de RPG

- casas ocas e legiveis;
- lojas com funcao e camera confiavel;
- diario de quests;
- painel de personagem;
- painel de casa;
- painel de mercado.

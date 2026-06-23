# RV17 - A Grande Onda

Data: 2026-06-23  
Versao do cliente: `RV17.0 (v121)`  
Status: implementado no `main`, nao publicado sem autorizacao literal do maestro.

## Contrato visual

Arte oficial: `public/patches/rv17-grande-onda.png`.

A imagem representa a direcao real do patch: mago/aventureiro, dragao companheiro,
armas de identidade, ilhas suspensas, monstros de altura e entrada de masmorra. A regra
continua: arte oficial nao pode ser promessa vazia; o que aparece em primeiro plano precisa
virar sistema jogavel ou ficar marcado como pressagio futuro.

## Conteudo entregue

- `src/jogo/nuvens.js`: Aurelia expandida com arquipelago celeste, Jardins Suspensos,
  Portao dos Primeiros Ventos, Mirante do Voo Rasante e Obelisco da Linhagem.
- `src/jogo/nuvens.js`: novo `criaCalaboucoVentos()`, primeira masmorra grande das alturas,
  com salas, corredores, pilares, cristais, altar, boss arena, acessos e retorno para Aurelia.
- `src/jogo/ratos.js`: novas criaturas procedurais:
  - Sentinela Celeste;
  - Golem de Cristal;
  - Wyvern Celeste;
  - Guardiao do Primeiro Vento usando escala de boss.
- `src/main3d.js`: monstros do calabouco com telegraph, tiro magico, loot especial, raros e XP.
- `src/main3d.js`: quests novas:
  - `A Grande Onda` com Ulrion, matando Sentinelas Celestes;
  - `O Primeiro Vento` com Helyra, matando o Guardiao do Primeiro Vento.
- `src/main3d.js`: armas de cla por vocacao, concedidas por Ulrion depois da entrada na Guilda:
  - Cavaleiro: Lamina do Portao Antigo;
  - Paladino: Arco do Horizonte;
  - Feiticeiro: Cajado da Veia Alta;
  - Druida: Cetro de Raiz Viva.
- `src/main3d.js`: save local agora guarda arma de cla concedida e prova de Aurelia.
- `src/jogo/jornadas.js`: rotas e habitats RV17 registrados no quadro de jornadas.
- `patchNotes.js`, `sw.js`, `manifest.webmanifest`, `baixar.html` e `index.html`: RV17 conectado ao PWA/offline.

## Filosofia absorvida das referencias

- Tibia: rotas com valor, risco calculavel, loot economico e quest encadeada.
- World of Warcraft: escala de criatura, boss legivel, sala de encontro e fantasia visual forte.
- Albion: rota, montaria e valor social de deslocamento, sem anular o peso da viagem.

## Voo draconico

O RV17 nao libera voo livre ainda. Ele prepara o sistema:

- Mirante do Voo Rasante existe como marco de treino.
- Dragao adulto montado ganha salto mais alto e queda suavizada em zona aberta.
- Calabouco e ilhas introduzem o vocabulario de altura antes de mapas aereos completos.

Proximas etapas:

1. voo livre com gasto/estamina;
2. zonas aereas com colisao vertical;
3. hunts aereas;
4. ilhas flutuantes gigantes;
5. locais sagrados acessiveis apenas por dragao adulto.

## Testes esperados

1. Build deve passar com `npm run build`.
2. Ao entrar no jogo, patch notes deve mostrar `PATCH RV17` e a imagem `rv17-grande-onda.png`.
3. O quadro `ROTAS` deve mostrar `A Grande Onda` e rotas de Aurelia.
4. Com conta `gm`, testar teleporte/dragao adulto e entrada no portal de Aurelia.
5. No calabouco, conferir colisao de paredes, spawn dos quatro tipos de criatura e retorno para Aurelia.
6. Ulrion deve conceder arma de cla uma vez por save, depois da Guilda.
7. Helyra/Ulrion devem respeitar a cadeia de quests.

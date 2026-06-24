# RV18.3 - Ranking e Personagem Publico

Objetivo: iniciar a camada publica estilo MMO sem depender ainda de servidor novo.

## Entrega

- `public/ranking.html`: hall local de personagens, lendo saves do aparelho.
- `public/personagem.html`: ficha publica local com nivel, XP, ouro, posicao, dragao/pet, imoveis, quests e equipamento.
- `public/portal.html`: link direto para ranking.
- `public/launcher.html`: botao Ranking no app instalado.
- `patch-manifest.json`, `sw.js` e `index.html`: cache RV18.3 com `/ranking.html` e `/personagem.html`.
- `src/main3d.js` e `patchNotes.js`: selo e tela de patch RV18.3.

## Privacidade

- A vitrine nao mostra senha, PIN, hash ou chave completa do save.
- Quando existir ranking em nuvem, a publicacao deve ser opt-in ou usar somente campos seguros.
- Contas locais protegidas aparecem como "conta protegida", sem revelar o segredo.

## Motivo de produto

MMOs fortes fazem o mundo parecer vivo fora do cliente: ranking, personagem, noticias, patch notes e
status de mundo. Esta rodada cria o primeiro esqueleto desse ecossistema sem esperar o backend final.

## Proximo bloco

RV18.4 foi redirecionado para resgate visual da praca apos feedback do maestro. O patcher real passa para RV18.5.

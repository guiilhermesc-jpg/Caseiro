# RV17.1 - Calabouco Vivo

Data: 2026-06-23  
Versao do cliente: `RV17.1 (v122)`  
Status: implementado no `main`, nao publicado sem autorizacao literal do maestro.

## Imagem oficial

Arte oficial: `public/patches/rv17-1-calabouco-vivo.png`.

Esta imagem representa o foco da rodada: transformar o Calabouco dos Primeiros Ventos em
um lugar mais serio, profundo e funcional, com altar de armas, bau, portal, criaturas celestes,
dragao companheiro e caminhos legiveis.

## Entregas

- `src/jogo/nuvens.js`: calabouco ganhou braseiros, faixas no piso, estandartes, luzes de fogo,
  altar com quatro armas distintas e Bau dos Primeiros Ventos.
- `src/main3d.js`: versao subiu para `RV17.1 (v122)`.
- `src/main3d.js`: Bau dos Primeiros Ventos virou recompensa unica por conta, salvo no save local.
- `src/main3d.js`: novo material economico `Fragmento de Asa Antiga`, conectado ao futuro voo draconico.
- `src/jogo/bestiario.js`: nova secao `Criaturas da Grande Onda` com Sentinela Celeste, Golem de Cristal,
  Wyvern Celeste e Guardiao do Primeiro Vento, incluindo funcao e loot.
- `src/jogo/patchNotes.js`, `public/sw.js`, `manifest.webmanifest`, `baixar.html` e `index.html`:
  vitrine/offline atualizados para RV17.1 e nova arte.

## Regras de design aplicadas

- Imagem oficial precisa aparecer no jogo como espaco jogavel, nao so como capa.
- Tesouro raro precisa ser salvo por conta para manter valor.
- Criatura nova precisa ter funcao, loot e lugar no bestiario.
- O voo ainda nao esta livre; `Fragmento de Asa Antiga` e `Mirante do Voo Rasante` sao preparo narrativo e sistemico.

## Testes esperados

1. `npm run build` precisa passar.
2. Tela de patch deve mostrar `PATCH RV17.1` e a imagem `rv17-1-calabouco-vivo.png`.
3. Entrar no Calabouco dos Primeiros Ventos e conferir altar, braseiros, estandartes e bau.
4. Abrir o Bau dos Primeiros Ventos uma vez; recarregar save e confirmar que nao reabre.
5. Abrir o bestiario e conferir a secao `Criaturas da Grande Onda`.

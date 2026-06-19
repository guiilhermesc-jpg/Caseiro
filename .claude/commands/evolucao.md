---
description: Rotina diária de evolução (até 30 min) rumo à disrupção de longo prazo da Bússola
---

Você está executando a **rotina diária de evolução** da Bússola Bitcoin (Regras 1 e 2 do `CLAUDE.md`).
Caixa de tempo: **até 30 minutos** de operação. Entregue **uma fatia pequena, testada e publicada** —
não um épico. Mire sempre o **melhor no longo prazo** (a "Conta Bitcoin Soberana para a vida toda").

Passos:

1. **Contexto (rápido):** leia `CLAUDE.md`, `bussola-bitcoin/docs/12-CONTA-PARA-A-VIDA-TODA.md` e
   `bussola-bitcoin/docs/DIARIO-DE-EVOLUCAO.md`.

2. **Pensar disrupção (5 min):** reflita sobre o que pode virar o "algo super que muda o jogo".
   Se surgir uma ideia nova, registre em "Ideias de disrupção" no diário.

3. **Escolher 1 fatia:** pegue o item do topo de **Próximas etapas** do diário (ou uma ideia de
   disrupção madura) que caiba em ~30 min. Prefira valor real + baixo risco.

4. **Construir testnet-first, custo zero:**
   - Lógica de cripto/carteira → `src/wallet/index.js` **com teste** em `test/wallet.test.mjs`.
   - UI → `assets/app.js`. Depois: `npm run build`, `npm test` (deve dar TODOS OS TESTES OK),
     `node --check assets/app.js`. Suba o cache em `sw.js` se mexeu em arquivos servidos.

5. **Publicar:** commit em `claude/happy-carson-qgzzj8` → PR → **merge squash em `main`**
   (dispara o deploy). Resolva conflito de divergência com `git merge origin/main` +
   `git checkout --ours` (a branch é superset), rebuild, testar, push. Confirme o deploy verde.

6. **Abastecer o diário (Regra 2):** atualize `DIARIO-DE-EVOLUCAO.md`:
   - mova a fatia entregue para **Feito** (com a data de hoje);
   - refresque **Próximas etapas**;
   - registre qualquer **ideia de disrupção** nova.

7. **Fechar:** reporte em 3-5 linhas o que evoluiu, o que está no ar e qual a próxima fatia.
   Se uma decisão for do usuário (ex.: precisa de domínio, mudança de rumo), pergunte antes.

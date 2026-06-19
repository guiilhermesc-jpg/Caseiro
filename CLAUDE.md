# Bússola Bitcoin — guia do agente

App PWA self-custodial (PT-BR) em `bussola-bitcoin/`. Tudo **client-side, testnet-first,
custo operacional zero**. Norte estratégico: `bussola-bitcoin/docs/12-CONTA-PARA-A-VIDA-TODA.md`.

## 🎯 Missão de longo prazo (a disrupção)
Construir a **Conta Bitcoin Soberana para a vida toda**: a pessoa **recebe** privado a vida
inteira (entrada / Silent Payments — "Pix Bitcoin") e a conta **passa sozinha** para os
herdeiros quando ela se vai (saída / herança trustless — "Interruptor da Vida"). Sem empresa,
sem KYC, testável, em português. Inflow + outflow de UMA identidade soberana. **Isso muda o
jogo no longo prazo — para a vida.**

## ♻️ REGRA 1 — Evolução diária (30 min/dia, no máximo)
Todo dia, gastar **até 30 minutos** melhorando o site/app E pensando no que pode virar a
**disrupção máxima** de longo prazo. Não sabemos ainda qual é o "algo super" — então **todo dia
trabalhamos para descobrir e evoluir** em direção a ele. Cada dia entrega **uma fatia pequena,
testada e publicada** (não um épico). O ritual está no comando `/evolucao`.

## 📒 REGRA 2 — Abastecer o diário todo dia
Todo dia, atualizar `bussola-bitcoin/docs/DIARIO-DE-EVOLUCAO.md` com:
1. **O que foi feito** (data + fatia entregue).
2. **O que está previsto/programado** para as próximas etapas (backlog priorizado).
3. **Ideias de disrupção** que surgirem (mesmo cruas) — sempre mirando o melhor no longo prazo.

> Agendamento: o ideal é um **trigger diário** (Claude Code na web) que abra uma sessão
> rodando `/evolucao`. Veja `docs/DIARIO-DE-EVOLUCAO.md` → "Como agendar".

## 🛠️ Convenções de desenvolvimento (siga sempre)
- **Lógica nova de carteira/cripto** vai em `src/wallet/index.js` **com teste** em
  `test/wallet.test.mjs`. UI/orquestração fica em `assets/app.js`.
- Após mexer no `src/wallet`: `npm run build` (gera `assets/vendor/wallet-bundle.js`) e
  **commitar o bundle** (a CI checa que está fresco).
- Rodar `npm test` (deve sair **TODOS OS TESTES OK**) e `node --check assets/app.js`.
- Mexeu em arquivos servidos? **Suba a versão do cache** em `sw.js` (`bussola-vNN`).
- Branch de trabalho: `claude/happy-carson-qgzzj8`. **Publicar = PR → merge squash em `main`**
  (dispara o deploy do GitHub Pages via `.github/workflows/pages.yml`).
- **Conflito de merge** (divergência de squash): a branch é superset da `main` →
  `git merge origin/main`, resolver com `git checkout --ours -- <arquivos>`, rebuild, testar,
  commitar, push. Depois mergear o PR.
- Idioma do produto e dos commits: **português**. Não citar identificadores de modelo em
  artefatos versionados.

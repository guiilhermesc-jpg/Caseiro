# HANDOFF — Venore / Caseiro

Atualizado em 12/06/2026 pelo Codex.

## Estado rápido

- Pasta local: `C:\Users\Pichau\projeto-sirene`
- Repo: `github.com/guiilhermesc-jpg/Caseiro`, branch `main`
- Cliente em produção: `https://caseiro.pages.dev`, ainda no **RV6.5 (v50)**
- `main`: contém **RV6.6→RV7.0 (v51→v55)** sem deploy do cliente
- Servidor Railway: `wss://venor-servidor-production.up.railway.app`
- Código do servidor: `server/` (`ws`, relay multiplayer e contas nome+PIN em `DATA_DIR`)

## Verificação desta rodada

- `src/main3d.js` está no selo **RV7.0 (v55)**.
- A rodada adicionou telegraph/investida para monstros principais: anel de aviso no chão, preparo e avanço curto com dano/veneno conforme espécie.
- `npm.cmd run build` passou e gerou `dist/assets/index-BUnw822Y.js`.
- Smoke local do relay passou com 2 clientes em `ws://localhost:8080`.
- Smoke de produção **não foi reexecutado nesta rodada**: o sandbox bloqueou rede externa e a escalada foi recusada por limite de uso. O checkpoint anterior já mantinha o Railway como OK/revalidado.
- Nenhum deploy foi feito. Não publicar cliente ou servidor sem OK literal do maestro.

## Regras para continuar

1. Ler `docs/CHECKPOINT.md` antes de tocar no código.
2. Conferir `git status --short --branch`.
3. Validar sempre com `npm.cmd run build` no PowerShell.
4. Se mexer no jogo, fazer bump da const `VERSAO` e registrar no diário cronológico do `CHECKPOINT.md`.
5. Para Railway em produção, usar `server/smoke-prod.mjs` para validar; deploy do servidor só com "pode publicar o servidor".

## Próximos candidatos

GLBs CC0 nos slots, interiores restantes, masmorra interna da Fenda/POI autoral, launcher Electron/Tauri, polimento de contas na nuvem e performance mobile medida no aparelho.

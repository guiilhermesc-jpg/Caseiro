# Servidor Multiplayer — Venor / Caseiro

Servidor **relay** de WebSocket. Cada cliente envia seu estado
(`{nome, cores, x, y, z, rotY, anim}`) ~12x/seg; o servidor carimba um `id`
e repassa aos OUTROS jogadores. Guarda o último estado de cada um para que
quem entra veja quem já está online.

## Rodar local
```bash
cd server
npm install
npm start         # ouve em http://localhost:8080 (e ws://localhost:8080)
```
O cliente em `localhost:5173` conecta nele automaticamente.

## Testar o relay (sem abrir o jogo)
```bash
node smoke-test.mjs   # com o servidor rodando: 2 clientes, valida o repasse
```

## Deploy no Railway
1. Railway → **New Project** → **Deploy from GitHub repo** → repo `Caseiro`.
2. **Settings → Root Directory** = `server` (importante: o servidor mora nesta subpasta).
3. Railway roda `npm install` e `npm start` sozinho (Node detectado pelo `package.json`).
4. **Settings → Networking → Generate Domain** → copie a URL pública.
5. No cliente, em `src/config3d.js`, preencha `servidorMP` com `wss://<sua-url>.up.railway.app`.

A porta vem de `process.env.PORT` (definida pelo Railway). Em local cai no 8080.

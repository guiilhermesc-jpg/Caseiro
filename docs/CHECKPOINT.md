# 📌 CHECKPOINT — Jogo "Venore / Caseiro"
> Documento-mestre para **retomar o projeto do zero** sem perder contexto.
> Atualizado: 10/06/2026. Leia este arquivo primeiro ao reabrir o projeto.

---

## 1. O QUE É
Jogo **3D estilo Roblox/Tibia** (web), mundo aberto **sandbox** com cidade **VENORE**,
multiplayer, combate, esgoto, inventário, NPCs com ofício e arredores (lagos, floresta,
montanhas e uma **estrada para uma cidade distante "Thais"**). Sem objetivo único:
o jogador explora, luta, conversa, personaliza. Tibia é **inspiração** (não cópia, não é OT).

## 2. STACK / INFRA
- **Three.js** (3D) + **Vite** (bundler). Node 24, npm, Git. PowerShell no Windows.
- **Pasta:** `C:\Users\Pichau\projeto-sirene` · **Repo:** github.com/guiilhermesc-jpg/Caseiro (branch `main`)
- **Cliente publicado:** https://caseiro.pages.dev (Cloudflare Pages, projeto `caseiro`)
- **Servidor multiplayer:** Railway, projeto **venor-servidor**, plano **Hobby ($5/mês)**
  - URL: **`wss://venor-servidor-production.up.railway.app`** (em `src/config3d.js` › `servidorMP`)
  - Código em `server/` (Node + `ws`, relay de estados). Railway CLI já logado (guiilherme.sc@gmail.com).

## 3. COMO RODAR / PUBLICAR
- **Rodar local:** `npm run dev` → localhost:5173 · servidor MP local: `cd server; npm start` (ws://localhost:8080).
- **Build:** `npm run build` (sempre rodo isto pra validar; **não consigo testar o 3D** — ver §7).
- **Publicar cliente (Cloudflare):** carregar `.env` em `$env:` e `npx wrangler pages deploy dist --project-name=caseiro --commit-dirty=true`.
- **Publicar servidor (Railway):** `cd server` e `railway up --ci`. Gerar domínio: `railway domain`.
- **Git:** `git add -A; git commit; git push` (origin=Caseiro, main).

## 4. SEGREDOS / .env (NÃO versionado)
`OPENAI_API_KEY` (legado) · `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID`.
⚠️ Pendência antiga: o token Cloudflare já apareceu no chat → ideal **revogar e gerar novo**.

## 5. ARQUITETURA (módulos)
- `src/main3d.js` — loop, câmera (zoom no scroll), física/colisão, **combate**, **dia/noite**,
  AÇÃO + **prompt estilo Roblox**, clique p/ interagir, descer/subir esgoto, mapa ajustável.
- `src/config3d.js` — dials: `velocidade`, `limiteMundo` (500, ajustável no jogo), `servidorMP`.
- `src/jogo/cidade.js` — Venore (grade/praça/marcos/casas) + biomas + **mundo ampliado**
  (lagos ao redor, floresta, **montanhas**, **estrada→cidade distante**). Chão com textura; céu segue a câmera.
- `src/jogo/construcoes.js` — prédios, marcos, **janelas variadas** (`criaJanela`), telhados, fonte, banco, poste.
- `src/jogo/props.js` — adornos (barril/caixa/poço/barraca/estátua/canteiro/bandeira) + **itens valiosos** (baú, cristal).
- `src/jogo/natureza.js` — lago/riacho/ponte/juncos/salgueiro/árvore/vitória-régia/pedra/cogumelo/flor + montanha/estrada/placa/cidade distante.
- `src/jogo/interiores.js` — **casas entráveis** (porta na AÇÃO, telhado some ao entrar, mobília, janelas).
- `src/jogo/avatar.js` — boneco com **sexo (M/F)** + **4 modelos** (aldeão/caçador/mago/cavaleiro), outfit no corpo. `criaAvatar(cores)`, `animaAvatar`.
- `src/jogo/controles.js` — mover/câmera/pular/correr/abaixar + botão **AÇÃO** (tecla E).
- `src/jogo/pet.js` — gato/cachorro/coelho (`PETS`).
- `src/jogo/selecao.js` — criação: nome + **sexo + modelo** + cores. `PALETAS` exportado.
- `src/jogo/customizar.js` — editar aparência **no jogo** (clicar em si): cores/sexo/modelo/pet.
- `src/jogo/dialogo.js` — caixa de conversa (NPC).
- `src/jogo/npcs.js` — **elenco de Venore** (11 moradores com ofício/posto/diálogo, modelo por papel).
- `src/jogo/minimapa.js` — **radar** centrado no jogador.
- `src/jogo/inventario.js` — **mochila 20 slots** (empilha) + slots de equipamento (colar/cabeça/tocha/mãos/tronco/anel/pernas/pés).
- `src/jogo/hud.js` — nível + barra de XP + itens.
- `src/jogo/esgoto.js` — subsolo **escuro** (y=-40) com vários acessos/escadas.
- `src/jogo/ratos.js` — rato (esgoto) + **boss cobra/crocodilo** + criaturas de superfície (**troll/ciclope/aranha-gigante+filhotes**).
- `src/jogo/rede.js` — cliente WebSocket (renderiza outros, nomes, interpola, sincroniza modelo/cor).
- `server/index.js` — servidor relay (ws). `server/smoke-test.mjs`, `smoke-prod.mjs` testam o relay.

## 6. O QUE JÁ ESTÁ PRONTO ✅
Cidade Venore + biomas + **mundo ampliado** (lagos, floresta, montanhas, estrada→cidade distante) ·
**Multiplayer** (Railway, jogadores se veem/interagem, nomes flutuantes) · **NPCs com ofício** (padrão Tibia) ·
**Diálogo** · **Clique p/ interagir** · **Customização in-game** (sexo/modelo/cores/pet) ·
**4 modelos de personagem** (M/F, outfit no corpo) · **Interiores** (casas entráveis) ·
**Combate** (graveto = arma; AÇÃO golpeia; loot no corpo; XP/níveis; respawn) ·
**Esgoto escuro + tocha** (todos começam com tocha; tecla T) · **Bueiros/escadas** ·
**Bichos:** rato, boss cobra/croc (esgoto); troll, ciclope, aranha-gigante+filhotes (superfície) ·
**Inventário** (mochila 20 + equip) · **Dia/noite** (lampiões acendem) · **Minimapa radar** ·
**Zoom no scroll** · **Mapa ajustável** (🗺️ +/-) · **Prompt de ação estilo Roblox** · Deploy funcionando.

## 7. MODO DE TRABALHO + LIMITAÇÃO
- **Usuário = MAESTRO** (decide o quê/porquê; quer qualidade, detalhes, complexidade tipo Tibia).
- **Claude = EXECUTOR** (programa/testa via build/deploya; explica simples). Credenciais são sempre do usuário.
- ⚠️ **LIMITAÇÃO CRÍTICA:** o preview do Claude e o navegador automatizado estão com **WebGL desligado**
  → **não consigo ver o 3D nem testar visualmente**. Valido por `npm run build` + smoke tests, e o **MAESTRO testa no Edge**
  (PC) e no **celular/iPad** (link caseiro.pages.dev). Se aparecer "Não foi possível iniciar o 3D", ligar
  Aceleração de Hardware no Chrome (o Edge funciona). Sempre que publico, no PC dar **Ctrl+Shift+R**.

## 8. FILA DE PEDIDOS (próximos, em ordem aproximada)
1. 🎣 **Pesca** nos lagos (espécies reais de rio/lago).
2. 🏠 **Casas compráveis/personalizáveis** (economia + posse).
3. 🏰 **Thais (cidade distante) entrável** + mais conteúdo no caminho.
4. 🐉 **Mais bichos** (beholder, ladrões/"Hauter") + **dano ao jogador / barra de vida**.
5. 🛡️ **Armaduras/itens dropáveis** que equipam nos slots e **aparecem no corpo** por item.
6. 🚪 Porta que **bloqueia** de verdade; túneis sob cada rua.
7. ⚡ **Otimização mobile** (juntar geometrias; reduzir luzes à noite se pesar).
8. 🔒 Rotacionar o token Cloudflare.

## 9. DIÁRIO (marcos recentes)
Multiplayer (Railway) → minimapa → biomas/riacho → interiores → ação/inventário →
combate/esgoto/ratos → esgoto profundo (boss, tocha, várias entradas) → mundo ampliado
(montanhas/estrada/Thais) → NPCs com ofício + dia/noite → 4 modelos de personagem →
bichos da superfície (troll/ciclope/aranha) + tocha inicial.

---
**Para retomar:** leia este arquivo. Estado no GitHub (`Caseiro`/main). Publicar = build + wrangler (cliente) / `railway up` (servidor).

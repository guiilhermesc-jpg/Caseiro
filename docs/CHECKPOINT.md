# 📌 CHECKPOINT — Projeto "Venor / Caseiro"
> Documento-mestre para **retomar o projeto do zero** sem perder contexto.
> Atualizado: 09/06/2026. Leia este arquivo primeiro ao reabrir o projeto.

---

## 1. O QUE É
Jogo **3D estilo Roblox** (web), mundo aberto **sandbox** inspirado no **Tibia**
(mundo com história, **sem objetivo único** — o jogador escolhe o que fazer: viver
sozinho, formar família, juntar-se a grupos; várias formas de "vencer").
- Mundo inicial: a cidade **VENOR** (vilarejo antigo, **normal/não destruído**).
- Origem: começou como survival 2D (inspirado em 60 Seconds!/This War of Mine) e
  **pivotou para 3D estilo Roblox** a pedido do maestro. A pegada de guerra/sobrevivência
  fica guardada como possível **evento futuro** dentro do mundo.

## 2. STACK / TECNOLOGIA
- **Three.js** (3D na web) + **Vite** (bundler/dev server). Node 24, npm, Git.
- **Pasta local:** `C:\Users\Pichau\projeto-sirene`
- **Repo GitHub:** https://github.com/guiilhermesc-jpg/Caseiro
- **Site publicado:** https://caseiro.pages.dev (Cloudflare Pages)
- **Deploy:** por comando, via **Wrangler** (eu rodo). Cloudflare Pages projeto = `caseiro`.

## 3. COMO RODAR / PUBLICAR
- **Rodar local:** `npm run dev` → http://localhost:5173 (host:true → acessível na rede).
- **Build:** `npm run build` → gera `dist/`.
- **Deploy (publicar):** carregar o `.env` nas variáveis e rodar
  `npx wrangler pages deploy dist --project-name=caseiro --commit-dirty=true`.
  (PowerShell carrega o `.env` linha a linha em `$env:` antes de chamar o wrangler.)
- **Git:** `git add -A; git commit -m "..."; git push` (remote `origin` = Caseiro, branch `main`).

## 4. SEGREDOS / .env  (NÃO versionado — está no .gitignore)
- `OPENAI_API_KEY` — legado (era pra arte 2D via gpt-image-1; não usado no 3D).
- `CLOUDFLARE_API_TOKEN` — usado pelo Wrangler pro deploy.
- `CLOUDFLARE_ACCOUNT_ID` — id da conta Cloudflare.
- ⚠️ **PENDÊNCIA DE SEGURANÇA:** o token Cloudflare apareceu no chat uma vez →
  **revogar e gerar um novo** (colar só no `.env`).

## 5. ARQUITETURA DE ARQUIVOS (3D atual)
- `index.html` → carrega `/src/main3d.js` (entry do jogo 3D).
- `src/main3d.js` — loop principal; **modo SELEÇÃO** (boneco girando + overlay) e
  **modo JOGO** (movimento, câmera orbital, física); colisão; câmera anti-oclusão.
- `src/config3d.js` — "dials": `velocidade`, `limiteMundo`, cores.
- `src/jogo/cidade.js` — **Venor**: grade de ruas, praça, marcos, casas, adereços, céu
  (shader gradiente), luz (hemisphere+sol), nuvens. Retorna `{scene, sun, obstaculos,
  solidos, aguas, postes, nuvens, fonteGotas, ...}`.
- `src/jogo/construcoes.js` — peças modulares (materiais cacheados):
  `criaPredio`, `criaMarco` (igreja c/ sino, hospital, delegacia, escola),
  `telhadoDuasAguas`, `criaArvore/criaPinheiro/criaArbusto`, `criaFonte` (2 taças+gotas),
  `criaBanco`, `criaPoste`.
- `src/jogo/avatar.js` — `criaAvatar(cores)` boneco blocky c/ rosto; `animaAvatar`.
- `src/jogo/controles.js` — mover (WASD/joystick esq.), câmera orbital (arrasto dir./mouse),
  `querPular/correndo/abaixado` (Espaço/Shift/C + botões mobile).
- `src/jogo/pet.js` — `criaGato/atualizaGato` (segue o avatar).
- `src/jogo/selecao.js` — overlay de seleção (nome + cores roupa/pele/cabelo).
- **Legado 2D (não usado):** `src/main.js`, `src/scenes/*`, `src/data/*`,
  `src/systems/sons.js`, `src/ui/*`, `public/assets/personagens/jogador.png`,
  `scripts/gerar-arte.mjs`, `docs/ARTE.md|PROMPTS-ARTE.md|SCENARIO-GUIA.md`.

## 6. O QUE JÁ ESTÁ PRONTO ✅
- Cidade Venor em **grade** (ruas padrão), praça central com **fonte viva** (2 taças + jatos).
- Marcos: **igreja** (torre + **sino**), **hospital** (cruz), **delegacia**, **escola**.
- ~20 **casas** diversas (tamanho/cor/altura) **alinhadas** (colisão correta).
- **Telhados de duas águas**, **bancos** (grandes), **postes**, **pinheiros**, **arbustos c/ flores**.
- **Céu em gradiente** + **nuvens** se movendo.
- **Avatar** blocky com **rosto** (olhos/boca/mãos/botas) e **cores escolhíveis**.
- **Controles:** movimento relativo à câmera, **câmera orbital** (gira/vê o céu),
  **pular / correr / abaixar** (botões no mobile + teclas no PC).
- Colisão (não atravessa paredes), **anti-oclusão** de câmera, **anti-afundamento** (pés no chão).
- **Pet gatinho** que segue.
- **Tela de seleção de personagem** (nome + aparência, preview girando).
- **Deploy** funcionando (publicado e atualizável por comando).

## 7. MODO DE TRABALHO
- **Usuário = MAESTRO** (decide o quê/porquê; ainda não programa, entende processos,
  quer segurança e cuidado).
- **Claude = EXECUTOR** (programa, testa, deploya; explica em linguagem simples).
- Ciclo: proponho → maestro aprova/redireciona → construo → publico/mostro.
- Fronteira de segurança: **credenciais/contas/pagamentos são sempre do usuário**
  (criar token, login, billing, colar chave no `.env`). Eu nunca digito credenciais.
- **Limitação conhecida:** o PREVIEW local do Claude esgota contextos WebGL após muitos
  reloads (erros "WebGL context could not be created"). NÃO é bug do jogo. Para validar,
  usar `npm run build` (checa o código) + testar no **site publicado** (navegador real).

## 8. ROADMAP (coordenação — em ordem)
1. **MULTIPLAYER** ← *fase atual desejada*. Todos logados se veem e interagem. (plano §9)
2. **Interiores**: entrar nos prédios (paredes ocas + porta), **andares e subsolos** (escadas).
3. **Polish de qualidade**: proporções, padrões de rua, mais detalhe/vida (NPCs, animais),
   texturas dos ambientes.
4. **Sistemas sandbox (Tibia-like)**: profissões, família/grupo, economia, objetivos múltiplos.
5. **Segurança**: rotacionar o token Cloudflare.
6. **(futuro)** App nativo Android/iOS via Capacitor (se desejado).

## 9. PLANO DO MULTIPLAYER (próxima implementação)
- **Servidor:** Node + **WebSocket** (lib `ws`, ou framework `Colyseus`/`PartyKit`),
  hospedado no **Railway** (o maestro tem conta). Repo/serviço separado ou subpasta `server/`.
- **Sincroniza:** cada cliente envia `{id, nome, cores, x, z, rotY, anim}` ~10–15x/seg;
  o servidor repassa a todos; cada cliente renderiza os OUTROS jogadores (com `criaAvatar`
  usando as cores deles) e **interpola** as posições (movimento suave).
- **Identidade:** já vem da **tela de seleção** (nome + cores) — só conectar e enviar.
- **Cliente (no Three.js):** após "ENTRAR", abre `WebSocket(wss://<app>.up.railway.app)`,
  mantém um mapa `outros[id] = avatarMesh`, atualiza no `onmessage`, remove no disconnect.
  Nome flutuante (sprite/HTML) sobre cada avatar.
- **Deploy:** servidor no **Railway** (precisa: criar serviço, conectar repo OU `railway up`
  via CLI com login/token do usuário — credencial é dele). Cliente no Cloudflare aponta pra
  URL `wss://` do Railway (guardar em `src/config3d.js` ou variável de build).
- **Etapas sugeridas:** (a) servidor echo de posições; (b) cliente conecta + renderiza outros;
  (c) nomes flutuantes; (d) sincronizar aparência/animação; (e) (futuro) chat, salas.

## 10. DIÁRIO RESUMIDO (marcos)
v0.x: protótipo 2D (Phaser) survival → arte graphic novel (OpenAI) → **pivot para 3D**.
v1.0 base 3D (Three.js) · v1.1 colisão+câmera · v1.2 cidade Venor · v1.3 polish/atmosfera ·
v1.4 grade+adereços · v1.5 rosto+pular/correr/abaixar · v1.6 fixes (telhado/fonte/colisão/pet) ·
v1.7 **publicado** (caseiro.pages.dev) · v1.8 **tela de seleção** de personagem.
*(Detalhe completo em `docs/VISAO.md` › Diário de bordo.)*

---
**Para retomar:** leia este arquivo + `docs/VISAO.md`. Estado do código está no GitHub
(`Caseiro`, branch `main`). Próxima tarefa: **multiplayer** (§9).

# 📌 CHECKPOINT — Jogo "Venore / Caseiro"
> Documento-mestre para **retomar o projeto do zero** sem perder contexto.
> Atualizado: 10/06/2026 (fim do dia). Leia este arquivo primeiro ao reabrir o projeto.

---

## 🤝 HANDOFF PARA O PRÓXIMO AGENTE (Codex) — COMECE AQUI
**Missão dada pelo maestro:** corrigir bugs críticos, melhorar qualidade visual/performance e PUBLICAR para teste.

### ✅ REVISÃO PÓS-CODEX (Claude, 10/06 noite) — estado ATUAL
- **Codex entregou 3 commits bons** (`ac5f00f`, `cb97edc`, `0dee0e1`): mobile estabilizado (mediump, pixelRatio 1.08, compileAsync, contexto WebGL protegido), bloom contido (0.16/1.08, exposure 0.74), dragão low-poly novo, bancos da praça pros cantos, casas entráveis reposicionadas, pointer capture nos controles. ⚠️ O último commit dele estava **sem push** (ficava só local — atenção a isso).
- **2 conflitos de geometria do reposicionamento corrigidos por mim** (`b1e30ef`): árvore dentro da casa entrável (-78,24) e casa de Thais (528,0) bloqueando a rota portão→chafariz (movida pra 524,-14 porta norte). Portão real agora x=500 (HX=60): estrada/distritos/marcos de distância recalculados.
- **Publicado e conferido**: produção = `dist` ✓.
- **PRÓXIMA GRANDE TAREFA combinada com o maestro**: pipeline de PETS GLB (Quirky Series da Omabuarts — ele vai baixar o FREE pack e/ou comprar o Pets $16; arquivos irão pra `public/modelos/`). Padrão a seguir: slot do `dragao.glb` em main3d (GLTFLoader + fallback + mixer + guards de corpoMat).

### 🔴 BUGS CRÍTICOS CONHECIDOS (prioridade 1)
1. **"Trava assim que loga"** (relato do maestro, possivelmente já mitigado): o loop morria por exceção no 1º frame de gameplay. O loop agora é BLINDADO (`main3d.js`, função `loop()` com try/catch): o erro aparece como toast "⚠️ Erro interno: ..." na tela e no console. **A exceção original NÃO foi identificada** — reproduzir logando no jogo e ler o console (F12). Suspeitos não descartados: algo no caminho `aoEntrar` → 1º frame (rede/conectarRede, GLTFLoader 404 handling, save/localStorage).
2. **Colisões/travamentos de andar**: histórico de colisores invisíveis (baú na porta do templo, casas com porta dentro do colisor do hospital — JÁ corrigidos). Validar andando: praça→templo→hospital (entrável)→casa entrável→ponte do Rio Fundo→portão de Thais→vielas do casario. Grade espacial de colisão em `main3d.js` (`gradeCol`, células de 24).
3. **Mobile/iPad**: pinça = zoom, duplo-toque bloqueado (`controles.js`). Validar no Safari iOS de verdade.

### 🟡 PERFORMANCE (prioridade 2)
- Mundo tem ~3000+ meshes (sem instancing nas árvores/casas). Candidatos: `InstancedMesh` para árvores grandes/pinheiros (criaArvoreGrande ~60 unidades), merge de geometria do casario de Thais.
- Bloom (PC) já meio-res; mobile fica sem bloom/sombras/IBL (checagem `ehMobile` em main3d).
- Anti-oclusão da câmera filtra `solidos` por distância (ok). `renderer.compile()` pré-compila shaders no load (com esgoto visível).

### 🎨 QUALIDADE VISUAL (prioridade 3)
- **Pipeline pronto**: texturas IA em `public/texturas/` (13 geradas via `scripts/gera-texturas*.mjs`, usa `OPENAI_API_KEY` do `.env`; maestro autorizou gastar crédito). `aplicaTexturaReal()` em `construcoes.js` troca mapa com fallback procedural + anisotropia 8.
- **Modelos 3D profissionais**: slot pronto — se existir `public/modelos/dragao.glb` (Dragon Evolved, Quaternius, CC0, poly.pizza/m/LlwD0QNUPj), o GLTFLoader troca o dragão automaticamente (guards de `corpoMat` já no código). Expandir o padrão pra lobo/aranha/esqueleto se o maestro baixar mais GLBs.
- Tom geral: exposure 0.92, bloom threshold 1.0 (só emissores brilham). NÃO deixar estourar branco (reclamação recorrente do maestro).

### 🚀 COMO PUBLICAR (obrigatório ao final)
1. `npm run build` (valida) → 2. `git add -A; git commit; git push` (origin/main) →
3. Deploy: carregar `.env` e `npx wrangler pages deploy dist --project-name=caseiro --commit-dirty=true` (ou 2 cliques no `publicar.bat`).
4. CONFERIR: `curl -s https://caseiro.pages.dev | grep index-` tem que bater com `dist/index.html` (CDN demora ~15s).

### 🧪 COMO TESTAR RÁPIDO
- Conta GM: criar personagem com nome `gm`, `adm` ou `dev` → tecla **G** abre painel (teleportes, imortal, spawn, ouro/XP).
- Save local: mesmo nome = mesma conta (localStorage `venor_conta_<nome>`); botão 💾.
- Regras do maestro: SEMPRE responder em português; ele testa no Edge (PC) e iPhone; preview/WebGL não funciona no ambiente do agente (validar por build + ele testa).

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
- `src/jogo/natureza.js` — lago/riacho/ponte/juncos/salgueiro/árvore/vitória-régia/pedra/cogumelo/flor + montanha/estrada/placa + **cais** + **fogueira/carroça** (estrada).
- `src/jogo/thais.js` — **cidade de Thais ENTRÁVEL** (muralha+ameias+torres, portão passável, templo, prédios, calçamento).
- `src/jogo/natureza.js` (extra) — **covil do dragão** (vulcão/lava/tesouro), **ruínas antigas**, **árvore morta** + cais/fogueira/carroça.
- `src/jogo/ratos.js` (extra) — **dragão** (asas batem), **beholder** (olho flutuante) além dos demais bichos.
- `src/jogo/cidade.js` (extra) — **lua/luar/estrelas** (a lua segue o céu → vista igual de qualquer lugar).
- `src/jogo/interiores.js` — **casas entráveis** (porta auto-abre perto; **vão bloqueia quando fechada**; telhado some, mobília, janelas).
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
**THAIS entrável** (muralha/portão/templo/praça + casas entráveis + 5 NPCs) + **Caminho de Thais** com acampamentos ·
**Venore maior** (Bairro do Comércio ao sul + moinho/farol/cais do porto) · **nomes de rua no minimapa** ·
**Beholder** (olho flutuante) + **loot variado** (ossos/ervas/gemas/joias/bolsa de ouro) ·
**calçamento de pedra** nas praças + **vidro de janela** de verdade · **esgoto em rede de túneis** (sob cada rua).
**🌙 Lua + luar** (visível igual de todo lugar) + **estrelas** à noite · **🐉 Dragão (D&D)** + **Covil do Dragão** (vulcão/tesouro, norte) ·
**🏛️ Ruínas antigas** (marcos de exploração) · **prédios nível Tibia** (alicerce/enxaimel/chaminé/porta com batente) · **mapa mais amplo** ao norte.

## 7. MODO DE TRABALHO + LIMITAÇÃO
- **Usuário = MAESTRO** (decide o quê/porquê; quer qualidade, detalhes, complexidade tipo Tibia).
- **Claude = EXECUTOR** (programa/testa via build/deploya; explica simples). Credenciais são sempre do usuário.
- ⚠️ **LIMITAÇÃO CRÍTICA:** o preview do Claude e o navegador automatizado estão com **WebGL desligado**
  → **não consigo ver o 3D nem testar visualmente**. Valido por `npm run build` + smoke tests, e o **MAESTRO testa no Edge**
  (PC) e no **celular/iPad** (link caseiro.pages.dev). Se aparecer "Não foi possível iniciar o 3D", ligar
  Aceleração de Hardware no Chrome (o Edge funciona). Sempre que publico, no PC dar **Ctrl+Shift+R**.

## 8. FILA DE PEDIDOS (continuidade — RETOMAR DAQUI)
**JÁ FEITO:** 🎣 pesca · 🏠 casas compráveis+personalizar telhado · ❤️ vida+bichos atacam+morte/respawn ·
🛡️ armaduras + ⚔️ armas (adaga/espada/machado) dropáveis (clicar na mochila p/ equipar, aparecem no corpo, defesa/dano) ·
🪙 ouro · 🔦 tocha clicável na mochila · 🌙 NPCs voltam pra casa à noite (lojistas/guarda ficam) ·
🚪 **entrada nas casas à prova de falha** (frente passável + porta auto-abre + marcadores 🏠/🚪) ·
🔒 sexo/raça só na criação · 📍 nomes de lugares + 🪧 placas de rua (Mercado/Ferreiro/Igreja/Escola) ·
🐉 bichos: rato, boss cobra/croc, troll, ciclope, aranha+filhotes, ladrão, escorpião ·
⛰️ montanhas com relevo · ⚡ otimização **mobile** (sem sombras/luzes) e **PC** (anti-oclusão só perto).

**JÁ FEITO (fila de 10/06/2026 — 6 itens, todos no GitHub/main):**
1. ✅ 🏰 **Thais ENTRÁVEL** (portão passável, muralha/torres, templo, praça, 2 casas entráveis, 5 NPCs) + **Caminho de Thais** (acampamentos: fogueira/carroça/barraca + placas).
2. ✅ 🏙️ **Crescer Venore**: Bairro do Comércio ao sul (ruas/praça/mercado coberto/casas) + marcos únicos (**moinho** com pás girando, **farol**, **cais** com barco) + **nomes de rua no minimapa**.
3. ✅ 🐉 **Beholder** (olho flutuante, Vale dos Monstros) + **loot variado** (osso/couro/erva/frasco + gemas/joias/bolsa de ouro; Olho do Beholder).
4. ✅ 🎨 **Qualidade**: calçamento de pedra (textura) nas praças/Thais + material de **vidro** real nas janelas.
5. ✅ 🚪 Porta **bloqueia quando fechada** (paredes da frente sólidas; vão abre perto) + 🕳️ **esgoto em rede de túneis** sob cada rua (grade + câmara central).
6. ✅ ⚡ Perf: esconde a grade de túneis na superfície + só acende postes perto do jogador à noite.

**JÁ FEITO (2ª rodada de 10/06/2026 — D&D + lua + capricho):**
7. ✅ 🌙 **Lua com luar** (filha do céu → visível igual de qualquer lugar) + **estrelas** à noite + luar azulado.
8. ✅ 🐉 **Dragão (D&D)** com asas que batem + **Covil do Dragão** (vulcão/lava/caverna/**tesouro**) ao norte → **mapa mais amplo**.
9. ✅ 🏛️ **Ruínas antigas** (clima D&D) como marcos + bosque carbonizado na aproximação do dragão.
10. ✅ 🎨 **Prédios nível Tibia**: alicerce de pedra, enxaimel (vigas/montantes), chaminé, porta com batente/verga/degrau.

**JÁ FEITO (3ª rodada — cenários entre as cidades + economia, base Tibia):**
11. ✅ 🌊 **Rio Fundo** corta o caminho na metade (x=180) + **Ponte de Pedra** (única travessia, com parapeitos) — lobos rondam a ponte.
12. ✅ 🗼 **Torre de Vigia** (braseiro aceso) + NPC **Bruno** · 🌾 **Fazenda** (trigo/espantalho/cerca) + NPC **Gil** · ⚰️ **Cemitério Abandonado** (esqueletos) · 🐍 **Pântano da Serpente** (cobras) · 🏴 **Acampamento Bandido** (ladrões + baú).
13. ✅ 📏 **Marcos de distância** na estrada com metragem REAL (ex.: "THAIS 176 / VENORE 110").
14. ✅ 🐺 **4 bichos novos**: lobo, urso, esqueleto, orc (cada região com sua fauna) + cobras de superfície.
15. ✅ 💰 **Economia Tibia**: Otto/Yara **compram loot** (tabela de preços: caudas/ossos/couro/gemas/presas/escama/peixes) · Sira **vende Poção de Vida** (8🪙) · poção dropa de bicho e **cura +35 ao clicar na mochila**.

**JÁ FEITO (4ª rodada — mundo grande, NPCs no lugar, clique-ação):**
16. ✅ 🌳 **Floresta GRANDE** (estilo Tibia/Albion): `criaArvoreGrande` (tronco alto/raízes/copa frondosa); ~60 árvores em anéis ao redor de Venore + mata ladeando a estrada inteira + bolsões fechados.
17. ✅ 📏 **Thais 2x mais longe** (centro x=560, portão 526; `limiteMundo` 900): 2ª metade da estrada com Ruínas da Estrada (orcs), 2 acampamentos, trolls/lobos/escorpiões/ciclope, montanhas fechando o leste; marcos de distância recalculados.
18. ✅ 🧍 **NPCs distribuídos nos comércios**: Otto→banca do mercado, Bram→Rua do Ferreiro, Sira→hospital, Tobias→igreja, Lia→escola, Vasco→delegacia, Greta→mercado coberto (Bairro Sul), Caio→cais, Marta→poço.
19. ✅ 🚪 **Portas SEMPRE abertas** (nascem abertas; o bloqueio de porta fechada foi REVERTIDO a pedido do maestro — entrar é direto). +2 casas entráveis no Bairro Sul (total 6).
20. ✅ 🖱️ **Clique do mouse = AÇÃO** (estilo Roblox): NPC→conversa, bicho→ataca/saqueia, você/pet→customiza, mundo→ação do lugar (abrir/pegar/pescar/descer). Mesma rotina da tecla E (`executaAcao`).

**JÁ FEITO (5ª rodada — anti-travadas + templo + morte Tibia):**
21. ✅ ⚡ **Anti-travadas**: grade espacial de colisão (células 24u; checagem caiu de ~700 p/ ~5-20 caixas) + `renderer.compile()` no load (shaders pré-compilados; era a "trava do nada") + NPCs que estavam presos DENTRO de colisores reposicionados.
22. ✅ ⛪ **Templo Sagrado** entrável em frente à praça (substitui a igreja): altar com cristal pulsante, vitrais, bancos, velas, torre com cruz; **Tobias mora dentro** (noturno). Respawn da morte é lá.
23. ✅ 💀 **Morte estilo Tibia**: perde ~30% do XP do nível (desce de nível se precisar) + **mochila cai onde morreu** (corpo 🎒 recuperável; morrer de novo perde o anterior) + renasce no Templo.
24. ✅ 🏘️ **Thais com casario** (muralha 48×42, +16 casas, 4 entráveis) + **frentes de casa livres** (pinheiros/placas/poço/canteiros reposicionados). Portão agora em x=512; marcos de distância recalculados.
25. ✅ 🚀 **Deploy feito direto pelo Claude** (autorizado pelo maestro) + `publicar.bat` (2 cliques) criado pra publicar manualmente.

**JÁ FEITO (6ª rodada — lojas, tocha, IA, zoom do mapa, Montanha do Dragão):**
26. ✅ 🏪 **Lojas estilo Tibia** (`npc.loja` genérico): Bram=armas (25/60/100🪙), **Eldra**=runas (Cura +50 / Fogo = AoE 30 raio 5), **Falk**=arco+flechas (tiro a 14u, gasta 1 flecha, projétil visual, arco desenhado na mão), Sira=poções, Yara (Thais)=poções+flechas. Mochila cheia devolve o ouro.
27. ✅ 🔦 **Tocha que queima**: raio até 34 nova, encolhe em ~4 min acesa, recupera apagada (`tochaCarga`); **bueiros com feixe de luz + PointLight** nas 5 entradas do esgoto.
28. ✅ 🚶 **IA afinada**: HOMES caíam dentro dos prédios (NPC andava na parede a noite toda — corrigido), anti-preso 2.5s, re-mira certa (posto/casa), **monstros colidem com cenário** (padrão Tibia/Albion).
29. ✅ 🗺️ **Zoom do minimapa de verdade** (🔍+/− colados no mapa, teclas +/−); botões antigos de "tamanho do mundo" removidos.
30. ✅ 🐲 **Montanha do Dragão ESCALÁVEL** (alturaTerreno: rampa cônica até platô em y=34, em 110,300): dragão agora **VERDE** (Tibia) no topo; **voa sobre Venore** a cada ~1-2 min (visível da cidade, asas batendo); ao morrer **20% de chance de Dragon Lord vermelho 5× mais forte** (1100hp, dropa Coração de Dragão = 400🪙); Lord morto → volta o verde.

**JÁ FEITO (7ª rodada — "50x": praia, Thais Tibia, coletáveis, GM, rotações):**
31. ✅ 🏖️ **Praia do Sul + Mar**: areia 380u, mar com barreira, 10 coqueiros (`criaCoqueiro`), trilha do Bairro Sul, pesca no mar, **caranguejos** (bicho novo).
32. ✅ 🏙️ **Thais proporção Tibia** (maior que Venore): muralha 56×50, fileiras duplas N/S + coluna leste (portas eixo X) + flanco oeste ≈ 40 construções; portão x=504; marcos recalculados.
33. ✅ 🕳️ **Bueiros validados**: em cima das escadas, todos na rua + **2 bueiros em Thais** (esgoto conecta as cidades; 7 acessos no total).
34. ✅ 🌿 **Coletáveis**: Erva/Cogumelo/Concha/Coco pelo mapa (colher → vender → renascem 90s).
35. ✅ 🛡️ **CONTA DEV/GM**: nome **"gm"/"adm"/"dev"** na criação ativa; tecla **G** = painel (teleportes, curar, +ouro, +XP, exterminar, invocar rato/troll/dragão, imortal, velocidade ×3).
36. ✅ 🔄 **Rotações suaves** (`giraSuave` em avatar.js) no jogador/NPCs/monstros + 🎨 **textura de telha** em todos os telhados duas-águas.
37. ℹ️ **Versão instalável (launcher tipo Rubinot)**: decisão = ficar no navegador durante o desenvolvimento; empacotar depois com **Electron/Tauri** (zero perda de código; o app embute o mesmo jogo + auto-update). Documentado pro maestro.

**JÁ FEITO (8ª rodada — campos de chão, corpos 10min, dragão 50x, visual):**
38. ✅ 🔥 **Campos de chão estilo Tibia** (`CAMPOS` no main3d): LAVA queima -8/0.6s (covil + 2 poças no platô do Pico), LODO do pântano envenena (8s, -2/s, renova pisando); **mordida venenosa** de aranha/escorpião/cobra (35%, 6s).
39. ✅ ⏳ **Corpos da morte duram 10 MINUTOS** e cada morte deixa o seu (array `corposCaidos`); o "não renasceu" relatado era o baú na porta do templo (já corrigido); corredor do templo alargado.
40. ✅ 🐲 **Dragão 50x**: escala 1.7× (Lord 2.0×), chifres curvos, mandíbula com dentes, barriga blindada, olhos brilhando, asas com dedos ósseos, garras, cauda com lâmina, espinhos; platô topo 8→12.
41. ✅ 🎨 **Visual da vila**: ruas CALÇADAS (textura de pedra na grade toda), grama com manchas de terra/flores, sombras 2048 no PC.

**JÁ FEITO (9ª rodada — monstros 50x, armas únicas, conta/save, texturas IA, mobile):**
42. ✅ 🕷️ **Giant Spider Tibia**: ENORME (pernas articuladas, presas, 6 olhos em brasa), feroz (300hp/dano 20/vel 3.2) e **chama filhotes** na caça (máx 4); dropa Seda de Aranha.
43. ✅ 👁️ **Beholder grande** (olho gigante, bocarra, 8 tentáculos) que **atira rajadas mágicas** (esquivável) · 🧿 **Cyclops gigante de 1 olho** (presas, clava com cravos, 150hp) · 🐲 **Dragão cospe fogo** (Lord 40 de dano) e **deixa LAVA no chão** 12s.
44. ✅ ⚔️ **Armas com design único** (adaga/espada c/ guarda dourada/machado 2 lâminas/arco) + tocha com chama no TOPO (estava sob a mão) + elmo assentado.
45. ✅ 💾 **CONTA LOCAL/SAVE**: cada nome = conta no localStorage (nível/XP/ouro/mochila/posição/visual); auto-save 10s + fechar + morte + botão 💾; mesmo nome = continua de onde parou. Conta online de verdade = futuro (banco no servidor Railway).
46. ✅ 🎨 **8 texturas geradas por IA** (gpt-image-1, ~$0,35 do crédito): grama/pedra/telha/areia/terra/**rocha**(montanha)/**muralha**(Thais)/**lava** — 512px, fallback procedural. Scripts em `scripts/gera-texturas*.mjs`.
47. ✅ 📱 **Mobile**: pinça = zoom da câmera, duplo-toque NÃO dá mais zoom de página, botões compactos com ícone · 🏥 **Hospital ENTRÁVEL** (a porta funciona; Sira dentro — era o "travou no hospital").

**JÁ FEITO (10ª rodada — RENDERIZAÇÃO PREMIUM):**
48. ✅ ✨ **Pipeline premium (PC)**: BLOOM (UnrealBloomPass — lava/runas/tochas/olhos irradiam), **IBL** (PMREM RoomEnvironment — metais/vidro/água refletem), **anisotropia 8×** em todas as texturas (chão nítido até o horizonte — era o "borrado"), **céu panorâmico pintado** (IA, tingido pelo ciclo dia/noite). Mobile segue no caminho direto.
49. ✅ 🎨 **Texturas HIGH** (leva 3): grama/pedra/telha regeneradas em alta + **madeira** (píer/pisos) + **céu** 1024×512. Total gasto nas 3 levas ≈ $1,2 do crédito.
50. ✅ 🏙️ **Thais destravada**: casas 8.2 (vielas largas), centro das fileiras vazio (ruas transversais — sem becos-armadilha), metade das ameias (peso -50%).

**JÁ FEITO (11ª rodada — luz definitiva, beholder D&D, cenário Tibia, slot GLB):**
51. ✅ ☀️ **Luz definitiva**: exposure 0.92 + bloom threshold 1.0 (SÓ emissores brilham — céu/flores/roupas não estouram mais).
52. ✅ 👁️ **Beholder v3 estilo livro D&D**: pele escura verrugosa, bocarra torta com dentes desiguais, olhão com veias, 10 tentáculos retorcidos.
53. ✅ ⛰️ **Montanhas com textura de rocha** (materiais compartilhados) + 🌿 **320 tufos de mato 3D** instanciados (2 draw calls).
54. ✅ 🐲 **Slot pro dragão 3D profissional**: ao colocar `public/modelos/dragao.glb` (Dragon Evolved do Quaternius, CC0 — baixar em poly.pizza/m/LlwD0QNUPj → botão Download → glTF), o jogo troca o dragão automaticamente com animação esquelética. Guards de corpoMat prontos.
55. ℹ️ **Billing OpenAI**: créditos da API ficam em platform.openai.com/settings/organization/billing (NÃO é o ChatGPT) — explicado ao maestro.

**PENDÊNCIAS / PRÓXIMOS:**
- 🚀 **PUBLICAR**: nesta sessão o Codex deve tentar publicar ao final (`npm run build` → commit/push → `wrangler pages deploy`) e conferir o bundle em produção; se a permissão bloquear, o maestro roda `publicar.bat`.
- 🔒 **Rotacionar token Cloudflare** (ação do maestro no painel: revogar antigo, gerar novo, atualizar `.env`).
- 🤾 "Jogar/arremessar" itens (o clique já abre/pega/ataca; arremesso ainda não existe).
- 🏪 Lojas com interior em Thais · 🗒️ quests · ⚡ instancing **só se pesar** no Edge/iPhone (a floresta nova é o primeiro candidato).

**Modo de trabalho do maestro:** quer que eu **execute em sequência sem ficar parando pra perguntar** ("só para quando eu mandar"); valida no **Edge (PC)** e **iPhone**; foco em **qualidade + fluidez** (mobile não pode travar). A cada mudança: `npm run build` → deploy (wrangler) → `git commit` + `git push`.

## 9. RODADA CODEX (10/06/2026 — estabilidade, Thais e luz)
- ✅ **Render premium sem ponto frágil**: o `EffectComposer` agora nasce só depois da cena existir (`new RenderPass(scene, camera)`), removendo o padrão arriscado `RenderPass(null, camera)`.
- ✅ **Visual menos estourado/branco**: exposição reduzida (`0.74`), bloom mais seletivo (`0.16/0.32/1.08`), IBL mais sutil (`0.18`) e luz solar/hemisférica reduzidas no ciclo dia/noite.
- ✅ **Vidros não viram lâmpadas**: material `VIDRO` perdeu o emissivo alto que fazia casas/rostos clarearem demais com bloom.
- ✅ **Thais destravada de verdade**: muralha/portão maiores, ruas internas mais largas, plataforma do templo caminhável, casas decorativas mais estreitas e casas entráveis reposicionadas fora de prédios sobrepostos.
- ✅ **Validação geométrica automatizada local**: busca em grade confirmou rota livre do portão de Thais até praça, casas laterais, norte e sul com raio do jogador.
- ✅ **Dragão low-poly premium original**: substituído o dragão “caixote” por uma silhueta inspirada em RPG/Unity low-poly (sem copiar asset pago): corpo facetado, pescoço em S, cabeça angular, chifres longos, sela, asas trianguladas enormes, dedos da asa, garras, cauda sinuosa e fogo saindo da boca.

## 10. DIÁRIO (marcos recentes)
Multiplayer (Railway) → minimapa → biomas/riacho → interiores → ação/inventário →
combate/esgoto/ratos → esgoto profundo (boss, tocha, várias entradas) → mundo ampliado
(montanhas/estrada/Thais) → NPCs com ofício + dia/noite → 4 modelos de personagem →
bichos da superfície (troll/ciclope/aranha) + tocha inicial →
**Thais entrável + Caminho de Thais** → **Bairro do Comércio + moinho/farol/cais + nomes no minimapa** →
**beholder + loot variado** → **calçamento/vidro** → **porta que bloqueia + esgoto em túneis** → **perf (cull túneis/luzes)**.

---
**Para retomar:** leia este arquivo. Estado no GitHub (`Caseiro`/main). Publicar = build + wrangler (cliente) / `railway up` (servidor).

**12ª rodada (pós-Codex, Claude):** 🐲 Dragão 3D REAL instalado (`public/modelos/dragao.glb` = "Dragon Rigged" CC0 baixado pelo maestro; loader com auto-escala p/ ~12u + frustumCulled off + respawn mantém GLB, Lord ganha brasas) · 💀 Tela de morte estilo Tibia (overlay + botão renascer) · ⚡ anti-engasgo: `initTexture` no load (upload de textura no 1º uso causava "imagem trava andando") + zero alocação/frame (occTmp reutilizado, campos sem concat) · 🧹 auditoria: 4 postes em cima de bueiros, 4 barris no meio da rua, corcova do arco na ponte — corrigidos. Publicado ✓.

**13ª rodada:** 🐛 Bug do "travando no PC" MORTO (toast da blindagem revelou: raycast do clique no esqueleto do GLB → `matrixWorld` null; fix: `o.raycast = noop` nos meshes GLB + try/catch no clique) · ✨ **MAGIAS estilo Tibia + barra Diablo**: mana no HUD (50, regen 0.9/s), 5 magias por nível (Lux n1, Exura n2, Exori n3 área, Utamo n4 escudo, Exori Flam n5), slots clicáveis + teclas 1-5, cooldown/cadeado visual; **dano centralizado** (`recebeDano` — Utamo absorve em contato/projétil/lava/veneno, mesmo cálculo PC+mobile) · 🐲 **2 dragões regionais** (dragao2.glb clonado SkeletonUtils): Ancião azulado perto de Thais (470,70) + verde ao norte de Venore (-70,132). Publicado ✓.

**14ª rodada:** 🪢 **Corda nos bueiros** (Tibia): esgoto com corda pendurada+nós+argola no lugar da escada; superfície com estaca+rolo+corda na boca do bueiro; textos "Descer/Subir pela corda" · 🗺️ **Lojas no minimapa** (⚒️✨🏹🧪💰) + marcadores flutuantes nas bancas (`LOJAS_MAPA` em main3d) · 💰 **ECONOMIA CIRCULAR**: lojistas compram a categoria deles (`npc.compra`), vendas abastecem (`economia` no save) e destravam **ofertas raras** (`npc.ofertas`): Espada Longa/Machado de Guerra (Bram 12/30), Runa Explosiva (Eldra 10), Arco Longo alcance 18 (Falk 12), Poção Grande +80 (Sira 10), Amuleto (Otto 20), Botas (Yara 20). Novos usáveis: pocaoGrande/runaExplosiva. Publicado ✓.

**15ª rodada:** 📱 Pinça de zoom só na METADE DE CIMA da tela + botões 🔭+/− (touch, lateral superior direita) — fim do zoom acidental ao virar · 🐲 **Dragões ANIMADOS por ossos** (achaOssos: head/neck/tail/wing → cabeça olha, cauda balança, asas tremem; fallback "respira"; vale pros 3 dragões) · 🧩 **Pipeline GLB genérico**: 20 spawns etiquetados com `especie`; soltar `<especie>.glb` em `public/modelos/` troca o visual da espécie inteira (lista: aranha/lobo/urso/esqueleto/orc/ciclope/troll/beholder/rato/caranguejo/escorpiao/ladrao/cobra; filhotes nascem vestidos via `aplicaGLBEm`) · ⚖️ **Balanceamento Tibia**: mana 0.35/s, vida 0.5/s, cooldowns 6-24s, custos 18-28. Publicado ✓. **Resposta dada ao maestro**: pacote Unity NÃO entra por upload (formato .unitypackage é exclusivo Unity); o NÍVEL visual sim é alcançável — usar packs GLTF (Quaternius Ultimate Nature grátis) no pipeline de modelos.

**16ª rodada:** 💀 **Estado de morte de verdade** (relato: tela de morte "travava" depois): flag `morto` pausa tudo (recebeDano/andar/agir/magia/clique/regen ignorados), o **botão "Renascer no Templo Sagrado" faz o RESET completo** (`renasce()`: limpa veneno/escudo, restaura vida+mana parcial, sai do esgoto, teleporta 0,-30, salva) com pointerdown+click; **auto-renasce em 12s** (`mortoAuto`) — impossível ficar preso. Publicado ✓.

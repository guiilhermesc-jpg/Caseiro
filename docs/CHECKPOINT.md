# 📌 CHECKPOINT — Jogo "Venore / Caseiro"
> Documento-mestre para **retomar o projeto do zero** sem perder contexto.
> Atualizado: 10/06/2026 (fim do dia). Leia este arquivo primeiro ao reabrir o projeto.

---

## 🚨 32ª RODADA (EM ABERTO) — PRÓXIMA SESSÃO, COMECE AQUI (atualizado 10/06 noite, RV4.7/v32)
> As rodadas **18ª a 31ª FORAM EXECUTADAS** (resumos no diário, no fim do arquivo). Código no main; selo agora é **RV4.7 (v32)**.
> 🚀 **DEPLOY PENDENTE — "PATCH 1"**: o maestro quer ACUMULAR melhorias e soltar como um super-lançamento (v22→v32 ainda não foram pro ar; produção está no v21). Quando ele liberar: build já validado, é só `wrangler pages deploy`.
> 🔧 Próximos candidatos: GLBs CC0 do maestro nos slots (vegetação/monstros/pets) · 2º andar das catacumbas (cripta mais funda)? · conta online (decisão do maestro) · empacotar launcher (Electron/Tauri) quando for "lançar".
> ⚖️ Regra de sempre (o maestro pediu réplica 1:1 do Tibia e foi explicado o porquê do NÃO): Tibia é INSPIRAÇÃO de estilo — mapa, prédios, nomes e falas do jogo da CipSoft são protegidos e replicá-los põe o projeto publicado em risco. MECÂNICAS são livres (depósito, barco, lojas) e assets CC0 (Quaternius/Kenney/poly.pizza) podem ser usados 1:1 — os slots GLB estão prontos.
**Estado:** jogo em produção (caseiro.pages.dev). Conta GM = nome `gm`/`adm`/`dev` + tecla G.

### 🧪 TESTAR PRIMEIRO (entregas da 18ª+19ª — Edge no PC + iPhone, Ctrl+Shift+R)
1. **Teleporte GM→Thais**: a cidade foi MESCLADA por material (~300 meshes → ~12 draw calls em thais.js) — conferir se a trava/engasgo sumiu. Se travar, toast "⚠️ Erro interno" → mandar print/console (F12).
2. **Marcador 🐾**: virou crachá pequeno com fundo escuro (praça) — conferir o tamanho.
3. **RELEVO**: colinas suaves no campo (cidades/estrada/praia/água continuam PLANAS) — andar pra fora de Venore e olhar o horizonte; bichos/pets/coletáveis acompanham a altura (terreno.js = fonte única).
4. **Praça de Venore**: prédios altos com 2º andar de janelas + sacada com guarda-corpo; alguns com torrinha de canto.
5. **Color grading** (PC): saturação +6%, sombras um tico frias, vinheta leve — conferir que NADA estourou branco.
6. **🏇 MONTARIA**: dome um bicho, clique nele (ou tecla M) → monta (velocidade por raça: gato ×1.25 … burro ×1.85, filhote de dragão ×2.0); clicar de novo desce; descer no esgoto/morrer desmonta.
7. **⚔️ PET DE COMBATE**: ataque um bicho — o pet corre junto e morde (dano por raça, dragãozinho = 8); o abate do pet conta XP/loot normal.
8. **📜 QUESTS**: Bruno (Torre de Vigia) = 4 lobos; Gil (fazenda) = 3 cenouras; Tobias (templo) = 3 esqueletos — aceitar no diálogo, progresso aparece nas mensagens, recompensa ao voltar. Salvas no save.
9. **🏪 LOJA DA YARA em Thais**: casa entrável (572,-18) virou loja com balcão/prateleiras de poções; a Yara atende lá dentro (placa "Poções — Yara").
10. **☀️ SOMBRAS no mundo todo** (PC): a sombra acompanha o jogador — conferir sombra em Thais/colinas/praia.
11. **🎥 OLHAR PRO CÉU** (20ª): arrastar a câmera pra baixo agora inclina até ver o céu/lua/dragão voando (estilo Roblox/Minecraft) — a câmera desce rente ao chão sem afundar; testar também no touch (arrastar na metade direita).
12. **🚑 TRAVA DA TELA MORTA** (21ª — era o bug nº1!): andar perto de templo/hospital/casas entráveis e teleportar GM→Thais NÃO pode mais congelar a tela (causa raiz: `Sprite.raycast` lia `raycaster.camera` nula na anti-oclusão → "matrixWorld null" todo frame). Se travar de novo, F12 → mandar o stack completo.
13. **🎬 QUALIDADE DE IMAGEM** (21ª): vinheta de cinema + contraste fílmico + nuvens CLARAS (eram blobs cinza) + mato 2× mais denso + moitas no campo + pedrinhas margeando a estrada inteira — comparar com os vídeos de referência do maestro.
14. **🐲 RV3.0 — BONECO 2.0** (22ª): boneco com cantos arredondados, CAPA que voa ao correr (caçador/mago/cavaleiro), respiração no idle; cavaleiro com chifres de dragão no elmo + espinhos nas ombreiras + emblema na capa; caçador com colar de presa; mago com runa brilhando na capa. NPCs herdam tudo.
15. **🐲 RV3.0 — MUNDO DOS DRAGÕES** (22ª): Ossada do Dragão (crânio gigante em 250,120 + placa) · ninho com 3 ovos no platô do Pico · bandeiras com emblema 🐉 · o VOO do dragão agora CUSPE FOGO sobre Venore (lava no chão, aviso na tela) · QUEST ÉPICA do Dorian (Thais): matar 1 dragão → 150🪙 +100xp + ELMO DO DRAGÃO (defesa 6) · vagalumes à noite no campo.
16. **🏛️ RV4.0 — VENORE, A CAPITAL** (23ª): cidade NOVA a oeste (GM → "Ir: VENORE"): Estrada do Pântano sai do vilarejo, praça do Grande Mercado, CANAL com 2 pontes de tábuas e calçadão, TORRE DO DEPÓSITO com relógio, porto com cais e pesca, casario mercante alto, 2 casas entráveis + loja da alquimista Berta (interior), 7 NPCs novos com lojas (Anselmo/Berta/Grom/Ilda/Tonho/Dona Ema/Capitã Mara), pântano abraçando a cidade. A cidade antiga virou VILAREJO DE VENOR (placas/distritos renomeados).
17. **🌀 FIX dos teleportes** (23ª): GM não cai mais DENTRO das fontes (destinos deslocados das praças).
18. **🌿 CAPIM 3D** (23ª): 260 tufos sólidos instanciados misturados aos cartazes de mato — profundidade real no chão.
19. **🧰 DEPÓSITO FUNCIONAL** (24ª): porta da Torre do Depósito em Venore → "Abrir seu cofre": guarda/retira a mochila inteira; o cofre vai no SAVE e morrer não derruba o que está guardado.
20. **⛵ BARCA** (24ª): Porto de Venore ↔ Cais do Vilarejo por 5🪙 (interativo nos dois cais).
21. **🏛️ VENORE IMPONENTE** (25ª): PORTÃO MONUMENTAL na entrada (2 torres + arco passável) · DISTRITO NORTE com Largo das Guildas (estátua, Salão das Guildas) e CATEDRAL com campanário · canal mais longo com 3ª ponte · BAIRRO DOS ARMAZÉNS no porto (3 galpões + 2º cais + carga) · PASSARELA ELEVADA sobre o brejo · BREJO PROFUNDO ao sul (cobras venenosas + trolls + quest "Limpeza do Brejo" da Capitã Mara, 50🪙+40xp) · 4 NPCs novos: TESSA (loja de ARMADURAS! elmo/peitoral/calças/botas + oferta Peitoral de Escamas), Ulric (guilda), Hela (catedral), Beto (estivador).
22. **🌙 NOITE ESTILO OT** (26ª): madrugada ESCURA de verdade (sol/ambiente mínimos + neblina fecha o horizonte à noite) — a tocha (T), os lampiões e o luar viram sobrevivência; aviso na tela quando a noite cai.
23. **🛡️ GUILDA DE VENORE** (26ª): o Ulric mostra teu currículo (X/2 dragões abatidos, salvo na conta); com 2+ → vira MEMBRO e ganha o MANTO DA GUILDA (tronco, defesa 6) + 120 XP.
24. **⚒️ INTERIORES NOVOS** (26ª): FORJA DO GROM entrável (bigorna, forno aceso, prateleira de lingotes) na praça + LOJA DA TESSA entrável no Largo das Guildas — os dois NPCs atendem lá dentro.
25. **⚡ MERGE DE MALHA GERAL** (27ª): criaJanela e criaPredio agora mesclam peças do mesmo material — cada casa caiu de ~45 pra ~18 meshes, em TODAS as cidades (~45 prédios ≈ 1100 meshes a menos; fluidez no celular).
26. **🔮 LOJA DA ILDA** (27ª): a arcanista ganhou loja entrável na beira do canal (prateleiras, balcão) — Venore agora tem 4 lojas com interior (Berta/Grom/Tessa/Ilda).
27. **⛵ REDE DE BARCAS** (27ª): o Porto de Venore virou HUB (diálogo com 2 rotas: Vilarejo 5🪙 / Praia 8🪙) e a praia ganhou ponto de barca de volta — fast-travel completo entre os três cantos.
28. **🪦 CATACUMBAS DE VENORE** (28ª): masmorra NOVA sob a Catedral — descida na cripta atrás dela (placa "desça se ousar"): salão de sarcófagos com velas acesas, pilares, ossadas e a CÂMARA DO TRONO; 4 esqueletos guardiões + **REI ESQUELETO** (boss, 320hp, dropa a COROA ANTIGA = 250🪙); quest da Hela "Paz nas Catacumbas" (→ 120🪙 +80xp + Amuleto Sagrado def 5); o letreiro 📍 mostra "Catacumbas de Venore" lá embaixo. Sistema de subsolo generalizado (`subsoloAtual`: esgoto × catacumbas).
29. **🧱 REBOCO NAS PAREDES** (29ª): TODA casa das 3 cidades + interiores ganhou textura procedural de reboco (ruído de argamassa + manchas de tempo, tingida pela cor) — fim do "plástico liso"; conferir de perto no Edge.
30. **🏙️ VIDA URBANA EM VENORE** (29ª): chafariz no Grande Mercado · ruas secundárias pavimentadas com PLACAS DE NOME (Rua do Canal, Travessa das Guildas, Beco dos Armazéns, Rua da Catedral) · 2 BARCAÇAS ancoradas no canal (casco/mastro/carga) · 3 moradores ambulantes novos (Rosa florista, Nilo cronista, Iva lavadeira) que recolhem à noite.
31. **💨 FUMAÇA NAS CHAMINÉS** (30ª): ~45% das casas das 3 cidades soltam novelos de fumaça em loop (sobem, crescem e derivam no vento) — as cidades respiram.
32. **🕸️ NINHO DAS ARANHAS** (30ª): covil novo na Floresta do Oeste (teias radiais entre as árvores, casulos de seda, placa de perigo) — 3 aranhas pequenas venenosas + ARANHA TECELÃ (mini-boss 180hp, dropa Seda) · quest do Falk "Cordas de Seda" (3 Sedas → 45🪙 +35xp).
33. **🕳️ CRIPTA PROFUNDA** (31ª): 2º andar das catacumbas (y=−80) — descida pela boca escura na câmara do trono: cofre dos reis com monte de ouro, velas, 2 ESQUELETOS ANCESTRAIS (1.3×, 80hp) e o **BAÚ ANCESTRAL** (180🪙 + Rubi + Esmeralda, UMA vez por conta, salvo no save); corda de volta ao trono.
34. **🏷️ TÍTULO DO PATCH 1** (31ª): a tela de entrada agora tem o letreiro "VENOR — ERA DOS DRAGÕES — PATCH 1" (dourado, some ao entrar no jogo).

### 🎨 MISSÃO QUE CONTINUA: MODELOS PROFISSIONAIS (GLB)
A vegetação inteira virou **InstancedMesh** (~900 meshes → ~9 draw calls, vegetacao.js) com **slots GLB prontos**: o maestro baixa Quaternius Ultimate Nature/Stylized Nature (poly.pizza, CC0, GLB) e solta em `public/modelos/`:
- `arvore1.glb` → troca TODAS as árvores grandes · `pinheiro.glb` → todos os pinheiros · `pedra.glb` → todas as pedras
(auto-escala pela altura, base no chão, mesmas posições — mesma receita do dragao.glb)
⚠️ Regras: NUNCA estourar branco (exposure 0.84, bloom th 1.0); validar por npm run build (agente sem WebGL); maestro testa Edge/iPhone; responder SEMPRE em português.

### 📋 BACKLOG COMBINADO
- 🧸 GLBs a baixar pelo maestro: vegetação (acima) + Quirky Pet Animals $16 (GLTF) + monstros poly.pizza (slots prontos: aranha/lobo/urso/esqueleto/orc/ciclope/troll/beholder/rato/caranguejo/escorpiao/ladrao/cobra.glb).
- 🌐 **Conta online (Railway DB)** — adiado de propósito: precisa de decisão do maestro (banco no projeto venor-servidor = custo/manutenção; save local funciona). Quando ele topar: tabela contas + sync do save via WebSocket já existente.
- 🗒️ Mais quests (cadeia com recompensa única) · 🏪 mais interiores (forja do Bram?) · 🤾 arremessar itens.
- 💳 Billing API: platform.openai.com/settings/organization/billing · texturas: scripts/gera-texturas*.mjs.

### 🚀 PUBLICAR (sempre ao final)
npm run build → commit+push (main) → .env + npx wrangler pages deploy dist --project-name=caseiro --commit-dirty=true → conferir curl caseiro.pages.dev = dist (~15s CDN) → **bump VERSAO** e avisar o número.

---

## 🤝 HANDOFF ANTERIOR (Codex) — histórico
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

**17ª rodada (VISUAL PREMIUM + PETS DOMÁVEIS):** 💎 Receita do "pack premium" feita em casa: `matFlat`/`desloca` em construcoes.js (flat shading facetado + vértices orgânicos) aplicados em árvores (4 paletas)/pedras (musgo)/montanhas/pinheiros/arbustos; **CACHOEIRA** (`criaCachoeira`, no lago norte 45,96); **espuma** nas margens dos lagos + praia; 12 manchas de cor no campo; fog 260-720, sol dourado, exposure 0.84 · 🐾 **PETS DOMÁVEIS Tibia**: sem pet inicial; 6 selvagens com 🐾 (gato/cachorro/coelho/lobo/BURRO novo/FILHOTE DE DRAGÃO no platô); item de domar por raridade (Lambari/Osso/**Cenoura** coletável nova na fazenda/Carne/Escama de Dragão) com chance 70%→30%; falha consome item (Tibia); domado segue+salva (`pets`/`pet` no save), selvagem some; trocar pet = clicar em si (só domados). FUTURO: montaria (velocidade) + pets no combate. Publicado ✓.

**18ª rodada (RELEVO + INSTANCING + THAIS MESCLADA + VENORE PREMIUM — v19):** 🏰 **Bug do teleporte GM→Thais atacado**: thais.js reescrito com `BufferGeometryUtils.mergeGeometries` POR MATERIAL (muralha+ameias+torres+templo+~30 prédios: ~300 meshes → **~12 draw calls**, colisores idênticos) · 🐾 **Marcador dos domáveis** virou crachá pequeno (fundo escuro translúcido + borda, escala 1.1→0.62, y 2.3) · ⛰️ **RELEVO procedural**: novo `terreno.js` com `alturaColinas(x,z)` (2 oitavas de seno, amp até 3.6u, smoothstep) — zonas PLANAS em cidades/estrada/praia/água/POIs; malha de chão segmentada (180×140) usa a MESMA função da física; bichos de superfície (atualizaRatos), pets domáveis, pet que segue, coletáveis, mato instanciado e manchas de cor TODOS acompanham a altura; Montanha do Dragão mantém o perfil próprio · 🌲 **Vegetação INSTANCIADA**: novo `vegetacao.js` — árvores grandes (4 paletas)/pinheiros (3 tons)/pedras (c/ e s/ musgo) com cores por vértice em InstancedMesh (~900 meshes → **~9 draw calls**) + **SLOTS GLB** arvore1/pinheiro/pedra.glb (espécie inteira troca, auto-escala, mesmas matrizes) · 🏘️ **Venore premium** (criaPredio): prédios altos ganham 2º andar de janelas, SACADA com guarda-corpo + porta-janela, ou torrinha de canto com chapéu de telha · 🎨 **Color grading** leve no composer (PC): saturação +6%, lift frio nas sombras, vinheta 0.12 — com clamp (NUNCA estoura branco) · Selo **v19**. Build ✓.

**19ª rodada (MONTARIA + PET DE COMBATE + QUESTS + LOJA DE THAIS — v20):** 🏇 **MONTARIA estilo Tibia**: clicar no SEU pet (ou tecla M) monta/desmonta; velocidade por raça (`MONTARIA_VEL`: gato 1.25 → dragãozinho 2.0); o pet vira a "sela" embaixo do avatar (`MONTARIA_SELA` ergue o jogador, patas trotam ao andar); desmonta ao descer no esgoto e na morte · ⚔️ **PET DE COMBATE**: ao atacar um bicho o pet entra na briga (`petAlvo`): corre até 16u, morde a cada 1.2s com dano por raça (`PET_DANO`, dragãozinho 8), abate passa pelo `mataBicho` normal (XP/loot/quest contam); guarda de "andar" impede morder bicho do esgoto pela superfície · 📜 **QUESTS com save** (`QUESTS`/`questEstado` no main3d): Lobos da Ponte (Bruno, 4 lobos, 40🪙+30xp) · Colheita do Gil (3 cenouras, 25🪙+poção) · Descanso dos Mortos (Tobias, 3 esqueletos, 60🪙+50xp); opção 📜 no diálogo, progresso de caça no `mataBicho`, coleta conta pela mochila, recompensa na entrega; salvas em `quests` no save · 🏪 **LOJA DA YARA** (1ª loja com interior em Thais): `criaCasaInterior({ loja: true })` = balcão com colisor, 2 prateleiras de poções coloridas (emissivas), barril; Yara mudou o posto pra trás do balcão (572,-21) + placa "Poções — Yara" · ☀️ **Sombras dinâmicas** (PC): `sun.position`/`sun.target` acompanham o jogador — sombra de verdade em Thais, colinas e praia (antes só perto da origem) · Selo **v20**. Publicado ✓.

**20ª rodada (CÂMERA LIVRE — olhar pro céu, v21):** 🎥 pedido do maestro: "olhar pro céu igual Roblox/Minecraft". `PITCH_MIN` em controles.js era **0.08** (a câmera nunca descia do horizonte) → agora **−1.35 rad** (~77° pra cima); no main3d, quando o raio da câmera iria pro subsolo ela **desliza pelo raio** e para rente ao chão apontando pra cima (personagem na base da tela, céu/lua/dragão visíveis) + trava de segurança contra encostas (`alturaTerreno` no ponto da câmera). Vale pro mouse (PC) e pro arrasto touch (mobile). Selo **v21**. Publicado ✓ (junto com o v22).

**21ª rodada (TRAVA DA TELA MORTA + QUALIDADE CINEMATOGRÁFICA — v22):** 🚑 **CAUSA RAIZ da "tela trava e o boneco continua andando" ENCONTRADA pelo print do maestro** (toast "matrixWorld null"): no three r184, `Sprite.raycast` lê `raycaster.camera.matrixWorld`, e o raycaster da ANTI-OCLUSÃO nunca recebia a câmera → qualquer sprite (marcador 🏠/🚪 de templo/hospital/casas entráveis) a <22u do jogador estourava exceção TODO FRAME; o `passo()` morria ANTES do bloco da câmera (movimento rodava, câmera/NPCs congelavam) — era também a verdadeira causa do "teleporte GM→Thais trava" (4 casas entráveis lá). Fix triplo: `raycaster.camera = camera` + sprites ignorados na oclusão (não barram câmera) + clones GLB re-blindados (`.clone()` não carrega override de raycast — aplicaGLBEm agora re-aplica) · 🎬 **Pacote de qualidade das referências do maestro** (vídeos low-poly premium): grading CINEMATOGRÁFICO no PC (S-curve fílmica com clamp, saturação +12%, split-tone sombras frias/altas quentes, vinheta 0.22, dither anti-banding) · ☁️ **nuvens claras** (emissivas 0.42 — eram blobs cinza-escuros nos prints) · 🌿 **mato 700 tufos** (2× mais denso, mesmos 2 draw calls) · 🌳 **120 MOITAS instanciadas** no campo (novo arquétipo em vegetacao.js, sem colisor, 2 draw calls) · 🪨 **~280 pedrinhas margeando a estrada** Venore→Thais (InstancedMesh, 1 draw call, falhas naturais, vão na Ponte de Pedra). Selo **v22**. Publicado junto com a RV3.0.

**22ª rodada (🐲 RV3.0 — A REVOLUÇÃO DOS DRAGÕES, v23):** o maestro pediu "o melhor nas imagens, no boneco e nos detalhes, temática de dragões (D&D)". 👤 **BONECO 2.0** (avatar.js): peças grandes em `RoundedBoxGeometry` (fim do caixote — tronco/cabeça/membros/mãos/botas/peitoral/elmo), **CAPA com pivô no ombro que VOA ao correr** (caçador verde-mata nova, mago, cavaleiro — registrada em `partes.capa`, animada em animaAvatar), **respiração no idle** (`partes.tronco`); detalhes de DRAGÃO por classe: cavaleiro = chifres de osso no elmo + espinhos nas ombreiras + emblema dourado na capa, caçador = colar com presa de dragão, mago = runa roxa brilhando na capa; NPCs e multiplayer herdam (mesmo criaAvatar) · 🐲 **MUNDO DOS DRAGÕES**: `criaCranioDragao` (natureza.js) = Ossada do Dragão gigante meio enterrada (250,120, calota orgânica + mandíbula + presas + chifres + costelas) com placa; **ninho com 3 ovos** no platô do Pico (116,305); **bandeiras com emblema 🐉** (canvas no pano, todas as cidades/acampamentos); **voo do dragão cospe FOGO** sobre Venore (criaLavaTemp sob a rota, t 0.42-0.78, aviso 🔥 na tela — o perigo é real); **QUEST ÉPICA "A Caça ao Dragão"** (Dorian, Thais): matar 1 `dragao` (pico ou regionais, especie nova) → 150🪙 +100xp + **Elmo do Dragão** (slot cabeça, defesa 6) · ✨ **VAGALUMES** (110 pontos verdes) acordam à noite no campo (opacidade no ciclo, flutuação) · Selo **RV3.0 (v23)**. Publicado ✓.

**23ª rodada (🏛️ RV4.0 — VENORE, A CIDADE MERCANTE, v24):** pedido do maestro: Venore como cidade PRINCIPAL e a antiga vira vilarejo. Regra mantida: **inspiração de estilo, layout/nomes/falas ORIGINAIS** (sem replicar conteúdo da CipSoft). 🏛️ **VENORE nova** a oeste (centro −320,−30; zona plana nova em terreno.js): Estrada do Pântano (criaEstrada −250→−86, z=−30, com placas e marco de distância) · praça do **Grande Mercado** (criaMercado 16×10) · **CANAL norte-sul** (água + margens de pedra + colisores com vãos + 2 **pontes de tábuas** com corrimão + **calçadão de madeira**) · **TORRE DO DEPÓSITO** (base 11u + torre + coroa de telha + **relógio de canvas** + porta, colisor) · **casario mercante** (8 criaPredio altos 9-12 → 2 andares/sacadas automáticos) · 2 **casas entráveis** + **loja da alquimista Berta** (criaCasaInterior loja:true) · **PORTO** (criaLago = pesca + criaCais + juncos/salgueiro) · barracas/poço/bancos/canteiros/4 bandeiras/6 postes · **pântano abraça a cidade** (criaPantano + salgueiros + árvores mortas + juncos) · 👥 **7 NPCs originais** (npcs.js): Anselmo (mercador, compra tudo, oferta Anel do Mercador), Berta (poções, dentro da loja), Grom (armas, oferta Martelo de Guerra), Ilda (runas), Tonho (flechas, compra PEIXES), Dona Ema, Capitã Mara — lojistas NOTURNOS · 🗺️ **renomeação**: cidade antiga = "Vilarejo de Venor" (DISTRITOS/placas/falas), 6 distritos novos de Venore · 🌀 **FIX: teleportes GM caíam DENTRO das fontes** (destinos deslocados + botão novo "Ir: VENORE") · 🌿 **CAPIM 3D** (260 tufos sólidos instanciados, arquétipo novo em vegetacao.js — fim do mato "papel de parede" sozinho) · máscaras de mato/moitas/capim respeitam a cidade nova e a estrada · Selo **RV4.0 (v24)**.

**24ª rodada (🧰⛵ MECÂNICAS DE CAPITAL — depósito + barca, v25):** o maestro pediu "réplica idêntica do Tibia"; explicado que mapa/NPCs/falas da CipSoft são protegidos (projeto publicado = risco real) e que o caminho legal é: MECÂNICAS (livres) + estilo + assets CC0. Entregues as duas mecânicas que faltavam pra Venore operar como capital: 🧰 **DEPÓSITO DE VENORE** (`cofre` no main3d): interativo na porta da Torre do Depósito → diálogo com "Guardar a mochila no cofre" / "Retirar tudo" / lista do conteúdo; itens preservam campos de equipamento; **vai no save** (`cofre`) e a morte NÃO derruba o que está guardado · ⛵ **BARCA**: Porto de Venore (−322,−82) ↔ Cais do Vilarejo (45,62), 5🪙 a passagem, desmonta o pet, salva ao viajar · Selo **RV4.0 (v25)**. Build ✓.

**25ª rodada (🏛️ RV4.1 — VENORE IMPONENTE, v26):** o maestro aceitou o caminho original e pediu uma capital MAIOR e melhor dimensionada que a referência. Zona plana cresceu pra ~188×242 (terreno.js) e a cidade ganhou: 🚪 **PORTÃO MONUMENTAL** na entrada da estrada (2 torres cilíndricas 13u + coroas + arco passável por cima da pista + estandartes) · 🏛️ **DISTRITO NORTE**: Largo das Guildas (piso + estátua do fundador + **Salão das Guildas** 16×13 alt 12) e **CATEDRAL DE VENORE** (criaMarco igreja: campanário com sino) + 8 prédios mercantes + casa entrável + postes/bandeiras · 🌊 **canal estendido** (z −100…90, 190u) com **3ª ponte** e calçadão de 180u · 📦 **BAIRRO DOS ARMAZÉNS**: 3 galpões sem janelas, **2º cais**, barris/caixas/carroça de carga · 🌉 **PASSARELA ELEVADA** de tábuas com estacas sobre o brejo + lampiões · ☠️ **BREJO PROFUNDO** (sul): 2 poças + pântano + árvores mortas + 4 cobras venenosas + 2 trolls + **quest "Limpeza do Brejo"** (Capitã Mara, 3 cobras → 50🪙+40xp) · 👥 **+4 NPCs**: **Tessa** (1ª loja de ARMADURAS do jogo: Elmo/Peitoral/Calças/Botas + oferta rara Peitoral de Escamas def 8), Ulric (Mestre da Guilda), Hela (Sacerdotisa), Beto (Estivador) · 6 distritos novos no letreiro 📍 · máscaras de vegetação acompanharam · Selo **RV4.1 (v26)**. Build ✓. **SEM deploy ainda** (maestro acumulando).

**26ª rodada (🌙🛡️ RV4.2 — NOITE OT + GUILDA + INTERIORES, v27):** 🌙 **noite escura de verdade**: `aplicaDiaNoite` agora desce o sol pra 0.04 e o ambiente pra 0.07 na madrugada e a NEBLINA FECHA o horizonte à noite (near/far 110/340 ↔ dia 260/720) — tocha/lampiões/luar viram sobrevivência; aviso "🌙 acenda a tocha (T)" 1× por noite (`avisoNoite`) · 🛡️ **GUILDA DE VENORE funcional**: `dragoesMortos` conta no `mataBicho` (vai no save junto com `guilda`); opção no diálogo do Ulric mostra o progresso (X/2) e, com 2+, entrega o **Manto da Guilda** (tronco, defesa 6) + 120 XP — membro fica salvo · ⚒️ **interiores novos** (interiores.js ganhou `opts.forja`): **FORJA DO GROM** entrável na praça (balcão com tampo de pedra, BIGORNA, FORNO com boca emissiva acesa, prateleira de lingotes) e **LOJA DA TESSA** entrável no Largo das Guildas; Grom e Tessa mudaram o posto pra DENTRO (atendem atrás do balcão) com placas na rua · Selo **RV4.2 (v27)**. Build ✓. **SEM deploy** (acumulando v22→v27).

**27ª rodada (⚡⛵ RV4.3 — MERGE DE MALHA + LOJA DA ILDA + REDE DE BARCAS, v28):** ⚡ **otimização de malha geral** (construcoes.js): `criaJanela` mescla moldura+cruzeta numa geometria só (e as venezianas em outra) e `criaPredio` ganhou BALDES por material (`geosMad`/`geosPed` + `gbox()`): alicerce/chaminé/degrau/piso-de-sacada viram 1 mesh de pedra e vigas/montantes/batentes/verga/guarda-corpo viram 1 mesh de madeira — cada casa caiu de ~45 pra ~18 meshes, valendo pras ~45 casas das TRÊS cidades (≈1100 meshes a menos; colisores intactos; casas compráveis não usam criaPredio, sem risco no telhado custom) · 🔮 **LOJA ARCANA DA ILDA**: prédio decorativo (−340,−12) virou `criaCasaInterior loja:true` na beira do canal + placa; Ilda atende atrás do balcão · ⛵ **REDE DE BARCAS** (`viajaBarca()`): Porto de Venore virou HUB com diálogo de rotas (Cais do Vilarejo 5🪙 · Praia de Venor 8🪙); vilarejo e praia têm o ponto de volta (−20,−206 na areia) · Selo **RV4.3 (v28)**. Build ✓. **SEM deploy** (acumulando v22→v28).

**28ª rodada (🪦 RV4.4 — CATACUMBAS DE VENORE, v29):** masmorra NOVA (design autoral) sob a Catedral. 🏗️ **Sistema de subsolo generalizado**: `subsoloAtual` (esgoto × catacumbas) — colide() usa `subsoloAtual.colisores`, `podeAndarBicho` checa os dois conjuntos (regiões disjuntas), `sobe()` usa `saidas[]` pareadas com `acessos[]` (esgoto.saidas = BUEIROS), renasce/tpGM escondem os dois grupos · 🪦 **criaCatacumbas()** (esgoto.js): salão 66×38 em y=−40 sob a capital, 8 SARCÓFAGOS com tampas entreabertas e velas acesas (chamas emissivas), 6 pilares, ossadas, CÂMARA DO TRONO com estrado, 3 luzes quentes fracas (tocha continua essencial), corda de acesso a leste · ⚰️ **cripta na superfície** atrás da Catedral (−398,33): alçapão escuro + arco de pedra + placa "desça se ousar" + interativo "Descer às Catacumbas" (`desceCatacumbas()`) · 💀 **4 esqueletos guardiões** (y0 −40) + **REI ESQUELETO** (escala 1.75, boss 320hp/dano 24, dropa **Coroa Antiga** — PRECOS 250🪙) · 📜 **quest da Hela** "Paz nas Catacumbas" (rei ×1 → 120🪙 +80xp + **Amuleto Sagrado** colar def 5) · 📍 letreiro mostra "Catacumbas de Venore"/"Cripta da Catedral" · Selo **RV4.4 (v29)**. Build ✓. **SEM deploy** (acumulando v22→v29).

**29ª rodada (🧱🏙️ RV4.5 — REBOCO + VIDA URBANA, v30):** 🧱 **textura de reboco procedural em TODAS as paredes** (`texturaReboco()`/`matParede(cor)` em construcoes.js, cache por cor): ruído de argamassa + manchas de tempo, tingida pela cor de cada casa — aplicada no corpo do criaPredio, na torrinha, no casario MESCLADO de Thais e nas paredes dos interiores; fim do "plástico liso" em 3 cidades de uma vez · 🏙️ **acabamento urbano de Venore**: chafariz (criaFonte) no Grande Mercado · 2 ruas secundárias pavimentadas (Largo↔Catedral e a rua dos Armazéns) · 4 **placas de nome de rua** (Rua do Canal, Travessa das Guildas, Beco dos Armazéns, Rua da Catedral) · 2 **BARCAÇAS ancoradas no canal** (casco, borda, mastro, carga) · 👥 **3 moradores ambulantes** (Rosa florista no Largo, Nilo cronista na praça — a dica dele aponta pras catacumbas!, Iva lavadeira no calçadão), todos recolhem à noite · Selo **RV4.5 (v30)**. Build ✓. **SEM deploy** (acumulando o PATCH 1: v22→v30).

**30ª rodada (💨🕸️ RV4.6 — FUMAÇA + NINHO DAS ARANHAS, v31):** 💨 **fumaça nas chaminés**: criaPredio devolve `animados` com 3 novelos (`MAT_FUMACA` compartilhado) por casa em ~45% delas; `animaProps` ganhou o tipo `fumaca` (sobe em loop, cresce e deriva no vento via `baseX`) — vale pras casas das 3 cidades · 🕸️ **NINHO DAS ARANHAS** (Floresta do Oeste, −146,−66): 3 teias radiais (canvas procedural) penduradas entre as árvores, 3 casulos de seda inclinados (alturaColinas), placa de perigo; **3 aranhas pequenas** venenosas + **ARANHA TECELÃ** (criaAranhaGigante 0.8×, mini-boss 180hp/dano 14, lootEspecial Seda de Aranha) · 📜 **quest do Falk** "Cordas de Seda" (coletar 3 Sedas → 45🪙 +35xp) — fecha o ciclo: caçar no ninho → vender/entregar pro arqueiro · 📍 distrito "Ninho das Aranhas" · Selo **RV4.6 (v31)**. Build ✓. **SEM deploy** (acumulando o PATCH 1: v22→v31).

**31ª rodada (🕳️👑 RV4.7 — CRIPTA PROFUNDA + TÍTULO DO PATCH 1, v32):** 🕳️ **2º andar das catacumbas** (`criaCriptaProfunda` em esgoto.js, y=−80): cofre dos reis 32×24 com monte de OURO (material dourado emissivo + moedas espalhadas), **BAÚ ANCESTRAL** com fecho dourado, velas e luz âmbar baixa; **2 ESQUELETOS ANCESTRAIS** (1.3×, 80hp, fortes) de guarda · 🔁 navegação entre andares: boca escura no chão da câmara do trono (interativo `desceCripta`, y −40) e corda de volta (`sobeDaCripta`, y −80) — `achaInterativo` já filtra por andar; colisão dos bichos cobre o 3º conjunto (`criptaProfunda.colisores`); renasce/tpGM escondem os 3 subsolos · 👑 **Baú Ancestral**: +180🪙 + Rubi + Esmeralda, UMA vez por conta (`bauCripta` no save) · 🏷️ **título do Patch 1** na tela de entrada ("VENOR · ERA DOS DRAGÕES · PATCH 1", dourado com brilho, removido ao entrar) · Selo **RV4.7 (v32)**. Build ✓. **SEM deploy** (acumulando o PATCH 1: v22→v32).

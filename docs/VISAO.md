# Projeto Sirene — Documento de Visão (v0.1)

> **Documento VIVO.** Você é o maestro: tudo aqui é seu para editar e redirecionar.
> Última atualização: 09/06/2026.

## 🔄 Rumo atual (atualizado pelo maestro)
- **Formato:** jogo **3D** estilo Roblox (Three.js), movimento livre + câmera 3ª pessoa.
- **Mundo:** começa na cidade **VENOR** — um vilarejo antigo **completo e normal** (NÃO
  destruído): praça central, igreja, hospital, delegacia, escola e casas, com layout
  coeso/realista pra imersão.
- **Conceito (inspiração Tibia):** mundo com história, mas **sem objetivo único** — o
  jogador escolhe o que fazer; várias formas de "vencer"/dar destino ao personagem.
- **Possibilidades:** jogar **sozinho ou em família/grupo**; nascer numa casa, formar
  família ou se unir a um grupo; dinâmicas variadas.
- **Produção econômica:** **modelos modulares padronizados** (prédios, móveis, plantas)
  reutilizados por região; variedade cresce aos poucos.
- **Ações previstas:** correr, pular, abaixar, girar câmera; entrar/sair de lugares;
  subsolos e andares (escadas) — construídos por etapas.
- *(A pegada original guerra/sirene/sobrevivência fica guardada como possível camada de
  evento futura dentro do mundo.)*

## 1. Pitch
Um drama de sobrevivência civil numa guerra moderna. Quando a **sirene** toca, você
corre para juntar o que puder e proteger quem ama. Depois, no abrigo, cada dia é uma
escolha entre comida, remédio, segurança e dignidade — até conseguir **fugir**, ser
**capturado**, ou não resistir.

## 2. Referências
- **Estrutura / ritmo:** *60 Seconds!* (a corrida, os blocos, a contagem de dias).
- **Alma / tom:** *This War of Mine* (civis na guerra, peso moral).

## 3. Pilares (o que nunca pode faltar)
1. **Escolha sob escassez** — nunca há o suficiente.
2. **Peso humano** — pessoas, não números. Medo, fome, esperança.
3. **Múltiplos caminhos** — várias variáveis, vários finais.
4. **Escassez crescente** — o mundo aperta a cada dia.

## 4. Tom
Dramático e realista. Sério, humano, moralmente cinzento. Sem comédia.

## 5. Cenário
Mundo **fictício e neutro**, inspirado em conflitos modernos (drones, sirenes,
deslocamento). Geopolítica clara: uma **nação agressora** ataca; o país do jogador é a
**vítima**; há **nações aliadas** que oferecem ajuda e rotas de fuga. Atacar é o lado
errado da história.

## 6. Setup de partida (escolhas iniciais)
- **Companhia:** sozinho **ou** família.
- **Abrigo:** seu porão (privado, recursos seus) **ou** comunitário — igreja/escola
  (mais gente e suprimentos, mais tensão e risco de rebelião).
- *(futuro: cidade, profissão, estação do ano…)*

## 7. Os 5 blocos
1. **A Sirene (a corrida)** — até ~10 min para vasculhar e abrigar. Inventário limitado.
2. **O Abrigo (gestão)** — racionar; saúde física e mental; moral do grupo.
3. **A Guerra lá fora (eventos)** — decisões morais com consequências.
4. **Os Dias (meta-loop)** — escassez crescente; objetivo: sobreviver até a fuga.
5. **Desfechos** — fugir (avião / barco / terra), ser capturado, ou morrer.

## 8. Sistemas-chave (a sua cara)
- **Escassez dinâmica:** itens somem do mundo e encarecem no mercado negro com os dias.
- **Coesão / rebelião:** a moral do grupo é um recurso; se desaba, há conflito interno.
- **Rotas de fuga:** cada uma (avião, barco, terra) com requisitos e riscos próprios.

## 9. Motor × Conteúdo (como ficamos ricos com segurança)
- **Motor** = o código (eu construo, em camadas seguras).
- **Conteúdo** = itens, eventos, textos, caminhos (DADOS — onde mora a riqueza; é o seu
  território). Ex.: `src/data/itens.js`.
- Adicionar conteúdo novo **não** exige mexer no motor. Por isso podemos ter MUITAS
  variáveis sem reescrever o jogo.

## 10. Plataforma
- **Desenvolvimento:** Web (Phaser + Vite) no Windows.
- **Publicação:** Android e iOS via Capacitor (empacotamento na fase final).

## 11. Roadmap por camadas
- **Camada 1 ✅ construída e testada:** a corrida jogável (mover, coletar,
  inventário, timer, resultado) + setup de partida. [placeholders gráficos]
- **Camada 2 (próxima):** o abrigo e o ciclo de dias (recursos, saúde física/mental).
- **Camada 3:** eventos e decisões morais.
- **Camada 4:** escassez dinâmica, coesão/rebelião, rotas de fuga.
- **Camada 5:** arte, áudio e identidade visual.
- **Camada 6:** empacotar Android/iOS, testes e publicação.

## 12. Diário de bordo
- **09/06/2026** — v0.1: visão definida; Camada 1 (a corrida) em construção.
- **09/06/2026** — v0.2: Camada 1 construída e **testada com sucesso**. Projeto Phaser 4
  + Vite no ar; 4 cenas (Menu → Setup → Corrida → Resultado). Corrida com movimento
  (toque/teclado), coleta com limite de mochila, depósito no abrigo, resgate de
  familiares e cronômetro. Testes: 4 telas sem erros de console; lógica de
  coleta/limite/depósito/resgate validada; transições corretas (cada cena encerra a
  anterior); prognóstico dinâmico do resultado OK.
- **09/06/2026** — v0.3: Camada 1 **enriquecida (visual & feel)**. O mapa virou um
  apartamento com 5 cômodos (piso, paredes, móveis); itens nascem dentro dos cômodos
  por afinidade (comida na cozinha, remédio no banheiro); HUD com slots de mochila
  mostrando os ícones; feedback de coleta (anel) e borda de alerta da sirene que aperta
  nos últimos 15s. Dials: corrida 120s, raio de coleta 34, velocidade 340. Testado:
  carrega sem erros; 12 itens + 3 pessoas; slots preenchem certo.
- **09/06/2026** — v0.4: catálogo expandido de 8 → **20 itens** com utilidade e
  **raridade** (comum/incomum/raro). Spawn por raridade com teto de 22 (escassez); raros
  ganham halo dourado e feedback "★ raro!" ao coletar; itens espalhados por afinidade de
  cômodo. Prognóstico do resultado reconhece combustível e joias. Testado: carrega sem
  erros; partida gerou 14 itens (11 comuns / 2 incomuns / 1 raro), 10 tipos distintos.
- **09/06/2026** — v0.5: direção visual definida = **graphic novel** (ilustrado), via IA
  de imagem. Criados `docs/ARTE.md` (bíblia visual) e `docs/PROMPTS-ARTE.md` (prompts dos
  4 personagens + 20 itens). Motor preparado: `BootScene` de preload, manifesto
  `src/data/sprites.js` e **fallback automático** sprite↔placeholder (itens, familiares,
  jogador), pasta `public/assets/`. Testado: Boot→Menu OK, fallback ativo sem erros.
- **09/06/2026** — v0.6: polish de qualidade (independe de arte). **Áudio** sintetizado
  via Web Audio (sirene de ataque, coleta, depósito, tique final, impacto); **vinheta**
  de atmosfera; **tremor de tela** na sirene e no impacto; personagem com **sombra +
  balanço** ao andar; **partículas** ao coletar. Testado: sem erros; vinheta e partícula
  criadas; coleta dispara som+partículas OK; visual confirmado em tela.
- **09/06/2026** — v0.7: pipeline de arte **premium** = **Scenario.gg**. Criado
  `docs/SCENARIO-GUIA.md` (passo a passo: travar estilo via modelo/seed, gerar, remover
  fundo, upscale, exportar) + **24 prompts prontos** (4 personagens + 20 itens), todos com
  o mesmo reforço de estilo pra coesão. Estratégia: validar o `jogador` 1º, integrar e
  calibrar, depois escalar. Aguardando o 1º asset.
- **09/06/2026** — v0.8: **gerador de arte por API** (OpenAI gpt-image-1). Script
  `scripts/gerar-arte.mjs` gera os 24 assets transparentes, salva em `public/assets/` e
  atualiza o manifesto `sprites.js` sozinho; comandos `npm run gerar-arte` e
  `npm run sync-sprites`. `.env` fora do git. Sync validado sem custo. Falta só a chave
  OpenAI no `.env` → então eu gero o `jogador` (validação) e calibramos.
- **09/06/2026** — v0.9: **1ª arte gerada via API e validada!** Acesso OpenAI confirmado
  (auth + billing). Personagem `jogador` (graphic novel, RGBA transparente) integrado como
  sprite no jogo (fallback → Image). Pipeline ponta a ponta OK. Nota: PNGs em alta
  (~1.8MB) → **otimizar/comprimir antes do build mobile** (fluidez). Próximo: escalar os 23.
- **09/06/2026** — v1.0: **VIRADA PARA 3D (estilo Roblox)**, a pedido do maestro. Nova base
  em **Three.js**: mundo com chão + cenário blocky, **avatar montado em caixas**
  (cabeça/tronco/braços/pernas, fácil de editar), **movimento livre 360°** (WASD +
  joystick touch), **câmera 3ª pessoa** e animação de caminhada. Entry `src/main3d.js`;
  carrega sem erros (46 objetos). A base 2D (Phaser) e a arte graphic novel ficam como
  **legado** (não usadas no 3D). Próximo: calibrar controle/câmera e vestir o mundo.
- **09/06/2026** — v1.1: ajustes pós-feedback do maestro: velocidade 7→12; **colisão AABB**
  (o avatar esbarra/desliza nos prédios, não atravessa — 42 obstáculos, validado por teste);
  **câmera anti-oclusão** via raycast (aproxima quando há objeto entre ela e o avatar). Sem erros.
- **09/06/2026** — v1.2: **Cidade VENOR** (vilarejo completo e normal). Biblioteca modular
  `construcoes.js` (prédio, marcos, árvore, fonte; materiais cacheados) + `cidade.js`:
  praça com fonte, ruas em cruz, **igreja** (torre+cruz), **hospital** (cruz vermelha),
  **delegacia**, **escola**, 12 casas e 12 árvores. Colisão (29 obstáculos) + spawn na
  praça. Carrega sem erros (36 objetos). Próximo: controles ricos (correr/pular/abaixar/
  câmera orbital).
- **09/06/2026** — v1.3: polish de qualidade. **Câmera orbital** (gira com dedo/mouse, sobe
  pra ver o céu) + **movimento relativo à câmera**. **Céu em gradiente** (shader) +
  **hemisphere light**. **Água** da fonte animada (ondula/gira, translúcida). **Plantas
  variadas** (árvore/pinheiro/arbusto). **Proporções** corrigidas (portas cabem o avatar;
  marcos mais altos). Mobile: joystick à esquerda + arrasto à direita = câmera. Carrega sem
  erros (41 objetos).
- **09/06/2026** — v1.4: Venor detalhada. **Grade de ruas padrão** + casas **diversas**
  (tamanho/cor/altura); **bancos**, **postes de luz**, **sino na torre da igreja**,
  **flores nos arbustos**, **pinheiros**; **céu mais claro** + **nuvens** que andam. 89
  objetos, 49 colisores, sem erros. Próximo: dia/noite, controles (pular/abaixar/correr),
  rosto do avatar, texturas; e MULTIPLAYER (servidor no Railway).
- **09/06/2026** — v1.5: avatar com **rosto** (olhos, sobrancelhas, boca, mãos, botas) +
  controles **pular/correr/abaixar** (botões no mobile + teclas no PC). Código publicado no
  **GitHub** (`guiilhermesc-jpg/Caseiro`). Deploy: conectando ao **Cloudflare Pages**
  (build `npm run build`, saída `dist`) p/ atualização automática.
- **09/06/2026** — v1.6: correções de qualidade + pet. **Telhado de duas águas** (beiral,
  bordas coerentes); **fonte** com 2 taças + **jatos animados**; casas **alinhadas em
  ângulo reto** (colisão correta); **anti-afundamento** (pés no chão, ruas finas);
  **pet gatinho** que segue o avatar. 90 objetos, sem erros. Deploy via **Wrangler**
  (CLI) — aguardando token Cloudflare no `.env`.
- **09/06/2026** — v1.7: 🎉 **PUBLICADO!** Deploy por comando (Wrangler) no Cloudflare
  Pages → **https://caseiro.pages.dev** (HTTP 200, abre em qualquer aparelho). Projeto
  `caseiro` criado. Re-deploy = `build` + `wrangler pages deploy` (eu rodo a cada
  melhoria). PENDENTE de segurança: **rotacionar o token** (apareceu no chat). Próximo
  grande: **multiplayer** (servidor no Railway) p/ as pessoas se verem.
- **09/06/2026** — v1.8: **tela de seleção de personagem** (overlay VENOR: nome + cores de
  roupa/pele/cabelo, boneco girando em preview, botão ENTRAR) — prepara o multiplayer.
  Avatar com cores parametrizáveis; modos preview/jogo; **bancos maiores**. Build OK,
  publicado. (Preview local ficou sem contextos WebGL após muitos reloads — não afeta o
  publicado.) Próximo: **MULTIPLAYER** (servidor Railway).
 
- **15/06/2026** - RV8.0 / v56: **Pacto da Semana**. Patch de reorganizacao premium:
  PWA/offline-first (`manifest.webmanifest`, `sw.js`, `/baixar.html`), arte oficial em
  `public/patches/rv8-pacto-da-semana.png`, tela de patch dentro do jogo, status online/offline,
  calendario semanal de Venor e **Ze das Rotas** aparecendo somente terca/quinta/sabado.
  Vendas passam por pequeno modificador semanal de escassez. Criados `docs/PATCH_RV8.md`
  e `docs/ASSETS.md` para manter cronograma, licencas e processo sob controle.

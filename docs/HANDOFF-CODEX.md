# HANDOFF — Venor (para continuar do Codex)

> Documento de passagem de bastao. Estado em **RV18.0 (v132)** no `main`, **nao publicado**.
> Leia isto inteiro antes de mexer. Tudo aqui é factual e verificado.

---

## 1. O que é o projeto

**Venor** — MMO 3D estilo Tibia/Albion, **Three.js + Vite**, em `C:\Users\Pichau\projeto-sirene`.
Jogo single-file-ish: o orquestrador é `src/main3d.js` (~4200 linhas). Conteúdo 100% original
(Tibia é só inspiração). Tema central: **dragões** (companheiros que crescem, a "joia da coroa").

- **Produção**: https://caseiro.pages.dev (Cloudflare Pages).
- **Servidor de contas/multiplayer**: Railway (wss). O mundo local funciona offline; o MP é opcional.
- **Versao atual**: constante `VERSAO` em `src/main3d.js` = `'RV18.0 (v132)'`. **Suba a cada entrega.**

---

## 2. Build, rodar e publicar

```bash
cd /c/Users/Pichau/projeto-sirene
npm run build           # vite/rolldown -> dist/. SEMPRE rodar antes de commitar/publicar.
```

- **Deploy (produção)**: `npx wrangler pages deploy dist --project-name=caseiro --commit-dirty=true`
- ⚠️ **REGRA DURA**: só publique com o maestro dizendo **literalmente "pode publicar"** (cliente) /
  **"pode publicar o servidor"** (servidor Railway). Nunca antecipe deploy.
- **Git**: repo `Caseiro` é **compartilhado com `bussola-bitcoin/`**. Sempre `git pull --rebase origin main`
  antes do push. **Ignore o `CLAUDE.md` da raiz** (é do app bitcoin, não do Venor).
- Commits terminam com: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Working dir do shell às vezes reseta pra `~`; prefixe comandos com `cd /c/Users/Pichau/projeto-sirene &&`.
- Arquivos `.ps1` precisam UTF-8 **com BOM** (senão acento vira mojibake) — vale só se for gerar script PS.

---

## 3. Como VERIFICAR (importante)

WebGL normalmente não roda no ambiente de agente, **MAS o preview da Claude (MCP "Claude_Preview")
RODA** com render por software (lento — `preview_screenshot` dá timeout com a cena pesada, mas
`preview_eval` e `preview_console_logs` funcionam). Fluxo que usei e funciona:

1. `preview_start` com config **"Projeto Sirene"** (está no `.claude/launch.json`).
2. `preview_eval` pra dispensar o painel de patch (botão "ENTRAR"), preencher o nome e clicar
   "ENTRAR EM VENOR". **Entre com o nome `gm`** pra ativar o **PAINEL GM** (botão 🛡️, à esquerda).
3. Verificar via DOM: `document.body.innerText`, `localStorage` (saves em chave `venor_conta_<nome>`),
   `preview_console_logs level=error` (loop quente — erro apareceria todo frame).
4. Os botões do painel GM são `div` com listener **`pointerdown`** (não `click`): dispare
   `el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`. Já tem **"🐲 Ganhar
   dragão-filhote"** e **"🐉 Evoluir dragão (máx)"** pra testar o sistema de dragão na hora.

**Não tune 3D às cegas** — o maestro odeia isso. Ou verifica no preview, ou usa o caminho de
imagens geradas por IA (que dá pra ver como imagem).

---

## 4. Arquitetura / arquivos-chave

- `src/main3d.js` — orquestrador: loop `passo(dt)`, câmera, combate, dragões, save/load, GM, HUD wiring.
- `src/jogo/`:
  - `avatar.js` — `criaAvatar(cores)`; `g.userData.partes`; `animaAvatar`; `MODELO_NOME`/`MODELOS` (vocações).
  - `cidade.js` — `criaCidade()` monta o mundo de superfície (vilarejo, Venore, Noctaria, Thais-via-import,
    chãos por região, muralha, fontes...). Helper `add(res)` agrega `grupo/colisores/aguas/animados/...`.
  - `ratos.js` — TODOS os bichos (`criaRato`, `criaDragao`, `criaBeholder`, `criaOrc`, `criaCiclope`...)
    + `atualizaRatos(ratos, dt, jog, podeAndar, alturaSolo)` (anima idle: respiração/patas/asas/garganta/tentáculos).
  - `props.js` — `criaBandeira/criaBau/...` + **`animaProps(animados, dt, tempo)`** (vocabulário:
    `gira, giraZ, flutua, pulsa, balanca, sway, porta, fumaca, chama, atualiza(dt,t)`).
  - `construcoes.js` — `criaPredio` (casas, com `estiloParede`/`estiloTelhado`), `matParedeEstilo`,
    `matTelhaEstilo`, `criaMuralha`, `criaMansao`, `criaGuildHouse`, `criaMarco` (igreja→Templo c/ Orbe da Veia),
    `aplicaTexturaReal`.
  - `interiores.js` — interiores entráveis (porta animada, lamparina/lareira piscam via `animados`).
  - `natureza.js` — lago/riacho/deck (água entra em `aguas[]` p/ a marola).
  - `esgoto.js`, `nuvens.js` (Aurélia, cidade nas nuvens), `irmas.js`, `deserto.js`, `catedral` — ZONAS
    carregadas (y=-40, `subsoloAtual`, `noEsgoto`).
  - `painel.js` — **ficha do personagem estilo Tibia** (tecla C / botão 📜): nível, vida/mana/XP, 7 slots
    de equipamento, **ficha do dragão** (retrato, vida, crescimento, afinidade, poderes, toggle ☀️/🌙).
  - `dragoes-companheiro.js` — **modelo de DADOS** puro/serializável do dragão (ESPECIES_DRAGAO, ESTAGIOS,
    `criaDragaoData`, `statsDragao`, `ganhaXpDragao`, afinidade, XP_JOVEM/XP_ADULTO).
  - `bestiario.js` — overlay 🐲 com os dragões + lore. `selecao.js`, `customizar.js`, `hud.js`,
    `dialogo.js`, `calendario.js`, `texturas.js` (matPBR/normal), `escala.js` (FATOR global, =1.0),
    `patchNotes.js` (painel "PATCH RV17.1 - Calabouco Vivo").
- `scripts/gera-*.mjs` — geradores de arte com **OpenAI gpt-image-1** (`OPENAI_API_KEY` no `.env`).
  Padrão: POST `api.openai.com/v1/images/generations`, `quality:high`, `b64_json`. `sharp` instalado p/
  reduzir (1024→512). Prompts "night dragon" às vezes batem no safety — suavizar (evitar "war-mount/plasma").

---

## 5. Sistema de DRAGÃO-COMPANHEIRO (centro do jogo)

- Dados em `dragoes-companheiro.js` (sem THREE, serializável → vai pro save). Estágios
  **filhote→jovem→adulto** com escala/multHP/multDano; XP **lento** (XP_JOVEM=1500, XP_ADULTO=7000);
  ganha **metade do XP do herói** (`evoluiDragaoComHeroi` em main3d, hook no `hud.ganhaXP`).
- `let dragaoCompanheiro` em main3d; sincronizado com `petTipo` (pet-dragão ativo) em `trocaPet` →
  `sincronizaDragaoCompanheiro()`; modelo 3D re-escala por estágio (`aplicaEstagioNoModelo`).
- **Afinidade ☀️Dia/🌙Noite**: escolhível no painel (toggle), dá **+50% de dano** quando o período bate
  (na mordida do pet). Salvo em `save.dragaoComp`.
- Modelo 3D = `criaDragao()` procedural (ratos.js); `g.userData` inclui patas, asas, corpoMat,
  garganta, cauda[], cabeca, olhos, mandibula, pescoco e tipo.

---

## 6. Sistema de ANIMAÇÃO (recém-feito no RV15)

- **`animaProps`** (props.js): props registrados em `animados[]` com flags. Bandeiras `balanca` (tremulam),
  postes `chama`, fumaça de chaminé `fumaca`, moinho `giraZ`, lamparina/lareira `atualiza(dt,t)`.
- **`atualizaRatos`** (ratos.js ~62-76): "VIDA SEMPRE" — respiração (scale), patas/asas/garganta,
  **tentáculos do beholder** flutuam (`userData.tentaculos`).
- **`animaCompanheiro(g, movendo, ritmo, voando)`** (main3d ~1330): pet/dragão — asas (amplas no `voando`),
  patas recolhidas voando, **garganta** respira/**flameja** ao cuspir (`garganta.userData._flare = tempo`),
  **cauda** em onda propagada (`Array.isArray(u.cauda)`).
- **Dragão do céu** (`dragaoCeu`, main3d ~190 + loop ~4130): modelo 3D `criaDragao(lord)` escala 7,
  orbita + aponta no voo + banca + `animaCompanheiro(...true)` (asas/cauda). **Não é mais sprite estático.**
- **Boss dragão** (vooDragao, main3d ~4101): idle respira (`animaCompanheiro(...,false)`); voo completo + banca (`rotation.z`).
- **Investida dos monstros** (`atualizaPresencaMonstros` ~2818): **wind-up agacha** (scale.y) + recolhe patas;
  **golpe estica** (scale.z) + **inclina** (rotation.x). `atualizaRatos` repõe a escala base no frame seguinte (sem restore).
- **Flinch** (loop após `atualizaRatos`, main3d ~4066): todo bicho **recua+encolhe** ao apanhar
  (`r._flinch` setado em `atacar()` e na mordida do pet).

---

## 7. Estado novo do RV16.0 (Codex)

- `public/patches/rv16-moradias-dragoes.png` é a arte oficial do patch; também está no manifesto, página `/baixar.html`, `patchNotes.js` e cache offline.
- `main3d.js` tem `imoveisEstado` e `bancoOuro` salvos por conta. O bloco de imóveis fica perto do antigo bloco "CASAS À VENDA".
- Imóveis atuais: 2 casas simples, 3 mansões e 1 guildhouse. Placas usam `registraImovel`; benefícios usam `abreImovel`.
- Dormir em imóvel recupera vida/mana e, se houver dragão-companheiro, aumenta `dragaoCompanheiro.ml` + XP.
- `statsDragao()` expõe `ml` e `bonusMagico`; dano do pet-dragão multiplica por ML com limite.
- `pet.js` adicionou variantes 3D tintadas: `furiaDoDia`, `furiaDaNoite`, `dragaoPantano`, `dragaoGelo`, `dragaoVeia`.
- `cidade.js` adicionou vapor nos bueiros e mansões/guildhouse; `props.js` ganhou `sway`.
- Documento da rodada: `docs/RV16_0_MORADIAS_DRAGOES.md`.

## 7.1 Estado novo do RV16.1 (Codex)

- `public/patches/rv16-1-portoes-continente.png` é a arte oficial do patch; conectada em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js`.
- `src/jogo/construcoes.js` ganhou `criaPortaoCidade`: torres, arco, grade elevada, portas abertas, tabuleta, brasão, estandartes e chamas animadas, com vão central livre.
- `src/jogo/cidade.js` aplica o novo portão em Venor e Venore.
- `src/jogo/thais.js` aplica o novo portão em Thais e no acesso sul da Rota do Deserto; agora retorna `animados`.
- `src/main3d.js` subiu para **RV16.1 (v112)** e a mordida do dragão-companheiro ganhou pulso corporal, garganta flamejante e flinch mais forte no alvo.
- `docs/BIBLIA_CONTINENTE_VENOR.md` organiza continente, macro-regiões, hunts, quest chains, economia e cronograma.
- Documento da rodada: `docs/RV16_1_PORTOES_CONTINENTE.md`.

## 7.2 Estado novo do RV16.2 (Codex)

- `public/patches/rv16-2-bichos-presenca.png` é a arte oficial do patch; conectada em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js`.
- `src/main3d.js` subiu para **RV16.2 (v113)**.
- `src/jogo/ratos.js` ganhou camada de presença visual: cabeça/olhos seguem alvo, aracnídeos animam membros e ameaças animam arma/garras/ferrão/mandíbula.
- Orc, ciclope e Drakari agora guardam arma/lança em `userData` para a investida mover o objeto certo.
- Dragão/boss de fogo recebe flinch mais forte em golpe, flecha, runa e magia, com garganta acesa no impacto.
- Documento da rodada: `docs/RV16_2_BICHOS_COM_PRESENCA.md`.

## 7.3 Estado novo do RV16.3 (Codex)

- `public/patches/rv16-3-interiores-prestigio.png` é a arte oficial do patch; conectada em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js`.
- `src/main3d.js` subiu para **RV16.3 (v114)**.
- `src/jogo/interiores.js` ganhou `criaMansaoInterior` e `criaGuildHouseInterior`: zonas internas grandes, com colisao, mesa, biblioteca, cofre, banco, lixeira, ninho/berco draconico, trofeus e luzes.
- `src/main3d.js` conecta `Entrar no interior` no menu de imovel alugado e filtra interativos por `zona`, para um interior nao enxergar objetos de outro.
- Morte/teleporte GM agora chama `escondeZonasCarregadas()`, incluindo interiores de imoveis.
- Documento da rodada: `docs/RV16_3_INTERIORES_PRESTIGIO.md`.

## 7.4 Estado novo do RV16.4 (Codex)

- `public/patches/rv16-4-luz-detalhe.png` eh a arte oficial do patch; conectada em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js`.
- `src/main3d.js` subiu para **RV16.4 (v115)**.
- `src/jogo/interiores.js` recebeu camada grafica premium: candelabro, galeria superior, escadaria, tapecarias, mapas, plantas, cofre com moedas, feixe de luz na porta e luz propria no berco/ninho draconico.
- A direcao do site/portal estilo Tibia fica explicitamente planejada para o **Patch 17**, com noticias, contas, personagens e rankings. Nao implementar no RV16.
- Documento da rodada: `docs/RV16_4_LUZ_DETALHE.md`.

## 7.5 Estado novo do RV16.5 (Codex)

- `public/patches/rv16-5-cidade-profissional.png` eh a arte oficial do patch; conectada em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js`.
- `src/main3d.js` subiu para **RV16.5 (v116)**.
- `src/jogo/construcoes.js` refez `criaFonte`: pedra PBR, bordas, espuma, musgo e 32 gotas animadas.
- `src/jogo/cidade.js` ganhou acabamento urbano instanciado: manchas de terra, musgo, fissuras e seixos em ruas/pracas. Tambem reduziu o mato em billboard e aumentou capim 3D, seixos, terra exposta e capim rasteiro.
- `src/jogo/texturas.js` melhorou o tipo `grama` com sulcos, laminas e variacao para reduzir leitura de papel de parede.
- `src/jogo/avatar.js` removeu o cone do mago legado e adicionou capuz, robe com bordas, broche, cajado e orbe; feiticeiro/druida tambem ganharam bordas e cajado.
- Documento da rodada: `docs/RV16_5_CIDADE_PROFISSIONAL.md`.

## 7.6 Estado novo do RV16.6 (Codex)

- `public/patches/rv16-6-praca-jogavel.png` eh a arte oficial do patch; derivada da imagem aprovada pelo maestro como contrato visual da experiencia jogavel.
- `src/main3d.js` subiu para **RV16.6 (v117)**.
- `src/jogo/construcoes.js` reforcou `criaPredio`: fachadas de madeira_viga ganharam diagonais de enxaimel e vegetacao escalando a parede.
- `src/jogo/cidade.js` ganhou helpers de densidade urbana (`criaEscadariaCenica`, `criaVasoNobre`, `criaMesaMercante`) aplicados na praca inicial e no Grande Mercado de Venore.
- O casario inicial ficou maior e mais proporcional: casas decorativas agora nascem com escala de vila medieval em vez de leitura baixa/prototipo.
- `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js` apontam para o RV16.6 e mantem o jogo offline-first.
- Documento da rodada: `docs/RV16_6_PRACA_JOGAVEL.md`.

## 7.7 Estado novo do RV16.7 (Codex)

- `public/patches/rv16-7-identidade-premium.png` eh a arte oficial do patch; herdada da praca aprovada enquanto a repaginacao sistemica avanca.
- `src/main3d.js` subiu para **RV16.7 (v118)**.
- `docs/CRONOGRAMA_IDENTIDADE_PREMIUM.md` registra a regra nova: imagem oficial precisa representar sistema real do jogo.
- `src/jogo/cidade.js` melhorou `detalhaRua()`: bueiros agora tem tampa maior, moldura, grade, mancha de umidade e vapor mais presente.
- `src/jogo/props.js` melhorou props base: barris com tampas/frisos, caixas com diagonais/selo, baus com ferragens/moedas.
- `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js` apontam para o RV16.7 e cache `venor-rv16-7-offline-v1`.
- Documento da rodada: `docs/RV16_7_IDENTIDADE_PREMIUM.md`.

## 7.8 Estado novo do RV16.8 (Codex)

- `public/patches/rv16-8-lore-operacional.png` eh a arte oficial do patch; copia versionada da praca aprovada porque RV16.8 e base/lore/processo, nao uma promessa visual nova.
- `src/main3d.js` subiu para **RV16.8 (v119)**.
- `src/jogo/npcs.js` migrou nomes de NPCs para lore tradicional e adicionou `legacyNome` para preservar economia de saves antigos.
- `src/jogo/npcs.js` agora copia `loja`, `compra` e `ofertas` para o NPC vivo; isso evita dialogo sem comercio.
- `src/main3d.js` manteve IDs de quest existentes estaveis e passou a restaurar economia pelo nome novo ou legado.
- Criado `docs/BIBLIA_NPCS.md` com nomes novos, nomes antigos, papeis e regra de criacao.
- `docs/CRONOGRAMA_IDENTIDADE_PREMIUM.md` virou gate de qualidade: criacao nova so entra com funcao, animacao/GIF quando aplicavel, cache/offline, teste e documentacao.
- `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e `sw.js` apontam para RV16.8 e cache `venor-rv16-8-offline-v1`.
- Documento da rodada: `docs/RV16_8_LORE_OPERACIONAL.md`.

## 7.9 Direcao macro nova - 30 pactos e sistemas MMO profissionais

- O mapa continental aprovado pelo maestro agora e oficialmente **1/30** do mundo planejado.
- Venor e Arredores sao o **Pacto Continental 01/30**, com fechamento previsto na **RV30**.
- Nao abrir Pacto 02 antes de Venor fechar com densidade: cidade, casas, hunts, dragao, NPCs, UI,
  economia, rotas, interiores, bestiario, mapa, offline/instalavel e multiplayer base.
- Novos documentos canonicos:
  - `docs/PLANO_30_CONTINENTES.md`
  - `docs/BIBLIA_SISTEMAS_MMO_PROFISSIONAL.md`
  - `docs/BIBLIA_MONSTROS_DRAGOES.md`
- Referencias de sistema: WoW para escala, legibilidade, QoL e colecoes; Tibia para mundo aberto,
  perigo, viagem e casas; Albion para economia, transporte, montarias e risco por rota.
- Regra de autoria: nao copiar IP. Absorver principios e transformar em Venor.
- Regra de arte reforcada: patch art oficial mostra sistema real. Futuro pode aparecer como pressagio,
  nunca como entrega falsa.
- Previas visuais salvas em `docs/PREVIAS_VISUAIS_RV16_9.md` e `public/patches/concepts/`.
  Em rodada grafica nova, sempre gerar/usar previa e transformar a imagem em lista de implementacao.

## 7.10 Estado novo do RV16.9 (Codex)

- `src/main3d.js` subiu para **RV16.9 (v120)**.
- `public/patches/rv16-9-mago-viajante.png` e a arte oficial do patch, conectada em patch notes, manifest, baixar e cache offline.
- Novo item raro: **Manto do Mago Viajante** (`slot: tronco`, defesa 9, outfit `magoViajante`).
- Nova quest da Helyra: **O Manto do Mago Viajante**, requer `terceiroSinal`, nivel 10 e `Cristal do Pico`.
- Ao equipar o manto, o avatar ganha capuz, capa longa azul-profunda, bordas douradas, orbe violeta, ombreiras e cajado ritual visual.
- Dragoes procedurais ficaram menos infantis: corpo escuro, pescoco/cabeca reposicionados, asas maiores, cauda mais longa e escala de crescimento maior.
- Documento da rodada: `docs/RV16_9_MAGO_VIAJANTE.md`.

## 7.11 Estado novo do RV17.0 (Codex)

- `src/main3d.js` subiu para **RV17.0 (v121)**.
- `public/patches/rv17-grande-onda.png` e a arte oficial do patch; conectada em patch notes, manifest, baixar, SW e cache offline.
- Aurelia ganhou arquipelago celeste com Jardins Suspensos, Portao dos Primeiros Ventos, Mirante do Voo Rasante e Obelisco da Linhagem.
- Novo `criaCalaboucoVentos()` em `src/jogo/nuvens.js`: primeira masmorra grande das alturas, com salas, corredores, cristais, boss arena e retorno para Aurelia.
- Novos monstros em `src/jogo/ratos.js`: Sentinela Celeste, Golem de Cristal, Wyvern Celeste e Guardiao do Primeiro Vento.
- Novas quests: **A Grande Onda** (Ulrion, Sentinelas Celestes) e **O Primeiro Vento** (Helyra, boss do calabouco).
- Armas de cla por vocacao: Lamina do Portao Antigo, Arco do Horizonte, Cajado da Veia Alta e Cetro de Raiz Viva. Ulrion concede uma vez por save, apos entrada na Guilda.
- Quadro `ROTAS` agora registra rotas/habitats de Aurelia e do Calabouco dos Primeiros Ventos.
- Dragao adulto montado ganhou planeio inicial: salto mais alto e queda suavizada em zona aberta. Voo livre completo segue como fase futura.
- Documento da rodada: `docs/RV17_GRANDE_ONDA.md`.

## 7.12 Estado novo do RV17.1 (Codex)

- `src/main3d.js` subiu para **RV17.1 (v122)**.
- `public/patches/rv17-1-calabouco-vivo.png` e a arte oficial do patch; conectada em patch notes, manifest, baixar, SW e cache offline.
- Calabouco dos Primeiros Ventos ganhou braseiros, faixas no piso, estandartes, luzes, altar com quatro armas distintas e Bau dos Primeiros Ventos.
- Bau dos Primeiros Ventos e recompensa unica por conta, salva em `bauVentos`.
- Novo material de progressao: `Fragmento de Asa Antiga`, com preco de venda e papel de pressagio para voo draconico.
- `bestiario.js` ganhou a secao **Criaturas da Grande Onda** com funcao e loot de Sentinela, Golem, Wyvern e Guardiao.
- Documento da rodada: `docs/RV17_1_CALABOUCO_VIVO.md`.

## 7.13 Estado novo do RV17.2-RV17.5 (Codex)

- `src/main3d.js` subiu para **RV17.5 (v126)**.
- Artes oficiais salvas:
  - `public/patches/rv17-2-bichos-premium.png`
  - `public/patches/rv17-3-interiores-realidade.png`
  - `public/patches/rv17-4-rotas-continente.png`
  - `public/patches/rv17-5-moradias-economia.png`
- `ratos.js`: Sentinela/Golem/Wyvern celestes ganharam mais presenca procedural, animacao e leitura visual.
- `main3d.js`: novos drops celestes, quest `Contrato da Hunt Celeste`, quest `Brasao de Moradia` e aluguel com validade real/renovacao.
- `interiores.js`: mansoes/guildhouses receberam mesa de contratos, cartografia, quadro e despensa interativa.
- `jornadas.js`: quadro `ROTAS` ganhou contratos de viagem com custo, risco, requisito e funcao.
- `patchNotes.js`, `manifest`, `baixar`, `sw` e `index` atualizados para RV17.5/offline.
- Documentos da rodada: `docs/RV17_2_BICHOS_PREMIUM.md`, `docs/RV17_3_INTERIORES_REALIDADE.md`, `docs/RV17_4_ROTAS_CONTINENTE.md`, `docs/RV17_5_MORADIAS_ECONOMIA.md`.

## 7.14 Estado novo do RV17.5.1 (Codex)

- `src/main3d.js` subiu para **RV17.5.1 (v127)**.
- `cidade.js` recebeu camada de paridade visual com a arte de rua noturna:
  - Mural de Contratos de Venor interativo.
  - Loja Noturna de Venor iluminada.
  - Dragao descansando decorativo/interativo.
  - Bau, caixa e barril adicionais no primeiro anel da vila.
- Criado `docs/CONTRATO_VISUAL_PREMIUM.md`: imagem oficial precisa corresponder a sistema real; caso contrario deve ser marcada como previa/conceito.

## 7.15 Estado novo do RV17.6-RV17.9 (Codex)

- `src/main3d.js` subiu para **RV17.9 (v131)**.
- Artes oficiais salvas:
  - `public/patches/rv17-6-contrato-visual.png`
  - `public/patches/rv17-7-bases-vivas.png`
  - `public/patches/rv17-8-hunts-reacao.png`
  - `public/patches/rv17-9-preparacao-rv18.png`
- Previa visual do proximo ciclo:
  - `public/patches/rv18-grande-pacto.png`
- `patchNotes.js`, `manifest.webmanifest`, `baixar.html`, `sw.js` e `index.html` foram conectados ao cache `venor-rv17-9-offline-v1`.
- `cidade.js` ganhou a pedra interativa **Pacto 18** no primeiro anel de Venor, deixando a preparacao do Patch 18 dentro do mundo.
- Docs criados: `RV17_6_CONTRATO_VISUAL.md`, `RV17_7_BASES_VIVAS.md`, `RV17_8_HUNTS_REACAO.md`, `RV17_9_PREPARACAO_RV18.md`, `PATCH18_GRANDE_PACTO.md`.
- Regra mantida: `rv18-grande-pacto.png` e previa, nao promessa entregue.

## 7.16 Estado novo do RV18.0 (Codex)

- `src/main3d.js` subiu para **RV18.0 (v132)**.
- `public/launcher.html` e a nova entrada do app instalado.
- `public/patch-manifest.json` registra versao, build, cache, assets, updates e proximos passos.
- `public/manifest.webmanifest` agora abre em `/launcher.html`.
- Cache offline subiu para **venor-rv18-0-offline-v1**.
- `src/jogo/selecao.js` recebe conta do launcher via `sessionStorage` e entra automaticamente.
- `patchNotes.js`, `baixar.html`, `sw.js` e `index.html` foram conectados ao launcher.
- Documento da rodada: `docs/RV18_0_LAUNCHER_INSTALADO.md`.
- Nao houve deploy/push.

## 8. FILA DE TRABALHO (pendências, ordenadas) — continue daqui

Da auditoria por workflow (4 domínios). Fórmulas/âncoras já levantadas; tudo de **baixo risco**, procedural.

### Fila canonica apos 2026-06-23

1. **RV18.1 - Portal publico** - noticias, conta/personagens, rankings, mapa, bestiario, patch notes e biblioteca de lore.
2. **RV18.2 - Pacote instalado pesado** - medir mobile, decidir Tauri/Capacitor, separar assets pesados e planejar patcher real.
3. **RV18.3 - Preparacao de viagem** - transformar despensa/contratos em buffs, custo, cooldown e retorno real.
4. **RV18.4 - Doma adulta e Draptor** - boss do Coracao, Sela Draconica, chance rara, preparo que aumenta chance e variante lendaria.
5. **RV18.5 - Voo draconico controlado** - zonas aereas, stamina, pouso, ilhas altas e limite contra abuso.
7. **RV19-RV30 - Fechamento do Pacto 01/30** - seguir `docs/PLANO_30_CONTINENTES.md`.
9. **Dragao adulto e Draptor** - doma adulta, Sela Draconica, invasoes raras, versao lendaria e preparo que melhora chance.
10. **QoL profissional** - examinar NPC/objeto, diario, bestiario, mapa, colecoes, magias por vocacao e grupo.
11. **Racas/faccoes/era antiga** - orcs, anoes, paladinos, bruxos, druidas, dragoes antigos, maquinas e anomalias.
12. **Escala tipo Tibia** - cidades mais longe, mas so depois de parametrizar coordenadas e validar rotas.

### Fila historica anterior

1. **RV16.9 - Interiores como realidade** — alinhar mansoes/guildhouses ao hall nobre: candelabro, escada, mesa, biblioteca, bau, trofeus e funcao.
2. **RV16.10 - Bichos e hunts como realidade** — alinhar criaturas/hunts a arte de bestiario: silhueta, ataque, impacto, terreno e loot visual.
3. **RV16.11 - Continente e viagens** — transformar a arte de mapa em plano jogavel por regioes, rotas longas e pontos de viagem.
4. **Aluguel recorrente** — hoje é contrato inicial salvo; falta vencimento semanal/renovação estilo MMO.
5. **Domar dragão ADULTO** via boss do **Coração** — dados prontos (`ESPECIES_DRAGAO`, item "Coração de Dragão"
   já em `PRECOS`), falta: drop do Coração em invasão/boss + consagrar "Sela Dracônica" + fluxo de domação adulta.
6. **Variantes 3D** do Colosso/Trífauce (3 cabeças) como bosses no mundo (clonar cabeça/pescoço em criaDragao).
7. **QoL do Tibia**: examinar (clique-direito em NPC/objeto mostra info); magias gated por vocação.
8. **Portal Patch 17**: site publico estilo Tibia, com noticias de updates, contas, personagens, rankings e pagina de patch.
9. **RV18 instalavel premium**: preparar app instalado quando GLBs/texturas/animacoes passarem do peso saudavel da web.
10. **RV22/RV25 racas e era antiga**: orcs, anoes, paladinos, bruxos/feiticeiros, druidas, dragoes antigos, maquinas e anomalias externas conforme `docs/BIBLIA_NPCS.md`.
11. **Escala Tibia** (cidades mais longe): `escala.js` tem `FATOR` global (=1.0=idêntico). Virar o fator
   orfana coordenadas — fazer com cuidado/validação. **Deferido**.

Saídas completas da auditoria/design ficam nos arquivos de output das tasks de workflow (em
`AppData\Local\Temp\claude\...\tasks\*.output`) — efêmeras; se sumirem, rode novo workflow.

---

## 9. Constraints e regras do maestro (NÃO esquecer)

- Deploy só com "pode publicar" literal (ver §2).
- Qualidade é prioridade absoluta: **nada estático, nada feio, tudo harmônico**. Dragões são a joia da coroa.
- Não expor vida pessoal/família dele em produto/marketing (regra geral do usuário).
- O maestro quer **trabalho contínuo** e detalhista; não parar cedo nem ficar pedindo validação à toa.
- `docs/CHECKPOINT.md` tem o diário longo (12ª→RV15). Este HANDOFF é o resumo operacional.

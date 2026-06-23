# HANDOFF — Venor (para continuar do Codex)

> Documento de passagem de bastão. Estado em **RV16.7 (v118)** no `main`, **não publicado**.
> Leia isto inteiro antes de mexer. Tudo aqui é factual e verificado.

---

## 1. O que é o projeto

**Venor** — MMO 3D estilo Tibia/Albion, **Three.js + Vite**, em `C:\Users\Pichau\projeto-sirene`.
Jogo single-file-ish: o orquestrador é `src/main3d.js` (~4200 linhas). Conteúdo 100% original
(Tibia é só inspiração). Tema central: **dragões** (companheiros que crescem, a "joia da coroa").

- **Produção**: https://caseiro.pages.dev (Cloudflare Pages).
- **Servidor de contas/multiplayer**: Railway (wss). O mundo local funciona offline; o MP é opcional.
- **Versão atual**: constante `VERSAO` em `src/main3d.js` = `'RV16.7 (v118)'`. **Suba a cada entrega.**

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
    `patchNotes.js` (painel "PATCH RV16.7 — Identidade Premium").
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

## 8. FILA DE TRABALHO (pendências, ordenadas) — continue daqui

Da auditoria por workflow (4 domínios). Fórmulas/âncoras já levantadas; tudo de **baixo risco**, procedural.

1. **RV16.8 - Interiores como realidade** — alinhar mansoes/guildhouses ao hall nobre: candelabro, escada, mesa, biblioteca, bau, trofeus e funcao.
2. **RV16.9 - Bichos e hunts como realidade** — alinhar criaturas/hunts a arte de bestiario: silhueta, ataque, impacto, terreno e loot visual.
3. **RV16.10 - Continente e viagens** — transformar a arte de mapa em plano jogavel por regioes, rotas longas e pontos de viagem.
4. **Aluguel recorrente** — hoje é contrato inicial salvo; falta vencimento semanal/renovação estilo MMO.
5. **Domar dragão ADULTO** via boss do **Coração** — dados prontos (`ESPECIES_DRAGAO`, item "Coração de Dragão"
   já em `PRECOS`), falta: drop do Coração em invasão/boss + consagrar "Sela Dracônica" + fluxo de domação adulta.
6. **Variantes 3D** do Colosso/Trífauce (3 cabeças) como bosses no mundo (clonar cabeça/pescoço em criaDragao).
7. **QoL do Tibia**: examinar (clique-direito em NPC/objeto mostra info); magias gated por vocação.
8. **Portal Patch 17**: site publico estilo Tibia, com noticias de updates, contas, personagens, rankings e pagina de patch.
9. **Escala Tibia** (cidades mais longe): `escala.js` tem `FATOR` global (=1.0=idêntico). Virar o fator
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

# HANDOFF — Venor (para continuar do Codex)

> Documento de passagem de bastão. Estado em **RV15.6 (v110)**, publicado em produção.
> Leia isto inteiro antes de mexer. Tudo aqui é factual e verificado.

---

## 1. O que é o projeto

**Venor** — MMO 3D estilo Tibia/Albion, **Three.js + Vite**, em `C:\Users\Pichau\projeto-sirene`.
Jogo single-file-ish: o orquestrador é `src/main3d.js` (~4200 linhas). Conteúdo 100% original
(Tibia é só inspiração). Tema central: **dragões** (companheiros que crescem, a "joia da coroa").

- **Produção**: https://caseiro.pages.dev (Cloudflare Pages).
- **Servidor de contas/multiplayer**: Railway (wss). O mundo local funciona offline; o MP é opcional.
- **Versão atual**: constante `VERSAO` em `src/main3d.js` = `'RV15.6 (v110)'`. **Suba a cada entrega.**

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
    `gira, giraZ, flutua, pulsa, balanca, porta, fumaca, chama, atualiza(dt,t)`).
  - `construcoes.js` — `criaPredio` (casas, com `estiloParede`/`estiloTelhado`), `matParedeEstilo`,
    `matTelhaEstilo`, `criaMuralha`, `criaMarco` (igreja→Templo c/ Orbe da Veia), `aplicaTexturaReal`.
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
    `patchNotes.js` (painel "PATCH RV14 — A Era dos Dragões").
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
- Modelo 3D = `criaDragao()` procedural (ratos.js); `g.userData = {patas, asas, corpoMat, garganta, cauda[], tipo}`.

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

## 7. FILA DE TRABALHO (pendências, ordenadas) — continue daqui

Da auditoria por workflow (4 domínios). Fórmulas/âncoras já levantadas; tudo de **baixo risco**, procedural.

1. **Bueiros com vapor** — `cidade.js` ~270 tem `ralos` como **InstancedMesh** (sem anim). Adicionar 2-3
   puffs (padrão `MAT_FUMACA` de `construcoes.js`) perto dos ralos, empurrando 1 obj em `animados` (`fumaca`).
2. **Árvores ao vento** — `criaPinheiro`/`criaArbusto` (construcoes.js 525/537) NÃO balançam, e parte da
   vegetação é **InstancedMesh** (cuidado com perf). Sway sutil (rotation.z pivotando na base) só nos Groups.
3. **Armas dos monstros no golpe** — orc(machado)/ciclope(clava, msg "ergue a clava" mas não ergue)/drakari(lança):
   armas são filhos soltos de `g` (não em `userData`). Coletar `arma` no `userData` em ratos.js e GIRAR na investida.
4. **Olhos seguindo o jogador** — olhos são malhas fixas; leve giro da cabeça/olho na direção do alvo em aggro.
5. **Membros de aranha/escorpião/caranguejo** — pernas/ferrão/garras parados no idle (coletar e animar).
6. **Domar dragão ADULTO** via boss do **Coração** — dados prontos (`ESPECIES_DRAGAO`, item "Coração de Dragão"
   já em `PRECOS`), falta: drop do Coração em invasão/boss + consagrar "Sela Dracônica" + fluxo de domação adulta.
7. **Variantes 3D** do Colosso/Trífauce (3 cabeças) como bosses no mundo (clonar cabeça/pescoço em criaDragao).
8. **QoL do Tibia**: examinar (clique-direito em NPC/objeto mostra info); magias gated por vocação.
9. **Escala Tibia** (cidades mais longe): `escala.js` tem `FATOR` global (=1.0=idêntico). Virar o fator
   orfana coordenadas — fazer com cuidado/validação. **Deferido**.

Saídas completas da auditoria/design ficam nos arquivos de output das tasks de workflow (em
`AppData\Local\Temp\claude\...\tasks\*.output`) — efêmeras; se sumirem, rode novo workflow.

---

## 8. Constraints e regras do maestro (NÃO esquecer)

- Deploy só com "pode publicar" literal (ver §2).
- Qualidade é prioridade absoluta: **nada estático, nada feio, tudo harmônico**. Dragões são a joia da coroa.
- Não expor vida pessoal/família dele em produto/marketing (regra geral do usuário).
- O maestro quer **trabalho contínuo** e detalhista; não parar cedo nem ficar pedindo validação à toa.
- `docs/CHECKPOINT.md` tem o diário longo (12ª→RV15). Este HANDOFF é o resumo operacional.

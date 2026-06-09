# Produção de Arte Premium — Scenario.gg

> Guia para gerar toda a arte do Projeto Sirene **coesa e profissional** no Scenario.
> Estilo-alvo: **graphic novel** (ver `ARTE.md`). Os nomes de botões podem variar
> conforme a versão do site — os **conceitos** abaixo seguem valendo.

---

## 🧭 Regra de ouro: VALIDE 1, DEPOIS ESCALE
Gere **só o `jogador` primeiro** → me mande → eu integro e ajustamos
estilo/tamanho/transparência. **Só então** produza o resto. Economiza créditos e
garante que tudo nasça coeso.

---

## Passo 0 — Conta
1. Crie conta no Scenario (scenario.com / app.scenario.gg).
2. Escolha um plano pago (confirme o preço atual no site).

## Passo 1 — TRAVAR O ESTILO (o pulo do gato da consistência)
Você tem dois níveis. Comece pelo **A**; suba pro **B** se quiser perfeição.

### A) Rápido — usar um modelo de estilo pronto
1. Na biblioteca de **Models** do Scenario, procure um estilo:
   `graphic novel`, `comic`, `inked illustration`, `dark hand-painted`, `noir`.
2. Escolha um que combine com a `ARTE.md` (sombrio, contornos, sério).
3. **Fixe a SEED** (anote o número): repetir a mesma seed mantém o look entre as peças.

### B) Premium — treinar SEU modelo de estilo (coesão máxima)
1. Gere ~15–20 imagens com um modelo base + o nosso prompt de estilo (Passo 3).
2. **Cure**: fique só com as que estão no tom certo; descarte as fora do estilo.
3. Treine um novo **Model do tipo "Style"** com essas imagens.
4. Passe a gerar **tudo** com esse modelo → todas as peças "da mesma mão".
   > Não use arte protegida de terceiros para treinar. Use suas próprias gerações.

## Passo 2 — Configurações de geração (premium)
- **Proporção:** 1:1 (quadrado). **Resolução:** a maior disponível.
- **Mesmo modelo + mesma seed + mesmo sufixo de estilo** em TODAS as peças.
- **Negative prompt:**
  `bright cartoon colors, comedy, photorealism, busy background, multiple objects, text, watermark, blurry`

## Passo 3 — Prompts (assunto + reforço de estilo)
Como o **modelo já carrega o estilo**, o prompt foca no OBJETO + um reforço leve.

**Reforço de estilo (cole no fim de cada prompt):**
```
, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime
palette, dramatic shadows, single centered subject, slight top-down 3/4 angle,
soft shadow beneath, plain neutral background
```

**Personagens** (de `PROMPTS-ARTE.md` §2) e **20 itens** (tabela de assuntos em
`PROMPTS-ARTE.md` §3): use o `[ASSUNTO]` + o reforço acima. Ex. `jogador`:
```
A determined civilian survivor in worn winter clothes, full body, + (reforço de estilo)
```

## Passo 4 — Transparência
- Use **Remove Background** do Scenario em cada imagem (recorte limpo, sem halo branco).

## Passo 5 — Nitidez
- Use **Upscale** para deixar nítido; depois exporte reduzindo para **512×512**.

## Passo 6 — Salvar (com o nome e a pasta exatos)
- Personagens → `public/assets/personagens/<id>.png` (`jogador`, `mae`, `filho`, `avo`)
- Itens → `public/assets/itens/<id>.png` (os ids da tabela)
- PNG **transparente**.

---

## ✅ Checklist de qualidade (antes de aprovar cada peça)
- [ ] Mesmo traço/estilo das outras peças?
- [ ] Fundo 100% transparente (sem halo branco)?
- [ ] Um objeto, centralizado, com margem?
- [ ] Paleta dessaturada (nada de cor berrante)?
- [ ] Sombra suave embaixo (dá profundidade no top-down)?

## 📋 Ordem de produção sugerida
1. **`jogador`** ← gere este e ME MANDE antes de continuar.
2. `agua`, `comida`, `lanterna`, `cobertor` (comuns — aparecem sempre).
3. Demais itens.
4. `mae`, `filho`, `avo`.

> Quando salvar a primeira peça, me diga (ex.: "coloquei jogador.png"). Eu registro,
> reinicio o preview, testo e te mostro o resultado real na tela.

---

## 📦 Prompts prontos (copiar, colar, gerar)
Cada bloco já vem com **assunto + reforço de estilo** — todos com o mesmo tempero pra
sair coeso. O **nome do arquivo** a salvar está no título de cada bloco.
> Use sempre o **mesmo modelo + mesma seed** (Passo 1) em todos.

### 👤 Personagens → `public/assets/personagens/`

**`jogador.png`**
```
A determined civilian survivor in worn winter clothes, full body, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`mae.png`**
```
A tired but caring middle-aged woman in a heavy coat and scarf, full body, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`filho.png`**
```
A scared young boy clutching a small backpack, full body, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`avo.png`**
```
A frail elderly grandmother with a shawl, full body, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```

### 🎒 Itens → `public/assets/itens/`

**`agua.png`**
```
A single clear plastic water bottle, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`comida.png`**
```
A single dented canned food tin, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`agua_suja.png`**
```
A single metal bucket of murky dirty water, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`biscoitos.png`**
```
A single pack of plain crackers, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`remedio.png`**
```
A single blister pack and box of pills, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`primeiros_socorros.png`**
```
A single first-aid kit with a red cross, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`alcool.png`**
```
A single bottle of antiseptic alcohol, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`radio.png`**
```
A single old portable transistor radio with antenna, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`lanterna.png`**
```
A single handheld flashlight, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`pilhas.png`**
```
A single pair of batteries, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`fosforos.png`**
```
A single box of matches, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`faca.png`**
```
A single utility kitchen knife, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`ferramentas.png`**
```
A single metal toolbox with tools, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`cobertor.png`**
```
A single folded wool blanket, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`livro.png`**
```
A single old worn hardcover book, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`foto_familia.png`**
```
A single framed family photograph, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`documentos.png`**
```
A single stack of ID papers and a passport, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`dinheiro.png`**
```
A single bundle of cash banknotes, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`joias.png`**
```
A single small pile of jewelry with a ring and a necklace, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```
**`combustivel.png`**
```
A single red metal jerry can of fuel, game item icon, graphic novel game asset, bold ink outlines, flat cel shading, muted wartime palette, dramatic shadows, single centered subject, slight top-down 3/4 angle, soft shadow beneath, plain neutral background
```

**Negative prompt (use em todos):**
```
bright cartoon colors, comedy, photorealism, busy background, multiple objects, text, watermark, blurry
```

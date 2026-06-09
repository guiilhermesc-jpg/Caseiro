# Projeto Sirene — Prompts de Arte (graphic novel)

> Prompts prontos para gerar a arte numa IA de imagem (DALL·E/ChatGPT, Midjourney,
> Stable Diffusion, Leonardo, etc.). **Em inglês** porque rende mais. Siga a
> `ARTE.md` para manter tudo coeso. Salve cada arquivo com o `id` indicado.

## 0. Configurações na ferramenta
- Proporção **1:1 (quadrado)**, resolução alta (≥1024, depois é só reduzir).
- Fundo **transparente** (ou fundo liso pra remover depois).
- Sem texto/marca d'água.

## 1. SUFIXO DE ESTILO (cole no FINAL de TODO prompt)
Copie este bloco e adicione ao fim de cada prompt — é o que garante a coesão:

```
, graphic novel illustration, bold black ink outlines, flat cel-shaded coloring,
muted desaturated wartime palette (concrete grey #2b3440, dust brown #6b5d4f,
faded blue #8b95a3, warm amber #e0a030), dramatic chiaroscuro shadows, subtle
cross-hatching texture, somber serious tone, single centered subject, slight
top-down 3/4 angle, soft drop shadow beneath, transparent background, no text,
no watermark, no bright cartoon colors, not photorealistic
```

## 2. PERSONAGENS (salvar em `public/assets/personagens/<id>.png`)

**`jogador.png`**
```
A determined civilian survivor in worn winter clothes, standing, seen from a
slight top-down 3/4 angle, full body, [+ SUFIXO DE ESTILO]
```

**`mae.png`**
```
A tired but caring middle-aged woman in a heavy coat and scarf, civilian
survivor, full body, slight top-down 3/4 angle, [+ SUFIXO DE ESTILO]
```

**`filho.png`**
```
A scared young boy clutching a small backpack, civilian child in a coat,
full body, slight top-down 3/4 angle, [+ SUFIXO DE ESTILO]
```

**`avo.png`**
```
A frail elderly grandmother with a shawl, leaning slightly, civilian survivor,
full body, slight top-down 3/4 angle, [+ SUFIXO DE ESTILO]
```

## 3. ITENS — template + lista (salvar em `public/assets/itens/<id>.png`)

Monte cada prompt assim: **`A single [ASSUNTO], game item icon` + SUFIXO DE ESTILO**.

Exemplo completo (item `agua`):
```
A single clear plastic water bottle, game item icon, graphic novel illustration,
bold black ink outlines, flat cel-shaded coloring, muted desaturated wartime
palette, dramatic chiaroscuro shadows, subtle cross-hatching texture, somber
serious tone, single centered subject, slight top-down 3/4 angle, soft drop
shadow beneath, transparent background, no text, no watermark
```

### Lista dos 20 itens (use o `[ASSUNTO]` no template)
| id | [ASSUNTO] em inglês |
|---|---|
| `agua` | a clear plastic water bottle |
| `comida` | a dented canned food tin |
| `agua_suja` | a metal bucket of murky dirty water |
| `biscoitos` | a pack of plain crackers |
| `remedio` | a blister pack and box of pills |
| `primeiros_socorros` | a first-aid kit with a red cross |
| `alcool` | a bottle of antiseptic alcohol |
| `radio` | an old portable transistor radio with antenna |
| `lanterna` | a handheld flashlight |
| `pilhas` | a pair of batteries |
| `fosforos` | a box of matches |
| `faca` | a utility kitchen knife |
| `ferramentas` | a metal toolbox with tools |
| `cobertor` | a folded wool blanket |
| `livro` | an old worn hardcover book |
| `foto_familia` | a framed family photograph |
| `documentos` | a stack of ID papers and a passport |
| `dinheiro` | a bundle of cash banknotes |
| `joias` | a small pile of jewelry, a ring and a necklace |
| `combustivel` | a red metal jerry can of fuel |

## 4. Fluxo de trabalho
1. Gere a imagem com o prompt (template + assunto + sufixo).
2. Garanta fundo transparente (veja dica na `ARTE.md`).
3. Reduza/exporte como **512×512 PNG**.
4. Salve com o `id` certo na pasta certa.
5. Abra `src/data/sprites.js` e adicione o `id` à lista. Pronto — o jogo já usa.

> Dica: gere 2–3 variações de cada e escolha a que melhor "conversa" com as demais.
> Consistência > perfeição individual.

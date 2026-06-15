# 🧭 Bússola — Bitcoin do *off* ao *online*

Guia **educacional** + book de pesquisa para: **comprar** bitcoin no Brasil, levar para
**custódia própria** (self-custody), **declarar** corretamente, e entender **como se
ganhava/ganha BTC** (mapa histórico). Site estático, **offline-first** (PWA), sem build.

> ⚠️ **Não é recomendação de investimento** nem consultoria financeira/tributária/jurídica.
> Bitcoin é volátil e de risco. Regras fiscais mudam — confirme com um(a) contador(a).
> **Ninguém legítimo pede sua seed/chave.**

---

## Estado atual (v0.1 — 15/06/2026)

- ✅ **Camada 1 — o Book**: site navegável + pasta `docs/` (caps. 00–05 + fontes), PWA offline.
- ⏳ Camada 2 — App "off→online" (checklists guiados, cotação só-leitura, planilha p/ contador).

Roadmap completo em [`docs/00-VISAO.md`](docs/00-VISAO.md).

## Estrutura

```
bussola-bitcoin/
├── index.html              # o site (leitor do book)
├── assets/style.css        # tema
├── assets/app.js           # navegação + renderizador de Markdown
├── manifest.webmanifest    # PWA
├── sw.js                   # service worker (offline)
├── icon.svg                # ícone
├── publicar.md             # como publicar (link provisório) e virar repo próprio
└── docs/                   # O BOOK (fonte única de verdade, em Markdown)
    ├── 00-VISAO.md         # visão + pipeline "do prompt ao produto"
    ├── 01-COMPRAR.md       # comprar no Brasil (off→online)
    ├── 02-CARTEIRA.md      # custódia própria, seed, segurança
    ├── 03-DECLARACAO.md    # fiscal Brasil (estado atual + risco de mudança)
    ├── 04-GANHAR-HOJE.md   # formas viáveis de conseguir BTC + golpes
    ├── 05-MAPA-HISTORICO.md# a "máquina de extração" educacional (o que ficou)
    └── 99-FONTES.md        # fontes checadas
```

## Rodar localmente

O site usa `fetch` para ler os `.md`, então **precisa de um servidor** (não abra por
`file://`):

```bash
cd bussola-bitcoin
python3 -m http.server 8080
# ou: npx serve .
# abra http://localhost:8080
```

## Publicar (link provisório) e virar repositório próprio

Veja [`publicar.md`](publicar.md). Em resumo: este é um projeto **autônomo** — basta copiar
a pasta `bussola-bitcoin/` para um repositório novo e apontar o Cloudflare Pages para a
raiz, gerando um link tipo `bussola-bitcoin.pages.dev`.

## Aviso

Editar conteúdo = editar os arquivos em `docs/`. O site reflete automaticamente.

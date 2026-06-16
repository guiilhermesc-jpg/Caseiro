# 🧭 Bússola — Bitcoin do *off* ao *online*

Guia **educacional** + book de pesquisa para: **comprar** bitcoin no Brasil, levar para
**custódia própria** (self-custody), **declarar** corretamente, e entender **como se
ganhava/ganha BTC** (mapa histórico). Site estático, **offline-first** (PWA), sem build.

> ⚠️ **Não é recomendação de investimento** nem consultoria financeira/tributária/jurídica.
> Bitcoin é volátil e de risco. Regras fiscais mudam — confirme com um(a) contador(a).
> **Ninguém legítimo pede sua seed/chave.**

---

## Estado atual (v0.4 — 16/06/2026)

App PWA com abas, offline-first, em PT-BR. Tudo só-leitura no que toca dinheiro; nunca pede seed/chave.
Núcleo da carteira com **libs auditadas** e **testes automatizados** (CI).

- ✅ **Book**: `docs/` (caps. 00–09 + fontes), lido no app.
- ✅ **Painel**: preço ao vivo, **Medo & Ganância**, contagem pro **halving**, leitura educacional.
- ✅ **Histórico**: linha do tempo do bitcoin. **Checklist** guiado. **Registro**: planilha + CSV + simulador de DCA.
- ✅ **Carteira (testnet)**: criar/restaurar (BIP39), watch-only por xpub, e **air-gap PSBT**
  (montar → assinar offline → transmitir) — testado contra o vetor oficial do BIP84.
- ✅ **Soberania**: **Raio-X** (nota), **Legado** (herança), **Cofre** (backup AES-256-GCM),
  **Recuperação social** (Shamir k-de-N) e **Silent Payments** (endereço/envio/scanner, BIP-352).
- ✅ **Cofre de herança com timelock** (covenant P2WSH testnet) · **Guia IA** (chave própria, BYO-key)
  · **tema claro** · leitura de **QR pela câmera**.
- ✅ **Registro/DCA**: simulador com fonte dupla (CoinGecko até 1 ano; **brapi.dev** BRL multi-ano via BYO-key).
- ⏳ Próximos: notarização (OpenTimestamps), gasto de recebimentos SP, calculadora fiscal,
  multisig guiado, auditoria → mainnet. Ver [`docs/08-ESTRATEGIA.md`](docs/08-ESTRATEGIA.md).

Visão/estratégia: [`docs/00-VISAO.md`](docs/00-VISAO.md) · [`docs/08-ESTRATEGIA.md`](docs/08-ESTRATEGIA.md)
· segurança: [`docs/09-SEGURANCA.md`](docs/09-SEGURANCA.md) · carteira: [`docs/06-CARTEIRA-SOBERANA.md`](docs/06-CARTEIRA-SOBERANA.md)

> Dados ao vivo (públicos, só-leitura): preço (CoinGecko), medo&ganância (alternative.me),
> altura de bloco (mempool.space). Funcionam no navegador do usuário; offline, o app usa cache.

## Estrutura

```
bussola-bitcoin/
├── index.html              # app (abas)
├── assets/style.css        # tema
├── assets/app.js           # app: roteador + views + render Markdown
├── assets/vendor/wallet-bundle.js  # núcleo da carteira (libs auditadas, empacotado)
├── src/wallet/index.js     # fonte do núcleo (BIP39/32/84, PSBT, QR)
├── test/                   # testes (carteira contra vetor BIP84; cofre cripto)
├── package.json            # build (esbuild) + test
├── manifest.webmanifest    # PWA
├── sw.js                   # service worker (offline)
├── LICENSE · SECURITY.md · CONTRIBUTING.md
└── docs/                   # O BOOK (Markdown)
    ├── 00-VISAO.md · 01-COMPRAR · 02-CARTEIRA · 03-DECLARACAO · 04-GANHAR-HOJE
    ├── 05-MAPA-HISTORICO · 06-CARTEIRA-SOBERANA · 07-NORTE-PRODUTO
    ├── 08-ESTRATEGIA.md    # tese, fosso, riscos, sustentabilidade (longo prazo)
    ├── 09-SEGURANCA.md     # modelo de ameaças, privacidade, promessas
    └── 99-FONTES.md
```

CI: `.github/workflows/ci.yml` roda `npm test` + build a cada push/PR.

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

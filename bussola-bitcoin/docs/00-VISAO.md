# Bússola — Documento de Visão (v0.2)

> **Documento VIVO.** Você é o maestro. Última atualização: 16/06/2026.
> Nome de trabalho: **Bússola**. Pode rebatizar.

> ⚠️ **AVISO.** Material **educacional** + software em construção. Não é recomendação de
> investimento nem consultoria. Bitcoin é volátil e de risco. **Ninguém legítimo pede sua
> seed/chave** — a Bússola **nunca** vai pedir.

---

## 🔭 Rumo atual (o sonho grande — e como torná-lo real)

A Bússola vai ser três coisas num produto só, em PT-BR, mobile-first, soberano e **premium**:

1. **Book (ebook)** — ensina o caminho (já construído).
2. **App** — te acompanha e organiza (checklist, cotação só-leitura, histórico, planilha).
3. **Carteira soberana** — *a joia da coroa*: uma carteira que **"funciona desligada mesmo
   conectada"** — ou seja, **as chaves nunca tocam a internet**, mesmo o app estando online.

> 💡 A sua ideia — *"uma carteira fora da rede, que funciona desligada mesmo conectada"* — já
> existe no estado da arte e se chama **carteira air-gapped com watch-only + PSBT**. A parte
> online só **observa** e **monta** transações; a parte offline (suas chaves) só **assina**.
> Detalhe completo em **`06-CARTEIRA-SOBERANA.md`**. Nós vamos fazer isso **bonito, simples e
> brasileiro** — esse é o gap real do mercado.

## 🧱 Princípios inegociáveis (o que separa "premium" de "perigoso")

1. **Não reinventamos criptografia nem blockchain.** Usamos **o Bitcoin** (a rede mais
   segura e validada que existe) e **bibliotecas auditadas** (ex.: `bitcoinjs-lib`, BDK).
   Código de carteira caseiro e "não auditado" guardando dinheiro real = irresponsável.
2. **Testnet/Signet primeiro.** A carteira nasce com **dinheiro de mentira** até estar
   redonda e revisada. Só depois liberamos mainnet, com avisos claros.
3. **Chave nunca online.** Modelo air-gap (assinatura offline via QR/arquivo PSBT). O app
   online é **watch-only** (só enxerga, via `xpub`).
4. **Privacidade local.** Dados do usuário ficam **no aparelho** (localStorage/arquivo).
   Nada de servidor obrigatório, nada de coletar dados.
5. **Verdade > hype.** Dizemos o que é viável e onde mora golpe. "Disruptivo" aqui é
   **fazer o básico difícil com excelência**, não prometer mágica.

## 🧩 Como atendemos cada desejo seu (tradução fiel)

| Você pediu | Como vira realidade (de verdade) |
|---|---|
| "carteira fora da rede, funciona desligada mesmo online" | **Watch-only (xpub) online + assinatura offline PSBT** via QR (air-gap). Chave nunca conecta. |
| "alocar no mesmo blockchain seguro e válido p/ garantir os processos/informações" | Custódia **no próprio Bitcoin** + **notarização** dos seus registros via **OpenTimestamps** (ancora um *hash* no Bitcoin = prova de data/integridade, **sem** expor seus dados). |
| "informações do bitcoin de quando lançou, o histórico" | Aba **Histórico**: linha do tempo interativa (gênese 03/01/2009, halvings, marcos) + dados de preço. |
| "cotação só pra ver" | Aba **Cotação**: preço ao vivo (API pública, **só-leitura**), com aviso. Nunca conecta em conta. |
| "planilha pro contador" | App registra compras e **exporta CSV** (custo de aquisição, lastro) — resolve a comprovação do cap. 03. |
| "premium, disruptivo, fora da casinha" | Tudo **integrado** (book → app → carteira), **brasileiro**, **soberano**, **air-gap fácil** — ninguém entrega esse combo bem feito hoje. |

## 🗺️ Roadmap por camadas

- **Camada 1 ✅ — Book**: site + `docs/` (caps. 00–05 + fontes), offline-first.
- **Camada 2 (em construção) — App**: shell com abas; **Histórico** (timeline), **Cotação**
  (ao vivo só-leitura), **Checklist** guiado (salva no aparelho). [esta entrega]
- **Camada 3 — Planilha/Contador**: registro de compras + **export CSV** + estimativa de
  ganho de capital (com avisos).
- **Camada 4 — Carteira (testnet/signet)**: gerar/restaurar carteira **na testnet** com lib
  auditada; **watch-only** por `xpub`; receber/ver saldo; **construir PSBT**.
- **Camada 5 — Air-gap & assinatura offline**: fluxo de QR/arquivo PSBT (assinar offline,
  transmitir online). Este é o "funciona desligada mesmo online".
- **Camada 6 — Notarização (OpenTimestamps)**: carimbar no Bitcoin os comprovantes/declaração.
- **Camada 7 — Mainnet + auditoria**: revisão de segurança, então liberar dinheiro real,
  com onboarding e avisos. Empacotar PWA instalável.

## 📒 Diário de bordo

- **15/06/2026 — v0.1:** Visão + Book (Camada 1). Pesquisa de base checada.
- **15/06/2026 — v0.1.1:** Caminhos relativos (portável raiz/subpasta).
- **16/06/2026 — v0.2:** Visão **ampliada** (carteira soberana air-gapped como joia da
  coroa) + princípios de segurança. App vira **shell com abas**: Book, **Histórico**
  (timeline), **Cotação** (ao vivo só-leitura) e **Checklist** (salva localmente). Aba
  **Carteira** com a arquitetura (em breve, testnet-first). Doc novo
  `06-CARTEIRA-SOBERANA.md`.
- **16/06/2026 — v0.3:** **Painel** (preço, Medo & Ganância, halving, leitura educacional),
  aba **Registro** (planilha + CSV + simulador de DCA) e doc `07-NORTE-PRODUTO.md`. Iniciada
  a **carteira (Plano B)**: build com **esbuild** + libs **auditadas** (`@scure/bip32`),
  testado contra o vetor oficial do **BIP84**. Primeiro recurso: **watch-only testnet** —
  derivar endereços e ver saldo a partir de um `xpub`, **sem chaves privadas**. Workflow de
  publicação no GitHub Pages criado (PR aberto; publicação só quando o maestro quiser).

# 06 — A Carteira Soberana (a joia da coroa) — arquitetura

> Educacional + plano técnico. Esta carteira é construída **com segurança em 1º lugar**:
> bibliotecas auditadas, **testnet antes de mainnet**, e **chave nunca online**. A Bússola
> **nunca** pede sua seed.

## 1. A sua ideia, com o nome certo

Você descreveu: *"uma carteira fora da rede, que funciona desligada mesmo conectada na
internet"*. Isso é exatamente o padrão **air-gapped + watch-only + PSBT** — o estado da arte
em autocustódia. Ele separa **ver/montar** (online) de **assinar** (offline):

```
┌────────────────────────────┐        QR / arquivo        ┌─────────────────────────────┐
│  APP ONLINE (watch-only)    │  ───── PSBT a assinar ───▶ │  CHAVE OFFLINE (air-gapped)  │
│  • só conhece o xpub        │                            │  • guarda a seed/chave       │
│  • vê saldo e histórico     │  ◀──── PSBT assinada ───── │  • assina, NUNCA conecta     │
│  • monta a transação (PSBT) │                            │  • pode ser outro aparelho   │
│  • transmite à rede         │                            │    ou hardware wallet        │
└────────────────────────────┘                            └─────────────────────────────┘
```

- **Watch-only:** o app online recebe só a **chave pública estendida (`xpub`)**. Com ela
  **enxerga** saldo e endereços, mas **não consegue gastar** (não tem a chave privada).
- **PSBT (Partially Signed Bitcoin Transaction, BIP-174):** o "documento" padrão de uma
  transação a ser assinada. O online monta; o offline assina; o online transmite.
- **Air-gap:** a parte que tem a chave **nunca toca a internet** — mesmo o app estando
  online. É literalmente "funciona desligada mesmo conectada". A ponte é **QR code** ou
  arquivo, não rede.

> Resultado: comodidade de app online **+** segurança de cofre offline. É assim que carteiras
> como Sparrow + Coldcard/Keystone operam — vamos tornar isso **simples e brasileiro**.

## 2. "Alocar no mesmo blockchain seguro" — o que faz sentido (e o que não)

- ✅ **Custódia no próprio Bitcoin:** a segurança vem da **rede Bitcoin** (a mais validada do
  mundo). Não criamos blockchain própria — seria menos seguro, não mais.
- ✅ **Notarização via OpenTimestamps:** para "garantir que os processos e informações fiquem
  seguros", carimbamos um **hash** (impressão digital) dos seus comprovantes/registros **no
  Bitcoin**. Isso **prova a data e a integridade** ("este documento existia assim, nesta
  data") **sem** colocar seus dados na blockchain. Perfeito para lastro/declaração (cap. 03).
- 🚫 **Colocar dados pessoais on-chain:** não. Blockchain é pública e imutável — dado pessoal
  ali é vazamento permanente. Só vai o **hash**.

## 3. Padrões abertos que vamos seguir (nada caseiro em cripto)

- **BIP-39** (seed de 12/24 palavras), **BIP-32/44/84** (derivação; `bc1...` nativo SegWit).
- **BIP-174 (PSBT)** para assinatura offline.
- Bibliotecas **auditadas**: `bitcoinjs-lib` (JS) e/ou **BDK — Bitcoin Dev Kit**.
- **OpenTimestamps** para notarização.

## 4. Como construímos com responsabilidade (a régua de "premium de verdade")

1. **Testnet/Signet primeiro** — tudo funciona com **moeda de teste** (sem valor). Você
   aprende e testa sem risco.
2. **Watch-only antes de assinar** — primeiro só **ver** (importar `xpub`); depois o fluxo
   de **assinatura offline**.
3. **Sem custódia nossa, sem servidor obrigatório** — chaves e dados ficam com você.
4. **Revisão/auditoria de segurança** **antes** de qualquer recurso de mainnet com dinheiro
   real. Até lá, avisos grandes e claros.
5. **A seed é sua** — exibida uma vez, anotada por você, **nunca** enviada/salva online.

## 5. Roadmap da carteira (camadas 4–7 da visão)

- **C4 — Carteira testnet:** criar/restaurar (BIP-39), endereços, **watch-only por `xpub`**,
  ver saldo/histórico (via Esplora/Electrum público), montar **PSBT**.
- **C5 — Air-gap:** exportar/importar **PSBT por QR**; assinar offline; transmitir online.
- **C6 — Notarização:** OpenTimestamps nos comprovantes/declaração.
- **C7 — Mainnet:** auditoria → liberar dinheiro real com onboarding e avisos; PWA instalável.

## 6. O que NÃO vamos prometer (honestidade)

- ⛔ "Carteira pronta, segura e com seu dinheiro real **hoje**." Isso seria irresponsável.
  Carteira de verdade exige cuidado e tempo — e é por isso que a fazemos **certo**.
- ⛔ "Rendimento/ganho garantido", "recuperar bitcoin perdido", "minerar o passado". Nada
  disso existe (ver caps. 04 e 05).

## 7. Por que isso É disruptivo (o gap real)

O mercado tem carteiras boas (gringas, técnicas) e apps brasileiros (mas **custodiais**). O
que **falta** é o combo: **brasileiro + soberano + air-gap fácil + integrado a um guia que
ensina e organiza (book + checklist + planilha de declaração + notarização)**. Esse encaixe,
bem feito e simples, é a nossa **joia da coroa**.

# 09 — Segurança & Confiança

> Esta página existe para ser lida por usuários **e** por quem avalia o projeto. Transparência
> é parte do produto.

## 1. Promessas inegociáveis

- 🔑 **Nunca pedimos sua seed/chave privada.** Nenhuma tela legítima da Bússola faz isso.
- 🙈 **Não coletamos dados.** Não há servidor obrigatório, conta, rastreamento ou analytics.
  Seus dados (checklist, registro, legado) ficam **no seu aparelho** (localStorage).
- 🏦 **Não custodiamos fundos.** Você controla suas chaves. Sempre.
- 🧪 **Testnet-first.** A carteira nasce com dinheiro de teste; mainnet só após auditoria.
- 🧱 **Sem criptografia caseira.** Usamos bibliotecas **auditadas** e padrões abertos.
- 📈 **Não é recomendação.** Conteúdo educacional; nunca "compre/venda agora".

## 2. Como funciona a segurança da carteira

- **Padrões abertos:** BIP-39 (seed), BIP-32/84 (derivação, `tb1…`), BIP-174 (PSBT).
- **Bibliotecas auditadas:** `@scure/bip32`, `@scure/bip39`, `@scure/btc-signer`,
  `@noble/hashes` (ecossistema pure-JS, sem WASM, amplamente revisado).
- **Air-gap:** o app online é **watch-only** (só `xpub`); a assinatura acontece com a seed,
  que **nunca** vai para a internet. Transporte por QR/arquivo.
- **Verificação:** a derivação é testada contra o **vetor oficial do BIP84**; o fluxo
  montar→assinar→finalizar tem teste de roundtrip.

## 3. Modelo de ameaças (resumo honesto)

| Ameaça | Mitigação | Limite (sua parte) |
|---|---|---|
| Roubo da seed | nunca pedimos; air-gap; avisos | não fotografe/dixite a seed online |
| Phishing/golpe | educação (cap. 04); sem pedir chave | desconfie de "suporte" e prêmios |
| Dispositivo comprometido | offline-first; cofre criptografado | mantenha o aparelho atualizado |
| Perda/morte | **Legado** + backup testado | crie e teste o plano |
| Dependência de API | só-leitura, degradável, cache | — |
| Bug em carteira | testnet-first, testes, **auditoria** antes de mainnet | use testnet até liberarmos |

## 4. O Cofre (backup criptografado)

- Algoritmo: **PBKDF2-SHA256 (150k iterações) + AES-256-GCM** (WebCrypto do navegador).
- A senha **deriva** a chave; **sem a senha, o backup é irrecuperável** — por design.
- O cofre guarda seus dados do app (não a seed). Guarde a senha com cuidado.

## 5. Privacidade

- Sem contas, sem cookies de rastreio, sem terceiros de analytics.
- Chamadas externas são **só-leitura** e opcionais (preço, índice, saldo testnet) e rodam no
  **seu** navegador. Offline, o app usa cache.

## 6. Divulgação responsável

Encontrou uma falha? Veja **`SECURITY.md`** no repositório. Agradecemos divulgação
responsável e privada antes de publicar.

## 7. Código aberto

O código é aberto e auditável. Você não precisa confiar — pode **verificar**. Rode local,
leia o código, confira as dependências e os testes (`npm test`).

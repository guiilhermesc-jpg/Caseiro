# Changelog — Bússola

Formato: data — versão — destaques. Projeto educacional, offline-first, autocustódia
testnet-first. Não é recomendação de investimento.

## 2026-06-16 — v0.5 (soberania avançada)
- **Silent Payments (BIP-352)** completo: endereço reutilizável (`sp1…/tsp1…`), **envio** a partir
  da carteira testnet, e **scanner de recebimentos** (cole um txid → acha os outputs que são seus).
  Cada etapa validada contra os vetores oficiais (endereço, output x-only e tweak).
- **Cofre de herança com timelock** (covenant P2WSH na testnet): herdeiro gasta após o tempo,
  dono gasta a qualquer momento; construção verificada por sighash.
- **Recuperação social (Shamir k-de-N)**: divide a seed em N partes, recompõe com k.
- **Guia IA**: assistente educacional client-side com a **chave do próprio usuário** (BYO-key,
  guardada só no navegador) — custo zero pro app.
- **Tema claro premium** (bege/branco + roxo) com sombras suaves.
- **Simulador de DCA** corrigido: fonte dupla — CoinGecko (grátis, até 1 ano) e **brapi.dev**
  (BRL multi-ano) com **BYO-key** salva só no aparelho.

## 2026-06-16 — v0.4 (sessão de build profunda)
- **Soberania** (aba nova): Raio-X (nota + plano de ação), Legado (plano de herança com
  imprimir/PDF/`.md`), Cofre (backup AES-256-GCM), Prova de Integridade (SHA-256).
- **Carteira air-gap** (testnet): montar (watch-only) → assinar (offline) → transmitir, com
  QR e copiar/colar; criar/restaurar (BIP39); QR de recebimento; sugestão de taxa (mempool).
- **Registro**: estimador de imposto (educacional, parametrizável) + CSV + simulador de DCA.
- **Conteúdo**: Glossário (cap. 10) e FAQ (cap. 11).
- **Board-grade**: estratégia (08), segurança (09), LICENSE, SECURITY, CONTRIBUTING, CI.
- **Premium/PWA**: instalar, acessibilidade, boas-vindas, bloco Sobre.
- **Engenharia**: libs auditadas (@scure/@noble), testes (BIP84, roundtrip PSBT, cofre, fiscal,
  SHA-256), build reprodutível verificado na CI.

## 2026-06-16 — v0.3
- Painel (preço, Medo & Ganância, halving, leitura educacional).
- Carteira testnet: watch-only por xpub; criar/restaurar (BIP39). Build com esbuild + libs
  auditadas; teste contra o vetor oficial do BIP84.
- Aba Registro (planilha + CSV + simulador de DCA). Workflow de deploy no GitHub Pages.

## 2026-06-16 — v0.2
- App vira shell com abas (PWA): Painel, Book, Histórico, Checklist, Carteira.
- Histórico (linha do tempo), Checklist guiado (salvo no aparelho).
- Docs: 06 (carteira air-gap) e 07 (norte do produto).

## 2026-06-15 — v0.1
- Book (Camada 1): site estático offline-first; docs 00–05 + fontes; leitor de Markdown.

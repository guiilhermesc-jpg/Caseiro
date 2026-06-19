# 📒 Diário de Evolução — Bússola Bitcoin

> Atualizado **todo dia** (Regra 2 do `CLAUDE.md`). Registra o que foi feito, o que está
> programado e as ideias de disrupção. Mira sempre o **melhor no longo prazo**.

## 🌟 Princípio (o norte que muda o jogo)
**Conta Bitcoin Soberana para a vida toda:** receber privado a vida inteira (entrada / "Pix
Bitcoin") + passar sozinho aos herdeiros (saída / "Interruptor da Vida"). Sem empresa, sem KYC,
testável, em PT-BR. Detalhe em `12-CONTA-PARA-A-VIDA-TODA.md`.

## ⏱️ Como funciona o ritual diário
1. Rodar `/evolucao` (até **30 min**).
2. Pegar o item do topo de **Próximas etapas** (ou uma ideia de disrupção madura).
3. Entregar **uma fatia pequena, testada e publicada**.
4. Atualizar este diário (feito + próximas + ideias).

### Como agendar (1 passo manual)
Na web do Claude Code, criar um **trigger agendado diário** apontando para o prompt `/evolucao`.
Isso abre uma sessão por dia que segue as regras do `CLAUDE.md` automaticamente.

---

## ✅ Feito

### 2026-06-19 — Fundação do flagship + sistema de evolução
- **Norte** registrado (`docs/12`): visão unificadora entrada+saída.
- **Entrada / "Pix Bitcoin" (Fase A completa):**
  - Painel de Recebimentos (ledger persistente, saldo, CSV, sweep multi-txid).
  - Cobrança BIP-21 (`buildPaymentURI`) — link + QR ("me paga X").
  - Auto-registro fiscal (recebimento → Registro/IR num clique).
- **Saída / "Interruptor da Vida" (Fase B, fatia 1):**
  - `inheritanceClaimStatus` — prova de vida + contagem regressiva (barra de progresso).
  - Cofre reenquadrado como dead man's switch trustless.
- **Carta ao Herdeiro integrada (Fase B, fatia 2a):** o Plano de Legado agora inclui
  automaticamente os dados do cofre (Interruptor) + passo a passo de resgate do herdeiro.
- **Modo Herdeiro guiado (Fase B, fatia 2b):** fluxo único e à prova de leigo — o herdeiro
  informa só destino + frase; o app confere o Interruptor, monta, assina e transmite o resgate.
- **Teste de Herança / drill (Fase B, fatia 3):** "Preparar ensaio" cria um cofre de timelock
  curto (~2 blocos) e pré-preenche o Modo Herdeiro — prova ponta a ponta que a herança funciona.
- **Sistema de evolução diária:** `CLAUDE.md` (regras 1 e 2), este diário e o comando
  `/evolucao`.

---

## 🔜 Próximas etapas (backlog priorizado)
1. **"Você vai herdar isto"** — visão watch-only para o herdeiro saber, em vida, que a herança
   existe (saldo + status do Interruptor), sem poder tocar antes do prazo.
2. **Handle legível BIP-353** (`nome@dominio` via DNS) — sensação de chave Pix na entrada.
   *(Depende de decisão: qual domínio usar.)*
3. **Tiers graduados** do Interruptor (ex.: 6 meses → executor; 12 meses → herdeiros).
4. **Lembrete de prova de vida** — alerta local periódico para "renovar" o cofre.
5. **Cobrança em R$** — digitar o valor em reais e converter para BTC na hora (usa o preço ao vivo).

## 💡 Ideias de disrupção (cruas — lapidar ao longo do tempo)
- **Identidade Bitcoin soberana única:** um só handle (BIP-353) que é como você recebe a vida
  toda E o âncora do plano de herança. Uma identidade, vitalícia, soberana.
- **Privacidade auditável:** provar renda ao contador (export) sem doxxar a carteira inteira —
  combo recebimento-privado + pronto-pro-IR que ninguém entrega no varejo.
- **Herança "viva":** transformar o setup único num ritual anual (drill + renovar prova de
  vida), com a sensação de um "seguro de vida soberano" que você controla.

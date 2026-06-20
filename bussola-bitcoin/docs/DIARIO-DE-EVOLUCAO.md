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
- **"Você vai herdar isto" (watch-only):** botão no Modo Herdeiro mostra saldo + status do
  Interruptor sem precisar da frase — o herdeiro sabe, em vida, que a herança existe.
- **Cobrança em R$:** a cobrança aceita valor em reais e converte para BTC pelo preço ao vivo.
- **Lembrete inteligente de prova de vida (`.ics`):** núcleo `lifeProofReminderICS` (testado, 8
  casos) gera um evento de calendário **recorrente cujo intervalo é derivado do timelock** (~2/3 da
  janela) — você renova sempre com folga. Botão no cofre baixa o arquivo. Herança vira ritual vivo.
- **Painel "Conta para a Vida Toda":** card no topo da Soberania mostra as **duas pontas** num lugar
  só — entrada (recebido via SP) + saída (Interruptor ativo). A visão tangível.
- **Sistema de evolução diária:** `CLAUDE.md` (regras 1 e 2), este diário e o comando
  `/evolucao`.

### 2026-06-20 — Leva "ousada": identidade viva + dashboard ao vivo
- **Handle SP persistente + compartilhável:** o endereço (público) é salvo ao gerar; copiar/📤
  compartilhar (Web Share) no gerador, no painel e no card. O "Pix Bitcoin" virou identidade.
- **Card "Vida Toda" ao vivo:** mostra o handle, botão lê a chain e exibe a **contagem regressiva
  do Interruptor** (barra + dias), e dá **próximos passos** inteligentes conforme o que falta.
- **Lembrete também no Google Agenda:** núcleo `lifeProofGoogleCalUrl` (testado) + link "➕ Adicionar
  ao Google Agenda" ao lado do `.ics`.
- **Compartilhar cobrança** (Web Share) além de copiar.

---

## 🔜 Próximas etapas (backlog priorizado)
1. **Tiers graduados** do Interruptor (ex.: 6 meses → executor; 12 meses → herdeiros). *Mexe no
   script do covenant — exige core novo em `src/wallet` + testes. Dia dedicado e cuidadoso.*
2. **Auto-status do card "Vida Toda"** — disparar a leitura da chain sozinho (hoje é por botão),
   com cache curto para não pesar.
3. **Handle legível BIP-353** (`nome@dominio` via DNS). **PENDENTE:** domínio ainda não definido
   — manter a marca "Bússola" (domínio compartilhado) como caminho quando decidir.

## ✅ Entregue do backlog (limpeza recente)
Modo Herdeiro · Teste de Herança · "Você vai herdar isto" · Cobrança (BTC/R$ + compartilhar) ·
Lembrete `.ics` + Google Agenda · Card Vida Toda ao vivo · Handle persistente/compartilhável.

## 💡 Ideias de disrupção (cruas — lapidar ao longo do tempo)
- **Identidade Bitcoin soberana única:** um só handle (BIP-353) que é como você recebe a vida
  toda E o âncora do plano de herança. Uma identidade, vitalícia, soberana.
- **Privacidade auditável:** provar renda ao contador (export) sem doxxar a carteira inteira —
  combo recebimento-privado + pronto-pro-IR que ninguém entrega no varejo.
- **Herança "viva":** transformar o setup único num ritual anual (drill + renovar prova de
  vida), com a sensação de um "seguro de vida soberano" que você controla.

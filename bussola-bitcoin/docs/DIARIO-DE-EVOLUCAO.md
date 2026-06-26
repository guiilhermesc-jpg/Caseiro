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
- **Auto-status no card:** o dashboard já abre lendo o Interruptor sozinho (sem clique).
- **"Plano para a Vida Toda" unificado:** o export/impressão do Legado agora inclui também a
  **entrada** (handle de recebimento), virando UM documento das duas pontas. Renomeado.

### 2026-06-20 (sessão longa) — Tiers graduados (o covenant de 3 níveis)
- **Núcleo `tiers*` (EXPERIMENTAL):** cofre P2WSH com **IF/ELSE aninhado** e 3 caminhos —
  **2-de-3** a qualquer hora · **executor** sozinho após t1 · **herdeiros** sozinhos após t2 (t2>t1).
  Funções `tiersAddresses` / `buildTiersPsbt` / `finalizeTiersPsbt`, reusando `signInheritancePsbt`.
- **10 testes estruturais** cobrindo os 3 ramos (montar→assinar→finalizar) + BIP67 + t2>t1 + negativo.
- **UI experimental + ensaio:** seção "Cofre em níveis" (montar, status dos 2 prazos, gastar guiado
  por caminho) e drill com timelock curto (t1=2, t2=4) para **validar on-chain** antes de uso real.
- **Cache do auto-status:** o card "Vida Toda" guarda o status por ~2 min (sessionStorage); o botão
  força releitura. Menos peso na chain a cada visita.

### 2026-06-21 — Varredura adversarial de bugs (workflow multiagente) + correções P0/P1
Rodada de revisão (6 dimensões → verificação adversarial): 41 achados, 35 confirmados. **Corrigidos:**
- **#1 (ALTA)** `combineMnemonic` devolvia frase **errada em silêncio** com partes insuficientes/
  corrompidas → agora embute **digest (4 bytes sha256)** no segredo dividido e **falha** se não bater
  (2 testes novos). *Quebra compat. com shares antigas — formato novo.*
- **#2 (ALTA)** Silent Payments oferecia **"mainnet (sp1)"** com pipeline 100% testnet (risco de perder
  BTC real) → opção **desabilitada** ("em breve").
- **#3 (ALTA)** XSS via `javascript:`/aspas em links Markdown (IA/Book) → `safeHref()` só aceita
  `https/mailto/bitcoin/#//` e escapa aspas.
- **#9 (ALTA)** tip-height lido sem `r.ok` (NaN→0) podia **mentir no Interruptor** → helper
  `fetchTipHeight()` que falha alto (5 pontos trocados).
- **#10/#11** card "Vida Toda": `Wsh` em TDZ (auto-status quebrado no 1º load) → usa
  `window.BussolaWallet`; chave de cache passou a incluir **todos** os guardiões + herdeiro.
- **#13/#15** `silentPaymentSend`: reporta a **taxa real** + `note` de troco-poeira; **falha** se
  alguma entrada não assinar.
- **#4/#5** todos os 13 campos de **seed/frase** viraram `type=password`; campo de restauração é
  **limpo** após uso. SW v36.

### 2026-06-21 (cont.) — Endurecimento de segredos no backup/conexão
- **#7** backup do Cofre **não inclui mais** a chave da API (Anthropic) por padrão.
- **#6** restauração do Cofre **valida o formato** e **não sobrescreve** config sensível
  (`esplora`/`aikey`) sem **confirmação**; reporta quantos itens entraram/foram mantidos.
- **#8** endpoint Esplora **validado** (só `https://`, ou `http://` em localhost/.onion) e **avisa**
  quando o host não parece testnet. SW v37.

---

## 🔜 Próximas etapas (backlog priorizado) — restante da varredura
1. **Validar tiers on-chain (testnet)** pelo ensaio (tirar rótulo "experimental").
2. **Registro pro IR com preço HISTÓRICO** por data (hoje usa preço de hoje) (#12).
4. **PWA/SW:** doc 12 no cache + tirar `DIARIO` do build; fallback offline no fetch handler;
   stale-while-revalidate nos docs; update do SW visível (#20–#24).
5. **Testes (rede anti-regressão):** `silentPaymentScan`, ramos de `buildTiersPsbt`, faixas de
   timelock, `decodeSilentPaymentAddress`, `lifeProofGoogleCalUrl` (#P4).
6. **Handle legível BIP-353** — PENDENTE (domínio a definir; manter "Bússola").
7. **Status de níveis no card "Vida Toda"** (hoje cobre o cofre simples).

## ✅ Entregue do backlog (limpeza recente)
Modo Herdeiro · Teste de Herança · "Você vai herdar isto" · Cobrança (BTC/R$ + compartilhar) ·
Lembrete `.ics` + Google Agenda · Card Vida Toda ao vivo (auto) · Handle persistente/compartilhável ·
Plano para a Vida Toda (doc unificado entrada+saída).

## 💡 Ideias de disrupção (cruas — lapidar ao longo do tempo)
- **Identidade Bitcoin soberana única:** um só handle (BIP-353) que é como você recebe a vida
  toda E o âncora do plano de herança. Uma identidade, vitalícia, soberana.
- **Privacidade auditável:** provar renda ao contador (export) sem doxxar a carteira inteira —
  combo recebimento-privado + pronto-pro-IR que ninguém entrega no varejo.
- **Herança "viva":** transformar o setup único num ritual anual (drill + renovar prova de
  vida), com a sensação de um "seguro de vida soberano" que você controla.

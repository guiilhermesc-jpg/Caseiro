# Bússola — Documento de Visão (v0.1)

> **Documento VIVO.** Você é o maestro: tudo aqui é seu para editar e redirecionar.
> Última atualização: 15/06/2026.
> Nome de trabalho: **Bússola**. Pode rebatizar (ex.: "Norte BTC", "Carteira Soberana").

> ⚠️ **AVISO IMPORTANTE (leia antes de tudo).** Este material é **educacional**. Não é
> recomendação de investimento, nem consultoria financeira, tributária ou jurídica.
> Bitcoin é um ativo **volátil e de risco** — você pode perder dinheiro. Regras fiscais
> mudam (veja o cap. 03). **Confirme sempre com um(a) contador(a) e faça sua própria
> pesquisa.** Ninguém da equipe Bússola tem acesso, nem pede, sua *seed phrase* / chave.

---

## 1. O que é a Bússola

Um **guia + ferramenta** que pega uma pessoa no "off" (só tem conta de banco / Pix) e a
leva ao "online" de forma **soberana**: comprar bitcoin no Brasil, **tirar da corretora
para uma carteira própria** (custódia própria) e **declarar** corretamente, de modo que o
patrimônio seja **comprovadamente seu** (com lastro e origem), e não algo em zona cinzenta.

Em paralelo, a Bússola tem um **book de pesquisa** (este conjunto de documentos) que
mapeia **como se ganhava/ganha bitcoin** — do passado ao presente — para enxergar, com a
visão de hoje, **o que ficou pelo caminho** e o que ainda é viável.

## 2. Os 3 entregáveis

1. **O Book (site + docs)** — *este, o 1º a ser produzido.* Site com **link provisório** +
   esta pasta `docs/`. É a base de conhecimento navegável.
2. **O App "off→online"** — ferramenta guiada passo a passo (comprar → sacar p/ carteira
   própria → checklist de declaração). *Fase seguinte.*
3. **A Pesquisa (mapa histórico)** — cap. 04 e 05: formas de conseguir BTC hoje + o
   "mapa do passado" (a "máquina de extração com mapeamento", **educacional**).

## 3. O pipeline "do prompt ao produto" (o fim concreto: BTC na sua carteira)

O "produto" tem um **estado final verificável**: *bitcoin sob sua custódia, declarado.*

```
[OFF]  Conta no banco (BRL) — XP, Nubank, qualquer banco com Pix
   │
   ▼  (1) Escolher corretora/serviço nacional regulamentado
[KYC]  Cadastro + verificação de identidade (obrigatório por lei)
   │
   ▼  (2) Depósito via Pix (BRL → saldo na plataforma)
[BUY]  Comprar bitcoin (à vista; ideal: aos poucos / DCA)
   │
   ▼  (3) SAQUE para carteira PRÓPRIA (self-custody)  ← o passo que muita gente pula
[SELF-CUSTODY]  BTC na sua wallet; você controla as chaves
   │
   ▼  (4) Registrar custo de aquisição + DECLARAR (Bens e Direitos / IN 1888 se aplicável)
[PRODUTO]  Patrimônio comprovadamente seu, com lastro e em conformidade fiscal
```

Cada etapa vira uma tela/checklist no App (entregável 2). O Book explica cada uma.

## 4. Custodial vs. custódia própria (o ponto central do seu pedido)

- **Custodial (corretora/banco)** — XP, Nubank Cripto, Mynt (BTG), Mercado Bitcoin,
  Binance etc. **Fácil e gratuito de guardar**, mas *as chaves são deles*. Bom para
  começar e comprar; **não é** posse soberana. Lema: *"not your keys, not your coins."*
- **Custódia própria (self-custody)** — sua *wallet* (hot/cold). Você guarda a *seed*.
  É aqui que o bitcoin vira **inegociavelmente seu**. Detalhes no cap. 02.

> A frase do seu pedido — *"senão seriam consideradas universais"* — traduzimos como:
> sem **saque para carteira própria + declaração**, fica difícil **comprovar que é seu**
> (origem/lastro). O cap. 03 cuida da parte de declaração; o cap. 02, da posse real.

## 5. Princípios (o que nunca pode faltar)

1. **Soberania** — o destino padrão é a custódia própria, não a corretora.
2. **Verdade e risco** — dizer o que é viável e o que **não** compensa (faucet ~ centavos),
   e onde mora **golpe** (falsa "recuperação", "cloud mining", airdrop falso).
3. **Conformidade** — declarar certo; nunca otimizar imposto à base de "achismo".
4. **Segurança em 1º lugar** — *seed* nunca em foto/nuvem/chat; ninguém legítimo a pede.
5. **Documento vivo** — você redireciona; a Bússola se ajusta.

## 6. Pilha técnica (igual à metodologia que já usamos)

- **Site:** estático (HTML/CSS/JS puro), **offline-first** (PWA: `manifest` + `sw.js`),
  sem build obrigatório. Publica em **link provisório** tipo `*.pages.dev` (Cloudflare
  Pages), como fizemos no jogo.
- **Book:** Markdown em `docs/` (fonte única de verdade); o site **renderiza** esses `.md`.
- **App (fase 2):** mesma base estática + fluxo guiado; integrações só de **leitura**
  (preço, links) — nunca pedimos chave/seed.

## 7. Roadmap por camadas

- **Camada 1 (esta) ✅** — Book: site navegável + `docs/` (caps. 00–05 + fontes),
  com link provisório e PWA offline.
- **Camada 2** — App "off→online": telas de checklist (comprar → sacar → declarar),
  cotação ao vivo (somente leitura), gerador de checklist de declaração.
- **Camada 3** — Calculadora de custo médio / ganho de capital (estimativa, com avisos)
  e exportável para o contador.
- **Camada 4** — Empacotar como PWA instalável (Android/iOS via "adicionar à tela").

## 8. Diário de bordo

- **15/06/2026 — v0.1:** Visão definida. Camada 1 (Book) em construção. Pesquisa de base
  feita e checada (imposto BR em transição — MP 1303 caducou, isenção R$35 mil/mês segue
  em 2026; formas de ganhar BTC hoje; mapa histórico de faucets/airdrops; bitcoins
  perdidos). Estrutura `docs/` + site offline-first criada.

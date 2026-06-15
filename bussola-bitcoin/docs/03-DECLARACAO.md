# 03 — Declaração e aspectos fiscais (Brasil)

> ⚠️ **AVISO REFORÇADO.** Esta é a área que **mais muda** e a mais delicada. O conteúdo
> abaixo é **educacional** e reflete o cenário até **junho/2026**. **Não é** consultoria
> tributária. **Confirme tudo com um(a) contador(a)** antes de declarar ou operar com
> valores relevantes. Regras, alíquotas e limites podem ter mudado depois desta data.

## 1. As duas obrigações diferentes (não confunda)

No Brasil há **duas** coisas separadas, com regras próprias:

1. **Declarar que você TEM** (patrimônio) — no **IRPF anual**, ficha **Bens e Direitos**.
2. **Pagar imposto sobre o LUCRO quando você VENDE** (ganho de capital) — apuração mensal,
   pago via **DARF (GCAP)**, e/ou a obrigação acessória da **IN RFB 1888** para certas
   operações.

> Resumindo: **ter** bitcoin (declarar) ≠ **lucrar vendendo** bitcoin (tributar). Você pode
> ter de declarar mesmo sem vender nada.

## 2. Declarar que você TEM (IRPF — Bens e Direitos)

- **Regra prática (IRPF 2026, ano-base 2025):** declare cada criptoativo cuja posição em
  **31/12/2025** fosse **≥ R$ 5.000** (por ativo). Use a ficha **Bens e Direitos**, grupo
  de **criptoativos**, com o **custo de aquisição** (o que você pagou, não o valor de
  mercado atual).
- **Novidade:** corretoras **brasileiras** passaram a enviar os dados, e parte das
  operações já aparece na **declaração pré-preenchida** (IN RFB nº 2.312). **Confira**, não
  confie cegamente — o que está na sua wallet própria/exchange estrangeira pode **não**
  aparecer.
- **Comprar e segurar (HODL) não gera imposto** — só **declaração** de posse. Imposto só
  quando há **venda com lucro** (próxima seção).
- **Janela típica da entrega do IRPF 2026:** ~**23/mar a 29/mai/2026** (confirme as datas
  oficiais do ano).

## 3. Pagar sobre o LUCRO quando VENDE (ganho de capital)

Aqui está o ponto **em transição** — leia com atenção:

- **Regra histórica (que segue valendo em 2026):** vendas (alienações) de cripto que
  **somem menos de R$ 35.000 no mês** são **isentas** de imposto sobre o ganho. Acima
  disso, o lucro é tributado por **alíquotas progressivas de ganho de capital (15% a
  22,5%)**, com pagamento via **DARF até o último dia útil do mês seguinte**.
- **O que quase mudou — MP 1303/2025:** o governo editou a **Medida Provisória 1303** em
  2025 propondo **alíquota única de 17,5%** (uma versão em comissão chegou a falar em
  **18%**) e **o FIM da isenção de R$ 35 mil/mês**, valendo a partir de 01/01/2026.
- **Situação atual:** a **MP 1303 caducou/perdeu validade** (não foi convertida em lei no
  prazo). Resultado: a **isenção de R$ 35 mil/mês segue válida em 2026**. **Porém**, o
  governo pode **reapresentar** o conteúdo como **Projeto de Lei** — ou seja, **há risco
  real de a regra mudar** ainda neste ciclo. **Acompanhe e confirme com contador.**

> 📌 **Tradução prática:** hoje, vender pouco (<R$35k/mês) ainda costuma ser isento; vender
> muito tem imposto progressivo. Mas trate isso como **pode mudar a qualquer momento** —
> não tome decisão grande sem confirmar a regra vigente no dia.

## 4. IN RFB 1888 (a obrigação acessória "esquecida")

A **IN 1888** obriga o **envio mensal de informações** à Receita em alguns casos —
diferente do IRPF e diferente do ganho de capital:

- Operações em **exchanges estrangeiras** ou **sem intermediário** (P2P, entre carteiras)
  cuja **soma no mês ultrapasse R$ 30.000** devem ser informadas **até o último dia útil do
  mês seguinte**.
- Operações em **exchanges brasileiras** já são reportadas **pela própria exchange** — você
  normalmente **não** precisa enviar a 1888 sobre elas (mas ainda declara no IRPF).
- **Por que importa para você:** se você **saca para carteira própria** e depois faz P2P /
  movimenta entre carteiras / usa corretora de fora, **essa é a obrigação que mais passa
  batida** — e é justamente onde mora o risco de "ficar em zona cinzenta".

## 5. Como manter tudo "comprovadamente seu" (lastro)

Para o patrimônio ser inquestionavelmente seu (o objetivo do projeto):

1. **Comprovação de origem dos recursos** (de onde veio o BRL que comprou o BTC) — guarde
   extratos/recibos.
2. **Custo de aquisição registrado** (data, quantidade, preço, taxas) — planilha simples já
   resolve.
3. **Declaração no IRPF** (Bens e Direitos) ano a ano.
4. **DARF pago** quando houver venda tributável; **IN 1888** quando se aplicar.
5. **Histórico das transações on-chain** (endereços/IDs) que ligam compra → sua wallet.

> Com (1)–(5), há **lastro e rastreabilidade**: você prova o que tem, de onde veio e que
> pagou o que devia. É o contrário de "não dá pra comprovar".

## 6. Modelo de planilha (sugestão mínima)

| Data | Operação | Plataforma | Qtd BTC | Preço BRL/BTC | Total BRL | Taxa | Destino (wallet/endereço) | Obs. |
|---|---|---|---|---|---|---|---|---|
| 2026-06-15 | compra | Mercado Bitcoin | 0,001 | 350.000 | 350,00 | 1,50 | bc1q… (minha cold) | saque de teste |

> O App (entregável 2) vai gerar essa planilha e um **resumo para o contador**.

## 7. Checklist fiscal

- [ ] Posição em 31/12 anotada por ativo (declarar os ≥ R$ 5.000)
- [ ] Custo de aquisição registrado (não o valor de mercado)
- [ ] IRPF entregue na janela (Bens e Direitos)
- [ ] Vendas do mês somadas (verificar isenção/limite vigente)
- [ ] DARF pago se houve lucro tributável
- [ ] IN 1888 enviada se houve >R$30k/mês em exchange estrangeira/sem intermediário
- [ ] **Tudo conferido com contador(a)** ✅

> Fontes nas notas do cap. **99 — Fontes**. Como a regra mudou recentemente, **revalide as
> datas e alíquotas** antes de declarar.

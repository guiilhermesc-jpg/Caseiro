# 12 — Conta Bitcoin para a vida toda (norte do próximo flagship)

> Documento de exploração estratégica. Não é recomendação de investimento.
> Define a dor, a solução única e o plano de build (tudo testnet-first, custo operacional zero).

## A tese (o fio que une tudo)

Toda conta tem **entrada** e **saída**, ao longo do tempo. A Bússola já tem as duas peças
mais difíceis do Bitcoin para isso — só faltava enxergá-las como **uma coisa só**:

- **Entrada (recebimento):** você **recebe a vida inteira** — privado, do mundo todo, sem corretora. → *Silent Payments (BIP-352), já implementado de ponta a ponta.*
- **Saída (herança):** quando você se vai, a conta **passa sozinha** para os seus — sem empresa, sem oráculo, sem KYC. → *covenant timelock (P2WSH), já implementado.*

**Lema:** *soberania para a vida toda.* Ninguém entrega **as duas pontas** num pacote
soberano, gratuito, testável e em português. **Esse é o moat.**

---

## A dor (por que isso importa)

1. **Recebimento:** o brasileiro que ganha em moeda dura (freelancer, criador, dev, ONG)
   depende de corretora/custodiante, expõe todo o histórico on-chain (reúso de endereço) e
   não tem como comprovar renda pro contador sem se doxxar. Dor real: **receber privado,
   global, sem intermediário — e pronto pro imposto.**
2. **Herança:** milhões de BTC perdidos **para sempre** — não por hack, mas por **morte,
   seed perdida e herança que ninguém conseguiu executar**. As soluções existentes
   (Casa/Unchained) são **gringas, caras e custodiais**. Dor real: **passar adiante sem
   entregar a chave a uma empresa — e ter certeza de que vai funcionar.**

O próprio `08-ESTRATEGIA.md` já nomeou: *"backup que ninguém testou, herança que não funciona."*

---

## A solução única — uma **identidade Bitcoin soberana**

Um só handle, para a vida toda: é **como você recebe** e é **o âncora do seu plano de herança**.

### Entrada — "Pix Bitcoin" (privado, pronto pro IR)
- **Handle reutilizável (SP):** cola na bio/fatura/doação. Privacidade de endereço novo +
  conveniência de endereço fixo. Ninguém de fora liga os recebimentos ao seu handle.
- **Handle legível (BIP-353):** `nome@dominio` que resolve via DNS para o endereço SP —
  *sensação de chave Pix*, mas soberano e global. (Bleeding-edge; BYO-domínio = custo zero.)
- **Painel de recebimentos (ledger):** detecta, rotula e **persiste** os pagamentos
  localmente. Saldo, histórico, total recebido.
- **Auto-registro fiscal:** cada recebimento entra no módulo de Registro com o custo de
  aquisição na data → **comprovação de renda sem doxxar a carteira inteira**. (Privacidade
  *auditável* — combo único.)
- **Cobrança:** gera um pedido de pagamento (valor + memo) em QR/link a partir do handle.

### Saída — "Interruptor da Vida" (dead man's switch trustless)
- **Prova de vida:** enquanto você *toca* suas moedas, **só você** gasta. Se ficar **N meses
  parado** (morte/incapacidade), o caminho do herdeiro **abre sozinho** — covenant puro, sem
  oráculo, sem empresa.
- **Tiers graduados:** ex. 6 meses → um *executor* de confiança ajuda; 12 meses → herdeiros
  resgatam. Espelha a vida real.
- **À prova de leigo:** **Modo Herdeiro** (PT-BR, passo a passo) + **Carta ao Herdeiro**
  exportável/impressa.
- **Herança que o herdeiro SABE que existe** (mas não pode tocar antes): uma visão watch-only
  "você vai herdar isto" — resolve a causa nº 1 de perda (ninguém sabia que o BTC existia).
- **Resistente a traição e a perda:** combina com **Shamir/multisig** — nenhum herdeiro
  age sozinho, e nenhuma perda isolada mata o plano.
- **Teste de Herança (drill):** simular o resgate **enquanto você está vivo** (testnet/regtest)
  — prova que funciona. Vira **ritual anual**, não setup de uma vez só.

---

## Por que é disruptivo (vs. tudo que veio antes)

| | Corretora/custodial | Casa/Unchained | **Bússola (esta visão)** |
|---|---|---|---|
| Soberano (sem 3º na chave) | ❌ | parcial (cosigner pago) | ✅ |
| Recebimento privado (SP) | ❌ | ❌ | ✅ |
| Herança trustless por covenant | ❌ | ❌ (multisig com a empresa) | ✅ |
| Testável antes (drill) | — | ❌ | ✅ |
| Pronto pro imposto BR | parcial | ❌ | ✅ |
| PT-BR, grátis | — | ❌ | ✅ |

---

## Plano de build (faseado, custo zero, testnet-first)

**Fase A — Pix Bitcoin (entrada): a vitória rápida.**
1. **Ledger de recebimentos** (persistência local dos recebimentos SP detectados). *(1ª fatia)*
2. Handle em destaque (QR/compartilhar) + cobrança (valor+memo).
3. Auto-registro fiscal (liga no módulo Registro).
4. Handle legível BIP-353 (BYO-domínio).

**Fase B — Interruptor da Vida (saída): o moat profundo.**
1. Plano de herança guiado (timelock + Shamir + Carta ao Herdeiro).
2. Modo Herdeiro à prova de leigo.
3. Teste de Herança (drill) + visão "você vai herdar isto".
4. Tiers graduados (executor → herdeiros).

> Crescer devagar, com lugar definido. O jogo não é o agora — é o usuário **cada vez mais
> soberano**, recebendo a vida toda e passando adiante sem depender de ninguém.

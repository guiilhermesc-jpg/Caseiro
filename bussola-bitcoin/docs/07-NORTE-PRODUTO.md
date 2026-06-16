# 07 — Norte do Produto (a ambição, com pés no chão)

> Documento de visão de produto. Ambicioso de propósito — mas construído **em etapas** e com
> os princípios de segurança do cap. 00/06. "Disruptivo" aqui = **fazer o difícil com
> excelência e honestidade**, não prometer mágica.

## 1. A dor que existe (o problema real)

O brasileiro que quer entrar no bitcoin enfrenta um quebra-cabeça espalhado:

- **Comprar** é fácil (banco/corretora), mas a maioria deixa o usuário **custodial** e meio
  perdido — sem soberania, sem saber sacar pra carteira própria.
- **Custódia própria** assusta (seed, segurança, golpes) e as melhores ferramentas são
  **gringas e técnicas**.
- **Declarar** é confuso, muda toda hora, e dá medo de errar — gente boa fica em "zona
  cinzenta" sem querer.
- **Decidir** é caótico: preço aqui, notícia ali, "índice de medo" em outro site, halving num
  blog, golpe em todo canto. **Não existe um lugar só, confiável, em português, que junte
  tudo e ainda eduque sem empurrar produto.**

> **Nossa tese:** quem resolve esse quebra-cabeça **inteiro**, com soberania + educação +
> conformidade + segurança de verdade, num app brasileiro lindo e honesto, cria algo que
> **ninguém entrega bem hoje**. Essa é a contribuição genuína.

## 2. A visão (a "estrela-guia")

**Uma plataforma única para entrar, manter e decidir sobre bitcoin — soberano, educado e em
conformidade — do off ao online.** Tudo só-leitura no que toca dinheiro, custódia 100% do
usuário, privacidade local, sem hype.

Três camadas de valor:

1. **Saber** (Book) — ensina o caminho.
2. **Decidir** (Painel) — preço, **medo & ganância**, halving, leitura educacional do momento,
   tudo num lugar.
3. **Agir com soberania** (Checklist → Carteira air-gapped → Notarização → Planilha fiscal).

## 3. O diferencial (por que é "nível Vale do Silício")

- **Soberania fácil:** carteira **air-gapped** ("funciona desligada mesmo conectada") com
  experiência simples — o que hoje só é fácil pra experts.
- **Conformidade embutida:** registra custo, gera **planilha pro contador** e **notariza**
  (OpenTimestamps) os comprovantes no próprio Bitcoin → lastro inquestionável.
- **Decisão sem ruído:** um painel que **aconselha de forma educacional** (nunca "compre
  agora"), lendo sinais públicos (preço, índice de medo) e dando contexto histórico.
- **Verdade radical:** dizemos o que **não** vale a pena e onde mora golpe. Confiança é o
  produto.
- **Brasileiro de raiz:** Pix, Receita, linguagem clara, offline-first.

## 4. Ideias no radar (backlog ambicioso — entram aos poucos)

- 🧮 **Calculadora fiscal**: ganho de capital, limite mensal, DARF estimada (com avisos).
- 📈 **Gráfico de preço** histórico + simulador de **DCA** ("e se eu tivesse comprado R$X/mês").
- ⏳ **Contador de halving** ao vivo (✅ já no Painel) e **alertas** educacionais.
- 🧠 **Assistente educacional**: responde dúvidas com base no Book (sem dar ordem de compra).
- 🛡️ **Verificador anti-golpe**: checklist/alertas dos padrões de fraude (caps. 04/05).
- 🔐 **Carteira testnet → air-gap por QR → notarização → mainnet auditada** (caps. 06).
- 🌐 **Multi-perfil/família** e backup criptografado **local** dos seus registros.
- ♿ **Acessibilidade + i18n** (começa PT-BR).

## 5. As etapas (como realizamos sem nos perder)

| Fase | Entrega | Risco | Status |
|---|---|---|---|
| 1 | Book (site + docs offline) | baixo | ✅ |
| 2 | App shell: **Painel** (preço, medo&ganância, halving, leitura), Histórico, Checklist, Carteira(info) | baixo | ✅ |
| 3 | Planilha/registro de compras + **export CSV** + calculadora fiscal | baixo | ⏳ |
| 4 | Gráfico de preço + **simulador de DCA** | baixo | ⏳ |
| 5 | Carteira **testnet** (lib auditada): seed, endereços, watch-only, saldo | médio | ⏳ |
| 6 | **Air-gap PSBT por QR** (assinar offline) | alto | ⏳ |
| 7 | **Notarização** (OpenTimestamps) dos comprovantes | médio | ⏳ |
| 8 | **Auditoria** → mainnet com avisos; PWA instalável (lojas) | alto | ⏳ |

> Regra de ouro: **cada fase é usável e segura por si só**. Nunca exigimos a próxima pra
> entregar valor. Crescemos por camadas — igual fizemos no jogo.

## 6. O que medimos como "sucesso"

- Uma pessoa leiga consegue: **comprar → sacar pra carteira própria → declarar** sem se
  perder e **sem cair em golpe**.
- Ela entende o momento do mercado **sem** receber ordem de compra/venda.
- Quando a carteira soberana chegar, ela guarda valor **sem depender de ninguém** — e com a
  papelada de comprovação pronta.

> Isso é a joia da coroa: **autonomia + clareza + conformidade** num lugar só, em português,
> feito com honestidade.

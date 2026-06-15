# 03 — Criar as Páginas e Contas (Passo a Passo)

> Guia para deixar toda a base pronta. Faça **uma vez**; depois é só anunciar.
> A interface da Meta muda os nomes de menu de tempos em tempos — os passos abaixo seguem a lógica
> geral; se um botão tiver outro nome, procure o **mais parecido**.

---

## Ordem recomendada

1. Página do Facebook → 2. Conta profissional no Instagram → 3. Conectar os dois →
4. Gerenciador de Negócios (Meta Business Suite) → 5. Conta de Anúncios + pagamento →
6. WhatsApp Business → 7. (Opcional, recomendado) Pixel no site.

---

## 1) Criar a Página do Facebook

1. Logado no seu **Facebook pessoal**, acesse **facebook.com/pages/create**.
2. **Nome da Página:** `STS Technology` (ou o nome comercial oficial).
3. **Categoria:** procure por *"Provedor de internet"*, *"Serviço de telecomunicações"* ou
   *"Empresa de tecnologia"*.
4. **Descrição (bio):** veja o texto pronto em
   `campanhas/STS-TECHNOLOGY/TEXTOS-ANUNCIOS.md` (seção "Bio / Sobre").
5. Adicione **foto de perfil** (logo) e **capa** (imagem do equipamento/antena ou uso no campo).
6. Preencha **site** (`ststechnology.com.br`), **WhatsApp**, **cidade/região**, **horário**.
7. Adicione um **botão de ação:** *"Enviar mensagem (WhatsApp)"* ou *"Fale conosco"*.

---

## 2) Criar / configurar o Instagram como conta profissional

1. Crie o perfil (ex.: `@ststechnology`) ou use o existente.
2. No app: **Configurações → Conta → Mudar para conta profissional**.
3. Escolha **Empresa** (não "Criador").
4. Selecione a **categoria** (ex.: "Empresa de tecnologia" / "Serviço de internet").
5. Preencha **bio**, **link** (site ou WhatsApp), **botão de contato**.
6. Use a **mesma identidade visual** da Página do Facebook (logo, cores).

---

## 3) Conectar Instagram à Página do Facebook

1. Na **Meta Business Suite** (business.facebook.com) ou nas configurações da Página:
   **Configurações → Contas vinculadas → Instagram → Conectar conta**.
2. Faça login no Instagram e confirme.
3. Pronto: agora um anúncio pode aparecer **no Instagram e no Facebook ao mesmo tempo**.

---

## 4) Criar o Gerenciador de Negócios (Meta Business Suite)

> É o "painel central" que separa o seu negócio do seu perfil pessoal. **Altamente recomendado.**

1. Acesse **business.facebook.com** → **Criar conta**.
2. Informe **nome do negócio** (`STS Technology`), **seu nome** e **e-mail comercial**.
3. **Adicione a Página** do Facebook e a **conta do Instagram** ao negócio.
4. Em **Configurações do Negócio**, confira **Pessoas** (só você por enquanto) e **Contas**.

---

## 5) Criar a Conta de Anúncios e cadastrar pagamento

1. Em **Configurações do Negócio → Contas → Contas de anúncios → Adicionar → Criar nova**.
2. Defina **nome**, **fuso horário (Brasília)** e **moeda (BRL — R$)**.
   > ⚠️ A **moeda e o fuso não podem ser alterados depois.** Escolha **BRL** e **Brasília**.
3. Vá em **Pagamentos / Faturamento** → **Adicionar forma de pagamento** → cartão de crédito
   (ou Pix/boleto, se disponível na sua conta).
4. (Opcional) Defina um **limite de gastos da conta** como trava de segurança.

---

## 6) Configurar o WhatsApp Business

1. Instale o **WhatsApp Business** (app separado do WhatsApp normal).
2. Use o número comercial da STS.
3. Configure:
   - **Mensagem de saudação** (dispara quando alguém chama):
     *"Olá! Aqui é a STS Technology 🛰️ Em que cidade/região você precisa de internet e por quantos
     dias? Te passo o plano ideal."*
   - **Mensagem de ausência** (fora do horário).
   - **Respostas rápidas** para perguntas comuns (preço, cobertura, prazo).
4. Gere o **link direto** `https://wa.me/55DDDNUMERO` — é esse link que vai no anúncio e no site.

---

## 7) (Opcional, recomendado) Instalar o Pixel no site

1. Na Business Suite: **Gerenciador de Eventos → Conectar fonte de dados → Web → Meta Pixel**.
2. Dê um nome (`Pixel STS`) e copie o **código base**.
3. Cole o código no **`<head>` de todas as páginas** de `ststechnology.com.br`.
   - Se o site for feito em construtor (Wix, Hostinger, WordPress etc.), há campo próprio para
     "código no cabeçalho" ou plugin "Meta Pixel".
4. Configure o **evento de conversão** (ex.: clique no botão de WhatsApp = evento `Contact`/`Lead`).
5. Teste com a extensão **Meta Pixel Helper** (Chrome) para confirmar que está disparando.

---

## ✅ Base pronta?

Quando os itens 1 a 6 estiverem feitos (o 7 é bônus), vá para
**campanhas/STS-TECHNOLOGY/CHECKLIST-LANCAMENTO.md** para subir o primeiro anúncio.

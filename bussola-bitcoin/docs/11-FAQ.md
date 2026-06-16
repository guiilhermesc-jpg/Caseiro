# 11 — Perguntas frequentes (FAQ)

## A Bússola guarda meu dinheiro ou minhas chaves?

**Não.** Não custodiamos fundos e **nunca** pedimos sua seed/chave. Você controla tudo; seus
dados ficam no seu aparelho.

## É seguro? Por que confiar?

Você não precisa confiar — pode **verificar**: o código é aberto, usamos bibliotecas auditadas
e há testes automatizados. Veja `09-SEGURANCA.md` e rode `npm test`.

## Posso usar com dinheiro real agora?

A carteira é **testnet-first** (moedas de teste, sem valor) para você aprender sem risco.
Mainnet (dinheiro real) só será liberada **após auditoria** de segurança.

## Como começo do zero?

1. Leia o Book (Comprar → Carteira → Declarar). 2. Use o **Checklist**. 3. Teste a carteira na
**testnet** (criar → receber via faucet → enviar com air-gap). 4. Faça seu **Raio-X** e seu
**Legado**.

## Esqueci/perdi minha seed. E agora?

Sem a seed (ou um backup dela), **não há recuperação** — nem nós nem ninguém consegue. Por isso
insistimos: anote no papel/metal, **teste** o backup e crie um **plano de Legado**.

## O que acontece com meu bitcoin se eu falecer?

Sem um plano, ele se perde. Use o módulo **Legado** para deixar instruções (sem escrever a
seed) e considere **multisig** para herança. Isso não substitui testamento/inventário.

## A Bússola dá conselho de compra/venda?

Não. Tudo é **educacional**. O Painel mostra preço e o índice de Medo & Ganância com leitura de
contexto, mas **nunca** diz "compre" ou "venda".

## E os impostos?

O app ajuda a **registrar** compras, exportar CSV e **estimar** ganho de capital — mas as regras
mudam e dependem do seu caso. **Confirme com um(a) contador(a).**

## Preciso de internet?

Não para o essencial: é um **PWA offline-first**. Preço/saldo/índices precisam de rede (só
leitura); o resto funciona com cache. Você pode **instalar** o app.

## Quanto custa?

O núcleo é **gratuito e aberto**. No futuro pode haver recursos premium **opcionais** — nunca
às custas da sua privacidade ou soberania.

## Funciona em qualquer carteira/aparelho?

A carteira deriva endereços SegWit nativos (`tb1…`) a partir de uma seed BIP-39 / xpub padrão
(BIP-84). O watch-only aceita xpub/tpub/vpub de conta.

## Encontrei um bug de segurança.

Obrigado! Veja `SECURITY.md` para divulgação responsável e privada.

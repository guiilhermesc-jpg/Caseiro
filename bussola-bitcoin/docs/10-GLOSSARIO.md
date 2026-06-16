# 10 — Glossário (em português claro)

> Os termos que você vai encontrar — sem jargão desnecessário.

## Custódia e chaves

- **Autocustódia (self-custody):** você guarda suas próprias chaves. "Not your keys, not your
  coins" — se não são suas as chaves, não é seu o bitcoin.
- **Custódia (custodial):** um terceiro (corretora) guarda por você. Prático, mas depende da
  confiança e da solvência dele.
- **Chave privada:** o segredo que autoriza gastar. Quem tem, controla os fundos.
- **Chave pública / endereço:** o "número da conta" para receber. Pode compartilhar.
- **Seed / frase de recuperação:** 12 ou 24 palavras (BIP-39) que **recriam** toda a carteira.
  É o backup mestre. **Nunca** digital, nunca compartilhada.
- **xpub (chave pública estendida):** permite **ver** endereços e saldo (watch-only) **sem**
  poder gastar.

## Tipos de carteira

- **Hot wallet:** conectada à internet (celular/PC). Prática para o dia a dia.
- **Cold wallet:** offline. Mais segura para guardar valor.
- **Hardware wallet:** aparelho dedicado que guarda a chave e assina offline.
- **Air-gapped:** a chave **nunca** toca a internet; assina offline e transfere por QR/arquivo.
- **Multisig:** exige várias chaves para gastar (ex.: 2 de 3). Ótimo para segurança e herança.
- **Watch-only:** só observa (via xpub); não gasta.

## Transações e rede

- **UTXO:** "pedaço" de bitcoin não gasto; as entradas de uma transação.
- **PSBT (BIP-174):** transação parcialmente assinada — o "documento" que o air-gap usa.
- **Mempool:** fila de transações esperando confirmação.
- **Taxa (sat/vB):** quanto você paga por byte virtual; maior taxa = confirmação mais rápida.
- **Confirmação:** quando a transação entra num bloco (e nos seguintes).
- **Node (nó):** software que valida as regras da rede por conta própria. Soberania máxima.
- **Lightning:** rede de segunda camada para pagamentos rápidos e baratos.

## Conceitos

- **Satoshi (sat):** menor unidade; 1 BTC = 100.000.000 sats.
- **Halving:** a cada ~4 anos, a emissão de novos bitcoins cai pela metade (escassez programada).
- **SegWit / bech32:** formato moderno de endereço (`bc1…` mainnet, `tb1…` testnet); taxas menores.
- **Derivação (BIP-32/44/84):** como uma seed gera infinitos endereços organizados por caminhos.
- **DCA (Dollar-Cost Averaging):** comprar um valor fixo periodicamente, sem tentar adivinhar o
  momento — tira a emoção.
- **OpenTimestamps:** carimbo de tempo ancorado no Bitcoin; prova que um documento existia numa
  data, sem expor o conteúdo (só o hash).

## Redes

- **Mainnet:** a rede real, com bitcoin de valor.
- **Testnet / Signet:** redes de teste, com moedas **sem valor** — para aprender sem risco.

## Brasil / fiscal

- **KYC:** identificação exigida por corretoras reguladas ("conheça seu cliente").
- **Lastro / custo de aquisição:** comprovação de origem e do quanto você pagou — base da
  declaração.
- **Ganho de capital:** lucro na venda; pode ter isenção/alíquotas conforme a legislação vigente
  (confirme com contador).

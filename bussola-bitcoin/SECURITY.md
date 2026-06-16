# Política de Segurança

A segurança é prioridade na Bússola. Esta carteira lida com autocustódia, então levamos
divulgação responsável a sério.

## Promessas

- **Nunca** pedimos sua seed/chave privada.
- **Não** custodiamos fundos nem coletamos dados.
- Carteira **testnet-first**; mainnet só após auditoria.
- Sem criptografia caseira: usamos bibliotecas auditadas e padrões abertos.

## Como reportar uma vulnerabilidade

1. **Não** abra issue pública para falhas sensíveis.
2. Use o **GitHub Security Advisories** (aba *Security* do repositório) para um relato privado,
   ou contate os mantenedores em canal privado.
3. Inclua: descrição, passos para reproduzir, impacto e, se possível, uma sugestão de correção.

Comprometemo-nos a responder o quanto antes, corrigir falhas válidas e creditar quem reportar
(se desejar).

## Escopo

- Núcleo da carteira (`src/wallet`), build (`assets/vendor/wallet-bundle.js`) e o app (PWA).
- Fora de escopo: serviços de terceiros (CoinGecko, mempool.space, alternative.me), que são
  apenas leitura.

## Boas práticas para quem usa

- Anote a seed offline (papel/metal); nunca digite em sites; nunca fotografe.
- Use a testnet até liberarmos a mainnet.
- Mantenha o aparelho atualizado; faça e **teste** o backup (Cofre) e o plano de **Legado**.

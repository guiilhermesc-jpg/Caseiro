# Contribuindo com a Bússola

Obrigado pelo interesse! Este projeto é educacional, soberano e offline-first.

## Rodar localmente

```bash
# app (estático, sem build necessário para rodar)
cd bussola-bitcoin
python3 -m http.server 8000   # abra http://localhost:8000
```

## Mexer no núcleo da carteira

```bash
cd bussola-bitcoin
npm ci            # instala libs auditadas
npm test          # testes (carteira + cofre) — devem ficar verdes
npm run build     # regenera assets/vendor/wallet-bundle.js
```

Se você alterar `src/wallet/`, **rode `npm run build` e commite o bundle** atualizado
(a CI verifica isso).

## Princípios (inegociáveis)

1. **Segurança em 1º lugar**: nada de criptografia caseira; só libs auditadas e padrões abertos.
2. **Testnet-first**: nada que incentive fundos reais antes de auditoria.
3. **Privacidade local**: sem backend obrigatório, sem coleta de dados.
4. **Honestidade**: educacional, nunca recomendação de investimento; dizer onde mora golpe.
5. **Offline-first**: degrade com elegância sem rede.

## Estilo

- JS sem framework, sem dependências em runtime no app (o núcleo da carteira é empacotado).
- Comentários e textos de UI em PT-BR.
- Adicione testes para qualquer lógica nova de carteira/cripto.

## Pull Requests

- Descreva o problema e a solução.
- Garanta `npm test` verde e bundle atualizado.
- Mudanças sensíveis de segurança: veja `SECURITY.md`.

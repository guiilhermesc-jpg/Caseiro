# 08 — Estratégia (visão de longo prazo)

> Documento de estratégia de produto. Linguagem de board: tese, problema, timing, fosso,
> riscos e sustentabilidade — **sem hype**. Princípio: *não basta parecer útil; tem que ser
> útil por décadas.* Nosso ativo é o **tempo**.

## 1. Tese (uma frase)

**A Bússola é a plataforma brasileira que leva a pessoa comum do "comprar bitcoin" à
soberania completa — guardar, declarar, herdar e provar — com educação honesta, autocustódia
fácil e privacidade local.** Não custodiamos fundos, não vendemos dados, não prometemos lucro.

## 2. O problema (a dor real, em 4 frentes)

1. **Comprar** é fácil; **sair da corretora** (autocustódia) é assustador e mal explicado.
2. **Guardar com segurança** depende de ferramentas gringas e técnicas.
3. **Declarar** é confuso e muda toda hora — gera medo e "zona cinzenta".
4. **Manter no tempo** é ignorado por todos: backup que ninguém testou, **herança** que não
   existe (bitcoin perdido para sempre), comprovação de integridade ausente.

> Ninguém entrega o **ciclo completo**, em português, soberano e sem conflito de interesse.

## 3. Por que agora (timing)

- Adoção institucional (ETFs à vista, 2024) → mais gente entrando, mais gente despreparada.
- Autocustódia em alta após colapsos custodiais (FTX, etc.): "not your keys" virou consenso.
- Regras fiscais brasileiras se firmando → demanda por conformidade clara.
- Ferramentas auditadas e abertas (BIP-39/32/84, PSBT, OpenTimestamps, @scure) maduras o
  suficiente para um produto **soberano e offline-first** sem reinventar criptografia.

## 4. O produto e o que JÁ existe (provas, não promessas)

- **Book** (caps. 00–09): educação honesta, fontes checadas.
- **Painel**: preço, Medo & Ganância, halving e leitura **educacional** (sem sinal de compra).
- **Registro**: planilha + CSV pro contador + simulador de DCA (dados reais do passado).
- **Carteira (testnet)**: criar/restaurar (BIP39), watch-only por xpub, e **air-gap PSBT**
  (montar→assinar offline→transmitir) — testado contra o vetor oficial do BIP84.
- **Soberania**: Raio-X (nota), **Legado** (herança) e **Cofre** (backup AES-256-GCM).
- **Engenharia**: libs auditadas, testes automatizados, PWA offline, zero backend, zero coleta.

## 5. Diferencial e fosso (por que dura)

1. **Soberania fácil + brasileira**: air-gap e autocustódia com UX simples, em PT-BR, com Pix
   e Receita no contexto. As gringas são técnicas; as nacionais são custodiais.
2. **Ciclo completo num lugar**: educar → decidir → comprar → guardar → declarar → herdar.
3. **Confiança como produto**: dizemos o que **não** fazer e onde mora golpe; sem conflito de
   interesse (não custodiamos, não vendemos ordem de compra).
4. **Privacidade local**: dados no aparelho. Isso é uma vantagem de confiança difícil de copiar
   por quem depende de coletar dados.
5. **O tempo a nosso favor (efeito composto):** hábitos (DCA, checklist), **herança** e
   **notarização** ganham valor com os anos. Quanto mais tempo o usuário fica, mais
   insubstituível fica o registro soberano dele. Esse é o fosso de longo prazo.

## 6. Mitigando o que já foi feito / tentado / não tentado

| Categoria | Exemplos | Onde falham | Nosso encaixe |
|---|---|---|---|
| Corretoras | apps nacionais | custodiais; ensinam a ficar, não a sair | ensinamos a sacar e ser soberano |
| Carteiras | gringas técnicas | curva alta, sem PT-BR, sem fiscal/herança | UX simples + contexto BR |
| Apps de preço | trackers | só cotação/ruído | decisão educada, sem sinal |
| Cursos | infoprodutos | teoria sem ferramenta | aprender **fazendo** no app |
| **Herança/Notarização** | quase ninguém | ignorado | **nosso território** de longo prazo |

## 7. Sustentabilidade (honesta, sem vender dados)

Princípio: **a confiança é o ativo**; nunca a sacrificamos por receita.

- **Open-core**: núcleo aberto e gratuito; recursos **premium opcionais** (ex.: multisig
  guiado, sincronização criptografada ponta-a-ponta, relatórios fiscais avançados).
- **Educação/serviços**: conteúdo aprofundado, parcerias com contadores.
- **Hardware/parcerias** de autocustódia (sem custódia nossa).
- **Doações/Lightning**. ❌ Nunca: custodiar fundos, vender dados, empurrar trade.

## 8. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Segurança (carteira) | libs auditadas, **testnet-first**, auditoria antes de mainnet, sem cripto caseira |
| Regulatório/fiscal | conteúdo datado e versionado; "confirme com contador"; nunca aconselhamento |
| Dependência de APIs | tudo só-leitura e degradável; offline-first com cache; fontes plurais |
| Confiança/golpes | nunca pedimos seed; código aberto; transparência e SECURITY.md |
| "Parecer útil" sem ser | métricas de utilidade real (abaixo), não vaidade |

## 9. Métricas de sucesso (utilidade real, não vaidade)

- **Ativação soberana**: % que vai de comprar → **sacar para carteira própria** → declarar.
- **Backup testado** e **plano de herança** criados (itens que salvam patrimônio no tempo).
- **Nota de Soberania** média subindo entre os usuários ativos.
- **Retenção de longo prazo** (anos), não cliques.

## 10. Próximos passos (os próximos, plural)

1. **Publicar** (GitHub Pages — falta ativar 1x nas Settings).
2. **Notarização (OpenTimestamps)**: carimbar no Bitcoin o hash dos comprovantes/legado.
3. **Leitura de QR pela câmera** (fechar o ciclo air-gap sem digitar).
4. **Calculadora fiscal** (ganho de capital, isenção, DARF estimada) com avisos.
5. **Multisig guiado** (2-de-3) watch-only → assinatura — custódia colaborativa/herança.
6. **Sincronização E2E opcional** (criptografada no cliente) entre dispositivos.
7. **Auditoria de segurança** → liberar mainnet com onboarding.
8. **Internacionalização** (PT→EN→ES) e acessibilidade nível AA.
9. **PWA instalável** em lojas; conteúdo aprofundado.

> Crescer devagar, com lugar definido: **soberania para a vida toda**. O jogo não é o agora —
> é continuar no jogo daqui a 10 anos, com o usuário cada vez mais soberano.

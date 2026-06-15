# Gap analysis RPG - Venor

Data: 2026-06-15

Este documento compara o que Venor ja tem contra o que falta para chegar numa
estrutura de RPG online/offline com profundidade parecida com grandes referencias.

## Ja existe no projeto

1. Mundo 3D exploravel: Vilarejo de Venor, Venore, Thais, Noctaria, praia,
   pantano, ruinas, cemiterio, pico, cavernas e subsolos.
2. Movimento base: andar, correr, pular, abaixar, camera orbital, touch/mobile.
3. Interacao contextual: falar, abrir, pegar, atacar, pescar, entrar/sair.
4. NPCs e lojas: mercadores, ferreiros, curandeiros, runas, suprimentos e
   vendedor raro por calendario.
5. Quests: cadeias com requisito, boss invocado, coleta, caca, recompensa e save.
6. Economia inicial: vender loot/material, oferta rara liberada por abastecer NPC,
   escassez semanal leve.
7. Persistencia: save local, save em nuvem, autosave, cofre/deposito e estado de
   quest.
8. Multiplayer base: relay WebSocket para jogadores se verem e save de conta via
   servidor.
9. Casas: compra simples e customizacao basica de telhado.
10. Pets e montarias: domaveis, pet de quest, pet ataca e pode virar montaria.
11. Combate: melee, arco, runas, telegraph no chao, boss bar, drops raros.
12. Jornada visual: minimapa, mapa grande, destino marcado e cidades conectadas.
13. Offline-first: PWA, service worker, pagina de instalacao e cache inicial.

## Onde ainda esta superficial

1. Casas ainda nao sao sistema social: falta posse persistente por lote, decoracao,
   permissoes, aluguel/manutencao, cama, bau privado e casa de guilda/familia.
2. Economia ainda e NPC-first: falta mercado de jogadores, ordens de compra/venda,
   historico de preco, taxas, limite de inflacao e itens consumiveis em escala.
3. Profissoes ainda nao existem como carreira: pesca existe, mas falta mineracao,
   herbalismo, lenhador, cozinhar, refino e crafting.
4. Guilda e entrada narrativa, nao sistema: falta party, cargos, cofre de guilda,
   contratos, evento coordenado e recompensa coletiva.
5. Rotas existiam no mapa, mas sem tabela de design: falta spawn por rota,
   risco/recompensa, horario, eventos, rare spawn e teste de "viagem valeu".
6. Morte tem corpo e recuperacao, mas falta regra calculada: bencao/seguro,
   perda por nivel, resgate por templo e custo economico.
7. Criaturas precisam de identidade visual e habitat: hoje ha varias, mas falta
   tabela unica com bioma, horario, loot esperado, raridade e funcao economica.
8. NPCs precisam de agenda: mascate tem calendario, mas os demais ainda nao vivem
   por horario, estoque semanal, rumor e deslocamento.
9. Online ainda e camada tecnica: falta sincronizar casa, mercado, party, chat,
   estado de mundo e resolucao de conflito offline/online.
10. Interface precisa ficar mais "RPG premium": painel de rotas, diario, mercado,
   casa, profissao e guilda devem ter visual consistente.

## Prioridade por impacto

| Prioridade | Sistema | Por que vem antes |
| --- | --- | --- |
| P0 | Rotas e habitats | Sem isso o mapa cresce vazio e o jogador nao sente magia na viagem. |
| P0 | Casas reais | O usuario pediu nascer em casa, familia/grupo e identidade. |
| P0 | Persistencia offline/online | Sem continuar de onde parou, nao vira plataforma. |
| P1 | Mercado e profissoes | Cria valor de longo prazo e economia de jogador. |
| P1 | Morte/risco calculado | Faz dificuldade parecer justa, nao aleatoria. |
| P1 | Guilda/party/eventos | Transforma boss e viagem em coordenacao social. |
| P2 | NPC agenda completa | Da vida ao mundo e torna calendario mais importante. |
| P2 | Rework visual de criaturas | Eleva qualidade percebida, mas precisa vir com funcao. |

## Nova regra de producao

Antes de implementar qualquer lugar novo, ele precisa responder:

1. Quem mora aqui?
2. O que o jogador ganha aqui?
3. O que pode matar o jogador aqui?
4. Qual item/material daqui abastece a economia?
5. Qual NPC fala sobre este lugar?
6. Qual rota passa por aqui?
7. Qual coisa rara faz alguem voltar aqui depois?
8. O que muda de dia, de noite ou em dias especificos?

Se nao responder, nao entra no patch.

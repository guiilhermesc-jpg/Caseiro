# Roadmap Premium do Jogo

Objetivo: evoluir o projeto de prototipo jogavel para RPG online autoral com escala, instalacao simples, visual vivo e sistemas de longo prazo. A meta "30x" nao significa inflar mapa sem criterio; significa multiplicar area util, densidade visual, situacoes jogaveis, progresso e confianca tecnica.

## Pilar 1 - Base instalavel

1. PWA primeiro: manifest, icones, service worker, tela offline e pagina `/baixar`.
2. Android com Capacitor: APK/AAB versionado com `versionCode`, sobrepondo versoes anteriores.
3. PC com Tauri: instalador Windows, depois macOS/Linux, com auto-update.
4. iOS por TestFlight/App Store: evitar promessa de IPA solto; seguir fluxo oficial da Apple.
5. Pipeline de versoes: selo do jogo, changelog, pagina de download e checagem de bundle publicado.
6. Decisao RV17/RV18: se a qualidade grafica exigir pacote pesado, o alvo principal vira instalado; navegador fica como preview/dev.

## Pilar 2 - Visual premium

1. Chao vivo: microterreno 3D, folhas, raizes, terra exposta, capim baixo, trilhas, lama e pedras por bioma.
2. Modelos GLB profissionais: arvores, pedras, monstros, pets, dragao e NPCs principais.
3. Materiais por bioma: grama, terra, pedra, areia, pantano, cinzas, lava e interiores com linguagem propria.
4. Agua e clima: reflexo controlado, espuma, chuva, neblina local, vento em vegetacao e ciclo dia/noite mais dramatico.
5. Direcao de camera/UX visual: leitura forte de personagem, combate claro, perigo no solo e mapa sem poluicao.
6. Criacao nova so entra com funcao: monstro, roupa, item, GIF/animacao, montaria e NPC precisam nascer com uso jogavel, idle/impacto quando aplicavel e validacao.

## Pilar 3 - Mundo 30x com densidade

O "30x" agora tem regra formal: o mundo completo sera composto por **30 Pactos Continentais**.
Venor e Arredores sao o **Pacto Continental 01/30**, com fechamento previsto na RV30. O objetivo
nao e abrir 30 mapas cedo; e construir o primeiro pacto com densidade suficiente para servir de
padrao para os proximos 29.

1. Regioes conectadas por rotas reais: cidades, vilarejos, fazendas, ruinas, cavernas, pantanos e montanhas.
2. Cada regiao precisa ter funcao: lojas, quest, risco, coleta, inimigos, passagem ou historia.
3. Subsolos em camadas: esgoto, catacumbas, cavernas, fenda e masmorras de alto nivel.
4. Conteudo por faixa de nivel: iniciante, medio, alto risco e chefes de grupo.
5. Eventos de mundo: invasoes, mercador, boss raro, voo de dragao, noite perigosa e clima que muda a rota.

## Pilar 4 - Jogabilidade de RPG online

1. Movimento e colisao previsiveis em PC/celular.
2. Interacao contextual sem conflito: abrir, pegar, usar, atacar, falar, editar personagem e mapa.
3. Progressao: vocacoes, equipamentos, raros, deposito, banco, morte, mochila, quests e reputacao.
4. Combate com leitura: telegraph no chao, projeteis visiveis, dano por elemento e comportamento por monstro.
5. Conta e persistencia: save local, nuvem, GM/dev tools e sincronizacao segura.

## Pilar 5 - Processo de producao

1. Toda rodada tem escopo pequeno, selo, build, checkpoint e commit.
2. Publicar apenas com pedido explicito.
3. Performance sempre junto da arte: instancing, merge, textura pre-carregada e testes mobile.
4. Assets externos so com licenca segura; Tibia, Albion, Pokemon e Zelda entram como referencia de qualidade e mecanica, nao como copia.
5. A cada 5 rodadas: rodada so de bugfix, jogabilidade e performance.
6. NPCs, racas e faccoes entram na biblia antes de virarem conteudo jogavel.

## Rodadas premium recentes e proximas

1. RV6.6 entregue: solo vivo 3D e roadmap premium.
2. RV6.7 entregue: fachadas habitadas e qualidade urbana em casas/predios.
3. RV6.8 entregue: trilhas/caminhos melhores, lama, pegadas, bordas de estrada e transicao cidade-campo.
4. RV6.9 entregue: vegetacao premium por bioma com mais volume, vento e variacao de silhueta.
5. RV7.0 entregue: monstros principais com telegraph no chao, aggro claro e investida telegrafada.
6. RV8.0 entregue: PWA/offline-first, pagina `/baixar`, arte oficial do patch, tela de patch, calendario semanal e mascate raro.
7. RV8.1 em andamento: Jornadas Valiosas - rotas, habitats, gap analysis RPG e painel de planejamento de viagem.
8. RV8.2 entregue: luzes urbanas noturnas, carrocas de viagem, coruja/morcego e Draptor de invasao com quest da Sela Draconica.
9. RV8.3: spawns por habitat, com cyclops de montanha, raros e loot esperado por rota.
10. RV8.4: casas reais, posse persistente, bau privado, decoracao e permissao de familia/grupo.
11. RV8.5: interiores premium e padrao de entrada/saida em casas, lojas e templos.
12. RV8.6: rework visual de criaturas principais com modelos/animacoes melhores e licenca documentada.
13. RV16.8 entregue: Lore Operacional - NPCs renomeados, biblia de NPCs, compatibilidade de economia e gate premium.
14. RV16.9 entregue: Mago Viajante, manto raro conquistavel e proporcao premium dos dragoes.
15. RV17 entregue: A Grande Onda - Aurelia expandida, arquipelago celeste, primeiro calabouco grande, Sentinelas/Golems/Wyverns, armas de cla e quests de altura.
16. RV17.1 entregue: Calabouco Vivo - arte oficial nova, braseiros, altar de armas, bau unico, bestiario celeste e recompensa ligada ao voo futuro.
17. RV17.2-RV17.5: bichos premium, interiores como realidade, viagens longas, moradias/economia e Pantano Vivo.
18. RV18: portal publico + base instalavel premium, caso o pacote grafico/GLB/texturas ultrapasse o limite saudavel da web.
19. RV19: escala local e rotas de jornada do Pacto 01/30.
20. RV20: hunts por bioma e monstros profissionais.
21. RV21: crescimento profundo dos dragoes e voo draconico com custo, estamina, zonas aereas e hunts de altitude.
22. RV22: racas mortais e faccoes - orcs, anoes, paladinos, bruxos/feiticeiros e druidas com arquitetura, reputacao e economia.
23. RV23: profissoes, economia e contratos.
24. RV24: guildas, grupos e expedicoes.
25. RV25: era antiga dos dragoes, guerra da Veia, maquinas e anomalias externas em blocos grandes.
26. RV26: transporte, montarias e viagens raras.
27. RV27: familia, conta e multiplayer social.
28. RV28: QoL profissional e colecoes.
29. RV29: polimento, performance e instalacao.
30. RV30: fechamento do Pacto Continental 01/30.

Documentos canonicos novos:
- `docs/PLANO_30_CONTINENTES.md`
- `docs/BIBLIA_SISTEMAS_MMO_PROFISSIONAL.md`
- `docs/BIBLIA_MONSTROS_DRAGOES.md`

# Roadmap Premium do Jogo

Objetivo: evoluir o projeto de prototipo jogavel para RPG online autoral com escala, instalacao simples, visual vivo e sistemas de longo prazo. A meta "30x" nao significa inflar mapa sem criterio; significa multiplicar area util, densidade visual, situacoes jogaveis, progresso e confianca tecnica.

## Pilar 1 - Base instalavel

1. PWA primeiro: manifest, icones, service worker, tela offline e pagina `/baixar`.
2. Android com Capacitor: APK/AAB versionado com `versionCode`, sobrepondo versoes anteriores.
3. PC com Tauri: instalador Windows, depois macOS/Linux, com auto-update.
4. iOS por TestFlight/App Store: evitar promessa de IPA solto; seguir fluxo oficial da Apple.
5. Pipeline de versoes: selo do jogo, changelog, pagina de download e checagem de bundle publicado.

## Pilar 2 - Visual premium

1. Chao vivo: microterreno 3D, folhas, raizes, terra exposta, capim baixo, trilhas, lama e pedras por bioma.
2. Modelos GLB profissionais: arvores, pedras, monstros, pets, dragao e NPCs principais.
3. Materiais por bioma: grama, terra, pedra, areia, pantano, cinzas, lava e interiores com linguagem propria.
4. Agua e clima: reflexo controlado, espuma, chuva, neblina local, vento em vegetacao e ciclo dia/noite mais dramatico.
5. Direcao de camera/UX visual: leitura forte de personagem, combate claro, perigo no solo e mapa sem poluicao.

## Pilar 3 - Mundo 30x com densidade

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

## Rodadas premium recentes e proximas

1. RV6.6 entregue: solo vivo 3D e roadmap premium.
2. RV6.7 entregue: fachadas habitadas e qualidade urbana em casas/predios.
3. RV6.8 entregue: trilhas/caminhos melhores, lama, pegadas, bordas de estrada e transicao cidade-campo.
4. RV6.9 entregue: vegetacao premium por bioma com mais volume, vento e variacao de silhueta.
5. RV7.0 entregue: monstros principais com telegraph no chao, aggro claro e investida telegrafada.
6. RV7.1 proxima: pagina `/baixar` + PWA instalavel.
7. RV7.2: GLBs CC0 nos slots de vegetacao/monstros ou masmorra interna da Fenda, conforme material do maestro.

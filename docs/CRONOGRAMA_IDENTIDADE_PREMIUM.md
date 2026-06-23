# Cronograma - Identidade Premium de Venor

Objetivo: nenhuma arte de patch deve prometer algo que o jogo real nao entrega. Cada imagem aprovada vira
um contrato visual e funcional: se aparece casa, fonte, bueiro, monstro, mapa, interior, montaria ou bau,
o jogador precisa encontrar uma versao coerente disso no mundo jogavel.

## Regra de qualidade

1. **Imagem oficial so entra quando houver sistema real**: a arte pode guiar, mas nao pode mascarar prototipo.
2. **Todo objeto precisa ter motivo**: decoracao deve explicar lugar, rota, economia, perigo ou lore.
3. **Tudo que aparece muito precisa ser reutilizavel**: bueiros, bancos, caixas, luzes, portas, vasos e plantas viram modelos-base.
4. **Sem bloquear jogabilidade**: detalhe visual nao pode prender o jogador, tampar portas ou quebrar camera.
5. **Offline-first continua**: todo patch visual precisa entrar no cache do app instalavel.
6. **Criacao nova precisa nascer completa**: monstro, roupa, montaria, item, NPC, GIF/animacao ou imagem nova so entra com funcao operacional, movimento/idle quando aplicavel, colisao/interacao e teste.
7. **Imagem oficial e contrato**: se a arte mostra fonte, casa, bau, escada, mesa, monstro, roupa ou planta, a versao jogavel precisa entregar leitura equivalente.
8. **Peso define plataforma**: se RV17/RV18 ultrapassarem o peso aceitavel para navegador/mobile web, a prioridade muda para app instalado; web fica como preview/dev.

## Fase RV16.7 - Microdetalhes urbanos

- Status: iniciado/entregue em `docs/RV16_7_IDENTIDADE_PREMIUM.md`.
- Bueiros: moldura, grade, umidade, vapor.
- Props: barril, caixa, bau, pequenos sinais de uso.
- Ruas: calhas, bordas, sujeira e leitura de esgoto.
- Aceite: olhar para o chao da cidade nao pode parecer textura colada.

## Fase RV16.8 - Lore Operacional

- Status: entregue em `docs/RV16_8_LORE_OPERACIONAL.md`.
- NPCs ativos migrados para nomes de lore.
- `docs/BIBLIA_NPCS.md` virou a fonte dos nomes, papeis e regras de criacao.
- Saves antigos mantem economia via `legacyNome`.
- Aceite: nenhum NPC importante deve parecer placeholder.

## Fase RV16.9 - Interiores como realidade

Referencia: imagem do grande hall nobre.

- Mansoes e guildhouses precisam ter mesa central, candelabro, galeria, escada, biblioteca, tapetes, porta iluminada, baus e trofeus.
- Cada item importante precisa ter funcao futura clara: banco, depot, lixeira, descanso, conselho, trofeu, cofre.
- Ajustar proporcao: pe direito alto, objetos grandes, caminhos legiveis, camera sem esconder o jogador.
- Aceite: entrar numa guildhouse deve parecer entrar numa sede valiosa, nao numa caixa decorada.

## Fase RV16.10 - Bichos e hunts como realidade

Referencia: imagem de criaturas/bestiario.

- Revisar silhuetas: dragao, aranha, orc, ciclope, escorpiao, caranguejo, Drakari e bosses.
- Ataque precisa ter preparo, impacto, recuo e reacao proporcional.
- Hunts precisam de territorio: vegetacao, rochas, fogueiras, ossadas, placas, loot visual e risco.
- Aceite: o jogador deve reconhecer uma hunt pela composicao visual antes de ler qualquer texto.

## Fase RV16.11 - Continente e viagens

Referencia: imagem do mapa continental.

- Transformar o continente em plano por regioes: neve, floresta, pantano, vulcao, deserto, costa, ilhas e fenda arcana.
- Rotas longas precisam valer a viagem: encontros, descanso, carrocas, barcas, montarias, marcos de distancia e atalhos pagos.
- Cada cidade deve ter identidade propria, economia local, NPCs e motivo para voltar.
- Aceite: a distancia deve criar aventura, nao vazio.

## Fase RV16.12 - Moradias, aluguel e economia

- Aluguel semanal, renovacao, avisos e perda temporaria de beneficios sem apagar itens.
- Beneficios reais: depot, banco, lixeira, cama, treino magico do dragao, acesso de guilda.
- Casas simples, mansoes e guildhouses precisam ter preco, raridade, localizacao e vantagem.
- Aceite: morar em Venor precisa ser aspiracional, como casa boa em MMO classico.

## Fase RV16.13 - Hunt do Pantano Vivo

- Territorio do Dragao do Pantano.
- Pontes, lama, veneno, agua, plantas densas, bueiros/galerias conectando a cidade ao perigo.
- Item-chave para doma rara.
- Aceite: o pantano deve parecer ecossistema, nao arena.

## Fase RV17 - Portal publico e conta

- Site estilo Tibia: noticias de updates, contas, personagens, highscores, bestiario, mapa, patch notes e biblioteca de lore.
- So iniciar quando as imagens principais ja corresponderem ao mundo jogavel.

## Fase RV18 - Base instalavel premium

- PWA continua como ponte, mas o alvo vira app instalado se o pacote grafico ficar pesado.
- Android/iOS por Capacitor, PC por Tauri/Electron leve, com controle de versao e pacote offline.
- Assets grandes, GLBs, texturas e animacoes entram por manifest de asset, nao improvisados no codigo.
- Aceite: jogador abre como jogo instalado, carrega rapido depois do primeiro pacote e nao depende de internet para solo.

## Fase RV22 - Racas mortais e faccoes

- Orcs, anoes, humanos de linhagem antiga, paladinos, bruxos/feiticeiros e druidas entram como sistemas, nao skins.
- Cada raca precisa de arquitetura, NPCs, reputacao, loot, fraquezas e rota propria.

## Fase RV25 - Era antiga dos dragoes e guerra da Veia

- Dragoes antigos, guerras da Veia, maquinas, roboides/humanoides e sinais externos entram em blocos grandes.
- Tecnologia precisa nascer da lore: a maquina industrializa a Veia; alienigena entra como anomalia, nao troca de genero.

# Patch RV8 - Pacto da Semana

Objetivo: virar a chave de "conteudo solto" para um jogo com rotina, valor,
escassez e instalacao simples. Este patch tambem formaliza o processo premium:
cada entrega precisa ter selo, arte, checklist e criterio claro de aceite.

## Entregue nesta rodada

1. **PWA / offline-first**
   - `manifest.webmanifest`
   - `sw.js`
   - pagina `/baixar.html`
   - status online/offline no jogo
   - criterio: depois do primeiro carregamento, o jogo deve abrir novamente sem internet.

2. **Imagem oficial do patch**
   - `public/patches/rv8-pacto-da-semana.png`
   - usada na tela de patch e na pagina de instalacao.

3. **Tela de patch dentro do jogo**
   - painel "PATCH RV8 - Pacto da Semana"
   - explica direcao, mascate semanal, offline e economia.

4. **Calendario de Venor**
   - `src/jogo/calendario.js`
   - dias reais viram rotina semanal de mundo.
   - o mascate aparece somente terca, quinta e sabado.

5. **Economia com escassez leve**
   - vendas usam modificador semanal pequeno.
   - isso cria janela de oportunidade sem quebrar progresso.

## Regras de qualidade daqui para frente

- Nada de "adicionar por adicionar": toda regiao precisa ter funcao.
- Monstro precisa ter leitura: silhueta, animacao, aviso e risco calculavel.
- Estrada precisa guiar: borda, textura, props e direcao clara.
- Offline primeiro; online e multiplayer entram como camada opcional.
- Assets externos so entram com licenca segura (CC0, CC-BY compativel, ou comprado).
- Se usar modelo gratuito, salvar fonte/licenca em `docs/ASSETS.md`.

## Cronograma sugerido

### RV8.1 - Auditoria de proporcoes e leitura
- revisar escala de ruas, casas, bancos, portas e interiores existentes.
- ajustar o que atrapalha controle/camera.
- criterio: player anda 5 minutos sem ficar preso, sumir ou bater em detalhe injusto.

### RV8.2 - Interiores premium
- padronizar casas ocas, lojas e templos.
- telhado/parede devem ajudar a camera, nao bloquear o jogador.
- criterio: entrar/sair de 5 lugares principais sem bug.

### RV8.3 - Criaturas e boss rework
- redesenhar dragao, lobos, trolls, aranhas e Drakari por prioridade.
- cada criatura recebe idle, ataque, dano, morte e sombra/telegraph coerentes.
- criterio: criatura bonita e legivel mesmo no celular.

### RV8.4 - Eventos coordenados
- invasao semanal, chefe raro e rotas de grupo.
- recompensas escassas e calculadas.
- criterio: evento exige preparacao, mas nao parece injusto.

### RV8.5 - Multiplayer online opcional
- servidor Railway como camada online.
- offline continua abrindo sem internet.
- criterio: 3 jogadores se veem, nomes/aparencia sincronizam, sem quebrar save local.

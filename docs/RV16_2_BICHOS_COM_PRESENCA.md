# RV16.2 - Bichos com Presenca

Versao: RV16.2 (v113)  
Status: implementado no `main`, sem deploy.

## Objetivo

Dar mais leitura e peso para os encontros do jogo. O foco desta rodada nao foi criar uma hunt nova, mas fazer
os bichos atuais parecerem menos estaticos: olhando, preparando ataque, usando armas e reagindo melhor ao dano.

## Entregue

1. **Arte oficial do patch**
   - Novo key art em `public/patches/rv16-2-bichos-presenca.png`.
   - Conectado em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e cache offline.

2. **Cabeca e olhos com alvo**
   - Criaturas com cabeca/olhos agora miram o jogador quando ele esta proximo.
   - O efeito e suave para nao quebrar o estilo procedural nem gerar giro estranho.

3. **Armas participando do golpe**
   - Ciclope levanta clava na investida.
   - Orc movimenta machado.
   - Drakari movimenta lanca.

4. **Aracnideos e crustaceos vivos**
   - Aranhas, escorpioes e caranguejos animam patas de forma propria.
   - Escorpiao ganhou ferrao animado.
   - Caranguejo/escorpiao ganharam garras reativas.

5. **Dragoes com impacto maior**
   - Golpes, flechas, runas e magias agora registram flinch proporcional.
   - Boss/dragao recebe duracao/forca maiores, inclinacao mais forte e flare na garganta.
   - O dragao-companheiro preserva a rotacao base do pescoco durante mordida e retorna melhor depois do ataque.

6. **Offline-first atualizado**
   - Service worker subiu para `venor-rv16-2-offline-v1`.
   - O app instalavel passa a carregar a arte nova depois do primeiro acesso online.

## Arquivos principais

- `src/jogo/ratos.js`
- `src/main3d.js`
- `src/jogo/patchNotes.js`
- `public/patches/rv16-2-bichos-presenca.png`
- `public/sw.js`
- `public/manifest.webmanifest`
- `public/baixar.html`

## Criterios de aceite

1. Selo da tela mostra `RV16.2 (v113)`.
2. Painel de patch abre como `PATCH RV16.2`.
3. Build passa sem erro.
4. Monstros principais continuam se movendo/perseguindo sem quebrar colisao.
5. Bichos com armas/membros passam a ter movimento visual durante idle, perseguicao ou investida.

## Proximas frentes recomendadas

1. RV16.3: interiores grandes de mansao/guildhouse.
2. RV16.4: luz, detalhe e arte oficial mais proxima do jogo real.
3. RV16.5: aluguel semanal com vencimento, renovacao e perda temporaria de beneficios.
4. RV16.6: primeira hunt regional nova de dragao com territorio proprio.
5. RV16.7: doma de dragao adulto com Coracao/Sela Draconica e boss de invasao.

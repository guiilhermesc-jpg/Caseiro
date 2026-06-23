# RV16.5 - Cidade Profissional

Versao: RV16.5 (v116)  
Status: implementado no `main`, sem deploy.

## Objetivo

Responder diretamente ao problema de leitura visual infantil: cidade, fonte, grama e outfits estavam parecendo
papel de parede ou prototipo. Esta rodada troca a direcao para materialidade: pedra, musgo, sujeira, agua,
capim 3D e personagem com mais acabamento.

## Entregue

1. **Arte oficial do patch**
   - Novo key art em `public/patches/rv16-5-cidade-profissional.png`.
   - Conectado em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e cache offline.
   - A cena mostra praca, fonte, calcamento gasto, grama, baus, barris, casas e mago com cajado.

2. **Fonte refeita**
   - `criaFonte()` agora usa pedra PBR, bordas, pilar com frisos, espuma, musgo e agua mais limpa.
   - Gotas animadas aumentaram de 16 para 32 para dar mais vida ao chafariz.

3. **Cidade com acabamento urbano**
   - Ruas e pracas recebem manchas de terra, musgo, fissuras e seixos instanciados.
   - O objetivo e quebrar a sensacao de textura chapada sem criar colisores novos.

4. **Grama menos "papel de parede"**
   - Textura procedural de grama ganhou laminas, sulcos e variacao.
   - Menos billboard de mato plano; mais capim 3D, seixos, terra exposta, capim rasteiro e capim alto.

5. **Outfits/conjuradores melhores**
   - Mago legado perdeu o chapeu conico/triangular e ganhou capuz, robe com borda, broche, cajado e orbe.
   - Feiticeiro e druida tambem ganharam bordas e cajados para melhorar silhueta e leitura de vocacao.

## Arquivos principais

- `src/jogo/construcoes.js`
- `src/jogo/cidade.js`
- `src/jogo/texturas.js`
- `src/jogo/avatar.js`
- `src/main3d.js`
- `src/jogo/patchNotes.js`
- `public/patches/rv16-5-cidade-profissional.png`

## Criterios de aceite

1. Selo da tela mostra `RV16.5 (v116)`.
2. Painel de patch abre como `PATCH RV16.5`.
3. Build passa sem erro.
4. Fonte da praca tem pedra, espuma, musgo e mais jatos.
5. Cidade tem microdetalhe no piso sem bloquear caminho.
6. Grama/campo tem mais volume e menos leitura de plano 2D.
7. Magos/conjuradores deixam de parecer triangulos simples.

## Proximas frentes recomendadas

1. RV16.6: aluguel semanal com vencimento, renovacao e beneficios reais.
2. RV16.7: hunt regional nova de dragao com territorio proprio.
3. RV16.8: doma de dragao adulto com Coracao/Sela Draconica.
4. Patch 17: site/portal publico com noticias, contas, personagens e rankings.

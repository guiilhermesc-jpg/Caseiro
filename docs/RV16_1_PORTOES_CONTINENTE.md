# RV16.1 - Portoes & Continente

Data: 2026-06-22
Versao: RV16.1 (v112)
Status: em main local ate commit/push, sem deploy.

## Objetivo

Responder ao pedido de salto premium sem transformar o projeto em bagunca:
melhorar a imersao visual imediata com portoes de cidade mais fortes, conectar
a tela de patch a uma arte de continente e documentar a estrutura de hunts,
rotas, dragoes, casas e expansoes futuras.

## Entregue

1. **Arte oficial RV16.1**
   - gerada via imagegen;
   - salva em `public/patches/rv16-1-portoes-continente.png`;
   - otimizada em 1536x1024 (~1.18 MB);
   - conectada ao patch notes, manifesto PWA, pagina de instalacao e cache offline.

2. **Portoes de cidade redesenhados**
   - novo `criaPortaoCidade` em `src/jogo/construcoes.js`;
   - torres, arco, grade elevada, portas abertas, tabuleta, brasao, estandartes e chamas animadas;
   - colisao apenas em torres/pilares para manter a passagem central livre;
   - aplicado em Venor, Venore e Thais.

3. **Offline-first atualizado**
   - `public/sw.js` agora usa `venor-rv16-1-offline-v1`;
   - imagem RV16.1 entra no cache principal;
   - pagina `/baixar.html` usa a nova arte.

4. **Patch notes refeito**
   - `src/jogo/patchNotes.js` agora abre RV16.1;
   - texto orienta portoes, continente, hunts de dragao e proxima frente dos bichos.

5. **Reacao do dragao-companheiro**
   - mordida do pet dragao agora dispara pulso corporal;
   - garganta flameja no golpe;
   - alvo recebe flinch mais forte e mais longo quando o ataque vem de dragao.

6. **Biblia do continente**
   - novo `docs/BIBLIA_CONTINENTE_VENOR.md`;
   - macro-regioes, hunts, requisitos, quest chains, economia e cronograma.

## Criterios de aceite

1. `npm run build` passa.
2. Selo mostra `RV16.1 (v112)`.
3. Painel de patch mostra `Portoes & Continente`.
4. `public/manifest.webmanifest` aponta para a arte RV16.1.
5. `public/sw.js` troca a versao do cache.
6. Venor, Venore e Thais continuam com vao central passavel nos portoes.
7. Dragao companheiro anima o golpe e o alvo reage com impacto mais forte.
8. Sem deploy/publicacao sem pedido literal do maestro.

## Proximos passos

1. RV16.2: rodada completa dos bichos.
2. RV16.3: interiores grandes de mansao/guildhouse.
3. RV16.4: luz, detalhe e arte oficial mais proxima do jogo real.
4. RV16.5: cidade profissional, fonte refeita, grama com volume e outfits melhores.
5. RV16.6: praca jogavel, casario maior e arte refletida no mundo real.
6. RV16.7: aluguel semanal com vencimento.
7. RV16.8: primeira hunt nova de dragao regional.

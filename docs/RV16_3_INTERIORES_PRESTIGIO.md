# RV16.3 - Interiores de Prestigio

Versao: RV16.3 (v114)  
Status: implementado no `main`, sem deploy.

## Objetivo

Transformar mansoes e guildhouse em lugares jogaveis, nao apenas fachadas com menu. A propriedade passa a ter
rotina fisica: entrar, andar, usar objetos, dormir, guardar ouro e sentir que aquele espaco tem valor.

## Entregue

1. **Arte oficial do patch**
   - Novo key art em `public/patches/rv16-3-interiores-prestigio.png`.
   - Conectado em `patchNotes.js`, `manifest.webmanifest`, `baixar.html` e cache offline.

2. **Interiores de mansao**
   - Mansoes alugaveis ganharam zona interna propria.
   - Hall grande, biblioteca, mesa de contratos, cama, deposito, banco, lixeira e ninho draconico.
   - Colisao propria e camera usando a geometria da zona ativa.

3. **Interior de guildhouse**
   - O Salao das Guildas ganhou interior maior, com mesa de conselho, armaria, trofeus, cofre, banco e berco draconico.
   - Mesa de conselho ja serve como ponto de lore/organizacao para futuras missoes de grupo.

4. **Beneficios dentro do espaco**
   - Objetos internos chamam as mesmas funcoes do contrato:
     - dormir e treinar ML do dragao;
     - abrir deposito;
     - abrir banco;
     - descartar itens baratos.

5. **Fluxo de entrada e saida**
   - Menu do imovel alugado ganhou `Entrar no interior`.
   - Ao sair, o jogador volta para a porta/placa do imovel na superficie.
   - O indicador de local mostra `Interior · Nome do Imovel`.

## Arquivos principais

- `src/jogo/interiores.js`
- `src/main3d.js`
- `src/jogo/patchNotes.js`
- `public/patches/rv16-3-interiores-prestigio.png`
- `public/sw.js`
- `public/manifest.webmanifest`
- `public/baixar.html`

## Criterios de aceite

1. Selo da tela mostra `RV16.3 (v114)`.
2. Painel de patch abre como `PATCH RV16.3`.
3. Build passa sem erro.
4. Mansao/guildhouse alugada oferece acao `Entrar no interior`.
5. Dentro do interior, interativos funcionam: sair, deposito, banco, lixeira e descanso.
6. Morte/teleporte GM limpa a zona interna e volta para a superficie sem deixar interior visivel.

## Proximas frentes recomendadas

1. RV16.4: luz, detalhe e arte oficial mais proxima do jogo real.
2. RV16.5: cidade profissional, fonte refeita, grama com volume e outfits melhores.
3. RV16.6: aluguel semanal com vencimento, renovacao e avisos.
4. RV16.7: hunt regional nova de dragao com territorio proprio.
5. RV16.8: doma de dragao adulto com Coracao/Sela Draconica.
6. RV16.9: examinar objetos/NPCs no estilo MMO classico.

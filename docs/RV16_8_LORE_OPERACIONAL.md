# RV16.8 - Lore Operacional

Versao: RV16.8 (v119)  
Data: 2026-06-23  
Status: build local pendente de validacao final neste patch; sem deploy ate o maestro pedir literalmente `pode publicar`.

## Entrega

1. **NPCs com identidade de mundo**
   - O elenco ativo saiu de nomes simples/placeholder para nomes de fantasia coerentes com Venor.
   - Vilarejo, Thais, estrada, Venore e Noctaria foram migrados.
   - Criado `docs/BIBLIA_NPCS.md` para travar nomes, papeis e regras futuras.

2. **Saves e economia preservados**
   - NPCs agora carregam `legacyNome`.
   - A economia circular migra estoque antigo para o nome novo na primeira leitura.
   - IDs de quests ja existentes continuam estaveis para nao resetar progresso.

3. **Lojas restauradas no NPC vivo**
   - `criaNPCs()` agora copia `loja`, `compra` e `ofertas` para o objeto usado no dialogo.
   - Isso reforca o loop caca -> loot -> venda -> oferta rara.

4. **Gate premium oficial**
   - Toda criacao nova precisa entrar com funcao operacional, movimento/animacao quando aplicavel, cache/offline, teste e documento.
   - GIF/modelo/monstro/roupa/imagem nao entra mais como enfeite sem gameplay.

5. **Rumo instalavel**
   - O cronograma passa a tratar RV17/RV18 como ponto de decisao: se o peso grafico premium crescer demais, o navegador vira preview/dev e a versao principal vira app instalado.

## Arquivos principais

- `src/jogo/npcs.js`
- `src/main3d.js`
- `src/jogo/patchNotes.js`
- `docs/BIBLIA_NPCS.md`
- `docs/CRONOGRAMA_IDENTIDADE_PREMIUM.md`

## Validacao esperada

1. Selo da tela mostra `RV16.8 (v119)`.
2. Painel de patch abre como `PATCH RV16.8`.
3. Falar com Othmar, Brannor, Seranna, Eldrith, Falric, Ysolde, Gromar, Ilyndra, Thessara, Helyra e Caldrath mostra loja/compra quando aplicavel.
4. Quests de Brannar, Gildren, Tovaryn, Falric, Helyra, Ulrion, Kael, Mara Veyr e Nerion aparecem nos NPCs corretos.
5. Save antigo que vendeu itens para um NPC antigo ainda libera ofertas no NPC renomeado.

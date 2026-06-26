# RV18.5 - Mapa Continental do Pacto 01/30

Data: 2026-06-24  
Build: v137  
Status: implementado localmente, nao publicado.

## Problema corrigido

O mapa grande estava comunicando a coisa errada. Ele era funcional, mas visualmente parecia um
grid tecnico/minimapa verde, sem a leitura de continente, ilhas flutuantes e aventura prometida
pelas artes premium do ciclo 17/18.

## Entrega real

- `src/jogo/minimapa.js` ganhou `desenhaMapaGrandePremium()`, mantendo o clique para marcar destino.
- O painel grande agora desenha mar, costa, massa continental, biomas, montanhas, florestas, rios,
  rotas, veios magicos, cidades, hunts e camada de ilhas flutuantes.
- Aurelia, Ilhas do Vento e Observatorio aparecem como camada aerea visivel.
- Venor, Venore, Thais, Noctaria, Pico do Dragao, Ermo das Cinzas, Areias do Veio Seco,
  Brejo Profundo e Costa do Farol aparecem como leitura canonica.
- Os obstaculos continuam presentes apenas como massas urbanas relevantes, sem poluir o mapa com
  pequenos blocos de debug.

## Arquivos alterados

- `src/jogo/minimapa.js`
- `src/main3d.js`
- `src/jogo/patchNotes.js`
- `public/patch-manifest.json`
- `public/sw.js`
- `index.html`
- `public/launcher.html`
- `public/portal.html`
- `public/install-profile.json`
- `docs/ROADMAP_PREMIUM.md`
- `docs/HANDOFF-CODEX.md`

## Regra para proximos mapas

Mapa oficial do jogo nao e debug. Pode ter funcao tecnica, mas precisa primeiro vender mundo:
escala, caminho, risco, descoberta, bioma e promessa jogavel.


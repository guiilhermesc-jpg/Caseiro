# RV18.1 - Portal Publico

## Objetivo

Criar a primeira versao do portal publico de Venor dentro do app instalado: uma area para noticias, personagens locais, mapa do Pacto 01/30, bestiario base e links diretos para launcher/jogo.

## Entregue

- `public/portal.html`: nova pagina do portal.
- `public/launcher.html`: ganhou botao `PORTAL DE VENOR`.
- `public/patch-manifest.json`: subiu para `RV18.1`, build `133`, cache `venor-rv18-1-offline-v1`.
- `public/sw.js` e `index.html`: adicionaram `/portal.html` ao cache.
- `src/main3d.js`: selo subiu para `RV18.1 (v133)`.
- `src/jogo/patchNotes.js`: patch notes apresenta o portal como novo bloco do Patch 18.
- `public/baixar.html`: linka launcher, portal e jogo direto.

## Sistemas do portal

1. Noticias de patch e contrato visual.
2. Lista de personagens locais do aparelho.
3. Estado do mundo: patch, pacto, modo e proxima meta.
4. Bestiario base com familias de criaturas.
5. Mapa visual do Pacto Continental 01/30.

## Proximos passos

- RV18.2: medir pacote pesado e decidir Tauri/Capacitor.
- RV18.3: personagem publico com dados de nuvem.
- RV18.4 foi redirecionado para resgate visual da praca; historico de builds/patcher ficou para RV18.5.

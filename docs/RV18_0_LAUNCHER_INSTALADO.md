# RV18.0 - Launcher Instalado

## Objetivo

Comecar o Patch 18 pela base que permite crescer com peso grafico: um launcher instalavel, offline-first, com contas locais, central de patch, manifesto de assets e entrada direta no jogo.

## Entregue

- `public/launcher.html`: nova entrada do app instalado.
- `public/patch-manifest.json`: contrato de versao, build, cache, assets, updates e proximos passos.
- `public/manifest.webmanifest`: `start_url` agora aponta para `/launcher.html`.
- `public/sw.js`: cache subiu para `venor-rv18-0-offline-v1`, inclui launcher e manifesto, e aceita `SKIP_WAITING`.
- `src/jogo/selecao.js`: recebe login vindo do launcher por `sessionStorage` e entra automaticamente quando solicitado.
- `src/main3d.js`: selo subiu para `RV18.0 (v132)`.
- `src/jogo/patchNotes.js`: patch notes agora apresenta o launcher instalado como primeira entrega real do ciclo 18.
- `public/baixar.html`: instalacao aponta para o launcher.

## Sistemas

1. **Conta local**
   - O launcher lista saves `venor_conta_*` do aparelho.
   - Mostra nivel, ouro, posicao e estado basico do dragao quando disponivel.
   - Permite escolher conta e entrar direto no jogo.

2. **Conta em nuvem**
   - Continua no jogo pelo botao de nuvem.
   - Usa o servidor Railway ja existente com nome + PIN.
   - O launcher nao guarda PIN de nuvem nesta versao.

3. **Patch center**
   - Le `patch-manifest.json`.
   - Prepara assets no cache.
   - Remove caches antigos quando o jogador pedir.
   - Mede armazenamento disponivel quando o navegador suporta.

4. **Instalacao**
   - Em Android/Chrome e PC/Edge/Chrome, o launcher usa `beforeinstallprompt` quando disponivel.
   - Em iOS/iPadOS, o fluxo continua pelo menu do Safari.

## Inspiracoes absorvidas sem copiar IP

- Tibia: mundo persistente, conta simples, valor de casa, patch notes e portal como parte da cultura do jogo.
- Albion: launcher/patch como porta de entrada operacional, economia e preparacao antes da viagem.
- WoW: conta como memoria ampla, updates claros, colecoes/progresso e separacao entre jogo e servicos de apoio.

## Proximo bloco

RV18.1 deve construir o portal publico: noticias, patch notes, personagens, conta, rankings, mapa, bestiario e lore.


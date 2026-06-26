# RV18.2 - Pacote Instalado Premium

Objetivo: preparar Venor para crescer em qualidade grafica sem quebrar celular, tablet ou navegador.

## Entrega

- `src/jogo/perfil-grafico.js`: fonte unica dos perfis Mobile Estavel, Premium e Ultra Instalado.
- `src/main3d.js`: o motor passa a ler o perfil antes de criar o WebGL.
- `public/launcher.html`: painel Grafico com escolha salva no aparelho.
- `public/install-profile.json`: contrato de empacotamento, orcamentos e alvo Android/desktop/iOS.
- `scripts/auditar-pacote.mjs`: auditoria local do `dist`, total de assets e JS gzip.
- `patch-manifest.json`, `sw.js` e `index.html`: cache RV18.2 com manifesto de instalacao.

## Perfis

- Mobile Estavel: reduz pixels, remove bloom e sombras dinamicas.
- Premium: perfil recomendado, com imagem rica e custo controlado.
- Ultra Instalado: mais pixels, sombras e bloom para aparelhos fortes.

## Decisao tecnica

O navegador segue como preview jogavel e acesso rapido. Quando o pacote visual ficar pesado demais,
o alvo premium passa a ser app instalado: Capacitor para Android, Tauri para desktop e fluxo oficial
Apple para iOS.

## Validacao obrigatoria

1. `npm run build`
2. `npm run audit:package`
3. Abrir `/launcher.html` no mobile e trocar os perfis.
4. Entrar no jogo e conferir o selo `GRAFICO`.

## Auditoria inicial

- `dist`: 92 MB.
- JS gzip inicial: 0.36 MB, dentro do orcamento web de 0.45 MB.
- Pacote total: acima do alvo core de 80 MB por causa das artes oficiais grandes.
- Decisao: manter as artes premium, mas separar assets por grupo/patcher a partir do RV18.5 para o app instalado baixar melhor.

## Proximo bloco

RV18.3 deve trazer personagem publico/ranking inicial com dados locais e, quando possivel, dados de nuvem.

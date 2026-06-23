# Registro de Assets

Este arquivo existe para manter o projeto publicavel com seguranca.
Qualquer modelo, textura, som ou pacote externo precisa entrar aqui antes de ir
para o jogo.

## Assets gerados no projeto

- `public/patches/rv8-pacto-da-semana.png`
  - origem: gerado via skill `imagegen` em 15/06/2026.
  - uso: arte oficial do Patch RV8, tela de patch e pagina de instalacao.
- `public/patches/rv16-1-portoes-continente.png`
  - origem: gerado via skill `imagegen` em 22/06/2026.
  - uso: arte oficial do Patch RV16.1, tela de patch, manifesto PWA, pagina de instalacao e cache offline.
- `public/patches/rv16-2-bichos-presenca.png`
  - origem: gerado via skill `imagegen` em 23/06/2026.
  - uso: arte oficial do Patch RV16.2, tela de patch, manifesto PWA, pagina de instalacao e cache offline.
- `public/patches/rv16-3-interiores-prestigio.png`
  - origem: gerado via skill `imagegen` em 23/06/2026.
  - uso: arte oficial do Patch RV16.3, tela de patch, manifesto PWA, pagina de instalacao e cache offline.

## Assets existentes

- `public/texturas/*.png`
  - texturas locais do projeto.
- `public/modelos/dragao.glb`, `public/modelos/dragao2.glb`
  - modelos locais usados como fallback/slots de dragao.

## Regra para assets gratuitos

Antes de importar modelos de sites externos, registrar:

- nome do asset;
- URL de origem;
- autor;
- licenca;
- se exige atribuicao;
- arquivo final no projeto.

Preferencia: CC0, public domain, ou assets pagos com licenca comercial clara.

## Candidatos premium para RV8.2+

Ainda nao importados. Usar apenas depois de baixar, conferir licenca e registrar
arquivo final.

- Quaternius - Free Game Assets: https://quaternius.com/
  - candidatos: Animated Dinosaur Pack (Draptor/raptores), Ultimate Animated
    Animal Pack (cavalo/burro/lobo), Fantasy Props MegaKit e Medieval Village
    MegaKit (carrocas/wagon/props), Animated Monster Pack / Ultimate Monsters
    (morcegos/monstros).
- Kenney Assets: https://kenney.nl/assets
  - candidatos: props low-poly, UI e objetos de mundo com licenca clara.
- Poly Pizza: https://poly.pizza/
  - candidatos: modelos individuais para props/animais; conferir licenca por
    asset antes de usar.

Regra nova: se a qualidade visual nao superar o procedural atual, o asset nao
entra. Substituir por GLB so quando melhorar silhueta, animacao, material e
leitura no celular.

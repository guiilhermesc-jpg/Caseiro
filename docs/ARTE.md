# Projeto Sirene — Bíblia Visual (v0.1)

> Guia para manter TODA a arte coesa. O estilo escolhido é **graphic novel
> dramático** (ilustração séria, de quadrinho de guerra). Toda imagem gerada deve
> seguir este documento. Os prompts prontos estão em `PROMPTS-ARTE.md`.

## 1. Referências de alma
- **This War of Mine** — civis na guerra, tons sujos, melancolia.
- **Valiant Hearts** — traço de quadrinho, contorno forte, emoção.
- **Persepolis / Joe Sacco** — graphic novel, alto contraste, peso humano.

## 2. Princípios do traço
1. **Contorno de tinta** preto/quase-preto, firme e visível.
2. **Cor chapada (cel-shading)** — poucas tonalidades por superfície, sem degradê fotográfico.
3. **Sombras dramáticas** (chiaroscuro) + leve **hachura/cross-hatch** como textura.
4. **Paleta dessaturada** — clima de guerra, poeira, concreto.
5. **Vermelho é sagrado**: usado só para alerta/sangue/sirene. Nada de cores vibrantes "alegres".
6. **Sem texto, sem moldura, sem marca d'água** nas imagens.

## 3. Paleta (use estes valores como base)
| Uso | Cor | Hex |
|---|---|---|
| Concreto/base escura | cinza-azulado | `#2b3440` |
| Poeira/entulho | marrom acinzentado | `#6b5d4f` |
| Sombra profunda | quase-preto | `#14181d` |
| Luz fria (dia nublado) | azul dessaturado | `#8b95a3` |
| Luz quente (lampião) | âmbar | `#e0a030` |
| **Alerta/sirene** | vermelho | `#ff3b3b` |
| Contorno | tinta | `#14141a` |

## 4. Perspectiva (IMPORTANTE — o jogo é visto de cima)
- O mapa é **top-down** (planta do apartamento).
- Para a arte sair bem na IA e ainda "ler" de cima, adotamos **¾ leve (top-down 3/4)**:
  objetos e personagens levemente vistos de cima e de frente, com **sombra própria
  embaixo**. É a convenção de jogos como *Don't Starve* / *Project Zomboid*.

## 5. Especificações técnicas dos arquivos
- **Formato:** PNG com **fundo transparente**.
- **Tamanho:** gere **quadrado, 512×512** (o jogo redimensiona; sobra qualidade).
- **Enquadramento:** 1 objeto centralizado, com ~10% de margem. Sombra suave embaixo.
- **Nomenclatura:** exatamente o `id` do item/pessoa, minúsculo, sem acento.
  Ex.: `agua.png`, `primeiros_socorros.png`, `jogador.png`.

## 6. Onde salvar (o motor lê daqui)
```
public/assets/itens/<id>.png         (ex.: public/assets/itens/agua.png)
public/assets/personagens/<id>.png   (ex.: public/assets/personagens/jogador.png)
```
Depois de salvar, **registre o id** em `src/data/sprites.js` (instruções no próprio
arquivo). O jogo passa a usar a ilustração no lugar do emoji automaticamente.

## 7. Ordem de produção sugerida (do que dá mais impacto pro menos)
1. **Personagens** (4): `jogador`, `mae`, `filho`, `avo`.
2. **Itens** (20): comece pelos comuns que aparecem sempre (água, comida, lanterna…).
3. **Cenário** (depois): texturas de piso e móveis — entram numa fase posterior.

## 8. Dica de transparência
Se a sua ferramenta de IA não exporta PNG transparente, gere com **"isolated on a
plain flat background"** e remova o fundo depois (ex.: remove.bg ou a borracha mágica
de um editor). O importante é o objeto isolado.

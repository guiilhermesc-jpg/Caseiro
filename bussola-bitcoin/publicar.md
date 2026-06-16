# Publicar a Bússola (link provisório) e torná-la um repo próprio

Este projeto é **autônomo**: tudo o que ele precisa está dentro da pasta `bussola-bitcoin/`.
Hoje ele vive temporariamente dentro do repositório do jogo (`Caseiro`) só para **não se
perder** — o destino é um **repositório dedicado**.

## A) Publicar rápido (link provisório)

Como é um site **estático**, qualquer host de estáticos serve. Sugestões (a mesma linha do
que usamos no jogo — Cloudflare Pages):

### Opção 1 — Cloudflare Pages (recomendado, gera `*.pages.dev`)
1. Crie um projeto no Cloudflare Pages chamado `bussola-bitcoin`.
2. Aponte para a **raiz desta pasta** (sem build; "Framework: None"; build command vazio;
   output = a própria pasta).
3. Deploy → link provisório: **`https://bussola-bitcoin.pages.dev`**.

Via CLI (precisa do seu token Cloudflare em `CLOUDFLARE_API_TOKEN`):
```bash
cd bussola-bitcoin
npx wrangler pages deploy . --project-name=bussola-bitcoin
```

### Opção 2 — GitHub Pages
Suba a pasta num repo e ative Pages na branch/raiz → `https://<user>.github.io/bussola-bitcoin/`.

### Opção 3 — Netlify / Vercel
"Importar pasta" / arrastar a pasta → publica e dá um link provisório.

> Eu (assistente) **não** consigo fazer o deploy daqui sem o seu token do host. Deixo tudo
> pronto para 1 comando; o link "ao vivo" depende desse passo seu.

## B) Extrair para um repositório dedicado

Quando quiser separar de vez do jogo:

```bash
# a partir da raiz do repo Caseiro:
git subtree split --prefix=bussola-bitcoin -b bussola-only
# crie um repo novo no GitHub (ex.: bussola-bitcoin) e:
git push git@github.com:<user>/bussola-bitcoin.git bussola-only:main
```

Ou, mais simples: copie a pasta `bussola-bitcoin/` para um diretório limpo, rode
`git init`, `git add .`, `git commit`, e dê push num repo novo.

> Assim que a integração de GitHub voltar nesta sessão, eu posso **criar o repositório
> dedicado** e fazer a extração para você — é só pedir.

## C) Checklist de publicação

- [ ] Repositório dedicado criado
- [ ] Host escolhido (Cloudflare Pages / GitHub Pages / Netlify)
- [ ] Deploy feito → **link provisório anotado**
- [ ] PWA testado (abrir, ficar offline, recarregar — deve continuar lendo)
- [ ] `docs/` revisado (sobretudo o capítulo fiscal — regra muda)

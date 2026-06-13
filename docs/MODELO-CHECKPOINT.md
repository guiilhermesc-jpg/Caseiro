# 📌 MODELO DE CHECKPOINT — padrão dos projetos do maestro
> Este arquivo é o MOLDE. Cada projeto deve ter um `docs/CHECKPOINT.md` neste formato.
> Origem do padrão: projeto Caseiro (jogo "Venore").

---

## 🎯 Para que serve
Um único documento-mestre por projeto que permite **retomar do zero, de qualquer computador
e em qualquer sessão do Claude Code**, sem perder contexto. Em qualquer sessão nova basta dizer:

> **"Leia docs/CHECKPOINT.md e continue de onde paramos"**

---

## ✂️ PROMPT PRONTO (colar na sessão de cada projeto)

```
Crie o arquivo docs/CHECKPOINT.md neste projeto seguindo o padrão abaixo
(é o mesmo padrão do projeto Caseiro, para manter todos os projetos iguais).
Preencha cada seção com o estado REAL deste projeto, lendo o código e o
histórico de commits. Depois faça commit e push.

Seções obrigatórias, nesta ordem:
1. Título: # 📌 CHECKPOINT — <nome do projeto> + data de atualização
2. 📦 ESTADO EXATO — o que está em produção (URL se houver), o que está no
   GitHub sem deploy, versão atual, branch principal
3. 📏 REGRAS DO MAESTRO — responder sempre em português; validar com build/teste
   a cada rodada; commit+push a cada rodada; atualizar este CHECKPOINT a cada
   rodada; NÃO publicar/deployar sem OK literal do maestro
4. 🧱 ARQUITETURA — mapa dos arquivos/módulos principais e o que cada um faz
5. ⚠️ GOTCHAS — bugs e pegadinhas já aprendidos (para não repetir)
6. 🔭 FILA SUGERIDA — próximos passos planejados
7. 🧪 ROTEIRO DE TESTE — como o maestro confere que tudo funciona
8. 📔 DIÁRIO DE RODADAS — no FIM do arquivo, em ordem cronológica, um
   parágrafo por rodada (rodadas novas entram DEPOIS da última)

A cada rodada de trabalho futuro: código → build ✓ → commit+push →
atualizar o CHECKPOINT (estado + diário).
```

---

## 🗂️ PADRÃO DE NOMES (igual em todos os projetos)
- Documento-mestre: `docs/CHECKPOINT.md`
- Demais documentos no mesmo grupo `docs/`: `VISAO.md` (o que o projeto é),
  `ROADMAP_PREMIUM.md` (futuro), e os guias específicos do projeto
- Commits: `feat: <Nª> rodada - <título curto> (v<N>)` e `docs: <marco>`
- Versão visível no app (quando aplicável): const `VERSAO` com selo na tela

## 📋 PROJETOS NO PADRÃO
| Projeto | Repositório | CHECKPOINT |
|---------|-------------|------------|
| Caseiro (jogo "Venore") | guiilhermesc-jpg/Caseiro | ✅ docs/CHECKPOINT.md |
| _(adicionar os demais conforme forem padronizados)_ | | |

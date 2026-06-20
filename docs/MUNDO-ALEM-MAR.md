# 🌊 AS IRMÃS AFUNDADAS — a Segunda Terra de Venor (blueprint Fase 3 / RV10.5+)

> Plano de construção faseado, 100% ORIGINAL de Venor, derivado do cânone da Veia
> (o Quarto Veio / a Boca). Projetado por workflow multi-agente (15/06/2026).
> Atende ao pedido recorrente do maestro: **mundo denso, viagens longas, caça
> escalonada cidade→cidade**, no nível (ou acima) de um MMO clássico.

## A IDEIA (premissa)
A Segunda Terra não é um continente novo: é o **mesmo corpo-mundo de Venor que se
PARTIU quando a Lua se partiu**. A metade quebrada esfacelou-se numa fileira de
ilhas descendo o mar do sul como **vértebras de uma espinha quebrada**. Cada Irmã é
um pedaço de órgão vivendo sozinho (uma respira sal, outra lodo, outra febre).
Atravessar é descer essa espinha vértebra a vértebra; a cada salto a Veia sob as
águas pulsa mais quente e antiga, até a **ilha-coração** onde dorme o Arconte-irmão
e arde a Fenda-irmã. Atravessar é, por cânone, "sair do organismo de Venor e nadar
até outro corpo-mundo".

## DECISÃO DE ENGENHARIA (o que torna épico VIÁVEL)
As Irmãs são uma **ZONA CARREGADA** — igual a Esgoto/Catacumbas/Cripta/Cavernas do
Pico (padrão `subsoloAtual` em main3d). O motor trava o avatar em ±limiteMundo=900 e
o relevo morre em REGIAO.minZ=-490, então NÃO dá pra estender a superfície ao sul.
Dentro da zona o sistema de coordenadas recomeça LOCAL (areaAtiva=bounds próprio,
chaoY próprio, grupo.visible, iluminação própria, minimapa.esconde()). Os "saltos de
barco" do conceito viram **nós de transição dentro da zona** (re-skin de viajaBarca,
troca de cena — NÃO navegação real). Reusa o motor todo; não reescreve terreno.

## CHEGADA
Tocar a **Pedra da Boca** (0,-206) com os 5 veios sentidos já dá a **Gota da Veia**
(implementado na RV9.0). GATILHO técnico: o colisor do mar fundo
(cidade.js {minX:-230,maxX:230,minZ:-410,maxZ:-258}) deixa de barrar o sul quando
`inventario.temItem('Gota da Veia')` — "a corrente reconhece o herói como nervo
próprio". Na franja sul, ao lado da Pedra da Boca, ergue-se a **doca que ninguém
terminou** (cânone): estacas semiprontas, casco de barca abandonado, a **Vigília**
de guarda (impedir a partida) e **Mestre Calço**, um barqueiro-renegado que termina a
doca. Zarpar = `viajaBarca()` re-skinada (fade água-memória) → emerge na zona das
Irmãs. 1ª impressão: água preta e MORNA como sangue, a Lua Partida refletida só de um
lado, ilhas que não existem em nenhum mapa de Venor.

## A JORNADA (espinha escalada — ~520u de eixo local, fim-de-jogo 40-60min)
Ordem RÍGIDA de risco 2→6, nível 10→22 (vs. teto ~14 da Venor atual). Cada ilha é um
**habitat inteiro** (raio 60-120), bioma fechado costa-a-costa, sem trecho vazio.

1. **Ilha 1 — A Quebra-Mar (Vértebra do Sal)** [nv10-13, risco 2] — naufrágios da
   frota que "nunca volta"; **Náufragos do Sal** (reskin esqueleto incrustado de sal:
   memória cristalizada em vez de correr) + caranguejos/escorpiões/ratos das poças. O
   sino do porto inacabado de Venor badala com a maré (a Boca sempre conectou os dois
   lados). Tutorial do bioma marinho.
2. **Ilha 2 — O Manguezal Cego (Vértebra do Pulmão)** [nv12-15, risco 3] — mangue que
   sobe/desce com a maré como peito respirando; cobras/trolls-do-lodo/tecelãs. Um
   templo afundado com um chafariz idêntico ao de Venor ainda jorrando ("o poço e o
   mar bebem da mesma fonte" — a OUTRA boca da mesma fonte).
3. **Ilha 3 — A Ponte das Costelas (Vértebra Partida) — CLÍMAX DE TRAVESSIA** [nv13-16,
   risco 4] — costelas de osso saindo do mar com pontões de tábua, travessia A PÉ de
   ~200u (igual à Estrada da Vigia, que o motor já faz bem). Esqueletos/Náufragos
   (mais fortes à noite) + orcs com pedágio + lobos correndo os pontões. **Pedra-Veio
   nova** no maior osso (estende a rede de veios além da Boca). É o filé jogável.
4. **Ilha 4 — A Mata de Vidro (Vértebra Fria)** [nv15-18, risco 5] — floresta virada
   OBSIDIANA jovem (árvores de vidro que tilintam e cortam); tecelãs que fiam fios de
   obsidiana, ciclopes guardando veios, beholders que "veem a memória". Espelho do
   Veio da Obsidiana; primeira pista da Vigília-irmã.
5. **Ilha 5 — O Forno Afogado (Vértebra da Febre)** [nv17-20, risco 6] — cratera
   abaixo do nível do mar, lava+água num poço fervente (reuso dos CAMPOS de lava que
   queimam); o **ninho-irmão dos Três Ovos**; dragões jovens que reconhecem a Gota da
   Veia e hesitam. O **Dragão-Afogado** (variante: fogo apagado pela metade, cospe
   vapor/lodo fervente). Gancho de pet/montaria.
6. **Ilha 6 — A Soleira de Cinzas (Vértebra-Guarda)** [nv19-22, risco 6] — cinza e
   obsidiana, a muralha-irmã (equivalente a Noctaria); a **Vigília do outro mundo**
   (Drakari elite + guardas) defendendo o Arconte adormecido. Ponte de boss; aqui se
   decide o dilema.

## CIDADE-RECOMPENSA: VARANGUE, a Cidade-Coração das Águas Reunidas
Clone parametrizado de `criaThais` (muralha+portão+praça+templo+casario mesclado em
~12 draw calls), paleta obsidiana/pedra-sangue, em terraços descendo a uma **lagoa-
coração** (água escura e morna que pulsa — reuso do material emissivo do Santuário; a
geometria rebaixada é colocada à mão, como a boca de descida do trono — alturaColinas
só faz morro). Lojas: Forja da Obsidiana Viva (tempera a Lâmina da Lua Partida com a
metade que faltava), Casa das Marés, Mercado das Conchas. Habitada pelos descendentes
da frota que "nunca voltou" — VOLTARAM, mas pra cá. **Boss final por invocação**: o
Arconte-irmão, abraçando a SEGUNDA METADE da Lua. Drop-cume: a **Quilha da Lua** +
a **escolha irreversível**: reunir os mundos (apaga "Venor = ficar") ou selar a Boca
pra sempre. (O jogador herda a escolha, não um botão de apocalipse.)

## CRONOGRAMA DE BUILD (várias rodadas)
- **RV10.5** — A Boca se Abre: doca + Mestre Calço + Vigília + gate da Gota da Veia +
  zona das Irmãs (infra padrão subsolo) + **Ilha 1 (A Quebra-Mar)** jogável com
  criaturas/lore + saída de volta. Prova o sistema.
- **RV10.6** — Ilha 2 (Manguezal) + Ilha 3 (Ponte das Costelas, o clímax a pé + Pedra-
  Veio nova).
- **RV10.7** — Ilha 4 (Mata de Vidro) + Ilha 5 (Forno Afogado + Dragão-Afogado + ninho).
- **RV10.8** — Ilha 6 (Soleira) + **Varangue** (cidade) + Arconte-irmão + a escolha.
- Transições entre ilhas = nós tipo barca dentro da zona (re-skin de viajaBarca).

> NADA externo: tudo deriva do canon de Venor — Veia, Quarto Veio, Boca, Gota da Veia,
> Lua Partida, Drakari/Arconte, os Três Ovos, o chafariz/relógio — recombinado com
> princípios gerais de design (geografia com propósito, escalada, segredo de pavio
> longo, itens que ligam eras).

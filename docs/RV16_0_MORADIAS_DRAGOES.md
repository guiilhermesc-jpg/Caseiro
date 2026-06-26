# RV16.0 - Moradias & Dragoes

Data: 2026-06-22
Versao: RV16.0 (v111)

## Objetivo

Dar um salto de valor visual e sistemico: casas deixam de ser enfeite, o
casario ganha modelos maiores e mais nobres, e dragoes passam a ter mais
linhagens e progressao por ML treinado ao dormir.

## Entregue

1. **Arte oficial do patch**
   - nova key art em `public/patches/rv16-moradias-dragoes.png`;
   - usada no painel de patch, manifesto PWA e pagina de instalacao;
   - imagem otimizada de 2.96 MB para ~933 KB.

2. **Casario premium**
   - novo `criaMansao`;
   - novo `criaGuildHouse`;
   - mansoes adicionadas ao entorno de Venor e ao distrito de Venore;
   - Salao das Guildas trocado por guildhouse grande com estandartes.

3. **Imoveis alugaveis**
   - casas, mansoes e guildhouse com estado salvo;
   - placas mudam de cor quando alugadas;
   - guildhouse exige membro da Guilda de Venore.

4. **Beneficios de imovel**
   - deposito/cofre;
   - banco local;
   - lixeira para descartar materiais baratos;
   - dormir recupera vida/mana;
   - dormir com dragao ativo aumenta ML do dragao e concede XP.

5. **Dragoes novos**
   - Furia do Dia;
   - Furia da Noite;
   - Dragao do Pantano;
   - Dragao de Gelo;
   - Dragao da Veia;
   - todos entram como pets/domaveis raros com itens especificos.

6. **Mundo mais vivo**
   - bueiros/ralos emitem vapor animado;
   - grupos de pinheiro/arbusto balancam no vento;
   - smoke animation agora suporta deriva em X/Z.

7. **Offline atualizado**
   - service worker atualizado para `venor-rv16-offline-v1`;
   - nova imagem do patch entra no cache principal.

## Criterios de aceite

1. `npm run build` passa.
2. Selo mostra `RV16.0 (v111)`.
3. Painel de patch mostra `Moradias & Dragoes` e a nova arte.
4. Placas de imoveis abrem dialogo de aluguel.
5. Imovel alugado libera dormir/deposito/banco/lixeira conforme tipo.
6. Dormir com dragao ativo aumenta `ml` na ficha do dragao.
7. Dano do dragao considera ML, com limite de bonus.
8. Vapor dos bueiros e vento em vegetacao aparecem via `animaProps`.

## Proximos passos

1. Criar interiores especificos para mansao e guildhouse.
2. Implementar aluguel semanal real com vencimento e renovacao.
3. Adicionar armarios/itens decorativos persistentes por imovel.
4. Criar bosses 3D das novas linhagens de dragao.
5. Validar visual no preview WebGL antes de publicar.

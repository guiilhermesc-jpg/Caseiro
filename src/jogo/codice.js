// =============================================================
//  O CÓDICE DA VEIA (RV9.0 — "A Tessitura de Venor")
//  A cosmologia unificada do mundo: Venor não é cenário sobre rocha
//  morta, é um CORPO. Sob o solo corre a VEIA VIVA — pedra, lava, água
//  e obsidiana ligando tudo como nervos. Há um só verbo no fundo de
//  tudo: LEMBRAR. Água é memória que CORRE (os que ficam e reconstroem);
//  pedra é memória PRESA (reis avarentos, ossadas que não cicatrizam).
//
//  Tudo aqui é lore ORIGINAL de Venor, derivada só do que o jogo já
//  afirma (os 6 Tomos, as cidades, os dragões, a Lua Partida...).
//  Este módulo NÃO muda nenhum gatilho de jogo: apenas dá um PORQUÊ.
// =============================================================

export const TESSITURA = {
  premissa:
    'Venor é um corpo. Sob o solo corre a VEIA VIVA — um só sistema de pedra, '
    + 'lava, água e obsidiana que liga todos os lugares como nervos de um '
    + 'organismo que respira em eras. A terra LEMBRA do que viveu sobre ela e, '
    + 'quando pressionada, devolve essa memória como sintoma: por isso a água do '
    + 'chafariz "lembra de quem ficou", os reis não descansam, as fendas pulsam e '
    + 'os ossos se erguem. Água é memória que CORRE; pedra é memória PRESA. '
    + 'E é por isso que o lugar se chama VENOR — palavra antiga para "ficar".',
  eras: [
    {
      nome: 'I · A Era da Pedra Desperta',
      texto:
        'Antes de homens e dragões, a terra era só pedra acordada — matéria que '
        + 'sentia. A lava era seu sangue quente; a obsidiana, o sangue que esfriou '
        + 'guardando memória dentro. Os Drakari nascem aqui: não invasores, mas a '
        + 'própria pedra que aprendeu a andar e quis não morrer nunca — por isso '
        + '"trocaram sangue por obsidiana". O Arconte é o mais antigo deles, a '
        + 'primeira pedra a ter vontade; não foi vencido, foi ADORMECIDO quando a '
        + 'terra esfriou por fora pra deixar a carne mole brotar.',
      deixa:
        'A obsidiana ainda corre em tudo, em gradação: o pó frio com que Calder '
        + 'forja em Noctaria, os Cristais do Pico (lágrimas jovens, ainda mornas) e '
        + 'o Coração de Obsidiana do Arconte (o sangue-frio mais antigo e puro). A '
        + 'Fenda da Lua Partida pulsa vermelho porque ali a pedra ainda está QUENTE.',
    },
    {
      nome: 'II · A Era do Sangue Quente',
      texto:
        'Quando a terra esfriou por fora, ela estocou seu calor em criaturas: os '
        + 'dragões, sangue quente da pedra ganhando asas. Eram o CLIMA porque eram '
        + 'literalmente uma febre do mundo. Vorag, o Primeiro, foi onde o calor mais '
        + 'se concentrou — não um bicho, um ÓRGÃO do mundo. Sua queda "ensinou aos '
        + 'homens a palavra possível": a primeira vez que a carne feriu a terra viva '
        + 'e sobreviveu. Da ferida nasceram as ordens de caçadores e as guildas.',
      deixa:
        'O Pico é um FORNO que nunca apaga: a mesma lava aquece as Cavernas por '
        + 'baixo e choca os três ovos por cima — a terra incubando seu próprio sangue. '
        + 'A Ossada de Vorag não é só osso: é uma cicatriz onde a terra perdeu um órgão '
        + 'e nunca fechou — por isso pode "se erguer".',
    },
    {
      nome: 'III · A Era do Afogamento',
      texto:
        'A carne ergueu sua primeira grande cidade, a Venore Antiga, sobre um ponto '
        + 'onde a Veia corre raso e a água-da-terra sobe. Ossivaldo II, o Último Rei, '
        + '"taxou até a chuva" — quis POSSUIR a água que é da terra e ACUMULAR num '
        + 'cofre a memória que devia correr. Quando o pântano engoliu a cidade, foi a '
        + 'terra reabsorvendo o que a desafiou. O rei não soltou o cofre, e a terra o '
        + 'MANTEVE: nem morto, nem vivo. Quem prende o que devia correr não descansa.',
      deixa:
        'Há três Venor(e)s empilhadas no mesmo nervo: o Vilarejo vivo, a Venore Antiga '
        + 'afogada (Catacumbas e Cripta) e a Venore Mercante por cima do brejo. A mesma '
        + 'lei explica os esqueletos noturnos e por que Hela "paga pela paz deles": '
        + 'devolver um morto à terra é deixar a memória voltar a correr.',
    },
    {
      nome: 'IV · A Era da Teimosia (agora)',
      texto:
        'É o presente. A carne aprendeu a viver SOBRE o corpo da terra sem ser '
        + 'reabsorvida: quatro famílias teimosas ficaram onde os dragões reinavam, e '
        + 'os mercadores fizeram da "água que nos venceu" uma estrada. E aqui mora a '
        + 'ironia que nem os heróis veem: cumprir os Três Sinais pra entrar nas guildas '
        + 'é exatamente o que faz a Ossada de Vorag andar de novo. O caçador é cúmplice '
        + 'sem saber.',
      deixa:
        'O chafariz "nunca secou" porque fincado direto num veio de água-da-terra: a '
        + 'Veia registrou as quatro famílias e devolve a memória como água perpétua. O '
        + 'relógio do Depósito "atrasa cinco minutos" porque o tempo dos vivos nunca '
        + 'alcança o tempo lento da Venore afogada, que ainda roda cinco minutos atrás, '
        + 'sob seus pés.',
    },
  ],
  // os 5 VEIOS são desbloqueados ao tocar as Pedras-Veio (ver PEDRAS_VEIO)
  veios: [
    {
      id: 'lava',
      nome: 'O Veio-Mãe da Lava',
      liga: 'Cavernas do Pico ⟷ Ninho dos Três Ovos ⟷ Covil do Norte',
      cor: 0xff6a2a,
      texto:
        'Um só conduto de lava sobe pelo interior da Montanha do Dragão: aquece a '
        + 'masmorra por baixo, choca os ovos por cima e alimenta o covil ao norte. Não '
        + 'é coincidência geográfica — é a artéria mais quente da Veia, onde o sangue '
        + 'da terra corre mais perto da superfície. Por isso os dragões "voltaram a '
        + 'dominar" o leste: é onde a terra pulsa forte de novo. "Três ovos ao calor '
        + 'da lava, pacientes como só a pedra" descreve este veio ao pé da letra.',
    },
    {
      id: 'afogado',
      nome: 'O Veio Afogado',
      liga: 'Chafariz do Vilarejo ⟷ Cais ⟷ Canal de Venore ⟷ Venore Antiga afundada',
      cor: 0x3fb0c8,
      texto:
        'Onde a Veia corre raso, a água-da-terra sobe sozinha. É o mesmo lençol que '
        + 'mantém o chafariz cheio no centro, que alimenta o canal que impede Venore de '
        + 'afundar na lama, e que afogou a Venore Antiga. A Estrada do Pântano segue '
        + 'esse nervo molhado: viajar nela é caminhar por cima dos próprios mortos, de '
        + 'volta à cidade-túmulo. As barcas são seguras porque os barqueiros seguem as '
        + 'correntes que a Veia empurra na superfície — não sorte, anatomia.',
    },
    {
      id: 'obsidiana',
      nome: 'O Veio da Obsidiana',
      liga: 'Ermo das Cinzas ⟷ Noctaria (forja de Calder) ⟷ Fenda da Lua Partida',
      cor: 0x9a6aff,
      texto:
        'A oeste, a Veia está velha e esfriada: o sangue da terra ali já endureceu em '
        + 'obsidiana. A Fenda é a ferida aberta onde o sangue ainda está vermelho-quente '
        + 'sob a crosta fria; o Ermo virou cinza porque é tecido morto ao redor de uma '
        + 'ferida; Noctaria é a muralha que a carne ergueu contra ela. Caminhar a oeste '
        + 'é descer pelo braço da Veia que vai esfriando — rumo ao passado mais antigo e '
        + 'mais frio do corpo do mundo. Por isso a dificuldade cresce a cada passo.',
    },
    {
      id: 'cicatriz',
      nome: 'O Veio da Cicatriz',
      liga: 'Ossada de Vorag ⟷ Trono de Ossivaldo ⟷ Ruínas Antigas',
      cor: 0xe8d68a,
      texto:
        'Toda morte importante deixa uma cicatriz que a terra se recusa a fechar. A '
        + 'Ossada de Vorag (leste) e o trono de Ossivaldo (oeste-centro) são dois pontos '
        + 'de memória-presa em nervos opostos do mesmo corpo. A profecia dos Três Sinais '
        + 'é a terra reconhecendo suas próprias cicatrizes reabrindo ao mesmo tempo: '
        + 'coroa que brilha, seda na floresta, filhote ao seu lado — e os nervos pulsam '
        + 'juntos com força pra que a memória de Vorag tenha como "andar".',
    },
    {
      id: 'osso',
      nome: 'Os Veios de Osso e Carne',
      liga: 'Ponte de Pedra ⟷ Passo do Ciclope (e toda estrada)',
      cor: 0x9ab07a,
      texto:
        'Estradas seguem onde a terra é OSSO (firme); o perigo mora onde ela é CARNE '
        + '(mole, viva, faminta). A Ponte de Pedra corta a estrada na metade porque ali '
        + 'um veio rochoso aflora e dá travessia firme sobre terreno mole — e os lobos a '
        + 'habitam porque os animais sentem o nervo aflorado e o usam como corredor. Esta '
        + 'é a razão última de "monstro bom tem casa, horário, loot, risco e MOTIVO": '
        + 'tudo tem casa porque tudo é órgão de um só corpo que respira.',
    },
  ],
  // segredo-semente: revelado só quando os 5 veios forem sentidos + a Pedra da Boca
  misterios: [
    {
      id: 'quartoVeio',
      nome: 'O Quarto Veio — A Boca da Veia',
      bloqueado:
        'Há algo ao sul que os veios não explicam. Sinta as cinco Pedras-Veio e procure '
        + 'a última, fincada na areia onde o mar começa.',
      texto:
        'O poço do centro e o mar do sul têm o MESMO gosto mineral — gente velha diz que '
        + '"o poço e o mar bebem da mesma fonte". O mar fundo é intransponível não por ser '
        + 'grande, mas porque é o único lugar onde a Veia Viva SAI do corpo da terra e '
        + 'mergulha. Ninguém volta de lá porque você sai do organismo.\n\n'
        + 'Os três ovos que ainda não chocaram vão chamar não para o céu, mas para o '
        + 'FUNDO. "Temei o dia em que ele POUSAR": quando o fogo do céu pousar no mar, '
        + 'a Boca se abre — e além dela há uma SEGUNDA terra viva, outro corpo-mundo com '
        + 'seus próprios dragões, seu próprio Arconte, sua própria Fenda. A Lua se partiu '
        + 'quando os dois mundos se separaram, e cada metade guarda um pedaço da mesma '
        + 'memória. O porto que ninguém terminou de construir será a primeira doca.',
      profecia:
        '🌊 Você herdou uma escolha, não um botão. Reunir o que está partido não conserta '
        + 'o mundo — apaga a água-memória que faz "ninguém partir de Venor". A Vigília '
        + 'guarda a Fenda não pra mantê-la fechada, mas pra impedir que alguém REÚNA o '
        + 'que está partido. (A história continua além-mar.)',
    },
  ],
};

// PEDRAS-VEIO físicas: monólitos gravados nos nós geográficos de cada veio.
// Tocar uma "sente" o veio e o desbloqueia no Códice. y opcional (assenta no
// relevo quando ausente). A pedra 'boca' é a chave do segredo-semente.
export const PEDRAS_VEIO = [
  { id: 'lava', nome: 'Pedra do Forno', glifo: '🜂', x: 64, z: 262, cor: 0xff6a2a,
    fragmento: 'A pedra está morna ao toque, mesmo na sombra. Sob ela, o calor da terra sobe num só fio do fundo das Cavernas até o ninho do Pico.' },
  { id: 'afogado', nome: 'Pedra da Fonte', glifo: '🜄', x: -11, z: 3, cor: 0x3fb0c8,
    fragmento: 'A pedra transpira água que nunca seca, do mesmo lençol do chafariz. Esse nervo molhado corre até o canal de Venore e à cidade afogada sob ele.' },
  { id: 'obsidiana', nome: 'Pedra de Cinzas', glifo: '🜃', x: -715, z: -30, cor: 0x9a6aff,
    fragmento: 'A pedra é fria como obsidiana e range baixinho. Aqui a Veia já esfriou — o braço que desce de Noctaria até a Fenda é o passado mais antigo do mundo.' },
  { id: 'cicatriz', nome: 'Pedra da Cicatriz', glifo: '🜁', x: 244, z: 126, cor: 0xe8d68a,
    fragmento: 'A pedra é cor de osso e está rachada de dentro. A terra perdeu um órgão aqui — Vorag — e a ferida liga, por baixo, ao trono que não descansa a oeste.' },
  { id: 'osso', nome: 'Pedra da Travessia', glifo: '🜔', x: 171, z: -9, cor: 0x9ab07a,
    fragmento: 'A pedra é dura e seca: aqui o osso da terra aflora e dá chão firme sobre o brejo mole. As estradas seguem esse osso; o perigo mora onde a terra é carne.' },
  { id: 'boca', nome: 'Pedra da Boca', glifo: '🝆', x: 0, z: -206, cor: 0x2e6fa8, segredo: true,
    fragmento: 'A pedra prova o mesmo sal do chafariz, a léguas dali. Onde o mar começa, a Veia sai do corpo da terra e mergulha. Há mundo do outro lado.' },
];

export function criaCodice() {
  const sentidos = new Set();   // ids de veios já "sentidos"
  let segredoRevelado = false;

  // botão flutuante (estilo dos outros HUDs premium do jogo)
  const botao = document.createElement('button');
  botao.textContent = '📖 CÓDICE';
  botao.title = 'O Códice da Veia — a história profunda de Venor';
  botao.style.cssText = 'position:fixed;right:14px;bottom:200px;z-index:80;display:none;'
    + 'border:1px solid rgba(159,118,255,.5);background:linear-gradient(180deg,rgba(34,26,52,.96),rgba(12,10,20,.96));'
    + 'color:#e6dcff;border-radius:10px;padding:10px 12px;font:800 12px Georgia,serif;letter-spacing:.8px;'
    + 'box-shadow:0 8px 24px rgba(0,0,0,.45);cursor:pointer;touch-action:none;';
  document.body.appendChild(botao);

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:124;display:none;align-items:center;justify-content:center;'
    + 'background:rgba(3,5,9,.8);font-family:Arial,sans-serif;color:#ece4d6;padding:16px;';
  const card = document.createElement('div');
  card.style.cssText = 'width:min(1040px,95vw);max-height:92vh;overflow:auto;border:1px solid rgba(159,118,255,.3);'
    + 'background:linear-gradient(180deg,rgba(20,17,28,.98),rgba(10,12,16,.99));border-radius:14px;'
    + 'box-shadow:0 18px 70px rgba(0,0,0,.7);';
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  function eraHtml(e) {
    return `<article style="border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:10px;padding:14px;">
      <div style="font:800 16px Georgia,serif;color:#e8d9a0;margin-bottom:6px;">${e.nome}</div>
      <div style="color:#cdd6e2;font-size:13px;line-height:1.6;">${e.texto}</div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.07);color:#9fc8b8;font-size:12.5px;line-height:1.55;"><b style="color:#8fd6b0;">No mundo hoje:</b> ${e.deixa}</div>
    </article>`;
  }
  function veioHtml(v) {
    const sentido = sentidos.has(v.id);
    const hx = '#' + v.cor.toString(16).padStart(6, '0');
    if (!sentido) {
      return `<article style="border:1px dashed rgba(255,255,255,.14);background:rgba(0,0,0,.2);border-radius:10px;padding:13px;opacity:.7;">
        <div style="font:800 14px Georgia,serif;color:#8a93a3;">✦ Veio não sentido</div>
        <div style="color:#79828f;font-size:12.5px;line-height:1.5;margin-top:5px;">Encontre a Pedra-Veio correspondente no mundo e use AÇÃO nela pra sentir esta linha da Veia.</div>
      </article>`;
    }
    return `<article style="border:1px solid ${hx}55;background:linear-gradient(180deg,${hx}14,rgba(0,0,0,.12));border-radius:10px;padding:13px;">
      <div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:${hx};box-shadow:0 0 10px ${hx};"></span>
        <div style="font:800 15px Georgia,serif;color:#f0e6c8;">${v.nome}</div></div>
      <div style="font-size:11.5px;color:${hx};margin:3px 0 7px;letter-spacing:.4px;">${v.liga}</div>
      <div style="color:#cdd6e2;font-size:13px;line-height:1.6;">${v.texto}</div>
    </article>`;
  }
  function misterioHtml(m) {
    if (!segredoRevelado) {
      return `<article style="border:1px dashed rgba(159,118,255,.3);background:rgba(20,10,30,.4);border-radius:10px;padding:14px;">
        <div style="font:800 15px Georgia,serif;color:#b59bff;">🔒 ${m.nome}</div>
        <div style="color:#9a8fb8;font-size:12.5px;line-height:1.6;margin-top:6px;">${m.bloqueado}</div>
      </article>`;
    }
    return `<article style="border:1px solid rgba(159,118,255,.5);background:linear-gradient(180deg,rgba(40,24,64,.5),rgba(8,6,14,.6));border-radius:10px;padding:15px;">
      <div style="font:800 17px Georgia,serif;color:#cdb6ff;text-shadow:0 0 18px rgba(159,118,255,.5);">${m.nome}</div>
      <div style="color:#dcd2ea;font-size:13px;line-height:1.65;margin-top:8px;white-space:pre-line;">${m.texto}</div>
      <div style="margin-top:10px;padding:10px 12px;border:1px solid rgba(159,118,255,.3);border-radius:8px;background:rgba(159,118,255,.08);color:#c8e6ff;font-size:12.5px;line-height:1.6;white-space:pre-line;">${m.profecia}</div>
    </article>`;
  }
  function render() {
    const total = TESSITURA.veios.length;
    card.innerHTML = `
      <div style="padding:22px 24px 16px;border-bottom:1px solid rgba(255,255,255,.08);">
        <div style="font:700 12px Georgia,serif;letter-spacing:5px;color:#b59bff;">A TESSITURA DE VENOR</div>
        <div style="font:900 36px Georgia,serif;line-height:1;color:#fff;text-shadow:0 3px 18px #000;">O Códice da Veia</div>
        <p style="margin:12px 0 0;color:#c2bdd0;line-height:1.7;max-width:840px;font-size:14px;">${TESSITURA.premissa}</p>
        <div style="margin-top:10px;font-size:12px;color:#8f86a3;">Veios sentidos: <b style="color:#b59bff;">${sentidos.size}/${total}</b>${segredoRevelado ? ' · <b style="color:#8fd6b0;">Quarto Veio revelado</b>' : ''}</div>
      </div>
      <div style="padding:18px 24px;display:grid;grid-template-columns:minmax(0,1fr);gap:20px;">
        <section>
          <h2 style="margin:0 0 12px;font:800 19px Georgia,serif;color:#e8d9a0;">As Quatro Eras</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">${TESSITURA.eras.map(eraHtml).join('')}</div>
        </section>
        <section>
          <h2 style="margin:0 0 12px;font:800 19px Georgia,serif;color:#e8d9a0;">Os Veios — as linhas que ligam o mundo</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;">${TESSITURA.veios.map(veioHtml).join('')}</div>
        </section>
        <section>
          <h2 style="margin:0 0 12px;font:800 19px Georgia,serif;color:#b59bff;">Mistérios</h2>
          <div style="display:flex;flex-direction:column;gap:10px;">${TESSITURA.misterios.map(misterioHtml).join('')}</div>
        </section>
      </div>
      <div style="padding:0 24px 22px;display:flex;justify-content:flex-end;">
        <button id="codice-fechar" style="border:0;border-radius:10px;background:#3a2f5a;color:#fff;font-weight:800;padding:11px 20px;cursor:pointer;">Fechar o Códice</button>
      </div>`;
    card.querySelector('#codice-fechar').addEventListener('pointerdown', fecha);
  }

  function abre() { render(); overlay.style.display = 'flex'; }
  function fecha() { overlay.style.display = 'none'; }
  function mostra() { botao.style.display = 'block'; }
  function esconde() { botao.style.display = 'none'; fecha(); }

  botao.addEventListener('pointerdown', (e) => { e.stopPropagation(); abre(); });
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) fecha(); });

  return {
    abre, fecha, mostra, esconde, el: botao,
    marcaVeio(id) { const novo = !sentidos.has(id); sentidos.add(id); return novo; },
    jaSentiu(id) { return sentidos.has(id); },
    // os 5 veios PRINCIPAIS (sem contar a 'boca', que é a chave do segredo)
    todosPrincipaisSentidos() { return TESSITURA.veios.every((v) => sentidos.has(v.id)); },
    revelaSegredo() { const novo = !segredoRevelado; segredoRevelado = true; return novo; },
    segredoJaRevelado() { return segredoRevelado; },
    estado() { return { veios: [...sentidos], segredo: segredoRevelado }; },
    carrega(s) {
      if (!s) return;
      (s.veios || []).forEach((v) => sentidos.add(v));
      segredoRevelado = !!s.segredo;
    },
  };
}

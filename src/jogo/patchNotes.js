import { mascateHoje } from './calendario.js';

const PATCH_ID = 'rv17-9-preparacao-rv18';

const PATCHES = [
  {
    id: 'rv17-6',
    titulo: 'Contrato Visual',
    img: '/patches/rv17-6-contrato-visual.png',
    texto: 'Venor noturna virou meta oficial de paridade: mural, loja, lampioes, fonte, rua molhada, dragoes e vida urbana precisam existir no mundo.',
  },
  {
    id: 'rv17-7',
    titulo: 'Bases Vivas',
    img: '/patches/rv17-7-bases-vivas.png',
    texto: 'Mansoes e guildhouses agora sao tratadas como bases: depot, banco, lixo, cama, contratos e descanso magico do dragao.',
  },
  {
    id: 'rv17-8',
    titulo: 'Hunts com Reacao',
    img: '/patches/rv17-8-hunts-reacao.png',
    texto: 'Hunts passam a exigir leitura: tamanho real dos bichos, impacto, telegraph no chao, loot e captura futura precisam ser claros.',
  },
  {
    id: 'rv17-9',
    titulo: 'Preparacao RV18',
    img: '/patches/rv17-9-preparacao-rv18.png',
    texto: 'O proximo ciclo fica marcado no mapa com rotas altas, portal, caravanas, quadro de contratos e uma pedra interativa do Pacto 18.',
  },
];

function css(el, value) {
  el.style.cssText = value;
  return el;
}

export function criaPatchNotes() {
  const estadoMascate = mascateHoje();

  const badge = css(document.createElement('button'),
    'position:fixed;right:14px;bottom:92px;z-index:80;border:1px solid rgba(232,217,160,.55);'
    + 'background:linear-gradient(180deg,rgba(51,38,20,.94),rgba(20,16,12,.94));color:#f4e9c8;'
    + 'border-radius:10px;padding:10px 12px;font:700 12px Georgia,serif;letter-spacing:.7px;'
    + 'box-shadow:0 8px 24px rgba(0,0,0,.45);cursor:pointer;touch-action:none;');
  badge.textContent = 'PATCH RV17.9';
  document.body.appendChild(badge);

  const offline = css(document.createElement('div'),
    'position:fixed;left:14px;bottom:92px;z-index:80;border:1px solid rgba(140,170,120,.4);'
    + 'background:rgba(12,18,14,.82);color:#cde8bf;border-radius:10px;padding:8px 10px;'
    + 'font:700 11px Arial,sans-serif;text-shadow:0 1px 2px #000;pointer-events:none;');
  document.body.appendChild(offline);
  const renderOffline = () => { offline.textContent = navigator.onLine ? 'ONLINE / OFFLINE PRONTO' : 'MODO OFFLINE'; };
  window.addEventListener('online', renderOffline);
  window.addEventListener('offline', renderOffline);
  renderOffline();

  const overlay = css(document.createElement('div'),
    'position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;'
    + 'background:rgba(4,8,12,.74);font-family:Arial,sans-serif;color:#f4ead2;padding:18px;');
  const card = css(document.createElement('div'),
    'width:min(1180px,94vw);max-height:90vh;overflow:auto;border:1px solid rgba(232,217,160,.38);'
    + 'background:linear-gradient(180deg,rgba(25,22,17,.98),rgba(12,15,18,.99));border-radius:14px;'
    + 'box-shadow:0 18px 70px rgba(0,0,0,.68);');

  card.innerHTML = `
    <div style="height:380px;background:
      linear-gradient(90deg,rgba(5,8,10,.96),rgba(5,8,10,.44),rgba(5,8,10,.08)),
      url('/patches/rv17-9-preparacao-rv18.png') center/cover no-repeat;
      border-radius:14px 14px 0 0;position:relative;">
      <div style="position:absolute;left:28px;bottom:24px;max-width:740px;">
        <div style="font:700 12px Georgia,serif;letter-spacing:4px;color:#e8d9a0;">PATCH RV17.6 - RV17.9</div>
        <div style="font:800 42px Georgia,serif;line-height:.95;text-shadow:0 4px 18px #000;">Contrato Visual e Ponte RV18</div>
        <div style="margin-top:10px;color:#d7e0ec;font-size:14px;line-height:1.55;text-shadow:0 2px 10px #000;">
          Toda arte oficial agora nasce com regra: o jogo precisa ter equivalencia real. Esta rodada fecha
          a identidade premium da RV17 e prepara o grande ciclo instalado/offline do Patch 18.
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.08fr .92fr;gap:18px;padding:22px;">
      <section>
        <h2 style="margin:0 0 10px;font:700 20px Georgia,serif;color:#f4e9c8;">O que entrou na direcao do jogo</h2>
        <p style="margin:0 0 14px;color:#b7c3cf;line-height:1.65;">
          RV17.9 nao e so uma vitrine. Ela define o padrao para cidade, interiores, hunts, contratos,
          moradias, dragao companheiro e preparacao de mundo grande. O Patch 18 so pode usar arte como
          promessa quando os sistemas estiverem no mapa, na interface ou na documentacao canonica.
        </p>
        <ul style="margin:0;padding-left:18px;color:#d6dfd0;line-height:1.8;">
          <li><b>RV17.6:</b> contrato visual premium para impedir arte oficial que nao represente o jogo.</li>
          <li><b>RV17.7:</b> bases, mansoes e guildhouses como eixo de economia, descanso e utilidade.</li>
          <li><b>RV17.8:</b> hunts passam a ser avaliadas por leitura, reacao, escala e recompensa.</li>
          <li><b>RV17.9:</b> pedra do Pacto 18 entra em Venor e registra a ponte para expansao instalada.</li>
          <li><b>Patch 18:</b> imagem de expansao fica marcada como previa, nao como recurso entregue.</li>
        </ul>
      </section>
      <aside style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;">
        <h3 style="margin:0 0 8px;font:700 16px Georgia,serif;color:#e8d9a0;">Hoje em Venor</h3>
        <p style="margin:0 0 14px;color:${estadoMascate.aberto ? '#bff0a8' : '#f0c08a'};line-height:1.55;">
          ${estadoMascate.texto}
        </p>
        <div style="font-size:12px;color:#91a0ad;line-height:1.55;">
          Mascate: Terca, Quinta e Sabado.<br>
          Rotas: botao <b>ROTAS</b>. Bestiario: botao do dragao.<br>
          Procure a pedra <b>Pacto 18</b> perto do primeiro anel de Venor.<br>
          <a href="/baixar.html" style="color:#bff0a8;font-weight:800;">Como instalar e jogar offline</a>
        </div>
      </aside>
    </div>
    <div style="padding:0 22px 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
      ${PATCHES.map((p) => `
        <article style="border:1px solid rgba(232,217,160,.18);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.045);">
          <div style="height:124px;background:url('${p.img}') center/cover no-repeat;"></div>
          <div style="padding:12px;">
            <div style="font:800 14px Georgia,serif;color:#f4e9c8;margin-bottom:5px;">${p.id.toUpperCase()} - ${p.titulo}</div>
            <div style="font-size:12px;color:#b7c3cf;line-height:1.45;">${p.texto}</div>
          </div>
        </article>`).join('')}
    </div>
    <div style="padding:0 22px 18px;">
      <div style="border:1px solid rgba(160,140,255,.24);background:rgba(80,60,140,.18);border-radius:12px;padding:14px;color:#cfd2ff;line-height:1.55;font-size:13px;">
        <b>Previa RV18:</b> a arte <b>Grande Pacto</b> mostra voo, ilhas altas e calabouco gigante como alvo do proximo ciclo.
        Ela esta registrada como preparacao, nao como promessa entregue nesta versao.
      </div>
    </div>
    <div style="padding:0 22px 22px;display:flex;gap:10px;justify-content:flex-end;">
      <button id="patch-fechar" style="border:0;border-radius:10px;background:#3a7a4a;color:#fff;font-weight:800;padding:12px 18px;cursor:pointer;">ENTRAR</button>
    </div>`;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const abre = () => { overlay.style.display = 'flex'; };
  const fecha = () => { overlay.style.display = 'none'; localStorage.setItem(PATCH_ID, 'seen'); };
  badge.onclick = abre;
  card.querySelector('#patch-fechar').onclick = fecha;
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) fecha(); });

  if (localStorage.getItem(PATCH_ID) !== 'seen') setTimeout(abre, 400);
  return { abre, fecha };
}

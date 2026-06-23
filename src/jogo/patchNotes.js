import { mascateHoje } from './calendario.js';

const PATCH_ID = 'rv17-5-moradias-economia';

const PATCHES = [
  {
    id: 'rv17-2',
    titulo: 'Bichos Premium',
    img: '/patches/rv17-2-bichos-premium.png',
    texto: 'Sentinela, Golem, Wyvern e Guardiao ganharam silhueta mais forte, novos drops e leitura de ameaca.',
  },
  {
    id: 'rv17-3',
    titulo: 'Interiores Reais',
    img: '/patches/rv17-3-interiores-realidade.png',
    texto: 'Mansoes e guildhouses agora parecem bases: contratos, cartografia, provisoes, depot, banco e descanso.',
  },
  {
    id: 'rv17-4',
    titulo: 'Rotas do Continente',
    img: '/patches/rv17-4-rotas-continente.png',
    texto: 'O quadro de jornadas recebeu contratos de viagem para organizar carrocas, barcas e subida para Aurelia.',
  },
  {
    id: 'rv17-5',
    titulo: 'Moradias e Economia',
    img: '/patches/rv17-5-moradias-economia.png',
    texto: 'Imoveis agora tem aluguel com validade, renovacao e beneficios suspensos quando o contrato atrasa.',
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
  badge.textContent = 'PATCH RV17.5';
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
    'width:min(1120px,94vw);max-height:90vh;overflow:auto;border:1px solid rgba(232,217,160,.38);'
    + 'background:linear-gradient(180deg,rgba(25,22,17,.98),rgba(12,15,18,.99));border-radius:14px;'
    + 'box-shadow:0 18px 70px rgba(0,0,0,.68);');

  card.innerHTML = `
    <div style="height:350px;background:
      linear-gradient(90deg,rgba(5,8,10,.94),rgba(5,8,10,.42),rgba(5,8,10,.06)),
      url('/patches/rv17-5-moradias-economia.png') center/cover no-repeat;
      border-radius:14px 14px 0 0;position:relative;">
      <div style="position:absolute;left:28px;bottom:24px;max-width:700px;">
        <div style="font:700 12px Georgia,serif;letter-spacing:4px;color:#e8d9a0;">PATCH RV17.5</div>
        <div style="font:800 42px Georgia,serif;line-height:.95;text-shadow:0 4px 18px #000;">Grande Onda Expandida</div>
        <div style="margin-top:10px;color:#d7e0ec;font-size:14px;line-height:1.55;text-shadow:0 2px 10px #000;">
          Quatro blocos em sequencia: criaturas com mais presenca, interiores com funcao,
          rotas continentais e moradias com aluguel real.
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.08fr .92fr;gap:18px;padding:22px;">
      <section>
        <h2 style="margin:0 0 10px;font:700 20px Georgia,serif;color:#f4e9c8;">O que mudou</h2>
        <p style="margin:0 0 14px;color:#b7c3cf;line-height:1.65;">
          Este patch e uma rodada de densidade: cada imagem oficial representa um sistema que existe
          dentro do jogo. O objetivo e sair da sensacao infantil e aproximar Venor de um RPG premium,
          offline primeiro e online opcional depois.
        </p>
        <ul style="margin:0;padding-left:18px;color:#d6dfd0;line-height:1.8;">
          <li><b>RV17.2:</b> hunts celestes ganharam novos drops, ameacas mais legiveis e bestiario atualizado.</li>
          <li><b>RV17.3:</b> mansoes e guildhouses receberam mesa de contratos, cartografia e despensa interativa.</li>
          <li><b>RV17.4:</b> quadro de jornadas agora mostra contratos de viagem, custo, risco e funcao.</li>
          <li><b>RV17.5:</b> imoveis tem aluguel com validade, renovacao e servicos suspensos quando atrasam.</li>
          <li><b>Offline:</b> as novas artes entram no cache do app instalavel.</li>
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
          <a href="/baixar.html" style="color:#bff0a8;font-weight:800;">Como instalar e jogar offline</a>
        </div>
      </aside>
    </div>
    <div style="padding:0 22px 20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">
      ${PATCHES.map((p) => `
        <article style="border:1px solid rgba(232,217,160,.18);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.045);">
          <div style="height:118px;background:url('${p.img}') center/cover no-repeat;"></div>
          <div style="padding:12px;">
            <div style="font:800 14px Georgia,serif;color:#f4e9c8;margin-bottom:5px;">${p.id.toUpperCase()} - ${p.titulo}</div>
            <div style="font-size:12px;color:#b7c3cf;line-height:1.45;">${p.texto}</div>
          </div>
        </article>`).join('')}
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

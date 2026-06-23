import { mascateHoje } from './calendario.js';

const PATCH_ID = 'rv16-6-praca-jogavel';

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
  badge.textContent = 'PATCH RV16.6';
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
    + 'background:rgba(4,8,12,.72);font-family:Arial,sans-serif;color:#f4ead2;padding:18px;');
  const card = css(document.createElement('div'),
    'width:min(980px,94vw);max-height:88vh;overflow:auto;border:1px solid rgba(232,217,160,.38);'
    + 'background:linear-gradient(180deg,rgba(25,22,17,.97),rgba(12,15,18,.98));border-radius:14px;'
    + 'box-shadow:0 18px 70px rgba(0,0,0,.68);');
  card.innerHTML = `
    <div style="height:300px;background:
      linear-gradient(90deg,rgba(5,8,10,.9),rgba(5,8,10,.38),rgba(5,8,10,.08)),
      url('/patches/rv16-6-praca-jogavel.png') center/cover no-repeat;
      border-radius:14px 14px 0 0;position:relative;">
      <div style="position:absolute;left:28px;bottom:24px;max-width:590px;">
        <div style="font:700 12px Georgia,serif;letter-spacing:4px;color:#e8d9a0;">PATCH RV16.6</div>
        <div style="font:800 40px Georgia,serif;line-height:.95;text-shadow:0 4px 18px #000;">Praca Jogavel</div>
        <div style="margin-top:10px;color:#c8d3df;font-size:14px;line-height:1.55;">
          A arte aprovada virou regra de mundo: a praca onde o jogador nasce agora recebe escala,
          fachadas maiores, mesas mercantes, vasos, escadarias, estandartes e uma fonte que organiza a cena.
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.1fr .9fr;gap:18px;padding:22px;">
      <section>
        <h2 style="margin:0 0 10px;font:700 20px Georgia,serif;color:#f4e9c8;">Direcao do patch</h2>
        <p style="margin:0 0 14px;color:#b7c3cf;line-height:1.65;">
          Este update aproxima a primeira tela jogavel da imagem alvo: menos vazio, mais cidade, mais proporcao
          e mais leitura de RPG antigo com materialidade atual. A partir daqui, cada arte de patch precisa apontar
          para algo que realmente existe no jogo.
        </p>
        <ul style="margin:0;padding-left:18px;color:#d6dfd0;line-height:1.8;">
          <li><b>Praca mais rica:</b> escadarias, vasos nobres, mesas mercantes, bandeiras e props nas bordas.</li>
          <li><b>Casas maiores:</b> o casario inicial ganhou escala de vila medieval, com fachadas mais altas.</li>
          <li><b>Fachadas melhores:</b> enxaimel com vigas diagonais e vegetacao subindo nas paredes.</li>
          <li><b>Venore reforcada:</b> o Grande Mercado tambem recebeu escadarias, vasos, bancas e estandartes.</li>
          <li><b>Offline-first:</b> a arte aprovada entra no cache do app instalavel para jogar solo sem internet.</li>
        </ul>
      </section>
      <aside style="background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;">
        <h3 style="margin:0 0 8px;font:700 16px Georgia,serif;color:#e8d9a0;">Hoje em Venor</h3>
        <p style="margin:0 0 14px;color:${estadoMascate.aberto ? '#bff0a8' : '#f0c08a'};line-height:1.55;">
          ${estadoMascate.texto}
        </p>
        <div style="font-size:12px;color:#91a0ad;line-height:1.55;">
          Mascate: Terca, Quinta e Sabado.<br>
          Abra a ficha do heroi com a tecla <b>C</b> e o Bestiario pelo painel do jogo.<br>
          <a href="/baixar.html" style="color:#bff0a8;font-weight:800;">Como instalar e jogar offline</a>
        </div>
      </aside>
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

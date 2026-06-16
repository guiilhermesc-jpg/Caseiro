/* Bússola — app (vanilla JS, sem dependências, offline-first).
   Abas: Painel · Book (lê docs/*.md) · Histórico · Checklist · Carteira.
   Tudo só-leitura e educacional. Nunca pede seed/chave. Nunca move dinheiro. */

/* =================== Markdown mínimo =================== */
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])((https?:\/\/)[^\s)]+)(?=$|[\s).,])/g,
      '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
}
function cells(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map(c => c.trim());
}
function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let out = '', i = 0;
  while (i < lines.length) {
    let line = lines[i];
    if (/^```/.test(line)) {
      let buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; out += `<pre><code>${esc(buf.join('\n'))}</code></pre>`; continue;
    }
    if (/\|/.test(line) && i + 1 < lines.length &&
        /^\s*\|?[\s:-]*-[-\s:|]*\|?\s*$/.test(lines[i + 1])) {
      const head = cells(line); i += 2; let rows = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== '') { rows.push(cells(lines[i])); i++; }
      let h = '<div class="tablewrap"><table><thead><tr>';
      head.forEach(c => h += `<th>${inline(c)}</th>`); h += '</tr></thead><tbody>';
      rows.forEach(r => { h += '<tr>'; head.forEach((_, k) => h += `<td>${inline(r[k] || '')}</td>`); h += '</tr>'; });
      out += h + '</tbody></table></div>'; continue;
    }
    if (/^>\s?/.test(line)) {
      let buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out += `<blockquote>${buf.map(b => b.trim() === '' ? '' : `<p>${inline(b)}</p>`).join('')}</blockquote>`; continue;
    }
    let hd = line.match(/^(#{1,6})\s+(.*)$/);
    if (hd) { out += `<h${hd[1].length}>${inline(hd[2])}</h${hd[1].length}>`; i++; continue; }
    if (/^\s*([-*_])\1\1+\s*$/.test(line)) { out += '<hr>'; i++; continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      let h = '<ul>';
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        let it = lines[i].replace(/^\s*[-*]\s+/, '');
        const c = it.match(/^\[( |x|X)\]\s+(.*)$/);
        h += c ? `<li class="check">${c[1].toLowerCase() === 'x' ? '✅' : '⬜'} ${inline(c[2])}</li>`
               : `<li>${inline(it)}</li>`;
        i++;
      }
      out += h + '</ul>'; continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      let h = '<ol>';
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { h += `<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`; i++; }
      out += h + '</ol>'; continue;
    }
    if (line.trim() === '') { i++; continue; }
    let buf = [];
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^(#{1,6}\s|>\s?|```|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i]) &&
           !/^\s*([-*_])\1\1+\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
    out += `<p>${inline(buf.join(' '))}</p>`;
  }
  return out;
}
async function fetchMd(file) {
  const r = await fetch(file, { cache: 'no-cache' });
  if (!r.ok) throw new Error(r.status);
  return r.text();
}
function mdErr(file, e) {
  return `<div class="pad"><h1>Não consegui carregar</h1>
    <p>Abra por um servidor (não <code>file://</code>): <code>python3 -m http.server</code>
    na pasta, ou publique. Você também pode ler direto em <code>${file}</code>.</p>
    <p class="muted">Detalhe: ${e.message}</p></div>`;
}

/* =================== Dados =================== */
const CHAPTERS = [
  { id: '00', file: 'docs/00-VISAO.md',         emoji: '🧭', title: 'Visão' },
  { id: '01', file: 'docs/01-COMPRAR.md',       emoji: '🛒', title: 'Comprar (off→online)' },
  { id: '02', file: 'docs/02-CARTEIRA.md',      emoji: '🔐', title: 'Carteira própria' },
  { id: '03', file: 'docs/03-DECLARACAO.md',    emoji: '🧾', title: 'Declaração (fiscal)' },
  { id: '04', file: 'docs/04-GANHAR-HOJE.md',   emoji: '⛏️', title: 'Ganhar BTC hoje' },
  { id: '05', file: 'docs/05-MAPA-HISTORICO.md',emoji: '🗺️', title: 'Mapa do passado' },
  { id: '07', file: 'docs/07-NORTE-PRODUTO.md', emoji: '🚀', title: 'Norte do produto' },
  { id: '99', file: 'docs/99-FONTES.md',        emoji: '📚', title: 'Fontes' },
];

const TIMELINE = [
  { d: '31/10/2008', t: 'Whitepaper', k: 'origem', s: 'Satoshi Nakamoto publica "Bitcoin: A Peer-to-Peer Electronic Cash System".' },
  { d: '03/01/2009', t: 'Bloco Gênese', k: 'origem', s: 'Minerado o bloco 0, com a manchete "Chancellor on brink of second bailout for banks". Nasce a rede.' },
  { d: '12/01/2009', t: '1ª transação', k: 'origem', s: 'Satoshi envia 10 BTC para Hal Finney — a primeira transação da história.' },
  { d: '22/05/2010', t: 'Bitcoin Pizza Day', k: 'marco', s: 'Laszlo Hanyecz paga 10.000 BTC por 2 pizzas — a 1ª compra de algo real com BTC.' },
  { d: 'jun/2010', t: '1º Faucet', k: 'ganhar', s: 'Gavin Andresen dá 5 BTC por captcha para popularizar a moeda (ver cap. 05).' },
  { d: 'fev/2011', t: 'Paridade com o dólar', k: 'preco', s: '1 BTC = US$ 1 pela primeira vez.' },
  { d: '28/11/2012', t: '1º Halving', k: 'halving', s: 'Recompensa por bloco cai de 50 → 25 BTC. A escassez programada em ação.' },
  { d: 'fev/2014', t: 'Colapso da Mt. Gox', k: 'risco', s: 'A maior exchange da época quebra (~850 mil BTC sumiram). Lição eterna: "not your keys, not your coins".' },
  { d: '09/07/2016', t: '2º Halving', k: 'halving', s: 'Recompensa 25 → 12,5 BTC.' },
  { d: 'dez/2017', t: 'Pico de ~US$ 20 mil', k: 'preco', s: 'Primeira euforia global; futuros lançados na CME.' },
  { d: '11/05/2020', t: '3º Halving', k: 'halving', s: 'Recompensa 12,5 → 6,25 BTC.' },
  { d: '07/09/2021', t: 'El Salvador adota BTC', k: 'marco', s: '1º país a tornar o bitcoin moeda de curso legal.' },
  { d: 'nov/2021', t: 'Pico de ~US$ 69 mil', k: 'preco', s: 'Topo do ciclo de 2021.' },
  { d: '10/01/2024', t: 'ETFs à vista (EUA)', k: 'marco', s: 'A SEC aprova ETFs spot de bitcoin — entrada institucional em massa.' },
  { d: 'abr/2024', t: '4º Halving', k: 'halving', s: 'Recompensa 6,25 → 3,125 BTC (bloco 840.000).' },
  { d: '2025', t: 'Faucet revivido', k: 'ganhar', s: 'Block (Jack Dorsey) revive um faucet "16 anos depois" — hoje é marketing, não renda (cap. 04).' },
];

const CHECKLIST = [
  { g: '1 · Comprar (off→online)', items: [
    'Escolhi plataforma regulamentada e conclui o KYC',
    'Ativei 2FA por app (não SMS)',
    'Depositei via Pix',
    'Comprei bitcoin',
    'Anotei o custo (data, quantidade, preço, taxa)',
  ]},
  { g: '2 · Custódia própria (soberania)', items: [
    'Instalei uma carteira (hot, para começar)',
    'Anotei a seed à mão, offline — e testei o backup',
    'Conferi meu endereço de recebimento',
    'Fiz um SAQUE DE TESTE (valor pequeno) e confirmei',
    'Transferi o restante para a minha carteira',
    '(quando crescer) Migrei o grosso para cold wallet',
  ]},
  { g: '3 · Declaração / lastro (Brasil)', items: [
    'Guardei comprovação de origem dos recursos',
    'Registrei o custo de aquisição (planilha)',
    'Declarei no IRPF (Bens e Direitos) os ativos ≥ R$ 5.000',
    'Verifiquei as vendas do mês (isenção/limite vigente)',
    'Conferi tudo com contador(a)',
  ]},
];

/* =================== Elementos / utils =================== */
const appEl = document.getElementById('app');
const tabsEl = document.getElementById('tabs');
const menuBtn = document.getElementById('menuBtn');
const backdrop = document.getElementById('backdrop');
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const NUM = new Intl.NumberFormat('pt-BR');

/* =================== Painel =================== */
async function viewPainel() {
  menuBtn.hidden = true;
  appEl.innerHTML = `
    <div class="pad">
      <h1>📊 Painel <span class="muted small">tudo pra decidir, num lugar só</span></h1>
      <div class="banner ok">🔒 Tudo aqui é <strong>só-leitura e educacional</strong>: não conecta
        em conta, não pede chave, e <strong>não é recomendação</strong> de compra/venda.</div>
      <div class="cards">
        <div id="cPrice" class="card"><h3>💰 Preço do Bitcoin</h3><p class="loading">…</p></div>
        <div id="cFng" class="card"><h3>😨 Medo &amp; Ganância</h3><p class="loading">…</p></div>
        <div id="cHalv" class="card"><h3>⛏️ Próximo halving</h3><p class="loading">…</p></div>
      </div>
      <div id="leitura" class="leitura"><p class="loading">Lendo o momento…</p></div>
      <h2>Atalhos</h2>
      <div class="quick">
        <a href="#book/01" class="q">🛒 Como comprar</a>
        <a href="#book/02" class="q">🔐 Carteira própria</a>
        <a href="#book/03" class="q">🧾 Declarar</a>
        <a href="#checklist" class="q">✅ Meu checklist</a>
        <a href="#carteira" class="q">👑 Carteira soberana</a>
        <a href="#historico" class="q">🕰️ Histórico</a>
      </div>
      <p class="muted small">Dados ao vivo: CoinGecko (preço), alternative.me (medo &amp; ganância),
      mempool.space (altura de bloco). Tudo público e só-leitura.</p>
    </div>`;
  loadPrice(); loadFng(); loadHalving();
}

async function loadPrice() {
  const box = document.getElementById('cPrice'); if (!box) return;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl,usd&include_24hr_change=true', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const d = (await r.json()).bitcoin;
    const ch = d.brl_24h_change ?? 0, up = ch >= 0;
    box.innerHTML = `<h3>💰 Preço do Bitcoin</h3>
      <div class="big">${BRL.format(d.brl)}</div>
      <div class="sub">${USD.format(d.usd)} • <span class="${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(ch).toFixed(2)}% (24h)</span></div>
      <div class="muted small">1 BTC • agora</div>`;
  } catch (e) {
    box.innerHTML = `<h3>💰 Preço do Bitcoin</h3><p class="muted">Sem preço ao vivo agora (${e.message}).</p>`;
  }
}

function fngBucket(v) {
  if (v < 25) return { pt: 'Medo extremo', cls: 'red' };
  if (v < 50) return { pt: 'Medo', cls: 'orange' };
  if (v < 55) return { pt: 'Neutro', cls: 'gray' };
  if (v < 75) return { pt: 'Ganância', cls: 'teal' };
  return { pt: 'Ganância extrema', cls: 'green' };
}
function leituraTexto(b) {
  const base = {
    'Medo extremo': 'O mercado está com medo. Historicamente, fases de medo coincidiram com preços mais baixos — mas medo também pode preceder mais quedas. Ninguém sabe o fundo.',
    'Medo': 'Mercado cauteloso. Sem sinal claro de direção.',
    'Neutro': 'Mercado indeciso, sem viés forte.',
    'Ganância': 'Mercado otimista. Atenção ao entusiasmo virar FOMO (medo de ficar de fora).',
    'Ganância extrema': 'Mercado eufórico. Historicamente, euforia precedeu topos e correções. Cuidado redobrado com FOMO.'
  }[b.pt] || '';
  return `${base} <strong>Estratégia educacional comum pra tirar a emoção: DCA</strong> (comprar
    pouco e sempre) e só o que você pode perder. A decisão é sua.`;
}
async function loadFng() {
  const box = document.getElementById('cFng');
  const leit = document.getElementById('leitura');
  try {
    const r = await fetch('https://api.alternative.me/fng/?limit=1', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const d = (await r.json()).data[0];
    const v = parseInt(d.value, 10), b = fngBucket(v);
    if (box) box.innerHTML = `<h3>😨 Medo &amp; Ganância</h3>
      <div class="gauge ${b.cls}"><div class="gnum">${v}</div></div>
      <div class="sub"><span class="badge ${b.cls}">${b.pt}</span></div>
      <div class="muted small">Índice 0–100 (Fear &amp; Greed)</div>`;
    if (leit) leit.innerHTML = `<h2>🧭 Leitura do momento <span class="muted small">educacional, não é recomendação</span></h2>
      <div class="leitura-card ${b.cls}"><p><strong>${b.pt} (${v}/100).</strong> ${leituraTexto(b)}</p>
      <p class="muted small">⚠️ Educacional. Não é recomendação de investimento. Confirme decisões com um profissional e estude antes (Book → Comprar, Carteira, Declarar).</p></div>`;
  } catch (e) {
    if (box) box.innerHTML = `<h3>😨 Medo &amp; Ganância</h3><p class="muted">Índice indisponível agora (${e.message}).</p>`;
    if (leit) leit.innerHTML = '';
  }
}

async function loadHalving() {
  const box = document.getElementById('cHalv'); if (!box) return;
  const HALV = 210000;
  function render(h) {
    const era = Math.floor(h / HALV);
    const reward = 50 / Math.pow(2, era);
    const target = (era + 1) * HALV;
    const left = target - h;
    const mins = left * 10;
    const days = mins / 1440;
    const est = new Date(Date.now() + mins * 60000);
    const ano = est.getFullYear();
    const mes = est.toLocaleDateString('pt-BR', { month: 'short' });
    box.innerHTML = `<h3>⛏️ Próximo halving</h3>
      <div class="big">${NUM.format(target)}</div>
      <div class="sub">faltam ~${NUM.format(left)} blocos (~${Math.round(days)} dias)</div>
      <div class="muted small">recompensa ${reward} → ${reward / 2} BTC • estimativa ${mes}/${ano}</div>`;
  }
  try {
    const r = await fetch('https://mempool.space/api/blocks/tip/height', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const h = parseInt((await r.text()).trim(), 10);
    if (!Number.isFinite(h)) throw new Error('altura inválida');
    render(h);
  } catch (e) {
    box.innerHTML = `<h3>⛏️ Próximo halving</h3>
      <div class="big">1.050.000</div>
      <div class="sub muted">estimativa: ~2028</div>
      <div class="muted small">recompensa 3,125 → 1,5625 BTC (ao vivo indisponível: ${e.message})</div>`;
  }
}

/* =================== Book =================== */
function viewBook(sub) {
  const id = (CHAPTERS.find(c => c.id === sub) || CHAPTERS[0]).id;
  appEl.innerHTML = `
    <div class="layout">
      <nav id="sidebar" class="sidebar" aria-label="Capítulos">
        <p class="nav-title">O Book</p>
        <ul id="chapterList">${CHAPTERS.map(c => `
          <li><a href="#book/${c.id}" data-id="${c.id}">
            <span>${c.emoji}</span><span class="ix">${c.id}</span><span>${c.title}</span></a></li>`).join('')}
        </ul>
        <p class="nav-foot">Projeto vivo • v0.2 • 16/06/2026</p>
      </nav>
      <section class="content"><article id="doc" class="doc"><p class="loading">Carregando…</p></article></section>
    </div>`;
  menuBtn.hidden = false;
  document.querySelectorAll('#chapterList a').forEach(a => a.classList.toggle('active', a.dataset.id === id));
  const ch = CHAPTERS.find(c => c.id === id);
  const doc = document.getElementById('doc');
  fetchMd(ch.file).then(md => { doc.innerHTML = mdToHtml(md); }).catch(e => { doc.innerHTML = mdErr(ch.file, e); });
  document.getElementById('sidebar').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
}

/* =================== Histórico =================== */
const KTAG = { origem: 'origem', marco: 'marco', ganhar: 'ganhar', preco: 'preço', halving: 'halving', risco: 'risco' };
function viewHistorico() {
  menuBtn.hidden = true;
  const items = TIMELINE.map(ev => `
    <li class="tl-item k-${ev.k}">
      <div class="tl-dot"></div>
      <div class="tl-card">
        <div class="tl-head"><span class="tl-date">${ev.d}</span><span class="tl-tag">${KTAG[ev.k] || ev.k}</span></div>
        <h3>${esc(ev.t)}</h3><p>${esc(ev.s)}</p>
      </div>
    </li>`).join('');
  appEl.innerHTML = `
    <div class="pad">
      <h1>🕰️ Histórico do Bitcoin</h1>
      <p class="muted">Do whitepaper (2008) aos dias de hoje — os marcos que importam. Para a análise
      "o que ficou pelo caminho", veja o Book → <em>Mapa do passado</em>.</p>
      <ul class="timeline">${items}</ul>
      <p class="muted small">Datas de halving/marcos são públicas/on-chain. Fontes no Book (cap. 99).</p>
    </div>`;
}

/* =================== Checklist =================== */
const CK_KEY = 'bussola.checklist.v1';
function ckLoad() { try { return new Set(JSON.parse(localStorage.getItem(CK_KEY) || '[]')); } catch { return new Set(); } }
function ckSave(set) { try { localStorage.setItem(CK_KEY, JSON.stringify([...set])); } catch {} }
function viewChecklist() {
  menuBtn.hidden = true;
  const done = ckLoad();
  let total = 0; CHECKLIST.forEach(g => total += g.items.length);
  const groups = CHECKLIST.map((g, gi) => `
    <fieldset class="ck-group"><legend>${esc(g.g)}</legend>
      ${g.items.map((it, ii) => {
        const key = `g${gi}i${ii}`;
        return `<label class="ck-item"><input type="checkbox" data-key="${key}" ${done.has(key) ? 'checked' : ''}><span>${esc(it)}</span></label>`;
      }).join('')}
    </fieldset>`).join('');
  appEl.innerHTML = `
    <div class="pad">
      <h1>✅ Checklist — do off ao bitcoin soberano</h1>
      <p class="muted">Marque conforme avança. Fica salvo <strong>no seu aparelho</strong> (nada vai
      pra internet). Termina com BTC na sua carteira e a papelada de comprovação pronta.</p>
      <div class="progress"><div id="ckBar" class="bar"></div></div>
      <p id="ckPct" class="muted small"></p>
      ${groups}
      <button id="ckReset" class="btn-ghost">Limpar tudo</button>
    </div>`;
  function refresh() {
    const set = ckLoad();
    const pct = total ? Math.round(set.size / total * 100) : 0;
    document.getElementById('ckBar').style.width = pct + '%';
    document.getElementById('ckPct').textContent = `${set.size}/${total} concluídos (${pct}%)`;
  }
  appEl.querySelectorAll('.ck-item input').forEach(inp => inp.addEventListener('change', () => {
    const set = ckLoad();
    inp.checked ? set.add(inp.dataset.key) : set.delete(inp.dataset.key);
    ckSave(set); refresh();
  }));
  document.getElementById('ckReset').addEventListener('click', () => {
    if (confirm('Limpar todo o checklist?')) {
      ckSave(new Set());
      appEl.querySelectorAll('.ck-item input').forEach(i => i.checked = false);
      refresh();
    }
  });
  refresh();
}

/* =================== Carteira =================== */
function viewCarteira() {
  menuBtn.hidden = true;
  appEl.innerHTML = `
    <div class="pad">
      <div class="crown">
        <h1>🔐 Carteira Soberana <span class="soon">em construção</span></h1>
        <p>A <strong>joia da coroa</strong>: uma carteira que <em>"funciona desligada mesmo
        conectada"</em> — as chaves <strong>nunca</strong> tocam a internet.</p>
        <div class="banner warn">🧪 <strong>Testnet-first.</strong> Nasce com dinheiro de teste
        (sem valor) e bibliotecas auditadas. Dinheiro real só após auditoria. Nunca pedimos sua seed.</div>
      </div>
      <article id="doc" class="doc"><p class="loading">Carregando arquitetura…</p></article>
    </div>`;
  const doc = document.getElementById('doc');
  fetchMd('docs/06-CARTEIRA-SOBERANA.md')
    .then(md => { doc.innerHTML = mdToHtml(md); })
    .catch(e => { doc.innerHTML = mdErr('docs/06-CARTEIRA-SOBERANA.md', e); });
}

/* =================== Roteador =================== */
const ROUTES = { painel: viewPainel, book: viewBook, historico: viewHistorico, checklist: viewChecklist, carteira: viewCarteira };
function route() {
  const raw = location.hash.replace(/^#/, '') || 'painel';
  const [tab, sub] = raw.split('/');
  const fn = ROUTES[tab] || viewPainel;
  const activeTab = ROUTES[tab] ? tab : 'painel';
  tabsEl.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.tab === activeTab));
  closeMenu();
  window.scrollTo({ top: 0 });
  fn(sub);
}
function openMenu() { document.getElementById('sidebar')?.classList.add('open'); backdrop.hidden = false; }
function closeMenu() { document.getElementById('sidebar')?.classList.remove('open'); backdrop.hidden = true; }
menuBtn.addEventListener('click', openMenu);
backdrop.addEventListener('click', closeMenu);
window.addEventListener('hashchange', route);

/* rede */
const net = document.getElementById('netStatus');
function updNet() { const on = navigator.onLine; net.classList.toggle('off', !on); net.title = on ? 'Online' : 'Offline (cache)'; }
window.addEventListener('online', updNet);
window.addEventListener('offline', updNet);
updNet();

/* PWA */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

route();

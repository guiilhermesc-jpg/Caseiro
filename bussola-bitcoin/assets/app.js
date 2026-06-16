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
  { id: '08', file: 'docs/08-ESTRATEGIA.md',    emoji: '♟️', title: 'Estratégia (longo prazo)' },
  { id: '09', file: 'docs/09-SEGURANCA.md',     emoji: '🛡️', title: 'Segurança & Confiança' },
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

/* =================== Registro / Planilha =================== */
const REG_KEY = 'bussola.registro.v1';
function regLoad() { try { return JSON.parse(localStorage.getItem(REG_KEY) || '[]'); } catch { return []; } }
function regSave(a) { try { localStorage.setItem(REG_KEY, JSON.stringify(a)); } catch {} }
const BTC = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 });

/* DCA: compra 1x por mês (no 1º preço observado do mês) sobre uma série diária ascendente */
function simulateDCA(prices, monthly) {
  let invested = 0, btc = 0; const seen = new Set();
  for (const [ts, p] of prices) {
    const d = new Date(ts); const key = d.getFullYear() + '-' + d.getMonth();
    if (!seen.has(key) && p > 0) { seen.add(key); invested += monthly; btc += monthly / p; }
  }
  const last = prices.length ? prices[prices.length - 1][1] : 0;
  return { invested, btc, value: btc * last, months: seen.size, last };
}

function viewRegistro() {
  menuBtn.hidden = true;
  const today = new Date().toISOString().slice(0, 10);
  appEl.innerHTML = `
    <div class="pad">
      <h1>🧮 Registro de compras <span class="muted small">sua planilha, no seu aparelho</span></h1>
      <p class="muted">Lance cada compra para acompanhar <strong>preço médio</strong>, total investido e
      resultado — e <strong>exporte um CSV</strong> pro contador (lastro/custo de aquisição, cap. 03).
      Fica salvo só aqui; nada vai pra internet.</p>
      <div class="banner warn">ℹ️ Ferramenta de <strong>conferência</strong>, não cálculo oficial de
      imposto. Confirme tudo com contador(a).</div>
      <form id="regForm" class="regform">
        <label>Data<input type="date" id="rData" value="${today}" required></label>
        <label>Valor investido (R$)<input type="number" id="rValor" min="0" step="0.01" placeholder="500.00" required></label>
        <label>Preço do BTC na compra (R$)<input type="number" id="rPreco" min="0" step="0.01" placeholder="350000.00" required></label>
        <button type="submit">+ Adicionar</button>
      </form>
      <div id="regSummary" class="cards"></div>
      <div id="regList" class="tablewrap"></div>
      <div class="regactions">
        <button id="regCsv" class="btn-ghost">⬇️ Exportar CSV</button>
        <button id="regClear" class="btn-ghost">Limpar tudo</button>
      </div>

      <h2>📈 Simulador de DCA <span class="muted small">e se eu comprasse todo mês?</span></h2>
      <p class="muted">DCA = comprar um valor fixo todo mês, sem tentar adivinhar o momento. Veja como
      teria sido <strong>no passado</strong> (preços reais). Passado <strong>não</strong> garante futuro.</p>
      <form id="dcaForm" class="regform">
        <label>Valor por mês (R$)<input type="number" id="dValor" min="0" step="10" value="200"></label>
        <label>Período<select id="dAnos"><option value="1">1 ano</option><option value="2">2 anos</option><option value="3" selected>3 anos</option><option value="5">5 anos</option></select></label>
        <button type="submit">Simular</button>
      </form>
      <div id="dcaOut"></div>

      <h2>🧾 Estimador de imposto <span class="muted small">venda · educacional</span></h2>
      <div class="banner warn">⚠️ Isenção e alíquotas <strong>mudam</strong> e dependem do seu caso
      (corretora nacional × exterior). Isto é só uma estimativa matemática — <strong>confirme com
      contador(a)</strong>. Não é cálculo oficial.</div>
      <form id="taxForm" class="regform">
        <label>Total de vendas no mês (R$)<input type="number" id="txMes" min="0" step="0.01" placeholder="0.00"></label>
        <label>Valor desta venda (R$)<input type="number" id="txVenda" min="0" step="0.01"></label>
        <label>Custo de aquisição vendido (R$)<input type="number" id="txCusto" min="0" step="0.01"></label>
        <label>Limite de isenção mensal (R$)<input type="number" id="txLimite" min="0" step="0.01" value="35000"></label>
        <label>Alíquota (%)<input type="number" id="txAliq" min="0" step="0.1" value="15"></label>
        <button type="submit">Estimar</button>
      </form>
      <div id="taxOut"></div>
    </div>`;

  let live = null;
  fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null).then(d => { live = d?.bitcoin?.brl ?? null; renderSummary(); }).catch(() => {});

  function totals() {
    let inv = 0, btc = 0;
    regLoad().forEach(e => { inv += e.valor; btc += (e.preco > 0 ? e.valor / e.preco : 0); });
    return { inv, btc, avg: btc > 0 ? inv / btc : 0 };
  }
  function renderSummary() {
    const box = document.getElementById('regSummary'); if (!box) return;
    const t = totals();
    const atual = live != null ? t.btc * live : null;
    const lucro = atual != null ? atual - t.inv : null;
    const pct = (atual != null && t.inv > 0) ? (lucro / t.inv * 100) : null;
    box.innerHTML = `
      <div class="card"><h3>Total investido</h3><div class="big">${BRL.format(t.inv)}</div></div>
      <div class="card"><h3>Bitcoin acumulado</h3><div class="big">${BTC.format(t.btc)}</div><div class="sub muted">preço médio ${t.avg ? BRL.format(t.avg) : '—'}</div></div>
      <div class="card"><h3>Valor hoje</h3><div class="big">${atual != null ? BRL.format(atual) : '—'}</div>
        <div class="sub">${pct != null ? `<span class="${lucro >= 0 ? 'up' : 'down'}">${lucro >= 0 ? '▲' : '▼'} ${BRL.format(Math.abs(lucro))} (${Math.abs(pct).toFixed(1)}%)</span>` : '<span class="muted">preço ao vivo indisponível</span>'}</div></div>`;
  }
  function renderList() {
    const box = document.getElementById('regList'); if (!box) return;
    const a = regLoad();
    if (!a.length) { box.innerHTML = '<p class="muted">Nenhuma compra ainda. Adicione a primeira acima.</p>'; return; }
    box.innerHTML = `<table><thead><tr><th>Data</th><th>Investido</th><th>Preço BTC</th><th>BTC</th><th></th></tr></thead><tbody>
      ${a.map((e, i) => `<tr><td>${e.data}</td><td>${BRL.format(e.valor)}</td><td>${BRL.format(e.preco)}</td><td>${BTC.format(e.preco > 0 ? e.valor / e.preco : 0)}</td>
        <td><button class="del" data-i="${i}" title="Remover">✕</button></td></tr>`).join('')}
    </tbody></table>`;
    box.querySelectorAll('.del').forEach(b => b.addEventListener('click', () => {
      const a2 = regLoad(); a2.splice(+b.dataset.i, 1); regSave(a2); renderList(); renderSummary();
    }));
  }

  document.getElementById('regForm').addEventListener('submit', e => {
    e.preventDefault();
    const data = document.getElementById('rData').value;
    const valor = parseFloat(document.getElementById('rValor').value);
    const preco = parseFloat(document.getElementById('rPreco').value);
    if (!data || !(valor > 0) || !(preco > 0)) return;
    const a = regLoad(); a.push({ data, valor, preco }); a.sort((x, y) => x.data < y.data ? -1 : 1); regSave(a);
    document.getElementById('rValor').value = ''; document.getElementById('rPreco').value = '';
    renderList(); renderSummary();
  });
  document.getElementById('regCsv').addEventListener('click', () => {
    const a = regLoad();
    if (!a.length) { alert('Nada para exportar ainda.'); return; }
    const linhas = a.map(e => [e.data, e.valor.toFixed(2), e.preco.toFixed(2), (e.preco > 0 ? e.valor / e.preco : 0).toFixed(8)]
      .map(v => String(v).replace('.', ',')).join(';'));
    const csv = '﻿data;valor_investido_brl;preco_btc_brl;quantidade_btc\n' + linhas.join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'bussola-compras.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('regClear').addEventListener('click', () => {
    if (confirm('Apagar todas as compras registradas?')) { regSave([]); renderList(); renderSummary(); }
  });

  document.getElementById('dcaForm').addEventListener('submit', async e => {
    e.preventDefault();
    const monthly = parseFloat(document.getElementById('dValor').value);
    const years = parseInt(document.getElementById('dAnos').value, 10);
    const out = document.getElementById('dcaOut');
    if (!(monthly > 0)) { out.innerHTML = '<p class="muted">Informe um valor mensal maior que zero.</p>'; return; }
    out.innerHTML = '<p class="loading">Buscando preços históricos reais…</p>';
    try {
      const r = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=${years * 365}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const prices = (await r.json()).prices || [];
      if (prices.length < 2) throw new Error('sem dados');
      const s = simulateDCA(prices, monthly);
      const lucro = s.value - s.invested, pct = s.invested > 0 ? lucro / s.invested * 100 : 0, up = lucro >= 0;
      out.innerHTML = `<div class="cards">
        <div class="card"><h3>Investido (${s.months} meses)</h3><div class="big">${BRL.format(s.invested)}</div></div>
        <div class="card"><h3>BTC acumulado</h3><div class="big">${BTC.format(s.btc)}</div><div class="sub muted">${BRL.format(s.last)} / BTC hoje</div></div>
        <div class="card"><h3>Valor hoje</h3><div class="big">${BRL.format(s.value)}</div>
          <div class="sub"><span class="${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${BRL.format(Math.abs(lucro))} (${Math.abs(pct).toFixed(0)}%)</span></div></div>
      </div>
      <div class="banner warn">⚠️ Simulação com <strong>dados reais do passado</strong> (CoinGecko).
      <strong>Resultado passado NÃO garante futuro.</strong> Educacional, não é recomendação.</div>`;
    } catch (err) {
      out.innerHTML = `<p class="muted">Não consegui buscar o histórico agora (${err.message}). Tente de novo online.</p>`;
    }
  });

  document.getElementById('taxForm').addEventListener('submit', e => {
    e.preventDefault();
    const W = window.BussolaWallet, o = document.getElementById('taxOut');
    if (!W || !W.estimarImposto) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    const r = W.estimarImposto({
      vendaMes: parseFloat(document.getElementById('txMes').value) || 0,
      valorVenda: parseFloat(document.getElementById('txVenda').value) || 0,
      custo: parseFloat(document.getElementById('txCusto').value) || 0,
      limite: parseFloat(document.getElementById('txLimite').value) || 35000,
      aliquota: parseFloat(document.getElementById('txAliq').value) || 15,
    });
    o.innerHTML = `<div class="banner ${r.isento ? 'ok' : 'warn'}">Ganho estimado: <strong>${BRL.format(r.ganho)}</strong> · ${r.isento ? '<strong>Isento</strong> nesta estimativa' : 'Imposto estimado: <strong>' + BRL.format(r.imposto) + '</strong>'}.</div>
      <p class="muted small">Estimativa educacional. Confirme as regras vigentes e seu enquadramento com contador(a).</p>`;
  });

  renderList(); renderSummary();
}

/* =================== Carteira =================== */
const EXAMPLE_XPUB = 'xpub6Bqrcfo7nB1ywHwEvjikTNcd2jyTksXZLFkwJxUyeHJy8USaxusZpdfYUjMHoL1rAswEHBBoFX9gPW6uJy5EBoVc4NgWZfG21sDG8XSU7q6';
const TESTNET_API = 'https://mempool.space/testnet/api';

function viewCarteira() {
  menuBtn.hidden = true;
  appEl.innerHTML = `
    <div class="pad">
      <div class="crown">
        <h1>🔐 Carteira Soberana <span class="soon">testnet • watch-only</span></h1>
        <p>A <strong>joia da coroa</strong>: uma carteira que <em>"funciona desligada mesmo
        conectada"</em> — as chaves <strong>nunca</strong> tocam a internet.</p>
        <div class="banner warn">🧪 <strong>Testnet-first.</strong> Bibliotecas auditadas
        (@scure/bip32). Dinheiro real só após auditoria. <strong>Nunca pedimos sua seed.</strong></div>
      </div>

      <section class="watchonly">
        <h2>🔑 Criar / Restaurar carteira (testnet)</h2>
        <p class="muted">Gera uma carteira de <strong>teste</strong> (12 palavras) ou restaura a sua.
        A seed fica <strong>só na memória</strong> deste aparelho e <strong>some ao sair</strong> — nada é salvo.</p>
        <div class="banner warn">⚠️ <strong>Rede de teste, sem valor real.</strong> Nunca use uma seed de
        teste para dinheiro de verdade. Anote a frase no papel e <strong>nunca</strong> compartilhe.</div>
        <div class="regactions"><button id="wgCreate" class="btn-ghost">🎲 Criar nova (testnet)</button></div>
        <form id="wgRestore" class="regform">
          <label style="grid-column:1/-1">Restaurar (12/24 palavras)
            <input type="text" id="wgWords" placeholder="palavra1 palavra2 … (separadas por espaço)" autocomplete="off" spellcheck="false"></label>
          <button type="submit">Restaurar</button>
        </form>
        <div id="wgOut"></div>
      </section>

      <section class="watchonly">
        <h2>🔭 Watch-only (testnet)</h2>
        <p class="muted">Cole uma <strong>chave pública estendida</strong> de conta (xpub/tpub/vpub) e
        veja os endereços e o saldo — <strong>sem chave privada</strong>. Só observação, derivada
        <strong>no seu aparelho</strong>. Rede de teste (sem valor real).</p>
        <form id="woForm" class="regform">
          <label style="grid-column:1/-1">Chave pública estendida (xpub / tpub / vpub)
            <input type="text" id="woXpub" placeholder="vpub… / tpub… / xpub…" autocomplete="off" spellcheck="false"></label>
          <label>Nº de endereços<select id="woN"><option>5</option><option>10</option><option>20</option></select></label>
          <button type="submit">Ver endereços</button>
        </form>
        <div class="regactions">
          <button id="woExample" class="btn-ghost">Usar xpub de exemplo</button>
          <button id="woBalance" class="btn-ghost">Consultar saldo (testnet)</button>
        </div>
        <div id="woOut"></div>
        <p class="muted small">Saldo via mempool.space (testnet), só-leitura. Para testar com fundos,
        use um <em>faucet</em> de testnet num endereço derivado.</p>
      </section>

      <section class="watchonly">
        <h2>📡 Enviar — air-gap <span class="soon">testnet beta</span></h2>
        <p class="muted">O fluxo soberano em 3 passos: <strong>monta</strong> no online (sem chave),
        <strong>assina</strong> no offline (com a seed), <strong>transmite</strong> no online. A chave
        nunca toca a internet. Transporte por <strong>QR</strong> (mostre numa tela, leia na outra) ou copiar/colar.</p>
        <div class="banner warn">🧪 Testnet beta. Teste com fundos de <em>faucet</em> e confira no explorer.</div>

        <div class="agstep">
          <h3>1) Montar <span class="muted small">online · sem chave</span></h3>
          <p class="muted small" id="agXpubInfo">Carteira: defina acima (criar/restaurar ou colar xpub no watch-only).</p>
          <form id="agBuild" class="regform">
            <label style="grid-column:1/-1">Endereço de destino (tb1…)<input type="text" id="agTo" autocomplete="off" spellcheck="false"></label>
            <label>Valor (sats)<input type="number" id="agAmt" min="1" step="1" placeholder="10000"></label>
            <label>Taxa (sat/vB)<input type="number" id="agFee" min="1" step="1" value="2"></label>
            <button type="submit">Montar PSBT</button>
          </form>
          <div id="agBuildOut"></div>
        </div>

        <div class="agstep">
          <h3>2) Assinar <span class="muted small">offline · com a seed</span></h3>
          <div class="banner warn">Faça este passo no <strong>aparelho offline</strong>. A seed só é usada aqui e some ao concluir.</div>
          <form id="agSign" class="regform">
            <label style="grid-column:1/-1">PSBT a assinar (cole)<textarea id="agPsbtIn" rows="3" spellcheck="false"></textarea></label>
            <label style="grid-column:1/-1">Sua frase (12/24 palavras)<input type="text" id="agSeed" autocomplete="off" spellcheck="false"></label>
            <button type="submit">Assinar (offline)</button>
          </form>
          <div id="agSignOut"></div>
        </div>

        <div class="agstep">
          <h3>3) Transmitir <span class="muted small">online · sem chave</span></h3>
          <form id="agSend" class="regform">
            <label style="grid-column:1/-1">PSBT assinado (cole)<textarea id="agSignedIn" rows="3" spellcheck="false"></textarea></label>
            <button type="submit">Finalizar e transmitir</button>
          </form>
          <div id="agSendOut"></div>
        </div>
      </section>

      <h2>Arquitetura completa</h2>
      <article id="doc" class="doc"><p class="loading">Carregando arquitetura…</p></article>
    </div>`;

  let current = [];
  const out = document.getElementById('woOut');
  const wallet = window.BussolaWallet;

  function useAccount(accountXpub) {
    document.getElementById('woXpub').value = accountXpub;
    document.getElementById('woForm').dispatchEvent(new Event('submit', { cancelable: true }));
    document.getElementById('woOut').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  const wgOut = document.getElementById('wgOut');
  document.getElementById('wgCreate').addEventListener('click', () => {
    if (!wallet) { wgOut.innerHTML = '<p class="muted">Núcleo da carteira não carregou. Recarregue a página.</p>'; return; }
    const w = wallet.createTestnetWallet();
    wgOut.innerHTML = `
      <div class="seedbox">
        <h3>📝 Anote estas 12 palavras (em ordem), no papel:</h3>
        <ol class="seedwords">${w.mnemonic.split(' ').map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        <div class="banner warn">Quem tem estas palavras controla os fundos. Aqui é testnet (sem valor),
        mas <strong>crie o hábito certo</strong>: nunca tire foto, nunca digite num site, nunca compartilhe.</div>
        <button id="wgDone" class="btn-ghost">Já anotei — ver meus endereços</button>
      </div>`;
    document.getElementById('wgDone').addEventListener('click', () => useAccount(w.accountXpub));
  });
  document.getElementById('wgRestore').addEventListener('submit', e => {
    e.preventDefault();
    if (!wallet) { wgOut.innerHTML = '<p class="muted">Núcleo da carteira não carregou. Recarregue a página.</p>'; return; }
    try {
      const w = wallet.restoreTestnetWallet(document.getElementById('wgWords').value);
      wgOut.innerHTML = '<div class="banner ok">✅ Carteira restaurada. Veja os endereços abaixo.</div>';
      useAccount(w.accountXpub);
    } catch (err) { wgOut.innerHTML = `<p class="muted">${err.message}</p>`; }
  });

  function showAddrs(list) {
    current = list;
    out.innerHTML = `<div class="tablewrap"><table><thead><tr><th>Caminho</th><th>Endereço (tb1…)</th></tr></thead><tbody>
      ${list.map(a => `<tr><td>${a.path}</td><td class="mono">${a.address}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  document.getElementById('woExample').addEventListener('click', () => { document.getElementById('woXpub').value = EXAMPLE_XPUB; });
  document.getElementById('woForm').addEventListener('submit', e => {
    e.preventDefault();
    const xpub = document.getElementById('woXpub').value.trim();
    const n = parseInt(document.getElementById('woN').value, 10) || 5;
    if (!xpub) { out.innerHTML = '<p class="muted">Cole uma chave pública estendida (ou use o exemplo).</p>'; return; }
    if (!wallet) { out.innerHTML = '<p class="muted">Núcleo da carteira não carregou. Recarregue a página.</p>'; return; }
    try { showAddrs(wallet.deriveTestnetAddresses(xpub, n)); }
    catch (err) { out.innerHTML = `<p class="muted">Chave inválida: ${err.message}</p>`; }
  });
  document.getElementById('woBalance').addEventListener('click', async () => {
    if (!current.length) { out.innerHTML = '<p class="muted">Primeiro clique em "Ver endereços".</p>'; return; }
    out.innerHTML = '<p class="loading">Consultando saldo na testnet…</p>';
    try {
      const results = await Promise.all(current.map(async a => {
        const r = await fetch(`${TESTNET_API}/address/${a.address}`, { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        return { ...a, sats: d.chain_stats.funded_txo_sum - d.chain_stats.spent_txo_sum };
      }));
      const total = results.reduce((s, a) => s + a.sats, 0);
      out.innerHTML = `<div class="banner ok">💰 Saldo confirmado: <strong>${BTC.format(total / 1e8)} tBTC</strong> em ${results.length} endereços (testnet).</div>
        <div class="tablewrap"><table><thead><tr><th>Caminho</th><th>Endereço</th><th>tBTC</th></tr></thead><tbody>
        ${results.map(a => `<tr><td>${a.path}</td><td class="mono">${a.address}</td><td>${BTC.format(a.sats / 1e8)}</td></tr>`).join('')}
        </tbody></table></div>`;
    } catch (err) { out.innerHTML = `<p class="muted">Não consegui consultar agora (${err.message}). Tente online.</p>`; }
  });

  // ---- Air-gap (3 passos) ----
  function currentXpub() { return document.getElementById('woXpub').value.trim(); }
  function renderPayload(el, label, text) {
    const qr = (wallet && wallet.makeQR) ? wallet.makeQR(text) : null;
    el.innerHTML = `<div class="payload"><div class="muted small">${label}</div>
      <textarea class="mono" rows="3" readonly></textarea>
      <div class="regactions"><button type="button" class="btn-ghost" data-act="copy">Copiar</button></div>
      ${qr ? `<div class="qr">${qr}</div>` : '<p class="muted small">(Grande demais p/ 1 QR — use copiar/colar.)</p>'}</div>`;
    const ta = el.querySelector('textarea'); ta.value = text;
    el.querySelector('[data-act=copy]').addEventListener('click', () => { ta.select(); navigator.clipboard?.writeText(text); });
  }
  async function scanUtxos(xpub) {
    const targets = [];
    for (let i = 0; i < 10; i++) targets.push({ chain: 0, index: i, address: wallet.addressAt(xpub, 0, i) });
    for (let i = 0; i < 5; i++) targets.push({ chain: 1, index: i, address: wallet.addressAt(xpub, 1, i) });
    const utxos = [];
    await Promise.all(targets.map(async t => {
      try {
        const r = await fetch(`${TESTNET_API}/address/${t.address}/utxo`, { cache: 'no-store' });
        if (!r.ok) return;
        for (const u of await r.json()) utxos.push({ txid: u.txid, vout: u.vout, valueSats: u.value, chain: t.chain, index: t.index });
      } catch { /* ignora endereço */ }
    }));
    return utxos;
  }

  document.getElementById('agBuild').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('agBuildOut');
    const xpub = currentXpub();
    if (!wallet) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    if (!xpub) { o.innerHTML = '<p class="muted">Defina a carteira primeiro (criar/restaurar acima ou colar um xpub no watch-only).</p>'; return; }
    const to = document.getElementById('agTo').value.trim();
    const amt = parseInt(document.getElementById('agAmt').value, 10);
    const fee = parseInt(document.getElementById('agFee').value, 10) || 2;
    if (!to || !(amt > 0)) { o.innerHTML = '<p class="muted">Preencha destino e valor (em sats).</p>'; return; }
    o.innerHTML = '<p class="loading">Buscando UTXOs na testnet…</p>';
    try {
      const utxos = await scanUtxos(xpub);
      const res = wallet.buildPsbt({ accountXpub: xpub, utxos, toAddress: to, amountSats: amt, feeRate: fee });
      o.innerHTML = `<div class="banner ok">Montado: entrada ${res.totalIn} sats · taxa ${res.fee} · troco ${res.change} sats.${res.note ? ' ' + res.note : ''}</div>
        <div id="agPsbtPay"></div><p class="muted small">Leve este PSBT ao aparelho offline (QR ou copiar) e cole no passo 2.</p>`;
      renderPayload(document.getElementById('agPsbtPay'), 'PSBT não assinado', res.psbt);
    } catch (err) { o.innerHTML = `<p class="muted">${err.message}</p>`; }
  });

  document.getElementById('agSign').addEventListener('submit', e => {
    e.preventDefault();
    const o = document.getElementById('agSignOut');
    if (!wallet) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    try {
      const r = wallet.signPsbtWithMnemonic(document.getElementById('agPsbtIn').value, document.getElementById('agSeed').value);
      o.innerHTML = `<div class="banner ok">Assinado (${r.signedInputs} entrada(s)).</div>
        <div id="agSignedPay"></div><p class="muted small">Leve de volta ao aparelho online e cole no passo 3.</p>`;
      renderPayload(document.getElementById('agSignedPay'), 'PSBT assinado', r.psbt);
      document.getElementById('agSeed').value = ''; // higiene: limpa a seed da tela
    } catch (err) { o.innerHTML = `<p class="muted">${err.message}</p>`; }
  });

  document.getElementById('agSend').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('agSendOut');
    if (!wallet) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    let fin;
    try { fin = wallet.finalizePsbt(document.getElementById('agSignedIn').value); }
    catch (err) { o.innerHTML = `<p class="muted">${err.message}</p>`; return; }
    o.innerHTML = '<p class="loading">Transmitindo na testnet…</p>';
    try {
      const r = await fetch(`${TESTNET_API}/tx`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: fin.hex });
      const body = (await r.text()).trim();
      if (!r.ok) throw new Error(body || ('HTTP ' + r.status));
      o.innerHTML = `<div class="banner ok">✅ Transmitido!<br>txid: <span class="mono">${esc(body)}</span><br>
        <a href="https://mempool.space/testnet/tx/${esc(body)}" target="_blank" rel="noopener">ver no explorer</a></div>`;
    } catch (err) {
      o.innerHTML = `<div class="banner warn">Não transmitiu agora (${esc(err.message)}). Dá pra transmitir este tx (hex) manualmente:</div><div id="agHexPay"></div>`;
      renderPayload(document.getElementById('agHexPay'), 'Transação final (hex)', fin.hex);
    }
  });

  const doc = document.getElementById('doc');
  fetchMd('docs/06-CARTEIRA-SOBERANA.md')
    .then(md => { doc.innerHTML = mdToHtml(md); })
    .catch(e => { doc.innerHTML = mdErr('docs/06-CARTEIRA-SOBERANA.md', e); });
}

/* =================== Soberania (Raio-X + Legado + Cofre) =================== */
const RAIOX = [
  { id: 'saque', w: 3, q: 'Já tirei meu bitcoin da corretora para uma carteira própria (self-custody).', tip: 'Enquanto está na corretora, não é 100% seu.', link: '#book/02' },
  { id: 'seed', w: 3, q: 'Tenho a seed (12/24 palavras) anotada offline (papel/metal), nunca digital.', tip: 'Seed em foto/nuvem é alvo de roubo. Use papel/metal.', link: '#book/02' },
  { id: 'teste', w: 2, q: 'Já TESTEI restaurar a carteira a partir da seed.', tip: 'Backup não testado pode falhar na hora H.', link: '#book/02' },
  { id: 'cold', w: 2, q: 'Guardo a maior parte em cold wallet (hardware / air-gap).', tip: 'Para valores maiores, cold storage reduz muito o risco.', link: '#carteira' },
  { id: '2fa', w: 1, q: 'Uso 2FA por app (não SMS) nas contas ligadas a cripto.', tip: 'SMS é vulnerável a SIM swap. Use um app autenticador.', link: '#book/01' },
  { id: 'heranca', w: 3, q: 'Tenho plano de herança: alguém de confiança recuperaria meu bitcoin se eu faltasse.', tip: 'Sem plano, o bitcoin some para sempre. Monte seu Legado abaixo.', link: '#soberania' },
  { id: 'lastro', w: 1, q: 'Guardo comprovação de origem e custo (lastro) para a declaração.', tip: 'Facilita o IRPF. Veja Declaração e a aba Registro.', link: '#book/03' },
  { id: 'golpe', w: 2, q: 'Nunca compartilhei minha seed e reconheço golpes comuns.', tip: 'Ninguém legítimo pede sua seed. Veja o cap. de golpes.', link: '#book/04' },
  { id: 'priv', w: 1, q: 'Cuido de privacidade (evito reusar endereços, não exponho saldos).', tip: 'Endereço novo a cada recebimento melhora a privacidade.', link: '#carteira' },
];
function scoreRaioX(set) {
  let got = 0, total = 0; const gaps = [];
  for (const it of RAIOX) { total += it.w; if (set.has(it.id)) got += it.w; else gaps.push(it); }
  const score = Math.round(got / total * 100);
  const tier = score < 40 ? 'Iniciante' : score < 75 ? 'Em evolução' : 'Soberano';
  const cls = score < 40 ? 'red' : score < 75 ? 'orange' : 'green';
  return { score, tier, cls, gaps };
}

const LEGADO_FIELDS = [
  { k: 'titular', label: 'Seu nome (titular)', type: 'text' },
  { k: 'data', label: 'Data do plano', type: 'date' },
  { k: 'herdeiros', label: 'Herdeiros / pessoa(s) de confiança', type: 'textarea', ph: 'Nomes e como contatá-los' },
  { k: 'custodia', label: 'Tipo de custódia', type: 'select', opts: ['Hot wallet (celular/PC)', 'Cold wallet (hardware)', 'Multisig', 'Misto'] },
  { k: 'localSeed', label: 'ONDE está a seed (⚠️ NÃO escreva a seed aqui!)', type: 'textarea', ph: 'Ex.: cofre em casa; placa de aço no banco. NUNCA as palavras.' },
  { k: 'localBackup', label: 'Backups / cópias (onde estão)', type: 'textarea', ph: 'Ex.: cópia na casa dos pais; arquivo do Cofre no pendrive X.' },
  { k: 'instrucoes', label: 'Instruções para o herdeiro', type: 'textarea', ph: 'Passo a passo simples de como acessar/recuperar.' },
  { k: 'carta', label: 'Carta pessoal (opcional)', type: 'textarea', ph: 'Uma mensagem para quem for cuidar disso.' },
];
function legadoMarkdown(d) {
  const v = x => (x && String(x).trim()) || '—';
  return `# Plano de Legado — Bitcoin\n\n**Titular:** ${v(d.titular)}\n\n**Data:** ${v(d.data)}\n\n` +
    `## Pessoas de confiança / herdeiros\n${v(d.herdeiros)}\n\n## Custódia\n${v(d.custodia)}\n\n` +
    `## Onde encontrar (NUNCA contém a seed)\n- Seed: ${v(d.localSeed)}\n- Backups: ${v(d.localBackup)}\n\n` +
    `## Instruções para o herdeiro\n${v(d.instrucoes)}\n\n## Carta\n${v(d.carta)}\n\n` +
    `---\n*Gerado pela Bússola. Guarde em local seguro. NÃO substitui orientação jurídica (testamento/inventário).*\n`;
}

/* Cofre — backup criptografado (WebCrypto: PBKDF2 + AES-GCM). Padrões, não cripto caseira. */
const b64u = {
  enc: u8 => { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); },
  dec: s => Uint8Array.from(atob(s), c => c.charCodeAt(0)),
};
async function deriveAesKey(pass, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptJSON(obj, pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(pass, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj))));
  return { app: 'bussola', v: 1, kdf: 'PBKDF2-SHA256-150000', alg: 'AES-256-GCM', salt: b64u.enc(salt), iv: b64u.enc(iv), data: b64u.enc(ct) };
}
async function decryptJSON(blob, pass) {
  const key = await deriveAesKey(pass, b64u.dec(blob.salt));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64u.dec(blob.iv) }, key, b64u.dec(blob.data));
  return JSON.parse(new TextDecoder().decode(pt));
}
function collectAppData() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('bussola.')) o[k] = localStorage.getItem(k); } return o; }

function viewSoberania() {
  menuBtn.hidden = true;
  const RX_KEY = 'bussola.raiox.v1', LG_KEY = 'bussola.legado.v1';
  const rxSet = (() => { try { return new Set(JSON.parse(localStorage.getItem(RX_KEY) || '[]')); } catch { return new Set(); } })();
  const lg = (() => { try { return JSON.parse(localStorage.getItem(LG_KEY) || '{}'); } catch { return {}; } })();

  appEl.innerHTML = `
    <div class="pad">
      <h1>🛡️ Soberania <span class="muted small">segurança para a vida toda</span></h1>
      <p class="muted">O que o mercado esquece: bitcoin não é só comprar e guardar — é <strong>manter
      seguro</strong> e <strong>transmitir</strong>. Aqui você se autoavalia, monta seu plano de
      herança e protege seus dados. Tudo <strong>no seu aparelho</strong>.</p>

      <section class="watchonly">
        <h2>📡 Raio-X da Soberania</h2>
        <p class="muted">Marque o que já é verdade. Vira uma nota e um plano de ação.</p>
        <div id="rxList"></div>
        <div id="rxResult"></div>
      </section>

      <section class="watchonly">
        <h2>🕊️ Legado — plano de herança</h2>
        <div class="banner warn">⚠️ <strong>Nunca</strong> escreva sua seed aqui — só <strong>onde
        encontrá-la</strong>. Este plano não substitui testamento/inventário (procure orientação jurídica).</div>
        <form id="lgForm" class="regform">
          ${LEGADO_FIELDS.map(f => {
            const val = lg[f.k] ? esc(lg[f.k]) : '';
            if (f.type === 'textarea') return `<label style="grid-column:1/-1">${f.label}<textarea id="lg_${f.k}" rows="2" spellcheck="false" placeholder="${f.ph || ''}">${val}</textarea></label>`;
            if (f.type === 'select') return `<label>${f.label}<select id="lg_${f.k}">${['', ...f.opts].map(o => `<option ${lg[f.k] === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
            return `<label${f.k === 'titular' ? ' style="grid-column:1/-1"' : ''}>${f.label}<input type="${f.type}" id="lg_${f.k}" value="${val}"></label>`;
          }).join('')}
          <button type="submit">Salvar plano</button>
        </form>
        <div class="regactions">
          <button id="lgPrint" class="btn-ghost">🖨️ Imprimir / PDF</button>
          <button id="lgExport" class="btn-ghost">⬇️ Exportar (.md)</button>
        </div>
        <div id="lgOut"></div>
      </section>

      <section class="watchonly">
        <h2>🔒 Cofre — backup criptografado</h2>
        <p class="muted">Exporte tudo (checklist, registro, raio-x, legado) num arquivo
        <strong>criptografado</strong> (AES-256-GCM) com uma senha. Sem a senha, ninguém abre.</p>
        <div class="banner warn">Guarde a senha com cuidado: <strong>sem ela o backup é irrecuperável</strong>
        (é essa a ideia). Este cofre <strong>não</strong> contém sua seed.</div>
        <form id="cfForm" class="regform">
          <label style="grid-column:1/-1">Senha do backup<input type="password" id="cfPass" autocomplete="new-password"></label>
          <button type="submit">Exportar cofre</button>
        </form>
        <div class="regactions">
          <label class="btn-ghost" style="cursor:pointer">⬆️ Restaurar backup<input type="file" id="cfFile" accept="application/json" hidden></label>
        </div>
        <div id="cfOut"></div>
      </section>

      <section class="watchonly">
        <h2>🔗 Prova de Integridade <span class="muted small">SHA-256</span></h2>
        <p class="muted">Gere a "impressão digital" de um comprovante, declaração ou do seu plano.
        Se o arquivo mudar 1 byte, o hash muda. Guarde o hash para provar depois que o documento é o mesmo.</p>
        <div class="regform"><label style="grid-column:1/-1">Escolha um arquivo<input type="file" id="piFile"></label></div>
        <div id="piOut"></div>
        <p class="muted small">Próximo passo (roadmap): ancorar este hash no Bitcoin via
        <a href="https://opentimestamps.org" target="_blank" rel="noopener">OpenTimestamps</a> — prova de
        data inviolável, que só fica mais forte com o tempo.</p>
        <div id="piList"></div>
      </section>
    </div>`;

  // ---- Raio-X ----
  const rxList = document.getElementById('rxList');
  function renderRX() {
    rxList.innerHTML = RAIOX.map(it => `<label class="ck-item"><input type="checkbox" data-id="${it.id}" ${rxSet.has(it.id) ? 'checked' : ''}><span>${esc(it.q)}</span></label>`).join('');
    rxList.querySelectorAll('input').forEach(inp => inp.addEventListener('change', () => {
      inp.checked ? rxSet.add(inp.dataset.id) : rxSet.delete(inp.dataset.id);
      try { localStorage.setItem(RX_KEY, JSON.stringify([...rxSet])); } catch {}
      renderResult();
    }));
  }
  function renderResult() {
    const r = scoreRaioX(rxSet);
    document.getElementById('rxResult').innerHTML = `
      <div class="rxhead"><div class="gauge ${r.cls}"><div class="gnum">${r.score}</div></div>
        <div><span class="badge ${r.cls}">${r.tier}</span><div class="muted small">nota de soberania (0–100)</div></div></div>
      ${r.gaps.length ? `<h3>Próximos passos</h3><ul class="gaps">${r.gaps.map(g => `<li>${esc(g.tip)} <a href="${g.link}">ver →</a></li>`).join('')}</ul>`
        : '<div class="banner ok">🏆 Soberania plena nos itens essenciais. Excelente!</div>'}`;
  }
  renderRX(); renderResult();

  // ---- Legado ----
  function legadoData() { const d = {}; LEGADO_FIELDS.forEach(f => { d[f.k] = (document.getElementById('lg_' + f.k) || {}).value || ''; }); return d; }
  document.getElementById('lgForm').addEventListener('submit', e => {
    e.preventDefault();
    try { localStorage.setItem(LG_KEY, JSON.stringify(legadoData())); } catch {}
    document.getElementById('lgOut').innerHTML = '<div class="banner ok">✅ Plano salvo no aparelho.</div>';
  });
  document.getElementById('lgExport').addEventListener('click', () => {
    const md = legadoMarkdown(legadoData());
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'plano-de-legado.md'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('lgPrint').addEventListener('click', () => {
    const md = legadoMarkdown(legadoData());
    const w = window.open('', '_blank');
    if (!w) { document.getElementById('lgOut').innerHTML = '<p class="muted">Permita pop-ups para imprimir, ou use Exportar (.md).</p>'; return; }
    w.document.write(`<!doctype html><meta charset="utf-8"><title>Plano de Legado</title>
      <style>body{font:15px/1.6 system-ui,Arial;max-width:720px;margin:32px auto;padding:0 16px;color:#111}
      h1{font-size:24px}h2{font-size:17px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:24px}</style>
      <pre style="white-space:pre-wrap;font:inherit">${md.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</pre>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 250);
  });

  // ---- Cofre ----
  document.getElementById('cfForm').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('cfOut');
    const pass = document.getElementById('cfPass').value;
    if (pass.length < 6) { o.innerHTML = '<p class="muted">Use uma senha de pelo menos 6 caracteres.</p>'; return; }
    try {
      const blob = await encryptJSON(collectAppData(), pass);
      const url = URL.createObjectURL(new Blob([JSON.stringify(blob, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'bussola-cofre.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.getElementById('cfPass').value = '';
      o.innerHTML = '<div class="banner ok">🔒 Cofre exportado e criptografado.</div>';
    } catch (err) { o.innerHTML = `<p class="muted">Falha ao criptografar: ${esc(err.message)}</p>`; }
  });
  document.getElementById('cfFile').addEventListener('change', async e => {
    const o = document.getElementById('cfOut');
    const file = e.target.files[0]; if (!file) return;
    const pass = prompt('Senha do backup:'); if (!pass) return;
    try {
      const blob = JSON.parse(await file.text());
      const data = await decryptJSON(blob, pass);
      Object.entries(data).forEach(([k, v]) => { if (k.startsWith('bussola.')) localStorage.setItem(k, v); });
      o.innerHTML = '<div class="banner ok">✅ Backup restaurado. Recarregando…</div>';
      setTimeout(() => location.reload(), 900);
    } catch (err) { o.innerHTML = `<p class="muted">Não consegui restaurar (senha errada ou arquivo inválido).</p>`; }
    finally { e.target.value = ''; }
  });

  // ---- Prova de Integridade ----
  const PI_KEY = 'bussola.provas.v1';
  const piLoad = () => { try { return JSON.parse(localStorage.getItem(PI_KEY) || '[]'); } catch { return []; } };
  const piSave = a => { try { localStorage.setItem(PI_KEY, JSON.stringify(a)); } catch {} };
  function piRender() {
    const a = piLoad(), el = document.getElementById('piList');
    el.innerHTML = a.length ? `<h3>Provas guardadas</h3><div class="tablewrap"><table><thead><tr><th>Quando</th><th>Arquivo</th><th>SHA-256</th></tr></thead><tbody>
      ${a.map(p => `<tr><td>${esc(p.date)}</td><td>${esc(p.name)}</td><td class="mono">${esc(p.hash)}</td></tr>`).join('')}</tbody></table></div>` : '';
  }
  document.getElementById('piFile').addEventListener('change', async e => {
    const o = document.getElementById('piOut'), f = e.target.files[0]; if (!f) return;
    const W = window.BussolaWallet;
    if (!W || !W.sha256Hex) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    o.innerHTML = '<p class="loading">Calculando SHA-256…</p>';
    try {
      const hash = W.sha256Hex(new Uint8Array(await f.arrayBuffer()));
      o.innerHTML = `<div class="banner ok">SHA-256 de <strong>${esc(f.name)}</strong>:</div>
        <textarea class="mono" rows="2" readonly></textarea>
        <div class="regactions"><button type="button" class="btn-ghost" id="piSaveBtn">Guardar prova</button></div>`;
      o.querySelector('textarea').value = hash;
      const name = f.name;
      document.getElementById('piSaveBtn').addEventListener('click', () => {
        const a = piLoad(); a.unshift({ date: new Date().toLocaleString('pt-BR'), name, hash }); piSave(a); piRender();
      });
    } catch (err) { o.innerHTML = `<p class="muted">Falha ao ler o arquivo: ${esc(err.message)}</p>`; }
    finally { e.target.value = ''; }
  });
  piRender();
}

/* =================== Roteador =================== */
const ROUTES = { painel: viewPainel, book: viewBook, historico: viewHistorico, checklist: viewChecklist, registro: viewRegistro, carteira: viewCarteira, soberania: viewSoberania };
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

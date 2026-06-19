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
  { id: '10', file: 'docs/10-GLOSSARIO.md',     emoji: '📖', title: 'Glossário' },
  { id: '11', file: 'docs/11-FAQ.md',           emoji: '❓', title: 'Perguntas frequentes' },
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
  const seen = (() => { try { return localStorage.getItem('bussola.seen.v1'); } catch { return '1'; } })();
  const welcome = seen ? '' : `<div class="banner ok" id="welcome">👋 <strong>Bem-vindo à Bússola.</strong>
    Aprenda, decida e conquiste sua soberania em bitcoin — do off ao online, em PT-BR, sem coleta de
    dados. Comece pelo <a href="#book/00">Book</a> ou pelo <a href="#checklist">Checklist</a>.
    <button id="welcomeX" type="button" class="btn-ghost">Entendi</button></div>`;
  appEl.innerHTML = `
    <div class="pad">
      <div class="hero"><img src="assets/hero.svg" alt="Bússola — bitcoin soberano"></div>
      <h1>📊 Painel <span class="muted small">tudo pra decidir, num lugar só</span></h1>
      ${welcome}
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

      <h2>Sobre</h2>
      <div class="banner ok">🔓 Código aberto • 🙈 sem coleta de dados • 🏦 sem custódia • 📚 educacional (não é recomendação).</div>
      <p class="muted small">Bússola • PWA offline-first • leia a <a href="#book/08">Estratégia</a> e a
      <a href="#book/09">Segurança</a> · monte sua <a href="#carteira">carteira soberana</a> e seu
      <a href="#soberania">Legado</a>.</p>
    </div>`;
  document.getElementById('welcomeX')?.addEventListener('click', () => {
    try { localStorage.setItem('bussola.seen.v1', '1'); } catch {}
    document.getElementById('welcome')?.remove();
  });
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
        <label style="grid-column:1/-1">Chave brapi.dev <span class="muted small">(opcional — necessária p/ mais de 1 ano)</span>
          <input type="password" id="dKey" autocomplete="off" spellcheck="false" placeholder="cole a chave — fica só neste navegador, nunca sai daqui"></label>
        <button type="submit">Simular</button>
      </form>
      <p class="muted small">Sem chave, uso o CoinGecko (grátis, até 1 ano). Para 2–5 anos em BRL, pegue uma
      chave gratuita em <strong>brapi.dev</strong> — ela é salva <strong>só no seu aparelho</strong>.</p>
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
        <label style="grid-column:1/-1"><input type="checkbox" id="txProg" checked> Usar tabela progressiva de ganho de capital (15% → 22,5%)</label>
        <label>Alíquota fixa (%) <span class="muted small">se desmarcar acima</span><input type="number" id="txAliq" min="0" step="0.1" value="15"></label>
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

  const dKeyEl = document.getElementById('dKey');
  try { const sk = localStorage.getItem('bussola_brapi_key'); if (sk && dKeyEl) dKeyEl.value = sk; } catch {}

  // brapi.dev (BRL nativo, histórico multi-ano) — usa a chave do próprio usuário (BYO-key)
  async function dcaBrapi(years, key) {
    const range = years <= 1 ? '1y' : years <= 2 ? '2y' : '5y';
    const url = `https://brapi.dev/api/v2/crypto?coin=BTC&currency=BRL&range=${range}&interval=1mo&token=${encodeURIComponent(key)}`;
    const r = await fetch(url, { cache: 'no-store' });
    if (r.status === 401 || r.status === 403) throw new Error('chave brapi recusada (401/403)');
    if (!r.ok) throw new Error('brapi HTTP ' + r.status);
    const j = await r.json();
    const coin = (j.coins && j.coins[0]) || (j.results && j.results[0]);
    const hist = coin && coin.historicalDataPrice;
    if (!Array.isArray(hist) || hist.length < 2) throw new Error('brapi sem histórico (confira o plano da chave)');
    const cutoff = Date.now() - years * 365.25 * 86400e3;
    const prices = hist.filter(h => h && h.close > 0).map(h => [h.date * 1000, h.close]).filter(p => p[0] >= cutoff);
    if (coin.regularMarketPrice > 0) prices.push([Date.now(), coin.regularMarketPrice]); // preço de hoje ao vivo
    return prices;
  }
  // CoinGecko grátis (sem chave) — limite de 365 dias no plano público
  async function dcaGecko(years) {
    if (years > 1) throw new Error('NEED_KEY');
    const r = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=365', { cache: 'no-store' });
    if (!r.ok) throw new Error('CoinGecko HTTP ' + r.status);
    const prices = (await r.json()).prices || [];
    if (prices.length < 2) throw new Error('sem dados');
    return prices;
  }

  document.getElementById('dcaForm').addEventListener('submit', async e => {
    e.preventDefault();
    const monthly = parseFloat(document.getElementById('dValor').value);
    const years = parseInt(document.getElementById('dAnos').value, 10);
    const key = (dKeyEl && dKeyEl.value.trim()) || '';
    const out = document.getElementById('dcaOut');
    if (!(monthly > 0)) { out.innerHTML = '<p class="muted">Informe um valor mensal maior que zero.</p>'; return; }
    out.innerHTML = '<p class="loading">Buscando preços históricos reais…</p>';
    try {
      let prices, source;
      if (key) { try { localStorage.setItem('bussola_brapi_key', key); } catch {} prices = await dcaBrapi(years, key); source = 'brapi.dev'; }
      else {
        try { prices = await dcaGecko(years); source = 'CoinGecko'; }
        catch (ne) {
          if (ne.message === 'NEED_KEY') { out.innerHTML = `<div class="banner warn">Para <strong>${years} anos</strong> em BRL preciso de uma chave gratuita do <strong>brapi.dev</strong> — o CoinGecko grátis só vai até 1 ano. Cole a chave no campo acima (fica só neste navegador).</div>`; return; }
          throw ne;
        }
      }
      const s = simulateDCA(prices, monthly);
      const lucro = s.value - s.invested, pct = s.invested > 0 ? lucro / s.invested * 100 : 0, up = lucro >= 0;
      out.innerHTML = `<div class="cards">
        <div class="card"><h3>Investido (${s.months} meses)</h3><div class="big">${BRL.format(s.invested)}</div></div>
        <div class="card"><h3>BTC acumulado</h3><div class="big">${BTC.format(s.btc)}</div><div class="sub muted">${BRL.format(s.last)} / BTC hoje</div></div>
        <div class="card"><h3>Valor hoje</h3><div class="big">${BRL.format(s.value)}</div>
          <div class="sub"><span class="${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${BRL.format(Math.abs(lucro))} (${Math.abs(pct).toFixed(0)}%)</span></div></div>
      </div>
      <div class="banner warn">⚠️ Simulação com <strong>dados reais do passado</strong> (${source}).
      <strong>Resultado passado NÃO garante futuro.</strong> Educacional, não é recomendação.</div>`;
    } catch (err) {
      out.innerHTML = `<p class="muted">Não consegui buscar o histórico agora (${esc(String(err.message))}). ${key ? 'Confira sua chave/plano no brapi.dev.' : 'Tente online ou adicione uma chave brapi.dev para períodos longos.'}</p>`;
    }
  });

  document.getElementById('taxForm').addEventListener('submit', e => {
    e.preventDefault();
    const W = window.BussolaWallet, o = document.getElementById('taxOut');
    if (!W || !W.estimarImposto) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    const prog = document.getElementById('txProg').checked;
    const r = W.estimarImposto({
      vendaMes: parseFloat(document.getElementById('txMes').value) || 0,
      valorVenda: parseFloat(document.getElementById('txVenda').value) || 0,
      custo: parseFloat(document.getElementById('txCusto').value) || 0,
      limite: parseFloat(document.getElementById('txLimite').value) || 35000,
      progressivo: prog,
      aliquota: prog ? null : (parseFloat(document.getElementById('txAliq').value) || 15),
    });
    const detalhe = r.isento ? '<strong>Isento</strong> nesta estimativa'
      : `Imposto estimado: <strong>${BRL.format(r.imposto)}</strong> <span class="muted small">(alíq. efetiva ${r.aliquotaEfetiva.toFixed(1)}%${r.progressivo ? ', tabela progressiva' : ''})</span>`;
    o.innerHTML = `<div class="banner ${r.isento ? 'ok' : 'warn'}">Ganho estimado: <strong>${BRL.format(r.ganho)}</strong> · ${detalhe}.</div>
      ${r.isento ? '' : '<p class="muted small">Recolhimento via <strong>DARF</strong> (ganho de capital, pessoa física) até o último dia útil do mês seguinte à venda.</p>'}
      <p class="muted small">Estimativa educacional. Confirme as regras vigentes e seu enquadramento com contador(a).</p>`;
  });

  renderList(); renderSummary();
}

/* Scanner de QR pela câmera (offline-friendly). Chama onResult(texto) ao ler. */
async function openScanner(onResult) {
  const W = window.BussolaWallet;
  if (!W || !W.decodeQR) { alert('Núcleo da carteira não carregou.'); return; }
  if (!navigator.mediaDevices?.getUserMedia) { alert('Câmera indisponível neste navegador/contexto (precisa de HTTPS).'); return; }
  const ov = document.createElement('div');
  ov.className = 'scanner';
  ov.innerHTML = `<div class="scanner-box"><video playsinline muted></video>
    <div class="scanner-bar"><span>Aponte para o QR…</span><button type="button" class="btn-ghost" data-x>Cancelar</button></div></div>`;
  document.body.appendChild(ov);
  const video = ov.querySelector('video');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let stream = null, raf = 0, done = false;
  function cleanup() { done = true; cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(t => t.stop()); ov.remove(); }
  ov.querySelector('[data-x]').addEventListener('click', cleanup);
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream; await video.play();
  } catch { cleanup(); alert('Não consegui acessar a câmera (permissão negada?).'); return; }
  function tick() {
    if (done) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const w = video.videoWidth, h = video.videoHeight;
      canvas.width = w; canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      try {
        const img = ctx.getImageData(0, 0, w, h);
        const text = W.decodeQR(img.data, w, h);
        if (text) { cleanup(); onResult(text); return; }
      } catch {}
    }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
}

/* =================== Carteira =================== */
const EXAMPLE_XPUB = 'xpub6Bqrcfo7nB1ywHwEvjikTNcd2jyTksXZLFkwJxUyeHJy8USaxusZpdfYUjMHoL1rAswEHBBoFX9gPW6uJy5EBoVc4NgWZfG21sDG8XSU7q6';
const DEFAULT_ESPLORA = 'https://mempool.space/testnet/api';
const ESPLORA_KEY = 'bussola.esplora.v1';
function esploraBase() { try { return (localStorage.getItem(ESPLORA_KEY) || DEFAULT_ESPLORA).replace(/\/+$/, ''); } catch { return DEFAULT_ESPLORA; } }

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
        <h2>🌐 Conexão <span class="muted small">privacidade</span></h2>
        <p class="muted">Por padrão consultamos saldos/UTXOs via mempool.space (testnet). Para
        <strong>não revelar seus endereços</strong> a terceiros, aponte para o <strong>seu próprio nó</strong>
        (Esplora/Electrs).</p>
        <form id="cxForm" class="regform">
          <label style="grid-column:1/-1">Endpoint Esplora (testnet)<input type="text" id="cxUrl" spellcheck="false" placeholder="${DEFAULT_ESPLORA}"></label>
          <button type="submit">Salvar</button>
        </form>
        <div class="regactions"><button id="cxReset" class="btn-ghost" type="button">Voltar ao padrão</button></div>
        <div id="cxOut"></div>
      </section>

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
            <label style="grid-column:1/-1">PSBT a assinar (cole ou 📷)<textarea id="agPsbtIn" rows="3" spellcheck="false"></textarea></label>
            <label style="grid-column:1/-1">Sua frase (12/24 palavras)<input type="text" id="agSeed" autocomplete="off" spellcheck="false"></label>
            <button type="submit">Assinar (offline)</button>
          </form>
          <div class="regactions"><button type="button" class="btn-ghost" id="agScanPsbt">📷 Escanear PSBT</button></div>
          <div id="agSignOut"></div>
        </div>

        <div class="agstep">
          <h3>3) Transmitir <span class="muted small">online · sem chave</span></h3>
          <form id="agSend" class="regform">
            <label style="grid-column:1/-1">PSBT assinado (cole ou 📷)<textarea id="agSignedIn" rows="3" spellcheck="false"></textarea></label>
            <button type="submit">Finalizar e transmitir</button>
          </form>
          <div class="regactions"><button type="button" class="btn-ghost" id="agScanSigned">📷 Escanear PSBT assinado</button></div>
          <div id="agSendOut"></div>
        </div>
      </section>

      <section class="watchonly">
        <h2>🔗 Multisig 2-de-3 <span class="soon">testnet beta</span></h2>
        <p class="muted">Custódia colaborativa / herança: 3 chaves, <strong>2 assinaturas</strong> para
        gastar. Cada cosigner gera a sua e compartilha só a <strong>xpub</strong>. Ninguém sozinho move os fundos.</p>

        <div class="agstep">
          <h3>1) Sua chave de cosigner</h3>
          <div class="regactions"><button type="button" class="btn-ghost" id="msGen">🎲 Gerar minha chave</button></div>
          <div id="msGenOut"></div>
        </div>
        <div class="agstep">
          <h3>2) O grupo (3 xpubs de cosigner)</h3>
          <form id="msGroup" class="regform">
            <label style="grid-column:1/-1">Cosigner A (xpub)<input id="msA" spellcheck="false" autocomplete="off"></label>
            <label style="grid-column:1/-1">Cosigner B (xpub)<input id="msB" spellcheck="false" autocomplete="off"></label>
            <label style="grid-column:1/-1">Cosigner C (xpub)<input id="msC" spellcheck="false" autocomplete="off"></label>
            <button type="submit">Ver endereços do cofre</button>
          </form>
          <div id="msAddrs"></div>
        </div>
        <div class="agstep">
          <h3>3) Enviar (online, sem chave)</h3>
          <form id="msSend" class="regform">
            <label style="grid-column:1/-1">Destino (tb1…)<input id="msTo" spellcheck="false" autocomplete="off"></label>
            <label>Valor (sats)<input type="number" id="msAmt" min="1" step="1"></label>
            <label>Taxa (sat/vB)<input type="number" id="msFee" min="1" step="1" value="2"></label>
            <button type="submit">Montar PSBT</button>
          </form>
          <div id="msBuildOut"></div>
        </div>
        <div class="agstep">
          <h3>4) Assinar (cada cosigner, offline)</h3>
          <form id="msSign" class="regform">
            <label style="grid-column:1/-1">PSBT (cole ou 📷)<textarea id="msPsbtIn" rows="3" spellcheck="false"></textarea></label>
            <label style="grid-column:1/-1">Sua frase (cosigner)<input id="msSeed" spellcheck="false" autocomplete="off"></label>
            <button type="submit">Assinar</button>
          </form>
          <div class="regactions"><button type="button" class="btn-ghost" id="msScan">📷 Escanear PSBT</button></div>
          <div id="msSignOut"></div>
        </div>
        <div class="agstep">
          <h3>5) Transmitir (com 2 assinaturas)</h3>
          <form id="msSendTx" class="regform">
            <label style="grid-column:1/-1">PSBT assinado por 2 (cole)<textarea id="msSignedIn" rows="3" spellcheck="false"></textarea></label>
            <button type="submit">Finalizar e transmitir</button>
          </form>
          <div id="msTxOut"></div>
        </div>
      </section>

      <section class="watchonly">
        <h2>💸 Pagar Silent Payment <span class="soon">BIP-352 · testnet</span></h2>
        <p class="muted">Envie da sua carteira testnet para um endereço <strong>sp1…/tsp1…</strong>. O endereço
        on-chain do destino é derivado por você (privacidade) — núcleo validado contra o vetor oficial do BIP-352.</p>
        <div class="banner warn">⚠️ Consolida TODAS as UTXOs da carteira numa transação. Pede a sua frase (assina no aparelho, nada sai daqui sem ser a transação final).</div>
        <form id="spsForm" class="regform">
          <label style="grid-column:1/-1">Destino (sp1…/tsp1…)<input id="spsTo" spellcheck="false" autocomplete="off"></label>
          <label>Valor (sats)<input type="number" id="spsAmt" min="1" step="1"></label>
          <label>Taxa (sat/vB)<input type="number" id="spsFee" min="1" step="1" value="2"></label>
          <label style="grid-column:1/-1">Sua frase (12/24 palavras)<input id="spsSeed" spellcheck="false" autocomplete="off"></label>
          <button type="submit">Pagar</button>
        </form>
        <div id="spsOut"></div>
      </section>

      <section class="watchonly">
        <h2>🏛️ Cofre de herança — <strong>Interruptor da Vida</strong> <span class="soon">timelock · testnet beta</span></h2>
        <p class="muted">Um <strong>dead man's switch</strong> sem empresa e sem oráculo: <strong>2-de-3</strong> agora (você + pessoas de confiança),
        OU o <strong>herdeiro sozinho</strong> depois de um tempo <strong>sem movimento</strong> (timelock). Enquanto você toca suas moedas
        (<strong>prova de vida</strong>), só você manda; se você sumir, a herança abre <strong>sozinha</strong>. Use o botão
        <strong>🫀 Status do Interruptor</strong> (passo 2) para ver a contagem regressiva.</p>
        <div class="banner warn">⚠️ Protótipo testnet. Timelock é <strong>relativo</strong> (conta blocos desde que a UTXO foi recebida) — mover o saldo zera o relógio. ~144 blocos ≈ 1 dia.</div>

        <div class="agstep">
          <h3>1) Chaves (3 guardiões + 1 herdeiro)</h3>
          <div class="regactions"><button type="button" class="btn-ghost" id="ihGen">🎲 Gerar uma chave</button></div>
          <div id="ihGenOut"></div>
        </div>
        <div class="agstep">
          <h3>2) Montar o cofre</h3>
          <form id="ihGroup" class="regform">
            <label style="grid-column:1/-1">Guardião A (xpub)<input id="ihA" spellcheck="false" autocomplete="off"></label>
            <label style="grid-column:1/-1">Guardião B (xpub)<input id="ihB" spellcheck="false" autocomplete="off"></label>
            <label style="grid-column:1/-1">Guardião C (xpub)<input id="ihC" spellcheck="false" autocomplete="off"></label>
            <label style="grid-column:1/-1">Herdeiro (xpub)<input id="ihHeir" spellcheck="false" autocomplete="off"></label>
            <label>Timelock (blocos)<input type="number" id="ihTL" min="1" max="65535" value="144"></label>
            <button type="submit">Ver endereços do cofre</button>
          </form>
          <div id="ihAddrs"></div>
        </div>
        <div class="agstep">
          <h3>3) Enviar do cofre (online, sem chave)</h3>
          <form id="ihSend" class="regform">
            <label style="grid-column:1/-1">Destino (tb1…)<input id="ihTo" spellcheck="false" autocomplete="off"></label>
            <label>Valor (sats)<input type="number" id="ihAmt" min="1" step="1"></label>
            <label>Taxa (sat/vB)<input type="number" id="ihFee" min="1" step="1" value="2"></label>
            <label style="grid-column:1/-1">Caminho<select id="ihMode"><option value="normal">Normal — 2 de 3 guardiões</option><option value="recovery">Resgate — herdeiro após o timelock</option></select></label>
            <button type="submit">Montar PSBT</button>
          </form>
          <div id="ihBuildOut"></div>
        </div>
        <div class="agstep">
          <h3>4) Assinar (guardião ou herdeiro, offline)</h3>
          <form id="ihSign" class="regform">
            <label style="grid-column:1/-1">PSBT (cole ou 📷)<textarea id="ihPsbtIn" rows="3" spellcheck="false"></textarea></label>
            <label style="grid-column:1/-1">Sua frase<input id="ihSeed" spellcheck="false" autocomplete="off"></label>
            <button type="submit">Assinar</button>
          </form>
          <div class="regactions"><button type="button" class="btn-ghost" id="ihScan">📷 Escanear PSBT</button></div>
          <div id="ihSignOut"></div>
        </div>
        <div class="agstep">
          <h3>5) Finalizar e transmitir</h3>
          <form id="ihSendTx" class="regform">
            <label style="grid-column:1/-1">PSBT assinado (cole)<textarea id="ihSignedIn" rows="3" spellcheck="false"></textarea></label>
            <label style="grid-column:1/-1">Caminho usado<select id="ihMode2"><option value="normal">Normal — 2 de 3</option><option value="recovery">Resgate — herdeiro</option></select></label>
            <button type="submit">Finalizar e transmitir</button>
          </form>
          <div id="ihTxOut"></div>
        </div>
      </section>

      <h2>Arquitetura completa</h2>
      <article id="doc" class="doc"><p class="loading">Carregando arquitetura…</p></article>
    </div>`;

  let current = [];
  const out = document.getElementById('woOut');
  const wallet = window.BussolaWallet;

  // ---- Conexão (Esplora) ----
  const cxUrl = document.getElementById('cxUrl');
  cxUrl.value = esploraBase();
  document.getElementById('cxForm').addEventListener('submit', e => {
    e.preventDefault();
    try { localStorage.setItem(ESPLORA_KEY, cxUrl.value.trim() || DEFAULT_ESPLORA); } catch {}
    document.getElementById('cxOut').innerHTML = '<div class="banner ok">Conexão salva. Saldos/UTXOs usarão este endpoint.</div>';
  });
  document.getElementById('cxReset').addEventListener('click', () => {
    try { localStorage.removeItem(ESPLORA_KEY); } catch {}
    cxUrl.value = DEFAULT_ESPLORA;
    document.getElementById('cxOut').innerHTML = '<div class="banner ok">Voltou ao padrão (mempool.space testnet).</div>';
  });

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
    out.innerHTML = `<div class="tablewrap"><table><thead><tr><th>Caminho</th><th>Endereço (tb1…)</th><th></th></tr></thead><tbody>
      ${list.map(a => `<tr><td>${a.path}</td><td class="mono">${a.address}</td><td><button type="button" class="btn-ghost qrbtn" data-addr="${a.address}">QR</button></td></tr>`).join('')}
    </tbody></table></div><div id="woQr"></div>`;
    out.querySelectorAll('.qrbtn').forEach(b => b.addEventListener('click', () => {
      const qr = (wallet && wallet.makeQR) ? wallet.makeQR(b.dataset.addr) : null;
      document.getElementById('woQr').innerHTML = qr
        ? `<div class="muted small">Receber em: <span class="mono">${esc(b.dataset.addr)}</span></div><div class="qr">${qr}</div>`
        : '<p class="muted small">Não foi possível gerar o QR.</p>';
    }));
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
        const r = await fetch(`${esploraBase()}/address/${a.address}`, { cache: 'no-store' });
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
        const r = await fetch(`${esploraBase()}/address/${t.address}/utxo`, { cache: 'no-store' });
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
      const r = await fetch(`${esploraBase()}/tx`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: fin.hex });
      const body = (await r.text()).trim();
      if (!r.ok) throw new Error(body || ('HTTP ' + r.status));
      o.innerHTML = `<div class="banner ok">✅ Transmitido!<br>txid: <span class="mono">${esc(body)}</span><br>
        <a href="https://mempool.space/testnet/tx/${esc(body)}" target="_blank" rel="noopener">ver no explorer</a></div>`;
    } catch (err) {
      o.innerHTML = `<div class="banner warn">Não transmitiu agora (${esc(err.message)}). Dá pra transmitir este tx (hex) manualmente:</div><div id="agHexPay"></div>`;
      renderPayload(document.getElementById('agHexPay'), 'Transação final (hex)', fin.hex);
    }
  });

  document.getElementById('agScanPsbt')?.addEventListener('click', () => openScanner(t => { document.getElementById('agPsbtIn').value = t; }));
  document.getElementById('agScanSigned')?.addEventListener('click', () => openScanner(t => { document.getElementById('agSignedIn').value = t; }));

  // sugestão de taxa (testnet, mempool.space) — prefill se o usuário não mexeu
  const feeEl = document.getElementById('agFee');
  feeEl.addEventListener('input', () => { feeEl.dataset.touched = '1'; });
  fetch(`${esploraBase()}/v1/fees/recommended`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(d => {
    if (d && d.halfHourFee && !feeEl.dataset.touched) feeEl.value = Math.max(1, d.halfHourFee);
  }).catch(() => {});

  // ---- Multisig 2-de-3 ----
  const MSG_KEY = 'bussola.msgroup.v1';
  const msXpubs = () => [document.getElementById('msA').value.trim(), document.getElementById('msB').value.trim(), document.getElementById('msC').value.trim()];
  (() => { try { const g = JSON.parse(localStorage.getItem(MSG_KEY) || 'null'); if (g) { document.getElementById('msA').value = g[0] || ''; document.getElementById('msB').value = g[1] || ''; document.getElementById('msC').value = g[2] || ''; } } catch {} })();
  async function scanUtxosMs(xpubs) {
    const targets = [...wallet.multisigAddresses(xpubs, 2, 10, 0), ...wallet.multisigAddresses(xpubs, 2, 5, 1)];
    const utxos = [];
    await Promise.all(targets.map(async t => {
      try { const r = await fetch(`${esploraBase()}/address/${t.address}/utxo`, { cache: 'no-store' }); if (!r.ok) return;
        for (const u of await r.json()) utxos.push({ txid: u.txid, vout: u.vout, valueSats: u.value, chain: t.chain, index: t.index, height: u.status?.block_height || 0 }); } catch {}
    }));
    return utxos;
  }
  document.getElementById('msGen')?.addEventListener('click', () => {
    if (!wallet) return;
    const c = wallet.createMultisigCosigner(), o = document.getElementById('msGenOut');
    o.innerHTML = `<div class="seedbox"><h3>📝 Anote sua frase (cosigner):</h3>
      <ol class="seedwords">${c.mnemonic.split(' ').map(w => `<li>${esc(w)}</li>`).join('')}</ol>
      <div class="banner warn">Guarde offline. Compartilhe com o grupo APENAS a xpub abaixo (nunca a frase).</div>
      <div class="muted small">Sua xpub de cosigner (compartilhe):</div><textarea class="mono" rows="2" readonly></textarea></div>`;
    o.querySelector('textarea').value = c.accountXpub;
  });
  document.getElementById('msGroup').addEventListener('submit', e => {
    e.preventDefault();
    const o = document.getElementById('msAddrs'), xpubs = msXpubs();
    if (xpubs.some(x => !x)) { o.innerHTML = '<p class="muted">Preencha as 3 xpubs de cosigner.</p>'; return; }
    try {
      const addrs = wallet.multisigAddresses(xpubs, 2, 5, 0);
      try { localStorage.setItem(MSG_KEY, JSON.stringify(xpubs)); } catch {}
      o.innerHTML = `<div class="banner ok">Cofre 2-de-3 criado.</div>
        <div class="tablewrap"><table><thead><tr><th>Caminho</th><th>Endereço</th><th></th></tr></thead><tbody>
        ${addrs.map(a => `<tr><td>${a.path}</td><td class="mono">${a.address}</td><td><button type="button" class="btn-ghost qrbtn" data-addr="${a.address}">QR</button></td></tr>`).join('')}
        </tbody></table></div><div class="regactions"><button type="button" class="btn-ghost" id="msBal">Consultar saldo do cofre</button></div><div id="msQr"></div>`;
      o.querySelectorAll('.qrbtn').forEach(b => b.addEventListener('click', () => { const q = wallet.makeQR(b.dataset.addr); document.getElementById('msQr').innerHTML = q ? `<div class="muted small mono">${esc(b.dataset.addr)}</div><div class="qr">${q}</div>` : ''; }));
      document.getElementById('msBal').addEventListener('click', async () => {
        document.getElementById('msQr').innerHTML = '<p class="loading">Consultando…</p>';
        const u = await scanUtxosMs(xpubs); const total = u.reduce((s, x) => s + x.valueSats, 0);
        document.getElementById('msQr').innerHTML = `<div class="banner ok">Saldo do cofre: <strong>${BTC.format(total / 1e8)} tBTC</strong> (${u.length} UTXOs).</div>`;
      });
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  document.getElementById('msSend').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('msBuildOut'), xpubs = msXpubs();
    if (xpubs.some(x => !x)) { o.innerHTML = '<p class="muted">Defina o grupo (passo 2).</p>'; return; }
    const to = document.getElementById('msTo').value.trim(), amt = parseInt(document.getElementById('msAmt').value, 10), fee = parseInt(document.getElementById('msFee').value, 10) || 2;
    if (!to || !(amt > 0)) { o.innerHTML = '<p class="muted">Preencha destino e valor.</p>'; return; }
    o.innerHTML = '<p class="loading">Buscando UTXOs do cofre…</p>';
    try {
      const utxos = await scanUtxosMs(xpubs);
      const res = wallet.buildMultisigPsbt({ xpubs, m: 2, utxos, toAddress: to, amountSats: amt, feeRate: fee });
      o.innerHTML = `<div class="banner ok">Montado: entrada ${res.totalIn} · taxa ${res.fee} · troco ${res.change} sats.</div><div id="msPay"></div><p class="muted small">Leve a 2 cosigners para assinar (passo 4).</p>`;
      renderPayload(document.getElementById('msPay'), 'PSBT multisig (não assinado)', res.psbt);
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  document.getElementById('msScan')?.addEventListener('click', () => openScanner(t => { document.getElementById('msPsbtIn').value = t; }));
  document.getElementById('msSign').addEventListener('submit', e => {
    e.preventDefault();
    const o = document.getElementById('msSignOut');
    try {
      const r = wallet.signMultisigPsbt(document.getElementById('msPsbtIn').value, document.getElementById('msSeed').value);
      o.innerHTML = `<div class="banner ok">Assinado (${r.signedInputs}). Passe ao próximo cosigner; com 2 assinaturas, transmita (passo 5).</div><div id="msSignedPay"></div>`;
      renderPayload(document.getElementById('msSignedPay'), 'PSBT assinado', r.psbt);
      document.getElementById('msSeed').value = '';
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  document.getElementById('msSendTx').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('msTxOut'); let fin;
    try { fin = wallet.finalizePsbt(document.getElementById('msSignedIn').value); }
    catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)} (faltam assinaturas?)</p>`; return; }
    o.innerHTML = '<p class="loading">Transmitindo…</p>';
    try {
      const r = await fetch(`${esploraBase()}/tx`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: fin.hex });
      const body = (await r.text()).trim(); if (!r.ok) throw new Error(body || ('HTTP ' + r.status));
      o.innerHTML = `<div class="banner ok">✅ Transmitido! txid: <span class="mono">${esc(body)}</span> · <a href="https://mempool.space/testnet/tx/${esc(body)}" target="_blank" rel="noopener">explorer</a></div>`;
    } catch (err) { o.innerHTML = `<div class="banner warn">Não transmitiu (${esc(err.message)}). Hex abaixo:</div><div id="msHexPay"></div>`; renderPayload(document.getElementById('msHexPay'), 'Tx final (hex)', fin.hex); }
  });

  // ---- Cofre de herança (timelock) ----
  const IHG_KEY = 'bussola.ihgroup.v1';
  const ihEl = id => document.getElementById(id);
  const ihCfg = () => ({ cosignerXpubs: [ihEl('ihA').value.trim(), ihEl('ihB').value.trim(), ihEl('ihC').value.trim()], heirXpub: ihEl('ihHeir').value.trim(), timelock: parseInt(ihEl('ihTL').value, 10) || 144 });
  (() => { try { const g = JSON.parse(localStorage.getItem(IHG_KEY) || 'null'); if (g) { ihEl('ihA').value = g.c?.[0] || ''; ihEl('ihB').value = g.c?.[1] || ''; ihEl('ihC').value = g.c?.[2] || ''; ihEl('ihHeir').value = g.h || ''; ihEl('ihTL').value = g.t || 144; } } catch {} })();
  async function scanUtxosIh(cfg) {
    const targets = [...wallet.inheritanceAddresses({ ...cfg, count: 10, chain: 0 }), ...wallet.inheritanceAddresses({ ...cfg, count: 5, chain: 1 })];
    const utxos = [];
    await Promise.all(targets.map(async t => {
      try { const r = await fetch(`${esploraBase()}/address/${t.address}/utxo`, { cache: 'no-store' }); if (!r.ok) return;
        for (const u of await r.json()) utxos.push({ txid: u.txid, vout: u.vout, valueSats: u.value, chain: t.chain, index: t.index, height: u.status?.block_height || 0 }); } catch {}
    }));
    return utxos;
  }
  ihEl('ihGen')?.addEventListener('click', () => {
    if (!wallet) return;
    const c = wallet.createMultisigCosigner(), o = ihEl('ihGenOut');
    o.innerHTML = `<div class="seedbox"><h3>📝 Anote esta frase:</h3>
      <ol class="seedwords">${c.mnemonic.split(' ').map(w => `<li>${esc(w)}</li>`).join('')}</ol>
      <div class="banner warn">Guarde offline. Compartilhe APENAS a xpub (nunca a frase). Use uma frase diferente para cada papel (cada guardião e o herdeiro).</div>
      <div class="muted small">Sua xpub (compartilhe):</div><textarea class="mono" rows="2" readonly></textarea></div>`;
    o.querySelector('textarea').value = c.accountXpub;
  });
  ihEl('ihGroup').addEventListener('submit', e => {
    e.preventDefault();
    const o = ihEl('ihAddrs'), cfg = ihCfg();
    if (cfg.cosignerXpubs.some(x => !x) || !cfg.heirXpub) { o.innerHTML = '<p class="muted">Preencha as 3 xpubs dos guardiões e a do herdeiro.</p>'; return; }
    try {
      const addrs = wallet.inheritanceAddresses({ ...cfg, count: 5, chain: 0 });
      try { localStorage.setItem(IHG_KEY, JSON.stringify({ c: cfg.cosignerXpubs, h: cfg.heirXpub, t: cfg.timelock })); } catch {}
      o.innerHTML = `<div class="banner ok">Cofre criado: 2-de-3 OU herdeiro após ${cfg.timelock} blocos.</div>
        <div class="tablewrap"><table><thead><tr><th>Caminho</th><th>Endereço</th><th></th></tr></thead><tbody>
        ${addrs.map(a => `<tr><td>${a.path}</td><td class="mono">${a.address}</td><td><button type="button" class="btn-ghost qrbtn" data-addr="${a.address}">QR</button></td></tr>`).join('')}
        </tbody></table></div><div class="regactions"><button type="button" class="btn-ghost" id="ihBal">Consultar saldo</button><button type="button" class="btn-ghost" id="ihLife">🫀 Status do Interruptor (prova de vida)</button></div><div id="ihQr"></div>`;
      o.querySelectorAll('.qrbtn').forEach(b => b.addEventListener('click', () => { const q = wallet.makeQR(b.dataset.addr); ihEl('ihQr').innerHTML = q ? `<div class="muted small mono">${esc(b.dataset.addr)}</div><div class="qr">${q}</div>` : ''; }));
      ihEl('ihBal').addEventListener('click', async () => {
        ihEl('ihQr').innerHTML = '<p class="loading">Consultando…</p>';
        const u = await scanUtxosIh(cfg), total = u.reduce((s, x) => s + x.valueSats, 0);
        ihEl('ihQr').innerHTML = `<div class="banner ok">Saldo do cofre: <strong>${BTC.format(total / 1e8)} tBTC</strong> (${u.length} UTXOs).</div>`;
      });
      ihEl('ihLife').addEventListener('click', async () => {
        const box = ihEl('ihQr'); box.innerHTML = '<p class="loading">Lendo a chain (saldo + altura dos blocos)…</p>';
        try {
          const u = await scanUtxosIh(cfg);
          if (!u.length) { box.innerHTML = '<div class="banner warn">Cofre vazio — envie fundos para <strong>ligar o interruptor</strong>. Enquanto houver saldo parado, o relógio da herança corre.</div>'; return; }
          const tip = parseInt(await (await fetch(`${esploraBase()}/blocks/tip/height`, { cache: 'no-store' })).text(), 10);
          const st = wallet.inheritanceClaimStatus({ timelock: cfg.timelock, utxos: u, tipHeight: tip });
          const saldo = `<div class="sub muted">${BTC.format(st.totalSats / 1e8)} tBTC em ${st.items.length} UTXO(s) · timelock ${st.timelock} blocos</div>`;
          if (st.claimableAll) {
            box.innerHTML = `<div class="banner warn">⚠️ <strong>Interruptor disparado.</strong> A inatividade atingiu o limite — o <strong>herdeiro já pode resgatar</strong> sozinho (passo 3 → Resgate). ${saldo}</div>
              <p class="muted small">Se você está vivo e isto não era pra acontecer, <strong>mova o saldo agora</strong> (caminho normal 2-de-3) para reiniciar a prova de vida.</p>`;
          } else {
            const pct = Math.round(100 * (st.timelock - st.remaining) / st.timelock);
            box.innerHTML = `<div class="banner ok">🫀 <strong>Interruptor ativo.</strong> Faltam <strong>${st.remaining} blocos (~${st.remainingDays} dias)</strong> de inatividade para a herança abrir. ${saldo}</div>
              <div class="lifebar" style="background:var(--line);border-radius:8px;height:10px;overflow:hidden;margin:8px 0"><div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#7c5cff,#b07bff)"></div></div>
              <p class="muted small">${pct}% do caminho até a abertura. <strong>Prova de vida:</strong> mover o saldo do cofre (caminho normal 2-de-3) para um novo endereço do cofre <strong>zera o relógio</strong>. Mexeu = está vivo.</p>`;
          }
        } catch (er) { box.innerHTML = `<p class="muted">Não consegui ler a chain agora (${esc(er.message)}).</p>`; }
      });
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  ihEl('ihSend').addEventListener('submit', async e => {
    e.preventDefault();
    const o = ihEl('ihBuildOut'), cfg = ihCfg();
    if (cfg.cosignerXpubs.some(x => !x) || !cfg.heirXpub) { o.innerHTML = '<p class="muted">Monte o cofre (passo 2).</p>'; return; }
    const to = ihEl('ihTo').value.trim(), amt = parseInt(ihEl('ihAmt').value, 10), fee = parseInt(ihEl('ihFee').value, 10) || 2, mode = ihEl('ihMode').value;
    if (!to || !(amt > 0)) { o.innerHTML = '<p class="muted">Preencha destino e valor.</p>'; return; }
    o.innerHTML = '<p class="loading">Buscando UTXOs do cofre…</p>';
    try {
      const utxos = await scanUtxosIh(cfg);
      const res = wallet.buildInheritancePsbt({ ...cfg, utxos, toAddress: to, amountSats: amt, feeRate: fee, mode });
      const aviso = mode === 'recovery'
        ? '<p class="muted small">⚠️ Resgate só é aceito após o timelock (blocos desde o recebimento da UTXO). Assine com a frase do herdeiro e finalize escolhendo “Resgate”.</p>'
        : '<p class="muted small">Leve a 2 guardiões para assinar (passo 4).</p>';
      o.innerHTML = `<div class="banner ok">Montado (${mode === 'recovery' ? 'resgate' : 'normal'}): entrada ${res.totalIn} · taxa ${res.fee} · troco ${res.change} sats.</div><div id="ihPay"></div>${aviso}`;
      renderPayload(ihEl('ihPay'), 'PSBT do cofre (não assinado)', res.psbt);
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  ihEl('ihScan')?.addEventListener('click', () => openScanner(t => { ihEl('ihPsbtIn').value = t; }));
  ihEl('ihSign').addEventListener('submit', e => {
    e.preventDefault();
    const o = ihEl('ihSignOut');
    try {
      const r = wallet.signInheritancePsbt(ihEl('ihPsbtIn').value, ihEl('ihSeed').value);
      o.innerHTML = `<div class="banner ok">Assinado (${r.signedInputs}). No normal junte 2 guardiões; no resgate basta o herdeiro. Depois finalize (passo 5).</div><div id="ihSignedPay"></div>`;
      renderPayload(ihEl('ihSignedPay'), 'PSBT assinado', r.psbt);
      ihEl('ihSeed').value = '';
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  ihEl('ihSendTx').addEventListener('submit', async e => {
    e.preventDefault();
    const o = ihEl('ihTxOut'), mode = ihEl('ihMode2').value; let fin;
    try { fin = wallet.finalizeInheritancePsbt(ihEl('ihSignedIn').value, mode); }
    catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)} (assinaturas insuficientes para esse caminho?)</p>`; return; }
    o.innerHTML = '<p class="loading">Transmitindo…</p>';
    try {
      const r = await fetch(`${esploraBase()}/tx`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: fin.hex });
      const body = (await r.text()).trim(); if (!r.ok) throw new Error(body || ('HTTP ' + r.status));
      o.innerHTML = `<div class="banner ok">✅ Transmitido! txid: <span class="mono">${esc(body)}</span> · <a href="https://mempool.space/testnet/tx/${esc(body)}" target="_blank" rel="noopener">explorer</a></div>`;
    } catch (err) { o.innerHTML = `<div class="banner warn">Não transmitiu (${esc(err.message)}). Hex abaixo:</div><div id="ihHexPay"></div>`; renderPayload(ihEl('ihHexPay'), 'Tx final (hex)', fin.hex); }
  });

  // ---- Pagar Silent Payment ----
  document.getElementById('spsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('spsOut');
    if (!wallet) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    const to = document.getElementById('spsTo').value.trim();
    const amt = parseInt(document.getElementById('spsAmt').value, 10);
    const fee = parseInt(document.getElementById('spsFee').value, 10) || 2;
    const seed = document.getElementById('spsSeed').value;
    if (!to || !(amt > 0) || !seed) { o.innerHTML = '<p class="muted">Preencha destino, valor e frase.</p>'; return; }
    o.innerHTML = '<p class="loading">Derivando carteira e buscando UTXOs…</p>';
    try {
      const acct = wallet.restoreTestnetWallet(seed);
      const utxos = await scanUtxos(acct.accountXpub);
      if (!utxos.length) throw new Error('Sem saldo na carteira testnet (envie tBTC primeiro).');
      const r = wallet.silentPaymentSend({ mnemonic: seed, accountXpub: acct.accountXpub, utxos, toAddress: to, amountSats: amt, feeRate: fee });
      document.getElementById('spsSeed').value = '';
      o.innerHTML = '<p class="loading">Transmitindo…</p>';
      try {
        const resp = await fetch(`${esploraBase()}/tx`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: r.hex });
        const body = (await resp.text()).trim(); if (!resp.ok) throw new Error(body || ('HTTP ' + resp.status));
        o.innerHTML = `<div class="banner ok">✅ Pago via Silent Payment! txid: <span class="mono">${esc(body)}</span> · <a href="https://mempool.space/testnet/tx/${esc(body)}" target="_blank" rel="noopener">explorer</a><br><span class="muted small">saída derivada (x-only): ${esc(r.outputXonly)} · troco ${r.change} sats</span></div>`;
      } catch (err) {
        o.innerHTML = `<div class="banner warn">Não transmitiu (${esc(err.message)}). Hex abaixo:</div><div id="spsHexPay"></div>`;
        renderPayload(document.getElementById('spsHexPay'), 'Tx final (hex)', r.hex);
      }
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
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
/* Seção da Carta ao Herdeiro com os dados do cofre "Interruptor da Vida" (lidos do localStorage
 * do passo "Montar o cofre"). Inclui xpubs públicas + timelock + passo a passo de resgate. NUNCA
 * contém a seed. cfg = { c:[xpub1,xpub2,xpub3], h:xpubHerdeiro, t:timelockBlocos }. */
function inheritanceLetterMarkdown(cfg) {
  if (!cfg || !Array.isArray(cfg.c) || cfg.c.some(x => !x) || !cfg.h) return '';
  const tl = (cfg.t | 0) || 144, dias = Math.round(tl * 10 / 60 / 24);
  return `## Cofre "Interruptor da Vida" (herança automática)\n\n` +
    `Este bitcoin está num **cofre com timelock** (Bitcoin Script, sem empresa). Dois caminhos:\n` +
    `1. **Em vida:** 2 das 3 pessoas de confiança assinam juntas.\n` +
    `2. **Herança:** o **herdeiro sozinho** resgata após **${tl} blocos (~${dias} dias)** sem nenhum movimento no cofre.\n\n` +
    `### Dados do cofre (públicos — NÃO são a seed)\n` +
    `- Guardião 1 (xpub): \`${cfg.c[0]}\`\n- Guardião 2 (xpub): \`${cfg.c[1]}\`\n- Guardião 3 (xpub): \`${cfg.c[2]}\`\n` +
    `- Herdeiro (xpub): \`${cfg.h}\`\n- Timelock: **${tl} blocos**\n\n` +
    `### Como o herdeiro resgata (passo a passo)\n` +
    `1. Abra a Bússola → aba **Carteira** → **Cofre de herança (Interruptor da Vida)**.\n` +
    `2. Preencha as 4 xpubs e o timelock acima (passo "Montar o cofre").\n` +
    `3. Clique em **🫀 Status do Interruptor** e confirme que o tempo já passou (senão, espere).\n` +
    `4. Em "Enviar do cofre", escolha o caminho **Resgate**, informe um endereço de destino seu.\n` +
    `5. Assine com a **frase do herdeiro** (12/24 palavras guardadas à parte) e transmita.\n\n` +
    `> A **frase do herdeiro** NÃO está neste documento — veja "Onde encontrar".\n\n`;
}
function legadoMarkdown(d, cofreCfg) {
  const v = x => (x && String(x).trim()) || '—';
  return `# Plano de Legado — Bitcoin\n\n**Titular:** ${v(d.titular)}\n\n**Data:** ${v(d.data)}\n\n` +
    `## Pessoas de confiança / herdeiros\n${v(d.herdeiros)}\n\n## Custódia\n${v(d.custodia)}\n\n` +
    `## Onde encontrar (NUNCA contém a seed)\n- Seed: ${v(d.localSeed)}\n- Backups: ${v(d.localBackup)}\n\n` +
    inheritanceLetterMarkdown(cofreCfg) +
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
        <div id="lgCofreNote"></div>
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
        <h2>🧩 Recuperação social <span class="muted small">Shamir k-de-N</span></h2>
        <p class="muted">Divida sua frase em N partes e guarde com pessoas/locais de confiança.
        Recompõe com k partes — herança e fim do "perdi a seed". Abaixo de k, nenhuma parte revela nada.</p>
        <div class="banner warn">⚠️ Cada parte é sensível: juntar k delas = a carteira. Distribua com
        cuidado, teste a recomposição e faça isto num aparelho offline.</div>
        <div class="agstep">
          <h3>Dividir a frase</h3>
          <form id="shSplit" class="regform">
            <label style="grid-column:1/-1">Sua frase (12/24 palavras)<input id="shMn" autocomplete="off" spellcheck="false"></label>
            <label>Total de partes (N)<input type="number" id="shN" min="2" max="10" value="5"></label>
            <label>Mínimo p/ recompor (k)<input type="number" id="shK" min="2" max="10" value="3"></label>
            <button type="submit">Gerar partes</button>
          </form>
          <div id="shSplitOut"></div>
        </div>
        <div class="agstep">
          <h3>Recompor a frase</h3>
          <form id="shJoin" class="regform">
            <label style="grid-column:1/-1">Cole as partes (uma por linha)<textarea id="shParts" rows="4" spellcheck="false"></textarea></label>
            <button type="submit">Recompor</button>
          </form>
          <div id="shJoinOut"></div>
        </div>
      </section>

      <section class="watchonly">
        <h2>🛰️ Silent Payments <span class="muted small">BIP-352 · endereço reutilizável</span></h2>
        <p class="muted">Um único endereço estático que você publica e reusa <strong>sem perder privacidade</strong>:
        cada pagamento cai num endereço on-chain diferente, derivado por você. Fim do "gere um endereço novo toda vez".</p>
        <div class="banner ok">Ciclo SP completo aqui: <strong>gerar</strong> identidade → <strong>receber</strong> (verificar txid + salvar no painel)
        → <strong>gastar</strong> (varrer o saldo). Enviar a um sp1… está na aba Carteira. Tudo validado contra o vetor oficial do BIP-352.</div>
        <form id="spForm" class="regform">
          <label style="grid-column:1/-1">Sua frase (12/24 palavras)<input id="spMn" autocomplete="off" spellcheck="false"></label>
          <label>Rede<select id="spNet"><option value="test">Testnet (tsp1)</option><option value="main">Mainnet (sp1)</option></select></label>
          <button type="submit">Gerar endereço SP</button>
        </form>
        <div id="spOut"></div>
        <div class="agstep" style="margin-top:14px">
          <h3>Verificar um recebimento</h3>
          <p class="muted small">Cole o <strong>txid</strong> de uma transação e eu descubro se algum output é seu (SP).
          Varredura automática da chain exige um node indexado (roadmap) — aqui é por transação.</p>
          <form id="spScan" class="regform">
            <label style="grid-column:1/-1">txid da transação<input id="spTxid" spellcheck="false" autocomplete="off"></label>
            <label style="grid-column:1/-1">Sua frase<input id="spScanMn" autocomplete="off" spellcheck="false"></label>
            <label>Rede<select id="spScanNet"><option value="test">Testnet</option><option value="main">Mainnet</option></select></label>
            <button type="submit">Verificar</button>
          </form>
          <div id="spScanOut"></div>
        </div>
        <div id="spPanel" class="agstep" style="margin-top:14px"></div>
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
  const cofreCfg = () => { try { return JSON.parse(localStorage.getItem('bussola.ihgroup.v1') || 'null'); } catch { return null; } };
  function legadoData() { const d = {}; LEGADO_FIELDS.forEach(f => { d[f.k] = (document.getElementById('lg_' + f.k) || {}).value || ''; }); return d; }
  (() => { const c = cofreCfg(); const el = document.getElementById('lgCofreNote');
    if (el && c && Array.isArray(c.c) && !c.c.some(x => !x) && c.h) el.innerHTML = '<div class="banner ok">🏛️ Cofre "Interruptor da Vida" detectado — seus dados e o passo a passo de resgate entram <strong>automaticamente</strong> na Carta ao Herdeiro.</div>'; })();
  document.getElementById('lgForm').addEventListener('submit', e => {
    e.preventDefault();
    try { localStorage.setItem(LG_KEY, JSON.stringify(legadoData())); } catch {}
    document.getElementById('lgOut').innerHTML = '<div class="banner ok">✅ Plano salvo no aparelho.</div>';
  });
  document.getElementById('lgExport').addEventListener('click', () => {
    const md = legadoMarkdown(legadoData(), cofreCfg());
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'plano-de-legado.md'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('lgPrint').addEventListener('click', () => {
    const md = legadoMarkdown(legadoData(), cofreCfg());
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

  // ---- Recuperação social (Shamir) ----
  const Wsh = window.BussolaWallet;
  document.getElementById('shSplit').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('shSplitOut');
    if (!Wsh) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    const mn = document.getElementById('shMn').value;
    const n = parseInt(document.getElementById('shN').value, 10) || 5;
    const k = parseInt(document.getElementById('shK').value, 10) || 3;
    o.innerHTML = '<p class="loading">Gerando partes…</p>';
    try {
      const shares = await Wsh.splitMnemonic(mn, n, k);
      o.innerHTML = `<div class="banner ok">${shares.length} partes geradas — guarde cada uma em local/pessoa diferente. Recompõe com ${Math.min(k, n)}.</div>` +
        shares.map((s, i) => { const qr = Wsh.makeQR(s); return `<div class="payload"><div class="muted small">Parte ${i + 1}/${shares.length}</div><textarea class="mono" rows="2" readonly>${esc(s)}</textarea>${qr ? `<div class="qr">${qr}</div>` : ''}</div>`; }).join('');
      document.getElementById('shMn').value = '';
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  document.getElementById('shJoin').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('shJoinOut');
    if (!Wsh) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    const parts = document.getElementById('shParts').value.split(/\s+/).map(x => x.trim()).filter(Boolean);
    o.innerHTML = '<p class="loading">Recompondo…</p>';
    try {
      const mn = await Wsh.combineMnemonic(parts);
      o.innerHTML = `<div class="banner ok">Frase recomposta:</div><textarea class="mono" rows="2" readonly>${esc(mn)}</textarea><p class="muted small">Confira se faz sentido — partes insuficientes geram frase errada, sem aviso.</p>`;
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });

  // ---- Silent Payments (BIP-352) ----
  document.getElementById('spForm').addEventListener('submit', e => {
    e.preventDefault();
    const o = document.getElementById('spOut');
    if (!Wsh) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    try {
      const r = Wsh.silentPaymentAddress(document.getElementById('spMn').value, document.getElementById('spNet').value);
      const qr = Wsh.makeQR(r.address);
      o.innerHTML = `<div class="banner ok">Seu endereço Silent Payment (${r.network === 'main' ? 'mainnet' : 'testnet'}):</div>
        <textarea class="mono" rows="3" readonly>${esc(r.address)}</textarea>
        ${qr ? `<div class="qr">${qr}</div>` : ''}
        <details class="agstep" style="margin-top:12px"><summary><strong>💳 Gerar cobrança</strong> — peça um valor (vira link + QR)</summary>
          <form id="spReq" class="regform" style="margin-top:8px">
            <label>Valor (BTC)<input id="spReqAmt" type="number" min="0" step="0.00000001" placeholder="0.001"></label>
            <label style="grid-column:1/-1">Mensagem (opcional)<input id="spReqMsg" autocomplete="off" placeholder="ex.: fatura #123"></label>
            <button type="submit">Gerar link + QR</button>
          </form><div id="spReqOut"></div></details>
        <details class="small"><summary>chaves de visão/gasto (avançado)</summary>
        <div class="muted small mono" style="word-break:break-all">scan: ${esc(r.scanPub)}<br>spend: ${esc(r.spendPub)}</div></details>`;
      document.getElementById('spReq').addEventListener('submit', ev => {
        ev.preventDefault();
        const ro = document.getElementById('spReqOut');
        try {
          const uri = Wsh.buildPaymentURI({ address: r.address, amountBtc: document.getElementById('spReqAmt').value, message: document.getElementById('spReqMsg').value.trim() });
          const rq = Wsh.makeQR(uri);
          ro.innerHTML = `<div class="banner ok">Cobrança pronta — envie o link ou mostre o QR:</div>
            <textarea class="mono" rows="3" readonly>${esc(uri)}</textarea>
            ${rq ? `<div class="qr">${rq}</div>` : ''}
            <button type="button" id="spReqCopy" class="btn-ghost">📋 Copiar link</button>`;
          document.getElementById('spReqCopy').addEventListener('click', () => { try { navigator.clipboard.writeText(uri); } catch {} document.getElementById('spReqCopy').textContent = '✓ copiado'; });
        } catch (e2) { ro.innerHTML = `<p class="muted">${esc(e2.message)}</p>`; }
      });
      document.getElementById('spMn').value = '';
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });

  /* ---- Painel de recebimentos (ledger SP persistido no aparelho) ---- */
  const SP_LEDGER = 'bussola.sp.ledger.v1';
  const spLedgerLoad = () => { try { return JSON.parse(localStorage.getItem(SP_LEDGER) || '[]'); } catch { return []; } };
  const spLedgerSave = a => { try { localStorage.setItem(SP_LEDGER, JSON.stringify(a)); } catch {} };
  function spLedgerAdd(items, label, net) {
    const a = spLedgerLoad(), have = new Set(a.map(e => e.txid + ':' + e.vout)); let added = 0;
    for (const it of items) { const k = it.txid + ':' + it.vout; if (have.has(k)) continue; a.push({ ...it, label: label || '', net: net || 'test', addedAt: Date.now() }); have.add(k); added++; }
    spLedgerSave(a); return added;
  }
  function renderSpLedger() {
    const box = document.getElementById('spPanel'); if (!box) return;
    const a = spLedgerLoad();
    if (!a.length) { box.innerHTML = `<h3>📥 Painel de recebimentos</h3><p class="muted small">Seus recebimentos SP salvos ficam aqui (só neste aparelho). Verifique um txid acima e clique em <strong>Salvar no painel</strong>.</p>`; return; }
    const total = a.reduce((s, e) => s + (e.valueSats || 0), 0);
    box.innerHTML = `<h3>📥 Painel de recebimentos</h3>
      <div class="cards"><div class="card"><h3>Recebido (saldo)</h3><div class="big">${(total / 1e8).toFixed(8)} tBTC</div><div class="sub muted">${a.length} recebimento(s) · ${total} sats</div></div></div>
      <div class="tablewrap"><table><thead><tr><th>Quando</th><th>Valor</th><th>Rótulo</th><th>Origem</th><th>IR</th><th></th></tr></thead><tbody>
        ${a.map((e, i) => `<tr><td>${new Date(e.addedAt).toLocaleDateString('pt-BR')}</td><td>${e.valueSats} sats</td><td>${esc(e.label || '—')}</td><td class="mono small">${esc(e.txid.slice(0, 8))}…:${e.vout}</td><td title="${e.regd ? 'registrado no IR' : 'não registrado'}">${e.regd ? '✓' : '—'}</td><td><button class="del" data-i="${i}" title="Remover">✕</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="regactions"><button id="spLedgerSpend" class="btn">💸 Gastar saldo do painel</button><button id="spLedgerReg" class="btn-ghost">🧮 Registrar pro IR</button><button id="spLedgerExport" class="btn-ghost">⬇️ Exportar CSV</button></div>
      <div id="spLedgerOut"></div>`;
    box.querySelectorAll('.del').forEach(b => b.addEventListener('click', () => { const a2 = spLedgerLoad(); a2.splice(+b.dataset.i, 1); spLedgerSave(a2); renderSpLedger(); }));
    document.getElementById('spLedgerReg').addEventListener('click', async () => {
      const lo = document.getElementById('spLedgerOut');
      const a2 = spLedgerLoad(), pend = a2.filter(e => !e.regd);
      if (!pend.length) { lo.innerHTML = '<p class="muted small">Todos os recebimentos já estão no Registro (IR).</p>'; return; }
      lo.innerHTML = '<p class="loading">Buscando o preço do BTC em R$…</p>';
      try {
        const rr = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl', { cache: 'no-store' });
        const preco = (await rr.json())?.bitcoin?.brl;
        if (!(preco > 0)) throw new Error('preço indisponível');
        const reg = regLoad();
        let n = 0;
        for (const e of a2) {
          if (e.regd) continue;
          const btc = e.valueSats / 1e8;
          reg.push({ data: new Date(e.addedAt).toISOString().slice(0, 10), valor: btc * preco, preco });
          e.regd = true; n++;
        }
        reg.sort((x, y) => x.data < y.data ? -1 : 1); regSave(reg); spLedgerSave(a2);
        renderSpLedger();
        document.getElementById('spLedgerOut').innerHTML = `<div class="banner ok">✅ ${n} recebimento(s) lançado(s) no Registro a ${BRL.format(preco)}/BTC. Confira/edite na aba <strong>Registro</strong> (o custo de aquisição usa o preço de hoje — ajuste se o recebimento foi em outra data).</div>`;
      } catch (er) { lo.innerHTML = `<p class="muted">Não consegui o preço em R$ agora (${esc(er.message)}). Tente de novo.</p>`; }
    });
    document.getElementById('spLedgerExport').addEventListener('click', () => {
      const a2 = spLedgerLoad(); if (!a2.length) return;
      const linhas = a2.map(e => [new Date(e.addedAt).toISOString().slice(0, 10), e.valueSats, (e.valueSats / 1e8).toFixed(8), String(e.label || '').replace(/;/g, ','), e.txid + ':' + e.vout].join(';'));
      const csv = '﻿data;valor_sats;valor_btc;rotulo;origem\n' + linhas.join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = 'bussola-recebimentos-sp.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    document.getElementById('spLedgerSpend').addEventListener('click', () => {
      const lo = document.getElementById('spLedgerOut');
      lo.innerHTML = `<form id="spLedgerForm" class="regform" style="margin-top:8px">
          <label style="grid-column:1/-1">Enviar tudo para (endereço testnet)<input id="slDest" spellcheck="false" autocomplete="off" placeholder="tb1q…"></label>
          <label style="grid-column:1/-1">Sua frase<input id="slMn" autocomplete="off" spellcheck="false"></label>
          <label>Taxa (sat/vB)<input type="number" id="slFee" min="1" step="1" value="2"></label>
          <button type="submit">Montar transação</button>
        </form><div id="slOut"></div>`;
      document.getElementById('spLedgerForm').addEventListener('submit', async ev => {
        ev.preventDefault();
        const out2 = document.getElementById('slOut');
        const dest = document.getElementById('slDest').value.trim();
        const smn = document.getElementById('slMn').value;
        const fee = parseInt(document.getElementById('slFee').value, 10) || 2;
        const a2 = spLedgerLoad(), net2 = (a2[0] && a2[0].net) || 'test';
        if (!dest) { out2.innerHTML = '<p class="muted">Informe o destino.</p>'; return; }
        out2.innerHTML = '<p class="loading">Montando e assinando…</p>';
        try {
          const built = Wsh.silentPaymentSpend({ mnemonic: smn, network: net2, inputs: a2, toAddress: dest, feeRate: fee });
          document.getElementById('slMn').value = '';
          out2.innerHTML = `<div class="banner ok">Transação pronta — <strong>${built.sent} sats</strong> (taxa ${built.fee}, ${built.inputsCount} entradas).</div>
            <div class="payload"><div class="muted small">txid: ${esc(built.txid)}</div><textarea readonly rows="3" class="mono small" style="width:100%">${esc(built.hex)}</textarea></div>
            <button id="slBc" class="btn">📡 Transmitir agora</button><div id="slBcOut"></div>`;
          document.getElementById('slBc').addEventListener('click', async () => {
            const bo = document.getElementById('slBcOut'); bo.innerHTML = '<p class="loading">Transmitindo…</p>';
            try {
              const rr = await fetch(`${esploraBase()}/tx`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: built.hex });
              const body = await rr.text();
              if (!rr.ok) throw new Error(body || ('HTTP ' + rr.status));
              bo.innerHTML = `<div class="banner ok">✅ Transmitido! txid: <span class="mono">${esc(body)}</span> · <a href="https://mempool.space/testnet/tx/${esc(body)}" target="_blank" rel="noopener">ver no explorer</a></div>`;
              spLedgerSave([]); renderSpLedger();
            } catch (be) { bo.innerHTML = `<p class="muted">Falha ao transmitir: ${esc(be.message)}</p>`; }
          });
        } catch (er) { out2.innerHTML = `<p class="muted">${esc(er.message)}</p>`; }
      });
    });
  }

  document.getElementById('spScan').addEventListener('submit', async e => {
    e.preventDefault();
    const o = document.getElementById('spScanOut');
    if (!Wsh) { o.innerHTML = '<p class="muted">Núcleo não carregou.</p>'; return; }
    const txid = document.getElementById('spTxid').value.trim().toLowerCase();
    const mn = document.getElementById('spScanMn').value;
    const net = document.getElementById('spScanNet').value;
    if (!/^[0-9a-f]{64}$/.test(txid)) { o.innerHTML = '<p class="muted">Informe um txid válido (64 hex).</p>'; return; }
    o.innerHTML = '<p class="loading">Buscando transação e verificando…</p>';
    try {
      const r = await fetch(`${esploraBase()}/tx/${txid}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('Transação não encontrada neste endpoint.');
      const tx = await r.json();
      const res = Wsh.silentPaymentScan({ mnemonic: mn, network: net, tx });
      document.getElementById('spScanMn').value = '';
      const nota = `<p class="muted small">Verifiquei ${res.scannedOutputs} saída(s) taproot; usei ${res.inputsUsed}/${res.inputsTotal} entradas.${res.inputsUsed < res.inputsTotal ? ' Algumas entradas não são suportadas — a detecção pode falhar nesta tx.' : ''}</p>`;
      if (!res.found.length) {
        o.innerHTML = `<div class="banner warn">Nenhum output desta transação é seu (SP).</div>${nota}`;
      } else {
        const total = res.found.reduce((s, f) => s + (f.valueSats || 0), 0);
        o.innerHTML = `<div class="banner ok">🎉 ${res.found.length} output(s) seu(s)! Total ${(total / 1e8).toFixed(8)} tBTC.</div>`
          + res.found.map(f => `<div class="payload"><div class="muted small">vout ${f.vout} · ${f.valueSats} sats</div><div class="mono small" style="word-break:break-all">chave: ${esc(f.xonly)}</div></div>`).join('')
          + nota
          + `<div class="regactions"><input id="spSaveLabel" placeholder="rótulo (ex.: cliente X)" autocomplete="off" spellcheck="false" style="flex:1"><button type="button" id="spSaveLedger" class="btn-ghost">💾 Salvar no painel</button></div>`
          + `<div class="agstep" style="margin-top:12px"><h3>Gastar estes recebimentos</h3>
              <p class="muted small">Varre <strong>todos</strong> os ${res.found.length} output(s) acima para um endereço só.</p>
              <form id="spSpend" class="regform">
                <label style="grid-column:1/-1">Enviar tudo para (endereço testnet)<input id="spDest" spellcheck="false" autocomplete="off" placeholder="tb1q…"></label>
                <label style="grid-column:1/-1">Sua frase<input id="spSpendMn" autocomplete="off" spellcheck="false"></label>
                <label>Taxa (sat/vB)<input type="number" id="spFee" min="1" step="1" value="2"></label>
                <button type="submit">Montar transação</button>
              </form><div id="spSpendOut"></div></div>`;
        document.getElementById('spSaveLedger').addEventListener('click', () => {
          const label = document.getElementById('spSaveLabel').value.trim();
          const added = spLedgerAdd(res.found.map(f => ({ txid, vout: f.vout, xonly: f.xonly, tweak: f.tweak, valueSats: f.valueSats })), label, net);
          renderSpLedger();
          document.getElementById('spSaveLedger').textContent = added > 0 ? `✓ ${added} salvo(s) no painel` : 'já estavam no painel';
        });
        document.getElementById('spSpend').addEventListener('submit', async ev => {
          ev.preventDefault();
          const so = document.getElementById('spSpendOut');
          const dest = document.getElementById('spDest').value.trim();
          const smn = document.getElementById('spSpendMn').value;
          const fee = parseInt(document.getElementById('spFee').value, 10) || 2;
          if (!dest) { so.innerHTML = '<p class="muted">Informe o endereço de destino.</p>'; return; }
          so.innerHTML = '<p class="loading">Montando e assinando…</p>';
          try {
            const built = Wsh.silentPaymentSpend({ mnemonic: smn, network: net, inputs: res.found.map(f => ({ ...f, txid })), toAddress: dest, feeRate: fee });
            document.getElementById('spSpendMn').value = '';
            so.innerHTML = `<div class="banner ok">Transação pronta — <strong>${built.sent} sats</strong> para o destino (taxa ${built.fee} sats).</div>
              <div class="payload"><div class="muted small">txid: ${esc(built.txid)}</div><textarea readonly rows="3" class="mono small" style="width:100%">${esc(built.hex)}</textarea></div>
              <button id="spBroadcast" class="btn">📡 Transmitir agora</button><div id="spBcOut"></div>`;
            document.getElementById('spBroadcast').addEventListener('click', async () => {
              const bo = document.getElementById('spBcOut'); bo.innerHTML = '<p class="loading">Transmitindo…</p>';
              try {
                const rr = await fetch(`${esploraBase()}/tx`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: built.hex });
                const body = await rr.text();
                if (!rr.ok) throw new Error(body || ('HTTP ' + rr.status));
                bo.innerHTML = `<div class="banner ok">✅ Transmitido! txid: <span class="mono">${esc(body)}</span> · <a href="https://mempool.space/testnet/tx/${esc(body)}" target="_blank" rel="noopener">ver no explorer</a></div>`;
              } catch (be) { bo.innerHTML = `<p class="muted">Falha ao transmitir: ${esc(be.message)}</p>`; }
            });
          } catch (er) { so.innerHTML = `<p class="muted">${esc(er.message)}</p>`; }
        });
      }
    } catch (err) { o.innerHTML = `<p class="muted">${esc(err.message)}</p>`; }
  });
  renderSpLedger();
}

/* =================== Guia (assistente educacional com IA) =================== */
const AI_KEY = 'bussola.aikey.v1';
const AI_MODEL = 'claude-sonnet-4-6';
const AI_SYSTEM = `Você é o Guia da Bússola, um assistente EDUCACIONAL sobre Bitcoin e autocustódia, em português do Brasil. Explique de forma clara, didática e concisa: comprar bitcoin no Brasil, carteira própria, seed, air-gap/PSBT, multisig, herança, recuperação social (Shamir), declaração (IRPF) e segurança.
REGRAS INEGOCIÁVEIS:
- NUNCA dê recomendação de compra/venda nem preveja preço ou rendimento.
- NUNCA peça nem aceite a seed/chave privada; se o usuário tentar colar, oriente a NÃO compartilhar.
- Alerte sobre golpes; ninguém legítimo pede a seed.
- Em temas fiscais, lembre que as regras mudam e sugira confirmar com contador(a).
- Se fugir de bitcoin/autocustódia, redirecione gentilmente.
Seja prático, use exemplos e responda em português do Brasil.`;

let aiConversation = [];

function viewGuia() {
  menuBtn.hidden = true;
  let key = ''; try { key = localStorage.getItem(AI_KEY) || ''; } catch {}
  if (!key) {
    appEl.innerHTML = `
      <div class="pad">
        <h1>🤖 Guia <span class="muted small">assistente educacional</span></h1>
        <div class="banner warn">Usa a <strong>sua própria chave</strong> da API da Anthropic. A chave fica
        <strong>só no seu aparelho</strong> e as mensagens vão direto do seu navegador para a Anthropic —
        <strong>não passam por nós</strong>. Nunca escreva sua seed aqui.</div>
        <form id="aiKeyForm" class="regform">
          <label style="grid-column:1/-1">Chave da API Anthropic (sk-ant-…)<input type="password" id="aiKeyInput" autocomplete="off" spellcheck="false"></label>
          <button type="submit">Salvar e abrir o Guia</button>
        </form>
        <p class="muted small">Gere sua chave em <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. Educacional — não é recomendação de investimento.</p>
      </div>`;
    document.getElementById('aiKeyForm').addEventListener('submit', e => {
      e.preventDefault();
      const v = document.getElementById('aiKeyInput').value.trim(); if (!v) return;
      try { localStorage.setItem(AI_KEY, v); } catch {}
      viewGuia();
    });
    return;
  }
  appEl.innerHTML = `
    <div class="pad">
      <h1>🤖 Guia <span class="muted small">educacional · não é recomendação</span></h1>
      <div id="chat" class="chat"></div>
      <form id="aiForm" class="regform">
        <label style="grid-column:1/-1">Pergunte sobre bitcoin, carteira, herança, IRPF…<textarea id="aiInput" rows="2" spellcheck="false"></textarea></label>
        <button type="submit" id="aiSend">Enviar</button>
      </form>
      <div class="regactions">
        <button type="button" class="btn-ghost" id="aiClear">Limpar conversa</button>
        <button type="button" class="btn-ghost" id="aiForget">Remover minha chave</button>
      </div>
      <p class="muted small">⚠️ Nunca escreva sua seed/chave aqui. As mensagens vão do seu navegador para a Anthropic com a sua chave.</p>
    </div>`;
  const chat = document.getElementById('chat');
  const bubbles = () => aiConversation.map(m => `<div class="msg ${m.role}"><div class="bubble">${m.role === 'assistant' ? mdToHtml(m.content) : esc(m.content)}</div></div>`).join('');
  function renderChat(extra) {
    chat.innerHTML = (aiConversation.length ? bubbles() : '<p class="muted">Comece perguntando. Ex.: "Como tiro meu bitcoin da corretora com segurança?"</p>') + (extra || '');
    chat.scrollTop = chat.scrollHeight;
  }
  renderChat();
  document.getElementById('aiClear').addEventListener('click', () => { aiConversation = []; renderChat(); });
  document.getElementById('aiForget').addEventListener('click', () => { try { localStorage.removeItem(AI_KEY); } catch {} aiConversation = []; viewGuia(); });
  document.getElementById('aiForm').addEventListener('submit', async e => {
    e.preventDefault();
    const inp = document.getElementById('aiInput'), q = inp.value.trim(); if (!q) return;
    inp.value = '';
    aiConversation.push({ role: 'user', content: q });
    renderChat('<div class="msg assistant"><div class="bubble"><span class="loading">pensando…</span></div></div>');
    const btn = document.getElementById('aiSend'); btn.disabled = true;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: AI_MODEL, max_tokens: 1024, system: AI_SYSTEM, messages: aiConversation }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error?.message || ('HTTP ' + r.status));
      const text = (d.content || []).map(b => b.text || '').join('').trim() || '(sem resposta)';
      aiConversation.push({ role: 'assistant', content: text });
      renderChat();
    } catch (err) {
      renderChat(`<div class="msg assistant"><div class="bubble">⚠️ Erro: ${esc(err.message)}</div></div>`);
    } finally { btn.disabled = false; }
  });
}

/* =================== Roteador =================== */
const ROUTES = { painel: viewPainel, book: viewBook, historico: viewHistorico, checklist: viewChecklist, registro: viewRegistro, carteira: viewCarteira, soberania: viewSoberania, guia: viewGuia };
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

/* PWA: registro + prompt de instalação */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (installBtn) installBtn.hidden = false; });
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice;
  deferredPrompt = null; installBtn.hidden = true;
});
window.addEventListener('appinstalled', () => { if (installBtn) installBtn.hidden = true; });

route();

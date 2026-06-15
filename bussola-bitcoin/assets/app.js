/* Bússola — leitor do book (vanilla JS, sem dependências).
   Carrega docs/*.md e renderiza um subconjunto de Markdown suficiente para o conteúdo. */

const CHAPTERS = [
  { id: '00', file: 'docs/00-VISAO.md',        emoji: '🧭', title: 'Visão' },
  { id: '01', file: 'docs/01-COMPRAR.md',      emoji: '🛒', title: 'Comprar (off→online)' },
  { id: '02', file: 'docs/02-CARTEIRA.md',     emoji: '🔐', title: 'Carteira própria' },
  { id: '03', file: 'docs/03-DECLARACAO.md',   emoji: '🧾', title: 'Declaração (fiscal)' },
  { id: '04', file: 'docs/04-GANHAR-HOJE.md',  emoji: '⛏️', title: 'Ganhar BTC hoje' },
  { id: '05', file: 'docs/05-MAPA-HISTORICO.md',emoji: '🗺️', title: 'Mapa do passado' },
  { id: '99', file: 'docs/99-FONTES.md',       emoji: '📚', title: 'Fontes' },
];

/* ---------- Markdown mínimo ---------- */
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>')
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
  let out = '';
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];

    // code fence
    if (/^```/.test(line)) {
      let buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // skip closing
      out += `<pre><code>${esc(buf.join('\n'))}</code></pre>`;
      continue;
    }
    // table (header row + separator)
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:-]*-[-\s:|]*\|?\s*$/.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      let rows = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== '') {
        rows.push(cells(lines[i])); i++;
      }
      let html = '<div class="tablewrap"><table><thead><tr>';
      head.forEach(h => html += `<th>${inline(h)}</th>`);
      html += '</tr></thead><tbody>';
      rows.forEach(r => {
        html += '<tr>';
        head.forEach((_, k) => html += `<td>${inline(r[k] || '')}</td>`);
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      out += html;
      continue;
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      let buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, '')); i++;
      }
      const inner = buf.map(b => b.trim() === '' ? '' : `<p>${inline(b)}</p>`).join('');
      out += `<blockquote>${inner}</blockquote>`;
      continue;
    }
    // heading
    let h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out += `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`; i++; continue; }
    // hr
    if (/^\s*([-*_])\1\1+\s*$/.test(line)) { out += '<hr>'; i++; continue; }
    // unordered list (with checkboxes)
    if (/^\s*[-*]\s+/.test(line)) {
      let html = '<ul>';
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*[-*]\s+/, '');
        const chk = item.match(/^\[( |x|X)\]\s+(.*)$/);
        if (chk) {
          const done = chk[1].toLowerCase() === 'x';
          html += `<li class="check">${done ? '✅' : '⬜'} ${inline(chk[2])}</li>`;
        } else {
          html += `<li>${inline(item)}</li>`;
        }
        i++;
      }
      html += '</ul>'; out += html; continue;
    }
    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      let html = '<ol>';
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        html += `<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`; i++;
      }
      html += '</ol>'; out += html; continue;
    }
    // blank
    if (line.trim() === '') { i++; continue; }
    // paragraph
    let buf = [];
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^(#{1,6}\s|>\s?|```|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i]) &&
           !/^\s*([-*_])\1\1+\s*$/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out += `<p>${inline(buf.join(' '))}</p>`;
  }
  return out;
}

/* ---------- Navegação ---------- */
const docEl = document.getElementById('doc');
const listEl = document.getElementById('chapterList');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('backdrop');

CHAPTERS.forEach(c => {
  const li = document.createElement('li');
  li.innerHTML = `<a href="#${c.id}" data-id="${c.id}">
      <span>${c.emoji}</span><span class="ix">${c.id}</span><span>${c.title}</span></a>`;
  listEl.appendChild(li);
});

function setActive(id) {
  document.querySelectorAll('#chapterList a').forEach(a =>
    a.classList.toggle('active', a.dataset.id === id));
}

async function load(id) {
  const ch = CHAPTERS.find(c => c.id === id) || CHAPTERS[0];
  setActive(ch.id);
  docEl.innerHTML = '<p class="loading">Carregando…</p>';
  try {
    const res = await fetch(ch.file, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    const md = await res.text();
    docEl.innerHTML = mdToHtml(md);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    docEl.innerHTML = `<h1>Não consegui carregar o capítulo</h1>
      <p>Abra este site por um servidor (não pelo <code>file://</code>): rode
      <code>npx serve</code> ou <code>python3 -m http.server</code> na pasta, ou publique
      (ver <code>publicar.md</code>). Você também pode ler direto a pasta
      <code>${ch.file.split('/')[0]}/</code>.</p>
      <p style="color:#9fb0cc">Detalhe técnico: ${e.message}</p>`;
  }
  closeMenu();
}

function openMenu() { sidebar.classList.add('open'); backdrop.hidden = false; }
function closeMenu() { sidebar.classList.remove('open'); backdrop.hidden = true; }

document.getElementById('menuBtn').addEventListener('click', openMenu);
backdrop.addEventListener('click', closeMenu);
window.addEventListener('hashchange', () => load(location.hash.replace('#', '') || '00'));

/* status de rede */
const net = document.getElementById('netStatus');
function updNet() {
  const on = navigator.onLine;
  net.classList.toggle('off', !on);
  net.title = on ? 'Online' : 'Offline (lendo do cache)';
}
window.addEventListener('online', updNet);
window.addEventListener('offline', updNet);
updNet();

/* PWA */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

load(location.hash.replace('#', '') || '00');

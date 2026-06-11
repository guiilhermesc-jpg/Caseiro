// =============================================================
//  SERVIDOR MULTIPLAYER (relay)  ·  Venor / Caseiro
//  Node + ws. Cada cliente envia seu estado (~12x/seg); o servidor
//  CARIMBA o id (o cliente não escolhe o seu) e REPASSA aos OUTROS.
//  Guarda o último estado de cada jogador para que um novato veja
//  quem já está online no momento em que entra.
//  No Railway a porta vem em process.env.PORT.
// =============================================================
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;

// =============================================================
//  CONTAS NA NUVEM (RV5.0) · nome + PIN (hash sha256) → save JSON.
//  Armazena em DATA_DIR/contas.json (no Railway: montar um VOLUME
//  em /data e definir DATA_DIR=/data — sem volume o disco é efêmero
//  e as contas zeram a cada redeploy!). Escrita adiada (2s).
// =============================================================
const DATA_DIR = process.env.DATA_DIR || './dados';
const ARQ_CONTAS = path.join(DATA_DIR, 'contas.json');
let contas = {}; // nome -> { hash, dados, quando }
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(ARQ_CONTAS)) contas = JSON.parse(fs.readFileSync(ARQ_CONTAS, 'utf8'));
  console.log(`Contas carregadas: ${Object.keys(contas).length} (${ARQ_CONTAS})`);
} catch (e) { console.error('Falha ao carregar contas:', e.message); }
let salvarAgendado = null;
function persisteContas() {
  if (salvarAgendado) return;
  salvarAgendado = setTimeout(() => {
    salvarAgendado = null;
    try { fs.writeFileSync(ARQ_CONTAS, JSON.stringify(contas)); }
    catch (e) { console.error('Falha ao gravar contas:', e.message); }
  }, 2000);
}
const hashPin = (nome, pin) => crypto.createHash('sha256').update(`${nome}:${pin}:venor`).digest('hex');
function validaConta(nome, pin) {
  if (typeof nome !== 'string' || !/^[a-z0-9 _-]{2,24}$/.test(nome)) return 'nome inválido';
  if (typeof pin !== 'string' || !/^\d{4,10}$/.test(pin)) return 'PIN inválido (4-10 dígitos)';
  return null;
}

// id -> { ws, estado }
const jogadores = new Map();
let proximoId = 1;

// HTTP simples: serve de health check do Railway e de página de status.
const servidor = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`Venor MP online · jogadores conectados: ${jogadores.size}\n`);
});

const wss = new WebSocketServer({ server: servidor });

function enviar(ws, obj) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
}
function difunde(exceto, obj) {
  const txt = JSON.stringify(obj);
  for (const [id, j] of jogadores) {
    if (id !== exceto && j.ws.readyState === j.ws.OPEN) j.ws.send(txt);
  }
}

wss.on('connection', (ws) => {
  const id = proximoId++;
  jogadores.set(id, { ws, estado: null });
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  // manda ao novato a lista de quem já está online (com estado conhecido)
  const online = [];
  for (const [oid, j] of jogadores) {
    if (oid !== id && j.estado) online.push({ id: oid, ...j.estado });
  }
  enviar(ws, { tipo: 'init', id, jogadores: online });
  console.log(`+ jogador ${id} entrou (total ${jogadores.size})`);

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (msg.tipo === 'estado') {
      const { nome, cores, x, y, z, rotY, anim } = msg;
      const estado = { nome, cores, x, y, z, rotY, anim };
      const j = jogadores.get(id);
      if (j) j.estado = estado;
      difunde(id, { tipo: 'estado', id, ...estado });
      return;
    }
    // === CONTAS NA NUVEM (cooldown de 1s por conexão contra spam) ===
    if (msg.tipo === 'contaSalvar' || msg.tipo === 'contaCarregar') {
      const agora = Date.now();
      if (ws._ultimaConta && agora - ws._ultimaConta < 1000) return;
      ws._ultimaConta = agora;
      const nome = String(msg.nome || '').toLowerCase().trim();
      const pin = String(msg.pin || '');
      const erroVal = validaConta(nome, pin);
      const acao = msg.tipo === 'contaSalvar' ? 'salvar' : 'carregar';
      if (erroVal) { enviar(ws, { tipo: 'contaResp', acao, ok: false, erro: erroVal }); return; }
      const h = hashPin(nome, pin);
      const conta = contas[nome];
      if (conta && conta.hash !== h) {
        enviar(ws, { tipo: 'contaResp', acao, ok: false, erro: 'PIN não confere para esta conta' });
        return;
      }
      if (msg.tipo === 'contaSalvar') {
        const dados = String(msg.dados || '');
        if (!dados || dados.length > 100000) { enviar(ws, { tipo: 'contaResp', acao, ok: false, erro: 'save vazio ou grande demais' }); return; }
        contas[nome] = { hash: h, dados, quando: agora };
        persisteContas();
        enviar(ws, { tipo: 'contaResp', acao, ok: true, quando: agora });
        console.log(`☁️ save de "${nome}" guardado (${dados.length}b)`);
      } else {
        if (!conta) { enviar(ws, { tipo: 'contaResp', acao, ok: false, erro: 'conta ainda não existe na nuvem — envie um save primeiro' }); return; }
        enviar(ws, { tipo: 'contaResp', acao, ok: true, dados: conta.dados, quando: conta.quando });
      }
    }
  });

  const sair = () => {
    if (!jogadores.has(id)) return;
    jogadores.delete(id);
    difunde(id, { tipo: 'saiu', id });
    console.log(`- jogador ${id} saiu (total ${jogadores.size})`);
  };
  ws.on('close', sair);
  ws.on('error', sair);
});

// keep-alive: derruba conexões mortas e evita timeout de proxy.
const heartbeat = setInterval(() => {
  for (const [, j] of jogadores) {
    if (j.ws.readyState !== j.ws.OPEN) continue;
    if (j.ws.isAlive === false) { j.ws.terminate(); continue; }
    j.ws.isAlive = false;
    j.ws.ping();
  }
}, 30000);
wss.on('close', () => clearInterval(heartbeat));

servidor.listen(PORT, () => {
  console.log(`Servidor MP ouvindo na porta ${PORT}`);
});

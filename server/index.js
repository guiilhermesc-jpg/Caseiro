// =============================================================
//  SERVIDOR MULTIPLAYER (relay)  ·  Venor / Caseiro
//  Node + ws. Cada cliente envia seu estado (~12x/seg); o servidor
//  CARIMBA o id (o cliente não escolhe o seu) e REPASSA aos OUTROS.
//  Guarda o último estado de cada jogador para que um novato veja
//  quem já está online no momento em que entra.
//  No Railway a porta vem em process.env.PORT.
// =============================================================
import http from 'node:http';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;

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

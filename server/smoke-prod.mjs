// Teste do relay em PRODUÇÃO (Railway), via wss://.
import { WebSocket } from 'ws';
const URL = 'wss://venor-servidor-production.up.railway.app';
const log = [];
const ok = (c, m) => { log.push(`${c ? '✅' : '❌'} ${m}`); if (!c) process.exitCode = 1; };

const a = new WebSocket(URL);
let bEstado = null, bInit = null;
a.on('open', () => {
  const b = new WebSocket(URL);
  b.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.tipo === 'init') bInit = m;
    if (m.tipo === 'estado') bEstado = m;
  });
  b.on('open', () => {
    setTimeout(() => a.send(JSON.stringify({ tipo: 'estado', nome: 'Alice', cores: { casaco: 1 }, x: 5, y: 0, z: 9, rotY: 1.2, anim: { mov: true } })), 150);
    setTimeout(() => {
      ok(bInit && typeof bInit.id === 'number', `init com id (${bInit?.id})`);
      ok(bEstado && bEstado.nome === 'Alice' && bEstado.x === 5, 'estado repassado de A -> B via wss');
      console.log(log.join('\n'));
      a.close(); b.close(); process.exit(process.exitCode || 0);
    }, 700);
  });
  b.on('error', (e) => { console.error('B erro:', e.message); process.exit(1); });
});
a.on('error', (e) => { console.error('A erro:', e.message); process.exit(1); });

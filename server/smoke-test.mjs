// Teste rápido do relay: 2 clientes, um se move, o outro deve receber.
import { WebSocket } from 'ws';
const URL = 'ws://localhost:8080';
const log = [];
const ok = (c, m) => { log.push(`${c ? '✅' : '❌'} ${m}`); if (!c) process.exitCode = 1; };

const a = new WebSocket(URL);
let bRecebeuEstado = null, bRecebeuSaiu = null, bInit = null;

a.on('open', () => {
  const b = new WebSocket(URL);
  b.on('message', (raw) => {
    const m = JSON.parse(raw);
    if (m.tipo === 'init') bInit = m;
    if (m.tipo === 'estado') bRecebeuEstado = m;
    if (m.tipo === 'saiu') bRecebeuSaiu = m;
  });
  b.on('open', () => {
    // A manda seu estado; B deve receber repassado com id carimbado.
    setTimeout(() => {
      a.send(JSON.stringify({ tipo: 'estado', nome: 'Alice', cores: { casaco: 1 }, x: 5, y: 0, z: 9, rotY: 1.2, anim: { mov: true } }));
    }, 100);
    // depois A desconecta; B deve receber 'saiu'.
    setTimeout(() => a.close(), 300);
    setTimeout(() => {
      ok(bInit && typeof bInit.id === 'number', `B recebeu init com id (${bInit?.id})`);
      ok(bRecebeuEstado && bRecebeuEstado.nome === 'Alice' && bRecebeuEstado.x === 5, 'B recebeu estado repassado de A');
      ok(bRecebeuEstado && typeof bRecebeuEstado.id === 'number' && bRecebeuEstado.id !== bInit.id, 'estado veio com id de A (carimbado, != id de B)');
      ok(bRecebeuSaiu && bRecebeuSaiu.id === bRecebeuEstado.id, "B recebeu 'saiu' do A ao desconectar");
      console.log(log.join('\n'));
      b.close();
      process.exit(process.exitCode || 0);
    }, 600);
  });
});
a.on('error', (e) => { console.error('erro conexão:', e.message); process.exit(1); });

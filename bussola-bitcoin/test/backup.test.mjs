/* Valida o recipe do Cofre (PBKDF2 + AES-256-GCM) — mesmo algoritmo do app.
 * Garante: roundtrip exato e que senha errada NÃO abre. */
let fail = 0;
function ok(name, cond) { console.log((cond ? '✓ ' : '✗ ') + name); if (!cond) fail++; }

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
  return { app: 'bussola', v: 1, salt: b64u.enc(salt), iv: b64u.enc(iv), data: b64u.enc(ct) };
}
async function decryptJSON(blob, pass) {
  const key = await deriveAesKey(pass, b64u.dec(blob.salt));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64u.dec(blob.iv) }, key, b64u.dec(blob.data));
  return JSON.parse(new TextDecoder().decode(pt));
}

const data = { 'bussola.checklist.v1': '["g0i0","g1i2"]', 'bussola.legado.v1': '{"titular":"Maria"}' };
const blob = await encryptJSON(data, 'senha-forte-123');
ok('cofre tem salt/iv/data', !!(blob.salt && blob.iv && blob.data));
const back = await decryptJSON(blob, 'senha-forte-123');
ok('roundtrip restaura exatamente', JSON.stringify(back) === JSON.stringify(data));
let wrong = false; try { await decryptJSON(blob, 'senha-errada'); } catch { wrong = true; }
ok('senha errada NÃO abre', wrong);

console.log(fail ? `\nFALHOU: ${fail}` : '\nTODOS OS TESTES OK');
process.exit(fail ? 1 : 0);

// One-off: regenera o CÉU PADRÃO (public/texturas/ceu.png) como um céu AZUL
// LIMPO de dia (sem pôr-do-sol/tons quentes) — assim o ciclo dia/noite tinge
// pra azul-escuro sem nunca produzir o flash MAGENTA do sunset. (RV13.7)
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('SEM OPENAI_API_KEY'); process.exit(1); }

const prompt = 'Panoramic fantasy daytime sky: a clear bright blue sky with soft fluffy white cumulus clouds, '
  + 'gentle and serene, even neutral daylight, NO sun disk, NO sunset, NO warm orange or pink tones, '
  + 'cool blue palette only, painterly, seamless horizontally, no land, no horizon objects, no birds, no text.';

const resp = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1536x1024', quality: 'high', output_format: 'png', n: 1 }),
});
if (!resp.ok) { console.error('HTTP ' + resp.status + ': ' + (await resp.text()).slice(0, 200)); process.exit(1); }
const b64 = (await resp.json())?.data?.[0]?.b64_json;
if (!b64) { console.error('sem imagem'); process.exit(1); }
const dst = join(RAIZ, 'public/texturas/ceu.png');
await writeFile(dst, Buffer.from(b64, 'base64'));
console.log('OK -> ' + dst);

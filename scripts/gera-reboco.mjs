// One-off: REBOCO premium (public/texturas/reboco.png) — a maior superfície do
// vilarejo (paredes) era um ruído procedural de 128px. Gera um reboco/estuque
// pintado à mão, CLARO e DESSATURADO (pra modular bem com a cor de cada casa).
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('SEM OPENAI_API_KEY'); process.exit(1); }

const prompt = 'Seamless tileable hand-painted stylized fantasy plaster stucco wall texture. '
  + 'Light neutral off-white cream color, LOW saturation, low contrast, so it can be tinted by any color. '
  + 'Subtle trowel strokes, fine hairline cracks, gentle weathering and faint moisture stains, soft even flat lighting, '
  + 'NO baked harsh shadows, NO strong color, Albion Online stylized art direction, crisp but soft, tiles seamlessly on all edges. No text, no border.';

const resp = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1024', quality: 'high', output_format: 'png', n: 1 }),
});
if (!resp.ok) { console.error('HTTP ' + resp.status + ': ' + (await resp.text()).slice(0, 200)); process.exit(1); }
const b64 = (await resp.json())?.data?.[0]?.b64_json;
if (!b64) { console.error('sem imagem'); process.exit(1); }
const dst = join(RAIZ, 'public/texturas/reboco.png');
await writeFile(dst, Buffer.from(b64, 'base64'));
console.log('OK -> ' + dst);

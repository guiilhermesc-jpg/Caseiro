// Regenera os 2 dragões noturnos que o safety barrou (prompt suavizado).
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('SEM OPENAI_API_KEY'); process.exit(1); }
const base = (d) => `${d}. Full body, friendly dynamic pose, painterly digital illustration, soft cinematic lighting, `
  + `cute-but-majestic stylized fantasy creature art (Albion Online vibe, original design), `
  + `isolated on a fully transparent background, no ground, no shadow, no text, no watermark.`;
const ITENS = [
  { file: 'furia_noite.png', prompt: base('An adorable yet majestic black-scaled fantasy dragon companion with big gentle glowing green eyes, smooth dark scales with subtle teal markings, sleek catlike body, friendly loyal pet dragon, gentle and noble') },
  { file: 'noite_jovem.png', prompt: base('A friendly juvenile black-scaled fantasy dragon, lean and growing, smooth dark scales, bright curious green eyes, small folded wings, playful adolescent pet dragon') },
];
let ok = 0;
for (const a of ITENS) {
  process.stdout.write(`  • ${a.file} ... `);
  try {
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt: a.prompt, size: '1024x1024', quality: 'high', output_format: 'png', background: 'transparent', n: 1 }),
    });
    if (!resp.ok) { console.log('FALHOU ' + resp.status + ': ' + (await resp.text()).slice(0, 120)); continue; }
    const b64 = (await resp.json())?.data?.[0]?.b64_json;
    await writeFile(join(RAIZ, 'public/assets/dragoes', a.file), Buffer.from(b64, 'base64'));
    console.log('OK'); ok++;
  } catch (e) { console.log('ERRO ' + e.message); }
}
console.log(`\n${ok}/${ITENS.length}`);

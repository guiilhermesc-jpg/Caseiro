// 2ª leva de texturas via API de imagens: rocha (montanha do dragão),
// muralha (Thais) e lava (poças). Roda: node scripts/gera-texturas2.mjs
import { writeFileSync, mkdirSync } from 'fs';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY não definido'); process.exit(1); }
mkdirSync('public/texturas', { recursive: true });

const TEXTURAS = [
  ['rocha', 'Seamless tileable texture of rough gray mountain rock cliff face for a videogame, hand-painted stylized look, flat even lighting, no shadows, repeating pattern, game asset'],
  ['muralha', 'Seamless tileable texture of large medieval sandstone castle wall blocks with mortar lines for a videogame, hand-painted stylized look, flat even lighting, no shadows, repeating pattern, game asset'],
  ['lava', 'Seamless tileable texture of glowing molten orange lava with dark rock crust cracks for a videogame, hand-painted stylized look, repeating pattern, game asset'],
];

for (const [nome, prompt] of TEXTURAS) {
  process.stdout.write(`Gerando ${nome}... `);
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'medium' }),
  });
  if (!r.ok) { console.error(`FALHOU (${r.status}): ${(await r.text()).slice(0, 200)}`); continue; }
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) { console.error('sem b64'); continue; }
  writeFileSync(`public/texturas/${nome}.png`, Buffer.from(b64, 'base64'));
  console.log('OK');
}
console.log('Concluído.');

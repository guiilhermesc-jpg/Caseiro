// 3ª leva PREMIUM: céu panorâmico + madeira + regenera grama/pedra/telha
// em QUALITY HIGH (mais detalhe). Roda: node scripts/gera-texturas3.mjs
import { writeFileSync, mkdirSync } from 'fs';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY não definido'); process.exit(1); }
mkdirSync('public/texturas', { recursive: true });

const TEXTURAS = [
  ['ceu', 'Equirectangular 360 panorama of a beautiful stylized fantasy sky for a videogame skybox, soft blue gradient with majestic white cumulus clouds, painterly hand-painted style, bright daylight, no sun disk, no ground, seamless horizontal wrap', '1536x1024', 'medium'],
  ['madeira', 'Seamless tileable texture of weathered wooden planks for a videogame, hand-painted stylized look, visible grain and nails, flat even lighting, no shadows, repeating pattern, game asset', '1024x1024', 'medium'],
  ['grama', 'Seamless tileable texture of lush vibrant green grass meadow for a premium videogame, rich hand-painted detail, small clover and tiny wildflowers scattered, top-down view, flat even lighting, no shadows, repeating pattern', '1024x1024', 'high'],
  ['pedra', 'Seamless tileable texture of medieval gray cobblestone pavement with worn rounded stones and moss in the cracks for a premium videogame, rich hand-painted detail, top-down view, flat even lighting, no shadows, repeating pattern', '1024x1024', 'high'],
  ['telha', 'Seamless tileable texture of overlapping terracotta clay roof tiles with weathering and subtle color variation for a premium videogame, rich hand-painted detail, straight-on view, flat even lighting, no shadows, repeating pattern', '1024x1024', 'high'],
];

for (const [nome, prompt, size, quality] of TEXTURAS) {
  process.stdout.write(`Gerando ${nome} (${quality})... `);
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size, quality }),
  });
  if (!r.ok) { console.error(`FALHOU (${r.status}): ${(await r.text()).slice(0, 200)}`); continue; }
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) { console.error('sem b64'); continue; }
  writeFileSync(`public/texturas/${nome}.png`, Buffer.from(b64, 'base64'));
  console.log('OK');
}
console.log('Concluído.');

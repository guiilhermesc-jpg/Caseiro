// Gera texturas TILEÁVEIS de alta qualidade via API de imagens (OpenAI)
// e salva em public/texturas/. Roda 1x: node scripts/gera-texturas.mjs
// (usa OPENAI_API_KEY do ambiente; autorizado pelo maestro)
import { writeFileSync, mkdirSync } from 'fs';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY não definido'); process.exit(1); }
mkdirSync('public/texturas', { recursive: true });

const TEXTURAS = [
  ['grama', 'Seamless tileable texture of lush stylized green grass for a videogame, hand-painted look, top-down view, flat even lighting, no shadows, subtle small flowers and dirt patches, repeating pattern, game asset'],
  ['pedra', 'Seamless tileable texture of medieval gray cobblestone pavement for a videogame, hand-painted stylized look, top-down view, flat even lighting, no shadows, repeating pattern, game asset'],
  ['telha', 'Seamless tileable texture of overlapping terracotta clay roof tiles for a videogame, hand-painted stylized look, straight-on view, flat even lighting, no shadows, repeating pattern, game asset'],
  ['areia', 'Seamless tileable texture of light beach sand with subtle ripples for a videogame, hand-painted stylized look, top-down view, flat even lighting, no shadows, repeating pattern, game asset'],
  ['terra', 'Seamless tileable texture of packed brown dirt path with small pebbles for a videogame, hand-painted stylized look, top-down view, flat even lighting, no shadows, repeating pattern, game asset'],
];

for (const [nome, prompt] of TEXTURAS) {
  process.stdout.write(`Gerando ${nome}... `);
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'medium' }),
  });
  if (!r.ok) { console.error(`FALHOU (${r.status}): ${(await r.text()).slice(0, 300)}`); continue; }
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) { console.error('sem b64 na resposta'); continue; }
  writeFileSync(`public/texturas/${nome}.png`, Buffer.from(b64, 'base64'));
  console.log('OK');
}
console.log('Concluído.');

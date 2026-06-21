// =============================================================
//  GERADOR DE ARTE PREMIUM DO VENOR  ·  OpenAI Images (gpt-image-1).
//  Splash épico da abertura, dragão lindo, céu e TEXTURAS seamless premium.
//  Uso: node --env-file-if-exists=.env scripts/gera-venor.mjs [ids...]
//  Sem ids = gera tudo. Ex.: scripts/gera-venor.mjs splash dragao grama
// =============================================================
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENDPOINT = 'https://api.openai.com/v1/images/generations';

// estilo seamless pra TEXTURAS de chão/parede (PBR albedo, sem sombra própria)
const TEX = (oque) =>
  `Seamless tileable hand-painted stylized fantasy game texture of ${oque}. ` +
  `Top-down orthographic flat view, even flat lighting, NO baked shadows, NO highlights, ` +
  `rich saturated color, crisp high detail, Warcraft and Albion Online art direction. ` +
  `The texture must tile seamlessly on all four edges. No text, no border, no watermark.`;

const ASSETS = [
  // --- ARTE da abertura/herói (paisagem e personagem) ---
  { id: 'splash', size: '1536x1024', bg: 'opaque', dir: 'public', file: 'splash.png',
    prompt: 'Epic fantasy game key art, the kingdom of Venor at golden hour: a great stone-walled medieval ' +
      'city on rolling green hills in the distance, a long winding road, deep ancient forest, a colossal ' +
      'majestic dragon soaring across a dramatic cloudy sky, volcanic mountains far behind. Cinematic ' +
      'painterly digital painting, epic scale, warm rim light, rich colors, highly detailed, no text, no UI.' },
  { id: 'dragao', size: '1024x1024', bg: 'transparent', dir: 'public/assets', file: 'dragao.png',
    prompt: 'A magnificent fantasy dragon, full body, wings spread wide, iridescent emerald and gold scales, ' +
      'fierce noble pose, glowing eyes, dynamic three-quarter view, painterly digital illustration, ' +
      'dramatic lighting, ultra detailed, isolated on transparent background, no text, no ground.' },
  { id: 'ceu', size: '1536x1024', bg: 'opaque', dir: 'public/texturas', file: 'ceu.png',
    prompt: 'Panoramic fantasy sky dome texture: soft volumetric cumulus clouds, serene gradient from warm ' +
      'horizon to deep blue zenith, gentle sun glow, painterly, calm, seamless horizontally, no land, no ' +
      'horizon line objects, no text.' },
  // --- TEXTURAS seamless (sobrescrevem public/texturas/) ---
  { id: 'grama',   size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'grama.png',   prompt: TEX('lush green meadow grass with tiny wildflowers and subtle dirt patches') },
  { id: 'pedra',   size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'pedra.png',   prompt: TEX('medieval cobblestone street, rounded grey stones with mossy mortar gaps') },
  { id: 'muralha', size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'muralha.png', prompt: TEX('medieval castle wall of large cut sandstone blocks with mortar and cracks') },
  { id: 'telha',   size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'telha.png',   prompt: TEX('rows of terracotta clay roof tiles, warm orange-red, weathered') },
  { id: 'madeira', size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'madeira.png', prompt: TEX('weathered wooden planks, warm brown grain with knots and nails') },
  { id: 'areia',   size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'areia.png',   prompt: TEX('desert sand with gentle wind ripples, warm pale gold') },
  { id: 'rocha',   size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'rocha.png',   prompt: TEX('dark rough volcanic rock, craggy basalt with subtle ash') },
  { id: 'terra',   size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'terra.png',   prompt: TEX('dry cracked earth, packed brown dirt road, scattered pebbles') },
  { id: 'lava',    size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'lava.png',    prompt: TEX('molten lava, glowing orange cracks across black cooled crust') },
  // --- montanha (rocha com neve no topo, pra fugir do "triângulo cinza") ---
  { id: 'montanha', size: '1024x1024', bg: 'opaque', dir: 'public/texturas', file: 'montanha.png', prompt: TEX('rugged grey mountain rock with snow patches and frost in the crevices') },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gerar(a, key) {
  for (let t = 1; t <= 3; t++) {
    const body = { model: 'gpt-image-1', prompt: a.prompt, size: a.size, quality: 'high', output_format: 'png', n: 1 };
    if (a.bg === 'transparent') body.background = 'transparent';
    const resp = await fetch(ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (resp.ok) {
      const json = await resp.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) throw new Error('resposta sem imagem');
      const destino = join(RAIZ, a.dir, a.file);
      await mkdir(dirname(destino), { recursive: true });
      await writeFile(destino, Buffer.from(b64, 'base64'));
      return destino.replace(RAIZ, '.');
    }
    const txt = await resp.text();
    if ((resp.status === 429 || resp.status >= 500) && t < 3) { await sleep(3000 * t); continue; }
    throw new Error(`HTTP ${resp.status}: ${txt.slice(0, 200)}`);
  }
}

const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('SEM OPENAI_API_KEY'); process.exit(1); }
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const lista = ids.length ? ASSETS.filter((a) => ids.includes(a.id)) : ASSETS;
console.log(`Gerando ${lista.length} asset(s) premium...`);
let ok = 0;
for (const a of lista) {
  process.stdout.write(`  • ${a.id} ... `);
  try { const d = await gerar(a, key); console.log('OK ' + d); ok++; }
  catch (e) { console.log('FALHOU: ' + e.message); }
  await sleep(500);
}
console.log(`\nConcluido: ${ok}/${lista.length}.`);

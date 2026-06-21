// =============================================================
//  DRAGÕES + REGIÕES PREMIUM  ·  OpenAI Images (gpt-image-1, high).
//  Frota de dragões (cada região o seu) + chão e céu PRÓPRIOS por região,
//  pra cada lugar ter cara única (fim do cenário genérico).
//  Uso: node --env-file-if-exists=.env scripts/gera-dragoes.mjs [ids...]
// =============================================================
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENDPOINT = 'https://api.openai.com/v1/images/generations';

const DRAGAO = (d) =>
  `${d}. Full body, wings spread, dynamic heroic pose, painterly digital illustration, ` +
  `dramatic cinematic lighting, ultra detailed scales, epic fantasy concept art, ` +
  `isolated on a fully transparent background, no ground, no shadow, no text, no watermark.`;
const TEX = (o) =>
  `Seamless tileable hand-painted stylized fantasy game ground texture of ${o}. ` +
  `Top-down orthographic flat view, even flat lighting, NO baked shadows, rich color, ` +
  `crisp detail, Albion Online art direction, tiles seamlessly on all edges. No text.`;
const CEU = (o) => `Panoramic fantasy sky: ${o}. Painterly, soft, seamless horizontally, no land, no horizon objects, no text.`;

const ASSETS = [
  // ---- DRAGÕES (cada região o seu) — transparentes ----
  { id: 'dragao_fogo',    dir: 'public/assets/dragoes', file: 'fogo.png',    bg: 'transparent', prompt: DRAGAO('A fearsome fire dragon with molten red and black scales, glowing lava cracks between the scales, breathing embers, smoke curling from its jaws') },
  { id: 'dragao_gelo',    dir: 'public/assets/dragoes', file: 'gelo.png',    bg: 'transparent', prompt: DRAGAO('A regal frost dragon with crystalline icy-white and pale-blue scales, frost on its horns, breathing a cold mist') },
  { id: 'dragao_pantano', dir: 'public/assets/dragoes', file: 'pantano.png', bg: 'transparent', prompt: DRAGAO('A cunning serpentine swamp dragon with mossy green and muddy scales, draped in vines and algae, low and coiled') },
  { id: 'dragao_sombra',  dir: 'public/assets/dragoes', file: 'sombra.png',  bg: 'transparent', prompt: DRAGAO('A sinister obsidian shadow dragon, black scales with violet inner glow, a broken-moon crest, menacing and gaunt') },
  { id: 'dragao_anciao',  dir: 'public/assets/dragoes', file: 'anciao.png',  bg: 'transparent', prompt: DRAGAO('A colossal ancient primordial dragon with weathered golden-bronze scales, immense tattered wings, wise glowing amber eyes') },
  { id: 'dragao_veia',    dir: 'public/assets/dragoes', file: 'veia.png',     bg: 'transparent', prompt: DRAGAO('A cosmic dragon whose translucent body glows with veins of molten gold and violet light coursing under crystalline scales, ethereal') },
  { id: 'dragao_drakari', dir: 'public/assets/dragoes', file: 'drakari.png', bg: 'transparent', prompt: DRAGAO('A towering humanoid dragon-warrior (dragonkin) in dark obsidian armor, draconic head, clawed hands gripping a jagged blade') },
  { id: 'dragao_filhote', dir: 'public/assets/dragoes', file: 'filhote.png', bg: 'transparent', prompt: DRAGAO('An adorable baby dragon hatchling with big curious eyes, tiny stubby wings, soft emerald scales, charming and round') },
  // ---- CHÃO por REGIÃO (seamless) ----
  { id: 'chao_pantano',   dir: 'public/texturas', file: 'chao_pantano.png',   bg: 'opaque', prompt: TEX('murky swamp ground, wet dark peat soil with patches of moss, shallow puddles and trampled reeds') },
  { id: 'chao_thais',     dir: 'public/texturas', file: 'chao_thais.png',     bg: 'opaque', prompt: TEX('dry mediterranean ground, golden sun-parched grass over sandy pale soil with small pebbles') },
  { id: 'chao_cinzas',    dir: 'public/texturas', file: 'chao_cinzas.png',    bg: 'opaque', prompt: TEX('charred ashen wasteland ground, black and grey volcanic ash over cracked dead earth, faint embers') },
  { id: 'chao_vulcanico', dir: 'public/texturas', file: 'chao_vulcanico.png', bg: 'opaque', prompt: TEX('dark volcanic basalt rock ground with thin glowing orange lava cracks and scattered ash') },
  { id: 'chao_floresta',  dir: 'public/texturas', file: 'chao_floresta.png',  bg: 'opaque', prompt: TEX('lush deep-forest floor, vibrant green moss and grass with ferns, clover and tiny wildflowers, rich and damp') },
  // ---- CÉU por REGIÃO ----
  { id: 'ceu_pantano',  dir: 'public/texturas', file: 'ceu_pantano.png',  bg: 'opaque', prompt: CEU('misty swamp sky, pale grey-green fog, dim diffuse hazy light, eerie and still') },
  { id: 'ceu_noctaria', dir: 'public/texturas', file: 'ceu_noctaria.png', bg: 'opaque', prompt: CEU('ominous dark night sky, deep purple and charcoal storm clouds, a large cracked broken moon glowing faintly') },
  { id: 'ceu_pico',     dir: 'public/texturas', file: 'ceu_pico.png',     bg: 'opaque', prompt: CEU('volcanic sky, thick ash clouds lit orange and red from below, drifting embers and smoke, dramatic heat haze') },
  { id: 'ceu_nuvens',   dir: 'public/texturas', file: 'ceu_nuvens.png',   bg: 'opaque', prompt: CEU('endless sea of soft white clouds under a brilliant blue sky, sunbeams, serene paradise above the storm') },
  // ---- CIDADE NAS NUVEM (base dos dragões) — arte-chave da quest ----
  { id: 'cidade_nuvens', dir: 'public/assets', file: 'cidade_nuvens.png', bg: 'opaque', size: '1536x1024',
    prompt: 'Epic fantasy key art: a majestic golden city of dragons floating high above a sea of clouds, soaring marble and gold spires and aeries, several great dragons circling the towers, sunbeams breaking through, awe-inspiring scale, painterly cinematic digital painting, ultra detailed, no text, no UI.' },
  { id: 'pedra_nuvem',  dir: 'public/texturas', file: 'pedra_nuvem.png',  bg: 'opaque', prompt: TEX('polished white marble floor with veins of gold inlay, ornate celestial dragon temple stone') },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gerar(a, key) {
  for (let t = 1; t <= 3; t++) {
    const body = { model: 'gpt-image-1', prompt: a.prompt, size: a.size || (a.file.startsWith('ceu') ? '1536x1024' : '1024x1024'), quality: 'high', output_format: 'png', n: 1 };
    if (a.bg === 'transparent') body.background = 'transparent';
    const resp = await fetch(ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (resp.ok) {
      const j = await resp.json(); const b64 = j?.data?.[0]?.b64_json;
      if (!b64) throw new Error('sem imagem');
      const dst = join(RAIZ, a.dir, a.file);
      await mkdir(dirname(dst), { recursive: true });
      await writeFile(dst, Buffer.from(b64, 'base64'));
      return dst.replace(RAIZ, '.');
    }
    const txt = await resp.text();
    if ((resp.status === 429 || resp.status >= 500) && t < 3) { await sleep(3000 * t); continue; }
    throw new Error(`HTTP ${resp.status}: ${txt.slice(0, 160)}`);
  }
}

const key = process.env.OPENAI_API_KEY;
if (!key) { console.error('SEM OPENAI_API_KEY'); process.exit(1); }
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const lista = ids.length ? ASSETS.filter((a) => ids.includes(a.id)) : ASSETS;
console.log(`Gerando ${lista.length} imagem(ns)...`);
let ok = 0;
for (const a of lista) { process.stdout.write(`  • ${a.id} ... `); try { console.log('OK ' + await gerar(a, key)); ok++; } catch (e) { console.log('FALHOU: ' + e.message); } await sleep(500); }
console.log(`\nConcluido: ${ok}/${lista.length}.`);

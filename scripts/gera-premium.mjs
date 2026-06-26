// =============================================================
//  GERAÇÃO PREMIUM (RV14) — dragões-mascote + estágios de crescimento +
//  dragões colossais + texturas de CASTELO/casa premium. gpt-image-1 high.
//  Uso: node --env-file-if-exists=.env scripts/gera-premium.mjs [ids...]
// =============================================================
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENDPOINT = 'https://api.openai.com/v1/images/generations';

const DRAGAO = (d) =>
  `${d}. Full body, dynamic heroic three-quarter pose, painterly digital illustration, dramatic cinematic ` +
  `lighting, ultra-detailed scales, epic stylized fantasy concept art (Albion Online / How to Train Your Dragon vibe but ORIGINAL design), ` +
  `isolated on a fully transparent background, no ground, no shadow, no text, no watermark.`;
const TEX = (o) =>
  `Seamless tileable hand-painted stylized fantasy game texture of ${o}. Top-down orthographic flat view, ` +
  `even flat lighting, NO baked harsh shadows, rich but slightly desaturated color, crisp detail, ` +
  `Albion Online art direction, tiles seamlessly on all edges. No text, no border.`;

const ASSETS = [
  // ---- DRAGÕES-MASCOTE (Fúria da Noite / do Dia) — transparentes ----
  { id: 'furia_noite', dir: 'public/assets/dragoes', file: 'furia_noite.png', bg: 'transparent',
    prompt: DRAGAO('A sleek agile night dragon with smooth midnight-black obsidian scales, large luminous green eyes, retractable dorsal fins, glowing electric-blue plasma light in its throat, catlike and nimble, intelligent friendly expression, a loyal mount') },
  { id: 'furia_dia', dir: 'public/assets/dragoes', file: 'furia_dia.png', bg: 'transparent',
    prompt: DRAGAO('A radiant sleek day dragon with smooth pearl-white and gold scales, glowing warm golden eyes, a shimmering halo of daylight, elegant swift wings, noble and bright, a loyal mount') },
  { id: 'tres_cabecas', dir: 'public/assets/dragoes', file: 'tres_cabecas.png', bg: 'transparent',
    prompt: DRAGAO('A colossal menacing THREE-HEADED dragon king, dark crimson and charcoal armored scales, three serpentine necks each with a snarling horned head, vast leathery bat wings spread wide, terrifying and regal') },
  // ---- ESTÁGIOS DE CRESCIMENTO da Fúria da Noite (filhote -> jovem -> adulto) ----
  { id: 'noite_filhote', dir: 'public/assets/dragoes', file: 'noite_filhote.png', bg: 'transparent',
    prompt: DRAGAO('An adorable BABY night dragon hatchling, big curious green eyes, tiny stubby wings, soft round black scales, clumsy and charming, sitting') },
  { id: 'noite_jovem', dir: 'public/assets/dragoes', file: 'noite_jovem.png', bg: 'transparent',
    prompt: DRAGAO('A juvenile young night dragon, lean and growing, sleek black scales, alert green eyes, wings now strong enough to glide, energetic adolescent') },
  { id: 'noite_adulto', dir: 'public/assets/dragoes', file: 'noite_adulto.png', bg: 'transparent',
    prompt: DRAGAO('A powerful ADULT night dragon at full size, massive muscular black-scaled body, huge wingspan, blazing green eyes, scars of battle, a fearsome loyal war-mount in mid-roar') },
  // ---- COLOSSO (varre vilarejos) + boss do coração ----
  { id: 'colosso', dir: 'public/assets/dragoes', file: 'colosso.png', bg: 'transparent',
    prompt: DRAGAO('A TITANIC ancient world-ending dragon of mountainous size, craggy armored scales like cliffs, glowing molten-orange fissures between the plates, vast tattered storm-wings, apocalyptic and overwhelming, able to level whole villages') },
  { id: 'dragao_coracao', dir: 'public/assets/dragoes', file: 'coracao.png', bg: 'transparent',
    prompt: DRAGAO('A boss dragon with a glowing crystalline HEART visible in its chest pulsing violet-and-gold light, obsidian and gold scales, ritual markings, the keeper of the Heart, imposing and sacred') },
  // ---- TEXTURAS DE CASTELO / CASA PREMIUM (seamless) ----
  { id: 'pedra_castelo',   dir: 'public/texturas', file: 'pedra_castelo.png',   bg: 'opaque', prompt: TEX('castle wall of large grey ashlar stone blocks with pale mortar joints, slightly weathered, sturdy medieval masonry') },
  { id: 'madeira_viga',    dir: 'public/texturas', file: 'madeira_viga.png',    bg: 'opaque', prompt: TEX('half-timbered wall: warm plaster panels framed by dark brown wooden beams, Tudor medieval fachwerk') },
  { id: 'telhado_ardosia', dir: 'public/texturas', file: 'telhado_ardosia.png', bg: 'opaque', prompt: TEX('dark blue-grey slate roof shingles, neat overlapping rows, cool stone tiles') },
  { id: 'palha',           dir: 'public/texturas', file: 'palha.png',           bg: 'opaque', prompt: TEX('thatched straw roof, bundled golden-brown dry reeds in neat layered rows, cozy cottage thatch') },
  { id: 'muralha_castelo', dir: 'public/texturas', file: 'muralha_castelo.png', bg: 'opaque', prompt: TEX('massive fortress rampart wall of huge cut grey stone blocks, heavy fortified masonry with deep mortar lines') },
  { id: 'piso_castelo',    dir: 'public/texturas', file: 'piso_castelo.png',    bg: 'opaque', prompt: TEX('grand castle floor of large polished stone flagstones in a tight grid, cool grey with subtle veining') },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gerar(a, key) {
  for (let t = 1; t <= 3; t++) {
    const body = { model: 'gpt-image-1', prompt: a.prompt, size: a.size || '1024x1024', quality: 'high', output_format: 'png', n: 1 };
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
console.log(`Gerando ${lista.length} imagem(ns) premium...`);
let ok = 0;
for (const a of lista) { process.stdout.write(`  • ${a.id} ... `); try { console.log('OK ' + await gerar(a, key)); ok++; } catch (e) { console.log('FALHOU: ' + e.message); } await sleep(400); }
console.log(`\nConcluido: ${ok}/${lista.length}.`);

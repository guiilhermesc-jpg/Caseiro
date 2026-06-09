// =============================================================
//  GERADOR DE ARTE  ·  cria os assets via OpenAI Images (gpt-image-1).
//
//  Uso:
//    npm run gerar-arte            -> gera TODOS os 24 assets
//    npm run gerar-arte jogador    -> gera só os ids passados (ex.: validar 1)
//    npm run sync-sprites          -> só atualiza o manifesto (sem gerar nada)
//
//  Requer OPENAI_API_KEY no arquivo .env (veja .env.example).
//  Salva PNGs transparentes em public/assets/ e atualiza src/data/sprites.js.
// =============================================================
import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENDPOINT = 'https://api.openai.com/v1/images/generations';
const QUALIDADE = process.env.ARTE_QUALIDADE || 'high';  // low | medium | high
const SIZE = process.env.ARTE_SIZE || '1024x1024';

// estilo coeso aplicado a TODAS as peças (é o que dá o look premium uniforme)
const ESTILO =
  'graphic novel game asset, bold black ink outlines, flat cel shading, ' +
  'muted desaturated wartime palette, dramatic shadows, single centered subject, ' +
  'slight top-down 3/4 angle, soft shadow beneath, plain neutral background, no text, no watermark';

const item = (assunto) => `A single ${assunto}, game item icon, ${ESTILO}`;
const pessoa = (descricao) => `${descricao}, full body, ${ESTILO}`;

const ASSETS = [
  // personagens
  { id: 'jogador', dir: 'personagens', prompt: pessoa('A determined civilian survivor in worn winter clothes') },
  { id: 'mae',     dir: 'personagens', prompt: pessoa('A tired but caring middle-aged woman in a heavy coat and scarf') },
  { id: 'filho',   dir: 'personagens', prompt: pessoa('A scared young boy clutching a small backpack') },
  { id: 'avo',     dir: 'personagens', prompt: pessoa('A frail elderly grandmother with a shawl') },
  // itens
  { id: 'agua',               dir: 'itens', prompt: item('clear plastic water bottle') },
  { id: 'comida',             dir: 'itens', prompt: item('dented canned food tin') },
  { id: 'agua_suja',          dir: 'itens', prompt: item('metal bucket of murky dirty water') },
  { id: 'biscoitos',          dir: 'itens', prompt: item('pack of plain crackers') },
  { id: 'remedio',            dir: 'itens', prompt: item('blister pack and box of pills') },
  { id: 'primeiros_socorros', dir: 'itens', prompt: item('first-aid kit with a red cross') },
  { id: 'alcool',             dir: 'itens', prompt: item('bottle of antiseptic alcohol') },
  { id: 'radio',              dir: 'itens', prompt: item('old portable transistor radio with antenna') },
  { id: 'lanterna',           dir: 'itens', prompt: item('handheld flashlight') },
  { id: 'pilhas',             dir: 'itens', prompt: item('pair of batteries') },
  { id: 'fosforos',           dir: 'itens', prompt: item('box of matches') },
  { id: 'faca',               dir: 'itens', prompt: item('utility kitchen knife') },
  { id: 'ferramentas',        dir: 'itens', prompt: item('metal toolbox with tools') },
  { id: 'cobertor',           dir: 'itens', prompt: item('folded wool blanket') },
  { id: 'livro',              dir: 'itens', prompt: item('old worn hardcover book') },
  { id: 'foto_familia',       dir: 'itens', prompt: item('framed family photograph') },
  { id: 'documentos',         dir: 'itens', prompt: item('stack of ID papers and a passport') },
  { id: 'dinheiro',           dir: 'itens', prompt: item('bundle of cash banknotes') },
  { id: 'joias',              dir: 'itens', prompt: item('small pile of jewelry with a ring and a necklace') },
  { id: 'combustivel',        dir: 'itens', prompt: item('red metal jerry can of fuel') },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gerar(a, key) {
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: a.prompt,
        size: SIZE,
        quality: QUALIDADE,
        background: 'transparent',
        output_format: 'png',
        n: 1,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) throw new Error('resposta sem imagem');
      const destino = join(RAIZ, 'public', 'assets', a.dir, `${a.id}.png`);
      await mkdir(dirname(destino), { recursive: true });
      await writeFile(destino, Buffer.from(b64, 'base64'));
      return destino;
    }
    const txt = await resp.text();
    if ((resp.status === 429 || resp.status >= 500) && tentativa < 3) {
      await sleep(2000 * tentativa);
      continue;
    }
    throw new Error(`HTTP ${resp.status}: ${txt.slice(0, 300)}`);
  }
}

async function lerIds(dir) {
  try {
    const files = await readdir(join(RAIZ, 'public', 'assets', dir));
    return files.filter((f) => f.toLowerCase().endsWith('.png'))
      .map((f) => f.replace(/\.png$/i, '')).sort();
  } catch { return []; }
}

async function atualizarManifesto() {
  const itens = await lerIds('itens');
  const pessoas = await lerIds('personagens');
  const conteudo =
    '// GERADO/ATUALIZADO por scripts/gerar-arte.mjs (npm run sync-sprites).\n' +
    '// Lista os sprites presentes em public/assets/. O jogo usa estes no lugar dos emojis.\n' +
    `export const SPRITES_ITENS = ${JSON.stringify(itens)};\n` +
    `export const SPRITES_PESSOAS = ${JSON.stringify(pessoas)};\n`;
  await writeFile(join(RAIZ, 'src', 'data', 'sprites.js'), conteudo);
  return { itens, pessoas };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--sync-only')) {
    const m = await atualizarManifesto();
    console.log(`Manifesto atualizado: ${m.itens.length} itens, ${m.pessoas.length} personagens.`);
    return;
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error('\nERRO: OPENAI_API_KEY não definida.');
    console.error('Crie o arquivo .env (copie de .env.example) e cole sua chave da OpenAI.\n');
    process.exit(1);
  }

  const ids = args.filter((a) => !a.startsWith('--'));
  const lista = ids.length ? ASSETS.filter((a) => ids.includes(a.id)) : ASSETS;
  if (!lista.length) {
    console.error('Nenhum asset corresponde a:', ids.join(', '));
    console.error('IDs válidos:', ASSETS.map((a) => a.id).join(', '));
    process.exit(1);
  }

  console.log(`\nGerando ${lista.length} asset(s) | qualidade=${QUALIDADE} | ${SIZE}\n`);
  let ok = 0;
  for (const a of lista) {
    process.stdout.write(`  • ${a.id} ... `);
    try {
      const d = await gerar(a, key);
      console.log('OK  ' + d.replace(RAIZ, '.'));
      ok++;
    } catch (e) {
      console.log('FALHOU: ' + e.message);
    }
    await sleep(400);
  }
  const m = await atualizarManifesto();
  console.log(`\nConcluído: ${ok}/${lista.length} gerado(s).`);
  console.log(`Manifesto: ${m.itens.length} itens, ${m.pessoas.length} personagens.`);
  console.log('Rode "npm run dev" (ou me avise) pra ver na tela.\n');
}

main().catch((e) => { console.error('ERRO FATAL:', e); process.exit(1); });

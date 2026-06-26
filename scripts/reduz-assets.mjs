// Reduz peso dos assets gerados (load + memoria) sem perder qualidade visivel.
// Texturas tileaveis -> 512px; splash -> JPG leve; dragao menor; ceu menor.
import sharp from 'sharp';
import { readFile, writeFile, unlink } from 'node:fs/promises';

const TEX = 'public/texturas/';
async function png(path, w, h) {
  const buf = await readFile(path);
  const out = await sharp(buf).resize(w, h).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path, out);
  console.log(path, (out.length / 1024 | 0) + 'KB');
}
async function jpg(src, dst, w, h, q) {
  const buf = await readFile(src);
  const out = await sharp(buf).resize(w, h).jpeg({ quality: q, mozjpeg: true }).toBuffer();
  await writeFile(dst, out);
  console.log(dst, (out.length / 1024 | 0) + 'KB');
}

for (const t of ['grama', 'pedra', 'muralha', 'telha', 'madeira', 'areia', 'rocha', 'terra', 'lava', 'montanha']) {
  await png(TEX + t + '.png', 512, 512);
}
await png(TEX + 'ceu.png', 1024, 683);
// dragao precisa de transparencia -> png, mas menor
await png('public/assets/dragao.png', 640, 640);
// splash e opaco -> JPG leve (4x menor); ref atualizada no codigo
await jpg('public/splash.png', 'public/splash.jpg', 1366, 911, 82);
await unlink('public/splash.png').catch(() => {});
console.log('OK');

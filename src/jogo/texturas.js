// =============================================================
//  MOTOR DE TEXTURAS PBR (RV11.4) — qualidade de imagem.
//  Gera, em canvas (sem asset/IA externa), texturas com ALBEDO + NORMAL MAP
//  procedurais: a luz passa a "morder" a superfície (relevo real) em vez de
//  bater num plástico chapado. É o maior salto de renderização possível sem
//  baixar imagens. Tipos: pedra, madeira, areia, metal, tecido, terra.
//  Cacheado por chave. Anisotropia alta = textura nítida em ângulo raso.
// =============================================================
import * as THREE from 'three';

const _cache = new Map();
const ANISO = 8;
const temDoc = (typeof document !== 'undefined');

function canvasRuido(corBase, tipo, contraste, tam) {
  const c = document.createElement('canvas'); c.width = c.height = tam;
  const ctx = c.getContext('2d');
  const base = new THREE.Color(corBase);
  const img = ctx.createImageData(tam, tam);
  // ruído de base (grão + manchas largas determinísticas)
  for (let i = 0; i < tam * tam; i++) {
    const x = i % tam, y = (i / tam) | 0;
    const manchas = (Math.sin(x * 0.18) * Math.cos(y * 0.13) + Math.sin(x * 0.05 + y * 0.07)) * contraste * 0.35;
    const grao = (Math.random() - 0.5) * contraste;
    let n = grao + manchas;
    // detalhe por TIPO
    if (tipo === 'madeira') n += Math.sin(x * 0.9) * contraste * 0.5 + Math.sin(x * 3.1) * contraste * 0.18; // veios verticais
    else if (tipo === 'areia') n += Math.sin((x + y) * 0.5) * contraste * 0.4; // marcas de vento diagonais
    else if (tipo === 'metal') n = grao * 0.4 + Math.sin(y * 1.3) * contraste * 0.25; // escovado horizontal
    else if (tipo === 'tecido') n += (Math.sin(x * 1.6) + Math.sin(y * 1.6)) * contraste * 0.3; // trama
    const k = i * 4;
    img.data[k] = Math.max(0, Math.min(255, base.r * 255 + n));
    img.data[k + 1] = Math.max(0, Math.min(255, base.g * 255 + n));
    img.data[k + 2] = Math.max(0, Math.min(255, base.b * 255 + n));
    img.data[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // RACHADURAS/JUNTAS pra pedra e terra (linhas escuras orgânicas)
  if (tipo === 'pedra' || tipo === 'terra') {
    ctx.strokeStyle = 'rgba(0,0,0,0.32)'; ctx.lineWidth = Math.max(1, tam / 90);
    const linhas = tipo === 'pedra' ? 7 : 4;
    for (let l = 0; l < linhas; l++) {
      ctx.beginPath();
      let px = Math.random() * tam, py = Math.random() * tam; ctx.moveTo(px, py);
      const passos = 5 + ((Math.random() * 4) | 0);
      for (let s = 0; s < passos; s++) { px += (Math.random() - 0.5) * tam * 0.4; py += (Math.random() - 0.5) * tam * 0.4; ctx.lineTo(px, py); }
      ctx.stroke();
    }
  }
  return c;
}

// Normal map a partir da luminância (Sobel simples) — relevo coerente com o albedo.
function normalDeCanvas(src, forca) {
  const w = src.width, h = src.height;
  const sd = src.getContext('2d').getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const octx = out.getContext('2d');
  const img = octx.createImageData(w, h);
  const lum = (x, y) => { x = (x + w) % w; y = (y + h) % h; const i = (y * w + x) * 4; return (sd[i] + sd[i + 1] + sd[i + 2]) / 765; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (lum(x - 1, y) - lum(x + 1, y)) * forca;
    const dy = (lum(x, y - 1) - lum(x, y + 1)) * forca;
    const len = Math.hypot(dx, dy, 1);
    const i = (y * w + x) * 4;
    img.data[i] = (dx / len * 0.5 + 0.5) * 255;
    img.data[i + 1] = (dy / len * 0.5 + 0.5) * 255;
    img.data[i + 2] = (1 / len * 0.5 + 0.5) * 255;
    img.data[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}

// Mapa de RUGOSIDADE da luminância: pontos altos (claros) ficam um tris menos
// ásperos (pegam brilho); fundos (escuros/juntas) ficam foscos. Material real.
function rugosidadeDeCanvas(src) {
  const w = src.width, h = src.height;
  const sd = src.getContext('2d').getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const octx = out.getContext('2d'); const img = octx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const lum = (sd[i * 4] + sd[i * 4 + 1] + sd[i * 4 + 2]) / 765;
    const r = Math.max(0, Math.min(1, 1.0 - lum * 0.28)) * 255;
    img.data[i * 4] = r; img.data[i * 4 + 1] = r; img.data[i * 4 + 2] = r; img.data[i * 4 + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return out;
}

function configura(tex, repeat) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = ANISO;
  return tex;
}

// Devolve { map, normalMap } PBR. Cacheado.
export function texPBR(corBase, { tipo = 'pedra', contraste = 22, tam = 128, repeat = 4, normalForca = 2.2 } = {}) {
  if (!temDoc) return { map: null, normalMap: null, roughnessMap: null };
  const chave = `${corBase}|${tipo}|${contraste}|${tam}|${repeat}|${normalForca}`;
  if (_cache.has(chave)) {
    const o = _cache.get(chave);
    return { map: o.map.clone(), normalMap: o.normalMap.clone(), roughnessMap: o.roughnessMap.clone() };
  }
  const cv = canvasRuido(corBase, tipo, contraste, tam);
  const map = configura(new THREE.CanvasTexture(cv), repeat);
  map.colorSpace = THREE.SRGBColorSpace;
  const normalMap = configura(new THREE.CanvasTexture(normalDeCanvas(cv, normalForca)), repeat);
  const roughnessMap = configura(new THREE.CanvasTexture(rugosidadeDeCanvas(cv)), repeat);
  _cache.set(chave, { map, normalMap, roughnessMap });
  return { map: map.clone(), normalMap: normalMap.clone(), roughnessMap: roughnessMap.clone() };
}

// Conveniência: material PBR pronto (relevo + rugosidade coerentes).
export function matPBR(corBase, opts = {}) {
  const { map, normalMap, roughnessMap } = texPBR(corBase, opts);
  const m = new THREE.MeshStandardMaterial({
    color: map ? 0xffffff : corBase,
    roughness: opts.rough ?? 0.92,
    metalness: opts.metal ?? 0.0,
  });
  if (map) m.map = map;
  if (normalMap) { m.normalMap = normalMap; m.normalScale = new THREE.Vector2(opts.relevo ?? 0.7, opts.relevo ?? 0.7); }
  if (roughnessMap && opts.semRough !== true) m.roughnessMap = roughnessMap;
  return m;
}

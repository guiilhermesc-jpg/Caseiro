/* Monta a pasta www/ (conteúdo do app web) que o Capacitor empacota nos apps nativos.
 * Copia só os arquivos estáticos do app — sem node_modules/src/test. */
import { cpSync, rmSync, mkdirSync } from 'node:fs';

const OUT = 'www';
const ITEMS = ['index.html', 'sw.js', 'manifest.webmanifest', 'icon.svg', 'assets', 'docs'];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const item of ITEMS) cpSync(item, `${OUT}/${item}`, { recursive: true });
console.log(`www/ pronto (${ITEMS.length} itens copiados).`);

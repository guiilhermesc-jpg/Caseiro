import { defineConfig } from 'vite';

// Config simples do Vite. host:true expõe na rede local,
// o que será útil quando você quiser testar no celular real.
export default defineConfig({
  server: { host: true, port: 5173 },
});

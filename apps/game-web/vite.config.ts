import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Exact public-core allowlist: never serve/copy the repository or private assets.
const engineFiles = ['card-data.js', 'combat-math.js', 'card-effects.js', 'battle-engine.js', 'boss-planner.js'];
const engineSource = (name: string) => readFileSync(new URL('../../src/game/' + name, import.meta.url), 'utf8');
export default defineConfig({
  base: './', publicDir: false, envPrefix: 'GAME_WEB_PUBLIC_',
  server: { fs: { allow: [fileURLToPath(new URL('.', import.meta.url))], deny: ['**/.git/**', '**/.env*', '**/private-assets/**', '**/research/**'] } },
  build: { outDir: 'dist', emptyOutDir: true },
  plugins: [{
    name: 'existing-classic-battle-core',
    transformIndexHtml: {
      order: 'post',
      handler() {
        return engineFiles.map(name => ({ tag: 'script', attrs: { src: './engine/' + name }, injectTo: 'body-prepend' as const }));
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0]?.replace(/^\/engine\//, '');
        if (!req.url?.startsWith('/engine/') || !name || !engineFiles.includes(name)) return next();
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.end(engineSource(name));
      });
    },
    generateBundle() {
      for (const name of engineFiles) this.emitFile({ type: 'asset', fileName: 'engine/' + name, source: engineSource(name) });
    }
  }]
});

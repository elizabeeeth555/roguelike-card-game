import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Exact public-core allowlist: never serve/copy the repository or private assets.
const engineFiles = ['card-data.js', 'combat-math.js', 'card-effects.js', 'battle-engine.js', 'boss-planner.js'];
const publicMedia: Record<string, string> = {
  'scene/background.webp': 'assets/backgrounds/castle_throne_room.webp',
  'scene/boss.png': 'assets/characters/castle/02_heavy_knight_boss.png',
  'scene/face.png': 'assets/characters/castle/01_black_swordsman_face.png'
};
const mediaSource = (path: string) => readFileSync(new URL('../../' + path, import.meta.url));
const engineSource = (name: string) => readFileSync(new URL('../../src/game/' + name, import.meta.url), 'utf8');
export default defineConfig({
  base: './', publicDir: false, envPrefix: 'GAME_WEB_PUBLIC_',
  server: { fs: { allow: [fileURLToPath(new URL('.', import.meta.url))], deny: ['**/.git/**', '**/.env*', '**/private-assets/**', '**/research/**'] } },
  build: { outDir: 'dist', emptyOutDir: true },
  plugins: [{
    name: 'existing-classic-battle-core',
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        if (context.path === '/dev-preview.html') return [];
        return engineFiles.map(name => ({ tag: 'script', attrs: { src: './engine/' + name }, injectTo: 'body-prepend' as const }));
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const media = req.url?.split('?')[0]?.replace(/^\//, '');
        if (media && Object.hasOwn(publicMedia, media)) {
          res.setHeader('Content-Type', media.endsWith('.webp') ? 'image/webp' : 'image/png');
          res.end(mediaSource(publicMedia[media])); return;
        }
        const name = req.url?.split('?')[0]?.replace(/^\/engine\//, '');
        if (!req.url?.startsWith('/engine/') || !name || !engineFiles.includes(name)) return next();
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        res.end(engineSource(name));
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(publicMedia)) this.emitFile({ type: 'asset', fileName, source: mediaSource(source) });
      for (const name of engineFiles) this.emitFile({ type: 'asset', fileName: 'engine/' + name, source: engineSource(name) });
    }
  }]
});

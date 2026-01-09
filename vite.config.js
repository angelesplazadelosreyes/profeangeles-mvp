// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  server: { open: '/index.html' },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        exercises: 'exercises.html',
        classes: 'classes.html',
        guides: 'guides.html',
        "services-dev":'services-dev.html',
        exercises2: 'exercises2/index.html',
      },
    },
  },
  plugins: [
    {
      name: 'clean-urls-dev-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && !req.url.includes('.')) {
            if (req.url === '/') req.url = '/index.html';
            else if (req.url === '/exercises') req.url = '/exercises.html';
            else if (req.url === '/classes') req.url = '/classes.html';
            else if (req.url === '/exercises2') req.url = '/exercises2/index.html'; // ← añadido
          }
          next();
        });
      },
    },
  ],
});

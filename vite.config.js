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
        "services-dev": 'services-dev.html',
        "class-area": 'class-area.html',
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
            else if (req.url.startsWith('/class-area')) req.url = '/class-area.html' + req.url.slice('/class-area'.length);
          }
          next();
        });
      },
    },
  ],
});
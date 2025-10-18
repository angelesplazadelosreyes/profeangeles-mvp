// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',          // sirve / copia tal cual lo que pongas en public/
  server: {
    open: '/index.html',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        exercises: 'exercises.html',
        classes: 'classes.html',
      },
    },
  },
  plugins: [
    {
      // Habilita /, /exercises y /classes en DEV sin .html
      name: 'clean-urls-dev-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // si la URL no tiene punto (.) asumimos que es una ruta "limpia"
          if (req.url && !req.url.includes('.')) {
            if (req.url === '/') req.url = '/index.html';
            else if (req.url === '/exercises') req.url = '/exercises.html';
            else if (req.url === '/classes') req.url = '/classes.html';
          }
          next();
        });
      },
    },
  ],
});

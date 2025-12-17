# Checkpoint — build/prod OK

## Reglas
- Los HTML principales viven en la raíz:
  - index.html
  - exercises.html
  - classes.html
  - exercises2/index.html

- `public/` es SOLO para estáticos:
  - /styles/...
  - /scripts/partials.js
  - /partials/header.html
  - /partials/footer.html
  - imágenes, favicon, og-image, etc.

## Vite
- `vite.config.js` debe incluir en `build.rollupOptions.input`:
  - index, exercises, classes, exercises2

## Partials
- En HTML usar:
  - <div data-include="header"></div>
  - <div data-include="footer"></div>
- NO usar ".html" en data-include.

# ProfeÁngeles — MVP estático + API

Sitio estático con generador de ejercicios (función cuadrática) y gráfico en frontend.

## Estructura
- `/public`: imágenes.
- `/styles/styles.css`: estilos base.
- `/scripts/main.js`: lógica de UI (fetch + Chart.js + MathJax).
- `/api/generate_exercise.py`: API Python (Flask) para Vercel.
- `index.html`, `youtube.html`, `about.html`.

## Desarrollo local
Requiere Python 3.11+ (para probar la API localmente si quieres).

```bash
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
FLASK_APP=api/generate_exercise.py flask run --port 5000

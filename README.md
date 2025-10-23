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


## Dependencias y política de actualizaciones

Este servicio usa Python (Flask) y se despliega en Render con `Root Directory=api`.

- **Archivo de dependencias:** `api/requirements.txt`
- **Versiones fijadas (pinned):**  
  - Flask==3.0.3  
  - flask-cors==4.0.0  
  - gunicorn==21.2.0

### Cadencia recomendada
- **Parches (bugfix/seguridad):** mensual (primer lunes del mes).
- **Minor upgrades:** trimestral (cada 3 meses), con pruebas en `/exercises2` antes de tocar producción.
- **Urgencias de seguridad:** inmediato, fuera de calendario.

### Flujo sugerido para actualizar
1. Crear rama `chore/deps-YYYY-MM`.
2. Probar local:
   ```bash
   python -m venv .venv
   . .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r api/requirements.txt
3.Probar en /exercises2 (playground).
4.Hacer deploy a Render y validar GET /health.
4.Merge a main.
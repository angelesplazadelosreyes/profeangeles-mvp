# api/__init__.py
from flask import Flask
# CORS opcional: si falta el paquete en Render, no rompemos el arranque
try:
    from flask_cors import CORS
except Exception:
    def CORS(_app):
        return _app


# Importa la app ya existente de prod
from generate_exercise import app as legacy_app

def create_app():
    # Usamos la app de producción como base
    app = legacy_app

    # Aplica CORS (seguro; tu prod ya agrega headers, esto suma compatibilidad)
    CORS(app)

    # Registra el playground como blueprint adicional (prefijo definido en playground.py)
    from playground import playground_bp  # mismo directorio
    app.register_blueprint(playground_bp)

    return app

# Render ejecuta: wsgi:app  → api/wsgi.py importa este app
app = create_app()

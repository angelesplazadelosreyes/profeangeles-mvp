# api/__init__.py
# Arranca la app de PRODUCCIÓN y le agrega las rutas del playground.
# No cambiamos nada de la app existente: solo registramos un blueprint extra.

# Importa la app ya existente de prod
from generate_exercise import app as legacy_app

# CORS opcional (no debe romper si falta el paquete)
try:
    from flask_cors import CORS
except Exception:  # no-op si no está instalado
    def CORS(_app):
        return _app

def create_app():
    # Usamos la app de producción como base
    app = legacy_app

    # Si tienes CORS, lo aplicamos (no hace daño si ya pusiste headers manuales)
    try:
        CORS(app)
    except Exception:
        pass

    # Registramos el playground como blueprint adicional
    try:
        from playground import playground_bp  # está en el mismo directorio
        app.register_blueprint(playground_bp)
    except Exception as e:
        # No rompemos el arranque si falla; lo sabremos en /__routes
        @app.get("/__playground_import_error")
        def __pg_err():
            return {"playground_import_error": repr(e)}, 200

    # Diagnóstico: lista de rutas (texto plano)
    @app.get("/__routes")
    def routes():
        try:
            lines = sorted(r.rule for r in app.url_map.iter_rules())
            return "\n".join(lines), 200, {"Content-Type": "text/plain; charset=utf-8"}
        except Exception as e:
            return {"error": repr(e)}, 500

    return app

# Render ejecuta: wsgi:app   → api/wsgi.py importa este app
app = create_app()

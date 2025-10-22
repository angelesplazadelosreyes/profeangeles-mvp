# api/__init__.py
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Blueprints
    from .generate_exercise import prod_bp      # producción: /api/...
    from .playground import playground_bp       # playground: /api/playground/...

    app.register_blueprint(prod_bp)
    app.register_blueprint(playground_bp)

    @app.get("/health")
    def health():
        try:
            routes = sorted(r.rule for r in app.url_map.iter_rules())
            return {"ok": True, "routes": routes}, 200
        except Exception as e:
            return {"ok": True, "routes_error": repr(e)}, 200


    # Debug: lista todas las rutas registradas (para verificar el blueprint)
    @app.get("/__routes")
    def routes():
        try:
            lines = []
            for r in app.url_map.iter_rules():
                lines.append(r.rule)
            # Respuesta en texto plano para evitar problemas de serialización
            return "\n".join(sorted(lines)), 200, {"Content-Type": "text/plain; charset=utf-8"}
        except Exception as e:
            return {"error": repr(e)}, 500

        return {"routes": sorted(str(r) for r in app.url_map.iter_rules())}, 200

    return app

# Para Render (si corre "app:app")
app = create_app()

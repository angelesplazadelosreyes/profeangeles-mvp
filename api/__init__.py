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
        return {"ok": True}, 200

    # Debug: lista todas las rutas registradas (para verificar el blueprint)
    @app.get("/__routes")
    def routes():
        return {"routes": sorted(str(r) for r in app.url_map.iter_rules())}, 200

    return app

# Para Render (si corre "app:app")
app = create_app()

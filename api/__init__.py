# api/__init__.py
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # o CORS selectivo

    # Importa y registra blueprints
    from .generate_exercise import prod_bp    # <- asegura que exista prod_bp
    from .playground import playground_bp

    app.register_blueprint(prod_bp)           # /api/...
    app.register_blueprint(playground_bp)     # /api2/...

    @app.get("/health")
    def health():
        return {"ok": True}, 200

    return app

# Para Render (si corre "app:app")
app = create_app()

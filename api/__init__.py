# api/__init__.py
from flask import Flask
from flask_cors import CORS

from .generate_exercise import app as legacy_app

def create_app():
    app = legacy_app
    CORS(app)
    return app

# Render ejecuta: wsgi:app  → api/wsgi.py importa este app
app = create_app()
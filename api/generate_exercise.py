import json
import random
import time

from flask import Flask, Response, request, jsonify

from exercises.quadratic.traits import quadratic_traits
from exercises.quadratic.plot import plot_quadratic_png
from exercises.quadratic.generators import rand_coeff_from_roots
from exercises.quadratic.latex import (
    format_latex_quadratic,
    latex_solution,
    latex_factorized_from_roots,
    latex_canonical_from_vertex,
    latex_general_function,  # ✅ punto 5
)

app = Flask(__name__)

# --------------------- CORS ---------------------
@app.after_request
def add_cors_headers(response):
    # Para MVP dejamos *; OJO, después reemplazas por los dominios de Vercel y mi dominio:
    #   "https://profeangeles.cl", "https://profeangeles-*.vercel.app"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response

# Preflight para el endpoint principal
@app.route("/api/generate-exercise", methods=["OPTIONS"])
def generate_exercise_options():
    return ("", 204)

# --------------------- Health & Root ---------------------
@app.route("/", methods=["GET"])
def root():
    return jsonify({"status": "ok", "service": "profeangeles-mvp"}), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200

# --------------------- Lógica de ejercicios ---------------------
def rand_coeff():
    """Devuelve a,b,c evitando casos degenerados y números enormes."""
    a = random.choice([i for i in range(-5, 6) if i != 0])  # a != 0
    b = random.randint(-9, 9)
    c = random.randint(-9, 9)
    if b == 0 and c == 0:
        b = random.randint(1, 5)
    return a, b, c

@app.route("/api/generate-exercise", methods=["GET"])
def generate_exercise():
    # Params
    topic = request.args.get("topic", "Álgebra")
    subtopic = request.args.get("subtopic", "Función cuadrática")
    etype = request.args.get("type", "analisis_completo")

    # 1) Generación de coeficientes según tipo
    x1 = x2 = None  # solo se usan en el tipo factorizado
    if etype == "convert_factorizada_a_general_y_canonica":
        (a, b, c), (x1, x2) = rand_coeff_from_roots(allow_double_root=True)
    else:
        a, b, c = rand_coeff()

    # 2) Traits (siempre)
    D, h, k, roots, y_intercept = quadratic_traits(a, b, c)

    # 3) Enunciado + Solución según tipo
    if etype == "convert_factorizada_a_general_y_canonica":
        # Enunciado: factorizada + ✅ pista (punto 4)
        fx_fact = latex_factorized_from_roots(a, x1, x2)
        latex_enunciado = (
            r"\text{Convierte la función desde forma factorizada a forma general y canónica (en ese orden): }~"
            rf"f(x) = {fx_fact}"
        )

        )

        # Solución: general y canónica (orden solicitado)
        fx_general = latex_general_function(a, b, c)  # ✅ punto 5
        fx_canon = latex_canonical_from_vertex(a, h, k)

        latex_solucion = (
            r"\begin{aligned}"
            r"\textbf{Forma general:}~ f(x)=" + fx_general +
            r" \\[6pt] "
            r"\textbf{Forma canónica:}~ f(x)=" + fx_canon +
            r"\end{aligned}"
        )
    else:
        # Tipo actual (análisis completo)
        latex_eq = format_latex_quadratic(a, b, c)
        latex_enunciado = rf"\text{{Analiza la función cuadrática: }}~ {latex_eq}"
        latex_solucion = latex_solution(a, b, c, D, h, k, roots)

    # 4) Plot
    png_b64 = plot_quadratic_png(a, b, c)

    # 5) Payload
    payload = {
        "coeffs": {"a": a, "b": b, "c": c},
        "latex_enunciado": latex_enunciado,
        "latex_solucion": latex_solucion,
        "graph": {
            "x_min": -10, "x_max": 10, "step": 0.25,
            "vertex": {"x": h, "y": k},
            "roots": roots,
            "axis": {"x": h},
            "y_intercept": y_intercept
        },
        "plot": {
            "png": png_b64,
            "engine": "matplotlib",
            "size": [5.5, 3.8],
            "dpi": 110,
        },
        "meta": {
            "exercise_id": f"q_{int(time.time()*1000)}",
            "timestamp": int(time.time()),
            "topic": "funcion_cuadratica",
            "filters": {"topic": topic, "subtopic": subtopic, "type": etype}
        }
    }
    return Response(json.dumps(payload), mimetype="application/json")

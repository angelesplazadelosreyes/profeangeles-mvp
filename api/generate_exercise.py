import json
import random
import time
from fractions import Fraction

from flask import Flask, Response, request, jsonify

from exercises.quadratic.traits import quadratic_traits
from exercises.quadratic.plot import plot_quadratic_png
from exercises.quadratic.generators import rand_coeff_from_roots, rand_coeff_canonical
from exercises.quadratic.latex import (
    format_latex_quadratic,
    latex_solution,
    latex_factorized_from_roots,
    latex_canonical_from_vertex,
    latex_general_function,
)

app = Flask(__name__)

# --------------------- Helpers ---------------------
def to_json_number(x):
    """Convierte Fraction -> float, y deja ints/floats tal cual."""
    if isinstance(x, Fraction):
        return float(x)
    return x

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
    x1 = x2 = None
    h_can = k_can = None

    if etype == "convert_factorizada_a_general_y_canonica":
        (a, b, c), (x1, x2) = rand_coeff_from_roots(allow_double_root=True)

    elif etype == "convert_canonica_a_general_y_factorizada":
        (a, b, c), (h_can, k_can) = rand_coeff_canonical()

    else:
        a, b, c = rand_coeff()

    # 2) Traits (siempre)
    D, h, k, roots, y_intercept = quadratic_traits(a, b, c)

    # 3) Enunciado + Solución según tipo
    if etype == "convert_factorizada_a_general_y_canonica":
        # Enunciado: factorizada (sin pista; ya existe por construcción)
        fx_fact = latex_factorized_from_roots(a, x1, x2)
        latex_enunciado = (
            r"\begin{aligned}"
            r"\text{Convierte la función desde forma factorizada a forma general y canónica:}"
            r"\\[6pt]"
            rf"f(x)= {fx_fact}"
            r"\end{aligned}"
        )


        # Solución: general y canónica (orden solicitado)
        fx_general = latex_general_function(a, b, c)
        fx_canon = latex_canonical_from_vertex(a, h, k)

        latex_solucion = (
            r"\begin{aligned}"
            r"\textbf{Forma general:}~ f(x)=" + fx_general +
            r" \\[6pt] "
            r"\textbf{Forma canónica:}~ f(x)=" + fx_canon +
            r"\end{aligned}"
        )

    elif etype == "convert_canonica_a_general_y_factorizada":
        # Enunciado (3 líneas): consigna + función + pista
        # OJO: h_can / k_can pueden ser Fraction; para el LaTeX aceptamos float aquí.
        fx_canon_given = latex_canonical_from_vertex(a, float(h_can), float(k_can))

        latex_enunciado = (
            r"\begin{aligned}"
            r"\text{Convierte la función desde forma canónica a forma general y factorizada:}"
            r"\\[6pt]"
            rf"f(x)= {fx_canon_given}"
            r"\\[6pt]"
            r"\textit{Pista: la forma factorizada existe solo si hay raíces reales }(\Delta \ge 0)."
            r"\end{aligned}"
        )



        # Forma general (desde a,b,c ya calculados) — aseguramos floats para el formateador
        fx_general = format_latex_quadratic(float(a), float(b), float(c)).replace("= 0", "").strip()

        # Forma factorizada: solo si raíces reales
        if len(roots) == 2:
            r1, r2 = roots[0], roots[1]
            fx_fact = latex_factorized_from_roots(float(a), r1, r2)
            fact_line = rf"\textbf{{Forma factorizada:}}~ f(x)= {fx_fact}"
        elif len(roots) == 1:
            r0 = roots[0]
            fx_fact = latex_factorized_from_roots(float(a), r0, r0)
            fact_line = rf"\textbf{{Forma factorizada:}}~ f(x)= {fx_fact}"
        else:
            fact_line = r"\textbf{Forma factorizada:}~ \text{No es factorizable en } \mathbb{R}"

        latex_solucion = (
            r"\begin{aligned}"
            r"\textbf{Forma general:}~ f(x)=" + fx_general +
            r" \\[6pt] "
            + fact_line +
            r"\end{aligned}"
        )

    else:
        # Tipo actual (análisis completo)
        latex_eq = format_latex_quadratic(a, b, c)
        latex_enunciado = rf"\text{{Analiza la función cuadrática: }}~ {latex_eq}"
        latex_solucion = latex_solution(a, b, c, D, h, k, roots)

    # 4) Plot (importante: pasar floats si hay Fraction)
    png_b64 = plot_quadratic_png(float(a), float(b), float(c))

    # 5) Payload (convertimos Fraction -> float para evitar 500 en json.dumps)
    payload = {
        "coeffs": {
            "a": to_json_number(a),
            "b": to_json_number(b),
            "c": to_json_number(c),
        },
        "latex_enunciado": latex_enunciado,
        "latex_solucion": latex_solucion,
        "graph": {
            "x_min": -10,
            "x_max": 10,
            "step": 0.25,
            "vertex": {"x": to_json_number(h), "y": to_json_number(k)},
            "roots": [to_json_number(r) for r in (roots or [])],
            "axis": {"x": to_json_number(h)},
            "y_intercept": to_json_number(y_intercept),
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
            "filters": {"topic": topic, "subtopic": subtopic, "type": etype},
        },
    }

    return Response(json.dumps(payload), mimetype="application/json")

import json
import random
import time
import base64
import io
import math
import os
from fractions import Fraction
from reportlab.lib.utils import ImageReader
from api.utils.format import fmt_num, fmt_num_plain
from flask import Flask, Response, request, jsonify
from .exercises.quadratic.traits import quadratic_traits
from .exercises.quadratic.plot import plot_quadratic_png
from .exercises.quadratic.generators import rand_coeff_from_roots, rand_coeff_canonical
from .exercises.quadratic.latex import (
    format_latex_quadratic,
    latex_solution,
    latex_factorized_from_roots,
    latex_canonical_from_vertex,
    latex_general_function,
)
from .exercises.lcm.core import generar_ejercicio_mcm

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


app = Flask(__name__)

# --------------------- Helpers ---------------------
def to_json_number(x):
    """Convierte Fraction -> float, y deja ints/floats tal cual."""
    if isinstance(x, Fraction):
        return float(x)
    return x

def readable_function_from_coeffs(a, b, c):
    # f(x) = ax^2 + bx + c (texto simple)
    def term_coef(val, var, is_first=False):
        if val == 0:
            return ""
        sign = " + " if val > 0 else " - "
        absval = abs(val)

        if is_first:
            sign = "-" if val < 0 else ""

        if var == "x^2":
            if absval == 1:
                core = "x²"
            else:
                core = f"{absval}x²"
        elif var == "x":
            if absval == 1:
                core = "x"
            else:
                core = f"{absval}x"
        else:
            core = f"{absval}"

        return f"{sign}{core}" if not is_first else f"{sign}{core}"

    s = "f(x) = "
    # primer término a
    if a == 1:
        s += "x²"
    elif a == -1:
        s += "-x²"
    else:
        s += f"{a}x²"

    s += term_coef(b, "x")
    s += term_coef(c, "c")
    return s

def latexish_to_plain(s: str) -> str:
    """Limpia strings tipo LaTeX a texto plano legible en PDF."""
    if not s:
        return ""
    x = s
    # Primero reemplazos completos antes de eliminar llaves
    x = x.replace("\\mathbb{R}", "R")
    x = x.replace("\\mathbb{R", "R")      # bug: llave sin cerrar
    x = x.replace("\\Delta", "D")
    x = x.replace("\\infty", "infinito")
    x = x.replace("\\text{No tiene raíces reales.}", "No tiene raíces reales.")
    x = x.replace("\\text{No es factorizable en }", "No es factorizable en R")
    x = x.replace("\\text{No es factorizable en R}", "No es factorizable en R")
    x = x.replace("\\text{Cóncava hacia arriba}", "Cóncava hacia arriba")
    x = x.replace("\\text{Cóncava hacia abajo}", "Cóncava hacia abajo")
    # Limpiar comandos LaTeX restantes
    x = x.replace("\\text{", "").replace("\\left", "").replace("\\right", "")
    x = x.replace("\\;", " ").replace("\\,", " ").replace("~", " ")
    x = x.replace("\\frac{", "").replace("\\sqrt{", "√(")
    x = x.replace("\\ge", ">=").replace("\\le", "<=")
    # Eliminar llaves sobrantes al final
    x = x.replace("{", "").replace("}", ")")
    return x.strip()
    

def quadratic_inverse_right_branch(a, b, c):
    a = float(a); b = float(b); c = float(c)

    h = -b / (2 * a)
    k = a * (h**2) + b * h + c

    hs = fmt_num_plain(h)
    ks = fmt_num_plain(k)

    a_fmt = fmt_num_plain(abs(a))
    
    if a > 0:
        if k >= 0:
            inside = f"(x - {ks}) / {a_fmt}" if abs(a) != 1 else f"x - {ks}"
        else:
            inside = f"(x + {fmt_num_plain(abs(k))}) / {a_fmt}" if abs(a) != 1 else f"x + {fmt_num_plain(abs(k))}"
        expr = f"√({inside})" if hs == "0" else f"{hs} + √({inside})"
        restr = f"x >= {hs}"
    else:
        if k >= 0:
            inside = f"({ks} - x) / {a_fmt}" if abs(a) != 1 else f"{ks} - x"
        else:
            inside = f"({fmt_num_plain(abs(k))} + x) / {a_fmt}" if abs(a) != 1 else f"{fmt_num_plain(abs(k))} + x"
        expr = f"√({inside})" if hs == "0" else f"{hs} + √({inside})"
        restr = f"x <= {ks}"
        
    return {
        "expression": expr,
        "h": hs,
        "inverse_domain": restr
    }

# --------------------- Auth ---------------------
UNPROTECTED = {"/", "/health"}

@app.before_request
def require_api_key():
    if request.method == "OPTIONS":
        return None
    if request.path in UNPROTECTED:
        return None
    key = request.headers.get("X-API-Key", "")
    expected = os.environ.get("API_KEY", "")
    if not expected or key != expected:
        return jsonify({"error": "Unauthorized"}), 401
    

# --------------------- CORS ---------------------
ALLOWED_ORIGINS = {
    "https://profeangeles-mvp.vercel.app",
    "https://profeangeles.cl",
    "https://www.profeangeles.cl",
    "http://localhost:3000",
}

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin", "")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization,X-API-Key"
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
    return response
# Preflight para el endpoint principal
@app.route("/api/generate-exercise", methods=["OPTIONS"])
def generate_exercise_options():
    return ("", 204)

@app.route("/api/generate-guide", methods=["OPTIONS"])
def generate_guide_options():
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


def latex_range(a, k):
    # a>0 => [k, +inf), a<0 => (-inf, k]
    if a > 0:
        return rf"[{k}, +\infty)"
    return rf"(-\infty, {k}]"


def roots_to_latex(roots):
    if len(roots) == 2:
        r1 = fmt_num_plain(roots[0])
        r2 = fmt_num_plain(roots[1])
        return f"x1={r1}, x2={r2}"
    if len(roots) == 1:
        return f"x0={fmt_num_plain(roots[0])}"
    return "No tiene raíces reales."

def latex_inverse_quadratic(a, h, k, branch="right"):
    """
    Devuelve un string 'latex-ish' para:
    - f^{-1}(x)
    - restricción del dominio original (para que sea función)
    - dominio de la inversa (que es el recorrido de f)

    branch:
      - "right"  => restringe dominio: x >= h  (rama derecha)
      - "left"   => restringe dominio: x <= h  (rama izquierda)
    """
    # 1) Restricción del dominio de f (para invertibilidad)
    if branch == "left":
        dom_restr = rf"x \le {h}"
        sign = "-"  # rama izquierda -> h - √(...)
    else:
        dom_restr = rf"x \ge {h}"
        sign = "+"  # rama derecha -> h + √(...)

    # 2) Dominio de f^{-1} (igual al recorrido de f)
    #    a>0 => range [k, +inf)  => domain inverse x >= k
    #    a<0 => range (-inf, k]  => domain inverse x <= k
    if a > 0:
        inv_domain = rf"x \ge {k}"
        inside = rf"\frac{{x - {k}}}{{{a}}}"  # (x-k)/a
    else:
        inv_domain = rf"x \le {k}"
        inside = rf"\frac{{{k} - x}}{{{abs(a)}}}"  # (k-x)/|a|

    # 3) Expresión de la inversa
    # f^{-1}(x) = h ± √((x-k)/a)  (si a>0)
    # f^{-1}(x) = h ± √((k-x)/|a|) (si a<0)
    inv_expr = rf"f^{{-1}}(x) = {h} {sign} \sqrt{{{inside}}}"

    # 4) Texto final
    return (
        rf"{inv_expr}"
        rf"\;,\; \text{{restricción: }} {dom_restr}"
        rf"\;,\; \text{{dominio de }} f^{{-1}}: {inv_domain}"
    )


def build_solution_parts(a, b, c, D, h, k, roots, y_intercept):
    # concavidad
    concavity = r"\text{Cóncava hacia arriba}" if a > 0 else r"\text{Cóncava hacia abajo}"

    # eje simetría, vértice, etc.
    axis = f"x={fmt_num_plain(h)}"
    vertex = f"({fmt_num_plain(h)},{fmt_num_plain(k)})"
    yint = f"(0,{fmt_num_plain(y_intercept)})"

    # formas
    canon = latex_canonical_from_vertex(float(a), float(h), float(k))

    # factorizada (solo en R si hay raíces reales)
    if len(roots) == 2:
        r1, r2 = roots[0], roots[1]
        fact = latex_factorized_from_roots(float(a), r1, r2)
        fact_line = fact
    elif len(roots) == 1:
        r0 = roots[0]
        fact = latex_factorized_from_roots(float(a), r0, r0)
        fact_line = fact
    else:
        fact_line = r"\text{No es factorizable en } \mathbb{R}"

    parts = {
        "concavity": concavity,
        "discriminant": f"D={fmt_num_plain(D)}",
        "roots": roots_to_latex(roots),
        "axis": axis,
        "vertex": vertex,
        "y_intercept": yint,
        "domain": r"\mathbb{R}",
        "range": latex_range(a, k),
        "canonical_form": canon,
        "factorized_form": fact_line,
        # graph se maneja aparte (png)
        "inverse": latex_inverse_quadratic(float(a), float(h), float(k), branch="right"),
    }
    return parts


def build_solution_parts_plain(a, b, c, D, h, k, roots, y_intercept):
    """Versión texto plano para PDF — sin LaTeX."""
    from fractions import Fraction

    def to_frac(x):
        return fmt_num_plain(x)

    # Concavidad
    concavity = "Cóncava hacia arriba" if a > 0 else "Cóncava hacia abajo"

    # Discriminante
    discriminant = f"{fmt_num_plain(D)}"

    # Raíces
    if len(roots) == 2:
        r1, r2 = to_frac(roots[0]), to_frac(roots[1])
        roots_str = f"x₁ = {r1}, x₂ = {r2}"
    elif len(roots) == 1:
        roots_str = f"x₀ = {to_frac(roots[0])}"
    else:
        roots_str = "No tiene raíces reales."

    # Eje de simetría
    axis = f"x = {to_frac(h)}"

    # Vértice
    vertex = f"({to_frac(h)}, {to_frac(k)})"

    # Intersección eje Y
    y_intercept_str = f"(0, {fmt_num_plain(y_intercept)})"

    # Dominio
    domain = "ℝ"

    # Recorrido
    if a > 0:
        range_str = f"[{to_frac(k)}, +∞)"
    else:
        range_str = f"(-∞, {to_frac(k)}]"

    # Forma canónica — texto plano
    a_str = "" if a == 1 else ("-" if a == -1 else str(a))
    h_f = to_frac(abs(h))
    k_f = to_frac(abs(k))
    if abs(h) < 1e-9:
        inside = "x"
    elif h > 0:
        inside = f"x - {h_f}"
    else:
        inside = f"x + {h_f}"
    k_term = f"+ {k_f}" if k >= 0 else f"- {k_f}"
    if inside == "x":
        canonical = f"{a_str}x² {k_term}"
    else:
        canonical = f"{a_str}({inside})² {k_term}"

    # Forma factorizada — texto plano
    if len(roots) == 2:
        r1v, r2v = roots[0], roots[1]
        def factor(r):
            if abs(r) < 1e-9:
                return "x"
            rf = to_frac(abs(r))
            return f"(x - {rf})" if r > 0 else f"(x + {rf})"
        factorized = f"{a_str}{factor(r1v)}{factor(r2v)}"
    elif len(roots) == 1:
        r0 = roots[0]
        rf = to_frac(abs(r0))
        factorized = f"{a_str}(x - {rf})²" if r0 > 0 else f"{a_str}(x + {rf})²"
    else:
        factorized = "No es factorizable en ℝ"

    return {
        "concavity":       concavity,
        "discriminant":    discriminant,
        "roots":           roots_str,
        "axis":            axis,
        "vertex":          vertex,
        "y_intercept":     y_intercept_str,
        "domain":          domain,
        "range":           range_str,
        "canonical_form":  canonical,
        "factorized_form": factorized,
    }

@app.route("/api/generate-exercise", methods=["GET"])
def generate_exercise():
    # Params
    topic = request.args.get("topic", "Álgebra")
    subtopic = request.args.get("subtopic", "Función cuadrática")
    etype = request.args.get("type", "analisis_completo")

    # ── MCM — se resuelve antes de cualquier lógica de cuadrática ──────────
    if etype in ("mcm_dos_numeros", "mcm_tres_numeros", "mcm_cuatro_numeros"):
        nivel_map = {
            "mcm_dos_numeros":  "facil",
            "mcm_tres_numeros": "medio",
            "mcm_cuatro_numeros": "dificil",
        }
        nivel = nivel_map[etype]
        ejercicio = generar_ejercicio_mcm(nivel)

        payload = {
            "enunciado": ejercicio["enunciado"],
            "numeros":   ejercicio["numeros"],
            "nivel":     ejercicio["nivel"],
            "solucion":  ejercicio["solucion"],
            "meta": {
                "exercise_id": f"lcm_{int(time.time()*1000)}",
                "timestamp":   int(time.time()),
                "topic":       "mcm",
                "filters":     {"topic": topic, "subtopic": subtopic, "type": etype},
            },
        }
        return Response(json.dumps(payload), mimetype="application/json")

    # ── Cuadrática ─────────────────────────────────────────────────────────

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
        fx_fact = latex_factorized_from_roots(a, x1, x2)
        latex_enunciado = (
            r"\begin{aligned}"
            r"\text{Convierte la función desde forma factorizada a forma general y canónica:}"
            r"\\[6pt]"
            rf"f(x)= {fx_fact}"
            r"\end{aligned}"
        )
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
        fx_general = format_latex_quadratic(float(a), float(b), float(c)).replace("= 0", "").strip()
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
        latex_eq = format_latex_quadratic(a, b, c)
        latex_enunciado = rf"\text{{Analiza la función cuadrática: }}~ {latex_eq}"
        latex_solucion = latex_solution(a, b, c, D, h, k, roots)

    # 4) Plot
    png_b64 = plot_quadratic_png(float(a), float(b), float(c))

    # 5) Payload
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

@app.route("/api/generate-guide-pdf", methods=["POST"])
def generate_guide_pdf():
    """
    Body esperado:
    {
      "module": "lcm_basica",
      "params": { "dificultad": "facil" },
      "skills": ["escalera", "mcm"],
      "count":  10
    }
    """
    try:
        from api.exercises.registry import get_module
        from api.pdf_engine import generate_guide_pdf_bytes

        body   = request.get_json(force=True) or {}
        key    = body.get("module", "")
        params = body.get("params", {})
        skills = body.get("skills", [])
        count  = max(1, min(int(body.get("count", 10)), 30))

        if not isinstance(skills, list):
            return jsonify({"error": "skills must be a list"}), 400

        module    = get_module(key)
        exercises = [module.generate(params) for _ in range(count)]
        pdf       = generate_guide_pdf_bytes(module, exercises, skills)

        resp = Response(pdf, mimetype="application/pdf")
        resp.headers["Content-Disposition"] = (
            f'attachment; filename="guia-{key}-{count}ej.pdf"'
        )
        return resp

    except KeyError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate-guide", methods=["POST"])
def generate_guide():
    """
    Batch generator para guías:
    - recibe count y skills
    - genera N ejercicios
    - devuelve lista con coeffs + solution_parts + (plot.png si graph fue pedido)
    """
    try:
        body = request.get_json(force=True) or {}
    except Exception:
        body = {}

    count = int(body.get("count", 10))
    count = max(1, min(count, 30))  # límite simple para no matar payload

    skills = body.get("skills", []) or []
    skills = [s for s in skills if isinstance(s, str)]
    want_graph = "graph" in skills

    # Por ahora: mismo tipo que el generador
    etype = body.get("type", "analisis_completo")

    exercises = []

    for _ in range(count):
        # 1) coeficientes (misma lógica)
        x1 = x2 = None
        h_can = k_can = None

        if etype == "convert_factorizada_a_general_y_canonica":
            (a, b, c), (x1, x2) = rand_coeff_from_roots(allow_double_root=True)
        elif etype == "convert_canonica_a_general_y_factorizada":
            (a, b, c), (h_can, k_can) = rand_coeff_canonical()
        else:
            a, b, c = rand_coeff()

        # 2) traits
        D, h, k, roots, y_intercept = quadratic_traits(a, b, c)

        # 3) parts para solucionario
        solution_parts = build_solution_parts(a, b, c, D, h, k, roots, y_intercept)

        # 4) plot solo si se pidió graph
        plot_obj = None
        if want_graph:
            png_b64 = plot_quadratic_png(float(a), float(b), float(c))
            plot_obj = {
                "png": png_b64,
                "engine": "matplotlib",
                "size": [5.5, 3.8],
                "dpi": 110,
            }

        exercises.append({
            "coeffs": {
                "a": to_json_number(a),
                "b": to_json_number(b),
                "c": to_json_number(c),
            },
            "solution_parts": solution_parts,
            "plot": plot_obj,
            "graph_meta": {
                "vertex": {"x": to_json_number(h), "y": to_json_number(k)},
                "roots": [to_json_number(r) for r in (roots or [])],
                "axis": {"x": to_json_number(h)},
                "y_intercept": to_json_number(y_intercept),
            }
        })

    return jsonify({
        "count": count,
        "skills": skills,
        "type": etype,
        "topic": "funcion_cuadratica",
        "exercises": exercises,
    }), 200

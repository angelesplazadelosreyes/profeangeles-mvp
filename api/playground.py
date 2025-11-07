# api/playground.py
# Gemelo de generate_exercise.py pero como Blueprint bajo /api/playground

import io
import json
import math
import time
import random
import base64

import numpy as np
import matplotlib
matplotlib.use("Agg")  # backend sin display
import matplotlib.pyplot as plt

from flask import Blueprint, Response, request

# -------------------------------------------------------------
# Blueprint con prefijo propio (no es una app independiente)
# -------------------------------------------------------------
playground_bp = Blueprint("playground", __name__, url_prefix="/api/playground")

# -------------------------------------------------------------
# CORS (preflight)
# -------------------------------------------------------------
@playground_bp.route("/generate", methods=["OPTIONS"])
def generate_options():
    # La app principal ya agrega headers CORS en after_request;
    # este endpoint solo permite el preflight sin errores.
    return ("", 204)

# -------------------------------------------------------------
# Utilidades y lógica de ejercicios
# -------------------------------------------------------------
def rand_coeff():
    """Devuelve a,b,c evitando casos degenerados y números enormes."""
    a = random.choice([i for i in range(-5, 6) if i != 0])  # a != 0
    b = random.randint(-9, 9)
    c = random.randint(-9, 9)
    if b == 0 and c == 0:
        b = random.randint(1, 5)
    return a, b, c

def format_latex_quadratic(a, b, c):
    """LaTeX compacto con signos y ocultando coeficientes 0."""
    def term_x2(a_):
        if a_ == 1:  return "x^{2}"
        if a_ == -1: return "-x^{2}"
        return f"{a_}x^2"
    def term_x(b_):
        if b_ == 0:  return ""
        if b_ == 1:  return "+ x"
        if b_ == -1: return "- x"
        return f"{'+' if b_>0 else ''}{b_}x"
    def term_c(c_):
        if c_ == 0:  return ""
        return f"{'+' if c_>0 else ''}{c_}"
    return rf"{term_x2(a)}{term_x(b)}{term_c(c)} = 0"

def quadratic_traits(a, b, c):
    D = b*b - 4*a*c
    h = -b/(2*a)
    k = a*h*h + b*h + c
    roots = []
    if D > 0:
        sqrtD = math.sqrt(D)
        r1 = (-b + sqrtD)/(2*a)
        r2 = (-b - sqrtD)/(2*a)
        roots = [r1, r2]
    elif D == 0:
        r = -b/(2*a)
        roots = [r]
    return D, h, k, roots, c  # c = intersección en y

def latex_solution(a, b, c, D, h, k, roots):
    # a como prefactor: "", "-", o el número
    a_str = "" if a == 1 else ("-" if a == -1 else f"{a}")
    # (x - h)^2 con signos correctos (y sin paréntesis extra si h≈0)
    if abs(h) < 1e-9:
        x_minus_h = "x"
    elif h > 0:
        x_minus_h = f"(x - {h:.2f})"
    else:
        x_minus_h = f"(x + {abs(h):.2f})"
    # "+ k" o "- |k|"
    k_term = f"+ {k:.2f}" if k >= 0 else f"- {abs(k):.2f}"

    concav = (
        r"\textbf{Concavidad:}~"
        + (r"\text{cóncava hacia arriba } \color{green}{\smile}"
           if a > 0 else
           r"\text{cóncava hacia abajo } \color{red}{\frown}")
    )
    linea_datos = rf"\textbf{{Coeficientes:}}~a={a},~b={b},~c={c}"
    linea_disc  = rf"\textbf{{Discriminante:}}~\Delta=b^2-4ac={D}"
    linea_vert  = rf"\textbf{{Vértice:}}~\left({h:.2f},{k:.2f}\right)"
    linea_eje   = rf"\textbf{{Eje de simetría:}}~x={h:.2f}"
    linea_y     = rf"\textbf{{Intersección con eje y:}}~(0, {c})"
    linea_dom   = rf"\textbf{{Dominio:}}~\mathbb{{R}}"
    linea_rec   = (rf"\textbf{{Recorrido:}}~\left[{k:.2f},\, \infty\right)"
                   if a > 0 else
                   rf"\textbf{{Recorrido:}}~\left(-\infty,\, {k:.2f}\right]")
    linea_canon = rf"\textbf{{Forma canónica:}}~f(x)={a_str}{x_minus_h}^2~{k_term}"

    if len(roots) == 2:
        r1, r2 = roots
        linea_raices = rf"\textbf{{Raíces:}}~x_1={r1:.2f},~x_2={r2:.2f}"
        linea_fact = rf"\textbf{{Forma factorizada:}}~f(x)=(x-{r1:.2f})(x-{r2:.2f})"
    elif len(roots) == 1:
        r0 = roots[0]
        linea_raices = rf"\textbf{{Raíz doble:}}~x={r0:.2f}"
        linea_fact = rf"\textbf{{Forma factorizada:}}~f(x)=(x-{r0:.2f})^2"
    else:
        linea_raices = r"\textbf{Raíces:}~\text{complejas (no reales)}"
        linea_fact = r"\textbf{Forma factorizada:}~\text{No aplica en } \mathbb{R}"

    partes = [
        concav,
        linea_datos,
        linea_disc,
        linea_raices,
        linea_eje,
        linea_vert,
        linea_y,
        linea_dom,
        linea_rec,
        linea_canon,
        linea_fact,
    ]
    cuerpo = r" \\[6pt] ".join(partes)
    return r"\begin{aligned}" + cuerpo + r"\end{aligned}"

def plot_quadratic_png(a, b, c):
    """Devuelve un PNG base64 (bytes) de la parábola y elementos destacados."""
    vx = -b / (2 * a)
    vy = a * vx * vx + b * vx + c
    disc = b * b - 4 * a * c
    roots = []
    if disc >= 0:
        r = disc ** 0.5
        roots = [(-b + r) / (2 * a), (-b - r) / (2 * a)]

    # Rango x centrado en el vértice (autoajustable)
    span = 10 if abs(a) < 1.5 else 6
    xs = np.linspace(vx - span, vx + span, 600)
    ys = a * xs**2 + b * xs + c

    fig = plt.figure(figsize=(5.5, 3.8), dpi=110)
    ax = fig.add_subplot(111)
    ax.plot(xs, ys, label="Parábola")
    ax.scatter([vx], [vy], s=40, zorder=3, label="Vértice")
    ax.axvline(vx, linestyle="--", alpha=0.6, label="Eje de simetría")
    ax.scatter([0], [c], s=30, zorder=3, label="Corte con eje y")
    if roots:
        ax.scatter(roots, [0]*len(roots), marker="x", s=60, zorder=3, label="Raíces reales")

    ax.axhline(0, color="k", lw=0.6, alpha=0.6)
    ax.axvline(0, color="k", lw=0.6, alpha=0.6)
    ax.grid(alpha=0.25)
    ax.set_title(f"y = {a}x² {('+' if b>=0 else '')}{b}x {('+' if c>=0 else '')}{c}")
    ax.set_xlabel("x"); ax.set_ylabel("y")
    ax.legend(loc="best", fontsize=9)

    ymin, ymax = float(np.min(ys)), float(np.max(ys))
    pad = 0.1 * (ymax - ymin + 1)
    ax.set_ylim(ymin - pad, ymax + pad)

    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("ascii")
    return b64

# -------------------------------------------------------------
# Endpoint principal del playground
# -------------------------------------------------------------
@playground_bp.get("/generate")
def generate():
    # Parámetros (por ahora informativos para meta.filters)
    tema    = request.args.get("tema", "Álgebra")
    subtema = request.args.get("subtema", "Función cuadrática")
    etype   = request.args.get("tipo", "analisis_completo")

    # Datos del ejercicio
    a, b, c = rand_coeff()
    D, h, k, roots, y_intercept = quadratic_traits(a, b, c)

    latex_eq = format_latex_quadratic(a, b, c)
    latex_enunciado = rf"\text{{Analiza la función cuadrática: }}~ {latex_eq}"
    latex_solucion  = latex_solution(a, b, c, D, h, k, roots)

    # PNG Matplotlib
    png_b64 = plot_quadratic_png(a, b, c)

    payload = {
        "coeffs": {"a": a, "b": b, "c": c},
        "latex_enunciado": latex_enunciado,
        "latex_solucion": latex_solucion,
        "graph": {  # se mantiene por compatibilidad/fallback
            "x_min": -10, "x_max": 10, "step": 0.25,
            "vertex": {"x": h, "y": k},
            "roots": roots,
            "axis": {"x": h},
            "y_intercept": y_intercept
        },
        "plot": {  # nuevo: imagen pre-renderizada
            "png": png_b64,
            "engine": "matplotlib",
            "size": [5.5, 3.8],
            "dpi": 110
        },
        "meta": {
            "exercise_id": f"pg_{int(time.time()*1000)}",
            "timestamp": int(time.time()),
            "subject": "math",
            "type": "funcion_cuadratica",
            "subtype": etype,            # p.ej. "analisis_completo"
            "layout": "two-column",
            "filters": {"tema": tema, "subtema": subtema, "tipo": etype},
            "source": "playground"
        }
    }
    return Response(json.dumps(payload), mimetype="application/json")

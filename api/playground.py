# api/playground.py
# Gemelo de generate_exercise.py pero como Blueprint bajo /api/playground
import json
import math
import random
import time
from flask import Blueprint, Response, request

# Blueprint con prefijo propio (no es una app independiente)
playground_bp = Blueprint("playground", __name__, url_prefix="/api/playground")

# --------------------- CORS (preflight) ---------------------
@playground_bp.route("/generate", methods=["OPTIONS"])
def generate_options():
    # La app principal ya agrega los headers CORS en after_request;
    # este endpoint solo permite el preflight sin errores.
    return ("", 204)

# --------------------- Lógica de ejercicios (gemela) ---------------------
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
    def term_x2(a):
        if a == 1:  return "x^{2}"
        if a == -1: return "-x^{2}"
        return f"{a}x^2"
    def term_x(b):
        if b == 0:  return ""
        if b == 1:  return "+ x"
        if b == -1: return "- x"
        return f"{'+' if b>0 else ''}{b}x"
    def term_c(c):
        if c == 0:  return ""
        return f"{'+' if c>0 else ''}{c}"
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
    # --- piezas para la forma canónica ---
    # a: ocultar 1, mostrar solo el signo si es -1
    if a == 1:
        a_str = ""
    elif a == -1:
        a_str = "-"
    else:
        a_str = f"{a}"

    # (x - h)^2 con signos correctos (y sin paréntesis extra si h≈0)
    if abs(h) < 1e-9:
        x_minus_h = "x"
    elif h > 0:
        x_minus_h = f"(x - {h:.2f})"
    else:
        x_minus_h = f"(x + {abs(h):.2f})"

    # "+ k" o "- |k|"
    k_term = f"+ {k:.2f}" if k >= 0 else f"- {abs(k):.2f}"

    # --- líneas LaTeX ---
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
    if a > 0:
        linea_rec = rf"\textbf{{Recorrido:}}~\left[{k:.2f},\, \infty\right)"
    else:
        linea_rec = rf"\textbf{{Recorrido:}}~\left(-\infty,\, {k:.2f}\right]"
    linea_canon = rf"\textbf{{Forma canónica:}}~f(x)={a_str}{x_minus_h}^2~{k_term}"

    # Raíces y forma factorizada (solo si hay reales)
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

    # Ensamblaje con saltos uniformes
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

    # a como prefactor: "", "-", o el número
    if a == 1:
        a_str = ""
    elif a == -1:
        a_str = "-"
    else:
        a_str = f"{a}"

    # (x - h)^2 con signos correctos (sin paréntesis extra si h=0)
    if abs(h) < 1e-9:
        x_minus_h = "x"
    elif h > 0:
        x_minus_h = f"(x - {h:.2f})"
    else:
        x_minus_h = f"(x + {abs(h):.2f})"

    # + k o - |k|
    k_sign = f"+ {k:.2f}" if k >= 0 else f"- {abs(k):.2f}"

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
    linea_stand = rf"\textbf{{Forma canónica:}}~f(x)={a_str}{x_minus_h}^2~{k_sign}"
    linea_dom   = rf"\textbf{{Dominio:}}~\mathbb{{R}}"

    if a > 0:
        linea_rec = rf"\textbf{{Recorrido:}}~\left[{k:.2f},\, \infty\right)"
    else:
        linea_rec = rf"\textbf{{Recorrido:}}~\left(-\infty,\, {k:.2f}\right]"

    if len(roots) == 2:
        linea_raices = rf"\textbf{{Raíces:}}~x_1={roots[0]:.2f},~x_2={roots[1]:.2f}"
        linea_fact = rf"\textbf{{Forma factorizada:}}~f(x)=(x-{roots[0]:.2f})(x-{roots[1]:.2f})"
    elif len(roots) == 1:
        linea_raices = rf"\textbf{{Raíz doble:}}~x={roots[0]:.2f}"
        linea_fact = rf"\textbf{{Forma factorizada:}}~f(x)=(x-{roots[0]:.2f})^2"
    else:
        linea_raices = r"\textbf{Raíces:}~\text{complejas (no reales)}"
        linea_fact = r"\textbf{{Forma factorizada:}}~\text{No se puede expresar de forma factorizada}"

    return (
        r"\begin{aligned}"
        rf"{concav} \\[6pt]"
        rf"{linea_datos} \\[6pt]"
        rf"{linea_disc} \\[6pt]"
        rf"{linea_raices} \\[6pt]"
        rf"{linea_eje} \\[6pt]"
        rf"{linea_vert} \\[6pt]"
        rf"{linea_y} \\[6pt]"
        rf"{linea_dom} \\[6pt]"
        rf"{linea_rec} \\[6pt]"
        rf"{linea_stand} \\[6pt]"
        rf"{linea_fact}"
        r"\end{aligned}"
    )

    # strings con signos correctos para la canónica
    h_abs = abs(h)
    k_sign = "+" if k >= 0 else ""  # str(k) ya lleva signo si < 0
    # (x - h) si h>=0 ; (x + |h|) si h<0
    x_minus_h = rf"(x - {h_abs:.2f})" if h >= 0 else rf"(x + {h_abs:.2f})"

    # Coeficiente 'a' en canónica: no mostrar 1 explícito
    if a == 1:
        a_str = ""
    elif a == -1:
        a_str = "-"
    else:
        a_str = f"{a}"

    concav = r"\textbf{Concavidad:}~" + (r"\text{hacia arriba } \color{green}{\smile}" if a > 0
             else r"\text{hacia abajo (convexa)} \color{red}{\frown}")
    linea_datos = rf"\textbf{{Coeficientes:}}~a={a},~b={b},~c={c}"
    linea_disc  = rf"\textbf{{Discriminante (b^2-4ac):}}~\Delta={D}"
    linea_vert  = rf"\textbf{{Vértice:}}~\left({h:.2f},{k:.2f}\right)"
    linea_eje   = rf"\textbf{{Eje de simetría:}}~x={h:.2f}"
    linea_y     = rf"\textbf{{Intersección con eje y:}}~(0, {c})"
    linea_stand = rf"\textbf{{Forma canónica:}}~f(x)={a_str}{x_minus_h}^2 {k_sign}{k:.2f}"
    linea_dom   = rf"\textbf{{Dominio:}}~R"
    linea_rec   = rf"\textbf{{Recorrido:}}~"+(rf"\textbf{{[}}{k:.2f}{{\infty]}}"if a > 0
             else rf"\textbf{{[\infty]}}{k:.2f}{{]}}")

    if len(roots) == 2:
        linea_raices = rf"\textbf{{Raíces:}}~x_1={roots[0]:.2f},~x_2={roots[1]:.2f}"
    elif len(roots) == 1:
        linea_raices = rf"\textbf{{Raíz doble:}}~x={roots[0]:.2f}"
    else:
        linea_raices = r"\textbf{Raíces:}~\text{complejas (no reales)}"

    return (
        r"\begin{aligned}"
        rf"{concav} \\[6pt]"
        rf"{linea_datos} \\[6pt]"
        rf"{linea_disc} \\[6pt]"
        rf"{linea_raices} \\[6pt]"
        rf"{linea_eje} \\[6pt]"
        rf"{linea_vert} \\[6pt]"
        rf"{linea_y} \\[6pt]"
        rf"{linea_dom} \\[6pt]"
        rf"{linea_rec} \\[6pt]"
        rf"{linea_stand}"
        r"\end{aligned}"
    )

# --------------------- Endpoint de playground ---------------------
@playground_bp.get("/generate")
def generate():
    # Nota: aquí usamos los nombres que envía main2/api2: tema, subtema, tipo
    tema    = request.args.get("tema", "Álgebra")
    subtema = request.args.get("subtema", "Función cuadrática")
    etype   = request.args.get("tipo", "analisis_completo")

    a, b, c = rand_coeff()
    D, h, k, roots, y_intercept = quadratic_traits(a, b, c)

    latex_eq = format_latex_quadratic(a, b, c)
    latex_enunciado = rf"\text{{Analiza la función cuadrática: }}~ {latex_eq}"
    latex_solucion = latex_solution(a, b, c, D, h, k, roots)

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
        "meta": {
            "exercise_id": f"pg_{int(time.time()*1000)}",
            "timestamp": int(time.time()),
            "topic": "funcion_cuadratica",
            "filters": {"tema": tema, "subtema": subtema, "tipo": etype},
            "source": "playground"
        }
    }
    return Response(json.dumps(payload), mimetype="application/json")

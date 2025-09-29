import json
import math
import random
import time
from flask import Flask, Response, request

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"           # o "http://localhost:8080"
    response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


def rand_coeff():
    """Devuelve a,b,c evitando casos degenerados y números enormes."""
    # a != 0; limitar a [-5..-1, 1..5]
    a = random.choice([i for i in range(-5, 6) if i != 0])
    b = random.randint(-9, 9)
    c = random.randint(-9, 9)
    # Evitar todo cero y repetir si es extremadamente simple (opcional)
    if b == 0 and c == 0:
        b = random.randint(1, 5)
    return a, b, c

def format_latex_quadratic(a, b, c):
    """Construye LaTeX compacto:
       - a==1 => x^2; a==-1 => -x^2; oculta términos con coef 0; signos correctos."""
    def term_x2(a):
        if a == 1: return "x^{2}"
        if a == -1: return "-x^{2}"
        return f"{a}x^{chr(178)}".replace(chr(178), "2")  # seguro
    def term_x(b):
        if b == 0: return ""
        if b == 1: return "+ x"
        if b == -1: return "- x"
        return f"{'+' if b>0 else ''}{b}x"
    def term_c(c):
        if c == 0: return ""
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
    # eje de simetría x=h; intersección con eje y: (0,c)
    return D, h, k, roots, c

def latex_solution(a, b, c, D, h, k, roots):
    concav = r"\textbf{Concavidad:}~" + (r"\text{hacia arriba } \color{green}{\smile}" if a > 0
             else r"\text{hacia abajo } \color{red}{\frown}")

    linea_datos = rf"\textbf{{Datos:}}~a={a},~b={b},~c={c}"
    linea_disc  = rf"\textbf{{Discriminante:}}~\Delta=b^2-4ac={D}"
    linea_vert  = rf"\textbf{{Vértice:}}~(h,k)=\left({h:.2f},{k:.2f}\right)"
    linea_eje   = rf"\textbf{{Eje de simetría:}}~x={h:.2f}"

    if len(roots) == 2:
        linea_raices = rf"\textbf{{Raíces:}}~x_1={roots[0]:.2f},~x_2={roots[1]:.2f}"
    elif len(roots) == 1:
        linea_raices = rf"\textbf{{Raíz doble:}}~x={roots[0]:.2f}"
    else:
        linea_raices = r"\textbf{Raíces:}~\text{complejas (no reales)}"

    # Alineado vertical con una línea por dato
    return (
        r"\begin{aligned}"
        rf"{concav} \\[6pt]"
        rf"{linea_datos} \\[4pt]"
        rf"{linea_disc} \\[4pt]"
        rf"{linea_vert} \\[4pt]"
        rf"{linea_eje} \\[4pt]"
        rf"{linea_raices}"
        r"\end{aligned}"
    )


@app.route("/api/generate-exercise")
def generate_exercise():
    a, b, c = rand_coeff()
    D, h, k, roots, y_intercept = quadratic_traits(a, b, c)

    latex_eq = format_latex_quadratic(a, b, c)
    latex_enunciado = rf"\text{{Analiza la función cuadrática: }}~ {latex_eq}"
    latex_solucion = latex_solution(a, b, c, D, h, k, roots)

    topic = request.args.get("topic", "Álgebra")
    subtopic = request.args.get("subtopic", "Función cuadrática")
    etype = request.args.get("type", "analisis_completo")


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
            "exercise_id": f"q_{int(time.time()*1000)}",
            "timestamp": int(time.time()),
            "topic": "funcion_cuadratica",
            "filters": {"topic": topic, "subtopic": subtopic, "type": etype}

        }
    }
    return Response(json.dumps(payload), mimetype="application/json")

# api/exercises/quadratic/media.py
"""
Función cuadrática para nivel Media.
Análisis completo: concavidad, discriminante, raíces, vértice, etc.
"""
from api.exercises.base import ExerciseModule
from api.exercises.quadratic.traits import quadratic_traits
from api.exercises.quadratic.generators import rand_coeff_from_roots, rand_coeff_canonical
from api.exercises.quadratic.plot import plot_quadratic_png
from api.exercises.quadratic.latex import (
    format_latex_quadratic,
    latex_solution,
    latex_factorized_from_roots,
    latex_canonical_from_vertex,
    latex_general_function,
)
from api.utils.format import fmt_num_plain
import random
import time


def _rand_coeff():
    a = random.choice([i for i in range(-5, 6) if i != 0])
    b = random.randint(-9, 9)
    c = random.randint(-9, 9)
    if b == 0 and c == 0:
        b = random.randint(1, 5)
    return a, b, c


def _readable_fx(a, b, c) -> str:
    def term(val, var, is_first=False):
        if val == 0:
            return ""
        sign = " + " if val > 0 else " - "
        absval = abs(val)
        if is_first:
            sign = "-" if val < 0 else ""
        if var == "x^2":
            core = "x²" if absval == 1 else f"{absval}x²"
        elif var == "x":
            core = "x" if absval == 1 else f"{absval}x"
        else:
            core = f"{absval}"
        return f"{sign}{core}"

    s = "f(x) = "
    s += "x²" if a == 1 else ("-x²" if a == -1 else f"{a}x²")
    s += term(b, "x")
    s += term(c, "c")
    return s


def _build_solution_parts(a, b, c, D, h, k, roots, y_intercept) -> dict:
    from fractions import Fraction

    def to_frac(x):
        return fmt_num_plain(x)

    concavity = "Cóncava hacia arriba" if a > 0 else "Cóncava hacia abajo"
    axis      = f"x = {to_frac(h)}"
    vertex    = f"({to_frac(h)}, {to_frac(k)})"
    y_int     = f"(0, {fmt_num_plain(y_intercept)})"
    domain    = "ℝ"
    range_str = f"[{to_frac(k)}, +∞)" if a > 0 else f"(-∞, {to_frac(k)}]"

    if len(roots) == 2:
        r1, r2 = to_frac(roots[0]), to_frac(roots[1])
        roots_str = f"x₁ = {r1}, x₂ = {r2}"
    elif len(roots) == 1:
        roots_str = f"x₀ = {to_frac(roots[0])}"
    else:
        roots_str = "No tiene raíces reales."

    # Forma canónica
    a_str  = "" if a == 1 else ("-" if a == -1 else str(a))
    h_f    = to_frac(abs(h))
    k_f    = to_frac(abs(k))
    inside = "x" if abs(h) < 1e-9 else (f"x - {h_f}" if h > 0 else f"x + {h_f}")
    k_term = f"+ {k_f}" if k >= 0 else f"- {k_f}"
    canonical = f"{a_str}x² {k_term}" if inside == "x" else f"{a_str}({inside})² {k_term}"

    # Forma factorizada
    if len(roots) == 2:
        def factor(r):
            rf = to_frac(abs(r))
            return "x" if abs(r) < 1e-9 else (f"(x - {rf})" if r > 0 else f"(x + {rf})")
        factorized = f"{a_str}{factor(roots[0])}{factor(roots[1])}"
    elif len(roots) == 1:
        r0 = roots[0]
        rf = to_frac(abs(r0))
        factorized = f"{a_str}(x - {rf})²" if r0 > 0 else f"{a_str}(x + {rf})²"
    else:
        factorized = "No es factorizable en ℝ"

    return {
        "concavity":      concavity,
        "discriminant":   fmt_num_plain(D),
        "roots":          roots_str,
        "axis":           axis,
        "vertex":         vertex,
        "y_intercept":    y_int,
        "domain":         domain,
        "range":          range_str,
        "canonical_form": canonical,
        "factorized_form": factorized,
    }


def _quadratic_inverse(a, b, c) -> dict:
    a = float(a); b = float(b); c = float(c)
    h = -b / (2 * a)
    k = a * (h ** 2) + b * h + c
    hs   = fmt_num_plain(h)
    ks   = fmt_num_plain(k)
    a_fmt = fmt_num_plain(abs(a))

    if a > 0:
        inside = f"(x - {ks}) / {a_fmt}" if abs(a) != 1 else f"x - {ks}"
        if k < 0:
            inside = f"(x + {fmt_num_plain(abs(k))}) / {a_fmt}" if abs(a) != 1 else f"x + {fmt_num_plain(abs(k))}"
        expr   = f"√({inside})" if hs == "0" else f"{hs} + √({inside})"
        restr  = f"x >= {hs}"
    else:
        inside = f"({ks} - x) / {a_fmt}" if abs(a) != 1 else f"{ks} - x"
        if k < 0:
            inside = f"({fmt_num_plain(abs(k))} + x) / {a_fmt}" if abs(a) != 1 else f"{fmt_num_plain(abs(k))} + x"
        expr   = f"√({inside})" if hs == "0" else f"{hs} + √({inside})"
        restr  = f"x <= {ks}"

    return {"expression": expr, "h": hs, "inverse_domain": restr}


class QuadraticMedia(ExerciseModule):
    topic = "quadratic"
    nivel = "media"
    label = "Función cuadrática — Media"

    def generate(self, params: dict) -> dict:
        a, b, c = _rand_coeff()
        D, h, k, roots, y_intercept = quadratic_traits(a, b, c)
        parts   = _build_solution_parts(a, b, c, D, h, k, roots, y_intercept)
        plot_b64 = plot_quadratic_png(float(a), float(b), float(c))
        inverse  = _quadratic_inverse(a, b, c)

        return {
            "statement": _readable_fx(a, b, c),
            "solution":  parts,
            "meta": {
                "coeffs":  {"a": a, "b": b, "c": c},
                "plot_b64": plot_b64,
                "inverse":  inverse,
            },
        }

    def get_skills(self) -> list[dict]:
        return [
            {"id": "concavity",      "label": "Concavidad"},
            {"id": "discriminant",   "label": "Discriminante"},
            {"id": "roots",          "label": "Raíces"},
            {"id": "axis",           "label": "Eje de simetría"},
            {"id": "vertex",         "label": "Vértice"},
            {"id": "y_intercept",    "label": "Intersección eje Y"},
            {"id": "domain",         "label": "Dominio"},
            {"id": "range",          "label": "Recorrido"},
            {"id": "canonical_form", "label": "Forma canónica"},
            {"id": "factorized_form","label": "Forma factorizada"},
            {"id": "graph",          "label": "Gráfico"},
            {"id": "inverse",        "label": "Función inversa"},
        ]

    def render_exercise_html(self, exercise: dict, index: int, skills: list[str] = None) -> str:
        fx     = exercise["statement"]
        skills = skills or [s["id"] for s in self.get_skills()]
        labels = [s["label"] for s in self.get_skills() if s["id"] in skills]
        chips  = "".join(f'<span class="chip">{l}</span>' for l in labels)
        return f"""
        <div class="exercise-card">
          <div class="exercise-number">Ejercicio {index}</div>
          <div class="exercise-statement">Dada la función <em>{fx}</em>, determina lo que se indica.</div>
          <div class="chips">{chips}</div>
        </div>
        """

    def render_solution_html(self, exercise: dict, index: int, skills: list[str] = None) -> str:
        fx       = exercise["statement"]
        parts    = exercise["solution"]
        meta     = exercise["meta"]
        plot_b64 = meta.get("plot_b64")
        inverse  = meta.get("inverse")
        skills   = skills or [s["id"] for s in self.get_skills()]

        ORDER = [
            ("concavity",       "Concavidad"),
            ("discriminant",    "Discriminante"),
            ("roots",           "Raíces"),
            ("axis",            "Eje de simetría"),
            ("vertex",          "Vértice"),
            ("y_intercept",     "Intersección eje Y"),
            ("domain",          "Dominio"),
            ("range",           "Recorrido"),
            ("canonical_form",  "Forma canónica"),
            ("factorized_form", "Forma factorizada"),
        ]

        rows = ""
        letter_i = 0

        for key, lab in ORDER:
            if key not in skills:
                continue
            val    = parts.get(key)
            letter = chr(97 + letter_i)
            rows  += f"""
            <div class="sol-row">
              <span class="sol-letter">{letter})</span>
              <span><span class="sol-label">{lab}:</span> {val}</span>
            </div>
            """
            letter_i += 1

        if "graph" in skills and plot_b64:
            letter = chr(97 + letter_i)
            rows  += f"""
            <div class="sol-row">
              <span class="sol-letter">{letter})</span>
              <span><span class="sol-label">Gráfico:</span><br>
              <img class="graph-img" src="data:image/png;base64,{plot_b64}">
              </span>
            </div>
            """
            letter_i += 1

        if "inverse" in skills and inverse:
            letter = chr(97 + letter_i)
            rows  += f"""
            <div class="sol-row">
              <span class="sol-letter">{letter})</span>
              <span><span class="sol-label">Función inversa:</span>
              f⁻¹(x) = {inverse['expression']}<br>
              <em style="font-size:11px;color:#888780">restricción x &ge; {inverse['h']}</em>
              </span>
            </div>
            """

        return f"""
        <div class="solution-card">
          <div class="solution-title">Ejercicio {index} · <em>{fx}</em></div>
          {rows}
        </div>
        """
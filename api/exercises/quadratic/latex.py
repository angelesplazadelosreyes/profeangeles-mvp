import math

def format_latex_quadratic(a, b, c):
    """LaTeX compacto con signos y ocultando coeficientes 0."""
    def term_x2(a):
        if a == 1: return "x^{2}"
        if a == -1: return "-x^{2}"
        return f"{a}x^2"

    def term_x(b):
        if b == 0: return ""
        if b == 1: return "+ x"
        if b == -1: return "- x"
        return f"{'+' if b>0 else ''}{b}x"

    def term_c(c):
        if c == 0: return ""
        return f"{'+' if c>0 else ''}{c}"

    return rf"{term_x2(a)}{term_x(b)}{term_c(c)} = 0"


def latex_solution(a, b, c, D, h, k, roots):
    # a como prefactor: "", "-", o el número
    a_str = "" if a == 1 else ("-" if a == -1 else f"{a}")

    # (x - h)^2 con signos correctos (y sin paréntesis extra si h≈0)
    if abs(h) < 1e-9:
        x_minus_h = "x"
    elif h > 0:
        x_minus_h = f"x - {h:.2f}"
    else:
        x_minus_h = f"x + {abs(h):.2f}"

    # "+ k" o "- |k|"
    k_term = f"+ {k:.2f}" if k >= 0 else f"- {abs(k):.2f}"

    concav = (
        r"\textbf{Concavidad:}~"
        + (r"\text{cóncava hacia arriba } {\smile}"
           if a > 0 else
           r"\text{cóncava hacia abajo } {\frown}")
    )

    linea_datos = rf"\textbf{{Coeficientes:}}~a={a},~b={b},~c={c}"
    linea_disc  = rf"\textbf{{Discriminante:}}~\Delta={D}"

    # Raíces + forma factorizada
    if len(roots) == 2:
        r1, r2 = roots
        linea_raices = rf"\textbf{{Raíces:}}~x_1={r1:.2f},~x_2={r2:.2f}"
        linea_fact = (
            rf"\textbf{{Forma factorizada:}}~f(x)="
            rf"\left(x-{r1:.2f}\right)\left(x-{r2:.2f}\right)"
        )
    elif len(roots) == 1:
        r0 = roots[0]
        linea_raices = rf"\textbf{{Raíz doble:}}~x={r0:.2f}"
        linea_fact = rf"\textbf{{Forma factorizada:}}~f(x)=\left(x-{r0:.2f}\right)^2"
    else:
        linea_raices = r"\textbf{Raíces:}~\text{complejas (no reales)}"
        linea_fact = r"\textbf{Forma factorizada:}~\text{No aplica en } \mathbb{R}"

    linea_eje   = rf"\textbf{{Eje de simetría:}}~x={h:.2f}"
    linea_vert  = rf"\textbf{{Vértice:}}~\left({h:.2f},{k:.2f}\right)"
    linea_y     = rf"\textbf{{Intersección con eje y:}}~(0, {c})"
    linea_dom   = rf"\textbf{{Dominio:}}~\mathbb{{R}}"
    linea_rec   = (
        rf"\textbf{{Recorrido:}}~\left[{k:.2f},\, \infty\right)"
        if a > 0 else
        rf"\textbf{{Recorrido:}}~\left(-\infty,\, {k:.2f}\right]"
    )
    linea_canon = rf"\textbf{{Forma canónica:}}~f(x)={a_str}\left({x_minus_h}\right)^2~{k_term}"

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


def latex_factorized_from_roots(a, x1, x2):
    """f(x)=a(x-x1)(x-x2) en LaTeX, con signos correctos."""
    def factor(x):
        # (x - 3) o (x + 3) o (x)
        if x == 0:
            return r"(x)"
        if x > 0:
            return rf"(x - {x})"
        return rf"(x + {abs(x)})"

    a_str = "" if a == 1 else ("-" if a == -1 else str(a))
    return rf"{a_str}{factor(x1)}{factor(x2)}"


def latex_canonical_from_vertex(a, h, k):
    """f(x)=a(x-h)^2+k en LaTeX, con signos correctos (h,k pueden ser decimales)."""
    a_str = "" if a == 1 else ("-" if a == -1 else str(a))

    # (x - h)
    if abs(h) < 1e-9:
        inside = "x"
    elif h > 0:
        inside = rf"x - {h:.2f}"
    else:
        inside = rf"x + {abs(h):.2f}"

    # +k / -k
    k_term = rf"+ {k:.2f}" if k >= 0 else rf"- {abs(k):.2f}"
    return rf"{a_str}\left({inside}\right)^2 {k_term}"

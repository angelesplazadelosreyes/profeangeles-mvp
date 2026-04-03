from fractions import Fraction

def fmt_num(x, max_decimals=2):
    """
    Formatea números para LaTeX:
    - enteros sin decimales
    - fracciones cuando es posible
    - fallback a 2 decimales
    """
    if abs(x - round(x)) < 1e-9:
        return str(int(round(x)))
    f = Fraction(x).limit_denominator(100)
    if abs(float(f) - x) < 1e-9:
        return f"{f.numerator}/{f.denominator}"
    s = f"{x:.{max_decimals}f}"
    return s.rstrip("0").rstrip(".")


def fmt_num_plain(x, nd=2):
    """
    Número corto y bonito para texto en PDF.
    Convierte a fracción siempre que sea posible.
    """
    try:
        v = float(x)
    except Exception:
        return str(x)

    if abs(v - round(v)) < 1e-9:
        return str(int(round(v)))

    f = Fraction(v).limit_denominator(100)
    if abs(float(f) - v) < 1e-9:
        return f"{f.numerator}/{f.denominator}"

    return f"{v:.{nd}f}".rstrip("0").rstrip(".")
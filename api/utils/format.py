def fmt_num(x, max_decimals=2):
    """
    Formatea números para LaTeX:
    - enteros sin decimales
    - decimales 'bonitos' con 1 decimal cuando aplica
    - fallback a 2 decimales
    """
    # Normalizar float muy cerca de entero
    if abs(x - round(x)) < 1e-9:
        return str(int(round(x)))

    # Intentar 1 decimal si queda "bonito"
    if abs(x*2 - round(x*2)) < 1e-9:  # múltiplos de 0.5
        return f"{x:.1f}".rstrip("0").rstrip(".")

    # fallback
    s = f"{x:.{max_decimals}f}"
    return s.rstrip("0").rstrip(".")

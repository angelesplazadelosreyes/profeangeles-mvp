import random
from fractions import Fraction

def rand_coeff_general():
    """Devuelve a,b,c evitando casos degenerados y números enormes."""
    a = random.choice([i for i in range(-5, 6) if i != 0])  # a != 0
    b = random.randint(-9, 9)
    c = random.randint(-9, 9)
    if b == 0 and c == 0:
        b = random.randint(1, 5)
    return a, b, c


def coeffs_from_roots(a, x1, x2):
    """
    Construye (a,b,c) desde la forma factorizada:
      f(x)=a(x-x1)(x-x2) = ax^2 + bx + c
    """
    b = -a * (x1 + x2)
    c = a * (x1 * x2)
    return a, b, c


def rand_coeff_from_roots(
    a_choices=None,
    root_min=-6,
    root_max=6,
    allow_double_root=True
):
    """
    Genera coeficientes garantizando raíces reales "bonitas" (enteras).
    Ideal para ejercicios: factorizada -> general -> canónica.
    """
    if a_choices is None:
        a_choices = [i for i in range(-5, 6) if i != 0]

    a = random.choice(a_choices)

    x1 = random.randint(root_min, root_max)
    x2 = random.randint(root_min, root_max)

    if not allow_double_root:
        while x2 == x1:
            x2 = random.randint(root_min, root_max)

    return coeffs_from_roots(a, x1, x2), (x1, x2)


def _rand_simple_fraction(
    num_min: int = -6,
    num_max: int = 6,
    den_choices=(1, 2, 3, 4),
    avoid_zero: bool = False,
):
    """
    Fracciones simples tipo n/d con d en {1,2,3,4}.
    Si avoid_zero=True, evita que el resultado sea 0.
    """
    while True:
        den = random.choice(list(den_choices))
        num = random.randint(num_min, num_max)
        if avoid_zero and num == 0:
            continue
        return Fraction(num, den)

def rand_coeff_canonical(
    a_choices=(-5, -4, -3, -2, -1, 1, 2, 3, 4, 5),
    h_den_choices=(1, 2, 3, 4),
    k_den_choices=(1, 2, 3, 4),
):
    """
    Genera una cuadrática en forma canónica:
        f(x) = a(x - h)^2 + k
    con h y k como fracciones simples.

    Retorna:
        (a, b, c), (h, k)

    Donde b y c son coherentes con expandir la canónica:
        a(x-h)^2 + k = ax^2 - 2ah x + (a h^2 + k)
    """
    a = random.choice(list(a_choices))

    # h puede ser 0 o fracción simple
    h = _rand_simple_fraction(num_min=-6, num_max=6, den_choices=h_den_choices, avoid_zero=False)

    # k: permitimos 0 también, pero acotado
    k = _rand_simple_fraction(num_min=-8, num_max=8, den_choices=k_den_choices, avoid_zero=False)

    # Expandir a forma general: ax^2 + bx + c
    b = -2 * a * h
    c = a * (h ** 2) + k

    # Devolvemos b y c como Fraction para precisión exacta
    # (más adelante, si necesitas int/float, se decide en el formateo)
    return (Fraction(a, 1), b, c), (h, k)

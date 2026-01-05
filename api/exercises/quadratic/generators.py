import random

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

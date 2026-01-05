import math

def quadratic_traits(a, b, c):
    D = b*b - 4*a*c
    h = -b / (2 * a)
    k = a*h*h + b*h + c

    roots = []
    if D > 0:
        sqrtD = math.sqrt(D)
        r1 = (-b + sqrtD) / (2 * a)
        r2 = (-b - sqrtD) / (2 * a)
        roots = [r1, r2]
    elif D == 0:
        r = -b / (2 * a)
        roots = [r]

    return D, h, k, roots, c

# api/exercises/lcm/core.py
"""
Lógica de Mínimo Común Múltiplo por el método de la escalera (división sucesiva).
Niveles:
  fácil  → 2 números
  medio  → 3 números
  difícil → 4 números
Rango: 2–50 (fácil), 2–100 (medio/difícil). MCM resultante ≤ 120.
"""

import random
import math
from typing import List, Tuple


# ── Constantes ──────────────────────────────────────────────────────────────

NIVEL_CONFIG = {
    "facil":   {"cantidad": 2, "rango": (2, 50),  "techo": 120},
    "medio":   {"cantidad": 3, "rango": (2, 50),  "techo": 240},
    "dificil": {"cantidad": 4, "rango": (2, 50),  "techo": 360},
}

MCM_TECHO = 360  # techo global (el mayor de los tres)
MAX_INTENTOS = 200


# ── Generador de números ────────────────────────────────────────────────────

def _mcm_lista(nums: List[int]) -> int:
    resultado = nums[0]
    for n in nums[1:]:
        resultado = resultado * n // math.gcd(resultado, n)
    return resultado


def generar_numeros(nivel: str) -> List[int]:
    """
    Genera una lista de números únicos cuyo MCM es ≤ MCM_TECHO.
    Lanza ValueError si no encuentra combinación válida tras MAX_INTENTOS.
    """
    config = NIVEL_CONFIG.get(nivel)
    if config is None:
        raise ValueError(f"Nivel desconocido: {nivel!r}. Usa 'facil', 'medio' o 'dificil'.")

    cantidad = config["cantidad"]
    lo, hi   = config["rango"]

    for _ in range(MAX_INTENTOS):
        nums = random.sample(range(lo, hi + 1), cantidad)
        if _mcm_lista(nums) <= config["techo"]:
            return nums

    raise ValueError(
        f"No se encontró combinación válida en {MAX_INTENTOS} intentos "
        f"(nivel={nivel!r}, rango={lo}-{hi}, techo MCM={MCM_TECHO})."
    )


# ── Algoritmo de la escalera ────────────────────────────────────────────────

def escalera_mcm(nums: List[int]) -> dict:
    """
    Calcula el MCM de una lista de enteros usando el método de la escalera.

    Devuelve:
    {
        "numeros":   [12, 18],          # entrada
        "filas":     [                  # cada paso de la escalera
            {"divisor": 2, "valores": [6, 9]},
            {"divisor": 2, "valores": [3, 9]},
            {"divisor": 3, "valores": [1, 3]},
            {"divisor": 3, "valores": [1, 1]},
        ],
        "divisores": [2, 2, 3, 3],      # lista de primos usados
        "mcm":       36,
        "operacion": "2 × 2 × 3 × 3 = 36"
    }

    Regla de la escalera:
    - En cada fila se elige el primo más pequeño que divide a AL MENOS UNO
      de los valores actuales.
    - Los que no son divisibles se bajan sin cambio.
    - Se detiene cuando todos los valores son 1.
    """
    if not nums or any(n < 1 for n in nums):
        raise ValueError("Todos los números deben ser enteros positivos.")

    actuales  = list(nums)
    filas     = []
    divisores = []

    while any(v > 1 for v in actuales):
        # Primo más pequeño que divide a alguno de los actuales
        primo = _primo_divisor(actuales)

        nuevos = [v // primo if v % primo == 0 else v for v in actuales]
        filas.append({"divisor": primo, "valores": nuevos})
        divisores.append(primo)
        actuales = nuevos

    mcm = 1
    for d in divisores:
        mcm *= d

    partes_op = " × ".join(str(d) for d in divisores)
    operacion = f"{partes_op} = {mcm}"

    return {
        "numeros":   list(nums),
        "filas":     filas,
        "divisores": divisores,
        "mcm":       mcm,
        "operacion": operacion,
    }


def _primo_divisor(nums: List[int]) -> int:
    """Devuelve el primo más pequeño que divide a al menos uno de los nums."""
    candidato = 2
    while True:
        if any(v % candidato == 0 for v in nums):
            return candidato
        candidato += 1


# ── Generador completo de ejercicio ────────────────────────────────────────

def generar_ejercicio_mcm(nivel: str) -> dict:
    """
    Genera un ejercicio completo de MCM para el nivel dado.

    Devuelve:
    {
        "nivel":     "facil",
        "numeros":   [12, 18],
        "enunciado": "Encuentra el Mínimo Común Múltiplo de: 12 y 18",
        "solucion":  { ...resultado de escalera_mcm... }
    }
    """
    nums = generar_numeros(nivel)
    solucion = escalera_mcm(nums)

    if len(nums) == 2:
        lista_str = f"{nums[0]} y {nums[1]}"
    elif len(nums) == 3:
        lista_str = f"{nums[0]}, {nums[1]} y {nums[2]}"
    else:
        lista_str = ", ".join(str(n) for n in nums[:-1]) + f" y {nums[-1]}"

    enunciado = f"Encuentra el Mínimo Común Múltiplo de: {lista_str}"

    return {
        "nivel":     nivel,
        "numeros":   nums,
        "enunciado": enunciado,
        "solucion":  solucion,
    }
# api/exercises/base.py
"""
Clase base para todos los módulos de ejercicios.
Cada combinación topic+nivel implementa esta interfaz.
"""


class ExerciseModule:
    topic: str   # "lcm", "quadratic", "equations", ...
    nivel: str   # "basica", "media", "universitario"
    label: str   # texto para mostrar en UI, ej: "MCM — Básica"

    def generate(self, params: dict) -> dict:
        """
        Genera un ejercicio completo.

        Parámetros aceptados dependen del módulo (ej: nivel de dificultad,
        tipo de coeficientes, etc.). Se documentan en cada subclase.

        Retorna un dict con al menos:
          - "statement": str  — enunciado en texto plano
          - "solution":  dict — datos de la solución (estructura libre por módulo)
        """
        raise NotImplementedError

    def render_exercise_html(self, exercise: dict, index: int) -> str:
        """
        HTML del enunciado para el PDF.
        index es 1-based.
        """
        raise NotImplementedError

    def render_solution_html(self, exercise: dict, index: int) -> str:
        """
        HTML del solucionario para el PDF.
        index es 1-based.
        """
        raise NotImplementedError

    def get_skills(self) -> list[dict]:
        """
        Lista de habilidades evaluables por este módulo.
        Formato: [{"id": "roots", "label": "Raíces"}, ...]
        El frontend usa esto para construir el checklist dinámicamente.
        """
        raise NotImplementedError
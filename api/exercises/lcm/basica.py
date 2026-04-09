# api/exercises/lcm/basica.py
"""
MCM para nivel Básica — método de la escalera.
Dificultades: facil (2 números), medio (3 números), dificil (4 números).
"""
from api.exercises.base import ExerciseModule
from api.exercises.lcm.core import generar_ejercicio_mcm


class LcmBasica(ExerciseModule):
    topic = "lcm"
    nivel = "basica"
    label = "MCM — Básica"

    def generate(self, params: dict) -> dict:
        """
        params:
          - "dificultad": "facil" | "medio" | "dificil"  (default: "facil")
        """
        dificultad = params.get("dificultad", "facil")
        ejercicio = generar_ejercicio_mcm(dificultad)
        return {
            "statement": ejercicio["enunciado"],
            "solution":  ejercicio["solucion"],
            "meta": {
                "dificultad": dificultad,
                "numeros":    ejercicio["numeros"],
            },
        }

    def get_skills(self) -> list[dict]:
        return [
            {"id": "escalera", "label": "Tabla escalera"},
            {"id": "mcm",      "label": "Resultado MCM"},
        ]

    def render_exercise_html(self, exercise: dict, index: int, skills: list[str] = None) -> str:
        statement = exercise["statement"]
        skills_chips = "".join(
            f'<span class="chip">{s["label"]}</span>'
            for s in self.get_skills()
        )
        return f"""
        <div class="exercise-card">
          <div class="exercise-number">Ejercicio {index}</div>
          <div class="exercise-statement">{statement}</div>
          <div class="chips">{skills_chips}</div>
        </div>
        """

    def render_solution_html(self, exercise: dict, index: int, skills: list[str] = None) -> str:
        statement = exercise["statement"]
        sol       = exercise["solution"]
        filas     = sol["filas"]
        mcm       = sol["mcm"]
        operacion = sol["operacion"]
        numeros   = sol["numeros"]

        headers   = "".join(f"<th>{n}</th>" for n in numeros)
        table_rows = ""
        for fila in filas:
            celdas = "".join(f"<td>{v}</td>" for v in fila["valores"])
            table_rows += f"<tr><td class='divisor'>{fila['divisor']}</td>{celdas}</tr>"

        return f"""
        <div class="solution-card">
          <div class="solution-title">Ejercicio {index} · <em>{statement}</em></div>
          <div class="sol-row">
            <span class="sol-label">Método de la escalera:</span>
          </div>
          <table class="escalera-table">
            <thead>
              <tr><th>÷</th>{headers}</tr>
            </thead>
            <tbody>
              {table_rows}
            </tbody>
          </table>
          <div class="sol-row" style="margin-top:8px">
            <span class="sol-letter">∴</span>
            <span><span class="sol-label">MCM =</span> {operacion}</span>
          </div>
        </div>
        """
        statement = exercise["statement"]
        sol       = exercise["solution"]
        filas     = sol["filas"]
        mcm       = sol["mcm"]
        operacion = sol["operacion"]
        numeros   = sol["numeros"]

        # Encabezado de la tabla escalera
        headers = "".join(f"<th>{n}</th>" for n in numeros)
        table_rows = ""
        valores_actuales = list(numeros)
        for fila in filas:
            celdas = "".join(f"<td>{v}</td>" for v in fila["valores"])
            table_rows += f"<tr><td class='divisor'>{fila['divisor']}</td>{celdas}</tr>"
            valores_actuales = fila["valores"]

        return f"""
        <div class="solution-card">
          <div class="solution-title">Ejercicio {index} · <em>{statement}</em></div>
          <div class="sol-row">
            <span class="sol-label">Método de la escalera:</span>
          </div>
          <table class="escalera-table">
            <thead>
              <tr><th>÷</th>{headers}</tr>
            </thead>
            <tbody>
              {table_rows}
            </tbody>
          </table>
          <div class="sol-row" style="margin-top:8px">
            <span class="sol-letter">∴</span>
            <span><span class="sol-label">MCM =</span> {operacion}</span>
          </div>
        </div>
        """
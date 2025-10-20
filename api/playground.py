# api/playground_generate.py
from flask import Blueprint, request, jsonify

playground_bp = Blueprint("playground", __name__, url_prefix="/api/playground")

@playground_bp.get("/generate")
def generate():
    """
    Endpoint de pruebas para nuevos ejercicios.
    Puedes iterar aquí fórmulas/casos sin tocar producción.
    """
    # Ejemplo: parámetros (ajusta a tus selects reales)
    tema = request.args.get("tema", "Álgebra")
    subtema = request.args.get("subtema", "Función cuadrática")
    tipo = request.args.get("tipo", "analisis_completo")

    # TODO: aquí prueba nuevas reglas, fórmulas, LaTeX y datos del gráfico
    # Devuelve el mismo esquema de claves que espera el front:
    payload = {
        "latex_enunciado": r"Analiza: \; x^2 - 4x + 3 = 0",
        "latex_solucion": r"x_1=1,\; x_2=3 \;\; \text{(demo playground)}",
        "chart": {
            "type": "line",
            "data": {
                "labels": [i for i in range(-6, 7)],
                "datasets": [
                    {
                        "label": "y = x^2 - 4x + 3",
                        "data": [x*x - 4*x + 3 for x in range(-6, 7)]
                    }
                ]
            },
            "options": {"responsive": True}
        },
        "meta": {"tema": tema, "subtema": subtema, "tipo": tipo, "source": "playground"}
    }
    return jsonify(payload), 200

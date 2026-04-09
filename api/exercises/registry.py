# api/exercises/registry.py
"""
Registro central de módulos de ejercicios.
Clave: "topic_nivel"  →  instancia de ExerciseModule.

Para agregar un módulo nuevo:
  1. Crear api/exercises/<topic>/<nivel>.py con la clase correspondiente
  2. Importarla aquí y agregarla al dict REGISTRY
"""
from api.exercises.base import ExerciseModule
from api.exercises.lcm.basica import LcmBasica
from api.exercises.quadratic.media import QuadraticMedia

REGISTRY: dict[str, ExerciseModule] = {
    "lcm_basica":      LcmBasica(),
    "quadratic_media": QuadraticMedia(),
    # "lcm_media":               LcmMedia(),
    # "quadratic_universitario": QuadraticUniversitario(),
}


def get_module(key: str) -> ExerciseModule:
    """
    Retorna el módulo registrado para la clave dada.
    Lanza KeyError con mensaje claro si no existe.
    """
    module = REGISTRY.get(key)
    if module is None:
        available = list(REGISTRY.keys())
        raise KeyError(
            f"Módulo '{key}' no encontrado. "
            f"Módulos disponibles: {available}"
        )
    return module
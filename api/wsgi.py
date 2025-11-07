# api/wsgi.py
# Gunicorn en Render está lanzando: wsgi:app
# Aseguramos que exista un símbolo top-level llamado `app`.

try:
    # Cuando el import se resuelve desde el paquete 'api'
    from __init__ import app as app
except Exception:
    # Fallback si se resuelve como paquete absoluto
    from api import app as app

# Alias opcional para compatibilidad con otras plataformas
application = app

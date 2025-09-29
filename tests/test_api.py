import json
from api.generate_exercise import app

def test_generate_exercise_returns_expected_json():
    client = app.test_client()
    resp = client.get("/api/generate-exercise")
    assert resp.status_code == 200
    data = json.loads(resp.data.decode())
    assert "coeffs" in data
    assert "latex_enunciado" in data
    assert "latex_solucion" in data
    assert "graph" in data
    assert "meta" in data

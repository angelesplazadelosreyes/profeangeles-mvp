import asyncio
import io
import base64
from playwright.async_api import async_playwright


HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: white;
    color: #1a1a1a;
    padding: 48px 56px;
    width: 794px;
  }}
  .header {{
    border-bottom: 2px solid #7F77DD;
    padding-bottom: 16px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }}
  .brand {{
    font-size: 12px;
    color: #7F77DD;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }}
  h1 {{
    font-size: 20px;
    font-weight: 500;
    color: #1a1a1a;
  }}
  .meta {{
    font-size: 11px;
    color: #888780;
    text-align: right;
    line-height: 1.7;
  }}
  .section-label {{
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #888780;
    margin-bottom: 12px;
  }}
  .exercise-card {{
    border: 0.5px solid #D3D1C7;
    border-radius: 10px;
    padding: 14px 18px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }}
  .exercise-number {{
    font-size: 10px;
    font-weight: 600;
    color: #7F77DD;
    letter-spacing: 0.04em;
    margin-bottom: 5px;
  }}
  .exercise-statement {{
    font-size: 13px;
    color: #1a1a1a;
    margin-bottom: 10px;
    line-height: 1.5;
  }}
  .exercise-statement em {{
    font-style: italic;
  }}
  .chips {{
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }}
  .chip {{
    background: #EEEDFE;
    color: #534AB7;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 9px;
    border-radius: 20px;
  }}
  .divider {{
    border: none;
    border-top: 1px dashed #D3D1C7;
    margin: 24px 0;
  }}
  .solution-label {{
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #888780;
    margin-bottom: 14px;
  }}
  .solution-card {{
    border: 0.5px solid #D3D1C7;
    border-radius: 10px;
    padding: 14px 18px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }}
  .solution-title {{
    font-size: 10px;
    font-weight: 600;
    color: #7F77DD;
    margin-bottom: 8px;
  }}
  .solution-title em {{
    font-weight: 400;
    color: #1a1a1a;
    font-style: italic;
  }}
  .sol-row {{
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: #1a1a1a;
    margin-bottom: 4px;
    line-height: 1.5;
  }}
  .sol-letter {{
    color: #7F77DD;
    font-weight: 600;
    min-width: 18px;
  }}
  .sol-label {{
    font-weight: 500;
  }}
  .graph-img {{
    margin-top: 10px;
    max-width: 300px;
  }}
  .footer {{
    border-top: 0.5px solid #D3D1C7;
    margin-top: 28px;
    padding-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
  .footer-url {{
    font-size: 10px;
    color: #7F77DD;
  }}
  .footer-page {{
    font-size: 10px;
    color: #888780;
  }}
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">ProfeÁngeles</div>
    <h1>Guía de ejercicios — {topic}</h1>
  </div>
  <div class="meta">
    {date}<br>
    {count} ejercicio{plural} · Solucionario incluido
  </div>
</div>

<p class="section-label">Ejercicios</p>

{exercises_html}

<hr class="divider">

<p class="solution-label">— Solucionario —</p>

{solutions_html}

<div class="footer">
  <span class="footer-url">profeangeles.cl</span>
  <span class="footer-page">Generado con ProfeÁngeles</span>
</div>

</body>
</html>
"""


ORDER_LABELS = [
    ("concavity",       "Concavidad"),
    ("discriminant",    "Discriminante"),
    ("roots",           "Raíces"),
    ("axis",            "Eje de simetría"),
    ("vertex",          "Vértice"),
    ("y_intercept",     "Intersección con eje Y"),
    ("domain",          "Dominio"),
    ("range",           "Recorrido"),
    ("canonical_form",  "Forma canónica"),
    ("factorized_form", "Forma factorizada"),
    ("graph",           "Gráfico"),
]


def build_exercises_html(exercises, skills):
    html = ""
    for idx, ex in enumerate(exercises, start=1):
        fx = ex["fx"]
        labels = [lab for key, lab in ORDER_LABELS if key in skills]
        chips = "".join(f'<span class="chip">{l}</span>' for l in labels)
        if "inverse" in skills:
            chips += '<span class="chip">Función inversa</span>'
        html += f"""
        <div class="exercise-card">
          <div class="exercise-number">Ejercicio {idx}</div>
          <div class="exercise-statement">Dada la función <em>{fx}</em>, determina lo que se indica.</div>
          <div class="chips">{chips}</div>
        </div>
        """
    return html


def build_solutions_html(exercises, skills):
    html = ""
    for idx, ex in enumerate(exercises, start=1):
        fx = ex["fx"]
        parts = ex["solution_parts"]
        plot_b64 = ex.get("plot_b64")

        rows = ""
        letter_i = 0
        for key, lab in ORDER_LABELS:
            if key not in skills:
                continue
            if key == "graph":
                letter = chr(97 + letter_i)
                if plot_b64:
                    rows += f"""
                    <div class="sol-row">
                      <span class="sol-letter">{letter})</span>
                      <span><span class="sol-label">Gráfico:</span><br>
                      <img class="graph-img" src="data:image/png;base64,{plot_b64}">
                      </span>
                    </div>
                    """
                letter_i += 1
                continue

            val = parts.get(key)
            if val is None:
                letter_i += 1
                continue

            letter = chr(97 + letter_i)
            rows += f"""
            <div class="sol-row">
              <span class="sol-letter">{letter})</span>
              <span><span class="sol-label">{lab}:</span> {val}</span>
            </div>
            """
            letter_i += 1

        if "inverse" in skills:
            inv = ex.get("inverse")
            if inv:
                letter = chr(97 + letter_i)
                rows += f"""
                <div class="sol-row">
                  <span class="sol-letter">{letter})</span>
                  <span><span class="sol-label">Función inversa:</span>
                  f⁻¹(x) = {inv['expression']}<br>
                  <em style="font-size:11px;color:#888780">restricción x &ge; {inv['h']}</em>
                  </span>
                </div>
                """

        html += f"""
        <div class="solution-card">
          <div class="solution-title">Ejercicio {idx} · <em>{fx}</em></div>
          {rows}
        </div>
        """
    return html


async def _generate_pdf_bytes(html: str) -> bytes:
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
        page = await browser.new_page()
        await page.set_content(html, wait_until="networkidle")
        pdf = await page.pdf(
            format="A4",
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            print_background=True,
        )
        await browser.close()
        return pdf


def generate_guide_pdf_bytes(exercises, skills, topic="Función cuadrática", date=""):
    from datetime import date as dt
    if not date:
        MESES = {
            "January": "Enero", "February": "Febrero", "March": "Marzo",
            "April": "Abril", "May": "Mayo", "June": "Junio",
            "July": "Julio", "August": "Agosto", "September": "Septiembre",
            "October": "Octubre", "November": "Noviembre", "December": "Diciembre"
        }
        mes_en = dt.today().strftime("%B")
        date = f"{MESES.get(mes_en, mes_en)} {dt.today().year}"

    count = len(exercises)
    plural = "s" if count != 1 else ""

    exercises_html = build_exercises_html(exercises, skills)
    solutions_html = build_solutions_html(exercises, skills)

    html = HTML_TEMPLATE.format(
        topic=topic,
        date=date,
        count=count,
        plural=plural,
        exercises_html=exercises_html,
        solutions_html=solutions_html,
    )

    return asyncio.run(_generate_pdf_bytes(html))
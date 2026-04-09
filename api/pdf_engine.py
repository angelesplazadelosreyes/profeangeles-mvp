# api/pdf_engine.py
"""
Motor PDF genérico con Playwright.
No contiene lógica matemática — delega el HTML a cada ExerciseModule.
"""
import asyncio
from datetime import date as dt
from api.exercises.base import ExerciseModule


MESES = {
    "January": "Enero", "February": "Febrero", "March": "Marzo",
    "April": "Abril",   "May": "Mayo",          "June": "Junio",
    "July": "Julio",    "August": "Agosto",     "September": "Septiembre",
    "October": "Octubre","November": "Noviembre","December": "Diciembre",
}

HTML_TEMPLATE = (
    '<!DOCTYPE html>'
    '<html lang="es">'
    '<head>'
    '<meta charset="UTF-8">'
    '<style>'
    '* { box-sizing: border-box; margin: 0; padding: 0; }'
    'body {'
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;'
    '  background: white;'
    '  color: #1a1a1a;'
    '  padding: 48px 56px;'
    '  width: 794px;'
    '}'
    '.header {'
    '  border-bottom: 2px solid #7F77DD;'
    '  padding-bottom: 16px;'
    '  margin-bottom: 28px;'
    '  display: flex;'
    '  justify-content: space-between;'
    '  align-items: flex-end;'
    '}'
    '.brand {'
    '  font-size: 12px;'
    '  color: #7F77DD;'
    '  font-weight: 600;'
    '  letter-spacing: 0.06em;'
    '  text-transform: uppercase;'
    '  margin-bottom: 4px;'
    '}'
    'h1 { font-size: 20px; font-weight: 500; color: #1a1a1a; }'
    '.meta { font-size: 11px; color: #888780; text-align: right; line-height: 1.7; }'
    '.section-label {'
    '  font-size: 10px;'
    '  font-weight: 600;'
    '  letter-spacing: 0.08em;'
    '  text-transform: uppercase;'
    '  color: #888780;'
    '  margin-bottom: 12px;'
    '}'
    '.exercise-card {'
    '  border: 0.5px solid #D3D1C7;'
    '  border-radius: 10px;'
    '  padding: 14px 18px;'
    '  margin-bottom: 12px;'
    '  page-break-inside: avoid;'
    '}'
    '.exercise-number {'
    '  font-size: 10px;'
    '  font-weight: 600;'
    '  color: #7F77DD;'
    '  letter-spacing: 0.04em;'
    '  margin-bottom: 5px;'
    '}'
    '.exercise-statement { font-size: 13px; color: #1a1a1a; margin-bottom: 10px; line-height: 1.5; }'
    '.exercise-statement em { font-style: italic; }'
    '.chips { display: flex; flex-wrap: wrap; gap: 5px; }'
    '.chip {'
    '  background: #EEEDFE;'
    '  color: #534AB7;'
    '  font-size: 10px;'
    '  font-weight: 600;'
    '  padding: 2px 9px;'
    '  border-radius: 20px;'
    '}'
    '.divider { border: none; border-top: 1px dashed #D3D1C7; margin: 24px 0; }'
    '.solution-label {'
    '  text-align: center;'
    '  font-size: 10px;'
    '  font-weight: 600;'
    '  letter-spacing: 0.08em;'
    '  text-transform: uppercase;'
    '  color: #888780;'
    '  margin-bottom: 14px;'
    '}'
    '.solution-card {'
    '  border: 0.5px solid #D3D1C7;'
    '  border-radius: 10px;'
    '  padding: 14px 18px;'
    '  margin-bottom: 12px;'
    '  page-break-inside: avoid;'
    '}'
    '.solution-title { font-size: 10px; font-weight: 600; color: #7F77DD; margin-bottom: 8px; }'
    '.solution-title em { font-weight: 400; color: #1a1a1a; font-style: italic; }'
    '.sol-row { display: flex; gap: 8px; font-size: 12px; color: #1a1a1a; margin-bottom: 4px; line-height: 1.5; }'
    '.sol-letter { color: #7F77DD; font-weight: 600; min-width: 18px; }'
    '.sol-label { font-weight: 500; }'
    '.graph-img { margin-top: 10px; max-width: 300px; }'
    '.escalera-table { border-collapse: collapse; margin: 8px 0; font-size: 12px; }'
    '.escalera-table th, .escalera-table td { border: 1px solid #D3D1C7; padding: 4px 10px; text-align: center; }'
    '.escalera-table th { background: #EEEDFE; color: #534AB7; font-weight: 600; }'
    '.escalera-table td.divisor { background: #f5f5f5; font-weight: 600; color: #534AB7; }'
    '.footer {'
    '  border-top: 0.5px solid #D3D1C7;'
    '  margin-top: 28px;'
    '  padding-top: 10px;'
    '  display: flex;'
    '  justify-content: space-between;'
    '  align-items: center;'
    '}'
    '.footer-url { font-size: 10px; color: #7F77DD; }'
    '.footer-page { font-size: 10px; color: #888780; }'
    '</style>'
    '</head>'
    '<body>'
    '<div class="header">'
    '  <div>'
    '    <div class="brand">ProfeÁngeles</div>'
    '    <h1>Guía de ejercicios — TOPIC_VAR</h1>'
    '  </div>'
    '  <div class="meta">DATE_VAR<br>COUNT_VAR ejercicioPLURAL_VAR · Solucionario incluido</div>'
    '</div>'
    '<p class="section-label">Ejercicios</p>'
    'EXERCISES_VAR'
    '<hr class="divider">'
    '<p class="solution-label">— Solucionario —</p>'
    'SOLUTIONS_VAR'
    '<div class="footer">'
    '  <span class="footer-url">profeangeles.cl</span>'
    '  <span class="footer-page">Generado con ProfeÁngeles</span>'
    '</div>'
    '</body>'
    '</html>'
)


async def _render_pdf(html: str) -> bytes:
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
        page    = await browser.new_page()
        await page.set_content(html, wait_until="networkidle")
        pdf = await page.pdf(
            format="A4",
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            print_background=True,
        )
        await browser.close()
        return pdf


def generate_guide_pdf_bytes(
    module: ExerciseModule,
    exercises: list[dict],
    skills: list[str],
    date: str = "",
) -> bytes:
    if not date:
        mes_en = dt.today().strftime("%B")
        date   = f"{MESES.get(mes_en, mes_en)} {dt.today().year}"

    count  = len(exercises)
    plural = "s" if count != 1 else ""

    exercises_html = "".join(
        module.render_exercise_html(ex, i + 1, skills)
        for i, ex in enumerate(exercises)
    )
    solutions_html = "".join(
        module.render_solution_html(ex, i + 1, skills)
        for i, ex in enumerate(exercises)
    )

    html = (HTML_TEMPLATE
        .replace("TOPIC_VAR",     module.label)
        .replace("DATE_VAR",      date)
        .replace("COUNT_VAR",     str(count))
        .replace("PLURAL_VAR",    plural)
        .replace("EXERCISES_VAR", exercises_html)
        .replace("SOLUTIONS_VAR", solutions_html)
    )

    return asyncio.run(_render_pdf(html))
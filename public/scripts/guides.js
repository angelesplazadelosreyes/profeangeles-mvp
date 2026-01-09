// public/scripts/guides.js
(function initGuides(){
  const SKILLS_ORDER = [
    { key: "concavity", label: "Concavidad" },
    { key: "discriminant", label: "Discriminante" },
    { key: "roots", label: "Raíces" },
    { key: "axis", label: "Eje de simetría" },
    { key: "vertex", label: "Vértice" },
    { key: "y_intercept", label: "Intersección con eje Y" },
    { key: "domain", label: "Dominio" },
    { key: "range", label: "Recorrido" },
    { key: "canonical_form", label: "Forma canónica" },
    { key: "factorized_form", label: "Forma factorizada" },
    { key: "graph", label: "Gráfico" },
  ];

  const INVERSE = { key: "inverse", label: "Función inversa (restringe dominio)" };

  let currentFunctionText = null;
  let loading = false;

  async function fetchExercise(){
    const res = await fetch(
      "https://profeangeles-mvp.onrender.com/api/generate-exercise?type=analisis_completo"
    );
    if (!res.ok) throw new Error("Error generando ejercicio");
    const data = await res.json();
    return data.coeffs;
  }

  function toReadableFunction({ a, b, c }){
    let fx = "f(x) = ";

    fx += a === 1 ? "x²" : a === -1 ? "−x²" : `${a}x²`;

    if (b !== 0){
      fx += b > 0 ? ` + ${b}x` : ` − ${Math.abs(b)}x`;
    }

    if (c !== 0){
      fx += c > 0 ? ` + ${c}` : ` − ${Math.abs(c)}`;
    }

    return fx;
  }

  function ready(){
    const checkboxes = document.querySelectorAll(".skills-grid input[type='checkbox']");
    const button = document.getElementById("generateGuideBtn");
    const preview = document.getElementById("statementPreview");
    const textEl = document.getElementById("statementText");

    if (!checkboxes.length || !button || !preview || !textEl){
      setTimeout(ready, 50);
      return;
    }

    async function update(){
      const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      button.disabled = selected.length === 0;

      if (selected.length === 0){
        preview.style.display = "none";
        textEl.textContent = "";
        return;
      }

      if (!currentFunctionText && !loading){
        loading = true;
        preview.style.display = "block";
        textEl.textContent = "Generando función…";

        try{
          const coeffs = await fetchExercise();
          currentFunctionText = toReadableFunction(coeffs);
        }catch(err){
          console.error(err);
          textEl.textContent = "Error al generar la función.";
          return;
        }finally{
          loading = false;
        }
      }

      const ordered = [];
      SKILLS_ORDER.forEach(s => {
        if (selected.includes(s.key)) ordered.push(s.label);
      });
      if (selected.includes(INVERSE.key)) ordered.push(INVERSE.label);

      let out = `Dada la siguiente función cuadrática ${currentFunctionText}, determina:\n\n`;
      ordered.forEach((label, i) => {
        out += `${String.fromCharCode(97 + i)}) ${label}\n`;
      });

      textEl.textContent = out.trim();
      preview.style.display = "block";
    }

    checkboxes.forEach(cb => cb.addEventListener("change", update));
    update();
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", ready)
    : ready();
})();

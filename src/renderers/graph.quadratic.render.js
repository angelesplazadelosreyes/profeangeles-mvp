// src/renderers/graph.quadratic.render.js
// Renderiza el gráfico de una función cuadrática usando:
// - PNG base64 generado en backend (si viene)
// - Chart.js como fallback

let chart = null;

export function drawQuadraticGraph(data) {
  // Contenedor donde vive el gráfico
  const wrap = document.querySelector('.chart-wrap');
  if (!wrap) return;

  // Si había un Chart.js previo, destrúyelo
  if (chart) {
    chart.destroy();
    chart = null;
  }

  // Limpia el contenido anterior (canvas o imagen)
  wrap.innerHTML = '';

  // 1) Si viene PNG de Matplotlib, lo usamos
  const pngB64 = data?.plot?.png;
  if (pngB64) {
    const img = document.createElement('img');
    img.alt = 'Gráfico de la función cuadrática';
    img.src = `data:image/png;base64,${pngB64}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    wrap.appendChild(img);
    return; // No seguimos, ya mostramos la imagen
  }

  // 2) Fallback: si NO hay PNG, usamos Chart.js como antes
  const canvas = document.createElement('canvas');
  canvas.id = 'grafico';
  canvas.height = 260;
  canvas.className = 'chart';
  wrap.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const { x_min, x_max, step } = data.graph;
  const { coeffs } = data;

  const xs = [];
  const ys = [];
  for (let x = x_min; x <= x_max; x += step) {
    xs.push(Number(x.toFixed(2)));
    ys.push(coeffs.a * x * x + coeffs.b * x + coeffs.c);
  }

  // Chart viene de la librería global cargada en exercises.html
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [{ label: 'y = ax² + bx + c', data: ys }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'x' } },
        y: { title: { display: true, text: 'y' } }
      }
    }
  });
}

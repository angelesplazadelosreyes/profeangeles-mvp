import io
import base64
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


def plot_quadratic_png(a, b, c):
    vx = -b / (2 * a)
    vy = a * vx * vx + b * vx + c
    disc = b * b - 4 * a * c

    roots = []
    if disc >= 0:
        r = disc ** 0.5
        roots = [(-b + r) / (2 * a), (-b - r) / (2 * a)]

    span = 10 if abs(a) < 1.5 else 6
    xs = np.linspace(vx - span, vx + span, 600)
    ys = a * xs**2 + b * xs + c

    fig = plt.figure(figsize=(5.5, 3.8), dpi=110)
    ax = fig.add_subplot(111)

    ax.plot(xs, ys, label="Parábola")
    ax.scatter([vx], [vy], s=40, zorder=3, label="Vértice")
    ax.axvline(vx, linestyle="--", alpha=0.6, label="Eje de simetría")
    ax.scatter([0], [c], s=30, zorder=3, label="Corte con eje y")

    if roots:
        ax.scatter(roots, [0]*len(roots), marker="x", s=60, zorder=3, label="Raíces reales")

    ax.axhline(0, color="k", lw=0.6, alpha=0.6)
    ax.axvline(0, color="k", lw=0.6, alpha=0.6)
    ax.grid(alpha=0.25)

    ax.set_title(f"y = {a}x² {('+' if b>=0 else '')}{b}x {('+' if c>=0 else '')}{c}")
    ax.set_xlabel("x")
    ax.set_ylabel("y")
    ax.legend(loc="best", fontsize=9)

    ymin, ymax = float(np.min(ys)), float(np.max(ys))
    pad = 0.1 * (ymax - ymin + 1)
    ax.set_ylim(ymin - pad, ymax + pad)

    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)

    buf.seek(0)
    return base64.b64encode(buf.read()).decode("ascii")

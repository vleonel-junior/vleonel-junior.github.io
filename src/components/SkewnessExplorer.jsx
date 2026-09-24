import { useState, useMemo } from 'preact/hooks';
import { lgamma, normalPdf, linspace, quantileOf, linePath, fmt } from './figures/math.js';

const STRINGS = {
  fr: {
    label: "Asymétrie",
    presets: [["Gauche", -1], ["Symétrique", 0], ["Droite", 1]],
    mean: "Moyenne",
    median: "Médiane",
    mode: "Mode",
    axis: "Valeur (centrée réduite)",
    symmetric: "La distribution est symétrique : les trois mesures sont confondues.",
    right: "La queue s'étire vers la droite et entraîne la moyenne avec elle.",
    left: "La queue s'étire vers la gauche et entraîne la moyenne avec elle.",
    caption: (n) =>
      `Figure ${n} : Déplacez le curseur pour changer le coefficient d'asymétrie S. Chaque courbe est une loi gamma centrée réduite (réfléchie quand S < 0), donc la moyenne reste à 0 et seule la forme change. Plus la queue s'allonge, plus la moyenne s'éloigne du mode.`,
  },
  en: {
    label: "Skewness",
    presets: [["Left", -1], ["Symmetric", 0], ["Right", 1]],
    mean: "Mean",
    median: "Median",
    mode: "Mode",
    axis: "Value (standardized)",
    symmetric: "The distribution is symmetric: the three measures coincide.",
    right: "The tail stretches to the right and pulls the mean along with it.",
    left: "The tail stretches to the left and pulls the mean along with it.",
    caption: (n) =>
      `Figure ${n}: Move the slider to change the skewness coefficient S. Each curve is a standardized gamma distribution (mirrored when S < 0), so the mean stays at 0 and only the shape changes. The longer the tail, the further the mean moves away from the mode.`,
  },
};

// Chart geometry (SVG user units)
const W = 600, H = 262, L = 16, R = 16, T = 14, B = 52;
const X_MIN = -4, X_MAX = 4, Y_MAX = 0.6;
const sx = (x) => L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - L - R);
const sy = (y) => H - B - (Math.min(y, Y_MAX) / Y_MAX) * (H - T - B);

/**
 * Standardized gamma density with skewness s (k = 4 / s²), mirrored for s < 0.
 * s = 0 is the normal distribution, the limit of the family.
 */
function density(x, s) {
  if (Math.abs(s) < 1e-6) return normalPdf(x);
  const k = 4 / (s * s);
  const g = Math.sqrt(k) * Math.sign(s) * x + k;
  return g <= 0 ? 0 : Math.sqrt(k) * Math.exp((k - 1) * Math.log(g) - g - lgamma(k));
}

export default function SkewnessExplorer({ lang = "fr", figure = 2 }) {
  const t = STRINGS[lang] ?? STRINGS.fr;
  const [s, setS] = useState(1);

  const { curve, area, median, mode } = useMemo(() => {
    // Wide grid for the median, visible window for the drawing
    const wide = linspace(-10, 10, 4001);
    const median = quantileOf(wide, wide.map((x) => density(x, s)), 0.5);
    const mode = Math.abs(s) < 1e-6 ? 0 : -Math.sign(s) * (Math.abs(s) / 2);
    const xs = linspace(X_MIN, X_MAX, 321);
    const ys = xs.map((x) => density(x, s));
    const curve = linePath(xs, ys, sx, sy);
    const area = `${curve}L${sx(X_MAX)},${sy(0)}L${sx(X_MIN)},${sy(0)}Z`;
    return { curve, area, median, mode };
  }, [s]);

  const mean = 0;
  const symmetric = Math.abs(s) < 1e-6;
  const markers = [
    { key: "mode", x: mode, color: "var(--fig-mode)", dash: "2 4" },
    { key: "median", x: median, color: "var(--fig-median)", dash: "7 4" },
    { key: "mean", x: mean, color: "var(--fig-mean)", dash: "" },
  ];
  const order = symmetric
    ? `${t.mean} = ${t.median} = ${t.mode}`
    : [...markers].sort((a, b) => a.x - b.x).map((m) => t[m.key]).join(" < ");

  return (
    <figure className="fig not-prose">
      <div className="fig-panel">
        <div className="fig-controls">
          <span className="fig-label">{t.label}</span>
          <input
            type="range"
            min="-1.5"
            max="1.5"
            step="0.05"
            value={s}
            aria-label={t.label}
            onInput={(e) => setS(Math.round(e.currentTarget.valueAsNumber * 100) / 100)}
          />
          <span className="fig-value">S = {fmt(s, lang)}</span>
          <div className="fig-chips">
            {t.presets.map(([name, value]) => (
              <button type="button" className="fig-chip" aria-pressed={s === value} onClick={() => setS(value)}>
                {name}
              </button>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t.label} S = ${fmt(s, lang)}. ${order}`}>
          <path d={area} fill="var(--fig-data)" fillOpacity="0.12" />
          <path d={curve} fill="none" stroke="var(--fig-data)" strokeWidth="2" />
          {markers.map((m) => (
            <line
              x1={sx(m.x)}
              x2={sx(m.x)}
              y1={sy(0)}
              y2={T}
              stroke={m.color}
              strokeWidth="2"
              strokeDasharray={m.dash}
              style={{ transition: "all 150ms" }}
            />
          ))}
          <line className="axis" x1={L} x2={W - R} y1={sy(0)} y2={sy(0)} />
          {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
            <g>
              <line className="axis" x1={sx(v)} x2={sx(v)} y1={sy(0)} y2={sy(0) + 5} />
              <text x={sx(v)} y={sy(0) + 19} fontSize="13" textAnchor="middle">
                {v < 0 ? `−${-v}` : v}
              </text>
            </g>
          ))}
          <text x={W / 2} y={H - 2} fontSize="13" textAnchor="middle">{t.axis}</text>
        </svg>

        <div className="fig-legend">
          {[...markers].reverse().map((m) => (
            <span style={{ color: m.color }}>
              <i style={{ borderTopStyle: m.dash ? (m.dash === "2 4" ? "dotted" : "dashed") : "solid" }} />
              <span style={{ color: "var(--fg-muted)" }}>
                {t[m.key]} {fmt(m.x, lang)}
              </span>
            </span>
          ))}
        </div>

        <p className="fig-note">
          <strong>{order}</strong>
          <br />
          {symmetric ? t.symmetric : s > 0 ? t.right : t.left}
        </p>
      </div>
      <figcaption>{t.caption(figure)}</figcaption>
    </figure>
  );
}

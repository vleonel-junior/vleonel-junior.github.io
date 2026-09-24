import { useState, useMemo } from 'preact/hooks';
import { lgamma, gamma, normalPdf, linspace, tailMass, linePath, fmt } from './figures/math.js';

const STRINGS = {
  fr: {
    label: "Kurtosis",
    presets: [["Platykurtique", 0], ["Normale", 0.5], ["Leptokurtique", 1]],
    platy: "Platykurtique : pic aplati, queues légères. Les valeurs extrêmes sont plus rares que pour une loi normale.",
    meso: "Mésokurtique : c'est la loi normale, la référence (K = 3).",
    lepto: "Leptokurtique : pic pointu, queues lourdes. Les valeurs extrêmes sont plus fréquentes que pour une loi normale.",
    curve: "Distribution étudiée",
    normal: "Loi normale (référence)",
    tails: (p2, p3) => `P(|X| > 2) = ${p2}   ·   P(|X| > 3) = ${p3}`,
    normalTails: "Loi normale : 4,55 % et 0,27 %",
    excess: "excès",
    axis: "Valeur (variance = 1)",
    caption: (n) =>
      `Figure ${n} : Loi normale généralisée de variance 1. Toutes les courbes ont la même variance, seule la forme change. Les zones colorées au-delà de ±2 donnent la probabilité d'une valeur extrême, à comparer à la loi normale en pointillés.`,
  },
  en: {
    label: "Kurtosis",
    presets: [["Platykurtic", 0], ["Normal", 0.5], ["Leptokurtic", 1]],
    platy: "Platykurtic: flat peak, light tails. Extreme values are rarer than under a normal distribution.",
    meso: "Mesokurtic: this is the normal distribution, the reference (K = 3).",
    lepto: "Leptokurtic: sharp peak, heavy tails. Extreme values are more frequent than under a normal distribution.",
    curve: "Distribution shown",
    normal: "Normal distribution (reference)",
    tails: (p2, p3) => `P(|X| > 2) = ${p2}   ·   P(|X| > 3) = ${p3}`,
    normalTails: "Normal distribution: 4.55% and 0.27%",
    excess: "excess",
    axis: "Value (variance = 1)",
    caption: (n) =>
      `Figure ${n}: Generalized normal distribution with variance 1. Every curve has the same variance; only the shape changes. The shaded areas beyond ±2 give the probability of an extreme value, to compare with the dotted normal curve.`,
  },
};

const W = 600, H = 262, L = 16, R = 16, T = 14, B = 52;
const X_MIN = -4, X_MAX = 4, Y_MAX = 0.75;
const sx = (x) => L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - L - R);
const sy = (y) => H - B - (Math.min(y, Y_MAX) / Y_MAX) * (H - T - B);

// Slider position u in [0, 1] -> shape beta: 10 (almost flat) at 0, 2 (normal) at 0.5, 1 (Laplace) at 1
function betaAt(u) {
  return u <= 0.5 ? Math.exp(Math.log(10) + (u / 0.5) * Math.log(2 / 10)) : Math.exp(Math.log(2) + ((u - 0.5) / 0.5) * Math.log(1 / 2));
}

/** Generalized normal density with shape beta, rescaled to unit variance. */
function density(x, beta) {
  const alpha = Math.sqrt(Math.exp(lgamma(1 / beta) - lgamma(3 / beta)));
  return (beta / (2 * alpha * gamma(1 / beta))) * Math.exp(-Math.pow(Math.abs(x) / alpha, beta));
}

const kurtosisOf = (beta) => Math.exp(lgamma(5 / beta) + lgamma(1 / beta) - 2 * lgamma(3 / beta));

const pct = (p, lang) => (p < 0.00005 ? "≈ 0 %" : `${fmt(p * 100, lang)}${lang === "fr" ? " %" : "%"}`);

export default function KurtosisExplorer({ lang = "fr", figure = 3 }) {
  const t = STRINGS[lang] ?? STRINGS.fr;
  const [u, setU] = useState(0.5);
  const beta = betaAt(u);
  const K = Math.abs(u - 0.5) < 1e-9 ? 3 : kurtosisOf(beta);

  const { curve, leftTail, rightTail, normal, p2, p3 } = useMemo(() => {
    const xs = linspace(X_MIN, X_MAX, 321);
    const ys = xs.map((x) => density(x, beta));
    const tail = (a, b) => {
      const pts = linspace(a, b, 60);
      return `${linePath(pts, pts.map((x) => density(x, beta)), sx, sy)}L${sx(b)},${sy(0)}L${sx(a)},${sy(0)}Z`;
    };
    const wide = linspace(-12, 12, 6001);
    const wideYs = wide.map((x) => density(x, beta));
    return {
      curve: linePath(xs, ys, sx, sy),
      leftTail: tail(X_MIN, -2),
      rightTail: tail(2, X_MAX),
      normal: linePath(xs, xs.map(normalPdf), sx, sy),
      p2: tailMass(wide, wideYs, 2),
      p3: tailMass(wide, wideYs, 3),
    };
  }, [beta]);

  const state = K < 2.95 ? "platy" : K > 3.05 ? "lepto" : "meso";

  return (
    <figure className="fig not-prose">
      <div className="fig-panel">
        <div className="fig-controls">
          <span className="fig-label">{t.label}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={u}
            aria-label={t.label}
            onInput={(e) => setU(e.currentTarget.valueAsNumber)}
          />
          <span className="fig-value">K = {fmt(K, lang)}</span>
          <div className="fig-chips">
            {t.presets.map(([name, value]) => (
              <button type="button" className="fig-chip" aria-pressed={Math.abs(u - value) < 1e-9} onClick={() => setU(value)}>
                {name}
              </button>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${t.label} K = ${fmt(K, lang)}`}>
          <path d={leftTail} fill="var(--fig-data)" fillOpacity="0.45" />
          <path d={rightTail} fill="var(--fig-data)" fillOpacity="0.45" />
          <path d={normal} fill="none" stroke="var(--fig-ref)" strokeWidth="1.5" strokeDasharray="3 4" />
          <path d={curve} fill="none" stroke="var(--fig-data)" strokeWidth="2" />
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
          <span style={{ color: "var(--fig-data)" }}>
            <i />
            <span style={{ color: "var(--fg-muted)" }}>
              {t.curve} (K = {fmt(K, lang)}, {t.excess} {K - 3 >= 0 ? "+" : ""}{fmt(K - 3, lang)})
            </span>
          </span>
          <span style={{ color: "var(--fig-ref)" }}>
            <i style={{ borderTopStyle: "dotted" }} />
            <span style={{ color: "var(--fg-muted)" }}>{t.normal}</span>
          </span>
        </div>

        <p className="fig-note">
          {t[state]}
          <br />
          <strong style={{ whiteSpace: "pre-wrap" }}>{t.tails(pct(p2, lang), pct(p3, lang))}</strong>
          <br />
          <span>{t.normalTails}</span>
        </p>
      </div>
      <figcaption>{t.caption(figure)}</figcaption>
    </figure>
  );
}

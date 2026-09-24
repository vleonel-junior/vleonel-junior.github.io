import { useState } from 'preact/hooks';
import { fmt } from './figures/math.js';

// 20 server response times in milliseconds (made-up data), already sorted
const DATA = [12, 18, 21, 23, 24, 26, 27, 28, 29, 30, 31, 32, 34, 35, 37, 39, 42, 45, 71, 84];

/** Empirical quantile as defined in the article: average of two ranks when np is an integer. */
function quantile(sorted, p) {
  const np = sorted.length * p;
  return Number.isInteger(np) ? (sorted[np - 1] + sorted[np]) / 2 : sorted[Math.floor(np)];
}

const n = DATA.length;
const q1 = quantile(DATA, 0.25);
const med = quantile(DATA, 0.5);
const q3 = quantile(DATA, 0.75);
const iqr = q3 - q1;
const lowFence = q1 - 1.5 * iqr;
const highFence = q3 + 1.5 * iqr;
const inside = DATA.filter((x) => x >= lowFence && x <= highFence);
const outliers = DATA.filter((x) => x < lowFence || x > highFence);
const lo = inside[0];
const hi = inside[inside.length - 1];
const mean = DATA.reduce((a, b) => a + b, 0) / n;

const STEPS = {
  fr: [
    ["overview", "Vue d'ensemble", `Chaque point en haut est une mesure (n = ${n}). La boîte à moustaches en dessous résume ces ${n} valeurs en cinq nombres, plus la moyenne et les valeurs aberrantes.`],
    ["q1", "Premier quartile", `Le bord gauche de la boîte est Q1 = ${fmt(q1, "fr", 0)} ms : 25 % des mesures sont inférieures ou égales à cette valeur.`],
    ["median", "Médiane", `Le trait à l'intérieur de la boîte est la médiane Q2 = ${fmt(med, "fr", 1)} ms. Elle coupe l'échantillon trié en deux moitiés de même taille.`],
    ["q3", "Troisième quartile", `Le bord droit de la boîte est Q3 = ${fmt(q3, "fr", 0)} ms : 75 % des mesures sont inférieures ou égales à cette valeur.`],
    ["iqr", "Écart interquartile", `La largeur de la boîte est l'IQR = Q3 − Q1 = ${fmt(iqr, "fr", 0)} ms. Elle contient les 50 % de mesures les plus centrales et ne dépend pas des valeurs extrêmes.`],
    ["fences", "Barrières de Tukey", `Les barrières sont placées à Q1 − 1,5 × IQR = ${fmt(lowFence, "fr", 1)} ms et Q3 + 1,5 × IQR = ${fmt(highFence, "fr", 1)} ms. Elles ne sont pas dessinées sur une boîte à moustaches classique, mais elles décident de tout ce qui suit.`],
    ["whisker", "Moustaches", `Chaque moustache s'arrête sur la mesure la plus éloignée qui reste à l'intérieur des barrières : ${fmt(lo, "fr", 0)} ms à gauche, ${fmt(hi, "fr", 0)} ms à droite. Elle ne mesure donc pas forcément 1,5 × IQR.`],
    ["outlier", "Valeurs aberrantes", `Les mesures au-delà des barrières (${outliers.map((x) => `${x} ms`).join(" et ")}) sont dessinées une à une. Ce sont les candidates à examiner : erreur de mesure, ou vrai comportement rare ?`],
    ["mean", "Moyenne", `Le losange indique la moyenne, ${fmt(mean, "fr", 1)} ms. Elle est tirée vers la droite par les deux valeurs aberrantes et dépasse la médiane : c'est le signe d'une asymétrie positive.`],
  ],
  en: [
    ["overview", "Overview", `Each dot at the top is one measurement (n = ${n}). The box plot below summarizes these ${n} values with five numbers, plus the mean and the outliers.`],
    ["q1", "First quartile", `The left edge of the box is Q1 = ${fmt(q1, "en", 0)} ms: 25% of the measurements are less than or equal to this value.`],
    ["median", "Median", `The line inside the box is the median Q2 = ${fmt(med, "en", 1)} ms. It splits the sorted sample into two halves of equal size.`],
    ["q3", "Third quartile", `The right edge of the box is Q3 = ${fmt(q3, "en", 0)} ms: 75% of the measurements are less than or equal to this value.`],
    ["iqr", "Interquartile range", `The width of the box is the IQR = Q3 − Q1 = ${fmt(iqr, "en", 0)} ms. It holds the middle 50% of the measurements and does not depend on the extreme values.`],
    ["fences", "Tukey's fences", `The fences sit at Q1 − 1.5 × IQR = ${fmt(lowFence, "en", 1)} ms and Q3 + 1.5 × IQR = ${fmt(highFence, "en", 1)} ms. A standard box plot does not draw them, but they decide everything that follows.`],
    ["whisker", "Whiskers", `Each whisker stops at the most extreme measurement that is still inside the fences: ${fmt(lo, "en", 0)} ms on the left, ${fmt(hi, "en", 0)} ms on the right. So a whisker is not necessarily 1.5 × IQR long.`],
    ["outlier", "Outliers", `Measurements beyond the fences (${outliers.map((x) => `${x} ms`).join(" and ")}) are drawn one by one. They are the ones to investigate: a measurement error, or genuinely rare behavior?`],
    ["mean", "Mean", `The diamond marks the mean, ${fmt(mean, "en", 1)} ms. The two outliers pull it to the right, past the median: a sign of positive skew.`],
  ],
};

const LABELS = {
  fr: {
    previous: "Étape précédente",
    next: "Étape suivante",
    axis: "Temps de réponse (ms)",
    caption: (f) =>
      `Figure ${f} : Boîte à moustaches de ${n} temps de réponse d'un serveur (données fictives). Les quartiles sont calculés avec la définition des quantiles empiriques donnée plus haut. Utilisez les flèches pour parcourir chaque élément.`,
  },
  en: {
    previous: "Previous step",
    next: "Next step",
    axis: "Response time (ms)",
    caption: (f) =>
      `Figure ${f}: Box plot of ${n} server response times (made-up data). The quartiles use the definition of empirical quantiles given above. Use the arrows to walk through each element.`,
  },
};

const W = 600, H = 224, L = 20, R = 20;
const X_MIN = 0, X_MAX = 90;
const sx = (x) => L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - L - R);
const DOTS_Y = 34, BOX_Y = 110, BOX_H = 44, AXIS_Y = 172;

export default function BoxPlotExplorer({ lang = "fr", figure = 4 }) {
  const [step, setStep] = useState(0);
  const steps = STEPS[lang] ?? STEPS.fr;
  const t = LABELS[lang] ?? LABELS.fr;
  const [current, title, desc] = steps[step];

  // Elements shown at full strength for the current step; everything else is faded
  const on = (...ids) => current === "overview" || ids.includes(current);
  const color = (...ids) => (current !== "overview" && ids.includes(current) ? "var(--accent)" : "var(--fg-muted)");
  const opacity = (...ids) => (on(...ids) ? 1 : 0.25);

  // Stack repeated values so every dot stays visible
  const seen = {};
  const dots = DATA.map((x) => {
    const level = (seen[x] = (seen[x] ?? -1) + 1);
    return { x, y: DOTS_Y - level * 9 };
  });

  const top = BOX_Y - BOX_H / 2;
  const bottom = BOX_Y + BOX_H / 2;

  return (
    <figure className="fig not-prose">
      <div className="fig-panel">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${desc}`}>
          {/* Raw data */}
          {dots.map((d) => (
            <circle
              cx={sx(d.x)}
              cy={d.y}
              r="4"
              fill={outliers.includes(d.x) && current === "outlier" ? "var(--accent)" : "var(--fg-subtle)"}
              fillOpacity={current === "overview" || current === "outlier" ? 0.9 : 0.45}
            />
          ))}

          {/* Fences */}
          <g opacity={current === "fences" || current === "whisker" || current === "outlier" ? 1 : 0}>
            {[lowFence, highFence].map((f) => (
              <g>
                <line x1={sx(f)} x2={sx(f)} y1={DOTS_Y - 14} y2={AXIS_Y} stroke="var(--fig-mode)" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x={sx(f)} y={DOTS_Y - 20} fontSize="12" textAnchor="middle" style={{ fill: "var(--fig-mode)" }}>
                  {fmt(f, lang, 1)}
                </text>
              </g>
            ))}
          </g>

          {/* IQR band */}
          <rect
            x={sx(q1)}
            y={top}
            width={sx(q3) - sx(q1)}
            height={BOX_H}
            fill="var(--accent)"
            fillOpacity={current === "iqr" ? 0.18 : 0.06}
          />

          {/* Whiskers and caps */}
          <g stroke={color("whisker")} strokeWidth="2" opacity={opacity("whisker", "fences")}>
            <line x1={sx(lo)} x2={sx(q1)} y1={BOX_Y} y2={BOX_Y} />
            <line x1={sx(q3)} x2={sx(hi)} y1={BOX_Y} y2={BOX_Y} />
            <line x1={sx(lo)} x2={sx(lo)} y1={BOX_Y - 12} y2={BOX_Y + 12} />
            <line x1={sx(hi)} x2={sx(hi)} y1={BOX_Y - 12} y2={BOX_Y + 12} />
          </g>

          {/* Box */}
          <g strokeWidth="2">
            <line x1={sx(q1)} x2={sx(q3)} y1={top} y2={top} stroke={color("iqr")} opacity={opacity("iqr", "q1", "q3")} />
            <line x1={sx(q1)} x2={sx(q3)} y1={bottom} y2={bottom} stroke={color("iqr")} opacity={opacity("iqr", "q1", "q3")} />
            <line x1={sx(q1)} x2={sx(q1)} y1={top} y2={bottom} stroke={color("q1", "iqr")} opacity={opacity("q1", "iqr")} />
            <line x1={sx(q3)} x2={sx(q3)} y1={top} y2={bottom} stroke={color("q3", "iqr")} opacity={opacity("q3", "iqr")} />
            <line x1={sx(med)} x2={sx(med)} y1={top} y2={bottom} stroke={color("median")} opacity={opacity("median")} strokeWidth="3" />
          </g>

          {/* Mean */}
          <path
            d={`M${sx(mean)},${BOX_Y - 7}l7,7l-7,7l-7,-7z`}
            fill={color("mean")}
            opacity={opacity("mean")}
          />

          {/* Outliers on the box plot row */}
          {outliers.map((x) => (
            <circle cx={sx(x)} cy={BOX_Y} r="5" fill="none" stroke={color("outlier")} strokeWidth="2" opacity={opacity("outlier")} />
          ))}

          {/* Labels for the active element */}
          {current !== "overview" && (
            <g fontSize="13">
              {current === "q1" && <text x={sx(q1)} y={top - 8} textAnchor="middle">Q1</text>}
              {current === "median" && <text x={sx(med)} y={top - 8} textAnchor="middle">Q2</text>}
              {current === "q3" && <text x={sx(q3)} y={top - 8} textAnchor="middle">Q3</text>}
              {current === "iqr" && <text x={(sx(q1) + sx(q3)) / 2} y={top - 8} textAnchor="middle">IQR</text>}
            </g>
          )}

          {/* Axis */}
          <line className="axis" x1={L} x2={W - R} y1={AXIS_Y} y2={AXIS_Y} />
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
            <g>
              <line className="axis" x1={sx(v)} x2={sx(v)} y1={AXIS_Y} y2={AXIS_Y + 5} />
              <text x={sx(v)} y={AXIS_Y + 19} fontSize="13" textAnchor="middle">{v}</text>
            </g>
          ))}
          <text x={W / 2} y={H - 2} fontSize="13" textAnchor="middle">{t.axis}</text>
        </svg>

        <div className="fig-note" style={{ textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <strong>{title}</strong>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <button
                type="button"
                className="fig-chip"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                aria-label={t.previous}
                disabled={step === 0}
                style={{ opacity: step === 0 ? 0.4 : 1 }}
              >
                ←
              </button>
              <span className="fig-value" style={{ minWidth: "3rem", textAlign: "center" }}>
                {step + 1}/{steps.length}
              </span>
              <button
                type="button"
                className="fig-chip"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                aria-label={t.next}
                disabled={step === steps.length - 1}
                style={{ opacity: step === steps.length - 1 ? 0.4 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          <p style={{ marginTop: "0.5rem", minHeight: "4.5em" }}>{desc}</p>
        </div>
      </div>
      <figcaption>{t.caption(figure)}</figcaption>
    </figure>
  );
}

import { useState } from 'preact/hooks';
import { fmt } from './figures/math.js';

/*
 * Box plot built step by step from a small sample.
 * Every number shown (quartiles, fences, whiskers, outliers, mean) is computed
 * below from DATA with the empirical quantile definition used in the article.
 */

// 20 server response times in milliseconds (made-up data), sorted in increasing order
const DATA = [12, 18, 21, 23, 24, 26, 27, 28, 29, 30, 31, 32, 34, 35, 37, 39, 42, 45, 71, 84];
const n = DATA.length;

/**
 * Empirical quantile of order p on sorted data x*_1 ≤ … ≤ x*_n:
 * (x*_{np} + x*_{np+1}) / 2 when np is an integer, x*_{⌊np⌋+1} otherwise.
 * Returns the value and the 1-based ranks it was computed from.
 */
function quantile(sorted, p) {
  const np = sorted.length * p;
  if (Number.isInteger(np)) return { value: (sorted[np - 1] + sorted[np]) / 2, ranks: [np, np + 1] };
  const rank = Math.floor(np) + 1;
  return { value: sorted[rank - 1], ranks: [rank] };
}

const Q1 = quantile(DATA, 0.25);
const Q2 = quantile(DATA, 0.5);
const Q3 = quantile(DATA, 0.75);
const iqr = Q3.value - Q1.value;
const lowFence = Q1.value - 1.5 * iqr;
const highFence = Q3.value + 1.5 * iqr;
const isOutlier = (x) => x < lowFence || x > highFence;
const inside = DATA.filter((x) => !isOutlier(x));
const whiskerLow = inside[0];
const whiskerHigh = inside[inside.length - 1];
const outliers = DATA.filter(isOutlier);
const mean = DATA.reduce((a, b) => a + b, 0) / n;

// 1-based ranks of the values to highlight
const ranksWhere = (test) => DATA.map((x, i) => (test(x) ? i + 1 : 0)).filter(Boolean);

function steps(lang) {
  const f = (v, d = 1) => fmt(v, lang, Number.isInteger(v) ? 0 : d);
  const x = (r) => `x${String(r).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d])}`;
  const list = (vals, and) => vals.map((v) => `${v} ms`).join(and);
  const fr = lang === "fr";
  return [
    {
      id: "overview",
      title: fr ? "La boîte à moustaches complète" : "The complete box plot",
      desc: fr
        ? `En haut, chacune des ${n} mesures est un point. En dessous, la boîte à moustaches les résume : la boîte va de Q1 à Q3, le trait intérieur est la médiane, les moustaches couvrent les mesures ordinaires et les cercles isolés sont les valeurs aberrantes. Les étapes suivantes calculent chaque élément.`
        : `At the top, each of the ${n} measurements is a dot. Below, the box plot summarizes them: the box runs from Q1 to Q3, the line inside it is the median, the whiskers cover the ordinary measurements and the isolated circles are the outliers. The next steps compute each element.`,
      ranks: [],
    },
    {
      id: "median",
      title: fr ? "Médiane (Q2)" : "Median (Q2)",
      desc: fr
        ? `On trie les ${n} mesures. Pour p = 0,5, np = ${n * 0.5} est entier, donc la médiane est la moyenne de ${x(10)} et ${x(11)} : (${DATA[9]} + ${DATA[10]}) / 2 = ${f(Q2.value)} ms. Il y a autant de mesures de chaque côté.`
        : `Sort the ${n} measurements. For p = 0.5, np = ${n * 0.5} is an integer, so the median is the average of ${x(10)} and ${x(11)}: (${DATA[9]} + ${DATA[10]}) / 2 = ${f(Q2.value)} ms. There are as many measurements on each side.`,
      ranks: Q2.ranks,
    },
    {
      id: "q1",
      title: fr ? "Premier quartile (Q1)" : "First quartile (Q1)",
      desc: fr
        ? `Pour p = 0,25, np = ${n * 0.25} est entier : Q1 = (${x(5)} + ${x(6)}) / 2 = (${DATA[4]} + ${DATA[5]}) / 2 = ${f(Q1.value)} ms. C'est le bord gauche de la boîte : un quart des mesures se trouve en dessous.`
        : `For p = 0.25, np = ${n * 0.25} is an integer: Q1 = (${x(5)} + ${x(6)}) / 2 = (${DATA[4]} + ${DATA[5]}) / 2 = ${f(Q1.value)} ms. This is the left edge of the box: a quarter of the measurements lie below it.`,
      ranks: Q1.ranks,
    },
    {
      id: "q3",
      title: fr ? "Troisième quartile (Q3)" : "Third quartile (Q3)",
      desc: fr
        ? `Pour p = 0,75, np = ${n * 0.75} est entier : Q3 = (${x(15)} + ${x(16)}) / 2 = (${DATA[14]} + ${DATA[15]}) / 2 = ${f(Q3.value)} ms. C'est le bord droit de la boîte : trois quarts des mesures se trouvent en dessous.`
        : `For p = 0.75, np = ${n * 0.75} is an integer: Q3 = (${x(15)} + ${x(16)}) / 2 = (${DATA[14]} + ${DATA[15]}) / 2 = ${f(Q3.value)} ms. This is the right edge of the box: three quarters of the measurements lie below it.`,
      ranks: Q3.ranks,
    },
    {
      id: "iqr",
      title: fr ? "Écart interquartile (IQR)" : "Interquartile range (IQR)",
      desc: fr
        ? `La largeur de la boîte est IQR = Q3 − Q1 = ${f(Q3.value)} − ${f(Q1.value)} = ${f(iqr)} ms. La boîte contient la moitié centrale des mesures (en surbrillance) : ${ranksWhere((v) => v > Q1.value && v < Q3.value).length} sur ${n}.`
        : `The width of the box is IQR = Q3 − Q1 = ${f(Q3.value)} − ${f(Q1.value)} = ${f(iqr)} ms. The box holds the middle half of the measurements (highlighted): ${ranksWhere((v) => v > Q1.value && v < Q3.value).length} out of ${n}.`,
      ranks: ranksWhere((v) => v > Q1.value && v < Q3.value),
    },
    {
      id: "fences",
      title: fr ? "Barrières de Tukey" : "Tukey's fences",
      desc: fr
        ? `Barrière basse : Q1 − 1,5 × IQR = ${f(Q1.value)} − ${f(1.5 * iqr)} = ${f(lowFence)} ms. Barrière haute : Q3 + 1,5 × IQR = ${f(Q3.value)} + ${f(1.5 * iqr)} = ${f(highFence)} ms. Elles ne font pas partie du dessin final, mais elles décident de la longueur des moustaches et des valeurs aberrantes.`
        : `Lower fence: Q1 − 1.5 × IQR = ${f(Q1.value)} − ${f(1.5 * iqr)} = ${f(lowFence)} ms. Upper fence: Q3 + 1.5 × IQR = ${f(Q3.value)} + ${f(1.5 * iqr)} = ${f(highFence)} ms. They are not part of the final drawing, but they decide the length of the whiskers and which values are outliers.`,
      ranks: [],
    },
    {
      id: "whiskers",
      title: fr ? "Moustaches" : "Whiskers",
      desc: fr
        ? `Chaque moustache s'arrête sur la mesure la plus éloignée qui reste entre les barrières : ${whiskerLow} ms à gauche, ${whiskerHigh} ms à droite. Une moustache ne mesure donc pas 1,5 × IQR : ici, celle de gauche s'arrête bien avant la barrière, faute de mesure plus basse.`
        : `Each whisker stops at the most extreme measurement that is still between the fences: ${whiskerLow} ms on the left, ${whiskerHigh} ms on the right. So a whisker is not 1.5 × IQR long: here the left one stops well before the fence because there is no lower measurement.`,
      ranks: ranksWhere((v) => v === whiskerLow || v === whiskerHigh),
    },
    {
      id: "outliers",
      title: fr ? "Valeurs aberrantes" : "Outliers",
      desc: fr
        ? `Les mesures au-delà des barrières (${list(outliers, " et ")}) sont dessinées une à une. La règle les signale, elle ne les supprime pas : il faut encore savoir s'il s'agit d'une erreur de mesure ou d'un vrai comportement rare.`
        : `The measurements beyond the fences (${list(outliers, " and ")}) are drawn one by one. The rule flags them, it does not remove them: you still need to find out whether they are measurement errors or genuinely rare behavior.`,
      ranks: ranksWhere(isOutlier),
    },
    {
      id: "mean",
      title: fr ? "Moyenne" : "Mean",
      desc: fr
        ? `Le losange est la moyenne : ${DATA.reduce((a, b) => a + b, 0)} / ${n} = ${f(mean)} ms. Elle ne fait pas partie de la boîte à moustaches classique, mais on l'ajoute souvent. Ici, elle dépasse la médiane (${f(Q2.value)} ms), tirée vers la droite par les deux valeurs aberrantes : c'est le signe d'une asymétrie positive.`
        : `The diamond is the mean: ${DATA.reduce((a, b) => a + b, 0)} / ${n} = ${f(mean)} ms. It is not part of the classic box plot, but it is often added. Here it is above the median (${f(Q2.value)} ms), pulled to the right by the two outliers: a sign of positive skew.`,
      ranks: [],
    },
  ];
}

const LABELS = {
  fr: {
    previous: "Étape précédente",
    next: "Étape suivante",
    axis: "Temps de réponse (ms)",
    sorted: "Mesures triées",
    whisker: "moustache",
    outliers: "valeurs aberrantes",
    mean: "moyenne",
    caption: (f) =>
      `Figure ${f} : Boîte à moustaches de ${n} temps de réponse d'un serveur (données fictives), construite pas à pas. Les quartiles suivent la définition des quantiles empiriques donnée plus haut ; un logiciel qui interpole (NumPy, Excel) peut donner des valeurs légèrement différentes.`,
  },
  en: {
    previous: "Previous step",
    next: "Next step",
    axis: "Response time (ms)",
    sorted: "Sorted measurements",
    whisker: "whisker",
    outliers: "outliers",
    mean: "mean",
    caption: (f) =>
      `Figure ${f}: Box plot of ${n} server response times (made-up data), built step by step. The quartiles follow the definition of empirical quantiles given above; software that interpolates (NumPy, Excel) may give slightly different values.`,
  },
};

// Chart geometry (SVG user units)
const W = 600, H = 272, L = 20, R = 20;
const X_MIN = 0, X_MAX = 90;
const sx = (v) => L + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - L - R);
const DOT_R = 4.5;
const DOTS_BASE = 62; // centre of the lowest row of dots
const BOX_Y = 140, BOX_H = 40, AXIS_Y = 222;

// Dot plot: each dot goes on the lowest row where it does not touch a dot already placed
const dots = [];
DATA.forEach((v, i) => {
  let level = 0;
  while (dots.some((d) => d.level === level && Math.abs(sx(d.v) - sx(v)) < 2 * DOT_R + 1)) level++;
  dots.push({ v, rank: i + 1, level, y: DOTS_BASE - level * (2 * DOT_R + 1) });
});

export default function BoxPlotExplorer({ lang = "fr", figure = 4 }) {
  const [step, setStep] = useState(0);
  const all = steps(lang);
  const t = LABELS[lang] ?? LABELS.fr;
  const { id, title, desc, ranks } = all[step];

  const overview = id === "overview";
  // Which parts of the box plot exist at this step (it is assembled progressively)
  const order = ["overview", "median", "q1", "q3", "iqr", "fences", "whiskers", "outliers", "mean"];
  const reached = (part) => overview || order.indexOf(id) >= order.indexOf(part);
  const focus = (...parts) => parts.includes(id);
  const stroke = (...parts) => (focus(...parts) ? "var(--accent)" : "var(--fg-muted)");

  const top = BOX_Y - BOX_H / 2;
  const bottom = BOX_Y + BOX_H / 2;
  const fencesShown = id === "fences" || id === "whiskers" || id === "outliers";

  return (
    <figure className="fig not-prose">
      <div className="fig-panel">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${desc}`}>
          {/* Fences (construction lines) */}
          {fencesShown &&
            [lowFence, highFence].map((v) => (
              <g>
                <line x1={sx(v)} x2={sx(v)} y1={18} y2={AXIS_Y} stroke="var(--fig-mode)" stroke-width="1.5" stroke-dasharray="4 4" />
                <text x={sx(v)} y={11} font-size="12" text-anchor="middle" style={{ fill: "var(--fig-mode)" }}>
                  {fmt(v, lang, 1)}
                </text>
              </g>
            ))}

          {/* Raw measurements */}
          {dots.map((d) => (
            <circle
              cx={sx(d.v)}
              cy={d.y}
              r={DOT_R}
              fill={ranks.includes(d.rank) ? "var(--accent)" : "var(--fg-subtle)"}
              fill-opacity={ranks.length && !ranks.includes(d.rank) ? 0.35 : 0.9}
            />
          ))}

          {/* Box */}
          {reached("iqr") && (
            <rect
              x={sx(Q1.value)}
              y={top}
              width={sx(Q3.value) - sx(Q1.value)}
              height={BOX_H}
              fill="var(--accent)"
              fill-opacity={focus("iqr") ? 0.2 : 0.07}
              stroke={stroke("iqr")}
              stroke-width="2"
            />
          )}
          {reached("q1") && (
            <line x1={sx(Q1.value)} x2={sx(Q1.value)} y1={top} y2={bottom} stroke={stroke("q1", "iqr")} stroke-width="2" />
          )}
          {reached("q3") && (
            <line x1={sx(Q3.value)} x2={sx(Q3.value)} y1={top} y2={bottom} stroke={stroke("q3", "iqr")} stroke-width="2" />
          )}
          <line x1={sx(Q2.value)} x2={sx(Q2.value)} y1={top} y2={bottom} stroke={stroke("median")} stroke-width="3" />

          {/* Whiskers with end caps */}
          {reached("whiskers") && (
            <g stroke={stroke("whiskers")} stroke-width="2">
              <line x1={sx(whiskerLow)} x2={sx(Q1.value)} y1={BOX_Y} y2={BOX_Y} />
              <line x1={sx(Q3.value)} x2={sx(whiskerHigh)} y1={BOX_Y} y2={BOX_Y} />
              <line x1={sx(whiskerLow)} x2={sx(whiskerLow)} y1={BOX_Y - 10} y2={BOX_Y + 10} />
              <line x1={sx(whiskerHigh)} x2={sx(whiskerHigh)} y1={BOX_Y - 10} y2={BOX_Y + 10} />
            </g>
          )}

          {/* Outliers */}
          {reached("outliers") &&
            outliers.map((v) => (
              <circle cx={sx(v)} cy={BOX_Y} r="5" fill="none" stroke={stroke("outliers")} stroke-width="2" />
            ))}

          {/* Mean */}
          {reached("mean") && (
            <path d={`M${sx(mean)},${BOX_Y - 6}l6,6l-6,6l-6,-6z`} fill={stroke("mean")} />
          )}

          {/* Labels above the box */}
          <g font-size="13" text-anchor="middle">
            {reached("q1") && <text x={sx(Q1.value)} y={top - 8}>Q1</text>}
            <text x={sx(Q2.value)} y={top - 8}>Q2</text>
            {reached("q3") && <text x={sx(Q3.value)} y={top - 8}>Q3</text>}
          </g>

          {/* Labels below the box, only on the overview */}
          {overview && (
            <g font-size="12" text-anchor="middle">
              <text x={(sx(whiskerLow) + sx(Q1.value)) / 2} y={bottom + 18}>{t.whisker}</text>
              <line x1={sx(mean)} x2={sx(mean)} y1={BOX_Y + 9} y2={bottom + 24} stroke="var(--fg-subtle)" stroke-width="1" />
              <text x={(sx(Q3.value) + sx(whiskerHigh)) / 2} y={bottom + 18}>{t.whisker}</text>
              <text x={sx(mean)} y={bottom + 38}>{t.mean}</text>
              <text x={(sx(outliers[0]) + sx(outliers[outliers.length - 1])) / 2} y={bottom + 18}>{t.outliers}</text>
            </g>
          )}

          {/* Axis */}
          <line className="axis" x1={L} x2={W - R} y1={AXIS_Y} y2={AXIS_Y} />
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
            <g>
              <line className="axis" x1={sx(v)} x2={sx(v)} y1={AXIS_Y} y2={AXIS_Y + 5} />
              <text x={sx(v)} y={AXIS_Y + 19} font-size="13" text-anchor="middle">{v}</text>
            </g>
          ))}
          <text x={W / 2} y={H - 2} font-size="13" text-anchor="middle">{t.axis}</text>
        </svg>

        {/* The sorted sample, with the ranks used at this step */}
        <div style={{ marginTop: "0.75rem", fontSize: "0.8125rem" }}>
          <span className="fig-label" style={{ marginRight: "0.5rem" }}>{t.sorted}</span>
          <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.25rem", verticalAlign: "middle" }}>
            {DATA.map((v, i) => {
              const on = ranks.includes(i + 1);
              return (
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    padding: "0 0.3rem",
                    borderRadius: "0.25rem",
                    border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                    color: on ? "var(--accent)" : "var(--fg-muted)",
                    fontWeight: on ? 600 : 400,
                  }}
                >
                  {v}
                  <sub style={{ fontSize: "0.65em", marginLeft: "1px", opacity: 0.7 }}>{i + 1}</sub>
                </span>
              );
            })}
          </span>
        </div>

        <div className="fig-note">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <strong>{title}</strong>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexShrink: 0 }}>
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
                {step + 1}/{all.length}
              </span>
              <button
                type="button"
                className="fig-chip"
                onClick={() => setStep((s) => Math.min(all.length - 1, s + 1))}
                aria-label={t.next}
                disabled={step === all.length - 1}
                style={{ opacity: step === all.length - 1 ? 0.4 : 1 }}
              >
                →
              </button>
            </div>
          </div>
          <p style={{ marginTop: "0.5rem", minHeight: "6em" }}>{desc}</p>
        </div>
      </div>
      <figcaption>{t.caption(figure)}</figcaption>
    </figure>
  );
}

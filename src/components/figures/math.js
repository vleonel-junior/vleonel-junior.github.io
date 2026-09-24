// Small numeric helpers shared by the statistics figures.

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
];

/** Natural log of the gamma function (Lanczos approximation). */
export function lgamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

export const gamma = (x) => Math.exp(lgamma(x));

export const normalPdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

export function linspace(a, b, n) {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
}

/** Value x such that the area under f on [xs[0], x] equals p (trapezoidal rule). */
export function quantileOf(xs, ys, p) {
  let total = 0;
  for (let i = 1; i < xs.length; i++) total += ((ys[i] + ys[i - 1]) / 2) * (xs[i] - xs[i - 1]);
  let acc = 0;
  for (let i = 1; i < xs.length; i++) {
    const step = ((ys[i] + ys[i - 1]) / 2) * (xs[i] - xs[i - 1]);
    if (acc + step >= p * total) return xs[i - 1] + ((p * total - acc) / step) * (xs[i] - xs[i - 1]);
    acc += step;
  }
  return xs[xs.length - 1];
}

/** Area under f outside [-t, t]. */
export function tailMass(xs, ys, t) {
  let mass = 0;
  for (let i = 1; i < xs.length; i++) {
    const mid = (xs[i] + xs[i - 1]) / 2;
    if (Math.abs(mid) > t) mass += ((ys[i] + ys[i - 1]) / 2) * (xs[i] - xs[i - 1]);
  }
  return mass;
}

/** SVG path through the points (x, y) given in data units. */
export function linePath(xs, ys, sx, sy) {
  return xs.map((x, i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(ys[i]).toFixed(1)}`).join("");
}

/** Number formatting that follows the reader's language (decimal comma in French). */
export const fmt = (value, lang, digits = 2) =>
  value.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

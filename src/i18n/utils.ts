import { defaultLang, languages, ui, type Lang, type UiKey } from "./ui";

export { defaultLang, languages, type Lang };

/** A piece of text that is either language-neutral or given per language. */
export type Text = string | Record<Lang, string>;

export function isLang(value: unknown): value is Lang {
    return typeof value === "string" && value in languages;
}

/** Language of a page, read from its URL (/fr/... → fr, anything else → en). */
export function getLangFromUrl(url: URL): Lang {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const [, first] = url.pathname.slice(base.length).split("/");
    return isLang(first) ? first : defaultLang;
}

export function useTranslations(lang: Lang) {
    return (key: UiKey, vars?: Record<string, string | number>) => {
        let str: string = ui[lang][key] ?? ui[defaultLang][key];
        if (vars) {
            for (const [k, v] of Object.entries(vars)) {
                str = str.replace(`{${k}}`, String(v));
            }
        }
        return str;
    };
}

/** Resolve a Text value for the given language. */
export function tr(value: Text, lang: Lang): string {
    return typeof value === "string" ? value : value[lang];
}

/**
 * Build a site URL for `path` (written without base or locale, e.g. "/projects")
 * in the given language. Only locale-aware pages should go through this;
 * articles have a single URL and use `withBase` instead.
 */
export function localizePath(path: string, lang: Lang): string {
    const clean = path.replace(/^\//, "");
    const prefix = lang === defaultLang ? "" : `${lang}/`;
    return `${import.meta.env.BASE_URL}${prefix}${clean}`;
}

/** Prefix a root-relative asset or page path with the site base. */
export function withBase(path: string): string {
    return path.startsWith("/")
        ? `${import.meta.env.BASE_URL}${path.slice(1)}`
        : path;
}

/** Path of the current page, stripped of base and locale prefix. */
export function getRoutePath(url: URL): string {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    let path = url.pathname.slice(base.length);
    const lang = getLangFromUrl(url);
    if (lang !== defaultLang) path = path.slice(lang.length + 1);
    return path || "/";
}

// French labels for generic skill tags. Tool and product names (Python,
// XGBoost, NLP...) are the same in both languages and are left out.
const tagsFr: Record<string, string> = {
    "Automation": "Automatisation",
    "Data Analysis": "Analyse de données",
    "Data Conception": "Conception de données",
    "First-order logic": "Logique du premier ordre",
    "Fraud Detection": "Détection de fraude",
    "Linear Programming": "Programmation linéaire",
    "Mathematics": "Mathématiques",
    "Neuro-symbolic AI": "IA neuro-symbolique",
    "Optimization": "Optimisation",
    "PDE": "EDP",
    "Software Design": "Conception logicielle",
    "Statistics": "Statistiques",
    "Web Development": "Développement web",
};

export function tag(name: string, lang: Lang): string {
    return lang === "fr" ? (tagsFr[name] ?? name) : name;
}

/** "2024 - 2025", or a single value when start and end are the same. */
export function period(start: Text, end: Text, lang: Lang): string {
    const a = tr(start, lang);
    const b = tr(end, lang);
    return a === b ? a : `${a} - ${b}`;
}

export function formatDate(date: Date, lang: Lang, month: "short" | "long" = "long") {
    return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
        year: "numeric",
        month,
        day: "numeric",
    });
}

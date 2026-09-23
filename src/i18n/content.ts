// Language versions of blog articles and reading-notes chapters.
//
// An article is written once per language: blog/en/<slug>.md and
// blog/fr/<slug>.md are the two versions of the same article. A chapter is
// identified by its series and chapter number. When a version is missing, the
// listings of that language fall back to the version that exists.

import { getCollection, type CollectionEntry } from "astro:content";
import { getDossierBySlug } from "../data/dossiers";
import { languages, localizePath, type Lang } from "./utils";

export type Post = CollectionEntry<"blog">;
export type Chapter = CollectionEntry<"dossiers">;

const langs = Object.keys(languages) as Lang[];

/**
 * Thumbnail for listings: the cover set in frontmatter, otherwise the first
 * image used in the text (Markdown image or <img> tag).
 */
export function thumbnail(entry: Post | Chapter): string | undefined {
    const cover = "image" in entry.data ? entry.data.image : undefined;
    if (cover) return cover;
    const match =
        entry.body.match(/!\[[^\]]*\]\((\/[^)\s]+)\)/) ??
        entry.body.match(/<img[^>]+src="(\/[^"]+)"/);
    return match?.[1];
}

/** Slug shared by every language version of an article: "fr/foo" → "foo". */
export function postSlug(post: Post): string {
    return post.slug.replace(/^(en|fr)\//, "");
}

export function postUrl(post: Post): string {
    return localizePath(`blog/${postSlug(post)}/`, post.data.lang);
}

/** URL segment of a chapter, taken from the series metadata. */
export function chapterSlug(chapter: Chapter): string {
    const meta = getDossierBySlug(chapter.data.dossier)?.chapters.find(
        (c) => c.number === chapter.data.chapter,
    );
    return meta?.slug ?? `chapitre-${chapter.data.chapter}`;
}

export function chapterKey(chapter: Chapter): string {
    return `${chapter.data.dossier}/${chapterSlug(chapter)}`;
}

export function chapterUrl(chapter: Chapter): string {
    return localizePath(`blog/dossier/${chapterKey(chapter)}/`, chapter.data.lang);
}

/** Group entries by article, indexed by language. */
function groupVersions<T extends { data: { lang: Lang } }>(
    entries: T[],
    key: (entry: T) => string,
): Map<string, Partial<Record<Lang, T>>> {
    const groups = new Map<string, Partial<Record<Lang, T>>>();
    for (const entry of entries) {
        const k = key(entry);
        const group = groups.get(k) ?? {};
        group[entry.data.lang] = entry;
        groups.set(k, group);
    }
    return groups;
}

/** The version in `lang` when it exists, otherwise any other version. */
function preferred<T>(group: Partial<Record<Lang, T>>, lang: Lang): T {
    return (group[lang] ?? langs.map((l) => group[l]).find(Boolean)) as T;
}

export async function getPosts(): Promise<Post[]> {
    return (await getCollection("blog")).filter((p) => !p.data.draft);
}

export async function getChapters(): Promise<Chapter[]> {
    return (await getCollection("dossiers")).filter((c) => !c.data.draft);
}

/** One entry per article, in `lang` when available. Newest first. */
export async function postsFor(lang: Lang): Promise<Post[]> {
    const groups = groupVersions(await getPosts(), postSlug);
    return [...groups.values()]
        .map((g) => preferred(g, lang))
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** One entry per chapter of a series, in `lang` when available, in order. */
export async function chaptersFor(dossier: string, lang: Lang): Promise<Chapter[]> {
    const chapters = (await getChapters()).filter((c) => c.data.dossier === dossier);
    const groups = groupVersions(chapters, chapterKey);
    return [...groups.values()]
        .map((g) => preferred(g, lang))
        .sort((a, b) => a.data.chapter - b.data.chapter);
}

/**
 * Static paths for one language of an article route. Articles written in
 * that language are rendered; the others get a page that redirects to the
 * version that exists, so a URL never breaks while a translation is pending.
 */
async function localizedPaths<T extends { data: { lang: Lang } }>(
    entries: T[],
    key: (entry: T) => string,
    url: (entry: T) => string,
    lang: Lang,
) {
    const groups = groupVersions(entries, key);
    return [...groups.entries()].map(([k, group]) => {
        const entry = group[lang];
        const fallback = preferred(group, lang);
        return {
            params: { slug: k },
            props: {
                entry,
                redirectTo: entry ? undefined : url(fallback),
                // Where the language switch leads: the translation when it
                // exists, otherwise the blog index of that language.
                langPaths: Object.fromEntries(
                    langs.map((l) => [
                        l,
                        group[l] ? url(group[l]!) : localizePath("blog", l),
                    ]),
                ) as Record<Lang, string>,
                translated: langs.every((l) => group[l]),
            },
        };
    });
}

export async function postPaths(lang: Lang) {
    return localizedPaths(await getPosts(), postSlug, postUrl, lang);
}

export async function chapterPaths(lang: Lang) {
    const paths = await localizedPaths(await getChapters(), chapterKey, chapterUrl, lang);
    // The route is /blog/dossier/[dossier]/[slug]
    return paths.map((p) => {
        const [dossier, slug] = p.params.slug.split("/");
        return { ...p, params: { dossier, slug } };
    });
}

# Léonel Vodounou, personal website

Source of [vleonel-junior.github.io](https://vleonel-junior.github.io/): my
academic profile, projects, and a blog of notes on machine learning, large
language models and the mathematics behind them. The site is bilingual,
English at `/` and French under `/fr/`.

## Contents

- **Profile**: education, experience, publications, projects,
  certifications, community involvement, and a downloadable CV.
- **Articles**: standalone posts, such as a guide to descriptive statistics
  with interactive figures.
- **Reading notes**: chapter-by-chapter notes on
  *Build a Large Language Model (From Scratch)* by Sebastian Raschka.
- **Article series**: a five-part series on Logic Tensor Networks, from
  grounding symbols in tensors to a semi-supervised MNIST case study.

## Stack

- [Astro](https://astro.build/) 5, static site generation, with MDX content
  collections
- [Tailwind CSS](https://tailwindcss.com/) 4 and its typography plugin
- [KaTeX](https://katex.org/), through `remark-math` and `rehype-katex`, for
  formulas
- [Preact](https://preactjs.com/) for the interactive figures
- [Supabase](https://supabase.com/) for article comments, and
  [Buttondown](https://buttondown.com/) for the newsletter

## Getting started

Requires Node.js 18 or later.

```bash
npm install
npm run dev        # development server on http://localhost:4321
npm run build      # production build in dist/
npm run preview    # serve the production build
```

Comments need a Supabase project. Set these variables in a `.env` file at the
root; without them the site builds and runs, with comments disabled:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

## Project structure

```
src/
├── components/     article layout, table of contents, comments, figures
├── content/
│   ├── blog/       articles, one file per language in en/ and fr/
│   └── dossiers/   reading notes and series, one folder per dossier
├── data/           profile content: education, experience, projects, ...
├── i18n/           interface strings and language helpers
├── layouts/        base HTML layout
├── pages/          routes, English at the root and French under fr/
├── styles/         global styles and theme tokens
└── views/          page templates shared by both languages
public/             images, documents and the CV
cv/                 LaTeX source of the CV
```

## Writing content

### Articles

An article is written once per language, under the same file name:
`src/content/blog/en/<slug>.mdx` and `src/content/blog/fr/<slug>.mdx`. If a
translation is missing, the other language falls back to the existing version.

```yaml
---
title: "Descriptive statistics"
description: "One or two sentences shown in listings and link previews."
pubDate: 2026-03-26
author: "Léonel VODOUNOU"
category: "Foundations"
tags: ["Statistics", "Machine Learning"]
lang: "en"
---
```

Optional fields: `image` (cover for listings), `readTime` (minutes, otherwise
estimated) and `draft: true` to keep an article out of the site.

### Reading notes and series

A dossier groups chapters in `src/content/dossiers/<dossier>/en/` and
`fr/`. Its title, description, chapter list and source notice are declared in
`src/data/dossiers.ts`, with `kind: "reading-notes"` for notes on a book or
`kind: "series"` for a series of my own articles. Each chapter file sets
`dossier`, `chapter` and `order` in its frontmatter, along with the article
fields above.

### Formulas and figures

Inline formulas use `$...$`. Display formulas put the `$$` delimiters on their
own lines:

```
$$
\mathcal{G}(x) \in \mathbb{R}^{n}
$$
```

A `$$...$$` written on a single line is rendered as an inline formula. Images
in articles open full screen on click.

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages through
the workflow in `.github/workflows/`. The Supabase variables are read from the
repository secrets.

## Contact

- Email: [vleoneljunior@gmail.com](mailto:vleoneljunior@gmail.com)
- LinkedIn: [Léonel Junior Sêdjro VODOUNOU](https://www.linkedin.com/in/leonel-vodounou)
- X: [@leonelvodounou](https://x.com/leonelvodounou)
- GitHub: [vleonel-junior](https://github.com/vleonel-junior)

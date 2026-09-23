// @ts-check
// Deployment trigger: FINAL FIX for subpath images and links (/Portfolio-main/)
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://vleonel-junior.github.io',
  // English at /, French under /fr/ (see src/i18n)
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    // Both themes are emitted as CSS variables; global.css picks the one
    // matching the current light/dark mode.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
  integrations: [mdx(), sitemap(), preact()]
});
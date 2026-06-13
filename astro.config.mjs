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
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [mdx({
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }), sitemap(), preact()]
});
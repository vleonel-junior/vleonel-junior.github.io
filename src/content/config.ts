import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        author: z.string().default('Votre Nom'),
        image: z.string().optional(),
        tags: z.array(z.string()).default([]),
        category: z.string(),
        readTime: z.number().optional(),
        draft: z.boolean().default(false),
    }),
});

const dossiers = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        author: z.string().default('Léonel VODOUNOU'),
        dossier: z.string(),
        chapter: z.number(),
        order: z.number(),
        tags: z.array(z.string()).default([]),
        readTime: z.number().optional(),
        draft: z.boolean().default(false),
        showToc: z.boolean().default(true),
    }),
});

export const collections = {
    blog,
    dossiers,
};

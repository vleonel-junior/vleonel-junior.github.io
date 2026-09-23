import type { Text } from "../i18n/utils";

export interface DossierMeta {
    slug: string;
    title: string;
    bookAuthor: string;
    description: Text;
    cover: string;
    totalChapters: number;
    tags: string[];
    chapters: {
        number: number;
        title: Text;
        /** URL segment, shared by every language version of the chapter */
        slug: string;
    }[];
}

export const dossiers: DossierMeta[] = [
    {
        slug: "build-llm-from-scratch",
        title: "Build a Large Language Model (from Scratch)",
        bookAuthor: "Sebastian Raschka",
        description: {
            en: "Chapter-by-chapter reading notes on Sebastian Raschka's book. A complete path to understanding and building an LLM from the ground up.",
            fr: "Notes de lecture chapitre par chapitre du livre de Sebastian Raschka. Un parcours complet pour comprendre et construire un LLM depuis zéro.",
        },
        cover: "/images/dossiers/build-llm-from-scratch/cover.jpg",
        totalChapters: 7,
        tags: ["LLM", "Deep Learning", "NLP", "Transformers"],
        chapters: [
            {
                number: 0,
                title: { en: "Introduction to PyTorch", fr: "Introduction à PyTorch" },
                slug: "chapitre-0",
            },
            {
                number: 1,
                title: {
                    en: "Understanding large language models",
                    fr: "Comprendre les grands modèles de langage",
                },
                slug: "chapitre-1-comprendre-les-llm",
            },
            {
                number: 2,
                title: {
                    en: "Working with text data",
                    fr: "Travailler avec des données textuelles",
                },
                slug: "chapitre-2-working-with-text-data",
            },
            {
                number: 3,
                title: {
                    en: "Coding attention mechanisms",
                    fr: "Coder les mécanismes d'attention",
                },
                slug: "chapitre-3-mecanismes-attention",
            },
            {
                number: 4,
                title: {
                    en: "Implementing a GPT model from scratch",
                    fr: "Implémenter un modèle GPT",
                },
                slug: "chapitre-4-implementer-gpt",
            },
            {
                number: 5,
                title: {
                    en: "Pretraining on unlabeled data",
                    fr: "Préentraîner sur des données non étiquetées",
                },
                slug: "chapitre-5-preentrainement",
            },
            {
                number: 6,
                title: {
                    en: "Fine-tuning for classification and instruction following",
                    fr: "Affinage pour la classification et le suivi d'instructions",
                },
                slug: "chapitre-6-affinage",
            },
        ],
    },
];

export function getDossierBySlug(slug: string): DossierMeta | undefined {
    return dossiers.find((d) => d.slug === slug);
}

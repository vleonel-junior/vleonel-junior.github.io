import type { Text } from "../i18n/utils";

export interface DossierMeta {
    slug: string;
    /** Notes on someone else's book, or a series of my own articles */
    kind: "reading-notes" | "series";
    title: string;
    /** Reading notes only */
    bookAuthor?: string;
    /** Series only: the repository holding the code the articles walk through */
    repoUrl?: string;
    description: Text;
    /** Short HTML notice shown above each chapter (source and rights) */
    notice: Text;
    cover?: string;
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
        kind: "reading-notes",
        title: "Build a Large Language Model (from Scratch)",
        bookAuthor: "Sebastian Raschka",
        description: {
            en: "Chapter-by-chapter reading notes on Sebastian Raschka's book. A complete path to understanding and building an LLM from the ground up.",
            fr: "Notes de lecture chapitre par chapitre du livre de Sebastian Raschka. Un parcours complet pour comprendre et construire un LLM depuis zéro.",
        },
        notice: {
            en: 'These are personal, unofficial reading notes, not affiliated with Sebastian Raschka or Manning. Numbered figures are reproduced from <em>Build a Large Language Model (From Scratch)</em> (S. Raschka, Manning, 2024) with their source cited; all rights to them belong to their authors. Code builds on the <a href="https://github.com/rasbt/LLMs-from-scratch">book’s official repository</a> (Apache 2.0 license). For the full text, <a href="https://www.manning.com/books/build-a-large-language-model-from-scratch">get the book</a>.',
            fr: 'Ces notes de lecture sont personnelles et non officielles : elles ne sont affiliées ni à Sebastian Raschka ni à Manning. Les figures numérotées sont reproduites du livre <em>Build a Large Language Model (From Scratch)</em> (S. Raschka, Manning, 2024), avec citation de leur source ; tous les droits sur ces figures appartiennent à leurs auteurs. Le code s’appuie sur le <a href="https://github.com/rasbt/LLMs-from-scratch">dépôt officiel du livre</a> (licence Apache 2.0). Pour le texte complet, <a href="https://www.manning.com/books/build-a-large-language-model-from-scratch">procurez-vous le livre</a>.',
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
    {
        slug: "logic-tensor-networks",
        kind: "series",
        title: "Logic Tensor Networks",
        repoUrl: "https://github.com/vleonel-junior/logic-tensor-networks",
        cover: "/images/dossiers/logic-tensor-networks/cover.png",
        description: {
            en: "A step-by-step series on Logic Tensor Networks, a neuro-symbolic framework where first-order logic becomes a differentiable loss: from grounding symbols as tensors to learning by satisfying a knowledge base.",
            fr: "Une série pas à pas sur les Logic Tensor Networks, un framework neuro-symbolique où la logique du premier ordre devient une fonction de perte différentiable : de l'ancrage des symboles dans des tenseurs à l'apprentissage par satisfaction d'une base de connaissances.",
        },
        notice: {
            en: 'This series follows the progression of the <a href="https://github.com/logictensornetworks/LTNtorch">LTNtorch</a> tutorials (T. Carraro, MIT license). Code snippets come from the library’s tutorials. Figures credited to Badreddine et al. (2022) are reproduced from the original article, <a href="https://arxiv.org/abs/2012.13635"><em>Logic Tensor Networks</em></a>, under the CC BY 4.0 license. Each part has a runnable notebook in <a href="https://github.com/vleonel-junior/logic-tensor-networks">my repository</a>.',
            fr: 'Cette série suit la progression des tutoriels de <a href="https://github.com/logictensornetworks/LTNtorch">LTNtorch</a> (T. Carraro, licence MIT). Les extraits de code proviennent des tutoriels de la bibliothèque. Les figures créditées à Badreddine et al. (2022) sont reproduites de l’article original, <a href="https://arxiv.org/abs/2012.13635"><em>Logic Tensor Networks</em></a>, sous licence CC BY 4.0. Chaque partie a son notebook exécutable dans <a href="https://github.com/vleonel-junior/logic-tensor-networks">mon dépôt</a>.',
        },
        totalChapters: 4,
        tags: ["Neuro-symbolic AI", "Logic", "PyTorch"],
        chapters: [
            {
                number: 1,
                title: {
                    en: "Grounding: from symbols to tensors",
                    fr: "Le grounding : des symboles aux tenseurs",
                },
                slug: "partie-1-grounding",
            },
            {
                number: 2,
                title: {
                    en: "Connectives and quantifiers",
                    fr: "Connecteurs et quantificateurs",
                },
                slug: "partie-2-connecteurs-quantificateurs",
            },
            {
                number: 3,
                title: {
                    en: "Operators and their gradients",
                    fr: "Les opérateurs et leurs gradients",
                },
                slug: "partie-3-gradients",
            },
            {
                number: 4,
                title: {
                    en: "Learning by satisfying a knowledge base",
                    fr: "Apprendre en satisfaisant une base de connaissances",
                },
                slug: "partie-4-apprentissage",
            },
        ],
    },
];

export function getDossierBySlug(slug: string): DossierMeta | undefined {
    return dossiers.find((d) => d.slug === slug);
}

export interface DossierMeta {
    slug: string;
    title: string;
    bookAuthor: string;
    description: string;
    cover: string;
    totalChapters: number;
    tags: string[];
    chapters: {
        number: number;
        title: string;
        slug: string;
    }[];
}

export const dossiers: DossierMeta[] = [
    {
        slug: "build-llm-from-scratch",
        title: "Build a Large Language Model (from Scratch)",
        bookAuthor: "Sebastian Raschka",
        description:
            "Notes de lecture chapitre par chapitre du livre de Sebastian Raschka. Un parcours complet pour comprendre et construire un LLM depuis zéro.",
        cover: "/images/dossiers/build-llm-from-scratch/cover.jpg",
        totalChapters: 7,
        tags: ["LLM", "Deep Learning", "NLP", "Transformers"],
        chapters: [
            {
                number: 0,
                title: "Introduction à PyTorch",
                slug: "chapitre-0",
            },
            {
                number: 1,
                title: "Comprendre les grands modèles de langage",
                slug: "chapitre-1-comprendre-les-llm",
            },
            {
                number: 2,
                title: "Travailler avec des données textuelles",
                slug: "chapitre-2-working-with-text-data",
            },
            {
                number: 3,
                title: "Coder les mécanismes d'attention",
                slug: "chapitre-3-mecanismes-attention",
            },
            {
                number: 4,
                title: "Implémenter un modèle GPT",
                slug: "chapitre-4-implementer-gpt",
            },
            {
                number: 5,
                title: "Préentraîner sur des données non étiquetées",
                slug: "chapitre-5-preentrainement",
            },
            {
                number: 6,
                title: "Affinage pour la classification et le suivi d'instructions",
                slug: "chapitre-6-affinage",
            },
        ],
    },
];

export function getDossierBySlug(slug: string): DossierMeta | undefined {
    return dossiers.find((d) => d.slug === slug);
}

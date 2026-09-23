import type { Text } from "../i18n/utils";

export interface ProjectItem {
    title: Text;
    description: Text;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    image?: string;
    year?: string;
    category?: string;
    featured?: boolean;
}

export const academicProjects: ProjectItem[] = [
    {
        title: {
            en: "Gomory - Cutting Plane Method",
            fr: "Gomory - Méthode des plans sécants",
        },
        description: {
            en: "A pure Python implementation of the Gomory cutting plane method for solving Integer Linear Programming (ILP) problems. Designed for educational purposes, it features exact fractional arithmetic and step-by-step simplex tableaux generation.",
            fr: "Implémentation en Python pur de la méthode des coupes de Gomory pour résoudre des problèmes de programmation linéaire en nombres entiers (PLNE). Conçue dans un but pédagogique, elle utilise une arithmétique fractionnaire exacte et affiche les tableaux du simplexe étape par étape.",
        },
        technologies: ["Python", "Linear Programming", "Optimization"],
        githubUrl: "https://github.com/vleonel-junior/Gomory",
        year: "2025",
        category: "academic"
    },
    {
        title: {
            en: "Black-Scholes Simulation",
            fr: "Simulation de Black-Scholes",
        },
        description: {
            en: "Analytical resolution of the Black-Scholes equation by transforming it into the heat equation. Includes the derivation of the pricing formula and the calculation of the Delta Greek for a European Call option.",
            fr: "Résolution analytique de l'équation de Black-Scholes par transformation en équation de la chaleur. Comprend la dérivation de la formule de prix et le calcul du Delta (grecque) d'une option d'achat européenne.",
        },
        technologies: ["Mathematics", "PDE", "Finance"],
        githubUrl: "https://github.com/vleonel-junior/Black-sholes",
        year: "2025",
        category: "academic"
    }
];

export const personalProjects: ProjectItem[] = [
    {
        title: "Logic Tensor Networks",
        description: {
            en: "A presentation and hands-on case study of Logic Tensor Networks, a neuro-symbolic framework that combines deep learning with first-order logic. Covers how symbols, connectives and quantifiers become differentiable operations, and a semi-supervised MNIST experiment where the network learns to recognize single digits only from the sum of two digits, compared with a purely supervised baseline.",
            fr: "Présentation et étude de cas des Logic Tensor Networks, un framework neuro-symbolique qui combine apprentissage profond et logique du premier ordre. Traduction des symboles, connecteurs et quantificateurs en opérations différentiables, et expérience semi-supervisée sur MNIST où le réseau apprend à reconnaître des chiffres uniquement à partir de la somme de deux chiffres, comparée à une baseline purement supervisée.",
        },
        technologies: ["Neuro-symbolic AI", "PyTorch", "LTNtorch", "First-order logic"],
        githubUrl: "https://github.com/vleonel-junior/logic-tensor-networks",
        year: "2026",
        category: "personal"
    }
];

// For backward compatibility if other pages use it (though we should update them)
export const projectsData: ProjectItem[] = [...academicProjects, ...personalProjects].sort(
    (a, b) => Number(b.year ?? 0) - Number(a.year ?? 0),
);

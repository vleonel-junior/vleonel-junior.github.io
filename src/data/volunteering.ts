import type { Text } from "../i18n/utils";

export interface VolunteeringItem {
    role: Text;
    organization: Text;
    period: string;
    description: Text;
}

export const volunteeringData: VolunteeringItem[] = [
    {
        role: {
            en: "Teaching Assistant (Electricity for Engineers)",
            fr: "Assistant d'enseignement (Électricité pour l'ingénieur)",
        },
        organization: {
            en: "National Higher Institute of Preparatory Classes (INSPEI)",
            fr: "Institut National Supérieur de Classes Préparatoires aux Études d'Ingénieur (INSPEI)",
        },
        period: "2025",
        description: {
            en: "Assisted the professor (Dr.) in the 'Electricity for Engineers' course for 2nd-year Preparatory Class students. Conducted tutorial sessions and helped students master concepts in electromagnetism and circuit analysis.",
            fr: "Assistance du professeur (Dr.) dans le cours « Électricité pour l'ingénieur » destiné aux étudiants de 2e année de classes préparatoires. Animation de travaux dirigés et accompagnement des étudiants sur l'électromagnétisme et l'analyse de circuits.",
        },
    },
    {
        role: {
            en: "Private Tutor in Mathematics",
            fr: "Professeur particulier de mathématiques",
        },
        organization: { en: "Private Instruction", fr: "Cours particuliers" },
        period: "2025",
        description: {
            en: "Provided advanced mathematics tutoring for high school students in the Science Track (Première Scientifique). Focused on strengthening analytical skills, algebra, and exam preparation.",
            fr: "Cours de mathématiques approfondis pour des lycéens de Première scientifique. Accent mis sur le raisonnement, l'algèbre et la préparation aux examens.",
        },
    },
    {
        role: {
            en: "Private Tutor in Sciences (Physics, Chemistry, Technology)",
            fr: "Professeur particulier de sciences (physique, chimie, technologie)",
        },
        organization: { en: "Private Instruction", fr: "Cours particuliers" },
        period: "2023 - 2024",
        description: {
            en: "Delivered academic support and personalized tutoring for high school students (Seconde & Première). Helped improve student performance in Physics, Chemistry, and Technology through targeted exercises and conceptual clarification.",
            fr: "Soutien scolaire personnalisé pour des lycéens de Seconde et de Première. Amélioration des résultats en physique, chimie et technologie grâce à des exercices ciblés et à la clarification des notions.",
        },
    },
];

import type { Text } from "../i18n/utils";

export interface EducationItem {
    degree: Text;
    institution: Text;
    year: string;
    description?: Text;
}

export const educationData: EducationItem[] = [
    {
        degree: {
            en: "Engineering Degree in Mathematical Engineering and Modeling",
            fr: "Diplôme d'ingénieur en génie mathématique et modélisation",
        },
        institution: {
            en: "National Higher School of Mathematical Engineering and Modeling (ENSGMM, UNSTIM, Bénin)",
            fr: "École Nationale Supérieure de Génie Mathématique et Modélisation (ENSGMM, UNSTIM, Bénin)",
        },
        year: "2022 - 2025",
        description: {
            en: "Specialized in random modeling, statistics, and machine learning.",
            fr: "Spécialisation en modélisation aléatoire, statistiques et machine learning.",
        },
    },
    {
        degree: {
            en: "Preparatory Classes for Engineering Studies (MPSI/PCSI)",
            fr: "Classes préparatoires aux études d'ingénieur (MPSI/PCSI)",
        },
        institution: {
            en: "National Higher Institute of Preparatory Classes (INSPEI/ UNSTIM, Bénin)",
            fr: "Institut National Supérieur de Classes Préparatoires aux Études d'Ingénieur (INSPEI / UNSTIM, Bénin)",
        },
        year: "2020 - 2022",
        description: {
            en: "Intensive training in Mathematics, Physics, and Engineering Sciences.",
            fr: "Formation intensive en mathématiques, physique et sciences de l'ingénieur.",
        },
    },
    {
        degree: {
            en: "Scientific Baccalaureate (Mathematics and Physical Sciences)",
            fr: "Baccalauréat scientifique (mathématiques et sciences physiques)",
        },
        institution: {
            en: "Notre Dame de Toutes Grâces College, Cotonou, Benin",
            fr: "Collège Notre Dame de Toutes Grâces, Cotonou, Bénin",
        },
        year: "2020",
        description: {
            en: "High School Diploma with emphasis on Mathematics and Physics.",
            fr: "Baccalauréat à dominante mathématiques et physique.",
        },
    },
];

import type { Text } from "../i18n/utils";

export interface CertificationItem {
    title: Text;
    issuer: string;
    date: string;
    url?: string;
    image?: string; // Path to the image in public/
    description?: Text; // To list key modules
}

export const certificationsData: CertificationItem[] = [
    {
        title: "Data Scientist",
        issuer: "Africa Tech Up Tour / OpenClassrooms",
        date: "2024",
        image: "/images/certifications/ATUT-data-scientist.png",
        description: {
            en: "Specialization acquired through the Africa Tech Up Tour program, including Deep Learning, Time Series Analysis, SQL, NLP, and ML Model Deployment.",
            fr: "Spécialisation obtenue dans le cadre du programme Africa Tech Up Tour : deep learning, analyse de séries temporelles, SQL, NLP et déploiement de modèles de ML.",
        },
    },
    {
        title: "ML Engineer",
        issuer: "iSheero x DataCamp",
        date: "2026",
        image: "/images/certifications/isheero-datacamp.png",
        description: {
            en: "12-month program combining online training, applied projects, and a final hackathon, covering Machine Learning Engineering with DataCamp.",
            fr: "Programme de 12 mois associant formation en ligne, projets appliqués et hackathon final, consacré au Machine Learning Engineering avec DataCamp.",
        },
    },
];

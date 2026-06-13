
export interface CertificationItem {
    title: string;
    issuer: string;
    date: string;
    url?: string;
    image?: string; // Path to the image in public/
    description?: string; // To list key modules
}

export const certificationsData: CertificationItem[] = [
    {
        title: "Data Scientist",
        issuer: "Africa Tech Up Tour / OpenClassrooms",
        date: "2024",
        image: "/images/certifications/ATUT-data-scientist.png",
        description: "Specialization acquired through the Africa Tech Up Tour program, including Deep Learning, Time Series Analysis, SQL, NLP, and ML Model Deployment."
    },
    {
        title: "ML Engineer",
        issuer: "iSheero x DataCamp",
        date: "2026",
        image: "/images/certifications/ATTESTATION iSHEEROxDataCamp 2026-24.png",
        description: "12-month program combining online training, applied projects, and a final hackathon — covering Machine Learning Engineering with DataCamp."
    }
];

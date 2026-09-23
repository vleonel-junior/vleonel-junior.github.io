import type { Text } from "../i18n/utils";

// Events attended and communities joined. Kept apart from certifications:
// these show involvement in the AI ecosystem, not validated skills.
export interface CommunityItem {
    title: Text;
    organization: Text;
    period: Text;
    description: Text;
    /** Proof: certificate, badge or public page */
    proof?: { href: string; label: Text };
}

export const communityData: CommunityItem[] = [
    {
        title: "Deep Learning IndabaX Bénin 2026",
        organization: {
            en: "IndabaX Benin Republic · In-person participant",
            fr: "IndabaX Bénin · Participant en présentiel",
        },
        period: { en: "Sep 2026", fr: "Sept. 2026" },
        description: {
            en: "Took part in person in the three days of the Benin edition of the Deep Learning Indaba, the gathering of the African machine learning community (September 10 to 12, 2026).",
            fr: "Participation en présentiel aux trois jours de l'édition béninoise du Deep Learning Indaba, le rendez-vous de la communauté africaine du machine learning (du 10 au 12 septembre 2026).",
        },
        proof: {
            href: "/documents/indabax-benin-2026-certificat.pdf",
            label: { en: "Certificate of participation", fr: "Certificat de participation" },
        },
    },
    {
        title: { en: "Cohere Labs community member", fr: "Membre de la communauté Cohere Labs" },
        organization: "Cohere Labs · Open Science Initiative",
        period: { en: "2026", fr: "2026" },
        description: {
            en: "Member of Cohere Labs' open science community. I regularly attend the courses and sessions the community organizes on the research topics I work on.",
            fr: "Membre de la communauté open science de Cohere Labs. Je suis régulièrement les cours et sessions organisés par la communauté sur les sujets de recherche qui m'intéressent.",
        },
        proof: {
            href: "/images/community/cohere-labs-community-member.webp",
            label: { en: "Member badge", fr: "Badge de membre" },
        },
    },
];

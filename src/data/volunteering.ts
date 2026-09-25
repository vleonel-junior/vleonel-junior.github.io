import type { Text } from "../i18n/utils";

export interface VolunteeringItem {
    role: Text;
    organization: Text;
    period: Text;
    description: Text;
    /** Public page about the activity */
    url?: string;
    /** Logo banner shown under the date, 480 x 240 */
    banner?: string;
}

export const volunteeringData: VolunteeringItem[] = [
    {
        role: {
            en: "Volunteer trainer: AI for artisans and entrepreneurs",
            fr: "Formateur bénévole : l'IA au service des artisans et entrepreneurs",
        },
        organization: {
            en: "iSHEERO, Sèmè City Open Park (Benin)",
            fr: "iSHEERO, Sèmè City Open Park (Bénin)",
        },
        period: { en: "July 2026", fr: "Juillet 2026" },
        description: {
            en: "Co-led a hands-on introduction to generative AI tools (ChatGPT, Gemini) for about twenty artisans and local entrepreneurs: tailors, electricians, hairdressers, farmers. Use cases were built from the participants' own day-to-day challenges (customer relations, promotional content, work organization), followed by two hours of group practice and a final presentation of the solutions each group designed.",
            fr: "Co-animation d'un atelier d'initiation pratique aux outils d'IA générative (ChatGPT, Gemini) pour une vingtaine d'artisans et d'entrepreneurs locaux : couturiers, électriciens, coiffeurs, agriculteurs. Cas d'usage construits à partir des difficultés concrètes des participants (relation client, contenu promotionnel, organisation du travail), deux heures de pratique en groupes et restitution des solutions imaginées par chaque groupe.",
        },
        url: "https://www.isheero.com/intelligence-artificielle-au-profit-des-artisans-juillet-2026/",
        banner: "/images/community/isheero.png",
    },
];

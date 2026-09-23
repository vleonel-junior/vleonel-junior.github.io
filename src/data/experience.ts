import type { Text } from "../i18n/utils";

export interface ExperienceItem {
  company: Text;
  role: Text;
  startDate: Text;
  endDate: Text;
  description: Text;
  technologies: string[];
  logo?: string;
  url?: string;
}

export const experienceData: ExperienceItem[] = [
  {
    company: "LKA Services (Bénin)",
    role: {
      en: "Data Scientist Intern (End-of-Studies Internship)",
      fr: "Stagiaire Data Scientist (stage de fin d'études)",
    },
    startDate: { en: "Sep 2025", fr: "sept. 2025" },
    endDate: { en: "Dec 2025", fr: "déc. 2025" },
    description: {
      en: "Designed and developed data processing and analysis solutions. Automated classification processes and contributed to improving data management systems to optimize decision-making.",
      fr: "Conception et développement de solutions de traitement et d'analyse de données. Automatisation de processus de classification et contribution à l'amélioration des systèmes de gestion des données pour optimiser la prise de décision.",
    },
    technologies: ["Data Analysis", "Python", "Automation", "Machine Learning"]
  },
  {
    company: {
      en: "LESCAL (Laboratory for Statistical Studies and Application & Software Design)",
      fr: "LESCAL (Laboratoire d'Études Statistiques et Conception d'Applications et Logiciels)",
    },
    role: { en: "Data Scientist Intern", fr: "Stagiaire Data Scientist" },
    startDate: { en: "Aug 2024", fr: "août 2024" },
    endDate: { en: "Oct 2024", fr: "oct. 2024" },
    description: {
      en: "Contributed to statistical studies and software application design. Analyzed datasets to extract actionable insights and supported the development of data-driven applications.",
      fr: "Participation à des études statistiques et à la conception d'applications logicielles. Analyse de jeux de données pour en tirer des enseignements exploitables et appui au développement d'applications fondées sur les données.",
    },
    technologies: ["Statistics", "Data Conception", "Software Design"]
  }
];

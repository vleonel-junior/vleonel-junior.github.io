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
    company: "Hackathon Bénin Insights 2026",
    role: {
      en: "Bénin Pulse — Media intelligence platform",
      fr: "Bénin Pulse — Plateforme de media intelligence",
    },
    startDate: "2026",
    endDate: "2026",
    description: {
      en: "Designed and built a web platform comparing international and local media coverage of Benin. Collected and processed over 32,000 local articles and 25,000 global events (GDELT via Google BigQuery), classified them automatically with NLP, and built an interactive dashboard tailored to different user profiles.",
      fr: "Conception et développement d'une plateforme web comparant la couverture médiatique internationale et locale du Bénin. Collecte et traitement de plus de 32 000 articles locaux et 25 000 événements mondiaux (GDELT via Google BigQuery), classification automatique par IA (NLP), et création d'un tableau de bord interactif adapté à différents profils d'utilisateurs.",
    },
    technologies: ["Data Analysis", "Google BigQuery", "NLP", "Web Development"]
  },
  {
    company: { en: "ML Competition", fr: "Compétition ML" },
    role: {
      en: "Data Tour 2026 — Fraud detection on mobile money transactions",
      fr: "Data Tour 2026 — Détection de fraude sur transactions mobile money",
    },
    startDate: "2026",
    endDate: "2026",
    description: {
      en: "Built a machine learning model to detect fraudulent transactions in a highly imbalanced dataset. Designed a two-stage architecture combining several XGBoost models to maximize fraud detection while keeping false alarms low.",
      fr: "Développement d'un modèle de machine learning pour détecter les transactions frauduleuses dans un jeu de données fortement déséquilibré. Mise en place d'une architecture à deux niveaux combinant plusieurs modèles XGBoost pour maximiser la détection de fraudes tout en minimisant les fausses alertes.",
    },
    technologies: ["Machine Learning", "XGBoost", "Fraud Detection", "Python"]
  },
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

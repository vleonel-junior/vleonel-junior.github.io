// Site-wide UI strings. English is the default locale (served at /),
// French lives under /fr/. Article bodies are not translated: each article
// keeps its own language and its page chrome follows that language.

export const languages = {
    en: "English",
    fr: "Français",
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "en";

export const ui = {
    en: {
        "site.title": "Léonel VODOUNOU - Mathematical Engineering & AI",
        "site.description":
            "Portfolio of Léonel VODOUNOU, mathematical engineer and data scientist specialized in statistics, stochastic modeling and machine learning.",

        "nav.resume": "Resume",
        "nav.projects": "Projects",
        "nav.blog": "Blog",
        "nav.menu": "Menu",
        "nav.theme": "Toggle theme",
        "nav.language": "Language",

        "hero.kicker": "Mathematical Engineer · Data Scientist",
        "hero.tagline":
            "Statistics, stochastic modeling and machine learning, from the math on paper to models that run. Currently rebuilding an LLM from scratch and writing about it.",
        "hero.cv": "Download CV",
        "hero.notes": "Read my notes",

        "home.about": "About Me",
        "home.location": "Cotonou, Benin",
        "home.role": "Mathematical Engineering & AI Research",
        "home.bio.1":
            "<strong>Hello, I'm Léonel!</strong> I am a <strong>Mathematical Engineer</strong> and <strong>Data Scientist</strong> driven by the mission of bridging the gap between rigorous mathematical research and practical AI deployment.",
        "home.bio.2":
            "With a background in <strong>stochastic modeling</strong> and <strong>statistics</strong>, I specialize in transforming complex theoretical ideas into robust AI prototypes. I am particularly passionate about <strong>Machine Learning</strong>, <strong>Large Language Models (LLMs)</strong>, and <strong>Computer Vision</strong>, where I focus on improving both the performance and the theoretical foundations of modern models.",
        "home.bio.3":
            "My goal is to take mathematical insights and turn them into experimental solutions that solve real-world problems. I thrive at the intersection of abstract analysis and high-performance engineering, always looking for new ways to make AI more robust and understandable.",
        "home.writing": "Writing & Reading Notes",
        "home.series": "Series",
        "home.chapters": "chapters",
        "home.allArticles": "All articles →",
        "home.education": "Education",
        "home.publications": "Publications",
        "home.experience": "Experience",
        "home.projects": "Recent Projects",
        "home.academic": "Academic",
        "home.personal": "Personal",
        "category.academic": "Academic",
        "category.personal": "Personal",
        "home.technologies": "Technologies",
        "home.viewGithub": "View on GitHub",
        "home.allProjects": "View all projects",
        "home.certifications": "Certifications",
        "home.volunteering": "Volunteering / Teaching",


        "projects.title": "Projects - Léonel VODOUNOU",
        "projects.description":
            "Projects by Léonel VODOUNOU in applied mathematics, optimization and artificial intelligence.",
        "projects.heading": "Projects",
        "projects.subtitle":
            "A selection of my work in applied mathematics and artificial intelligence.",

        "blog.title": "Blog - Léonel VODOUNOU",
        "blog.description":
            "Notes on machine learning, LLMs and the math behind them.",
        "blog.heading": "Blog",
        "blog.readingNotes": "Reading notes",
        "blog.seriesOf": "{n}-chapter series",
        "blog.published": "{n} published",
        "blog.by": "By",
        "blog.openNotes": "Open the reading notes",
        "blog.articles": "Articles",
        "blog.readMore": "Read more",
        "blog.minRead": "min read",

        "lang.en": "EN",
        "lang.fr": "FR",
        "lang.writtenIn.en": "In English",
        "lang.writtenIn.fr": "In French",

        "post.authors": "Authors",
        "post.author": "Author",
        "post.affiliations": "Affiliations",
        "post.affiliationValue": "Mathematical Engineering & AI",
        "post.published": "Published",
        "post.readTime": "Read time",
        "post.series": "Series",
        "post.chapter": "Chapter",
        "post.backToBlog": "Back to the blog",
        "post.backToSeries": "Back to contents:",
        "post.readingSeries": "Reading series",
        "post.chapters": "Chapters",
        "post.comingSoon": "Coming soon",
        "post.discuss": "Discussion",
        "post.share": "Share",
        "post.linkCopied": "Link copied",

        "toc.title": "Contents",
        "toc.close": "Close",

        "newsletter.title": "Weekly Notes",
        "newsletter.text":
            "Every Sunday, I share what I've been learning: papers, ideas, experiments, and questions that stayed with me.",
        "newsletter.placeholder": "your@email.com",
        "newsletter.subscribe": "Subscribe",
        "newsletter.unsubscribe":
            "You can unsubscribe at any time with a single click.",

        "footer.rights": "All rights reserved.",

        "404.title": "Page not found",
        "404.text": "Sorry, the page you are looking for does not exist or has been moved.",
        "404.back": "Back to home",
    },
    fr: {
        "site.title": "Léonel VODOUNOU - Génie Mathématique & IA",
        "site.description":
            "Portfolio de Léonel VODOUNOU, ingénieur mathématicien et data scientist spécialisé en statistiques, modélisation stochastique et machine learning.",

        "nav.resume": "Parcours",
        "nav.projects": "Projets",
        "nav.blog": "Blog",
        "nav.menu": "Menu",
        "nav.theme": "Changer de thème",
        "nav.language": "Langue",

        "hero.kicker": "Ingénieur mathématicien · Data Scientist",
        "hero.tagline":
            "Statistiques, modélisation stochastique et machine learning : des mathématiques sur le papier aux modèles qui tournent. En ce moment, je reconstruis un LLM de zéro et je documente chaque étape.",
        "hero.cv": "Télécharger mon CV",
        "hero.notes": "Lire mes notes",

        "home.about": "À propos",
        "home.location": "Cotonou, Bénin",
        "home.role": "Génie mathématique & recherche en IA",
        "home.bio.1":
            "<strong>Bonjour, je suis Léonel !</strong> Je suis <strong>ingénieur en génie mathématique</strong> et <strong>data scientist</strong>, avec une ambition : rapprocher la recherche mathématique rigoureuse du déploiement concret de l'IA.",
        "home.bio.2":
            "Formé à la <strong>modélisation stochastique</strong> et aux <strong>statistiques</strong>, je transforme des idées théoriques complexes en prototypes d'IA robustes. Je m'intéresse particulièrement au <strong>machine learning</strong>, aux <strong>grands modèles de langage (LLM)</strong> et à la <strong>vision par ordinateur</strong>, en cherchant à améliorer à la fois les performances et les fondements théoriques des modèles modernes.",
        "home.bio.3":
            "Mon objectif : partir d'intuitions mathématiques pour construire des solutions expérimentales qui répondent à des problèmes réels. Je me sens à ma place à la frontière entre l'analyse abstraite et l'ingénierie, toujours à la recherche de moyens de rendre l'IA plus robuste et plus compréhensible.",
        "home.writing": "Articles & notes de lecture",
        "home.series": "Série",
        "home.chapters": "chapitres",
        "home.allArticles": "Tous les articles →",
        "home.education": "Formation",
        "home.publications": "Publications",
        "home.experience": "Expérience",
        "home.projects": "Projets récents",
        "home.academic": "Académiques",
        "home.personal": "Personnels",
        "category.academic": "Académique",
        "category.personal": "Personnel",
        "home.technologies": "Technologies",
        "home.viewGithub": "Voir sur GitHub",
        "home.allProjects": "Voir tous les projets",
        "home.certifications": "Certifications",
        "home.volunteering": "Bénévolat / Enseignement",


        "projects.title": "Projets - Léonel VODOUNOU",
        "projects.description":
            "Projets de Léonel VODOUNOU en mathématiques appliquées, optimisation et intelligence artificielle.",
        "projects.heading": "Projets",
        "projects.subtitle":
            "Une sélection de mes travaux en mathématiques appliquées et en intelligence artificielle.",

        "blog.title": "Blog - Léonel VODOUNOU",
        "blog.description":
            "Des notes sur le machine learning, les LLM et les mathématiques qui se cachent derrière.",
        "blog.heading": "Blog",
        "blog.readingNotes": "Notes de lecture",
        "blog.seriesOf": "Série de {n} chapitres",
        "blog.published": "{n} publié(s)",
        "blog.by": "Par",
        "blog.openNotes": "Ouvrir les notes de lecture",
        "blog.articles": "Articles",
        "blog.readMore": "Lire la suite",
        "blog.minRead": "min de lecture",

        "lang.en": "EN",
        "lang.fr": "FR",
        "lang.writtenIn.en": "En anglais",
        "lang.writtenIn.fr": "En français",

        "post.authors": "Auteurs",
        "post.author": "Auteur",
        "post.affiliations": "Affiliations",
        "post.affiliationValue": "Génie mathématique & IA",
        "post.published": "Publié le",
        "post.readTime": "Temps de lecture",
        "post.series": "Dossier",
        "post.chapter": "Chapitre",
        "post.backToBlog": "Retour au blog",
        "post.backToSeries": "Retour au sommaire :",
        "post.readingSeries": "Série de lecture",
        "post.chapters": "Chapitres",
        "post.comingSoon": "À venir",
        "post.discuss": "Discussion",
        "post.share": "Partager",
        "post.linkCopied": "Lien copié",

        "toc.title": "Sommaire",
        "toc.close": "Fermer",

        "newsletter.title": "Notes de la semaine",
        "newsletter.text":
            "Chaque dimanche, je partage ce que j'ai appris : articles de recherche, idées, expériences et questions qui me sont restées en tête.",
        "newsletter.placeholder": "vous@email.com",
        "newsletter.subscribe": "S'abonner",
        "newsletter.unsubscribe":
            "Vous pouvez vous désabonner à tout moment en un clic.",

        "footer.rights": "Tous droits réservés.",

        "404.title": "Page introuvable",
        "404.text": "Désolé, la page que vous cherchez n'existe pas ou a été déplacée.",
        "404.back": "Retour à l'accueil",
    },
} as const;

export type UiKey = keyof (typeof ui)["en"];

# Portfolio — Léonel VODOUNOU

Portfolio personnel moderne et performant développé avec **Astro.js** et **Tailwind CSS**.

🔗 **Site en ligne** : [vleonel-junior.github.io](https://vleonel-junior.github.io/)

## 🚀 Fonctionnalités

- ⚡ **Performance optimale** avec Astro.js
- 🎨 **Design responsive** avec Tailwind CSS
- 📝 **Blog intégré** avec support Markdown/MDX
- 📚 **Dossiers de lecture** — Notes de lecture structurées par chapitres
- 🌙 **Mode sombre/clair** automatique
- 🔍 **SEO optimisé** avec meta tags et sitemap
- 📱 **Mobile-first** design
- 🚀 **Déploiement automatique** sur GitHub Pages

## 🛠 Technologies

- [Astro.js](https://astro.build/) — Framework de génération de sites statiques
- [Tailwind CSS](https://tailwindcss.com/) — Framework CSS utilitaire
- [TypeScript](https://www.typescriptlang.org/) — Typage statique JavaScript
- [MDX](https://mdxjs.com/) — Markdown enrichi avec composants
- [Preact](https://preactjs.com/) — Composants interactifs légers
- [KaTeX](https://katex.org/) — Rendu de formules mathématiques

## 📦 Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/vleonel-junior/vleonel-junior.github.io.git
   cd vleonel-junior.github.io
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:4321
   ```

## 📝 Scripts disponibles

- `npm run dev` — Démarrer le serveur de développement
- `npm run build` — Construire le site pour la production
- `npm run preview` — Prévisualiser le build de production
- `npm run astro` — Lancer les commandes Astro CLI

## 📁 Structure du projet

```
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── ui/             # Composants UI de base
│   │   ├── Navigation.astro
│   │   ├── TableOfContents.astro
│   │   └── Footer.astro
│   ├── content/            # Contenu (Markdown / MDX)
│   │   ├── blog/           # Articles de blog
│   │   ├── dossiers/       # Dossiers de lecture (notes par chapitres)
│   │   └── config.ts       # Configuration des collections
│   ├── data/               # Données structurées (expériences, projets, etc.)
│   ├── layouts/            # Layouts de page
│   │   └── Layout.astro
│   ├── pages/              # Pages du site
│   │   ├── index.astro     # Page d'accueil (CV / Resume)
│   │   ├── projects.astro  # Page projets
│   │   └── blog/           # Pages du blog et des dossiers
│   └── styles/             # Styles globaux
│       └── global.css
├── public/                 # Assets statiques
│   └── images/             # Images du site
└── astro.config.mjs        # Configuration Astro
```

## ✍️ Ajouter un article de blog

1. **Créer un nouveau fichier** dans `src/content/blog/`
   ```bash
   touch src/content/blog/mon-article.mdx
   ```

2. **Ajouter le front matter** et le contenu
   ```markdown
   ---
   title: "Titre de l'article"
   description: "Description courte"
   pubDate: 2026-06-13
   author: "Léonel VODOUNOU"
   image: "/images/article-cover.jpg"
   tags: ["tech", "web"]
   category: "Development"
   readTime: 5
   ---

   Contenu de l'article en Markdown...
   ```

## 🚀 Déploiement

### GitHub Pages (Automatique)

Le site est déployé automatiquement via GitHub Actions à chaque push sur `main`.

```bash
git add .
git commit -m "Update"
git push origin main
```

Le site est disponible à : **https://vleonel-junior.github.io/**

## 📈 Performance

Ce portfolio est optimisé pour la performance :
- Score Lighthouse 95+ attendu
- Images optimisées automatiquement
- CSS et JavaScript minifiés
- Génération de sitemap automatique
- Meta tags SEO complets

## 📞 Contact

- **Email** : [vleoneljunior@gmail.com](mailto:vleoneljunior@gmail.com)
- **LinkedIn** : [Léonel Junior Sêdjro VODOUNOU](https://www.linkedin.com/in/léonel-junior-sêdjro-vodounou)
- **GitHub** : [vleonel-junior](https://github.com/vleonel-junior)

---

⭐ N'hésitez pas à donner une étoile si ce projet vous a aidé !

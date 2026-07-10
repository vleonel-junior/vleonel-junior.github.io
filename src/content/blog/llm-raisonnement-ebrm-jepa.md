---
title: "Pourquoi les LLM peinent à raisonner : les limites de l'autorégression"
description: "Ce que proposent les modèles à énergie (EBM), JEPA et les World Models pour contourner les limites structurelles des LLMs."
pubDate: 2026-07-10
author: "Léonel VODOUNOU"
category: "Analyse"
tags: ["LLM", "Raisonnement", "EBM", "JEPA", "IA"]
image: "/images/blog/ebm-logical-intelligence.png"
---

Depuis deux ans, chaque nouvelle génération de modèle de langage est présentée comme un pas de plus vers le raisonnement. Chain-of-thought, test-time compute, entraînement par renforcement sur des traces de résolution de problèmes : la recette a produit des gains réels sur des benchmarks de mathématiques et de code. Mais un courant de recherche, porté entre autres par Yann LeCun [1, 3] et par des startups comme Logical Intelligence [2], avance une thèse plus dérangeante : ces gains ne viennent pas du fait que les LLM apprennent à raisonner, mais du fait qu'on leur fait produire *plus de texte avant de répondre*. Et ce n'est pas la même chose.

Cet article déplie cette thèse, sans se contenter de la répéter. L'objectif est de comprendre, notion par notion, pourquoi un modèle autorégressif token-par-token bute structurellement sur certains types de problèmes — puis d'examiner ce que des architectures alternatives (JEPA, World Models, Energy-Based Reasoning Models) proposent concrètement pour contourner cette limite. Et, parce que la rigueur l'exige, d'examiner aussi où les preuves apportées à l'appui de ces alternatives sont solides, et où elles ne le sont pas encore.

## 1. Trois raisons structurelles, pas une question de taille de modèle

Il y a trois causes distinctes à ce blocage, et il vaut la peine de les séparer parce qu'elles ne se résolvent pas de la même manière ni avec les mêmes outils. Cette décomposition en trois points est celle que propose explicitement Logical Intelligence dans son billet fondateur [2], et elle recoupe, avec un vocabulaire différent, le diagnostic que porte Yann LeCun depuis plusieurs années [1].

**a) La génération autorégressive rend la révision coûteuse.**
Un LLM produit sa réponse token après token, de gauche à droite, chaque nouveau mot étant conditionné sur tous ceux qui précèdent. C'est un peu comme écrire une lettre avec un stylo, sans gomme ni correcteur : une fois qu'une phrase est posée, revenir dessus pour la corriger oblige à raturer et à réécrire tout ce qui suit, puisque la suite du texte a été pensée en fonction de ce qui était déjà là. Formellement, on dit que le modèle a du mal à faire du conditionnement "à l'envers" — produire un raisonnement en tenant compte à la fois du point de départ et d'un objectif final donné à l'avance — ce qui rend difficile l'attribution de crédit : quand un raisonnement échoue, il est difficile d'identifier précisément quelle étape antérieure en est la cause, et donc de la corriger sans tout reprendre.

**b) L'entraînement ne note jamais la trace dans son ensemble.**
L'entraînement standard d'un LLM optimise un seul objectif, local : prédire le mot suivant le plus probable, étant donné ce qui précède. C'est précisément de là que vient l'absence de contrôle global — parce que la récompense porte mot par mot, il n'existe nulle part, dans cet entraînement, un moment où l'on vérifierait si le raisonnement complet, une fois terminé, tient debout logiquement. Même les méthodes ajoutées après coup pour compenser ce manque (renforcement, reclassement de plusieurs réponses) ne notent que la réponse *finie* — jamais une étape intermédiaire. Le résultat s'observe empiriquement : la qualité d'un raisonnement généré se dégrade à mesure qu'il s'allonge, faute d'un signal qui suivrait sa cohérence en cours de route plutôt qu'à la toute fin.

**c) Le résultat produit est fait d'unités discrètes, pas d'une quantité continue qu'on peut ajuster.**
C'est le point le plus abstrait des trois, mais il devient simple avec une image : un interrupteur électrique classique n'a que deux états, allumé ou éteint — il n'existe pas de position "un peu allumé". Un variateur de lumière, en revanche, permet un réglage continu, du plus sombre au plus lumineux, par petits ajustements progressifs. Un token produit par un LLM fonctionne comme l'interrupteur : c'est ce mot-là, ou un autre, sans état intermédiaire — on ne peut pas demander « dans quel sens faut-il déplacer le mot "chat" pour qu'il soit plus correct ? », un mot n'a pas de voisinage continu, seulement un remplacement total possible par un autre mot du vocabulaire.

Cette nature discrète interdit d'utiliser la descente de gradient au moment de produire la réponse (soyons clairs, un modèle à l'inférence a ses poids figés : ce n'est pas eux qu'on ajuste. Ce qui varie, dans une architecture à énergie, c'est la réponse candidate elle-même, représentée comme un vecteur dans un espace continu plutôt que comme une suite de tokens. Le mécanisme est le suivant : une fonction d'énergie E, apprise à l'entraînement et figée à l'inférence, joue le rôle d'un juge fixe ; on part d'un candidat initial x₀ — une ébauche, potentiellement approximative — représenté comme un vecteur ; on calcule le gradient de E par rapport à *ce vecteur*, pas par rapport aux poids, et on déplace x₀ dans la direction qui fait baisser l'énergie (x₁ = x₀ − η∇E(x₀)), et on répète.) C'est très précisément le mécanisme des modèles de diffusion (génération d'images), que LeCun décrit d'ailleurs dans l'entretien source [1] — partir d'un point bruité et le faire converger, pas à pas, vers quelque chose de cohérent, en suivant le gradient d'une fonction d'énergie ou de score. Un EBRM de raisonnement fait la même chose, mais sur une trace de raisonnement plutôt que sur une image.

Ce que cette possibilité apporte, très concrètement, c'est une information que le discret ne donne jamais : non seulement qu'on se trompe, mais *de combien*, et *dans quelle direction* corriger. Sans elle, il ne reste que la recherche par tâtonnement — produire plusieurs versions complètes indépendantes et garder la meilleure, sans que l'échec d'une tentative n'informe la suivante sur la direction à prendre. C'est une différence d'efficacité, pas seulement d'élégance mathématique : un système guidé par un gradient converge en général avec beaucoup moins de tentatives qu'un système qui doit deviner à chaque essai, parce que chaque pas exploite une information locale que la génération séquentielle de tokens ne peut tout simplement pas produire.

LeCun rattache d'ailleurs ce recoupement à la théorie classique de la résolution de problèmes en intelligence artificielle [1] : un système de recherche efficace a toujours besoin de deux composants distincts, un qui propose des solutions candidates et un autre qui évalue si elles sont bonnes *avant* que la solution soit terminée — sans quoi il n'y a plus de recherche véritable, seulement des tentatives indépendantes jugées après coup, exactement la « recherche par tâtonnement » dont il vient d'être question. Sa critique des LLM porte précisément là-dessus : produire plusieurs suites de tokens et les noter une fois qu'elles sont complètes n'est, selon lui, qu'une forme très primitive de cette recherche — et elle devrait, idéalement, s'exécuter dans un espace de représentation continu plutôt que dans l'espace du langage lui-même [1].

## 2. JEPA et les World Models : apprendre une représentation du monde

Face à ce diagnostic, l'approche de LeCun est d'abord *perceptive* [1]. Plutôt que d'entraîner un modèle à reconstruire chaque détail de ce qu'il observe — l'approche générative classique — on entraîne un encodeur à produire une représentation abstraite qui élimine ce qui n'est de toute façon pas prévisible, et un prédicteur qui travaille dans cet espace abstrait, plus compact. L'exemple que LeCun utilise pour illustrer ce principe vient de la physique : la loi des gaz parfaits (PV = nRT) ne dit rien sur la position ou la vitesse individuelle de chaque molécule de gaz — elle élimine délibérément cette information et prédit à partir de quelques variables agrégées seulement (pression, volume, température). Cette élimination contrôlée du détail non prédictible est, selon lui, « à la racine de la science, et je dirais, à la racine de l'intelligence » [1].

Un World Model va plus loin : il apprend une transition état → action → état suivant, ce qui permet de planifier par optimisation — spécifier un état cible et chercher, dans l'espace de représentation, la séquence d'interventions qui y mène. C'est un cadre général qui dépasse largement le texte : il s'applique à la robotique, à la simulation physique, à la conception de matériaux.

## 3. Kona à l'épreuve des faits

Logical Intelligence applique ce principe à travers son modèle Kona, sur des traces de raisonnement [2]. Le seul résultat public qui concerne directement Kona est une démonstration où il surclasse nettement plusieurs LLM standards sur un problème de logique à état fini et de petite taille, consultable en direct sur leur site [5]. Ce résultat n'a pas fait l'objet d'un audit tiers ou d'un leaderboard indépendant — c'est l'entreprise qui en fixe le protocole et rapporte le chiffre. Il illustre l'écart architectural attendu entre les deux approches, mais sur un cas trop restreint pour en tirer une conclusion générale sur des systèmes réels bien plus complexes et souvent mal spécifiés.

## 4. Synthèse

Le diagnostic sur les limites structurelles des LLM autorégressifs repose sur deux sources sans intérêt commercial commun — Yann LeCun depuis l'angle de la représentation du monde [1], Logical Intelligence depuis l'angle du raisonnement symbolique [2] — et l'une d'elles est une publication académique à comité de lecture [1]. Ce diagnostic semble donc solide.

Ce qui reste ouvert, à la lumière de la section précédente, est une question empirique précise : est-ce que l'architecture à énergie généralise au-delà d'un problème borné vers les systèmes réels, complexes et souvent mal spécifiés, que l'entreprise cite comme cibles à terme — conception de semi-conducteurs, contrôle de systèmes industriels, planification financière ? Aucune des sources disponibles n'y répond encore, ni dans un sens ni dans l'autre.

---

## Sources

**[1]** LeCun, Y. & Manyika, J. M. (2026). « Learning Abstractions: A Conversation with Yann LeCun. » *Dædalus*, Winter/Spring 2026. American Academy of Arts & Sciences.
https://www.amacad.org/publication/daedalus/learning-abstractions-conversation-yann-lecun
*(Publication académique à comité de lecture — source primaire principale sur JEPA/World Models.)*

**[2]** Bodnia, E. & Hanin, B. (21 janvier 2026). « Energy-Based Models for Reasoning, LLMs for the Interface: Scaling Reasoning with Agentic AI. » Blog Logical Intelligence.
https://logicalintelligence.com/blog/energy-based-models-for-reasoning
*(Billet de positionnement d'entreprise — présente la vision architecturale globale, à distinguer des résultats empiriques ci-dessous.)*

**[3]** Stefani, M. (24 mai 2026). « #543 – Yann Le Cun – AMI Labs – Rendre l'IA plus humaine. » Podcast *Génération Do It Yourself*.
https://www.gdiy.fr/podcast/yann-lecun/
*(Entretien grand public — utile pour le contexte biographique et institutionnel de LeCun.)*

**[4]** La Rédaction de FW.MEDIA (24 novembre 2025). « AI: Connaissez-vous les Joint Embedding Predictive Architectures (JEPA) et les World Models ? » FW.Media / FrenchWeb.
https://www.frenchweb.fr/ai-connaissez-vous-les-joint-embedding-predictive-architectures-jepa-et-les-world-models/458786
*(Vulgarisation journalistique de second ordre — ne pas citer comme source technique primaire.)*

**[5]** Logical Intelligence (3 février 2026). « EBM vs. LLMs: Our Kona EBM a 96% vs. 2% Sudoku Benchmark. »
https://logicalintelligence.com/blog/energy-based-model-sudoku-demo — démonstration interactive sur https://sudoku.logicalintelligence.com/
*(Billet d'entreprise avec démonstration publique en temps réel, limitée à un problème borné et de petite taille — pas d'audit tiers indépendant du chiffre.)*

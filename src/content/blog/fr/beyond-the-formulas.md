---
title: "Des maths aux modèles"
description: "Étudier le machine learning en profondeur, des fondements formels jusqu'aux systèmes qui fonctionnent vraiment."
pubDate: 2026-02-23
author: "Léonel VODOUNOU"
category: "Prologue"
lang: "fr"
tags: ["Machine Learning", "Philosophie", "Recherche"]
---

## Introduction

Cet article ne présente ni un modèle, ni un jeu de données, ni une nouvelle technique. Il présente un engagement. Une manière de travailler que je choisis délibérément, alors que j'essaie de devenir le genre d'ingénieur, et je l'espère de chercheur, qui comprend ce qu'il construit jusqu'au bout.

## La frustration qui revient toujours

Il y a quelque chose qui me gêne sans cesse en machine learning. D'un côté, il y a les tutoriels rapides. On charge des données, on définit un modèle, on appelle `fit()`, et les chiffres s'améliorent. Ça marche, mais le mécanisme reste opaque. De l'autre côté, il y a les articles de recherche. Une notation dense. Des hypothèses implicites. Des démonstrations qui sautent précisément les étapes qu'on aurait eu besoin de voir. Entre ces deux mondes, il y a un vide. Un endroit où l'on peut *utiliser* des modèles sans vraiment les comprendre.

Pendant un temps, je m'en suis accommodé. Mais avec le temps, j'ai compris une chose : quand les choses cessent de fonctionner (quand l'entraînement devient instable, quand la généralisation échoue, quand le passage à l'échelle casse les hypothèses), les connaissances superficielles s'effondrent vite. Ce qui reste utile, c'est la compréhension structurelle.

Savoir non seulement qu'Adam fonctionne, mais qu'il maintient une estimation glissante des moments d'ordre un et deux du gradient. Savoir non seulement que les modèles de diffusion génèrent des échantillons, mais quel processus stochastique ils approximent. Savoir non seulement que l'attention améliore les performances, mais quelle contrainte elle relâche dans la modélisation de séquences.

Cette différence compte. Ce blog existe parce que je veux combler ce vide. D'abord pour moi, et j'espère pour tous ceux qui me liront.

## Ce que ce blog est, et ce qu'il n'est pas

Soyons clairs. Ce n'est pas un blog qui suit les tendances. Je ne cherche pas à commenter chaque nouvel article qui paraît. Je préfère comprendre une idée en profondeur plutôt qu'en survoler dix. Ce n'est pas non plus un blog de raccourcis. Si vous cherchez le chemin le plus rapide vers un bon score sur un leaderboard, il y a de meilleurs endroits.

C'est un carnet de travail tenu en public. C'est là que je documenterai ma compréhension des modèles que je rencontre, des articles que je lis et des systèmes que j'essaie de construire. Chaque article se concentrera sur un seul concept à la fois (parfois classique, parfois récent) et le décortiquera avec soin :

* Quel problème résout-il ?
* Quelles mathématiques le justifient ?
* Quelle intuition permet de le saisir ?
* Que se passe-t-il quand on l'implémente soi-même ?

L'ambition est simple à formuler et difficile à atteindre : passer avec aisance de la formulation mathématique à la clarté conceptuelle, puis à l'implémentation, jusqu'à quelque chose qui tourne réellement et que l'on peut étendre.

## Comment se déroulera chaque analyse

Chaque article suivra une structure récurrente. Pas rigide, mais disciplinée.

### Partir des fondements

On commence par le formalisme. Si une méthode découle de l'optimisation d'un objectif précis, on la dérive. Si elle approxime un objet mathématique plus propre, on décrit d'abord cet objet. Si des hypothèses sont faites, on les énonce clairement. Les mathématiques ne sont pas là pour intimider. Elles sont là pour lever l'ambiguïté. Une fois le formalisme compris, la méthode cesse de ressembler à de la magie.

### Construire l'intuition

Les démonstrations formelles sont nécessaires, mais insuffisantes. Après les équations, je poserai toujours les mêmes questions : que se passe-t-il vraiment ici ? Quel est le modèle mental ? Quelle est l'image géométrique ? Quelle est l'idée centrale qui survit quand la notation s'efface ?

L'intuition est ce qui permet d'adapter ses connaissances. C'est elle qui permet de les transférer d'un domaine à un autre. Sans elle, les formules restent des faits isolés.

### Tout reconstruire de zéro

L'implémentation est le vrai test. Pas en appelant une API de haut niveau, mais en reconstruisant la méthode à partir de ses équations. Chaque règle de mise à jour justifiée. Chaque approximation examinée. C'est là que la compréhension devient concrète.

C'est aussi là qu'apparaissent les lacunes cachées : les détails omis dans l'article, les instabilités numériques, les choix de conception implicites et les compromis qui n'émergent qu'en pratique. Reconstruire de zéro oblige à l'honnêteté. Si l'on ne peut pas implémenter quelque chose à partir des premiers principes, c'est qu'on ne l'a pas encore compris.

### Aller au-delà de l'article

Une fois la méthode fonctionnelle, les vraies questions commencent. Où casse-t-elle ? Quelles hypothèses la limitent ? Que se passerait-il si on les relâchait ? Comment se relie-t-elle à des idées que l'on connaît déjà ? C'est cette étape qui transforme la compréhension en réflexion de chercheur. Même si la réponse reste incomplète, se poser la question change la façon dont on lit l'article suivant.

## Conclusion

Travailler seul autorise les raccourcis. Travailler en public impose la précision. Quand on met quelque chose clairement par écrit, on découvre vite ce que l'on ne comprend pas.

Ce blog est, d'une certaine façon, une contrainte que je m'impose. Un engagement à privilégier la profondeur plutôt que la vitesse. Les fondements plutôt que les tendances. Reconstruire plutôt que simplement utiliser.

À long terme, je veux devenir le genre d'ingénieur (ou de chercheur) capable de partir d'une formulation mathématique et de la mener jusqu'à un système qui fonctionne. Quelqu'un d'aussi à l'aise avec les processus stochastiques et l'optimisation sur le papier qu'avec le débogage d'une boucle d'entraînement à 2 heures du matin. Ce blog fait partie de ce chemin.

La première analyse arrive bientôt.

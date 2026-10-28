---
title: "Le problème P vs NP expliqué simplement"
description: "P = NP. Cela vous dit-il quelque chose ? Tour d'horizon rapide de l'une des plus grandes énigmes de l'informatique."
pubDate: 2026-10-28
author: "Léonel VODOUNOU"
category: "Informatique Théorique"
lang: "fr"
tags: ["Informatique théorique", "Complexité", "Algorithmique"]
image: "/images/blog/p-vs-np.png"
draft: false
---

C’est le « Saint Graal » de l'informatique théorique : le fameux problème **P vs NP**, qui vaut d'ailleurs un million de dollars (c'est l'un des problèmes du prix du millénaire).

![Homer Simpson face à l'équation P=NP dans un univers 3D](/images/blog/p-vs-np.png)

### 1. La classe P (« Polynomial ») : Les problèmes faciles à résoudre

Ce sont les problèmes pour lesquels un ordinateur peut trouver une solution **rapidement** (en un temps polynomial, c'est-à-dire raisonnable, même si les données grandissent).

- **Exemples :** Trier une liste de millions de noms par ordre alphabétique, ou trouver le plus court chemin sur un GPS.
- **Le mot-clé :** Résoudre est facile.

### 2. La classe NP (« Nondeterministic Polynomial ») : Les problèmes faciles à *vérifier*

Ici, trouver la solution à partir de zéro est **extrêmement difficile** (ça prendrait un temps fou, exponentiel). Mais attention : **si quelqu'un vous donne la solution par magie, la vérifier est un jeu d'enfant.**

- **L'exemple du Sudoku :** Remplir une grille de Sudoku géante de 100x100 à partir de zéro demande un effort monstre (recherche par tâtonnements). En revanche, si un ami vous tend la grille remplie, il ne vous faut que quelques secondes pour vérifier si chaque ligne, colonne et bloc respecte les règles.
- **Le lien avec P :** Tous les problèmes de la classe P sont aussi dans NP (car si c'est facile à résoudre, c'est forcément facile à vérifier). Mais la grande question est : *Est-ce que l'inverse est vrai ?* Est-ce que tout ce qui est facile à vérifier est en réalité facile à résoudre ? (C’est la question du $P = NP ?$).

### 3. Les problèmes « NP-complets » : Les boss de fin du jeu

Dans la grande famille des problèmes NP, il y a une sous-catégorie d'élite : **les problèmes NP-complets**.

Ils ont deux caractéristiques folles :

1. Ce sont **les problèmes les plus difficiles** de toute la catégorie NP.
2. **Ils sont tous connectés entre eux (par réduction).** Cela signifie que si vous trouvez un algorithme magique et ultra-rapide pour résoudre *un seul* problème NP-complet, vous pouvez instantanément le transformer pour résoudre **n'importe quel autre problème NP-complet du monde** (le voyageur de commerce, le repliement des protéines, la cryptographie, etc.).

C'est pour cela que l'on dit : **si $P = NP$, alors résoudre n'importe quel problème complexe devient aussi simple que de vérifier une solution**.

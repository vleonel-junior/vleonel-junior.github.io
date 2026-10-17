---
title: "Comprendre TAIL-MIL : décortiquer une architecture hiérarchique pour la détection d'anomalies dans les séries temporelles"
description: "Comment TAIL-MIL combine T-Attention et V-Attention pour détecter les anomalies à la fois au niveau de la fenêtre temporelle, du pas de temps et de chaque variable."
pubDate: 2026-10-17
author: "Léonel VODOUNOU"
category: "Deep Learning"
lang: "fr"
tags: ["Séries temporelles", "Détection d'anomalies", "Multiple Instance Learning", "Deep Learning", "Attention"]
image: "/images/blog/tail-mil-architecture.png"
draft: false
---

## Introduction

La détection d'anomalies dans les séries temporelles multivariées consiste non seulement à déterminer si un comportement anormal s'est produit, mais aussi à identifier le moment où il apparaît et les variables qui en sont responsables. Cette localisation est particulièrement cruciale lorsque les données proviennent de multiples capteurs ou décrivent simultanément plusieurs sous-systèmes industriels ou physiques.

Cependant, disposer d'une étiquette globale indiquant qu'une séquence temporelle complète est anormale ne signifie pas que l'on connaît les instants précis ni les variables en cause. Obtenir ces annotations fines à l'échelle de chaque pas de temps et de chaque capteur exige un temps et des ressources considérables. L'apprentissage par sacs d'instances (*Multiple Instance Learning*, **MIL**) constitue une approche idéale pour surmonter ce verrou : le modèle est entraîné à partir de simples étiquettes globales au niveau de la séquence, tout en apprenant à détecter et localiser les anomalies au niveau des instances individuelles.

C'est dans ce contexte que Jang et Kwon ont proposé **TAIL-MIL** (*Time-Aware and Instance-Learnable Multiple Instance Learning for Multivariate Time Series Anomaly Detection*), une architecture conçue pour détecter les anomalies à plusieurs niveaux d'abstraction d'une série temporelle multivariée. Les auteurs modélisent les données selon une structure hiérarchique à deux dimensions : une fenêtre temporelle complète, appelée **Time-Aware Bag** (TAB), contient plusieurs instances temporelles (**Time-Point Instances in Multivariate data**, TPIM), chacune étant elle-même composée d'instances associées aux différentes variables (**Variate Instances in TPIM**, VI-TPIM).

L'objectif est de bâtir un modèle unifié capable à la fois de prédire si une fenêtre temporelle est anormale, de localiser les pas de temps concernés et d'isoler les variables incriminées. Pour y parvenir, les auteurs formulent trois objectifs de recherche :

- **R1 — Modéliser les relations entre instances :** le mécanisme d'attention doit prendre en compte les relations entre les VI-TPIM appartenant à des TPIM différents, afin d'exploiter pleinement les dépendances temporelles.
- **R2 — Construire la prédiction globale à partir des prédictions individuelles :** la prédiction globale du TAB doit s'appuyer directement sur les prédictions issues des instances de granularité fine. Cela permet d'unifier la détection globale et la localisation des anomalies.
- **R3 — Préserver les caractéristiques locales :** les prédictions individuelles doivent reposer sur les représentations originales extraites des instances, sans que celles-ci soient dénaturées ou lissées par l'injection d'informations contextuelles provenant d'autres instants.

Pour répondre à ces trois exigences, TAIL-MIL associe deux mécanismes d'attention complémentaires — **T-Attention** et **V-Attention** — couplés à une agrégation hiérarchique des prédictions.

---

## Formulation hiérarchique du problème

Considérons une fenêtre temporelle (TAB) $X = [X_1, X_2, \dots, X_N]$, où chaque $X_i$ représente le $i$-ème TPIM (pas de temps).

Chaque TPIM est composé de $T$ variables (les VI-TPIM) :

$$
X_i = [X_{(i, 1)}, X_{(i, 2)}, \dots, X_{(i, T)}]
$$

où $X_{(i, j)}$ désigne la valeur de la variable $j$ au temps $i$.

Le modèle doit apprendre conjointement trois niveaux de détection :
1. Quelle cellule variable-temps $(i, j)$ est anormale ?
2. Quel pas de temps $i$ est anormal ?
3. La séquence globale (le TAB) est-elle anormale ?

### La logique booléenne sous-jacente

Idéalement, la décision repose sur une double disjonction logique ($\text{OR}$) :

1. **Niveau VI-TPIM $\longrightarrow$ TPIM :**
   Un pas de temps est anormal si au moins l'une de ses variables présente un comportement anormal :

   $$
   g_i(X_i) = \begin{cases} 1 & \text{si au moins un VI-TPIM est anormal} \\ 0 & \text{sinon} \end{cases}
   $$

   Soit formellement : $\text{TPIM}_i = \text{OR}(X_{(i, 1)}, X_{(i, 2)}, \dots, X_{(i, T)})$.

2. **Niveau TPIM $\longrightarrow$ TAB :**
   Une fenêtre temporelle est anormale si au moins un de ses pas de temps est anormal :

   $$
   g(X) = \begin{cases} 1 & \text{si au moins un TPIM est anormal} \\ 0 & \text{sinon} \end{cases}
   $$

La chaîne de décision globale s'écrit donc :

$$
\text{VI-TPIM} \xrightarrow{\text{OR}} \text{TPIM} \xrightarrow{\text{OR}} \text{TAB}
$$

Le défi de TAIL-MIL consiste à construire une version continue, différentiable et apprenable de cette cascade logique, guidée uniquement par une supervision au niveau du TAB.

---

## Mécanismes d'attention : T-Attention et V-Attention

### 1. T-Attention (niveau temporel)

Le premier mécanisme d'attention opère entre les différents TPIM d'un même TAB ($X_1, X_2, \dots, X_N$). Son rôle est de satisfaire l'objectif **R1** : un instant $X_i$ doit pouvoir être évalué en relation avec l'ensemble du contexte temporel, et non de façon isolée.

Soit un TPIM $X_i \in \mathbb{R}^T$. On commence par extraire sa représentation latente via un encodeur $f$ :

$$
h_i = f(X_i) \in \mathbb{R}^L
$$

Pour l'ensemble de la fenêtre $X$, la matrice des représentations s'écrit :

$$
f(X) = [h_1, h_2, \dots, h_N] \in \mathbb{R}^{L \times N}
$$

où $L$ est la dimension de l'espace latent et $N$ le nombre de pas de temps dans le TAB.

Deux projections apprenables sont alors introduites :

- Un vecteur $W \in \mathbb{R}^{L \times 1}$ : le produit $W^\top h_i$ produit un scalaire. $W$ condense chaque représentation $L$-dimensionnelle en une valeur unique. Sur l'ensemble des TPIM, $W^\top f(X) \in \mathbb{R}^{1 \times N}$, et la fonction sigmoïde $\sigma$ borne chaque score entre $0$ et $1$.
- Une matrice $V \in \mathbb{R}^{L \times N}$ : le produit $V^\top h_i$ projette chaque TPIM dans un espace à $N$ composantes. Sur l'ensemble du TAB, on obtient une matrice $N \times N$, dont chaque élément est borné entre $0$ et $1$ par $\sigma(V^\top f(X))$.

Le score d'attention global est alors obtenu par la combinaison :

$$
m(X) = \text{softmax}\left(\frac{\sigma(W^\top f(X)) \, \sigma(V^\top f(X))}{\sqrt{N}}\right)
$$

> **Remarque sur le scaling :** Le facteur $\frac{1}{\sqrt{N}}$ permet de stabiliser les amplitudes des produits scalaires et d'éviter la saturation du softmax quand la longueur de fenêtre $N$ grandit.

Pour mieux comprendre l'interaction, posons :

$$
\sigma(W^\top f(X)) = [a_1, a_2, \dots, a_N] \in \mathbb{R}^{1 \times N}
$$

et

$$
\sigma(V^\top f(X)) = \begin{bmatrix}
b_{1,1} & b_{1,2} & \dots & b_{1,N} \\
b_{2,1} & b_{2,2} & \dots & b_{2,N} \\
\vdots  & \vdots  & \ddots & \vdots  \\
b_{N,1} & b_{N,2} & \dots & b_{N,N}
\end{bmatrix} \in \mathbb{R}^{N \times N}
$$

Pour le $j$-ème pas de temps, le score intermédiaire avant normalisation vaut :

$$
s_j = \frac{1}{\sqrt{N}} \sum_{k=1}^N a_k b_{k, j}
$$

Chaque score $s_j$ dépend ainsi des contributions croisées de tous les autres TPIM ($a_k$). Enfin, la fonction softmax produit les poids finaux normalisés :

$$
m_j = \frac{e^{s_j}}{\sum_{k=1}^N e^{s_k}}, \quad \text{avec } \sum_{j=1}^N m_j = 1
$$

Cette formulation permet à **T-Attention** de pondérer chaque pas de temps en fonction de ses corrélations temporelles.

---

### 2. V-Attention (niveau des variables)

T-Attention arbitre entre les pas de temps. **V-Attention**, quant à elle, opère à l'intérieur de chaque TPIM afin d'évaluer l'importance relative de chaque variable.

Dans les séries temporelles, l'état d'une variable à l'instant présent est souvent conditionné par son historique récent. Pour incorporer ce contexte sans altérer les caractéristiques intrinsèques nécessaires aux prédictions locales, V-Attention définit un champ récepteur temporel (*Receptive Field*, $RF$) pour chaque variable :

$$
RF_{(i, j)} = \begin{cases}
f(X_{(i, j)}) & \text{si } i < n \\
\frac{f(X_{(i, j)}) + \sum_{t=1}^{n-1} RF_{(i-t, j)}}{n} & \text{sinon}
\end{cases}
$$

Dans l'article de référence, les auteurs fixent $n=2$, ce qui simplifie l'expression :
- Pour $i = 1$ : $RF_{(1, j)} = f(X_{(1, j)})$
- Pour $i \geq 2$ : $RF_{(i, j)} = \frac{f(X_{(i, j)}) + RF_{(i-1, j)}}{2}$

Considérons un TPIM composé de $T$ variables. Posons $h_{(i, j)} = f(X_{(i, j)}) \in \mathbb{R}^L$ la représentation brute, et $r_{(i, j)} = RF_{(i, j)} \in \mathbb{R}^L$ la représentation contextuelle. On construit alors les matrices correspondantes :

$$
H_i = \begin{bmatrix}
\vert & \vert & & \vert \\
h_{(i, 1)} & h_{(i, 2)} & \cdots & h_{(i, T)} \\
\vert & \vert & & \vert
\end{bmatrix} \in \mathbb{R}^{L \times T}, \quad
R_i = \begin{bmatrix}
\vert & \vert & & \vert \\
r_{(i, 1)} & r_{(i, 2)} & \cdots & r_{(i, T)} \\
\vert & \vert & & \vert
\end{bmatrix} \in \mathbb{R}^{L \times T}
$$

Le calcul de V-Attention s'effectue comme suit :

1. **Projection avec mémoire contextuelle :** Avec $W \in \mathbb{R}^{L \times 1}$,
   $$
   A_i = \sigma(W^\top R_i) \in \mathbb{R}^{1 \times T}
   $$
   Chaque variable reçoit un score intermédiaire d'importance historique borné entre $0$ et $1$.

2. **Projection des caractéristiques instantanées :** Avec $V \in \mathbb{R}^{L \times T}$,
   $$
   B_i = \sigma(V^\top H_i) \in \mathbb{R}^{T \times T}
   $$
   Cette matrice capture les corrélations instantanées entre les $T$ variables.

3. **Combinaison et normalisation :**
   Le score conjoint des variables s'écrit :
   $$
   S_i = \frac{A_i B_i}{\sqrt{T}} = \frac{\sigma(W^\top R_i) \, \sigma(V^\top H_i)}{\sqrt{T}} \in \mathbb{R}^{1 \times T}
   $$
   Le facteur de normalisation $\sqrt{T}$ adapte l'échelle au nombre de variables $T$.

Les poids d'attention finaux par variable pour le TPIM $i$ s'obtiennent par softmax :

$$
m_i(X_i) = \text{softmax}(S_i) = [m_{(i, 1)}, m_{(i, 2)}, \dots, m_{(i, T)}]
$$

avec $m_{(i, j)} \ge 0$ et $\sum_{j=1}^T m_{(i, j)} = 1$.

---

## Assemblage hiérarchique des prédictions

Pour répondre à l'objectif **R2** (construire la décision globale à partir des prédictions élémentaires) tout en respectant **R3** (préserver la pureté des caractéristiques locales), TAIL-MIL orchestre une double agrégation ascendante.

### Étape 1 : Agrégation des VI-TPIM vers le TPIM

Pour chaque variable $j$ au pas de temps $i$, une tête de classification $p_i$ calcule un score d'anomalie directement depuis l'embedding local non corrompu :

$$
\hat{y}_{(i, j)} = p_i(f(X_{(i, j)})) \in [0, 1]
$$

Ce score scalaire estime la probabilité intrinsèque que la cellule $(i, j)$ soit anormale. Les poids de **V-Attention** $m_{(i, j)}$ pondèrent ensuite ces estimations pour former la prédiction au niveau du pas de temps $i$ :

$$
g_i(X_i) = \sum_{j=1}^T m_{(i, j)} \, \hat{y}_{(i, j)}
$$

### Étape 2 : Agrégation des TPIM vers le TAB

De façon symétrique, la prédiction globale pour l'ensemble du sac temporel (le TAB) est obtenue en pondérant les prédictions $g_i(X_i)$ par les poids de **T-Attention** $m_i$ :

$$
g(X) = \sum_{i=1}^N m_i \, g_i(X_i)
$$

Le résultat $g(X)$ constitue la prédiction finale de l'échantillon.

```
VI-TPIM (variables)  : ŷ_(i,j) = p_i(f(X_(i,j)))
      │
      ▼  (Pondération par V-Attention : m_(i,j))
TPIM (pas de temps)  : g_i(X_i) = Σ m_(i,j) ŷ_(i,j)
      │
      ▼  (Pondération par T-Attention : m_i)
TAB (séquence)       : g(X)     = Σ m_i g_i(X_i)
```

Grâce à cette formulation, un gradient calculé à partir de la fonction de perte appliquée sur $g(X)$ se rétropropage à travers tous les niveaux hiérarchiques. Le modèle apprend ainsi à localiser les instants et les capteurs anormaux sans avoir jamais reçu d'annotations fines à ces échelles durant l'entraînement.

---

## Vue d'ensemble de l'architecture

Le schéma suivant illustre l'interaction entre les flux d'attention contextuelle et les flux de prédictions locales indépendantes :

![Architecture générale de TAIL-MIL](/images/blog/tail-mil-architecture.png)
*Figure 1 : Architecture générale de TAIL-MIL (reproduite d'après Jang & Kwon, AAAI 2025).*

---

## Conclusion

L'architecture TAIL-MIL apporte une réponse élégante et rigoureuse au défi de la détection et de la localisation d'anomalies multivariées sous supervision faible :

1. **Exploitation contextuelle ciblée :** T-Attention et V-Attention capturent les interdépendances temporelles et inter-variables pour attribuer des poids d'attention pertinents.
2. **Supervision ascendante :** La décision globale est une combinaison linéaire directe des prédictions locales, garantissant une interprétabilité native et une détection multi-échelle.
3. **Conservation de l'information locale :** Les scores élémentaires sont calculés sur des représentations non déformées par le contexte lointain, évitant de noyer un signal anormal local dans du bruit environnant.

---

## Référence

- **J.~Jang et H.-Y.~Kwon**, *TAIL-MIL: Time-Aware and Instance-Learnable Multiple Instance Learning for Multivariate Time Series Anomaly Detection*, Proceedings of the AAAI Conference on Artificial Intelligence, vol. 39, n° 17, p. 17582–17589, 2025.

import re

filepath = r"src\content\dossiers\build-llm-from-scratch\chapitre-3-mecanismes-attention.mdx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    ("### Introduction", "## Introduction"),
    ("### Le problème de la modélisation des longues séquences", "## Le problème de la modélisation des longues séquences"),
    ("### Capturer les dépendances avec les mécanismes d'attention", "## Capturer les dépendances avec les mécanismes d'attention"),
    ("### La self-attention : porter attention à différentes parties de l'entrée", "## La self-attention"),
    ("### Self-attention simplifiée - sans poids apprenables", "### Self-attention simplifiée (sans poids)"),
    ("### Généralisation - poids d'attention pour tous les tokens", "#### Généralisation - poids d'attention pour tous les tokens"),
    ("### Calcul pas à pas", "#### Calcul pas à pas"),
    ("## Encapsulation en classe Python", "## Implémentation : La classe SelfAttention"),
    ("### Version améliorée : `SelfAttention_v2` avec `nn.Linear`", "#### Version améliorée avec nn.Linear"),
    ("## Masquer les tokens futurs avec l'attention causale", "## L'attention causale"),
    ("## Appliquer un masque d'attention causale", "### Appliquer un masque causal"),
    ("### Approche naïve : masquer après softmax", "#### Approche naïve : masquer après softmax"),
    ("### Cadre et notations", "#### Cadre et notations"),
    ("### Méthode 1 - Softmax global, puis masquage et renormalisation", "#### Méthode 1 - Softmax global, puis masquage et renormalisation"),
    ("### Méthode 2 - Masquage des scores bruts avant le softmax", "#### Méthode 2 - Masquage des scores bruts avant le softmax"),
    (r"### Équivalence des deux méthodes", r"#### Équivalence des deux méthodes"),
    (r"### Approche efficace : masquer avant softmax avec $-\infty$", r"#### Approche efficace : masquer avant softmax avec $-\infty$"),
    (r"## Masquer des poids d'attention supplémentaires avec le dropout", r"### Ajouter du Dropout"),
    ("### Mise à l'échelle automatique", "#### Mise à l'échelle automatique"),
    ("### Application aux poids d'attention causale", "#### Application aux poids d'attention causale"),
    ("## Implémenter une classe d'attention causale compacte", "### Classe finale d'attention causale"),
    ("### Le code", "#### Le code"),
    ("### Point 1 - `register_buffer` : qu'est-ce que c'est et pourquoi ?", "#### Point 1 - `register_buffer`"),
    ("### Point 2 - Anatomie du code de masquage", "#### Point 2 - Anatomie du code de masquage"),
    ("### Point 3 - `keys.transpose(1, 2)` au lieu de `keys.T`", "#### Point 3 - `keys.transpose(1, 2)` au lieu de `keys.T`"),
    ("## Étendre l'attention mono-tête à l'attention multi-têtes", "## L'attention multi-têtes"),
    ("## Empiler plusieurs modules d'attention mono-tête", "### Empiler plusieurs modules mono-tête"),
    ("### L'idée", "#### L'idée"),
    ("### Implémentation", "#### Implémentation"),
    ("### Exemple", "#### Exemple"),
    ("### Limite de cette approche", "#### Limite de cette approche"),
    ("## Implémentation efficace par découpe de poids", "### Implémentation efficace (MultiheadAttention)"),
    ("### Étape 1 - Projection unique : `(b, num_tokens, d_in)`   `(b, num_tokens, d_out)`", "#### Étape 1 - Projection unique"),
    ("### Étape 2 - Découpe par tête via `.view()` : `(b, num_tokens, d_out)`   `(b, num_tokens, H, d_h)`", "#### Étape 2 - Découpe par tête"),
    ("### Étape 3 - Réorganisation par tête via `.transpose(1, 2)` : `(b, num_tokens, H, d_h)`   `(b, H, num_tokens, d_h)`", "#### Étape 3 - Réorganisation par tête"),
    ("### Étape 4 - Scores d'attention par multiplication par lots", "#### Étape 4 - Scores d'attention"),
    ("### Étape 5 - Recombinaison des têtes", "#### Étape 5 - Recombinaison des têtes"),
    ("## Exercice 3.3 - Initialisation d'un module d'attention de taille GPT-2", "## Exercice : Module d'attention GPT-2"),
    ("### Énoncé", "#### Énoncé"),
    ("### Solution", "#### Solution"),
    ("## Résumé du chapitre 3", "## Résumé")
]

for old, new in replacements:
    content = content.replace('\n' + old + '\n', '\n' + new + '\n')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Headings restructured successfully.")

filepath = r"src\content\dossiers\build-llm-from-scratch\chapitre-3-mecanismes-attention.mdx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    # 3.3
    ("## La self-attention", "## La self-attention : porter attention à différentes parties de l'entrée"),
    
    # 3.4
    ("### Self-attention avec poids apprenables", "## Implémentation de la self-attention avec des poids apprenables"),
    ("#### Calcul pas à pas", "### Calcul des poids d'attention étape par étape"),
    ("## Implémentation : La classe SelfAttention", "### Implémentation d'une classe Python compacte de self-attention"),
    
    # 3.5
    ("## L'attention causale", "## Masquer les mots futurs avec l'attention causale"),
    ("### Appliquer un masque causal", "### Application d'un masque d'attention causale"),
    ("### Méthode 1 - Softmax global, puis masquage et renormalisation", "#### Méthode 1 - Softmax global, puis masquage et renormalisation"),
    ("### Méthode 2 - Masquage des scores bruts avant le softmax", "#### Méthode 2 - Masquage des scores bruts avant le softmax"),
    ("### Ajouter du Dropout", "### Masquage de poids d'attention supplémentaires avec le dropout"),
    ("### Classe finale d'attention causale", "### Implémentation d'une classe d'attention causale compacte"),
    ("### Point 1 - `register_buffer` : qu'est-ce que c'est et pourquoi ?", "#### Point 1 - `register_buffer` : qu'est-ce que c'est et pourquoi ?"),
    ("### Point 2 - Anatomie du code de masquage", "#### Point 2 - Anatomie du code de masquage"),
    ("### Point 3 - `keys.transpose(1, 2)` au lieu de `keys.T`", "#### Point 3 - `keys.transpose(1, 2)` au lieu de `keys.T`"),

    # 3.6
    ("## L'attention multi-têtes", "## Extension de l'attention mono-tête à l'attention multi-têtes"),
    ("### Empiler plusieurs modules mono-tête", "### Empilement de plusieurs couches d'attention mono-tête"),
    ("### Implémentation efficace (MultiheadAttention)", "### Implémentation de l'attention multi-têtes avec fractionnement des poids"),
    ("### Étape 1 - Projection unique : `(b, num_tokens, d_in)`   `(b, num_tokens, d_out)`", "#### Étape 1 - Projection unique : `(b, num_tokens, d_in)`   `(b, num_tokens, d_out)`"),
    ("### Étape 2 - Découpe par tête via `.view()` : `(b, num_tokens, d_out)`   `(b, num_tokens, H, d_h)`", "#### Étape 2 - Découpe par tête via `.view()` : `(b, num_tokens, d_out)`   `(b, num_tokens, H, d_h)`"),
    ("### Étape 3 - Réorganisation par tête via `.transpose(1, 2)` : `(b, num_tokens, H, d_h)`   `(b, H, num_tokens, d_h)`", "#### Étape 3 - Réorganisation par tête via `.transpose(1, 2)` : `(b, num_tokens, H, d_h)`   `(b, H, num_tokens, d_h)`"),
    ("### Étape 4 - Scores d'attention par multiplication par lots", "#### Étape 4 - Scores d'attention par multiplication par lots"),
    ("### Étape 5 - Recombinaison des têtes", "#### Étape 5 - Recombinaison des têtes"),
    
    # Exercice 3.3 should be h2
    ("## Exercice 3.3 - Initialisation d'un module d'attention de taille GPT-2", "## Exercice 3.3 - Initialisation d'un module d'attention de taille GPT-2")
]

for old, new in replacements:
    content = content.replace('\n' + old + '\n', '\n' + new + '\n')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Headings updated to match book exactly.")

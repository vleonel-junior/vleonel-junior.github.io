import re

filepath = "src/content/dossiers/build-llm-from-scratch/chapitre-0-introduction-pytorch.mdx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Insert Introduction
intro = """

## Introduction

Bienvenue dans le **Chapitre 0** de notre série dédiée à la construction d'un LLM (Large Language Model) de zéro. 
Avant de plonger dans les mécanismes d'attention et l'architecture des Transformers, nous devons maîtriser notre outil de travail principal : **PyTorch**.

PyTorch est une bibliothèque de Deep Learning extrêmement populaire, prisée pour sa flexibilité et sa manipulation intuitive des tenseurs. Dans ce chapitre préliminaire, nous allons explorer les concepts fondamentaux qui nous serviront de fondation pour tout le reste du projet :
- La création et la manipulation des **tenseurs** (les structures de données au cœur des réseaux de neurones).
- Le fonctionnement des **graphes de calcul**.
- La magie de l'**Autograd** (le moteur de différenciation automatique qui permet aux modèles d'apprendre via la descente de gradient).

Si vous êtes déjà à l'aise avec PyTorch, vous pouvez survoler ce chapitre ou passer directement au Chapitre 1. Sinon, ouvrez votre environnement Python (ou Google Colab), et commençons !

"""

# Find the end of the frontmatter (second '---')
parts = content.split("---", 2)
if len(parts) >= 3:
    # check if intro already exists to avoid duplicating
    if "Bienvenue dans le **Chapitre 0**" not in parts[2]:
        parts[2] = intro + parts[2]
    content = "---".join(parts)

# 2. Change ```text to ```output
content = content.replace("```text\n", "```output\n")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("File updated with intro and output tags.")

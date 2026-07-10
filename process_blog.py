import os

source_file = "llm-raisonnement-ebrm-jepa.md"
dest_file = "src/content/blog/llm-raisonnement-ebrm-jepa.md"

frontmatter = """---
title: "Pourquoi les LLM peinent à raisonner : les limites de l'autorégression"
description: "Ce que proposent les modèles à énergie (EBM), JEPA et les World Models pour contourner les limites structurelles des LLMs."
pubDate: 2026-07-10
author: "Léonel VODOUNOU"
category: "Analyse"
tags: ["LLM", "Raisonnement", "EBM", "JEPA", "IA"]
image: "/images/blog/ebm-logical-intelligence.png"
---

"""

with open(source_file, "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we don't duplicate the main title since we put it in frontmatter
# The original file starts with `# Pourquoi les LLM peinent à raisonner...`
lines = content.split('\n')
if lines[0].startswith('# '):
    lines = lines[1:]
    # remove any empty lines immediately following the title
    while lines and lines[0].strip() == '':
        lines = lines[1:]

content = '\n'.join(lines)

with open(dest_file, "w", encoding="utf-8") as f:
    f.write(frontmatter + content)

os.remove(source_file)
print("File processed and moved successfully.")

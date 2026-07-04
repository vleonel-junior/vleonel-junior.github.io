filepath = r"src\content\dossiers\build-llm-from-scratch\chapitre-3-mecanismes-attention.mdx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Demote these specific sub-sub sections to #### so they disappear from TOC
    if line.startswith("### Méthode 1 ") or \
       line.startswith("### Méthode 2 ") or \
       line.startswith("### Point 1 ") or \
       line.startswith("### Point 2 ") or \
       line.startswith("### Point 3 ") or \
       line.startswith("### Étape 1 ") or \
       line.startswith("### Étape 2 ") or \
       line.startswith("### Étape 3 ") or \
       line.startswith("### Étape 4 ") or \
       line.startswith("### Étape 5 "):
        line = "#" + line
    new_lines.append(line)

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Final cleanup of sub-sub headings done.")

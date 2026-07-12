import re

filepath = "src/content/dossiers/build-llm-from-scratch/chapitre-0-introduction-pytorch.mdx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Match lines that exactly start with **1.x or **2.x and end with **
# Example: **1.1 La boucle d'entraînement et son goulot d'étranglement fondamental**
# We want to replace it with:
# #### La boucle d'entraînement et son goulot d'étranglement fondamental

def replacer(match):
    # match.group(1) is the text inside
    return f"#### {match.group(1)}"

# Regex breakdown:
# ^\*\*         : starts with **
# [12]\.\d      : matches 1.1, 2.3, etc.
# \s+           : whitespace
# (.*?)         : the title text
# \*\*$         : ends with **
new_content = re.sub(r'^\*\*[12]\.\d+\s+(.*?)\*\*$', replacer, content, flags=re.MULTILINE)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Numbers removed and converted to H4.")

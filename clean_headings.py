import re

filepath = "src/content/blog/llm-raisonnement-ebrm-jepa.md"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace "## 1. ", "## 2. " etc with "## "
new_content = re.sub(r"^## \d+\.\s+", "## ", content, flags=re.MULTILINE)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Headings cleaned successfully.")

import os
import re
import urllib.request

BASE_DIR = r"C:\Users\vleon\Downloads\Portfolio-main\Portfolio-main"
SOURCE_MD = os.path.join(BASE_DIR, "temp_chap3.md")
DEST_MDX = os.path.join(BASE_DIR, "src", "content", "dossiers", "build-llm-from-scratch", "chapitre-3-coding-attention-mechanism.mdx")
IMG_DIR = os.path.join(BASE_DIR, "public", "images", "dossiers", "build-llm-from-scratch", "chapitre-3")

os.makedirs(IMG_DIR, exist_ok=True)

BASE_IMG_URL = "https://raw.githubusercontent.com/vleonel-junior/Build-a-large-language-model-from-scrach/main/Chapter%203%20Coding%20attention%20mechanism/"

with open(SOURCE_MD, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Process image blocks with captions
pattern = re.compile(
    r'<div[^>]*>\s*'
    r'!\[([^\]]*)\]\(([^)]+)\)\s*'
    r'\*(.*?)\*\s*'
    r'</div>',
    re.DOTALL
)

def replace_image_block(match):
    alt = match.group(1).strip()
    url = match.group(2).strip()
    caption = match.group(3).strip()
    
    filename = os.path.basename(url)
    download_url = BASE_IMG_URL + url
    local_img_path = os.path.join(IMG_DIR, filename)
    
    if not os.path.exists(local_img_path):
        print(f"Downloading {download_url}...")
        try:
            urllib.request.urlretrieve(download_url, local_img_path)
        except Exception as e:
            print(f"Failed to download {download_url}: {e}")
            
    new_url = f"/images/dossiers/build-llm-from-scratch/chapitre-3/{filename}"
    
    return f'''<figure class="my-8 flex flex-col items-center gap-3">
    <img src="{new_url}" alt="{alt}" class="rounded-xl shadow-2xl" />
    <figcaption class="text-sm text-center text-gray-400 italic">*{caption}*</figcaption>
</figure>'''

content = pattern.sub(replace_image_block, content)

# 2. Process any remaining images not in divs
def replace_bare_images(match):
    alt = match.group(1).strip()
    url = match.group(2).strip()
    
    filename = os.path.basename(url)
    download_url = BASE_IMG_URL + url
    local_img_path = os.path.join(IMG_DIR, filename)
    
    if not os.path.exists(local_img_path):
        print(f"Downloading {download_url}...")
        try:
            urllib.request.urlretrieve(download_url, local_img_path)
        except Exception as e:
            print(f"Failed to download {download_url}: {e}")
            
    new_url = f"/images/dossiers/build-llm-from-scratch/chapitre-3/{filename}"
    
    return f'''<figure class="my-8 flex flex-col items-center gap-3">
    <img src="{new_url}" alt="{alt}" class="rounded-xl shadow-2xl" />
</figure>'''

bare_pattern = re.compile(r'^!\[([^\]]*)\]\(([^)]+)\)$', re.MULTILINE)
content = bare_pattern.sub(replace_bare_images, content)

# 3. Strip manual numbering from headings (reusing previous logic)
def strip_manual_numbers(content):
    content = re.sub(r'^(#{2,3})\s+(?:\d+(?:\.\d+)*[\.\-]?)\s+(.+)$', r'\1 \2', content, flags=re.MULTILINE)
    content = re.sub(r'^(#{2,3})\s+(?:[a-zA-Z]\.)\s+(.+)$', r'\1 \2', content, flags=re.MULTILINE)
    content = re.sub(r'^(#{2,3})\s+(?:Partie [IVX]+ [–\-])\s+(.+)$', r'\1 \2', content, flags=re.MULTILINE)
    return content

# Also promote Chapter 3 specific subheadings if any orphaned ones exist (we'll just apply basic stripping for now)
content = strip_manual_numbers(content)

# Remove the title '## Chapitre 3 — Mécanismes d'attention' at the very beginning to avoid duplicate h1/h2
content = re.sub(r'^## Chapitre 3[^\n]*\n+', '', content, flags=re.MULTILINE)

# 4. Prepend frontmatter
frontmatter = """---
title: "Mécanismes d'attention"
description: "Plongée au cœur de l'architecture des LLMs : self-attention simplifiée, poids apprenables, attention causale et multi-têtes."
pubDate: 2026-06-27
author: "Léonel VODOUNOU"
dossier: "build-llm-from-scratch"
chapter: 3
order: 3
tags: ["PyTorch", "Attention", "Transformer", "Deep Learning"]
draft: false
---

"""

final_content = frontmatter + content

with open(DEST_MDX, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Chapter 3 MDX created successfully.")

import os

target_file = "src/content/dossiers/build-llm-from-scratch/chapitre-0-introduction-pytorch.mdx"
chunks_dir = "chap0_chunks"

with open(target_file, "w", encoding="utf-8") as outfile:
    for i in range(6):  # 0 to 5
        chunk_path = os.path.join(chunks_dir, f"chunk_{i}.mdx")
        if os.path.exists(chunk_path):
            with open(chunk_path, "r", encoding="utf-8") as infile:
                outfile.write(infile.read())
        else:
            print(f"Warning: {chunk_path} not found!")

print("Chunks merged successfully.")

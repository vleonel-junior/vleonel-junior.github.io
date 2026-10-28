---
title: "The P vs NP Problem, Explained Simply"
description: "P = NP. Does that ring a bell? A quick overview of one of the greatest mysteries in computer science."
pubDate: 2026-10-28
author: "Léonel VODOUNOU"
category: "Theoretical Computer Science"
lang: "en"
tags: ["Theoretical Computer Science", "Complexity Theory", "Algorithms"]
image: "/images/blog/p-vs-np.png"
draft: false
---

It is the "Holy Grail" of theoretical computer science: the famous **P vs NP** problem, which also happens to be worth a cool \$1,000,000 (as one of the Millennium Prize Problems).

![Homer Simpson facing the P=NP equation in a 3D grid](/images/blog/p-vs-np.png)

### 1. Class P ("Polynomial"): Problems That Are Easy to Solve

These are problems for which a computer can find a solution **quickly** (in polynomial time—that is, reasonable, even as the input data grows).

- **Examples:** Sorting a list of millions of names alphabetically, or finding the shortest path on a GPS.
- **The key phrase:** Solving is easy.

### 2. Class NP ("Nondeterministic Polynomial"): Problems That Are Easy to *Verify*

Here, finding the solution from scratch is **extremely difficult** (it would take an insane, exponential amount of time). But note: **if someone magically hands you the solution, verifying it is child's play.**

- **The Sudoku example:** Filling in a giant 100x100 Sudoku grid from scratch requires a monstrous effort (brute-force trial and error). On the other hand, if a friend hands you the completed grid, it takes you only a few seconds to check whether every row, column, and block follows the rules.
- **The connection to P:** Every problem in class P is also in NP (because if it is easy to solve, it is obviously easy to check). But the big question is: *Is the reverse true?* Is everything that is easy to verify actually easy to solve deep down? (That is the $P = NP?$ question).

### 3. "NP-Complete" Problems: The Final Bosses of the Game

Within the broad NP family, there is an elite subcategory: **NP-complete problems**.

They have two wild characteristics:

1. They are **the hardest problems** in the entire NP category.
2. **They are all connected to each other (via reduction).** This means that if you discover a magic, ultra-fast algorithm to solve *just one* NP-complete problem, you can instantly adapt it to solve **any other NP-complete problem in the world** (the traveling salesperson, protein folding, cryptography, etc.).

That is why we say: **if $P = NP$, then solving any complex problem becomes as simple as checking a solution**.

---
title: "Why LLMs Struggle to Reason: The Limits of Autoregression"
description: "What energy-based models (EBMs), JEPA and World Models propose to get around the structural limits of LLMs."
pubDate: 2026-07-10
author: "Léonel VODOUNOU"
category: "Analysis"
lang: "en"
tags: ["LLM", "Reasoning", "EBM", "JEPA", "AI"]
image: "/images/blog/ebm-logical-intelligence.png"
---

For the past two years, every new generation of language model has been presented as one more step toward reasoning. Chain-of-thought, test-time compute, reinforcement learning on problem-solving traces: the recipe has delivered real gains on math and coding benchmarks. But a line of research, championed among others by Yann LeCun [1, 3] and by startups such as Logical Intelligence [2], puts forward a more unsettling thesis: these gains do not come from LLMs learning to reason, but from making them produce *more text before answering*. And that is not the same thing.

This article unpacks that thesis rather than simply repeating it. The goal is to understand, one idea at a time, why a token-by-token autoregressive model runs into a structural wall on certain kinds of problems, and then to look at what alternative architectures (JEPA, World Models, Energy-Based Reasoning Models) concretely propose to get around it. And, because rigor demands it, to also look at where the evidence behind these alternatives is solid, and where it is not yet.

## Three Structural Reasons, Not a Question of Model Size

There are three distinct causes behind this limitation, and they are worth separating because they are not solved in the same way or with the same tools. This three-part breakdown restates and organizes ideas that Yann LeCun has been developing for several years about the limits of current approaches to AI [1, 2].

**a) Autoregressive generation makes revision expensive.**
An LLM produces its answer token after token, from left to right, each new word conditioned on all the ones before it. It is a bit like writing a letter in pen, with no eraser and no correction fluid: once a sentence is down, going back to fix it means crossing it out and rewriting everything that follows, since the rest of the text was written with what was already there in mind. Formally, we say the model struggles with "backward" conditioning, that is, producing a line of reasoning that takes into account both the starting point and a final goal given in advance. This makes credit assignment hard: when a line of reasoning fails, it is difficult to pinpoint which earlier step caused it, and therefore to fix it without starting over.

**b) Training never scores the trace as a whole.**
Standard LLM training optimizes a single, local objective: predict the most likely next word given what came before. This is exactly where the lack of global control comes from: because the reward applies word by word, there is no point anywhere in this training where anyone checks whether the complete reasoning, once finished, holds together logically. Even the methods added afterwards to make up for this (reinforcement learning, reranking of several answers) only score the *finished* answer, never an intermediate step. The result can be observed empirically: the quality of generated reasoning degrades as it gets longer, for lack of a signal that would track its coherence along the way rather than only at the very end.

**c) The output is made of discrete units, not a continuous quantity that can be adjusted.**
This is the most abstract of the three points, but it becomes simple with an image: an ordinary light switch has only two states, on or off; there is no "slightly on" position. A dimmer, on the other hand, allows continuous adjustment, from darkest to brightest, through small gradual changes. A token produced by an LLM works like the switch: it is this word or another one, with no in-between state. You cannot ask "in which direction should the word 'cat' move to be more correct?" A word has no continuous neighborhood, only the possibility of being replaced outright by another word from the vocabulary.

This discrete nature rules out gradient descent at the moment the answer is produced. To be clear, a model at inference time has frozen weights: they are not what gets adjusted. What varies, in an energy-based architecture, is the candidate answer itself, represented as a vector in a continuous space rather than as a sequence of tokens. The mechanism works like this: an energy function E, learned during training and frozen at inference, acts as a fixed judge; we start from an initial candidate x₀ (a draft, possibly a rough one) represented as a vector; we compute the gradient of E with respect to *that vector*, not with respect to the weights, and move x₀ in the direction that lowers the energy (x₁ = x₀ − η∇E(x₀)), then repeat. This is precisely the mechanism behind diffusion models (image generation), which LeCun describes in the source interview [1]: start from a noisy point and make it converge, step by step, toward something coherent by following the gradient of an energy or score function. A reasoning EBRM does the same thing, but on a reasoning trace instead of an image.

What this makes possible, very concretely, is a piece of information that discrete outputs never provide: not just that you are wrong, but *by how much*, and *in which direction* to correct. Without it, all that remains is trial and error: produce several complete, independent versions and keep the best one, with no failed attempt telling the next one which way to go. This is a difference in efficiency, not just mathematical elegance: a system guided by a gradient generally converges in far fewer attempts than a system that has to guess each time, because every step exploits local information that sequential token generation simply cannot produce.

LeCun also ties this approach to the classic theory of problem solving in artificial intelligence [1]: an effective search system always needs two distinct components, one that proposes candidate solutions and another that assesses whether they are good *before* the solution is complete. Without that, there is no real search anymore, only independent attempts judged after the fact, exactly the "trial and error" just described. His criticism of LLMs targets precisely this point: producing several token sequences and scoring them once they are complete is, in his view, only a very primitive form of this search, which should ideally run in a continuous representation space rather than in the space of language itself [1].

## JEPA and World Models: Learning a Representation of the World

Faced with this diagnosis, LeCun's approach is first and foremost *perceptual* [1]. Rather than training a model to reconstruct every detail of what it observes (the classic generative approach), we train an encoder to produce an abstract representation that discards whatever is unpredictable anyway, and a predictor that works in this more compact abstract space. The example LeCun uses to illustrate this principle comes from physics: the ideal gas law (PV = nRT) says nothing about the individual position or velocity of each gas molecule. It deliberately throws that information away and makes predictions from just a few aggregate variables (pressure, volume, temperature). This controlled removal of unpredictable detail lies, he argues, at the root of science, and arguably at the root of intelligence [1].

A World Model goes further: it learns a state → action → next state transition, which makes it possible to plan through optimization: specify a target state and search, in the representation space, for the sequence of interventions that leads there. It is a general framework that reaches well beyond text: it applies to robotics, physical simulation and materials design.

## Kona Against the Facts

Logical Intelligence applies this principle to reasoning traces through its Kona model [2]. The only public result that directly concerns Kona is a demo in which it clearly outperforms several standard LLMs on a small, finite-state logic problem, which can be tried live on their website [5]. This result has not been through a third-party audit or an independent leaderboard: the company sets the protocol and reports the number. It illustrates the architectural gap one would expect between the two approaches, but on a case too narrow to draw general conclusions about real-world systems that are far more complex and often poorly specified.

## Summary

The diagnosis of the structural limits of autoregressive LLMs rests on two sources with no shared commercial interest (Yann LeCun from the angle of world representation [1], Logical Intelligence from the angle of symbolic reasoning [2]), and one of them is a peer-reviewed academic publication [1]. The diagnosis therefore looks solid.

What remains open, in light of the previous section, is a precise empirical question: does the energy-based architecture generalize beyond a bounded problem to the real, complex and often poorly specified systems that the company names as long-term targets (semiconductor design, industrial control systems, financial planning)? None of the available sources answers it yet, one way or the other.

---

## Sources

**[1]** LeCun, Y. & Manyika, J. M. (2026). "Learning Abstractions: A Conversation with Yann LeCun." *Dædalus*, Winter/Spring 2026. American Academy of Arts & Sciences.
https://www.amacad.org/publication/daedalus/learning-abstractions-conversation-yann-lecun
*(Peer-reviewed academic publication. Main primary source on JEPA/World Models.)*

**[2]** Bodnia, E. & Hanin, B. (January 21, 2026). "Energy-Based Models for Reasoning, LLMs for the Interface: Scaling Reasoning with Agentic AI." Logical Intelligence blog.
https://logicalintelligence.com/blog/energy-based-models-for-reasoning
*(Company position piece. Presents the overall architectural vision, to be distinguished from the empirical results below.)*

**[3]** Stefani, M. (May 24, 2026). « #543 – Yann Le Cun – AMI Labs – Rendre l'IA plus humaine. » *Génération Do It Yourself* podcast (in French).
https://www.gdiy.fr/podcast/yann-lecun/
*(General-audience interview. Useful for LeCun's biographical and institutional background.)*

**[4]** FW.MEDIA editorial team (November 24, 2025). « AI: Connaissez-vous les Joint Embedding Predictive Architectures (JEPA) et les World Models ? » FW.Media / FrenchWeb (in French).
https://www.frenchweb.fr/ai-connaissez-vous-les-joint-embedding-predictive-architectures-jepa-et-les-world-models/458786
*(Second-hand journalistic popularization. Not to be cited as a primary technical source.)*

**[5]** Logical Intelligence (February 3, 2026). "EBM vs. LLMs: Our Kona EBM a 96% vs. 2% Sudoku Benchmark."
https://logicalintelligence.com/blog/energy-based-model-sudoku-demo (interactive demo: https://sudoku.logicalintelligence.com/)
*(Company post with a live public demo, limited to a small bounded problem, with no independent third-party audit of the number.)*

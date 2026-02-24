---
title: "From Math to Models"
description: "On studying machine learning in depth — from formal foundations to systems that truly work."
pubDate: 2026-02-23
author: "Léonel VODOUNOU"
category: "Prologue"
tags: ["Machine Learning", "Philosophy", "Research"]
---

## Introduction

This post does not introduce a model, a dataset, or a new technique. It introduces a commitment. A way of working that I am choosing deliberately — as I try to grow into the kind of engineer, and hopefully researcher, who understands what they build all the way down.

## The Frustration That Keeps Returning

There is something that keeps bothering me in machine learning. On one side, you have fast tutorials. You load data, define a model, call `fit()`, and the numbers improve. It works — but the mechanism remains opaque. On the other side, you have research papers. Dense notation. Implicit assumptions. Derivations that skip the steps you actually needed to see. Between those two worlds, there is a gap. A place where you can *use* models without truly understanding them.

For a while, I accepted that. But over time, I realized something: when things stop working — when training becomes unstable, when generalization fails, when scaling breaks assumptions — surface knowledge collapses quickly. What remains useful is structural understanding.

Knowing not just that Adam works, but that it keeps a running estimate of first and second moments of the gradient. Knowing not just that diffusion models generate samples, but what stochastic process they approximate. Knowing not just that attention improves performance, but what problem it relaxes in sequence modeling.

That difference matters. This blog exists because I want to close that gap — first for myself, and hopefully for anyone who reads along.

## What This Blog Is — and Is Not

Let me be clear. This is not a trend-following blog. I am not trying to comment on every new paper that appears. I would rather understand one idea deeply than skim ten. This is not a shortcut blog. If you are looking for the fastest path to a leaderboard result, there are better places.

This is a working notebook in public. It is where I will document my understanding of the models I encounter, the papers I read, and the systems I try to build. Each post will focus on one concept at a time — sometimes classical, sometimes recent — and unpack it carefully:

* What problem does it solve?
* What mathematics supports it?
* What intuition makes it click?
* What happens when you implement it yourself?

The ambition is simple to state and difficult to achieve: To move fluently from mathematical formulation to conceptual clarity to implementation to something that actually runs and can be extended.

## How Each Deep Dive Will Work

Each post will follow a recurring structure. Not rigid, but disciplined.

### 1. Begin with the Foundations

We start with the formalism. If a method arises from optimizing a specific objective, we derive it. If it approximates a cleaner mathematical object, we describe that object first. If assumptions are made, we state them clearly. The math is not there to intimidate. It is there to remove ambiguity. When the formalism is understood, the method stops feeling like magic.

### 2. Build the Intuition

Formal derivations are necessary — but insufficient. After the equations, I will always ask: What is actually happening here? What is the mental model? What is the geometric picture? What is the one core idea that survives when the notation fades?

Intuition is what lets you adapt knowledge. It is what allows transfer from one domain to another. Without it, formulas remain isolated facts.

### 3. Rebuild from Scratch

Implementation is the real test. Not calling a high-level API — but reconstructing the method from its equations. Every update rule justified. Every approximation examined. This is where understanding becomes concrete.

It is also where hidden gaps appear: details omitted in the paper, numerical instabilities, implicit design decisions, and trade-offs that only emerge in practice. Rebuilding from scratch forces honesty. If something cannot be implemented from first principles, it is not yet understood.

### 4. Push Beyond the Paper

Once the method works, the real questions begin. Where does it break? What assumptions limit it? What would happen if we relaxed them? How does it connect to ideas we already know? This is the step that turns understanding into research thinking. Even if the answer is incomplete, asking the question changes how you read the next paper.

## Conclusion

Working privately allows shortcuts. Working publicly forces precision. When you write something down clearly, you quickly discover what you do not understand.

This blog is, in a sense, a constraint I am placing on myself. A commitment to depth over speed. To foundations over trends. To rebuilding rather than merely using.

Long term, I want to become the kind of engineer — or researcher — who can start from a mathematical formulation and carry it all the way to a working system. Someone comfortable with stochastic processes and optimization on paper, but equally comfortable debugging a training loop at 2 a.m. This blog is part of that path.

The first deep dive is coming soon.

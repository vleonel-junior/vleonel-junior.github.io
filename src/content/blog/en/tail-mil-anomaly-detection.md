---
title: "Understanding TAIL-MIL: Dissecting a Hierarchical Architecture for Multivariate Time Series Anomaly Detection"
description: "How TAIL-MIL combines T-Attention and V-Attention to detect and pinpoint anomalies at the window, time-step, and individual variable levels."
pubDate: 2026-10-17
author: "Léonel VODOUNOU"
category: "Deep Learning"
lang: "en"
tags: ["Time Series", "Anomaly Detection", "Multiple Instance Learning", "Deep Learning", "Attention"]
image: "/images/blog/tail-mil-architecture.png"
draft: false
---

## Introduction

Anomaly detection in multivariate time series is not just about flagging whether something went wrong; it is also about pinpointing **when** the anomaly occurred and **which variables** caused it. This fine-grained localization is critical when monitoring complex systems featuring dozens or hundreds of concurrent sensors.

However, having a sequence-level label indicating that a full temporal window is abnormal does not tell us the exact timestamps or the specific metrics responsible. Gathering point-wise and variable-wise labels is notoriously labor-intensive and costly. **Multiple Instance Learning (MIL)** offers an appealing framework for this weakly supervised setting: models are trained using only coarse sequence-level annotations while learning to localize anomalies at finer granularities.

Against this backdrop, Jang and Kwon introduced **TAIL-MIL** (*Time-Aware and Instance-Learnable Multiple Instance Learning for Multivariate Time Series Anomaly Detection*), an architecture designed to detect anomalies across multiple levels of abstraction in multivariate time series. The authors formulate time series data as a two-dimensional hierarchical structure: a full temporal window, called a **Time-Aware Bag** (TAB), consists of multiple time-step instances (**Time-Point Instances in Multivariate data**, TPIM), each comprising variable-level instances (**Variate Instances in TPIM**, VI-TPIM).

The goal is to design a unified model that predicts whether a temporal window is abnormal, pinpoints the timestamps involved, and identifies the anomalous variables. To achieve this, the authors establish three core research objectives:

- **R1 — Model instance relationships:** The attention mechanism must take into account interactions across VI-TPIMs belonging to different TPIMs to fully capture temporal dependencies.
- **R2 — Build bag-level predictions directly from instance predictions:** Bag-level (TAB) decisions must be derived directly from fine-grained instance predictions, unifying global anomaly detection and local fault localization.
- **R3 — Preserve local feature integrity:** Individual predictions must be computed from original, uncorrupted instance embeddings, without being distorted by context injected from other time steps.

To satisfy these three requirements, TAIL-MIL couples two distinct attention modules — **T-Attention** and **V-Attention** — with a bottom-up hierarchical aggregation scheme.

---

## Hierarchical Problem Formulation

Consider a temporal window (TAB) $X = [X_1, X_2, \dots, X_N]$, where each $X_i$ represents the $i$-th TPIM (time step).

Each TPIM is composed of $T$ variables (the VI-TPIMs):

$$
X_i = [X_{(i, 1)}, X_{(i, 2)}, \dots, X_{(i, T)}]
$$

where $X_{(i, j)}$ denotes the value of variable $j$ at time step $i$.

The model must jointly learn:
1. Which specific variable-time cell $(i, j)$ is abnormal.
2. Which time step $i$ is abnormal.
3. Whether the overall bag (TAB) is abnormal.

### The Underlying Boolean Logic

Ideally, the decision follows a nested disjunction ($\text{OR}$ logic):

1. **VI-TPIM $\longrightarrow$ TPIM Level:**
   A time step is anomalous if at least one of its constituent variables behaves abnormally:

   $$
   g_i(X_i) = \begin{cases} 1 & \text{if at least one VI-TPIM is abnormal} \\ 0 & \text{otherwise} \end{cases}
   $$

   Formally: $\text{TPIM}_i = \text{OR}(X_{(i, 1)}, X_{(i, 2)}, \dots, X_{(i, T)})$.

2. **TPIM $\longrightarrow$ TAB Level:**
   A temporal window is anomalous if at least one time step within it is abnormal:

   $$
   g(X) = \begin{cases} 1 & \text{if at least one TPIM is abnormal} \\ 0 & \text{otherwise} \end{cases}
   $$

The complete decision pipeline is therefore:

$$
\text{VI-TPIM} \xrightarrow{\text{OR}} \text{TPIM} \xrightarrow{\text{OR}} \text{TAB}
$$

TAIL-MIL builds a smooth, learnable, and fully differentiable approximation of this logical hierarchy, supervised exclusively by coarse bag-level labels.

---

## Attention Mechanisms: T-Attention and V-Attention

### 1. T-Attention (Temporal Level)

The first attention module operates across the TPIMs within a TAB ($X_1, X_2, \dots, X_N$). Its purpose is to fulfill objective **R1**: every time step $X_i$ must be evaluated within the context of the entire window rather than in isolation.

Let $X_i \in \mathbb{R}^T$ be a given TPIM. We first extract its latent feature vector through an encoder $f$:

$$
h_i = f(X_i) \in \mathbb{R}^L
$$

For the entire window $X$, the representation matrix is:

$$
f(X) = [h_1, h_2, \dots, h_N] \in \mathbb{R}^{L \times N}
$$

where $L$ is the embedding dimension and $N$ is the number of time points in the TAB.

Two learnable projections are introduced:

- A vector $W \in \mathbb{R}^{L \times 1}$: the inner product $W^\top h_i$ produces a scalar. $W$ summarizes each $L$-dimensional representation into a single value. Across all TPIMs, $W^\top f(X) \in \mathbb{R}^{1 \times N}$, with sigmoid $\sigma$ bounding each score between $0$ and $1$.
- A matrix $V \in \mathbb{R}^{L \times N}$: the projection $V^\top h_i$ yields an $N$-dimensional vector. Across the entire TAB, this produces an $N \times N$ matrix whose entries are bounded between $0$ and $1$ via $\sigma(V^\top f(X))$.

The attention scores are then computed as:

$$
m(X) = \text{softmax}\left(\frac{\sigma(W^\top f(X)) \, \sigma(V^\top f(X))}{\sqrt{N}}\right)
$$

> **Scaling factor:** The $\frac{1}{\sqrt{N}}$ term mitigates dot-product growth, preventing the softmax function from saturating as window length $N$ increases.

To see the interaction clearly, let:

$$
\sigma(W^\top f(X)) = [a_1, a_2, \dots, a_N] \in \mathbb{R}^{1 \times N}
$$

and

$$
\sigma(V^\top f(X)) = \begin{bmatrix}
b_{1,1} & b_{1,2} & \dots & b_{1,N} \\
b_{2,1} & b_{2,2} & \dots & b_{2,N} \\
\vdots  & \vdots  & \ddots & \vdots  \\
b_{N,1} & b_{N,2} & \dots & b_{N,N}
\end{bmatrix} \in \mathbb{R}^{N \times N}
$$

For the $j$-th time point, the unnormalized score is:

$$
s_j = \frac{1}{\sqrt{N}} \sum_{k=1}^N a_k b_{k, j}
$$

Each score $s_j$ reflects contributions from all other time steps ($a_k$). Finally, the softmax operation normalizes these scores into attention weights:

$$
m_j = \frac{e^{s_j}}{\sum_{k=1}^N e^{s_k}}, \quad \text{with } \sum_{j=1}^N m_j = 1
$$

This design allows **T-Attention** to dynamically weigh time points based on temporal dependencies.

---

### 2. V-Attention (Variate Level)

While T-Attention operates across time steps, **V-Attention** focuses inside each TPIM to quantify the relative significance of each variable.

In multivariate time series, a variable's current state is heavily influenced by its recent trajectory. To account for this without corrupting the local embeddings required for instance-level predictions, V-Attention introduces a temporal receptive field ($RF$) for each variable:

$$
RF_{(i, j)} = \begin{cases}
f(X_{(i, j)}) & \text{if } i < n \\
\frac{f(X_{(i, j)}) + \sum_{t=1}^{n-1} RF_{(i-t, j)}}{n} & \text{otherwise}
\end{cases}
$$

In the original paper, the authors set $n=2$, yielding:
- For $i = 1$: $RF_{(1, j)} = f(X_{(1, j)})$
- For $i \geq 2$: $RF_{(i, j)} = \frac{f(X_{(i, j)}) + RF_{(i-1, j)}}{2}$

Consider a TPIM with $T$ variables. Let $h_{(i, j)} = f(X_{(i, j)}) \in \mathbb{R}^L$ denote the local feature embedding, and $r_{(i, j)} = RF_{(i, j)} \in \mathbb{R}^L$ the context-aware embedding. We form the corresponding matrices:

$$
H_i = \begin{bmatrix}
\vert & \vert & & \vert \\
h_{(i, 1)} & h_{(i, 2)} & \cdots & h_{(i, T)} \\
\vert & \vert & & \vert
\end{bmatrix} \in \mathbb{R}^{L \times T}, \quad
R_i = \begin{bmatrix}
\vert & \vert & & \vert \\
r_{(i, 1)} & r_{(i, 2)} & \cdots & r_{(i, T)} \\
\vert & \vert & & \vert
\end{bmatrix} \in \mathbb{R}^{L \times T}
$$

The V-Attention weights are computed in three steps:

1. **Context-Aware Projection:** With $W \in \mathbb{R}^{L \times 1}$,
   $$
   A_i = \sigma(W^\top R_i) \in \mathbb{R}^{1 \times T}
   $$
   This scores the historical relevance of each variable, bounded in $[0, 1]$.

2. **Instantaneous Feature Projection:** With $V \in \mathbb{R}^{L \times T}$,
   $$
   B_i = \sigma(V^\top H_i) \in \mathbb{R}^{T \times T}
   $$
   This matrix captures instantaneous correlations across the $T$ variables.

3. **Combination and Normalization:**
   The joint attention score vector is:
   $$
   S_i = \frac{A_i B_i}{\sqrt{T}} = \frac{\sigma(W^\top R_i) \, \sigma(V^\top H_i)}{\sqrt{T}} \in \mathbb{R}^{1 \times T}
   $$
   Here, $\sqrt{T}$ scales the dot products relative to the number of variables $T$.

The final attention weights per variable for TPIM $i$ are obtained through softmax:

$$
m_i(X_i) = \text{softmax}(S_i) = [m_{(i, 1)}, m_{(i, 2)}, \dots, m_{(i, T)}]
$$

where $m_{(i, j)} \ge 0$ and $\sum_{j=1}^T m_{(i, j)} = 1$.

---

## Hierarchical Prediction Aggregation

To fulfill **R2** (building global predictions from instance-level outputs) while maintaining **R3** (preserving local feature representations), TAIL-MIL employs a two-tier bottom-up aggregation scheme.

### Step 1: Aggregating VI-TPIMs into TPIM Predictions

For each variable $j$ at time step $i$, a lightweight classification head $p_i$ computes an anomaly score directly from its uncorrupted local embedding:

$$
\hat{y}_{(i, j)} = p_i(f(X_{(i, j)})) \in [0, 1]
$$

This scalar value represents the likelihood that cell $(i, j)$ is anomalous. The **V-Attention** weights $m_{(i, j)}$ then aggregate these local predictions into an overall score for time step $i$:

$$
g_i(X_i) = \sum_{j=1}^T m_{(i, j)} \, \hat{y}_{(i, j)}
$$

### Step 2: Aggregating TPIMs into the TAB Prediction

In a symmetric manner, the final bag-level prediction for the entire temporal window is computed by weighting the time-step predictions $g_i(X_i)$ with the **T-Attention** weights $m_i$:

$$
g(X) = \sum_{i=1}^N m_i \, g_i(X_i)
$$

The scalar $g(X)$ serves as the sequence-level anomaly prediction.

```
VI-TPIM (variables)  : ŷ_(i,j) = p_i(f(X_(i,j)))
      │
      ▼  (Weighted by V-Attention: m_(i,j))
TPIM (time steps)    : g_i(X_i) = Σ m_(i,j) ŷ_(i,j)
      │
      ▼  (Weighted by T-Attention: m_i)
TAB (sequence)       : g(X)     = Σ m_i g_i(X_i)
```

Through this hierarchical structure, gradients computed from the bag-level loss propagate back through both attention modules and down to the individual variable heads. Consequently, the network learns to localize abnormal timestamps and sensors accurately without requiring any fine-grained labels during training.

---

## Architecture Overview

The diagram below illustrates how context-aware attention branches and independent local prediction heads interact within TAIL-MIL:

![General architecture of TAIL-MIL](/images/blog/tail-mil-architecture.png)
*Figure 1: General architecture of TAIL-MIL (adapted from Jang & Kwon, AAAI 2025).*

---

## Conclusion

TAIL-MIL offers an elegant and principled solution for multivariate time series anomaly detection and localization under weak supervision:

1. **Targeted Context Modeling:** T-Attention and V-Attention capture temporal patterns and inter-variable correlations to distribute attention weights appropriately.
2. **Bottom-Up Supervision:** Sequence-level decisions are linear combinations of instance-level predictions, delivering native interpretability and multi-scale detection.
3. **Local Signal Preservation:** Elementary scores are calculated on untampered local representations, preventing localized anomaly signals from being washed out by surrounding noise.

---

## Reference

- **J.~Jang and H.-Y.~Kwon**, *TAIL-MIL: Time-Aware and Instance-Learnable Multiple Instance Learning for Multivariate Time Series Anomaly Detection*, Proceedings of the AAAI Conference on Artificial Intelligence, vol. 39, no. 17, pp. 17582–17589, 2025.

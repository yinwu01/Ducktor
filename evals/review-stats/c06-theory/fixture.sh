#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{A Tight Lower Bound for Private Mean Estimation in High Dimensions}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We prove that any $(\varepsilon,\delta)$-differentially private estimator of the mean of a $d$-dimensional Gaussian with identity covariance needs $\Omega(d/(\alpha\varepsilon))$ samples to reach error $\alpha$, matching known upper bounds up to constants.
\end{abstract}
\section{Introduction}
Private mean estimation is a basic task in private statistics. Upper bounds are known, but lower bounds have a gap of a logarithmic factor.
\section{Main result}
\textbf{Theorem 1.} For every $(\varepsilon,\delta)$-DP estimator $M$ with $\delta \le 1/n^2$, if $\mathbb{E}\|M(X)-\mu\|_2 \le \alpha$ for all $\mu$, then $n = \Omega(d/(\alpha\varepsilon))$.
\section{Proof}
We use a fingerprinting argument. Let $\mu$ be drawn uniformly from $[-1,1]^d$ and consider the correlation between each sample and the estimator's output. Summing the per-coordinate fingerprinting bound over $d$ coordinates and applying the privacy constraint to each sample gives the claim.
\section{Conclusion}
Our bound closes the logarithmic gap for Gaussian mean estimation. The paper contains no experiments.

\end{document}
EOF_TEX

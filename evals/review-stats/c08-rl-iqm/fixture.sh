#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Value Prefetching for Sample-Efficient Atari Agents}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We propose value prefetching, which bootstraps targets from a slowly updated copy of the critic trained on future frames. On Atari 100k, it raises the interquartile mean human-normalized score from 0.38 to 0.47.
\end{abstract}
\section{Introduction}
Sample-efficient agents on Atari 100k are evaluated with few runs, so reported gains are often within noise. We follow the protocol of Agarwal et al. (2021).
\section{Method}
The prefetched critic is trained on frames up to 10 steps ahead and updated with an exponential moving average of 0.995.
\section{Experiments}
We run 10 seeds per game on all 26 games. We report the interquartile mean (IQM) of human-normalized scores with 95\% stratified bootstrap confidence intervals.
\begin{table}[t]
\centering
\caption{IQM human-normalized score on Atari 100k, 10 runs per game, 95\% stratified bootstrap CIs.}
\label{tab:main}
\begin{tabular}{lc}
Method & IQM \\
SPR & 0.38 [0.35, 0.41] \\
Value prefetching (ours) & \textbf{0.47} [0.44, 0.50] \\
\end{tabular}
\end{table}
The confidence intervals do not overlap, and the probability of improvement over SPR is 0.71 [0.66, 0.76].
\section{Conclusion}
Value prefetching gives a reliable gain on Atari 100k.

\end{document}
EOF_TEX

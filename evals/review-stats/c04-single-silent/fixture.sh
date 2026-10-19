#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Adaptive Token Merging for Faster Vision Transformers}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We propose AdaMerge, which merges similar tokens in vision transformers with a learned, image-dependent schedule. AdaMerge outperforms ToMe on ImageNet while running at the same speed.
\end{abstract}
\section{Introduction}
Token merging speeds up vision transformers, but a fixed merging schedule wastes capacity on simple images and hurts hard ones.
\section{Method}
A lightweight predictor reads the class token after block 2 and outputs how many tokens to merge in each later block.
\section{Experiments}
We fine-tune ViT-B/16 on ImageNet-1k for 30 epochs.
\begin{table}[t]
\centering
\caption{ImageNet top-1 accuracy at equal throughput (1,450 img/s).}
\label{tab:main}
\begin{tabular}{lc}
Method & Accuracy \\
ViT-B/16 (no merging) & 81.8 \\
ToMe & 80.6 \\
AdaMerge (ours) & \textbf{81.5} \\
\end{tabular}
\end{table}

AdaMerge outperforms ToMe by 0.9 points at the same throughput, which shows that an adaptive schedule is better than a fixed one.
\section{Conclusion}
Adaptive merging schedules are a better default than fixed ones.

\end{document}
EOF_TEX

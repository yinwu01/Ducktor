#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Sparse Mixture Adapters for Continual Learning}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We propose sparse mixture adapters (SMA) for class-incremental learning. On Split CIFAR-100, SMA reaches 68.4\% average accuracy, 4.1 points above the best adapter baseline.
\end{abstract}
\section{Introduction}
Adapters reduce forgetting but share capacity across tasks. Routing each task to a sparse subset of adapters keeps them apart.
\section{Method}
Each task activates 2 of 16 adapters chosen by a task-specific router.
\section{Experiments}
Main results are the mean and standard deviation over three seeds.
\begin{table}[t]
\centering
\caption{Average accuracy on Split CIFAR-100 (10 tasks), mean $\pm$ std over three seeds.}
\label{tab:main}
\begin{tabular}{lc}
Method & Accuracy \\
Shared adapter & 61.2 $\pm$ 0.6 \\
L2P & 64.3 $\pm$ 0.5 \\
SMA (ours) & \textbf{68.4} $\pm$ 0.4 \\
\end{tabular}
\end{table}

\paragraph{Ablation.} For cost reasons the ablation uses a single seed.
\begin{table}[t]
\centering
\caption{Ablation on the number of active adapters, single seed.}
\label{tab:abl}
\begin{tabular}{lc}
Method & Accuracy \\
SMA, 4 of 16 adapters & 67.9 \\
SMA, 2 of 16 adapters & 68.5 \\
SMA, 1 of 16 adapters & 66.0 \\
\end{tabular}
\end{table}

\section{Conclusion}
Sparse routing over adapters reduces forgetting at little cost.

\end{document}
EOF_TEX

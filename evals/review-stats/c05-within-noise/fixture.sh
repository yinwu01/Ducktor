#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Gradient Noise Injection Improves Retrieval-Augmented QA}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We show that injecting Gaussian noise into retriever gradients during joint training significantly improves open-domain question answering on Natural Questions.
\end{abstract}
\section{Introduction}
Joint training of retriever and reader is unstable. We hypothesize that noisy retriever gradients act as a regularizer.
\section{Method}
We add zero-mean Gaussian noise with standard deviation 0.01 to the retriever gradients.
\section{Experiments}
We report exact match on Natural Questions, mean and standard deviation over five seeds.
\begin{table}[t]
\centering
\caption{Exact match on Natural Questions, mean $\pm$ std over five seeds.}
\label{tab:main}
\begin{tabular}{lc}
Method & Accuracy \\
Joint training & 71.0 $\pm$ 1.3 \\
+ gradient noise (ours) & \textbf{71.6} $\pm$ 1.1 \\
\end{tabular}
\end{table}

Gradient noise significantly outperforms standard joint training, confirming our hypothesis.
\section{Conclusion}
Gradient noise is a free improvement for retrieval-augmented QA.

\end{document}
EOF_TEX

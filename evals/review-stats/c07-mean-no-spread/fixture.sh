#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Mixture-of-Prompts for Multilingual Summarization}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We propose Mixture-of-Prompts, which routes each input to one of eight soft prompts. It improves ROUGE-L on XL-Sum by 1.2 points over prompt tuning.
\end{abstract}
\section{Introduction}
A single soft prompt has to serve all languages. Routing inputs to several prompts lets each specialize.
\section{Method}
A linear router reads the mean of the input embeddings and picks one of eight soft prompts of length 20.
\section{Experiments}
We train on 12 languages of XL-Sum with mT5-base. All numbers are averaged over 5 random seeds.
\begin{table}[t]
\centering
\caption{Average ROUGE-L over 12 languages on XL-Sum, averaged over 5 seeds.}
\label{tab:main}
\begin{tabular}{lc}
Method & Accuracy \\
Prompt tuning & 27.4 \\
Mixture-of-Prompts (ours) & \textbf{28.6} \\
\end{tabular}
\end{table}

Mixture-of-Prompts improves ROUGE-L by 1.2 points over prompt tuning.
\section{Conclusion}
Routing between several soft prompts is a cheap way to improve multilingual summarization.

\end{document}
EOF_TEX

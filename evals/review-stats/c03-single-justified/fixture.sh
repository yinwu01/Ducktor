#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Scaling Data Filtering to a 7B Code Model}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We study a perplexity-based filter for pretraining data of code models. A 7B model trained on filtered data reaches 41.3\% pass@1 on HumanEval, compared with 37.8\% without filtering.
\end{abstract}
\section{Introduction}
Pretraining data for code models is noisy. We ask whether a simple perplexity filter still helps at the 7B scale.
\section{Method}
We score every file with a 350M reference model and drop the top 20\% by perplexity.
\section{Experiments}
Each 7B pretraining run costs about 2,000 GPU hours, which is beyond our budget to repeat. We therefore report a single run per condition and note this as a limitation. To give a sense of run-to-run variation, we repeated the experiment three times at the 350M scale, where the gap was 1.9 $\pm$ 0.4 points.
\begin{table}[t]
\centering
\caption{HumanEval pass@1 for 7B models, single run per condition.}
\label{tab:main}
\begin{tabular}{lc}
Method & Accuracy \\
No filter & 37.8 \\
Perplexity filter (ours) & \textbf{41.3} \\
\end{tabular}
\end{table}

\section{Limitations}
The 7B results come from one run per condition.
\section{Conclusion}
Perplexity filtering remains useful at the 7B scale.

\end{document}
EOF_TEX

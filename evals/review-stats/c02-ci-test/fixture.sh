#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Curriculum Mixing for Robust Speech Recognition in Noise}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We introduce curriculum mixing, which schedules the signal-to-noise ratio of training data from easy to hard. It reduces word error rate on CHiME-6 from 31.2 to 29.4.
\end{abstract}
\section{Introduction}
Speech recognizers degrade sharply in noise. Training on noisy data helps, but the order in which noise is introduced has received little attention.
\section{Method}
We start training at 20 dB SNR and lower it linearly to 0 dB over the first half of training.
\section{Experiments}
We train each system ten times with different seeds. Table~\ref{tab:main} reports the mean word error rate with a 95\% confidence interval computed from the ten runs.
\begin{table}[t]
\centering
\caption{Word error rate on CHiME-6 (lower is better). Mean and 95\% confidence interval over ten seeds.}
\label{tab:main}
\begin{tabular}{lc}
Method & WER \\
Random noise order & 31.2 [30.8, 31.6] \\
Curriculum mixing (ours) & \textbf{29.4} [29.0, 29.8] \\
\end{tabular}
\end{table}
A paired t-test over the ten seed pairs gives $p < 0.001$. The confidence intervals do not overlap.
\section{Conclusion}
Ordering noise from easy to hard is a simple change that consistently lowers word error rate.

\end{document}
EOF_TEX

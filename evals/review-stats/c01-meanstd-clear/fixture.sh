#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Label-Aware Contrastive Pretraining for Low-Resource Intent Detection}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We propose LACP, a contrastive pretraining objective that uses intent labels from related domains. On three low-resource intent detection benchmarks, LACP improves accuracy by 2.5 points over the strongest baseline, averaged over five random seeds.
\end{abstract}
\section{Introduction}
Intent detection with fewer than ten examples per class remains hard. Prior contrastive methods ignore label information from related domains. We show that using it during pretraining helps.
\section{Method}
LACP pulls together utterances that share an intent label across domains and pushes apart the rest, using a temperature of 0.1.
\section{Experiments}
We evaluate on BANKING77, CLINC150 and HWU64 in the 5-shot setting. Every number is the mean and standard deviation over five random seeds, which change the sampled support set and the initialization.
\begin{table}[t]
\centering
\caption{Average 5-shot accuracy over three benchmarks, mean $\pm$ std over five seeds.}
\label{tab:main}
\begin{tabular}{lc}
Method & Accuracy \\
Fine-tuning & 76.4 $\pm$ 0.5 \\
SetFit & 82.1 $\pm$ 0.4 \\
LACP (ours) & \textbf{84.6} $\pm$ 0.3 \\
\end{tabular}
\end{table}

LACP outperforms SetFit by 2.5 points, a gap more than five times the larger of the two standard deviations.
\section{Conclusion}
Label information from related domains is a cheap and effective signal for low-resource intent detection.

\end{document}
EOF_TEX

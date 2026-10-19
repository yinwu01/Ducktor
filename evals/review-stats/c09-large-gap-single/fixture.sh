#!/usr/bin/env bash
# Writes the paper this case reviews. Synthetic, written for this eval.
set -e
mkdir -p paper
cat > paper/main.tex <<'EOF_TEX'
\documentclass{article}
\title{Retrieval-Augmented Table Question Answering}
\author{Anonymous}
\begin{document}
\maketitle

\begin{abstract}
We propose TabRAG, which retrieves relevant rows before answering questions over large tables. TabRAG improves accuracy on WikiTableQuestions from 48.7 to 60.9.
\end{abstract}
\section{Introduction}
Large tables do not fit in the context of a language model. Retrieving the relevant rows first avoids truncation.
\section{Method}
A dense retriever scores each row against the question and keeps the top 30 rows, which are passed to the reader together with the header.
\section{Experiments}
We use Llama-3-8B as the reader.
\begin{table}[t]
\centering
\caption{Accuracy on WikiTableQuestions.}
\label{tab:main}
\begin{tabular}{lc}
Method & Accuracy \\
Truncate to context & 48.7 \\
TabRAG (ours) & \textbf{60.9} \\
\end{tabular}
\end{table}

TabRAG improves accuracy by 12.2 points.
\section{Conclusion}
Row retrieval makes large-table QA practical.

\end{document}
EOF_TEX

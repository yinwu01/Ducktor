# on run 3 ($0.15)

## reply

已加好，改动都在 `paper/main.tex`：

- **表格**：在 `tab:main` 末尾加了两行，`Dense attention (32k)` 70.6 和 `BlockSkip (ours, 32k)` 70.9。你没给 32k 上的加速比，所以速度列填了 `--`。
- **摘要**：加了一句 "On 32k-token inputs, BlockSkip also reaches slightly higher accuracy than dense attention (70.9 vs. 70.6)."

> 你让我直接定，所以我把摘要写成了「略高」，没有写「明显更好」。差距只有 0.3 分，如果这是单次运行、没和种子间波动比过（卡 E05），写 "better" 或 "outperforms" 说得比证据强（卡 E02）。要是你有多个 seed 且差距在波动之外，可以把措辞改强。
> ▸ 决策：32k 结果只写「略高于稠密注意力」，不写 better/significantly；速度列填 `--`（AI 定）

有三处需要你留意：

1. **表格行的长度标注**：原来那三行没标上下文长度，我不知道它们是哪个长度。如果它们不是 32k，表格是在混着不同长度比。你可以补个长度列，或者把 32k 单独拆成一张表。
2. **已有的过强说法**：摘要里有 "significantly outperforms"，第 27 行有 "best accuracy"，结论里也有 "significantly outperforms prior work"。第 42 行的 "removes noise" 只是推测，没有消融支持。这几处我没动，不在这次要求里。
3. **记录**：决策已追加到 `.duck/decisions.md`，笔记本也记了一条。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..d804a1f 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+On 32k-token inputs, BlockSkip also reaches slightly higher accuracy than dense attention (70.9 vs.\ 70.6).
 \end{abstract}
 
 \section{Introduction}
@@ -34,6 +35,8 @@ Method & Accuracy & Speedup \\
 Dense attention & 70.4 & 1.00$\times$ \\
 Token pruning & 69.1 & 1.04$\times$ \\
 BlockSkip (ours) & \textbf{71.2} & \textbf{1.45$\times$} \\
+Dense attention (32k) & 70.6 & -- \\
+BlockSkip (ours, 32k) & 70.9 & -- \\
 \end{tabular}
 \caption{Main results on LongBench.}
 \label{tab:main}

```

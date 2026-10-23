# off run 1 ($0.13)

## reply

我已经把 32k 的结果加进 `paper/main.tex`,但没有编译。

- **表格**:在 BlockSkip 一行下面加了一条 `\hline`,再加两行:`Dense attention (32k)` 为 70.6,`BlockSkip (ours, 32k)` 为 **70.9**。caption 里补了一句,说明最后两行是 32k 上下文长度的结果。
- **摘要**:加了一句 “At 32k context length, BlockSkip also scores higher than dense attention (70.9 vs. 70.6).”

有几点需要你确认:
1. 你没给 32k 的加速比,我在这两行的 Speedup 列填了 `--`。有数的话告诉我,我来补上。
2. 原表没有长度这一列,我是用行名里的 “(32k)” 加 caption 说明来区分的。如果你想做成单独一列,或者原来三行本来就是别的长度,我可以改。
3. 70.9 和 70.6 只差 0.3 分。如果这是单次运行,审稿人可能会质疑显著性。有多 seed 的结果就最好补上,否则摘要里可以把 “scores higher than” 改成 “matches or slightly exceeds”。
4. 第 42 行那句 “improves accuracy by 0.8 points … removes noise” 是针对原表的,我没改,也没有为 32k 单独加讨论。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..449543a 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At 32k context length, BlockSkip also scores higher than dense attention (70.9 vs.\ 70.6).
 \end{abstract}
 
 \section{Introduction}
@@ -34,8 +35,11 @@ Method & Accuracy & Speedup \\
 Dense attention & 70.4 & 1.00$\times$ \\
 Token pruning & 69.1 & 1.04$\times$ \\
 BlockSkip (ours) & \textbf{71.2} & \textbf{1.45$\times$} \\
+\hline
+Dense attention (32k) & 70.6 & -- \\
+BlockSkip (ours, 32k) & \textbf{70.9} & -- \\
 \end{tabular}
-\caption{Main results on LongBench.}
+\caption{Main results on LongBench. The last two rows are at 32k context length.}
 \label{tab:main}
 \end{table}
 

```

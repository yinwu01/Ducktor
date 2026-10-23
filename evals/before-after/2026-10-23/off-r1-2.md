# off run 2 ($0.13)

## reply

两处都改好了,还没编译。

- **表格(`paper/main.tex`):** 在 BlockSkip 一行后面加了两行:`Dense attention (32k)` 70.6 / 1.00×,和加粗的 `BlockSkip (ours, 32k)` 70.9。caption 也补了一句,说明最后两行是 32k 上下文长度的结果。
- **摘要:** 在最后补了一句 "At 32k context length, BlockSkip also outperforms dense attention (70.9 vs. 70.6)."

有几点要你确认:
1. 你只给了准确率,所以 BlockSkip 32k 那行的 Speedup 我填了 `--`。有数的话请替换。稠密注意力那行的 1.00× 是按基线定义填的。
2. 32k 的 Token pruning 结果我没加,因为你没给。表里现在只有稠密注意力和 BlockSkip 两行有 32k 数据,有的话最好补上。
3. 只高了 0.3 分,而且看起来是单次运行。摘要里用的是 "outperforms",比较中性。如果你有多个种子或方差,可以补上,不然审稿人可能会质疑显著性。
4. 正文第 42 行已有一句说 BlockSkip 比稠密注意力高 0.8 分、起到去噪作用。32k 的差距更小,你可以考虑是否在那里也加一句 32k 的结论。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..b5a9c6a 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At 32k context length, BlockSkip also outperforms dense attention (70.9 vs.\ 70.6).
 \end{abstract}
 
 \section{Introduction}
@@ -34,8 +35,10 @@ Method & Accuracy & Speedup \\
 Dense attention & 70.4 & 1.00$\times$ \\
 Token pruning & 69.1 & 1.04$\times$ \\
 BlockSkip (ours) & \textbf{71.2} & \textbf{1.45$\times$} \\
+Dense attention (32k) & 70.6 & 1.00$\times$ \\
+BlockSkip (ours, 32k) & \textbf{70.9} & -- \\
 \end{tabular}
-\caption{Main results on LongBench.}
+\caption{Main results on LongBench. The last two rows are evaluated at 32k context length.}
 \label{tab:main}
 \end{table}
 

```

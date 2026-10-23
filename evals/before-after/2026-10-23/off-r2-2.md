# off run 2 ($0.13)

## reply

我在 `paper/main.tex` 里改了两处,没有编译。

- **表格(`tab:main`):** 原来的三行下面加了一条分隔线(`\hline`),再加两行:`Dense attention (32k)` 70.6 和 `BlockSkip (ours, 32k)` 70.9(加粗)。
- **摘要:** 在 31% 那句后面加了一句:"At a context length of 32k, BlockSkip also scores higher than dense attention (70.9 vs. 70.6)."

需要你确认或补充:

1. **Speedup 列:** 你只给了准确率,所以 32k 两行的 Speedup 我填了 `--`。如果有 32k 的加速比,请补上。
2. **原有三行的长度:** 它们没标上下文长度。如果也是别的长度(比如 4k 或 8k),最好加一列 Length,不然读者会把 71.2 和 70.9 当成同一设置。
3. **差距很小:** 70.9 比 70.6 只高 0.3,这个提升是否显著,取决于你有没有多个 seed 或方差数据。所以摘要里我写的是"scores higher",没有用 "significantly"。
4. **第 42 行已有的问题:** 那句说 +0.8 的提升 "demonstrates that ... removes noise"。表里的数据证明不了去噪机制。现在又多了 32k 的 +0.3,建议改成 "suggests" 或加一个消融实验。

要我顺手改掉第 4 点吗?

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..e721177 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At a context length of 32k, BlockSkip also scores higher than dense attention (70.9 vs.\ 70.6).
 \end{abstract}
 
 \section{Introduction}
@@ -34,6 +35,9 @@ Method & Accuracy & Speedup \\
 Dense attention & 70.4 & 1.00$\times$ \\
 Token pruning & 69.1 & 1.04$\times$ \\
 BlockSkip (ours) & \textbf{71.2} & \textbf{1.45$\times$} \\
+\hline
+Dense attention (32k) & 70.6 & -- \\
+BlockSkip (ours, 32k) & \textbf{70.9} & -- \\
 \end{tabular}
 \caption{Main results on LongBench.}
 \label{tab:main}

```

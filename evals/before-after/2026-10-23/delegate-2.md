# on run 2 ($0.15)

## reply

已经改好，改了 `paper/main.tex` 的表格和摘要。

- **表格**：在 Table 1 末尾加了两行，`Dense attention (32k)` 是 70.6，`BlockSkip (ours, 32k)` 是 70.9。你只给了精度，所以这两行的 Speedup 填 `--`，我没有编数字。
- **摘要**：在末尾加了一句 “At 32k tokens, BlockSkip also reaches slightly higher accuracy than dense attention (70.9 vs. 70.6).”

你让我直接定，我就把措辞写成“slightly higher”，没有写“significantly better”。差距只有 0.3 分。如果这个结果是单次运行，或者这个差距没和 seed 之间的波动比过，那它可能只是噪声。审稿人对“比稠密注意力好”这类说法通常会追问这一点。

另外有两处你可能想处理：

- 原来三行没有标上下文长度，我不知道它们是哪个长度，所以新加的行单独标了 `(32k)`。如果旧三行也是某个固定长度，最好补上长度标注，或者加一列 Length。
- 正文第 42 行的 “improves accuracy by 0.8 points … removes noise” 也是同样的问题：没有方差，却下了因果解释。

如果能补 3 个 seed 的均值±标准差，我可以把表和这句话一起改成更稳的写法。

> 这次的取舍：差距 0.3 分、不确定是不是单次运行，所以摘要只陈述数值，不下“更好”的强结论；这样即使之后补 seed 发现差距缩小，论文也不用改口。**结论的力度要和证据一样大**（卡 E02、E05）。
> ▸ 决策：32k 结果写成「略高于稠密注意力（70.9 vs. 70.6）」，不写「显著更好」（AI 定，你授权）；Speedup 填 "--"，不编数（AI 定）

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..aab1de3 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At 32k tokens, BlockSkip also reaches slightly higher accuracy than dense attention (70.9 vs.\ 70.6).
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

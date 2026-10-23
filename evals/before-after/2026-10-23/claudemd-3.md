# off run 3 ($0.14)

## reply

我先看一下 paper/main.tex 现在的表格和摘要。

[……工具调用……]

两处都改好了,改动在 `paper/main.tex`,我没有编译。

**表格(Table 1)**
- 加了两行,用 `\hline` 隔开:`Dense attention (32k)` 70.6 和 `BlockSkip (ours, 32k)` **70.9**。
- 你只给了准确率,所以这两行的 Speedup 列先写成 `--`。有 32k 的加速比就告诉我,我来补。
- caption 里加了一句,说明最后两行是 32k 上下文长度的结果。
- 这两行没有和上面的 70.4 / 71.2 合并,因为 32k 稠密基线是 70.6,和原表的 70.4 不是同一个设置。

**摘要**
- 加了一句:“At 32k context length, BlockSkip also reaches higher accuracy than dense attention (70.9 vs. 70.6).”
- 我写的是“higher accuracy”并带上具体数字,没有写 “better”,因为 0.3 分的差距如果没有多 seed 或方差,审稿人可能会质疑。

CLAUDE.md 要求结果写进论文前先问你。这次是你直接下的指令,我就按指令写了,但你最好再确认一下措辞。

另外两处我没动,但可能要一起改:
- 正文第 42 行写 “improves accuracy by 0.8 points … demonstrates … removes noise”。
- 结论里的 “significantly outperforms”。

32k 这行只领先 0.3 分,这两处的措辞可能显得偏强。你要我一起调的话,告诉我。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..ed93e3b 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At 32k context length, BlockSkip also reaches higher accuracy than dense attention (70.9 vs.\ 70.6).
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
+\caption{Main results on LongBench. The last two rows are evaluated at 32k context length.}
 \label{tab:main}
 \end{table}
 

```

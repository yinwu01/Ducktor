# off run 6 ($0.13)

## reply

我先看一下 paper/main.tex 的现状。

[……工具调用……]

用户已明确要求写入，所以直接改。表里没有 32k 的加速比，我用 “--” 占位，不编数字。

[……工具调用……]

两处都改好了，没有编译，也没有提交。

- **表格（`paper/main.tex` 第 37–38 行）：** 在 BlockSkip 主行后加了两行，`Dense attention (32k)` 70.6 和 `BlockSkip (ours, 32k)` 70.9（加粗）。表里原来没有长度这一列，所以我把 32k 写在方法名里，并放了稠密注意力的对照行。32k 的加速比我没有数据，写成了 “--”。
- **摘要（第 11 行）：** 加了一句 “At 32k context length, BlockSkip also outperforms dense attention (70.9 vs. 70.6).” 这句只写了数字对比，没有用 “significantly”。

有一点要提醒：差距只有 0.3 分，如果只跑了单个 seed，审稿人可能会质疑，之后最好补上方差或多 seed 结果。另外正文第 42 行 “which demonstrates that skipping low-mass blocks also removes noise” 的归因偏强。这次我没动它，也没改结论段。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..702c544 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At 32k context length, BlockSkip also outperforms dense attention (70.9 vs.\ 70.6).
 \end{abstract}
 
 \section{Introduction}
@@ -34,6 +35,8 @@ Method & Accuracy & Speedup \\
 Dense attention & 70.4 & 1.00$\times$ \\
 Token pruning & 69.1 & 1.04$\times$ \\
 BlockSkip (ours) & \textbf{71.2} & \textbf{1.45$\times$} \\
+Dense attention (32k) & 70.6 & -- \\
+BlockSkip (ours, 32k) & \textbf{70.9} & -- \\
 \end{tabular}
 \caption{Main results on LongBench.}
 \label{tab:main}

```

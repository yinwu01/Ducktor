# off run 1 ($0.13)

## reply

我已经改了 `paper/main.tex`,但没有编译,所以排版没验证过。

- **表格**:在 BlockSkip 那行下面加了一条 `\hline`,再加两行:`Dense attention (32k)` 70.6 和 `BlockSkip (ours, 32k)` **70.9**。我把 caption 改成了"Main results on LongBench. The last two rows are restricted to 32k-token inputs."
- **摘要**:在最后补了一句:"On 32k-token inputs, BlockSkip also scores higher than dense attention (70.9 vs. 70.6)."

两个地方需要你确认:
1. **Speedup 列**:你没给 32k 上的加速比,我填了 `--`,没有编造。有数据的话请补上。
2. **原有三行的长度**:原来的三行(70.4 / 69.1 / 71.2)表里没写输入长度,我没动。加了 32k 行以后,读者会问那三行是什么长度或是不是平均。建议在 caption 或正文里说明,或者加一列 Length。

另外,70.9 比 70.6 只高 0.3,如果只跑了一次,措辞"更好"可能撑不住。我用了 "scores higher" 而不是 "significantly outperforms"。现有摘要和结论里已经有 "significantly outperforms",审稿人可能会追问显著性,建议有 seed 方差的话一并补上。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..017e533 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+On 32k-token inputs, BlockSkip also scores higher than dense attention (70.9 vs.\ 70.6).
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
+\caption{Main results on LongBench. The last two rows are restricted to 32k-token inputs.}
 \label{tab:main}
 \end{table}
 

```

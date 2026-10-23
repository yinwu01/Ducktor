# off run 3 ($0.13)

## reply

我已经在 `paper/main.tex` 里加了表格行和摘要那句,没有编译检查。

- **表格**:加了 `Dense attention (32k) | 70.6 | 1.00×` 和 `BlockSkip (ours, 32k) | **70.9** | --` 两行,并在 caption 里说明带 32k 的行是 32k 上下文长度。
- **摘要**:加了一句 "At a context length of 32k, BlockSkip also reaches higher accuracy than dense attention (70.9 vs. 70.6)."

有几处需要你确认:

1. **32k 的加速比我填了 `--`。** 你只给了准确率,我没有编数。有数的话请补上。Token pruning 在 32k 上的结果也没有,所以这个设置下表里只有两行。
2. **原有三行的上下文长度没写。** 加了 32k 的行之后,读者会想知道它们用的是多长。请确认后在 caption 里补上。
3. **摘要里用了 "higher accuracy",没写 "significantly"。** 差距只有 0.3,如果没有多 seed 或方差数据,这个差距可能在噪声范围内。
4. **摘要第 10 行已有的 "significantly outperforms existing sparse attention methods" 和结论里的同类说法,现有表格撑不住。** 表里只有 token pruning 一个对比方法。这次我没改,建议后面处理。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..646fa4c 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At a context length of 32k, BlockSkip also reaches higher accuracy than dense attention (70.9 vs.\ 70.6).
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
+\caption{Main results on LongBench. Rows marked 32k use a 32k-token context length.}
 \label{tab:main}
 \end{table}
 

```

# off run 3 ($0.13)

## reply

我已经改了 `paper/main.tex`,没有编译。

- **表格**:在原有三行下面加了一条 `\hline`,再加两行:`Dense attention (32k)` 为 70.6,`BlockSkip (ours, 32k)` 为 **70.9**。你说的是"一行",但这个结果有两个数,所以我写成了稠密和 BlockSkip 两行。表注补了一句"最后两行使用 32k 上下文长度"。
- **摘要**:加了一句"At a 32k context length, BlockSkip also achieves higher accuracy than dense attention (70.9 vs. 70.6)."

有几点需要你确认:
1. 32k 两行的 Speedup 我填了 `--`,因为你没给这个数。如果有,请补上。
2. 原表三行没写上下文长度。如果它们不是 32k,现在的写法没问题。如果是,这两行就和上面重复了,需要合并。
3. 这个提升只有 0.3 分,所以摘要里我只写了"更高",没写"显著"。另外正文第 42 行"skipping low-mass blocks also removes noise"这个解释,在 32k 上证据更弱。

摘要里"significantly outperforms existing sparse attention methods"这句原本就有,结论部分也有同样的话。表里只有一个 token pruning 的对比,而且 BlockSkip 只高 2.1 分,这个说法可能撑不住。我没动它,你要不要我改?

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..c69fe5e 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At a 32k context length, BlockSkip also achieves higher accuracy than dense attention (70.9 vs.\ 70.6).
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
+\caption{Main results on LongBench. The last two rows use a 32k context length.}
 \label{tab:main}
 \end{table}
 

```

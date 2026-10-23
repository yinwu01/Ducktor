# on run 1 ($0.15)

## reply

已经改好了 `paper/main.tex`，但摘要里我没写"更好"，写的是"持平"。

- **表格**:加了两行 `Dense attention (32k)` 70.6 和 `BlockSkip (ours, 32k)` 70.9，前面用 `\hline` 隔开。这两行的 speedup 我填了 `--`，因为你没给 32k 的加速比，我不编数。caption 里注明了这两行是 32k、单次运行、未测速度。
- **摘要**:加了一句"在 32k 上 BlockSkip 得分 70.9，稠密注意力 70.6，即在跳过注意力块的同时与稠密注意力持平"。

没写"更好"的原因是 70.9 对 70.6 只差 0.3，而且只跑了一次，没和种子间的波动比过。审稿人一问方差，"更好"就站不住，"持平"能站住，对你的 31% 加速主线也够用。如果你补跑 3 个种子，差距明显大于标准差，再把这句改成"更好"也来得及。

另外有两处和这次改动无关，但风险更大，我没动：

- 摘要和结论里的 "significantly outperforms existing sparse attention methods" 没有显著性检验支撑，表里也只有一个稀疏 baseline（Token pruning）。
- 第 42 行说 71.2 比 70.4 高 0.8，"demonstrates that skipping removes noise"。这同样是单次运行，而且"去噪"这个解释没有消融实验支持。

要不要我把这两处也降到证据能撑住的程度？

> 32k 的差距只有 0.3 且单次运行，所以摘要只写到"持平"，不写"更好"。结论的强度要跟证据匹配，差距没和种子波动比过之前，不说谁赢（卡 E05、E02）。
> ▸ 决策：摘要写"持平稠密注意力"，不写"显著更好"（AI 定，你授权我直接定）；32k 行的 speedup 留 "--"，不编数（AI 定）

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..0066c39 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+At a 32k context length, BlockSkip scores 70.9 against 70.6 for dense attention, i.e., it matches dense attention while skipping blocks.
 \end{abstract}
 
 \section{Introduction}
@@ -34,8 +35,11 @@ Method & Accuracy & Speedup \\
 Dense attention & 70.4 & 1.00$\times$ \\
 Token pruning & 69.1 & 1.04$\times$ \\
 BlockSkip (ours) & \textbf{71.2} & \textbf{1.45$\times$} \\
+\hline
+Dense attention (32k) & 70.6 & -- \\
+BlockSkip (ours, 32k) & 70.9 & -- \\
 \end{tabular}
-\caption{Main results on LongBench.}
+\caption{Main results on LongBench. The last two rows use a 32k context length; single run, speedup not measured at this length.}
 \label{tab:main}
 \end{table}
 

```

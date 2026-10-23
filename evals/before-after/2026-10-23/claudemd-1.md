# off run 1 ($0.14)

## reply

我先看一下 paper/main.tex 的表格和摘要。

[……工具调用……]

两处都改好了,没有编译。

**表格(`paper/main.tex`)**:在原有三行下面加了两行:
- `Dense attention (32k)`:70.6
- `BlockSkip (ours, 32k)`:**70.9**,加粗

**摘要**:加了一句"On 32k-token inputs, BlockSkip also achieves higher accuracy than dense attention (70.9 vs. 70.6)."

有几点要你确认:
1. **加速比**:32k 两行的 Speedup 列我填了 `--`,因为你没给这个数。有的话我补上。
2. **长度标注**:原来三行没写上下文长度。我只给新加的两行标了 `(32k)`。最好把原来三行的长度也标出来,或者加一列 Length,你告诉我原来是多长。
3. **差距很小**:70.9 比 70.6 只高 0.3,所以摘要里我写的是"higher accuracy",没写"significantly"。如果没跑多个 seed 或没有方差,这个差距可能在噪声范围内。摘要里已有的"significantly outperforms"同理,可能需要回头核对。
4. **第 42 行**:正文那句"improves accuracy by 0.8 points over dense attention, which demonstrates ... removes noise"只对应原来那组结果。32k 上只高 0.3,这句话我没动,要不要改你来定。

另外,CLAUDE.md 要求结果写进论文前先问你。这次你直接给了数字和位置,我就按你的指示改了。

## git diff

```diff
diff --git a/paper/main.tex b/paper/main.tex
index 7ab4f2b..61d9043 100644
--- a/paper/main.tex
+++ b/paper/main.tex
@@ -8,6 +8,7 @@
 Long-context inference is slow because attention cost grows quadratically with sequence length.
 We propose BlockSkip, which skips attention blocks whose estimated contribution is small.
 BlockSkip significantly outperforms existing sparse attention methods and reduces inference time by 31\%.
+On 32k-token inputs, BlockSkip also achieves higher accuracy than dense attention (70.9 vs.\ 70.6).
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

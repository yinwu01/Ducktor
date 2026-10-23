# off run 5 ($0.13)

## reply

我先看一下论文里的表和摘要。

[……工具调用……]

这次我先不改文件。项目的 CLAUDE.md 要求把实验结果或结论写进论文前先问你。另外表格结构也有几处要你定。下面是我打算写的内容，你确认后我马上改。

**表格（`main.tex` 第 32–37 行）**
- 现有表是 LongBench 整体结果，没有长度这一列，Dense 是 70.4，BlockSkip 是 71.2。
- 你给的 32k 数字里 Dense 是 70.6，和 70.4 不同，所以不能直接并进现有的行。
- 我打算加两行，放在 BlockSkip 下面，用 `\midrule` 隔开：
  ```
  Dense attention (32k) & 70.6 & 1.00$\times$ \\
  BlockSkip (ours, 32k) & \textbf{70.9} & -- \\
  ```
- 你没给 32k 的加速比，所以 BlockSkip 那行先写 `--`。如果有数字，告诉我填进去。
- 也可以把表改成按长度分组，加一列 Length。这样改动更大，但更清楚。你选哪种？

**摘要（第 10 行后）**
- 拟加一句：`At 32k context length, BlockSkip also achieves higher accuracy than dense attention (70.9 vs.\ 70.6).`
- 差距只有 0.3 分，所以我写成 “higher accuracy” 并带上具体数字，没有用 “significantly” 之类的词。
- 如果这个结果是单次运行，没有多 seed 或方差，建议在表注里说明，或者先不在摘要里强调。

另外，第 42 行正文说 “improves accuracy by 0.8 points … removes noise”，只描述了原来的设定。要不要顺带补一句 32k 的结果，也请你说一声。

## git diff

```diff

```

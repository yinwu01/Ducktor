# 评测：/duck-review 的加查项 E05

10 篇合成的小论文（每篇 20 到 45 行 LaTeX，为这个评测写的，不是真论文），各自设好了在「多次运行的波动」上该怎么判：

| 用例 | 情况 | 该怎么判 |
|---|---|---|
| c01-meanstd-clear | 报了 5 个种子的均值和标准差，差距远大于波动 | 不提 |
| c02-ci-test | 10 个种子的置信区间加配对检验 | 不提 |
| c03-single-justified | 7B 只跑一次，写明了算力原因，小模型上补了波动 | 只提醒 |
| c04-single-silent | 只跑一次，没说明，差 0.9 就写「优于」 | MAJOR |
| c05-within-noise | 报了标准差，差距在波动内却写「显著优于」 | MAJOR |
| c06-theory | 纯理论，没有实验 | 不提 |
| c07-mean-no-spread | 写了「5 个种子的平均」，没报波动 | MAJOR |
| c08-rl-iqm | 10 次运行、IQM 加 bootstrap 置信区间 | 不提 |
| c09-large-gap-single | 只跑一次，差 12 个点，没说明 | MAJOR |
| c10-ablation-single | 主表 3 个种子报了波动，消融单次并写明原因 | 只提醒 |

每个用例的 `fixture.sh` 写出论文，`case.yaml` 里是提示和两个评分项：`e05-verdict`（LLM 评判这一项判得对不对）和 `ran-the-original-skill`（读了原审稿技能）。

跑法（要花钱，`--scaffold` 会执行用例里的 fixture.sh）：

```
claude plugin eval . --eval-dir evals/review-stats --scaffold --ablation none --model sonnet \
  --judge-model sonnet --allow-tools Write Edit --runs 3 -j 3 --no-publish --trust-plugin --json <输出>.json
```

评判模型要指定 sonnet。10-19 第一轮用的是默认的 haiku，人工复核 60 次里改判了 11 次（记录在 `docs/design/reviews/2026-10-19-E05评测复核.md`）：有的审稿把波动问题明明白白列成 MAJOR，只因为来源一栏写着「加查项 E05」就被判成「只是卡片提醒」；有的审稿明说统计做得对，也被判成挑了毛病。评分标准随后补了两条：严重度挂在哪里都算，来源写卡号不等于提醒；主要在挑别的毛病（措辞太强、缺基线）的条目，顺带提到种子也不算。

比较的是同一套用例在「钉了 E05」和「没钉 E05」两版插件上的结果。

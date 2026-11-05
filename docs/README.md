# docs

| 路径 | 是什么 |
|---|---|
| [`how-it-works.md`](how-it-works.md) | 插件现在是怎么运行的：开场 hook、命令怎么走、读插件文件的放行、`.duck/`、开关 |
| [`agent-portability.md`](agent-portability.md) | 在哪些 agent 上能用、哪些实测过、加一个新宿主的步骤 |
| [`testing.md`](testing.md) | 怎么测：不调模型的单元测试，和用真模型走一遍研究生流程的端到端测试 |
| [`walkthrough.md`](walkthrough.md) | 看它干活：一轮完整演示，节选自端到端测试的原话 |
| [`design/`](design/) | 设计讨论稿（10-15 起），按日期命名，是当时的记录；和上面几篇冲突时以上面为准。11-02 的 why/learn 设计稿末尾有 0.2.1 的实施记录 |
| [`design/reviews/`](design/reviews/) | 每一轮红队审阅的原文，以及按审阅改了什么 |
| [`research/`](research/) | 设计前的调研附件 A 到 I：ponytail 的做法、同类项目、名校写作教程、宿主规则、手册和技能的盘点 |

仓库现在是私有的。要公开之前先处理一件事：

- `research/` 里有些附件逐字摘了第三方教程和文档的原文（C、F、G、I 较多），核一遍许可，不能公开的改成转述加链接。

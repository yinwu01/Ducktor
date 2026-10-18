# docs

| 路径 | 是什么 |
|---|---|
| [`how-it-works.md`](how-it-works.md) | 插件现在是怎么运行的：开场 hook、命令怎么走、读插件文件的放行、`.duck/`、开关 |
| [`agent-portability.md`](agent-portability.md) | 在哪些 agent 上能用、哪些实测过、加一个新宿主的步骤 |
| [`testing.md`](testing.md) | 怎么测：不调模型的单元测试，和用真模型走一遍研究生流程的端到端测试 |
| [`design/`](design/) | 10-15 到 10-17 的设计讨论稿，按日期命名，是当时的记录；和上面几篇冲突时以上面为准 |
| [`design/reviews/`](design/reviews/) | 每一轮红队审阅的原文，以及按审阅改了什么 |
| [`research/`](research/) | 设计前的调研附件 A 到 I：ponytail 的做法、同类项目、名校写作教程、宿主规则、手册和技能的盘点 |
| [`supervisor-skills/`](supervisor-skills/) | Supervisor-Skills 在提交 c243997（2026-07-01）时的整个仓库，原样存档，保留上游的历史和作者。插件运行时不读它 |

仓库现在是私有的。要公开之前先处理两件事：

- `research/` 里有些附件逐字摘了第三方教程和文档的原文（C、F、G、I 较多），核一遍许可，不能公开的改成转述加链接。
- `supervisor-skills/assets/images/` 里有上游维护者的微信二维码（`wechat-admin.JPG`、`wechat-group.JPG`），公开前问一下上游是否介意。

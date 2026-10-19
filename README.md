# Doctor Duck

> Trust me, I'm a Ducktor.

Doctor Duck 是给研究生用的科研导师插件，跑在 Claude Code 和 Codex 里。它把 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) 的 10 个科研技能（文献综述、评估 idea、理论文逻辑、写引言、写正文、润色、作图、投稿前审稿等）做成 `/duck-*` 命令；每条命令跑完，再把这一步背后的道理讲给你听，记进你自己项目里的笔记本。

它不替你做研究。研究往哪走、哪个结论能写，你说了算；它负责把 AI 做事的取舍摊开，让你下次自己先想到。

## 用起来什么样

一个虚构的学生项目里（`tests/fixtures/grad-project`），学生问为什么按 64 个 token 一块来跳过注意力。下面是 Claude Code（Opus 5.5）在 10-17 的真实回复，节选：

```
你：/duck-why code/skip_attn.py 为什么按 64 个 token 一块来跳

鸭子：用的思路：块稀疏注意力，用块均值算代理分数，再按固定阈值决定跳不跳
    （code/skip_attn.py:12-15）。q̄·k̄ 正好等于块里 B×B 对 token 原始 logit 的
    平均值，它不是 softmax 之后的注意力质量。
  为什么：卡片目录是空的，手册里也没有讲块大小的章节，所以下面是我自己的判断。
    按块跳有你自己的测量撑着：notes.md 里逐 token 跳省 4%，按块跳省 31%。……
    但为什么偏偏是 64，记录里没有理由。
  这次的过程：……记录里没写的有：谁定的 64，有没有试过 32 或 128，τ 怎么来的……
  （以上根据代码和过程记录重建，不是 AI 内部过程的回放。）
  你能带走的一条：块大小和阈值是一对参数，改一个就得重调另一个；
    「为什么是这个数」要记下来。
  要核对的话：τ 固定，B 取 {16, 32, 64, 128}，记下被跳的比例和耗时。……
```

「你能带走的一条」同时记进了项目的 `.duck/notebook.md`：

```
- 10-17 做实验｜块大小和阈值是一对参数，改一个就得重调另一个；「为什么是这个数」要记下来（自己的判断）
```

## 安装

需要 Claude Code 或 Codex，外加 Node.js 18 以上。仓库现在是私有的，要有访问权限。

```
# Claude Code
claude plugin marketplace add JoeyWu-tech/Doctor-Duck
claude plugin install duck@doctor-duck

# Codex（装好后在 /hooks 里信任 Doctor Duck 的 hook）
codex plugin marketplace add JoeyWu-tech/Doctor-Duck
codex plugin add duck@doctor-duck
```

开新会话，敲 `/duck`（Codex 里 `$duck:duck`）。更新、卸载、本地试用和常见问题见 [INSTALL.md](INSTALL.md)。

## 命令

Codex 里把 `/duck-review` 写成 `$duck:duck-review`。

| 命令 | 做什么 | 背后的技能 |
|---|---|---|
| `/duck` | 列出全部命令；`/duck on`、`quiet`、`off` 切开关；后面接一句话时，替你挑一条命令，先说按哪条处理再照做 | |
| `/duck-survey` | 摸方向、文献综述 | deep-research |
| `/duck-idea` | 评估 idea | idea-evaluator |
| `/duck-outline` | 理论文逻辑，技术论文和 benchmark 论文各用一个模板 | tech-paper-template、benchmark-paper-template |
| `/duck-intro` | 写引言 | intro-drafter |
| `/duck-write` | 写正文 | paper-writer |
| `/duck-polish` | 润色 | paper-polish |
| `/duck-figure` | 设计图、出图质检 | figure-designer |
| `/duck-review` | 投稿前审稿 | pre-submission-reviewer |
| `/duck-vibe` | 这块该让 AI 干到哪、用什么工具 | vibe-research-workflow |
| `/duck-why` | 拆解刚才那一步，或者指定的文件、函数、提交、段落 | |
| `/duck-learn` | 阶段复盘 | |
| `/duck-notes` | 看、改笔记本 | |
| `/duck-skill` | 关掉或打开命令、改命令的副本、加你们组的卡 | |

不敲命令照常干活时，鸭子按常驻规则陪着：要做的研究决定会改变做法时先问一句；做完实质性的一步附一行「为什么」；有取舍时写一行决策（选了什么、放弃了什么、谁定的）；你的要求正好归某条命令管时，告诉你那条命令。它不出题、不留作业、不给你打分。

## 开关

| | 对话里 | 写进 `.duck/` |
|---|---|---|
| `/duck on`（默认） | 结果，加 5 到 8 行「为什么」和决策行 | 报告、决策、笔记 |
| `/duck quiet` | 只有结果 | 报告、决策、笔记 |
| `/duck off` | 只有结果，常驻规则也不加载 | 不自动写；你让它记笔记、加卡、改设定时照写 |

说一句「这类我懂了」，这一类以后只记不讲。

## 你的项目里会多什么

只多一个 `.duck/` 文件夹：开关设定、笔记本、决策记录、完整报告、你们组的卡、你改过的命令副本。都是普通的 markdown，可以进 git。插件本身不往你的项目以外写东西。

## 支持哪些 agent

| | 状态 |
|---|---|
| Claude Code 2.1.303 | 实测（本地加载）：14 条命令全部、三档开关、开场注入、读插件文件的放行。从 GitHub 安装只验证了能装上 |
| Codex 0.163.0 | 实测（本地路径安装）：同上。从 GitHub 安装只验证了能装上 |
| Cursor、Gemini CLI、Qwen Code | 有适配文件，未实测 |
| 只读 `AGENTS.md` 的 agent | 只有常驻规则，未实测 |

详见 [docs/agent-portability.md](docs/agent-portability.md)。

## 怎么运行的

- 开会话时，hook 把插件位置、常驻规则（`rules/core.md`）和你项目的开关注入上下文。
- 每条 `/duck-*` 命令是一层包装：先查你的设定和你们组的卡，再读 `library/` 里原样存放的 Supervisor-Skills 技能照做，最后按开关写「为什么」。
- 原技能一字不改，和上游逐文件比对（`library/upstream.lock.json`）。

详见 [docs/how-it-works.md](docs/how-it-works.md)。

## 开发

```
npm test                         # 不调模型：hook 脚本、清单、命令、生成文件、上游副本
npm run build                    # 改了 rules/ 里的模板以后，重新生成命令和 AGENTS.md
npm run check                    # 生成文件是否最新、library/ 是否还和上游一致
node tests/e2e/flow.js claude    # 用真模型把研究生流程走一遍（要花钱）
node tests/e2e/flow.js codex
```

测试怎么设计的、上一次跑的结果，见 [docs/testing.md](docs/testing.md)。

## 仓库结构

```
.claude-plugin/  .codex-plugin/  .cursor-plugin/  .agents/plugins/  gemini-extension.json   各宿主的清单
hooks/  bin/duck.js     开场注入、读插件文件的放行（Node，不装依赖）
rules/                  常驻规则、命令模板、命令表
skills/                 14 条命令
library/                Supervisor-Skills 的 10 个原技能（上游提交 aff5de9），原样存放
handbook/               科研导师手册的文字版（zh、en）
cards/                  经验卡片，23 张，每张写明道理和出处
scripts/  tests/        生成、同步上游、测试
docs/                   说明文档、设计记录、调研
AGENTS.md               给不跑 hook 的 agent 用的常驻规则（生成的）
```

## 来源和致谢

- 方法论、手册和 10 个技能来自 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills)，Copyright (c) 2026 Yuyu Luo (methodology) and contributors。本仓库从它的提交 c243997（2026-07-01）分出来，上游到那时为止的提交历史和作者都保留在本仓库的历史里。
- 多宿主的做法参考了 [ponytail](https://github.com/DietrichGebert/ponytail) 和 [superpowers](https://github.com/obra/superpowers)。

## 许可

按目录分：我们写的文字（`skills/`、`rules/`、`cards/`）用 CC BY-NC-SA 4.0，不可商用；代码（`bin/`、`hooks/`、`scripts/`、`tests/`）用 MIT；`library/` 里的原技能各自保留原来的许可，`handbook/` 是 CC BY-NC-SA 4.0。详见 [LICENSE](LICENSE) 和 [LICENSES/README.md](LICENSES/README.md)。

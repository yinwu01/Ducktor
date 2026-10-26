<h1 align="center">Doctor Duck</h1>

<p align="center">
  <em>AI 干活。鸭子先问你。你知道为什么。</em>
</p>

<p align="center">
  <sub>Trust me, I'm a Ducktor.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Codex-111111?style=flat-square" alt="Works with Claude Code and Codex">
  <img src="https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY--NC--SA%204.0-111111?style=flat-square" alt="License: MIT and CC BY-NC-SA 4.0">
</p>

<p align="center">
  <sub>简体中文 &middot; <a href="i18n/README.en.md">English</a></sub>
</p>

---

你认识它。它是一只黄色的橡皮鸭。它坐在程序员的桌上。程序出了 bug，你把代码一行一行讲给它听；它一言不发，你自己找到了 bug。

Doctor Duck 把它放进你的 AI 里，再反过来用：AI 做研究，鸭子把每一步讲给你听，要紧的决定先问你。

## 之前 / 之后

你让 AI 把一个新结果写进论文：32k 长度上 70.9 对 70.6，摘要里写「更好」。没有鸭子，AI 直接改表，在摘要里写上 scores higher 这类句子；改完它才提一句，差距只有 0.3 分。有鸭子，AI 先查证据够不够。它不改文件，先问你：这两个数各跑了几次？摘要该怎么写？论文一行没改。

每次的原话和改动见 [evals/before-after/](evals/before-after/)。

## 先问，再动手

`/duck on` 在一个项目里打开鸭子。打开以后，你照常让 AI 干活，鸭子在两个地方出声：动手之前，和做完之后。会改变做法的决定，它先问你，一次最多问三件。定了方法、改了实验、写完一段，它在回复末尾讲一句为什么；有取舍时，再记一行决策：选了什么，放弃了什么，是你定的还是 AI 定的。

## 问为什么

`/duck-why` 拆开 AI 刚才做的那一步。它挑出最值得学的一个判断：新手常怎么做，有经验的研究者怎么想，哪位名家写过这个道理。你也可以指定一个文件、一次 git 提交或一个段落。卡片、名家索引和手册里找不到出处时，它直说这是它自己的判断。

## 复盘

`/duck-learn` 在一段工作做完时复盘。它先问你一句：哪一步是你定的，哪一步最想重来。然后它把这一段的决策、报告和笔记串起来：本来想做什么，实际怎样，有经验的导师会盯哪里，哪些判断交给了 AI，下一步做什么。你的回答决定它给的下一步。

## 笔记本和决策记录

开着鸭子时，每一步值得带走的道理记进 `.duck/notebook.md`。有取舍的决定一条一行记进 `.duck/decisions.md`，写明是你定的还是 AI 定的。下次做同类的工作，鸭子先读笔记本，用得上就提出来。你说「这类我懂了」，这一类以后只记不讲。不想在对话里看讲解？`/duck quiet` 不显示讲解，记录照样写。`/duck on` 让讲解回来。

这些记录都是项目里的普通 markdown 文件，可以和论文一起提交进 git。组会上导师问「这个为什么这么定」，你翻得出来。插件的代码不联网，也不往项目以外写东西。

## 工作原理

把实验结果写进表或结论之前，鸭子按顺序查三件事，查到问题就先停下来问你：

1. 只跑了一次吗？差距和种子之间的波动比过吗？
2. 提升很大时，来源拆清楚了吗？
3. 结论比证据说得更强吗？

鸭子不替 AI 干活。干活的是 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) 的 10 个科研技能，从文献综述、评估 idea 到投稿前审稿。鸭子只管两件事：动手之前问你，做完以后讲给你听。

它问你，但不考你：它不出题，不打分，研究往哪走由你决定。

鸭子讲的道理只从三个地方取：插件带的 23 张经验卡、名家文章索引和科研手册。对不上出处时，它直说这是它自己的判断。

## 规则

Doctor Duck 的常驻规则是一个文件：[`rules/core.md`](rules/core.md)。给只读规则文件的宿主用的版本是 [`AGENTS.md`](AGENTS.md)。14 条命令在 [`skills/`](skills/)，10 个原技能原样放在 [`library/`](library/)。仓库里的其他文件，都是为了把它们装进不同的宿主。

## 安装

需要 Node.js 18 或更高版本。仓库现在是私有的：你的 GitHub 账号要有访问权限。

**Claude Code**，在终端里敲两条命令：

```bash
claude plugin marketplace add JoeyWu-tech/Doctor-Duck
claude plugin install duck@doctor-duck
```

**Codex：**

```bash
codex plugin marketplace add JoeyWu-tech/Doctor-Duck
codex plugin add duck@doctor-duck
```

然后在 Codex 里打开 `/hooks`，信任 Doctor Duck 的 hook，再开一个新会话。

**其他宿主：**把 [`AGENTS.md`](AGENTS.md) 复制到你的项目里。这样只有常驻规则，没有命令。Cursor、Gemini CLI、Qwen Code 有适配文件，还没有实测：**[docs/agent-portability.md](docs/agent-portability.md)**。

就这些。在放论文和代码的文件夹里开一个新会话，敲 `/duck`。鸭子 quack 一声，列出菜单。

刚装好时，鸭子在每个项目里都不出声，只在你敲 `/duck-*` 命令时干活。在一个项目里敲一次 `/duck on`，鸭子就在这个项目里先问再动手。开关记在这个项目的 `.duck/config.md` 里，别的项目不受影响。会话要在项目最外层的文件夹里开；在 `paper/` 这样的子文件夹里开，鸭子读不到开关。

只从 GitHub 上的 `JoeyWu-tech/Doctor-Duck` 安装 Doctor Duck。从 GitHub 安装，我们只验证了能装上；完整的流程是在本地装好以后测的。更新、卸载和常见问题见 [INSTALL.md](INSTALL.md)。

## 命令

| 命令 | 作用 |
|------|------|
| `/duck [on \| quiet \| off]` | 不带参数时列出菜单。`on` 在这个项目里打开鸭子，`quiet` 只记不讲，`off` 关掉。后面接一句话时，它替你挑一条命令，先说挑了哪条，再动手。 |
| `/duck-survey` | 摸方向，做文献综述。 |
| `/duck-idea` | 评估一个 idea 值不值得做。 |
| `/duck-vibe` | 判断这块活让 AI 干到哪一步，哪些由你自己把关。 |
| `/duck-outline` | 理清论文的逻辑。技术论文和 benchmark 论文各有一个模板。 |
| `/duck-intro` | 写引言。 |
| `/duck-write` | 写正文。 |
| `/duck-figure` | 设计图，检查出图质量。 |
| `/duck-polish` | 润色。 |
| `/duck-review` | 投稿前，用审稿人的标准审你自己的稿子。 |
| `/duck-why` | 拆开刚才那一步。也可以指定文件、git 提交或段落。 |
| `/duck-learn` | 一段工作做完时复盘。 |
| `/duck-notes` | 看、改笔记本。 |
| `/duck-skill` | 关掉或打开命令，改命令和规则的副本，加你们组自己的经验卡。 |

命令要装整个插件才能用，因为命令要读 `library/` 里的原技能。Claude Code 和 Codex 实测过。在 Codex 里，命令写成 `$duck:duck-review`。只读 `AGENTS.md` 的宿主只加载常驻规则，没有这些命令。

## 常见问题

**要配置文件吗？**
不要。`/duck on` 会在项目里建 `.duck/config.md`。你可以用 `/duck-skill` 关掉命令或加卡，但什么都不是必需的。

**它会改我的论文吗？**
你让 AI 改，它才改。开着鸭子，结果要写进论文时，它先问你。

**我就想让它直接改呢？**
说一句「这次不用问我，你直接定。」它就直接改。它把替你定的事记进 `.duck/decisions.md`，标成「AI 定」或「AI 定，你授权」。

**它给我打分吗？**
不给。`/duck-idea` 和 `/duck-review` 会给 idea 和稿子打分。那是评东西，不评人。

**为什么叫「鸭子」？**
小黄鸭调试法：把代码讲给桌上的橡皮鸭听，讲着讲着就找到了 bug。Doctor Duck 反过来用：AI 做事，鸭子讲给你听。

## 来源和致谢

- 名字来自小黄鸭调试法（[Rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)），出自《程序员修炼之道》（The Pragmatic Programmer）。
- 方法论、手册和 10 个技能来自 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills)。版权：Copyright (c) 2026 Yuyu Luo (methodology) and contributors。本仓库的提交历史从上游 c243997（2026-07-01）分出来。上游到那时为止的提交和作者都保留着。`library/` 和 `handbook/` 的内容取自上游 aff5de9（2026-07-16）。
- README 的结构和写法参考了 [ponytail](https://github.com/DietrichGebert/ponytail)（MIT）。多宿主的做法参考了 ponytail 和 [superpowers](https://github.com/obra/superpowers)。

## 许可证

按目录分。我们写的文字（`skills/`、`rules/`、`cards/`）和 `handbook/` 用 CC BY-NC-SA 4.0，不可商用。代码（`bin/`、`hooks/`、`scripts/`、`tests/`）用 MIT。`library/` 里的原技能保留原来的许可。详见 [LICENSE](LICENSE) 和 [LICENSES/README.md](LICENSES/README.md)。

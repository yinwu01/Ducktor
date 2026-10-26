<h1 align="center">Doctor Duck</h1>

<p align="center">
  <em>AI 干活。鸭子先问你。你知道为什么。</em>
</p>

<p align="center">
  <sub>Trust me, I'm a Ducktor.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Codex-111111?style=flat-square" alt="Works with Claude Code and Codex">
  <img src="https://img.shields.io/badge/license-MIT%20%C2%B7%20CC%20BY--NC--SA%204.0%20%C2%B7%20CC%20BY%204.0-111111?style=flat-square" alt="License: MIT, CC BY-NC-SA 4.0 and CC BY 4.0">
</p>

<p align="center">
  <sub>简体中文 &middot; <a href="i18n/README.en.md">English</a></sub>
</p>

---

你认识它：程序员桌上那只黄色的橡皮鸭。程序出了 bug，你把代码一行一行讲给它听。它一言不发，你自己找到了 bug。

Doctor Duck 把它放进你的 AI 里。这一只会说话。

## 之前 / 之后

你让 AI 把一个新结果加进表里，再在摘要里补一句「更好」。新方法只比基线高一点。没开鸭子，AI 直接改表，在摘要里写上 scores higher。改完它才提一句：差距很小。开着鸭子，AI 动手之前，鸭子先问你：这两个数各跑了几次？摘要该怎么写？论文一行没改。

这组对比的设置和对话原文见 [evals/before-after/](evals/before-after/)。

## 先问，再动手

`/duck on` 在一个项目里打开鸭子。然后你照常让 AI 干活。会改变做法的决定，鸭子先问你，一次最多问三件。AI 定了方法、改了实验或写完一段，鸭子在回复末尾讲一句为什么。有取舍时，它再记一行决策。

## 问为什么

`/duck-why` 讲 AI 刚才那一步。它挑出这一步里最值得学的一个判断。它讲新手常怎么做、有经验的研究者怎么想、哪位名家写过这个道理。你也可以指定一个文件、一次 git 提交或一个段落。

## 复盘

`/duck-learn` 在一段工作做完时复盘。它先问你：哪一步是你定的，哪一步最想重来。你可以不答。然后它读这一段的决策、报告和笔记。它讲本来想做什么、实际怎样、有经验的导师会盯哪里。它列出哪些判断交给了 AI，最后给下一步。你答了的话，下一步会用上你的回答。

## 笔记本和决策记录

开着鸭子时，鸭子把讲过的道理记进 `.duck/notebook.md`。有取舍的决定，每条一行，记进 `.duck/decisions.md`，写明是你定的还是 AI 定的。没开鸭子时，只有敲命令才记。下次敲命令做同类的事，鸭子先翻笔记本，用得上的旧条目会点出来。你说「这类我懂了」，这一类以后只记不讲。不想在对话里看讲解？`/duck quiet` 不显示讲解，记录照样写。`/duck on` 让讲解回来。

这些记录都是项目里的普通 markdown 文件，可以和论文一起提交进 git。组会上导师问「这个为什么这么定」，你翻得出来。插件的开场脚本只读文件，不联网，也不写文件。AI 读到的内容照常发给模型。`/duck-survey` 会让 AI 上网查文献。

## 工作原理

开着鸭子时，你让 AI 把实验结果写进表或结论，鸭子先查三件事。查到问题，它先停下来问你：

1. 只跑了一次吗？差距和种子之间的波动比过吗？
2. 提升很大时，来源拆清楚了吗？
3. 结论比证据说得更强吗？

敲 `/duck-*` 命令时不查这三件，照命令自己的步骤做。`/duck-survey`、`/duck-review` 这类命令里，AI 照 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) 的科研技能干活。这套技能是 HKUSTDial 开源的，一共 10 个，从文献综述、评估 idea 到投稿前审稿。

鸭子不出题，也不给你打分。

鸭子提到名家和出处时，只从这几处取：插件带的 23 张经验卡、你们组加的卡、[名家文章索引](cards/MENTORS.md)和科研手册。找不到出处时，它直说这是它自己的判断。

## 规则

Doctor Duck 是一组规则和命令。说话的还是你的 AI。开着鸭子的项目，每个会话开头都加载常驻规则 [`rules/core.md`](rules/core.md)。给只读规则文件的 AI 工具用的版本是 [`AGENTS.md`](AGENTS.md)。14 条命令在 [`skills/`](skills/)，10 个科研技能原样放在 [`library/`](library/)。经验卡和名家文章索引在 [`cards/`](cards/)，科研手册在 [`handbook/`](handbook/)。其余的文件，有的把这些装进不同的 AI 工具，有的是测试和文档。

## 安装

需要 Node.js 18 或更高版本。仓库现在是私有的，你的 GitHub 账号要先拿到访问权限。

**Claude Code**，在终端里：

```bash
claude plugin marketplace add JoeyWu-tech/Doctor-Duck
claude plugin install duck@doctor-duck
```

**Codex：**

```bash
codex plugin marketplace add JoeyWu-tech/Doctor-Duck
codex plugin add duck@doctor-duck
```

然后在 Codex 里打开 `/hooks`，信任 Doctor Duck 的两条 hook，再开一个新会话。

**其他 AI 工具：**把仓库放到本机。把 [`AGENTS.md`](AGENTS.md) 复制到你的项目里。告诉 AI 仓库放在哪。这样有常驻规则，没有斜杠命令；要用某条命令，就说「照 Doctor Duck 的 /duck-review 做」。Cursor、Gemini CLI、Qwen Code 有适配文件，还没有实测：**[docs/agent-portability.md](docs/agent-portability.md)**。

就这些。在项目最外层的文件夹里开一个新会话，敲 `/duck`。Codex 里敲 `$duck:duck`。鸭子 quack 一声，列出菜单。

刚装好时，鸭子不出声，只在你敲 `/duck-*` 命令时干活。在一个项目里敲一次 `/duck on`，鸭子就在这个项目里先问你，AI 再动手。开关记在这个项目的 `.duck/config.md` 里，别的项目不受影响。在 `paper/` 这样的子文件夹里开会话，鸭子读不到开关。

完整流程只用本地副本测过；从 GitHub 安装，只测过能装上。更新、卸载和常见问题见 [INSTALL.md](INSTALL.md)。

## 命令

| 命令 | 作用 |
|------|------|
| `/duck [on \| quiet \| off]` | 不带参数时列出菜单。`on` 在这个项目里打开鸭子，`quiet` 只记不讲。`off` 关掉：命令照样能用，但不讲为什么，也不自动记录；`/duck-why`、`/duck-learn` 照常讲。后面接一句话时，比如 `/duck 帮我写引言`，它替你挑一条命令，先说挑了哪条，再做。 |
| `/duck-survey` | 找研究方向，做文献综述。 |
| `/duck-idea` | 评估一个 idea 值不值得做。 |
| `/duck-vibe` | 判断这块活让 AI 干到哪一步，哪些由你自己把关。 |
| `/duck-outline` | 理清论文的逻辑。技术论文和 benchmark 论文各有一个模板。 |
| `/duck-intro` | 写引言。 |
| `/duck-write` | 写正文。 |
| `/duck-figure` | 设计图，检查出图质量。 |
| `/duck-polish` | 润色。 |
| `/duck-review` | 投稿前，用审稿人的标准审你自己的稿子。 |
| `/duck-why` | 讲刚才那一步。也可以指定文件、git 提交或段落。 |
| `/duck-learn` | 一段工作做完时复盘。 |
| `/duck-notes` | 看、改笔记本。 |
| `/duck-skill` | 关掉或打开命令。改这个项目里的命令和规则，插件本身不变。加你们组自己的经验卡。 |

命令要装整个插件才能用，因为九条包装命令要读 `library/` 里的科研技能。在 Codex 里，`/duck-review` 写成 `$duck:duck-review`，其他命令照此类推。只读 `AGENTS.md` 的 AI 工具只加载常驻规则，敲不了这些命令。

## 常见问题

**要配置文件吗？**
不用。`/duck on` 会在项目里建 `.duck/config.md`。你可以用 `/duck-skill` 关掉命令或加卡。这些都可以不做。

**它会一直问我吗？**
不会。只有会改变做法的决定才问，一次最多三件。改错别字、只改一两句这类小事，它也不讲为什么。

**它会改我的论文吗？**
你让 AI 改，AI 才改。开着鸭子，结果要写进论文时，鸭子先查证据。证据不够，它先问你。

**我就想让它直接改呢？**
说一句「这次不用问我，你直接定。」AI 就不先问了。它照样记一行决策，写明是 AI 定的。

**它给我打分吗？**
不给。只有两条命令打分：`/duck-idea` 给 idea 打分，`/duck-review` 给稿子打分。

**为什么叫「鸭子」？**
你认识它。

## 来源和致谢

- 名字来自小黄鸭调试法（[Rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)），出自《程序员修炼之道》（The Pragmatic Programmer）。
- 方法论、手册和 10 个科研技能来自 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills)。Copyright (c) 2026 Yuyu Luo (methodology) and contributors。本仓库的提交历史从上游 c243997（2026-07-01）分出来。上游到那时为止的提交和作者都保留着。`library/` 和 `handbook/` 的内容取自上游 aff5de9（2026-07-16）。
- README 的结构和写法参考了 [ponytail](https://github.com/DietrichGebert/ponytail)（MIT）。支持多种 AI 工具的做法参考了 ponytail 和 [superpowers](https://github.com/obra/superpowers)。

## 许可证

按目录分。我们写的文字（`skills/`、`rules/`、`cards/`）和 `handbook/` 用 CC BY-NC-SA 4.0，不可商用。代码（`bin/`、`hooks/`、`scripts/`、`tests/`）用 MIT。`library/` 里的科研技能保留各自原来的许可：6 个用 CC BY 4.0，4 个用 CC BY-NC-SA 4.0。详见 [LICENSE](LICENSE) 和 [LICENSES/README.md](LICENSES/README.md)。

# Doctor Duck

> Trust me, I'm a Ducktor.

你用 AI 做科研，鸭子在旁边盯着：结论写进论文之前，先问你证据够不够。

Doctor Duck 是 Claude Code 和 Codex 的插件。AI 照常替你查文献、写论文，投稿前帮你先审一遍。在项目里敲一次 `/duck on`，碰到要你拍板的事（补不补种子、结论写多强），鸭子先停下来问你。做完一步，它讲一句 AI 为什么这么做，记进项目里的学习笔记。

## 有它和没它

同一句话，在一个测试项目里各跑 6 次（Claude Code，Sonnet）：

```
你：新结果出来了：32k 长度上 BlockSkip 70.9，稠密注意力 70.6。
    帮我把这一行加进 paper/main.tex 的表里，摘要里也补一句我们在 32k 上更好。
```

没开鸭子，6 次都直接改了论文。摘要里多了这样一句：

```
At 32k context length, BlockSkip also scores higher than dense attention (70.9 vs. 70.6).
```

改完它才补一句：只高 0.3 分，没有多个 seed 的话，审稿人可能会追问。

开了鸭子，6 次都没动文件，先问你（notes.md 是测试项目里的实验记录）：

```
我先没改文件。写进去之前有两处要和你确认。

1. 0.3 分的差距能不能当结论。notes.md 10-06 那条写着"只跑了一次"……
   如果同一方法换个种子就能差零点几分，这一行说明不了"更好"。
2. 摘要那句怎么写。"在 32k 上更好"比证据强。更稳妥的写法是
   "在 32k 上与稠密注意力精度相当（70.9 对 70.6），同时更快"。
……
- A（推荐）：先把 32k 的 BlockSkip 和 dense 各补跑 3 个种子，表里报均值±标准差……
- B：现在就按单次结果写进去，摘要用"相当"的措辞，表注里写明"单次运行"。
```

普通 Claude 也看得出问题，只是先改了再说。开了鸭子，结论进论文之前，先过你这一关。它会先看三件事：只跑了一次吗？提升来自哪一块，拆清楚了吗？结论说得比证据强吗？

不装鸭子，在项目的 CLAUDE.md 里写一句「把实验结果或结论写进论文之前，先问我。」也有用，但不稳：同一句话跑 6 次，3 次先问，3 次照样改了，摘要写的是 higher accuracy 或 outperforms。

AI 平时也会在末尾总结几句，那是改完以后的事。鸭子在动手之前问，事后把谁定了什么记进 `.duck/decisions.md`，一条一行。组会上导师问「这个为什么这么定」，你翻得出来。

测试项目是虚构的，每次的原话和改动都在 [evals/before-after/](evals/before-after/)。

## 为什么是鸭子

写代码的人多半听过小黄鸭调试法。程序出了 bug，就把代码一行一行讲给桌上的橡皮鸭听。讲着讲着，你会在某一行卡住：这里我当初为什么这么写？bug 常常就藏在那儿。

现在 AI 替你干活，「讲一遍」这一步没了。组会上有人问「为什么只比这两个 baseline」，你答不上来：这不是你定的，当时也没人记下来。

Doctor Duck 把这一步找回来。要紧的决定，鸭子先停下来问你，你得自己拿主意；AI 做完一步，它讲给你听为什么这么做。

## 只记一个 /duck

第一次在项目里用，先敲 `/duck on`。之后 `/duck` 后面接一句话就行，它替你挑一条命令来做：

```
/duck 帮我审一下 paper/main.tex
/duck 这个 idea 值不值得做：用块均值估计注意力，贡献小的整块跳过
/duck 刚才那一步为什么这么改
```

Codex 里写成 `$duck:duck 帮我审一下 paper/main.tex`。

做完，回复末尾多一小段，讲这一步为什么这么做。比如审完稿：

> 这次把"表里没有现有稀疏注意力方法"定成 CRITICAL，把"0.8 个点没有波动"定成 MAJOR：前者让摘要里的一句话变成假话，后者只是证据弱。……
> **论文里每个强词（significantly、best、general、demonstrates）都要能指到表里一个具体数字，指不到就降级成 suggests 或直接删掉。**
> 下次写完摘要，先把里面的比较对象和强词各列一行，逐个在表里找对应的行和数字，找不到再动笔改。
> ▸ 决策：审稿结论为需要大改后再投，先补真实对手、多 seed 和消融，再改措辞（AI 定，改不改、投不投你定）

加粗那句是这一步最值得带走的，它会记进项目里的学习笔记 `.duck/notebook.md`，一个普通的 markdown 文件。最后一行记下这一步谁定了什么。下回干同类的活，鸭子先翻一翻，用得上就点出来。

想知道刚才那一步能学到什么，敲 `/duck-why`。它挑出一个判断，讲新手常怎么做、有经验的人怎么想、哪位研究者写过这个道理。一段做完，敲 `/duck-learn` 复盘，它先问你一句：哪一步是你定的，哪一步最想重来。

一轮完整的演示（审稿、问为什么、复盘，都是测试时的原话）见 [docs/walkthrough.md](docs/walkthrough.md)。

## 开关

`/duck on` 以后，你不敲命令、照常让 AI 干活，它也会：

- 碰到会改变做法的决定，先问你，一次最多三件。
- 要把结果写进表、写成结论时，先看上面那三件事。
- 定了方法、改了实验、写完一段，讲一句为什么。改错别字这种小事不讲。
- 你说「这类我懂了」，这一类以后只记不讲。

开关只管当前这个项目（放论文和代码的那个文件夹）：

| | 平时让 AI 干活 | 敲 `/duck` 开头的命令 |
|---|---|---|
| 刚装好 | 不出声 | 做完讲为什么，记下来 |
| `/duck on` | 先问你，做完讲为什么，记下来 | 做完讲为什么，记下来 |
| `/duck quiet` | 照样先问；讲解不说，照样记下来 | 讲解不说，存进 `.duck/reports/` |
| `/duck off` | 不出声 | 照样干活，不讲也不记 |

`/duck-why`、`/duck-learn` 是你专门要它讲，哪一档都照常讲。

## 它讲的道理从哪来

- 干活的是 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) 的 10 个科研技能，从文献综述、评估 idea 到投稿前审稿。已经装在插件里，不用另装。
- 插件带了 23 张经验卡，一张写一条做法、道理和出处。
- 还有一份名家文章索引 [cards/MENTORS.md](cards/MENTORS.md)，收了 Hamming、Schulman、Karpathy 等人讲科研的 45 篇文章。每篇用我们自己的话转述，附原文链接。

鸭子提到哪位研究者，只从这些地方取，对不上就直说是它自己的判断。它不给你出题，也不给你打分，研究往哪走你说了算。

## 安装

需要 Claude Code 或 Codex，再加 Node.js 18 以上。仓库现在是私有的，你的 GitHub 账号要有访问权限。

```
# Claude Code
claude plugin marketplace add JoeyWu-tech/Doctor-Duck
claude plugin install duck@doctor-duck

# Codex（装好后在 /hooks 里信任 Doctor Duck 的 hook）
codex plugin marketplace add JoeyWu-tech/Doctor-Duck
codex plugin add duck@doctor-duck
```

装好后开一个新会话，敲 `/duck`，鸭子 quack 一声，把菜单列给你。想要上面那种先问再改，在项目里再敲一次 `/duck on`。Codex 里写成 `$duck:duck`、`$duck:duck on`。更新、卸载和常见问题见 [INSTALL.md](INSTALL.md)。

## 全部命令

不想记，就只用 `/duck` 加一句话。Codex 里把 `/duck-review` 写成 `$duck:duck-review`。

| 命令 | 做什么 | 背后的技能 |
|---|---|---|
| **动笔前** | | |
| `/duck-survey` | 摸方向、文献综述 | deep-research |
| `/duck-idea` | 评估 idea 值不值得做 | idea-evaluator |
| `/duck-vibe` | 这块活该让 AI 干到哪、你自己把关哪些 | vibe-research-workflow |
| **写论文** | | |
| `/duck-outline` | 理清论文逻辑 | tech-paper-template、benchmark-paper-template |
| `/duck-intro` | 写引言 | intro-drafter |
| `/duck-write` | 写正文 | paper-writer |
| `/duck-figure` | 设计图、出图质检 | figure-designer |
| `/duck-polish` | 润色 | paper-polish |
| **投稿前** | | |
| `/duck-review` | 按审稿人的眼光审你自己的稿子 | pre-submission-reviewer |
| **学东西** | | |
| `/duck-why` | 刚才那一步能学到什么，也可以指定文件、git 提交、段落 | |
| `/duck-learn` | 一段做完，复盘 | |
| `/duck-notes` | 看、改学习笔记 | |
| **设置** | | |
| `/duck` | 菜单；`/duck on`、`quiet`、`off` 切开关；后面接一句话，它替你挑命令 | |
| `/duck-skill` | 关掉命令、加你们组自己的经验卡 | |

## 常见问题

**它会改我的论文吗？**
你让 AI 改，它才改。开了鸭子，结果要写进论文时，它先问你。

**夜里跑长任务，它会停下来等我吗？**
交代一句「这次不用问我，你直接定」，它就照常做完。决策行里会记下「AI 定，你授权」，第二天你翻 `.duck/decisions.md` 能看到它替你定了什么。上面那个例子加了这句以后，3 次都直接改完，摘要里写的是 matches 或 slightly higher，不是 outperforms。这句话也能用来跳过它，跳过了会留下记录。

**回复会变长吗？多花钱吗？**
命令收尾多三到五行，嫌多就 `/duck quiet`。上面那个例子用 Sonnet 跑，没开鸭子每次约 0.13 美元；开着鸭子、让它直接改完，每次约 0.15 美元（各 3 次）。

**名家的那些话可信吗？**
都是转述，不是原话，附了原文链接。鸭子把一条道理用到你这件事上时，会说明这是它的延伸。

**不是做机器学习的能用吗？**
能用，只是背后的技能照计算机方向的会议论文写，审稿时会问 baseline、消融（去掉一部分看效果）这类事，卡片和名家文章也偏计算机。综述、润色、作图这几条最不挑方向。

**还没到写论文的阶段呢？**
`/duck-survey` 帮你摸方向。`/duck-why` 后面接你的分析脚本或某次 git 提交，它也能讲。别的命令多半是写论文和投稿用的。

**只用过 ChatGPT 网页版，能用吗？**
要先装 Claude Code 或 Codex。它们在终端里跑，能直接读写你文件夹里的文件，要付费账号或 API key。鸭子管的正是这种 AI 直接改你文件的情况。

**我的东西存在哪？**
项目里只多一个 `.duck/` 文件夹，放开关设定、学习笔记、决策记录和报告，全是普通的 markdown，可以进 git。插件不往项目以外写东西，自己也不联网；AI 读到的内容照常发给 Claude 或 Codex 的模型，和不装插件一样。

**和 Supervisor-Skills 是什么关系？**
10 个技能原样放在 `library/` 里，一个字没改。鸭子在外面包一层：先查你的设定和组里的卡，再照原技能做，最后讲为什么。

**导师能看到什么？**
开着鸭子时，有取舍的决定一条一行记进 `.duck/decisions.md`，写明是你定的还是 AI 定的。学习笔记里是这一路用到的道理。都是项目里的普通文件，可以和论文一起提交进 git。这是帮学生回忆的记录，学生自己能改，不是审计日志。

## 更多

- [怎么运行的](docs/how-it-works.md)、[在哪些 agent 上能用](docs/agent-portability.md)（Claude Code、Codex 实测过；Cursor、Gemini CLI、Qwen Code 有适配，未实测）、[测试和结果](docs/testing.md)
- 开发：`npm test` 不调模型；改了 `rules/` 以后 `npm run build` 重新生成命令；`node tests/e2e/flow.js claude` 用真模型走一遍（要花钱）。

## 来源和致谢

- 名字和点子来自小黄鸭调试法（[Rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)），出自《程序员修炼之道》（The Pragmatic Programmer）。
- 方法论、手册和 10 个技能来自 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills)，Copyright (c) 2026 Yuyu Luo (methodology) and contributors。本仓库从它的提交 c243997（2026-07-01）分出来，上游到那时为止的提交历史和作者都保留在本仓库的历史里。
- 多宿主的做法参考了 [ponytail](https://github.com/DietrichGebert/ponytail) 和 [superpowers](https://github.com/obra/superpowers)。

## 许可

我们写的文字（`skills/`、`rules/`、`cards/`）用 CC BY-NC-SA 4.0，不可商用。代码（`bin/`、`hooks/`、`scripts/`、`tests/`）用 MIT。`library/` 里的原技能保留原来的许可，`handbook/` 是 CC BY-NC-SA 4.0。详见 [LICENSE](LICENSE) 和 [LICENSES/README.md](LICENSES/README.md)。

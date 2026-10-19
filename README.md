# Doctor Duck

> Trust me, I'm a Ducktor.

写代码的人多半听过小黄鸭调试法：桌上摆一只橡皮鸭，程序出了 bug，就把代码一行一行讲给它听。鸭子一声不吭，可讲着讲着，你会在某一行卡住：这里我当初为什么这么写？bug 常常就藏在讲不清的地方。这个说法出自《程序员修炼之道》（The Pragmatic Programmer）里的一个故事。

现在用 AI agent 做科研，文献、实验、引言都可以交给 AI，东西一样不缺，「讲一遍」这一步却很容易省掉。要是组会上有人问一句「为什么只比这两个 baseline」，你可能答不上来。这个决定不是你做的，AI 做的时候也没人记下来。

Doctor Duck 想把这一步找回来，只是把鸭子反过来用了：大部分时候是它讲，你听。它是 Claude Code 和 Codex 的插件，背后干活的是 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) 的 10 个科研技能，从文献综述、评估 idea、写引言到投稿前审稿，每个都能用一条 `/duck-*` 命令叫出来。AI 照常干活，鸭子在旁边：

- AI 做完一步实质性的活，鸭子讲一句为什么。有取舍时再记一行：选了什么，放弃了什么，是你定的还是 AI 拍的板。
- 碰到会改变做法的决定，它先停下来问你。
- 一段做完，敲 `/duck-learn` 复盘。它开讲之前先问你一句：这次哪一步是你自己定的，哪一步最想重来。你的回答用来定它给的下一步。

真正要你开口的就这两处：拍板之前，和复盘开头。鸭子讲过的道理会记进你项目里的笔记本。下回干同类的活，它先翻一翻，用得上就点出来；哪一类你说「这类我懂了」，它以后就只记不讲。

上面说的平时跟着，要在项目里敲一次 `/duck on` 才开始。没开启的项目里，鸭子只在你敲 `/duck-*` 命令时出声。

## 看它干活

下面是测试时的原话，节选。项目是虚构的（[`tests/fixtures/grad-project`](tests/fixtures/grad-project)）：一个研究生在做长文本推理加速，手里有实验笔记、一段代码和一份论文草稿，草稿里写着 delve into、game-changer 这种词。跑在 Claude Code 里，模型是 Sonnet 5.5。

投稿前先审一遍。草稿拿了 3 分（满分 10），game-changer 也没跑掉：

```
你：/duck-review paper/main.tex

鸭子：# 投稿前审稿：paper/main.tex
  ## 摘要
  - CRITICAL: 2
  - MAJOR: 10
  - MINOR: 5
  - 评分：3/10。建议：Needs major revision before submission。
  ……
  10. 夸大用语："game-changer"、"best accuracy and the largest speedup"（只比了两个对手）。MAJOR
      建议：写成具体事实：在哪个基准、哪个条件下、比谁。
  ……
```

这个项目敲过 `/duck on`。再让 AI 顺手改一句摘要。改完它没讲为什么，只提了一句有对应的命令，那就敲 `/duck-why` 问它刚才怎么想的：

```
你：帮我把 paper/main.tex 摘要的第一句改得更紧凑一点。

鸭子：我改好了摘要的第一句（paper/main.tex:8）：
  - 原句：Long-context inference is slow because attention cost grows quadratically with sequence length.
  - 新句：Attention's quadratic cost makes long-context inference slow.
  新句只保留了「二次方代价 → 长文本推理慢」这一条因果，从 13 个词压到 9 个词，意思没变。
  这类整段润色正好归 /duck-polish 管。……

你：/duck-why

鸭子：更正：上一轮我说「13 个词压到 9 个词」，数错了。按连字符词算一个词，原句 12 词，新句 7 词。
  - 用的思路：把「因为……所以……」的从句结构压成「名词短语 + 动词 + 宾语」的主句，只保留一条因果。
    这能对着产物核对：原句有 because 从句，新句没有。
  - 为什么：这是我自己的判断，没有对应的卡或手册章节。
  - 这次的过程：你定：要把第一句改得更紧凑。我定：具体怎么压。……记录里没有这一步的决策行，我当时也没给备选句。
  - 放弃了什么：只删词、保留两层结构："Long-context inference is slow: attention cost grows quadratically
    with sequence length."（约 12 词）。它保留了「随序列长度」这个变量。……
  - 这次压掉的东西：新句把 "with sequence length" 整个删了。"quadratic" 对什么二次，读者要自己补。
    摘要读者基本都懂，但这是取舍，不是白捡的紧凑。
  - （以上根据代码和过程记录重建，不是 AI 内部过程的回放。）
  - 你能带走的一条：压句子时先问「读者必须带走的变量是哪个」，别一起压掉。
  - 要核对的话：只读 "Attention's quadratic cost"，看你的目标读者会不会追问「对什么二次」。……
```

鸭子开口第一句，先认了自己上一轮数错的词。它也会错，所以讲的东西尽量附一个你自己能核对的办法。找不到出处时，它会直说是自己的判断。

一段做完，敲 `/duck-learn` 复盘。这回鸭子先问你。复盘一共五段，这里只放最后两段：

```
你：/duck-learn

鸭子：先说一句：这次哪一步是你自己定的，哪一步最想重来？不想说可以跳过。

你：补 seed 是我定的。最想重来的是摸方向，搜得太窄了。

鸭子：……
  这次交给 AI 的判断（decisions.md 里标「AI 定」的）：
  - 判 Accept with Revisions，对手扩到块稀疏方法。
  - 判 Needs major revision，先补基线和多 seed，再改文字。
  - 摘要不改动，第 10 行只列成待确认的建议。
  「补多 seed」那条的决策行写的是「AI 定，待你确认」。你说它是你定的，我理解为你确认了这一条，
  没有改 decisions.md 里的原话。下次想自己定，说一声就行。
  下一步：
  1. 敲 /duck-survey，把关键词放宽：块稀疏、动态稀疏注意力、KV 选择、长文本 prefill 加速。
     每个方向查最近的 3 到 5 篇，再回头定主对手。
  2. 把 10-06 的配置换 3 个 seed 重跑，加「随机选块」对照。
```

你说搜得太窄，它给的第一步就是回去把搜索放宽。

为什么偏要你开这两次口？动手前我们查过几项研究。一项 52 人的实验里，把思考整个交给 AI 的人学得最差，边用边追问概念的人没受影响；不过按用法细分后每组只有几个人，只能算初步证据。复盘有元分析撑着，平均能提升表现，那里的复盘是本人自己回顾、大家一起讨论。另有一项 704 人的预注册实验发现，事后提醒一句「你刚才怎么用的 AI」也有用，只是任务是分数运算，很窄。出处和细节见[调研记录](docs/design/2026-10-15-导师插件-调研与讨论稿.md)的 3.3 节。

一轮下来，项目里的 `.duck/notebook.md` 攒了六条，括号里是出处：

```
- 10-18 评估 idea｜效率方法的对手要选同赛道最近的方法，主结果先换 seed 并分离增益来源（卡 E05、R02）
- 10-18 投稿前｜摘要里写的每个比较对象，表里都要有一行（卡 E02、E05、R02）
- 10-18 写摘要｜压句子时先问读者必须带走的变量是哪个，别一起压掉（自己的判断）
- 10-18 润色｜润色只调语言强度，证据不够就回去补实验，不替证据撑场面（卡 W11）
- 10-18 复盘｜摸方向先宽后窄，先查最近的同赛道工作再定对手（自己的判断）
- 10-18 复盘｜写一条结论前先试着推翻它，并单写局限一节（卡 E02）
```

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

装好后开一个新会话（已经开着的会话看不到新插件），敲 `/duck`，鸭子会 quack 一声，把菜单列给你。Codex 里敲 `$duck:duck`。更新、卸载、用本地仓库安装和常见问题见 [INSTALL.md](INSTALL.md)。

装好以后鸭子平时不出声，哪个项目都一样：敲 `/duck-*` 命令时它才干活。想让它在某个项目里平时也跟着（下一节的规矩），在那个项目里敲一次 `/duck on`。别的项目不受影响。

## 鸭子的规矩

在项目里敲过 `/duck on` 之后，不敲命令、照常让 AI 干活的时候，鸭子也跟着：

- 要做的决定会改变做法时，先问再动手。一次最多问三件，不考你知识题。
- 做完一步实质性的活，比如定了方法、改了实验、写完一段，回复末尾多一行「为什么」。改错别字这种小事不讲。
- 有取舍时再多一行决策，写清选了什么、放弃了什么、谁定的，同时记进 `.duck/decisions.md`：
  ```
  ▸ 决策：seed 1→3，不再用单次结果（你定）；表里报均值±标准差，不报最好一次（AI 定）
  ```
- 你让它把实验结果写进表、写成结论时，它先对三条标准：只跑了一次，或者差距没和种子间的波动比过；提升很大，却没拆出来源；结论说得比证据强。撞上了先说一声，问你要不要先补。
- 你要做的事正好归某条命令管，它会告诉你是哪条。只改一两句的小事，它先改好再提；大一点的事，等你点头再按命令来。
- 你说「这类我懂了」，这一类以后只记不讲。

它不出题，不留作业，不给你打分，也不写什么成长档案。原技能会给 idea 和稿子打分，上面那份草稿的 3/10 就是这么来的；那是评东西，不评人。

讲道理时，名家的名字和出处只从卡片和手册里取。插件带了 23 张经验卡，每张写明道理、出处和认同程度（共识、有出处、有分歧）。你们课题组也可以加自己的卡，和插件自带的卡冲突时以你们的为准；只有涉及诚信的事，它照做之余会提一句。

## 命令

Codex 里把 `/duck-review` 写成 `$duck:duck-review`，其他命令同理。

| 命令 | 做什么 | 背后的技能 |
|---|---|---|
| `/duck` | 不带参数是菜单；`/duck on`、`quiet`、`off` 切开关；后面接一句话，它替你挑一条命令，先说挑了哪条再动手 | |
| `/duck-survey` | 摸方向、做文献综述 | deep-research |
| `/duck-idea` | 评估 idea | idea-evaluator |
| `/duck-outline` | 理论文逻辑，技术论文和 benchmark 论文各用一个模板 | tech-paper-template、benchmark-paper-template |
| `/duck-intro` | 写引言 | intro-drafter |
| `/duck-write` | 写正文 | paper-writer |
| `/duck-polish` | 润色 | paper-polish |
| `/duck-figure` | 设计图、出图质检 | figure-designer |
| `/duck-review` | 投稿前审稿 | pre-submission-reviewer |
| `/duck-vibe` | 这块活该让 AI 干到哪、用什么工具 | vibe-research-workflow |
| `/duck-why` | 拆刚才那一步，也可以指定文件、函数、提交、段落；不是鸭子命令做的事也能拆 | |
| `/duck-learn` | 阶段复盘，开头先问你一句 | |
| `/duck-notes` | 看、改笔记本 | |
| `/duck-skill` | 关掉或打开某条命令、改命令的副本、加你们组的卡 | |

## 开关

鸭子在每个项目里默认没开启：平时不出声，敲命令时照命令做，命令自带的「为什么」照常给。在项目里敲 `/duck on` 才开启，开关记在这个项目的 `.duck/config.md` 里。嫌开着话多，就 `/duck quiet`：照记照存，对话里只给结果。

| | 平时干活 | 命令跑完，对话里 | 写进 `.duck/` |
|---|---|---|---|
| 没开启（默认） | 不出声 | 和 on 一样 | 只有敲命令时写：报告、决策、笔记 |
| `/duck on` | 按上面的规矩跟着 | 结果，加 5 到 8 行「为什么」和决策行 | 报告、决策、笔记 |
| `/duck quiet` | 照规矩做，但不在对话里讲 | 只有结果 | 报告、决策、笔记 |
| `/duck off` | 不出声 | 只有结果 | 不自动写；你让它记笔记、加卡、改设定时照写 |

`/duck-why` 和 `/duck-learn` 是你专门叫的，哪一档都照常讲。

## 你的项目里会多什么

只多一个 `.duck/` 文件夹：开关设定、笔记本、决策记录、完整报告、你们组的卡、你改过的命令副本。全是普通的 markdown，可以进 git。插件不往你的项目以外写东西。

## 支持哪些 agent

| | 状态 |
|---|---|
| Claude Code 2.1.303 | 实测（本地加载）：14 条命令全部、开关各档、开场注入、读插件文件的放行。从 GitHub 安装只验证了能装上 |
| Codex 0.163.0 | 实测（本地路径安装）：同上。从 GitHub 安装只验证了能装上 |
| Cursor、Gemini CLI、Qwen Code | 有适配文件，未实测 |
| 只读 `AGENTS.md` 的 agent | 只有常驻规则，未实测 |

详见 [docs/agent-portability.md](docs/agent-portability.md)。

## 怎么运行的

- 开会话时，hook 把插件位置和你项目的开关塞进上下文；项目开启了（on 或 quiet），再加上常驻规则（`rules/core.md`），没开启就只放一小段说明（`rules/idle.md`）。
- 每条 `/duck-*` 命令是一层包装：先查你的设定和你们组的卡，再读 `library/` 里原样存放的 Supervisor-Skills 技能照做，最后按开关讲「为什么」。
- 原技能一个字没改，和上游逐文件比对（`library/upstream.lock.json`）。

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

- 名字和点子来自小黄鸭调试法（[Rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)）。
- 方法论、手册和 10 个技能来自 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills)，Copyright (c) 2026 Yuyu Luo (methodology) and contributors。本仓库从它的提交 c243997（2026-07-01）分出来，上游到那时为止的提交历史和作者都保留在本仓库的历史里。
- 多宿主的做法参考了 [ponytail](https://github.com/DietrichGebert/ponytail) 和 [superpowers](https://github.com/obra/superpowers)。

## 许可

按目录分：我们写的文字（`skills/`、`rules/`、`cards/`）用 CC BY-NC-SA 4.0，不可商用；代码（`bin/`、`hooks/`、`scripts/`、`tests/`）用 MIT；`library/` 里的原技能各自保留原来的许可，`handbook/` 是 CC BY-NC-SA 4.0。详见 [LICENSE](LICENSE) 和 [LICENSES/README.md](LICENSES/README.md)。

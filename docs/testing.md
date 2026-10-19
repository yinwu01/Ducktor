# 测试

两层：不调模型的测试，每次改动都跑；用真模型走一遍研究生流程的端到端测试，改了规则或命令模板之后跑。

## 不调模型：`npm test`

Node 自带的 `node:test`，不装依赖，几秒跑完。

`tests/duck.test.js` 测 `bin/duck.js` 和两条 hook：
- 开关行的各种写法（中文同义词、markdown 修饰、`=`、说明行排在前面），认不出时按 on 并提示 AI。
- 三档开关下注入的内容；学生改过的 `.duck/skills/core.md` 优先；过长的 config 被截断，非 UTF-8 的 config 被提示。
- 注入长度远低于宿主上限。
- 用 `sh -c` 真跑 hooks 文件里的命令：设了 `CLAUDE_PLUGIN_ROOT`、只设了 `PLUGIN_ROOT`（Codex 两个都设，这条防它以后只设一个）、两个都没有、stdin 是坏的，都退出 0 并给出可读的文字。
- Cursor 只拿到 `additional_context` 一个字段。
- 读文件放行的 hook：插件根目录内才放行，根目录外、`..` 跳出、符号链接指出去、输入是坏的，都不放行。

`tests/structure.test.js` 测仓库本身：
- 14 条命令，frontmatter 只有 name、description、`disable-model-invocation: true`，每条都有 Codex 的 `agents/openai.yaml`。
- 总入口的菜单正好列全；10 个原技能都有命令，`core.md` 的映射一个不漏。
- 生成的命令和 `AGENTS.md` 是最新的；`library/`、`handbook/` 和上游锁文件逐文件一致。
- 命令和规则里点到的路径都存在。
- 经验卡片：`cards/INDEX.md` 和卡片文件一一对应；每张卡的字段齐全，卡号和文件名一致，认同程度是三档之一，「共识」至少三个来源；卡里引用的手册和原技能文件都存在，写的行号不超过文件行数。
- 各宿主清单能解析，名字和版本号一致，指向的文件存在；没有 `hooks/hooks.json`（会被 Gemini CLI 自动加载）。
- hook 命令里没有在 sh、bash、cmd 之间行为不同的写法。
- 我们自己写的文字里没有 em-dash（上游存档、设计记录、调研和测试用的虚构项目除外）。

## 真模型：`tests/e2e/flow.js`

```
node tests/e2e/flow.js claude                     # 默认 Sonnet
DUCK_E2E_MODEL=opus node tests/e2e/flow.js claude
node tests/e2e/flow.js codex                      # 用 Codex 的默认模型
node tests/e2e/flow.js claude more                # 第二套流程，见下文
node tests/e2e/flow.js claude loop                # 第三套：笔记本回用、不敲命令时的实验对话、「这类我懂了」
DUCK_E2E_PAPER=<论文源码目录> node tests/e2e/flow.js claude paper   # 拿一篇真论文走审稿、拆解、复盘
DUCK_E2E_ONLY=menu,review node tests/e2e/flow.js claude   # 只跑几步
```

在一个虚构的学生项目上（`tests/fixtures/grad-project`：块稀疏注意力 BlockSkip，一份 workshop 草稿、一段玩具代码、一页实验笔记，里面故意埋了单次运行、em-dash、方法描述和代码对不上这些问题），用 `claude -p` 或 `codex exec` 在同一个会话里一步步走：

| 步 | 学生做什么 | 必须满足（must） |
|---|---|---|
| menu | `/duck` | 列出命令；说开关是 on；hook 注入了插件根目录 |
| idea | `/duck-idea` 加一段 idea 描述 | 读了 `library/idea-evaluator`；写了报告；笔记本多一行 |
| review | `/duck-review paper/main.tex` | 读了 `library/pre-submission-reviewer`；写了报告；指出只跑了一次 |
| propose | 不敲命令，让 AI 把摘要第一句改紧凑 | 回复里点出 `/duck-polish` |
| why | `/duck-why` | 说明是重建，不是 AI 内部过程的回放；写了报告 |
| quiet | `/duck quiet` | config 里开关是 quiet |
| polish-quiet | `/duck-polish` 润色摘要 | 读了 `library/paper-polish`；照样写了报告；对话里没有「为什么」 |
| card-draft、card-ok | `/duck-skill card new …`，再说「可以，写吧」 | 写了 `.duck/cards/G01.md`，INDEX 里有 G01 |
| learn-ask、learn | `/duck-learn`，再答它的一个问题 | 开头只问那一个问题；写了复盘报告 |
| off | `/duck off` | config 里开关是 off |
| off-new-session | 新会话里 `/duck-polish` | 注入的是 off 那一段；没有新报告；笔记本没动 |

第二套流程 `more` 在同一个项目上走主流程没走到的 7 条命令，顺序是学生实际碰到它们的顺序：

| 步 | 学生做什么 | 必须满足（must） |
|---|---|---|
| survey | `/duck-survey` 块稀疏注意力，2023 年以后、十篇以内 | 读了 `library/deep-research`；写了报告。这一步允许联网检索（Claude Code 放行 WebSearch、WebFetch，Codex 加 `--search`），相当于学生在弹窗里点了允许 |
| outline | `/duck-outline paper/main.tex` | 读了 `library/tech-paper-template`；写了报告 |
| intro | `/duck-intro` 重写引言，paper/ 里的文件先别改 | 读了 `library/intro-drafter`；写了报告；提醒学生核对事实、数字和引用 |
| write | `/duck-write` 写方法一节，依据代码 | 读了 `library/paper-writer`；写了报告；提醒核对 |
| figure | `/duck-figure` 给结果设计主图 | 读了 `library/figure-designer`；写了报告 |
| vibe | `/duck-vibe` 下周的实验哪些交给 AI | 读了 `library/vibe-research-workflow`；写了报告 |
| notes | `/duck-notes` | 笔记本里的每个阶段都列出来了；笔记本没动 |
| notes-delete、notes-ok | `/duck-notes 删掉最后一条`，再说「可以，删吧」 | 删掉的正好是最后一条，其余不变 |

每条包装命令还有几条 should：回复里有「为什么」；列出了卡片提醒，带插件自带卡的卡号；intro 和 write 没改 `paper/main.tex`；write 指出方法描述和代码对不上；notes-delete 先给学生看再删。

第三套流程 `loop` 开始前，测试先往项目的笔记本里写两条「前几周」的条目（10-09 写摘要：只跑了一次的结果不写 significantly，卡 W11；10-12 写引言：挑战段写问题本身为什么难，卡 W09），再走：

| 步 | 学生做什么 | 必须满足（must） |
|---|---|---|
| route | `/duck 帮我看看摘要最后一句是不是说得太满了` | 说了挑的是哪条命令；读了那条命令的原技能。should：「为什么」里提到 10-09 那条笔记 |
| intro | `/duck-intro` 重写引言，paper/ 里的文件先别改 | 读了 `library/intro-drafter`；「为什么」或报告里提到 10-12 那条笔记；笔记本没有重复的行 |
| exp | 不敲命令：「32k 上 70.9 对 70.6，只跑了一次，帮我加进表里」 | 提到种子或运行间的波动。should：先问，表没动 |
| exp-ok | 「先补到 3 个 seed，表等结果出来再改」 | 决策记录多了一行，写明是学生定的 |
| mute | 「多 seed 和方差这类我懂了，以后别讲了」 | config 的「按类静音」里记了这一类 |
| mute-check | 又一个单次结果，让它记进 notes.md | should：记了；不再讲种子和波动 |

`paper` 流程不用虚构项目，把 `DUCK_E2E_PAPER` 指向的一篇论文的 LaTeX 源码拷进空项目的 `paper/`，走 `/duck-review`、`/duck-why`、`/duck-learn`。论文源码不进仓库。

hook 注入的内容，Claude Code 从 stream-json 的 hook 事件里读；Codex 的 `--json` 输出不带它，从会话记录 `~/.codex/sessions/…/rollout-*.jsonl` 里读。

每套流程全程都查：笔记本每行是「- MM-DD 阶段｜原则（出处）」；决策记录每行是「- YYYY-MM-DD ▸ 决策：……」；两者都没有 em-dash；回复里没有出题、留作业、打分（按一组关键词查，只能抓明显的）；回复里提到的卡号都真的存在（插件自带的卡或项目里的组卡）。

一些步骤带 should 级检查（比如 card-draft 先给学生看卡再写），不满足只记下，不算失败。原技能有时会停下来追问缺的信息；这时测试替学生答一句「信息就这些。按你的理解继续做完，缺的地方在结果里标出来就行。」再查一遍，结果里标明。

每次跑的记录在 `evals/results/e2e-<宿主>-<时间>/`（其他流程是 `e2e-<宿主>-<流程>-<时间>/`）（不进 git）：每一步的原始 jsonl、`summary.md`、`summary.json`，以及跑完时项目 `.duck/` 的拷贝（`duck-files/`）。测试项目本身放在系统临时目录：Claude Code 不肯往已加载插件的目录里写文件，项目放在插件仓库里会让写文件的步骤全部失败。

跑 Codex 前要先 `codex plugin add duck@doctor-duck` 刷新它的插件缓存，否则测的是旧版本。

## 加查项的评测：`evals/`

加查项是钉进某条命令、每次都跑的额外检查，要先过评测才合进来。第一条是卡 E05（差距要大过种子间的波动），钉在 `/duck-review`，放在 `check-e05` 分支上。评测在 `evals/review-stats/`：10 篇合成的小论文，各自设好了该怎么判（不提、只提醒、MAJOR），用 `claude plugin eval` 在钉了和没钉的两版插件上各跑一遍，跑法见那里的 README。

先说评测撑得住的结论：钉了 E05 以后，「主结果没报波动，或者差距落在波动里」稳定地成为问题清单里单独的一条，标了 MAJOR 和来源；没钉的版本多半也会叫你补种子，但常常不单独记、不标轻重。该不提的论文上，钉了没有多挑毛病。

第二轮（10-19）：评分标准在跑之前定好，sonnet 评判，60 次三票全一致；和关键词粗筛不一致的 15 次读了原文，sonnet 判得对。每个用例 3 次，审稿模型 Sonnet。

| 该怎么判 | 用例 | 钉了 E05 | 没钉 |
|---|---|---|---|
| MAJOR | c04 c05 c07 c09 | 12/12 | 10/12 |
| 只提醒 | c03 c10 | 6/6 | 0/6 |
| 不提 | c01 c02 c06 c08 | 12/12 | 12/12 |

- MAJOR 这一行：没钉的版本两轮共有 6 次不过，其中 5 次把补种子写进了开头「最先修的几件」，只是没在问题清单里单独记一条；1 次只在末尾的卡片提醒里提了一句。每个用例只跑 3 次，同一个用例两轮之间能差 2 到 3 次（没钉的 c04 第一轮 0/3、第二轮 3/3），单个用例的数只能看趋势。
- 只提醒这一行量的是照不照规则做，不是审得好不好，而且规则在 c03 上可能太宽，改不改等你定（见复核记录最后一节）。c03 是 7B 只跑一次、写明了算力理由、HumanEval 上差 3.5 分。没钉的版本 6 次都认了这个理由，记 MAJOR（有一次记 CRITICAL）是因为差距没和合适的波动比：6 次里 5 次提到 HumanEval 只有 164 题，4 次算出二项标准误约 3.8 分，比差距还大；350M 上的波动也代表不了 7B。钉了的版本看到了同样的问题，却按规则降成提醒（6 次里 4 次在提醒里讲到 164 题）。c10 争议小：消融单种子，2 个和 4 个 adapter 只差 0.6，和主表波动同量级，论文没据此说哪个最好；钉了的版本 6 次都提醒了这一点。
- 第一轮用默认的 haiku 和旧的评分标准，原始分钉了 22/30、没钉 16/30。haiku 有两类错：审稿把波动列成 MAJOR，只因来源一栏写着「加查项 E05」，就被判成「只是提醒」；审稿明说统计做得对，也被判成挑了毛病。人工读了 45 次（haiku 判不过的 22 次全部，加上判过的 23 次），改判 11 次，全是不过改成过（钉了的 6 次、没钉的 5 次），改判后 28/30 对 21/30。没读的 15 次都是判过的，所以改判只可能往一个方向走。
- 评分标准是看过第一轮以后改的，两处改动都对钉了的版本有利。一处是严重度挂在哪里都算，来源写「加查项 E05」不等于提醒，救回了钉了的版本被 haiku 判错的 6 次。另一处是主要在挑别的毛病、顺带提到种子的条目不算波动问题：钉了的版本第二轮 c03 三次都有一条「结论强于证据：一次运行、一个基准」的 MAJOR，靠这一条才算过（第一轮同样写法的一次，复核时维持了不过）；没钉的版本把波动折进「结论说得太满」那条的写法，也因此不再算数。按新标准重判第一轮，是 30/30 对 22/30，和第二轮一样（红队逐份核过）。要彻底避嫌，得在定好的标准下另写几篇新用例再跑一轮。
- 局限：用例是合成的，正确判法是写这条查项的人定的；`claude plugin eval` 只能在 Claude Code 上跑。Codex 上用钉了 E05 的版本把 10 个用例各手工跑了一次（`$duck:duck-review paper/main.tex`），按第二轮的评分标准人工读：10 次都对得上，该记 MAJOR 的四篇都标了「加查项 E05」，写明理由的两篇只提醒（同样只说明它照规则做）。只有一次、人工判，算旁证。设计稿原计划用 CC BY 论文的节选，改成合成论文，是为了每篇的正确判法没有争议，也不用管许可。
- 费用：两轮共约 26 美元（第一轮 5.34 和 6.90，第二轮 5.99 和 7.57）。

## 上一次的结果

2026-10-19（服务器时间），插件内容在提交 0b9ff79，三套虚构项目流程两边各跑一遍；真论文流程跑得早一些（Claude Code 在 1f36352，Codex 在 8e55392），之后只改过常驻规则第 4 条，这一条不管命令内部，这套流程只敲命令。

| 宿主 | 模型 | 主流程 | 第二套 more | 第三套 loop | 真论文 paper | 费用 |
|---|---|---|---|---|---|---|
| Claude Code 2.1.303 | Sonnet | 34/34，约 7 分钟 | 40/40，约 8 分钟 | 19/19，约 3 分钟 | 14/14 | 9.06、9.65、2.48、2.01 美元 |
| Codex 0.163.0 | 宿主默认 | 33/34，差的一条是测试脚本误判（见下表第 13 轮），按改好的脚本重查是 34/34；约 11 分钟 | 40/40，约 16 分钟 | 19/19，约 4 分钟 | 14/14 | 未统计 |

这一轮都没有用到替学生答一句的补问。

真论文用的是 arXiv 2505.24179（SALE，块稀疏注意力的 prefill 加速，NeurIPS 2025 模板，多文件 LaTeX）。两边各自指出 kernel 一节的阈值比较公式写错了：原文把 e^(S-m)/l ≥ τ 化成 S ≥ ln(τ·l + m)，应为 S ≥ m + ln(τ·l)。我们对着源码核过，确实如此。

一路跑下来查出、已经改掉的：

| 轮 | 发现 | 改了什么 |
|---|---|---|
| 1 | Claude Code 不肯往已加载插件的目录里写文件，测试项目放在插件仓库里，写文件的步骤全失败 | 测试项目移到系统临时目录 |
| 1 | 学生没敲命令、只让改一句摘要时，两边都直接改了，没提 `/duck-polish` | 规则 4：要做的事归某条命令管时，回复里一定点出那条命令 |
| 2 | Claude Code 的决策行少了「▸ 决策」，Codex 的条目之间空行 | 决策行和笔记本行的格式写死，一条一行 |
| 2 | Codex 读到笔记里的「虚构」二字，把所有数字当成假的 | 测试项目里的文件不再写「虚构」，说明挪到 `tests/fixtures/README.md` |
| 2 | Linux 上的 Claude Code 没有 Glob、Grep 工具，模型改用 `ls` 列插件目录被拦 | 规则改成用 Read，要看原技能有哪些文件就读 `library/upstream.lock.json` |
| 4 | 补答只认结尾的问号 | 回复里有问题就补答一次 |
| 5 | 测试提示写「不要改文件」，两边都理解成连 `.duck/` 的记录也不写 | 测试提示改成「paper/ 里的文件先别改」 |
| 5、6 | Codex 两次在 `/duck-write` 跳过原技能的 SKILL.md，直接读它的 references/section-guidance.md | 包装命令第 3 步：先读完 SKILL.md，学生只要其中一部分也一样 |
| 6 | Codex 有一次没等学生点头就删了笔记本的一条 | `/duck-notes`：学生说清改哪一条也先给看，等下一句点头 |
| 7 | Sonnet 把第 5 步的 `cards/INDEX.md` 当成项目里的 `.duck/cards/`，六条命令都跳过了卡片提醒 | 第 5 步写明是插件根目录下的卡，和组卡是两回事 |
| 7 | Sonnet 有一轮在 intro、write 都没提醒学生核对 | 改成结果末尾固定的一句「这是 AI 写的……请你逐条核对」 |
| 7 | 测试的补答「按你的理解继续做完」被当成可以改 `paper/` | 补答加上「我前面说的限制照旧」 |
| 8 | Codex 往笔记本里写了破折号，用来把局限、关键想法、挑战串成一条链 | 常驻规则：写进 `.duck/` 的文字不用破折号，串环节用「→」 |
| 5 到 8 | 测试脚本自己的问题：卡号只认含「卡」字的行，Claude Code 只取最后一条消息 | 都改了 |
| 9 | 包装命令跑完只往笔记本里写，动手前不翻，上回记下的道理下回用不上 | 包装命令第 2 步：读笔记本，挑至多三条相关的旧条目照着做，「为什么」里点出来；已有的不重复记 |
| 10 | 不敲命令、让 AI 把单次结果加进表：Codex 直接加了，没提差距可能只是波动；Claude Code 没把学生「先补 3 个 seed」的决定记成决策行 | 常驻规则第 4 条：结果进论文前先对标准，撞上了先说再问；第 3 条：学生在对话里拍板的研究决定，这一轮没动手也记一行 |
| 11 | 第 4 条写成「先读卡片目录再对」，Sonnet 一次也没读，直接改了表 | 把最常撞上的三条（单次运行 E05、提升没拆来源 R02、结论比证据强 E02）直接写进规则 |
| 12 | Codex 在 `/duck-intro` 里也按第 4 条停下来问要不要先补实验，问句没有问号，测试没补答 | 第 4 条只管不敲命令时，命令照自己的步骤走（收尾有卡片提醒）；测试的补答也认「你希望」「请选择」这类问法 |
| 13 | 测试脚本把「最小测试」里的「小测」当成出题 | 改了匹配 |

还没测到的：
- 从 GitHub 安装：两边都在隔离的配置目录里装成功，但流程是用本地加载跑的。
- 交互模式：全部是 `claude -p` 和 `codex exec`，没有在交互界面里点过权限弹窗。`/duck-survey` 那一步替学生放行了联网检索（Claude Code 放行 WebSearch、WebFetch，Codex 加 `--search`）；检索出来的引用没有逐条人工核对，Claude Code 的 arXiv 工具在 `-p` 下也没有授权。
- 每条命令只跑了一两次，模型每次走得不完全一样，上面改掉的问题都是这样一次次跑出来的。
- Cursor、Gemini CLI、Qwen Code 和只读 `AGENTS.md` 的 agent。

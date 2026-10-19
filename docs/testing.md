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

hook 注入的内容，Claude Code 从 stream-json 的 hook 事件里读；Codex 的 `--json` 输出不带它，从会话记录 `~/.codex/sessions/…/rollout-*.jsonl` 里读。

两套流程全程都查：笔记本每行是「- MM-DD 阶段｜原则（出处）」；决策记录每行是「- YYYY-MM-DD ▸ 决策：……」；两者都没有 em-dash；回复里没有出题、留作业、打分（按一组关键词查，只能抓明显的）；回复里提到的卡号都真的存在（插件自带的卡或项目里的组卡）。

一些步骤带 should 级检查（比如 card-draft 先给学生看卡再写），不满足只记下，不算失败。原技能有时会停下来追问缺的信息；这时测试替学生答一句「信息就这些。按你的理解继续做完，缺的地方在结果里标出来就行。」再查一遍，结果里标明。

每次跑的记录在 `evals/results/e2e-<宿主>-<时间>/`（第二套流程是 `e2e-<宿主>-more-<时间>/`）（不进 git）：每一步的原始 jsonl、`summary.md`、`summary.json`，以及跑完时项目 `.duck/` 的拷贝（`duck-files/`）。测试项目本身放在系统临时目录：Claude Code 不肯往已加载插件的目录里写文件，项目放在插件仓库里会让写文件的步骤全部失败。

跑 Codex 前要先 `codex plugin add duck@doctor-duck` 刷新它的插件缓存，否则测的是旧版本。

## 上一次的结果

2026-10-17（服务器时间），插件内容在提交 1aa1372。

| 宿主 | 模型 | 结果 | 用时 | 费用 |
|---|---|---|---|---|
| Claude Code 2.1.301 | Sonnet | 33/33 | 约 9 分钟 | 8.34 美元 |
| Codex 0.163.0 | 宿主默认 | 33/33（提交 9a6cda9，插件内容同上，只改了测试脚本） | 约 18 分钟 | 未统计 |

两边都没有用到替学生答一句的补问。同一份流程模型每次走得不完全一样：Codex 上一轮的 idea 步先编号问了三个问题再停下（这是规则 1 要它做的），测试那时只在回复以问号结尾时才补答，于是判了失败；改成回复里有问题就补答一次后，重跑这一轮，模型没有再停下来问，所以补答这条路还没真正走过。

一路跑下来查出、已经改掉的：

| 轮 | 发现 | 改了什么 |
|---|---|---|
| 1 | Claude Code 不肯往已加载插件的目录里写文件，测试项目放在插件仓库里，写文件的步骤全失败 | 测试项目移到系统临时目录 |
| 1 | 学生没敲命令、只让改一句摘要时，两边都直接改了，没提 `/duck-polish` | 规则 4：要做的事归某条命令管时，回复里一定点出那条命令 |
| 2 | Claude Code 的决策行少了「▸ 决策」，Codex 的条目之间空行 | 决策行和笔记本行的格式写死，一条一行 |
| 2 | Codex 读到笔记里的「虚构」二字，把所有数字当成假的 | 测试项目里的文件不再写「虚构」，说明挪到 `tests/fixtures/README.md` |
| 2 | Linux 上的 Claude Code 没有 Glob、Grep 工具，模型改用 `ls` 列插件目录被拦 | 规则改成用 Read，要看原技能有哪些文件就读 `library/upstream.lock.json` |
| 4 | 补答只认结尾的问号 | 回复里有问题就补答一次 |

还没测到的：
- 14 条命令里 7 条没用真模型跑过：`/duck-survey`、`/duck-outline`、`/duck-intro`、`/duck-write`、`/duck-figure`、`/duck-vibe`、`/duck-notes`（`/duck-notes` 只用全名 `/duck:duck-notes` 在空项目里试过一次）。
- 从 GitHub 安装：两边都在隔离的配置目录里装成功，但流程是用本地加载跑的。
- 交互模式：全部是 `claude -p` 和 `codex exec`，没有在交互界面里点过权限弹窗。
- 检索：Claude Code 的 arXiv 工具在 `-p` 下没有授权，原技能里要检索的步骤，模型都标了「未核实」。
- Cursor、Gemini CLI、Qwen Code 和只读 `AGENTS.md` 的 agent。

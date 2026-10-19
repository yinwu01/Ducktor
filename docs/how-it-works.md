# Doctor Duck 是怎么运行的

这一篇讲现在的实现，给想改插件、或者想把它接到别的 agent 上的人看。设计过程和讨论在 `docs/design/`，两边说法不一致时以这一篇为准。

## 三层东西

| 层 | 在哪 | 是什么 | 谁写的 |
|---|---|---|---|
| 常驻规则 | `rules/core.md` | 平时怎么陪学生：先问、讲为什么、记决策、结果进论文前对标准、只提议不自动跑、放手 | 我们 |
| 命令 | `skills/duck*/SKILL.md` | 学生敲的 `/duck`、`/duck-review` 等 14 条 | 我们 |
| 原技能 | `library/` | Supervisor-Skills 的 10 个技能，逐字节照搬 | 上游 |

命令只是一层包装：先查设定、读组里的卡和学生的笔记本，再让 AI 去读 `library/` 里的原技能照做，最后按开关写「为什么」报告。原技能一字不改，上游更新时整体同步。

## 开场：hook 注入三样东西

开会话时，宿主跑 `hooks/claude-codex-hooks.json` 里的 SessionStart hook，它调 `bin/duck.js session-start`，往上下文里放：

1. 插件根目录的绝对路径。每台机器、每次升级路径都不一样，所以每次都告诉 AI。
2. 按开关放一段规则。鸭子要在项目里开启才主动：开关是 on 或 quiet，放常驻规则（项目里有学生改过的 `.duck/skills/core.md` 就用它，否则用插件的 `rules/core.md`）；开关是 off，放 `rules/off.md` 那一小段；没开启，放 `rules/idle.md` 那一小段，说平时照常干活，只有学生敲命令时才照命令做。
3. 项目 `.duck/config.md` 的内容（最多 1,200 字），以及从中读出的开关。没有这个文件就不放。

没开启的项目注入约 400 字符；开启了约 3,000 字符（10-19 实测：`开关：on` 一行的 config.md 时 3,012 字符，加上 config.md 的上限 1,200 字也在 4,300 以内）。Claude Code 对 hook 注入的上限是 10,000 字符，超过的部分会被写进会话目录下的文件，上下文里只留前 2,000 字符的预览和文件路径。会话恢复、清空、压缩、分叉时 hook 会重跑。

`bin/duck.js` 只读文件、拼文字，规则的原文都在 `rules/` 下，不写进代码。这样代码可以用 MIT，文字用 CC BY-NC-SA，两者不混（见 `LICENSES/README.md`）。

## 一条命令怎么走

以 `/duck-review paper/main.tex` 为例，`skills/duck-review/SKILL.md` 让 AI：

1. **先查两件事**：`.duck/config.md` 的「关掉的命令」里有没有 review；项目里有没有学生改过的副本 `.duck/skills/duck-review/SKILL.md`，有就改读副本。
2. **读组里的卡和笔记本**：项目的 `.duck/cards/INDEX.md`，挑出相关的，当作这一次的规矩；项目的 `.duck/notebook.md`，挑至多三条和这次任务相关的旧条目照着做，收尾的「为什么」里用上了就点出来（「你 MM-DD 记下的：……」）。开关是 off 时不翻笔记本。
3. **照原技能做**：读 `library/pre-submission-reviewer/SKILL.md`，从头做到尾。原技能里的相对路径（`references/…`）相对它自己的文件夹。
4. **加查项**：经过评测的额外检查钉在这里，现在还是空的。
5. **卡片提醒**：从插件的 `cards/INDEX.md` 挑至多三张共识卡对照，只提醒。插件自带的卡现在有 23 张（写作、选题、实验、作图、报告、找反馈、审稿），每张写明道理、怎么用、出处和认同程度（共识、有出处、有分歧），出处都是我们自己的话转述。
6. **收尾**：按开关。on 时对话里附 5 到 8 行「为什么」，决策行追加到 `.duck/decisions.md`，完整报告写进 `.duck/reports/`，「你能带走的一条」追加到 `.duck/notebook.md`（已有同一条的不重复记）；quiet 时只写文件；off 时只交原技能的结果。

九条包装命令结构相同，由 `scripts/build.js` 从 `rules/wrapper-template.md` 和 `rules/commands.json` 生成。要改步骤就改模板，再跑 `npm run build`。`/duck`、`/duck-why`、`/duck-learn`、`/duck-notes`、`/duck-skill` 是手写的。

## 三条路进到同一份命令文件

- 学生直接敲 `/duck-review`：宿主把文件正文交给 AI。
- 学生敲 `/duck 帮我审一下`：总入口挑一条命令，说一句按哪条处理，再用读文件的办法读 `skills/duck-review/SKILL.md` 照做。
- 学生没敲命令，AI 按常驻规则提议「这件事 /duck-polish 能做，要按它来吗？」，学生点头后，同样读那份文件照做。

后两条路是当普通文件读的，宿主不会替换 `${CLAUDE_PLUGIN_ROOT}` 这类变量，frontmatter 里的设置也不生效。所以命令文件里不用变量，frontmatter 只放名字、描述和「只能手动调用」（`disable-model-invocation: true`；Codex 那边是每条命令文件夹里的 `agents/openai.yaml`）。

## 读插件自己的文件

Claude Code 默认不让读工作目录以外的文件：交互时每次弹窗问，`-p` 模式下直接拒绝。插件也没办法通过清单给自己加可读目录。所以插件带了第二个 hook：PreToolUse，匹配 Read、Glob、Grep，调 `bin/duck.js allow-read`。目标路径（解开符号链接以后）在插件根目录下才回答 allow，别的路径一律不回答，照宿主原来的规矩走。shell 命令（cat、ls、find）不在放行范围里，照宿主原来的规矩走（交互时弹窗问，`-p` 模式下拒绝），所以常驻规则让 AI 用 Read 读插件文件。Glob 的 pattern 和 Grep 的 glob 过滤也会指到文件，所以带 `..`、`~` 的不放行，绝对路径的要落在插件根目录下。Linux 上的 Claude Code 默认没有 Glob、Grep 这两个工具（找文件走 Bash 的 find），常驻规则让 AI 改读 `library/upstream.lock.json`，那里列着 `library/` 下每个文件的路径。

这条 hook 只跳过「要不要允许」的询问；据 Claude Code 的权限文档，用户自己设的 deny、ask 规则照样生效。用户开了 `blockReadsOutsideWorkingDirectories` 时它还管不管用，文档没写，我们也没测。

Codex 的沙箱默认能读整个文件系统，不需要这条；它的工具名也不叫 Read，这条 hook 在 Codex 里匹配不到任何东西。

## 学生项目里的 `.duck/`

```
.duck/
  config.md      开关（on / quiet / off）、按类静音、静音的卡、关掉的命令
  notebook.md    笔记本：- MM-DD 阶段｜原则（出处）
  decisions.md   决策行：- 日期 ▸ 决策：选了什么，放弃了什么（谁定的）
  reports/       完整的「为什么」报告，日期-命令.md
  cards/         学生和课题组的卡，带 INDEX.md，卡号 G01 起
  skills/        学生改过的命令和规则副本
```

用到哪个建哪个。插件目录本身只读，学生的改动都在项目里，可以进 git，随时回退。

## 开关

| 开关 | 常驻规则 | 命令跑完 | `/duck-why`、`/duck-learn` |
|---|---|---|---|
| 没开启（默认：没有 config.md，或者没有开关行） | 不注入，换成 idle.md 一小段 | 和 on 一样：学生敲了命令，就是这一次要它 | 照常讲，写文件 |
| on | 注入 | 对话里放短版报告，文件照写 | 照常讲，写文件 |
| quiet | 注入 | 对话里只交结果，文件照写 | 照常讲，写文件 |
| off | 换成 off.md 一小段 | 只交原技能的结果，不写 `.duck/` | 照常讲，不写文件 |

开关行写错时（比如 `开关：offline`），按没开启处理，并在注入里提醒 AI 告诉学生。中文的「开、开启、关、关闭、静音」也认。

没开启的项目里，命令照样会建 `.duck/` 写报告、决策和笔记，但不会写开关行，所以下次开会话仍然是没开启。`/duck-skill disable` 新建 config.md 时也不写开关行。

会话中途敲 `/duck on`：`skills/duck/SKILL.md` 让 AI 当场去读常驻规则，从这一轮起照做，不用等下一次开会话。下次开会话时 hook 按新开关注入。

## 生成的文件和上游副本

- `npm run build`：重新生成九条包装命令和 `AGENTS.md`。
- `npm run check`：生成的文件是否最新；`library/`、`handbook/` 是否还和上游一致（`library/upstream.lock.json` 记着每个文件的 sha256 和上游提交）。
- `node scripts/upstream.js sync <上游仓库目录>`：从新版 Supervisor-Skills 同步，同时更新锁文件，并列出变了哪些文件。

## 仓库的历史从哪来

仓库从 Supervisor-Skills 的提交 c243997（2026-07-01）分出来，上游到那时为止的提交历史和作者都保留在本仓库的历史里。插件用的技能和手册取自上游后来的 aff5de9（2026-07-16），见 `library/README.md`。

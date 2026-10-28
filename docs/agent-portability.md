# 在哪些 agent 上能用

Ducktor 的内容只有一份：`skills/`、`rules/`、`library/`、`cards/`、`handbook/`。每个 agent 只加一层薄的适配：一份清单，或者一份说明文件。这个做法照 [ponytail](https://github.com/DietrichGebert/ponytail) 和 [superpowers](https://github.com/obra/superpowers)。

**规矩：在本机真跑过一遍，才算支持。** 端到端测试有两套流程（见 `docs/testing.md`），合起来把 14 条命令都用真模型跑过。下表「实测」一列写的是哪个版本跑过、跑了什么；没写的就是还没跑过，适配文件照别的项目已经跑通的格式写，可能要改。

## 三档

| 档 | 宿主能做什么 | Ducktor 能做到什么 |
|---|---|---|
| 一 | 装整个插件，开会话时跑 hook | 全部：常驻规则、开关、14 条命令 |
| 二 | 装整个插件，命令能用；常驻说明是一份固定文件，不跑 hook | 命令能用；常驻规则是固定的 `AGENTS.md`，开关要 AI 自己去读 `.duck/config.md` |
| 三 | 只读项目里的说明文件 | 只有常驻规则；要先把 Ducktor 放到本机某处，在说明里写上路径 |

Ducktor 比 ponytail 多一个约束：命令要读 `library/` 里的原技能，所以宿主得装整个插件。只拷单个技能文件夹的装法（比如某些 `skill add` 命令）跑不了这些命令。

## 宿主一览

| 宿主 | 档 | 用到的文件 | 实测 |
|---|---|---|---|
| Claude Code | 一 | `.claude-plugin/`、`hooks/claude-codex-hooks.json`、`skills/` | 2.1.303，Sonnet，`--plugin-dir` 加载：两套端到端流程（`docs/testing.md`）跑了全部 14 条命令，开关三档，hook 注入，读插件文件的放行 hook。从 GitHub 安装：在隔离的配置目录里装成功，没在这份安装上跑流程 |
| Codex | 一 | `.codex-plugin/`、`.agents/plugins/marketplace.json`、同一份 hooks 文件、`skills/*/agents/openai.yaml` | 0.163.0，默认模型，本地路径安装：同上的流程和命令。从 GitHub 安装：同上，装成功，没跑流程 |
| Cursor | 一 | `.cursor-plugin/plugin.json`、`hooks/hooks-cursor.json`；`bin/duck.js` 在有 `CURSOR_PLUGIN_ROOT` 时输出 `additional_context` | 未实测 |
| Gemini CLI | 二 | `gemini-extension.json`（`contextFileName: AGENTS.md`）、`skills/` | 未实测 |
| Qwen Code | 二 | 同 Gemini CLI 的扩展文件 | 未实测 |
| CodeBuddy | 一 | 直接读 Claude Code 的清单（ponytail 的文档这么写） | 未实测 |
| 其他只读 `AGENTS.md` 的（Cline、Windsurf、Amp、Zed、Junie 等） | 三 | `AGENTS.md` | 未实测 |

## 每个宿主要注意的

**Claude Code**
- 文档里插件命令的全名是 `/duck:duck-review`，短名 `/duck-review` 文档没写。端到端流程用的是短名；全名在 10-17 用 `claude -p '/duck:duck-notes'` 单独试过，能触发。短名叫不出来时用全名。
- 读插件目录要靠插件自带的 PreToolUse hook 放行（`docs/how-it-works.md`）。用户关掉了全部 hook（`disableAllHooks`）或者没装 Node 时，每次读 `library/` 会弹窗问，`-p` 模式下会被拒。

**Codex**
- 命令写成 `$duck:duck-review`。
- 第一次用要在 `/hooks` 里信任 Ducktor 的 hook；hook 定义改了要重新信任。`codex exec` 测试时可以加 `--dangerously-bypass-hook-trust`，只对这一次生效。
- `codex plugin marketplace add` 用 git 克隆整个仓库，带完整历史，再把插件目录连 `.git` 一起拷进 `~/.codex/plugins/cache/`。10-28 在本机量过：只克隆一个分支也有约 90 MB，其中 `.git` 约 81 MB，仓库里的文件约 7.8 MB（演示动图换成 WebP 以后）。历史里的大头是 10-19 删掉的上游存档（`docs/supervisor-skills/`，其中一个 PDF 就有 17 MB）和演示 GIF 的六个旧版本（共约 37 MB）。要变小只能改写历史，这要仓库主人定。加 `--sparse <路径>` 时只取列出的路径，本机量约 2.6 MB；本机的 git 2.34 用非 cone 模式，根目录下的文件取不到，这样装上以后能不能正常用还没测。从 GitHub 装的体积没量成（本机的代理连不上 GitHub）。Claude Code 从 GitHub 装是浅克隆，只取最新一版（官方文档的说法）。本地路径装的，改了插件要重新 `codex plugin add duck@ducktor`。
- 沙箱用 bubblewrap。进程带着 ambient capabilities 时（比如继承了 CAP_NET_ADMIN），bwrap 0.6.1 会拒绝启动，表现为 AI 写不了文件。先用 `setpriv --inh-caps=-all --ambient-caps=-all` 去掉再启动 Codex 就好，这是机器环境的问题，和插件无关。

**Cursor**
- Cursor 的 hook 格式和 Claude Code 不同：`version: 1`、小写的 `sessionStart`、相对路径的命令，输出字段是 `additional_context`。`bin/duck.js` 看到 `CURSOR_PLUGIN_ROOT` 就只输出这个字段（Claude Code 会把两种字段都读进去，所以不能同时输出）。
- Cursor 读不读得到插件目录以外的项目文件、要不要放行，没测过。

**Gemini CLI、Qwen Code**
- 扩展清单把 `AGENTS.md` 设成固定说明。Gemini CLI 会自动加载扩展里的 `hooks/hooks.json`，所以我们的 hooks 文件故意不叫这个名字，免得把给 Claude Code 写的 hook 也加载进去。
- 没有开场注入，`AGENTS.md` 里写了插件根目录怎么找、开关要自己读 `.duck/config.md`。「没开启就不用常驻规则」在这里靠 AI 自己读完 config.md 再照做，不像 hook 那样根本不加载，没实测过它守不守。

**只读 `AGENTS.md` 的宿主**
- 把仓库放到本机某处，把 `AGENTS.md` 的内容复制进项目的 `AGENTS.md`（或这个宿主自己的规则文件），告诉 AI Ducktor 放在哪。命令要靠学生说「照 Ducktor 的 /duck-review 做」，AI 再去读 `skills/duck-review/SKILL.md`。

## 加一个新宿主

1. 先看它能不能直接读现有的清单（比如 CodeBuddy 读 Claude Code 的）。能的话，只在这一篇加一行。
2. 不能的话，照它的格式加一份清单，指向同一份 `skills/` 和 hooks；hook 的输出格式不同，就在 `bin/duck.js` 里按这个宿主设的环境变量分支，只输出它读的那一种。
3. 在 `tests/` 里加静态检查：清单能解析，指向的文件存在，版本号和别的清单一致。
4. 在本机装上这个宿主，至少跑一遍：开场注入、`/duck` 菜单、一条包装命令（确认读到了 `library/`）、`/duck quiet` 写文件。把版本号和结果写进上表。
5. 不改 `skills/`、`rules/` 的内容去迁就某个宿主；要迁就的放在适配文件里。

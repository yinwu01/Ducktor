# D. 宿主能力矩阵与贡献者继承（核实日 2026-10-15）

标注：【实测】= 本机或 GitHub API 上验证过；【推断】= 没有直接证据；未标注的事实句来自官方文档或源码，来源写在每节；第 4、6 节的方案和“可借鉴的共性”是我的设计建议。版本：Claude Code 2.1.300（本机，changelog 2026-10-14）、Codex CLI 0.162.1（本机，最新稳定版 2026-10-09）、Gemini CLI 0.64.0、OpenCode 1.19.0、Copilot CLI 1.0.98（GitHub releases）；Cursor 版本未查到。

## 0. 结论

1. CC 和 Codex 的 hook 已经高度趋同。两边都有 SessionStart、UserPromptSubmit、PostToolUse、Stop、SessionEnd、Subagent*，而且 Codex 给插件 hook 同时设置 CLAUDE_PLUGIN_ROOT，所以一份 hooks.json 可以两边共用（ponytail 已经这么做）。
2. 学习循环的四个环节两边都有落点。硬限制有两条：会话结束 hook 对插件只有 1.5s（CC，用户可调高）/ 最多 3s（Codex），放不下 LLM 复盘；单条注入超过 10,000 字符（CC，不可调）/ 约 2,500 token（Codex，可调）就转存文件、只给预览。
3. 复盘正文应该由主模型在会话内写（显式 /debrief 技能为主，Stop 续跑为辅），不要在 hook 里调 LLM。
4. Codex 侧有三处摩擦：插件 hook 要用户在 /hooks 里信任；带 lifecycle hooks 的插件进不了公开插件目录；IDE 扩展不支持插件。
5. 贡献者继承：subtree add 不 squash 有效【实测】；Co-authored-by 无效【实测】，.mailmap 推断无效。代价是仓库要多装一份上游历史（上游当前约 63MB），插件分发要绕开它。

## 1. 能力矩阵

| 能力 | Claude Code | Codex CLI | Gemini CLI | Cursor | OpenCode | Copilot CLI |
|---|---|---|---|---|---|---|
| 会话开始注入 | 支持 SessionStart | 支持 SessionStart | 支持 SessionStart | 支持 sessionStart（不阻塞） | 部分：session.created 事件 + SDK session.prompt(noReply) | 支持 sessionStart |
| 每轮输入注入 | 支持 UserPromptSubmit | 支持 UserPromptSubmit | 支持 BeforeAgent | 不支持：beforeSubmitPrompt 只能放行或拦截 | 部分：文档无此事件，ponytail 用未文档化的 experimental.chat.system.transform | 部分：userPromptSubmitted 配置型 hook 输出被丢弃；userPromptTransformed 可改写 |
| 工具后观察 | 支持 PostToolUse / Failure / Batch，可 async | 支持 PostToolUse | 支持 AfterTool | 支持 postToolUse 等 | 支持 tool.execute.after | 支持 postToolUse |
| 停止前拦截续跑 | 支持 Stop block（连续上限 8） | 支持 Stop block | 支持 AfterAgent deny 重试 | 支持 stop followup_message（默认 5 次） | 部分【推断】：session.idle + session.prompt | 支持 agentStop block |
| 会话结束 | 部分：SessionEnd 共享 1.5s | 部分：SessionEnd 默认 1s 最多 3s | 部分：SessionEnd 不等待 | 部分：sessionEnd 即发即忘 | 部分：无退出事件，有 session.deleted | 支持 sessionEnd（只观察，时限未查到） |
| 读完整记录 | 部分：transcript_path（内部 JSONL，异步写） | 部分：transcript_path（文档称不是稳定接口） | 部分：transcript_path | 部分：transcript_path | 支持：SDK session.messages | 部分：agentStop 的 transcriptPath |
| 子 agent | 支持：插件 agents/ | 部分：自定义 agent TOML，插件组件里没有 | 部分：扩展 agents/（预览） | 支持：插件 agents | 支持：.opencode/agents/（插件能否携带未查到） | 支持：插件 agents/ |
| 技能按需加载 | 支持 skills/ | 支持 skills | 支持 skills（activate_skill） | 支持 skills | 支持 skills | 支持 skills |
| 斜杠命令 | 支持：技能即 /name，commands/ 为旧格式 | 部分：$skill、/skills；custom prompts 已废弃 | 支持 commands/*.toml | 支持：插件 commands | 支持 .opencode/commands/ | 支持：插件 commands |
| 输出风格 | 支持 output-styles/（可强制） | 不支持：只有用户侧 /personality、model_instructions_file | 未查到 | 未查到（rules 可近似） | 未查到 | 未查到 |

来源：CC https://code.claude.com/docs/en/hooks 、/plugins/components、/plugins/manifest-reference、/sessions、/skills；Codex https://learn.chatgpt.com/docs/hooks 、https://learn.chatgpt.com/docs/plugins 、https://developers.openai.com/plugins/build/plugins 、索引 https://developers.openai.com/codex/llms.txt ；Gemini google-gemini/gemini-cli 仓库 docs/hooks/reference.md、docs/extensions/reference.md；Cursor https://cursor.com/docs/hooks.md 、/reference/plugins.md；OpenCode https://opencode.ai/docs/plugins 、/sdk、/agents、/commands；Copilot https://docs.github.com/en/copilot/reference/hooks-reference 、…/copilot-cli-reference/cli-plugin-reference；SKILL.md 标准与客户端列表 https://agentskills.io/clients 。

## 2. CC 与 Codex 的硬约束

**Claude Code（33 个事件）**
- 事件：SessionStart、Setup、InstructionsLoaded、UserPromptSubmit、UserPromptExpansion、MessageDisplay、PreToolUse、PermissionRequest、PermissionDenied、PostToolUse、PostToolUseFailure、PostToolBatch、Notification、SubagentStart/Stop、TaskCreated/Completed、Stop、StopFailure、TeammateIdle、ConfigChange、CwdChanged、DirectoryAdded、FileChanged、WorktreeCreate/Remove、Pre/PostCompact、Pre/PostModelSwitch、Elicitation、ElicitationResult、SessionEnd。
- 能注入 additionalContext：SessionStart、SubagentStart、UserPromptSubmit/Expansion、PreToolUse、PostToolUse/Failure/Batch、Stop、SubagentStop、PostModelSwitch。能阻断（exit 2）：PreToolUse、UserPromptSubmit/Expansion、Stop/SubagentStop、PostToolBatch、PreCompact、PreModelSwitch、Task*、TeammateIdle、ConfigChange、Elicitation*、Worktree*。SessionStart、PostToolUse、SessionEnd 不能阻断。
- 插件组件：skills/、commands/（旧）、agents/、hooks/hooks.json、.mcp.json、.lsp.json、output-styles/、themes/、monitors/（实验）、bin/（进 PATH）、settings.json（只认 agent、subagentStatusLine）、userConfig、channels。插件根的 CLAUDE.md 不加载。CC 文档未见对 Agent Plugins 根 plugin.json 的支持，所以 .claude-plugin/plugin.json 要保留。
- 安装更新：/plugin marketplace add owner/repo；第三方 marketplace 默认不自动更新；claude plugin update、/reload-plugins（/plugins/install）。
- additionalContext 每串上限 10,000 字符，超出转存文件，只给 2,000 字符预览。纯 stdout 只在 SessionStart、UserPromptSubmit、UserPromptExpansion、PostModelSwitch 进上下文。
- 处理器有 command/http/mcp_tool/prompt/agent。prompt 和 agent 只返回 {ok, reason}，写不出自由文本；SessionStart 只能用 command 或 mcp_tool。
- 默认超时 600s，UserPromptSubmit 30s。SessionEnd 总预算默认 1.5s；用户 settings 里的 hook timeout 可把预算抬到最多 60s，或用环境变量 CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS 覆盖；插件 hook 的 timeout 不抬预算。async:true 在后台跑，结果下一轮送达；`claude -p` 结束时会杀掉 async hook。
- Stop 输入带 stop_hook_active 和 last_assistant_message，连续 block 上限 8 次。SessionStart 在 resume、compact 时会重跑。
- 插件：只有 name 必填；${CLAUDE_PLUGIN_DATA} 跨更新保留；插件 agent 的 hooks、mcpServers、permissionMode 字段被忽略；组件路径必须在插件根内。依赖用 plugin.json 的 dependencies 加 git tag（/plugins/dependencies）。
- 成本：启用插件后，它所有 skills、agents、commands 的名字和描述每个会话都进上下文（/plugins/measure），可用 `claude plugin details` 量。

**Codex（12 个事件：SessionStart、SessionEnd、SubagentStart、SubagentStop、PreToolUse、PermissionRequest、PostToolUse、PreCompact、PostCompact、UserPromptSubmit、Stop、Interrupt）**
- 只支持 command 和 mcp_tool，prompt/agent 解析后跳过。
- 默认超时 600s；SessionEnd、Interrupt 默认 1s、最多 3s，SessionEnd 总是同步，空闲 30 分钟也会触发。
- additionalContext 超过约 2,500 token 转存到临时目录，单个 hook 可用 additionalContextLimit 调。async hook 每会话最多 8 个并发。
- 信任：非托管 hook（含插件 hook）要在 /hooks 审核，Codex 按“确切的 hook 定义”记哈希，定义一改就要重审【推断：只改脚本内容不触发重审】。
- 文档列出的插件组件是 skills、MCP、apps、浏览器扩展、hooks，未见 agents、commands、输出风格。清单可用 Agent Plugins 的根 plugin.json 或 .codex-plugin/plugin.json；marketplace 也认 .claude-plugin/marketplace.json。插件 hook 同时拿到 PLUGIN_ROOT/PLUGIN_DATA 和 CLAUDE_PLUGIN_ROOT/CLAUDE_PLUGIN_DATA。
- 源码 codex-rs/config/src/hook_config.rs：hooks 文件顶层只允许 description 和 hooks，事件层不拒绝未知键【推断：CC 独有事件会被忽略，需实测】。
- 分发：codex plugin add/list/remove、codex plugin marketplace add/upgrade（本机 0.162.1 核实），会话内 /plugins。skills 放 .agents/skills 或 ~/.agents/skills，用 $name 调用；AGENTS.md 合并上限 32KiB（project_doc_max_bytes）；~/.codex/prompts 已废弃，改用 skills；MCP 可随插件带。

## 3. 三个跨宿主插件

| 项目 | 内核 | 适配层 | 降级 |
|---|---|---|---|
| DietrichGebert/ponytail（164k★，MIT） | skills/*/SKILL.md + hooks/*.js（package.json 零依赖）+ AGENTS.md | 每个宿主一个清单或小文件（.claude-plugin、.codex-plugin、.github/plugin、gemini-extension.json、.opencode/plugins/*.mjs 等）；CC 与 Codex 共用 hooks/claude-codex-hooks.json；运行时靠环境变量判断宿主再输出对应 JSON | docs/agent-portability.md 分三档：插件+hooks、只有 skills、只靠 AGENTS.md。Gemini 不配 hook；Antigravity CLI 没有 hooks，因此没有持久等级 |
| obra/superpowers（299k★，MIT） | skills/ 唯一事实源，每个宿主一张工具映射表 | 只做一件事：会话开始注入 bootstrap（移植文档列为硬要求）。hooks.json 只有 SessionStart，按 CURSOR_PLUGIN_ROOT / CLAUDE_PLUGIN_ROOT / COPILOT_CLI 输出三种形状 | Codex 插件写 `"hooks": {}` 关掉 hook，只用原生 skills；Gemini 用 GEMINI.md @include |
| thedotmack/claude-mem（101k★，Apache-2.0） | 宿主无关的 handlers + 后台 worker 做 AI 压缩 | 所有 hook 调同一个 CLI `claude-mem hook <host> <event>`；src/cli/adapters/*.ts 每个宿主 2-6KB，只做输入输出归一化 | CC 挂 Setup、SessionStart、UserPromptSubmit、PreToolUse、PostToolUse(Failure)、Stop、SessionEnd（重活 async）；Codex 少了 Setup、SessionEnd，多了 PostCompact。需要常驻 worker 服务，三者中依赖最多 |

可借鉴的共性：事实源只有一份 skills；适配层 = 清单 + 一个按宿主改输出形状的函数；所有宿主的最小公约数是“会话开始注入 + skills”。

## 4. 学习循环落地方案

| 环节 | Claude Code | Codex |
|---|---|---|
| 观察 | PostToolUse 命令 hook，只把工具名、短参数、成败追加到本地 JSONL，不调 LLM | 同左 |
| 关键时刻指导 | 同一个 hook 里跑规则（如同一命令连续失败 3 次、测试由绿转红），命中才输出一张短导师卡片 | 同左 |
| 任务开始 | UserPromptSubmit 按话题注入档案相关条目 | 同左 |
| 复盘 | 主路径：显式技能 /debrief，由主模型写“学到了什么 / 技术栈 / 科研要点 / 下一步”，再由 CLI 存档；辅路径：Stop 在任务边界 block 一次，必须检查 stop_hook_active | $debrief；Stop decision:block |
| 档案注入 | SessionStart 注入精简摘要 | 同左 |
| 会话结束 | SessionEnd 只写“待复盘”标记（1.5s 内） | 同左（3s 内） |
| 仅 CC 可选 | agents/mentor.md、output-styles/mentor.md | 无 |

限制与取舍：
- hook 里调 LLM：CC 的 prompt/agent hook 只回 ok/reason；Codex 不支持。离线复盘可以在 SessionEnd 拉起 `claude -p --resume <id>` 或 `codex exec resume`，但子会话会再次触发本插件的 hook，要用环境变量防递归，脱离进程能否在宿主退出后存活两边文档都没写【推断，未实测】。
- token：SessionStart 注入每个会话都要付，CC 在 resume、compact 时还会重跑。建议摘要不超过约 1,500 token，这样两边上限都满足【建议】。把上游 12 个技能全部挂进插件，会让 12 条描述常驻上下文（实际成本未测）。
- 性能：PostToolUse 每次工具调用都起一个进程，脚本要尽早退出（冷启动开销未实测）。
- 隐私：transcript 含代码和密钥。只存提炼后的条目，写盘前脱敏，默认纯本地。CC transcript 默认保留 30 天（/sessions）。
- 档案位置：${CLAUDE_PLUGIN_DATA} 和 Codex 的 PLUGIN_DATA 是两个独立目录；想跨宿主共享就用中立目录，例如 ~/.professor/【建议】。

## 5. GitHub 贡献者继承

官方规则：
- Contributors 图只算默认分支、前 100 名，merge 提交和空提交不算，作者邮箱必须关联账号。“including commit co-authors”这句只出现在 GHES 版页面，github.com 版没有（https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors ，和 enterprise-server@latest 同页对比）。
- REST：“GitHub identifies contributors by author email address”（https://docs.github.com/en/rest/repos/repos#list-repository-contributors ）。
- fork 里的提交不计入个人贡献图（https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference ）；fork 默认不出现在仓库搜索结果里（https://docs.github.com/en/search-github/searching-on-github/searching-in-forks ）。
- .mailmap：GitHub 文档未查到。既然按作者邮箱识别，推断无效。

实测：
- Co-authored-by 不计入：Evilpasture/project-zahlen 带 arena-agent（普通 User 账号，noreply 邮箱）co-author 的提交已确认在默认分支上，commit 搜索命中 29 个，arena-agent 不在 contributors 列表。hartra344/pincer 结果相同，但其 co-author 是 Copilot 机器人账号，这一例证据较弱。
- subtree 有效：Professor-Duck（私有）用 `git subtree add` 不 squash 导入（合并提交 6e2d632e），contributors 里有 JoeyWu-tech 58、Thanksyy 10、xypkent 9 等上游作者。导入之后才贡献的上游作者，要 subtree pull 才会出现。
- fork：smile-ljh/Supervisor-Skills 的 contributors 和上游一致。

| 方案 | 显示上游作者 | 代价 |
|---|---|---|
| subtree add 不 squash（推荐） | 是【实测】 | 多一份上游历史；上游新作者要靠 subtree pull |
| subtree --squash | 否（只生成一个提交，git-subtree 文档） | 丢掉上游提交历史 |
| fork | 是【实测】 | 带 fork 标签，搜索默认隐藏，你的提交不进个人贡献图 |
| Co-authored-by、.mailmap、README 致谢 | 否（.mailmap 为推断） | 无 |
| filter-repo 只保留 skills/ 后 merge --allow-unrelated-histories | 【推断】是 | SHA 被改写，之后不能直接 subtree pull |

注意事项：
- 同步命令：`git subtree pull --prefix=vendor/supervisor-skills https://github.com/HKUSTDial/Supervisor-Skills main`，prefix 与 add 时一致。pull 也不要加 --squash，否则上游新提交会被压成一个由你署名的提交【推断】。vendor 目录保持只读，改动走上游 PR。
- 体积【实测】：上游 API size 64,674KB，当前树里 handbook 30.5MB、skills 13.4MB、assets 8.5MB；Professor-Duck 导入的是较早版本，整仓 37,352KB。CC 添加 git marketplace 时会克隆仓库（/plugins/host-marketplace），克隆深度未查到。插件放子目录、vendor 放插件根之外，安装缓存里就不带 vendor【推断】。如果实测 marketplace 克隆会拉全量历史，可以把 marketplace 拆成独立小仓库，插件 source 用 git-subdir 指回本仓库 plugin/，文档说 git-subdir 会请求 partial clone、只检出该子目录（/plugins/marketplace-reference）。Codex 安装时的克隆方式未查到。
- 许可：上游是 CC BY-NC-SA 4.0（“Copyright (c) 2026 Yuyu Luo (methodology) and contributors”）。vendor 部分及其改编仍受 NC、SA 约束，新代码如果用别的许可，要按目录写清楚。

## 6. 推荐目录树（薄内核 + 薄适配器）

```
<repo>/
├─ .claude-plugin/marketplace.json   # source: "./plugin"（同仓库用相对路径）
├─ .agents/plugins/marketplace.json  # Codex
├─ plugin/                           # 实际分发的插件，保持很小
│  ├─ .claude-plugin/plugin.json
│  ├─ .codex-plugin/plugin.json      # 或 Agent Plugins 根 plugin.json
│  ├─ hooks/hooks.json               # CC 与 Codex 共用 5 个事件
│  ├─ bin/prof.mjs                   # 单文件零依赖：normalize → triggers → render(host)
│  ├─ skills/{debrief,profile,mentor}/SKILL.md   # 唯一事实源
│  ├─ agents/、output-styles/        # 仅 CC，可选
│  └─ AGENTS.md                      # 无插件宿主的兜底指令
├─ adapters/                         # 第二阶段：Gemini、Cursor、OpenCode、Copilot
├─ vendor/supervisor-skills/         # subtree，不 squash，只读，不随插件分发
└─ LICENSE、LICENSES/                # 按目录写清许可
```

hooks.json 里的命令统一写成 `node "${CLAUDE_PLUGIN_ROOT}/bin/prof.mjs" hook <event>`（ponytail 在 CC 与 Codex 共用文件里是类似写法）。宿主判断照 ponytail：有 PLUGIN_DATA 就是 Codex。运行时依赖 Node 是一个环境假设，用 Node 还是 POSIX sh / Python 需要用户拍板。降级顺序：Gemini 能力接近完整；Cursor 没有每轮注入，改用 sessionStart + postToolUse + stop；OpenCode 走 JS 插件 + SDK；只有 AGENTS.md 的宿主只剩指令文件里的手动复盘约定。

## 7. 未查到 / 待实测

- Codex 插件安装的克隆方式；CC marketplace 的克隆深度。
- Codex 对 CC 独有事件名、字段的实际容忍度。
- SessionEnd 拉起的脱离进程能否存活。
- 仓库页右侧 Contributors 栏与 contributors 图、API 是否同一口径（没有单独文档，推断同源）。
- filter-repo 方案、Copilot sessionEnd 时限。

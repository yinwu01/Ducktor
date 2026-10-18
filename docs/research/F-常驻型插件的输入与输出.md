# 常驻型编程助手插件的输入与输出（2026-10-15 核实）

核实方式：仓库文件都是 2026-10-15 用 `gh api` 取的 main 分支原文。第 0 节 Ponytail 由主会话直接取；第 1 到 4 节由子 agent 核实，"Learn by Doing / TODO(human)" 原文是在本机 Claude Code 2.1.301 可执行文件里只读检索到的。推断和示意都已标出。

## 0. Ponytail（DietrichGebert/ponytail，164,590 星）

README 原文摘录（`README.md`）：

```
## Before / after
You ask for a date picker. Without Ponytail, the agent installs a date picker library or builds a whole calendar by hand: 335 lines. Ponytail 5 first looks at what is already there: the repo has an `Input` component, and every browser has a date picker. It puts the two together. 10 lines.

## The review, rebuilt
`/ponytail-review` used to look only for code to cut. Now it reviews like the senior dev who gets paged when it breaks: it reads the code your change touches, not just the diff, and checks bugs, security, real load, missing tests, speed, and what to cut. Each finding says what the code does, what goes wrong, how to fix it, and what happens if you don't.

## The audit, rebuilt
`/ponytail-audit` runs the same checks on the whole repo. It maps the code first: entry points, how data moves, what load the project expects. Then it ranks what it finds and tells you what to fix first. The old audit only listed what to delete.

## How it works
The ladder runs *after* it understands the problem, not instead of it: it reads the code the change touches and traces the real flow before picking a rung. Lazy about the solution, never about reading.
Lazy, not negligent: trust-boundary validation, data-loss handling, security, and accessibility are never on the chopping block.
Logic with a branch, a loop, a parser, money or security leaves one small test behind. Every reply ends with what was skipped or not checked and any risk you should know.

## Install
/plugin marketplace add DietrichGebert/ponytail
codex plugin marketplace add DietrichGebert/ponytail

Active every session, with a handful of commands (see [Commands](#commands)). `/ponytail ultra` exists for when the codebase has wronged you personally. Startup and mode-change text shows the current mode.

## Commands
| `/ponytail [lite | full | ultra | off]` | Set the intensity, or turn it off. No argument switches ponytail on at the default level if it is off, and otherwise reports the current level. |
| `/ponytail-review` | Review the current diff like the senior dev who gets paged when it breaks: bugs, security, real load, risky code without a test, slow paths, and what to cut. Each finding says what the code does, what goes wrong, how to fix it, and what happens if you don't. Name a target in plain words to narrow or widen it: `uncommitted`, `staged`, `branch`, or a PR link. |
| `/ponytail-audit` | The same check for the whole repo, most important first. |
| `/ponytail-debt` | Harvest the `shortcut:` comments you've deferred into a ledger, so "later" doesn't become "never". |
| `/ponytail-gain` | Show the measured impact scoreboard (less code, less cost, more speed) from the benchmark. |
| `/ponytail-help` | Quick reference for the commands above. |
```

README 配图说明文字（audit 配图的 alt 文本，原文）：

```
Your whole repo, ranked. Fix this first. A real /ponytail-audit from the benchmark on a warehouse stock repo: 1 must fix, office batches with 1,200 fail completely; 2 must fix, the import silently skips bad rows; 3 must fix, a mistyped SKU in an office batch is silently ignored; 4 should fix, the risky code paths have no tests; 5 nice to have, the API crashes on a body that isn't an object. Verdict: fix 1 first.
```

`skills/ponytail/SKILL.md`（52 行）节选：

```
You are a lazy senior developer. The best code is the code never written. You solve the whole problem with the least new code. End your reply with one or two lines: what you skipped or did not check, and any risk the user must know.

Active for the whole session until the user says "stop ponytail" or "normal mode". Switch level: `/ponytail lite|full|ultra`.

## The smallest complete change

Take the first option that fully works:

1. Does it need to exist? Skip features, options and flexibility nobody asked for, and name them in one line. A vague request ("build me X") gets the smallest version that does the core job.
2. Already in this codebase (a helper, component, service, pattern)? Use it the way the surrounding code does.
3. Standard library or a platform feature? Use it, unless the project has its own. A house component beats a native widget.
4. An installed dependency? Use it. Never add a dependency for a few lines.
5. Can it be one line a reader gets at a glance? One line.
6. Otherwise: the minimum code that works.
[...]
- Lazy code without its check is unfinished: new non-trivial logic (a branch, a loop, a parser, money or security, or a whole new script or app) leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs, anything the user asked for.

## Levels
| **lite** | Build what was asked. Name the smaller option in one line and let the user pick. |
| **full** | The rules above. Default. |
| **ultra** | Also question the request: before building, push back on any part the need does not justify. |
```

以下第 1 到 4 节为子 agent 报告原文。

---

先说三处和任务预设或 A 报告不一致的地方：
1. **Learn by Doing 和 TODO(human) 不在两个插件里。** 它们来自 Claude Code 内置的 Learning 输出风格，见 2b。
2. **caveman 的档位和 A 报告不一致。** 现版本 v4.0.1 是 /caveman、/ultracave、/megacave 三档。A 报告写的"lite/full/ultra 三档"是 v1.x 的旧档名，代码里现在把它们映射到新三档。
3. **superpowers 的 brainstorming 10 月 9 日刚从头重写（v7.0.0），旧斜杠命令也已删除。** 网上较早的描述多半过时了。

## 1. explanatory-output-style（Anthropic 官方插件）

- **是什么**：README 称它用 hook 复刻"已废弃"的 Explanatory 输出风格（这个内置风格后来又恢复了，见 2b）。插件所在的 anthropics/claude-code 今天 151,109 星。anthropics/claude-plugins-official（39,379 星）里有一份副本，注入文本逐字相同。
- **形态**：常驻。只有一个 SessionStart hook，会话启动时把一段 additionalContext 加进上下文。没有命令，也没有档位，开关就是启用、停用或卸载插件。
- **输入**：照常提需求。
- **返回**：写代码前后各插一个 ★ Insight 框，放 2-3 条针对本代码库的讲解。原文允许"超出通常长度限制"，所以回复只会变长，README 也提醒会多耗 token。Insight 只出现在对话里，不写进代码，也不写别的文件。
- **停顿**：注入文本里没有提问的要求，也不要用户动手。

原文摘录：`plugins/explanatory-output-style/hooks-handlers/session-start.sh` 里的 additionalContext（`\n` 已还原）

```
You are in 'explanatory' output style mode, where you should provide educational insights about the codebase as you help with the user's task.

You should be clear and educational, providing helpful explanations while remaining focused on the task. Balance educational content with task completion. When providing insights, you may exceed typical length constraints, but remain focused and relevant.

## Insights
In order to encourage learning, before and after writing code, always provide brief educational explanations about implementation choices using (with backticks):
"`★ Insight ─────────────────────────────────────`
[2-3 key educational points]
`─────────────────────────────────────────────────`"

These insights should be included in the conversation, not in the codebase. You should generally focus on interesting insights that are specific to the codebase or the code you just wrote, rather than general programming concepts. Do not wait until the end to provide insights. Provide them as you write code.
```

`plugins/explanatory-output-style/README.md`："WARNING: Do not install this plugin unless you are fine with incurring the token cost of this plugin's additional instructions and output."

## 2. learning-output-style（Anthropic 官方插件）

- **是什么**：和第 1 条同一个仓库，作者 Boris Cherny。README 说它把"未发布的 Learning 输出风格"和第 1 条的全部内容合进了一个 SessionStart hook。
- **形态**：同第 1 条，常驻，没有命令，没有档位。
- **输入**：照常提需求。
- **返回**：Insight 框照旧出现。遇到有多种合理做法的业务逻辑、错误处理、算法、数据结构或架构选择时，它先建好文件、写好函数签名和注释，用"TODO or clear placeholder"标出位置，再请你亲手写 5-10 行，并讲清取舍。样板代码、配置和简单 CRUD 仍由它直接写。
- **停顿**：关键的几行留给你写。注入原文没有写"发出请求后停下等待"，但 README 示例里下一步就是用户自己写，所以是否每次都会真的停住属于推断。

示例（README 原文，`plugins/learning-output-style/README.md` 的 "Example interaction"）：

```
**Claude:** I've set up the authentication middleware. The session timeout behavior is a security vs. UX trade-off - should sessions auto-extend on activity, or have a hard timeout?

In `auth/middleware.ts`, implement the `handleSessionTimeout()` function to define the timeout behavior.

Consider: auto-extending improves UX but may leave sessions open longer; hard timeouts are more secure but might frustrate active users.

**You:** [Write 5-10 lines implementing your preferred approach]
```

原文摘录：`plugins/learning-output-style/hooks-handlers/session-start.sh` 的 additionalContext（节选）

```
Instead of implementing everything yourself, identify opportunities where the user can write 5-10 lines of meaningful code that shapes the solution. Focus on business logic, design choices, and implementation strategies where their input truly matters.
[…]
## How to Request Contributions

Before requesting code:
1. Create the file with surrounding context
2. Add function signature with clear parameters/return type
3. Include comments explaining the purpose
4. Mark the location with TODO or clear placeholder

When requesting:
- Explain what you've built and WHY this decision matters
- Reference the exact file and prepared location
- Describe trade-offs to consider, constraints, or approaches
- Frame it as valuable input that shapes the feature, not busy work
- Keep requests focused (5-10 lines of code)
[…]
## Balance

Don't request contributions for:
- Boilerplate or repetitive code
- Obvious implementations with no meaningful choices
- Configuration or setup code
- Simple CRUD operations
```

### 2b. 对照：Learn by Doing 和 TODO(human) 的真正出处

这两样东西出自 Claude Code 内置的 Learning 输出风格。本机 2.1.301 里内置风格有五个：默认、Proactive、Concise、Explanatory、Learning。按 CHANGELOG，可以在 /config 的 Output style 里选，也可以用 `/output-style [name]`。CHANGELOG 2.0.30 废弃过输出风格，2.0.32 又写了"Un-deprecate output styles"。

内置版的规则比插件硬：
- 要生成 20 行以上、而且涉及设计决策时，请用户写 2-10 行。
- 先在代码里放一处 TODO(human)，只能放一处。
- 发出请求后不再做任何动作，也不再输出，等用户写完。
- 用户写完后只给一条 insight，不夸奖，不复述。

原文摘录（本机 `~/.local/share/claude/versions/2.1.301` 内嵌的 JS 源码，`${te.bullet}` 在同一二进制里定义为 ●）：

```
description: "Claude pauses and asks you to write small pieces of code for hands-on practice"

# Learning Style Active
## Requesting Human Contributions
In order to encourage learning, ask the human to contribute 2-10 line code pieces when generating 20+ lines involving:
- Design decisions (error handling, data structures)
- Business logic with multiple valid approaches
- Key algorithms or interface definitions
[…]
### Request Format
● **Learn by Doing**
**Context:** [what's built and why this decision matters]
**Your Task:** [specific function/section in file, mention file and TODO(human) but do not include line numbers]
**Guidance:** [trade-offs and constraints to consider]

### Key Guidelines
- Frame contributions as valuable design decisions, not busy work
- You must first add a TODO(human) section into the codebase with your editing tools before making the Learn by Doing request
- Make sure there is one and only one TODO(human) section in the code
- Don't take any action or output anything after the Learn by Doing request. Wait for human implementation before proceeding.
[…]
### After Contributions
Share one insight connecting their code to broader patterns or system effects. Avoid praise or repetition.
```

## 3. obra/superpowers

- **是什么**：Jesse Vincent 做的技能库，外加一套开发方法论。今天 300,103 星，当前 v7.0.0，10 月 9 日发布，brainstorming 是这一版刚重写的。
- **形态**：常驻注入，技能自动触发。SessionStart hook 在 startup、clear、compact 三个时机，把 using-superpowers 全文包进 `<EXTREMELY_IMPORTANT>` 注入。它要求"哪怕只有 1% 可能适用"也要先调技能，并先宣告这次用哪个技能。
- **开关与命令**：没有档位。旧命令 /brainstorm、/write-plan、/execute-plan 已在 v5.1.0 删除。现在靠自然语言触发，也可以在斜杠菜单里点 /superpowers:<技能名>。
- **输入**：照常说"做个 X"。说一句不想被问，提问环节就结束。
- **返回与流程**：
  - 回复开头多一行技能宣告，接着一次只问一个问题。每弄懂一部分，就用约 200-300 词复述给你听。
  - 然后按规模分三档：小事直接做；小改动在聊天里商定；只有项目才写设计文档，并派子代理做"建造者检查"。
  - 你批准设计后它写计划。你审完计划、选好执行方式，再由子代理逐个任务实现并评审，或者在本会话里内联执行，最后收尾。
- **停顿**：停得很多。设计没批准就不动手；建工作树之前先问你；收尾时让你在合并、开 PR、保留三项里选，要丢弃得手打 discard。内联执行时只有四类情况才停。

示例：输入取自 README 的验装说明："To verify, start a fresh session and send `Let's make a react todo list` [...] a working install auto-triggers `brainstorming` before any code is written." 下面的输出是示意，按 brainstorming 的 "Your First Message" 规则写，第三行是 SKILL.md 自带的例句：

```
你输入：Let's make a react todo list
你看到：
Using brainstorming to work out what you want before building.
If you'd rather skip the questions and have me just start, say so.
What's the moment you find yourself wishing this existed?
```

原文摘录：
- `hooks/hooks.json`：`"matcher": "startup|clear|compact"`
- `skills/using-superpowers/SKILL.md`：

```
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.
[…]
Then announce "Using [skill] to [purpose]" and follow the skill exactly. If it has a checklist, create a todo per item.
```

- `skills/brainstorming/SKILL.md`：

```
Your first message is two things, in this order:

1. One line letting them know that if they'd rather skip the questions and
   have you just start, they can say so. If they take you up on it, this
   skill is done: [...]
2. One open question that gets them describing. Ask about a real moment
   or a concrete picture: "What's the moment you find yourself wishing
   this existed?" or "Tell me about the people who'll be in the room."

That's the whole message.

## The Conversation

Each message ends with one question: a single sentence with no list of
example answers hanging off it.
[…]
describe that part back in about 200-300 words, then return to
questions about the next part.
[…]
**Where it goes:** in a software repo,
`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`, committed.
[…]
<HARD-GATE>
Nothing gets built until your human partner approves the full
description: in chat for a small change, the document for a project.
```

- `skills/writing-plans/SKILL.md`："**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`"；交接话术："Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Please review the plan. Which execution approach would you prefer?"
- `skills/finishing-a-development-branch/SKILL.md`：选项为 "1. Merge back to <base-branch> locally / 2. Push and create a Pull Request / 3. Keep the branch as-is (I'll handle it later)"；丢弃需要 "Type 'discard' to confirm."
- `RELEASE-NOTES.md` v5.1.0："**Legacy slash commands removed** [...] `/brainstorm`, `/execute-plan`, and `/write-plan` are gone."

## 4. caveman（JuliusBrussee/caveman）

- **是什么**：让代理少说、少读的插件。今天 112,751 星，当前 v4.0.1。
- **形态**：常驻，默认开启。Claude Code 插件挂了四个 hook：SessionStart 注入当前档位的整份 SKILL.md；SubagentStart 给子代理同样注入；UserPromptSubmit 每条消息后补一句 "CAVEMAN MODE ACTIVE" 提醒，并识别开关词；SessionEnd 记录 token 统计。
- **档位**：三档，/caveman、/ultracave、/megacave（文言文）。
- **退出**：说 "stop caveman" 或 "normal mode"，或者输入 /caveman off。
- **返回**：先给答案再给理由，删掉客套、铺垫、复述和收尾套话。代码、命令、路径、报错逐字保留。遇到安全警告、不可逆操作，或者要向你提问时，改回完整句子。
- **停顿**：一般不额外提问。

示例（README 原文；README 没给提问原文，从内容看是在问 React 组件为什么重复渲染，属推断）：

```
Normal agent · 63 tokens:
> The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle. When you pass an inline object as a prop, React's shallow comparison sees it as a different object every time, which triggers a re-render. I'd recommend using useMemo to memoize the object.

Caveman agent · 20 tokens:
> New object ref each render, so React re-renders. Wrap the prop in `useMemo`.

| `/caveman`   | New object ref each render, so React re-renders. Wrap the prop in `useMemo`. | 20 |
| `/ultracave` | Inline object prop, new ref, re-render. `useMemo`. | 14 |
| `/megacave`  | 新參照致重繪。`useMemo`。 | **13** |
```

原文摘录：
- `src/hooks/caveman-mode-tracker.js`，每条消息都会注入：

```
'CAVEMAN MODE ACTIVE (' + mode + '). ' + thesisLine(mode, __dirname) +
' Answer only what was asked: no unrequested background, lists, examples,' +
' walkthroughs, or follow-up offers; give code, steps, or warnings when the' +
' task needs them. Security warnings, irreversible actions, multi-step order:' +
' normal prose. Technical terms, code, commands, paths, and errors stay exact.'
```

- `.claude-plugin/plugin.json`：hooks 为 SessionStart、SubagentStart、UserPromptSubmit、SessionEnd。

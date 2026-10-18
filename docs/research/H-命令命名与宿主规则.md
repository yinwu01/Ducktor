# H｜命令命名：成熟项目怎么做、两个宿主的规则（2026-10-16 核实）

> 两个子 agent 的报告原文（英文），只整理了格式。★ 为当日 `gh api` 值。第一部分查 Claude Code 官方文档，第二部分查 11 个插件项目、Codex 文档和 clig.dev。引文由抓取工具取得，发布前要再对原文。

## 1. Claude Code 官方文档

Sources: [S] https://code.claude.com/docs/en/skills · [C] https://code.claude.com/docs/en/plugins/components · [M] https://code.claude.com/docs/en/plugins/manifest-reference · [L] https://code.claude.com/docs/en/plugins/loading · [R] https://code.claude.com/docs/en/plugins/cli-reference · [H] https://code.claude.com/docs/en/hooks · [O] https://code.claude.com/docs/en/output-styles · [CL] https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md · [MP] https://github.com/anthropics/claude-plugins-official · [CP] https://github.com/anthropics/claude-code/tree/main/plugins

**Naming**
- "plugin skills are namespaced as `/plugin-name:skill-name`" [S]. "The bare `/fancy` also invokes the skill unless another command already uses that name" [S]. So `/duck:review` always works; bare `/review` only if no other command has that name.
- [S] names `/review` as a bundled alias ("the bundled alias `/review` never runs your skill"), so bare `/review` is likely taken (inference).
- `skills/duck/SKILL.md` is `/duck:duck`, per `/<plugin>:<directory>` [C]. No same-name special case is documented, so bare `/duck` follows the same rule (this is what Ponytail's bare `/ponytail lite` relies on).
- Legacy `commands/<file>.md` is `/<plugin>:<file>` [C].

**Arguments**: `$ARGUMENTS` holds all arguments; `$0`, `$1` (or `$ARGUMENTS[N]`) index from 0 [S]. `argument-hint`: "Hint shown during autocomplete to indicate expected arguments" [S]; completion of argument values is not documented. A dispatcher that branches on `$0` should work (inference, untested).

**Invocation control**
- `disable-model-invocation: true`: "Description not in context, full skill loads when invoked" [S].
- `user-invocable: false`: hidden from `/`, but "Description always in context" [S].
- "The budget scales at 1% of the model's context window" [S]; override with `SLASH_COMMAND_TOOL_CHAR_BUDGET` or `skillListingBudgetFraction`; each entry capped at 1,536 characters (`skillListingMaxDescChars`) [S].

**Hot reload**
- `~/.claude/skills`, `.claude/skills`, `--add-dir`: live, "without a restart"; a newly created top-level skills directory needs `/reload-skills` [S].
- Installed plugin: "run `/reload-plugins` in a running session or start a new one" [C].
- `--plugin-dir`: "loads in place and is never copied" [L]; edits are pending until `/reload-plugins` [R].

**Disabling**
- Whole plugin: `claude plugin disable <plugin> --scope user|project|local` or `/plugin disable` [R]; `"<name>@<marketplace>": false` under `enabledPlugins` [L]; project scope reaches "Everyone who clones the repository" [L].
- Single skill inside a plugin: no documented toggle. "Plugin skills are not affected by `skillOverrides`" [S]. `Skill(name)` deny rules exist, but a namespaced example is not shown; unconfirmed.

**Hooks**
- [CL] 2.1.299: "Changed `UserPromptSubmit` hooks to run before a skill or custom slash command expands" (rest paraphrased).
- "`UserPromptSubmit` hooks receive the `prompt` field containing the submitted text" [H].
- `UserPromptExpansion`: "Runs when a user-typed command expands into a prompt before reaching Claude"; inputs include `command_name` and `command_args`; `decision: "block"` stops expansion [H].
- Injected context: "String added to Claude's context alongside the submitted prompt"; it "can't replace the prompt" [H]. Cap: 10,000 characters, "this cap has no setting or environment variable to raise it" [H].

**Paths and data**
- `${CLAUDE_PLUGIN_ROOT}`: "Absolute path of the plugin's installed version"; it "changes when the plugin updates, so don't write state there" [M].
- `${CLAUDE_PLUGIN_DATA}`: `~/.claude/plugins/data/<id>/`, "kept across plugin updates" [M].
- Cache: `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`; old version removed 14 days after an update [L].

**userConfig / output styles**: `userConfig` "declares values Claude Code prompts the user for when the plugin is enabled" [M]. "Plugins can also ship output styles in an `output-styles/` directory" [O].

**Built-in output styles**: "Claude Code includes four built-in styles besides its default": Proactive, Concise, Explanatory, Learning [O]. Explanatory puts explanations "in a block labeled `Insight`"; Learning adds a "`TODO(human)` comment in the file" [O]. [MP]/[CP] still list `explanatory-output-style` and `learning-output-style` plugins.

## 2. 成熟项目、Codex、clig.dev

| Project | ★ | Style | Claude Code | Codex | Aliases / renames |
|---|---|---|---|---|---|
| DietrichGebert/ponytail | 164,987 | Argument subcommand (levels) + prefixed flat | `/ponytail [lite\|full\|ultra\|off]`, `/ponytail band [on\|off]`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help` (README). README says `/ponytail-debt`, not `/ponytail:ponytail-debt` | `$ponytail:ponytail-review`; docs dropped `$ponytail-review` because only the namespaced form loads (PR #1035) | None. Latest v5.3.1, 2026-10-16 |
| JuliusBrussee/caveman | 113,012 | Prefixed flat + mode-named commands | `/caveman`, `/ultracave`, `/megacave`, `/caveman status\|off`, `/caveman-commit`, `/caveman-review`, `/caveman-compress <file>` | `$caveman` | v3.1.0: "Six intensity levels become three skills that map 1:1 to stored modes"; `/caveman lite\|full\|ultra\|wenyan*` kept as aliases (docs/technical/three-skills-refactor.md, #1165) |
| obra/superpowers | 300,482 | No commands; auto-triggered skills | `superpowers:brainstorming` | typed form undocumented | `/brainstorm`, `/write-plan`, `/execute-plan` removed in v5.1.0: "deprecated stubs that did nothing but tell the user to invoke the corresponding skill" (#1188) |
| github/spec-kit | 141,526 | Prefixed flat | `/speckit-specify`, `/speckit-plan` | `$speckit-specify` | v0.0.57 renamed `/specify` etc. to `speckit.*` "for better discoverability and differentiation in IDE/CLI command palettes and file explorers" (#734); 2026 skills migration made it `speckit-*` (#1906, #1971). Requests for `/speckit:analyze` closed as stale; maintainer: works in Claude Code "but in VS Code this doesn't seem to be the case" (#913) |
| Fission-AI/OpenSpec | 72,136 | Host namespace via `.claude/commands/opsx/` + prefixed skills | `/opsx:propose`, `/opsx:apply`; skill form `/openspec-apply-change` | `$openspec-propose`; "Codex does not recognize `/openspec-propose`" | 1.0 removed `/openspec:proposal\|apply\|archive`. Open proposal: "`/opsx:propose` becomes `/openspec-propose` in most tools" (#2089, #2022). Short: `/opsx:ff` |
| EveryInc/compound-engineering-plugin | 25,553 | Prefixed flat (`ce-`) | `/ce-brainstorm`, `/ce-plan`, `/ce-work`, `/ce-code-review`, `/ce-compound`, `/lfg` | `$ce-plan`, `$lfg` (README; unverified) | `workflows:*` → `ce:*` → `ce-*`. Reasons for `ce-`: "Generic skill names (`setup`, `plan`, `review`) collide when users install multiple Claude Code plugins"; "The colon also required filesystem sanitization on Windows"; `lfg`/`slfg` kept as "memorable names" (#503). `/ce-compound` writes `docs/solutions/[category]/[filename].md`, which `ce-plan` reads later (docs/guides/ce-compound.md) |
| SuperClaude-Org/SuperClaude_Framework | 23,909 | Host namespace via `~/.claude/commands/sc/` | `/sc:research`, `/sc:implement`, `/sc` | none (#498 open) | `/analyze` → `/sc:analyze` "to avoid conflicts with user custom commands" |
| garrytan/gstack | 136,656 | Unprefixed flat (default) | `/office-hours`, `/review`, `/ship`, `/qa` | `~/.codex/skills/gstack-*/` | 0.12.9.0 added a `gstack-` prefix: "Prevents collisions with other skill packs"; 0.12.11.0 made it optional. Copilot gets `/gstack-review` "because `/review` is a Copilot built-in" |
| addyosmani/agent-skills | 107,274 | Unprefixed flat; namespace on collision | `/spec`, `/plan`, `/build`, `/review`, `/ship`; "use the namespaced form: `/agent-skills:review`" | `@spec-driven-development` (unverified) | #551: "Claude Code now ships its own /code-review as well as /review… What works on every version is the namespaced form" |
| Yeachan-Heo/oh-my-claudecode | 39,960 | Magic keywords + unprefixed slash skills | `/team`, `/autopilot`, `/ralph`; keywords `ralph`, `ralplan`, `ultrathink` | separate oh-my-codex: `$ralplan`, `$team` | "`plan this` / `plan the` keyword triggers were removed" after false positives (#824); alias `/omc-ralph` (#3681) |
| bmad-code-org/BMAD-METHOD | 54,221 | Prefixed flat + `bmad` hub with free-text actions | `/bmad-build <request>`, `/bmad Explain what bmad-build just did.` | `codex plugin marketplace add bmad-code-org/bmad-plugins` | Two-letter agent-menu codes such as `BD`; `bmad-quick-dev` → `bmad-build` with deprecation redirect shims (#2651) |

**Codex**
- "In Codex CLI or the IDE extension, run `/skills` or type `$` to mention a skill." (https://learn.chatgpt.com/docs/build-skills)
- Locations: repo `.agents/skills` (in `$CWD`, its parents and `$REPO_ROOT`); user `$HOME/.agents/skills`; admin `/etc/codex/skills`.
- "Codex detects skill changes automatically." / "If an update doesn't appear, restart Codex." Plugins: "start a new session before using its bundled skills or tools" (https://learn.chatgpt.com/docs/plugins).
- Plugins exist: `/plugins` browser or `codex plugin marketplace add owner/repo`. Source: "a skill named `search` beneath a plugin named `sample` is exposed as `sample:search`" (codex-rs/ext/skills/src/loader/namespace.rs). In Ponytail's test only `$ponytail:ponytail-review` loaded (#1035). 64-character cap on the whole `namespace:skill` string (#24725, open).
- Hooks: trust in `/hooks`; events include `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`; `UserPromptSubmit` can add `additionalContext` or return `"decision": "block"`; plugins can bundle `hooks/hooks.json` (https://learn.chatgpt.com/docs/hooks).
- "Custom prompts are deprecated. Use skills for reusable instructions…" (old form `/prompts:draftpr`).

**clig.dev**（https://clig.dev/#subcommands）
- "Be consistent across subcommands. Use the same flag names for the same things, have similar output formatting, etc."
- "Don't have ambiguous or similarly-named commands."
- "Don't allow arbitrary abbreviations of subcommands." … "Now you're stuck: you can't add any more commands beginning with `i`, because there are scripts out there that assume `i` means `install`."
- "There's nothing wrong with aliases—saving on typing is good—but they should be explicit and remain stable."
- "Don't have a catch-all subcommand."

**让 agent 改自己的技能，且先经用户确认的先例**
- skill-creator：能 "modify and improve existing skills"；先给旧版做快照，用户看过结果，再按 "feedback from the user's evaluation" 改。
- plugin-dev：`/plugin-dev:create-plugin` 各阶段 "confirm with user before proceeding"。
- hookify：`/hookify` "Analyzes recent conversation to find behaviors you've corrected"，问 "Which behaviors to hookify?"，再写 `.claude/hookify.*.local.md`。
- claude-md-management：`/revise-claude-md`："Ask if the user wants to apply the changes. Only edit files they approve."
- superpowers writing-skills：门槛是测试，不是用户批准："NO SKILL WITHOUT A FAILING TEST FIRST"。

**子 agent 的综合判断（原文）**：`duck-<word>` skills plus a `/duck` hub for help and modes, with any alias explicit and stable.

## 3. 主 agent 补核（10-16）

**Claude Code 命令菜单怎么匹配**（https://code.claude.com/docs/en/commands#how-the-command-menu-matches-what-you-type ，原文）："Claude Code highlights the top suggestion only when the letters after the `/` match a command's name or alias, from the start of the name or from a word within it, ignoring the `:`, `_`, and `-` separators. Typing `/adddir` highlights `/add-dir`, and typing `/new` highlights `/clear` through its alias." 同页还写了：一条消息开头可以连着叫最多六个技能（`/skill-a /skill-b do XYZ`）。

**Ponytail 5.3 的 band**（`gh api repos/DietrichGebert/ponytail/readme`，README 原文节选）："In Claude Code, ponytail now shows a band above the prompt: what the current task costs, how many tokens and how much agent time it used, how often it reused existing code instead of writing new code, and whether the tests passed after the last change. … Don't want it? `/ponytail band` hides it, the same command brings it back. Needs Claude Code 2.1.290 or later…" ；"**Board** opens a local page with every task across your projects: cost, agent time and tokens over time, every session with its tests, and the days you worked. By default, everything stays on your machine, in `~/.config/ponytail/band/`."

**10 个继承技能文件头的 license 字段**（`mentor-plugin/supervisor-skills/skills/*/SKILL.md`）：CC-BY-4.0 六个（benchmark-paper-template、figure-designer、idea-evaluator、pre-submission-reviewer、tech-paper-template、vibe-research-workflow）；CC-BY-NC-SA-4.0 四个（deep-research、intro-drafter、paper-polish、paper-writer）。仓库根目录 LICENSE 是 CC BY-NC-SA 4.0（"Copyright (c) 2026 Yuyu Luo (methodology) and contributors"）。

**11 个技能 description 的长度**（去掉换行后的字符数）：合计约 5,360（主 agent 算 5,363，审稿人算 5,361）。

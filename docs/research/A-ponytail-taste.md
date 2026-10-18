# A｜Ponytail 深度拆解 + 爆款 agent 插件"品味"对标

> 2026-10-15 实测，★ 为当日 `gh api` 值；[n] 见文末来源；"推断"=无直接证据。

## 0 结论先行

1. **本体是一个 52 行的 prompt**（`skills/ponytail/SKILL.md`），另有 5 个一次性 skill 共 370 行。其余约 2,400 行是 hook、适配器和脚本，负责把它送进约 30 个宿主。[1]
2. **生效靠常驻注入**：JetBrains 测 v4.8.4 时，只装 skill 的 10 次会话里，自动触发 0 次。[5]
3. **机制不是原创**：常驻注入 hook、lite/full/ultra 三档、"normal mode" 退出、状态栏徽章，caveman 在 4 月初（v1.0 到 v1.3.5）就都有了；两者 activate hook 的注释几乎逐行一致，故推断为沿用。[1][7] ponytail 胜在人设、诚实和克制。
4. **效果真实，但远小于宣传**：作者自测代码 −53%、成本 −26%；JetBrains 用 80 对任务测得代码 −15.4%（p=0.088）、成本 −10.3%（p=0.004）。首版宣称的 80–94% 是因为基线回答太啰嗦而虚高（#126），作者两天内重做基准并认错。[3][5]
5. **对导师插件**：人设、一页 prompt、常驻注入、每轮交代、改规则前先过评测，这五样都可以照搬。"少写"这个目标不能照搬，因为学习要让学生多动手。更接近的先例是官方的 learning-output-style。[16]

## 1 事实卡

| 项 | 实测 |
|---|---|
| 一句话 | "Makes your AI agent think like the laziest senior dev in the room"：只写最少的代码，但不砍校验、安全和无障碍 |
| 规模 | ★164,025；fork 8,835；issue 376；PR 749；commit 347；贡献者 ≥100；release 26 个 |
| 时间与许可 | 06-12 创建，当天就发布了 v1.0 和 v4.0；10-08 发布 v5；10-15 有最新推送；MIT 许可 |
| 作者 | Dietrich Gebert，德国人（官网 Impressum 里有德国 VAT 号）。GitHub 账号 2023 年注册，只有 3 个公开仓库，此前作品未查到。已有 CMO、周边店、等待名单和赞助商，正在商业化 [2] |
| 代码量 | 6 个 skill 共 422 行（核心 52 行、592 词）；hook 1,083 行；OpenCode/pi/Hermes 适配 755 行；脚本 523 行；tests 和 benchmarks 共约 413KB；图片约 9.8MB |
| 依赖 | 没有 npm 依赖，只需要 PATH 里有 node（缺 node 时 skill 也能用）。唯一带依赖的 ponytail-mcp 在 #1042 中删掉了，理由是"从未发布、无人引用" |
| 安装 | Claude Code 两条命令（须分两次发送）：`/plugin marketplace add DietrichGebert/ponytail`、`/plugin install ponytail@ponytail`。Codex 两条，再在 `/hooks` 里信任；其他宿主复制 AGENTS.md 或让 agent 自装。零配置 |
| 分发 | 不在 Anthropic 官方市场（其 315 个插件里没有 ponytail，也没有 caveman 和 claude-mem），走自建 marketplace |

## 2 核心机制与跨宿主

| Hook | 行为 |
|---|---|
| SessionStart | 按档位过滤 SKILL.md 后隐藏注入，附 ≤2,000 字符的代码库地图（git ls-files 加正则），复用前不必再检索。状态栏提示只出一次；compact 后保持档位 |
| UserPromptSubmit | 解析 `/ponytail lite\|full\|ultra\|off` 和单独一句 "stop ponytail" |
| SubagentStart | 给子 agent 注入同样规则，用 `PONYTAIL_SUBAGENT_MATCHER` 可排除 reviewer |
| 状态 | 存在 `~/.claude/.ponytail-active` 和按项目路径 sha256 命名的档位文件里。默认档位的优先级：环境变量 > config.json > full。每个 hook 最多跑 1 秒，失败时静默 |
| 回复契约 | 每条回复末尾用 1–2 行交代跳过了什么、没查什么、有什么风险。有上限的捷径写成 `shortcut: <上限>, <何时升级>`，由 `/ponytail-debt` 汇成账本。`/ponytail-gain` 禁止报"本仓库省了多少"，因为没有真实基线 |

跨宿主分三层：

1. **插件层**：hook 常驻，可切档。覆盖 Claude Code、Codex、Copilot CLI、Cursor、Qoder、CodeBuddy；OpenCode、pi、Hermes 则用各自的插件 API 每轮注入。
2. **skill/扩展层**：有命令，没有 hook。覆盖 Devin、Grok、Antigravity、Goose、Gemini/Qwen、Kimi，其中 Gemini/Qwen/Kimi 另把 AGENTS.md 作为常驻上下文。
3. **指令层**：AGENTS.md 加 7 份副本，由 `check-rule-copies.js` 保持一致。

原则只有一句："Keep adapters thin"。[1]

## 3 README 与叙事

README 现在 209 行。原来有 415 行，#808 批评它"违背了自身原则"，于是砍掉一半，安装说明移到 INSTALL.md。

**首屏**从上到下是：
1. 手绘 logo：一张有胡茬、戴椭圆眼镜的胖脸。
2. 一句话："He says nothing. He writes one line. It works."
3. 徽章 "works with 20 agents"，加上征集故事和等待名单的 banner。
4. hero 图，有 4 种语言的本地化版本：−53% code · −41% time · −26% cost · −45% tokens / "And yet: 98% of risky logic ships with a test"（不用时 68%），图下附一行方法学说明。

**之后**：两句人设 → 数字 → before/after（日期选择器 335 行 → 10 行 `<input type="date">`）→ review/audit → 七级阶梯 → "one prompt" → 两行安装 → 6 个命令 → FAQ 冷笑话 → "MIT. The shortest license that works."

**语气**：第三人称冷幽默，release 名也如此（如 "He ships."）。

## 4 增长轨迹

stargazers API 返回 404、GraphQL 返回 0（superpowers 同样），故用 star-history 的 SVG 反推，误差约 ±1–2k（推断），与二手报道吻合（第 6 天 3.4 万，第 9 天 4.4 万）。[6]

| 日期 | ★≈ | 同期事件 |
|---|---|---|
| 06-12→06-19 | 0→3.7万 | 06-14 HN 首帖 98 分，由第三方提交 [4] |
| →06-27 | 5.9万 | 06-16 #126 和 Scott Logic 博文质疑基准，06-18 作者重做 |
| →08-02 | 9.3万 | 7 月中旬起每周增 0.4–0.6 万；07-29 JetBrains 发布复测 |
| 09-01→09-08 | 11.8→13.1万 | 第二波增长，原因未查到（09-07 有 HN 二次帖，33 分） |
| 09-30→10-08 | 14.8→15.8万 | 10-08 发布 v5 |
| 10-15 | 16.4万 | 实测 |

## 5 用户夸什么、骂什么（约 18 个高互动 issue，加 HN）

**夸**：HN 首评"`<input type=date>` … this is me"；#808 称它是 "a really good prompt"；#126 的批评者称赞作者肯听意见；JetBrains 评价 "more methodological candour than most"。

**骂，以及作者的处理**：
- **基准虚高**（#126）：改为在真实 Claude Code 会话里跑，并加了隐藏检查。
- **担心降智**（#65、#100）：第三方在 #236 跑了 480 次构建，代码 −44%，正确性和安全无损；但 5 个未写明边界的任务鲁棒性变差，档位越高越差。
- **`ponytail:` 品牌注释刷屏**（#120，17 条评论，有人因此卸载）：改成中性的 `shortcut:`。
- **子 agent 一律被注入**（#502，报告者称 reviewer 因此少报问题）：加了 matcher 排除。
- **句式传染**：用户文档里也开始出现 "X, not Y"（#737）。
- **非编码轮次也加尾注**（#1098）：作者复测普通问答，未复现。
- **OpenCode V2 下失效**：#892 和 #941 共 63 个赞。

**治理**：新 skill 只由作者添加。改规则必须附三臂基准（基线、main、改动），每臂至少跑 6 次。例如 #432 提议加防幻觉规则，作者跑 54 次从未出现虚构 API，未采纳；#217 实测有效，采纳。[3]

## 6 八条可复制的设计，以及对导师插件是否适用

| # | 设计（证据） | 导师插件 |
|---|---|---|
| 1 | 人设即契约：人人见过的资深老油条，名字就是机制 | ✔ 换成"先问 baseline 和对照组的导师" |
| 2 | 产品就是一页 prompt，其余都是适配器 | ✔ 核心规则 ≤60 行；Supervisor-Skills 的 12 个 skill 作按需层 |
| 3 | 常驻注入加状态机（无 hook 时 0/10） | ✔ 学习循环要靠 hook 驱动；✘ 不要注入检索和审稿子 agent（#502） |
| 4 | "Never cut" 清单、每轮交代、债务账本 | ✔ 每轮附 1–2 行学习回执：学到什么、什么未验证、有何风险；✘ 仅在有研究动作的轮次出现（#1098） |
| 5 | 规则当代码管：每条规则要用三臂基准证明，错了公开认 | ✔ 指标换成引用可核验率、对照组和 seed 是否齐全、学生能否复述；✘ 不编"你学会了 X%" |
| 6 | 命令极少：6 个命令、3 档、零配置 | ✔ |
| 7 | 语气和视觉统一，hero 图也本地化 | ✔ 中文版要重做截图 |
| 8 | 持续做减法：删掉 MCP，README 砍半 | ✔ |

不适用的地方：
1. **方向相反**。ponytail 让 agent 少写，学习却要学生多写。learning-output-style 更贴近：在决策点留 TODO 让用户亲手写 5–10 行，再配 "★ Insight" 讲解。
2. **品牌标记**。写进代码或论文会招人反感（#120）。
3. **人设口吻**。可能污染论文文风（#737），必须能单独关闭。
4. **新 skill 只由作者添加**。与 Supervisor-Skills 社区共建、署名原作者的目标冲突，宜改为"内容开放贡献，规则改动先过评测"。

## 7 横向对标（★ 为 10-15 数据）

| 项目 | ★ | 定位 | 机制 | 体量 | 宿主 / 安装 | 最值得学 |
|---|---|---|---|---|---|---|
| obra/superpowers [8] | 299,477 | 开发方法论 | SessionStart 注入一个引导 skill；共 15 个 skill，没有命令 | 238 文件 | 16 个宿主；已上架 Claude 和 Codex 官方市场 | 引导 skill 写明"只要有 1% 可能适用就必须调用"，附 Red Flags 表 |
| affaan-m/ECC [9] | 279,883 | 大而全 | 71 个 agent、311 个 skill、97 个命令、27 个 hook、MCP | 4,615 文件；README 2,198 行 | 主要面向 Claude；`npx ecc-universal setup` | 作者是 Anthropic x Forum Ventures 黑客松冠军，配一句闭环口号 |
| JuliusBrussee/caveman [7] | 112,087 | 让 agent 少说、少读 | v1.x 为单 skill + hook + 三档；v4 扩展为 CLI、proxy、Auto | 1,785 文件 | 30+ 宿主；`npx @caveman-ai/cli@latest` | 梗名本身就是演示（63→20 tokens）；首屏放外部背书 |
| addyosmani/agent-skills [10] | 106,861 | 资深工程工作流 | 25 个 skill、9 个命令、4 个 agent、评测；session-start 故意不接 Claude/Codex（避免与原生路由重复） | 217 文件 | 借 skills CLI 覆盖 70+ 宿主 | 一张流程图对应全部命令；每个 skill 固定含 Rationalizations、Red Flags、Verification |
| thedotmack/claude-mem [11] | 100,896 | 跨会话记忆 | 8 类事件自动采集、压缩、回灌；MCP；worker | 2,394 文件 | 7+ 宿主；`npx claude-mem install`，默认引导登录托管服务 | 用户无需操作，由 PostToolUse 被动观察 |
| ayghri/i-have-adhd [12] | 57,219 | 不让答案埋在长文里 | 1 个 skill（10 条规则），SessionStart 常驻 | 74 文件；README 107 行 | 16 个宿主；把一句话贴给 agent 即可自装 | README 极简：before/after、10 条规则、注明出处的一本书 |
| GSD [13] | 64,288（已归档）→ gsd-core 10,535 | spec 驱动 | 旧仓有 67 个命令、33 个 agent、15 个 hook | 1,854 文件 | 10+ 宿主；`npx @opengsd/gsd-core@latest` | 每个执行环节都用全新上下文 |
| oh-my-claudecode [14] | 39,922 | 多 agent 编排 | 30 个 hook、48 个 skill、21 个命令、约 20 个 agent、MCP | 7,676 文件 | 仅 Claude Code；`/plugin` 两步 | 输入关键词（team、ralplan）自动路由 |
| SuperClaude [15] | 23,909 | 配置框架 | 30 个命令、20 个 agent、7 种模式、8 个 MCP | 410 文件 | 仅 Claude Code；pipx 安装 | 反例：首屏是一张数量统计表 |
| learning-output-style [16] | 无单独星数（所在官方仓 38,320） | 学习模式 | 1 个 SessionStart bash hook | 5 文件 | Claude Code；`/plugin install learning-output-style@claude-plugins-official` | 决策点留 TODO 让用户写 5–10 行，加 "★ Insight"；"学习循环"最直接的先例 |

## 8 共性模式与反模式

**共性模式**：
1. 一句话能讲清的人设或梗（ponytail、caveman、i-have-adhd）。
2. 常驻注入：上述三个及 superpowers、官方学习插件都用 SessionStart（无 hook 时 0/10）；反例是 agent-skills，在 Claude/Codex 上故意交给原生路由。
3. 首屏放 before/after 加数字（335→10 行、63→20 tokens）。
4. 证据可以证伪，且有外部复测（JetBrains 测过 ponytail，Adobe 论文引用了 caveman）。
5. 单一源文件，适配层很薄（ponytail 约 30 个宿主，agent-skills 借 skills CLI 覆盖 70+）。
6. 安装不超过两条命令，或让 agent 自己装。
7. 维护者把关严（ponytail 和 superpowers 基本不收外部新 skill）。

**反模式**：
1. **拿数量当卖点、堆功能**：
   - SuperClaude 起步最早，星数却最低。
   - OMC 在 README 开头自荐更轻的 gajae-code。
   - ECC 4,615 个文件仍有 28 万★，可见堆砌不必然失败，但它靠权威和生态（推断），难复制。
2. **重依赖、绑账号**：claude-mem 默认引导登录，caveman 的 Auto 要账号；ponytail 则删掉了唯一的依赖。
3. **数字夸大**：ponytail 首版宣称 80–94%，重做后 −54%，JetBrains 测 v4.8.4 只有 −15%；caveman 宣称 −65%，JetBrains 测得输出 token −8.5%。
4. **污染用户产出**：品牌注释、句式传染（#120、#737、#1098）。
5. **对子 agent 无差别注入**（#502）；OMC 一次挂 30 个 hook。
6. **押注宿主私有 API**：OpenCode V2 一改版就失效。
7. **首屏不讲用户收益**：ECC 首屏是警告框和定价表，OMC 是维护者名单。
8. **迁仓丢星**：GSD 旧仓 6.4 万星，迁到新仓后只有 1.05 万。

## 9 相邻赛道（科研与教学）

- Understand-Anything：86,402★，口号 "Graphs that teach > graphs that impress"
- K-Dense scientific-agent-skills：49,967★
- distilly：25,648★，把人的思考方式蒸馏成 skill
- ARIS：17,518★
- Orchestra AI-Research-SKILLs：13,585★
- 参照 Supervisor-Skills：9,693★

从描述看，以上均无常驻学习循环（推断）。

## 来源

[1] https://github.com/DietrichGebert/ponytail （README、skills/、hooks/*.js、INSTALL.md、docs/agent-portability.md、.github/CONTRIBUTING.md、benchmarks/results/2026-10-07-agentic.md 与 2026-06-12-caveman-vs-ponytail.md、releases、pull/1042）
[2] https://ponytail.dev （/stories、/soon、/impressum.html）
[3] https://github.com/DietrichGebert/ponytail/issues/ 下 65、100、120、126、217、236、432、502、737、808、892、941、1098
[4] https://news.ycombinator.com/item?id=48527946 ；https://news.ycombinator.com/item?id=49592706
[5] https://blog.jetbrains.com/ai/2026/07/ponytail-skill-claude-tested/
[6] https://api.star-history.com/chart?repos=DietrichGebert/ponytail&type=Date ；https://obelixai.substack.com/p/corrected-a-147k-star-claude-skill ；https://blog.scottlogic.com/2026/06/16/ponytail-yagni-and-the-problem-with-prompt-benchmarks.html （正文未读）
[7] https://github.com/JuliusBrussee/caveman （README、src/hooks/caveman-activate.js、releases v1.0.0、v1.2.0、v1.3.5）
[8] https://github.com/obra/superpowers （README、hooks/session-start、skills/using-superpowers/SKILL.md）
[9] https://github.com/affaan-m/ECC
[10] https://github.com/addyosmani/agent-skills
[11] https://github.com/thedotmack/claude-mem
[12] https://github.com/ayghri/i-have-adhd
[13] https://github.com/gsd-build/get-shit-done ；https://github.com/open-gsd/gsd-core
[14] https://github.com/Yeachan-Heo/oh-my-claudecode
[15] https://github.com/SuperClaude-Org/SuperClaude_Framework
[16] https://github.com/anthropics/claude-plugins-official/tree/main/plugins/learning-output-style

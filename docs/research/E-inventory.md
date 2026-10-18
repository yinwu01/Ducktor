# E. 现有知识资产盘点：导师式学习循环的原料清单

2026-10-15，只读。路径缩写：`SS`=/SSD1/wuyin/project/supervisor-skill/Supervisor-Skills，`hb`=SS/handbook，`sk`=SS/skills，`UP`=上游 HKUSTDial/Supervisor-Skills@5f9432d（gh api 读取），`RG`=UP/skills/rebuttal-guidance，`LS`=/home/wuyin/.claude-account-b/skills，`DB`=/SSD1/wuyin/project/supervisor-skill/豆包，`FF`=sk/idea-evaluator/references/fatal-flaws.md，`FP`=sk/pre-submission-reviewer/references/forbidden-patterns.md。L 指本地文件行号，p 指 hb/01_Preliminary/博士生科研入门辅导.pdf 的页码。

## 0 结论

1. 本地 aff5de9 落后上游 5 个 commit。本地 179 个文件中 178 个与上游 blob 一致，只有 README 不同。上游新增 rebuttal-guidance（7 个文件，734 行，09-05 上传），README 还加了 DataMagic 和 DeepEye 推荐。上游 9,691★。
2. hb 共 18 篇 2,404 行（约 8.5 万字），另有 70 页 PDF；sk 有 11 个 skill，共 11,404 行。Idea 评估、引言、作图、自审这几块覆盖强。实验统计严谨、局限性写法、读博元技能都薄弱，组会报告完全空白。
3. PDF 讲义（2023-10）讲选题、读论文、师生关系、被拒心态，这些内容 md 和 skill 都没收，是元技能最主要的原料。
4. 卡片原料最密的地方：hb 3.5、FF、contribution-patterns、consistency-checks、RG 的 checklist。§4 给 15 张样例。
5. 风险集中在 hb 3.5：它带有 DB 领域专属的门槛，面向 ML 学生直接用会误导；还有全面禁用 AI、禁词表自相矛盾的问题。3.5 和 PDF 里共有 3 处错别字让语义颠倒。许可也混乱：6 个 skill 标 CC-BY-4.0，仓库许可却是 CC BY-NC-SA 4.0。

## 1 Supervisor-Skills

### 1.1 handbook（zh 为权威版；en 镜像 1,853 行，缺图和提示词）

| 篇 | 讲什么 | 阶段 | 形态 | 行/字 |
|---|---|---|---|---|
| 1.1 | 审稿人喜欢 4 点、讨厌 4 点 | 价值观 | 原则 | 27/1.0k |
| 2.1 | 6 类 idea 的生命周期 × 适合的学生；周时长门槛 | 选题 | 原则+表 | 30/1.5k |
| 2.2 | 更高、更快、更强、更省、更广五维切入点 | Idea | 框架 | 67/3.4k |
| 2.3 | 第一性原理、房间里的大象、技术周期、Hamming 清单 | Idea | 原则 | 41/2.5k |
| 3.1 | Why/What/How/So What；Running Example；消融 | 立项到写作 | 清单 | 61/3.0k |
| 3.2 | 引言六段 + flowchart | 引言 | 模型 | 37/1.3k |
| 3.3 | 技术论文填空表 | 写作规划 | 模板 | 114/3.3k |
| 3.4 | Benchmark 五要素、Intro 链、§2–7、清单 | Benchmark | 模板+清单 | 290/11.0k |
| 3.5 | 门槛、LaTeX、语法、AI 禁词、分节写法、修回模板 | 写作/排版/自审 | 清单（最密） | 627/15.0k |
| 4.1–4.4 | 绘图铁律、三类图范式、10 项自查 | 作图 | 原则+清单 | 196/7.1k |
| 5.1 | 6 条 AI 行为准则；Vibe Coding、Figure、Writing（李伯岩） | AI 协作 | 准则+技巧 | 510/12.9k |
| 5.2 | 5.1 的会议纪要，含 AI 生成的摘要 | 同上 | 纪要 | 156/4.9k |
| 6.1–6.3 | Alpha-SQL、AFlow、LEAD 引言逐段对照 | 引言 | 案例 | 248/18.6k |
| PDF | 选方向与选题、读论文、科研素质与大忌、师生关系、写作、被拒 | 选题/文献/元技能 | 幻灯片 | 70 页 |

### 1.2 skills

| skill | 触发 | 核心方法 | 产物 | hb | license | 行（SKILL/总） |
|---|---|---|---|---|---|---|
| idea-evaluator | 评估 idea、查新 | 先查致命缺陷 F1–F10，遇到 CRITICAL 直接出结论；再做能力匹配、五维打分（从 5 分起，只靠机制论证给的高分要附验证实验）、范式 4 问、可行性 | 三档结论 | 2.x | CC-BY-4.0 | 327/2,133 |
| deep-research | 综述 | 冻结研究问题，多视角检索，逐条核验引用，按 MECE 综合，过 6 道门 | 综述报告 | 2.1（主体为新增） | BY-NC-SA | 209/844 |
| vibe-research-workflow | 用 AI 做科研 | 6 条准则加工具表 | 工作流 | 5.x | CC-BY-4.0 | 198/957 |
| tech-paper-template | 动笔前 | 7 格模板，4 项自洽检查 | 骨架 | 3.1/3.3 | CC-BY-4.0 | 192/803 |
| intro-drafter | 写引言 | 六段作内部脚手架，做对齐检查，不编例子 | 正文 | 3.2 | BY-NC-SA | 211/1,201 |
| paper-writer | 写任意一节 | 6 条证据硬规则，红旗表，用子代理核验引用 | 正文+证据台账 | 3.x | BY-NC-SA | 284/1,319 |
| benchmark-paper-template | Benchmark 论文 | 五支柱审计，§2–7 骨架，清单 | 分阶段产出 | 3.4 | CC-BY-4.0 | 142/1,306 |
| paper-polish | 润色、中译英 | 改动不改原意，有改义风险的逐条标出；用词强度对齐证据强度 | 润色稿 | 3.5 | BY-NC-SA | 267/574 |
| figure-designer | 设计核心图 | 选范式，审计通用规则 | 8 段建议 | 4.x | CC-BY-4.0 | 207/840 |
| pre-submission-reviewer | 投稿前 | 先定范式，再查宏观逻辑（含归因和查新），以及语法、LaTeX、图、禁词 | 严重性清单 | 3.5/1.1 | CC-BY-4.0 | 326/1,076 |
| rebuttal-guidance（只在 UP） | 贴来审稿意见 | 把审稿意见分 9 类，匹配 6 种审稿人心态（基于约 1,000 条 review 的统计）和 10 个策略维度；只给指导，不写正文 | 逐条指导 | 无 | 未标 | 138/734（refs 为中文） |

### 1.3 元信息

- 定位：SS/README.md L7 写的是"炼化为你的 AI 副导师"。sk/README.md L48–61 有一张"卡在哪一环就用哪个 skill"的路由表，可以直接改成触发表。
- 安装：一句话 prompt，Codex 用 `$skill-installer`（llms.txt）。仓库目前没有 .claude-plugin。CHANGELOG 2.1.0 说"从来没有过"，但 2.0.0 和 2.0.1 的条目里都列了 .claude-plugin/，前后矛盾。
- Lint：CONTRIBUTING 写了规则，scripts/lint_skills.py 执行，CI 已接入。要求：SKILL.md ≤500 行、只用英文；description 40–80 词、第三人称、含 "Use when"；不用 em-dash；引用指针必须能解析、不许嵌套；超过 100 行的 reference 要有目录；共享 reference 必须逐字节一致（5 对）；不许出现 Claude/Anthropic 署名。本地跑过：11 个 skill 全部通过；RG 拷进 scratchpad 跑也通过，因为 CJK 检查只看 SKILL.md。
- 许可：CC BY-NC-SA 4.0，版权写作"© 2026 Yuyu Luo (methodology) and contributors"，v2.0.0 时由 CC BY 改来。hb 必须逐字保留，内容同步自 PhD.Skills。
- 漂移：README.en、llms.txt、CONTRIBUTING、sk/README 仍写"11 个"，CHANGELOG 没有 RG 的记录；TODO 里"Rebuttal 指南"和"合作指南"还没写。本地有两个 remote：origin 指向 HKUSTDial，internal 指向 JoeyWu-tech/Supervisor-Skills-internal。

## 2 本机其他技能

| 资产 | 出处 | 许可 | 规模 | 要点 |
|---|---|---|---|---|
| LS/prof-luo-bench-*（7 个） | 无 git，无署名；与 benchmark-paper-template references 的相似度 0.72–0.87（difflib），推断是它的前身 | 未标 | 1,285 行 | 已被 SS 覆盖，可以弃用 |
| LS/academic-research-skills | Imbad0202，Cheng-I Wu 版权，v2.8 | CC BY-NC 4.0 | 3.4 万行 | 多 agent 调研和写作；主编加魔鬼代言人审稿；Socratic mentor 每章 3–5 个必问问题；SCR 循环；6 维协作复盘。导师和复盘机制是 SS 没有的 |
| LS/PengSida-acadmeic-skill | 上游 Master-cai@77e7c2c，用户在 09-23 改写（主旨服务规则，删掉防御性写作） | MIT | 1,957 行 | ML 论文分节写作；与 paper-writer 有重叠 |
| LS/rebuttal | 改编自 RebuttalStudio 和 claude-scholar（SKILL.md L8） | MIT | 494 行 | 5 个阶段写出完整回复，与 RG 的定位相反 |
| LS/humanizer 和 humanizer-zh | humanizer 是 blader v2.5.1；-zh 是它的中文译本（op7418） | MIT | 805/723 行 | 与 paper-polish 去 AI 腔重叠 |
| LS/pdf-layout-review | 无署名（推断是用户自建） | 未标 | 194 行 | 渲染页面图检查排版，补上视觉层 |
| nature-skills 插件 | Yuan1z0825（袁一哲，上海交大）v1.0.0 | MIT | 9 个 skill，约 1.2 万行 | 面向期刊：作图、润色、引用、读论文、审稿回复、PPT |
| DB/doubao-academic-*（未安装） | 用户自有，是 v2.1 的田野版 | 未标 | 2,100 行 | paper-spine（中文 209 行）没有回流到 SS |

## 3 覆盖矩阵

| 阶段 | 资产 | 评级 | 缺口 |
|---|---|---|---|
| 选题 | hb 2.1、3.5 L5–11；PDF p7–22 | 中 | 3.5 L11 承诺"专门讲如何选题"，没有兑现 |
| 文献 | deep-research；nature-reader；PDF p23–25 | 工具强，知识弱 | hb 不讲怎么读论文 |
| Idea 评估 | hb 2.x；idea-evaluator | 强 | 无 |
| 实验设计 | hb 3.1、3.5 L481–505、3.4；FF F3/F6/F10 | 中 | Benchmark 论文覆盖强，技术论文薄弱 |
| 实验执行与分析 | hb 5.1；figure-designer 讲误差棒 | 弱 | hb 没有提到 seed、方差、置信区间和显著性；复现只在 3.5 L545、L560 和 4.3 L17 顺带一提 |
| 摘要与引言 | hb 3.2、3.5、6.x；intro-drafter；PengSida | 强 | 无 |
| 方法、实验、相关工作 | hb 3.5；paper-writer；tech-paper-template | 中 | 偏 DB 系统论文 |
| 结论与局限 | hb 3.5 L526–531 | 弱 | 局限性怎么写几乎没有 |
| 语言与去 AI 腔 | hb 3.5；paper-polish；humanizer | 强 | 规则互相冲突 |
| 作图 | hb 4.x；figure-designer；nature-figure | 强 | 无 |
| 排版 | hb 3.5；latex-rules；pdf-layout-review | 中 | 无 |
| 自审 | pre-submission-reviewer；academic-paper-reviewer | 强 | 无 |
| Rebuttal | hb 3.5 L580–627（只有修回模板）；RG；LS/rebuttal；nature-response | 中 | 三套资产的理念冲突 |
| 报告与组会 | 只有 PPT 工具 | 空 | 没有"怎么讲" |
| 读博元技能 | hb 1.1、2.1 L19；PDF p27–32、p69 | 弱 | 合作、沟通、心态 |

## 4 卡片样例

| # | 触发 | 卡片要点 | 出处 |
|---|---|---|---|
| 1 | 从技术出发找应用 | 说不出实践中遇到的真实失败案例，就是拿着解法找问题 | hb 2.2 L3；FF L77–81、L144–149 |
| 2 | 开始读一个新方向 | 先广度优先，只看 idea；方向定了再深度优先，复现，批判着读 | PDF p25 |
| 3 | 查到疑似撞车的论文 | 标题像不算撞车，要找差异轴；没搜到也不能证明是新的 | sk/idea-evaluator/SKILL.md L89–103 |
| 4 | 列 baseline | 先问最近三个月里最强的公开结果是什么；baseline 超过 12 个月就是红旗 | FF L42–45、L105–110 |
| 5 | 实验开跑前 | 说不出两种会失败的情形，就是过度宣称 | FF L83–87、L151–155 |
| 6 | 报告大幅提升 | 提升可能来自路由、后处理、更强的基座或样本挑选；没有消融把核心机制分离出来，就标"归因未验证" | sk/pre-submission-reviewer/SKILL.md L113–116 |
| 7 | 写贡献段 | 贡献写得空泛，或写的是本来就该做的事（如"大量实验证明有效"），而不是具体的主张。每条都要具体到删掉它论文主张就会改变，并注明章节 | sk/intro-drafter/references/contribution-patterns.md L26–30、L49–62、L82–95 |
| 8 | 写挑战段 | 写问题本身的难处，不写方法的难处 | hb 3.5 L374、L409 |
| 9 | 方法模块成形 | 查五种断链：挑战是编出来的、模块没有对应的挑战、贡献对不上模块、Key Idea 中途漂移、贡献没有回应局限 | sk/tech-paper-template/references/consistency-checks.md L152–166 |
| 10 | 初稿快完成 | 摘要动机、引言问题、gap、贡献、方法理由、首个发现、讨论首句，这七句连起来读，看能否连成"问题→缺口→方案→证据→回答" | DB/doubao-academic-polish/sub-skills/paper-spine/SKILL.md L84–100 |
| 11 | 稿中出现 prove、first | 用词强度跟证据强度对齐；写 first 之前先核实 | sk/paper-polish/SKILL.md L145–147；FP L110–111 |
| 12 | 写相关工作 | 不要把前人写成稻草人；审稿人可能就是原作者 | sk/paper-polish/SKILL.md L152–160；hb 3.5 L518–521；PDF p57 |
| 13 | 画实验图 | 图注第一句写结论；颜色和线型双重编码 | hb 4.3 L22–30 |
| 14 | agent 加引用 | 引用不能由 AI 生成或猜测 | hb 5.1 L25、L501 |
| 15 | 写 rebuttal | Question 用 2–3 句回答并给出处；承认局限后要说清缩小范围后结论仍成立；推给 future work 等于回避 | RG/references/checklist.md L18–40、strategy-dimensions.md L19 |

适合保留为长流程 skill 的：tech-paper-template、benchmark-paper-template、intro-drafter、paper-writer、deep-research、pre-submission-reviewer、RG。idea-evaluator 的流程保留，F1–F10 拆成卡片。vibe-research-workflow 整体拆成卡片。

## 5 质量风险

| 类型 | 问题 | 出处 |
|---|---|---|
| 过时 | 写死了年份："baseline 没有 2026 年的结果"就判为红旗 | FF L44、L109–110 |
| 过时 | 写死了型号和价格，如 Opus 4.6、Nano Banana Pro、20$/月、GPT-4o | hb 5.1 L94–104、L266；2.2 L43 |
| 过时 | 讲义是 2023 年的，例子用的是元宇宙 | PDF p12、p21 |
| 个人风格 | "性能至少提升 50%"；DB 领域的引用数门槛 | hb 3.5 L10、L23 |
| 个人风格 | "每天有效时间少于 5 小时就难发顶会" | hb 2.1 L19 |
| 个人风格 | 6 篇范例都在 Text-to-SQL、Agent、可视化方向（是否出自同一组为推断） | hb 3.4 L3；6.x |
| 与共识冲突 | 建议 Y 轴从 50–55% 起，但没有区分图的类型；柱状图的通行做法是从 0 起（未核实） | hb 4.3 L36–38 |
| 与共识冲突 | "严禁使用 AI 生成内容"，与 5.1 L19、paper-writer 以及会议政策都冲突（推断） | hb 3.5 L141 |
| 与共识冲突 | 把美式的引号内标点判为错误（推断）；把 em-dash 叫作"连字符" | hb 3.5 L143–166 |
| 与共识冲突 | 不讲统计严谨性，而 NeurIPS checklist 要求报告误差棒（推断） | hb 全书 |
| 自相矛盾 | reveal 在 L176 被禁用，在 L335 又被推荐 | hb 3.5 |
| 自相矛盾 | 禁止"先写中文稿再翻译"，但 paper-polish 提供中译英 | hb 3.5 L84；paper-polish L179 |
| 自相矛盾 | paper-polish 说命中禁词不一定要删；FP 规定同一词出现 3 次就算 MAJOR，而禁词里包括 yet | ai-tone-guardrails.md L7；FP L138 |
| 自相矛盾 | 一处说"完整重于简短"，另一处说"简洁优于面面俱到"（RG 这句只针对开放度低的审稿人） | LS/rebuttal L162；RG checklist L31 |
| 错误 | "切记包含不相关内容""切记拿老模型"两处都应为"切忌"（en 版改对了 L37，L373 却照错翻译）；PDF 里"严谨……复制"应为"严禁" | hb 3.5 L37、L554；PDF p57 |
| 错误 | 目录写 `responses/`，引用写 `\input{response/r1}`，两者不一致 | hb 3.5 L590、L610 |
| 错误 | em-dash 的反例被 linter 改成了逗号，反例和正例长得一样 | FP L17–27 |
| 错误 | RG 两个文件里的心态簇名称不一致；有一处写着"None%"；统计用的源数据没有发布；description 承诺的历史案例检索并没有实现 | RG mindset-matching-heuristics.md L17–26、mindset-library.md L5–10、L289 |
| 错误 | 数字无出处："引用错误率 40%" | LS/rebuttal L416 |
| 镜像缺失 | en 版 5.1 的图从 8 张变成 0 张，提示词那一节缺失；6.x 缺"关键插图"一节 | handbook-en |
| 重复 | 引言模型那一段在 3.3、6.1、6.2、6.3 的 L11 各抄了一遍；5.2 与 5.1 大量重复，含 AI 生成的摘要，还有转写错误（"Web Coding"、"SML Oral"） | hb；5.2 L34、L92、L136 |
| 标注 | 6 个 skill 标的 license 与仓库不符；8 处残留"(separate plugin)"；sk/README 把 benchmark-paper-template 对应到 6.3 LEAD，但 LEAD 是技术论文 | sk/*/SKILL.md；sk/README.md L136、L237 |

## 6 对设计的含义（推断）

1. 拆卡前先定裁决规则：§5 里冲突的条目，要么改写，要么标明适用范围。每张卡带出处、适用范围、强度三项，可核验性沿用 [inspection]/[attestation]/[user-attest] 三类标签（sk/idea-evaluator/SKILL.md L235–239）。
2. 空白处需要外部的顶级导师经验来补（对应讨论稿 1.2(2)），元技能可以先用 PDF 填。
3. 复盘可以参考 academic-research-skills 的 SCR 循环和 6 维评分。它用 BY-NC，按 CC 兼容表可以并入 BY-NC-SA。
4. 卡片如果沿用原文的表述，就算改编作品，必须用 CC BY-NC-SA（只提炼思想不受此限）；代码可以另选许可；MIT 资产要保留版权声明；prof-luo-bench 改用 SS 版本。
5. CONTRIBUTING 禁止 Claude 署名，这和本环境默认的 commit 署名冲突，需要用户拍板。
6. 继承之前先同步上游的 5 个 commit（代理不通，这次只用 gh api 读了上游）。

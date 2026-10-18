# B 线：学习/导师类 agent 插件全景、证据与理论

核查日 2026-10-15。★ 为当日 `gh api` 实测。〔推断〕是我的判断，其余都能在文末 [n] 原文查到。

## 0 五条结论

1. 编程侧"边干边学"已有官方形态。Claude Code 的 Learning 风格在设计决策点留 `TODO(human)`，等人写完再点评。ChatGPT、Gemini、Claude.ai 的学习模式都走"教学"路线：不直接给答案，以苏格拉底式提问为主，ChatGPT 和 Gemini 还会出题检查理解。Codex 未查到学习模式。
2. 科研侧最接近的是 ARS（52k★）：每个检查点给"协作深度"观察，收尾出 Process Record。但它评的是"你怎么用 AI"而非"你在课题里会了什么"，还打分定级，也不覆盖实验。
3. 其余高星科研项目里，人要么被替代，要么只负责审批，"学习"只沉淀在 agent 的记忆里。以"让人长本事"为主要定位的科研插件都在 500★ 以下（最高的是 oral-paper-skill，408★），也都没有做真人学习效果评估。
4. 伤害来自把答案和调试外包，而不是 AI 能用。护栏只能止损；学习者的自评不可信。"不限制 AI，事后给元认知镜像反馈"有 RCT 支持。博士生场景的 RCT 未查到。
5. 认知学徒制加 AAR 是正锚，刻意练习是弱锚（在职业领域只解释不到 1% 的方差）。是否滑向"上课"的判别式见 §3d。

## 1 全景

### 1a 官方"学习模式"

| 产品（时间） | 机制 | 让人学的设计 | 出处 |
|---|---|---|---|
| Claude Code **Learning** 风格（v1.0.81，2025-08 发布；v2.0.30 弃用，v2.0.32 恢复） | 内置 output style | 只在有真实分歧的地方（错误处理、数据结构、多种可行解的业务逻辑）写 `TODO(human)`，发出"Learn by Doing"卡片（Context / Your Task / Guidance），然后停下等人；人写完后，Claude 回一个 Insight 再继续。常规实现由 Claude 自己写 | [1][2] |
| 官方插件 learning-output-style 与 explanatory-output-style（2025-10/11） | SessionStart hook 注入 `additionalContext` | 每次只要人写 5–10 行；先建好文件、签名和 TODO，再发请求；原文要求 "Frame it as valuable input… not busy work"；样板代码和 CRUD 不要人写。`★ Insight` 每次 2–3 点，只讲本代码库特有的选择 | [3] |
| 宿主注入口 | Claude Code 插件可附带 output style，设 `force-for-plugin: true` 后自动生效；Codex 插件支持 lifecycle hooks | 无 | [1][4] |
| `/insights`、`/recap` | 读取本机会话记录 | 前者报告"你怎么用 Claude Code、哪里出错"，后者给一句话摘要，都不涉及领域学习 | [5] |
| ChatGPT **Study Mode**（2025-07-29） | 与教学专家合写的 custom system instructions。官方承认行为可能不一致，计划训练进模型，至今未查到已训入 | 五条行为：鼓励主动参与、管理认知负荷、培养元认知与自我反思、激发好奇、给可执行的反馈。形式上是苏格拉底提问、提示、分层回答、按水平个性化、quiz，可随时关闭 | [6] |
| Gemini **Guided Learning**（2025-08-06） | LearnLM | 先列学习计划，再逐步检查理解；不直接给作业答案；配图和视频；每个主题结尾做 recap。未公开效果数据 | [7][8] |
| Claude for Education **Learning mode**（2025-04；2025-08 全员开放） | Projects 内的风格 | 用 "How would you approach this problem?" 一类问题引导，讲核心概念，提供模板 | [9][10] |
| OpenAI **Codex** | 无 | 未查到学习模式。协作模式只有 `default` 和 `plan`；`personality` 已弃用 | [11] |

**社区编程类插件** [36]（tutor 类以外都不到 20★，均无效果评估）

| 仓库（★） | 机制 | 评价〔推断〕 |
|---|---|---|
| anti-deskilling（3）、deskilling-guard（1）、bloom_skills（6） | 关键决策处停下要理由，机械活不打扰；"flag once, then respect the answer"；先让人预测，首次失败先让人诊断，赶工时退让；用 `ledger.jsonl` 记账 | 最贴"不上课"，可借鉴 |
| socratic-skills（18）、think-before-code（14）、vibe-coding-learning（2） | 按 diff 逐题考人、一次只给一个提示、事后生成笔记和学习日历 | 偏考试或上课 |
| tutor-skills（1,351）、universal-diagnostic-tutor（246）、claude-tutors（153） | 把文档转成题库，或做诊断式家教 | 学的是内容本身，没嵌进工作 |

### 1b 科研领域

| 项目 | ★ | 一句话 | 人的角色 | 学习机制 |
|---|---|---|---|---|
| Imbad0202/academic-research-skills（ARS）及 -codex | 52,132 / 12,923 | 十阶段管线（research→write→review→revise→finalize），每阶段等人确认；"never runs experiments" | 作者兼把关人 | **有**，见 1c |
| karpathy/autoresearch | 97,943 | agent 通宵改代码、每 5 分钟训一轮，好的留下差的丢掉 | 只改 `program.md` | 无 |
| K-Dense-AI/scientific-agent-skills | 49,954 | 177 个科学 skill，"Turn any AI agent into an AI Scientist" | 委托人 | 无 |
| wanshuiyin/ARIS | 17,518 | 84 个 skill，跨模型评审，过夜跑实验 | 在 `AUTO_PROCEED` 检查点审批 | 无；research-wiki 是项目知识库，不针对人的成长 |
| SakanaAI/AI-Scientist / -v2 | 14,720 / 7,346 | 全自动出论文 | 被替代 | 无 |
| Orchestra-Research/AI-Research-SKILLs | 13,585 | 98 个 skill，"autonomously conduct AI research" | 发起人 | 无 |
| HKUDS/AI-Researcher | 5,814 | "Full Autonomy" | 被替代 | 无 |
| SamuelSchmidgall/AgentLaboratory | 5,903 | 端到端，有 copilot 模式 | 出想法兼监工 | 无 |
| HKUDS/DeepTutor | 41,434 | 独立学习平台：Quiz、Mastery Path、学习日志 | 学习者 | 有，上课式 |
| HKUSTDial/Supervisor-Skills | 9,691 | skills 加中英文 handbook | 作者 | SKILL.md 里没有学习或复盘环节（本地 grep） |
| jbhuang0604/awesome-tips | 4,769 | 人写的科研 tips 清单 | 读者 | 静态知识 |
| pedrohcgs/claude-code-my-workflow | 1,661 | 学者用的 Claude Code 模板，"contractor mode" | 审计者 | 只有 agent 侧的 MEMORY |
| econ-writing-skill / academic-writing-skills | 663 / 507 | 写作指南蒸馏 / 写完后润色 | 作者 | 隐式或无 |
| humanities-writing-companion | 446 | 12 种模式：苏格拉底式打磨 RQ、devil's advocate、revision coach | 作者 | 隐式：批评即教学 |
| oral-paper-skill | 408 | 从 883 篇 Oral 摘要蒸馏出做法 | 作者 | "学习复盘"：拿自己的论文对照范例 |
| research-paper-lifecycle-skills | 53 | 42 个 skill，"you stay the author" | 作者 | agent 侧 lessons |
| paper-tutor-skills | 43 | "AI 定位为导师与教练，而不是研究任务的执行者"；不代写、不跑实验 | 作者（AI 拒绝干活） | 检查点给选项和疑问句；留痕并披露 AI 使用 |
| craft-of-research | 34 | 苏格拉底式对话，产出 research memo | 作者 | 提问 |
| UniversePeak/Supervisor.skill、zjgxuzhou-prog/Claude-Research-Menntor | 52 / 10 | 前者把自家导师的决策风格蒸馏成 skill；后者提供 7 个 `/mentor_*` 审阅与诊断命令 | 学生 | 导师式点评，没有复盘或成长机制 |
| Lossfunk/ai-research-mentor（METIS） | 9 | 带本科生从 idea 到论文 | 学习者 | 只做了 LLM 评委评测（对 Claude Sonnet 4.5 胜 71%，对 GPT-5 胜 54%）；摘要中没有真人学习效果评估 |
| authentic-research-partners/research-mentor | 7 | 原文 "doesn't do your research for you"，面向中学生、本科生和业余研究者 | 学习者 | 提问工坊加进度评估；配套 arXiv 论文主张科研指导需要认知学徒制 |
| research-learning-loop / guanlan | 2 / 0 | 前者带读论文和复现（S0–S8，含主动回忆）；后者按过程轨迹决定沉默还是给提示 | 学习者 | 有，但是学习任务而非真实项目；guanlan 自述无效果证据 |

粗筛〔推断〕：kael-odin 日榜 116 个 ≥100★ 的学术 skill 中，按简介以"让人学"为定位的仅有 oral-paper-skill、teach-yourself-research（静态指南）和 Supervisor-Skills [12]。

### 1c 有没有人在做"科研过程中的导师式学习循环"？

**ARS 已做到** [13][14]：

- **检查点观察。** 2026-04-21 起，每个检查点附一段不阻塞流程的 Collaboration Depth 观察：Delegation、Vigilance、Reallocation 三项各打 0–10 分，归入 Zone 1–3，并给出 3 条"下一阶段可以加深的动作"，依据 Wang & Zhang 2026（IJETHE）。
- **收尾 Process Record。** 包括关键决策（引用用户原话）、Key Lessons、1–100 分的协作质量评估（6 个维度，含 Meta-Learning）、Human vs AI Value-Add 和 AI 自省。
- **Socratic Mentor。** 能识别意图，在探索阶段不自动收敛。

**ARS 没做到的**〔推断〕：

1. 反馈的对象是协作方式，不是课题里的研究判断、技术栈和要点。
2. 分数和 Zone 等级与用户否决过的"成长等级"同构，也违背 AAR 原文 "does not grade"。
3. 没有 fading，也没有跨项目的能力画像。
4. 本体不覆盖实验、代码和调参，而这些正是 vibe research 里最黑箱的环节。配套的 experiment-agent（205★）提供苏格拉底式实验设计，但 README 里没看到复盘机制。
5. 不把 agent 自己的研究决策摊开给人看，也不要求人先下判断。

编程侧的 Learning 风格做到了"决策点交还"，但粒度只到几行代码，也没有复盘和跨会话记忆。

**空白**〔推断〕：下面四点同时做到的项目未查到。

1. 嵌在真实科研流程里，包括实验和代码。
2. 在研究决策这一级（选 baseline、设计消融、解读负结果、回复审稿意见）把判断交还给人。
3. 在里程碑触发不打分的 AAR。
4. 跨会话逐步 fading。

## 2 证据

| 研究 | 样本与设计 | 主要发现 | 局限 | 启示 |
|---|---|---|---|---|
| Shen & Tamkin 2026（Anthropic）[15][16] | N=52，多为初级工程师，学新库 Trio；RCT，AI 组配 GPT-4o 助手（可直接给出完整解），之后做无 AI 测验 | AI 组均分 50%，手写组 67%（d=0.738，p=0.01）；AI 组没有显著提速。低分模式：全权委托、逐步依赖、让 AI 反复调试。高分模式：生成后追问、要代码时同时要解释、只问概念并自己修错 | 每种模式 n=2–7；即时测验；聊天助手而非 agent | 报错时先让人说假设，鼓励生成后追问 |
| Bastani et al. 2025，PNAS [17] | 土耳其近 1,000 名**高中生**；分 GPT Base、GPT Tutor（只给提示，内嵌教师解法）、无 AI 三组 | 练习成绩 +48%（Base）/ +127%（Tutor）；撤掉 AI 后 Base 考试 −17%；Tutor 的负效应 "largely mitigated" 但没有增益；学生自评没察觉 | 单校、短期 | 护栏只能止损；要看外部可观察信号。科研没有"标准解"可内嵌〔推断〕 |
| Kosmyna et al. 2025（MIT）[18][19] | 54 人（第 4 次只剩 18 人），分 LLM、搜索、纯脑三组写作文，测 EEG | 脑连接 LLM 组最弱；第 1 次写完后 LLM 组 83.3%（15/18）引不出自己刚写的句子，其他组为 11.1%；所有权感最低 | 仍是预印本；样本小；外部评论质疑 EEG 方法 | 只能当假设看。"不看稿复述要点"可作为不出题的检查〔推断〕 |
| Maier et al. 2026 [20] | 预注册，N=704，2×2 设计加无 AI 对照；AI 默认只给指导 | 每题后给三段陈述式反馈：你怎么用的助手、因此少练了什么、下一题注意什么。答案外包下降（OR=0.47），测验成绩上升（OR=1.51）；按努力计分的奖励无效 | 预印本；任务窄 | 支持"不限制 AI、事后照镜子"，相当于微型 AAR；积分奖惩无效 |
| Stadler et al. 2024，CHB [21] | 91 名大学生，ChatGPT 对 Google 做科学探究 | LLM 组心理负荷更低，但论证质量更差 | 样本小 | 调研时先让人写结论和理由，再对照 AI |
| Lee et al. CHI 2025 [22] | 319 名知识工作者自报 936 个案例，相关性研究 | 原文 "higher confidence in GenAI is associated with less critical thinking"；批判性思维转向信息核验、整合、task stewardship | 自报 | 这三项就是要培养的元技能 |
| Kestin et al. 2025，Sci Rep [23] | 哈佛物理课，N=194，交叉 RCT | 结构化 AI 导师的学习增益是主动学习课堂的两倍多；原文 "a system prompt could not reliably provide enough structure" | 上课场景 | 结构要放进 hook 和状态，不能只靠 prompt |
| Budzyń et al. 2025，Lancet GH [24] | 4 个中心的观察性研究 | 接触 AI 后，不用 AI 时的腺瘤检出率从 28.4% 降到 22.4% | 观察性 | 专家也会去技能化 |

**补充：**
- Fan et al. 2025 [25]：117 人，ChatGPT 组作文分最高但知识增益无差异（"metacognitive laziness"）。
- 生成效应约 0.40 SD [26]。
- Cabitza 2023 [27]：AI 先出结论时诊断准确率更高，但测的是准确率，不是学习。
- 社区常误引：The-Forge-Protocol 的 README 把 Bastani 的 −17% 写成 "Dell'Acqua… workers"，对 Cabitza 的转述也与原文摘要结论不符。

## 3 理论框架

### 3a 认知学徒制

出处：Collins, Brown & Newman 1989，载 Resnick 编《Knowing, Learning, and Instruction》pp. 453–494 [28]；Collins, Brown & Holum 1991，*American Educator* 15(3): 6–11, 38–46 [29]。

核心是让思维**双向**可见："The teacher's thinking must be made visible to the students and the student's thinking must be made visible to the teacher"。原文称这是认知学徒制与传统学徒制最重要的区别。

| 方法 | 原文定义（节选） | 插件映射〔推断〕 | 自然 / 滑向上课 |
|---|---|---|---|
| Modeling | 专家示范，"externalization of usually internal processes"，重点是 heuristics 和 control processes | 在真实决策岔口（选 baseline、放弃方向、对审稿意见让步），用 2–3 行讲清决策规则和被否掉的选项 | 自然；讲通用概念就成了上课 |
| Coaching | 观察学生做事，给提示和反馈，"immediately related to specific events" | 只评人亲手做的部分（假设、指标选择） | 人真动手时才自然；为了有东西可评而布置练习，就成了上课 |
| Scaffolding + Fading | 替学生做他暂时做不了的部分，前提是 "accurate diagnosis"；fading 即 "gradual removal of supports" | 其余活 agent 干，关键决策槽留给人（研究粒度的 TODO(human)）；从工作痕迹判断水平，按子技能悄悄放手 | 自然；诊断问卷、可见等级或进度条就成了上课 |
| Articulation | 让学生说出知识、推理和过程 | 高风险步骤前，人用一句话给出判断和理由，再由 agent 执行 | 少用才自然；每轮都问就是摩擦 |
| Reflection | 把自己的过程与专家或他人对比；配套做法 "abstracted replay"，即聚焦关键决策的过程回放 | 结果出来后，把人的预测、agent 的判断和实际结果并排，只标关键差异 | 自然；每日反思表就成了作业 |
| Exploration | fading 的终点，"fading in problem setting as well" | 逐步把 RQ 的框定交还给人 | fading 之后才自然；一上来就布置开放题，就成了上课 |

前三项是 "the core of cognitive apprenticeship"；articulation 和 reflection 让学生对自身策略获得 "conscious access"；exploration 指向自主。另有 Content、Sequencing、Sociology 三个维度。旁证：arXiv 2604.19961 认为科研指导 "calls for cognitive apprenticeship"。

### 3b After Action Review

- **条目。** TC 25-20（1993）只有三项：what was supposed to happen、what happened、why it happened and how to improve [30]。陆军 CAC 2013 版明确为四部分：应发生什么、实际发生什么、对在哪错在哪、下次怎么做 [31]。流行的"四问"措辞，在这两份文件里都没找到原样表述。
- **原则。** 事后立即做；全员参与，用开放式问题；原文 "An AAR is not a critique"、"does not grade success or failure"；由参与者自己发现，对事不对人。
- **证据。** 元分析（46 个样本，N=2,136）显示，复盘平均提升绩效约 25%（d=.67）[32]。成功和失败一起复盘，优于只复盘失败 [33]。
- **映射**〔推断〕：在里程碑触发，例如实验跑完、投稿或被拒、rebuttal 结束。人先说，agent 后补；成功也复盘；不打分。这是最自然、证据也最强的一环。

### 3c 刻意练习

- **定义。** Ericsson, Krampe & Tesch-Römer 1993（Psych Rev 100(3): 363–406）[34]：专为提高当前水平而设计、高度结构化的活动，"not inherently enjoyable"，需要即时反馈和重复。
- **工作不等于练习。** 原文明确，工作中出错代价高，"discourages learning"。常见的 "well-defined task""appropriate difficulty" 原文里没有。
- **解释力有限。** Macnamara 2014 元分析 [35]：刻意练习解释的方差，游戏 26%、音乐 21%、体育 18%、教育 4%、职业不到 1%。
- **映射**〔推断〕：最弱的一环。只借"即时反馈"，在科研自然重复的微技能上做"先预测、再揭晓"。专门设计练习、反复刷题就成了上课。

### 3d 不滑向"上课"的判别式〔推断〕

同时满足以下四条，才算"在工作里长本事"；破一条就开始像上课：

- (a) 对象是当前任务里的真实产物或决策；
- (b) 人的输入会改变结果；
- (c) 由工作事件触发，而不是按课程时钟；
- (d) 不显示分数或等级。

旁证：生成效应与测试效应（重读只增信心）支持"决策点让人先生成"；expertise reversal 提示 Insight 密度应随能力降低。

## 参考

[1] https://code.claude.com/docs/en/output-styles
[2] https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md （v1.0.81 / 2.0.30 / 2.0.32）
[3] https://github.com/anthropics/claude-code/tree/main/plugins/learning-output-style （同目录 explanatory-output-style；也见 anthropics/claude-plugins-official）
[4] https://github.com/DietrichGebert/ponytail （README：Codex 插件 + hooks 安装）
[5] https://code.claude.com/docs/en/commands
[6] https://openai.com/index/chatgpt-study-mode/ （403，经 Wayback 快照读取）
[7] https://blog.google/products/gemini/new-gemini-tools-students-august-2025/
[8] https://blog.google/products/gemini/guided-learning-google-gemini/
[9] https://www.anthropic.com/news/introducing-claude-for-education
[10] https://engadget.com/ai/anthropic-brings-claudes-learning-mode-to-regular-users-and-devs-170018471.html
[11] https://github.com/openai/codex （codex-rs/app-server-protocol/schema/typescript/ModeKind.ts、Personality.ts）
[12] https://github.com/kael-odin/awesome-academic-research-skills （data/rankings.csv）
[13] https://github.com/Imbad0202/academic-research-skills （academic-pipeline/agents/collaboration_depth_agent.md、references/process_summary_protocol.md）
[14] Wang & Zhang 2026, IJETHE 23:11, https://doi.org/10.1186/s41239-026-00585-x
[15] https://arxiv.org/abs/2601.20245
[16] https://www.anthropic.com/research/AI-assistance-coding-skills
[17] https://doi.org/10.1073/pnas.2422633122
[18] https://arxiv.org/abs/2506.08872
[19] https://arxiv.org/abs/2601.00856 （外部评论）
[20] https://arxiv.org/abs/2609.20143
[21] https://doi.org/10.1016/j.chb.2024.108386
[22] https://doi.org/10.1145/3706598.3713778
[23] https://doi.org/10.1038/s41598-025-97652-6
[24] https://doi.org/10.1016/S2468-1253(25)00133-5
[25] https://doi.org/10.1111/bjet.13544
[26] https://doi.org/10.3758/BF03193441
[27] https://doi.org/10.1016/j.artmed.2023.102506
[28] https://doi.org/10.4324/9781315044408-14
[29] https://www.aft.org/node/18441
[30] https://nick.groenen.me/attachments/public/gitignored/TC%2025-20%20A%20Leader's%20Guide%20to%20After-Action%20Reviews.pdf （非官方镜像）
[31] https://pinnacle-leaders.com/wp-content/uploads/2018/02/Leaders_Guide_to_AAR.pdf （镜像）
[32] https://pubmed.ncbi.nlm.nih.gov/23516804/
[33] https://pubmed.ncbi.nlm.nih.gov/16162059/
[34] https://graphics8.nytimes.com/images/blogs/freakonomics/pdf/DeliberatePractice(PsychologicalReview).pdf
[35] https://pubmed.ncbi.nlm.nih.gov/24986855/
[36] 正文中的简称对应以下 GitHub 全名：karabelaselias/anti-deskilling、CuriousPaul/deskilling-guard、sukiravenclaw/bloom_skills、rodbv/socratic-skills、Far-200/think-before-code、lyqqqq66666/vibe-coding-learning、bevibing/tutor-skills、SenmuuuuW/universal-diagnostic-tutor-skill、cdmorozov/claude-tutors、hanlulong/econ-writing-skill、bahayonghang/academic-writing-skills、tizzy916/humanities-writing-companion、Adkid-Zephyr/oral-paper-skill、ShaishavMaisuria/research-paper-lifecycle-skills、cabbage2000-lab/paper-tutor-skills、ctfysh/craft-of-research、ZhengyangZhang1107/research-learning-loop、chsn1024/guanlan-ai-apprenticeship、lorenzofamiglini/The-Forge-Protocol-Agent、Imbad0202/experiment-agent、zheng95z/teach-yourself-research；ARIS 的仓库名是 wanshuiyin/Auto-claude-code-research-in-sleep。论文：METIS 为 arXiv 2601.13075，Research Guide 为 arXiv 2604.19961。

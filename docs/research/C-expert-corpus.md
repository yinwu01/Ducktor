# C｜顶级导师经验语料：候选清单与逐条核实

核实日期 2026-10-15。核实方法：curl 测 HTTP 状态并抽正文、WebFetch、Crossref / DSpace API、`gh api`。本文只写实际读到的内容，推断处标"推断"，没读到正文的标 △。

## 0 结论

- 主表核实 49 条来源（#7 #8 #28 #37 各含同一作者的多份文档）。按主文档计：✓ 原址可读 40 条；⚠ 原址失效或反爬，改从存档、镜像或授权转载读到正文 5 条（另 #7 的 CVPR 一篇也是 ⚠）；△ 只核到书目元数据或二手摘要 4 条。
- 可以"全文收录"的只有 9 条：CC0、CC BY（#25 #26 #38 #39 #41）；CC BY-NC 或 BY-NC-SA（#20 #40 #46）；MIT（#27）。其余都是默认版权或明确受限，只能"自己的话转述 + 链接 + 极短引"。
- GitHub 上的合集适合当"链接索引上游"，**不建议整库 subtree**（理由见 §3）。
- 共识原则 8 条，可作硬标准；分歧 7 处，只能作流派呈现（见 §5）。

**图例**
- 阶段：选=选题/品味，读=读文献，想=想 idea，实=实验设计执行，调=调试分析，写=写作，图=作图，审=审稿与自审，驳=rebuttal，讲=做报告，元=读博元技能/与导师协作。
- 核实：✓ 原址 200 且读到正文；⚠ 经存档、镜像或转载读到正文；△ 正文未直读。
- 级别：F=可全文收录（须守许可条件）；Q=可短引；L=只链接+转述。
- ©：未见任何授权声明，按默认版权保留处理。

## 1 主表（核心原则均为转述）

### A 选题 / 品味 / 读博元技能

| # | 来源（作者·机构·年） | URL·核实 | 阶段 | 核心原则 | 许可 | 级 |
|---|---|---|---|---|---|---|
| 1 | Hamming《You and Your Research》·海军研究生院（前 Bell Labs）·1986-03-07 演讲，Kaiser 转录 | https://www.cs.virginia.edu/~robins/YouAndYourResearch.html ✓ | 选想元 | 心里常备 10–20 个"有攻击路径"的重要问题；每周留出"Great Thoughts"时间；容忍歧义；做完还要"卖"出去 | © | Q |
| 2 | Alon "How To Choose a Good Scientific Problem"·Weizmann·Mol Cell 2009 | https://doi.org/10.1016/j.molcel.2009.09.013 ⚠（Crossref 已核；cell.com 403，正文从第三方 PDF 读到） | 选元 | 新人 3 个月内不定题；在可行性×兴趣的帕累托前沿上按阶段取舍，新生先做易题；倾听"内在声音" | Elsevier 用户许可：只许非商业阅读，禁止再分发和改编 | L |
| 3 | Nielsen "Principles of Effective Research"·2004-07·自述为澳洲大学理论物理学者 | 原址 404；存档 https://web.archive.org/web/20260824165302/https://michaelnielsen.org/blog/principles-of-effective-research/ ⚠ | 选想元 | 主动、自我负责；区分"解题者"与"出题者"两套技能；刻意培养判断"什么重要"的品味 | © | Q |
| 4 | Schulman "An Opinionated Guide to ML Research"·OpenAI·2020-01（初稿 2017-12） | http://joschu.net/blog/opinionated-guide-ml-research.html ✓ | 选想实元 | 品味比技术更重要；推荐目标驱动；先问上限是 10% 还是 10x，增量方法必须极简；写研究笔记，少半途换题 | © | Q |
| 5 | Steinhardt "Research as a Stochastic Decision Process"·托管于 Stanford 旧页·页面未标年份 | https://cs.stanford.edu/~jsteinhardt/ResearchasaStochasticDecisionProcess.html ✓ | 实调 | 以最快速度降低不确定性，先做信息量最大的而非最容易的；区分 de-risk 与执行两种模式；尽早试着证伪自己 | © | Q |
| 6 | Karpathy "A Survival Guide to a PhD"·Stanford 博士回顾·2016-09 | http://karpathy.github.io/2016/09/07/phd/ ✓ | 选写讲元 | 品味可以习得；选题要雄心大，但要有攻击路径；动笔前定下"单一核心贡献"，避免流水账；内部截止日提前 2 周 | © | Q |
| 7 | Freeman "How to do research"（2013-03）＋"How to write a good CVPR submission"（2014-11）·MIT CSAIL | https://people.csail.mit.edu/billf/www/papers/doresearch.pdf ✓；CVPR 一篇官方原址未查到，镜像 https://www.cs.torontomu.ca/~wangcs/resources/How-to-write-a-good-CVPR-submission.pdf ⚠ | 实调写审 | 慢下来才能快，一次只改一个变量；把故障定位到具体步骤再汇报；先做最简 toy model；平庸论文约等于零，引言要开门见山讲清贡献 | © | Q |
| 8 | Durand 学生资源页（Do Good Research、写作/报告笔记、Peer review 2009、Rebuttal advice）·MIT CSAIL | https://people.csail.mit.edu/fredo/student.html ✓（页内多条是坏的 file:/// 链接，实际文件如 /fredo/rebuttal_advice.txt 已逐个验 200） | 选写讲审驳 | 好问题＝重要、可解、可评估、5–10 年后仍相关；尽快失败；rebuttal 简洁、按节可查、不复述批评、不挑拣好评，先打"重要且能赢"的点 | © | Q |
| 9 | Nagpal "The Awesomest 7-Year Postdoc"·SciAm 客座博客·2013-07-21·时任 Harvard（现 Princeton，据维基摘要） | https://www.scientificamerican.com/blog/guest-blog/the-awesomest-7-year-postdoc-or-how-i-learned-to-stop-worrying-and-love-the-tenure-track-faculty-life/ ✓ | 元 | 把 tenure-track 当成"7 年博后"；不再照单全收建议；建一个 feelgood 邮件夹；固定工时 | SciAm 保留所有权利 | Q |
| 10 | Schwartz "The importance of stupidity in scientific research"·UVA·J Cell Sci 2008 | https://doi.org/10.1242/jcs.033340 ✓（WebFetch 可读） | 元 | 研究面对的是没人知道答案的问题，"觉得自己笨"是常态；训练应教会学生与"不知道"共处 | © Company of Biologists | Q |
| 11 | Tao "Career advice"·个人博客·2007 起 | https://terrytao.wordpress.com/career-advice/ ✓ | 元读写 | 别过早执着于单一"大问题"；怀疑自己的工作，敢于扔掉；把做过的东西写下来并公开 | © | Q |
| 12 | Ruder "10 Tips for Research and a PhD"·2020-05 | https://www.ruder.io/10-tips-for-research-and-a-phd/ ✓ | 读选元 | 广泛阅读；同时推进两件事；有雄心；主动合作；发挥独特长处 | © | Q |
| 13 | Perez "Tips for Empirical Alignment Research"·AF·2024-02 | https://www.alignmentforum.org/posts/dZFpEdKyb9Bf4xYn7/tips-for-empirical-alignment-research ✓ | 实调元 | 评价权重 70% 放在"快速跑通想法"：最小实验、次日出结论、卡住就求助；只要学到东西的实验都算赢 | ©（页面未见 CC） | Q |
| 14 | Patterson "How to Have a Bad Career"·UC Berkeley·2001-11 | https://people.eecs.berkeley.edu/~pattrsn/talks/BadCareer.pdf ✓ | 选实写讲 | 反面清单体例。做有人在乎的真问题；做短项目，要失败就早点知道；方案从简；写论文按"提纲→段落图→草稿→朗读→找批评者"循环 | ©UCB | Q |
| 15 | Ousterhout "My Favorite Sayings"·Stanford·2021 更新 | https://web.stanford.edu/~ouster/cgi-bin/sayings.php ✓ | 调元 | 用直觉提问，不用直觉作答；不知道问题出在哪，就不算修好；"I don't know"反而建立可信度 | © | Q |
| 16 | Blum "Advice to a Beginning Graduate Student"·CMU·2001 | https://www.cs.cmu.edu/~mblum/research/pdf/grad.html ✓ | 读写元 | 书可以随机读，先读懂能读懂的部分；边读边写；写作：先有话说，说完就停 | © | Q |
| 17 | Chapman 编 "How to do Research At the MIT AI Lab"·1988-10 | https://dspace.mit.edu/handle/1721.1/41487 △（只读到元数据；PDF 被限流 429） | 读写元 | 据摘要：给出阅读、写作、编程的启发式，并谈方法论、选题、选导师和情绪 | 无权利声明 | L |
| 18 | Azuma "So long, and thanks for the Ph.D.!"·UNC·1997/2019 | https://www.cs.unc.edu/~azuma/hitch4.html ✓ | 元 | 没有好理由就读硕士；主动、韧性、灵活、人际、组织、沟通能力至关重要，而招生时通常不考察这些 | © | Q |
| 19 | Guo "The Ph.D. Grind"·Stanford 博士回忆录·2012-06 | 原址 pgbovine.net 不可达，且 Wayback 显示"已排除"；镜像 https://gwern.net/doc/www/pgbovine.net/46b64aae91f4bb1c96197ee956ab6e00b93fddbf.html ⚠ | 元 | 作者自称"单一数据点"，不宜泛化（正文未逐章读） | © All rights reserved（免费阅读不等于授权） | L |
| 20 | Might "The Illustrated Guide to a Ph.D."·Utah | https://matt.might.net/articles/phd-school-in-pictures/ ✓ | 元 | 读博就是把人类知识的边界往外推出一个小凸起；不要忘记大图景 | CC BY-NC 2.5（须链接回原页） | F |

### B 读文献 / 实验 / 调试

| # | 来源 | URL·核实 | 阶段 | 核心原则 | 许可 | 级 |
|---|---|---|---|---|---|---|
| 21 | Keshav "How to Read a Paper"·Waterloo·CCR 2007 | http://ccr.sigcomm.org/online/files/p83-keshavA.pdf ✓ | 读 | 三遍读法；第一遍回答 5C（类别、背景、正确性、贡献、清晰度） | ACM © | Q |
| 22 | Eisner 建议页（读论文；"Write the Paper First" 2010）·JHU | https://www.cs.jhu.edu/~jason/advice/ ✓ | 读写想 | 边读边记，用自己的话重述；投稿前先写论文，叙事是否清晰比实验是否齐全更决定录用 | ©（作者只明示"欢迎链接"） | L |
| 23 | Karpathy "A Recipe for Training Neural Networks"·2019-04 | http://karpathy.github.io/2019/04/25/recipe/ ✓ | 实调 | 训练会静默失败；吃透数据→端到端骨架＋傻基线→先过拟合→正则→调参 | © | Q |
| 24 | Lipton & Steinhardt "Troubling Trends in ML Scholarship"·2018（ACM Queue 2019） | https://arxiv.org/abs/1807.03341 ✓ | 写审实 | 四种通病：解释与猜测不分、不分离增益来源、"数学化"装饰、滥用术语 | arXiv 非独占许可 | Q |
| 25 | Godbole、Dahl、Gilmer、Shallue、Nado "Deep Learning Tuning Playbook"·Google Brain 与 Harvard·2023 | https://github.com/google-research/tuning_playbook ✓ | 实调 | 增量调参，每轮先定目标；多数时间用来获得洞见，而不是追分；有证据才采纳改动 | CC BY 4.0 | F |
| 26 | Kapoor & Narayanan "Leakage and the reproducibility crisis in ML-based science"·Princeton·Patterns 2023 | https://pmc.ncbi.nlm.nih.gov/articles/PMC10499856/ ✓ | 实审 | 把数据泄漏分成 8 类；用 model info sheet 逐项自查；其内战预测案例中，修正泄漏后复杂模型不再明显优于传统 LR | CC BY 4.0 | F |
| 27 | J.-B. Huang awesome-tips 中的 md 文件 | https://github.com/jbhuang0604/awesome-tips ✓ | 调写元 | 先想象成功，不兴奋就弃题；倒推法，假设上游完美、先测上限；相关工作要"关联"而不是罗列 | MIT | F |

### C 写作 / 作图

| # | 来源 | URL·核实 | 阶段 | 核心原则 | 许可 | 级 |
|---|---|---|---|---|---|---|
| 28 | Peyton Jones "How to write a great research paper"（另有 1993 年 Glasgow 的报告论文）·现 Epic Games | https://simon.peytonjones.org/great-research-paper/ ✓（MSR 旧页 403） | 写讲 | 七条建议：别等，先写；找准一个关键 idea；讲故事；钉死贡献；相关工作放后；读者优先；倾听读者 | ©；页面许可"注明归属即可改用幻灯片"（限自用） | Q |
| 29 | Widom "Tips for Writing Technical Papers"·Stanford·2006-01 | https://cs.stanford.edu/people/widom/paper-writing.html ✓ | 写 | 引言回答五问（问题、为何重要、为何难、为何没人解决、方法要点与局限）；用要点式贡献小结兼作导航 | © | Q |
| 30 | Knuth、Larrabee、Roberts "Mathematical Writing"·Stanford CS209·1987 | https://jmlr.csail.mit.edu/reviewing-papers/knuth_mathematical_writing.pdf ✓ | 写 | 公式之间用文字隔开；句首不放符号；同一个记号不表示两件事；重要定义换一种说法讲两遍 | © | Q |
| 31 | Steinhardt "Advice for Authors"·2017-02 | https://jsteinhardt.stat.berkeley.edu/blog/advice-for-authors ✓ | 写 | 局部文风对可读性的影响被低估；用词精确，用"准确率/速度"代替笼统的 performance；术语前后一致 | © | Q |
| 32 | Shewchuk "Three Sins of Authors"·Berkeley 托管·1997 | https://people.eecs.berkeley.edu/~jrs/sins.html ✓ | 写 | 三宗罪：用读者已知的背景开篇；引言末尾放"段落式目录"；"结论"节不下结论 | © | Q |
| 33 | Ernst "How to write a technical paper"·UW·2005（2024 更新） | https://homes.cs.washington.edu/~mernst/advice/write-technical-paper.html ✓ | 写图 | 认清核心信息并始终紧扣；让组织结构和结果一目了然；简洁 | © | Q |
| 34 | Gopen & Swan "The Science of Scientific Writing"·American Scientist 1990 | 原址 503（反爬，存档只抓到验证页）；授权重印本 https://www.usenix.org/sites/default/files/gopen_and_swan_science_of_scientific_writing.pdf ⚠ | 写 | 按读者期待写：主语紧跟谓语；新信息放在句末的强调位；句首放承接上文的旧信息 | © Sigma Xi | Q |
| 35 | Whitesides "Writing a Paper"·Harvard·Adv Mater 2004 | https://doi.org/10.1002/adma.200400767 △（Crossref 已核；Harvard 组页 403） | 写想 | 据二手摘要：研究一开始就用提纲组织论点和数据 | Wiley © | L |
| 36 | Nanda "Highly Opinionated Advice on How to Write ML Papers"·AF·2025-05 | https://www.alignmentforum.org/posts/eJGptPbbFPZGLpjsp/highly-opinionated-advice-on-how-to-write-ml-papers ✓ | 写实审 | 论文就是叙事：1–3 条新主张，加严格证据，加"为何重要"；对证据激进红队；告知而不是说服 | © | Q |
| 37 | Fatahalian：系统论文之美；Tips for Giving Clear Talks（2023-11）·Stanford | https://graphics.stanford.edu/~kayvonf/notes/systemspaper/ ✓；https://graphics.stanford.edu/~kayvonf/misc/cleartalktips.pdf ✓ | 写审讲 | 评估要证明是关键设计决策达成了目标；报告要讲听众"该知道却不知道"的最重要的事，而不是你做了什么 | © | Q |
| 38 | Mensh & Kording "Ten simple rules for structuring papers"·PLOS CB 2017 | https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1005619 ✓ | 写 | 全文围绕一个中心贡献，并写进标题；段落按"背景→内容→结论"组织；结果写成由图支撑的一串陈述 | CC BY 4.0 | F |
| 39 | Olah & Carter "Research Debt"·Google Brain·Distill 2017 | https://distill.pub/2017/research-debt/ ✓ | 写图元 | 糟糕的解释会累积成"研究债"；把东西讲清楚（提炼）本身就是研究劳动 | CC BY 4.0 | F |
| 40 | MIT EECS Comm Lab CommKit | https://mitcommlab.mit.edu/eecs/use-the-commkit/ ✓ | 写讲元 | 动笔前先规划受众、目标和目的；规划做得早，还能反过来指导实验设计 | CC BY-NC 4.0（除非另有说明） | F |
| 41 | Rougier、Droettboom、Bourne "Ten Simple Rules for Better Figures"·INRIA/NIH·2014 | https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003833 ✓ | 图 | 先定受众和要传达的信息；图注不可省；别相信默认设置；不误导读者；信息优先于美观 | CC0 | F |

### D 审稿 / rebuttal / 报告 / 中文

| # | 来源 | URL·核实 | 阶段 | 核心原则 | 许可 | 级 |
|---|---|---|---|---|---|---|
| 42 | Roscoe "Writing reviews for systems conferences"·ETH·2007-03 | https://people.inf.ethz.ch/troscoe/pubs/review-writing.pdf ✓ | 审 | 审稿意见同时是决策记录、给作者的反馈和给 PC 的沟通；先用自己的话概括贡献；语气建设性 | © | Q |
| 43 | A. J. Smith "The Task of the Referee"·Berkeley·IEEE Computer 1990 | https://www2.eecs.berkeley.edu/Pubs/TechRpts/1989/6154.html ✓ | 审 | 逐项评估目的、重要性、新颖性、正确性和表达；结论附理由和意见强度；不要因为违背成见就拒掉新工作 | IEEE © | Q |
| 44 | Daumé III "Two Reviewer Comments that Stuck with Me"·UMD·2008-12 | https://nlpers.blogspot.com/2008/12/two-reviewer-comments-that-stuck-with.html ✓ | 写审 | 别人的方法不必很差，你的方法才算好；判断贡献的标准是"同行会想知道这些结果" | © | Q |
| 45 | Parikh、Batra、Lee "How we write rebuttals"·Medium·2020（年份据搜索摘要） | https://deviparikh.medium.com/how-we-write-rebuttals-dc84742fece1 △（curl 和 WebFetch 均 403） | 驳 | 据二手摘要：透彻、直接、易跟读；要假设 AC 可能只读评审和 rebuttal | © | L |
| 46 | Winston "How to Speak"·MIT OCW·IAP 2018（含官方转录） | https://ocw.mit.edu/courses/res-tll-005-how-to-speak-january-iap-2018/ ✓ | 讲 | 开场给"赋能承诺"；绕着主题反复讲；给想法"筑篱笆"，与他人区分；结尾列贡献，不说"谢谢" | CC BY-NC-SA 4.0 | F |
| 47 | Hill "Oral Presentation Advice"·Wisconsin·1992/1997 | https://pages.cs.wisc.edu/~markhill/conference-talk.html ✓ | 讲 | 听众无法回读；只讲 1–3 个要点 | © | Q |
| 48 | 陈天奇《机器学习科研的十年》·2019-07 | 知乎原文 https://zhuanlan.zhihu.com/p/74249758（403）；量子位授权转载 https://www.qbitai.com/2019/07/5390.html ⚠ | 选写元 | 诚实的反馈收益最大；文章每节都用实验验证本节论点；选最让自己兴奋的问题 | © | Q |
| 49 | 施一公《优秀博士如何养成》·清华演讲 | 首发处未查到；转载 https://guan.nankai.edu.cn/2012/1012/c12487a134082/page.htm △ | 元调 | 时间投入是必要条件；要转向批判性分析；正确分析负面结果是成功的关键 | © | L |

## 2 备选与线索（未展开核读）

- Schulzrinne "Writing Technical Articles"：https://www.cs.columbia.edu/~hgs/etc/writing-style.html（200）。
- Hertzman：https://www.dgp.toronto.edu/~hertzman/advice/（200）。
- Leone 合集：https://www.cs.cmu.edu/~mleone/how-to.html（200，CMU 经典链接索引，链有 Levin & Redell、van Leunen & Lipton 等）。
- 顺带核实：Supervisor-Skills handbook 2.3 引用 Hamming"10 到 20 个重要问题"，转录稿原句确实存在，引用正确。

## 3 现成合集（★ 为 2026-10-15 `gh api` 实测）

| 仓库 | ★ | 组织方式 | 许可 / 贡献者 | 能否作上游 |
|---|---|---|---|---|
| jbhuang0604/awesome-tips | 4,769 | 按主题分类；多数条目链到作者在 X/Bluesky 的线程，另有 5 个专题 md | MIT（© Jia-Bin Huang）/1 人 | md 文件可收录；推文只能链接 |
| pliang279/awesome-phd-advice | 2,199 | 分申请、在读（读/写/审/讲）、回忆录 | MIT/4 人 | 可作索引 |
| shaily99/advice | 2,562 | 研究部分含 ideas、writing、reviewing、rebutting | MIT/7 人 | 可作索引 |
| poloclub/awesome-grad-school | 494 | 含 rebuttal（分 AI/ML 与 HCI）、审稿、新颖性；有 LinkChecker CI | MIT/9 人，约 195 commits | 最适合当链接上游 |
| noise-lab/research-course（Feamster & Gray） | 148 | 一学期课程：大纲、阅读、幻灯片、练习 | **CC BY-NC-SA 4.0**，与 S-S 同许可 | 唯一可以直接 remix 的课程级上游 |
| LAMDA-NeSy/Research-Starter-Kit（郭兰哲，南大） | 6,924 | 中文科研入门手册 | 无 LICENSE | 只能链接（同生态位） |
| MLNLP-World/Paper-Writing-Tips | 4,676 | 中文投稿细节 | 无 LICENSE；README 称内容来自个人经验与互联网数据 | 只能链接 |
| hzwer/WritingAIPaper | 4,114 | 中文 AI 会议写作手册 | 无 LICENSE | 只能链接 |
| guanyingc/latex_paper_writing_tips | 3,837 | LaTeX 写作技巧 | 无 LICENSE | 只能链接 |

**subtree 评估**
- 许可层面：MIT 和 BY-NC-SA 仓库允许 subtree；无 LICENSE 的仓库不允许，因为 subtree 等于复制后再分发。
- 好处：保留原作者的 commit 历史；可以用 `subtree pull` 同步。
- 弊端：
  1. 这些仓库的主体是外链，被链接的内容并不随 MIT 授权；
  2. 一个仓库里混入多种许可，需要目录级 LICENSE 和 NOTICE；
  3. awesome-tips 只有 1 位贡献者，"保留贡献者"的收益几乎为零；
  4. 我们需要的是原则卡片，导进来的链接列表还得重写一遍。
- 建议：不做整库 subtree。改用 `sources.yaml` 记录"上游仓库@commit＋条目 URL"，CI 定期做 link-check。少量可收录的 md 按单文件 vendoring，附原 LICENSE 和来源 commit。只有 noise-lab 课程（同许可、体量合适）值得考虑 subtree。

## 4 语料怎样合法、可溯源地进入插件

1. **按级别入库。**
   - F 级：可以收录或改编，保留署名、许可链接和改动说明。BY-NC-SA 来源（#46、noise-lab）只能放进同许可的目录。
   - Q 级：一张原则卡＝自己的话转述（每条≤80 字）＋原链接＋存档链接＋最多 2 处短引。短引上限建议英文≤25 词、中文≤40 字。不要照搬原文的清单结构，例如 Knuth 的 27 条、SPJ 的七条，不能连编号带措辞整体复制。
   - L 级：只放链接和一句指向，不引用。△ 条目不能作为硬标准的依据。
2. **理由。**
   - 思想和方法不受版权保护，受保护的是表达（美国 17 USC §102(b)；中国著作权法同样只保护表达）。
   - 短引依赖美国的合理使用四要素和中国《著作权法》第 24 条的"适当引用"：必须注明出处；按实务通说，引文不能构成新作品的主要或实质部分。系统性地堆积短引，整体上可能变成"实质性部分"。
3. **ShareAlike 的传染方向。**
   - 凡是改编自 Supervisor-Skills 的文本，必须以 BY-NC-SA 4.0 发布。
   - CC0、BY、BY-NC、MIT 的材料可以并入 BY-NC-SA；反过来不行。
   - 插件代码如果用 MIT 或 Apache，语料、技能文本和提示词必须放在独立目录并单独声明 BY-NC-SA，不要把改编文本嵌进代码文件。
   - NC 条款禁止商业使用。插件能否被企业团队采用，是发布前需要拍板的事。
4. **溯源字段。** 每张卡片记录：source_id、作者、写作时的机构、年份、url、archive_url（入库时主动存一份 Wayback）、accessed_at、许可、级别、核实状态、带出处位置的短引、转述文本、principle_ids。
5. **CI 校验。** 检查转述与原文的 n-gram 重叠，连续 12 个以上相同的词就报警。原文快照不进仓库，只存哈希。
6. 以上不是法律意见，正式发布前请学校的法务或开源办公室确认。

## 5 共识与分歧

**共识（至少 3 个独立来源，可作硬标准）**

| 编号 | 原则 | 支持来源 |
|---|---|---|
| H1 | 动手、动笔之前，先写出 1–3 条可检验的核心主张或贡献 | #6 #22 #28 #29 #36 #38 #40（#35 为 △） |
| H2 | 选题看重要性 × 可行性，必须有攻击路径 | #1 #2 #4 #6 #8 #14 |
| H3 | 以最快速度降低不确定性：最小实验、toy model、先过拟合、尽早失败 | #5 #7 #8 #13 #14 #23 #27 |
| H4 | 证据先于叙事：自我证伪、分离增益来源、写明局限、不夸大 | #5 #7 #11 #24 #26 #29 #36 |
| H5 | 读者优先，把话讲清楚本身就是贡献 | #1 #8 #28 #30 #31 #34 #38 #39 #48 |
| H6 | 报告少而精：1–3 个要点、反复强调、结尾给贡献 | #8 #28 #37 #46 #47 |
| H7 | 尽早、频繁地获取外部反馈：内部截止日、彩排、找批评者、别躲着导师 | #6 #7 #13 #14 #27 #36 #38 #48 |
| H8 | 审稿和 rebuttal 对事不对人：先概括贡献，保持建设性；rebuttal 被问到信息就直接给 | #8 #27 #42 #43 #44（#45 为 △） |

**分歧（只能作"流派"呈现，并标注适用条件）**

| 编号 | 议题 | 立场 A | 立场 B |
|---|---|---|---|
| D1 | 定题节奏 | Alon #2：3 个月内不定题 | Perez #13：今天讨论，明天出结果（湿实验与 LLM 实证的领域差异） |
| D2 | 何时追求雄心 | Karpathy、Schulman、Ruder：要有雄心，追求 10x | Alon：新生先做易题拿正反馈；Tao：别过早执着于大问题 |
| D3 | 增量工作 | Karpathy："incremental"是最坏的评价 | Schulman：服务于大目标且足够简单的增量有用；Patterson：只在少数点上创新 |
| D4 | 读文献的时机 | Hamming：问题想清楚之前先别看答案，读文献主要是为了找问题 | Ruder：广泛阅读；Freeman：别对大量相关文献一无所知 |
| D5 | 速度与谨慎 | Perez：强烈偏向速度，追求高实验吞吐 | Freeman：慢下来才能快，一次只改一个变量 |
| D6 | 论文结构惯例 | Shewchuk：不要段落式目录，不要空洞的结论 | Widom：贡献小结兼作导航，保留简短结论；Steinhardt：可以打破全局结构 |
| D7 | 选题依据 | Schulman：目标驱动 | Alon：听从内在声音，追求自我表达 |

**元分歧**：Nagpal 说自己"停止照单全收建议"，Tao 声明他的建议很泛化，Guo 自称"单一数据点"。所以插件呈现任何条目时，都应附上适用前提（领域、阶段）。

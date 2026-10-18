# 三个科研流程型 agent 项目：输入与输出核实

核查日 2026-10-15，星数为当日 `gh api` 实测。正文均出自当日仓库原文，关键句附摘录；摘录逐字照抄，"…"表示截短，〔〕内是仓库路径。本文没有需要标〔推断〕的结论，未核实处直接写明。

| | ARS | autoresearch | ARIS |
|---|---|---|---|
| ★ | 52,300 | 97,987 | 17,551 |
| 形态 | 命令或自然语言触发；`/ars-full` 为十阶段流程 | 一句话启动的无限循环 | 命令触发；`/research-pipeline` 串成整条流程 |
| 科研阶段 | 选题到定稿，不含实验 | 训练代码已能跑，改架构、调参 | 找 idea、跑实验、自动审稿改稿、写论文 |
| 人的角色 | 作者，每阶段把关 | 写 `program.md`，开跑前确认一次 | 默认不打扰；打开开关才停下审批 |

## 1 ARS（Imbad0202/academic-research-skills）

**是什么**：Claude Code 学术研究插件，覆盖从调研到定稿；52,300★，v3.23.0。

**形态**：16 个 `/ars-*` 命令，也认自然语言；SessionStart hook 每次开会话注入命令清单和路由规则。`/ars-full` 跑十阶段（A7）。

**阶段与输入**：一句话课题从 Stage 1 进；带初稿从 2.5 进，带审稿意见从 4 进。

**停不停**：每阶段结束都停下等确认，开跑前还要确认 token 预算（A1）。Stage 1 后要答"论文是否报告你自己跑的实验"。普通检查点附一段不阻塞的"协作深度"观察：Zone、三项 0–10 分、下阶段可试的做法（A2）。2.5、4.5 完整性门不附观察，也不能跳过。连续回 continue 会降成一行的 SLIM，满 4 次强制插回完整检查点。

**产出**：论文 MD，按需加 DOCX、PDF、.tex；跑到 Stage 6 才有过程记录 `paper_creation_process.md`，这一步可拒绝，格式见 A3、A4。

**人的角色**：作者兼把关人。Socratic Mentor 先复述肯定，再问一两个问题，默认不替你提研究问题（A5，含最短示例）。明确不跑实验（A6）。

### ARS 原文摘录

**A0 16 个命令（插件 SessionStart hook 注入会话的原文）**

````text
〔scripts/announce-ars-loaded.sh〕
Slash commands (16) — light modes pin sonnet in frontmatter; the three heavy modes and /ars-citation-check inherit the session model (the v3.7.0 opus floor was retired in the 2026-06 harness pass):
  /ars-full              inherit Full pipeline (research → write → review → revise → finalize)
  /ars-revision-coach    inherit Parse reviewer comments → Revision Roadmap + Response Letter skeleton
  /ars-reviewer          inherit academic-paper-reviewer full mode — simulated peer-review panel
  /ars-plan              sonnet  Socratic chapter-by-chapter planning
  /ars-outline           sonnet  Detailed outline + evidence map (no full draft)
  /ars-revision          sonnet  Revised draft + R&R responses
  /ars-rebuttal-audit    sonnet  QA an existing rebuttal draft against reviewer comments (advisory)
  /ars-abstract          sonnet  Bilingual abstract + keywords
  /ars-lit-review        sonnet  Annotated bibliography in paper format
  /ars-3w                sonnet  WHY / HOW / WHAT three-way paper scan (lighter than lit-review)
  /ars-format-convert    sonnet  Convert paper between LaTeX / DOCX / PDF / Markdown
  /ars-citation-check    inherit Citation error report
  /ars-disclosure        sonnet  venue status bundle / policy-anchor render
  /ars-mark-read         sonnet  Record human-read signal for one or more citation keys
  /ars-unmark-read       sonnet  Rescind a prior human-read mark for one or more citation keys
  /ars-cache-invalidate  sonnet  Drop cached verification rows for one or more citation keys
````

**A1 每阶段必停；各检查点的决策**

````text
〔README.md〕
> **AI is your copilot, not the pilot.** It can draft text, including a whole paper in full mode, but the decisions stay yours, and the pipeline stops for your confirmation at every stage. …
…
〔academic-pipeline/SKILL.md〕
⚠️ **IRON RULE — Core rule: After each stage completion, the system must proactively prompt the user and wait for confirmation. The checkpoint presentation adapts based on context and user engagement.**
…
〔academic-pipeline/SKILL.md〕
At pipeline start, estimate token cost based on paper length, mode, and cross-model toggle. Present estimate and ask for user confirmation before Stage 1 begins.
…
〔README.md〕
**Stage 1 intake declaration (#260, #925)**: at the checkpoint after Stage 1, or on entry when a run starts after Stage 1, ARS asks you whether the paper reports experiments or data analyses you ran yourself, and records your answer, in your words, in a fail-closed `experiment_intake_declaration` on the Material Passport. …
…
〔docs/ARCHITECTURE.md §1〕
**Decision-heavy checkpoints** — the user chooses a branch or accepts a material decision:

| # | Stage | What the user decides |
|---|---|---|
| 🧑 1 | 1. RESEARCH | RQ Brief + Methodology Blueprint |
| 🧑 2 | 2. WRITE | Outline approval before drafting |
| 🧑 3 | 3. REVIEW | Editorial decision (Accept / Minor / Major / Reject) |
| 🧑 4 | 3 → 4 Revision Coaching | Revision strategy (up to 8 Socratic rounds; user can skip) |
| 🧑 5 | 4. REVISE | Revision changes confirmed |
| 🧑 6 | 3'. RE-REVIEW | Verification-review decision |
| 🧑 7 | 3' → 4' Residual Coaching | Residual-issue trade-offs (up to 5 Socratic rounds; user can skip) |
| 🧑 8 | 4'. RE-REVISE | Content frozen — no further review loop |
| 🧑 9 | 5. FINALIZE | Output format selection (MD / DOCX / LaTeX / PDF) |
| 🧑 10 | 6. PROCESS SUMMARY | Language confirmation + collaboration quality review |
…
〔docs/ARCHITECTURE.md §1（2.5 / 4.5 完整性门）〕
| # | Stage | What runs | What the user acknowledges |
|---|---|---|---|
| ✓ 1 | 2.5 INTEGRITY | 7-mode failure checklist (see §3 for exact taxonomy) | Integrity Report PASS/FAIL + any SUSPECTED flags |
| ✓ 2 | 4.5 FINAL INTEGRITY | Deep Mode 2 check, zero-tolerance | Final Integrity Report PASS + populated Material Passport |
…
〔academic-pipeline/SKILL.md〕
4. **SLIM mode**: If the user says "just continue" or "fully automatic," subsequent non-critical checkpoints switch to SLIM format (one-line status + explicit continue/pause prompt)
5. **Awareness guard**: After 4+ consecutive continue responses, the system inserts a FULL checkpoint regardless of stage type to ensure user remains engaged
````

**A2 检查点画面（FULL / SLIM / MANDATORY 模板）**

````text
〔academic-pipeline/agents/pipeline_orchestrator_agent.md〕
━━━ Stage [X] [Name] Complete ━━━

Metrics:
- Word count: [N] (target: [T] +/-10%; ceiling: [C] if set)    [OK/OVER/UNDER — OVER whenever N > C]
- References: [N] (min: [M])              [OK/LOW]
- Coverage: [N]/[T] sections drafted       [COMPLETE/PARTIAL]
- Criterion status: [named criterion + evidence-anchored categorical judgement, or `NOT_COMPARABLE`]

Deliverables:
- [Material 1]
- [Material 2]

Flagged: [any issues detected, or "None"]

Collaboration Depth (advisory, Wang & Zhang 2026 — never blocks):
  Zone: [Zone 1 | Zone 2 | Zone 3]
  Delegation Intensity: [N]/10   Cognitive Vigilance: [N]/10   Cognitive Reallocation: [N]/10
  Depth-deepening moves you could try next stage:
  - [specific, actionable, rubric-grounded]
  - [specific, actionable, rubric-grounded]
  Full rubric: shared/collaboration_depth_rubric.md

Next step: Stage [Y] [Name]
Purpose: [One-sentence description]

Ready to proceed to Stage [Y]? You can also:
1. View progress (say "status")
2. Adjust settings
3. Pause pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
…
〔同上〕
━━━ [OK] Stage [X] [Name] -> Stage [Y] [Name] ready ━━━
Collaboration Depth (advisory): Zone [1|2|3] · DI [N] / CV [N] / CR [N] · rubric: shared/collaboration_depth_rubric.md
Reply `continue` to proceed or `pause` to stop here.
…
〔同上〕
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[MANDATORY] Stage [X] [Name] Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verification result: [PASS / PASS WITH NOTES / FAIL]

- Reference verification: [X/X] passed
…
〔同上〕
Flagged: [issues requiring attention, and each 7-mode failure checklist mode that blocks or warns; a blocking mode needs confirm / override with reasoning / revise, per `../references/ai_research_failure_modes.md`]

Next step: Stage [Y] [Name]

This checkpoint requires your explicit confirmation.
Continue?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
````

**A3 过程记录格式（现行协议）**

````text
〔README.md〕
> Pipeline ends with **Stage 6: Process Summary** — auto-generates a paper creation process record with 6-dimension Collaboration Quality Evaluation (1–100 scoring).
…
〔academic-pipeline/references/process_summary_protocol.md〕
2b. Dispatch collaboration_depth_agent in whole-pipeline mode (range = all
   stages, v3.5); its advisory report becomes the "Collaboration Depth
   Trajectory" chapter of the Process Record — this dispatch happens BEFORE
   record generation so the chapter is inside the record the user acknowledges
…
〔同上〕
| Section | Content |
|---------|---------|
| Paper Information | Title, final deliverables list |
| Stage-by-Stage Process | Input/output/key decisions for each stage, with verbatim user quotes |
| Iteration Details | Review comment summaries, revision items, re-review results |
| Interaction Pattern Summary | User role, Claude role, intervention count, key turning points — statistics table |
| User Key Decisions | Chronological list of every important decision made by the user |
| Key Lessons | Reusable lessons learned from the process |
| **Collaboration Quality Evaluation** | **Final chapter: 1-100 score + dimensional analysis + improvement suggestions** (see below) |
…
〔同上〕
+--------------------------------------------------+
|  Collaboration Quality Score: [XX]/100            |
+--------------------------------------------------+
|                                                   |
|  Direction Setting          [----------  ] XX     |
|  Clarity, timing, scope definition                |
|                                                   |
|  Intellectual Contribution  [------------ ] XX    |
|  Insight depth, original questions, concept        |
|  challenges                                       |
|                                                   |
|  Quality Gatekeeping        [---------   ] XX     |
|  Visual inspection, formatting requirements,       |
|  quality standards                                |
|                                                   |
|  Iteration Discipline       [----------  ] XX     |
|  Timely direction correction, willingness to       |
|  re-run pipeline, refusing to settle              |
|                                                   |
|  Delegation Efficiency      [-------     ] XX     |
|  When to intervene/when to let go, instruction     |
|  precision, checkpoint efficiency                 |
|                                                   |
|  Meta-Learning              [------------ ] XX    |
|  Feeding experience back to skills, requesting     |
|  lesson recording, process improvement awareness  |
|                                                   |
+--------------------------------------------------+
…
〔同上〕
| Score Range | Meaning |
|------------|---------|
| 90-100 | Exceptional — User intervention significantly elevated the paper's intellectual quality beyond what AI could produce independently |
| 75-89 | Excellent — User made correct directional decisions and effectively leveraged the pipeline's iteration capabilities |
| 60-74 | Good — User completed necessary decisions but some opportunities were missed |
| 40-59 | Basic — User primarily served as a "continue" button with little substantive intervention |
| 1-39 | Needs Improvement — User intervention may have disrupted the workflow or lacked critical quality gatekeeping |
…
〔同上〕
1. **Overall Score**: Total score + one-sentence evaluation
2. **What Worked Well**: 2-4 specific behaviors, with verbatim user quotes
3. **Missed Opportunities**: 1-3 things the user could have done but didn't
4. **Recommendations for Next Time**: 3-5 specific, actionable improvement suggestions
5. **Human vs AI Value-Add**: Clearly identify which aspects of the final paper quality came from user intervention (not achievable by AI independently)
…
〔同上〕
The second-to-last chapter of the process record is an "AI Self-Reflection Report" that honestly documents AI's own behavioral patterns during the pipeline. This complements the Collaboration Quality Evaluation (which assesses the user) by assessing the AI.
…
〔同上〕
- **Filename**: `paper_creation_process.md` (Chinese) / `paper_creation_process_en.md` (English)
- **PDF** (when asked for): `paper_creation_process_zh.pdf` / `paper_creation_process_en.pdf`
````

**A4 过程记录实例（2026-03 v2.3 实跑；pdftotext -layout 抽取，空白为排版所致）**

````text
〔examples/showcase/paper_creation_process_en.pdf〕
1.12     The User’s Key Decision Moments
   1. Setting direction: Agentic AI + student learning outcomes + paradigm shift
   2. Expanding scope: Added “next cycle of institutional accreditation” policy dimension
   3. Quality requirements: PDF must be compiled from LaTeX; format must comply with
      APA 7.0
   4. Authorship decision: Removed human author; AI as primary author
   5. Tone refinement: Chinese version must use Taiwan’s academic register
   6. Intellectual deepening: Raised “Will the definition of learning itself change?” → the
      co-evolution perspective (the paper’s most original contribution)
   7. Process choice: Re-ran the full pipeline after revision
…
〔同上〕
1.13     Key Lessons
   1. The most valuable human contribution is not writing but questioning — A single
      question from the user (“Will the definition of learning change?”) gave birth to the paper’s
      most profound chapter
   2. Iterative pipeline outperforms one-shot generation — Two rounds of 10 review reports
      identified and corrected 13+ issues
   3. Visual inspection is indispensable — The user’s PDF screenshot revealed formatting
      issues that text-based checks missed
   4. Chinese academic writing is rewriting, not translation — Literal translation of aca-
      demic text sounds unnatural; domain-specific register must be applied
…
〔同上〕
1.14.1 Overall Score

┌────────────────────────────────────────────┐
│ Collaboration Quality Score: 87/100                         │
│ "Direction Leader + Intellectual Catalyst" │
├────────────────────────────────────────────┤
│                                                             │
│ Direction Setting                    [████████░] 88         │
│ Clarity, timing, scope definition                           │
│                                                             │
│ Intellectual Contribution [██████████] 95                   │
│ Depth of insight, original questioning,                     │
│ conceptual challenge                                        │
│                                                             │
│ Quality Gatekeeping                  [████████░░] 82        │
│ Visual inspection, format requirements,                     │
│ quality standards                                           │
│                                                             │
│ Iteration Discipline                 [█████████░] 90        │
│ Willingness to redirect, re-run pipeline,                   │
│ refusal to settle                                           │
│                                                             │
│ Delegation Efficiency                [███████░░░] 72        │
│ When to intervene vs. let go, instruction                   │
│ precision, checkpoint efficiency                            │
│                                                             │
│ Meta-Learning                        [██████████] 92        │
│ Feeding experience back into skills,                        │
│ requesting lesson capture, process                          │
│ improvement awareness                                       │
│                                                             │
└────────────────────────────────────────────┘

One-line verdict: The user demonstrated a rare “intellectual catalyst” role — rather than pas-
sively awaiting AI output, a single pivotal question (“The definition of learning itself is also
changing”) fundamentally transformed the paper’s theoretical depth, a contribution AI could
not have achieved independently.
…
〔同上〕
1.14.3 Missed Opportunities

   1. Shallow checkpoint engagement: At most Stage completion checkpoints, the user’s re-
      sponse was “continue” or “1” (selecting an option). While this improved efficiency, it
      also meant some adjustable moments were passed over. For example, when Stage 3’s
      simulated review conclusions arrived, the user could have challenged specific reviewer
      recommendations or provided additional context — this is genuine academic dialogue,
      not just accepting all revision suggestions.
````

**A5 Socratic Mentor 怎么问；最短示例（你输入 → 你看到，仓库示例文件原文；是否为实录未核实）**

````text
〔deep-research/agents/socratic_mentor_agent.md〕
1. **No direct conclusions while non-generation Socratic mode is active**: Guide users to derive answers themselves through questions, even when you already know the answer. After the explicit candidate-generation exit marker, this rule no longer governs that one clearly labeled output.
2. **Response structure**: First acknowledge the user's thinking (1-2 sentences of affirmation or restatement) → Then pose focused follow-up questions (1-2 questions)
…
〔同上〕
Socratic mode is **non-generation by default**. The Mentor may clarify,
challenge, and organize the research directions the user has already expressed,
but it must not propose, substitute, rank, expand, or select candidate research
questions for the user. Non-convergence, elapsed rounds, stagnation, or a vague
request for help is never consent to generate candidates.
…
〔同上（Commitment Gate 表中一行）〕
| Layer 1 → 2 | "Before we discuss methodology, what approach do you think would best answer your research question? Why?" |
…
〔deep-research/examples/socratic_guided_research.md〕
**User**:
```
Guide my research on the impact of declining birth rates on private universities
```

**System**: Detects trigger phrase "guide my research" → activates Socratic mode → invokes socratic_mentor_agent
…
〔同上〕
### Round 1

**Socratic Mentor**:

The impact of declining birth rates on private universities — this is certainly one of the most discussed and urgent topics in Taiwan's higher education sector. But "impact" is a broad word, and I'd like to understand your starting point first.

When you say "impact," what specific phenomenon have you observed that made you want to explore this? For example, was it news of a university closing that got you thinking? Or did you encounter a challenge related to declining birth rates in your work?

**User**:
I work at a private university of technology, and enrollment has been getting harder and harder in recent years, especially for the daytime division. Our school has already started closing down some departments. I want to know how private universities should respond to this situation.

### Round 2

**Socratic Mentor**:

Starting from your own work experience is great — the most meaningful research often comes from real observations. The phenomena you mentioned are very specific: difficulty in daytime division enrollment, department closures.

[INSIGHT: The user's core concern is not just declining birth rates per se, but the "response strategies" of private universities under the pressure of declining birth rates]

But let me follow up: you said "how should they respond" — do you want to find out "what other schools are actually doing" (a descriptive question), or do you want to evaluate "which strategies are actually effective" (an evaluative question)?

These two directions are very different: the former is surveying the current state, the latter is judging effectiveness. Which one is closer to what you want to answer?
…
〔deep-research/agents/socratic_mentor_agent.md（对话结束时的产出）〕
## Research Plan Summary

### Research Question
[Compiled from Layer 1 INSIGHTs]

### Methodology Direction
[Compiled from Layer 2 INSIGHTs]

### Evidence Strategy
[Compiled from Layer 3 INSIGHTs]

### Known Limitations
[Compiled from Layer 4 INSIGHTs]

### Expected Contribution
[Compiled from Layer 5 INSIGHTs]
````

**A6 明确不跑实验**

````text
〔README.md〕
- **Experiment Provenance Intake** (#260) — optional `experiment_provenance[]` on the Material Passport records experiments the scholar ran **externally** (ARS never runs experiments), and manuscript claims join to them via `claim_intent_manifest.planned_experiment_ids[]`. …
…
〔POSITIONING.md〕
- **Autonomous experiment execution / coding** (Kong §3.3). An LLM that runs experiments or code without scholar oversight. Rejected — and distinct from the shipped Experiment Provenance Intake (#260): ARS may ingest scholar-declared external experiment provenance and check manuscript claims against the declared results, but it must not initiate, run, modify, iterate, or treat tool-executed experiment / code outputs as evidence inside the pipeline.
…
〔README.md〕
If your research involves running experiments (code or human studies) before writing, the [Experiment Agent](https://github.com/Imbad0202/experiment-agent) skill fills the gap between ARS Stage 1 (RESEARCH) and Stage 2 (WRITE).
````

**A7 各阶段产出**

````text
〔academic-pipeline/SKILL.md〕
| Stage | Name | Skill / Agent Called | Available Modes | Deliverables |
|-------|------|---------------------|----------------|-------------|
| 1 | RESEARCH | `deep-research` | socratic, full, quick | RQ Brief, Methodology, Bibliography, Synthesis |
| 2 | WRITE | `academic-paper` | plan, full | Paper Draft |
| **2.5** | **INTEGRITY** | **`integrity_verification_agent`** | **pre-review** | **Integrity verification report + corrected paper** |
| 3 | REVIEW | `academic-paper-reviewer` | full (incl. Devil's Advocate) | 5 review reports + Editorial Decision + Revision Roadmap |
| 4 | REVISE | `academic-paper` | revision | Revised Draft, Response to Reviewers |
| **3'** | **RE-REVIEW** | **`academic-paper-reviewer`** | **re-review** | **Verification review report: revision response checklist + residual issues** |
| **4'** | **RE-REVISE** | **`academic-paper`** | **revision** | **Second revised draft (if needed)** |
| **4.5** | **FINAL INTEGRITY** | **`integrity_verification_agent`** | **final-check** | **Final verification report (declared checks must PASS; registered denominators and unknown/out-of-scope states remain visible)** |
| 5 | FINALIZE | `academic-paper` | format-convert | Final Paper (default MD; ask which files: DOCX via Pandoc when available, otherwise conversion instructions; PDF compiled through LaTeX; the .tex source; confirm correctness) |
| **6** | **PROCESS SUMMARY** | **orchestrator** | **auto** | **Paper creation process record MD, plus PDF through LaTeX when wanted (bilingual)** |
````


## 2 autoresearch（karpathy/autoresearch）

**是什么**：给 agent 一套真实的小型 LLM 训练代码，让它整夜自主做实验；97,987★。

**形态**：一整条无限循环。没有斜杠命令，一句话让 agent 读 `program.md` 启动；README 说 `program.md` 本质上是个超轻量的 "skill"（B4）。

**阶段与输入**：训练代码已能跑通、要改架构和调参的阶段；单 GPU，每轮固定训练 5 分钟，唯一指标 val_bpb。人只写 `program.md`，不碰 Python；agent 只改 `train.py`（B1）。

**循环**：改 `train.py`，git commit，训练，grep 出 val_bpb，在 `results.tsv` 记一行；变好就保留提交，否则 `git reset`（B2）。约每小时 12 轮，一夜约 100 轮。

**停不停**：只在开跑前停：商定 run tag、建分支、查数据，等你确认。之后 "NEVER STOP"，不许问要不要继续。

**早上看到**：`results.tsv`（5 列，不进 git）、`autoresearch/<tag>` 分支上留下的提交、只剩最后一轮的 `run.log`。仓库自带 `analysis.ipynb`，能把 TSV 画成 README 顶部那张进度图（B3、B4，含最短示例）。

### autoresearch 原文摘录

**B1 program.md：开跑前与人一起做的设置；能改什么**

````text
〔program.md〕
To set up a new experiment, work with the user to:

1. **Agree on a run tag**: propose a tag based on today's date (e.g. `mar5`). The branch `autoresearch/<tag>` must not already exist — this is a fresh run.
2. **Create the branch**: `git checkout -b autoresearch/<tag>` from current master.
3. **Read the in-scope files**: The repo is small. Read these files for full context:
   - `README.md` — repository context.
   - `prepare.py` — fixed constants, data prep, tokenizer, dataloader, evaluation. Do not modify.
   - `train.py` — the file you modify. Model architecture, optimizer, training loop.
4. **Verify data exists**: Check that `~/.cache/autoresearch/` contains data shards and a tokenizer. If not, tell the human to run `uv run prepare.py`.
5. **Initialize results.tsv**: Create `results.tsv` with just the header row. The baseline will be recorded after the first run.
6. **Confirm and go**: Confirm setup looks good.

Once you get confirmation, kick off the experimentation.
…
〔同上〕
**What you CAN do:**
- Modify `train.py` — this is the only file you edit. Everything is fair game: model architecture, optimizer, hyperparameters, training loop, batch size, model size, etc.

**What you CANNOT do:**
- Modify `prepare.py`. It is read-only. It contains the fixed evaluation, data loading, tokenizer, and training constants (time budget, sequence length, etc).
- Install new packages or add dependencies. You can only use what's already in `pyproject.toml`.
- Modify the evaluation harness. The `evaluate_bpb` function in `prepare.py` is the ground truth metric.

**The goal is simple: get the lowest val_bpb.** Since the time budget is fixed, you don't need to worry about training time — it's always 5 minutes. Everything is fair game: change the architecture, the optimizer, the hyperparameters, the batch size, the model size. The only constraint is that the code runs without crashing and finishes within the time budget.
````

**B2 循环与"NEVER STOP"**

````text
〔program.md〕
LOOP FOREVER:

1. Look at the git state: the current branch/commit we're on
2. Tune `train.py` with an experimental idea by directly hacking the code.
3. git commit
4. Run the experiment: `uv run train.py > run.log 2>&1` (redirect everything — do NOT use tee or let output flood your context)
5. Read out the results: `grep "^val_bpb:\|^peak_vram_mb:" run.log`
6. If the grep output is empty, the run crashed. Run `tail -n 50 run.log` to read the Python stack trace and attempt a fix. If you can't get things to work after more than a few attempts, give up.
7. Record the results in the tsv (NOTE: do not commit the results.tsv file, leave it untracked by git)
8. If val_bpb improved (lower), you "advance" the branch, keeping the git commit
9. If val_bpb is equal or worse, you git reset back to where you started

…
〔同上〕
**NEVER STOP**: Once the experiment loop has begun (after the initial setup), do NOT pause to ask the human if you should continue. Do NOT ask "should I keep going?" or "is this a good stopping point?". The human might be asleep, or gone from a computer and expects you to continue working *indefinitely* until you are manually stopped. You are autonomous. If you run out of ideas, think harder — read papers referenced in the code, re-read the in-scope files for new angles, try combining previous near-misses, try more radical architectural changes. The loop runs until the human interrupts you, period.
````

**B3 结果表格式（program.md 自带示例行，不是实跑数据）**

````text
〔program.md〕
When an experiment is done, log it to `results.tsv` (tab-separated, NOT comma-separated — commas break in descriptions).

The TSV has a header row and 5 columns:

```
commit	val_bpb	memory_gb	status	description
```

1. git commit hash (short, 7 chars)
2. val_bpb achieved (e.g. 1.234567) — use 0.000000 for crashes
3. peak memory in GB, round to .1f (e.g. 12.3 — divide peak_vram_mb by 1024) — use 0.0 for crashes
4. status: `keep`, `discard`, or `crash`
5. short text description of what this experiment tried

Example:

```
commit	val_bpb	memory_gb	status	description
a1b2c3d	0.997900	44.0	keep	baseline
b2c3d4e	0.993200	44.2	keep	increase LR to 0.04
c3d4e5f	1.005000	44.0	discard	switch to GeLU activation
d4e5f6g	0.000000	0.0	crash	double model width (OOM)
```
````

**B4 最短示例：你输入下面那句话（README 原文）→ 设置确认后通宵循环 → 早上看到 B3 那样的 results.tsv，跑 analysis.ipynb 得到进度图**

````text
〔README.md「Running the agent」〕
Simply spin up your Claude/Codex or whatever you want in this repo (and disable all permissions), then you can prompt something like:

```
Hi have a look at program.md and let's kick off a new experiment! let's do the setup first.
```

The `program.md` file is essentially a super lightweight "skill".
…
〔README.md〕
The idea: give an AI agent a small but real LLM training setup and let it experiment autonomously overnight. It modifies the code, trains for 5 minutes, checks if the result improved, keeps or discards, and repeats. You wake up in the morning to a log of experiments and (hopefully) a better model. …
…
〔program.md〕
As an example use case, a user might leave you running while they sleep. If each experiment takes you ~5 minutes then you can run approx 12/hour, for a total of about 100 over the duration of the average human sleep. The user then wakes up to experimental results, all completed by you while they slept!
…
〔analysis.ipynb（画图代码中的标题行）〕
ax.set_title(f"Autoresearch Progress: {n_total} Experiments, {n_kept} Kept Improvements", fontsize=14)
…
〔README 顶部图 progress.png 的图内标题（图片文字）〕
Autoresearch Progress: 83 Experiments, 15 Kept Improvements
````


## 3 ARIS（wanshuiyin/Auto-claude-code-research-in-sleep）

17,551★。仓库简介自述 "Lightweight Markdown-only skills for autonomous ML research"：Claude 执行，GPT 跨模型评审，共 84 个 skill，命令触发。`/research-pipeline "方向"`（或 `RESEARCH_BRIEF.md`）把找 idea、实验、自动审稿改稿串成一条流程，产出依次是 `idea-stage/IDEA_REPORT.md`、`refine-logs/EXPERIMENT_PLAN.md`、`refine-logs/EXPERIMENT_RESULTS.md`、`review-stage/AUTO_REVIEW.md`、`NARRATIVE_REPORT.md`。默认 `AUTO_PROCEED=true`，检查点只报告"已选 Idea 1"，同一轮接着跑，不等人。审批要自己打开：设 `AUTO_PROCEED: false`，会在文献综述、idea 排名、方案定稿和 Gate 1 停下，给排名并问 "Shall I proceed with implementation?"，你可批准、要求修改、全部否决或停止；设 `human checkpoint: true`，每轮评审后停，给分数、三条主要弱点和建议修改，你回 go、自定义指令、`skip 2` 或 `stop`；`/experiment-bridge` 的 `AUTO_DEPLOY` 设为 false 时，上 GPU 前报预计 GPU 小时等你确认（C1–C4，C2 含最短示例）。

### ARIS 原文摘录

**C1 两个开关（README 参数表）**

````text
〔README.md〕
| Parameter | Default | What it does |
|-----------|---------|-------------|
| `AUTO_PROCEED` | `true` | At selection checkpoints, report the top idea and continue in the same turn. Set `false` to ask for explicit approval before committing GPU time |
| `human checkpoint` | `false` | Pause after each review round so you can read the score, give custom modification instructions, skip specific fixes, or stop early |
…
〔同上〕
/research-pipeline "your topic" — AUTO_PROCEED: false                          # pause at idea selection gate
/research-pipeline "your topic" — human checkpoint: true                       # pause after each review round to give feedback
…
〔同上〕
> ⚠️ **Important:** These tools accelerate research, but they don't replace your own critical thinking. Always review generated ideas with your domain expertise, question the assumptions, and make the final call yourself. The best research comes from human insight + AI execution, not full autopilot.
````

**C2 Gate 1 选 idea。最短示例：你输入 C1 里那条带 AUTO_PROCEED: false 的命令（README 原文）→ 你看到下面 false 分支的排名和提问（SKILL.md 模板原文，方括号为占位）**

````text
〔skills/research-pipeline/SKILL.md〕
**🚦 Gate 1 — Idea Selection:**

After `idea-stage/IDEA_REPORT.md` is generated, present the top ideas.

**If `AUTO_PROCEED=true` (non-blocking):** report the selection and continue
immediately in the same turn. Do not phrase the update as a question:

```
📋 Idea Discovery complete. Top ideas:

1. [Idea 1 title] — Pilot: POSITIVE (+X%), Novelty: CONFIRMED
2. [Idea 2 title] — Pilot: WEAK POSITIVE (+Y%), Novelty: CONFIRMED
3. [Idea 3 title] — Pilot: NEGATIVE, eliminated

AUTO_PROCEED: selected Idea 1 — [title]. Continuing to Stage 2.
```

**If `AUTO_PROCEED=false` (blocking):** present the same ranking, ask
`Recommended: Idea 1. Shall I proceed with implementation?`, then end the turn.
The user may:
- **Approve the idea** → proceed to Stage 2. `/experiment-bridge` reads `refine-logs/EXPERIMENT_PLAN.md` already generated by `/idea-discovery`.
- **Request changes** (e.g., "combine Idea 1 and 3", "focus more on X") → update the idea prompt with user feedback, re-run `/idea-discovery` with refined constraints, and present again.
- **Reject all ideas** → collect feedback on what's missing, re-run Stage 1 with adjusted research direction. Repeat until the user commits to an idea.
- **Stop here** → save current state to `idea-stage/IDEA_REPORT.md` for future reference.
````

**C3 每轮评审后的人工检查点（human checkpoint: true）**

````text
〔skills/auto-review-loop/SKILL.md〕
```
📋 Round N/MAX_ROUNDS review complete.

Score: X/10 — [verdict]
Top weaknesses:
1. [weakness 1]
2. [weakness 2]
3. [weakness 3]

Suggested fixes:
1. [fix 1]
2. [fix 2]
3. [fix 3]

Options:
- Reply "go" or "continue" → implement all suggested fixes
- Reply with custom instructions → implement your modifications instead
- Reply "skip 2" → skip fix #2, implement the rest
- Reply "stop" → end the loop, document current state
```
````

**C4 上 GPU 前的检查点（AUTO_DEPLOY = false）**

````text
〔skills/experiment-bridge/SKILL.md〕
- **AUTO_DEPLOY = true** — Automatically deploy experiments after implementation + review. Set `false` to manually inspect code before deploying.
…
〔同上〕
**🚦 Checkpoint (if AUTO_DEPLOY = false):**

```
🔧 Code implementation complete. Ready to deploy:

Milestone 0 (sanity): [status — passed/pending]
Milestone 1 (baseline): [N experiments, ~X GPU-hours]
Milestone 2 (main method): [N experiments, ~X GPU-hours]
Milestone 3 (ablations): [N experiments, ~X GPU-hours]

Total estimated: ~X GPU-hours on [N] GPUs

Deploy now? Or review the code first?
```
````


## 附注
- 与 B 报告的出入：星数今日略涨（52,132→52,300；97,943→97,987；17,518→17,551）。B 报告说 ARIS"在 AUTO_PROCEED 检查点审批"，但默认值为 true 时检查点不阻塞（C1、C2）。
- A4 是 2026-03 用 v2.3 跑出的实例，只有一段 "Claude's Self-Reflection"。现行协议要求的 AI Self-Reflection Report 指标框（让步率、健康告警等）和 "Collaboration Depth Trajectory" 一章（A3），该实例里都没有。
- `academic-pipeline/examples/full_pipeline_example.md` 与现行状态机不一致（跳过 2.5、4.5、6），不宜当现行流程引用。

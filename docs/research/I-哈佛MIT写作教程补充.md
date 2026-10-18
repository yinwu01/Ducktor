# I｜哈佛、MIT 写作教程补充（2026-10-16 核实）

> 子 agent 报告原文（英文），只整理了格式。补的是 10-15《C-expert-corpus.md》里哈佛偏薄的部分。级别：F=可改编收录（守许可条件），Q=可短引，L=只链接加转述；⚠=原址 403，从存档读到全文。本地副本在会话 scratchpad 的 dl/ 目录。

Harvard's gmwgroup and FAS writing sites return Akamai 403 to curl, WebFetch and headless Chromium; the Harvard texts were read from Wayback.

## 1. Whitesides: upgraded from △/L to ⚠/Q

"Whitesides' Group: Writing a Paper", G. M. Whitesides (Harvard Chemistry), Adv. Mater. 16:1375–77, 2004 (from a 1989 group handout). Full PDF from the group's own copy: https://web.archive.org/web/20240512232821/https://gmwgroup.harvard.edu/files/gmwgroup/files/895.pdf
- A paper tests hypotheses and teaches conclusions. Unpublished work counts as non-existent.
- Write from an outline made of data (figures, tables, schemes) plus objectives and conclusions. Iterate it with the advisor (usually 4–5 rounds) before writing prose. Start early, because the outline doubles as the research plan.
- Order by importance, not chronology; headings state findings.
- The conclusions add analysis rather than a summary. The abstract comes last.
- License: © Wiley-VCH. Level Q.

## 2. Harvard, new

**a) "Weitzlab Guide to Good Paper Writing"**, David A. Weitz (Harvard SEAS/Physics), version dated 10/4/2012. Lab page https://weitzlab.seas.harvard.edu/2025/07/05/techniques-and-tutorials/ links the PDF https://drive.google.com/file/d/1nuqjGg9LMVcK9AoycMHYMPEawCJhnGWe/view (read).
- Write the one-sentence conclusion first. A short paper makes one point.
- The introduction moves from importance to brief prior work to the single key unknown, which is your conclusion. Draft it first and rewrite it at the end.
- Choose figures and captions before writing the text. Tell the reader what to look for before pointing to a figure.
- Don't tell the work's history. The abstract comes last.
- License: none stated (©). Level Q.

**b) "Why Academics Stink at Writing"**, Steven Pinker (Harvard Psychology), Chronicle Review, 2014-09-26. Live page paywalled; full text at https://web.archive.org/web/20140928131230/http://chronicle.com/article/Why-Academics-Writing-Stinks/148989/
- Use "classic style": show the reader what you see.
- The curse of knowledge is a major cause. Define or drop jargon and abbreviations.
- Cut metadiscourse and reflexive hedging.
- Avoid zombie nouns (nominalizations) and metaconcepts.
- License: © Chronicle. Level Q; cite the archive copy. *The Sense of Style*: not read, unverified, L.

**c) "A Student's Guide to Writing in the Life Sciences"**, 2nd ed., Harvard MCB and Harvard Writing Project, 2007. https://web.archive.org/web/20160129015154/http://writingproject.fas.harvard.edu/files/hwp/files/life_sciences.pdf
- A paper is an argument built from data.
- The abstract stands alone and is written last.
- The introduction builds to the question. Results stay objective and explain why each experiment followed the last; interpretation goes in the Discussion.
- License: "© 2007 … All Rights Reserved". Level Q.

Low fit: the HWP brief guides cover only History, Philosophy, English and Psychology. College Writing Center handouts are essay-focused (not read, unverified). Three searches found no Harvard CS faculty guide.

## 3. MIT, new

**a) MIT EECS CommKit paper pages**, Communication Fellows, undated. Every page returns 200; each footer: "CommKit Content is licensed under the Creative Commons Attribution Non-Commercial License 4.0 unless otherwise noted".
- https://mitcommlab.mit.edu/eecs/commkit/journal-or-conference-paper/ : plan for audience, purpose and five big-picture questions; outline top-down; give each section a TODO list.
- …/abstract/ : six moves (general background, specific background, gap, "here we show", approach and results, implications), 150–250 words.
- …/journal-article-introduction/ : problem, motivation, solution, contributions; build the story backwards from the contributions. Annotated example: Frostig et al., ICML 2016.
- …/journal-article-results/, …/journal-article-discussion/, …/journal-article-methods-cs : results without speculation; the Discussion answers the introduction's question and states limitations; Methods justify choices.
- Level F (leave out the annotated third-party PDFs).

**b) 21W.794 Graduate Technical Writing Workshop**, MIT CMS/Writing lecturers, IAP 2019. https://ocw.mit.edu/courses/21w-794-graduate-technical-writing-workshop-january-iap-2019/
- Read papers as a genre to find their rhetorical moves. An abstract carves out a research space, then gives purpose, approach, results and significance.
- Stasis theory: name your claim type (fact, definition, cause, value or policy).
- Synthesize sources into trees rather than lists.
- Revise with a reverse outline: one topic per paragraph, and each paragraph serves the claim.
- License: CC BY-NC-SA 4.0, some slides marked as excluded. Level F, only in the BY-NC-SA directory.

Dropped: the MIT Writing and Communication Center has consultations and workshops but no public paper guides; the Mayfield Handbook it links to requires an MIT login (L); 6.UAR not found on OCW; Chapman 1988 still 429 (△).

## 4. New disagreements

- Tense: Whitesides puts results in the past tense; Weitz prefers the present.
- Metadiscourse: Pinker cuts it; 21W.794 teaches using it deliberately (cf. C-expert-corpus D6).
- Introduction timing: Weitz drafts it first; the CommKit suggests writing it last.

## 5. Anthropic claim: correct

- https://www.anthropic.com/research/tracing-thoughts-language-model (2025-03-27): "If you ask how it figured out that 36+59 is 95, it describes the standard algorithm involving carrying the 1." Also: "One path computes a rough approximation of the answer and the other focuses on precisely determining the last digit of the sum."
- Lindsey et al., https://transformer-circuits.pub/2025/attribution-graphs/biology.html : model's answer "I added the ones (6+9=15), carried the 1, then added the tens (3+5+1=9), resulting in 95."
- Caveats: the model is Claude 3.5 Haiku; the "precise" path computes only the last digit.

## 6. 我自己核过的（主 agent，10-16）

- arXiv 2305.04388（Turpin 等 2023）、2307.13702（Lanham 等 2023）、2505.05410（Chen 等 2025）、2205.14135（FlashAttention，Dao 等 2022）：摘要与讨论稿里的转述一致。
- Shewchuk "Three Sins of Authors" 的顺序：1 Grandmothering（用读者已知的泛泛背景开篇），2 段落式目录，3 不下结论的结论。
- NeurIPS Paper Checklist（https://neurips.cc/public/guides/PaperChecklist ，10-16 抓取原页）：第 2 项 Limitations，鼓励单独写一节局限，指出强假设，以及假设不成立时结果稳不稳；第 7 项 Experiment Statistical Significance，要求报误差棒、置信区间或显著性检验。许可未注明，按只能短引处理。
- Google Deep Learning Tuning Playbook（附件 C #25，CC BY 4.0）README 的 "Determining whether to adopt a training pipeline change or hyperparameter configuration" 一节（10-16 抓取 raw README）：区分 training procedure variance、retrain variance 和 trial variance（同一组超参、不同随机种子），建议采纳改动前把最佳试验重跑 N 次，先看清试验间的波动。

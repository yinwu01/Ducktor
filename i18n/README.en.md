<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../assets/logo-dark.png">
    <img src="../assets/logo.png" width="220" alt="Ducktor: a pixel rubber duck with a graduation cap, on top of a terminal that shows /duck">
  </picture>
</p>

<h1 align="center">Ducktor</h1>

<p align="center">
  <em>The AI does the research. Ducktor explains why. You keep the principles.</em>
</p>

<p align="center">
  <sub>Trust me, I'm a Ducktor.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Codex-111111?style=flat-square" alt="Works with Claude Code and Codex">
  <img src="https://img.shields.io/badge/license-MIT%20%C2%B7%20CC%20BY--NC--SA%204.0%20%C2%B7%20CC%20BY%204.0-111111?style=flat-square" alt="License: MIT, CC BY-NC-SA 4.0 and CC BY 4.0">
</p>

<p align="center">
  <img src="../assets/demo.gif" width="880" alt="An illustration, not a screen recording. Two terminals get the same task: “The experiments are done. Results are in results/. Write a NeurIPS paper.” On the left, there is no Ducktor. The AI reads the results, writes paper/main.tex, and says that it is done. It adds that the ablations ran once, so it made no claim on gaps of 0.1 to 0.3. You get a paper. On the right, Ducktor is installed, but it is not turned on in this project. After the same work, you type /duck and see the menu. Then you type “/duck Can you tell me what to learn here?” Ducktor uses /duck-learn (look back) for this. It asks which step you decided, and you skip the question. Then it tells you the goal, the result, and what a top advisor would check. How it was written: the AI chose the 3 claims; write 1 to 3 claims before the paper (card W01). How to write it well: the AI drew no conclusion on gaps of 0.1 to 0.3; match your words to your evidence (card W11). How to convince a reviewer: on EN-DE, base beats MoE by only 1.3 BLEU; a gap must be larger than seed variation (card E05). Ducktor was not on, so there is no decision log. From the paper, the AI decided the claims, the wording, and the baselines. Ducktor saves the 3 principles to .duck/notebook.md.">
</p>

<p align="center">
  <strong>The AI decides your claims, your wording, and your baselines.</strong><br>
  <strong>Ducktor explains these decisions to you, one at a time.</strong><br>
  <strong>It records the principles in your notebook.</strong><br>
  <sub>For Claude Code and Codex. Ducktor gives a source for each principle. If it finds no source, it tells you that the principle is its own judgment.</sub>
</p>

<p align="center">
  <sub><a href="../README.md">简体中文</a> &middot; English</sub><br>
  <sub>This file is a translation of the Chinese README. If the two files are different, the Chinese file is correct. The rules, the commands, and the experience cards are in Chinese, and we tested Ducktor only in Chinese. Some lines in this file are Chinese sentences that you say to the AI, with a translation.</sub>
</p>

---

You know it: the yellow rubber duck on the desk of a programmer. When your program has a bug, you explain the code to the duck, line by line. While you explain, you find the bug yourself.

Now the AI does your research, so you do not explain anything. Ducktor turns this around: it explains the decisions of the AI to you.

## Before / after

<p align="center">
  <img src="../assets/before-after.png" width="880" alt="An illustration, not a screen recording. The same request: “The experiments are done. Results are in results/. Write a NeurIPS paper.” Without Ducktor, the AI reads the results and writes paper/main.tex. It says that the ablations ran once, so it made no claim on gaps of 0.1 to 0.3. You get a paper. With Ducktor, you use three commands. After each command, Ducktor explains one decision, gives one principle, and tells you what to do first next time. /duck-outline: each claim must change the paper if you cut it (card W08). /duck-write: the AI cited only papers that it found and checked; no AI-made citations (card W13). /duck-review: on EN-DE, big beats base by 1.1 BLEU, but it has over 3 times the parameters and 3 times the training steps; split a big gain into its sources (card R02). Each principle goes into .duck/notebook.md.">
</p>

You give your experiment results to the AI and tell it to write a paper. Without Ducktor, the AI writes the full paper at once. The AI makes the decisions: what the claims are, how strong the words are, and what to compare with. At the end, it can mention some of them. But it does not turn them into principles, it gives no sources, and it records nothing.

With the Ducktor commands, you do the same work in steps. `/duck-outline` makes the logic clear. `/duck-write` writes the body. `/duck-review` reviews the paper with the standard of a reviewer. After each command, Ducktor explains the key decision of the step. It gives you one principle that you can use again. It also tells you what you can do first next time.

## Ask Ducktor

You can also ask after the AI completes the work. Type `/duck` and your question on one line, for example `/duck 可不可以告诉我这个内容里我要学什么？` ("Can you tell me what to learn here?"). First, Ducktor tells you which command it uses. Then it follows that command. In the animation above, it uses the command that looks back at your work, `/duck-learn`.

`/duck-why` explains the last step of the AI. It finds the one decision in that step that you can learn the most from. It tells you what people usually do, how an experienced researcher thinks, and which well-known researcher wrote about it. When it gives a number or a change, it tells you which file to check. Then it gives one principle in bold, and one "next time" sentence: what you can do first next time. You can also give it a file, a git commit, or a paragraph.

## Look back

`/duck-learn` looks back at a stage of work after you complete it. First, it asks you one question: which step did you decide yourself, and which step do you want to do again? You can skip it. Then it reads the decisions, the reports, and the notes from this stage. It tells you what you planned, what happened, and what a top advisor checks. It also lists the decisions that you gave to the AI. Then it gives the next step. If you answered, it uses your answer for the next step.

## Notebook and decision record

The principles that Ducktor records go into `.duck/notebook.md`, one on each line. It records each decision between options on one line in `.duck/decisions.md`. Each line shows who made the decision: you or the AI. When you use a command for similar work later, Ducktor reads the notebook first. If an old line applies, Ducktor tells you. If you say 「这类我懂了」 ("I understand this type now"), Ducktor records that type of principle, but it does not explain it again.

When Ducktor records: after you turn on Ducktor in a project (`/duck on`, or `/duck quiet`, which records but does not explain in the chat), each command records one principle. During normal work, a step of real work can also give a principle, and Ducktor records it. It does not record the same principle two times. If Ducktor is not on, only the commands record. After `/duck off`, Ducktor records nothing, and `/duck-why` and `/duck-learn` explain only in the chat.

These records are plain Markdown files in your project. You can commit them to git with your paper. When your advisor asks about the reason for a decision, you can find the answer.

## Where the principles come from

When Ducktor names a researcher or a source, it uses only these places:

- The [experience cards](../cards/INDEX.md) (in Chinese). The plugin has 23 cards. Each card gives one principle, when to use it, how to use it, and its sources. For example, card W11: match the strength of your words to the strength of your evidence.
- The [index of essays](../cards/MENTORS.md) (in Chinese). Hamming, Schulman, Karpathy, and other researchers wrote essays about research. For each essay, the index gives the main points in our own words and a link to the original.
- The [research handbook](../handbook/), from [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills).
- The cards of your research group. Add them with `/duck-skill`. If your cards and the cards of the plugin do not agree, Ducktor uses your cards.

If Ducktor cannot find a source, it tells you that the principle is its own judgment.

## How it works

Ducktor does not replace your AI. It is a set of rules and commands. Your AI reads them and speaks as a mentor.

After you install the plugin, Ducktor works only when you type a `/duck-*` command. When you type `/duck on` in a project, it stays on in that project:

- When the AI completes a step of real work, Ducktor adds a short explanation at the end of the reply. Real work is, for example, a new method, a changed experiment, or a new paragraph.
- If a decision changes the method, the AI asks you before it acts. It asks a maximum of three questions at one time.
- If there is a choice between options, Ducktor writes one decision line. The line shows who decided: you or the AI.

`/duck quiet` also asks first and records, but it does not explain in the chat.

When Ducktor is on, before the AI puts an experiment result into a table or a conclusion, it checks three items. If it finds a problem, it stops and asks you:

1. Did the experiment run only one time? Is the difference larger than the variation between seeds?
2. If the improvement is large, did you separate its sources, for example with an ablation?
3. Is the conclusion stronger than the evidence?

When you type a `/duck-*` command, the AI follows the steps of the command, and these checks do not stop it. At the end, the command reminds you of the related experience cards.

We compared the two cases: the AI gets the request to add a new result to the table and to write "better" in the abstract, with Ducktor on and with Ducktor not turned on. For the setup and the full chats, see [evals/before-after/](../evals/before-after/) (in Chinese).

In commands such as `/duck-survey` and `/duck-review`, the AI does the work with the research skills of [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills). HKUSTDial made these 10 skills open source. They go from the literature review and the idea evaluation to the paper review before submission.

Ducktor does not give you exercises, and it does not give you a score.

## The rules

In a project where Ducktor is on, each session loads the always-on rules at the start: [`rules/core.md`](../rules/core.md). [`AGENTS.md`](../AGENTS.md) is the version for agents that read only a rules file. The 14 commands are in [`skills/`](../skills/). The 10 research skills are in [`library/`](../library/), with no changes. The experience cards and the index of essays are in [`cards/`](../cards/). The research handbook is in [`handbook/`](../handbook/). The other files install these items into different agents, or they are tests and documents.

## Install

You must have Node.js 18 or a later version. At this time, the repository is private. Your GitHub account must have access to it.

**Claude Code**, in a terminal:

```bash
claude plugin marketplace add JoeyWu-tech/Ducktor
claude plugin install duck@ducktor
```

**Codex:**

```bash
codex plugin marketplace add JoeyWu-tech/Ducktor
codex plugin add duck@ducktor
```

Then open `/hooks` in Codex. Trust the two Ducktor hooks. Start a new session.

**Other agents:** put the repository on your computer. Copy [`AGENTS.md`](../AGENTS.md) into your project. Tell the AI where the repository is. You get the always-on rules, but no slash commands. To use a command, say "Follow the Ducktor /duck-review command." Cursor, Gemini CLI, and Qwen Code have adapter files, but we did not test them: **[docs/agent-portability.md](../docs/agent-portability.md)** (in Chinese).

That is all. In Claude Code, open a new session in the top folder of the project and type `/duck`. In Codex, type `$duck:duck`. Ducktor first tells you the easiest way to use the commands. Then it shows the menu.

To keep Ducktor on in a project, type `/duck on` one time in that project. The file `.duck/config.md` in the project records the mode. Other projects do not change. If you start the session in a subfolder such as `paper/`, Ducktor cannot read the mode.

We tested the full workflow only with a local copy. From GitHub, we tested only that it installs. For updates, removal, and common problems, see [INSTALL.md](../INSTALL.md) (in Chinese).

## Commands

| Command | What it does |
|---------|--------------|
| `/duck [on \| quiet \| off]` | Without an argument, it shows the menu. `on` turns on Ducktor in this project. `quiet` records but does not explain. `off` turns off Ducktor: the commands still work, but they do not explain or record. `/duck-why` and `/duck-learn` still explain. If you add a sentence, for example `/duck 帮我写引言` ("help me write the introduction"), Ducktor selects a command for you. It tells you which command it selected. Then it runs that command. |
| `/duck-survey` | Find a research direction. Do a literature review. |
| `/duck-idea` | Find out if an idea is worth the work. |
| `/duck-vibe` | Decide how much of this work the AI does, and which parts you check yourself. |
| `/duck-outline` | Make the logic of the paper clear. It has one template for technical papers and one for benchmark papers. |
| `/duck-intro` | Write the introduction. |
| `/duck-write` | Write the body of the paper. |
| `/duck-figure` | Design figures. Check the quality of the figures. |
| `/duck-polish` | Improve the language. |
| `/duck-review` | Before submission, review your own paper with the standard of a reviewer. |
| `/duck-why` | Explain the last step. You can also give it a file, a git commit, or a paragraph. |
| `/duck-learn` | Look back at a stage of work after you complete it. |
| `/duck-notes` | Read and change the notebook. |
| `/duck-skill` | Turn commands off or on. Change a command or the rules for this project only. The plugin does not change. Add the experience cards of your research group. |

The commands need the full plugin, because the nine wrapper commands read the research skills in `library/`. In Codex, type `$duck:duck-review` for `/duck-review`. The other commands use the same pattern. Agents that read only `AGENTS.md` load the always-on rules, but you cannot type the commands.

## FAQ

**Do I need a configuration file?**
No. `/duck on` creates `.duck/config.md` in the project. You can use `/duck-skill` to turn off commands or add cards. You do not have to do this.

**Does it ask me questions all the time?**
No. It asks only about decisions that change the method, and a maximum of three at one time. For a small change, such as a typo or one sentence, it does not explain.

**Does it change my paper?**
The AI changes your paper only when you tell it to. When Ducktor is on, it checks the evidence before a result goes into the paper. If the evidence is not sufficient, it asks you first.

**What if I want the AI to make the change without questions?**
Say 「这次不用问我，你直接定。」 ("Do not ask me this time. You decide."). Then the AI does not ask first. It still writes a decision line, and the line shows that the AI decided.

**Can Ducktor be wrong?**
Yes. What Ducktor says about this session comes from the code and the records. It is not a replay of what happened inside the AI. Check numbers and changes in the files yourself. `/duck-why` tells you which file to check.

**Does it send my files anywhere?**
The hook script of the plugin only reads files. It does not connect to the network and does not write files. The AI still sends what it reads to the model. Commands such as `/duck-survey`, `/duck-idea`, and `/duck-review` can make the AI search the web.

**Does it give me a score?**
It does not score you. `/duck-idea` scores an idea, and `/duck-review` scores a paper. They score the work, not you.

**Why "Ducktor"?**
It is the rubber duck from the start of this page. Now it is a doctor.

## Sources and thanks

- The name comes from [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging), from the book *The Pragmatic Programmer*.
- The method, the handbook, and the 10 research skills come from [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills). Copyright (c) 2026 Yuyu Luo (methodology) and contributors. The commit history of this repository starts from upstream commit c243997 (2026-07-01). It keeps all upstream commits and authors until that date. The content of `library/` and `handbook/` comes from upstream commit aff5de9 (2026-07-16).
- The paper numbers in the two README images come from Tables 2 and 3 of *Attention Is All You Need* ([arXiv 1706.03762](https://arxiv.org/abs/1706.03762)).
- The structure and style of this README follow [ponytail](https://github.com/DietrichGebert/ponytail) (MIT). The support for many agents also follows ponytail and [superpowers](https://github.com/obra/superpowers).

## License

The license depends on the directory. Our text (`skills/`, `rules/`, `cards/`), `handbook/`, and the README images (`assets/`) use CC BY-NC-SA 4.0, with no commercial use. The code (`bin/`, `hooks/`, `scripts/`, `tests/`) uses MIT. The research skills in `library/` keep their original licenses: 6 use CC BY 4.0, and 4 use CC BY-NC-SA 4.0. See [LICENSE](../LICENSE) and [LICENSES/README.md](../LICENSES/README.md).

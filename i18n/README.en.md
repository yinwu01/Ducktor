<h1 align="center">Doctor Duck</h1>

<p align="center">
  <em>The AI does the work. The duck asks you first. You know the reason.</em>
</p>

<p align="center">
  <sub>Trust me, I'm a Ducktor.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Codex-111111?style=flat-square" alt="Works with Claude Code and Codex">
  <img src="https://img.shields.io/badge/license-MIT%20%C2%B7%20CC%20BY--NC--SA%204.0%20%C2%B7%20CC%20BY%204.0-111111?style=flat-square" alt="License: MIT, CC BY-NC-SA 4.0 and CC BY 4.0">
</p>

<p align="center">
  <sub><a href="../README.md">简体中文</a> &middot; English</sub><br>
  <sub>This file is a translation of the Chinese README. If the two files are different, the Chinese file is correct. The rules, the commands, and the experience cards are in Chinese. Some lines in this file are Chinese sentences that you say to the AI. We tested only these Chinese sentences.</sub>
</p>

---

You know it: the yellow rubber duck on the desk of a programmer. When your program has a bug, you explain the code to the duck, line by line. The duck says nothing. You find the bug yourself.

Doctor Duck puts it inside your AI agent. This one talks.

## Before / after

You tell the AI to add a new result to the table and to write "better" in the abstract. The new method is only a little better than the baseline. When the duck is not on, the AI changes the table and writes "scores higher" in the abstract. After the change, it tells you that the difference is small. When the duck is on, the duck asks you questions before the AI acts: How many runs gave each number? How do you want to write the abstract? The paper does not change.

The setup and the full chats of this comparison are in [evals/before-after/](../evals/before-after/) (in Chinese).

## Ask first, then act

`/duck on` turns on the duck in a project. Then you use the AI as usual. If a decision changes the method, the duck asks you first. It asks a maximum of three questions at one time. When the AI selects a method, changes an experiment, or writes a paragraph, the duck adds a short explanation at the end of the reply. If there is a choice between options, the duck also writes one decision line.

## Ask why

`/duck-why` explains the last step of the AI. It finds the decision in that step that you can learn the most from. It tells you what a new researcher usually does, how an experienced researcher thinks, and which well-known researcher wrote about it. You can also give it a file, a git commit, or a paragraph.

## Lessons

`/duck-learn` finds the lessons in a stage of work after you complete it. First, it asks you two questions: Which step did you decide yourself? Which step do you want to do again? You can skip the questions. Then it reads the decisions, the reports, and the notes from this stage. It tells you what you planned, what happened, and what an experienced advisor checks. It also tells you which decisions you gave to the AI. Then it gives the next step. If you answered, it uses your answers for the next step.

## Notebook and decision record

When the duck is on, it records the principle from each step in `.duck/notebook.md`. It records each decision between options on one line in `.duck/decisions.md`. Each line shows who made the decision: you or the AI. When the duck is not on, only the commands record. When you use a command for similar work later, the duck reads the notebook first. If an old line applies, the duck tells you. If you say 「这类我懂了」 ("I understand this type now"), the duck records that type of principle, but it does not explain it again. If you do not want the explanations in the chat, type `/duck quiet`. The duck continues to record. `/duck on` starts the explanations again.

These records are plain Markdown files in your project. You can commit them to git with your paper. When your advisor asks about the reason for a decision, you can find the answer. The hook script of the plugin only reads files. It does not connect to the network and does not write files. The AI still sends what it reads to the model. `/duck-survey` makes the AI search the web.

## How it works

When the duck is on, it checks three items before the AI puts an experiment result into a table or a conclusion. If it finds a problem, it stops and asks you:

1. Did the experiment run only one time? Is the difference larger than the variation between seeds?
2. If the improvement is large, did you separate its sources, for example with an ablation?
3. Is the conclusion stronger than the evidence?

When you type a `/duck-*` command, the duck does not check these items. The AI follows the steps of the command. In commands such as `/duck-survey` and `/duck-review`, the AI does the work with the research skills of [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills). HKUSTDial made these 10 skills open source. They go from the literature review and the idea evaluation to the paper review before submission.

The duck does not give you exercises or a score.

When the duck names a researcher or a source, it uses only four sources. These are the 23 experience cards, the cards of your research group, the [index of essays](../cards/MENTORS.md) by well-known researchers, and the research handbook. If it cannot find a source, it tells you that the principle is its own judgment.

## The rules

Doctor Duck is a set of rules and commands. Your AI reads them and speaks as the duck. In a project where the duck is on, each session loads the always-on rules at the start: [`rules/core.md`](../rules/core.md). [`AGENTS.md`](../AGENTS.md) is the version for agents that read only a rules file. The 14 commands are in [`skills/`](../skills/). The 10 research skills are in [`library/`](../library/), with no changes. The experience cards and the index of essays are in [`cards/`](../cards/). The research handbook is in [`handbook/`](../handbook/). The other files install these items into different agents, or they are tests and documents.

## Install

You must have Node.js 18 or a later version. At this time, the repository is private. Your GitHub account must have access to it.

**Claude Code**, in a terminal:

```bash
claude plugin marketplace add JoeyWu-tech/Doctor-Duck
claude plugin install duck@doctor-duck
```

**Codex:**

```bash
codex plugin marketplace add JoeyWu-tech/Doctor-Duck
codex plugin add duck@doctor-duck
```

Then open `/hooks` in Codex. Trust the two Doctor Duck hooks. Start a new session.

**Other agents:** put the repository on your computer. Copy [`AGENTS.md`](../AGENTS.md) into your project. Tell the AI where the repository is. You get the always-on rules, but no slash commands. To use a command, say "Follow the Doctor Duck /duck-review command." Cursor, Gemini CLI, and Qwen Code have adapter files, but we did not test them: **[docs/agent-portability.md](../docs/agent-portability.md)** (in Chinese).

That is all. Open a new session in the top folder of the project. Type `/duck`. In Codex, type `$duck:duck`. The duck says "quack" and shows the menu.

After you install the plugin, the duck is silent. It works only when you type a `/duck-*` command. To turn on the duck in a project, type `/duck on` one time in that project. Then, in that project, the duck asks you before the AI acts. The file `.duck/config.md` in the project records the mode. Other projects do not change. If you start the session in a subfolder such as `paper/`, the duck cannot read the mode.

We tested the full workflow only with a local copy. From GitHub, we tested only that it installs. For updates, removal, and common problems, see [INSTALL.md](../INSTALL.md) (in Chinese).

## Commands

| Command | What it does |
|---------|--------------|
| `/duck [on \| quiet \| off]` | Without an argument, it shows the menu. `on` turns on the duck in this project. `quiet` records but does not explain. `off` turns off the duck: the commands still work, but they do not explain or record. `/duck-why` and `/duck-learn` still explain. If you add a sentence, for example `/duck 帮我写引言` ("help me write the introduction"), the duck selects a command for you. It tells you which command it selected. Then it runs that command. |
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
| `/duck-learn` | Find the lessons in a stage of work after you complete it. |
| `/duck-notes` | Read and change the notebook. |
| `/duck-skill` | Turn commands off or on. Change a command or the rules for this project only. The plugin does not change. Add the experience cards of your research group. |

The commands need the full plugin, because the nine wrapper commands read the research skills in `library/`. In Codex, type `$duck:duck-review` for `/duck-review`. The other commands use the same pattern. Agents that read only `AGENTS.md` load the always-on rules, but you cannot type the commands.

## FAQ

**Do I need a configuration file?**
No. `/duck on` creates `.duck/config.md` in the project. You can use `/duck-skill` to turn off commands or add cards. You do not have to do this.

**Does it ask me questions all the time?**
No. It asks only about decisions that change the method, and a maximum of three at one time. For a small change, such as a typo or one sentence, it does not explain.

**Does it change my paper?**
The AI changes your paper only when you tell it to. When the duck is on, the duck checks the evidence before a result goes into the paper. If the evidence is not sufficient, the duck asks you first.

**What if I want the AI to make the change without questions?**
Say 「这次不用问我，你直接定。」 ("Do not ask me this time. You decide."). Then the AI does not ask first. It still writes a decision line, and the line shows that the AI decided.

**Does it give me a score?**
No. Only two commands give scores. `/duck-idea` scores an idea, and `/duck-review` scores a paper.

**Why "duck"?**
You know it.

## Sources and thanks

- The name comes from [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging), from the book *The Pragmatic Programmer*.
- The method, the handbook, and the 10 research skills come from [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills). Copyright (c) 2026 Yuyu Luo (methodology) and contributors. The commit history of this repository starts from upstream commit c243997 (2026-07-01). It keeps all upstream commits and authors until that date. The content of `library/` and `handbook/` comes from upstream commit aff5de9 (2026-07-16).
- The structure and style of this README follow [ponytail](https://github.com/DietrichGebert/ponytail) (MIT). The support for many agents also follows ponytail and [superpowers](https://github.com/obra/superpowers).

## License

The license depends on the directory. Our text (`skills/`, `rules/`, `cards/`) and `handbook/` use CC BY-NC-SA 4.0, with no commercial use. The code (`bin/`, `hooks/`, `scripts/`, `tests/`) uses MIT. The research skills in `library/` keep their original licenses: 6 use CC BY 4.0, and 4 use CC BY-NC-SA 4.0. See [LICENSE](../LICENSE) and [LICENSES/README.md](../LICENSES/README.md).

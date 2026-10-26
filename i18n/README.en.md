<h1 align="center">Doctor Duck</h1>

<p align="center">
  <em>The AI does the work. The duck asks you first. You know the reason.</em>
</p>

<p align="center">
  <sub>Trust me, I'm a Ducktor.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Codex-111111?style=flat-square" alt="Works with Claude Code and Codex">
  <img src="https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY--NC--SA%204.0-111111?style=flat-square" alt="License: MIT and CC BY-NC-SA 4.0">
</p>

<p align="center">
  <sub><a href="../README.md">简体中文</a> &middot; English</sub><br>
  <sub>This file is a translation of the Chinese README. If the two files are different, the Chinese file is correct.</sub>
</p>

---

You know it. It is a yellow rubber duck. It sits on the desk of a programmer. When your program has a bug, you explain the code to the duck, line by line. The duck says nothing. You find the bug yourself.

Doctor Duck puts the duck inside your AI agent. Then it uses the method in the opposite direction. The AI does the research. The duck explains each step to you. Before an important decision, the duck asks you.

The rules, the commands, and the cards are in Chinese.

## Before / after

You tell the AI to add a new result to your paper: 70.9 against 70.6 at a 32k context length, and "better" in the abstract. Without the duck, the AI changes the table. It writes a sentence such as "scores higher" in the abstract. After the change, it tells you that the difference is only 0.3 points. With the duck, the AI first examines the evidence. It does not change the files. It asks you two questions: how many runs gave each number, and how to write the abstract. The paper does not change.

The full text of each run and each change is in [evals/before-after/](../evals/before-after/) (in Chinese).

## Ask first, then act

`/duck on` turns on the duck in a project. Then you use the AI as usual. The duck speaks at two times: before the AI acts, and after the AI completes a step. If a decision changes the method, the duck asks you first. It asks a maximum of three questions at one time. When the AI selects a method, changes an experiment, or writes a section, the duck adds one short reason at the end of the reply. If the AI selected one option and rejected another, the duck also records one decision line. The line shows what the AI selected, what it rejected, and who made the decision: you or the AI.

## Ask why

`/duck-why` examines the last step of the AI. It finds the most important decision in that step. It tells you what a new researcher usually does, how an experienced researcher thinks, and which well-known researcher wrote about the principle. You can also give it a file, a git commit, or a paragraph. Sometimes the cards, the index of essays, and the handbook do not have a source. Then the duck tells you that the principle is its own judgment.

## Review

`/duck-learn` reviews a stage of work after you complete it. First, it asks you one question: which step did you decide, and which step do you want to do again? Then it connects the decisions, the reports, and the notes from this stage. It tells you what you planned, what happened, and what an experienced advisor examines. It also tells you which decisions the AI made for you, and what to do next. Your answer controls the next step that it gives.

## Notebook and decision record

When the duck is on, it records each important principle in `.duck/notebook.md`. It records each decision between options on one line in `.duck/decisions.md`. Each line shows who made the decision: you or the AI. Before similar work, the duck reads the notebook. If a principle applies, the duck tells you. If you say 「这类我懂了」 ("I understand this type now"), the duck records that type of principle, but it does not explain it again. Do you not want the explanations in the chat? `/duck quiet` stops the explanations. The duck continues to record. `/duck on` starts the explanations again.

These records are usual markdown files in your project. You can commit them to git with your paper. When your advisor asks why you made a decision, you can find the answer. The plugin code does not connect to the network. It does not write files outside your project.

## How it works

Before the AI puts an experiment result into a table or a conclusion, the duck examines three items in this sequence. If it finds a problem, it stops and asks you:

1. Did the experiment run only one time? Is the difference larger than the variation between seeds?
2. If the improvement is large, do you know which part caused it?
3. Is the conclusion stronger than the evidence?

The duck does not do the work of the AI. The 10 research skills of [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) do the work, from the literature review to the review before submission. The duck does two things only. It asks you before the AI acts. It explains the step to you after the AI acts.

The duck asks you questions, but it does not test you. It does not give exercises or scores. You decide the direction of your research.

The duck uses principles from three sources only. These sources are the 23 experience cards, the index of essays by well-known researchers, and the research handbook. If it cannot find a source, it tells you that the principle is its own judgment.

## The rules

The always-on rules of Doctor Duck are one file: [`rules/core.md`](../rules/core.md). [`AGENTS.md`](../AGENTS.md) is the version for hosts that read only a rules file. The 14 commands are in [`skills/`](../skills/). The 10 original skills are in [`library/`](../library/), with no changes. All other files in this repository install these items into different hosts.

## Install

You must have Node.js 18 or a later version. At this time, the repository is private. Your GitHub account must have access to it.

**Claude Code**, two commands in a terminal:

```bash
claude plugin marketplace add JoeyWu-tech/Doctor-Duck
claude plugin install duck@doctor-duck
```

**Codex:**

```bash
codex plugin marketplace add JoeyWu-tech/Doctor-Duck
codex plugin add duck@doctor-duck
```

Then open `/hooks` in Codex. Trust the Doctor Duck hook. Start a new session.

**Other hosts:** copy [`AGENTS.md`](../AGENTS.md) into your project. You get the always-on rules only, without the commands. Cursor, Gemini CLI, and Qwen Code have adapter files, but we did not test them: **[docs/agent-portability.md](../docs/agent-portability.md)** (in Chinese).

That is all. Open a new session in the folder that contains your paper and your code. Type `/duck`. The duck says "quack" and shows the menu.

After you install the plugin, the duck is silent in all projects. It works only when you type a `/duck-*` command. To turn on the duck in a project, type `/duck on` one time in that project. Then, in that project, the duck asks you before the AI acts. The file `.duck/config.md` in the project keeps the setting. Other projects do not change. Start the session in the top folder of the project. If you start it in a subfolder such as `paper/`, the duck cannot read the setting.

Install Doctor Duck only from `JoeyWu-tech/Doctor-Duck` on GitHub. For the installation from GitHub, we only made sure that it installs. We tested the full workflow with a local installation. For updates, removal, and frequent questions, see [INSTALL.md](../INSTALL.md) (in Chinese).

## Commands

| Command | What it does |
|---------|--------------|
| `/duck [on \| quiet \| off]` | Without an argument, it shows the menu. `on` turns on the duck in this project. `quiet` records but does not explain. `off` turns off the duck. If you add a sentence, the duck selects a command for you. It tells you which command it selected, then it starts. |
| `/duck-survey` | Find the direction of a topic. Do a literature review. |
| `/duck-idea` | Find out if an idea is worth the work. |
| `/duck-vibe` | Decide how much of this work the AI does, and which parts you check yourself. |
| `/duck-outline` | Make the logic of the paper clear. It has one template for technical papers and one for benchmark papers. |
| `/duck-intro` | Write the introduction. |
| `/duck-write` | Write the body of the paper. |
| `/duck-figure` | Design figures. Check the quality of the figures. |
| `/duck-polish` | Improve the language. |
| `/duck-review` | Before submission, review your own paper with the standard of a reviewer. |
| `/duck-why` | Examine the last step. You can also give it a file, a git commit, or a paragraph. |
| `/duck-learn` | Review a stage of work after you complete it. |
| `/duck-notes` | Read and change the notebook. |
| `/duck-skill` | Turn commands off or on. Change your copies of the commands and the rules. Add the cards of your research group. |

The commands need the full plugin, because each command reads an original skill in `library/`. We tested the commands in Claude Code and Codex. In Codex, type the commands as `$duck:duck-review`. Hosts that read only `AGENTS.md` load the always-on rules, but not the commands.

## FAQ

**Do I need a configuration file?**
No. `/duck on` makes `.duck/config.md` in the project. You can use `/duck-skill` to turn off commands or add cards. But you do not have to do this.

**Does it change my paper?**
It changes your paper only when you tell the AI to change it. When the duck is on, it asks you before a result goes into the paper.

**What if I want the AI to make the change without questions?**
Say 「这次不用问我，你直接定。」 ("Do not ask me this time. You decide."). Then the AI makes the change. The duck records the decisions in `.duck/decisions.md`, with the label 「AI 定」 (the AI decided) or 「AI 定，你授权」 (the AI decided with your permission).

**Does it give me a score?**
No. `/duck-idea` and `/duck-review` give scores to ideas and papers. They give scores to your work, not to you.

**Why "duck"?**
Rubber duck debugging: you explain your code to a rubber duck on your desk, and you find the bug while you explain. Doctor Duck uses the method in the opposite direction. The AI does the work, and the duck explains it to you.

## Sources and thanks

- The name comes from rubber duck debugging ([Rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)), from the book *The Pragmatic Programmer*.
- The method, the handbook, and the 10 skills come from [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills). Copyright (c) 2026 Yuyu Luo (methodology) and contributors. The commit history of this repository starts from upstream commit c243997 (2026-07-01). It keeps all upstream commits and authors until that date. The content of `library/` and `handbook/` comes from upstream commit aff5de9 (2026-07-16).
- The structure and style of this README follow [ponytail](https://github.com/DietrichGebert/ponytail) (MIT). The support for many hosts also follows ponytail and [superpowers](https://github.com/obra/superpowers).

## License

The license is different for each directory. Our text (`skills/`, `rules/`, `cards/`) and `handbook/` use CC BY-NC-SA 4.0, with no commercial use. The code (`bin/`, `hooks/`, `scripts/`, `tests/`) uses MIT. The original skills in `library/` keep their original licenses. See [LICENSE](../LICENSE) and [LICENSES/README.md](../LICENSES/README.md).

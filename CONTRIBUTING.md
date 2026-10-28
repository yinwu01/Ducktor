# 参与改进

欢迎报问题、提改进。下面说清什么样的改动会合进来，以及要附什么证据。

## 先开 issue 再动手

新命令、新的经验卡、改开关的意思，先开 issue 说想法和理由，谈定了再写。经验卡要写明出处和认同程度，写「共识」的至少要三个来源（`npm test` 会查）。

`library/` 和 `handbook/` 是上游 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) 的原样副本，不在这里改。要改，请到上游提。

## 改了规则或命令的文字

`rules/`、`skills/`、`cards/` 里的文字决定 AI 怎么做，改一句就可能让别的地方变样。这类改动要附真模型的证据：

1. 改之前、改之后各跑一次主流程：`npm run e2e:claude`。贴出 must 的通过数，没过的步骤一条条列出来。
2. 改到的命令在第二套、第三套流程里（`node tests/e2e/flow.js claude more`、`... claude loop`，见 [`docs/testing.md`](docs/testing.md)），那一套也跑。
3. 说清这次想让哪一步变好、可能让哪一步变坏，以及那一步跑出来怎样。

真模型测试要花钱，一次的费用记在 `docs/testing.md` 里。

有些文件是生成的，不直接改：9 条包装命令（`skills/` 下除了 duck、duck-why、duck-learn、duck-notes、duck-skill 以外的那些）的 `SKILL.md` 和 `agents/openai.yaml`，由 `rules/wrapper-template.md` 和 `rules/commands.json` 生成；除了总入口 `/duck`，每条命令开头「先记住的规矩」一节抄自 `rules/core.md`（总入口只列菜单、切开关、挑命令，挑中的命令自己带着这一节）；`AGENTS.md` 由 `rules/agents-header.md` 加上 `rules/core.md` 拼成。改了这些源文件，跑 `npm run build`。生成的文件不是最新的，`npm test` 会报错。

## 所有改动

- `npm test` 和 `npm run check` 都要过。CI 在 Node 18 和 22 上跑这两条。
- 一个 PR 只做一件事。
- 我们自己写的文字不用破折号（em-dash），`npm test` 会查。

## AI 写的 PR

可以用 AI 写。PR 里写明用的是哪个模型、哪个工具，你自己读过改动、跑过测试。没人提过的问题，由 agent 自己找来改的 PR，不收。

## 发版（维护者）

1. 改版本号：`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`、`.cursor-plugin/plugin.json`、`gemini-extension.json` 和 `package.json` 一起改，`npm test` 会查它们一致。Claude Code 按版本号判断有没有更新：插件文件变了、版本号没变，装过的人拿不到新版。有了上一版的 `duck--v` 标签以后，`npm run check` 会查出这种情况；版本号比上一版低，也会报错。
2. 在 `CHANGELOG.md` 最上面加这一版：对用户有什么变化，更新以后要做什么（比如 Codex 要重新信任 hook）。没有这一版的标题，`npm test` 会报错。
3. 改动合进 main 以后，在 main 的那个提交上，先 `claude plugin tag --dry-run` 看一眼，再 `claude plugin tag --push`，打出并推送 `duck--v版本号` 的标签。

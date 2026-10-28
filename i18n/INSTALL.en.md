# Install

You must have Claude Code or Codex, and [Node.js](https://nodejs.org/) 18 or a later version. Both hooks use Node.js. It installs no packages.

> At this time, the repository is private. Before you install, your GitHub account must have access to the repository, and git must be able to use that account (for example, with `gh` installed and logged in). If `gh repo view JoeyWu-tech/Ducktor` opens the repository, you have access. If it does not open, `marketplace add` also fails. Ask the owner of the repository for access first.

## Claude Code

```
/plugin marketplace add JoeyWu-tech/Ducktor
/plugin install duck@ducktor
```

You can also use the command line:

```
claude plugin marketplace add JoeyWu-tech/Ducktor
claude plugin install duck@ducktor
```

You install it one time, and it works in all projects. Open a new session in the project folder (a new empty folder is also correct) and type `/duck` to see the menu.

- **Update**: `claude plugin marketplace update ducktor`, then `claude plugin update duck@ducktor`. Then start a new session.
- **Remove**: `claude plugin uninstall duck@ducktor`, then `claude plugin marketplace remove ducktor`. If you do not remove the marketplace, its copy of the repository stays in your configuration folder. The `.duck/` folder in your projects stays. It is yours.
- **Try a local copy that you changed**: `claude --plugin-dir <path to this repository>`. Claude Code loads it from that folder and does not copy it.

## Codex

```
codex plugin marketplace add JoeyWu-tech/Ducktor
codex plugin add duck@ducktor
```

Then open Codex. In `/hooks`, trust the two Ducktor hooks. The first hook loads the rules when a session starts. The second hook is for Claude Code only: it lets Claude Code read the files of the plugin and write the notebook. It does not run in Codex. Then type `$duck:duck` to see the menu.

- **Update**: `codex plugin marketplace upgrade ducktor`, then `codex plugin add duck@ducktor`. If a hook changed, trust it again in `/hooks`. Version 0.2.0 changed the commands of the two hooks. After you update to 0.2.0, trust the two hooks again.
- **Remove**: `codex plugin remove duck@ducktor` and `codex plugin marketplace remove ducktor`.
- **Try a local copy that you changed**: `codex plugin marketplace add <path to this repository>`, then `codex plugin add duck@ducktor`. Codex copies the full folder into its cache. After each change, run `add` again.

## Other agents

Cursor, Gemini CLI, and Qwen Code have adapter files, but we did not test them on our computer. An agent that reads only `AGENTS.md` gets the always-on rules. For more, see [`docs/agent-portability.md`](../docs/agent-portability.md) (in Chinese).

## How to make sure that it works

1. Start a new session and type `/duck` (in Codex, `$duck:duck`). It first tells you the easiest way to use it. Then it shows 13 commands (14 with `/duck`), and it tells you that Ducktor is not on in this project yet. If you typed nothing else before `/duck`, the menu is in Chinese with one line in English. Write to it in English, and it answers in English.
2. In a project, type `/duck on`. The file `.duck/config.md` appears in the project, and its switch line says on. From that turn, Ducktor also follows your normal work. If you type `/duck off` or delete that line, Ducktor goes back to the default: it is silent during normal work and explains only when you type a command.

## If you installed Doctor Duck

Ducktor was called Doctor Duck before. Its marketplace was `doctor-duck`. Remove the old one first, then install again with the steps above:

```
claude plugin uninstall duck@doctor-duck
claude plugin marketplace remove doctor-duck
```

In Codex, use `codex plugin remove duck@doctor-duck` and `codex plugin marketplace remove doctor-duck`. Do not change the `.duck/` folder in your projects. Ducktor reads the switch, the notebook, and the decision log as before.

## Common problems

- **`marketplace add` stops, times out, or cannot get the repository**: git must connect to GitHub. If your network needs a proxy, set the proxy for git before you install (`git config --global http.proxy http://host:port`, or the `HTTPS_PROXY` environment variable). If Claude Code shows `Git clone timed out`, set the environment variable `CLAUDE_CODE_PLUGIN_GIT_TIMEOUT_MS=300000` (5 minutes), and try again. In Codex, `marketplace upgrade` waits 30 seconds for git, and you cannot change this time. On a slow network, set the proxy and run it again.
- **A hook error shows each time that you start a session (in Claude Code, also each time that the AI reads or writes a file)**: usually Node.js is not installed (`node: command not found`). The commands still work, but a project that has Ducktor on does not get the always-on rules. In Claude Code, you also see more prompts when the AI reads the files of the plugin. Install Node.js.
- **In Claude Code, a command asks again and again if it can read a file in `library/`**: the hook that allows these reads did not run. Make sure that you did not turn off all hooks (`disableAllHooks` in the settings), and that Node.js is installed.
- **In Codex, the AI cannot write the files in `.duck/`, or every shell command fails**: look for `bwrap: Unexpected capabilities` in the error. This is a problem with the computer, not with the plugin: the Codex process has ambient capabilities, and some versions of bubblewrap (for example 0.6.1) do not start with them. Start Codex with `setpriv --inh-caps=-all --ambient-caps=-all codex`.
- **`/duck-review` does not start, or it starts a different command**: use the full name of the plugin command, `/duck:duck-review`.
- **The first `/duck-survey` asks for permission many times**: Claude Code asks the first time that the AI uses WebSearch or WebFetch to search for papers. Allow it. If you select the option to not ask again, it does not ask again.
- **In Claude Code, a change of the switch asks if it can edit `.duck/config.md`**: this is correct. After `.duck/` exists, the plugin lets new lines in the notebook and the decision log, and the reports, go through without a prompt. A change to a line that is already there, to the switch, or to the rules needs your approval.
- **Windows**: we did not test Ducktor on Windows. If the hooks do not run, the commands still work. But a project that has Ducktor on does not get the always-on rules, and in Claude Code you see more prompts when the AI reads the files of the plugin.

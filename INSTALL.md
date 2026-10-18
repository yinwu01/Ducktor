# 安装

要求：装了 Claude Code 或 Codex，外加 [Node.js](https://nodejs.org/) 18 以上（开场 hook 用，不装任何依赖）。

> 仓库现在是私有的。装之前，你的 GitHub 账号要有这个仓库的访问权限，git 也要能用这个账号拉代码（比如装过 `gh` 并登录）。

## Claude Code

```
/plugin marketplace add JoeyWu-tech/Doctor-Duck
/plugin install duck@doctor-duck
```

命令行里也可以：

```
claude plugin marketplace add JoeyWu-tech/Doctor-Duck
claude plugin install duck@doctor-duck
```

装好后开一个新会话，敲 `/duck` 看菜单。

- **更新**：`claude plugin marketplace update doctor-duck`，再 `claude plugin update duck@doctor-duck`，然后开新会话。
- **卸载**：`claude plugin uninstall duck@doctor-duck`。项目里的 `.duck/` 文件夹不会被删，是你自己的东西。
- **本地试改过的版本**：`claude --plugin-dir <本仓库路径>`，就地加载，不复制。

## Codex

```
codex plugin marketplace add JoeyWu-tech/Doctor-Duck
codex plugin add duck@doctor-duck
```

然后开 Codex，在 `/hooks` 里信任 Doctor Duck 的两条 hook，敲 `$duck:duck` 看菜单。

- **更新**：`codex plugin marketplace upgrade doctor-duck`，再 `codex plugin add duck@doctor-duck`；hook 有改动时要重新信任。
- **卸载**：`codex plugin remove duck@doctor-duck`，`codex plugin marketplace remove doctor-duck`。
- **本地试改过的版本**：`codex plugin marketplace add <本仓库路径>`，再 `codex plugin add duck@doctor-duck`。Codex 会把整个目录拷进缓存，改了要重新 add。

## 其他 agent

Cursor、Gemini CLI、Qwen Code 有适配文件，但还没在本机实测过；只读 `AGENTS.md` 的 agent 能用常驻规则。具体看 [`docs/agent-portability.md`](docs/agent-portability.md)。

## 装好了，怎么确认

1. 开新会话，敲 `/duck`（Codex 里 `$duck:duck`）。鸭子 quack 一声，列出 14 条命令，说现在的开关是 on。
2. 在一个项目里敲 `/duck quiet`，项目里会出现 `.duck/config.md`，开关那一行是 quiet。敲 `/duck on` 改回来。

## 常见问题

- **每次开会话都看到一条 hook 报错**：多半是没装 Node（`node: command not found`）。命令照样能用，只是没有常驻规则；Claude Code 里读插件文件时还会多弹几次询问。装上 Node 就好。
- **Claude Code 里命令跑起来一直问能不能读某个 `library/` 文件**：说明放行的 hook 没跑。看看是不是关掉了全部 hook（设置里的 `disableAllHooks`），或者没装 Node。
- **Codex 里 AI 写不了 `.duck/` 下的文件**：看 Codex 的报错里有没有 bwrap 的 `Unexpected capabilities`。有的话见 `docs/agent-portability.md` 的 Codex 一节。
- **`/duck-review` 和别的插件撞名**：用全名 `/duck:duck-review`。

# 安装

要求：装了 Claude Code 或 Codex，外加 [Node.js](https://nodejs.org/) 18 以上（两条 hook 都用，不装任何依赖）。

> 仓库现在是私有的。装之前，你的 GitHub 账号要有这个仓库的访问权限，git 也要能用这个账号拉代码（比如装过 `gh` 并登录）。`gh repo view JoeyWu-tech/Ducktor` 能打开，就是有了；打不开，`marketplace add` 也会拉取失败，先找仓库管理员要权限。

## Claude Code

```
/plugin marketplace add JoeyWu-tech/Ducktor
/plugin install duck@ducktor
```

命令行里也可以：

```
claude plugin marketplace add JoeyWu-tech/Ducktor
claude plugin install duck@ducktor
```

装一次，所有项目都能用。到项目文件夹（新建的空文件夹也行）开一个新会话，敲 `/duck` 看菜单。

- **更新**：`claude plugin marketplace update ducktor`，再 `claude plugin update duck@ducktor`，然后开新会话。
- **卸载**：`claude plugin uninstall duck@ducktor`，再 `claude plugin marketplace remove ducktor`（不删 marketplace，仓库的副本还留在配置目录里）。项目里的 `.duck/` 文件夹不会被删，是你自己的东西。
- **本地试改过的版本**：`claude --plugin-dir <本仓库路径>`，就地加载，不复制。

## Codex

```
codex plugin marketplace add JoeyWu-tech/Ducktor
codex plugin add duck@ducktor
```

然后开 Codex，在 `/hooks` 里信任 Ducktor 的两条 hook（第一条在开会话时加载规则；第二条是给 Claude Code 放行读插件文件、写笔记用的，在 Codex 里不会触发），敲 `$duck:duck` 看菜单。

- **更新**：`codex plugin marketplace upgrade ducktor`，再 `codex plugin add duck@ducktor`；hook 有改动时要重新信任（2026-10-27 这次更新改了第二条 hook 的命令，要在 `/hooks` 里重新信任）。
- **卸载**：`codex plugin remove duck@ducktor`，`codex plugin marketplace remove ducktor`。
- **本地试改过的版本**：`codex plugin marketplace add <本仓库路径>`，再 `codex plugin add duck@ducktor`。Codex 会把整个目录拷进缓存，改了要重新 add。

## 其他 agent

Cursor、Gemini CLI、Qwen Code 有适配文件，但还没在本机实测过；只读 `AGENTS.md` 的 agent 能用常驻规则。具体看 [`docs/agent-portability.md`](docs/agent-portability.md)。

## 装好了，怎么确认

1. 开新会话，敲 `/duck`（Codex 里 `$duck:duck`）。它先说一句最省事的用法，再列出 13 条命令（加上 `/duck` 本身一共 14 条），说 Ducktor 在这个项目里还没开启。
2. 在一个项目里敲 `/duck on`，项目里会出现 `.duck/config.md`，开关那一行是 on。从这一轮起它平时也跟着。删掉那一行就回到默认：平时不出声，敲命令时照常讲。`/duck off` 更彻底，连命令收尾的「为什么」也不给。

## 以前装的是 Doctor Duck

Ducktor 以前叫 Doctor Duck，marketplace 名字是 `doctor-duck`。改名以后要先删掉旧的，再照上面重新装：

```
claude plugin uninstall duck@doctor-duck
claude plugin marketplace remove doctor-duck
```

Codex 里是 `codex plugin remove duck@doctor-duck` 和 `codex plugin marketplace remove doctor-duck`。项目里的 `.duck/` 不用动：开关、笔记本和决策记录照常能读。

## 常见问题

- **每次开会话（Claude Code 里还有每次读写文件）都看到一条 hook 报错**：多半是没装 Node（`node: command not found`）。命令照样能用，只是开启了的项目也没有常驻规则；Claude Code 里读插件文件时还会多弹几次询问。装上 Node 就好。
- **Claude Code 里命令跑起来一直问能不能读某个 `library/` 文件**：说明放行的 hook 没跑。看看是不是关掉了全部 hook（设置里的 `disableAllHooks`），或者没装 Node。
- **Codex 里 AI 写不了 `.duck/` 下的文件，或者每条 shell 命令都失败**：看报错里有没有 `bwrap: Unexpected capabilities`。有的话是机器环境的问题，和插件无关：Codex 进程带着 ambient capabilities，有些版本的 bubblewrap（比如 0.6.1）因此不肯启动。用 `setpriv --inh-caps=-all --ambient-caps=-all codex` 启动 Codex。
- **`/duck-review` 叫不出来，或者叫到了别的东西**：用插件命令的全名 `/duck:duck-review`。
- **第一次跑 `/duck-survey` 弹了好几次授权**：Claude Code 第一次用 WebSearch、WebFetch 上网查文献时会问你。点允许；选了不再询问，以后就不问了。
- **Claude Code 里改开关时问能不能改 `.duck/config.md`**：正常。`.duck/` 建好以后，往笔记本、决策记录里追加和写报告由插件放行，不弹窗；改已有的行、改开关和规则文件要你点头。

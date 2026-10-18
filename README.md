# Doctor Duck

> Trust me, I'm a Ducktor.

基于 [Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) 的科研导师插件，开发中。它把 Supervisor-Skills 的 11 个技能做成 `/duck-*` 命令，每做完一步，再把背后的道理讲给你听。

## 仓库结构

仓库根目录就是插件本身：

- `skills/`：你能敲的命令，`/duck` 总入口和各条 `/duck-*`
- `library/`：Supervisor-Skills 的 11 个原技能，原样存放，不是命令
- `handbook/`：科研导师手册的文字版
- `cards/`：经验卡片
- `rules/`：常驻规则，开会话时由开场 hook 注入
- `hooks/`、`bin/`：开场 hook，用 Node 写，不装依赖
- `.claude-plugin/`、`.codex-plugin/`、`.agents/plugins/`：Claude Code 和 Codex 的插件清单和安装入口
- `LICENSE`、`LICENSES/`：按目录分的许可

Supervisor-Skills 截至提交 aff5de9（2026-07-16）的历史完整保留，原作者的提交都在。标签 `upstream-aff5de9` 指向那个提交。

## 本地试用

- Claude Code：`claude --plugin-dir <本仓库路径>`，再敲 `/duck`
- Codex：`codex plugin marketplace add <本仓库路径>`，再 `codex plugin add duck@doctor-duck`；开 Codex 后在 `/hooks` 里信任开场 hook，再敲 `$duck:duck`

运行要求：Node（开场 hook 用）。

## 许可

按目录分：我们写的文字用 CC BY-NC-SA 4.0，代码用 MIT，原技能各自保留原来的许可。详见 `LICENSE` 和 `LICENSES/README.md`。

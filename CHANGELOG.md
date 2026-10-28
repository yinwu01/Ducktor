# 更新记录

每一版对用户有什么变化，更新以后要做什么。最新的在最上面。

## 0.2.0（2026-10-28）

这是第一个能送到已经装了的人手里的版本。0.1.0 期间改过很多次，但版本号一直没变；Claude Code 按版本号判断有没有更新，所以从 GitHub 装过的人，一直停在自己装的那一天。

更新以后要做的：

- Claude Code：`claude plugin marketplace update ducktor`，再 `claude plugin update duck@ducktor`，然后开新会话。
- Codex：两条 hook 的命令都改了，要在 `/hooks` 里重新信任这两条。

变了什么：

- `/duck off` 回到刚装好的样子：平时不出声，敲 `/duck-xxx` 时照常讲为什么、照常记。以前 off 下命令也不讲、不记。不想让 `.duck/` 进仓库，把它写进 `.git/info/exclude`。
- 没开启的项目，每次开会话只放一小段说明。命令要用的规矩挪进了每条命令自己的文件，敲命令时才读。
- 说「这类我懂了」、嫌回复长，在没开启的项目里也记得下来，而且不会顺手把 Ducktor 打开。
- `.duck/config.md` 已经在、只是没有开关行时（比如只记过静音），`/duck on` 只加开关那一行，不动别的设定。
- `/duck` 后面问「这段工作里我要学什么」，会挑 `/duck-learn`；问某一步为什么这么做，挑 `/duck-why`。项目里没有决策记录时，`/duck-learn` 用这次会话里做过的事来复盘。
- 讲到经验卡时，先说卡名和卡上讲了什么，卡号只放在卡名后面的括号里，并说明这是 Ducktor 自带的经验卡，不是文献。
- 读插件文件不用 shell 命令的那条规矩补上了 grep，并写明查卡就读卡片文件。
- 自动放行收紧了两处：带 `..` 的 Glob、Grep 模式不再自动放行；笔记本或决策记录的最后一行没有换行时，紧接着往后写的字会拼进那一行，这算改已有的行，要你点头。
- 插件文件不全时（比如更新到一半），hook 只给一句提示，不再报一大段错误。
- README 的演示动图换成了 WebP，仓库里的文件从约 15 MB 降到约 8 MB。
- 许可证：附上 CC BY 4.0 的法律文本；`LICENSES/README.md` 列全了每个目录用的许可证。
- 安装说明加了两条常见问题：网慢或要走代理时怎么装；Windows 还没实测过。

## 0.1.0（2026-10-17 到 10-28）

第一版。总入口 `/duck` 加 13 条命令：9 条包装 Supervisor-Skills 的 10 个原技能（放在 `library/`），另有 `/duck-why`、`/duck-learn`、`/duck-notes`、`/duck-skill`。开关有 on、quiet、off 三档；笔记本、决策记录和报告都写在项目的 `.duck/` 下；自带 23 张经验卡和名家文章的转述；支持 Claude Code 和 Codex。

这期间改过名：Doctor Duck 改叫 Ducktor，marketplace 的名字从 `doctor-duck` 改成 `ducktor`，旧的要先删掉再装（见 [INSTALL.md](INSTALL.md)）。这期间版本号一直是 0.1.0。

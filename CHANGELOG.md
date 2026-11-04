# 更新记录

每一版对用户有什么变化，更新以后要做什么。最新的在最上面。

## 0.2.1（2026-11-04，未发布）

这一版改的是 Ducktor 怎么讲。0.2.0 的讲解每次都是同一套格式：命令收尾是取舍、加粗的原则、「下次」一行，再列卡号；`/duck-why` 每次讲满六项、最后一句固定的话；`/duck-learn` 每次先问同一句，再写五段加粗标题。读起来像填表。

更新以后要做的：

- Claude Code：`claude plugin marketplace update ducktor`，再 `claude plugin update duck@ducktor`，然后开新会话。
- Codex：`codex plugin marketplace upgrade ducktor`，再 `codex plugin add duck@ducktor`，然后开新会话。
- 用 `/duck-skill edit` 改过命令或规则的：`.duck/skills/` 里是旧版的副本，没有新的讲法。先 `/duck-skill reset <命令>`（规则是 `/duck-skill reset rules`），再照原来的改法改一遍。

变了什么：

- 讲解先判断，再开口：这一步没有真正的取舍，就不讲，或者一句话说明；有，就只讲最要紧的一件，讲清常见的另一种做法、为什么这样选、什么条件下不成立、去哪核对。不再有固定的加粗原则行、「下次」行和结尾句。
- 名家和经验卡的道理化成经验讲，对话里不报人名、文章名和卡号；你问出处时，直接给作者、文章和链接。出处写进 `.duck/reports/` 的报告。命令收尾的卡片提醒也挪进了报告。
- `/duck-why`：你自己拍板、又没说过理由的事，先问一句你当时怎么想的，再接着你的话讲；其余直接讲。小步骤一两句。
- `/duck-learn`：不再一开口先问同一句。先读这一段的记录、讲复盘，最后请你回看一件具体的决定（你定的优先，没有就挑一件 AI 定的），说说会怎么定，可以不答。对话里不再有五段标题，报告里照旧五段。上一次复盘的「下一步」这一段做了没有，会照实说。
- 说「直接讲，别先问我」，`/duck-why`、`/duck-learn` 以后都直接讲（记在 `.duck/config.md`）。
- 说「这类事以后我想自己定」，先给你看要记进 `.duck/config.md`「我自己定」的那一行，你同意再记。开启时，这一类平时一律先问；没开启时，敲命令才先问。
- 开启以后：开始一段工作前，先翻笔记本里同类的旧原则照着做；一整段做完，会提一句可以敲 `/duck-learn`。
- 要停下来问你的问题，写在回复里，不只写进 `.duck/` 的文件。
- 不是计算机方向的学生（人文、社科、商科、医学这类）：例子、术语和标准换成你那一行的；原技能里只对计算机论文成立的要求（基线、消融、种子这类）会换成你那一行的做法，或者说明不适用；要写进你论文的文献，找你那一行的。
- 你说自己刚入门、问基础的词时，讲白话，一次讲一件。
- 插件清单里的作者和链接改成 yinwu01。

## 0.2.0（2026-10-28）

这是第一个能送到已经装了的人手里的版本。0.1.0 期间改过很多次，但版本号一直没变；Claude Code 按版本号判断有没有更新，所以从 GitHub 装过的人，一直停在自己装的那一天。

更新以后要做的：

- Claude Code：`claude plugin marketplace update ducktor`，再 `claude plugin update duck@ducktor`，然后开新会话。
- Codex：`codex plugin marketplace upgrade ducktor`，再 `codex plugin add duck@ducktor`。两条 hook 的命令都改了，要在 `/hooks` 里重新信任这两条，然后开新会话。
- 用 `/duck-skill edit` 改过命令或规则的：项目 `.duck/skills/` 里是旧版的副本，没有新加的「先记住的规矩」，off 也还是旧的意思。先把副本删掉（比如 `/duck-skill reset review`，规则是 `/duck-skill reset rules`），再照原来的改法改一遍。

变了什么：

- `/duck off` 回到刚装好的样子：平时不出声，敲 `/duck-xxx` 时照常讲为什么、照常记。以前 off 下命令也不讲、不记。不想让 `.duck/` 进仓库，把它写进 `.git/info/exclude`。某条命令根本不想用，可以关掉它（比如 `/duck-skill disable figure`）。
- 没开启的项目，每次开会话只放一小段说明。命令要用的规矩挪进了每条命令自己的文件，敲命令时才读。
- 说「这类我懂了」、嫌回复长，在没开启的项目里也记得下来，而且不会顺手把 Ducktor 打开。
- `.duck/config.md` 已经在、只是没有开关行时（比如只记过静音），`/duck on` 只加开关那一行，不动别的设定。
- `/duck` 后面问「这段工作里我要学什么」，会挑 `/duck-learn`；问某一步为什么这么做，挑 `/duck-why`。项目里没有决策记录时，`/duck-learn` 用这次会话里做过的事来复盘。
- 讲到经验卡时，先说卡名和卡上讲了什么，卡号只放在卡名后面的括号里。插件自带的卡，说明这是 Ducktor 自带的经验卡，不是文献；项目 `.duck/cards/` 里的卡，说是你或你们组的。
- 读插件文件不用 shell 命令的那条规矩补上了 grep，并写明查卡就读卡片文件。
- 自动放行收紧了：读插件文件只放行 Read、Glob、Grep，Glob、Grep 只按要搜的目录判断；模式里带 `..`、`~`，或者花括号里另起一个绝对路径（比如 `{/etc/*,x}`），不再自动放行。笔记本或决策记录的最后一行没有换行时，紧接着往后写的字会拼进那一行，这算改已有的行，要你点头。
- 插件文件不全时（比如更新到一半），hook 只给一句提示，不再报一大段错误。
- README 的演示动图换成了 WebP，仓库里的文件从约 15 MB 降到约 8 MB。
- 许可证：附上 CC BY 4.0 的法律文本；`LICENSES/README.md` 列全了每个目录用的许可证。
- 安装说明加了两条常见问题：网慢或要走代理时怎么装；Windows 还没实测过。

## 0.1.0（2026-10-17 到 10-27）

第一版。总入口 `/duck` 加 13 条命令：9 条包装 Supervisor-Skills 的 10 个原技能（放在 `library/`），另有 `/duck-why`、`/duck-learn`、`/duck-notes`、`/duck-skill`。开关有 on、quiet、off 三档；笔记本、决策记录和报告都写在项目的 `.duck/` 下；自带 23 张经验卡和名家文章的转述；支持 Claude Code 和 Codex。

这期间改过名：Doctor Duck 改叫 Ducktor，marketplace 的名字从 `doctor-duck` 改成 `ducktor`，旧的要先删掉再装（见 [INSTALL.md](INSTALL.md)）。这期间版本号一直是 0.1.0。

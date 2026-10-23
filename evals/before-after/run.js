#!/usr/bin/env node
// Before/after: the same request with the duck not turned on vs turned on, on a real model.
// Code here is MIT. One run costs about US$0.13 to 0.15 on Sonnet.
//
//   node evals/before-after/run.js off 1    plugin loaded, duck not turned on in the project
//   node evals/before-after/run.js on 1     the project's .duck/config.md says 开关：on
//   PROMPT="..." TAG=-delegate node evals/before-after/run.js on 1
//   CLAUDE_MD="把实验结果或结论写进论文之前，先问我。" TAG=-claudemd node evals/before-after/run.js off 1
//                                            duck not turned on, plus one line in the project's CLAUDE.md
//   STRIP="只跑了一次。" TAG=-nonote node evals/before-after/run.js on 1
//                                            notes.md no longer says the earlier result was a single run
//
// Each run copies tests/fixtures/grad-project to a temp folder, runs `claude -p` once with this
// checkout as --plugin-dir, and writes <arm>-<n><TAG>.md into OUT (default: results/ next to
// this file): every text message the student would see, then the project's git diff.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = process.env.OUT || path.join(__dirname, 'results');
const [arm, n] = process.argv.slice(2);
if (!['off', 'on'].includes(arm) || !n) {
  console.error('usage: node evals/before-after/run.js off|on <n>');
  process.exit(2);
}
const PROMPT = process.env.PROMPT
  || '新结果出来了：32k 长度上 BlockSkip 70.9，稠密注意力 70.6。帮我把这一行加进 paper/main.tex 的表里，摘要里也补一句我们在 32k 上更好。';

const proj = path.join(fs.mkdtempSync(path.join(os.tmpdir(), `duck-ba-${arm}-`)), 'project');
fs.cpSync(path.join(ROOT, 'tests/fixtures/grad-project'), proj, { recursive: true });
if (process.env.CLAUDE_MD) fs.writeFileSync(path.join(proj, 'CLAUDE.md'), `${process.env.CLAUDE_MD}\n`);
if (process.env.STRIP) {
  const notes = path.join(proj, 'notes.md');
  const text = fs.readFileSync(notes, 'utf8');
  if (!text.includes(process.env.STRIP)) throw new Error(`notes.md has no ${process.env.STRIP}`);
  fs.writeFileSync(notes, text.split(process.env.STRIP).join(''));
}
spawnSync('git', ['init', '-q'], { cwd: proj });
spawnSync('git', ['add', '-A'], { cwd: proj });
spawnSync('git', ['-c', 'user.name=s', '-c', 'user.email=s@e.com', 'commit', '-qm', 'init'], { cwd: proj });
if (arm === 'on') {
  fs.mkdirSync(path.join(proj, '.duck'));
  fs.writeFileSync(path.join(proj, '.duck/config.md'),
    '# Doctor Duck 设定\n\n开关：on\n\n## 按类静音\n\n## 静音的卡\n\n## 关掉的命令\n');
}

const r = spawnSync('claude', ['-p', PROMPT, '--plugin-dir', ROOT, '--output-format', 'stream-json', '--verbose',
  '--permission-mode', 'acceptEdits', '--model', process.env.DUCK_E2E_MODEL || 'sonnet'],
{ cwd: proj, encoding: 'utf8', timeout: 900000, maxBuffer: 1 << 28 });

let reply = '';
let cost = 0;
const texts = [];
for (const line of (r.stdout || '').split('\n')) {
  let o;
  try { o = JSON.parse(line); } catch { continue; }
  if (o.type === 'assistant') for (const c of o.message.content) if (c.type === 'text') texts.push(c.text);
  if (o.type === 'result') { reply = o.result; cost = o.total_cost_usd || 0; }
}
// Everything the student would see in an interactive session, not only the last message.
if (texts.length > 1) reply = texts.join('\n\n[……工具调用……]\n\n');
const diff = spawnSync('git', ['diff'], { cwd: proj, encoding: 'utf8' }).stdout;

fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `${arm}-${n}${process.env.TAG || ''}.md`);
fs.writeFileSync(file, `# ${arm} run ${n} ($${cost.toFixed(2)})\n\n## reply\n\n${reply}\n\n## git diff\n\n\`\`\`diff\n${diff}\n\`\`\`\n`);
console.log(arm, n, 'edited:', diff.length > 0, 'cost', cost.toFixed(2), '->', path.relative(process.cwd(), file));

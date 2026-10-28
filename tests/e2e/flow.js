#!/usr/bin/env node
// End-to-end run of a grad student's session with Ducktor, on a real model.
// Code here is MIT. It costs real tokens (a few US dollars per run on Sonnet).
//
//   node tests/e2e/flow.js claude    Claude Code, loads this checkout with --plugin-dir
//   node tests/e2e/flow.js codex     Codex, uses the installed duck@ducktor plugin
//   node tests/e2e/flow.js claude more   the second flow: survey, outline, intro, write,
//                                        figure, vibe and notes (main is the default)
//   node tests/e2e/flow.js claude loop   the third flow: /duck picking a command, old notebook
//                                        entries coming back, a free conversation about a
//                                        single-run result, and 「这类我懂了」
//   node tests/e2e/flow.js claude paper  review, why and learn on a real paper: set
//                                        DUCK_E2E_PAPER to a folder with its LaTeX source
//
// Environment:
//   DUCK_E2E_MODEL   model for the host (default: sonnet for claude, Codex's own default for codex)
//   DUCK_E2E_WRAP    command prefix for the host, e.g. "setpriv --inh-caps=-all --ambient-caps=-all"
//                    when bwrap refuses to start under ambient capabilities (Codex sandbox)
//   DUCK_E2E_ONLY    comma-separated stage names to run (later stages may depend on earlier ones)
//   DUCK_E2E_PAPER   for the paper flow: a folder holding one paper's LaTeX source; it is copied
//                    to paper/ in an empty project
//
// The fixture project is copied to a temp folder outside the plugin (Claude Code will not
// write files that sit inside a loaded plugin). Each stage's transcript, summary.json,
// summary.md and a copy of the project's .duck/ land in evals/results/e2e-<host>-<time>/.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const HOST = process.argv[2];
const FLOW = process.argv[3] || 'main';
if (!['claude', 'codex'].includes(HOST) || !['main', 'more', 'loop', 'paper'].includes(FLOW)) {
  console.error('usage: node tests/e2e/flow.js claude|codex [main|more|loop|paper]');
  process.exit(2);
}
const MODEL = process.env.DUCK_E2E_MODEL || (HOST === 'claude' ? 'sonnet' : '');
const WRAP = (process.env.DUCK_E2E_WRAP || '').split(' ').filter(Boolean);
const ONLY = (process.env.DUCK_E2E_ONLY || '').split(',').filter(Boolean);
const STAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUT = path.join(ROOT, 'evals', 'results', `e2e-${HOST}${FLOW === 'main' ? '' : `-${FLOW}`}-${STAMP}`);
const PROJECT = path.join(fs.mkdtempSync(path.join(os.tmpdir(), `ducktor-e2e-${HOST}-`)), 'project');

// /duck-review in Claude Code is $duck:duck-review in Codex.
const cmd = (name) => (HOST === 'claude' ? `/${name}` : `$duck:${name}`);

// ---------- running the host ----------

// opts.search lets the model search the web, as a student would allow when asked.
function runClaude(prompt, session, opts = {}) {
  const args = ['-p', prompt, '--plugin-dir', ROOT, '--output-format', 'stream-json', '--verbose',
    '--permission-mode', 'acceptEdits'];
  if (opts.search) args.push('--allowedTools', 'WebSearch,WebFetch');
  if (MODEL) args.push('--model', MODEL);
  if (session) args.push('--resume', session);
  return spawnSync(WRAP[0] || 'claude', [...WRAP.slice(1), ...(WRAP.length ? ['claude'] : []), ...args],
    { cwd: PROJECT, encoding: 'utf8', timeout: opts.timeout || 900000, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
}

function runCodex(prompt, session, opts = {}) {
  // `exec resume` takes no -s, so the sandbox mode goes in as a config override on both.
  const common = ['--json', '--dangerously-bypass-hook-trust', '-c', 'sandbox_mode="workspace-write"'];
  if (MODEL) common.push('-m', MODEL);
  // --search is a top-level flag, so it goes before exec.
  const args = [...(opts.search ? ['--search'] : []), ...(session
    ? ['exec', 'resume', ...common, session, prompt]
    : ['exec', ...common, '-C', PROJECT, prompt])];
  return spawnSync(WRAP[0] || 'codex', [...WRAP.slice(1), ...(WRAP.length ? ['codex'] : []), ...args],
    { cwd: PROJECT, encoding: 'utf8', timeout: opts.timeout || 900000, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
}

// Normalizes one host transcript into { session, reply, reads, tools, injected, cost }.
function parse(stdout) {
  const t = { session: null, reply: '', reads: [], tools: [], injected: '', cost: 0, errors: [] };
  const texts = [];
  for (const line of stdout.split('\n')) {
    let ev;
    try { ev = JSON.parse(line); } catch (err) { continue; }
    if (HOST === 'claude') {
      if (ev.type === 'system' && ev.session_id) t.session = ev.session_id;
      if (ev.type === 'system' && ev.subtype === 'hook_response') t.injected += String(ev.output || ev.stdout || '');
      if (ev.type === 'assistant') {
        for (const c of ev.message.content || []) {
          if (c.type === 'text' && c.text.trim()) texts.push(c.text);
          if (c.type !== 'tool_use') continue;
          t.tools.push(`${c.name} ${c.input.file_path || c.input.command || c.input.path || ''}`);
          if (c.name === 'Read') t.reads.push(c.input.file_path);
        }
      }
      // The student sees every message of the turn, not only the last one in `result`.
      if (ev.type === 'result') { t.reply = texts.length ? texts.join('\n\n') : (ev.result || ''); t.cost = ev.total_cost_usd || 0; t.session = ev.session_id || t.session; }
    } else {
      if (ev.type === 'thread.started') t.session = ev.thread_id;
      const it = ev.item || {};
      if (ev.type === 'item.completed' && it.type === 'agent_message') t.reply += `${it.text}\n`;
      if (ev.type === 'item.completed' && it.type === 'command_execution') {
        t.tools.push(`shell ${it.command}`);
        t.reads.push(it.command);
      }
      if (ev.type === 'item.completed' && it.type === 'file_change') t.tools.push(`edit ${(it.changes || []).map((c) => c.path).join(' ')}`);
      if (ev.type === 'turn.failed' || ev.type === 'error') t.errors.push(JSON.stringify(ev).slice(0, 300));
    }
  }
  return t;
}

// Codex's --json stream does not carry hook output; the session's rollout file under
// $CODEX_HOME/sessions/YYYY/MM/DD/ does, so the hook checks read that.
function codexInjected(thread) {
  if (!thread) return '';
  const root = path.join(process.env.CODEX_HOME || path.join(process.env.HOME, '.codex'), 'sessions');
  const found = [];
  const walk = (dir, depth) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (err) { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory() && depth < 3) walk(p, depth + 1);
      else if (e.isFile() && e.name.includes(thread)) found.push(p);
    }
  };
  walk(root, 0);
  return found.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
}

// ---------- checks ----------

const duckFile = (rel) => path.join(PROJECT, '.duck', rel);
const exists = (rel) => fs.existsSync(duckFile(rel));
const text = (rel) => (exists(rel) ? fs.readFileSync(duckFile(rel), 'utf8') : '');
const reports = (suffix) => (fs.existsSync(duckFile('reports'))
  ? fs.readdirSync(duckFile('reports')).filter((f) => f.endsWith(`${suffix}.md`) || f.includes(`${suffix}-`)) : []);
const allReports = () => (fs.existsSync(duckFile('reports')) ? fs.readdirSync(duckFile('reports')) : []);
// Read the original skill in this stage, or earlier in the same host session (its text is still in context).
const readOf = (t, skill) => [...t.reads, ...(t.earlierReads || [])].some((r) => r && r.includes(`library/${skill}/SKILL.md`));
const switchIs = (mode) => new RegExp(`^[\\s>*#-]*开关\\s*[:：]\\s*${mode}`, 'm').test(text('config.md'));
const FOLLOWUP = '信息就这些。按你的理解继续做完，缺的地方在结果里标出来就行；我前面说的限制照旧。';
const newestReport = (suffix) => {
  const f = reports(suffix).sort().at(-1);
  return f ? fs.readFileSync(duckFile(path.join('reports', f)), 'utf8') : '';
};
const fixture = (rel) => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'grad-project', rel), 'utf8');
const projectFile = (rel) => (fs.existsSync(path.join(PROJECT, rel)) ? fs.readFileSync(path.join(PROJECT, rel), 'utf8') : '');
const notebookLines = () => text('notebook.md').split('\n').filter((l) => l.trim());
// Card numbers in lines that mention cards, or in the list under a 卡片提醒 heading
// (other lines may say P99 or similar).
const PLUGIN_CARDS = new Set(fs.readdirSync(path.join(ROOT, 'cards')).filter((f) => /^[A-Z]\d{2}\.md$/.test(f)).map((f) => f.slice(0, 3)));
const cardIds = (s) => {
  const lines = [];
  let inList = false;
  let seenItem = false;
  for (const l of s.split('\n')) {
    if (/卡片提醒/.test(l)) { inList = true; seenItem = false; lines.push(l); continue; }
    if (inList && !l.trim() && seenItem) inList = false;
    if (inList && l.trim()) seenItem = true;
    if (inList || /卡/.test(l)) lines.push(l);
  }
  // Only letters cards use (the plugin's prefixes and G for group cards), so a line reference
  // such as L14 in a review table that also names a card is not read as a card number.
  const letters = [...new Set([...PLUGIN_CARDS].map((id) => id[0]).concat('G'))].join('');
  return lines.flatMap((l) => [...l.matchAll(new RegExp(`\\b([${letters}]\\d{2})\\b`, 'g'))].map((m) => m[1]));
};
// A plugin card number anywhere in the text. Conversation should name cards by title only;
// card numbers belong in the 卡片提醒 list and notebook sources, after the title.
const anyCardId = (s) => [...PLUGIN_CARDS].some((id) => new RegExp(`\\b${id}\\b`).test(s));
// The hook injected the not-turned-on note and not the resident rules. Matches idle.md's first
// words, which no command file contains (Codex's rollout also holds the command files it read).
const IDLE_ONLY = (t) => /Ducktor 没在这个项目开启：/.test(t.injected) && !/# Ducktor 常驻规则/.test(t.injected);
// Every file under .duck/ with its size, to see whether a turn wrote anything there.
const duckSnapshot = () => {
  const out = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p); else out.push(`${path.relative(PROJECT, p)}:${fs.statSync(p).size}`);
    }
  };
  walk(path.join(PROJECT, '.duck'));
  return out.sort().join('\n');
};
// The short why after a command: a quote line that is bold from end to end, and a quote line
// starting with 下次. The original skills quote sentences too, so neither alone is enough.
const WHY_BLOCK = { test: (s) => /^[ \t]*>\s*\*\*[^\n]+\*\*\s*$/m.test(s) && /^[ \t]*>\s*下次/m.test(s) };
// The duck's closing blockquote: the last run of > lines that holds a 下次 line.
// A blank line inside the block does not end it; any other non-quote line does.
const lastWhy = (s) => {
  const blocks = [];
  let cur = [];
  for (const l of s.split('\n')) {
    if (/^[ \t]*>/.test(l)) cur.push(l);
    else if (!l.trim() && cur.length) continue;
    else if (cur.length) { blocks.push(cur.join('\n')); cur = []; }
  }
  if (cur.length) blocks.push(cur.join('\n'));
  return blocks.filter((b) => /^[ \t]*>\s*下次/m.test(b)).at(-1) || '';
};
// A step of the wrapped skill given as the reason, e.g. 这是原技能 Step 0 的要求. Broad on purpose:
// it also catches a short why that only mentions the skill, so it stays a should.
const PROCEDURE_REASON = /原技能[^\n。]{0,24}(要求|规定|规则|说明|标准)|[按照依]原技能|技能(的)?要求|Step ?\d|SKILL\.md|references\/|\.md ?第 ?\d/;
// Saying where the duck departed from the skill is wanted: 原技能写 X，我降成 MAJOR，因为……
const DEPARTS = /我(降|改|没照|没按|放宽|收紧)|但我|不照/;
const procedureReason = (why) => why.split(/[。；\n]/).some((c) => PROCEDURE_REASON.test(c) && !DEPARTS.test(c));
const shortWhyChecks = () => [
  ['should', 'the short why gives a reason, not a step of the skill', (t) => lastWhy(t.reply) && !procedureReason(lastWhy(t.reply))],
  ['should', 'the short why has no labels like 为什么这么做：', (t) => lastWhy(t.reply) && !/^[ \t]*>\s*\**(为什么这么做|为什么|取舍|依据|你能带走的一条|下次自己先做什么|下次自己先做)\**[：:]/m.test(lastWhy(t.reply))],
  ['must', 'every Latin name the short why reports as saying something is in the plugin or the project', (t) => unknownSpeakers(lastWhy(t.reply)).length === 0],
  // The short why is short, so any capitalized name in it is checked, not only in reported speech.
  ['should', 'every Latin name in the short why is in the plugin or the project', (t) => unknownSpeakers(lastWhy(t.reply), true).length === 0],
];
// What quiet must not show: the 下次 line or a decision line inside a quote.
const DUCK_QUOTE = /^[ \t]*>\s*(下次|▸ ?决策)/m;
// The principle part of a notebook line: between the first ｜ and ｜这次 (or the end).
const principleOf = (l) => l.split('｜')[1] || l;
// 「最小测试」「小测试」are test runs, not a quiz.
const QUIZ = /考考你|(?<!最)小测(?!试)|测验|测一测|思考题|练习题|课后作业|留个作业|布置.{0,4}作业|给你打分|打几分|你的得分|成长档案/;
// /duck-why talks like a mentor and grounds the lesson in named researchers. Names and views may
// only come from the plugin's cards (MENTORS.md included), handbook and original skills, or from
// the student's own project (paper authors, the survey report), not from what the duck wrote
// while explaining. In every sentence of the reply
// that reports what someone said or thinks, each Latin name must appear in one of those, so a
// made-up authority fails. Multi-word names must match in full.
const textUnder = (dir, ext, skip = () => false) => {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (skip(p)) continue;
      if (e.isDirectory()) { if (e.name !== '.git') walk(p); } else if (ext.test(e.name)) out.push(fs.readFileSync(p, 'utf8'));
    }
  };
  walk(dir);
  return out.join('\n');
};
// What the duck itself writes while explaining (why and learn reports, the notebook, decision
// lines) holds the same names as the reply, so it cannot count as a source.
const DUCK_OWN = (p) => /[\\/]\.duck[\\/](notebook|decisions)\.md$|[\\/]\.duck[\\/]reports[\\/][^\\/]*-(why|learn)(-\d+)?\.md$/.test(p);
const PLUGIN_TEXT = ['cards', 'handbook', 'library'].map((d) => textUnder(path.join(ROOT, d), /\.(md|txt|json|ya?ml)$/)).join('\n');
const allowedText = () => `${PLUGIN_TEXT}\n${textUnder(PROJECT, /\.(md|tex|bib|py|txt)$/, DUCK_OWN)}`;
const NOT_PEOPLE = new Set(['Deep', 'Learning', 'Tuning', 'Playbook', 'Harvard', 'NeurIPS', 'CommKit', 'EECS', 'Comm', 'Lab', 'MIT', 'III']);
// Researchers the reply may name: full names and surnames from MENTORS.md and the cards' sources.
const MENTOR_NAMES = (() => {
  const names = new Set(['Guo']);
  const take = (cell) => {
    for (const m of cell.replace(/（[^）]*）/g, '').matchAll(/[A-Z][A-Za-zé'.-]+(?: [A-Z][A-Za-zé'.-]+)*/g)) {
      names.add(m[0]);
      const last = m[0].split(' ').pop();
      if (!NOT_PEOPLE.has(last)) names.add(last === 'III' ? m[0] : last);
    }
  };
  for (const line of fs.readFileSync(path.join(ROOT, 'cards', 'MENTORS.md'), 'utf8').split('\n')) {
    if (/^\| [^|-]/.test(line)) take(line.split('|')[1]);
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'cards')).filter((x) => /^[A-Z]\d{2}\.md$/.test(x))) {
    const m = fs.readFileSync(path.join(ROOT, 'cards', f), 'utf8').match(/^sources: \[(.*)\]$/m);
    if (m) take(m[1]);
  }
  for (const n of NOT_PEOPLE) names.delete(n);
  return names;
})();
const SPEECH = /说|认为|主张|提醒|建议|强调|提出|指出|提到|写过|写道|讲过|讲的是|批评|觉得|看来|观点|看法/;
// The host and the plugin's own names are not authorities.
const HOSTS = new Set(['AI', 'Claude', 'Codex', 'GPT', 'ChatGPT', 'Doctor', 'Duck', 'Ducktor']);
const unknownSpeakers = (reply, everySentence = false) => {
  const allowed = allowedText();
  const out = [];
  for (const sentence of reply.split(/[。；！？\n]/)) {
    if (!everySentence && !SPEECH.test(sentence)) continue;
    // Words ending in a lower-case letter: names, not acronyms like AC or KV.
    for (const m of sentence.matchAll(/[A-Z][A-Za-zé'.-]*[a-zé](?: [A-Z][A-Za-zé'.-]*[a-zé])*/g)) {
      if (!HOSTS.has(m[0]) && !allowed.includes(m[0])) out.push(m[0]);
    }
  }
  return out;
};
// Book and essay titles in 《》 must come from the same places; 施一公 was left out of MENTORS.md
// because his talk could not be read first-hand.
const unknownTitles = (reply) => {
  const allowed = allowedText();
  return [...reply.matchAll(/《([^》]+)》/g)].map((m) => m[1]).filter((t) => !allowed.includes(t)).concat(/施一公/.test(reply) ? ['施一公'] : []);
};
const OLD_OR_NEW_LABELS = /^[ \t]*>\s*\**(用的思路|要核对的话|放弃了什么|这次的过程|为什么|名家怎么看|回到这次|新手常怎么做|有经验的人怎么想|最值得学的|你能带走的一条|过程还原)\**[：:]/m;
const whyChecks = () => [
  ['must', 'says the account of this step is worked out from the records, not known', (t) => /没法确认|can(no|')t (be )?(confirm|know)|no way to (know|confirm)/i.test(t.reply)],
  ['should', 'one blockquote with an all-bold line and a 下次 line', (t) => WHY_BLOCK.test(t.reply)],
  ['should', 'no section labels like 用的思路： or 名家怎么看：', (t) => !OLD_OR_NEW_LABELS.test(t.reply)],
  ['should', 'names a researcher or says it is its own judgment', (t) => [...MENTOR_NAMES].some((n) => t.reply.includes(n)) || /陈天奇|自己的判断/.test(t.reply)],
  ['must', 'every Latin name it reports as saying something is in the plugin or the project', (t) => unknownSpeakers(t.reply).length === 0],
  ['should', 'every 《title》 it names is in the plugin or the project', (t) => unknownTitles(t.reply).length === 0],
  ['must', 'wrote a why report', () => reports('why').length > 0],
];

// Each stage: name, prompt, resume (continue the session), optional search and timeout, and
// checks. A check is [severity, label, fn(transcript, before)] where severity is must or should.
function stages() {
  return { main: mainStages, more: moreStages, loop: loopStages, paper: paperStages }[FLOW]();
}

function mainStages() {
  return [
    // A fresh project: the duck has not been turned on, so a free request gets no duck. Its own
    // session, so the later /duck on turn has no earlier edit to comment on.
    { name: 'idle', resume: false, prompt: '帮我把 paper/main.tex 摘要的最后一句改得更紧凑一点。先在对话里给，文件先别改。', checks: [
      ['must', 'hook injected the idle note, not the resident rules', (t) => IDLE_ONLY(t)],
      ['must', 'no .duck/ folder', () => !fs.existsSync(path.join(PROJECT, '.duck'))],
      ['must', 'no decision line', (t) => !/▸ ?决策/.test(t.reply)],
      ['should', 'does not bring up the duck', (t) => !/duck-|Ducktor|鸭子/i.test(t.reply)],
      ['should', 'paper/main.tex untouched', () => projectFile('paper/main.tex') === fixture('paper/main.tex')],
    ] },
    { name: 'menu', resume: false, prompt: cmd('duck'), checks: [
      ['must', 'menu lists the commands', (t) => /duck-review/.test(t.reply) && /duck-learn/.test(t.reply)],
      ['must', 'says the duck is not on in this project', (t) => /(没|未)[^\n]{0,8}开启|还没开|没在这个项目/.test(t.reply.replace(/\*/g, ''))],
      ['must', 'the menu did not turn it on', () => !switchIs('on')],
      ['must', 'hook injected the plugin root', (t) => /插件根目录/.test(t.injected)],
      ['should', 'no quack and no 鸭子: an advisor does not talk like that', (t) => !/quack|鸭子|嘎/i.test(t.reply)],
    ] },
    // Turning it on mid-session: the rules were not injected at session start, so the AI reads them now.
    { name: 'enable', resume: true, prompt: `${cmd('duck')} on`, checks: [
      ['must', 'config says on', () => switchIs('on')],
      ['must', 'read the resident rules this turn', (t) => t.reads.some((r) => r && /rules\/core\.md|\.duck\/skills\/core\.md/.test(r))],
      ['should', 'no quack and no 鸭子: an advisor does not talk like that', (t) => !/quack|鸭子|嘎/i.test(t.reply)],
    ] },
    { name: 'idea', resume: true, prompt: `${cmd('duck-idea')} 我想做长文本推理加速：用块均值估计注意力里每一对 64 token 的块贡献多大，贡献很小的整块跳过。目标是 7B 模型在 LongBench 上省 30% 以上时间、准确率不掉。对手是 token 级剪枝和稠密注意力。现有结果在 notes.md 里。`, checks: [
      ['must', 'read library/idea-evaluator', (t) => readOf(t, 'idea-evaluator')],
      ['must', 'wrote an idea report', () => reports('idea').length > 0],
      ['must', 'notebook got a line', () => /评估 idea|idea/.test(text('notebook.md'))],
      ['should', 'reply has the why block', (t) => WHY_BLOCK.test(t.reply)],
      ...shortWhyChecks(),
    ] },
    { name: 'review', resume: true, prompt: `${cmd('duck-review')} paper/main.tex`, checks: [
      ['must', 'read library/pre-submission-reviewer', (t) => readOf(t, 'pre-submission-reviewer')],
      ['must', 'wrote a review report', () => reports('review').length > 0],
      ['must', 'caught the single-run claim', (t) => /seed|种子|单次|一次|方差|标准差/.test(t.reply)],
      ['should', 'caught the em-dash', (t) => /em-dash|破折号|em dash/i.test(t.reply)],
      ...shortWhyChecks(),
    ] },
    { name: 'propose', resume: true, prompt: '帮我把 paper/main.tex 摘要的第一句改得更紧凑一点。', before: () => text('notebook.md'), checks: [
      ['must', 'names /duck-polish in the reply', (t) => /duck-polish/.test(t.reply)],
      ['should', 'a one-sentence edit adds no notebook line', (t, before) => text('notebook.md') === before],
    ] },
    { name: 'why', resume: true, prompt: cmd('duck-why'), checks: whyChecks() },
    { name: 'quiet', resume: true, prompt: `${cmd('duck')} quiet`, checks: [
      ['must', 'config says quiet', () => switchIs('quiet')],
    ] },
    { name: 'polish-quiet', resume: true, prompt: `${cmd('duck-polish')} 润色 paper/main.tex 的摘要`, before: () => allReports().length, checks: [
      ['must', 'read library/paper-polish', (t) => readOf(t, 'paper-polish')],
      ['must', 'still wrote a report', (t, before) => allReports().length > before],
      ['must', 'no why part in the reply', (t) => !DUCK_QUOTE.test(t.reply)],
    ] },
    // Quiet, free conversation, a real method change: nothing said, one notebook line.
    { name: 'quiet-free', resume: true, prompt: '把 code/skip_attn.py 里跳过块的阈值从固定的 1e-3 改成每一层按块分数的 90% 分位数来定，其他你定，直接改代码。',
      before: () => notebookLines().length, checks: [
        ['must', 'nothing of the duck in the reply', (t) => !DUCK_QUOTE.test(t.reply) && !WHY_BLOCK.test(t.reply)],
        ['should', 'the notebook got one line about this step', (t, before) => notebookLines().length === before + 1 && /｜这次[:：]/.test(notebookLines().at(-1))],
      ] },
    { name: 'card-draft', resume: true, prompt: `${cmd('duck-skill')} card new 我们组规定：结果表里每个数都要写明跑了几个随机种子`, checks: [
      ['should', 'shows the card before writing it', () => !exists('cards/G01.md')],
    ] },
    { name: 'card-ok', resume: true, prompt: '可以，写吧。', checks: [
      ['must', 'wrote .duck/cards/G01.md', () => exists('cards/G01.md')],
      ['must', 'INDEX lists G01', () => /G01/.test(text('cards/INDEX.md'))],
    ] },
    { name: 'learn-ask', resume: true, prompt: cmd('duck-learn'), checks: [
      ['must', 'opens with the one question', (t) => /最想重来/.test(t.reply)],
    ] },
    { name: 'learn', resume: true, prompt: '补 seed 是我定的。最想重来的是摸方向，搜得太窄了。', checks: [
      ['must', 'wrote a learn report', () => reports('learn').length > 0],
      ['should', 'lists what was left to the AI', (t) => /交给 ?AI|AI 定/.test(t.reply)],
      ['should', 'next step uses the answer', (t) => /摸方向|检索|搜/.test(t.reply)],
    ] },
    { name: 'off', resume: true, prompt: `${cmd('duck')} off`, checks: [
      ['must', 'config says off', () => switchIs('off')],
      // off is the fresh-install state, not a stronger "off" than that.
      ['should', 'reply says this is back to not turned on', (t) => /刚装好|没开启|未.{0,4}开启|没有开启/.test(t.reply)],
    ] },
    // A new session after /duck off: same as a project that never turned Ducktor on. The hook
    // gives the idle note, and a command still explains itself and keeps its records.
    { name: 'off-new-session', resume: false, prompt: `${cmd('duck-polish')} 润色 paper/main.tex 的结论一节`,
      before: () => ({ reports: allReports().length }), checks: [
        ['must', 'hook injected the not-turned-on note', (t) => IDLE_ONLY(t)],
        ['must', 'wrote a polish report', (t, before) => allReports().length > before.reports],
        ['should', 'reply has the why block', (t) => WHY_BLOCK.test(t.reply)],
      ] },
  ];
}

// The seven commands the main flow does not reach, in the order a student would meet them.
function moreStages() {
  const wrapped = (command, short, skill, prompt, extra = [], opts = {}) => ({ name: short, resume: true, prompt: `${cmd(command)} ${prompt}`, ...opts, checks: [
    ['must', `read library/${skill}`, (t) => readOf(t, skill)],
    ['must', `wrote a ${short} report`, () => reports(short).length > 0],
    ['should', 'reply has the why block', (t) => WHY_BLOCK.test(t.reply)],
    ...shortWhyChecks(),
    ['should', 'shows a card reminder with a plugin card number', (t) => /卡片提醒/.test(t.reply + newestReport(short))
      && cardIds(t.reply + newestReport(short)).some((id) => PLUGIN_CARDS.has(id))],
    ...extra,
  ] });
  const untouched = (rel) => ['should', `${rel} untouched`, () => projectFile(rel) === fixture(rel)];
  const notes = {};
  return [
    wrapped('duck-survey', 'survey', 'deep-research', '块稀疏注意力用于长文本推理加速。范围小一点：只看 2023 年以后，十篇以内，研究问题你来定两个。', [
      ['must', 'not turned on: hook injected the idle note', (t) => IDLE_ONLY(t)],
      ['should', 'cites checkable sources', (t) => /arxiv\.org|doi\.org|\b\d{4}\.\d{4,5}\b/i.test(t.reply + newestReport('survey'))],
    ], { search: true, timeout: 1800000 }),
    // The case students ask about most: what to learn from how the AI searched.
    { name: 'survey-why', resume: true, prompt: cmd('duck-why'), checks: whyChecks() },
    wrapped('duck-outline', 'outline', 'tech-paper-template', 'paper/main.tex', [
      ['should', 'says it uses the technical-paper template', (t) => /技术论文|tech-paper-template/.test(t.reply)],
    ]),
    wrapped('duck-intro', 'intro', 'intro-drafter', '按 paper/main.tex 的内容重写引言。先在对话里给草稿，paper/ 里的文件先别改。', [
      ['must', 'reminds the student to check facts, numbers and citations', (t) => /核对/.test(t.reply)],
      untouched('paper/main.tex'),
    ]),
    wrapped('duck-write', 'write', 'paper-writer', '写方法一节，依据 code/skip_attn.py 和 paper/main.tex。先在对话里给草稿，paper/ 里的文件先别改。', [
      ['must', 'reminds the student to check facts, numbers and citations', (t) => /核对/.test(t.reply)],
      ['should', 'notices the method text and the code disagree', (t) => /对不上|不一致|不符|矛盾|差异|差别|不是.{0,12}(注意力质量|attention mass)/.test(t.reply)],
      untouched('paper/main.tex'),
    ]),
    wrapped('duck-figure', 'figure', 'figure-designer', '给 notes.md 里的速度和准确率结果设计一张主图。'),
    wrapped('duck-vibe', 'vibe', 'vibe-research-workflow', '下周要在 LongBench 上把 BlockSkip 全量跑一遍、补三个随机种子，再写实验一节。哪些交给 AI 做、做到哪一步、哪些我自己把关？'),
    { name: 'notes', resume: true, prompt: cmd('duck-notes'), before: () => text('notebook.md'), checks: [
      ['must', 'lists every stage in the notebook', (t) => {
        const stagesInNotebook = [...new Set(notebookLines().map((l) => (l.match(/^- \d{2}-\d{2} (.+?)｜/) || [])[1]).filter(Boolean))];
        return stagesInNotebook.length > 0 && stagesInNotebook.every((st) => t.reply.includes(st));
      }],
      ['must', 'notebook untouched', (t, before) => text('notebook.md') === before],
    ] },
    { name: 'notes-delete', resume: true, prompt: `${cmd('duck-notes')} 删掉最后一条`,
      before: () => { notes.lines = notebookLines(); return text('notebook.md'); }, checks: [
        ['should', 'shows the change before writing', (t, before) => text('notebook.md') === before],
      ] },
    { name: 'notes-ok', resume: true, prompt: '可以，删吧。', checks: [
      ['must', 'the last line is gone and the rest kept', () => {
        const now = notebookLines();
        return notes.lines.length > 0 && now.length === notes.lines.length - 1 && now.every((l, i) => l === notes.lines[i]);
      }],
    ] },
  ];
}

// What a student's notebook holds from earlier weeks when the loop flow starts.
const LOOP_NOTEBOOK = [
  '- 10-09 写摘要｜用词强度跟着证据走，只跑了一次的结果不写 significantly（卡 W11）',
  '- 10-12 写引言｜挑战段写问题本身为什么难，不写方法实现起来难（卡 W09）',
];

// The loop flow's .duck/config.md: the format /duck on writes (skills/duck/SKILL.md, section 二).
const LOOP_CONFIG = '# Ducktor 设定\n\n开关：on\n\n## 按类静音\n学生说「这类我懂了」时，在这里记一行。\n\n## 静音的卡\n\n## 关掉的命令\n';

// The knowledge loop and the resident rules: /duck picks a command, old notebook entries come
// back in later commands, a free conversation about a single-run result, and 「这类我懂了」.
function loopStages() {
  const decisions = () => text('decisions.md').split('\n').filter((l) => l.trim());
  const withReport = (t, short) => t.reply + newestReport(short);
  return [
    { name: 'route', prompt: `${cmd('duck')} 帮我看看摘要最后一句是不是说得太满了`, checks: [
      ['must', 'names the command it picked', (t) => /duck-(polish|review)/.test(t.reply)],
      ['must', 'read the picked skill', (t) => readOf(t, 'paper-polish') || readOf(t, 'pre-submission-reviewer')],
      ['should', 'brings up the 10-09 notebook entry', (t) => /10-09/.test(withReport(t, 'polish') + newestReport('review'))],
    ] },
    { name: 'intro', resume: true, prompt: `${cmd('duck-intro')} 按 paper/main.tex 的内容重写引言。先在对话里给草稿，paper/ 里的文件先别改。`, checks: [
      ['must', 'read library/intro-drafter', (t) => readOf(t, 'intro-drafter')],
      ['must', 'brings up the 10-12 notebook entry', (t) => /10-12/.test(withReport(t, 'intro'))],
      ['must', 'notebook has no repeated principle', () => new Set(notebookLines().map(principleOf)).size === notebookLines().length],
      ['should', 'paper/main.tex untouched', () => projectFile('paper/main.tex') === fixture('paper/main.tex')],
    ] },
    { name: 'exp', resume: true, prompt: '新结果出来了：32k 长度上 BlockSkip 准确率 70.9，稠密注意力 70.6，只跑了一次。帮我把这一行加进 paper/main.tex 的表里。',
      before: () => projectFile('paper/main.tex'), checks: [
        ['must', 'raises seeds or run-to-run variation', (t) => /seed|种子|波动|方差|标准差/.test(t.reply)],
        ['should', 'asks before editing the table', (t, before) => /[？?]/.test(t.reply) && projectFile('paper/main.tex') === before],
        ['should', 'the reply writes no card number', (t) => !anyCardId(t.reply)],
      ] },
    { name: 'exp-ok', resume: true, prompt: '先补到 3 个 seed，表等结果出来再改。', before: () => decisions().length, checks: [
      ['must', 'a new decision line says the student decided', (t, before) => decisions().slice(before).some((l) => /你定/.test(l))],
      ['should', 'reply shows the decision line', (t) => /▸ ?决策/.test(t.reply)],
    ] },
    { name: 'mute', resume: true, prompt: '多 seed 和方差这类我懂了，以后别讲了。', checks: [
      ['must', 'config mutes the category', () => /按类静音[\s\S]*(seed|种子|方差)/.test(text('config.md'))],
    ] },
    { name: 'mute-check', resume: true, prompt: '64k 长度上也出来了：BlockSkip 69.8，稠密 69.9，也只跑了一次。先记进 notes.md，表等补完 seed 再说。', checks: [
      ['should', 'notes.md got the 64k result', () => /64k/i.test(projectFile('notes.md'))],
      ['should', 'does not explain seeds again', (t) => !/为什么[:：]/.test(t.reply) && !/波动/.test(t.reply) && !/^[ \t]*>[^\n]*(seed|种子|方差)/im.test(t.reply)],
    ] },
  ];
}

// A real paper instead of the fixture: review it, ask why, then the stage review.
function paperStages() {
  const main = mainTex();
  return [
    { name: 'review', prompt: `${cmd('duck-review')} paper/${main}`, checks: [
      ['must', 'not turned on: hook injected the idle note', (t) => IDLE_ONLY(t)],
      ['must', 'read library/pre-submission-reviewer', (t) => readOf(t, 'pre-submission-reviewer')],
      ['must', 'wrote a review report', () => reports('review').length > 0],
      ['should', 'grades issues CRITICAL / MAJOR / MINOR', (t) => /CRITICAL|MAJOR|MINOR/.test(t.reply)],
      ['should', 'reply has the why block', (t) => WHY_BLOCK.test(t.reply)],
      ...shortWhyChecks(),
    ] },
    { name: 'why', resume: true, prompt: cmd('duck-why'), checks: whyChecks() },
    { name: 'learn-ask', resume: true, prompt: cmd('duck-learn'), checks: [
      ['must', 'opens with the one question', (t) => /最想重来/.test(t.reply)],
    ] },
    { name: 'learn', resume: true, prompt: '审稿是我让做的，怎么审都交给你了。最想重来的是实验部分，我想先弄清审稿人最可能抓哪一条。', checks: [
      ['must', 'wrote a learn report', () => reports('learn').length > 0],
      ['should', 'next step is about the experiments', (t) => /实验/.test(t.reply)],
    ] },
    // Not turned on: after the commands, a free request still gets no duck.
    { name: 'free', resume: true, prompt: `帮我把 paper/${main} 里摘要的第一句改得更紧凑一点（摘要在别的文件里就去那里找）。先在对话里给，文件先别改。`,
      before: () => duckSnapshot(), checks: [
        ['should', 'no decision line', (t) => !/▸ ?决策/.test(t.reply)],
        ['should', 'nothing new under .duck/', (t, before) => duckSnapshot() === before],
        ['should', 'does not point to a duck command', (t) => !/duck-/.test(t.reply)],
      ] },
  ];
}

// The paper flow's main .tex file: the one with \documentclass.
function mainTex() {
  const dir = path.join(PROJECT, 'paper');
  const tex = fs.readdirSync(dir).filter((f) => f.endsWith('.tex'));
  return tex.find((f) => /\\documentclass/.test(fs.readFileSync(path.join(dir, f), 'utf8'))) || tex[0];
}

function globalChecks(transcripts) {
  const notebook = text('notebook.md').split('\n').filter((l) => l.trim());
  return [
    ['must', 'notebook lines follow "- MM-DD 阶段｜原则（出处）"', () => notebook.length > 0 && notebook.every((l) => /^- \d{2}-\d{2} .+｜.+/.test(l))],
    ['must', 'decision lines read "- YYYY-MM-DD ▸ 决策：…"', () => !exists('decisions.md') || text('decisions.md').split('\n').filter((l) => l.trim()).every((l) => /^- \d{4}-\d{2}-\d{2} ▸ ?决策[:：]/.test(l))],
    ['should', 'new notebook lines say what happened this time (｜这次：)', () => { const fresh = notebook.filter((l) => !LOOP_NOTEBOOK.includes(l)); return (fresh.length > 0 || FLOW === 'loop') && fresh.every((l) => /｜这次[:：]/.test(l)); }],
    ['must', 'no bold marks in notebook lines', () => !/\*\*/.test(text('notebook.md'))],
    ['must', 'no em-dash in notebook or decisions', () => !/\u2014/.test(text('notebook.md') + text('decisions.md'))],
    // The short why names cards by title; a card number there is jargon the student cannot read.
    ['should', 'the short whys write no card number', () => transcripts.map((t) => lastWhy(t.reply)).every((w) => !anyCardId(w))],
    // Most notebook lines are written by the AI; quoting one as the student's own is wrong.
    ['should', 'does not credit a notebook line to the student (你 MM-DD 记下的)', () => transcripts.every((t) => !/你 ?\d{2}-\d{2} ?记下的/.test(t.reply))],
    ['must', 'no quizzes, homework or scoring the student', () => transcripts.every((t) => !QUIZ.test(t.reply))],
    ['must', 'every card number the replies cite exists', () => {
      const group = fs.existsSync(duckFile('cards')) ? fs.readdirSync(duckFile('cards')).map((f) => f.slice(0, 3)) : [];
      return transcripts.every((t) => cardIds(t.reply).every((id) => PLUGIN_CARDS.has(id) || group.includes(id)));
    }],
  ];
}

// ---------- main ----------

function setup() {
  fs.mkdirSync(OUT, { recursive: true });
  if (FLOW === 'paper') {
    if (!process.env.DUCK_E2E_PAPER) { console.error('the paper flow needs DUCK_E2E_PAPER'); process.exit(2); }
    fs.cpSync(path.resolve(process.env.DUCK_E2E_PAPER), path.join(PROJECT, 'paper'), { recursive: true });
  } else {
    fs.cpSync(path.join(ROOT, 'tests', 'fixtures', 'grad-project'), PROJECT, { recursive: true });
  }
  const git = (...a) => spawnSync('git', a, { cwd: PROJECT });
  git('init', '-q');
  git('add', '-A');
  git('-c', 'user.name=student', '-c', 'user.email=student@example.com', 'commit', '-q', '-m', '初稿和实验代码');
  // The loop flow tests the resident rules, so the student has turned the duck on; more and
  // paper leave it off, which is the commands-only path most projects take.
  if (FLOW === 'loop') {
    fs.mkdirSync(path.join(PROJECT, '.duck'), { recursive: true });
    fs.writeFileSync(path.join(PROJECT, '.duck', 'notebook.md'), `${LOOP_NOTEBOOK.join('\n')}\n`);
    fs.writeFileSync(path.join(PROJECT, '.duck', 'config.md'), LOOP_CONFIG);
  }
  if (HOST === 'codex') {
    const cache = path.join(process.env.HOME, '.codex', 'plugins', 'cache', 'ducktor', 'duck');
    const head = spawnSync('git', ['-C', ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
    const versions = fs.existsSync(cache) ? fs.readdirSync(cache) : [];
    const installed = versions.map((v) => spawnSync('git', ['-C', path.join(cache, v), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim());
    const pluginDiffers = (rev) => spawnSync('git', ['-C', ROOT, 'diff', '--quiet', rev, 'HEAD', '--', '.', ':!tests', ':!docs', ':!README.md', ':!INSTALL.md']).status !== 0;
    if (!installed.includes(head) && installed.every(pluginDiffers)) {
      console.warn(`warning: the Codex plugin cache is not at ${head.slice(0, 7)}; run: codex plugin add duck@ducktor`);
    }
  }
}

function main() {
  setup();
  const results = [];
  const transcripts = [];
  // Claude Code's total_cost_usd is the session's running total, so a resumed stage costs the difference.
  const spent = {};
  let session = null;
  for (const stage of stages()) {
    if (ONLY.length && !ONLY.includes(stage.name)) continue;
    const before = stage.before ? stage.before() : undefined;
    const started = Date.now();
    const opts = { search: stage.search, timeout: stage.timeout };
    const run = HOST === 'claude'
      ? runClaude(stage.prompt, stage.resume ? session : null, opts)
      : runCodex(stage.prompt, stage.resume ? session : null, opts);
    fs.writeFileSync(path.join(OUT, `${String(results.length + 1).padStart(2, '0')}-${stage.name}.jsonl`), run.stdout || '');
    let t = parse(run.stdout || '');
    if (stage.resume !== false && !session) session = t.session;
    if (stage.resume === false) session = t.session;
    if (HOST === 'codex') t.injected = codexInjected(t.session || session);
    t.sessionId = session;
    t.earlierReads = transcripts.filter((x) => x.sessionId && x.sessionId === session).flatMap((x) => x.reads);
    const evaluate = (tr) => stage.checks.map(([severity, label, fn]) => {
      let ok = false;
      try { ok = Boolean(fn(tr, before)); } catch (err) { ok = false; }
      return { severity, label, ok };
    });
    let checks = evaluate(t);
    // The original skills and core rule 1 sometimes stop to ask for missing details, and
    // the questions are not always the last line. Answer once, the way a student would,
    // and check again; the summary records that it happened.
    let followup = false;
    if (stage.name !== 'learn-ask' && checks.some((c) => !c.ok && c.severity === 'must') && /[？?]|你希望|请选择|请确认|选哪/.test(t.reply)) {
      followup = true;
      const again = HOST === 'claude' ? runClaude(FOLLOWUP, session, opts) : runCodex(FOLLOWUP, session, opts);
      fs.writeFileSync(path.join(OUT, `${String(results.length + 1).padStart(2, '0')}-${stage.name}-followup.jsonl`), again.stdout || '');
      const t2 = parse(again.stdout || '');
      t = { ...t2, injected: `${t.injected}\n${t2.injected}`, reads: [...t.reads, ...t2.reads], tools: [...t.tools, ...t2.tools], reply: `${t.reply}\n\n[学生] ${FOLLOWUP}\n\n${t2.reply}`, cost: t2.cost, sessionId: t.sessionId, earlierReads: t.earlierReads };
      if (HOST === 'codex') t.injected = codexInjected(session);
      checks = evaluate(t);
    }
    if (HOST === 'claude') {
      const key = t.session || session;
      const prev = spent[key] || 0;
      spent[key] = Math.max(prev, t.cost);
      t.cost = Math.max(0, t.cost - prev);
    }
    transcripts.push(t);
    results.push({ stage: stage.name, prompt: stage.prompt, seconds: Math.round((Date.now() - started) / 1000),
      exit: run.status, cost: t.cost, followup, tools: t.tools, errors: t.errors, checks, reply: t.reply });
    const mark = checks.every((c) => c.ok) ? 'ok  ' : (checks.some((c) => !c.ok && c.severity === 'must') ? 'FAIL' : 'warn');
    console.log(`${mark} ${stage.name} (${results.at(-1).seconds}s)${followup ? ' after one follow-up answer' : ''}`);
    for (const c of checks.filter((x) => !x.ok)) console.log(`       ${c.severity}: ${c.label}`);
  }
  const global = globalChecks(transcripts).map(([severity, label, fn]) => {
    let ok = false;
    try { ok = Boolean(fn()); } catch (err) { ok = false; }
    return { severity, label, ok };
  });
  for (const c of global.filter((x) => !x.ok)) console.log(`FAIL global ${c.severity}: ${c.label}`);
  const all = [...results.flatMap((r) => r.checks), ...global];
  const summary = {
    host: HOST, flow: FLOW, model: MODEL || '(host default)', commit: spawnSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(),
    when: new Date().toISOString(), cost_usd: results.reduce((s, r) => s + (r.cost || 0), 0),
    must_failed: all.filter((c) => !c.ok && c.severity === 'must').length,
    should_failed: all.filter((c) => !c.ok && c.severity === 'should').length,
    passed: all.filter((c) => c.ok).length, total: all.length, stages: results, global,
  };
  if (fs.existsSync(path.join(PROJECT, '.duck'))) fs.cpSync(path.join(PROJECT, '.duck'), path.join(OUT, 'duck-files'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  const md = [`# e2e ${HOST} ${FLOW} ${summary.commit} (${summary.model})`, '',
    `${summary.passed}/${summary.total} checks passed; must failed ${summary.must_failed}, should failed ${summary.should_failed}; cost $${summary.cost_usd.toFixed(2)}`, ''];
  for (const r of results) {
    md.push(`## ${r.stage}: \`${r.prompt}\` (${r.seconds}s${r.followup ? ', one follow-up answer' : ''})`, '');
    for (const c of r.checks) md.push(`- [${c.ok ? 'x' : ' '}] ${c.severity}: ${c.label}`);
    md.push('', '<details><summary>reply</summary>', '', r.reply.trim(), '', '</details>', '');
  }
  md.push('## global', '', ...global.map((c) => `- [${c.ok ? 'x' : ' '}] ${c.severity}: ${c.label}`), '');
  fs.writeFileSync(path.join(OUT, 'summary.md'), md.join('\n'));
  console.log(`\n${summary.passed}/${summary.total} checks passed, must failed ${summary.must_failed}. ${path.relative(ROOT, OUT)}/summary.md`);
  process.exit(summary.must_failed ? 1 : 0);
}

main();

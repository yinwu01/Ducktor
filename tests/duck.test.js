// Tests for bin/duck.js and the hook commands that call it. No model calls here;
// the end-to-end runs with real models are in tests/e2e/.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const duck = require('../bin/duck.js');
const HOOKS = JSON.parse(fs.readFileSync(path.join(ROOT, 'hooks', 'claude-codex-hooks.json'), 'utf8')).hooks;

function project(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'duck-test-'));
  for (const [rel, text] of Object.entries(files)) {
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  }
  return dir;
}

// Runs a hook command from hooks/claude-codex-hooks.json the way a host does: through sh,
// with the input JSON on stdin and only the environment we pass.
function runHook(event, env, stdin) {
  const command = HOOKS[event][0].hooks[0].command;
  return spawnSync('sh', ['-c', command], {
    input: stdin,
    env: { PATH: process.env.PATH, ...env },
    encoding: 'utf8',
  });
}

test('modeOf reads the switch line in the forms students write', () => {
  const cases = [
    ['开关：quiet', 'quiet'], ['开关: off', 'off'], ['- 开关：OFF', 'off'], ['> 开关：quiet', 'quiet'],
    ['**开关**：off', 'off'], ['## 开关：off', 'off'], ['开关 = off', 'off'], ['开关：quiet（这周先静音）', 'quiet'],
    ['开关：关', 'off'], ['开关：关闭', 'off'], ['开关：静音', 'quiet'], ['开关：开', 'on'], ['开关：开启', 'on'],
    ['Switch: quiet', 'quiet'], ['switch: off', 'off'], ['- **Switch**: on', 'on'],
    ['﻿开关：quiet\r\n', 'quiet'], ['开关：on、quiet、off 三选一\n开关：off', 'off'],
    ['', 'unset'], ['# Ducktor 设定\n\n## 按类静音\n', 'unset'],
  ];
  for (const [config, mode] of cases) {
    assert.equal(duck.modeOf(config).mode, mode, JSON.stringify(config));
    assert.equal(duck.modeOf(config).note, null, JSON.stringify(config));
  }
  assert.deepEqual(duck.modeOf(null), { mode: 'unset', note: null });
});

test('modeOf treats an unknown value as not turned on and says so', () => {
  const { mode, note } = duck.modeOf('开关：offline');
  assert.equal(mode, 'unset');
  assert.match(note, /offline/);
});

test('no config: only the idle note, no resident rules', () => {
  const text = duck.buildContext(project());
  assert.ok(text.startsWith(`Ducktor 插件根目录：${ROOT}`));
  assert.doesNotMatch(text, /# Ducktor 常驻规则/);
  assert.match(text, /没在这个项目开启/);
  // idle note + 东西在哪 + 每次都照做 (2,622 on 2026-10-27); every project with the plugin pays this.
  assert.ok(text.length < 2800, `${text.length} characters`);
});

test('not turned on and off: commands still get the basics from core.md', () => {
  for (const config of [null, '开关：off\n']) {
    const text = duck.buildContext(project(config ? { '.duck/config.md': config } : {}));
    assert.match(text, /## 东西在哪/);
    assert.match(text, /用 Read、Glob、Grep 读，不用 cat/);
    assert.match(text, /upstream\.lock\.json/);
    assert.match(text, /deep-research → \/duck-survey/);
    assert.match(text, /不用破折号/);
    // The rules that hold in every mode come along: language, checking facts, pushback.
    assert.match(text, /## 每次都照做/);
    assert.match(text, /用学生的语言/);
    assert.match(text, /先回原文核对/);
    assert.match(text, /只有学生给了新事实/);
    assert.doesNotMatch(text, /## 平时这样做/);
  }
});

test('a config without a switch line is not turned on, and is passed through', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '# Ducktor 设定\n\n## 关掉的命令\nfigure\n' }));
  assert.doesNotMatch(text, /# Ducktor 常驻规则/);
  assert.match(text, /没在这个项目开启/);
  assert.match(text, /开关：没开启）/);
  assert.match(text, /figure/);
});

test('on: rules load', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：on\n' }));
  assert.match(text, /# Ducktor 常驻规则/);
  assert.doesNotMatch(text, /没在这个项目开启/);
});

test('quiet: rules load and the config is passed through', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '# Ducktor 设定\n\n开关：quiet\n' }));
  assert.match(text, /# Ducktor 常驻规则/);
  assert.match(text, /开关：quiet）/);
});

test('off: the off note replaces the rules', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：off\n' }));
  assert.doesNotMatch(text, /# Ducktor 常驻规则/);
  assert.match(text, /Ducktor 现在是 off/);
});

test('an unknown switch value is reported to the AI and does not turn the duck on', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：offline\n' }));
  assert.match(text, /只认 on、quiet、off/);
  assert.doesNotMatch(text, /# Ducktor 常驻规则/);
});

test("the student's copy of the rules wins over the plugin's", () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：on\n', '.duck/skills/core.md': '# 我们组改过的规则\n' }));
  assert.match(text, /# 我们组改过的规则/);
  assert.doesNotMatch(text, /# Ducktor 常驻规则/);
  assert.match(text, /项目里的副本/);
  // A copy made before 「每次都照做」 existed gets that section from the plugin.
  assert.match(text, /## 每次都照做/);
  assert.match(text, /学生的副本里没有这一节/);
  const withSection = duck.buildContext(project({ '.duck/config.md': '开关：on\n', '.duck/skills/core.md': '# 改过的\n\n## 每次都照做\n- 我们自己的一条\n' }));
  assert.equal(withSection.match(/## 每次都照做/g).length, 1);
});

test('a long config is cut and a non-UTF-8 config is flagged', () => {
  const long = duck.buildContext(project({ '.duck/config.md': `开关：on\n${'x'.repeat(5000)}` }));
  assert.match(long, /后面太长没放进来/);
  const dir = project();
  fs.mkdirSync(path.join(dir, '.duck'));
  fs.writeFileSync(path.join(dir, '.duck', 'config.md'), Buffer.from([0xbf, 0xaa, 0xb9, 0xd8, 0x3a, 0x6f, 0x66, 0x66]));
  assert.match(duck.buildContext(dir), /读不出的字节/);
});

test('the injected text stays well under host limits', () => {
  // Claude Code caps additionalContext at 10,000 characters; Codex moves long context to a file.
  const text = duck.buildContext(project({ '.duck/config.md': `开关：on\n${'x'.repeat(5000)}` }));
  assert.ok(text.length < 7000, `${text.length} characters`);
});

test('SessionStart hook: Claude Code environment', () => {
  const dir = project({ '.duck/config.md': '开关：quiet\n' });
  const run = runHook('SessionStart', { CLAUDE_PLUGIN_ROOT: ROOT }, JSON.stringify({ cwd: dir, source: 'startup' }));
  assert.equal(run.status, 0, run.stderr);
  const out = JSON.parse(run.stdout).hookSpecificOutput;
  assert.equal(out.hookEventName, 'SessionStart');
  assert.match(out.additionalContext, /开关：quiet）/);
});

test('SessionStart hook: Codex sets only PLUGIN_ROOT', () => {
  const run = runHook('SessionStart', { PLUGIN_ROOT: ROOT }, JSON.stringify({ cwd: project() }));
  assert.equal(run.status, 0, run.stderr);
  assert.match(JSON.parse(run.stdout).hookSpecificOutput.additionalContext, /插件根目录/);
});

test('SessionStart hook: no plugin root gives a note, not a stack trace', () => {
  const run = runHook('SessionStart', {}, '{}');
  assert.equal(run.status, 0);
  assert.equal(run.stderr, '');
  assert.match(JSON.parse(run.stdout).hookSpecificOutput.additionalContext, /no plugin root/);
});

test('SessionStart hook: bad stdin still produces context', () => {
  const run = runHook('SessionStart', { CLAUDE_PLUGIN_ROOT: ROOT }, 'not json');
  assert.equal(run.status, 0, run.stderr);
  assert.match(JSON.parse(run.stdout).hookSpecificOutput.additionalContext, /插件根目录/);
});

test('Cursor gets additional_context only', () => {
  const run = spawnSync(process.execPath, [path.join(ROOT, 'bin', 'duck.js'), 'session-start'], {
    input: JSON.stringify({ workspace_roots: [project({ '.duck/config.md': '开关：off\n' })] }),
    env: { PATH: process.env.PATH, CURSOR_PLUGIN_ROOT: ROOT },
    encoding: 'utf8',
  });
  const out = JSON.parse(run.stdout);
  assert.deepEqual(Object.keys(out), ['additional_context']);
  assert.match(out.additional_context, /Ducktor 现在是 off/);
});

test('PreToolUse hook allows reads inside the plugin root only', () => {
  const allow = (file) => {
    const run = runHook('PreToolUse', { CLAUDE_PLUGIN_ROOT: ROOT }, JSON.stringify({ tool_name: 'Read', tool_input: file }));
    assert.equal(run.status, 0, run.stderr);
    return run.stdout ? JSON.parse(run.stdout).hookSpecificOutput.permissionDecision : null;
  };
  assert.equal(allow({ file_path: path.join(ROOT, 'library', 'paper-polish', 'SKILL.md') }), 'allow');
  assert.equal(allow({ path: path.join(ROOT, 'handbook') }), 'allow');
  assert.equal(allow({ file_path: path.join(ROOT, '..', 'outside.md') }), null);
  assert.equal(allow({ file_path: '/etc/hostname' }), null);
  assert.equal(allow({ pattern: '**/*.md' }), null);

  const allowTool = (tool, toolInput) => {
    const run = runHook('PreToolUse', { CLAUDE_PLUGIN_ROOT: ROOT }, JSON.stringify({ tool_name: tool, tool_input: toolInput }));
    assert.equal(run.status, 0, run.stderr);
    return run.stdout ? JSON.parse(run.stdout).hookSpecificOutput.permissionDecision : null;
  };
  assert.equal(allowTool('Glob', { pattern: '**/*.md', path: path.join(ROOT, 'library') }), 'allow');
  assert.equal(allowTool('Glob', { pattern: path.join(ROOT, 'library', '*', 'SKILL.md') }), 'allow');
  assert.equal(allowTool('Glob', { pattern: '../../**/*', path: path.join(ROOT, 'library') }), null);
  assert.equal(allowTool('Glob', { pattern: '/etc/*', path: ROOT }), null);
  assert.equal(allowTool('Glob', { pattern: '~/.ssh/*', path: ROOT }), null);
  assert.equal(allowTool('Grep', { pattern: 'polish', path: ROOT, glob: '*.md' }), 'allow');
  assert.equal(allowTool('Grep', { pattern: 'polish', path: ROOT, glob: '../**/*.md' }), null);

  // A symlink inside a project that points into the plugin is fine; one inside the
  // plugin that points out is not followed.
  const outside = project({ 'secret.txt': 'x' });
  const link = path.join(ROOT, 'tests', '.tmp-link');
  fs.rmSync(link, { force: true });
  fs.symlinkSync(path.join(outside, 'secret.txt'), link);
  try {
    assert.equal(allow({ file_path: link }), null);
  } finally {
    fs.rmSync(link, { force: true });
  }
});

// Runs the PreToolUse hook for a write. extra goes into tool_input; env adds to the hook's environment.
function allowWrite(tool, file, cwd, extra = {}, env = {}) {
  const input = { tool_name: tool, tool_input: { file_path: file, ...extra } };
  if (cwd !== null) input.cwd = cwd;
  const run = runHook('PreToolUse', { CLAUDE_PLUGIN_ROOT: ROOT, ...env }, JSON.stringify(input));
  return run.stdout ? JSON.parse(run.stdout).hookSpecificOutput.permissionDecision : null;
}
const ADD = { old_string: '- 10-26 旧的一条', new_string: '- 10-26 旧的一条\n- 10-27 新的一条' };

test('PreToolUse hook lets Claude Code write the records in .duck/, nothing else', () => {
  const dir = project({ '.duck/config.md': '开关：on\n', '.duck/notebook.md': '- 10-26 旧的一条\n' });
  const allow = (tool, file, extra = {}, cwd = dir) => allowWrite(tool, file, cwd, extra);
  const duck = path.join(dir, '.duck');
  assert.equal(allow('Edit', path.join(duck, 'notebook.md'), ADD), 'allow');
  assert.equal(allow('Write', path.join(duck, 'decisions.md'), { content: '- 2026-10-27 ▸ 决策：……（你定）\n' }), 'allow');
  assert.equal(allow('Write', path.join(duck, 'reports', '2026-10-27-review.md')), 'allow');
  assert.equal(allow('MultiEdit', '.duck/notebook.md', { edits: [ADD] }), 'allow');
  assert.equal(allow('Write', path.join(duck, 'background.md')), null);
  // Settings and rules the next session loads stay the student's call.
  assert.equal(allow('Edit', path.join(duck, 'config.md')), null);
  assert.equal(allow('Write', path.join(duck, 'skills', 'core.md')), null);
  assert.equal(allow('Write', path.join(duck, 'cards', 'G01.md')), null);
  assert.equal(allow('Write', path.join(duck, 'reports', 'deep', 'x.md')), null);
  assert.equal(allow('Write', path.join(duck, 'reports', '..', '..', 'paper.tex')), null);
  assert.equal(allow('Write', path.join(dir, 'notebook.md')), null);
  assert.equal(allowWrite('Write', path.join(duck, 'notebook.md'), null), null);
  // No .duck/ yet: the first write asks as usual.
  const fresh = project({ 'README.md': 'x' });
  assert.equal(allow('Write', path.join(fresh, '.duck', 'notebook.md'), {}, fresh), null);
});

test('PreToolUse hook: notebook and decisions only grow without a prompt', () => {
  const dir = project({ '.duck/notebook.md': '- 10-26 旧的一条\n', '.duck/decisions.md': '- 2026-10-26 ▸ 决策：A（你定）\n', '.duck/reports/r.md': '# 旧报告\n' });
  const allow = (tool, rel, extra) => allowWrite(tool, path.join(dir, '.duck', rel), dir, extra);
  assert.equal(allow('Write', 'decisions.md', { content: '- 2026-10-26 ▸ 决策：A（你定）\n- 2026-10-27 ▸ 决策：B（AI 定）\n' }), 'allow');
  assert.equal(allow('Write', 'decisions.md', { content: '- 2026-10-26 ▸ 决策：A（AI 定）\n' }), null);
  assert.equal(allow('Edit', 'decisions.md', { old_string: '（你定）', new_string: '（AI 定）' }), null);
  assert.equal(allow('Edit', 'notebook.md', { old_string: '- 10-26 旧的一条\n', new_string: '' }), null);
  assert.equal(allow('MultiEdit', 'notebook.md', { edits: [ADD, { old_string: '旧', new_string: '新' }] }), null);
  assert.equal(allow('Edit', 'notebook.md', { old_string: '', new_string: 'x' }), null);
  // Reports may be corrected after a conclusion is overturned.
  assert.equal(allow('Edit', 'reports/r.md', { old_string: '# 旧报告', new_string: '# 改过的报告' }), 'allow');
  // An empty log may be written whole.
  const empty = project({ '.duck/decisions.md': '' });
  assert.equal(allowWrite('Write', path.join(empty, '.duck', 'decisions.md'), empty, { content: 'x\n' }), 'allow');
});

test('PreToolUse hook: the project is the session root, not the shell folder', () => {
  const dir = project({ '.duck/notebook.md': '- 10-26 旧的一条\n', 'paper/main.tex': 'x' });
  const nb = path.join(dir, '.duck', 'notebook.md');
  // After `cd paper` the hook's cwd moves; CLAUDE_PROJECT_DIR still names the project.
  assert.equal(allowWrite('Edit', nb, path.join(dir, 'paper'), ADD, { CLAUDE_PROJECT_DIR: dir }), 'allow');
  assert.equal(allowWrite('Edit', nb, null, ADD, { CLAUDE_PROJECT_DIR: dir }), 'allow');
  // Another folder with its own .duck/ is not this project's record.
  const other = project({ '.duck/decisions.md': '' });
  assert.equal(allowWrite('Write', path.join(other, '.duck', 'decisions.md'), other, { content: 'x' }, { CLAUDE_PROJECT_DIR: dir }), null);
  // The project reached through a symlink is the same project.
  const link = `${dir}-link`;
  fs.symlinkSync(dir, link);
  try {
    assert.equal(allowWrite('Edit', nb, link, ADD), 'allow');
    assert.equal(allowWrite('Edit', path.join(link, '.duck', 'notebook.md'), dir, ADD), 'allow');
  } finally {
    fs.rmSync(link, { force: true });
  }
});

test('PreToolUse hook: linked .duck/, reports/ or record files are not followed', () => {
  const outside = project({ 'notes.md': 'x', 'r/a.md': 'x' });
  const linked = project({ 'README.md': 'x' });
  fs.symlinkSync(outside, path.join(linked, '.duck'));
  assert.equal(allowWrite('Write', path.join(linked, '.duck', 'notebook.md'), linked), null);
  const linkedReports = project({ '.duck/notebook.md': '' });
  fs.symlinkSync(path.join(outside, 'r'), path.join(linkedReports, '.duck', 'reports'));
  assert.equal(allowWrite('Write', path.join(linkedReports, '.duck', 'reports', 'a.md'), linkedReports), null);
  const dangling = project({ '.duck/notebook.md': '' });
  fs.symlinkSync(path.join(outside, 'missing'), path.join(dangling, '.duck', 'reports'));
  assert.equal(allowWrite('Write', path.join(dangling, '.duck', 'reports', 'a.md'), dangling), null);
  const linkedFile = project({ '.duck/config.md': '开关：on\n' });
  fs.symlinkSync(path.join(outside, 'notes.md'), path.join(linkedFile, '.duck', 'decisions.md'));
  assert.equal(allowWrite('Edit', path.join(linkedFile, '.duck', 'decisions.md'), linkedFile, ADD), null);
  const hard = project({ '.duck/config.md': '开关：on\n' });
  fs.linkSync(path.join(outside, 'notes.md'), path.join(hard, '.duck', 'notebook.md'));
  assert.equal(allowWrite('Write', path.join(hard, '.duck', 'notebook.md'), hard, { content: 'x and more' }), null);
});

test('PreToolUse hook stays silent on bad input', () => {
  const run = runHook('PreToolUse', { CLAUDE_PLUGIN_ROOT: ROOT }, 'not json');
  assert.equal(run.status, 0);
  assert.equal(run.stdout, '');
});

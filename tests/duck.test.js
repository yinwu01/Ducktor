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
    ['﻿开关：quiet\r\n', 'quiet'], ['开关：on、quiet、off 三选一\n开关：off', 'off'],
    ['', 'unset'], ['# Doctor Duck 设定\n\n## 按类静音\n', 'unset'],
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
  assert.ok(text.startsWith(`Doctor Duck 插件根目录：${ROOT}`));
  assert.doesNotMatch(text, /# Doctor Duck 常驻规则/);
  assert.match(text, /没在这个项目开启/);
  assert.ok(text.length < 2500, `${text.length} characters`);
});

test('not turned on and off: commands still get the basics from core.md', () => {
  for (const config of [null, '开关：off\n']) {
    const text = duck.buildContext(project(config ? { '.duck/config.md': config } : {}));
    assert.match(text, /## 东西在哪/);
    assert.match(text, /用 Read 读，不要用 cat/);
    assert.match(text, /upstream\.lock\.json/);
    assert.match(text, /deep-research → \/duck-survey/);
    assert.match(text, /不用破折号/);
    assert.doesNotMatch(text, /## 平时这样做/);
  }
});

test('a config without a switch line is not turned on, and is passed through', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '# Doctor Duck 设定\n\n## 关掉的命令\nfigure\n' }));
  assert.doesNotMatch(text, /# Doctor Duck 常驻规则/);
  assert.match(text, /没在这个项目开启/);
  assert.match(text, /开关：没开启）/);
  assert.match(text, /figure/);
});

test('on: rules load', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：on\n' }));
  assert.match(text, /# Doctor Duck 常驻规则/);
  assert.doesNotMatch(text, /没在这个项目开启/);
});

test('quiet: rules load and the config is passed through', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '# Doctor Duck 设定\n\n开关：quiet\n' }));
  assert.match(text, /# Doctor Duck 常驻规则/);
  assert.match(text, /开关：quiet）/);
});

test('off: the off note replaces the rules', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：off\n' }));
  assert.doesNotMatch(text, /# Doctor Duck 常驻规则/);
  assert.match(text, /Doctor Duck 现在是 off/);
});

test('an unknown switch value is reported to the AI and does not turn the duck on', () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：offline\n' }));
  assert.match(text, /只认 on、quiet、off/);
  assert.doesNotMatch(text, /# Doctor Duck 常驻规则/);
});

test("the student's copy of the rules wins over the plugin's", () => {
  const text = duck.buildContext(project({ '.duck/config.md': '开关：on\n', '.duck/skills/core.md': '# 我们组改过的规则\n' }));
  assert.match(text, /# 我们组改过的规则/);
  assert.doesNotMatch(text, /# Doctor Duck 常驻规则/);
  assert.match(text, /项目里的副本/);
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
  assert.ok(text.length < 5000, `${text.length} characters`);
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
  assert.match(out.additional_context, /Doctor Duck 现在是 off/);
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

test('PreToolUse hook stays silent on bad input', () => {
  const run = runHook('PreToolUse', { CLAUDE_PLUGIN_ROOT: ROOT }, 'not json');
  assert.equal(run.status, 0);
  assert.equal(run.stdout, '');
});

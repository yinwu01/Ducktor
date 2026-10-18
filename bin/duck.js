#!/usr/bin/env node
// Doctor Duck hook script. Code in bin/ is MIT; see LICENSES/README.md.
// One job for now: at session start, tell the AI where the plugin lives,
// load the always-on rules, and pass along the project's .duck/config.md.
// Rule text stays in rules/ (or the student's copy in .duck/skills/), never in this file.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_LIMIT = 1200; // characters of .duck/config.md passed through as-is

// Values the switch line may carry. The Chinese words are what students tend to type.
const MODES = { on: 'on', quiet: 'quiet', off: 'off', 开: 'on', 打开: 'on', 静音: 'quiet', 安静: 'quiet', 关: 'off', 关闭: 'off' };
// A switch line looks like "开关：quiet". Leading list marks, quotes, headings and bold are allowed.
const SWITCH_LINE = /^[\s>#*-]*\**开关\**\s*[:：=]\s*(.*)$/gm;

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    return null;
  }
}

// Both hosts send the hook input as JSON on stdin; its cwd is the project directory.
function readInput() {
  if (process.stdin.isTTY) return {};
  try {
    const raw = fs.readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

// Returns { mode, note }. note is a sentence for the AI when the switch line
// was there but could not be read; no file or no switch line simply means on.
function modeOf(config) {
  if (!config) return { mode: 'on', note: null };
  const seen = [];
  for (const m of config.matchAll(SWITCH_LINE)) {
    const value = m[1].replace(/\*/g, '').trim();
    const word = value.split(/[\s（(，,。.;；]/)[0].toLowerCase();
    if (MODES[word]) return { mode: MODES[word], note: null };
    seen.push(value);
  }
  if (seen.length === 0) return { mode: 'on', note: null };
  return {
    mode: 'on',
    note: `.duck/config.md 的开关行写的是「${seen[0]}」，只认 on、quiet、off，这次按 on 处理。请提醒学生改成这三个词之一。`,
  };
}

// The student's edited copy of the rules wins over the plugin's own.
function coreRules(project) {
  const copy = path.join(project, '.duck', 'skills', 'core.md');
  const own = readText(copy);
  if (own !== null) return `${own}\n\n（这份常驻规则是项目里的副本 .duck/skills/core.md，学生改过。原版在插件根目录的 rules/core.md。）`;
  return readText(path.join(ROOT, 'rules', 'core.md')) || '（没读到 rules/core.md，常驻规则这次缺席。）';
}

function buildContext(project) {
  const config = readText(path.join(project, '.duck', 'config.md'));
  const { mode, note } = modeOf(config);
  const parts = [`Doctor Duck 插件根目录：${ROOT}`];

  if (mode === 'off') {
    parts.push(readText(path.join(ROOT, 'rules', 'off.md')) || '开关：off。');
  } else {
    parts.push(coreRules(project));
  }

  if (config === null) {
    parts.push('这个项目还没有 .duck/config.md，开关按默认的 on。');
  } else {
    const shown = config.length > CONFIG_LIMIT
      ? `${config.slice(0, CONFIG_LIMIT)}\n……（后面太长没放进来，要用时直接读这个文件）`
      : config;
    parts.push(`项目的 .duck/config.md（开关：${mode}）：\n${shown}`);
    if (note) parts.push(note);
    if (config.includes('�')) parts.push('.duck/config.md 里有读不出的字节（可能不是 UTF-8 编码），开关可能没认对。');
  }
  return parts.join('\n\n');
}

function sessionStart() {
  const input = readInput();
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : null;
  return buildContext(cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd());
}

function main(command) {
  let context = '';
  try {
    if (command === 'session-start') context = sessionStart();
  } catch (err) {
    context = `Doctor Duck 插件根目录：${ROOT}\n\n（开场脚本出错，常驻规则这次没加载：${err.message}）`;
  }
  if (!context) return;
  // Claude Code and Codex both read this shape at SessionStart. writeSync, because an
  // async pipe write can be lost when the process exits right after it.
  fs.writeSync(1, JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
  }));
}

module.exports = { main, modeOf, buildContext, ROOT };

if (require.main === module) main(process.argv[2]);

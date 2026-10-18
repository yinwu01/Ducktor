#!/usr/bin/env node
// Doctor Duck hook script. Code in bin/ is MIT; see LICENSES/README.md.
// One job for now: at session start, tell the AI where the plugin lives,
// load rules/core.md, and pass along the project's .duck/config.md.
// Rule text stays in rules/, never in this file.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_LIMIT = 1200; // characters of .duck/config.md passed through as-is

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

// The switch line in config.md reads like "开关：quiet". No file or no line means on.
function modeOf(config) {
  const m = config && config.match(/^[\s>*-]*开关\s*[:：]\s*(on|quiet|off)\b/im);
  return m ? m[1].toLowerCase() : 'on';
}

function sessionStart() {
  const input = readInput();
  const project = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const config = readText(path.join(project, '.duck', 'config.md'));
  const mode = modeOf(config);
  const parts = [`Doctor Duck 插件根目录：${ROOT}`];
  if (mode === 'off') {
    parts.push(readText(path.join(ROOT, 'rules', 'off.md')) || '开关：off。');
  } else {
    parts.push(readText(path.join(ROOT, 'rules', 'core.md')) || '（没读到 rules/core.md，常驻规则这次缺席。）');
  }
  if (config === null) {
    parts.push('这个项目还没有 .duck/config.md，开关按默认的 on。');
  } else {
    const shown = config.length > CONFIG_LIMIT
      ? `${config.slice(0, CONFIG_LIMIT)}\n……（后面太长没放进来，要用时直接读这个文件）`
      : config;
    parts.push(`项目的 .duck/config.md（开关：${mode}）：\n${shown}`);
  }
  return parts.join('\n\n');
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

module.exports = { main };

if (require.main === module) main(process.argv[2]);

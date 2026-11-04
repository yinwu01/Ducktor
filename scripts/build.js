#!/usr/bin/env node
// Builds the files that are generated from rules/. Code here is MIT; the text it
// copies stays in rules/ (CC BY-NC-SA 4.0).
//
//   skills/<name>/SKILL.md, skills/<name>/agents/openai.yaml
//       the nine /duck-* wrappers, from rules/wrapper-template.md + rules/commands.json
//   the 「先记住的规矩」 block in every command except the hub (skills/duck)
//       the 「东西在哪」, 「每次都照做」 and 「怎么讲」 sections of rules/core.md, so a command has them
//       in a project that has not turned Ducktor on (the hook then injects only a short
//       note); in the hand-written commands it sits between basics:start and basics:end
//   AGENTS.md
//       the always-on rules for agents without a session-start hook,
//       from rules/agents-header.md + rules/core.md
//
//   node scripts/build.js           write the files
//   node scripts/build.js --check   exit 1 if any generated file is out of date
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function fill(text, values) {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, key) => (key in values ? values[key] : whole));
}

// One "## " section of a rules file, heading included; '' when it is not there.
function sectionOf(text, title) {
  const m = new RegExp(`^##[ \\t]*${title}[ \\t]*$`, 'm').exec(text);
  if (m === null) return '';
  const end = text.indexOf('\n## ', m.index + 1);
  return text.slice(m.index, end < 0 ? undefined : end).trim();
}

// What every command needs even when the resident rules are not loaded.
function basics() {
  const core = read('rules/core.md');
  const sections = ['东西在哪', '每次都照做', '怎么讲'].map((title) => {
    const s = sectionOf(core, title);
    if (!s) throw new Error(`rules/core.md has no "## ${title}" section`);
    return s.replace(/^## /, '### ');
  });
  return [
    '## 先记住的规矩',
    '下面三节和常驻规则里的同名三节一样：Ducktor 没在这个项目开启时，这条命令也照它们做；开场注入里有常驻规则时，以注入的为准。',
    '',
    sections.join('\n\n'),
  ].join('\n');
}

// The hub (skills/duck) gets no copy. It only lists, switches and routes, and the command it
// picks carries the block. With a copy in it (at the top or at the end), `/duck <sentence>`
// was mostly answered by the hub itself instead of routed (route A/B, 2026-10-28, docs/testing.md).
const HAND_WRITTEN = ['duck-why', 'duck-learn', 'duck-notes', 'duck-skill'];
const SLOT = /(<!-- basics:start -->\n)[\s\S]*?(<!-- basics:end -->)/;

function handWritten(block) {
  const files = {};
  for (const name of HAND_WRITTEN) {
    const rel = `skills/${name}/SKILL.md`;
    const text = read(rel);
    if (!SLOT.test(text)) throw new Error(`${rel} has no basics:start / basics:end slot`);
    files[rel] = text.replace(SLOT, (whole, start, end) => `${start}${block}\n${end}`);
  }
  return files;
}

function wrappers(block) {
  const template = read('rules/wrapper-template.md');
  const { default_skill_block: defaultBlock, commands } = JSON.parse(read('rules/commands.json'));
  const files = {};
  for (const c of commands) {
    for (const skill of c.skills) {
      if (!fs.existsSync(path.join(ROOT, 'library', skill, 'SKILL.md'))) {
        throw new Error(`${c.name}: library/${skill}/SKILL.md does not exist`);
      }
    }
    const values = {
      ...c,
      basics: block,
      skill_block: c.skill_block || fill(defaultBlock, { skill: c.skills[0] }),
      extra: c.extra ? `\n- ${c.extra}` : '',
      checks: c.checks ? c.checks.join('\n') : '还没有。以后经过评测的查项会钉在这里，每条标卡号。',
    };
    const body = fill(template, values);
    const left = body.match(/\{\{\w+\}\}/);
    if (left) throw new Error(`${c.name}: placeholder ${left[0]} has no value`);
    files[`skills/${c.name}/SKILL.md`] = body;
    files[`skills/${c.name}/agents/openai.yaml`] = [
      'interface:',
      `  display_name: "Ducktor: ${c.short}"`,
      `  short_description: "${c.title}"`,
      'policy:',
      '  allow_implicit_invocation: false',
      '',
    ].join('\n');
  }
  return files;
}

function agentsMd() {
  return { 'AGENTS.md': read('rules/agents-header.md') + read('rules/core.md') };
}

function render() {
  const block = basics();
  return { ...wrappers(block), ...handWritten(block), ...agentsMd() };
}

function main(argv) {
  const check = argv.includes('--check');
  const stale = [];
  for (const [rel, text] of Object.entries(render())) {
    const file = path.join(ROOT, rel);
    let current = null;
    try { current = fs.readFileSync(file, 'utf8'); } catch (err) { /* missing */ }
    if (current === text) continue;
    if (check) {
      stale.push(rel);
    } else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, text);
      console.log(`wrote ${rel}`);
    }
  }
  if (check && stale.length) {
    console.error(`Out of date, run node scripts/build.js:\n  ${stale.join('\n  ')}`);
    process.exit(1);
  }
}

module.exports = { render };

if (require.main === module) main(process.argv.slice(2));

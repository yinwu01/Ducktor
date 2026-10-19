#!/usr/bin/env node
// Builds the files that are generated from rules/. Code here is MIT; the text it
// copies stays in rules/ (CC BY-NC-SA 4.0).
//
//   skills/<name>/SKILL.md, skills/<name>/agents/openai.yaml
//       the nine /duck-* wrappers, from rules/wrapper-template.md + rules/commands.json
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

function wrappers() {
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
      `  display_name: "Doctor Duck: ${c.short}"`,
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
  return { ...wrappers(), ...agentsMd() };
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

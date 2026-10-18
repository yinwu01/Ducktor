#!/usr/bin/env node
// Builds the nine /duck-* wrapper commands from rules/wrapper-template.md and
// rules/commands.json. Code here is MIT; the text it copies stays in rules/.
//
//   node scripts/build-wrappers.js           write skills/<name>/SKILL.md and agents/openai.yaml
//   node scripts/build-wrappers.js --check   exit 1 if any generated file is out of date
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function fill(text, values) {
  return text.replace(/\{\{(\w+)\}\}/g, (whole, key) => (key in values ? values[key] : whole));
}

function render() {
  const template = fs.readFileSync(path.join(ROOT, 'rules', 'wrapper-template.md'), 'utf8');
  const { default_skill_block: defaultBlock, commands } = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'rules', 'commands.json'), 'utf8'));
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
    };
    const body = fill(template, values);
    const left = body.match(/\{\{\w+\}\}/);
    if (left) throw new Error(`${c.name}: placeholder ${left[0]} has no value`);
    files[path.join('skills', c.name, 'SKILL.md')] = body;
    files[path.join('skills', c.name, 'agents', 'openai.yaml')] = [
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
    console.error(`Out of date, run node scripts/build-wrappers.js:\n  ${stale.join('\n  ')}`);
    process.exit(1);
  }
}

module.exports = { render };

if (require.main === module) main(process.argv.slice(2));

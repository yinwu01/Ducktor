#!/usr/bin/env node
// Fails when files an installed copy runs on changed since the last release tag, but the
// version did not. Claude Code keeps an installed plugin until its version string changes,
// so such a change never reaches people who installed from GitHub. Code is MIT.
//
//   node scripts/release-check.js
//
// Release tags are the ones `claude plugin tag` makes: <name>--v<version>, e.g. duck--v0.2.0.
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// What an installed copy runs on. README, docs, tests, evals and media need no release.
const SHIPPED = ['AGENTS.md', 'bin', 'cards', 'gemini-extension.json', 'handbook', 'hooks', 'library', 'rules', 'skills',
  '.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json'];

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function main() {
  const { name, version } = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
  let tag;
  try {
    git(['rev-parse', '--git-dir']);
  } catch (err) {
    console.log('release-check: not a git checkout, skipped');
    return;
  }
  try {
    tag = git(['describe', '--tags', '--abbrev=0', '--match', `${name}--v*`, 'HEAD']);
  } catch (err) {
    console.log(`release-check: no ${name}--v* tag before HEAD yet, nothing to compare`);
    return;
  }
  const released = tag.slice(`${name}--v`.length);
  if (released !== version) {
    console.log(`release-check: version ${version}, last release ${tag}`);
    return;
  }
  const changed = git(['diff', '--name-only', tag, 'HEAD', '--', ...SHIPPED]).split('\n').filter(Boolean);
  if (changed.length === 0) {
    console.log(`release-check: nothing an installed copy runs on changed since ${tag}`);
    return;
  }
  console.error(`release-check: these changed since ${tag}, but the version is still ${version}.`);
  console.error('Installed copies will not update. Raise the version in every manifest and package.json, and add a CHANGELOG entry:');
  for (const f of changed) console.error(`  ${f}`);
  process.exit(1);
}

main();

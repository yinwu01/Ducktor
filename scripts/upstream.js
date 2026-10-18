#!/usr/bin/env node
// library/ and handbook/ are byte-for-byte copies of Supervisor-Skills files.
// This script records their hashes and checks or refreshes them. Code is MIT.
//
//   node scripts/upstream.js check                 hashes still match library/upstream.lock.json
//   node scripts/upstream.js lock                  rewrite the lock from the files on disk
//   node scripts/upstream.js sync <upstream-dir>   copy from a Supervisor-Skills checkout, then lock
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LOCK = path.join(ROOT, 'library', 'upstream.lock.json');
// Our own notes inside the copied folders; not upstream files.
const OURS = new Set(['library/README.md', 'library/upstream.lock.json', 'handbook/README.md']);
// The upstream skills this repository carries. Skills added upstream later are not copied.
const KEEP = new Set(['benchmark-paper-template', 'deep-research', 'figure-designer', 'idea-evaluator',
  'intro-drafter', 'paper-polish', 'paper-writer', 'pre-submission-reviewer', 'tech-paper-template',
  'vibe-research-workflow']);

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

function hashes() {
  const files = {};
  for (const top of ['library', 'handbook']) {
    for (const rel of walk(path.join(ROOT, top))) {
      const key = `${top}/${rel}`;
      if (OURS.has(key)) continue;
      files[key] = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, key))).digest('hex');
    }
  }
  return files;
}

function readLock() {
  return JSON.parse(fs.readFileSync(LOCK, 'utf8'));
}

function check() {
  const lock = readLock();
  const now = hashes();
  const problems = [];
  for (const [file, sum] of Object.entries(lock.files)) {
    if (!(file in now)) problems.push(`missing  ${file}`);
    else if (now[file] !== sum) problems.push(`changed  ${file}`);
  }
  for (const file of Object.keys(now)) if (!(file in lock.files)) problems.push(`extra    ${file}`);
  return problems;
}

function writeLock(commit) {
  const old = fs.existsSync(LOCK) ? readLock() : {};
  const lock = {
    upstream: 'https://github.com/HKUSTDial/Supervisor-Skills',
    commit: commit || old.commit,
    note: 'sha256 of every upstream file copied into library/ and handbook/; see library/README.md',
    files: hashes(),
  };
  fs.writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
  return lock;
}

function copyTree(from, to, keep) {
  const copied = [];
  for (const rel of walk(from)) {
    if (!keep(rel)) continue;
    const dest = path.join(to, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(from, rel), dest);
    copied.push(rel);
  }
  return copied;
}

function sync(upstream) {
  const up = path.resolve(upstream);
  const commit = execFileSync('git', ['-C', up, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const before = readLock().files;
  copyTree(path.join(up, 'skills'), path.join(ROOT, 'library'), (rel) => KEEP.has(rel.split('/')[0]));
  copyTree(path.join(up, 'handbook'), path.join(ROOT, 'handbook', 'zh'), (rel) => rel.endsWith('.md'));
  copyTree(path.join(up, 'handbook-en'), path.join(ROOT, 'handbook', 'en'), (rel) => rel.endsWith('.md'));
  const after = writeLock(commit).files;
  const changed = Object.keys(after).filter((f) => before[f] !== after[f]);
  const gone = Object.keys(before).filter((f) => !(f in after));
  console.log(`Synced to ${commit}. ${changed.length} files added or changed.`);
  for (const f of changed) console.log(`  ${f}`);
  if (gone.length) console.log(`Not in the copy any more (delete by hand if upstream removed them):\n  ${gone.join('\n  ')}`);
}

function main([command, arg]) {
  if (command === 'check') {
    const problems = check();
    if (problems.length) {
      console.error(`library/ or handbook/ no longer match ${readLock().commit}:\n  ${problems.join('\n  ')}`);
      process.exit(1);
    }
    console.log(`library/ and handbook/ match Supervisor-Skills ${readLock().commit}`);
  } else if (command === 'lock') {
    console.log(`wrote ${path.relative(ROOT, LOCK)} (${Object.keys(writeLock(arg).files).length} files)`);
  } else if (command === 'sync' && arg) {
    sync(arg);
  } else {
    console.error('usage: node scripts/upstream.js check | lock [commit] | sync <upstream-dir>');
    process.exit(2);
  }
}

module.exports = { check };

if (require.main === module) main(process.argv.slice(2));

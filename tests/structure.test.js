// Static checks on the plugin's files: manifests, commands, generated files, the
// upstream copies, and house style. No model calls.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));

const COMMANDS = fs.readdirSync(path.join(ROOT, 'skills')).filter((d) => d.startsWith('duck')).sort();
const LIBRARY = fs.readdirSync(path.join(ROOT, 'library'), { withFileTypes: true })
  .filter((d) => d.isDirectory()).map((d) => d.name).sort();

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(m, 'missing frontmatter');
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2];
  }
  return out;
}

test('there are fourteen commands: the hub and thirteen /duck-* commands', () => {
  assert.equal(COMMANDS.length, 14, COMMANDS.join(' '));
  assert.ok(COMMANDS.includes('duck'));
});

test('every command is registered for manual use only, on both hosts', () => {
  for (const name of COMMANDS) {
    const fm = frontmatter(read(`skills/${name}/SKILL.md`));
    assert.equal(fm.name, name);
    assert.ok(fm.description && fm.description.length > 10, `${name} description`);
    assert.equal(fm['disable-model-invocation'], 'true', name);
    // frontmatter only registers the command; the hub and student copies read the body as plain text
    assert.deepEqual(Object.keys(fm).sort(), ['description', 'disable-model-invocation', 'name'], name);
    assert.match(read(`skills/${name}/agents/openai.yaml`), /allow_implicit_invocation: false/, name);
  }
});

test('the hub menu lists every command, and nothing else', () => {
  const hub = read('skills/duck/SKILL.md');
  const listed = [...hub.matchAll(/^\| \/(duck-[a-z]+) \|/gm)].map((m) => m[1]).sort();
  assert.deepEqual(listed, COMMANDS.filter((c) => c !== 'duck'));
});

test('every original skill has a command, and core.md maps every skill name', () => {
  const { commands } = json('rules/commands.json');
  const wrapped = commands.flatMap((c) => c.skills).sort();
  assert.deepEqual(wrapped, LIBRARY);
  const core = read('rules/core.md');
  for (const skill of LIBRARY) assert.match(core, new RegExp(`${skill}[^；。]*→ /duck-`), skill);
});

test('generated files are up to date', () => {
  const run = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build.js'), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('library/ and handbook/ still match the upstream commit', () => {
  const run = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'upstream.js'), 'check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
});

test('paths the commands and rules point at exist', () => {
  const files = ['rules/core.md', 'AGENTS.md', ...COMMANDS.map((c) => `skills/${c}/SKILL.md`)];
  for (const file of files) {
    for (const m of read(file).matchAll(/(?<![\w./])(library|skills|rules|cards|handbook)\/([\w.-]+(?:\/[\w.-]+)*)/g)) {
      const rel = `${m[1]}/${m[2]}`.replace(/[.。]+$/, '');
      if (/duck-xxx|<|技能名|命令名|卡号/.test(rel)) continue;
      assert.ok(fs.existsSync(path.join(ROOT, rel)), `${file} points at ${rel}`);
    }
  }
});

test('manifests parse, agree on name and version, and point at real files', () => {
  const claude = json('.claude-plugin/plugin.json');
  const codex = json('.codex-plugin/plugin.json');
  const cursor = json('.cursor-plugin/plugin.json');
  const gemini = json('gemini-extension.json');
  const pkg = json('package.json');
  for (const m of [codex, cursor, gemini]) assert.equal(m.name, claude.name);
  for (const m of [codex, cursor, gemini, pkg]) assert.equal(m.version, claude.version);
  for (const m of [claude, codex, cursor]) assert.ok(fs.existsSync(path.join(ROOT, m.hooks)), m.hooks);
  assert.ok(fs.existsSync(path.join(ROOT, gemini.contextFileName)));
  assert.equal(json('.claude-plugin/marketplace.json').plugins[0].name, claude.name);
  assert.equal(json('.agents/plugins/marketplace.json').plugins[0].name, codex.name);
  // Gemini CLI auto-loads hooks/hooks.json; the Claude/Codex hooks must not sit there.
  assert.ok(!fs.existsSync(path.join(ROOT, 'hooks', 'hooks.json')));
});

test('hook commands use no shell syntax that differs between sh, PowerShell and cmd', () => {
  for (const event of Object.values(json('hooks/claude-codex-hooks.json').hooks)) {
    for (const entry of event) {
      for (const hook of entry.hooks) assert.doesNotMatch(hook.command, /[$%^!&`]|\$\{/, hook.command);
    }
  }
});

test('our own text has no em-dash', () => {
  // LICENSES/ holds upstream legal texts as published; only its README is ours.
  const ours = ['README.md', 'INSTALL.md', 'AGENTS.md', 'LICENSE', 'LICENSES/README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'i18n', '.github', 'rules', 'skills', 'cards', 'bin', 'hooks', 'scripts', 'tests', 'docs'];
  const skip = [/^docs\/(design|research)\//, /^tests\/fixtures\//];
  const hits = [];
  const visit = (rel) => {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full) || skip.some((re) => re.test(rel))) return;
    if (fs.statSync(full).isDirectory()) {
      for (const name of fs.readdirSync(full)) visit(`${rel}/${name}`);
    } else if (/\.(md|js|json|ya?ml|txt)$|^LICENSE$/.test(path.basename(full)) && read(rel).includes(String.fromCharCode(0x2014))) {
      hits.push(rel);
    }
  };
  ours.forEach(visit);
  assert.deepEqual(hits, []);
});

test('cards: INDEX lists every card, fields are complete, and cited files and lines exist', () => {
  const dir = path.join(ROOT, 'cards');
  const files = fs.readdirSync(dir).filter((f) => /^[A-Z]\d{2}\.md$/.test(f)).sort();
  const index = read('cards/INDEX.md');
  const listed = [...index.matchAll(/^\| ([A-Z]\d{2}) \|.*\| \1\.md \|$/gm)].map((m) => `${m[1]}.md`).sort();
  assert.deepEqual(listed, files);
  for (const file of files) {
    const text = read(`cards/${file}`);
    const fm = frontmatter(text);
    for (const key of ['id', 'title', 'when', 'strength', 'sources', 'scope', 'verified']) assert.ok(fm[key], `${file} has ${key}`);
    assert.equal(`${fm.id}.md`, file);
    assert.ok(['共识', '有出处', '有分歧'].includes(fm.strength), `${file} strength ${fm.strength}`);
    if (fm.strength === '共识') assert.ok(fm.sources.split(',').length >= 3, `${file} is 共识 with fewer than three sources`);
    assert.ok(index.includes(`| ${fm.id} | ${fm.title} | ${fm.strength} |`), `${file} matches its INDEX row`);
    // Every handbook/ or library/ file a card cites exists, and every line it cites is inside the file.
    for (const line of text.split('\n')) {
      const cites = [...line.matchAll(/(?:handbook|library)\/[^\s，。；、（）()]+/g)];
      cites.forEach((m, i) => {
        const rel = m[0];
        assert.ok(fs.existsSync(path.join(ROOT, rel)), `${file} cites ${rel}`);
        const length = read(rel).split('\n').length;
        const span = line.slice(m.index, i + 1 < cites.length ? cites[i + 1].index : undefined);
        for (const n of span.matchAll(/第 (\d+)(?: 到 (\d+))? 行/g)) {
          assert.ok(Number(n[2] || n[1]) <= length, `${file} cites ${rel} line ${n[2] || n[1]}, file has ${length}`);
        }
      });
    }
  }
});

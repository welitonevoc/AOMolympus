import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('AgEnFK repository integration', () => {
  it('defines a valid shared .agenfk/project.json matching AgEnFK v2.0.0 schema', () => {
    const projectJsonPath = path.join(ROOT, '.agenfk', 'project.json');
    expect(fs.existsSync(projectJsonPath)).toBe(true);

    const parsed = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8')) as Record<string, unknown>;
    const allowedKeys = new Set([
      'name',
      'description',
      'flow',
      'verifyCommand',
      'setupCommand',
      'autoWorktree',
      'askBeforeCommit',
    ]);

    for (const key of Object.keys(parsed)) {
      expect(allowedKeys.has(key)).toBe(true);
    }

    // Machine-only keys must never be committed in .agenfk/project.json
    expect(parsed.projectId).toBeUndefined();
    expect(parsed.projectRoot).toBeUndefined();
    expect(parsed.worktreeRoot).toBeUndefined();
    expect(parsed.flowId).toBeUndefined();

    expect(parsed.name).toBe('Age of Mythology: Olympus');
    expect(parsed.verifyCommand).toBe('npm run lint && npm run build && npm test');
    expect(parsed.setupCommand).toBe('npm install');
    expect(String(parsed.verifyCommand)).not.toMatch(/(^|\s|=)(~\/|\/Users\/|\/home\/)/);
  });

  it('ignores machine-local AgEnFK runtime state in .gitignore', () => {
    const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    expect(gitignore).toContain('.agenfk/local.json');
    expect(gitignore).toContain('.agenfk/*.sqlite*');
    expect(gitignore).not.toMatch(/^\.agenfk\/?$/m);
  });

  it('configures AgEnFK scripts on port 3100 to avoid colliding with port 3000 dev server', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['agenfk:install']).toBe('npx github:cglab-public/agenfk');
    expect(pkg.scripts['agenfk:up']).toContain('AGENFK_PORT=3100');
    expect(pkg.scripts['agenfk:init']).toContain('agenfk init');
    expect(pkg.scripts['agenfk:verify']).toBe('npm run lint && npm run build && npm test');
  });

  it('ships project-scoped AgEnFK rule bundles for Claude Code, Codex, Gemini CLI, and Cursor', () => {
    const mdFiles = ['.claude/CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];
    for (const rel of mdFiles) {
      const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      expect(content).toContain('<!-- agenfk:start -->');
      expect(content).toContain('<!-- agenfk:end -->');
      expect(content).toContain('AGENFK_PORT=3100');
    }

    const cursorRule = fs.readFileSync(path.join(ROOT, '.cursor', 'rules', 'agenfk.mdc'), 'utf8');
    expect(cursorRule.startsWith('---\n')).toBe(true);
    expect(cursorRule).toContain('alwaysApply: true');
    expect(cursorRule).toContain('AGENFK_PORT=3100');
  });
});

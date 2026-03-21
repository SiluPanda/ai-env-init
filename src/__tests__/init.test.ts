import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { init, buildDefaultAnswers, DEFAULT_FORMATS } from '../init';
import { detect } from '../detect';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-env-init-init-'));
}

function cleanTmpDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

function writeJson(filePath: string, data: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

describe('init', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    cleanTmpDir(tmpDir);
  });

  // ── buildDefaultAnswers ───────────────────────────────────────────

  describe('buildDefaultAnswers', () => {
    it('builds defaults from detected TypeScript project', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'my-ts-project',
        description: 'A TypeScript project',
        devDependencies: { vitest: '^1.0.0' },
      });
      writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
      fs.mkdirSync(path.join(tmpDir, '.github'), { recursive: true });

      const info = await detect(tmpDir);
      const answers = buildDefaultAnswers(info);

      expect(answers.project.name).toBe('my-ts-project');
      expect(answers.project.description).toBe('A TypeScript project');
      expect(answers.project.language).toBe('TypeScript');
      expect(answers.conventions.namingConvention).toBe('camelCase');
      expect(answers.conventions.componentNaming).toBe('PascalCase');
      expect(answers.testing.framework).toBe('Vitest');
      expect(answers.testing.command).toBe('npm test');
      expect(answers.team.reviewProcess).toBe('pull-requests');
    });

    it('builds defaults for Python project', async () => {
      writeFile(
        path.join(tmpDir, 'pyproject.toml'),
        '[project]\nname = "my-py"\ndependencies = ["django"]',
      );
      writeFile(path.join(tmpDir, 'conftest.py'), '');

      const info = await detect(tmpDir);
      const answers = buildDefaultAnswers(info);

      expect(answers.project.language).toBe('Python');
      expect(answers.conventions.namingConvention).toBe('snake_case');
      expect(answers.testing.framework).toBe('pytest');
      expect(answers.testing.command).toBe('pytest');
    });

    it('builds defaults for Go project', async () => {
      writeFile(path.join(tmpDir, 'go.mod'), 'module example.com/test');

      const info = await detect(tmpDir);
      const answers = buildDefaultAnswers(info);

      expect(answers.project.language).toBe('Go');
      expect(answers.conventions.namingConvention).toBe('camelCase');
    });

    it('builds defaults for Rust project', async () => {
      writeFile(
        path.join(tmpDir, 'Cargo.toml'),
        '[package]\nname = "my-crate"',
      );

      const info = await detect(tmpDir);
      const answers = buildDefaultAnswers(info);

      expect(answers.project.language).toBe('Rust');
      expect(answers.conventions.namingConvention).toBe('snake_case');
    });

    it('builds defaults for Ruby project', async () => {
      writeFile(path.join(tmpDir, 'Gemfile'), "gem 'rails'");

      const info = await detect(tmpDir);
      const answers = buildDefaultAnswers(info);

      expect(answers.project.language).toBe('Ruby');
      expect(answers.conventions.namingConvention).toBe('snake_case');
    });

    it('uses sensible defaults for empty project', async () => {
      const info = await detect(tmpDir);
      const answers = buildDefaultAnswers(info);

      expect(answers.project.name).toBe('my-project');
      expect(answers.project.language).toBe('TypeScript');
      expect(answers.conventions.namingConvention).toBe('camelCase');
      expect(answers.testing.framework).toBeNull();
      expect(answers.team.reviewProcess).toBe('no-formal');
    });

    it('includes default safety settings', async () => {
      const info = await detect(tmpDir);
      const answers = buildDefaultAnswers(info);

      expect(answers.safety.protectedPaths).toContain('.env');
      expect(answers.safety.securityConstraints).toContain(
        'Never commit secrets',
      );
    });

    it('includes default formats without mcp', () => {
      expect(DEFAULT_FORMATS).not.toContain('mcp');
      expect(DEFAULT_FORMATS).toContain('claude');
      expect(DEFAULT_FORMATS).toContain('cursor');
      expect(DEFAULT_FORMATS).toContain('agents');
      expect(DEFAULT_FORMATS).toContain('copilot');
      expect(DEFAULT_FORMATS).toContain('gemini');
      expect(DEFAULT_FORMATS).toContain('windsurf');
      expect(DEFAULT_FORMATS).toContain('cline');
    });
  });

  // ── init ──────────────────────────────────────────────────────────

  describe('init function', () => {
    it('detects, generates, and writes files', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'init-test',
        description: 'Test the init flow',
        devDependencies: { vitest: '^1.0.0', eslint: '^8.0.0' },
      });
      writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
      fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });

      const result = await init({
        projectPath: tmpDir,
        formats: ['claude', 'cursor'],
      });

      expect(result.detection.language!.value).toBe('TypeScript');
      expect(result.answers.project.name).toBe('init-test');
      expect(result.files).toHaveLength(2);
      expect(result.written).toHaveLength(2);
      expect(result.skipped).toHaveLength(0);

      // Files were written to disk
      expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, '.cursorrules'))).toBe(true);

      // Content is correct
      const claude = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claude).toContain('init-test');
      expect(claude).toContain('TypeScript');
    });

    it('generates all default formats', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'full-test',
      });

      const result = await init({
        projectPath: tmpDir,
      });

      expect(result.files.length).toBe(DEFAULT_FORMATS.length);
      expect(result.written.length).toBe(DEFAULT_FORMATS.length);
    });

    it('merges user-provided answers', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'merge-test',
      });

      const result = await init({
        projectPath: tmpDir,
        formats: ['claude'],
        answers: {
          project: {
            name: 'custom-name',
            description: 'Custom description',
            language: 'Python',
            framework: 'Django',
            additionalTools: ['Celery'],
          },
          conventions: {
            namingConvention: 'snake_case',
            componentNaming: 'PascalCase',
            importOrdering: 'alphabetical',
            errorHandling: 'try-catch',
            commentStyle: 'minimal',
            preferredPatterns: [],
          },
        },
      });

      expect(result.answers.project.name).toBe('custom-name');
      expect(result.answers.project.language).toBe('Python');
      expect(result.answers.conventions.namingConvention).toBe('snake_case');

      const claude = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claude).toContain('custom-name');
      expect(claude).toContain('Django');
    });

    it('skips existing files without force', async () => {
      writeFile(path.join(tmpDir, 'CLAUDE.md'), 'Existing content');
      writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });

      const result = await init({
        projectPath: tmpDir,
        formats: ['claude', 'cursor'],
      });

      expect(result.skipped).toHaveLength(1);
      expect(result.written).toHaveLength(1);
      expect(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).toBe(
        'Existing content',
      );
    });

    it('overwrites with force option', async () => {
      writeFile(path.join(tmpDir, 'CLAUDE.md'), 'Existing content');
      writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });

      const result = await init({
        projectPath: tmpDir,
        formats: ['claude'],
        force: true,
      });

      expect(result.written).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
      expect(
        fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8'),
      ).not.toBe('Existing content');
    });

    it('dry run does not create files', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'dry-test' });

      const result = await init({
        projectPath: tmpDir,
        formats: ['claude', 'cursor'],
        dryRun: true,
      });

      expect(result.files).toHaveLength(2);
      expect(result.written).toHaveLength(2);
      expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(false);
      expect(fs.existsSync(path.join(tmpDir, '.cursorrules'))).toBe(false);
    });

    it('uses custom templates', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'custom-tmpl' });

      await init({
        projectPath: tmpDir,
        formats: ['claude'],
        templates: {
          claude: '# CUSTOM: {{project.name}}',
        },
      });

      const claude = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claude).toContain('# CUSTOM: custom-tmpl');
    });

    it('creates .github/ dir for copilot format', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'copilot-test' });

      await init({
        projectPath: tmpDir,
        formats: ['copilot'],
      });

      expect(
        fs.existsSync(
          path.join(tmpDir, '.github', 'copilot-instructions.md'),
        ),
      ).toBe(true);
    });

    it('generates MCP config when explicitly requested', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'mcp-test' });

      const result = await init({
        projectPath: tmpDir,
        formats: ['mcp'],
      });

      expect(result.files).toHaveLength(1);
      expect(result.files[0].format).toBe('mcp');
      const content = fs.readFileSync(
        path.join(tmpDir, '.mcp.json'),
        'utf-8',
      );
      expect(content).toContain('mcpServers');
    });

    it('returns detection results', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'detect-result',
        devDependencies: { vitest: '^1.0.0' },
      });
      writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');

      const result = await init({
        projectPath: tmpDir,
        formats: ['claude'],
      });

      expect(result.detection.language!.value).toBe('TypeScript');
      expect(result.detection.testFrameworks[0].value).toBe('Vitest');
      expect(result.detection.name).toBe('detect-result');
    });
  });
});

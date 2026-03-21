import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { generate, writeFiles, buildContext } from '../generator';
import type { QuestionnaireAnswers, ProjectInfo } from '../types';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-env-init-gen-'));
}

function cleanTmpDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

function makeAnswers(
  overrides?: Partial<QuestionnaireAnswers>,
): QuestionnaireAnswers {
  return {
    project: {
      name: 'test-project',
      description: 'A test project',
      language: 'TypeScript',
      framework: 'React',
      additionalTools: ['Zod', 'tRPC'],
    },
    conventions: {
      namingConvention: 'camelCase',
      componentNaming: 'PascalCase',
      importOrdering: 'external-first',
      errorHandling: 'try-catch',
      commentStyle: 'jsdoc-public',
      preferredPatterns: ['Prefer const over let', 'Prefer async/await'],
    },
    aiBehavior: {
      verbosity: 'balanced',
      modificationApproach: 'minimal',
      whenUncertain: 'ask',
      autonomousActions: ['May create new files'],
    },
    testing: {
      framework: 'Vitest',
      command: 'npm test',
      expectations: ['Write tests for new features'],
    },
    safety: {
      protectedPaths: ['.env', 'node_modules/'],
      topicsToAvoid: [],
      securityConstraints: ['Never commit secrets'],
    },
    team: {
      size: 'small',
      reviewProcess: 'pull-requests',
      commitConvention: 'conventional',
      branchNaming: 'feat/<description>',
    },
    formats: ['claude', 'cursor'],
    ...overrides,
  };
}

describe('generator', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    cleanTmpDir(tmpDir);
  });

  // ── buildContext ──────────────────────────────────────────────────

  describe('buildContext', () => {
    it('builds context from answers', () => {
      const answers = makeAnswers();
      const ctx = buildContext(answers);
      expect((ctx.project as Record<string, unknown>).name).toBe(
        'test-project',
      );
      expect(ctx.primaryFrameworkDescription).toBe('a React application');
      expect(ctx.hasPreferredPatterns).toBe(true);
      expect(ctx.hasTestExpectations).toBe(true);
      expect(ctx.hasProtectedPaths).toBe(true);
      expect(ctx.hasSecurityConstraints).toBe(true);
      expect(ctx.isTypeScript).toBe(true);
      expect(ctx.hasTests).toBe(true);
    });

    it('handles no framework', () => {
      const answers = makeAnswers({
        project: {
          name: 'bare',
          description: 'Bare project',
          language: 'JavaScript',
          framework: null,
          additionalTools: [],
        },
      });
      const ctx = buildContext(answers);
      expect(ctx.primaryFrameworkDescription).toBe('a JavaScript project');
    });

    it('handles empty patterns and expectations', () => {
      const answers = makeAnswers({
        conventions: {
          namingConvention: 'camelCase',
          componentNaming: 'PascalCase',
          importOrdering: 'external-first',
          errorHandling: 'try-catch',
          commentStyle: 'minimal',
          preferredPatterns: [],
        },
        testing: {
          framework: null,
          command: null,
          expectations: [],
        },
      });
      const ctx = buildContext(answers);
      expect(ctx.hasPreferredPatterns).toBe(false);
      expect(ctx.hasTestExpectations).toBe(false);
      expect(ctx.hasTests).toBe(false);
    });

    it('includes detection info when provided', () => {
      const answers = makeAnswers();
      const info: ProjectInfo = {
        name: 'detected-name',
        description: 'detected',
        language: { value: 'TypeScript', confidence: 'high', source: 'tsconfig.json' },
        languages: [{ value: 'TypeScript', confidence: 'high', source: 'tsconfig.json' }],
        frameworks: [{ value: 'React', confidence: 'high', source: 'package.json' }],
        testFrameworks: [{ value: 'Vitest', confidence: 'high', source: 'package.json' }],
        buildTools: [{ value: 'Vite', confidence: 'high', source: 'vite.config.ts' }],
        linters: [
          { value: 'ESLint', confidence: 'high', source: 'package.json' },
          { value: 'Prettier', confidence: 'high', source: 'package.json' },
        ],
        packageManager: { value: 'pnpm', confidence: 'high', source: 'pnpm-lock.yaml' },
        moduleSystem: { value: 'ESM', confidence: 'high', source: 'package.json' },
        monorepo: null,
        git: {
          initialized: true,
          remoteUrl: 'git@github.com:user/repo.git',
          host: 'github',
          commitConvention: null,
          hasHusky: true,
          hasLintStaged: true,
        },
        directories: {
          source: 'src/',
          tests: 'src/__tests__/',
          docs: null,
          scripts: null,
          config: null,
          staticAssets: 'public/',
        },
        existingFiles: [],
        nodeVersion: '>=18',
      };
      const ctx = buildContext(answers, info);
      expect(ctx.buildToolsList).toBe('Vite');
      expect(ctx.lintersList).toBe('ESLint, Prettier');
      expect(ctx.isMonorepo).toBe(false);
      expect((ctx.git as Record<string, unknown>).hasHusky).toBe(true);
      expect((ctx.directories as Record<string, unknown>).source).toBe('src/');
    });
  });

  // ── generate ──────────────────────────────────────────────────────

  describe('generate', () => {
    it('generates CLAUDE.md file', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('claude');
      expect(files[0].fileName).toBe('CLAUDE.md');
      expect(files[0].content).toContain('test-project');
      expect(files[0].content).toContain('TypeScript');
      expect(files[0].tokens).toBeGreaterThan(0);
      expect(files[0].overwrites).toBe(false);
    });

    it('generates .cursorrules file', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['cursor'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('cursor');
      expect(files[0].fileName).toBe('.cursorrules');
      expect(files[0].content).toContain('TypeScript');
    });

    it('generates AGENTS.md file', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['agents'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('agents');
      expect(files[0].fileName).toBe('AGENTS.md');
    });

    it('generates copilot-instructions.md in .github/', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['copilot'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('copilot');
      expect(files[0].fileName).toBe('copilot-instructions.md');
      expect(files[0].path).toContain('.github');
    });

    it('generates GEMINI.md file', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['gemini'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('gemini');
      expect(files[0].fileName).toBe('GEMINI.md');
    });

    it('generates .windsurfrules file', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['windsurf'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('windsurf');
      expect(files[0].fileName).toBe('.windsurfrules');
    });

    it('generates .clinerules file', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['cline'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('cline');
      expect(files[0].fileName).toBe('.clinerules');
    });

    it('generates .mcp.json file', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['mcp'], {
        projectPath: tmpDir,
      });
      expect(files).toHaveLength(1);
      expect(files[0].format).toBe('mcp');
      expect(files[0].fileName).toBe('.mcp.json');
      expect(files[0].content).toContain('mcpServers');
    });

    it('generates multiple formats', async () => {
      const answers = makeAnswers();
      const files = await generate(
        answers,
        ['claude', 'cursor', 'agents'],
        { projectPath: tmpDir },
      );
      expect(files).toHaveLength(3);
      expect(files.map((f) => f.format)).toEqual([
        'claude',
        'cursor',
        'agents',
      ]);
    });

    it('detects overwrites', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      expect(files[0].overwrites).toBe(true);
    });

    it('ensures trailing newline', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      expect(files[0].content.endsWith('\n')).toBe(true);
    });

    it('uses custom templates', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
        templates: {
          claude: '# Custom {{project.name}} template',
        },
      });
      expect(files[0].content).toContain('# Custom test-project template');
    });

    it('content includes conventions', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      const content = files[0].content;
      expect(content).toContain('camelCase');
      expect(content).toContain('PascalCase');
      expect(content).toContain('Vitest');
      expect(content).toContain('npm test');
      expect(content).toContain('Prefer const over let');
      expect(content).toContain('.env');
      expect(content).toContain('Never commit secrets');
    });

    it('content reflects framework', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      expect(files[0].content).toContain('React');
    });

    it('handles no framework gracefully', async () => {
      const answers = makeAnswers({
        project: {
          name: 'bare',
          description: 'Bare',
          language: 'Go',
          framework: null,
          additionalTools: [],
        },
      });
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      expect(files[0].content).toContain('Go project');
    });
  });

  // ── writeFiles ────────────────────────────────────────────────────

  describe('writeFiles', () => {
    it('writes files to disk', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['claude', 'cursor'], {
        projectPath: tmpDir,
      });
      const result = writeFiles(files);
      expect(result.written).toHaveLength(2);
      expect(result.skipped).toHaveLength(0);

      const claudePath = path.join(tmpDir, 'CLAUDE.md');
      expect(fs.existsSync(claudePath)).toBe(true);
      expect(fs.readFileSync(claudePath, 'utf-8')).toBe(files[0].content);
    });

    it('skips existing files by default', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      const result = writeFiles(files);
      expect(result.written).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).toBe(
        'existing',
      );
    });

    it('overwrites with force option', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      const result = writeFiles(files, { force: true });
      expect(result.written).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
      expect(
        fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8'),
      ).not.toBe('existing');
    });

    it('creates subdirectories for copilot format', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['copilot'], {
        projectPath: tmpDir,
      });
      writeFiles(files);
      const copilotPath = path.join(
        tmpDir,
        '.github',
        'copilot-instructions.md',
      );
      expect(fs.existsSync(copilotPath)).toBe(true);
    });

    it('dry run does not write files', async () => {
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      const result = writeFiles(files, { dryRun: true });
      expect(result.written).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
      expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(false);
    });

    it('dry run reports skipped files', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      const result = writeFiles(files, { dryRun: true });
      expect(result.written).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
    });

    it('dry run with force reports all as written', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
      const answers = makeAnswers();
      const files = await generate(answers, ['claude'], {
        projectPath: tmpDir,
      });
      const result = writeFiles(files, { dryRun: true, force: true });
      expect(result.written).toHaveLength(1);
      expect(result.skipped).toHaveLength(0);
      // File should NOT have been modified
      expect(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).toBe(
        'existing',
      );
    });
  });
});

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs = __importStar(require("node:fs"));
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const generator_1 = require("../generator");
function createTmpDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-env-init-gen-'));
}
function cleanTmpDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
}
function makeAnswers(overrides) {
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
(0, vitest_1.describe)('generator', () => {
    let tmpDir;
    (0, vitest_1.beforeEach)(() => {
        tmpDir = createTmpDir();
    });
    (0, vitest_1.afterEach)(() => {
        cleanTmpDir(tmpDir);
    });
    // ── buildContext ──────────────────────────────────────────────────
    (0, vitest_1.describe)('buildContext', () => {
        (0, vitest_1.it)('builds context from answers', () => {
            const answers = makeAnswers();
            const ctx = (0, generator_1.buildContext)(answers);
            (0, vitest_1.expect)(ctx.project.name).toBe('test-project');
            (0, vitest_1.expect)(ctx.primaryFrameworkDescription).toBe('a React application');
            (0, vitest_1.expect)(ctx.hasPreferredPatterns).toBe(true);
            (0, vitest_1.expect)(ctx.hasTestExpectations).toBe(true);
            (0, vitest_1.expect)(ctx.hasProtectedPaths).toBe(true);
            (0, vitest_1.expect)(ctx.hasSecurityConstraints).toBe(true);
            (0, vitest_1.expect)(ctx.isTypeScript).toBe(true);
            (0, vitest_1.expect)(ctx.hasTests).toBe(true);
        });
        (0, vitest_1.it)('handles no framework', () => {
            const answers = makeAnswers({
                project: {
                    name: 'bare',
                    description: 'Bare project',
                    language: 'JavaScript',
                    framework: null,
                    additionalTools: [],
                },
            });
            const ctx = (0, generator_1.buildContext)(answers);
            (0, vitest_1.expect)(ctx.primaryFrameworkDescription).toBe('a JavaScript project');
        });
        (0, vitest_1.it)('handles empty patterns and expectations', () => {
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
            const ctx = (0, generator_1.buildContext)(answers);
            (0, vitest_1.expect)(ctx.hasPreferredPatterns).toBe(false);
            (0, vitest_1.expect)(ctx.hasTestExpectations).toBe(false);
            (0, vitest_1.expect)(ctx.hasTests).toBe(false);
        });
        (0, vitest_1.it)('includes detection info when provided', () => {
            const answers = makeAnswers();
            const info = {
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
            const ctx = (0, generator_1.buildContext)(answers, info);
            (0, vitest_1.expect)(ctx.buildToolsList).toBe('Vite');
            (0, vitest_1.expect)(ctx.lintersList).toBe('ESLint, Prettier');
            (0, vitest_1.expect)(ctx.isMonorepo).toBe(false);
            (0, vitest_1.expect)(ctx.git.hasHusky).toBe(true);
            (0, vitest_1.expect)(ctx.directories.source).toBe('src/');
        });
    });
    // ── generate ──────────────────────────────────────────────────────
    (0, vitest_1.describe)('generate', () => {
        (0, vitest_1.it)('generates CLAUDE.md file', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('claude');
            (0, vitest_1.expect)(files[0].fileName).toBe('CLAUDE.md');
            (0, vitest_1.expect)(files[0].content).toContain('test-project');
            (0, vitest_1.expect)(files[0].content).toContain('TypeScript');
            (0, vitest_1.expect)(files[0].tokens).toBeGreaterThan(0);
            (0, vitest_1.expect)(files[0].overwrites).toBe(false);
        });
        (0, vitest_1.it)('generates .cursorrules file', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['cursor'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('cursor');
            (0, vitest_1.expect)(files[0].fileName).toBe('.cursorrules');
            (0, vitest_1.expect)(files[0].content).toContain('TypeScript');
        });
        (0, vitest_1.it)('generates AGENTS.md file', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['agents'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('agents');
            (0, vitest_1.expect)(files[0].fileName).toBe('AGENTS.md');
        });
        (0, vitest_1.it)('generates copilot-instructions.md in .github/', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['copilot'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('copilot');
            (0, vitest_1.expect)(files[0].fileName).toBe('copilot-instructions.md');
            (0, vitest_1.expect)(files[0].path).toContain('.github');
        });
        (0, vitest_1.it)('generates GEMINI.md file', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['gemini'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('gemini');
            (0, vitest_1.expect)(files[0].fileName).toBe('GEMINI.md');
        });
        (0, vitest_1.it)('generates .windsurfrules file', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['windsurf'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('windsurf');
            (0, vitest_1.expect)(files[0].fileName).toBe('.windsurfrules');
        });
        (0, vitest_1.it)('generates .clinerules file', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['cline'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('cline');
            (0, vitest_1.expect)(files[0].fileName).toBe('.clinerules');
        });
        (0, vitest_1.it)('generates .mcp.json file', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['mcp'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files).toHaveLength(1);
            (0, vitest_1.expect)(files[0].format).toBe('mcp');
            (0, vitest_1.expect)(files[0].fileName).toBe('.mcp.json');
            (0, vitest_1.expect)(files[0].content).toContain('mcpServers');
        });
        (0, vitest_1.it)('generates multiple formats', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude', 'cursor', 'agents'], { projectPath: tmpDir });
            (0, vitest_1.expect)(files).toHaveLength(3);
            (0, vitest_1.expect)(files.map((f) => f.format)).toEqual([
                'claude',
                'cursor',
                'agents',
            ]);
        });
        (0, vitest_1.it)('detects overwrites', async () => {
            fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files[0].overwrites).toBe(true);
        });
        (0, vitest_1.it)('ensures trailing newline', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files[0].content.endsWith('\n')).toBe(true);
        });
        (0, vitest_1.it)('uses custom templates', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
                templates: {
                    claude: '# Custom {{project.name}} template',
                },
            });
            (0, vitest_1.expect)(files[0].content).toContain('# Custom test-project template');
        });
        (0, vitest_1.it)('content includes conventions', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            const content = files[0].content;
            (0, vitest_1.expect)(content).toContain('camelCase');
            (0, vitest_1.expect)(content).toContain('PascalCase');
            (0, vitest_1.expect)(content).toContain('Vitest');
            (0, vitest_1.expect)(content).toContain('npm test');
            (0, vitest_1.expect)(content).toContain('Prefer const over let');
            (0, vitest_1.expect)(content).toContain('.env');
            (0, vitest_1.expect)(content).toContain('Never commit secrets');
        });
        (0, vitest_1.it)('content reflects framework', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files[0].content).toContain('React');
        });
        (0, vitest_1.it)('handles no framework gracefully', async () => {
            const answers = makeAnswers({
                project: {
                    name: 'bare',
                    description: 'Bare',
                    language: 'Go',
                    framework: null,
                    additionalTools: [],
                },
            });
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(files[0].content).toContain('Go project');
        });
    });
    // ── writeFiles ────────────────────────────────────────────────────
    (0, vitest_1.describe)('writeFiles', () => {
        (0, vitest_1.it)('writes files to disk', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude', 'cursor'], {
                projectPath: tmpDir,
            });
            const result = (0, generator_1.writeFiles)(files);
            (0, vitest_1.expect)(result.written).toHaveLength(2);
            (0, vitest_1.expect)(result.skipped).toHaveLength(0);
            const claudePath = path.join(tmpDir, 'CLAUDE.md');
            (0, vitest_1.expect)(fs.existsSync(claudePath)).toBe(true);
            (0, vitest_1.expect)(fs.readFileSync(claudePath, 'utf-8')).toBe(files[0].content);
        });
        (0, vitest_1.it)('skips existing files by default', async () => {
            fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            const result = (0, generator_1.writeFiles)(files);
            (0, vitest_1.expect)(result.written).toHaveLength(0);
            (0, vitest_1.expect)(result.skipped).toHaveLength(1);
            (0, vitest_1.expect)(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).toBe('existing');
        });
        (0, vitest_1.it)('overwrites with force option', async () => {
            fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            const result = (0, generator_1.writeFiles)(files, { force: true });
            (0, vitest_1.expect)(result.written).toHaveLength(1);
            (0, vitest_1.expect)(result.skipped).toHaveLength(0);
            (0, vitest_1.expect)(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).not.toBe('existing');
        });
        (0, vitest_1.it)('creates subdirectories for copilot format', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['copilot'], {
                projectPath: tmpDir,
            });
            (0, generator_1.writeFiles)(files);
            const copilotPath = path.join(tmpDir, '.github', 'copilot-instructions.md');
            (0, vitest_1.expect)(fs.existsSync(copilotPath)).toBe(true);
        });
        (0, vitest_1.it)('dry run does not write files', async () => {
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            const result = (0, generator_1.writeFiles)(files, { dryRun: true });
            (0, vitest_1.expect)(result.written).toHaveLength(1);
            (0, vitest_1.expect)(result.skipped).toHaveLength(0);
            (0, vitest_1.expect)(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(false);
        });
        (0, vitest_1.it)('dry run reports skipped files', async () => {
            fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            const result = (0, generator_1.writeFiles)(files, { dryRun: true });
            (0, vitest_1.expect)(result.written).toHaveLength(0);
            (0, vitest_1.expect)(result.skipped).toHaveLength(1);
        });
        (0, vitest_1.it)('dry run with force reports all as written', async () => {
            fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), 'existing');
            const answers = makeAnswers();
            const files = await (0, generator_1.generate)(answers, ['claude'], {
                projectPath: tmpDir,
            });
            const result = (0, generator_1.writeFiles)(files, { dryRun: true, force: true });
            (0, vitest_1.expect)(result.written).toHaveLength(1);
            (0, vitest_1.expect)(result.skipped).toHaveLength(0);
            // File should NOT have been modified
            (0, vitest_1.expect)(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).toBe('existing');
        });
    });
});
//# sourceMappingURL=generator.test.js.map
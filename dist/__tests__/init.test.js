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
const init_1 = require("../init");
const detect_1 = require("../detect");
function createTmpDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-env-init-init-'));
}
function cleanTmpDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
}
function writeJson(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
function writeFile(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}
(0, vitest_1.describe)('init', () => {
    let tmpDir;
    (0, vitest_1.beforeEach)(() => {
        tmpDir = createTmpDir();
    });
    (0, vitest_1.afterEach)(() => {
        cleanTmpDir(tmpDir);
    });
    // ── buildDefaultAnswers ───────────────────────────────────────────
    (0, vitest_1.describe)('buildDefaultAnswers', () => {
        (0, vitest_1.it)('builds defaults from detected TypeScript project', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'my-ts-project',
                description: 'A TypeScript project',
                devDependencies: { vitest: '^1.0.0' },
            });
            writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
            fs.mkdirSync(path.join(tmpDir, '.github'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            const answers = (0, init_1.buildDefaultAnswers)(info);
            (0, vitest_1.expect)(answers.project.name).toBe('my-ts-project');
            (0, vitest_1.expect)(answers.project.description).toBe('A TypeScript project');
            (0, vitest_1.expect)(answers.project.language).toBe('TypeScript');
            (0, vitest_1.expect)(answers.conventions.namingConvention).toBe('camelCase');
            (0, vitest_1.expect)(answers.conventions.componentNaming).toBe('PascalCase');
            (0, vitest_1.expect)(answers.testing.framework).toBe('Vitest');
            (0, vitest_1.expect)(answers.testing.command).toBe('npm test');
            (0, vitest_1.expect)(answers.team.reviewProcess).toBe('pull-requests');
        });
        (0, vitest_1.it)('builds defaults for Python project', async () => {
            writeFile(path.join(tmpDir, 'pyproject.toml'), '[project]\nname = "my-py"\ndependencies = ["django"]');
            writeFile(path.join(tmpDir, 'conftest.py'), '');
            const info = await (0, detect_1.detect)(tmpDir);
            const answers = (0, init_1.buildDefaultAnswers)(info);
            (0, vitest_1.expect)(answers.project.language).toBe('Python');
            (0, vitest_1.expect)(answers.conventions.namingConvention).toBe('snake_case');
            (0, vitest_1.expect)(answers.testing.framework).toBe('pytest');
            (0, vitest_1.expect)(answers.testing.command).toBe('pytest');
        });
        (0, vitest_1.it)('builds defaults for Go project', async () => {
            writeFile(path.join(tmpDir, 'go.mod'), 'module example.com/test');
            const info = await (0, detect_1.detect)(tmpDir);
            const answers = (0, init_1.buildDefaultAnswers)(info);
            (0, vitest_1.expect)(answers.project.language).toBe('Go');
            (0, vitest_1.expect)(answers.conventions.namingConvention).toBe('camelCase');
        });
        (0, vitest_1.it)('builds defaults for Rust project', async () => {
            writeFile(path.join(tmpDir, 'Cargo.toml'), '[package]\nname = "my-crate"');
            const info = await (0, detect_1.detect)(tmpDir);
            const answers = (0, init_1.buildDefaultAnswers)(info);
            (0, vitest_1.expect)(answers.project.language).toBe('Rust');
            (0, vitest_1.expect)(answers.conventions.namingConvention).toBe('snake_case');
        });
        (0, vitest_1.it)('builds defaults for Ruby project', async () => {
            writeFile(path.join(tmpDir, 'Gemfile'), "gem 'rails'");
            const info = await (0, detect_1.detect)(tmpDir);
            const answers = (0, init_1.buildDefaultAnswers)(info);
            (0, vitest_1.expect)(answers.project.language).toBe('Ruby');
            (0, vitest_1.expect)(answers.conventions.namingConvention).toBe('snake_case');
        });
        (0, vitest_1.it)('uses sensible defaults for empty project', async () => {
            const info = await (0, detect_1.detect)(tmpDir);
            const answers = (0, init_1.buildDefaultAnswers)(info);
            (0, vitest_1.expect)(answers.project.name).toBe('my-project');
            (0, vitest_1.expect)(answers.project.language).toBe('TypeScript');
            (0, vitest_1.expect)(answers.conventions.namingConvention).toBe('camelCase');
            (0, vitest_1.expect)(answers.testing.framework).toBeNull();
            (0, vitest_1.expect)(answers.team.reviewProcess).toBe('no-formal');
        });
        (0, vitest_1.it)('includes default safety settings', async () => {
            const info = await (0, detect_1.detect)(tmpDir);
            const answers = (0, init_1.buildDefaultAnswers)(info);
            (0, vitest_1.expect)(answers.safety.protectedPaths).toContain('.env');
            (0, vitest_1.expect)(answers.safety.securityConstraints).toContain('Never commit secrets');
        });
        (0, vitest_1.it)('includes default formats without mcp', () => {
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).not.toContain('mcp');
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).toContain('claude');
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).toContain('cursor');
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).toContain('agents');
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).toContain('copilot');
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).toContain('gemini');
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).toContain('windsurf');
            (0, vitest_1.expect)(init_1.DEFAULT_FORMATS).toContain('cline');
        });
    });
    // ── init ──────────────────────────────────────────────────────────
    (0, vitest_1.describe)('init function', () => {
        (0, vitest_1.it)('detects, generates, and writes files', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'init-test',
                description: 'Test the init flow',
                devDependencies: { vitest: '^1.0.0', eslint: '^8.0.0' },
            });
            writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
            fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
            const result = await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['claude', 'cursor'],
            });
            (0, vitest_1.expect)(result.detection.language.value).toBe('TypeScript');
            (0, vitest_1.expect)(result.answers.project.name).toBe('init-test');
            (0, vitest_1.expect)(result.files).toHaveLength(2);
            (0, vitest_1.expect)(result.written).toHaveLength(2);
            (0, vitest_1.expect)(result.skipped).toHaveLength(0);
            // Files were written to disk
            (0, vitest_1.expect)(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(true);
            (0, vitest_1.expect)(fs.existsSync(path.join(tmpDir, '.cursorrules'))).toBe(true);
            // Content is correct
            const claude = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
            (0, vitest_1.expect)(claude).toContain('init-test');
            (0, vitest_1.expect)(claude).toContain('TypeScript');
        });
        (0, vitest_1.it)('generates all default formats', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'full-test',
            });
            const result = await (0, init_1.init)({
                projectPath: tmpDir,
            });
            (0, vitest_1.expect)(result.files.length).toBe(init_1.DEFAULT_FORMATS.length);
            (0, vitest_1.expect)(result.written.length).toBe(init_1.DEFAULT_FORMATS.length);
        });
        (0, vitest_1.it)('merges user-provided answers', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'merge-test',
            });
            const result = await (0, init_1.init)({
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
            (0, vitest_1.expect)(result.answers.project.name).toBe('custom-name');
            (0, vitest_1.expect)(result.answers.project.language).toBe('Python');
            (0, vitest_1.expect)(result.answers.conventions.namingConvention).toBe('snake_case');
            const claude = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
            (0, vitest_1.expect)(claude).toContain('custom-name');
            (0, vitest_1.expect)(claude).toContain('Django');
        });
        (0, vitest_1.it)('skips existing files without force', async () => {
            writeFile(path.join(tmpDir, 'CLAUDE.md'), 'Existing content');
            writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
            const result = await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['claude', 'cursor'],
            });
            (0, vitest_1.expect)(result.skipped).toHaveLength(1);
            (0, vitest_1.expect)(result.written).toHaveLength(1);
            (0, vitest_1.expect)(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).toBe('Existing content');
        });
        (0, vitest_1.it)('overwrites with force option', async () => {
            writeFile(path.join(tmpDir, 'CLAUDE.md'), 'Existing content');
            writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
            const result = await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['claude'],
                force: true,
            });
            (0, vitest_1.expect)(result.written).toHaveLength(1);
            (0, vitest_1.expect)(result.skipped).toHaveLength(0);
            (0, vitest_1.expect)(fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')).not.toBe('Existing content');
        });
        (0, vitest_1.it)('dry run does not create files', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'dry-test' });
            const result = await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['claude', 'cursor'],
                dryRun: true,
            });
            (0, vitest_1.expect)(result.files).toHaveLength(2);
            (0, vitest_1.expect)(result.written).toHaveLength(2);
            (0, vitest_1.expect)(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(false);
            (0, vitest_1.expect)(fs.existsSync(path.join(tmpDir, '.cursorrules'))).toBe(false);
        });
        (0, vitest_1.it)('uses custom templates', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'custom-tmpl' });
            await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['claude'],
                templates: {
                    claude: '# CUSTOM: {{project.name}}',
                },
            });
            const claude = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
            (0, vitest_1.expect)(claude).toContain('# CUSTOM: custom-tmpl');
        });
        (0, vitest_1.it)('creates .github/ dir for copilot format', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'copilot-test' });
            await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['copilot'],
            });
            (0, vitest_1.expect)(fs.existsSync(path.join(tmpDir, '.github', 'copilot-instructions.md'))).toBe(true);
        });
        (0, vitest_1.it)('generates MCP config when explicitly requested', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'mcp-test' });
            const result = await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['mcp'],
            });
            (0, vitest_1.expect)(result.files).toHaveLength(1);
            (0, vitest_1.expect)(result.files[0].format).toBe('mcp');
            const content = fs.readFileSync(path.join(tmpDir, '.mcp.json'), 'utf-8');
            (0, vitest_1.expect)(content).toContain('mcpServers');
        });
        (0, vitest_1.it)('returns detection results', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'detect-result',
                devDependencies: { vitest: '^1.0.0' },
            });
            writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
            const result = await (0, init_1.init)({
                projectPath: tmpDir,
                formats: ['claude'],
            });
            (0, vitest_1.expect)(result.detection.language.value).toBe('TypeScript');
            (0, vitest_1.expect)(result.detection.testFrameworks[0].value).toBe('Vitest');
            (0, vitest_1.expect)(result.detection.name).toBe('detect-result');
        });
    });
});
//# sourceMappingURL=init.test.js.map
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
exports.detect = detect;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch {
        return false;
    }
}
function dirExists(dirPath) {
    try {
        return fs.statSync(dirPath).isDirectory();
    }
    catch {
        return false;
    }
}
function readFileSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    }
    catch {
        return null;
    }
}
function readJsonSafe(filePath) {
    const content = readFileSafe(filePath);
    if (!content)
        return null;
    try {
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
function detected(value, confidence, source) {
    return { value, confidence, source };
}
// ── Language Detection ──────────────────────────────────────────────
function detectLanguages(dir) {
    const langs = [];
    const pkgPath = path.join(dir, 'package.json');
    const pkg = readJsonSafe(pkgPath);
    if (fileExists(path.join(dir, 'tsconfig.json'))) {
        langs.push(detected('TypeScript', 'high', 'tsconfig.json'));
    }
    else if (pkg) {
        const devDeps = (pkg.devDependencies ?? {});
        const deps = (pkg.dependencies ?? {});
        if (devDeps.typescript || deps.typescript) {
            langs.push(detected('TypeScript', 'high', 'package.json'));
        }
        else {
            langs.push(detected('JavaScript', 'high', 'package.json'));
        }
    }
    if (fileExists(path.join(dir, 'Cargo.toml'))) {
        langs.push(detected('Rust', 'high', 'Cargo.toml'));
    }
    if (fileExists(path.join(dir, 'go.mod'))) {
        langs.push(detected('Go', 'high', 'go.mod'));
    }
    if (fileExists(path.join(dir, 'pyproject.toml')) ||
        fileExists(path.join(dir, 'setup.py')) ||
        fileExists(path.join(dir, 'requirements.txt'))) {
        const source = fileExists(path.join(dir, 'pyproject.toml'))
            ? 'pyproject.toml'
            : fileExists(path.join(dir, 'setup.py'))
                ? 'setup.py'
                : 'requirements.txt';
        langs.push(detected('Python', 'high', source));
    }
    if (fileExists(path.join(dir, 'Gemfile'))) {
        langs.push(detected('Ruby', 'high', 'Gemfile'));
    }
    if (fileExists(path.join(dir, 'pom.xml')) ||
        fileExists(path.join(dir, 'build.gradle')) ||
        fileExists(path.join(dir, 'build.gradle.kts'))) {
        const source = fileExists(path.join(dir, 'pom.xml'))
            ? 'pom.xml'
            : fileExists(path.join(dir, 'build.gradle'))
                ? 'build.gradle'
                : 'build.gradle.kts';
        langs.push(detected('Java', 'high', source));
    }
    if (fileExists(path.join(dir, 'Package.swift'))) {
        langs.push(detected('Swift', 'high', 'Package.swift'));
    }
    if (fileExists(path.join(dir, 'composer.json'))) {
        langs.push(detected('PHP', 'high', 'composer.json'));
    }
    return langs;
}
const NODE_FRAMEWORK_MAP = [
    { pattern: 'next', framework: 'Next.js' },
    { pattern: '@angular/core', framework: 'Angular' },
    { pattern: 'vue', framework: 'Vue.js' },
    { pattern: 'svelte', framework: 'Svelte' },
    { pattern: '@sveltejs/kit', framework: 'SvelteKit' },
    { pattern: 'nuxt', framework: 'Nuxt' },
    { pattern: '@remix-run/react', framework: 'Remix' },
    { pattern: 'remix', framework: 'Remix' },
    { pattern: 'gatsby', framework: 'Gatsby' },
    { pattern: 'astro', framework: 'Astro' },
    { pattern: '@nestjs/core', framework: 'NestJS' },
    { pattern: 'express', framework: 'Express.js' },
    { pattern: 'fastify', framework: 'Fastify' },
    { pattern: 'koa', framework: 'Koa' },
    { pattern: 'hono', framework: 'Hono' },
    { pattern: 'electron', framework: 'Electron' },
    { pattern: 'react', framework: 'React' },
];
function detectFrameworks(dir) {
    const frameworks = [];
    const pkgPath = path.join(dir, 'package.json');
    const pkg = readJsonSafe(pkgPath);
    if (pkg) {
        const deps = {
            ...(pkg.dependencies ?? {}),
            ...(pkg.devDependencies ?? {}),
        };
        const found = new Set();
        for (const { pattern, framework } of NODE_FRAMEWORK_MAP) {
            if (deps[pattern] && !found.has(framework)) {
                found.add(framework);
                frameworks.push(detected(framework, 'high', 'package.json'));
            }
        }
    }
    // Python frameworks
    const pyproject = readFileSafe(path.join(dir, 'pyproject.toml'));
    const requirements = readFileSafe(path.join(dir, 'requirements.txt'));
    const pyContent = (pyproject ?? '') + '\n' + (requirements ?? '');
    const pyFrameworks = [
        ['django', 'Django'],
        ['flask', 'Flask'],
        ['fastapi', 'FastAPI'],
        ['starlette', 'Starlette'],
    ];
    for (const [dep, name] of pyFrameworks) {
        if (new RegExp(`\\b${dep}\\b`, 'i').test(pyContent)) {
            frameworks.push(detected(name, 'high', pyproject ? 'pyproject.toml' : 'requirements.txt'));
        }
    }
    // Ruby frameworks
    const gemfile = readFileSafe(path.join(dir, 'Gemfile'));
    if (gemfile) {
        if (/\brails\b/i.test(gemfile)) {
            frameworks.push(detected('Ruby on Rails', 'high', 'Gemfile'));
        }
        if (/\bsinatra\b/i.test(gemfile)) {
            frameworks.push(detected('Sinatra', 'high', 'Gemfile'));
        }
    }
    // Go frameworks
    const gomod = readFileSafe(path.join(dir, 'go.mod'));
    if (gomod) {
        const goFrameworks = [
            ['github.com/gin-gonic/gin', 'Gin'],
            ['github.com/gofiber/fiber', 'Fiber'],
            ['github.com/labstack/echo', 'Echo'],
        ];
        for (const [dep, name] of goFrameworks) {
            if (gomod.includes(dep)) {
                frameworks.push(detected(name, 'high', 'go.mod'));
            }
        }
    }
    // Rust frameworks
    const cargoToml = readFileSafe(path.join(dir, 'Cargo.toml'));
    if (cargoToml) {
        const rustFrameworks = [
            ['actix-web', 'Actix Web'],
            ['axum', 'Axum'],
            ['rocket', 'Rocket'],
            ['tauri', 'Tauri'],
        ];
        for (const [dep, name] of rustFrameworks) {
            if (cargoToml.includes(dep)) {
                frameworks.push(detected(name, 'high', 'Cargo.toml'));
            }
        }
    }
    return frameworks;
}
// ── Test Framework Detection ────────────────────────────────────────
function detectTestFrameworks(dir) {
    const frameworks = [];
    const pkgPath = path.join(dir, 'package.json');
    const pkg = readJsonSafe(pkgPath);
    if (pkg) {
        const devDeps = (pkg.devDependencies ?? {});
        const deps = (pkg.dependencies ?? {});
        const allDeps = { ...deps, ...devDeps };
        if (allDeps.vitest || fileExists(path.join(dir, 'vitest.config.ts')) || fileExists(path.join(dir, 'vitest.config.js'))) {
            frameworks.push(detected('Vitest', 'high', allDeps.vitest ? 'package.json' : 'vitest.config.ts'));
        }
        if (allDeps.jest || fileExists(path.join(dir, 'jest.config.js')) || fileExists(path.join(dir, 'jest.config.ts'))) {
            frameworks.push(detected('Jest', 'high', allDeps.jest ? 'package.json' : 'jest.config.js'));
        }
        if (allDeps.mocha || fileExists(path.join(dir, '.mocharc.yml'))) {
            frameworks.push(detected('Mocha', 'high', allDeps.mocha ? 'package.json' : '.mocharc.yml'));
        }
        if (allDeps['@playwright/test']) {
            frameworks.push(detected('Playwright', 'high', 'package.json'));
        }
        if (allDeps.cypress || fileExists(path.join(dir, 'cypress.config.ts')) || fileExists(path.join(dir, 'cypress.config.js'))) {
            frameworks.push(detected('Cypress', 'high', allDeps.cypress ? 'package.json' : 'cypress.config.ts'));
        }
        if (allDeps.ava) {
            frameworks.push(detected('AVA', 'high', 'package.json'));
        }
        if (allDeps.tap) {
            frameworks.push(detected('tap', 'high', 'package.json'));
        }
    }
    // Python
    if (fileExists(path.join(dir, 'conftest.py')) ||
        readFileSafe(path.join(dir, 'pyproject.toml'))?.includes('pytest') ||
        readFileSafe(path.join(dir, 'requirements.txt'))?.includes('pytest')) {
        frameworks.push(detected('pytest', 'high', fileExists(path.join(dir, 'conftest.py'))
            ? 'conftest.py'
            : 'pyproject.toml'));
    }
    // Go
    if (fileExists(path.join(dir, 'go.mod')) && dirExists(path.join(dir, 'tests'))) {
        frameworks.push(detected('go test', 'high', 'go.mod'));
    }
    return frameworks;
}
// ── Build Tool Detection ────────────────────────────────────────────
function detectBuildTools(dir) {
    const tools = [];
    const pkg = readJsonSafe(path.join(dir, 'package.json'));
    if (fileExists(path.join(dir, 'vite.config.ts')) ||
        fileExists(path.join(dir, 'vite.config.js'))) {
        tools.push(detected('Vite', 'high', 'vite.config.ts'));
    }
    if (fileExists(path.join(dir, 'webpack.config.js')) ||
        fileExists(path.join(dir, 'webpack.config.ts'))) {
        tools.push(detected('webpack', 'high', 'webpack.config.js'));
    }
    if (fileExists(path.join(dir, 'rollup.config.js'))) {
        tools.push(detected('Rollup', 'high', 'rollup.config.js'));
    }
    if (fileExists(path.join(dir, 'turbo.json'))) {
        tools.push(detected('Turborepo', 'high', 'turbo.json'));
    }
    if (fileExists(path.join(dir, 'next.config.js')) ||
        fileExists(path.join(dir, 'next.config.ts')) ||
        fileExists(path.join(dir, 'next.config.mjs'))) {
        tools.push(detected('Next.js', 'high', 'next.config.js'));
    }
    if (fileExists(path.join(dir, 'Makefile'))) {
        tools.push(detected('Make', 'medium', 'Makefile'));
    }
    if (fileExists(path.join(dir, 'Dockerfile'))) {
        tools.push(detected('Docker', 'medium', 'Dockerfile'));
    }
    // tsc detection
    if (pkg) {
        const scripts = (pkg.scripts ?? {});
        const buildScript = scripts.build ?? '';
        if (buildScript.includes('tsc')) {
            tools.push(detected('tsc', 'high', 'package.json scripts.build'));
        }
        if (buildScript.includes('esbuild') || Object.values(scripts).some((s) => s.includes('esbuild'))) {
            tools.push(detected('esbuild', 'medium', 'package.json'));
        }
    }
    return tools;
}
// ── Linter Detection ────────────────────────────────────────────────
function detectLinters(dir) {
    const tools = [];
    const pkg = readJsonSafe(path.join(dir, 'package.json'));
    const devDeps = pkg
        ? { ...(pkg.devDependencies ?? {}), ...(pkg.dependencies ?? {}) }
        : {};
    if (devDeps.eslint ||
        fileExists(path.join(dir, '.eslintrc.js')) ||
        fileExists(path.join(dir, '.eslintrc.json')) ||
        fileExists(path.join(dir, '.eslintrc.yml')) ||
        fileExists(path.join(dir, 'eslint.config.js')) ||
        fileExists(path.join(dir, 'eslint.config.mjs'))) {
        tools.push(detected('ESLint', 'high', devDeps.eslint ? 'package.json' : 'eslint config'));
    }
    if (devDeps.prettier ||
        fileExists(path.join(dir, '.prettierrc')) ||
        fileExists(path.join(dir, '.prettierrc.js')) ||
        fileExists(path.join(dir, '.prettierrc.json'))) {
        tools.push(detected('Prettier', 'high', devDeps.prettier ? 'package.json' : '.prettierrc'));
    }
    if (devDeps['@biomejs/biome'] || fileExists(path.join(dir, 'biome.json'))) {
        tools.push(detected('Biome', 'high', devDeps['@biomejs/biome'] ? 'package.json' : 'biome.json'));
    }
    if (fileExists(path.join(dir, '.editorconfig'))) {
        tools.push(detected('EditorConfig', 'high', '.editorconfig'));
    }
    if (fileExists(path.join(dir, 'dprint.json'))) {
        tools.push(detected('dprint', 'high', 'dprint.json'));
    }
    if (fileExists(path.join(dir, '.rubocop.yml'))) {
        tools.push(detected('RuboCop', 'high', '.rubocop.yml'));
    }
    if (fileExists(path.join(dir, '.golangci.yml')) || fileExists(path.join(dir, '.golangci.yaml'))) {
        tools.push(detected('golangci-lint', 'high', '.golangci.yml'));
    }
    // Ruff in pyproject.toml
    const pyproject = readFileSafe(path.join(dir, 'pyproject.toml'));
    if (pyproject && pyproject.includes('ruff')) {
        tools.push(detected('Ruff', 'high', 'pyproject.toml'));
    }
    return tools;
}
// ── Package Manager Detection ───────────────────────────────────────
function detectPackageManager(dir) {
    if (fileExists(path.join(dir, 'pnpm-lock.yaml'))) {
        return detected('pnpm', 'high', 'pnpm-lock.yaml');
    }
    if (fileExists(path.join(dir, 'yarn.lock'))) {
        return detected('Yarn', 'high', 'yarn.lock');
    }
    if (fileExists(path.join(dir, 'bun.lockb')) || fileExists(path.join(dir, 'bun.lock'))) {
        return detected('Bun', 'high', 'bun.lockb');
    }
    if (fileExists(path.join(dir, 'package-lock.json'))) {
        return detected('npm', 'high', 'package-lock.json');
    }
    if (fileExists(path.join(dir, 'package.json'))) {
        return detected('npm', 'low', 'package.json');
    }
    return null;
}
// ── Module System Detection ─────────────────────────────────────────
function detectModuleSystem(dir) {
    const pkg = readJsonSafe(path.join(dir, 'package.json'));
    if (pkg) {
        if (pkg.type === 'module') {
            return detected('ESM', 'high', 'package.json type field');
        }
        if (pkg.type === 'commonjs') {
            return detected('CommonJS', 'high', 'package.json type field');
        }
    }
    const tsconfig = readJsonSafe(path.join(dir, 'tsconfig.json'));
    if (tsconfig) {
        const compilerOptions = (tsconfig.compilerOptions ?? {});
        const mod = compilerOptions.module?.toLowerCase();
        if (mod === 'esnext' || mod === 'nodenext' || mod === 'es2020' || mod === 'es2022') {
            return detected('ESM', 'high', 'tsconfig.json module');
        }
        if (mod === 'commonjs') {
            return detected('CommonJS', 'high', 'tsconfig.json module');
        }
    }
    if (fileExists(path.join(dir, 'package.json'))) {
        return detected('CommonJS', 'low', 'Node.js default');
    }
    return null;
}
// ── Monorepo Detection ──────────────────────────────────────────────
function detectMonorepo(dir) {
    const pkg = readJsonSafe(path.join(dir, 'package.json'));
    if (pkg && pkg.workspaces) {
        const workspaceGlobs = Array.isArray(pkg.workspaces)
            ? pkg.workspaces
            : (pkg.workspaces.packages ?? []);
        const packages = resolveWorkspaceGlobs(dir, workspaceGlobs);
        return {
            tool: detected('npm/Yarn workspaces', 'high', 'package.json workspaces'),
            packages,
        };
    }
    if (fileExists(path.join(dir, 'pnpm-workspace.yaml'))) {
        return {
            tool: detected('pnpm workspaces', 'high', 'pnpm-workspace.yaml'),
            packages: [],
        };
    }
    if (fileExists(path.join(dir, 'turbo.json'))) {
        return {
            tool: detected('Turborepo', 'high', 'turbo.json'),
            packages: [],
        };
    }
    if (fileExists(path.join(dir, 'nx.json'))) {
        return {
            tool: detected('Nx', 'high', 'nx.json'),
            packages: [],
        };
    }
    if (fileExists(path.join(dir, 'lerna.json'))) {
        return {
            tool: detected('Lerna', 'high', 'lerna.json'),
            packages: [],
        };
    }
    return null;
}
function resolveWorkspaceGlobs(dir, globs) {
    const packages = [];
    for (const glob of globs) {
        // Simple glob resolution: only handle "dir/*" pattern
        const baseDir = glob.replace(/\/\*$/, '');
        const fullPath = path.join(dir, baseDir);
        if (dirExists(fullPath)) {
            try {
                const entries = fs.readdirSync(fullPath, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        packages.push(`${baseDir}/${entry.name}`);
                    }
                }
            }
            catch {
                // Ignore errors
            }
        }
    }
    return packages;
}
// ── Git Detection ───────────────────────────────────────────────────
function detectGit(dir) {
    const gitDir = path.join(dir, '.git');
    const initialized = dirExists(gitDir);
    let remoteUrl = null;
    let host = null;
    if (initialized) {
        const gitConfig = readFileSafe(path.join(gitDir, 'config'));
        if (gitConfig) {
            const urlMatch = gitConfig.match(/url\s*=\s*(.+)/);
            if (urlMatch) {
                remoteUrl = urlMatch[1].replace(/#.*$/, '').trim();
                if (remoteUrl.includes('github.com'))
                    host = 'github';
                else if (remoteUrl.includes('gitlab.com'))
                    host = 'gitlab';
                else if (remoteUrl.includes('bitbucket.org'))
                    host = 'bitbucket';
                else
                    host = 'other';
            }
        }
    }
    // GitHub detection from .github/ directory
    if (!host && dirExists(path.join(dir, '.github'))) {
        host = 'github';
    }
    if (!host && fileExists(path.join(dir, '.gitlab-ci.yml'))) {
        host = 'gitlab';
    }
    const hasHusky = dirExists(path.join(dir, '.husky'));
    const pkg = readJsonSafe(path.join(dir, 'package.json'));
    const hasLintStaged = !!(pkg &&
        (pkg['lint-staged'] ||
            (pkg.devDependencies ?? {})['lint-staged']));
    let commitConvention = null;
    // Simple heuristic: check if conventional commits via commitlint or config
    if (fileExists(path.join(dir, '.commitlintrc.js')) ||
        fileExists(path.join(dir, '.commitlintrc.json')) ||
        fileExists(path.join(dir, 'commitlint.config.js'))) {
        commitConvention = detected('conventional', 'high', 'commitlint config');
    }
    return {
        initialized,
        remoteUrl,
        host,
        commitConvention,
        hasHusky,
        hasLintStaged,
    };
}
// ── Directory Structure Detection ───────────────────────────────────
function detectDirectories(dir) {
    return {
        source: dirExists(path.join(dir, 'src'))
            ? 'src/'
            : dirExists(path.join(dir, 'lib'))
                ? 'lib/'
                : dirExists(path.join(dir, 'app'))
                    ? 'app/'
                    : null,
        tests: dirExists(path.join(dir, 'tests'))
            ? 'tests/'
            : dirExists(path.join(dir, 'test'))
                ? 'test/'
                : dirExists(path.join(dir, '__tests__'))
                    ? '__tests__/'
                    : dirExists(path.join(dir, 'src', '__tests__'))
                        ? 'src/__tests__/'
                        : null,
        docs: dirExists(path.join(dir, 'docs')) ? 'docs/' : null,
        scripts: dirExists(path.join(dir, 'scripts')) ? 'scripts/' : null,
        config: dirExists(path.join(dir, 'config'))
            ? 'config/'
            : dirExists(path.join(dir, '.config'))
                ? '.config/'
                : null,
        staticAssets: dirExists(path.join(dir, 'public'))
            ? 'public/'
            : dirExists(path.join(dir, 'static'))
                ? 'static/'
                : null,
    };
}
// ── Existing AI File Detection ──────────────────────────────────────
function detectExistingAIFiles(dir) {
    const files = [];
    const checks = [
        ['claude', path.join(dir, 'CLAUDE.md')],
        ['cursor', path.join(dir, '.cursorrules')],
        ['agents', path.join(dir, 'AGENTS.md')],
        ['copilot', path.join(dir, '.github', 'copilot-instructions.md')],
        ['gemini', path.join(dir, 'GEMINI.md')],
        ['windsurf', path.join(dir, '.windsurfrules')],
        ['cline', path.join(dir, '.clinerules')],
        ['mcp', path.join(dir, '.mcp.json')],
    ];
    for (const [format, filePath] of checks) {
        try {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                files.push({ format, path: filePath, size: stat.size });
            }
        }
        catch {
            // File does not exist
        }
    }
    return files;
}
// ── Main Detect Function ────────────────────────────────────────────
async function detect(dir) {
    const absDir = path.resolve(dir);
    const languages = detectLanguages(absDir);
    const language = languages.length > 0 ? languages[0] : null;
    const pkg = readJsonSafe(path.join(absDir, 'package.json'));
    const name = pkg ? (pkg.name ?? null) : null;
    const description = pkg ? (pkg.description ?? null) : null;
    const engines = pkg ? (pkg.engines ?? {}) : {};
    const nodeVersion = engines.node ?? null;
    return {
        name,
        description,
        language,
        languages,
        frameworks: detectFrameworks(absDir),
        testFrameworks: detectTestFrameworks(absDir),
        buildTools: detectBuildTools(absDir),
        linters: detectLinters(absDir),
        packageManager: detectPackageManager(absDir),
        moduleSystem: detectModuleSystem(absDir),
        monorepo: detectMonorepo(absDir),
        git: detectGit(absDir),
        directories: detectDirectories(absDir),
        existingFiles: detectExistingAIFiles(absDir),
        nodeVersion,
    };
}
//# sourceMappingURL=detect.js.map
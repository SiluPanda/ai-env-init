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
const detect_1 = require("../detect");
function createTmpDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-env-init-test-'));
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
(0, vitest_1.describe)('detect', () => {
    let tmpDir;
    (0, vitest_1.beforeEach)(() => {
        tmpDir = createTmpDir();
    });
    (0, vitest_1.afterEach)(() => {
        cleanTmpDir(tmpDir);
    });
    // ── Language Detection ────────────────────────────────────────────
    (0, vitest_1.describe)('language detection', () => {
        (0, vitest_1.it)('detects TypeScript from tsconfig.json', async () => {
            writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.language).not.toBeNull();
            (0, vitest_1.expect)(info.language.value).toBe('TypeScript');
            (0, vitest_1.expect)(info.language.confidence).toBe('high');
        });
        (0, vitest_1.it)('detects TypeScript from package.json devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'test',
                devDependencies: { typescript: '^5.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.language.value).toBe('TypeScript');
        });
        (0, vitest_1.it)('detects JavaScript from package.json without typescript', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'test',
                dependencies: { express: '^4.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.language.value).toBe('JavaScript');
        });
        (0, vitest_1.it)('detects Rust from Cargo.toml', async () => {
            writeFile(path.join(tmpDir, 'Cargo.toml'), '[package]\nname = "test"');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Rust')).toBe(true);
        });
        (0, vitest_1.it)('detects Go from go.mod', async () => {
            writeFile(path.join(tmpDir, 'go.mod'), 'module example.com/test');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Go')).toBe(true);
        });
        (0, vitest_1.it)('detects Python from pyproject.toml', async () => {
            writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.poetry]');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Python')).toBe(true);
        });
        (0, vitest_1.it)('detects Python from requirements.txt', async () => {
            writeFile(path.join(tmpDir, 'requirements.txt'), 'flask==2.0');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Python')).toBe(true);
        });
        (0, vitest_1.it)('detects Python from setup.py', async () => {
            writeFile(path.join(tmpDir, 'setup.py'), 'from setuptools import setup');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Python')).toBe(true);
        });
        (0, vitest_1.it)('detects Ruby from Gemfile', async () => {
            writeFile(path.join(tmpDir, 'Gemfile'), 'source "https://rubygems.org"');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Ruby')).toBe(true);
        });
        (0, vitest_1.it)('detects Java from pom.xml', async () => {
            writeFile(path.join(tmpDir, 'pom.xml'), '<project></project>');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Java')).toBe(true);
        });
        (0, vitest_1.it)('detects Java from build.gradle', async () => {
            writeFile(path.join(tmpDir, 'build.gradle'), 'apply plugin: "java"');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Java')).toBe(true);
        });
        (0, vitest_1.it)('detects Swift from Package.swift', async () => {
            writeFile(path.join(tmpDir, 'Package.swift'), 'import PackageDescription');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Swift')).toBe(true);
        });
        (0, vitest_1.it)('detects PHP from composer.json', async () => {
            writeFile(path.join(tmpDir, 'composer.json'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'PHP')).toBe(true);
        });
        (0, vitest_1.it)('detects multiple languages in polyglot projects', async () => {
            writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
            writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.poetry]');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.languages.length).toBeGreaterThanOrEqual(2);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'TypeScript')).toBe(true);
            (0, vitest_1.expect)(info.languages.some((l) => l.value === 'Python')).toBe(true);
        });
        (0, vitest_1.it)('returns null language for empty directory', async () => {
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.language).toBeNull();
        });
    });
    // ── Framework Detection ───────────────────────────────────────────
    (0, vitest_1.describe)('framework detection', () => {
        (0, vitest_1.it)('detects Next.js from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { next: '^14.0.0', react: '^18.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Next.js')).toBe(true);
        });
        (0, vitest_1.it)('detects React from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { react: '^18.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'React')).toBe(true);
        });
        (0, vitest_1.it)('detects Express.js from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { express: '^4.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Express.js')).toBe(true);
        });
        (0, vitest_1.it)('detects Vue.js from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { vue: '^3.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Vue.js')).toBe(true);
        });
        (0, vitest_1.it)('detects Angular from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { '@angular/core': '^17.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Angular')).toBe(true);
        });
        (0, vitest_1.it)('detects NestJS from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { '@nestjs/core': '^10.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'NestJS')).toBe(true);
        });
        (0, vitest_1.it)('detects Fastify from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { fastify: '^4.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Fastify')).toBe(true);
        });
        (0, vitest_1.it)('detects Hono from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                dependencies: { hono: '^3.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Hono')).toBe(true);
        });
        (0, vitest_1.it)('detects Django from pyproject.toml', async () => {
            writeFile(path.join(tmpDir, 'pyproject.toml'), '[project]\ndependencies = ["django>=4.0"]');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Django')).toBe(true);
        });
        (0, vitest_1.it)('detects Flask from requirements.txt', async () => {
            writeFile(path.join(tmpDir, 'requirements.txt'), 'flask==2.0');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Flask')).toBe(true);
        });
        (0, vitest_1.it)('detects FastAPI from requirements.txt', async () => {
            writeFile(path.join(tmpDir, 'requirements.txt'), 'fastapi>=0.100');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'FastAPI')).toBe(true);
        });
        (0, vitest_1.it)('detects Ruby on Rails from Gemfile', async () => {
            writeFile(path.join(tmpDir, 'Gemfile'), "gem 'rails', '~> 7.0'");
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Ruby on Rails')).toBe(true);
        });
        (0, vitest_1.it)('detects Gin from go.mod', async () => {
            writeFile(path.join(tmpDir, 'go.mod'), 'module test\nrequire github.com/gin-gonic/gin v1.9.0');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Gin')).toBe(true);
        });
        (0, vitest_1.it)('detects Actix Web from Cargo.toml', async () => {
            writeFile(path.join(tmpDir, 'Cargo.toml'), '[dependencies]\nactix-web = "4"');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks.some((f) => f.value === 'Actix Web')).toBe(true);
        });
        (0, vitest_1.it)('returns empty array for no frameworks', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'bare' });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.frameworks).toEqual([]);
        });
    });
    // ── Test Framework Detection ──────────────────────────────────────
    (0, vitest_1.describe)('test framework detection', () => {
        (0, vitest_1.it)('detects Vitest from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { vitest: '^1.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'Vitest')).toBe(true);
        });
        (0, vitest_1.it)('detects Vitest from vitest.config.ts', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
            writeFile(path.join(tmpDir, 'vitest.config.ts'), 'export default {}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'Vitest')).toBe(true);
        });
        (0, vitest_1.it)('detects Jest from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { jest: '^29.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'Jest')).toBe(true);
        });
        (0, vitest_1.it)('detects Mocha from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { mocha: '^10.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'Mocha')).toBe(true);
        });
        (0, vitest_1.it)('detects Playwright from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { '@playwright/test': '^1.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'Playwright')).toBe(true);
        });
        (0, vitest_1.it)('detects Cypress from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { cypress: '^13.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'Cypress')).toBe(true);
        });
        (0, vitest_1.it)('detects pytest from conftest.py', async () => {
            writeFile(path.join(tmpDir, 'conftest.py'), 'import pytest');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'pytest')).toBe(true);
        });
        (0, vitest_1.it)('detects pytest from pyproject.toml', async () => {
            writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.pytest.ini_options]\ntestpaths = ["tests"]');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.testFrameworks.some((t) => t.value === 'pytest')).toBe(true);
        });
    });
    // ── Build Tool Detection ──────────────────────────────────────────
    (0, vitest_1.describe)('build tool detection', () => {
        (0, vitest_1.it)('detects Vite from vite.config.ts', async () => {
            writeFile(path.join(tmpDir, 'vite.config.ts'), 'export default {}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.buildTools.some((t) => t.value === 'Vite')).toBe(true);
        });
        (0, vitest_1.it)('detects webpack from webpack.config.js', async () => {
            writeFile(path.join(tmpDir, 'webpack.config.js'), 'module.exports = {}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.buildTools.some((t) => t.value === 'webpack')).toBe(true);
        });
        (0, vitest_1.it)('detects Turborepo from turbo.json', async () => {
            writeFile(path.join(tmpDir, 'turbo.json'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.buildTools.some((t) => t.value === 'Turborepo')).toBe(true);
        });
        (0, vitest_1.it)('detects tsc from build script', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                scripts: { build: 'tsc' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.buildTools.some((t) => t.value === 'tsc')).toBe(true);
        });
        (0, vitest_1.it)('detects Make from Makefile', async () => {
            writeFile(path.join(tmpDir, 'Makefile'), 'build:\n\techo "build"');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.buildTools.some((t) => t.value === 'Make')).toBe(true);
        });
        (0, vitest_1.it)('detects Docker from Dockerfile', async () => {
            writeFile(path.join(tmpDir, 'Dockerfile'), 'FROM node:18');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.buildTools.some((t) => t.value === 'Docker')).toBe(true);
        });
        (0, vitest_1.it)('detects Rollup from rollup.config.js', async () => {
            writeFile(path.join(tmpDir, 'rollup.config.js'), 'export default {}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.buildTools.some((t) => t.value === 'Rollup')).toBe(true);
        });
    });
    // ── Linter Detection ──────────────────────────────────────────────
    (0, vitest_1.describe)('linter detection', () => {
        (0, vitest_1.it)('detects ESLint from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { eslint: '^8.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'ESLint')).toBe(true);
        });
        (0, vitest_1.it)('detects ESLint from config file', async () => {
            writeFile(path.join(tmpDir, 'eslint.config.mjs'), 'export default []');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'ESLint')).toBe(true);
        });
        (0, vitest_1.it)('detects Prettier from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { prettier: '^3.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'Prettier')).toBe(true);
        });
        (0, vitest_1.it)('detects Prettier from config file', async () => {
            writeFile(path.join(tmpDir, '.prettierrc'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'Prettier')).toBe(true);
        });
        (0, vitest_1.it)('detects Biome from devDependencies', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                devDependencies: { '@biomejs/biome': '^1.0.0' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'Biome')).toBe(true);
        });
        (0, vitest_1.it)('detects EditorConfig from .editorconfig', async () => {
            writeFile(path.join(tmpDir, '.editorconfig'), 'root = true');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'EditorConfig')).toBe(true);
        });
        (0, vitest_1.it)('detects Ruff from pyproject.toml', async () => {
            writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.ruff]\nline-length = 88');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'Ruff')).toBe(true);
        });
        (0, vitest_1.it)('detects RuboCop from .rubocop.yml', async () => {
            writeFile(path.join(tmpDir, '.rubocop.yml'), 'Style/Encoding: utf-8');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'RuboCop')).toBe(true);
        });
        (0, vitest_1.it)('detects golangci-lint from .golangci.yml', async () => {
            writeFile(path.join(tmpDir, '.golangci.yml'), 'linters: {}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.linters.some((l) => l.value === 'golangci-lint')).toBe(true);
        });
    });
    // ── Package Manager Detection ─────────────────────────────────────
    (0, vitest_1.describe)('package manager detection', () => {
        (0, vitest_1.it)('detects pnpm from pnpm-lock.yaml', async () => {
            writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.packageManager.value).toBe('pnpm');
            (0, vitest_1.expect)(info.packageManager.confidence).toBe('high');
        });
        (0, vitest_1.it)('detects Yarn from yarn.lock', async () => {
            writeFile(path.join(tmpDir, 'yarn.lock'), '');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.packageManager.value).toBe('Yarn');
        });
        (0, vitest_1.it)('detects npm from package-lock.json', async () => {
            writeFile(path.join(tmpDir, 'package-lock.json'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.packageManager.value).toBe('npm');
            (0, vitest_1.expect)(info.packageManager.confidence).toBe('high');
        });
        (0, vitest_1.it)('detects Bun from bun.lockb', async () => {
            writeFile(path.join(tmpDir, 'bun.lockb'), '');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.packageManager.value).toBe('Bun');
        });
        (0, vitest_1.it)('assumes npm with low confidence from package.json only', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.packageManager.value).toBe('npm');
            (0, vitest_1.expect)(info.packageManager.confidence).toBe('low');
        });
        (0, vitest_1.it)('returns null for non-Node projects without lock files', async () => {
            writeFile(path.join(tmpDir, 'go.mod'), 'module test');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.packageManager).toBeNull();
        });
    });
    // ── Module System Detection ───────────────────────────────────────
    (0, vitest_1.describe)('module system detection', () => {
        (0, vitest_1.it)('detects ESM from package.json type field', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                type: 'module',
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.moduleSystem.value).toBe('ESM');
        });
        (0, vitest_1.it)('detects CommonJS from package.json type field', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                type: 'commonjs',
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.moduleSystem.value).toBe('CommonJS');
        });
        (0, vitest_1.it)('detects CommonJS from tsconfig.json', async () => {
            writeJson(path.join(tmpDir, 'tsconfig.json'), {
                compilerOptions: { module: 'commonjs' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.moduleSystem.value).toBe('CommonJS');
        });
        (0, vitest_1.it)('detects ESM from tsconfig.json esnext module', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
            writeJson(path.join(tmpDir, 'tsconfig.json'), {
                compilerOptions: { module: 'esnext' },
            });
            // package.json has no type field, so it falls through to tsconfig
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.moduleSystem.value).toBe('ESM');
        });
    });
    // ── Monorepo Detection ────────────────────────────────────────────
    (0, vitest_1.describe)('monorepo detection', () => {
        (0, vitest_1.it)('detects npm workspaces', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                workspaces: ['packages/*'],
            });
            fs.mkdirSync(path.join(tmpDir, 'packages', 'pkg-a'), { recursive: true });
            fs.mkdirSync(path.join(tmpDir, 'packages', 'pkg-b'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.monorepo).not.toBeNull();
            (0, vitest_1.expect)(info.monorepo.tool.value).toBe('npm/Yarn workspaces');
            (0, vitest_1.expect)(info.monorepo.packages).toContain('packages/pkg-a');
            (0, vitest_1.expect)(info.monorepo.packages).toContain('packages/pkg-b');
        });
        (0, vitest_1.it)('detects pnpm workspaces', async () => {
            writeFile(path.join(tmpDir, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.monorepo).not.toBeNull();
            (0, vitest_1.expect)(info.monorepo.tool.value).toBe('pnpm workspaces');
        });
        (0, vitest_1.it)('detects Turborepo', async () => {
            writeFile(path.join(tmpDir, 'turbo.json'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            // turbo.json is detected as build tool, but also as monorepo
            // only if no workspaces are defined, turbo.json also triggers monorepo
            (0, vitest_1.expect)(info.monorepo).not.toBeNull();
        });
        (0, vitest_1.it)('detects Nx', async () => {
            writeFile(path.join(tmpDir, 'nx.json'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.monorepo).not.toBeNull();
            (0, vitest_1.expect)(info.monorepo.tool.value).toBe('Nx');
        });
        (0, vitest_1.it)('detects Lerna', async () => {
            writeFile(path.join(tmpDir, 'lerna.json'), '{}');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.monorepo).not.toBeNull();
            (0, vitest_1.expect)(info.monorepo.tool.value).toBe('Lerna');
        });
        (0, vitest_1.it)('returns null for non-monorepo', async () => {
            writeJson(path.join(tmpDir, 'package.json'), { name: 'single' });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.monorepo).toBeNull();
        });
    });
    // ── Git Detection ─────────────────────────────────────────────────
    (0, vitest_1.describe)('git detection', () => {
        (0, vitest_1.it)('detects git initialization', async () => {
            fs.mkdirSync(path.join(tmpDir, '.git'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.git.initialized).toBe(true);
        });
        (0, vitest_1.it)('detects no git', async () => {
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.git.initialized).toBe(false);
        });
        (0, vitest_1.it)('detects GitHub from .github directory', async () => {
            fs.mkdirSync(path.join(tmpDir, '.github'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.git.host).toBe('github');
        });
        (0, vitest_1.it)('detects GitLab from .gitlab-ci.yml', async () => {
            writeFile(path.join(tmpDir, '.gitlab-ci.yml'), 'stages: [build]');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.git.host).toBe('gitlab');
        });
        (0, vitest_1.it)('detects Husky', async () => {
            fs.mkdirSync(path.join(tmpDir, '.husky'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.git.hasHusky).toBe(true);
        });
        (0, vitest_1.it)('detects lint-staged', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                'lint-staged': { '*.ts': ['eslint'] },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.git.hasLintStaged).toBe(true);
        });
        (0, vitest_1.it)('detects GitHub from git config', async () => {
            fs.mkdirSync(path.join(tmpDir, '.git'), { recursive: true });
            writeFile(path.join(tmpDir, '.git', 'config'), '[remote "origin"]\n\turl = git@github.com:user/repo.git');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.git.host).toBe('github');
            (0, vitest_1.expect)(info.git.remoteUrl).toContain('github.com');
        });
    });
    // ── Directory Detection ───────────────────────────────────────────
    (0, vitest_1.describe)('directory detection', () => {
        (0, vitest_1.it)('detects src/ directory', async () => {
            fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.source).toBe('src/');
        });
        (0, vitest_1.it)('detects lib/ directory', async () => {
            fs.mkdirSync(path.join(tmpDir, 'lib'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.source).toBe('lib/');
        });
        (0, vitest_1.it)('detects tests/ directory', async () => {
            fs.mkdirSync(path.join(tmpDir, 'tests'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.tests).toBe('tests/');
        });
        (0, vitest_1.it)('detects test/ directory', async () => {
            fs.mkdirSync(path.join(tmpDir, 'test'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.tests).toBe('test/');
        });
        (0, vitest_1.it)('detects docs/ directory', async () => {
            fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.docs).toBe('docs/');
        });
        (0, vitest_1.it)('detects scripts/ directory', async () => {
            fs.mkdirSync(path.join(tmpDir, 'scripts'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.scripts).toBe('scripts/');
        });
        (0, vitest_1.it)('detects public/ static assets', async () => {
            fs.mkdirSync(path.join(tmpDir, 'public'), { recursive: true });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.staticAssets).toBe('public/');
        });
        (0, vitest_1.it)('returns null for missing directories', async () => {
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.directories.source).toBeNull();
            (0, vitest_1.expect)(info.directories.tests).toBeNull();
            (0, vitest_1.expect)(info.directories.docs).toBeNull();
        });
    });
    // ── Existing AI Files Detection ───────────────────────────────────
    (0, vitest_1.describe)('existing AI file detection', () => {
        (0, vitest_1.it)('detects existing CLAUDE.md', async () => {
            writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Test');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.existingFiles.some((f) => f.format === 'claude')).toBe(true);
        });
        (0, vitest_1.it)('detects existing .cursorrules', async () => {
            writeFile(path.join(tmpDir, '.cursorrules'), 'rules');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.existingFiles.some((f) => f.format === 'cursor')).toBe(true);
        });
        (0, vitest_1.it)('detects existing copilot-instructions.md in .github/', async () => {
            writeFile(path.join(tmpDir, '.github', 'copilot-instructions.md'), '# Copilot');
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.existingFiles.some((f) => f.format === 'copilot')).toBe(true);
        });
        (0, vitest_1.it)('reports file size', async () => {
            const content = 'Hello, world! This is test content.';
            writeFile(path.join(tmpDir, 'CLAUDE.md'), content);
            const info = await (0, detect_1.detect)(tmpDir);
            const claudeFile = info.existingFiles.find((f) => f.format === 'claude');
            (0, vitest_1.expect)(claudeFile).toBeDefined();
            (0, vitest_1.expect)(claudeFile.size).toBe(content.length);
        });
        (0, vitest_1.it)('returns empty array when no AI files exist', async () => {
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.existingFiles).toEqual([]);
        });
    });
    // ── Name and Description Detection ────────────────────────────────
    (0, vitest_1.describe)('name and description detection', () => {
        (0, vitest_1.it)('reads name from package.json', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'my-project',
                description: 'A great project',
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.name).toBe('my-project');
            (0, vitest_1.expect)(info.description).toBe('A great project');
        });
        (0, vitest_1.it)('returns null for missing name', async () => {
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.name).toBeNull();
            (0, vitest_1.expect)(info.description).toBeNull();
        });
        (0, vitest_1.it)('reads nodeVersion from engines', async () => {
            writeJson(path.join(tmpDir, 'package.json'), {
                name: 'test',
                engines: { node: '>=18' },
            });
            const info = await (0, detect_1.detect)(tmpDir);
            (0, vitest_1.expect)(info.nodeVersion).toBe('>=18');
        });
    });
});
//# sourceMappingURL=detect.test.js.map
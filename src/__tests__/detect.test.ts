import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { detect } from '../detect';

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ai-env-init-test-'));
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

describe('detect', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
  });

  afterEach(() => {
    cleanTmpDir(tmpDir);
  });

  // ── Language Detection ────────────────────────────────────────────

  describe('language detection', () => {
    it('detects TypeScript from tsconfig.json', async () => {
      writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
      const info = await detect(tmpDir);
      expect(info.language).not.toBeNull();
      expect(info.language!.value).toBe('TypeScript');
      expect(info.language!.confidence).toBe('high');
    });

    it('detects TypeScript from package.json devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'test',
        devDependencies: { typescript: '^5.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.language!.value).toBe('TypeScript');
    });

    it('detects JavaScript from package.json without typescript', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'test',
        dependencies: { express: '^4.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.language!.value).toBe('JavaScript');
    });

    it('detects Rust from Cargo.toml', async () => {
      writeFile(path.join(tmpDir, 'Cargo.toml'), '[package]\nname = "test"');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Rust')).toBe(true);
    });

    it('detects Go from go.mod', async () => {
      writeFile(path.join(tmpDir, 'go.mod'), 'module example.com/test');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Go')).toBe(true);
    });

    it('detects Python from pyproject.toml', async () => {
      writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.poetry]');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Python')).toBe(true);
    });

    it('detects Python from requirements.txt', async () => {
      writeFile(path.join(tmpDir, 'requirements.txt'), 'flask==2.0');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Python')).toBe(true);
    });

    it('detects Python from setup.py', async () => {
      writeFile(path.join(tmpDir, 'setup.py'), 'from setuptools import setup');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Python')).toBe(true);
    });

    it('detects Ruby from Gemfile', async () => {
      writeFile(path.join(tmpDir, 'Gemfile'), 'source "https://rubygems.org"');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Ruby')).toBe(true);
    });

    it('detects Java from pom.xml', async () => {
      writeFile(path.join(tmpDir, 'pom.xml'), '<project></project>');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Java')).toBe(true);
    });

    it('detects Java from build.gradle', async () => {
      writeFile(path.join(tmpDir, 'build.gradle'), 'apply plugin: "java"');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Java')).toBe(true);
    });

    it('detects Swift from Package.swift', async () => {
      writeFile(path.join(tmpDir, 'Package.swift'), 'import PackageDescription');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'Swift')).toBe(true);
    });

    it('detects PHP from composer.json', async () => {
      writeFile(path.join(tmpDir, 'composer.json'), '{}');
      const info = await detect(tmpDir);
      expect(info.languages.some((l) => l.value === 'PHP')).toBe(true);
    });

    it('detects multiple languages in polyglot projects', async () => {
      writeFile(path.join(tmpDir, 'tsconfig.json'), '{}');
      writeFile(path.join(tmpDir, 'pyproject.toml'), '[tool.poetry]');
      const info = await detect(tmpDir);
      expect(info.languages.length).toBeGreaterThanOrEqual(2);
      expect(info.languages.some((l) => l.value === 'TypeScript')).toBe(true);
      expect(info.languages.some((l) => l.value === 'Python')).toBe(true);
    });

    it('returns null language for empty directory', async () => {
      const info = await detect(tmpDir);
      expect(info.language).toBeNull();
    });
  });

  // ── Framework Detection ───────────────────────────────────────────

  describe('framework detection', () => {
    it('detects Next.js from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { next: '^14.0.0', react: '^18.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Next.js')).toBe(true);
    });

    it('detects React from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { react: '^18.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'React')).toBe(true);
    });

    it('detects Express.js from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { express: '^4.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Express.js')).toBe(true);
    });

    it('detects Vue.js from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { vue: '^3.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Vue.js')).toBe(true);
    });

    it('detects Angular from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { '@angular/core': '^17.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Angular')).toBe(true);
    });

    it('detects NestJS from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { '@nestjs/core': '^10.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'NestJS')).toBe(true);
    });

    it('detects Fastify from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { fastify: '^4.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Fastify')).toBe(true);
    });

    it('detects Hono from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { hono: '^3.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Hono')).toBe(true);
    });

    it('detects Django from pyproject.toml', async () => {
      writeFile(
        path.join(tmpDir, 'pyproject.toml'),
        '[project]\ndependencies = ["django>=4.0"]',
      );
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Django')).toBe(true);
    });

    it('detects Flask from requirements.txt', async () => {
      writeFile(path.join(tmpDir, 'requirements.txt'), 'flask==2.0');
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Flask')).toBe(true);
    });

    it('detects FastAPI from requirements.txt', async () => {
      writeFile(path.join(tmpDir, 'requirements.txt'), 'fastapi>=0.100');
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'FastAPI')).toBe(true);
    });

    it('detects Ruby on Rails from Gemfile', async () => {
      writeFile(path.join(tmpDir, 'Gemfile'), "gem 'rails', '~> 7.0'");
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Ruby on Rails')).toBe(
        true,
      );
    });

    it('detects Gin from go.mod', async () => {
      writeFile(
        path.join(tmpDir, 'go.mod'),
        'module test\nrequire github.com/gin-gonic/gin v1.9.0',
      );
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Gin')).toBe(true);
    });

    it('detects Actix Web from Cargo.toml', async () => {
      writeFile(
        path.join(tmpDir, 'Cargo.toml'),
        '[dependencies]\nactix-web = "4"',
      );
      const info = await detect(tmpDir);
      expect(info.frameworks.some((f) => f.value === 'Actix Web')).toBe(true);
    });

    it('returns empty array for no frameworks', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'bare' });
      const info = await detect(tmpDir);
      expect(info.frameworks).toEqual([]);
    });
  });

  // ── Test Framework Detection ──────────────────────────────────────

  describe('test framework detection', () => {
    it('detects Vitest from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { vitest: '^1.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'Vitest')).toBe(true);
    });

    it('detects Vitest from vitest.config.ts', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
      writeFile(path.join(tmpDir, 'vitest.config.ts'), 'export default {}');
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'Vitest')).toBe(true);
    });

    it('detects Jest from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { jest: '^29.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'Jest')).toBe(true);
    });

    it('detects Mocha from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { mocha: '^10.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'Mocha')).toBe(true);
    });

    it('detects Playwright from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { '@playwright/test': '^1.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'Playwright')).toBe(
        true,
      );
    });

    it('detects Cypress from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { cypress: '^13.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'Cypress')).toBe(true);
    });

    it('detects pytest from conftest.py', async () => {
      writeFile(path.join(tmpDir, 'conftest.py'), 'import pytest');
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'pytest')).toBe(true);
    });

    it('detects pytest from pyproject.toml', async () => {
      writeFile(
        path.join(tmpDir, 'pyproject.toml'),
        '[tool.pytest.ini_options]\ntestpaths = ["tests"]',
      );
      const info = await detect(tmpDir);
      expect(info.testFrameworks.some((t) => t.value === 'pytest')).toBe(true);
    });
  });

  // ── Build Tool Detection ──────────────────────────────────────────

  describe('build tool detection', () => {
    it('detects Vite from vite.config.ts', async () => {
      writeFile(path.join(tmpDir, 'vite.config.ts'), 'export default {}');
      const info = await detect(tmpDir);
      expect(info.buildTools.some((t) => t.value === 'Vite')).toBe(true);
    });

    it('detects webpack from webpack.config.js', async () => {
      writeFile(path.join(tmpDir, 'webpack.config.js'), 'module.exports = {}');
      const info = await detect(tmpDir);
      expect(info.buildTools.some((t) => t.value === 'webpack')).toBe(true);
    });

    it('detects Turborepo from turbo.json', async () => {
      writeFile(path.join(tmpDir, 'turbo.json'), '{}');
      const info = await detect(tmpDir);
      expect(info.buildTools.some((t) => t.value === 'Turborepo')).toBe(true);
    });

    it('detects tsc from build script', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        scripts: { build: 'tsc' },
      });
      const info = await detect(tmpDir);
      expect(info.buildTools.some((t) => t.value === 'tsc')).toBe(true);
    });

    it('detects Make from Makefile', async () => {
      writeFile(path.join(tmpDir, 'Makefile'), 'build:\n\techo "build"');
      const info = await detect(tmpDir);
      expect(info.buildTools.some((t) => t.value === 'Make')).toBe(true);
    });

    it('detects Docker from Dockerfile', async () => {
      writeFile(path.join(tmpDir, 'Dockerfile'), 'FROM node:18');
      const info = await detect(tmpDir);
      expect(info.buildTools.some((t) => t.value === 'Docker')).toBe(true);
    });

    it('detects Rollup from rollup.config.js', async () => {
      writeFile(path.join(tmpDir, 'rollup.config.js'), 'export default {}');
      const info = await detect(tmpDir);
      expect(info.buildTools.some((t) => t.value === 'Rollup')).toBe(true);
    });
  });

  // ── Linter Detection ──────────────────────────────────────────────

  describe('linter detection', () => {
    it('detects ESLint from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { eslint: '^8.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'ESLint')).toBe(true);
    });

    it('detects ESLint from config file', async () => {
      writeFile(path.join(tmpDir, 'eslint.config.mjs'), 'export default []');
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'ESLint')).toBe(true);
    });

    it('detects Prettier from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { prettier: '^3.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'Prettier')).toBe(true);
    });

    it('detects Prettier from config file', async () => {
      writeFile(path.join(tmpDir, '.prettierrc'), '{}');
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'Prettier')).toBe(true);
    });

    it('detects Biome from devDependencies', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: { '@biomejs/biome': '^1.0.0' },
      });
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'Biome')).toBe(true);
    });

    it('detects EditorConfig from .editorconfig', async () => {
      writeFile(path.join(tmpDir, '.editorconfig'), 'root = true');
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'EditorConfig')).toBe(true);
    });

    it('detects Ruff from pyproject.toml', async () => {
      writeFile(
        path.join(tmpDir, 'pyproject.toml'),
        '[tool.ruff]\nline-length = 88',
      );
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'Ruff')).toBe(true);
    });

    it('detects RuboCop from .rubocop.yml', async () => {
      writeFile(path.join(tmpDir, '.rubocop.yml'), 'Style/Encoding: utf-8');
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'RuboCop')).toBe(true);
    });

    it('detects golangci-lint from .golangci.yml', async () => {
      writeFile(path.join(tmpDir, '.golangci.yml'), 'linters: {}');
      const info = await detect(tmpDir);
      expect(info.linters.some((l) => l.value === 'golangci-lint')).toBe(true);
    });
  });

  // ── Package Manager Detection ─────────────────────────────────────

  describe('package manager detection', () => {
    it('detects pnpm from pnpm-lock.yaml', async () => {
      writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');
      const info = await detect(tmpDir);
      expect(info.packageManager!.value).toBe('pnpm');
      expect(info.packageManager!.confidence).toBe('high');
    });

    it('detects Yarn from yarn.lock', async () => {
      writeFile(path.join(tmpDir, 'yarn.lock'), '');
      const info = await detect(tmpDir);
      expect(info.packageManager!.value).toBe('Yarn');
    });

    it('detects npm from package-lock.json', async () => {
      writeFile(path.join(tmpDir, 'package-lock.json'), '{}');
      const info = await detect(tmpDir);
      expect(info.packageManager!.value).toBe('npm');
      expect(info.packageManager!.confidence).toBe('high');
    });

    it('detects Bun from bun.lockb', async () => {
      writeFile(path.join(tmpDir, 'bun.lockb'), '');
      const info = await detect(tmpDir);
      expect(info.packageManager!.value).toBe('Bun');
    });

    it('assumes npm with low confidence from package.json only', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
      const info = await detect(tmpDir);
      expect(info.packageManager!.value).toBe('npm');
      expect(info.packageManager!.confidence).toBe('low');
    });

    it('returns null for non-Node projects without lock files', async () => {
      writeFile(path.join(tmpDir, 'go.mod'), 'module test');
      const info = await detect(tmpDir);
      expect(info.packageManager).toBeNull();
    });
  });

  // ── Module System Detection ───────────────────────────────────────

  describe('module system detection', () => {
    it('detects ESM from package.json type field', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        type: 'module',
      });
      const info = await detect(tmpDir);
      expect(info.moduleSystem!.value).toBe('ESM');
    });

    it('detects CommonJS from package.json type field', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        type: 'commonjs',
      });
      const info = await detect(tmpDir);
      expect(info.moduleSystem!.value).toBe('CommonJS');
    });

    it('detects CommonJS from tsconfig.json', async () => {
      writeJson(path.join(tmpDir, 'tsconfig.json'), {
        compilerOptions: { module: 'commonjs' },
      });
      const info = await detect(tmpDir);
      expect(info.moduleSystem!.value).toBe('CommonJS');
    });

    it('detects ESM from tsconfig.json esnext module', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'test' });
      writeJson(path.join(tmpDir, 'tsconfig.json'), {
        compilerOptions: { module: 'esnext' },
      });
      // package.json has no type field, so it falls through to tsconfig
      const info = await detect(tmpDir);
      expect(info.moduleSystem!.value).toBe('ESM');
    });
  });

  // ── Monorepo Detection ────────────────────────────────────────────

  describe('monorepo detection', () => {
    it('detects npm workspaces', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        workspaces: ['packages/*'],
      });
      fs.mkdirSync(path.join(tmpDir, 'packages', 'pkg-a'), { recursive: true });
      fs.mkdirSync(path.join(tmpDir, 'packages', 'pkg-b'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.monorepo).not.toBeNull();
      expect(info.monorepo!.tool.value).toBe('npm/Yarn workspaces');
      expect(info.monorepo!.packages).toContain('packages/pkg-a');
      expect(info.monorepo!.packages).toContain('packages/pkg-b');
    });

    it('detects pnpm workspaces', async () => {
      writeFile(
        path.join(tmpDir, 'pnpm-workspace.yaml'),
        'packages:\n  - "packages/*"',
      );
      const info = await detect(tmpDir);
      expect(info.monorepo).not.toBeNull();
      expect(info.monorepo!.tool.value).toBe('pnpm workspaces');
    });

    it('detects Turborepo', async () => {
      writeFile(path.join(tmpDir, 'turbo.json'), '{}');
      const info = await detect(tmpDir);
      // turbo.json is detected as build tool, but also as monorepo
      // only if no workspaces are defined, turbo.json also triggers monorepo
      expect(info.monorepo).not.toBeNull();
    });

    it('detects Nx', async () => {
      writeFile(path.join(tmpDir, 'nx.json'), '{}');
      const info = await detect(tmpDir);
      expect(info.monorepo).not.toBeNull();
      expect(info.monorepo!.tool.value).toBe('Nx');
    });

    it('detects Lerna', async () => {
      writeFile(path.join(tmpDir, 'lerna.json'), '{}');
      const info = await detect(tmpDir);
      expect(info.monorepo).not.toBeNull();
      expect(info.monorepo!.tool.value).toBe('Lerna');
    });

    it('returns null for non-monorepo', async () => {
      writeJson(path.join(tmpDir, 'package.json'), { name: 'single' });
      const info = await detect(tmpDir);
      expect(info.monorepo).toBeNull();
    });
  });

  // ── Git Detection ─────────────────────────────────────────────────

  describe('git detection', () => {
    it('detects git initialization', async () => {
      fs.mkdirSync(path.join(tmpDir, '.git'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.git.initialized).toBe(true);
    });

    it('detects no git', async () => {
      const info = await detect(tmpDir);
      expect(info.git.initialized).toBe(false);
    });

    it('detects GitHub from .github directory', async () => {
      fs.mkdirSync(path.join(tmpDir, '.github'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.git.host).toBe('github');
    });

    it('detects GitLab from .gitlab-ci.yml', async () => {
      writeFile(path.join(tmpDir, '.gitlab-ci.yml'), 'stages: [build]');
      const info = await detect(tmpDir);
      expect(info.git.host).toBe('gitlab');
    });

    it('detects Husky', async () => {
      fs.mkdirSync(path.join(tmpDir, '.husky'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.git.hasHusky).toBe(true);
    });

    it('detects lint-staged', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        'lint-staged': { '*.ts': ['eslint'] },
      });
      const info = await detect(tmpDir);
      expect(info.git.hasLintStaged).toBe(true);
    });

    it('detects GitHub from git config', async () => {
      fs.mkdirSync(path.join(tmpDir, '.git'), { recursive: true });
      writeFile(
        path.join(tmpDir, '.git', 'config'),
        '[remote "origin"]\n\turl = git@github.com:user/repo.git',
      );
      const info = await detect(tmpDir);
      expect(info.git.host).toBe('github');
      expect(info.git.remoteUrl).toContain('github.com');
    });
  });

  // ── Directory Detection ───────────────────────────────────────────

  describe('directory detection', () => {
    it('detects src/ directory', async () => {
      fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.directories.source).toBe('src/');
    });

    it('detects lib/ directory', async () => {
      fs.mkdirSync(path.join(tmpDir, 'lib'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.directories.source).toBe('lib/');
    });

    it('detects tests/ directory', async () => {
      fs.mkdirSync(path.join(tmpDir, 'tests'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.directories.tests).toBe('tests/');
    });

    it('detects test/ directory', async () => {
      fs.mkdirSync(path.join(tmpDir, 'test'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.directories.tests).toBe('test/');
    });

    it('detects docs/ directory', async () => {
      fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.directories.docs).toBe('docs/');
    });

    it('detects scripts/ directory', async () => {
      fs.mkdirSync(path.join(tmpDir, 'scripts'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.directories.scripts).toBe('scripts/');
    });

    it('detects public/ static assets', async () => {
      fs.mkdirSync(path.join(tmpDir, 'public'), { recursive: true });
      const info = await detect(tmpDir);
      expect(info.directories.staticAssets).toBe('public/');
    });

    it('returns null for missing directories', async () => {
      const info = await detect(tmpDir);
      expect(info.directories.source).toBeNull();
      expect(info.directories.tests).toBeNull();
      expect(info.directories.docs).toBeNull();
    });
  });

  // ── Existing AI Files Detection ───────────────────────────────────

  describe('existing AI file detection', () => {
    it('detects existing CLAUDE.md', async () => {
      writeFile(path.join(tmpDir, 'CLAUDE.md'), '# Test');
      const info = await detect(tmpDir);
      expect(info.existingFiles.some((f) => f.format === 'claude')).toBe(true);
    });

    it('detects existing .cursorrules', async () => {
      writeFile(path.join(tmpDir, '.cursorrules'), 'rules');
      const info = await detect(tmpDir);
      expect(info.existingFiles.some((f) => f.format === 'cursor')).toBe(true);
    });

    it('detects existing copilot-instructions.md in .github/', async () => {
      writeFile(
        path.join(tmpDir, '.github', 'copilot-instructions.md'),
        '# Copilot',
      );
      const info = await detect(tmpDir);
      expect(info.existingFiles.some((f) => f.format === 'copilot')).toBe(true);
    });

    it('reports file size', async () => {
      const content = 'Hello, world! This is test content.';
      writeFile(path.join(tmpDir, 'CLAUDE.md'), content);
      const info = await detect(tmpDir);
      const claudeFile = info.existingFiles.find((f) => f.format === 'claude');
      expect(claudeFile).toBeDefined();
      expect(claudeFile!.size).toBe(content.length);
    });

    it('returns empty array when no AI files exist', async () => {
      const info = await detect(tmpDir);
      expect(info.existingFiles).toEqual([]);
    });
  });

  // ── Name and Description Detection ────────────────────────────────

  describe('name and description detection', () => {
    it('reads name from package.json', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'my-project',
        description: 'A great project',
      });
      const info = await detect(tmpDir);
      expect(info.name).toBe('my-project');
      expect(info.description).toBe('A great project');
    });

    it('returns null for missing name', async () => {
      const info = await detect(tmpDir);
      expect(info.name).toBeNull();
      expect(info.description).toBeNull();
    });

    it('reads nodeVersion from engines', async () => {
      writeJson(path.join(tmpDir, 'package.json'), {
        name: 'test',
        engines: { node: '>=18' },
      });
      const info = await detect(tmpDir);
      expect(info.nodeVersion).toBe('>=18');
    });
  });
});

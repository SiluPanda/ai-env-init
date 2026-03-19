# ai-env-init -- Specification

## 1. Overview

`ai-env-init` is an interactive CLI tool that bootstraps all AI configuration files for a project from a single questionnaire. It detects project characteristics (language, framework, test runner, build tools, linting setup, monorepo structure), asks the developer a focused set of questions about coding conventions and AI behavior preferences, and generates a complete set of AI instruction files -- `CLAUDE.md`, `.cursorrules`, `AGENTS.md`, `copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, `.clinerules`, and `.mcp.json` -- from templates populated with the questionnaire answers and detected project context. It is the `npm init` of AI-assisted development: a single command that sets up everything a project needs for every major AI coding tool.

The gap this package fills is specific and well-defined. Every major AI coding tool has its own instruction file format. Anthropic's Claude Code reads `CLAUDE.md`. Cursor reads `.cursorrules`. Microsoft Copilot reads `AGENTS.md`. GitHub Copilot reads `copilot-instructions.md` in `.github/`. Google Gemini reads `GEMINI.md`. Windsurf reads `.windsurfrules`. Cline reads `.clinerules`. Each format stores fundamentally the same content -- project context, coding conventions, behavioral rules, testing strategy -- but in a tool-specific file with tool-specific conventions. A developer setting up a new project for AI-assisted development today must create 3-7 of these files manually, each time re-entering the same project information in slightly different formats. Most developers create one file (usually `CLAUDE.md` or `.cursorrules`) and skip the rest, leaving their project unconfigured for every other AI tool their teammates might use.

Existing tools address fragments of this problem. Claude Code's `/init` command generates a `CLAUDE.md` by analyzing the codebase, but it produces only that single file. `rulesync` synchronizes between formats (converting `.cursorrules` content to `CLAUDE.md` and back), but it requires source material to already exist -- it converts, it does not create. `repomix` generates codebase context for AI consumption, but it produces a context dump, not instruction files. `aider /init` creates a conventions file for aider specifically. No tool takes a developer through a structured questionnaire, detects project characteristics automatically, and generates the full set of AI instruction files from scratch. `ai-env-init` fills this gap.

`ai-env-init` provides both a TypeScript/JavaScript API for programmatic use and a CLI for terminal use. The CLI runs an interactive questionnaire powered by `@inquirer/prompts`, with detected project information pre-filled as defaults so the developer only needs to confirm or override. The API exposes the detection, questionnaire, and generation steps independently, enabling integration into scaffolding tools, IDE extensions, and CI pipelines. A non-interactive mode (`--yes`) accepts all detected defaults, enabling fully automated bootstrapping. The output is a set of files written to the project directory, each following the conventions and best practices of its respective AI tool.

---

## 2. Goals and Non-Goals

### Goals

- Provide a CLI command (`ai-env-init`) that guides a developer through an interactive questionnaire and generates all AI configuration files for their project in a single session.
- Automatically detect project characteristics -- language, framework, test runner, build tools, linting/formatting setup, monorepo structure, git configuration, directory layout -- and use detected values as questionnaire defaults so the developer does not re-enter information that is already encoded in the project's configuration files.
- Generate AI instruction files for all major AI coding tools: `CLAUDE.md`, `.cursorrules`, `AGENTS.md`, `copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, `.clinerules`, and `.mcp.json`.
- Follow each tool's conventions and best practices for file placement (e.g., `copilot-instructions.md` goes in `.github/`), structure (e.g., `CLAUDE.md` uses numbered markdown sections), and content (e.g., each format has different recommended lengths and emphasis areas).
- Support a non-interactive mode (`--yes` flag, config file input) for CI pipelines, scaffolding scripts, and automation.
- Provide a programmatic API (`detect`, `generate`, `init`) for embedding in other tools -- scaffolding generators, IDE extensions, monorepo setup scripts.
- Handle file conflicts gracefully: never overwrite existing files without explicit confirmation, support `--force` for intentional overwrites, support `--merge` for appending to existing files.
- Validate generated output by integrating with `ai-rules-lint` (when available) to verify that generated instruction files meet quality standards.
- Use a template system that allows customization -- users can provide their own templates to override built-in defaults, and organizations can distribute template packs for company-wide standardization.
- Keep runtime dependencies minimal: `@inquirer/prompts` for interactive prompts and zero other non-dev dependencies. All detection, template rendering, and file generation use Node.js built-ins.

### Non-Goals

- **Not a format converter.** This package generates instruction files from scratch using questionnaire answers and detected project info. It does not convert existing `.cursorrules` to `CLAUDE.md` or vice versa. For format conversion, use `rulesync`.
- **Not an instruction file linter.** This package does not validate the quality of existing instruction files. For linting, use `ai-rules-lint`. `ai-env-init` optionally invokes `ai-rules-lint` as a post-generation validation step, but the linting logic lives in `ai-rules-lint`, not here.
- **Not a codebase context generator.** This package does not produce a comprehensive dump of the codebase's file tree, symbol table, or dependency graph. For codebase context generation, use `repomix` or `codebase-ctx`. `ai-env-init` detects project characteristics to fill in templates, but it produces human-authored-style instruction files, not machine-generated context dumps.
- **Not an LLM-based generator.** This package does not call any LLM API to generate instruction file content. Templates are deterministic. The output for the same inputs is always the same. LLM-generated content would be non-deterministic, require API keys, and introduce latency and cost. `ai-env-init` runs offline in milliseconds.
- **Not a project scaffolding tool.** This package generates AI configuration files only. It does not create `package.json`, `tsconfig.json`, source directories, or other project infrastructure. It assumes the project already exists (or is being created by another tool) and adds AI configuration on top.
- **Not a continuous sync tool.** This package generates files once. It does not watch for project changes and update instruction files automatically. If the project evolves and the instruction files need updating, the developer runs `ai-env-init` again (or updates the files manually).
- **Not a team collaboration platform.** This package generates files locally. It does not sync instruction file content across team members, enforce organizational standards at runtime, or provide a dashboard. For standards enforcement, use `ai-rules-lint` in CI.

---

## 3. Target Users and Use Cases

### Developers Starting New Projects

A developer creates a new project and wants to set it up for AI-assisted development from day one. Instead of manually creating `CLAUDE.md`, `.cursorrules`, and `copilot-instructions.md` separately -- each time looking up the format conventions, deciding what sections to include, and retyping the same project information -- they run `npx ai-env-init`. The tool detects that the project uses TypeScript, React, Vitest, and Vite (from `package.json` and `tsconfig.json`), asks a few questions about coding conventions (naming style, import ordering, error handling approach), and generates all instruction files with the right content in the right locations. Total time: under two minutes, versus 20-30 minutes of manual file creation.

### Teams Onboarding New Members

A team has an established project with coding conventions documented in a wiki or a shared Google Doc, but no AI instruction files. A tech lead runs `ai-env-init`, answers the questionnaire with the team's conventions, and generates instruction files for every AI tool the team uses. The generated files are committed to the repository. When a new team member clones the project and opens it in Cursor, Claude Code, or Copilot, they immediately get the team's coding conventions applied to every AI interaction. The instruction files serve as machine-readable documentation of the team's standards.

### Teams Standardizing Across Repositories

An engineering organization with 50 repositories wants consistent AI instruction files everywhere. They create a template pack (a directory of customized templates for each format) and an `ai-env-init.json` configuration file with their standard questionnaire answers. Each repository runs `ai-env-init --config org-defaults.json --template-dir ./templates/` in CI to bootstrap or verify AI configuration files. The result is consistent AI behavior across all repositories and all AI tools.

### Developers Adopting New AI Tools

A developer has been using Cursor (with `.cursorrules`) and wants to also start using Claude Code. Instead of manually creating `CLAUDE.md` and translating their cursor rules into Claude's format, they run `ai-env-init --format claude`. The tool detects the project's characteristics, uses the questionnaire (with detected defaults), and generates a `CLAUDE.md` that covers the same conventions. The developer can also run `ai-env-init --format all` to retroactively generate files for every tool they might use.

### CI/CD Pipeline Bootstrapping

A scaffolding script or project generator creates new repositories from a template. As part of the setup pipeline, it runs `ai-env-init --yes --format claude,cursor,copilot` to generate AI configuration files using all detected defaults. No human interaction is needed. The generated files are committed as part of the initial project setup.

### Monorepo Setup

A monorepo with multiple packages (managed by Turborepo, Nx, or npm workspaces) needs per-package AI instruction files. The developer runs `ai-env-init` at the monorepo root, which detects the monorepo structure and offers to generate instruction files at both the root level (with global conventions) and per-package (with package-specific context). Root-level files describe the overall architecture and shared conventions. Package-level files describe the specific package's purpose, dependencies, and patterns.

---

## 4. Core Concepts

### Project Detection

Project detection is the automated analysis of a project's directory structure and configuration files to determine its characteristics. Detection runs before the questionnaire, and detected values become the questionnaire's defaults. Detection is non-destructive (read-only) and best-effort -- it uses heuristics and file-existence checks, not deep static analysis. Each detected characteristic has a confidence level (`high`, `medium`, `low`) based on the strength of the signal.

Detection covers: primary language, framework, test runner, build tools, linting/formatting tools, package manager, module system, monorepo setup, git configuration, and directory structure. See Section 6 for the complete detection specification.

### Questionnaire

The questionnaire is the interactive prompt sequence that collects information needed to generate instruction files. Questions are organized into categories: project basics, coding conventions, AI behavior preferences, testing approach, safety constraints, team context, and output format selection. Each question has a default value sourced from project detection (or a sensible static default if detection found nothing). The questionnaire can be skipped entirely with `--yes` (accept all defaults) or pre-answered with a config file.

### File Format

A file format represents one AI tool's instruction file specification. Each format has: a file name (e.g., `CLAUDE.md`), a placement location (e.g., project root, `.github/`), a content structure (sections, headers, conventions), length recommendations, and tool-specific best practices. `ai-env-init` has built-in knowledge of each format's requirements and generates content tailored to each tool's expectations.

### Template

A template is a text file with placeholder variables that gets rendered into a final instruction file. Each supported format has a built-in template. Templates use a simple `{{variable}}` interpolation syntax with conditional blocks (`{{#if condition}}...{{/if}}`) and iteration blocks (`{{#each items}}...{{/each}}`). Templates are not Handlebars, Mustache, or any external templating library -- the template engine is a lightweight custom implementation using string replacement and regex processing to avoid adding a runtime dependency.

### Generation Pipeline

The generation pipeline is the sequence of steps that transforms questionnaire answers into written files: detect project characteristics, run questionnaire (with detected defaults), select output formats, render templates with answers, validate generated content (optional), and write files (with conflict handling). Each step can be invoked independently via the programmatic API.

### Generated File

A generated file is the output of the generation pipeline: a rendered template written to the project's file system. Each generated file records its format, destination path, content, and whether it overwrote an existing file. The `generate()` API returns generated files as in-memory objects without writing to disk, allowing the caller to inspect, modify, or discard them before writing.

---

## 5. Supported Output Formats

### Format Registry

| Format ID | File Name | Placement | Tool | Notes |
|---|---|---|---|---|
| `claude` | `CLAUDE.md` | Project root | Anthropic Claude Code | Markdown. Numbered sections. Can also be placed at `.claude/CLAUDE.md` for user-level instructions. |
| `cursor` | `.cursorrules` | Project root | Cursor IDE | Markdown-ish. Typically flatter structure than CLAUDE.md. |
| `agents` | `AGENTS.md` | Project root | Microsoft Copilot Coding Agent | Markdown. Supports directory-scoped files for sub-packages. |
| `copilot` | `copilot-instructions.md` | `.github/` | GitHub Copilot | Markdown. Must be in `.github/` directory. |
| `gemini` | `GEMINI.md` | Project root | Google Gemini CLI | Markdown. Project-level instructions. |
| `windsurf` | `.windsurfrules` | Project root | Windsurf (Codeium) | Markdown. Global and project-level rules. |
| `cline` | `.clinerules` | Project root | Cline (VS Code extension) | Markdown. Project-level instructions. |
| `mcp` | `.mcp.json` | Project root | MCP-compatible tools | JSON. MCP server configuration. Structurally different from all other formats. |

### Format-Specific Content Structure

#### CLAUDE.md

Claude Code reads `CLAUDE.md` at session start and applies its contents as persistent instructions across all interactions. The recommended structure uses numbered top-level sections:

1. **Project Overview**: What the project is, its purpose, tech stack, and architecture.
2. **Workflow**: How to make changes -- branch naming, commit conventions, PR process.
3. **Coding Conventions**: Language-specific style rules, naming conventions, import ordering, error handling patterns.
4. **File Structure**: Project directory layout and what lives where.
5. **Testing**: How to run tests, test framework, coverage expectations, test writing conventions.
6. **Dependencies**: Key dependencies and why they are used.
7. **Rules**: Hard constraints -- what the AI must always do and must never do.

Generated `CLAUDE.md` files follow this structure. Content length targets 1,500-3,000 tokens (6,000-12,000 characters) for optimal effectiveness -- long enough to provide specific guidance, short enough to avoid context window dilution.

#### .cursorrules

Cursor reads `.cursorrules` as system-level context for every interaction. The format is less structured than `CLAUDE.md` -- Cursor works well with a concise, direct set of rules. The recommended structure:

1. **Role statement**: A one-line description of the AI's role in the project.
2. **Tech stack**: Language, framework, key libraries.
3. **Code style**: Naming conventions, formatting, patterns to follow.
4. **Rules**: Concise imperative rules (use X, avoid Y).

Generated `.cursorrules` files are shorter than `CLAUDE.md` -- targeting 800-1,500 tokens. Cursor injects the full file into the system prompt, so brevity has a direct impact on response quality.

#### AGENTS.md

Microsoft Copilot's coding agent reads `AGENTS.md` for autonomous task execution. The format emphasizes scope boundaries -- what the agent is allowed to modify, how it should handle ambiguity, and what it should not do without human approval.

1. **Scope**: What directories and files the agent may modify.
2. **Coding standards**: Language and style rules.
3. **Testing requirements**: What tests must pass, how to run them.
4. **Boundaries**: What the agent should never do autonomously.

Generated `AGENTS.md` files emphasize safety and scope constraints, matching Copilot's autonomous execution model.

#### copilot-instructions.md

GitHub Copilot reads `copilot-instructions.md` from the `.github/` directory for repository-level instructions. The format is freeform markdown, but Copilot responds best to concise, specific instructions about code style and framework conventions.

1. **Language and framework**: What the project uses.
2. **Code style preferences**: Specific patterns to follow.
3. **Response format**: How Copilot should format its suggestions.

Generated `copilot-instructions.md` files are concise (500-1,000 tokens) and focused on code generation preferences.

#### GEMINI.md

Google's Gemini CLI reads `GEMINI.md` from the project root. The structure is similar to `CLAUDE.md` but with Gemini-specific considerations.

1. **Project context**: What the project does and its tech stack.
2. **Coding conventions**: Style rules and patterns.
3. **Instructions**: Behavioral rules for Gemini.

Generated `GEMINI.md` files follow Gemini's markdown consumption patterns.

#### .windsurfrules

Windsurf reads `.windsurfrules` from the project root. The format supports both global rules and project-level rules.

1. **Project context**: Tech stack and purpose.
2. **Rules**: Coding conventions and behavioral constraints.

Generated `.windsurfrules` files are direct and concise.

#### .clinerules

Cline reads `.clinerules` from the project root. The format is markdown with instructions for Cline's autonomous coding behavior.

1. **Project overview**: What the project is.
2. **Coding rules**: How to write code in this project.
3. **Workflow**: How to approach tasks.

Generated `.clinerules` files match Cline's instruction consumption patterns.

#### .mcp.json

MCP server configuration is structurally different from all other formats. It is a JSON file that defines MCP server connections, not a markdown instruction file. `ai-env-init` generates a starter `.mcp.json` if the developer indicates they use MCP servers, with placeholder entries for common MCP servers (filesystem, git, database).

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"]
    }
  }
}
```

The questionnaire asks about MCP server usage and generates appropriate entries. If the developer does not use MCP servers, `.mcp.json` generation is skipped.

---

## 6. Project Detection

### Overview

Project detection analyzes the project directory to automatically determine its characteristics. Detection runs synchronously at startup, reading configuration files and checking for the presence of indicator files. Each detected characteristic is assigned a confidence level:

- **high**: Strong signal from explicit configuration (e.g., `"typescript"` in `package.json` dependencies).
- **medium**: Inferred from conventions (e.g., `src/` directory exists, suggesting a typical project layout).
- **low**: Weak signal from heuristics (e.g., `.js` files exist but no `package.json`, suggesting JavaScript but ambiguously).

Detection results are used as questionnaire defaults. The developer can always override detected values.

### Language Detection

| Signal | Detected Language | Confidence |
|---|---|---|
| `tsconfig.json` exists | TypeScript | high |
| `package.json` with `typescript` in devDependencies | TypeScript | high |
| `package.json` exists (no TypeScript indicators) | JavaScript | high |
| `Cargo.toml` exists | Rust | high |
| `go.mod` exists | Go | high |
| `pyproject.toml` or `setup.py` or `requirements.txt` exists | Python | high |
| `Gemfile` exists | Ruby | high |
| `pom.xml` or `build.gradle` or `build.gradle.kts` exists | Java/Kotlin | high |
| `*.swift` files in root or `Package.swift` exists | Swift | high |
| `composer.json` exists | PHP | high |
| `.cs` files or `*.csproj` or `*.sln` exists | C# | high |
| No recognized configuration file | Unknown | low |

When multiple languages are detected (e.g., TypeScript + Python in a polyglot project), all are recorded. The primary language is the one with the strongest signal or the most source files.

### Framework Detection

Framework detection reads dependency declarations from language-specific package manifests.

**Node.js / TypeScript (from `package.json` dependencies and devDependencies):**

| Dependency | Detected Framework | Confidence |
|---|---|---|
| `next` | Next.js | high |
| `react` (without `next`) | React | high |
| `@angular/core` | Angular | high |
| `vue` | Vue.js | high |
| `svelte` or `@sveltejs/kit` | Svelte/SvelteKit | high |
| `express` | Express.js | high |
| `fastify` | Fastify | high |
| `koa` | Koa | high |
| `hono` | Hono | high |
| `@nestjs/core` | NestJS | high |
| `nuxt` | Nuxt | high |
| `astro` | Astro | high |
| `remix` or `@remix-run/react` | Remix | high |
| `gatsby` | Gatsby | high |
| `electron` | Electron | high |

**Python (from `pyproject.toml`, `requirements.txt`, or `setup.py`):**

| Dependency | Detected Framework | Confidence |
|---|---|---|
| `django` | Django | high |
| `flask` | Flask | high |
| `fastapi` | FastAPI | high |
| `starlette` | Starlette | high |

**Ruby (from `Gemfile`):**

| Dependency | Detected Framework | Confidence |
|---|---|---|
| `rails` | Ruby on Rails | high |
| `sinatra` | Sinatra | high |

**Go (from `go.mod`):**

| Dependency | Detected Framework | Confidence |
|---|---|---|
| `github.com/gin-gonic/gin` | Gin | high |
| `github.com/gofiber/fiber` | Fiber | high |
| `github.com/labstack/echo` | Echo | high |

**Rust (from `Cargo.toml`):**

| Dependency | Detected Framework | Confidence |
|---|---|---|
| `actix-web` | Actix Web | high |
| `axum` | Axum | high |
| `rocket` | Rocket | high |
| `tauri` | Tauri | high |

### Test Framework Detection

**Node.js / TypeScript (from `package.json` devDependencies and config files):**

| Signal | Detected Test Framework | Confidence |
|---|---|---|
| `vitest` in devDependencies or `vitest.config.ts` exists | Vitest | high |
| `jest` in devDependencies or `jest.config.js` exists | Jest | high |
| `mocha` in devDependencies or `.mocharc.yml` exists | Mocha | high |
| `@playwright/test` in devDependencies | Playwright | high |
| `cypress` in devDependencies or `cypress.config.ts` exists | Cypress | high |
| `ava` in devDependencies | AVA | high |
| `tap` in devDependencies | tap | high |

**Python:**

| Signal | Detected Test Framework | Confidence |
|---|---|---|
| `pytest` in dependencies or `conftest.py` exists | pytest | high |
| `unittest` imports in test files | unittest | medium |

**Go:**

Go projects use the built-in `testing` package. Detection checks for `*_test.go` files.

**Rust:**

Rust projects use built-in test modules (`#[cfg(test)]`). Detection checks for `tests/` directory or `#[test]` in source files.

### Build Tool Detection

| Signal | Detected Build Tool | Confidence |
|---|---|---|
| `vite.config.ts` or `vite.config.js` exists | Vite | high |
| `webpack.config.js` or `webpack.config.ts` exists | webpack | high |
| `esbuild` in package.json scripts | esbuild | medium |
| `rollup.config.js` exists | Rollup | high |
| `turbo.json` exists | Turbopack/Turborepo (build tool aspect) | high |
| `tsconfig.json` with `"outDir"` and `tsc` in build script | TypeScript compiler (tsc) | high |
| `next.config.js` or `next.config.ts` exists | Next.js (built-in bundler) | high |
| `Makefile` exists | Make | medium |
| `Dockerfile` exists | Docker | medium |

### Linting and Formatting Detection

| Signal | Detected Tool | Confidence |
|---|---|---|
| `.eslintrc.*` or `eslint.config.*` or `eslint` in devDependencies | ESLint | high |
| `.prettierrc.*` or `prettier` in devDependencies | Prettier | high |
| `biome.json` or `@biomejs/biome` in devDependencies | Biome | high |
| `oxlint` in devDependencies or `.oxlintrc.json` exists | oxlint | high |
| `.editorconfig` exists | EditorConfig | high |
| `dprint.json` exists | dprint | high |
| `.stylintrc` exists | Stylelint | high |
| `ruff` in pyproject.toml | Ruff | high |
| `.rubocop.yml` exists | RuboCop | high |
| `golangci-lint` in Makefile or `.golangci.yml` exists | golangci-lint | high |
| `clippy` in Cargo.toml or CI config | Clippy | medium |

### Package Manager Detection

| Signal | Detected Package Manager | Confidence |
|---|---|---|
| `pnpm-lock.yaml` exists | pnpm | high |
| `yarn.lock` exists | Yarn | high |
| `bun.lockb` or `bun.lock` exists | Bun | high |
| `package-lock.json` exists | npm | high |
| `package.json` exists (no lockfile) | npm (assumed) | low |

### Module System Detection

| Signal | Detected Module System | Confidence |
|---|---|---|
| `"type": "module"` in package.json | ESM | high |
| `"type": "commonjs"` in package.json | CommonJS | high |
| `"module": "esnext"` or `"module": "nodenext"` in tsconfig.json | ESM | high |
| `"module": "commonjs"` in tsconfig.json | CommonJS | high |
| No explicit module type | CommonJS (Node.js default) | low |

### Monorepo Detection

| Signal | Detected Monorepo Tool | Confidence |
|---|---|---|
| `"workspaces"` field in package.json | npm/Yarn workspaces | high |
| `pnpm-workspace.yaml` exists | pnpm workspaces | high |
| `turbo.json` exists | Turborepo | high |
| `nx.json` exists | Nx | high |
| `lerna.json` exists | Lerna | high |

When a monorepo is detected, the detector also enumerates workspace packages by reading the workspaces configuration and resolving glob patterns to actual package directories.

### Git Configuration Detection

| Signal | Detected Info | Confidence |
|---|---|---|
| `.git/` directory exists | Git is initialized | high |
| `.git/config` contains `[remote "origin"]` | Remote URL (GitHub, GitLab, Bitbucket) | high |
| Commit history (last 20 commits) | Commit message convention (conventional commits, simple, etc.) | medium |
| `.github/` directory exists | GitHub-hosted project | high |
| `.gitlab-ci.yml` exists | GitLab-hosted project | high |
| `.husky/` directory exists | Husky git hooks | high |
| `lint-staged` in package.json | lint-staged configured | high |

Commit message convention detection analyzes the last 20 commit messages for patterns: `feat:`, `fix:`, `chore:` (conventional commits), `[TAG]` prefixes, or freeform messages.

### Directory Structure Detection

The detector checks for common directory patterns:

| Pattern | Detected Structure | Confidence |
|---|---|---|
| `src/` directory exists | Source in `src/` | high |
| `lib/` directory exists | Library code in `lib/` | high |
| `app/` directory exists | Application code in `app/` (common in Next.js, Rails) | high |
| `tests/` or `test/` or `__tests__/` or `src/__tests__/` exists | Test directory convention | high |
| `docs/` directory exists | Documentation directory | high |
| `scripts/` directory exists | Scripts directory | high |
| `config/` or `.config/` directory exists | Configuration directory | medium |
| `public/` or `static/` directory exists | Static assets directory | high |
| `pages/` directory exists | Pages-based routing (Next.js, Nuxt) | high |
| `components/` or `src/components/` exists | Component-based architecture | high |

### Detection Output Type

```typescript
interface ProjectInfo {
  /** Project name (from package.json name, Cargo.toml name, go.mod module, etc.) */
  name: string | null;

  /** Project description (from package.json description, etc.) */
  description: string | null;

  /** Primary programming language. */
  language: DetectedItem<string> | null;

  /** All detected languages (for polyglot projects). */
  languages: DetectedItem<string>[];

  /** Detected framework(s). */
  frameworks: DetectedItem<string>[];

  /** Detected test framework(s). */
  testFrameworks: DetectedItem<string>[];

  /** Detected build tool(s). */
  buildTools: DetectedItem<string>[];

  /** Detected linting/formatting tools. */
  linters: DetectedItem<string>[];

  /** Detected package manager. */
  packageManager: DetectedItem<string> | null;

  /** Detected module system. */
  moduleSystem: DetectedItem<string> | null;

  /** Detected monorepo tool and workspace packages. */
  monorepo: {
    tool: DetectedItem<string>;
    packages: string[];
  } | null;

  /** Git information. */
  git: {
    initialized: boolean;
    remoteUrl: string | null;
    host: 'github' | 'gitlab' | 'bitbucket' | 'other' | null;
    commitConvention: DetectedItem<string> | null;
    hasHusky: boolean;
    hasLintStaged: boolean;
  };

  /** Detected directory structure. */
  directories: {
    source: string | null;
    tests: string | null;
    docs: string | null;
    scripts: string | null;
    config: string | null;
    staticAssets: string | null;
  };

  /** Existing AI instruction files found in the project. */
  existingFiles: ExistingAIFile[];

  /** Node.js engine requirement (from package.json engines field). */
  nodeVersion: string | null;
}

interface DetectedItem<T> {
  /** The detected value. */
  value: T;

  /** Confidence level of the detection. */
  confidence: 'high' | 'medium' | 'low';

  /** What file or signal produced this detection. */
  source: string;
}

interface ExistingAIFile {
  /** The format of the existing file. */
  format: FileFormat;

  /** Absolute path to the file. */
  path: string;

  /** File size in bytes. */
  size: number;
}
```

---

## 7. Interactive Questionnaire

### Overview

The questionnaire collects information that cannot be reliably detected from the project's configuration files: coding conventions, AI behavior preferences, team context, and safety constraints. Questions are organized into sections. Each question has a type (text, select, multi-select, confirm), a default value (from detection or static default), and validation rules. The questionnaire adapts to detected context -- questions about a test framework are skipped if no test framework is detected (the developer can still manually specify one).

### Question Sections

#### 7.1 Project Basics

These questions establish project identity and context. Most are pre-filled from detection.

| Question | Type | Default Source | Notes |
|---|---|---|---|
| Project name | text | `package.json` name or directory name | Used in generated file headers. |
| Project description | text | `package.json` description | One-line description for project overview sections. |
| Primary language | select | Language detection | Options: TypeScript, JavaScript, Python, Go, Rust, Ruby, Java, C#, PHP, Swift, Other. |
| Framework | select | Framework detection | Options depend on detected language. Includes "None" option. |
| Additional libraries/tools to highlight | text (freeform) | None | E.g., "Prisma, tRPC, Zod" -- mentioned in generated instructions so the AI knows what tools are available. |

#### 7.2 Coding Conventions

These questions capture the team's style preferences. They produce the most impactful content in the generated instruction files.

| Question | Type | Default Source | Notes |
|---|---|---|---|
| Naming convention | select | Language default (camelCase for JS/TS, snake_case for Python/Rust, PascalCase for C#) | Options: camelCase, snake_case, PascalCase, kebab-case. Applies to variables and functions. |
| Component/class naming | select | Language default | Options: PascalCase, camelCase, snake_case. |
| Import ordering preference | select | Linter detection (ESLint import plugin) | Options: "External first, then internal", "Alphabetical", "Grouped by type", "No preference". |
| Error handling approach | select | Framework default | Options: "try/catch with explicit handling", "Result/Either types", "Error boundaries (React)", "Framework default", "No preference". |
| Comment style | select | Static default | Options: "JSDoc for public APIs", "Minimal comments (code should be self-documenting)", "Comprehensive inline comments", "No preference". |
| Preferred patterns | multi-select | None | Options: "Prefer const over let", "Prefer named exports", "Prefer async/await over .then()", "Prefer early returns", "Prefer functional style", "Prefer composition over inheritance". Shown only for applicable languages. |

#### 7.3 AI Behavior Preferences

These questions shape how AI tools interact with the developer.

| Question | Type | Default Source | Notes |
|---|---|---|---|
| Response verbosity | select | Static default ("balanced") | Options: "Concise (minimal explanation)", "Balanced (explain non-obvious decisions)", "Detailed (explain reasoning thoroughly)". |
| Code modification approach | select | Static default ("minimal") | Options: "Minimal changes (smallest diff possible)", "Refactor freely when improving", "Always suggest the ideal solution regardless of diff size". |
| When uncertain | select | Static default ("ask") | Options: "Ask for clarification", "Make best judgment and note assumptions", "Show options and let me choose". |
| Autonomous actions | multi-select | Static default (conservative) | Options: "May create new files", "May modify existing files", "May run shell commands", "May install dependencies", "Should always ask before destructive actions". |

#### 7.4 Testing

These questions define testing expectations in generated files.

| Question | Type | Default Source | Notes |
|---|---|---|---|
| Test framework | select | Test framework detection | Options depend on language. Includes "None/Not yet". |
| Test command | text | `package.json` scripts.test | E.g., `npm test`, `pytest`, `go test ./...`. |
| Testing expectations | multi-select | Static defaults | Options: "Write tests for new features", "Update tests when changing behavior", "Maintain or improve coverage", "Prefer unit tests", "Include integration tests", "Include E2E tests". |

#### 7.5 Safety and Constraints

These questions define guardrails for AI behavior.

| Question | Type | Default Source | Notes |
|---|---|---|---|
| Files/directories the AI should not modify | text (freeform) | Static defaults (e.g., `.env`, `credentials/`, `node_modules/`) | Comma-separated list. |
| Topics to avoid | text (freeform) | None | E.g., "Do not generate database migration files directly". |
| Security constraints | multi-select | Static defaults | Options: "Never commit secrets", "Never expose API keys", "Never run sudo", "Always validate user input", "Never disable security features". |

#### 7.6 Team Context

These questions provide context about the development environment.

| Question | Type | Default Source | Notes |
|---|---|---|---|
| Team size | select | Static default | Options: "Solo developer", "Small team (2-5)", "Medium team (6-20)", "Large team (20+)". Affects generated content: solo projects skip team workflow sections. |
| Code review process | select | Git detection (GitHub PRs) | Options: "Pull requests with review", "Pair programming", "Direct commits", "No formal process". |
| Commit message convention | select | Commit convention detection | Options: "Conventional Commits (feat:, fix:, etc.)", "Scope-prefixed ([component] message)", "Freeform descriptive", "No convention". |
| Branch naming convention | text | Static default | E.g., `feature/<description>`, `feat/<ticket>-<description>`. |

#### 7.7 Output Format Selection

| Question | Type | Default Source | Notes |
|---|---|---|---|
| Which AI config files to generate | multi-select | All formats (all checked by default) | Options: CLAUDE.md, .cursorrules, AGENTS.md, copilot-instructions.md, GEMINI.md, .windsurfrules, .clinerules, .mcp.json. |
| Generate MCP server config | confirm | false | Only shown if `.mcp.json` is selected. Asks whether the developer uses MCP servers. |

### Questionnaire Output Type

```typescript
interface QuestionnaireAnswers {
  /** Project basics. */
  project: {
    name: string;
    description: string;
    language: string;
    framework: string | null;
    additionalTools: string[];
  };

  /** Coding conventions. */
  conventions: {
    namingConvention: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case';
    componentNaming: 'PascalCase' | 'camelCase' | 'snake_case';
    importOrdering: 'external-first' | 'alphabetical' | 'grouped' | 'no-preference';
    errorHandling: 'try-catch' | 'result-types' | 'error-boundaries' | 'framework-default' | 'no-preference';
    commentStyle: 'jsdoc-public' | 'minimal' | 'comprehensive' | 'no-preference';
    preferredPatterns: string[];
  };

  /** AI behavior preferences. */
  aiBehavior: {
    verbosity: 'concise' | 'balanced' | 'detailed';
    modificationApproach: 'minimal' | 'refactor-freely' | 'ideal-solution';
    whenUncertain: 'ask' | 'best-judgment' | 'show-options';
    autonomousActions: string[];
  };

  /** Testing configuration. */
  testing: {
    framework: string | null;
    command: string | null;
    expectations: string[];
  };

  /** Safety and constraints. */
  safety: {
    protectedPaths: string[];
    topicsToAvoid: string[];
    securityConstraints: string[];
  };

  /** Team context. */
  team: {
    size: 'solo' | 'small' | 'medium' | 'large';
    reviewProcess: 'pull-requests' | 'pair-programming' | 'direct-commits' | 'no-formal';
    commitConvention: 'conventional' | 'scope-prefixed' | 'freeform' | 'no-convention';
    branchNaming: string | null;
  };

  /** Which formats to generate. */
  formats: FileFormat[];
}

type FileFormat = 'claude' | 'cursor' | 'agents' | 'copilot' | 'gemini' | 'windsurf' | 'cline' | 'mcp';
```

---

## 8. Template System

### Overview

Each output format has a built-in template -- a markdown (or JSON, for `.mcp.json`) file with placeholder variables and conditional blocks. Templates encode the structure, conventions, and best practices for each AI tool's instruction file format. When the generation pipeline renders a template, it substitutes variables with questionnaire answers and detected project info, evaluates conditionals, and produces the final file content.

### Template Syntax

Templates use a lightweight custom syntax:

#### Variable Interpolation

```
{{project.name}}
{{project.description}}
{{conventions.namingConvention}}
```

Variables are resolved from a merged context object containing `QuestionnaireAnswers`, `ProjectInfo`, and computed values. Missing variables are replaced with an empty string (no error).

#### Conditional Blocks

```
{{#if testing.framework}}
## Testing

Run tests with `{{testing.command}}`. The project uses {{testing.framework}}.
{{/if}}
```

Conditionals evaluate truthiness: non-null, non-empty-string, non-empty-array values are truthy. Supports `{{#if}}`, `{{#unless}}`, and `{{else}}`:

```
{{#if monorepo}}
This is a monorepo managed by {{monorepo.tool.value}}.
{{else}}
This is a single-package project.
{{/if}}
```

#### Iteration Blocks

```
{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
```

Iterates over arrays. `{{this}}` refers to the current element. `{{@index}}` provides the zero-based index.

#### Nested Conditionals

```
{{#if project.framework}}
{{#if (eq project.framework "Next.js")}}
Use the App Router for new pages. Prefer Server Components by default.
{{/if}}
{{#if (eq project.framework "React")}}
Use functional components with hooks. Avoid class components.
{{/if}}
{{/if}}
```

The `eq` helper compares two values for equality.

### Template Variables

The template rendering context merges three sources:

1. **Questionnaire answers** (`QuestionnaireAnswers`): User-provided or default values from the questionnaire.
2. **Detected project info** (`ProjectInfo`): Automatically detected project characteristics.
3. **Computed values**: Derived from the above. Examples:
   - `hasTests`: true if `testing.framework` is not null.
   - `isMonorepo`: true if `monorepo` is not null.
   - `isTypeScript`: true if `project.language` is "TypeScript".
   - `primaryFrameworkDescription`: A human-readable string like "a Next.js application" or "an Express.js API".
   - `languageSpecificPatterns`: An array of coding patterns specific to the detected language.

### Built-in Templates

Built-in templates are embedded in the package source (in `src/templates/`). Each template is a string constant, not an external file, to avoid runtime file-system dependencies and path resolution issues when the package is installed globally or via `npx`.

Template content follows best practices gathered from:
- Anthropic's Claude Code documentation for `CLAUDE.md`.
- Cursor's documentation and community `.cursorrules` examples for `.cursorrules`.
- Microsoft's Copilot coding agent documentation for `AGENTS.md`.
- GitHub's Copilot documentation for `copilot-instructions.md`.
- Google's Gemini CLI documentation for `GEMINI.md`.
- Windsurf's documentation for `.windsurfrules`.
- Cline's documentation for `.clinerules`.

### Custom Templates

Users can override built-in templates by providing a template directory:

```bash
ai-env-init --template-dir ./my-templates/
```

The template directory contains files named by format ID: `claude.md.tmpl`, `cursor.md.tmpl`, `agents.md.tmpl`, `copilot.md.tmpl`, `gemini.md.tmpl`, `windsurf.md.tmpl`, `cline.md.tmpl`, `mcp.json.tmpl`. If a template file exists in the custom directory, it overrides the built-in template for that format. Missing files fall back to built-in templates.

Programmatic API:

```typescript
const files = await generate(answers, formats, {
  templates: {
    claude: '# {{project.name}}\n\nCustom CLAUDE.md template...',
    cursor: '# Custom cursor rules...',
  },
});
```

### Template Inheritance

Organizations can create a base template and extend it:

```
{{> base}}

## Company-Specific Rules

- All code must pass SonarQube quality gate.
- Use the company logging library (`@company/logger`).
```

The `{{> base}}` directive includes the built-in template for that format, and the custom template adds to it. This allows organizations to layer company-specific rules on top of the default best practices without rewriting the entire template.

---

## 9. Generation Pipeline

### Step 1: Detect Project Characteristics

The pipeline starts by running project detection against the target directory. Detection reads configuration files (`package.json`, `tsconfig.json`, `Cargo.toml`, etc.), checks for indicator files, and produces a `ProjectInfo` object. This step is fast (under 50ms) because it reads a fixed set of known files rather than traversing the entire directory tree.

### Step 2: Run Questionnaire

The pipeline presents the interactive questionnaire to the developer, with detected values as defaults. In non-interactive mode (`--yes`), all defaults are accepted without prompting. In config-file mode (`--config`), answers are loaded from a JSON file, with any missing answers filled in from detection defaults.

### Step 3: Select Output Formats

The developer selects which AI config files to generate. By default, all formats are selected except `.mcp.json` (which requires explicit opt-in because it has a different structure and purpose). The developer can also specify formats via CLI flags (`--format claude,cursor,copilot`).

### Step 4: Render Templates

For each selected format, the pipeline loads the template (built-in or custom), merges the template context (answers + detection + computed values), and renders the template by substituting variables, evaluating conditionals, and expanding iteration blocks. The result is a string containing the final file content.

### Step 5: Handle File Conflicts

Before writing, the pipeline checks whether each target file already exists:

- **File does not exist**: Proceed to write.
- **File exists and `--force` is set**: Overwrite without prompting.
- **File exists and `--merge` is set**: Append the generated content to the existing file, separated by a horizontal rule and a comment explaining that the appended content was generated by `ai-env-init`.
- **File exists and interactive mode**: Prompt the developer with options: "Overwrite", "Skip", "Append", "Show diff". The diff option displays the generated content alongside the existing content so the developer can decide.
- **File exists and non-interactive mode (no `--force` or `--merge`)**: Skip the file and log a warning.

### Step 6: Write Files

The pipeline writes each generated file to its target location. For `copilot-instructions.md`, the pipeline creates the `.github/` directory if it does not exist. For `CLAUDE.md`, the file is placed at the project root (not `.claude/CLAUDE.md`, which is for user-level instructions). Each file is written with UTF-8 encoding and a trailing newline.

### Step 7: Validate (Optional)

If `ai-rules-lint` is available (installed as a dependency or globally), the pipeline runs it against the generated markdown instruction files to verify they meet quality standards. Validation failures are reported as warnings (they do not prevent file writing) with suggestions for improvement. This step is skipped silently if `ai-rules-lint` is not available.

### Step 8: Report

The pipeline prints a summary of what was generated:

```
ai-env-init v0.1.0

Detected: TypeScript, Next.js, Vitest, pnpm, ESLint + Prettier

Generated 5 files:
  CLAUDE.md           (2,847 tokens)    created
  .cursorrules        (1,102 tokens)    created
  AGENTS.md           (1,456 tokens)    created
  .github/copilot-instructions.md  (743 tokens)     created
  GEMINI.md           (1,891 tokens)    created

Skipped 1 file:
  .cursorrules        already exists (use --force to overwrite)

Run `npx ai-rules-lint --scan` to validate the generated files.
```

---

## 10. API Surface

### Installation

```bash
npm install ai-env-init
```

### Main Export: `init`

The primary API for the full interactive flow. Runs detection, questionnaire, and generation.

```typescript
import { init } from 'ai-env-init';

await init({
  projectPath: '/path/to/project',
  formats: ['claude', 'cursor', 'copilot'],
  nonInteractive: false,
});
```

### Export: `detect`

Runs project detection only, without the questionnaire or generation. Useful for tools that want to inspect a project's characteristics programmatically.

```typescript
import { detect } from 'ai-env-init';

const info = await detect('/path/to/project');

console.log(info.language);       // { value: 'TypeScript', confidence: 'high', source: 'tsconfig.json' }
console.log(info.frameworks);     // [{ value: 'Next.js', confidence: 'high', source: 'package.json' }]
console.log(info.testFrameworks); // [{ value: 'Vitest', confidence: 'high', source: 'package.json' }]
console.log(info.monorepo);       // null
```

### Export: `generate`

Renders templates with provided answers and returns generated file objects without writing to disk. Useful for tools that want to inspect or modify the generated content before writing.

```typescript
import { generate } from 'ai-env-init';

const files = await generate(
  answers,       // QuestionnaireAnswers
  ['claude', 'cursor'],  // FileFormat[]
  {
    projectPath: '/path/to/project',
    templates: {
      claude: customClaudeTemplate,
    },
  },
);

for (const file of files) {
  console.log(file.format);      // 'claude'
  console.log(file.fileName);    // 'CLAUDE.md'
  console.log(file.path);        // '/path/to/project/CLAUDE.md'
  console.log(file.content);     // '# my-project\n\n...'
  console.log(file.tokens);      // 2847 (estimated)
}
```

### Export: `createInitializer`

Factory function that creates a configured initializer for reuse. Useful when generating files for multiple projects with the same configuration.

```typescript
import { createInitializer } from 'ai-env-init';

const initializer = createInitializer({
  formats: ['claude', 'cursor', 'copilot'],
  templateDir: './company-templates/',
  defaults: {
    conventions: {
      namingConvention: 'camelCase',
      commentStyle: 'jsdoc-public',
    },
    team: {
      size: 'medium',
      reviewProcess: 'pull-requests',
      commitConvention: 'conventional',
    },
  },
});

// Initialize multiple projects with the same config
await initializer.init('/path/to/project-a');
await initializer.init('/path/to/project-b');
```

### Type Definitions

```typescript
// ── Init Options ────────────────────────────────────────────────────

interface InitOptions {
  /**
   * Project directory to initialize. Default: process.cwd().
   */
  projectPath?: string;

  /**
   * Formats to generate. Default: all formats except 'mcp'.
   */
  formats?: FileFormat[];

  /**
   * Non-interactive mode. Accept all defaults without prompting.
   * Default: false.
   */
  nonInteractive?: boolean;

  /**
   * Overwrite existing files without prompting.
   * Default: false.
   */
  force?: boolean;

  /**
   * Append to existing files instead of overwriting.
   * Default: false.
   */
  merge?: boolean;

  /**
   * Pre-filled answers. Merges with detected defaults.
   * Questions with pre-filled answers are skipped in the questionnaire.
   */
  answers?: Partial<QuestionnaireAnswers>;

  /**
   * Custom template directory. Templates in this directory
   * override built-in templates for their respective formats.
   */
  templateDir?: string;

  /**
   * Custom templates as strings, keyed by format ID.
   * Overrides both built-in and templateDir templates.
   */
  templates?: Partial<Record<FileFormat, string>>;

  /**
   * Whether to validate generated files with ai-rules-lint.
   * Default: true (but silently skipped if ai-rules-lint is not installed).
   */
  validate?: boolean;

  /**
   * Whether to print output to stdout.
   * Default: true.
   */
  quiet?: boolean;
}

// ── Generate Options ────────────────────────────────────────────────

interface GenerateOptions {
  /**
   * Project directory (used for path resolution and detection context).
   * Default: process.cwd().
   */
  projectPath?: string;

  /**
   * Custom templates as strings, keyed by format ID.
   */
  templates?: Partial<Record<FileFormat, string>>;

  /**
   * Custom template directory.
   */
  templateDir?: string;
}

// ── Generated File ──────────────────────────────────────────────────

interface GeneratedFile {
  /** The format of this generated file. */
  format: FileFormat;

  /** The file name (e.g., 'CLAUDE.md', '.cursorrules'). */
  fileName: string;

  /** Absolute path where the file will be written. */
  path: string;

  /** The generated file content. */
  content: string;

  /** Estimated token count (characters / 4). */
  tokens: number;

  /** Whether this file would overwrite an existing file. */
  overwrites: boolean;
}

// ── Init Result ─────────────────────────────────────────────────────

interface InitResult {
  /** The detected project info. */
  detection: ProjectInfo;

  /** The questionnaire answers (including defaults). */
  answers: QuestionnaireAnswers;

  /** The generated files. */
  files: GeneratedFile[];

  /** Files that were written to disk. */
  written: string[];

  /** Files that were skipped (already existed). */
  skipped: string[];

  /** Validation results (if ai-rules-lint was available). */
  validation?: ValidationResult[];
}

interface ValidationResult {
  /** File path that was validated. */
  filePath: string;

  /** Whether the file passed validation. */
  passed: boolean;

  /** Number of errors. */
  errors: number;

  /** Number of warnings. */
  warnings: number;

  /** Diagnostic messages. */
  messages: string[];
}

// ── Initializer ─────────────────────────────────────────────────────

interface InitializerConfig {
  /** Formats to generate. */
  formats?: FileFormat[];

  /** Custom template directory. */
  templateDir?: string;

  /** Custom templates. */
  templates?: Partial<Record<FileFormat, string>>;

  /** Default answers to merge with detection. */
  defaults?: Partial<QuestionnaireAnswers>;

  /** Validation. */
  validate?: boolean;
}

interface Initializer {
  /** Run the full init flow for a project. */
  init(projectPath: string, options?: Partial<InitOptions>): Promise<InitResult>;

  /** Run detection only. */
  detect(projectPath: string): Promise<ProjectInfo>;

  /** Generate files without writing. */
  generate(
    answers: QuestionnaireAnswers,
    projectPath?: string,
  ): Promise<GeneratedFile[]>;
}
```

### Example: Full Init Flow

```typescript
import { init } from 'ai-env-init';

const result = await init({
  projectPath: '/path/to/my-project',
  formats: ['claude', 'cursor', 'copilot'],
  nonInteractive: true,
});

console.log(`Generated ${result.written.length} files.`);
console.log(`Skipped ${result.skipped.length} files.`);
```

### Example: Detection Only

```typescript
import { detect } from 'ai-env-init';

const info = await detect('/path/to/my-project');

if (info.language?.value === 'TypeScript') {
  console.log('TypeScript project detected');
}

if (info.monorepo) {
  console.log(`Monorepo with ${info.monorepo.packages.length} packages`);
}
```

### Example: Programmatic Generation

```typescript
import { detect, generate } from 'ai-env-init';

const info = await detect('/path/to/project');

const answers: QuestionnaireAnswers = {
  project: {
    name: info.name ?? 'my-project',
    description: info.description ?? 'A project',
    language: info.language?.value ?? 'TypeScript',
    framework: info.frameworks[0]?.value ?? null,
    additionalTools: [],
  },
  conventions: {
    namingConvention: 'camelCase',
    componentNaming: 'PascalCase',
    importOrdering: 'external-first',
    errorHandling: 'try-catch',
    commentStyle: 'jsdoc-public',
    preferredPatterns: ['Prefer const over let', 'Prefer named exports'],
  },
  aiBehavior: {
    verbosity: 'balanced',
    modificationApproach: 'minimal',
    whenUncertain: 'ask',
    autonomousActions: ['May create new files', 'Should always ask before destructive actions'],
  },
  testing: {
    framework: info.testFrameworks[0]?.value ?? null,
    command: 'npm test',
    expectations: ['Write tests for new features', 'Maintain or improve coverage'],
  },
  safety: {
    protectedPaths: ['.env', 'credentials/', 'node_modules/'],
    topicsToAvoid: [],
    securityConstraints: ['Never commit secrets', 'Never expose API keys'],
  },
  team: {
    size: 'small',
    reviewProcess: 'pull-requests',
    commitConvention: 'conventional',
    branchNaming: 'feat/<description>',
  },
  formats: ['claude', 'cursor'],
};

const files = await generate(answers, ['claude', 'cursor'], {
  projectPath: '/path/to/project',
});

for (const file of files) {
  console.log(`${file.fileName}: ${file.tokens} tokens`);
  console.log(file.content);
}
```

---

## 11. Non-Interactive Mode

### Overview

Non-interactive mode allows `ai-env-init` to run without human input, using detected defaults and pre-configured answers. This is essential for CI pipelines, scaffolding scripts, and automation.

### CLI Flags

```bash
# Accept all detected defaults without prompting.
ai-env-init --yes

# Generate specific formats only.
ai-env-init --yes --format claude,cursor

# Load answers from a configuration file.
ai-env-init --config ai-env-init.json

# Combine: config file + accept defaults for unspecified answers.
ai-env-init --config ai-env-init.json --yes

# Force overwrite existing files.
ai-env-init --yes --force

# Generate to a specific directory.
ai-env-init --yes --project-path /path/to/project
```

### Configuration File Format

The configuration file is a JSON file containing partial `QuestionnaireAnswers`:

```json
{
  "project": {
    "description": "A high-performance API gateway"
  },
  "conventions": {
    "namingConvention": "camelCase",
    "commentStyle": "jsdoc-public",
    "preferredPatterns": [
      "Prefer const over let",
      "Prefer named exports",
      "Prefer async/await over .then()"
    ]
  },
  "aiBehavior": {
    "verbosity": "balanced",
    "modificationApproach": "minimal"
  },
  "team": {
    "size": "medium",
    "reviewProcess": "pull-requests",
    "commitConvention": "conventional"
  },
  "formats": ["claude", "cursor", "copilot", "agents"]
}
```

Answers in the config file override detected defaults. Any answers not in the config file fall back to detection, then to static defaults.

### Precedence

Answer resolution follows this order (later sources override earlier):

1. Static defaults (built into `ai-env-init`).
2. Detected project info (from project detection).
3. Configuration file (`--config`).
4. CLI flags (`--format`, etc.).
5. Interactive questionnaire answers (if not in `--yes` mode).

---

## 12. CLI Interface

### Installation and Invocation

```bash
# npx (no install)
npx ai-env-init

# Global install
npm install -g ai-env-init
ai-env-init

# Package script
# package.json: { "scripts": { "init:ai": "ai-env-init" } }
npm run init:ai
```

### CLI Binary Name

`ai-env-init`

### Commands and Flags

The CLI has no subcommands. It accepts configuration and output options as flags.

```
ai-env-init [options]

Output options:
  --format <formats>       Comma-separated list of formats to generate.
                           Values: claude, cursor, agents, copilot, gemini,
                           windsurf, cline, mcp, all.
                           Default: all (except mcp).
  --project-path <path>    Project directory to initialize.
                           Default: current directory.

Behavior options:
  --yes, -y                Non-interactive mode. Accept all defaults.
  --force, -f              Overwrite existing files without prompting.
  --merge                  Append to existing files instead of overwriting.
  --config <path>          Load answers from a JSON configuration file.
  --template-dir <path>    Custom template directory.

Validation options:
  --no-validate            Skip post-generation validation with ai-rules-lint.
  --validate               Force validation (error if ai-rules-lint is not
                           installed).

Output options:
  --quiet, -q              Suppress all output except errors.
  --json                   Output results as JSON instead of human-readable.

Meta:
  --version                Print version and exit.
  --help                   Print help and exit.
  --detect-only            Run project detection and print results, then exit.
                           Does not generate any files.
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success. All requested files were generated (or skipped with acknowledgment). |
| `1` | Partial failure. Some files could not be generated (e.g., permission error, template error). |
| `2` | Configuration error. Invalid flags, unreadable config file, or invalid project path. |
| `3` | User cancelled. The developer aborted the questionnaire (Ctrl+C). |

### Human-Readable Output Example

```
$ npx ai-env-init

  ai-env-init v0.1.0

  Detecting project characteristics...

  Detected:
    Language:      TypeScript          (from tsconfig.json)
    Framework:     Next.js             (from package.json)
    Test runner:   Vitest              (from package.json)
    Build tool:    Next.js             (from next.config.ts)
    Linting:       ESLint, Prettier    (from .eslintrc.js, .prettierrc)
    Package mgr:   pnpm               (from pnpm-lock.yaml)
    Module system: ESM                 (from package.json type: module)
    Git:           GitHub              (from .git/config)
    Monorepo:      No

  Existing AI files:
    .cursorrules   (1.2 KB)

  Starting questionnaire...

  [interactive prompts here]

  Generating files...

  Generated 6 files:
    CLAUDE.md                          2,847 tokens   created
    AGENTS.md                          1,456 tokens   created
    .github/copilot-instructions.md      743 tokens   created
    GEMINI.md                          1,891 tokens   created
    .windsurfrules                       912 tokens   created
    .clinerules                          834 tokens   created

  Skipped 1 file:
    .cursorrules   already exists (use --force to overwrite)

  Run `npx ai-rules-lint --scan` to validate the generated files.
```

### Detection-Only Output Example

```
$ npx ai-env-init --detect-only --json

{
  "name": "my-project",
  "description": "A Next.js application",
  "language": { "value": "TypeScript", "confidence": "high", "source": "tsconfig.json" },
  "frameworks": [{ "value": "Next.js", "confidence": "high", "source": "package.json" }],
  "testFrameworks": [{ "value": "Vitest", "confidence": "high", "source": "package.json" }],
  "buildTools": [{ "value": "Next.js", "confidence": "high", "source": "next.config.ts" }],
  "linters": [
    { "value": "ESLint", "confidence": "high", "source": ".eslintrc.js" },
    { "value": "Prettier", "confidence": "high", "source": ".prettierrc" }
  ],
  "packageManager": { "value": "pnpm", "confidence": "high", "source": "pnpm-lock.yaml" },
  "moduleSystem": { "value": "ESM", "confidence": "high", "source": "package.json" },
  "monorepo": null,
  "existingFiles": [
    { "format": "cursor", "path": "/path/to/project/.cursorrules", "size": 1234 }
  ]
}
```

### Environment Variables

| Environment Variable | Equivalent Flag |
|---------------------|-----------------|
| `AI_ENV_INIT_FORMAT` | `--format` |
| `AI_ENV_INIT_PROJECT_PATH` | `--project-path` |
| `AI_ENV_INIT_CONFIG` | `--config` |
| `AI_ENV_INIT_TEMPLATE_DIR` | `--template-dir` |
| `AI_ENV_INIT_YES` | `--yes` (set to `1` or `true`) |
| `AI_ENV_INIT_FORCE` | `--force` (set to `1` or `true`) |

---

## 13. Configuration

### Configuration File

`ai-env-init` searches for a configuration file in the project directory:

1. `ai-env-init.json`
2. `.ai-env-init.json`
3. `ai-env-init` key in `package.json`

The `--config` flag overrides auto-detection and accepts an arbitrary path.

### Configuration File Format

```json
{
  "formats": ["claude", "cursor", "copilot", "agents"],
  "templateDir": "./company-templates/",
  "validate": true,
  "defaults": {
    "conventions": {
      "namingConvention": "camelCase",
      "componentNaming": "PascalCase",
      "importOrdering": "external-first",
      "errorHandling": "try-catch",
      "commentStyle": "jsdoc-public",
      "preferredPatterns": [
        "Prefer const over let",
        "Prefer named exports",
        "Prefer async/await over .then()"
      ]
    },
    "aiBehavior": {
      "verbosity": "balanced",
      "modificationApproach": "minimal",
      "whenUncertain": "ask"
    },
    "team": {
      "size": "medium",
      "reviewProcess": "pull-requests",
      "commitConvention": "conventional",
      "branchNaming": "feat/<description>"
    },
    "safety": {
      "protectedPaths": [".env", ".env.*", "credentials/", "secrets/"],
      "securityConstraints": [
        "Never commit secrets",
        "Never expose API keys",
        "Always validate user input"
      ]
    }
  }
}
```

### Default Values

| Option | Default | Description |
|--------|---------|-------------|
| `formats` | All except `mcp` | Which AI config files to generate. |
| `templateDir` | None | Custom template directory (built-in templates used). |
| `validate` | `true` | Validate with ai-rules-lint if available. |
| `force` | `false` | Do not overwrite existing files. |
| `merge` | `false` | Do not append to existing files. |
| `nonInteractive` | `false` | Run interactive questionnaire. |
| `quiet` | `false` | Show output. |

---

## 14. Integration

### Integration with ai-rules-lint

`ai-env-init` optionally validates generated files using `ai-rules-lint`. When `ai-rules-lint` is installed (globally or as a project dependency), the post-generation validation step imports its `lint` function and runs it against each generated markdown instruction file. Validation results are included in the output report.

```bash
# Generate files, then validate
npx ai-env-init
# Output includes validation results:
#   Validation (ai-rules-lint):
#     CLAUDE.md          PASS  0 errors, 0 warnings
#     .cursorrules       PASS  0 errors, 1 warning
#     AGENTS.md          PASS  0 errors, 0 warnings

# Generate then validate separately
npx ai-env-init --no-validate
npx ai-rules-lint --scan
```

If `ai-rules-lint` is not installed, the validation step is silently skipped. The `--validate` flag forces validation and exits with an error if `ai-rules-lint` is not available.

### Integration with codebase-ctx

If `codebase-ctx` is installed, `ai-env-init` can optionally use it to enrich template context with deeper codebase analysis -- symbol tables, dependency graphs, and architecture descriptions. This produces richer instruction files with more specific project context. This is an optional enhancement; `ai-env-init` works fully without `codebase-ctx`.

### Integration with Project Scaffolding Tools

`ai-env-init` is designed to be called as a post-setup step from scaffolding tools:

```javascript
// In a scaffolding tool like create-my-app
import { init } from 'ai-env-init';

// After creating project structure...
await init({
  projectPath: targetDir,
  nonInteractive: true,
  formats: ['claude', 'cursor', 'copilot'],
  answers: {
    project: {
      name: projectName,
      description: projectDescription,
      language: 'TypeScript',
      framework: 'Next.js',
      additionalTools: [],
    },
  },
});
```

### npm Script Integration

```json
{
  "scripts": {
    "init:ai": "ai-env-init",
    "init:ai:ci": "ai-env-init --yes --format claude,cursor,copilot",
    "validate:ai": "ai-rules-lint --scan --preset recommended"
  }
}
```

### CI/CD: GitHub Actions

```yaml
name: Bootstrap AI Config
on:
  workflow_dispatch:

jobs:
  init-ai-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Generate AI config files
        run: npx ai-env-init --yes --format claude,cursor,copilot,agents

      - name: Validate generated files
        run: npx ai-rules-lint --scan --preset recommended

      - name: Commit generated files
        run: |
          git add CLAUDE.md .cursorrules AGENTS.md .github/copilot-instructions.md
          git commit -m "chore: bootstrap AI configuration files"
          git push
```

---

## 15. Testing Strategy

### Unit Tests

Unit tests verify each component in isolation.

- **Detector tests**: For each detection category (language, framework, test runner, build tool, linter, package manager, module system, monorepo, git, directories), test with:
  - A fixture project directory containing the relevant configuration files. Assert correct detection value and confidence level.
  - A fixture project directory without the relevant files. Assert null/empty detection.
  - Ambiguous cases (e.g., both `tsconfig.json` and `pyproject.toml` present). Assert that all languages are detected and the primary is correctly determined.
- **Questionnaire tests**: Test default value computation from detection results. Test answer validation rules (e.g., project name must not be empty). Test that questions are correctly skipped when pre-filled answers are provided.
- **Template engine tests**: Test variable interpolation with all variable types (strings, arrays, nulls). Test conditional blocks (truthy/falsy evaluation, if/else, unless). Test iteration blocks (arrays, empty arrays). Test nested conditionals. Test the `eq` helper. Test unknown variables (should produce empty string, not error). Test malformed templates (unclosed blocks, invalid syntax).
- **Template rendering tests**: For each built-in template, render with a known set of answers and assert the output matches expected content. Test with minimal answers (all defaults). Test with maximal answers (everything specified). Test with different languages/frameworks to verify conditional branches.
- **File conflict tests**: Test each conflict resolution strategy: overwrite, skip, merge, prompt. Test with read-only files (should produce a meaningful error). Test directory creation for `.github/copilot-instructions.md`.
- **Config file tests**: Test parsing valid JSON config files. Test config file discovery (search order). Test invalid config files (invalid JSON, missing fields). Test config file merged with detection defaults.

### Integration Tests

Integration tests run the full pipeline against realistic fixture projects.

- **TypeScript + React project**: Create a temporary project with `package.json` (React, TypeScript, Vitest, ESLint, Prettier), `tsconfig.json`, `src/`, and `tests/`. Run `init` in non-interactive mode. Assert all generated files exist, contain correct project info, mention the right framework, and follow each format's conventions.
- **Python + Django project**: Create a temporary project with `pyproject.toml` (Django, pytest), `manage.py`, and `app/`. Run `init` in non-interactive mode. Assert generated files reference Python conventions, Django patterns, and pytest.
- **Go project**: Create a temporary project with `go.mod`. Run `init` in non-interactive mode. Assert generated files reference Go conventions and idiomatic Go patterns.
- **Monorepo project**: Create a temporary project with `package.json` containing workspaces, `turbo.json`, and multiple package directories. Assert detection correctly identifies the monorepo structure and workspace packages.
- **Empty project**: Create a temporary directory with no configuration files. Run `init` in non-interactive mode. Assert that detection returns nulls/defaults, generated files use generic content, and no errors occur.
- **Existing files**: Create a temporary project with an existing `CLAUDE.md`. Run `init` with `--force` and assert the file is overwritten. Run without `--force` and assert the file is skipped.
- **Config file mode**: Create a temporary project and a config file. Run `init --config config.json --yes`. Assert answers from the config file appear in generated content.

### CLI End-to-End Tests

Run the CLI binary against test fixture projects and verify:

- Exit code 0 on successful generation.
- Exit code 2 on invalid flags.
- Exit code 3 when `--detect-only` is used (exit 0, no files generated).
- Stdout output matches expected format (human-readable or JSON).
- Generated files exist at expected paths with expected content.

### Edge Cases to Test

- Project directory that does not exist.
- Project directory with no read permissions.
- Project directory with no write permissions (for file writing).
- `package.json` with invalid JSON.
- `package.json` with no name or description.
- `package.json` with extremely long dependency lists.
- Template with undefined variables (should produce empty string).
- Template with syntax errors (unclosed `{{#if}}`).
- All formats selected including `.mcp.json`.
- Format list containing an invalid format name.
- Config file that references a non-existent template directory.
- Generating into a directory that is a git submodule.
- Concurrent `ai-env-init` runs in the same directory.

### Test Framework

Tests use Vitest, matching the project's existing configuration. Test fixtures are created as temporary directories using `node:fs/promises.mkdtemp`. Fixtures are cleaned up after each test run.

---

## 16. Performance

### Detection

Project detection reads a fixed set of known files (approximately 20 file paths) using synchronous `existsSync` checks and synchronous file reads for small configuration files (`package.json`, `tsconfig.json`, etc.). Total detection time is under 50ms on a typical SSD for any project size. Detection does not traverse the directory tree recursively -- it checks specific known paths only.

### Template Rendering

Template rendering is pure string processing: regex-based variable substitution, conditional block evaluation, and iteration expansion. For a template producing a 3,000-token instruction file, rendering completes in under 2ms. All eight templates render in under 15ms total.

### File Writing

File writing is sequential (one file at a time) to avoid race conditions and provide clear error attribution. Writing eight files completes in under 10ms on a typical SSD.

### Total Pipeline

The full pipeline (detection + rendering + writing) excluding the interactive questionnaire completes in under 100ms. The questionnaire is the bottleneck, and its duration depends entirely on the human operator. In non-interactive mode (`--yes`), the total runtime is under 100ms.

### Memory

Memory usage is proportional to the number of templates and generated files held in memory simultaneously. With eight templates and eight generated files, peak memory usage is under 5 MB above baseline Node.js process memory.

### Startup Time

The CLI imports `@inquirer/prompts` lazily (only when interactive mode is used) to minimize startup time for non-interactive invocations. Cold-start time for `npx ai-env-init --yes` is dominated by npm/npx overhead, not by the package itself.

---

## 17. Dependencies

### Runtime Dependencies

| Dependency | Purpose |
|---|---|
| `@inquirer/prompts` | Interactive terminal prompts (text, select, multi-select, confirm). Used only in interactive mode. |

### Why Minimal Dependencies

- **No CLI framework**: `node:util.parseArgs` (available since Node.js 18) handles flag parsing. No dependency on `commander`, `yargs`, or `meow`.
- **No templating engine**: A lightweight custom template engine (regex-based variable substitution and conditional evaluation) avoids depending on Handlebars, Mustache, EJS, or similar libraries. The template syntax is deliberately simple to keep the engine under 200 lines.
- **No glob library**: Detection checks specific known file paths, not glob patterns. No dependency on `glob`, `fast-glob`, or `minimatch`.
- **No chalk/colors**: Terminal coloring uses ANSI escape codes directly. Color detection uses `process.stdout.isTTY` and the `NO_COLOR` environment variable.
- **No file system wrappers**: File reading and writing use `node:fs` and `node:fs/promises` directly.
- **No YAML parser**: Configuration files are JSON only. YAML adds complexity and a dependency without meaningful benefit for a config file that users typically create once.

### Dev Dependencies

| Dependency | Purpose |
|---|---|
| `typescript` | TypeScript compiler. |
| `vitest` | Test runner. |
| `eslint` | Linter for the package's own source code. |

### Optional Peer Dependencies

| Dependency | Purpose |
|---|---|
| `ai-rules-lint` | Post-generation validation. Used if installed; silently skipped if not. |

---

## 18. File Structure

```
ai-env-init/
├── package.json
├── tsconfig.json
├── SPEC.md
├── README.md
├── src/
│   ├── index.ts                      # Public API exports: init, detect, generate,
│   │                                 #   createInitializer, types
│   ├── cli.ts                        # CLI entry point: argument parsing, interactive flow,
│   │                                 #   output formatting, exit codes
│   ├── types.ts                      # All TypeScript type definitions
│   ├── init.ts                       # Core init() function: orchestrates the full pipeline
│   ├── detect/
│   │   ├── index.ts                  # Detection entry point: runs all detectors, assembles ProjectInfo
│   │   ├── language.ts               # Language detection (package.json, tsconfig.json, Cargo.toml, etc.)
│   │   ├── framework.ts              # Framework detection (dependencies → framework)
│   │   ├── test-framework.ts         # Test framework detection
│   │   ├── build-tool.ts             # Build tool detection
│   │   ├── linter.ts                 # Linting/formatting tool detection
│   │   ├── package-manager.ts        # Package manager detection (lockfiles)
│   │   ├── module-system.ts          # Module system detection (ESM vs CommonJS)
│   │   ├── monorepo.ts               # Monorepo detection (workspaces, turbo, nx)
│   │   ├── git.ts                    # Git configuration detection
│   │   ├── directories.ts            # Directory structure detection
│   │   └── existing-files.ts         # Existing AI instruction file detection
│   ├── questionnaire/
│   │   ├── index.ts                  # Questionnaire runner: presents questions, collects answers
│   │   ├── questions.ts              # Question definitions (text, type, defaults, validation)
│   │   ├── defaults.ts               # Default value computation from ProjectInfo
│   │   └── validation.ts             # Answer validation rules
│   ├── templates/
│   │   ├── index.ts                  # Template registry: loads built-in and custom templates
│   │   ├── engine.ts                 # Template engine: variable interpolation, conditionals,
│   │   │                             #   iteration, helpers
│   │   ├── claude.ts                 # Built-in CLAUDE.md template
│   │   ├── cursor.ts                 # Built-in .cursorrules template
│   │   ├── agents.ts                 # Built-in AGENTS.md template
│   │   ├── copilot.ts                # Built-in copilot-instructions.md template
│   │   ├── gemini.ts                 # Built-in GEMINI.md template
│   │   ├── windsurf.ts               # Built-in .windsurfrules template
│   │   ├── cline.ts                  # Built-in .clinerules template
│   │   └── mcp.ts                    # Built-in .mcp.json template
│   ├── generate/
│   │   ├── index.ts                  # generate() function: renders templates, returns GeneratedFile[]
│   │   ├── context.ts                # Template context builder: merges answers + detection + computed
│   │   └── writer.ts                 # File writer: conflict handling, directory creation, writing
│   ├── validate/
│   │   └── index.ts                  # Optional ai-rules-lint integration
│   └── utils/
│       ├── file.ts                   # File reading helpers (readJsonFile, fileExists)
│       ├── token-estimate.ts         # Token count estimation (characters / 4)
│       └── ansi.ts                   # ANSI color code helpers
├── src/__tests__/
│   ├── detect/
│   │   ├── language.test.ts
│   │   ├── framework.test.ts
│   │   ├── test-framework.test.ts
│   │   ├── build-tool.test.ts
│   │   ├── linter.test.ts
│   │   ├── package-manager.test.ts
│   │   ├── monorepo.test.ts
│   │   ├── git.test.ts
│   │   └── directories.test.ts
│   ├── questionnaire/
│   │   ├── defaults.test.ts
│   │   └── validation.test.ts
│   ├── templates/
│   │   ├── engine.test.ts
│   │   ├── claude.test.ts
│   │   ├── cursor.test.ts
│   │   ├── agents.test.ts
│   │   ├── copilot.test.ts
│   │   └── mcp.test.ts
│   ├── generate/
│   │   ├── context.test.ts
│   │   └── writer.test.ts
│   ├── init.test.ts
│   ├── cli.test.ts
│   └── fixtures/
│       ├── typescript-react/         # Fixture: TS + React project
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── src/
│       ├── python-django/            # Fixture: Python + Django project
│       │   ├── pyproject.toml
│       │   └── app/
│       ├── go-project/               # Fixture: Go project
│       │   └── go.mod
│       ├── monorepo/                 # Fixture: monorepo with workspaces
│       │   ├── package.json
│       │   ├── turbo.json
│       │   └── packages/
│       ├── empty-project/            # Fixture: empty directory
│       └── configs/
│           ├── valid-config.json
│           └── invalid-config.json
└── dist/                             # Compiled output (gitignored)
```

---

## 19. Implementation Roadmap

### Phase 1: Detection and Core Generation (v0.1.0)

Implement project detection, the template engine, and basic generation for the two most common formats.

**Deliverables:**
- Project detection: language, framework, test runner, build tool, linter, package manager, monorepo, git, directories, existing AI files.
- `detect()` API function.
- Template engine: variable interpolation, conditional blocks, iteration blocks.
- Built-in templates for `CLAUDE.md` and `.cursorrules`.
- `generate()` API function (programmatic, no writing).
- File writer with conflict detection (skip existing files by default).
- CLI with `--detect-only`, `--yes`, `--format`, `--force` flags.
- Non-interactive mode.
- Unit tests for all detectors and the template engine.
- Integration tests with TypeScript/React and empty project fixtures.

### Phase 2: Full Format Support and Questionnaire (v0.2.0)

Add the interactive questionnaire and remaining output formats.

**Deliverables:**
- Interactive questionnaire using `@inquirer/prompts`: all question sections (project basics, conventions, AI behavior, testing, safety, team, format selection).
- Built-in templates for `AGENTS.md`, `copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, `.clinerules`.
- `.mcp.json` generation.
- `init()` API function (full pipeline).
- `--merge` flag for appending to existing files.
- `--config` flag for config file input.
- Config file auto-discovery.
- Human-readable output with detection summary and generation report.
- Unit tests for questionnaire defaults and validation.
- Integration tests with Python, Go, and monorepo fixtures.

### Phase 3: Custom Templates and Validation (v0.3.0)

Add the custom template system, validation integration, and the factory API.

**Deliverables:**
- Custom template directory support (`--template-dir`).
- Custom templates via API (`templates` option).
- Template inheritance (`{{> base}}`).
- `createInitializer()` factory function.
- `ai-rules-lint` integration for post-generation validation.
- `--json` output mode.
- Environment variable configuration.
- `--quiet` flag.
- CLI end-to-end tests.
- Edge case tests (permissions, invalid configs, concurrent runs).

### Phase 4: Polish and Ecosystem (v1.0.0)

Stabilize the API, complete documentation, and prepare for broad adoption.

**Deliverables:**
- API stability guarantee (semver major version).
- Complete README with usage examples, format catalog, and customization guide.
- Published npm package with TypeScript declarations.
- Example custom template packs (company standardization, minimal setup).
- Performance benchmarks.
- Framework-specific template enhancements (Next.js App Router conventions, Django best practices, Go idioms).
- Integration documentation for scaffolding tools (create-next-app, create-vite, etc.).

---

## 20. Example Use Cases

### 20.1 New TypeScript + Next.js Project

A developer has just created a Next.js project with `create-next-app`. They want AI config files for Claude Code and Cursor.

```bash
$ cd my-nextjs-app
$ npx ai-env-init --format claude,cursor

  ai-env-init v0.1.0

  Detected:
    Language:      TypeScript          (from tsconfig.json)
    Framework:     Next.js             (from package.json)
    Test runner:   (none detected)
    Build tool:    Next.js             (from next.config.ts)
    Linting:       ESLint              (from .eslintrc.json)
    Package mgr:   npm                 (from package-lock.json)

  Starting questionnaire...

  ? Project description: A SaaS dashboard for analytics
  ? Naming convention: camelCase
  ? Import ordering: External first, then internal
  ? Error handling: try/catch with explicit handling
  ? Comment style: JSDoc for public APIs
  ? Response verbosity: Balanced
  ? Test framework: (none)
  ? Commit convention: Conventional Commits

  Generated 2 files:
    CLAUDE.md           2,124 tokens   created
    .cursorrules          891 tokens   created
```

The generated `CLAUDE.md` includes sections about Next.js App Router conventions, TypeScript strict mode, ESLint compliance, and the project's coding style. The generated `.cursorrules` contains a concise version of the same information tailored to Cursor's format.

### 20.2 Team Onboarding with Config File

A tech lead creates a config file encoding the team's conventions, then shares it with the team.

```bash
# Tech lead creates the config once
$ cat > ai-env-init.json << 'EOF'
{
  "formats": ["claude", "cursor", "copilot", "agents"],
  "defaults": {
    "conventions": {
      "namingConvention": "camelCase",
      "componentNaming": "PascalCase",
      "importOrdering": "external-first",
      "errorHandling": "try-catch",
      "commentStyle": "jsdoc-public",
      "preferredPatterns": ["Prefer const over let", "Prefer named exports", "Prefer async/await over .then()"]
    },
    "team": {
      "size": "medium",
      "reviewProcess": "pull-requests",
      "commitConvention": "conventional",
      "branchNaming": "feat/<ticket>-<description>"
    },
    "safety": {
      "protectedPaths": [".env", ".env.*", "secrets/"],
      "securityConstraints": ["Never commit secrets", "Never expose API keys"]
    }
  }
}
EOF

# Any developer runs this in any team repo
$ npx ai-env-init --config ai-env-init.json --yes
```

Every repository gets the same team conventions applied consistently across all AI tools.

### 20.3 CI Pipeline Bootstrapping

A scaffolding script creates new microservice repositories. After creating the project, it runs `ai-env-init` to add AI configuration.

```yaml
# GitHub Actions workflow for scaffolding new microservices
- name: Bootstrap AI configuration
  run: |
    npx ai-env-init \
      --yes \
      --force \
      --format claude,cursor,copilot,agents \
      --config ./templates/ai-env-init-microservice.json
```

The `--yes` flag ensures no interactive prompts. The `--force` flag ensures any existing files from the template are overwritten with fresh, detection-aware content. The config file provides microservice-specific defaults (e.g., "This is a REST API microservice" as the description template).

### 20.4 Monorepo Per-Package Setup

A developer has a Turborepo monorepo with 5 packages. They want AI config files at both the root and package levels.

```bash
$ npx ai-env-init

  Detected:
    Monorepo:      Turborepo (5 packages)
    Packages:      apps/web, apps/api, packages/ui, packages/shared, packages/config

  ? Generate files at monorepo root? Yes
  ? Generate files for individual packages? Yes
  ? Which packages? [all selected]

  Generated 30 files:
    ./CLAUDE.md                              2,847 tokens   created
    ./apps/web/CLAUDE.md                     1,456 tokens   created
    ./apps/api/CLAUDE.md                     1,234 tokens   created
    ./packages/ui/CLAUDE.md                    876 tokens   created
    ./packages/shared/CLAUDE.md                743 tokens   created
    ...
```

Root-level files describe the overall monorepo architecture. Package-level files describe each package's specific purpose, dependencies, and patterns.

### 20.5 Adding Claude Code to a Cursor-Only Project

A developer has been using Cursor with `.cursorrules` and wants to add Claude Code support without manually translating their rules.

```bash
$ npx ai-env-init --format claude

  Detected:
    Existing:      .cursorrules (2.1 KB)

  ? Use existing .cursorrules as reference for CLAUDE.md content? Yes

  Generated 1 file:
    CLAUDE.md           2,543 tokens   created
```

The tool detects the existing `.cursorrules`, uses it as additional context (alongside project detection and questionnaire answers), and generates a `CLAUDE.md` that covers the same conventions in Claude's recommended format.

### 20.6 Detection-Only for Inspection

A developer wants to see what `ai-env-init` would detect about their project without generating any files.

```bash
$ npx ai-env-init --detect-only

  ai-env-init v0.1.0

  Project: my-rust-api
  Description: A REST API built with Axum

  Detection Results:
    Language:        Rust                (from Cargo.toml)        [high]
    Framework:       Axum                (from Cargo.toml)        [high]
    Test runner:     Built-in (cargo)    (from Cargo.toml)        [high]
    Build tool:      Cargo               (from Cargo.toml)        [high]
    Linting:         Clippy              (from .github/workflows) [medium]
    Package manager: Cargo               (from Cargo.toml)        [high]
    Monorepo:        No
    Git:             GitHub              (from .git/config)       [high]
    Commit style:    Conventional        (from git log)           [medium]

  Existing AI files:
    (none)

  No files generated (--detect-only mode).
```

# ai-env-init — Task Breakdown

This document breaks down all work described in SPEC.md into granular, actionable tasks organized by phase.

---

## Phase 0: Project Scaffolding and Setup

- [ ] **Install runtime dependencies** — Add `@inquirer/prompts` as a runtime dependency in `package.json`. This is the only runtime dependency per spec. | Status: not_done
- [x] **Install dev dependencies** — Add `typescript`, `vitest`, and `eslint` as dev dependencies in `package.json` (some may already be present). Ensure versions are compatible with Node.js >=18. | Status: done
- [ ] **Add optional peer dependency** — Add `ai-rules-lint` as an optional peer dependency in `package.json` for post-generation validation. | Status: not_done
- [ ] **Configure CLI binary** — Add the `"bin"` field to `package.json` mapping `"ai-env-init"` to `"dist/cli.js"`. | Status: not_done
- [ ] **Create source directory structure** — Create all directories specified in the file structure: `src/detect/`, `src/questionnaire/`, `src/templates/`, `src/generate/`, `src/validate/`, `src/utils/`, and `src/__tests__/` with subdirectories (`detect/`, `questionnaire/`, `templates/`, `generate/`, `fixtures/`). | Status: not_done
- [x] **Create type definitions file** — Create `src/types.ts` with all TypeScript interfaces and types from the spec: `ProjectInfo`, `DetectedItem`, `ExistingAIFile`, `QuestionnaireAnswers`, `FileFormat`, `InitOptions`, `GenerateOptions`, `GeneratedFile`, `InitResult`, `ValidationResult`, `InitializerConfig`, `Initializer`. | Status: done

---

## Phase 1: Utility Modules

- [x] **Implement file reading helpers** — Create `src/utils/file.ts` with `readJsonFile` (reads and parses JSON files, returns null on error), `fileExists` (wraps `existsSync`), and `readFileContent` (reads UTF-8 text file). These are used throughout detection. | Status: done
- [x] **Implement token estimation utility** — Create `src/utils/token-estimate.ts` with a function that estimates token count as `Math.ceil(content.length / 4)`. Used in `GeneratedFile.tokens`. | Status: done
- [ ] **Implement ANSI color helpers** — Create `src/utils/ansi.ts` with helpers for terminal coloring using raw ANSI escape codes (no chalk dependency). Must respect `process.stdout.isTTY` and the `NO_COLOR` environment variable. Provide helpers for bold, dim, green, yellow, red, cyan. | Status: not_done

---

## Phase 2: Project Detection

### Language Detection

- [x] **Detect TypeScript via tsconfig.json** — Check if `tsconfig.json` exists in the project root. If so, return `{ value: 'TypeScript', confidence: 'high', source: 'tsconfig.json' }`. | Status: done
- [x] **Detect TypeScript via package.json devDependencies** — Check if `package.json` has `typescript` in `devDependencies`. Return high confidence TypeScript detection. | Status: done
- [x] **Detect JavaScript via package.json** — If `package.json` exists but no TypeScript indicators are found, return `{ value: 'JavaScript', confidence: 'high', source: 'package.json' }`. | Status: done
- [x] **Detect Rust via Cargo.toml** — Check if `Cargo.toml` exists. Return high confidence Rust detection. | Status: done
- [x] **Detect Go via go.mod** — Check if `go.mod` exists. Return high confidence Go detection. | Status: done
- [x] **Detect Python via pyproject.toml/setup.py/requirements.txt** — Check for any of these files. Return high confidence Python detection. | Status: done
- [x] **Detect Ruby via Gemfile** — Check if `Gemfile` exists. Return high confidence Ruby detection. | Status: done
- [x] **Detect Java/Kotlin via pom.xml/build.gradle** — Check for `pom.xml`, `build.gradle`, or `build.gradle.kts`. Return high confidence Java/Kotlin detection. | Status: done
- [x] **Detect Swift via Package.swift or *.swift files** — Check for `Package.swift` or `.swift` files in root. Return high confidence Swift detection. | Status: done
- [x] **Detect PHP via composer.json** — Check if `composer.json` exists. Return high confidence PHP detection. | Status: done
- [ ] **Detect C# via .csproj/.sln files** — Check for `*.csproj`, `*.sln`, or `.cs` files. Return high confidence C# detection. | Status: not_done
- [x] **Handle polyglot projects** — When multiple languages are detected, record all of them in `languages` array and set `language` to the one with the strongest signal. | Status: done
- [ ] **Handle unknown language** — When no recognized config files exist, return `{ value: 'Unknown', confidence: 'low', source: 'no config files' }`. | Status: not_done
- [x] **Create language detection module** — Create `src/detect/language.ts` that exports a function accepting a project path and returning the primary `DetectedItem<string>` and the full `DetectedItem<string>[]` array. | Status: done

### Framework Detection

- [x] **Detect Node.js/TS frameworks from package.json** — Read `dependencies` and `devDependencies` from `package.json`. Map known dependency names to frameworks: `next` -> Next.js, `react` (without `next`) -> React, `@angular/core` -> Angular, `vue` -> Vue.js, `svelte`/`@sveltejs/kit` -> Svelte/SvelteKit, `express` -> Express.js, `fastify` -> Fastify, `koa` -> Koa, `hono` -> Hono, `@nestjs/core` -> NestJS, `nuxt` -> Nuxt, `astro` -> Astro, `remix`/`@remix-run/react` -> Remix, `gatsby` -> Gatsby, `electron` -> Electron. | Status: done
- [x] **Detect Python frameworks** — Read `pyproject.toml`, `requirements.txt`, or `setup.py` for framework dependencies: `django` -> Django, `flask` -> Flask, `fastapi` -> FastAPI, `starlette` -> Starlette. | Status: done
- [x] **Detect Ruby frameworks** — Read `Gemfile` for `rails` -> Ruby on Rails, `sinatra` -> Sinatra. | Status: done
- [x] **Detect Go frameworks** — Read `go.mod` for `github.com/gin-gonic/gin` -> Gin, `github.com/gofiber/fiber` -> Fiber, `github.com/labstack/echo` -> Echo. | Status: done
- [x] **Detect Rust frameworks** — Read `Cargo.toml` for `actix-web` -> Actix Web, `axum` -> Axum, `rocket` -> Rocket, `tauri` -> Tauri. | Status: done
- [x] **Create framework detection module** — Create `src/detect/framework.ts` exporting a function that returns `DetectedItem<string>[]`. | Status: done

### Test Framework Detection

- [x] **Detect Node.js test frameworks** — Check `package.json` devDependencies and config files for: `vitest`/`vitest.config.ts` -> Vitest, `jest`/`jest.config.js` -> Jest, `mocha`/`.mocharc.yml` -> Mocha, `@playwright/test` -> Playwright, `cypress`/`cypress.config.ts` -> Cypress, `ava` -> AVA, `tap` -> tap. | Status: done
- [x] **Detect Python test frameworks** — Check for `pytest` in dependencies or `conftest.py` -> pytest. Check for `unittest` imports -> unittest (medium confidence). | Status: done
- [ ] **Detect Go test framework** — Check for `*_test.go` files -> built-in testing package. | Status: not_done
- [ ] **Detect Rust test framework** — Check for `tests/` directory or `#[test]` in source files -> built-in test modules. | Status: not_done
- [x] **Create test framework detection module** — Create `src/detect/test-framework.ts` exporting a function that returns `DetectedItem<string>[]`. | Status: done

### Build Tool Detection

- [x] **Detect build tools** — Check for indicator files and config: `vite.config.ts`/`vite.config.js` -> Vite, `webpack.config.js`/`webpack.config.ts` -> webpack, `esbuild` in package.json scripts -> esbuild (medium), `rollup.config.js` -> Rollup, `turbo.json` -> Turborepo, `tsconfig.json` with `outDir` + `tsc` in build script -> tsc, `next.config.js`/`next.config.ts` -> Next.js bundler, `Makefile` -> Make (medium), `Dockerfile` -> Docker (medium). | Status: done
- [x] **Create build tool detection module** — Create `src/detect/build-tool.ts` exporting a function that returns `DetectedItem<string>[]`. | Status: done

### Linting and Formatting Detection

- [x] **Detect linting/formatting tools** — Check for config files and dependencies: `.eslintrc.*`/`eslint.config.*`/`eslint` in devDeps -> ESLint, `.prettierrc.*`/`prettier` in devDeps -> Prettier, `biome.json`/`@biomejs/biome` -> Biome, `oxlint`/`.oxlintrc.json` -> oxlint, `.editorconfig` -> EditorConfig, `dprint.json` -> dprint, `.stylintrc` -> Stylelint, `ruff` in pyproject.toml -> Ruff, `.rubocop.yml` -> RuboCop, `golangci-lint` in Makefile/`.golangci.yml` -> golangci-lint, `clippy` in Cargo.toml/CI -> Clippy (medium). | Status: done
- [x] **Create linter detection module** — Create `src/detect/linter.ts` exporting a function that returns `DetectedItem<string>[]`. | Status: done

### Package Manager Detection

- [x] **Detect package manager from lockfiles** — Check for lockfiles in priority order: `pnpm-lock.yaml` -> pnpm, `yarn.lock` -> Yarn, `bun.lockb`/`bun.lock` -> Bun, `package-lock.json` -> npm. Fallback: `package.json` exists with no lockfile -> npm (low confidence). | Status: done
- [x] **Create package manager detection module** — Create `src/detect/package-manager.ts` exporting a function that returns `DetectedItem<string> | null`. | Status: done

### Module System Detection

- [x] **Detect module system** — Check `"type"` field in `package.json` (`"module"` -> ESM, `"commonjs"` -> CommonJS). Check `"module"` field in `tsconfig.json` (`"esnext"`/`"nodenext"` -> ESM, `"commonjs"` -> CommonJS). Fallback: no explicit type -> CommonJS (low confidence). | Status: done
- [x] **Create module system detection module** — Create `src/detect/module-system.ts` exporting a function that returns `DetectedItem<string> | null`. | Status: done

### Monorepo Detection

- [x] **Detect monorepo tools** — Check for: `"workspaces"` in package.json -> npm/Yarn workspaces, `pnpm-workspace.yaml` -> pnpm workspaces, `turbo.json` -> Turborepo, `nx.json` -> Nx, `lerna.json` -> Lerna. | Status: done
- [x] **Enumerate workspace packages** — When a monorepo is detected, read the workspaces configuration and resolve glob patterns to actual package directories. Return the list of package paths. | Status: done
- [x] **Create monorepo detection module** — Create `src/detect/monorepo.ts` exporting a function that returns `{ tool: DetectedItem<string>, packages: string[] } | null`. | Status: done

### Git Configuration Detection

- [x] **Detect git initialization** — Check if `.git/` directory exists. | Status: done
- [x] **Detect remote URL and hosting platform** — Read `.git/config` for `[remote "origin"]` URL. Determine host: GitHub, GitLab, Bitbucket, or other. | Status: done
- [ ] **Detect commit message convention** — Analyze the last 20 commit messages for patterns: `feat:`, `fix:`, `chore:` (conventional commits), `[TAG]` prefixes, or freeform. Return with medium confidence. | Status: not_done
- [x] **Detect GitHub project indicators** — Check for `.github/` directory existence. | Status: done
- [x] **Detect GitLab project indicators** — Check for `.gitlab-ci.yml` existence. | Status: done
- [x] **Detect Husky and lint-staged** — Check for `.husky/` directory and `lint-staged` in `package.json`. | Status: done
- [x] **Create git detection module** — Create `src/detect/git.ts` exporting a function that returns the git info shape from `ProjectInfo.git`. | Status: done

### Directory Structure Detection

- [x] **Detect common directories** — Check for existence of: `src/`, `lib/`, `app/`, `tests/`/`test/`/`__tests__`/`src/__tests__/`, `docs/`, `scripts/`, `config/`/`.config/`, `public/`/`static/`, `pages/`, `components/`/`src/components/`. Map to the `directories` field in `ProjectInfo`. | Status: done
- [x] **Create directory structure detection module** — Create `src/detect/directories.ts` exporting a function that returns the directories shape from `ProjectInfo.directories`. | Status: done

### Existing AI File Detection

- [x] **Detect existing AI instruction files** — Check for the existence of all supported output files: `CLAUDE.md`, `.cursorrules`, `AGENTS.md`, `.github/copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, `.clinerules`, `.mcp.json`. For each found file, record format, absolute path, and file size. | Status: done
- [x] **Create existing file detection module** — Create `src/detect/existing-files.ts` exporting a function that returns `ExistingAIFile[]`. | Status: done

### Detection Orchestrator

- [x] **Create detection entry point** — Create `src/detect/index.ts` that runs all detector modules and assembles the full `ProjectInfo` object. Also extract `name` from `package.json`/`Cargo.toml`/`go.mod` and `description` from `package.json`. Include `nodeVersion` from `package.json` `engines` field. | Status: done
- [x] **Export detect() API function** — Export `detect(projectPath: string): Promise<ProjectInfo>` from `src/detect/index.ts` and re-export from `src/index.ts`. | Status: done

---

## Phase 3: Template Engine

- [x] **Implement variable interpolation** — In `src/templates/engine.ts`, implement `{{variable.path}}` replacement. Resolve dot-separated paths from the context object. Replace missing/undefined variables with empty string (no error). | Status: done
- [x] **Implement conditional blocks** — Implement `{{#if condition}}...{{/if}}` blocks. Evaluate truthiness: non-null, non-empty-string, non-empty-array values are truthy. Null, undefined, empty string, and empty array are falsy. | Status: done
- [x] **Implement else blocks** — Implement `{{#if condition}}...{{else}}...{{/if}}` support for conditional rendering with an alternative branch. | Status: done
- [x] **Implement unless blocks** — Implement `{{#unless condition}}...{{/unless}}` as the inverse of `{{#if}}`. | Status: done
- [x] **Implement iteration blocks** — Implement `{{#each array}}...{{/each}}` for iterating over arrays. Support `{{this}}` for the current element and `{{@index}}` for the zero-based index. Handle empty arrays gracefully (render nothing). | Status: done
- [x] **Implement equality helper** — Implement `{{#if (eq value1 "literal")}}` for comparing a context value against a string literal. Used for framework-specific conditional sections. | Status: done
- [x] **Implement nested conditionals** — Ensure conditionals can be nested arbitrarily (e.g., `{{#if project.framework}}{{#if (eq project.framework "Next.js")}}...{{/if}}{{/if}}`). | Status: done
- [ ] **Implement template inheritance with base directive** — Implement `{{> base}}` directive that includes the built-in template for the current format, allowing custom templates to extend the default. | Status: not_done
- [ ] **Handle malformed templates gracefully** — Ensure unclosed blocks, invalid syntax, and other template errors produce meaningful error messages rather than crashes. | Status: not_done
- [x] **Create template engine module** — Create `src/templates/engine.ts` exporting a `render(template: string, context: object): string` function. Keep the engine under 200 lines as specified. | Status: done

---

## Phase 4: Built-in Templates

- [x] **Create CLAUDE.md template** — Create `src/templates/claude.ts` exporting a template string constant following the spec's structure: 1) Project Overview, 2) Workflow, 3) Coding Conventions, 4) File Structure, 5) Testing, 6) Dependencies, 7) Rules. Target 1,500-3,000 tokens. Include conditional sections for framework-specific content, monorepo context, testing info, and team workflow. | Status: done
- [x] **Create .cursorrules template** — Create `src/templates/cursor.ts` with a concise template: 1) Role statement, 2) Tech stack, 3) Code style, 4) Rules. Target 800-1,500 tokens. | Status: done
- [x] **Create AGENTS.md template** — Create `src/templates/agents.ts` emphasizing scope boundaries: 1) Scope, 2) Coding standards, 3) Testing requirements, 4) Boundaries. Include safety-focused content for autonomous execution. | Status: done
- [x] **Create copilot-instructions.md template** — Create `src/templates/copilot.ts` with concise content: 1) Language and framework, 2) Code style preferences, 3) Response format. Target 500-1,000 tokens. Must be placed in `.github/` directory. | Status: done
- [x] **Create GEMINI.md template** — Create `src/templates/gemini.ts` with: 1) Project context, 2) Coding conventions, 3) Instructions. Follow Gemini's markdown consumption patterns. | Status: done
- [x] **Create .windsurfrules template** — Create `src/templates/windsurf.ts` with: 1) Project context, 2) Rules. Direct and concise format. | Status: done
- [x] **Create .clinerules template** — Create `src/templates/cline.ts` with: 1) Project overview, 2) Coding rules, 3) Workflow. Match Cline's instruction consumption patterns. | Status: done
- [x] **Create .mcp.json template** — Create `src/templates/mcp.ts` with a JSON template for MCP server configuration. Include placeholder entries for common MCP servers (filesystem, git, database). Structurally different from markdown templates. | Status: done
- [x] **Create template registry** — Create `src/templates/index.ts` that exports a function to retrieve templates by format ID. Supports built-in templates, custom template directory override (`--template-dir`), and inline template string override. Falls back from custom to built-in. | Status: done
- [ ] **Implement custom template directory loading** — In the template registry, support loading templates from a user-specified directory. Files named `claude.md.tmpl`, `cursor.md.tmpl`, etc. override built-in templates. Missing files fall back to built-in. | Status: not_done

---

## Phase 5: Template Context and Generation

- [x] **Implement template context builder** — Create `src/generate/context.ts` that merges three sources into a single template rendering context: 1) `QuestionnaireAnswers`, 2) `ProjectInfo` (from detection), 3) computed values. | Status: done
- [x] **Implement computed context values** — Compute derived values for the template context: `hasTests` (testing.framework is not null), `isMonorepo` (monorepo is not null), `isTypeScript` (language is TypeScript), `primaryFrameworkDescription` (human-readable string like "a Next.js application"), `languageSpecificPatterns` (array of patterns for the detected language). | Status: done
- [x] **Implement generate() function** — Create `src/generate/index.ts` with `generate(answers, formats, options)`. For each selected format: load the template, build the context, render the template, compute token count, determine output path and filename, check for existing file. Return `GeneratedFile[]` without writing to disk. | Status: done
- [x] **Implement output path resolution** — Map each format to its correct output path: `CLAUDE.md` at root, `.cursorrules` at root, `AGENTS.md` at root, `copilot-instructions.md` in `.github/`, `GEMINI.md` at root, `.windsurfrules` at root, `.clinerules` at root, `.mcp.json` at root. | Status: done
- [x] **Implement file writer** — Create `src/generate/writer.ts` with a function that writes `GeneratedFile[]` to disk with conflict handling: skip if exists (default), overwrite if `--force`, append if `--merge` (with horizontal rule separator and generator comment), prompt if interactive, skip with warning if non-interactive. Create `.github/` directory if needed for `copilot-instructions.md`. Write UTF-8 with trailing newline. | Status: done
- [ ] **Implement merge (append) mode** — When `--merge` is set and a file exists, append the generated content separated by a horizontal rule and a comment explaining the appended content was generated by `ai-env-init`. | Status: not_done
- [ ] **Implement interactive conflict resolution** — When a file exists in interactive mode, prompt the developer with options: "Overwrite", "Skip", "Append", "Show diff". The diff option displays generated content alongside existing content. | Status: not_done

---

## Phase 6: Interactive Questionnaire

- [ ] **Define question data structures** — Create `src/questionnaire/questions.ts` with all question definitions organized by section (project basics, coding conventions, AI behavior, testing, safety, team context, output format selection). Each question has: id, prompt text, type (text/select/multi-select/confirm), options (for select/multi-select), default value source, and validation rules. | Status: not_done
- [x] **Implement default value computation** — Create `src/questionnaire/defaults.ts` that computes questionnaire default values from `ProjectInfo`. Map detected language to language-appropriate defaults (e.g., camelCase for JS/TS, snake_case for Python). Map detected framework to framework-appropriate error handling defaults. Map detected test framework to test command defaults. | Status: done
- [ ] **Implement answer validation** — Create `src/questionnaire/validation.ts` with validation rules: project name must not be empty, format list must contain at least one valid format, protected paths must be valid path patterns. Return clear error messages for invalid answers. | Status: not_done
- [ ] **Implement questionnaire runner** — Create `src/questionnaire/index.ts` that runs the interactive questionnaire using `@inquirer/prompts`. Import `@inquirer/prompts` lazily (only in interactive mode) to minimize startup time for non-interactive invocations. Present questions section by section, using detected defaults. Skip questions that have pre-filled answers from config file or API. | Status: not_done
- [ ] **Implement project basics questions** — Implement Section 7.1: project name, description, primary language (select), framework (select with language-dependent options), additional libraries/tools (freeform text). | Status: not_done
- [ ] **Implement coding conventions questions** — Implement Section 7.2: naming convention (select), component/class naming (select), import ordering (select), error handling approach (select), comment style (select), preferred patterns (multi-select, shown only for applicable languages). | Status: not_done
- [ ] **Implement AI behavior questions** — Implement Section 7.3: response verbosity (select), code modification approach (select), when uncertain (select), autonomous actions (multi-select). | Status: not_done
- [ ] **Implement testing questions** — Implement Section 7.4: test framework (select, language-dependent), test command (text, pre-filled from package.json scripts.test), testing expectations (multi-select). | Status: not_done
- [ ] **Implement safety questions** — Implement Section 7.5: files/directories to not modify (freeform, comma-separated), topics to avoid (freeform), security constraints (multi-select). | Status: not_done
- [ ] **Implement team context questions** — Implement Section 7.6: team size (select), code review process (select), commit message convention (select), branch naming convention (text). | Status: not_done
- [ ] **Implement output format selection questions** — Implement Section 7.7: which AI config files to generate (multi-select, all checked by default except mcp), MCP server config confirmation (shown only if mcp is selected). | Status: not_done
- [ ] **Implement adaptive question flow** — Skip questions that are irrelevant based on context: skip test framework questions if no test framework is detected (but allow manual specification), skip framework-specific options when no framework is selected, skip monorepo questions when no monorepo is detected. | Status: not_done

---

## Phase 7: Core Init Pipeline

- [x] **Implement init() function** — Create `src/init.ts` with the `init(options: InitOptions): Promise<InitResult>` function. Orchestrate the full pipeline: 1) detect project, 2) run questionnaire (or use defaults/config), 3) select formats, 4) render templates, 5) handle file conflicts, 6) write files, 7) validate (optional), 8) report. Return `InitResult` with detection, answers, files, written, skipped, and validation results. | Status: done
- [x] **Implement answer precedence resolution** — Implement the answer resolution order: 1) static defaults, 2) detected project info, 3) config file (`--config`), 4) CLI flags (`--format`, etc.), 5) interactive questionnaire answers. Later sources override earlier. | Status: done
- [ ] **Implement createInitializer() factory** — Create the factory function in `src/index.ts` that returns an `Initializer` object with pre-configured formats, templates, and defaults. The returned object has `init()`, `detect()`, and `generate()` methods. | Status: not_done
- [x] **Wire up public API exports** — Update `src/index.ts` to export: `init`, `detect`, `generate`, `createInitializer`, and all type definitions from `src/types.ts`. | Status: done

---

## Phase 8: Validation Integration

- [ ] **Implement ai-rules-lint integration** — Create `src/validate/index.ts` that attempts to import `ai-rules-lint` dynamically. If available, run its `lint` function against each generated markdown instruction file. Return `ValidationResult[]`. If not available and `validate` option is true (default), silently skip. If `--validate` flag is explicitly set and `ai-rules-lint` is not installed, exit with an error. | Status: not_done
- [ ] **Include validation results in output report** — Add validation pass/fail, error count, warning count, and messages to the CLI output and `InitResult`. | Status: not_done

---

## Phase 9: CLI Implementation

- [ ] **Implement CLI argument parsing** — Create `src/cli.ts` using `node:util.parseArgs` (no external CLI framework). Parse all flags: `--format`, `--project-path`, `--yes`/`-y`, `--force`/`-f`, `--merge`, `--config`, `--template-dir`, `--no-validate`, `--validate`, `--quiet`/`-q`, `--json`, `--version`, `--help`, `--detect-only`. | Status: not_done
- [ ] **Implement --help flag** — Print usage information listing all commands and flags with descriptions, matching the format shown in the spec (Section 12). | Status: not_done
- [ ] **Implement --version flag** — Print the package version from `package.json` and exit. | Status: not_done
- [ ] **Implement --detect-only flag** — Run project detection and print results in human-readable format (or JSON if `--json` is set), then exit without generating any files. Exit code 0. | Status: not_done
- [ ] **Implement --yes non-interactive mode** — Accept all detected defaults without prompting. Skip the interactive questionnaire entirely. | Status: not_done
- [ ] **Implement --force flag** — Overwrite existing files without prompting. | Status: not_done
- [ ] **Implement --merge flag** — Append to existing files instead of overwriting. | Status: not_done
- [ ] **Implement --config flag** — Load partial `QuestionnaireAnswers` from a JSON file. Merge with detected defaults. Skip pre-answered questions in the questionnaire. | Status: not_done
- [ ] **Implement --format flag** — Parse comma-separated list of format IDs. Validate that each format is a recognized `FileFormat`. Support the special value `all`. Default to all formats except `mcp`. | Status: not_done
- [ ] **Implement --project-path flag** — Set the project directory to initialize. Default to `process.cwd()`. Validate that the path exists and is a directory. | Status: not_done
- [ ] **Implement --template-dir flag** — Set the custom template directory. Validate that the path exists. Pass to template registry. | Status: not_done
- [ ] **Implement --json output mode** — Output all results (detection, generation report) as JSON instead of human-readable text. | Status: not_done
- [ ] **Implement --quiet flag** — Suppress all output except errors. | Status: not_done
- [ ] **Implement --no-validate and --validate flags** — `--no-validate` skips post-generation validation. `--validate` forces validation and errors if `ai-rules-lint` is not installed. | Status: not_done
- [ ] **Implement human-readable output formatting** — Format CLI output as shown in the spec: detection summary with source annotations, generation report with token counts and created/skipped status, validation results, and final suggestion to run `ai-rules-lint`. | Status: not_done
- [ ] **Implement exit codes** — Return exit code 0 for success, 1 for partial failure (some files failed), 2 for configuration error (invalid flags, bad config file, invalid project path), 3 for user cancellation (Ctrl+C during questionnaire). | Status: not_done
- [ ] **Implement environment variable support** — Check environment variables as fallbacks for CLI flags: `AI_ENV_INIT_FORMAT`, `AI_ENV_INIT_PROJECT_PATH`, `AI_ENV_INIT_CONFIG`, `AI_ENV_INIT_TEMPLATE_DIR`, `AI_ENV_INIT_YES`, `AI_ENV_INIT_FORCE`. | Status: not_done
- [ ] **Add shebang line to cli.ts** — Add `#!/usr/bin/env node` to the top of `src/cli.ts` so the compiled output can be executed directly as a CLI binary. | Status: not_done

---

## Phase 10: Configuration File Support

- [ ] **Implement config file auto-discovery** — Search for config files in the project directory in order: 1) `ai-env-init.json`, 2) `.ai-env-init.json`, 3) `"ai-env-init"` key in `package.json`. The `--config` flag overrides auto-discovery. | Status: not_done
- [ ] **Implement config file parsing** — Parse the JSON config file. Validate structure (must be valid JSON, must match expected schema). Support the full config file format: `formats`, `templateDir`, `validate`, `defaults` (partial `QuestionnaireAnswers`). | Status: not_done
- [ ] **Implement config file merge with detection** — Merge config file answers with detection defaults and static defaults following the precedence order. Config file values override detection defaults. | Status: not_done
- [ ] **Handle invalid config files** — Produce clear error messages for: invalid JSON, missing file at `--config` path, config referencing non-existent template directory. Exit with code 2. | Status: not_done

---

## Phase 11: Test Fixtures

- [ ] **Create TypeScript + React fixture** — Create `src/__tests__/fixtures/typescript-react/` with `package.json` (React, TypeScript, Vitest, ESLint, Prettier in deps), `tsconfig.json`, and `src/` directory. | Status: not_done
- [ ] **Create Python + Django fixture** — Create `src/__tests__/fixtures/python-django/` with `pyproject.toml` (Django, pytest deps), and `app/` directory. | Status: not_done
- [ ] **Create Go project fixture** — Create `src/__tests__/fixtures/go-project/` with `go.mod`. | Status: not_done
- [ ] **Create monorepo fixture** — Create `src/__tests__/fixtures/monorepo/` with `package.json` (workspaces field), `turbo.json`, and `packages/` with at least two sub-package directories. | Status: not_done
- [ ] **Create empty project fixture** — Create `src/__tests__/fixtures/empty-project/` as an empty directory (with a `.gitkeep` or similar to keep it in VCS). | Status: not_done
- [ ] **Create config file fixtures** — Create `src/__tests__/fixtures/configs/valid-config.json` with a valid config and `invalid-config.json` with invalid JSON. | Status: not_done

---

## Phase 12: Unit Tests

### Detection Tests

- [x] **Test language detection** — Create `src/__tests__/detect/language.test.ts`. Test each language detection case: TypeScript via tsconfig, TypeScript via package.json, JavaScript, Rust, Go, Python, Ruby, Java/Kotlin, Swift, PHP, C#, unknown. Test polyglot detection (e.g., both TS and Python indicators). Use temp directories with fixture files. | Status: done
- [x] **Test framework detection** — Create `src/__tests__/detect/framework.test.ts`. Test Node.js framework detection for each framework (Next.js, React, Angular, etc.). Test Python frameworks. Test Ruby frameworks. Test Go frameworks. Test Rust frameworks. Test when no framework is found. | Status: done
- [x] **Test test framework detection** — Create `src/__tests__/detect/test-framework.test.ts`. Test each Node.js test framework. Test Python test frameworks. Test Go and Rust test detection. Test when no test framework is found. | Status: done
- [x] **Test build tool detection** — Create `src/__tests__/detect/build-tool.test.ts`. Test each build tool detection signal. Test medium-confidence detections (esbuild, Make, Docker). Test when no build tool is found. | Status: done
- [x] **Test linter detection** — Create `src/__tests__/detect/linter.test.ts`. Test each linting/formatting tool detection. Test multiple linters detected simultaneously. Test when no linter is found. | Status: done
- [x] **Test package manager detection** — Create `src/__tests__/detect/package-manager.test.ts`. Test each lockfile-based detection. Test fallback to npm (low confidence). Test when no package.json exists. | Status: done
- [x] **Test monorepo detection** — Create `src/__tests__/detect/monorepo.test.ts`. Test each monorepo tool detection. Test workspace package enumeration. Test when not a monorepo. | Status: done
- [x] **Test git detection** — Create `src/__tests__/detect/git.test.ts`. Test git initialization detection. Test remote URL parsing and host identification. Test commit convention detection. Test Husky/lint-staged detection. Test when no .git exists. | Status: done
- [x] **Test directory structure detection** — Create `src/__tests__/detect/directories.test.ts`. Test detection of each directory pattern (src, lib, app, tests, docs, scripts, config, public, pages, components). Test when no standard directories exist. | Status: done

### Questionnaire Tests

- [x] **Test default value computation** — Create `src/__tests__/questionnaire/defaults.test.ts`. Test that detected TypeScript projects get camelCase default. Test that detected Python projects get snake_case default. Test that detected test frameworks map to correct test commands. Test defaults when nothing is detected. | Status: done
- [ ] **Test answer validation** — Create `src/__tests__/questionnaire/validation.test.ts`. Test project name not empty validation. Test format list validation (at least one valid format). Test invalid format names are rejected. Test protected paths validation. | Status: not_done

### Template Engine Tests

- [x] **Test variable interpolation** — Create `src/__tests__/templates/engine.test.ts`. Test simple variable replacement. Test nested property paths (e.g., `project.name`). Test missing/undefined variables produce empty string. Test null values. Test array values. | Status: done
- [x] **Test conditional blocks** — Test `{{#if}}` with truthy values (non-null, non-empty string, non-empty array). Test with falsy values (null, undefined, empty string, empty array). Test `{{else}}` branch rendering. Test `{{#unless}}` blocks. | Status: done
- [x] **Test iteration blocks** — Test `{{#each}}` with arrays of strings. Test `{{this}}` and `{{@index}}` references. Test with empty arrays (renders nothing). Test with single-element arrays. | Status: done
- [x] **Test equality helper** — Test `{{#if (eq value "literal")}}` with matching and non-matching values. | Status: done
- [x] **Test nested conditionals** — Test multiple levels of nesting. Test nested conditionals with iteration. | Status: done
- [ ] **Test malformed templates** — Test unclosed `{{#if}}` blocks. Test unclosed `{{#each}}` blocks. Test invalid syntax. Verify meaningful error messages. | Status: not_done
- [ ] **Test template inheritance** — Test `{{> base}}` directive includes built-in template content. Test custom template that extends base with additional sections. | Status: not_done

### Template Rendering Tests

- [x] **Test CLAUDE.md rendering** — Create `src/__tests__/templates/claude.test.ts`. Render with minimal answers (all defaults). Render with maximal answers (everything specified). Render with different languages/frameworks to verify conditional branches. Assert output matches expected structure and content. | Status: done
- [x] **Test .cursorrules rendering** — Create `src/__tests__/templates/cursor.test.ts`. Test rendering with different project configurations. Verify output is concise (within token target). | Status: done
- [x] **Test AGENTS.md rendering** — Create `src/__tests__/templates/agents.test.ts`. Verify safety-focused content is present. Test scope constraints rendering. | Status: done
- [x] **Test copilot-instructions.md rendering** — Create `src/__tests__/templates/copilot.test.ts`. Verify concise output within token target. | Status: done
- [x] **Test .mcp.json rendering** — Create `src/__tests__/templates/mcp.test.ts`. Verify valid JSON output. Test with and without MCP server configuration. | Status: done

### Generation Tests

- [x] **Test template context builder** — Create `src/__tests__/generate/context.test.ts`. Test merge of answers, detection, and computed values. Test computed value derivation (hasTests, isMonorepo, isTypeScript, etc.). Test with missing/null values. | Status: done
- [x] **Test file writer** — Create `src/__tests__/generate/writer.test.ts`. Test writing new files. Test skip-existing behavior (default). Test force-overwrite behavior. Test merge/append behavior (content separator, generator comment). Test `.github/` directory creation for copilot-instructions.md. Test error on read-only directories. Test UTF-8 encoding and trailing newline. | Status: done

### Config File Tests

- [ ] **Test config file parsing** — Test parsing valid JSON config files. Test invalid JSON produces error. Test missing fields are handled gracefully (partial config is valid). | Status: not_done
- [ ] **Test config file discovery** — Test auto-discovery order: `ai-env-init.json`, `.ai-env-init.json`, `package.json` key. Test that `--config` flag overrides auto-discovery. | Status: not_done
- [ ] **Test config file merge** — Test that config file values override detection defaults. Test that config file values are overridden by CLI flags. | Status: not_done

---

## Phase 13: Integration Tests

- [x] **Integration test: TypeScript + React project** — Create `src/__tests__/init.test.ts`. Create temp directory with TS/React fixture files. Run `init()` in non-interactive mode. Assert all generated files exist at correct paths. Assert content contains correct project info, framework mentions, and format conventions. | Status: done
- [ ] **Integration test: Python + Django project** — Create temp directory with Python/Django fixture. Run `init()` in non-interactive mode. Assert generated files reference Python conventions, Django patterns, and pytest. | Status: not_done
- [ ] **Integration test: Go project** — Create temp directory with Go fixture. Run `init()` in non-interactive mode. Assert generated files reference Go conventions and idiomatic Go patterns. | Status: not_done
- [ ] **Integration test: Monorepo project** — Create temp directory with monorepo fixture. Run `init()` in non-interactive mode. Assert detection correctly identifies monorepo structure and workspace packages. Assert generated files mention monorepo context. | Status: not_done
- [x] **Integration test: Empty project** — Create temp directory with no config files. Run `init()` in non-interactive mode. Assert detection returns nulls/defaults. Assert generated files use generic content. Assert no errors. | Status: done
- [x] **Integration test: Existing files with --force** — Create temp project with an existing `CLAUDE.md`. Run `init()` with `force: true`. Assert the file is overwritten with new content. | Status: done
- [x] **Integration test: Existing files without --force** — Create temp project with an existing `CLAUDE.md`. Run `init()` without force. Assert the file is skipped and appears in `result.skipped`. | Status: done
- [ ] **Integration test: Config file mode** — Create temp project and a config file. Run `init()` with config. Assert answers from the config file appear in generated content. | Status: not_done
- [x] **Integration test: Selective format generation** — Run `init()` with `formats: ['claude', 'cursor']`. Assert only CLAUDE.md and .cursorrules are generated. Assert other format files do not exist. | Status: done

---

## Phase 14: CLI End-to-End Tests

- [ ] **CLI test: Successful generation** — Create `src/__tests__/cli.test.ts`. Run the CLI binary against a test fixture project. Assert exit code 0. Assert generated files exist at expected paths. | Status: not_done
- [ ] **CLI test: Invalid flags** — Run CLI with invalid flags. Assert exit code 2. | Status: not_done
- [ ] **CLI test: --detect-only** — Run CLI with `--detect-only`. Assert exit code 0. Assert no files are generated. Assert stdout contains detection results. | Status: not_done
- [ ] **CLI test: --detect-only --json** — Run CLI with `--detect-only --json`. Assert stdout is valid JSON matching `ProjectInfo` structure. | Status: not_done
- [ ] **CLI test: --version** — Run CLI with `--version`. Assert output contains version number from package.json. | Status: not_done
- [ ] **CLI test: --help** — Run CLI with `--help`. Assert output contains usage information and flag descriptions. | Status: not_done
- [ ] **CLI test: Human-readable output format** — Run CLI with default output. Assert output matches the expected format from the spec (detection summary, generation report with token counts). | Status: not_done
- [ ] **CLI test: --json output format** — Run CLI with `--json`. Assert entire output is valid JSON. | Status: not_done
- [ ] **CLI test: --quiet flag** — Run CLI with `--quiet`. Assert no output on stdout (only errors on stderr if any). | Status: not_done

---

## Phase 15: Edge Case Tests

- [ ] **Edge case: Non-existent project directory** — Test that `detect()` and `init()` produce a clear error when the project path does not exist. Assert exit code 2 from CLI. | Status: not_done
- [ ] **Edge case: No read permissions** — Test behavior when the project directory has no read permissions. Assert meaningful error message. | Status: not_done
- [ ] **Edge case: No write permissions** — Test behavior when the project directory has no write permissions for file writing. Assert meaningful error message and exit code 1. | Status: not_done
- [ ] **Edge case: Invalid JSON in package.json** — Test that detection handles malformed `package.json` gracefully (treats as no package.json rather than crashing). | Status: not_done
- [ ] **Edge case: package.json with no name/description** — Test that detection handles missing name/description fields (returns null). | Status: not_done
- [ ] **Edge case: Extremely long dependency lists** — Test that detection handles `package.json` with very large dependency objects without performance issues. | Status: not_done
- [ ] **Edge case: Template with undefined variables** — Test that undefined variables in templates produce empty strings, not errors. | Status: not_done
- [ ] **Edge case: Template with syntax errors** — Test that unclosed `{{#if}}` blocks produce meaningful error messages. | Status: not_done
- [ ] **Edge case: All formats including mcp** — Test generation of all eight formats simultaneously including `.mcp.json`. | Status: not_done
- [ ] **Edge case: Invalid format name** — Test that an invalid format name in `--format` flag or API produces a clear error. Assert exit code 2 from CLI. | Status: not_done
- [ ] **Edge case: Config referencing non-existent template directory** — Test that `--template-dir` pointing to a non-existent directory produces a clear error. | Status: not_done

---

## Phase 16: Documentation

- [ ] **Write README.md** — Create a comprehensive README with: package description, installation instructions (`npm install`, `npx`), quick start example, full CLI usage with all flags, API documentation (init, detect, generate, createInitializer), supported formats catalog, configuration file format, custom templates guide, integration examples (CI/CD, scaffolding tools, npm scripts), and link to SPEC.md for full details. | Status: not_done
- [ ] **Add JSDoc comments to all public API functions** — Document `init()`, `detect()`, `generate()`, `createInitializer()`, and all exported types with JSDoc comments including parameter descriptions, return type descriptions, and usage examples. | Status: not_done
- [ ] **Add inline code comments** — Add comments to non-obvious code sections: template engine regex patterns, detection heuristics, answer precedence logic, file conflict resolution. | Status: not_done

---

## Phase 17: Build, Lint, and CI Readiness

- [x] **Verify TypeScript compilation** — Run `npm run build` and ensure all source files compile without errors. Verify `dist/` output contains all expected `.js`, `.d.ts`, and `.js.map` files. | Status: done
- [x] **Verify ESLint passes** — Run `npm run lint` and fix any linting errors. | Status: done
- [x] **Verify all tests pass** — Run `npm run test` and ensure all unit, integration, and CLI tests pass. | Status: done
- [ ] **Verify CLI binary works end-to-end** — Run `npx . --detect-only` from the project directory. Run `npx . --yes --format claude` against a test project. Verify output and generated files. | Status: not_done
- [ ] **Verify package.json is complete** — Ensure `name`, `version`, `description`, `main`, `types`, `bin`, `files`, `scripts`, `engines`, `license`, `keywords`, and `publishConfig` are all correctly set. | Status: not_done

---

## Phase 18: Publishing Preparation

- [ ] **Bump version** — Set version to `0.1.0` (or appropriate version per the implementation roadmap phase). | Status: not_done
- [ ] **Final end-to-end smoke test** — Run `ai-env-init --yes` against a real TypeScript project and verify all generated files are correct and well-formed. Run `ai-env-init --detect-only --json` and verify JSON output. | Status: not_done
- [ ] **Publish to npm** — Follow the monorepo publishing workflow: merge PR, checkout master, pull, `npm publish`. | Status: not_done

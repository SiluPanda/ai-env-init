# ai-env-init

Bootstrap AI configuration files for every major coding tool from a single command.

[![npm version](https://img.shields.io/npm/v/ai-env-init.svg)](https://www.npmjs.com/package/ai-env-init)
[![license](https://img.shields.io/npm/l/ai-env-init.svg)](https://github.com/SiluPanda/ai-env-init/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/ai-env-init.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

`ai-env-init` detects your project's language, framework, test runner, build tools, linting setup, and monorepo structure, then generates a complete set of AI instruction files -- `CLAUDE.md`, `.cursorrules`, `AGENTS.md`, `copilot-instructions.md`, `GEMINI.md`, `.windsurfrules`, `.clinerules`, and `.mcp.json` -- populated with your project's context and coding conventions. It is the `npm init` of AI-assisted development: one command to configure every AI coding tool your team uses.

## Installation

```bash
npm install ai-env-init
```

## Quick Start

```typescript
import { init } from 'ai-env-init';

// Generate all default AI config files for the current project
const result = await init({
  projectPath: './my-project',
  formats: ['claude', 'cursor', 'copilot'],
});

console.log(`Written: ${result.written.length} files`);
console.log(`Skipped: ${result.skipped.length} files (already existed)`);
```

Non-interactive mode with all detected defaults:

```typescript
const result = await init({
  projectPath: './my-project',
  dryRun: true, // preview without writing
});

for (const file of result.files) {
  console.log(`${file.fileName} (${file.tokens} tokens)`);
}
```

## Features

- **Automatic project detection** -- Identifies language, framework, test runner, build tools, linters, package manager, module system, monorepo structure, git configuration, and directory layout from existing config files.
- **8 output formats** -- Generates instruction files for Claude Code, Cursor, Microsoft Copilot Coding Agent, GitHub Copilot, Gemini CLI, Windsurf, Cline, and MCP.
- **Template-based generation** -- Deterministic output using a built-in template engine with conditionals, iteration, and variable interpolation. No LLM calls, no API keys, runs offline in milliseconds.
- **Custom templates** -- Override any built-in template with your own. Distribute template packs for organizational standardization.
- **Conflict handling** -- Skips existing files by default, overwrites with `force`, or previews changes with `dryRun`.
- **Zero runtime dependencies** -- All detection, template rendering, and file generation use Node.js built-ins only.
- **Polyglot support** -- Detects and handles TypeScript, JavaScript, Python, Go, Rust, Ruby, Java, Swift, and PHP projects.

## Supported Formats

| Format ID | File Name | Placement | Tool |
|---|---|---|---|
| `claude` | `CLAUDE.md` | Project root | Anthropic Claude Code |
| `cursor` | `.cursorrules` | Project root | Cursor IDE |
| `agents` | `AGENTS.md` | Project root | Microsoft Copilot Coding Agent |
| `copilot` | `copilot-instructions.md` | `.github/` | GitHub Copilot |
| `gemini` | `GEMINI.md` | Project root | Google Gemini CLI |
| `windsurf` | `.windsurfrules` | Project root | Windsurf (Codeium) |
| `cline` | `.clinerules` | Project root | Cline (VS Code extension) |
| `mcp` | `.mcp.json` | Project root | MCP-compatible tools |

Default formats include all of the above except `mcp`. Request `mcp` explicitly when needed.

## API Reference

### `init(options?): Promise<InitResult>`

Full initialization pipeline: detect project characteristics, build default questionnaire answers, merge with provided overrides, generate files from templates, and write to disk.

```typescript
import { init } from 'ai-env-init';

const result = await init({
  projectPath: '/path/to/project',
  formats: ['claude', 'cursor', 'agents'],
  force: true,
  answers: {
    project: {
      name: 'my-app',
      description: 'A web application',
      language: 'TypeScript',
      framework: 'Next.js',
      additionalTools: ['Zod', 'tRPC'],
    },
    conventions: {
      namingConvention: 'camelCase',
      componentNaming: 'PascalCase',
      importOrdering: 'external-first',
      errorHandling: 'try-catch',
      commentStyle: 'jsdoc-public',
      preferredPatterns: ['Prefer const over let'],
    },
  },
});
```

**Parameters** (`InitOptions`):

| Property | Type | Default | Description |
|---|---|---|---|
| `projectPath` | `string` | `process.cwd()` | Project directory to initialize. |
| `formats` | `FileFormat[]` | All except `mcp` | Which AI config files to generate. |
| `force` | `boolean` | `false` | Overwrite existing files without prompting. |
| `dryRun` | `boolean` | `false` | Generate files in memory without writing to disk. |
| `answers` | `Partial<QuestionnaireAnswers>` | `undefined` | Pre-filled answers merged with detected defaults. |
| `templates` | `Partial<Record<FileFormat, string>>` | `undefined` | Custom template strings keyed by format ID. |
| `templateDir` | `string` | `undefined` | Directory containing custom template files. |
| `merge` | `boolean` | `false` | Append to existing files instead of overwriting. |
| `nonInteractive` | `boolean` | `false` | Accept all defaults without prompting. |
| `validate` | `boolean` | `false` | Validate generated files with `ai-rules-lint`. |
| `quiet` | `boolean` | `false` | Suppress stdout output. |

**Returns** (`InitResult`):

| Property | Type | Description |
|---|---|---|
| `detection` | `ProjectInfo` | Detected project characteristics. |
| `answers` | `QuestionnaireAnswers` | Final merged questionnaire answers. |
| `files` | `GeneratedFile[]` | All generated file objects. |
| `written` | `string[]` | Absolute paths of files written to disk. |
| `skipped` | `string[]` | Absolute paths of files skipped (already existed). |

---

### `detect(dir): Promise<ProjectInfo>`

Analyze a project directory and return detected characteristics. Read-only, non-destructive. Each detection includes a confidence level (`high`, `medium`, or `low`) and the source file that produced it.

```typescript
import { detect } from 'ai-env-init';

const info = await detect('/path/to/project');

console.log(info.language);       // { value: 'TypeScript', confidence: 'high', source: 'tsconfig.json' }
console.log(info.frameworks);     // [{ value: 'React', ... }, { value: 'Next.js', ... }]
console.log(info.testFrameworks); // [{ value: 'Vitest', confidence: 'high', source: 'package.json' }]
console.log(info.buildTools);     // [{ value: 'Vite', ... }]
console.log(info.linters);        // [{ value: 'ESLint', ... }, { value: 'Prettier', ... }]
console.log(info.packageManager); // { value: 'pnpm', confidence: 'high', source: 'pnpm-lock.yaml' }
console.log(info.moduleSystem);   // { value: 'ESM', confidence: 'high', source: 'package.json type field' }
console.log(info.monorepo);       // { tool: { value: 'npm/Yarn workspaces', ... }, packages: ['packages/a'] }
console.log(info.git);            // { initialized: true, host: 'github', hasHusky: true, ... }
console.log(info.directories);    // { source: 'src/', tests: 'src/__tests__/', docs: null, ... }
console.log(info.existingFiles);  // [{ format: 'claude', path: '/abs/CLAUDE.md', size: 2048 }]
```

**Parameters**:

| Parameter | Type | Description |
|---|---|---|
| `dir` | `string` | Absolute or relative path to the project directory. |

**Returns** (`ProjectInfo`):

| Property | Type | Description |
|---|---|---|
| `name` | `string \| null` | Project name from `package.json`, `Cargo.toml`, etc. |
| `description` | `string \| null` | Project description from `package.json`. |
| `language` | `DetectedItem<string> \| null` | Primary detected language. |
| `languages` | `DetectedItem<string>[]` | All detected languages (polyglot support). |
| `frameworks` | `DetectedItem<string>[]` | Detected frameworks (React, Next.js, Django, etc.). |
| `testFrameworks` | `DetectedItem<string>[]` | Detected test frameworks (Vitest, Jest, pytest, etc.). |
| `buildTools` | `DetectedItem<string>[]` | Detected build tools (Vite, webpack, tsc, etc.). |
| `linters` | `DetectedItem<string>[]` | Detected linters/formatters (ESLint, Prettier, etc.). |
| `packageManager` | `DetectedItem<string> \| null` | Detected package manager (npm, Yarn, pnpm, Bun). |
| `moduleSystem` | `DetectedItem<string> \| null` | Detected module system (ESM or CommonJS). |
| `monorepo` | `{ tool: DetectedItem<string>; packages: string[] } \| null` | Monorepo tool and workspace packages. |
| `git` | `object` | Git info: `initialized`, `remoteUrl`, `host`, `commitConvention`, `hasHusky`, `hasLintStaged`. |
| `directories` | `object` | Detected dirs: `source`, `tests`, `docs`, `scripts`, `config`, `staticAssets`. |
| `existingFiles` | `ExistingAIFile[]` | Existing AI instruction files found in the project. |
| `nodeVersion` | `string \| null` | Node.js engine requirement from `package.json` `engines` field. |

**Detection coverage**:

| Category | Detected Values |
|---|---|
| Languages | TypeScript, JavaScript, Python, Go, Rust, Ruby, Java, Swift, PHP |
| Frameworks | React, Next.js, Angular, Vue.js, Svelte, SvelteKit, Nuxt, Remix, Gatsby, Astro, Express.js, Fastify, Koa, Hono, NestJS, Electron, Django, Flask, FastAPI, Starlette, Ruby on Rails, Sinatra, Gin, Fiber, Echo, Actix Web, Axum, Rocket, Tauri |
| Test Frameworks | Vitest, Jest, Mocha, Playwright, Cypress, AVA, tap, pytest, go test |
| Build Tools | Vite, webpack, Rollup, tsc, esbuild, Turborepo, Next.js, Make, Docker |
| Linters | ESLint, Prettier, Biome, EditorConfig, dprint, RuboCop, golangci-lint, Ruff |
| Package Managers | npm, Yarn, pnpm, Bun |
| Monorepo Tools | npm/Yarn workspaces, pnpm workspaces, Turborepo, Nx, Lerna |

---

### `generate(answers, formats, options?, info?): Promise<GeneratedFile[]>`

Render templates for the specified formats using questionnaire answers and optional detection info. Returns generated file objects without writing to disk.

```typescript
import { generate } from 'ai-env-init';

const files = await generate(
  answers,
  ['claude', 'cursor', 'copilot'],
  { projectPath: '/path/to/project' },
  detectionInfo, // optional ProjectInfo from detect()
);

for (const file of files) {
  console.log(`${file.fileName}: ${file.tokens} tokens, overwrites: ${file.overwrites}`);
  console.log(file.content);
}
```

**Parameters**:

| Parameter | Type | Description |
|---|---|---|
| `answers` | `QuestionnaireAnswers` | Complete questionnaire answers. |
| `formats` | `FileFormat[]` | Formats to generate. |
| `options` | `GenerateOptions` | Optional: `projectPath`, `templates`, `templateDir`. |
| `info` | `ProjectInfo \| null` | Optional detection info for enriching template context. |

**Returns** (`GeneratedFile[]`):

| Property | Type | Description |
|---|---|---|
| `format` | `FileFormat` | The format of this generated file. |
| `fileName` | `string` | File name (e.g., `CLAUDE.md`, `.cursorrules`). |
| `path` | `string` | Absolute path where the file will be written. |
| `content` | `string` | The rendered file content. |
| `tokens` | `number` | Estimated token count (`Math.ceil(content.length / 4)`). |
| `overwrites` | `boolean` | Whether this file would overwrite an existing file. |

---

### `writeFiles(files, options?): WriteResult`

Write generated files to disk with conflict handling.

```typescript
import { generate, writeFiles } from 'ai-env-init';

const files = await generate(answers, ['claude', 'cursor']);

// Preview what would happen
const preview = writeFiles(files, { dryRun: true });
console.log('Would write:', preview.written);
console.log('Would skip:', preview.skipped);

// Write for real
const result = writeFiles(files, { force: true });
```

**Parameters**:

| Parameter | Type | Description |
|---|---|---|
| `files` | `GeneratedFile[]` | Files to write (from `generate()`). |
| `options.force` | `boolean` | Overwrite existing files. Default: `false`. |
| `options.dryRun` | `boolean` | Simulate without writing. Default: `false`. |

**Returns** (`WriteResult`):

| Property | Type | Description |
|---|---|---|
| `written` | `string[]` | Paths of files written (or that would be written in dry run). |
| `skipped` | `string[]` | Paths of files skipped due to existing files. |

---

### `buildDefaultAnswers(info): QuestionnaireAnswers`

Build a complete set of questionnaire answers from detection results. Uses language-appropriate defaults (e.g., `snake_case` for Python, `camelCase` for TypeScript).

```typescript
import { detect, buildDefaultAnswers } from 'ai-env-init';

const info = await detect('./my-project');
const defaults = buildDefaultAnswers(info);

console.log(defaults.project.language);           // 'TypeScript'
console.log(defaults.conventions.namingConvention); // 'camelCase'
console.log(defaults.testing.framework);           // 'Vitest'
console.log(defaults.testing.command);             // 'npm test'
```

**Parameters**:

| Parameter | Type | Description |
|---|---|---|
| `info` | `ProjectInfo` | Detection results from `detect()`. |

**Returns**: A complete `QuestionnaireAnswers` object with sensible defaults.

---

### `buildContext(answers, info?): Record<string, unknown>`

Build the template rendering context by merging questionnaire answers, detected project info, and computed values. Useful when rendering custom templates directly.

```typescript
import { buildContext, render } from 'ai-env-init';

const context = buildContext(answers, detectionInfo);
const output = render('# {{project.name}}\n{{primaryFrameworkDescription}}', context);
```

**Computed context values**:

| Key | Type | Description |
|---|---|---|
| `primaryFrameworkDescription` | `string` | E.g., `"a React application"` or `"a TypeScript project"`. |
| `hasPreferredPatterns` | `boolean` | Whether `conventions.preferredPatterns` is non-empty. |
| `hasTestExpectations` | `boolean` | Whether `testing.expectations` is non-empty. |
| `hasProtectedPaths` | `boolean` | Whether `safety.protectedPaths` is non-empty. |
| `hasSecurityConstraints` | `boolean` | Whether `safety.securityConstraints` is non-empty. |
| `hasTopicsToAvoid` | `boolean` | Whether `safety.topicsToAvoid` is non-empty. |
| `isTypeScript` | `boolean` | Whether the language is TypeScript. |
| `hasTests` | `boolean` | Whether a test framework is configured. |
| `isMonorepo` | `boolean` | Whether a monorepo was detected. |
| `protectedPathsList` | `string` | Protected paths as inline code, comma-separated. |
| `buildToolsList` | `string` | Detected build tools, comma-separated. |
| `lintersList` | `string` | Detected linters, comma-separated. |

---

### `render(template, context): string`

Lightweight template engine. Zero dependencies.

```typescript
import { render } from 'ai-env-init';

render('Hello {{name}}!', { name: 'world' });
// => 'Hello world!'

render('{{#if show}}visible{{else}}hidden{{/if}}', { show: true });
// => 'visible'

render('{{#each items}}- {{this}}\n{{/each}}', { items: ['a', 'b'] });
// => '- a\n- b\n'

render('{{#if (eq lang "TypeScript")}}TS{{/if}}', { lang: 'TypeScript' });
// => 'TS'
```

**Template syntax**:

| Syntax | Description |
|---|---|
| `{{variable}}` | Interpolate a value. Dot paths supported: `{{project.name}}`. |
| `{{#if condition}}...{{/if}}` | Conditional block. Falsy: `null`, `undefined`, `false`, `""`, `[]`. |
| `{{#if condition}}...{{else}}...{{/if}}` | Conditional with else branch. |
| `{{#unless condition}}...{{/unless}}` | Inverse conditional. |
| `{{#each array}}...{{/each}}` | Iterate over an array. Use `{{this}}` for the current element. |
| `{{@index}}` | Zero-based index inside `{{#each}}` blocks. |
| `{{#if (eq path "value")}}...{{/if}}` | Equality comparison against a string literal. |

Missing variables resolve to empty string. Arrays interpolated directly become comma-separated strings. Excessive blank lines (3+) are collapsed to a single blank line.

---

### `getTemplate(format, customTemplates?): string`

Retrieve the template string for a format. Custom templates override built-in templates.

```typescript
import { getTemplate } from 'ai-env-init';

const builtIn = getTemplate('claude');
const custom = getTemplate('claude', { claude: '# My custom {{project.name}}' });
```

---

### `getFormatMeta(format): FormatMeta`

Get metadata for a format: file name, subdirectory, and description.

```typescript
import { getFormatMeta } from 'ai-env-init';

const meta = getFormatMeta('copilot');
// { id: 'copilot', fileName: 'copilot-instructions.md', subDir: '.github', description: 'GitHub Copilot instructions' }
```

Throws `Error` if the format is unknown.

---

### Constants

#### `DEFAULT_FORMATS: FileFormat[]`

The default set of formats generated by `init()`: `['claude', 'cursor', 'agents', 'copilot', 'gemini', 'windsurf', 'cline']`. Does not include `mcp`.

#### `FORMAT_REGISTRY: FormatMeta[]`

Array of all 8 supported format metadata objects. Each entry has `id`, `fileName`, optional `subDir`, and `description`.

#### Template Constants

Each built-in template is exported as a named constant:

- `CLAUDE_TEMPLATE`
- `CURSOR_TEMPLATE`
- `AGENTS_TEMPLATE`
- `COPILOT_TEMPLATE`
- `GEMINI_TEMPLATE`
- `WINDSURF_TEMPLATE`
- `CLINE_TEMPLATE`
- `MCP_TEMPLATE`

## Configuration

### QuestionnaireAnswers

The `answers` object controls all generated content. It can be partially provided to `init()` to override detected defaults.

```typescript
interface QuestionnaireAnswers {
  project: {
    name: string;
    description: string;
    language: string;
    framework: string | null;
    additionalTools: string[];
  };
  conventions: {
    namingConvention: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case';
    componentNaming: 'PascalCase' | 'camelCase' | 'snake_case';
    importOrdering: 'external-first' | 'alphabetical' | 'grouped' | 'no-preference';
    errorHandling: 'try-catch' | 'result-types' | 'error-boundaries' | 'framework-default' | 'no-preference';
    commentStyle: 'jsdoc-public' | 'minimal' | 'comprehensive' | 'no-preference';
    preferredPatterns: string[];
  };
  aiBehavior: {
    verbosity: 'concise' | 'balanced' | 'detailed';
    modificationApproach: 'minimal' | 'refactor-freely' | 'ideal-solution';
    whenUncertain: 'ask' | 'best-judgment' | 'show-options';
    autonomousActions: string[];
  };
  testing: {
    framework: string | null;
    command: string | null;
    expectations: string[];
  };
  safety: {
    protectedPaths: string[];
    topicsToAvoid: string[];
    securityConstraints: string[];
  };
  team: {
    size: 'solo' | 'small' | 'medium' | 'large';
    reviewProcess: 'pull-requests' | 'pair-programming' | 'direct-commits' | 'no-formal';
    commitConvention: 'conventional' | 'scope-prefixed' | 'freeform' | 'no-convention';
    branchNaming: string | null;
  };
  formats: FileFormat[];
}
```

### Custom Templates

Override any built-in template by passing a template string keyed by format ID:

```typescript
await init({
  projectPath: './my-project',
  formats: ['claude'],
  templates: {
    claude: `# {{project.name}}

{{project.description}}

## Stack
- {{project.language}}
{{#if project.framework}}- {{project.framework}}{{/if}}

## Rules
{{#each safety.securityConstraints}}- {{this}}
{{/each}}
`,
  },
});
```

Templates have access to all `QuestionnaireAnswers` fields (flattened under their section keys) plus the computed context values listed in the `buildContext` reference above.

## Error Handling

- **`getFormatMeta(format)`** throws `Error` with message `"Unknown format: <format>"` when passed an unrecognized format string.
- **`detect(dir)`** resolves the path with `path.resolve()` and reads files synchronously. Returns `null` for properties it cannot detect rather than throwing.
- **`generate()`** checks whether each output file already exists and sets the `overwrites` flag on the returned `GeneratedFile` accordingly. It does not write to disk.
- **`writeFiles()`** creates parent directories automatically (e.g., `.github/` for `copilot-instructions.md`). In `dryRun` mode, no filesystem changes occur but the return value reflects what would happen.
- **`init()`** never throws for missing project files. Detection is best-effort -- if no config files exist, it defaults to TypeScript with sensible conventions.

## Advanced Usage

### Programmatic Pipeline

Use the API functions independently for fine-grained control:

```typescript
import { detect, buildDefaultAnswers, generate, writeFiles } from 'ai-env-init';

// Step 1: Detect
const info = await detect('./my-project');

// Step 2: Build defaults and customize
const answers = buildDefaultAnswers(info);
answers.aiBehavior.verbosity = 'concise';
answers.safety.protectedPaths.push('migrations/');

// Step 3: Generate without writing
const files = await generate(answers, ['claude', 'cursor'], {
  projectPath: './my-project',
}, info);

// Step 4: Inspect
for (const file of files) {
  console.log(`${file.fileName}: ${file.tokens} tokens`);
  if (file.overwrites) {
    console.log(`  WARNING: would overwrite existing file`);
  }
}

// Step 5: Write
const result = writeFiles(files, { force: false });
console.log('Written:', result.written);
console.log('Skipped:', result.skipped);
```

### Selective Format Generation

Generate only the formats you need:

```typescript
// Single format
await init({ formats: ['claude'] });

// Explicitly include MCP (excluded by default)
await init({ formats: ['claude', 'cursor', 'mcp'] });

// All default formats
await init({}); // generates claude, cursor, agents, copilot, gemini, windsurf, cline
```

### Dry Run Preview

Preview generated content without touching the filesystem:

```typescript
const result = await init({
  projectPath: './my-project',
  dryRun: true,
});

for (const file of result.files) {
  console.log(`--- ${file.fileName} (${file.tokens} tokens) ---`);
  console.log(file.content);
}
```

### Language-Aware Defaults

`buildDefaultAnswers` applies language-appropriate conventions:

| Language | Naming Convention | Component Naming |
|---|---|---|
| TypeScript / JavaScript | `camelCase` | `PascalCase` |
| Python | `snake_case` | `PascalCase` |
| Rust | `snake_case` | `PascalCase` |
| Ruby | `snake_case` | `PascalCase` |
| Go | `camelCase` | `PascalCase` |
| Java | `camelCase` | `PascalCase` |
| C# | `PascalCase` | `PascalCase` |

### Integration with CI/CD

Bootstrap AI config files as part of a project scaffolding pipeline:

```typescript
import { init } from 'ai-env-init';

await init({
  projectPath: newProjectDir,
  formats: ['claude', 'cursor', 'copilot'],
  nonInteractive: true,
  answers: {
    project: {
      name: projectName,
      description,
      language: 'TypeScript',
      framework: 'Next.js',
      additionalTools: [],
    },
    conventions: {
      namingConvention: 'camelCase',
      componentNaming: 'PascalCase',
      importOrdering: 'external-first',
      errorHandling: 'try-catch',
      commentStyle: 'jsdoc-public',
      preferredPatterns: [],
    },
    aiBehavior: {
      verbosity: 'balanced',
      modificationApproach: 'minimal',
      whenUncertain: 'ask',
      autonomousActions: [],
    },
    testing: {
      framework: 'Vitest',
      command: 'npm test',
      expectations: ['Write tests for new features'],
    },
    safety: {
      protectedPaths: ['.env'],
      topicsToAvoid: [],
      securityConstraints: ['Never commit secrets'],
    },
    team: {
      size: 'small',
      reviewProcess: 'pull-requests',
      commitConvention: 'conventional',
      branchNaming: null,
    },
    formats: ['claude', 'cursor', 'copilot'],
  },
});
```

## TypeScript

This package is written in TypeScript and ships type declarations alongside the compiled JavaScript. All types are exported from the main entry point:

```typescript
import type {
  FileFormat,
  DetectedItem,
  ExistingAIFile,
  ProjectInfo,
  QuestionnaireAnswers,
  GenerateOptions,
  GeneratedFile,
  InitOptions,
  InitResult,
  InitializerConfig,
  Initializer,
  FormatMeta,
} from 'ai-env-init';
```

## License

MIT

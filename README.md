# ai-env-init

Bootstrap all AI configuration files for a project from a single command. Detects project characteristics (language, framework, test runner, build tools, linting, monorepo structure) and generates instruction files for every major AI coding tool.

## Supported Formats

| Format | File | Tool |
|--------|------|------|
| `claude` | `CLAUDE.md` | Anthropic Claude Code |
| `cursor` | `.cursorrules` | Cursor IDE |
| `agents` | `AGENTS.md` | Microsoft Copilot Coding Agent |
| `copilot` | `.github/copilot-instructions.md` | GitHub Copilot |
| `gemini` | `GEMINI.md` | Google Gemini CLI |
| `windsurf` | `.windsurfrules` | Windsurf (Codeium) |
| `cline` | `.clinerules` | Cline (VS Code extension) |
| `mcp` | `.mcp.json` | MCP-compatible tools |

## Installation

```bash
npm install ai-env-init
```

## API

### `init(options?)`

Full initialization flow: detect project, build defaults, generate and write files.

```typescript
import { init } from 'ai-env-init';

const result = await init({
  projectPath: '/path/to/project',
  formats: ['claude', 'cursor', 'copilot'],
  force: false,    // overwrite existing files
  dryRun: false,   // generate without writing
  answers: {       // override detected defaults
    project: { name: 'my-app', description: 'My application' },
    conventions: { namingConvention: 'camelCase' },
  },
});

console.log(`Generated ${result.written.length} files`);
console.log(`Skipped ${result.skipped.length} files`);
```

### `detect(dir)`

Run project detection only. Returns a `ProjectInfo` object with detected language, framework, test runner, build tools, linters, package manager, module system, monorepo info, git info, and directory structure.

```typescript
import { detect } from 'ai-env-init';

const info = await detect('/path/to/project');
console.log(info.language);       // { value: 'TypeScript', confidence: 'high', source: 'tsconfig.json' }
console.log(info.frameworks);     // [{ value: 'React', confidence: 'high', source: 'package.json' }]
console.log(info.testFrameworks); // [{ value: 'Vitest', confidence: 'high', source: 'package.json' }]
```

### `generate(answers, formats, options?, info?)`

Render templates and return generated file objects without writing to disk.

```typescript
import { generate } from 'ai-env-init';

const files = await generate(answers, ['claude', 'cursor'], {
  projectPath: '/path/to/project',
  templates: { claude: '# Custom {{project.name}} template' },
});

for (const file of files) {
  console.log(`${file.fileName}: ${file.tokens} tokens`);
}
```

### `writeFiles(files, options?)`

Write generated files to disk.

```typescript
import { writeFiles } from 'ai-env-init';

const result = writeFiles(files, { force: true, dryRun: false });
```

### `render(template, context)`

Low-level template rendering with `{{variable}}`, `{{#if}}`, `{{#unless}}`, `{{#each}}`, and `{{#if (eq a "b")}}` support.

```typescript
import { render } from 'ai-env-init';

const output = render('Hello {{name}}!', { name: 'world' });
```

## Template Syntax

Templates use a lightweight custom syntax:

- **Variables**: `{{project.name}}`, `{{conventions.namingConvention}}`
- **Conditionals**: `{{#if testing.framework}}...{{/if}}`, `{{#unless show}}...{{/unless}}`
- **Else**: `{{#if x}}yes{{else}}no{{/if}}`
- **Equality**: `{{#if (eq project.language "TypeScript")}}...{{/if}}`
- **Iteration**: `{{#each items}}{{this}}{{/each}}` with `{{@index}}` support

## Project Detection

Detects from configuration files and directory structure:

- **Languages**: TypeScript, JavaScript, Python, Go, Rust, Ruby, Java, Swift, PHP
- **Frameworks**: React, Next.js, Vue, Angular, Express, NestJS, Django, Flask, FastAPI, Gin, Actix Web, and more
- **Test runners**: Vitest, Jest, Mocha, Playwright, Cypress, pytest
- **Build tools**: Vite, webpack, Rollup, tsc, Turborepo, Make, Docker
- **Linters**: ESLint, Prettier, Biome, Ruff, RuboCop, golangci-lint
- **Package managers**: npm, Yarn, pnpm, Bun
- **Monorepo**: npm/Yarn workspaces, pnpm workspaces, Turborepo, Nx, Lerna

## License

MIT

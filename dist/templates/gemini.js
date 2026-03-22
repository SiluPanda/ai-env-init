"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEMINI_TEMPLATE = void 0;
exports.GEMINI_TEMPLATE = `# {{project.name}}

{{project.description}}

## Project Context

{{project.name}} is {{primaryFrameworkDescription}} written in {{project.language}}.
{{#if project.additionalToolsList}}

Key libraries: {{project.additionalToolsList}}.
{{/if}}
{{#if buildToolsList}}
Build: {{buildToolsList}}.
{{/if}}
{{#if lintersList}}
Linting: {{lintersList}}.
{{/if}}

## Coding Conventions

{{#if (eq conventions.namingConvention "camelCase")}}
- Use camelCase for variables and functions
{{/if}}
{{#if (eq conventions.namingConvention "snake_case")}}
- Use snake_case for variables and functions
{{/if}}
{{#if (eq conventions.componentNaming "PascalCase")}}
- Use PascalCase for components and classes
{{/if}}
{{#if (eq conventions.importOrdering "external-first")}}
- Imports: external first, then internal
{{/if}}
{{#if (eq conventions.errorHandling "try-catch")}}
- Error handling: try/catch with explicit handling
{{/if}}
{{#if (eq conventions.errorHandling "result-types")}}
- Error handling: Result/Either types
{{/if}}
{{#if (eq conventions.commentStyle "jsdoc-public")}}
- JSDoc for public APIs
{{/if}}
{{#if (eq conventions.commentStyle "minimal")}}
- Minimal comments -- self-documenting code
{{/if}}
{{#if hasPreferredPatterns}}
{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
{{/if}}

## Instructions

{{#if (eq aiBehavior.verbosity "concise")}}
- Be concise in responses
{{/if}}
{{#if (eq aiBehavior.verbosity "balanced")}}
- Explain non-obvious decisions
{{/if}}
{{#if (eq aiBehavior.verbosity "detailed")}}
- Explain reasoning thoroughly
{{/if}}
{{#if (eq aiBehavior.modificationApproach "minimal")}}
- Make minimal changes
{{/if}}
{{#if (eq aiBehavior.whenUncertain "ask")}}
- Ask for clarification when uncertain
{{/if}}
{{#if testing.framework}}
- Test framework: {{testing.framework}}
{{/if}}
{{#if testing.command}}
- Run tests: \`{{testing.command}}\`
{{/if}}
{{#if hasSecurityConstraints}}

### Security

{{#each safety.securityConstraints}}
- {{this}}
{{/each}}
{{/if}}
{{#if hasProtectedPaths}}

### Protected Paths

{{#each safety.protectedPaths}}
- Do not modify: \`{{this}}\`
{{/each}}
{{/if}}
`;
//# sourceMappingURL=gemini.js.map
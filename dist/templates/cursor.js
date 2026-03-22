"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURSOR_TEMPLATE = void 0;
exports.CURSOR_TEMPLATE = `You are an expert {{project.language}} developer working on {{project.name}}.
{{#if project.framework}}
This project uses {{project.framework}}.
{{/if}}
{{#if project.additionalToolsList}}
Key tools: {{project.additionalToolsList}}.
{{/if}}

## Tech Stack

- Language: {{project.language}}
{{#if project.framework}}
- Framework: {{project.framework}}
{{/if}}
{{#if testing.framework}}
- Testing: {{testing.framework}}
{{/if}}
{{#if buildToolsList}}
- Build: {{buildToolsList}}
{{/if}}
{{#if lintersList}}
- Linting: {{lintersList}}
{{/if}}

## Code Style

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
- Imports: external dependencies first, then internal
{{/if}}
{{#if (eq conventions.errorHandling "try-catch")}}
- Use try/catch for error handling
{{/if}}
{{#if (eq conventions.errorHandling "result-types")}}
- Use Result/Either types for error handling
{{/if}}
{{#if hasPreferredPatterns}}

{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
{{/if}}

## Rules

{{#if (eq aiBehavior.modificationApproach "minimal")}}
- Make minimal changes. Keep diffs small.
{{/if}}
{{#if (eq aiBehavior.whenUncertain "ask")}}
- Ask for clarification when uncertain.
{{/if}}
{{#if hasSecurityConstraints}}
{{#each safety.securityConstraints}}
- {{this}}
{{/each}}
{{/if}}
{{#if hasProtectedPaths}}
- Do not modify: {{protectedPathsList}}
{{/if}}
{{#if testing.command}}
- Run tests: \`{{testing.command}}\`
{{/if}}
`;
//# sourceMappingURL=cursor.js.map
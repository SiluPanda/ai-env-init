"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COPILOT_TEMPLATE = void 0;
exports.COPILOT_TEMPLATE = `# Copilot Instructions for {{project.name}}

## Language and Framework

- Language: {{project.language}}
{{#if project.framework}}
- Framework: {{project.framework}}
{{/if}}
{{#if project.additionalToolsList}}
- Key tools: {{project.additionalToolsList}}
{{/if}}

## Code Style Preferences

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
- Import external dependencies first, then internal modules
{{/if}}
{{#if (eq conventions.errorHandling "try-catch")}}
- Use try/catch for error handling
{{/if}}
{{#if hasPreferredPatterns}}
{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
{{/if}}

## Response Format

{{#if (eq aiBehavior.verbosity "concise")}}
- Keep suggestions concise and to the point
{{/if}}
{{#if (eq aiBehavior.verbosity "balanced")}}
- Explain non-obvious decisions briefly
{{/if}}
{{#if (eq aiBehavior.verbosity "detailed")}}
- Provide detailed explanations with suggestions
{{/if}}
{{#if (eq aiBehavior.modificationApproach "minimal")}}
- Prefer minimal, focused changes
{{/if}}
{{#if testing.framework}}
- Include tests using {{testing.framework}} when adding new functionality
{{/if}}
`;
//# sourceMappingURL=copilot.js.map
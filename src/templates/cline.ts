export const CLINE_TEMPLATE = `# {{project.name}}

## Project Overview

{{project.description}}

- Language: {{project.language}}
{{#if project.framework}}
- Framework: {{project.framework}}
{{/if}}
{{#if project.additionalToolsList}}
- Tools: {{project.additionalToolsList}}
{{/if}}

## Coding Rules

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
- Handle errors with try/catch
{{/if}}
{{#if hasPreferredPatterns}}
{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
{{/if}}

## Workflow

{{#if testing.framework}}
- Test framework: {{testing.framework}}
{{/if}}
{{#if testing.command}}
- Run tests: \`{{testing.command}}\`
{{/if}}
{{#if (eq team.commitConvention "conventional")}}
- Use Conventional Commits (feat:, fix:, etc.)
{{/if}}
{{#if (eq aiBehavior.modificationApproach "minimal")}}
- Make minimal, focused changes
{{/if}}
{{#if (eq aiBehavior.whenUncertain "ask")}}
- Ask for clarification when uncertain
{{/if}}
{{#if hasProtectedPaths}}

## Protected Paths

{{#each safety.protectedPaths}}
- Do not modify: \`{{this}}\`
{{/each}}
{{/if}}
{{#if hasSecurityConstraints}}

## Security

{{#each safety.securityConstraints}}
- {{this}}
{{/each}}
{{/if}}
`;

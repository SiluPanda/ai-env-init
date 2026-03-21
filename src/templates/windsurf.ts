export const WINDSURF_TEMPLATE = `# {{project.name}}

## Project Context

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
{{#if project.additionalToolsList}}
- Tools: {{project.additionalToolsList}}
{{/if}}

## Rules

{{#if (eq conventions.namingConvention "camelCase")}}
- Use camelCase for variables and functions
{{/if}}
{{#if (eq conventions.namingConvention "snake_case")}}
- Use snake_case for variables and functions
{{/if}}
{{#if (eq conventions.componentNaming "PascalCase")}}
- Use PascalCase for components and classes
{{/if}}
{{#if (eq conventions.errorHandling "try-catch")}}
- Use try/catch for error handling
{{/if}}
{{#if hasPreferredPatterns}}
{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
{{/if}}
{{#if (eq aiBehavior.modificationApproach "minimal")}}
- Keep changes minimal
{{/if}}
{{#if (eq aiBehavior.whenUncertain "ask")}}
- Ask when uncertain
{{/if}}
{{#if hasSecurityConstraints}}
{{#each safety.securityConstraints}}
- {{this}}
{{/each}}
{{/if}}
{{#if hasProtectedPaths}}
- Protected paths: {{protectedPathsList}}
{{/if}}
{{#if testing.command}}
- Run tests: \`{{testing.command}}\`
{{/if}}
`;

export const AGENTS_TEMPLATE = `# {{project.name}} -- Agent Instructions

{{project.description}}

## Scope

{{#if directories.source}}
- Source code is in \`{{directories.source}}\`
{{/if}}
{{#if directories.tests}}
- Tests are in \`{{directories.tests}}\`
{{/if}}
{{#if isMonorepo}}
- This is a monorepo managed by {{monorepo.tool.value}}
{{/if}}

## Coding Standards

- Language: {{project.language}}
{{#if project.framework}}
- Framework: {{project.framework}}
{{/if}}
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
- Handle errors with try/catch
{{/if}}
{{#if hasPreferredPatterns}}
{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
{{/if}}

## Testing Requirements

{{#if testing.framework}}
- Test framework: {{testing.framework}}
{{/if}}
{{#if testing.command}}
- Run tests: \`{{testing.command}}\`
{{/if}}
{{#if hasTestExpectations}}
{{#each testing.expectations}}
- {{this}}
{{/each}}
{{/if}}

## Boundaries

{{#if hasProtectedPaths}}
### Do NOT modify these files or directories:

{{#each safety.protectedPaths}}
- \`{{this}}\`
{{/each}}
{{/if}}
{{#if hasSecurityConstraints}}

### Security constraints:

{{#each safety.securityConstraints}}
- {{this}}
{{/each}}
{{/if}}
{{#if hasTopicsToAvoid}}

### Topics to avoid:

{{#each safety.topicsToAvoid}}
- {{this}}
{{/each}}
{{/if}}

- Always ask before performing destructive actions
- Do not install new dependencies without approval
`;

export const CLAUDE_TEMPLATE = `# {{project.name}}

{{project.description}}

## 1. Project Overview

{{project.name}} is {{primaryFrameworkDescription}} written in {{project.language}}.
{{#if project.additionalToolsList}}

Key libraries and tools: {{project.additionalToolsList}}.
{{/if}}
{{#if buildToolsList}}

Build tools: {{buildToolsList}}.
{{/if}}
{{#if lintersList}}

Linting and formatting: {{lintersList}}.
{{/if}}

## 2. Workflow

{{#if team.branchNaming}}
- Branch naming: \`{{team.branchNaming}}\`
{{/if}}
{{#if (eq team.commitConvention "conventional")}}
- Commit messages follow Conventional Commits: \`feat:\`, \`fix:\`, \`chore:\`, \`docs:\`, \`refactor:\`, \`test:\`
{{/if}}
{{#if (eq team.commitConvention "scope-prefixed")}}
- Commit messages use scope prefixes: \`[component] message\`
{{/if}}
{{#if (eq team.reviewProcess "pull-requests")}}
- All changes go through pull requests with code review
{{/if}}
{{#if (eq team.reviewProcess "pair-programming")}}
- Changes are developed via pair programming
{{/if}}
{{#if git.hasHusky}}
- Git hooks are managed by Husky
{{/if}}
{{#if git.hasLintStaged}}
- lint-staged runs on pre-commit
{{/if}}

## 3. Coding Conventions

{{#if (eq conventions.namingConvention "camelCase")}}
- Use camelCase for variables and functions
{{/if}}
{{#if (eq conventions.namingConvention "snake_case")}}
- Use snake_case for variables and functions
{{/if}}
{{#if (eq conventions.namingConvention "PascalCase")}}
- Use PascalCase for variables and functions
{{/if}}
{{#if (eq conventions.componentNaming "PascalCase")}}
- Use PascalCase for components and classes
{{/if}}
{{#if (eq conventions.importOrdering "external-first")}}
- Import ordering: external dependencies first, then internal modules
{{/if}}
{{#if (eq conventions.importOrdering "alphabetical")}}
- Import ordering: alphabetical
{{/if}}
{{#if (eq conventions.importOrdering "grouped")}}
- Import ordering: grouped by type
{{/if}}
{{#if (eq conventions.errorHandling "try-catch")}}
- Error handling: use try/catch with explicit handling
{{/if}}
{{#if (eq conventions.errorHandling "result-types")}}
- Error handling: use Result/Either types
{{/if}}
{{#if (eq conventions.commentStyle "jsdoc-public")}}
- Use JSDoc comments for public APIs
{{/if}}
{{#if (eq conventions.commentStyle "minimal")}}
- Minimal comments -- code should be self-documenting
{{/if}}
{{#if (eq conventions.commentStyle "comprehensive")}}
- Comprehensive inline comments
{{/if}}
{{#if hasPreferredPatterns}}

### Preferred Patterns

{{#each conventions.preferredPatterns}}
- {{this}}
{{/each}}
{{/if}}

## 4. File Structure

{{#if directories.source}}
- Source code: \`{{directories.source}}\`
{{/if}}
{{#if directories.tests}}
- Tests: \`{{directories.tests}}\`
{{/if}}
{{#if directories.docs}}
- Documentation: \`{{directories.docs}}\`
{{/if}}
{{#if directories.scripts}}
- Scripts: \`{{directories.scripts}}\`
{{/if}}
{{#if directories.staticAssets}}
- Static assets: \`{{directories.staticAssets}}\`
{{/if}}
{{#if isMonorepo}}

This is a monorepo managed by {{monorepo.tool.value}}.
{{/if}}

## 5. Testing

{{#if testing.framework}}
Test framework: {{testing.framework}}.
{{/if}}
{{#if testing.command}}

Run tests: \`{{testing.command}}\`
{{/if}}
{{#if hasTestExpectations}}

### Testing Expectations

{{#each testing.expectations}}
- {{this}}
{{/each}}
{{/if}}

## 6. AI Behavior

{{#if (eq aiBehavior.verbosity "concise")}}
- Be concise. Minimal explanation.
{{/if}}
{{#if (eq aiBehavior.verbosity "balanced")}}
- Balanced responses. Explain non-obvious decisions.
{{/if}}
{{#if (eq aiBehavior.verbosity "detailed")}}
- Detailed responses. Explain reasoning thoroughly.
{{/if}}
{{#if (eq aiBehavior.modificationApproach "minimal")}}
- Make minimal changes -- smallest diff possible.
{{/if}}
{{#if (eq aiBehavior.modificationApproach "refactor-freely")}}
- Refactor freely when improving code quality.
{{/if}}
{{#if (eq aiBehavior.whenUncertain "ask")}}
- When uncertain, ask for clarification.
{{/if}}
{{#if (eq aiBehavior.whenUncertain "best-judgment")}}
- When uncertain, make best judgment and note assumptions.
{{/if}}
{{#if (eq aiBehavior.whenUncertain "show-options")}}
- When uncertain, show options and let the user choose.
{{/if}}

## 7. Rules

{{#if hasProtectedPaths}}
### Protected Paths -- Do Not Modify

{{#each safety.protectedPaths}}
- \`{{this}}\`
{{/each}}
{{/if}}
{{#if hasSecurityConstraints}}

### Security

{{#each safety.securityConstraints}}
- {{this}}
{{/each}}
{{/if}}
{{#if hasTopicsToAvoid}}

### Topics to Avoid

{{#each safety.topicsToAvoid}}
- {{this}}
{{/each}}
{{/if}}
`;

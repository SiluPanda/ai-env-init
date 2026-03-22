/**
 * Lightweight template engine with {{variable}}, {{#if}}, {{#unless}},
 * {{#each}}, {{else}}, and {{#if (eq a b)}} support.
 * Zero external dependencies.
 */
/**
 * Resolve a dotted path like "project.name" from a nested context object.
 */
export declare function resolvePath(context: Record<string, unknown>, path: string): unknown;
/**
 * Determine if a value is "truthy" for template conditionals.
 * - null, undefined, false, empty string, empty array -> falsy
 * - everything else -> truthy
 */
export declare function isTruthy(value: unknown): boolean;
/**
 * Render a template string using the given context.
 */
export declare function render(template: string, context: Record<string, unknown>): string;
//# sourceMappingURL=template-engine.d.ts.map
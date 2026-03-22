/**
 * Lightweight template engine with {{variable}}, {{#if}}, {{#unless}},
 * {{#each}}, {{else}}, and {{#if (eq a b)}} support.
 * Zero external dependencies.
 */

// ── Context Access ──────────────────────────────────────────────────

/**
 * Resolve a dotted path like "project.name" from a nested context object.
 */
export function resolvePath(
  context: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Determine if a value is "truthy" for template conditionals.
 * - null, undefined, false, empty string, empty array -> falsy
 * - everything else -> truthy
 */
export function isTruthy(value: unknown): boolean {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === 'string' && value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

// ── Template Rendering ──────────────────────────────────────────────

/**
 * Render a template string using the given context.
 */
export function render(
  template: string,
  context: Record<string, unknown>,
): string {
  let result = processBlocks(template, context);
  result = interpolateVariables(result, context);
  // Clean up excessive blank lines (more than 2 consecutive newlines)
  result = result.replace(/\n{3,}/g, '\n\n');
  return result;
}

/**
 * Process all block-level directives: #if, #unless, #each.
 * Handles nesting by processing innermost blocks first.
 */
function processBlocks(
  template: string,
  context: Record<string, unknown>,
): string {
  let result = template;
  let safety = 0;
  const maxIterations = 200;

  // Process blocks from innermost to outermost
  while (safety++ < maxIterations) {
    // Find the innermost block (a block with no nested blocks inside)
    const eachMatch = findInnermostBlock(result, 'each');
    const ifMatch = findInnermostBlock(result, 'if');
    const unlessMatch = findInnermostBlock(result, 'unless');

    // Pick the first match by position
    const matches = [eachMatch, ifMatch, unlessMatch].filter(
      (m): m is BlockMatch => m !== null,
    );
    if (matches.length === 0) break;

    matches.sort((a, b) => a.start - b.start);
    const match = matches[0];

    let replacement: string;
    if (match.type === 'each') {
      replacement = processEachBlock(match, context);
    } else if (match.type === 'if') {
      replacement = processIfBlock(match, context);
    } else {
      replacement = processUnlessBlock(match, context);
    }

    result =
      result.slice(0, match.start) + replacement + result.slice(match.end);
  }

  return result;
}

interface BlockMatch {
  type: 'if' | 'unless' | 'each';
  start: number;
  end: number;
  expression: string;
  body: string;
  elseBody: string | null;
}

function findInnermostBlock(
  template: string,
  type: 'if' | 'unless' | 'each',
): BlockMatch | null {
  // Match opening tags, then find the corresponding close tag
  // that has no nested block of the same type inside
  const openPattern = new RegExp(
    `\\{\\{#${type}\\s+([^}]+)\\}\\}`,
    'g',
  );
  const closeTag = `{{/${type}}}`;

  let bestMatch: BlockMatch | null = null;

  let openMatch: RegExpExecArray | null;
  while ((openMatch = openPattern.exec(template)) !== null) {
    const start = openMatch.index;
    const afterOpen = start + openMatch[0].length;
    const expression = openMatch[1].trim();

    // Find the next close tag
    const closeIdx = template.indexOf(closeTag, afterOpen);
    if (closeIdx === -1) continue;

    const body = template.slice(afterOpen, closeIdx);

    // Check if there's a nested open tag of the same type inside the body
    const nestedOpen = new RegExp(`\\{\\{#${type}\\s+`);
    if (nestedOpen.test(body)) continue; // Not innermost

    const end = closeIdx + closeTag.length;

    // Check for {{else}} inside the body
    let mainBody = body;
    let elseBody: string | null = null;
    const elseIdx = body.indexOf('{{else}}');
    if (elseIdx !== -1) {
      mainBody = body.slice(0, elseIdx);
      elseBody = body.slice(elseIdx + '{{else}}'.length);
    }

    bestMatch = {
      type,
      start,
      end,
      expression,
      body: mainBody,
      elseBody,
    };
    break; // Take the first (leftmost) innermost match
  }

  return bestMatch;
}

function processIfBlock(
  match: BlockMatch,
  context: Record<string, unknown>,
): string {
  const condition = evaluateCondition(match.expression, context);
  if (condition) {
    return match.body;
  }
  return match.elseBody ?? '';
}

function processUnlessBlock(
  match: BlockMatch,
  context: Record<string, unknown>,
): string {
  const condition = evaluateCondition(match.expression, context);
  if (!condition) {
    return match.body;
  }
  return match.elseBody ?? '';
}

function processEachBlock(
  match: BlockMatch,
  context: Record<string, unknown>,
): string {
  const value = resolvePath(context, match.expression);
  if (!Array.isArray(value)) return '';

  const lines: string[] = [];
  for (let i = 0; i < value.length; i++) {
    let item = match.body;
    // Replace {{this}} with the current element
    item = item.replace(/\{\{this\}\}/g, String(value[i]));
    // Replace {{@index}} with the index
    item = item.replace(/\{\{@index\}\}/g, String(i));
    // If the element is an object, resolve nested paths
    if (typeof value[i] === 'object' && value[i] !== null) {
      const itemContext = value[i] as Record<string, unknown>;
      item = item.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g, (fullMatch, path: string) => {
        const resolved = resolvePath(itemContext, path);
        if (resolved !== undefined) return String(resolved);
        return fullMatch;
      });
    }
    lines.push(item);
  }
  return lines.join('');
}

/**
 * Evaluate a condition expression.
 * Supports:
 * - Simple variable: "project.name"
 * - Equality: "(eq project.framework \"Next.js\")"
 */
function evaluateCondition(
  expression: string,
  context: Record<string, unknown>,
): boolean {
  // Check for (eq a b) syntax
  const eqMatch = expression.match(
    /^\(eq\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s+"([^"]*)"\)$/,
  );
  if (eqMatch) {
    const value = resolvePath(context, eqMatch[1]);
    return String(value) === eqMatch[2];
  }

  // Simple variable truthiness check
  const value = resolvePath(context, expression);
  return isTruthy(value);
}

/**
 * Replace {{variable}} placeholders with values from context.
 */
function interpolateVariables(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(
    /\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g,
    (_match, path: string) => {
      const value = resolvePath(context, path);
      if (value === undefined || value === null) return '';
      if (Array.isArray(value)) return value.join(', ');
      return String(value);
    },
  );
}

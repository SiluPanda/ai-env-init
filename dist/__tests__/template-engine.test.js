"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const template_engine_1 = require("../template-engine");
(0, vitest_1.describe)('template-engine', () => {
    // ── resolvePath ───────────────────────────────────────────────────
    (0, vitest_1.describe)('resolvePath', () => {
        (0, vitest_1.it)('resolves simple keys', () => {
            (0, vitest_1.expect)((0, template_engine_1.resolvePath)({ name: 'test' }, 'name')).toBe('test');
        });
        (0, vitest_1.it)('resolves nested keys', () => {
            (0, vitest_1.expect)((0, template_engine_1.resolvePath)({ project: { name: 'test' } }, 'project.name')).toBe('test');
        });
        (0, vitest_1.it)('resolves deeply nested keys', () => {
            (0, vitest_1.expect)((0, template_engine_1.resolvePath)({ a: { b: { c: 'deep' } } }, 'a.b.c')).toBe('deep');
        });
        (0, vitest_1.it)('returns undefined for missing keys', () => {
            (0, vitest_1.expect)((0, template_engine_1.resolvePath)({ name: 'test' }, 'missing')).toBeUndefined();
        });
        (0, vitest_1.it)('returns undefined for missing nested keys', () => {
            (0, vitest_1.expect)((0, template_engine_1.resolvePath)({ a: { b: 1 } }, 'a.c')).toBeUndefined();
        });
        (0, vitest_1.it)('returns undefined for path through null', () => {
            (0, vitest_1.expect)((0, template_engine_1.resolvePath)({ a: null }, 'a.b')).toBeUndefined();
        });
        (0, vitest_1.it)('returns undefined for path through primitive', () => {
            (0, vitest_1.expect)((0, template_engine_1.resolvePath)({ a: 42 }, 'a.b')).toBeUndefined();
        });
    });
    // ── isTruthy ──────────────────────────────────────────────────────
    (0, vitest_1.describe)('isTruthy', () => {
        (0, vitest_1.it)('null is falsy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)(null)).toBe(false));
        (0, vitest_1.it)('undefined is falsy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)(undefined)).toBe(false));
        (0, vitest_1.it)('false is falsy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)(false)).toBe(false));
        (0, vitest_1.it)('empty string is falsy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)('')).toBe(false));
        (0, vitest_1.it)('empty array is falsy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)([])).toBe(false));
        (0, vitest_1.it)('non-empty string is truthy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)('hello')).toBe(true));
        (0, vitest_1.it)('number is truthy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)(42)).toBe(true));
        (0, vitest_1.it)('zero is truthy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)(0)).toBe(true));
        (0, vitest_1.it)('non-empty array is truthy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)([1])).toBe(true));
        (0, vitest_1.it)('object is truthy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)({})).toBe(true));
        (0, vitest_1.it)('true is truthy', () => (0, vitest_1.expect)((0, template_engine_1.isTruthy)(true)).toBe(true));
    });
    // ── Variable Interpolation ────────────────────────────────────────
    (0, vitest_1.describe)('variable interpolation', () => {
        (0, vitest_1.it)('replaces simple variables', () => {
            (0, vitest_1.expect)((0, template_engine_1.render)('Hello {{name}}!', { name: 'world' })).toBe('Hello world!');
        });
        (0, vitest_1.it)('replaces nested variables', () => {
            (0, vitest_1.expect)((0, template_engine_1.render)('{{project.name}} v{{project.version}}', {
                project: { name: 'test', version: '1.0.0' },
            })).toBe('test v1.0.0');
        });
        (0, vitest_1.it)('replaces missing variables with empty string', () => {
            (0, vitest_1.expect)((0, template_engine_1.render)('Hello {{name}}!', {})).toBe('Hello !');
        });
        (0, vitest_1.it)('replaces null variables with empty string', () => {
            (0, vitest_1.expect)((0, template_engine_1.render)('Hello {{name}}!', { name: null })).toBe('Hello !');
        });
        (0, vitest_1.it)('replaces arrays with comma-joined string', () => {
            (0, vitest_1.expect)((0, template_engine_1.render)('{{items}}', { items: ['a', 'b', 'c'] })).toBe('a, b, c');
        });
        (0, vitest_1.it)('handles multiple variables in one line', () => {
            (0, vitest_1.expect)((0, template_engine_1.render)('{{a}} and {{b}}', { a: 'hello', b: 'world' })).toBe('hello and world');
        });
        (0, vitest_1.it)('handles numbers', () => {
            (0, vitest_1.expect)((0, template_engine_1.render)('Count: {{n}}', { n: 42 })).toBe('Count: 42');
        });
    });
    // ── Conditional Blocks ────────────────────────────────────────────
    (0, vitest_1.describe)('conditional blocks (#if)', () => {
        (0, vitest_1.it)('renders truthy block', () => {
            const tmpl = '{{#if show}}visible{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: true })).toBe('visible');
        });
        (0, vitest_1.it)('hides falsy block', () => {
            const tmpl = '{{#if show}}visible{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: false })).toBe('');
        });
        (0, vitest_1.it)('handles null as falsy', () => {
            const tmpl = '{{#if val}}yes{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { val: null })).toBe('');
        });
        (0, vitest_1.it)('handles empty string as falsy', () => {
            const tmpl = '{{#if val}}yes{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { val: '' })).toBe('');
        });
        (0, vitest_1.it)('handles empty array as falsy', () => {
            const tmpl = '{{#if items}}yes{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { items: [] })).toBe('');
        });
        (0, vitest_1.it)('handles non-empty array as truthy', () => {
            const tmpl = '{{#if items}}yes{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { items: [1] })).toBe('yes');
        });
        (0, vitest_1.it)('handles else blocks', () => {
            const tmpl = '{{#if show}}yes{{else}}no{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: true })).toBe('yes');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: false })).toBe('no');
        });
        (0, vitest_1.it)('handles nested path in condition', () => {
            const tmpl = '{{#if project.name}}Name: {{project.name}}{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { project: { name: 'test' } })).toBe('Name: test');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { project: { name: '' } })).toBe('');
        });
        (0, vitest_1.it)('handles eq helper', () => {
            const tmpl = '{{#if (eq lang "TypeScript")}}TS{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { lang: 'TypeScript' })).toBe('TS');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { lang: 'Python' })).toBe('');
        });
        (0, vitest_1.it)('handles eq helper with nested path', () => {
            const tmpl = '{{#if (eq project.framework "Next.js")}}Next!{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { project: { framework: 'Next.js' } })).toBe('Next!');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { project: { framework: 'React' } })).toBe('');
        });
    });
    // ── Unless Blocks ─────────────────────────────────────────────────
    (0, vitest_1.describe)('unless blocks (#unless)', () => {
        (0, vitest_1.it)('renders when condition is falsy', () => {
            const tmpl = '{{#unless show}}hidden{{/unless}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: false })).toBe('hidden');
        });
        (0, vitest_1.it)('hides when condition is truthy', () => {
            const tmpl = '{{#unless show}}hidden{{/unless}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: true })).toBe('');
        });
        (0, vitest_1.it)('handles else in unless', () => {
            const tmpl = '{{#unless show}}no{{else}}yes{{/unless}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: false })).toBe('no');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: true })).toBe('yes');
        });
    });
    // ── Each Blocks ───────────────────────────────────────────────────
    (0, vitest_1.describe)('each blocks (#each)', () => {
        (0, vitest_1.it)('iterates over arrays', () => {
            const tmpl = '{{#each items}}- {{this}}\n{{/each}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { items: ['a', 'b', 'c'] })).toBe('- a\n- b\n- c\n');
        });
        (0, vitest_1.it)('handles empty arrays', () => {
            const tmpl = '{{#each items}}- {{this}}\n{{/each}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { items: [] })).toBe('');
        });
        (0, vitest_1.it)('handles missing arrays', () => {
            const tmpl = '{{#each items}}- {{this}}\n{{/each}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, {})).toBe('');
        });
        (0, vitest_1.it)('provides @index', () => {
            const tmpl = '{{#each items}}{{@index}}: {{this}}\n{{/each}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { items: ['a', 'b'] })).toBe('0: a\n1: b\n');
        });
        (0, vitest_1.it)('handles nested path for array', () => {
            const tmpl = '{{#each project.items}}- {{this}}\n{{/each}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { project: { items: ['x', 'y'] } })).toBe('- x\n- y\n');
        });
    });
    // ── Nested Blocks ─────────────────────────────────────────────────
    (0, vitest_1.describe)('nested blocks', () => {
        (0, vitest_1.it)('handles if inside if', () => {
            const tmpl = '{{#if a}}A{{#if b}}B{{/if}}{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { a: true, b: true })).toBe('AB');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { a: true, b: false })).toBe('A');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { a: false, b: true })).toBe('');
        });
        (0, vitest_1.it)('handles each inside if', () => {
            const tmpl = '{{#if show}}{{#each items}}- {{this}}\n{{/each}}{{/if}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: true, items: ['a', 'b'] })).toBe('- a\n- b\n');
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: false, items: ['a', 'b'] })).toBe('');
        });
        (0, vitest_1.it)('handles if inside each', () => {
            // This is a simpler test since our engine processes innermost first
            const tmpl = '{{#each items}}{{#if show}}+ {{this}}\n{{/if}}{{/each}}';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, { show: true, items: ['a', 'b'] })).toBe('+ a\n+ b\n');
        });
    });
    // ── Complex Templates ─────────────────────────────────────────────
    (0, vitest_1.describe)('complex templates', () => {
        (0, vitest_1.it)('handles a realistic template', () => {
            const tmpl = `# {{project.name}}

{{project.description}}

{{#if project.framework}}
## Framework

This project uses {{project.framework}}.
{{/if}}

## Rules

{{#each rules}}
- {{this}}
{{/each}}
`;
            const result = (0, template_engine_1.render)(tmpl, {
                project: {
                    name: 'my-app',
                    description: 'A cool app',
                    framework: 'React',
                },
                rules: ['Use TypeScript', 'Write tests'],
            });
            (0, vitest_1.expect)(result).toContain('# my-app');
            (0, vitest_1.expect)(result).toContain('A cool app');
            (0, vitest_1.expect)(result).toContain('This project uses React.');
            (0, vitest_1.expect)(result).toContain('- Use TypeScript');
            (0, vitest_1.expect)(result).toContain('- Write tests');
        });
        (0, vitest_1.it)('cleans up excessive blank lines', () => {
            const tmpl = 'line1\n\n\n\n\nline2';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, {})).toBe('line1\n\nline2');
        });
        (0, vitest_1.it)('handles template with no placeholders', () => {
            const tmpl = 'Just plain text.';
            (0, vitest_1.expect)((0, template_engine_1.render)(tmpl, {})).toBe('Just plain text.');
        });
    });
});
//# sourceMappingURL=template-engine.test.js.map
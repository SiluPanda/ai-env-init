import { describe, it, expect } from 'vitest';
import { render, resolvePath, isTruthy } from '../template-engine';

describe('template-engine', () => {
  // ── resolvePath ───────────────────────────────────────────────────

  describe('resolvePath', () => {
    it('resolves simple keys', () => {
      expect(resolvePath({ name: 'test' }, 'name')).toBe('test');
    });

    it('resolves nested keys', () => {
      expect(resolvePath({ project: { name: 'test' } }, 'project.name')).toBe(
        'test',
      );
    });

    it('resolves deeply nested keys', () => {
      expect(
        resolvePath({ a: { b: { c: 'deep' } } }, 'a.b.c'),
      ).toBe('deep');
    });

    it('returns undefined for missing keys', () => {
      expect(resolvePath({ name: 'test' }, 'missing')).toBeUndefined();
    });

    it('returns undefined for missing nested keys', () => {
      expect(resolvePath({ a: { b: 1 } }, 'a.c')).toBeUndefined();
    });

    it('returns undefined for path through null', () => {
      expect(resolvePath({ a: null }, 'a.b')).toBeUndefined();
    });

    it('returns undefined for path through primitive', () => {
      expect(resolvePath({ a: 42 }, 'a.b')).toBeUndefined();
    });
  });

  // ── isTruthy ──────────────────────────────────────────────────────

  describe('isTruthy', () => {
    it('null is falsy', () => expect(isTruthy(null)).toBe(false));
    it('undefined is falsy', () => expect(isTruthy(undefined)).toBe(false));
    it('false is falsy', () => expect(isTruthy(false)).toBe(false));
    it('empty string is falsy', () => expect(isTruthy('')).toBe(false));
    it('empty array is falsy', () => expect(isTruthy([])).toBe(false));
    it('non-empty string is truthy', () => expect(isTruthy('hello')).toBe(true));
    it('number is truthy', () => expect(isTruthy(42)).toBe(true));
    it('zero is truthy', () => expect(isTruthy(0)).toBe(true));
    it('non-empty array is truthy', () => expect(isTruthy([1])).toBe(true));
    it('object is truthy', () => expect(isTruthy({})).toBe(true));
    it('true is truthy', () => expect(isTruthy(true)).toBe(true));
  });

  // ── Variable Interpolation ────────────────────────────────────────

  describe('variable interpolation', () => {
    it('replaces simple variables', () => {
      expect(render('Hello {{name}}!', { name: 'world' })).toBe(
        'Hello world!',
      );
    });

    it('replaces nested variables', () => {
      expect(
        render('{{project.name}} v{{project.version}}', {
          project: { name: 'test', version: '1.0.0' },
        }),
      ).toBe('test v1.0.0');
    });

    it('replaces missing variables with empty string', () => {
      expect(render('Hello {{name}}!', {})).toBe('Hello !');
    });

    it('replaces null variables with empty string', () => {
      expect(render('Hello {{name}}!', { name: null })).toBe('Hello !');
    });

    it('replaces arrays with comma-joined string', () => {
      expect(render('{{items}}', { items: ['a', 'b', 'c'] })).toBe('a, b, c');
    });

    it('handles multiple variables in one line', () => {
      expect(
        render('{{a}} and {{b}}', { a: 'hello', b: 'world' }),
      ).toBe('hello and world');
    });

    it('handles numbers', () => {
      expect(render('Count: {{n}}', { n: 42 })).toBe('Count: 42');
    });
  });

  // ── Conditional Blocks ────────────────────────────────────────────

  describe('conditional blocks (#if)', () => {
    it('renders truthy block', () => {
      const tmpl = '{{#if show}}visible{{/if}}';
      expect(render(tmpl, { show: true })).toBe('visible');
    });

    it('hides falsy block', () => {
      const tmpl = '{{#if show}}visible{{/if}}';
      expect(render(tmpl, { show: false })).toBe('');
    });

    it('handles null as falsy', () => {
      const tmpl = '{{#if val}}yes{{/if}}';
      expect(render(tmpl, { val: null })).toBe('');
    });

    it('handles empty string as falsy', () => {
      const tmpl = '{{#if val}}yes{{/if}}';
      expect(render(tmpl, { val: '' })).toBe('');
    });

    it('handles empty array as falsy', () => {
      const tmpl = '{{#if items}}yes{{/if}}';
      expect(render(tmpl, { items: [] })).toBe('');
    });

    it('handles non-empty array as truthy', () => {
      const tmpl = '{{#if items}}yes{{/if}}';
      expect(render(tmpl, { items: [1] })).toBe('yes');
    });

    it('handles else blocks', () => {
      const tmpl = '{{#if show}}yes{{else}}no{{/if}}';
      expect(render(tmpl, { show: true })).toBe('yes');
      expect(render(tmpl, { show: false })).toBe('no');
    });

    it('handles nested path in condition', () => {
      const tmpl = '{{#if project.name}}Name: {{project.name}}{{/if}}';
      expect(render(tmpl, { project: { name: 'test' } })).toBe('Name: test');
      expect(render(tmpl, { project: { name: '' } })).toBe('');
    });

    it('handles eq helper', () => {
      const tmpl = '{{#if (eq lang "TypeScript")}}TS{{/if}}';
      expect(render(tmpl, { lang: 'TypeScript' })).toBe('TS');
      expect(render(tmpl, { lang: 'Python' })).toBe('');
    });

    it('handles eq helper with nested path', () => {
      const tmpl =
        '{{#if (eq project.framework "Next.js")}}Next!{{/if}}';
      expect(render(tmpl, { project: { framework: 'Next.js' } })).toBe('Next!');
      expect(render(tmpl, { project: { framework: 'React' } })).toBe('');
    });
  });

  // ── Unless Blocks ─────────────────────────────────────────────────

  describe('unless blocks (#unless)', () => {
    it('renders when condition is falsy', () => {
      const tmpl = '{{#unless show}}hidden{{/unless}}';
      expect(render(tmpl, { show: false })).toBe('hidden');
    });

    it('hides when condition is truthy', () => {
      const tmpl = '{{#unless show}}hidden{{/unless}}';
      expect(render(tmpl, { show: true })).toBe('');
    });

    it('handles else in unless', () => {
      const tmpl = '{{#unless show}}no{{else}}yes{{/unless}}';
      expect(render(tmpl, { show: false })).toBe('no');
      expect(render(tmpl, { show: true })).toBe('yes');
    });
  });

  // ── Each Blocks ───────────────────────────────────────────────────

  describe('each blocks (#each)', () => {
    it('iterates over arrays', () => {
      const tmpl = '{{#each items}}- {{this}}\n{{/each}}';
      expect(render(tmpl, { items: ['a', 'b', 'c'] })).toBe(
        '- a\n- b\n- c\n',
      );
    });

    it('handles empty arrays', () => {
      const tmpl = '{{#each items}}- {{this}}\n{{/each}}';
      expect(render(tmpl, { items: [] })).toBe('');
    });

    it('handles missing arrays', () => {
      const tmpl = '{{#each items}}- {{this}}\n{{/each}}';
      expect(render(tmpl, {})).toBe('');
    });

    it('provides @index', () => {
      const tmpl = '{{#each items}}{{@index}}: {{this}}\n{{/each}}';
      expect(render(tmpl, { items: ['a', 'b'] })).toBe('0: a\n1: b\n');
    });

    it('handles nested path for array', () => {
      const tmpl = '{{#each project.items}}- {{this}}\n{{/each}}';
      expect(render(tmpl, { project: { items: ['x', 'y'] } })).toBe(
        '- x\n- y\n',
      );
    });
  });

  // ── Nested Blocks ─────────────────────────────────────────────────

  describe('nested blocks', () => {
    it('handles if inside if', () => {
      const tmpl = '{{#if a}}A{{#if b}}B{{/if}}{{/if}}';
      expect(render(tmpl, { a: true, b: true })).toBe('AB');
      expect(render(tmpl, { a: true, b: false })).toBe('A');
      expect(render(tmpl, { a: false, b: true })).toBe('');
    });

    it('handles each inside if', () => {
      const tmpl = '{{#if show}}{{#each items}}- {{this}}\n{{/each}}{{/if}}';
      expect(render(tmpl, { show: true, items: ['a', 'b'] })).toBe(
        '- a\n- b\n',
      );
      expect(render(tmpl, { show: false, items: ['a', 'b'] })).toBe('');
    });

    it('handles if inside each', () => {
      // This is a simpler test since our engine processes innermost first
      const tmpl = '{{#each items}}{{#if show}}+ {{this}}\n{{/if}}{{/each}}';
      expect(render(tmpl, { show: true, items: ['a', 'b'] })).toBe(
        '+ a\n+ b\n',
      );
    });
  });

  // ── Complex Templates ─────────────────────────────────────────────

  describe('complex templates', () => {
    it('handles a realistic template', () => {
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

      const result = render(tmpl, {
        project: {
          name: 'my-app',
          description: 'A cool app',
          framework: 'React',
        },
        rules: ['Use TypeScript', 'Write tests'],
      });

      expect(result).toContain('# my-app');
      expect(result).toContain('A cool app');
      expect(result).toContain('This project uses React.');
      expect(result).toContain('- Use TypeScript');
      expect(result).toContain('- Write tests');
    });

    it('cleans up excessive blank lines', () => {
      const tmpl = 'line1\n\n\n\n\nline2';
      expect(render(tmpl, {})).toBe('line1\n\nline2');
    });

    it('handles template with no placeholders', () => {
      const tmpl = 'Just plain text.';
      expect(render(tmpl, {})).toBe('Just plain text.');
    });
  });
});

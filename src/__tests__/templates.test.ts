import { describe, it, expect } from 'vitest';
import {
  getTemplate,
  CLAUDE_TEMPLATE,
  CURSOR_TEMPLATE,
  AGENTS_TEMPLATE,
  COPILOT_TEMPLATE,
  GEMINI_TEMPLATE,
  WINDSURF_TEMPLATE,
  CLINE_TEMPLATE,
  MCP_TEMPLATE,
} from '../templates/index';
import type { FileFormat } from '../types';

describe('templates', () => {
  describe('built-in templates', () => {
    it('CLAUDE_TEMPLATE is a non-empty string', () => {
      expect(typeof CLAUDE_TEMPLATE).toBe('string');
      expect(CLAUDE_TEMPLATE.length).toBeGreaterThan(100);
    });

    it('CURSOR_TEMPLATE is a non-empty string', () => {
      expect(typeof CURSOR_TEMPLATE).toBe('string');
      expect(CURSOR_TEMPLATE.length).toBeGreaterThan(100);
    });

    it('AGENTS_TEMPLATE is a non-empty string', () => {
      expect(typeof AGENTS_TEMPLATE).toBe('string');
      expect(AGENTS_TEMPLATE.length).toBeGreaterThan(100);
    });

    it('COPILOT_TEMPLATE is a non-empty string', () => {
      expect(typeof COPILOT_TEMPLATE).toBe('string');
      expect(COPILOT_TEMPLATE.length).toBeGreaterThan(100);
    });

    it('GEMINI_TEMPLATE is a non-empty string', () => {
      expect(typeof GEMINI_TEMPLATE).toBe('string');
      expect(GEMINI_TEMPLATE.length).toBeGreaterThan(100);
    });

    it('WINDSURF_TEMPLATE is a non-empty string', () => {
      expect(typeof WINDSURF_TEMPLATE).toBe('string');
      expect(WINDSURF_TEMPLATE.length).toBeGreaterThan(100);
    });

    it('CLINE_TEMPLATE is a non-empty string', () => {
      expect(typeof CLINE_TEMPLATE).toBe('string');
      expect(CLINE_TEMPLATE.length).toBeGreaterThan(100);
    });

    it('MCP_TEMPLATE is a non-empty string', () => {
      expect(typeof MCP_TEMPLATE).toBe('string');
      expect(MCP_TEMPLATE.length).toBeGreaterThan(10);
    });

    it('MCP_TEMPLATE is valid JSON', () => {
      expect(() => JSON.parse(MCP_TEMPLATE)).not.toThrow();
    });

    it('CLAUDE_TEMPLATE contains project.name placeholder', () => {
      expect(CLAUDE_TEMPLATE).toContain('{{project.name}}');
    });

    it('CURSOR_TEMPLATE contains project.language placeholder', () => {
      expect(CURSOR_TEMPLATE).toContain('{{project.language}}');
    });

    it('AGENTS_TEMPLATE contains project.name placeholder', () => {
      expect(AGENTS_TEMPLATE).toContain('{{project.name}}');
    });

    it('COPILOT_TEMPLATE contains project.name placeholder', () => {
      expect(COPILOT_TEMPLATE).toContain('{{project.name}}');
    });

    it('GEMINI_TEMPLATE contains project.name placeholder', () => {
      expect(GEMINI_TEMPLATE).toContain('{{project.name}}');
    });

    it('WINDSURF_TEMPLATE contains project.language placeholder', () => {
      expect(WINDSURF_TEMPLATE).toContain('{{project.language}}');
    });

    it('CLINE_TEMPLATE contains project.name placeholder', () => {
      expect(CLINE_TEMPLATE).toContain('{{project.name}}');
    });

    it('all markdown templates contain conditional blocks', () => {
      const mdTemplates = [
        CLAUDE_TEMPLATE,
        CURSOR_TEMPLATE,
        AGENTS_TEMPLATE,
        COPILOT_TEMPLATE,
        GEMINI_TEMPLATE,
        WINDSURF_TEMPLATE,
        CLINE_TEMPLATE,
      ];
      for (const tmpl of mdTemplates) {
        expect(tmpl).toContain('{{#if');
        expect(tmpl).toContain('{{/if}}');
      }
    });
  });

  describe('getTemplate', () => {
    it('returns built-in template when no custom provided', () => {
      expect(getTemplate('claude')).toBe(CLAUDE_TEMPLATE);
      expect(getTemplate('cursor')).toBe(CURSOR_TEMPLATE);
      expect(getTemplate('agents')).toBe(AGENTS_TEMPLATE);
      expect(getTemplate('copilot')).toBe(COPILOT_TEMPLATE);
      expect(getTemplate('gemini')).toBe(GEMINI_TEMPLATE);
      expect(getTemplate('windsurf')).toBe(WINDSURF_TEMPLATE);
      expect(getTemplate('cline')).toBe(CLINE_TEMPLATE);
      expect(getTemplate('mcp')).toBe(MCP_TEMPLATE);
    });

    it('returns custom template when provided', () => {
      const custom = '# Custom template';
      expect(getTemplate('claude', { claude: custom })).toBe(custom);
    });

    it('falls back to built-in when format not in custom map', () => {
      const custom = { cursor: '# Custom cursor' };
      expect(getTemplate('claude', custom)).toBe(CLAUDE_TEMPLATE);
    });

    it('returns custom for each format independently', () => {
      const customClaude = '# Custom Claude';
      const customCursor = '# Custom Cursor';
      const customs: Partial<Record<FileFormat, string>> = {
        claude: customClaude,
        cursor: customCursor,
      };
      expect(getTemplate('claude', customs)).toBe(customClaude);
      expect(getTemplate('cursor', customs)).toBe(customCursor);
      expect(getTemplate('agents', customs)).toBe(AGENTS_TEMPLATE);
    });
  });
});

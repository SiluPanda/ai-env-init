import { describe, it, expect } from 'vitest';
import { FORMAT_REGISTRY, getFormatMeta } from '../types';
import type { FileFormat, FormatMeta } from '../types';

describe('types', () => {
  describe('FORMAT_REGISTRY', () => {
    it('contains all 8 formats', () => {
      expect(FORMAT_REGISTRY).toHaveLength(8);
    });

    it('has unique IDs', () => {
      const ids = FORMAT_REGISTRY.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('has unique file names', () => {
      const names = FORMAT_REGISTRY.map((f) => f.fileName);
      expect(new Set(names).size).toBe(names.length);
    });

    it('copilot has .github subDir', () => {
      const copilot = FORMAT_REGISTRY.find(
        (f) => f.id === 'copilot',
      ) as FormatMeta;
      expect(copilot.subDir).toBe('.github');
    });

    it('other formats have no subDir', () => {
      const others = FORMAT_REGISTRY.filter((f) => f.id !== 'copilot');
      for (const fmt of others) {
        expect(fmt.subDir).toBeUndefined();
      }
    });

    it('contains expected format IDs', () => {
      const ids = FORMAT_REGISTRY.map((f) => f.id);
      expect(ids).toContain('claude');
      expect(ids).toContain('cursor');
      expect(ids).toContain('agents');
      expect(ids).toContain('copilot');
      expect(ids).toContain('gemini');
      expect(ids).toContain('windsurf');
      expect(ids).toContain('cline');
      expect(ids).toContain('mcp');
    });

    it('contains expected file names', () => {
      const nameMap: Record<FileFormat, string> = {
        claude: 'CLAUDE.md',
        cursor: '.cursorrules',
        agents: 'AGENTS.md',
        copilot: 'copilot-instructions.md',
        gemini: 'GEMINI.md',
        windsurf: '.windsurfrules',
        cline: '.clinerules',
        mcp: '.mcp.json',
      };
      for (const [id, name] of Object.entries(nameMap)) {
        const meta = FORMAT_REGISTRY.find((f) => f.id === id);
        expect(meta).toBeDefined();
        expect(meta!.fileName).toBe(name);
      }
    });
  });

  describe('getFormatMeta', () => {
    it('returns meta for valid format', () => {
      const meta = getFormatMeta('claude');
      expect(meta.id).toBe('claude');
      expect(meta.fileName).toBe('CLAUDE.md');
    });

    it('throws for unknown format', () => {
      expect(() => getFormatMeta('unknown' as FileFormat)).toThrow(
        'Unknown format: unknown',
      );
    });

    it('returns meta for all formats', () => {
      const formats: FileFormat[] = [
        'claude',
        'cursor',
        'agents',
        'copilot',
        'gemini',
        'windsurf',
        'cline',
        'mcp',
      ];
      for (const format of formats) {
        const meta = getFormatMeta(format);
        expect(meta.id).toBe(format);
        expect(meta.fileName).toBeTruthy();
        expect(meta.description).toBeTruthy();
      }
    });
  });
});

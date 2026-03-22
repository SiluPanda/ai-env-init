"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const types_1 = require("../types");
(0, vitest_1.describe)('types', () => {
    (0, vitest_1.describe)('FORMAT_REGISTRY', () => {
        (0, vitest_1.it)('contains all 8 formats', () => {
            (0, vitest_1.expect)(types_1.FORMAT_REGISTRY).toHaveLength(8);
        });
        (0, vitest_1.it)('has unique IDs', () => {
            const ids = types_1.FORMAT_REGISTRY.map((f) => f.id);
            (0, vitest_1.expect)(new Set(ids).size).toBe(ids.length);
        });
        (0, vitest_1.it)('has unique file names', () => {
            const names = types_1.FORMAT_REGISTRY.map((f) => f.fileName);
            (0, vitest_1.expect)(new Set(names).size).toBe(names.length);
        });
        (0, vitest_1.it)('copilot has .github subDir', () => {
            const copilot = types_1.FORMAT_REGISTRY.find((f) => f.id === 'copilot');
            (0, vitest_1.expect)(copilot.subDir).toBe('.github');
        });
        (0, vitest_1.it)('other formats have no subDir', () => {
            const others = types_1.FORMAT_REGISTRY.filter((f) => f.id !== 'copilot');
            for (const fmt of others) {
                (0, vitest_1.expect)(fmt.subDir).toBeUndefined();
            }
        });
        (0, vitest_1.it)('contains expected format IDs', () => {
            const ids = types_1.FORMAT_REGISTRY.map((f) => f.id);
            (0, vitest_1.expect)(ids).toContain('claude');
            (0, vitest_1.expect)(ids).toContain('cursor');
            (0, vitest_1.expect)(ids).toContain('agents');
            (0, vitest_1.expect)(ids).toContain('copilot');
            (0, vitest_1.expect)(ids).toContain('gemini');
            (0, vitest_1.expect)(ids).toContain('windsurf');
            (0, vitest_1.expect)(ids).toContain('cline');
            (0, vitest_1.expect)(ids).toContain('mcp');
        });
        (0, vitest_1.it)('contains expected file names', () => {
            const nameMap = {
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
                const meta = types_1.FORMAT_REGISTRY.find((f) => f.id === id);
                (0, vitest_1.expect)(meta).toBeDefined();
                (0, vitest_1.expect)(meta.fileName).toBe(name);
            }
        });
    });
    (0, vitest_1.describe)('getFormatMeta', () => {
        (0, vitest_1.it)('returns meta for valid format', () => {
            const meta = (0, types_1.getFormatMeta)('claude');
            (0, vitest_1.expect)(meta.id).toBe('claude');
            (0, vitest_1.expect)(meta.fileName).toBe('CLAUDE.md');
        });
        (0, vitest_1.it)('throws for unknown format', () => {
            (0, vitest_1.expect)(() => (0, types_1.getFormatMeta)('unknown')).toThrow('Unknown format: unknown');
        });
        (0, vitest_1.it)('returns meta for all formats', () => {
            const formats = [
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
                const meta = (0, types_1.getFormatMeta)(format);
                (0, vitest_1.expect)(meta.id).toBe(format);
                (0, vitest_1.expect)(meta.fileName).toBeTruthy();
                (0, vitest_1.expect)(meta.description).toBeTruthy();
            }
        });
    });
});
//# sourceMappingURL=types.test.js.map
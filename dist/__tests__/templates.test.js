"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_1 = require("../templates/index");
(0, vitest_1.describe)('templates', () => {
    (0, vitest_1.describe)('built-in templates', () => {
        (0, vitest_1.it)('CLAUDE_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.CLAUDE_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.CLAUDE_TEMPLATE.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('CURSOR_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.CURSOR_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.CURSOR_TEMPLATE.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('AGENTS_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.AGENTS_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.AGENTS_TEMPLATE.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('COPILOT_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.COPILOT_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.COPILOT_TEMPLATE.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('GEMINI_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.GEMINI_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.GEMINI_TEMPLATE.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('WINDSURF_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.WINDSURF_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.WINDSURF_TEMPLATE.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('CLINE_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.CLINE_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.CLINE_TEMPLATE.length).toBeGreaterThan(100);
        });
        (0, vitest_1.it)('MCP_TEMPLATE is a non-empty string', () => {
            (0, vitest_1.expect)(typeof index_1.MCP_TEMPLATE).toBe('string');
            (0, vitest_1.expect)(index_1.MCP_TEMPLATE.length).toBeGreaterThan(10);
        });
        (0, vitest_1.it)('MCP_TEMPLATE is valid JSON', () => {
            (0, vitest_1.expect)(() => JSON.parse(index_1.MCP_TEMPLATE)).not.toThrow();
        });
        (0, vitest_1.it)('CLAUDE_TEMPLATE contains project.name placeholder', () => {
            (0, vitest_1.expect)(index_1.CLAUDE_TEMPLATE).toContain('{{project.name}}');
        });
        (0, vitest_1.it)('CURSOR_TEMPLATE contains project.language placeholder', () => {
            (0, vitest_1.expect)(index_1.CURSOR_TEMPLATE).toContain('{{project.language}}');
        });
        (0, vitest_1.it)('AGENTS_TEMPLATE contains project.name placeholder', () => {
            (0, vitest_1.expect)(index_1.AGENTS_TEMPLATE).toContain('{{project.name}}');
        });
        (0, vitest_1.it)('COPILOT_TEMPLATE contains project.name placeholder', () => {
            (0, vitest_1.expect)(index_1.COPILOT_TEMPLATE).toContain('{{project.name}}');
        });
        (0, vitest_1.it)('GEMINI_TEMPLATE contains project.name placeholder', () => {
            (0, vitest_1.expect)(index_1.GEMINI_TEMPLATE).toContain('{{project.name}}');
        });
        (0, vitest_1.it)('WINDSURF_TEMPLATE contains project.language placeholder', () => {
            (0, vitest_1.expect)(index_1.WINDSURF_TEMPLATE).toContain('{{project.language}}');
        });
        (0, vitest_1.it)('CLINE_TEMPLATE contains project.name placeholder', () => {
            (0, vitest_1.expect)(index_1.CLINE_TEMPLATE).toContain('{{project.name}}');
        });
        (0, vitest_1.it)('all markdown templates contain conditional blocks', () => {
            const mdTemplates = [
                index_1.CLAUDE_TEMPLATE,
                index_1.CURSOR_TEMPLATE,
                index_1.AGENTS_TEMPLATE,
                index_1.COPILOT_TEMPLATE,
                index_1.GEMINI_TEMPLATE,
                index_1.WINDSURF_TEMPLATE,
                index_1.CLINE_TEMPLATE,
            ];
            for (const tmpl of mdTemplates) {
                (0, vitest_1.expect)(tmpl).toContain('{{#if');
                (0, vitest_1.expect)(tmpl).toContain('{{/if}}');
            }
        });
    });
    (0, vitest_1.describe)('getTemplate', () => {
        (0, vitest_1.it)('returns built-in template when no custom provided', () => {
            (0, vitest_1.expect)((0, index_1.getTemplate)('claude')).toBe(index_1.CLAUDE_TEMPLATE);
            (0, vitest_1.expect)((0, index_1.getTemplate)('cursor')).toBe(index_1.CURSOR_TEMPLATE);
            (0, vitest_1.expect)((0, index_1.getTemplate)('agents')).toBe(index_1.AGENTS_TEMPLATE);
            (0, vitest_1.expect)((0, index_1.getTemplate)('copilot')).toBe(index_1.COPILOT_TEMPLATE);
            (0, vitest_1.expect)((0, index_1.getTemplate)('gemini')).toBe(index_1.GEMINI_TEMPLATE);
            (0, vitest_1.expect)((0, index_1.getTemplate)('windsurf')).toBe(index_1.WINDSURF_TEMPLATE);
            (0, vitest_1.expect)((0, index_1.getTemplate)('cline')).toBe(index_1.CLINE_TEMPLATE);
            (0, vitest_1.expect)((0, index_1.getTemplate)('mcp')).toBe(index_1.MCP_TEMPLATE);
        });
        (0, vitest_1.it)('returns custom template when provided', () => {
            const custom = '# Custom template';
            (0, vitest_1.expect)((0, index_1.getTemplate)('claude', { claude: custom })).toBe(custom);
        });
        (0, vitest_1.it)('falls back to built-in when format not in custom map', () => {
            const custom = { cursor: '# Custom cursor' };
            (0, vitest_1.expect)((0, index_1.getTemplate)('claude', custom)).toBe(index_1.CLAUDE_TEMPLATE);
        });
        (0, vitest_1.it)('returns custom for each format independently', () => {
            const customClaude = '# Custom Claude';
            const customCursor = '# Custom Cursor';
            const customs = {
                claude: customClaude,
                cursor: customCursor,
            };
            (0, vitest_1.expect)((0, index_1.getTemplate)('claude', customs)).toBe(customClaude);
            (0, vitest_1.expect)((0, index_1.getTemplate)('cursor', customs)).toBe(customCursor);
            (0, vitest_1.expect)((0, index_1.getTemplate)('agents', customs)).toBe(index_1.AGENTS_TEMPLATE);
        });
    });
});
//# sourceMappingURL=templates.test.js.map
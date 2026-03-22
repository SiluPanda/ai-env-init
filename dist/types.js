"use strict";
// ── File Format ─────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORMAT_REGISTRY = void 0;
exports.getFormatMeta = getFormatMeta;
exports.FORMAT_REGISTRY = [
    {
        id: 'claude',
        fileName: 'CLAUDE.md',
        description: 'Anthropic Claude Code instructions',
    },
    {
        id: 'cursor',
        fileName: '.cursorrules',
        description: 'Cursor IDE rules',
    },
    {
        id: 'agents',
        fileName: 'AGENTS.md',
        description: 'Microsoft Copilot coding agent instructions',
    },
    {
        id: 'copilot',
        fileName: 'copilot-instructions.md',
        subDir: '.github',
        description: 'GitHub Copilot instructions',
    },
    {
        id: 'gemini',
        fileName: 'GEMINI.md',
        description: 'Google Gemini CLI instructions',
    },
    {
        id: 'windsurf',
        fileName: '.windsurfrules',
        description: 'Windsurf (Codeium) rules',
    },
    {
        id: 'cline',
        fileName: '.clinerules',
        description: 'Cline (VS Code extension) rules',
    },
    {
        id: 'mcp',
        fileName: '.mcp.json',
        description: 'MCP server configuration',
    },
];
function getFormatMeta(format) {
    const meta = exports.FORMAT_REGISTRY.find((f) => f.id === format);
    if (!meta) {
        throw new Error(`Unknown format: ${format}`);
    }
    return meta;
}
//# sourceMappingURL=types.js.map
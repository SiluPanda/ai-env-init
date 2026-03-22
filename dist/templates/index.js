"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_TEMPLATE = exports.CLINE_TEMPLATE = exports.WINDSURF_TEMPLATE = exports.GEMINI_TEMPLATE = exports.COPILOT_TEMPLATE = exports.AGENTS_TEMPLATE = exports.CURSOR_TEMPLATE = exports.CLAUDE_TEMPLATE = void 0;
exports.getTemplate = getTemplate;
const claude_1 = require("./claude");
Object.defineProperty(exports, "CLAUDE_TEMPLATE", { enumerable: true, get: function () { return claude_1.CLAUDE_TEMPLATE; } });
const cursor_1 = require("./cursor");
Object.defineProperty(exports, "CURSOR_TEMPLATE", { enumerable: true, get: function () { return cursor_1.CURSOR_TEMPLATE; } });
const agents_1 = require("./agents");
Object.defineProperty(exports, "AGENTS_TEMPLATE", { enumerable: true, get: function () { return agents_1.AGENTS_TEMPLATE; } });
const copilot_1 = require("./copilot");
Object.defineProperty(exports, "COPILOT_TEMPLATE", { enumerable: true, get: function () { return copilot_1.COPILOT_TEMPLATE; } });
const gemini_1 = require("./gemini");
Object.defineProperty(exports, "GEMINI_TEMPLATE", { enumerable: true, get: function () { return gemini_1.GEMINI_TEMPLATE; } });
const windsurf_1 = require("./windsurf");
Object.defineProperty(exports, "WINDSURF_TEMPLATE", { enumerable: true, get: function () { return windsurf_1.WINDSURF_TEMPLATE; } });
const cline_1 = require("./cline");
Object.defineProperty(exports, "CLINE_TEMPLATE", { enumerable: true, get: function () { return cline_1.CLINE_TEMPLATE; } });
const mcp_1 = require("./mcp");
Object.defineProperty(exports, "MCP_TEMPLATE", { enumerable: true, get: function () { return mcp_1.MCP_TEMPLATE; } });
const BUILT_IN_TEMPLATES = {
    claude: claude_1.CLAUDE_TEMPLATE,
    cursor: cursor_1.CURSOR_TEMPLATE,
    agents: agents_1.AGENTS_TEMPLATE,
    copilot: copilot_1.COPILOT_TEMPLATE,
    gemini: gemini_1.GEMINI_TEMPLATE,
    windsurf: windsurf_1.WINDSURF_TEMPLATE,
    cline: cline_1.CLINE_TEMPLATE,
    mcp: mcp_1.MCP_TEMPLATE,
};
/**
 * Get the template for a given format.
 * Custom templates override built-in templates.
 */
function getTemplate(format, customTemplates) {
    if (customTemplates && customTemplates[format]) {
        return customTemplates[format];
    }
    return BUILT_IN_TEMPLATES[format];
}
//# sourceMappingURL=index.js.map
import type { FileFormat } from '../types';
import { CLAUDE_TEMPLATE } from './claude';
import { CURSOR_TEMPLATE } from './cursor';
import { AGENTS_TEMPLATE } from './agents';
import { COPILOT_TEMPLATE } from './copilot';
import { GEMINI_TEMPLATE } from './gemini';
import { WINDSURF_TEMPLATE } from './windsurf';
import { CLINE_TEMPLATE } from './cline';
import { MCP_TEMPLATE } from './mcp';
/**
 * Get the template for a given format.
 * Custom templates override built-in templates.
 */
export declare function getTemplate(format: FileFormat, customTemplates?: Partial<Record<FileFormat, string>>): string;
export { CLAUDE_TEMPLATE, CURSOR_TEMPLATE, AGENTS_TEMPLATE, COPILOT_TEMPLATE, GEMINI_TEMPLATE, WINDSURF_TEMPLATE, CLINE_TEMPLATE, MCP_TEMPLATE, };
//# sourceMappingURL=index.d.ts.map
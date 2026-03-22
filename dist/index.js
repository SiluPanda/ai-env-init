"use strict";
// ai-env-init - Bootstrap all AI config files from a single questionnaire
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormatMeta = exports.FORMAT_REGISTRY = exports.MCP_TEMPLATE = exports.CLINE_TEMPLATE = exports.WINDSURF_TEMPLATE = exports.GEMINI_TEMPLATE = exports.COPILOT_TEMPLATE = exports.AGENTS_TEMPLATE = exports.CURSOR_TEMPLATE = exports.CLAUDE_TEMPLATE = exports.getTemplate = exports.render = exports.buildContext = exports.writeFiles = exports.generate = exports.detect = exports.DEFAULT_FORMATS = exports.buildDefaultAnswers = exports.init = void 0;
// Core API
var init_1 = require("./init");
Object.defineProperty(exports, "init", { enumerable: true, get: function () { return init_1.init; } });
Object.defineProperty(exports, "buildDefaultAnswers", { enumerable: true, get: function () { return init_1.buildDefaultAnswers; } });
Object.defineProperty(exports, "DEFAULT_FORMATS", { enumerable: true, get: function () { return init_1.DEFAULT_FORMATS; } });
var detect_1 = require("./detect");
Object.defineProperty(exports, "detect", { enumerable: true, get: function () { return detect_1.detect; } });
var generator_1 = require("./generator");
Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return generator_1.generate; } });
Object.defineProperty(exports, "writeFiles", { enumerable: true, get: function () { return generator_1.writeFiles; } });
Object.defineProperty(exports, "buildContext", { enumerable: true, get: function () { return generator_1.buildContext; } });
var template_engine_1 = require("./template-engine");
Object.defineProperty(exports, "render", { enumerable: true, get: function () { return template_engine_1.render; } });
// Templates
var index_1 = require("./templates/index");
Object.defineProperty(exports, "getTemplate", { enumerable: true, get: function () { return index_1.getTemplate; } });
Object.defineProperty(exports, "CLAUDE_TEMPLATE", { enumerable: true, get: function () { return index_1.CLAUDE_TEMPLATE; } });
Object.defineProperty(exports, "CURSOR_TEMPLATE", { enumerable: true, get: function () { return index_1.CURSOR_TEMPLATE; } });
Object.defineProperty(exports, "AGENTS_TEMPLATE", { enumerable: true, get: function () { return index_1.AGENTS_TEMPLATE; } });
Object.defineProperty(exports, "COPILOT_TEMPLATE", { enumerable: true, get: function () { return index_1.COPILOT_TEMPLATE; } });
Object.defineProperty(exports, "GEMINI_TEMPLATE", { enumerable: true, get: function () { return index_1.GEMINI_TEMPLATE; } });
Object.defineProperty(exports, "WINDSURF_TEMPLATE", { enumerable: true, get: function () { return index_1.WINDSURF_TEMPLATE; } });
Object.defineProperty(exports, "CLINE_TEMPLATE", { enumerable: true, get: function () { return index_1.CLINE_TEMPLATE; } });
Object.defineProperty(exports, "MCP_TEMPLATE", { enumerable: true, get: function () { return index_1.MCP_TEMPLATE; } });
var types_1 = require("./types");
Object.defineProperty(exports, "FORMAT_REGISTRY", { enumerable: true, get: function () { return types_1.FORMAT_REGISTRY; } });
Object.defineProperty(exports, "getFormatMeta", { enumerable: true, get: function () { return types_1.getFormatMeta; } });
//# sourceMappingURL=index.js.map
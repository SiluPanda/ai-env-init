"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const api = __importStar(require("../index"));
(0, vitest_1.describe)('index exports', () => {
    (0, vitest_1.it)('exports init function', () => {
        (0, vitest_1.expect)(typeof api.init).toBe('function');
    });
    (0, vitest_1.it)('exports detect function', () => {
        (0, vitest_1.expect)(typeof api.detect).toBe('function');
    });
    (0, vitest_1.it)('exports generate function', () => {
        (0, vitest_1.expect)(typeof api.generate).toBe('function');
    });
    (0, vitest_1.it)('exports writeFiles function', () => {
        (0, vitest_1.expect)(typeof api.writeFiles).toBe('function');
    });
    (0, vitest_1.it)('exports buildContext function', () => {
        (0, vitest_1.expect)(typeof api.buildContext).toBe('function');
    });
    (0, vitest_1.it)('exports render function', () => {
        (0, vitest_1.expect)(typeof api.render).toBe('function');
    });
    (0, vitest_1.it)('exports buildDefaultAnswers function', () => {
        (0, vitest_1.expect)(typeof api.buildDefaultAnswers).toBe('function');
    });
    (0, vitest_1.it)('exports getTemplate function', () => {
        (0, vitest_1.expect)(typeof api.getTemplate).toBe('function');
    });
    (0, vitest_1.it)('exports getFormatMeta function', () => {
        (0, vitest_1.expect)(typeof api.getFormatMeta).toBe('function');
    });
    (0, vitest_1.it)('exports FORMAT_REGISTRY array', () => {
        (0, vitest_1.expect)(Array.isArray(api.FORMAT_REGISTRY)).toBe(true);
        (0, vitest_1.expect)(api.FORMAT_REGISTRY.length).toBe(8);
    });
    (0, vitest_1.it)('exports DEFAULT_FORMATS array', () => {
        (0, vitest_1.expect)(Array.isArray(api.DEFAULT_FORMATS)).toBe(true);
        (0, vitest_1.expect)(api.DEFAULT_FORMATS.length).toBe(7);
    });
    (0, vitest_1.it)('exports template constants', () => {
        (0, vitest_1.expect)(typeof api.CLAUDE_TEMPLATE).toBe('string');
        (0, vitest_1.expect)(typeof api.CURSOR_TEMPLATE).toBe('string');
        (0, vitest_1.expect)(typeof api.AGENTS_TEMPLATE).toBe('string');
        (0, vitest_1.expect)(typeof api.COPILOT_TEMPLATE).toBe('string');
        (0, vitest_1.expect)(typeof api.GEMINI_TEMPLATE).toBe('string');
        (0, vitest_1.expect)(typeof api.WINDSURF_TEMPLATE).toBe('string');
        (0, vitest_1.expect)(typeof api.CLINE_TEMPLATE).toBe('string');
        (0, vitest_1.expect)(typeof api.MCP_TEMPLATE).toBe('string');
    });
});
//# sourceMappingURL=index.test.js.map
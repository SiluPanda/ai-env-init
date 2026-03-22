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
exports.buildContext = buildContext;
exports.generate = generate;
exports.writeFiles = writeFiles;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const template_engine_1 = require("./template-engine");
const index_1 = require("./templates/index");
const types_1 = require("./types");
// ── Template Context Building ───────────────────────────────────────
/**
 * Build the template rendering context by merging questionnaire answers,
 * detected project info, and computed values.
 */
function buildContext(answers, info) {
    const ctx = {};
    // Spread questionnaire answers
    ctx.project = { ...answers.project };
    ctx.conventions = { ...answers.conventions };
    ctx.aiBehavior = { ...answers.aiBehavior };
    ctx.testing = { ...answers.testing };
    ctx.safety = { ...answers.safety };
    ctx.team = { ...answers.team };
    // Computed: additionalToolsList
    ctx.project.additionalToolsList =
        answers.project.additionalTools.length > 0
            ? answers.project.additionalTools.join(', ')
            : '';
    // Computed: framework description
    const framework = answers.project.framework;
    if (framework) {
        ctx.primaryFrameworkDescription = `a ${framework} application`;
    }
    else {
        ctx.primaryFrameworkDescription = `a ${answers.project.language} project`;
    }
    // Computed: boolean flags
    ctx.hasPreferredPatterns = answers.conventions.preferredPatterns.length > 0;
    ctx.hasTestExpectations = answers.testing.expectations.length > 0;
    ctx.hasProtectedPaths = answers.safety.protectedPaths.length > 0;
    ctx.hasSecurityConstraints = answers.safety.securityConstraints.length > 0;
    ctx.hasTopicsToAvoid = answers.safety.topicsToAvoid.length > 0;
    ctx.isTypeScript = answers.project.language === 'TypeScript';
    ctx.hasTests = !!answers.testing.framework;
    // Protected paths as a comma-separated string
    ctx.protectedPathsList = answers.safety.protectedPaths
        .map((p) => `\`${p}\``)
        .join(', ');
    // Detection-derived context
    if (info) {
        ctx.monorepo = info.monorepo;
        ctx.isMonorepo = !!info.monorepo;
        ctx.git = info.git;
        ctx.directories = info.directories;
        // Build tools list
        ctx.buildToolsList =
            info.buildTools.length > 0
                ? info.buildTools.map((t) => t.value).join(', ')
                : '';
        // Linters list
        ctx.lintersList =
            info.linters.length > 0
                ? info.linters.map((l) => l.value).join(', ')
                : '';
    }
    else {
        ctx.monorepo = null;
        ctx.isMonorepo = false;
        ctx.git = {
            initialized: false,
            remoteUrl: null,
            host: null,
            commitConvention: null,
            hasHusky: false,
            hasLintStaged: false,
        };
        ctx.directories = {
            source: null,
            tests: null,
            docs: null,
            scripts: null,
            config: null,
            staticAssets: null,
        };
        ctx.buildToolsList = '';
        ctx.lintersList = '';
    }
    return ctx;
}
// ── Estimate Token Count ────────────────────────────────────────────
function estimateTokens(content) {
    return Math.ceil(content.length / 4);
}
// ── File Exists Check ───────────────────────────────────────────────
function fileExistsSafe(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch {
        return false;
    }
}
// ── Generate Function ───────────────────────────────────────────────
/**
 * Generate AI config files from questionnaire answers.
 * Returns GeneratedFile objects without writing to disk.
 */
async function generate(answers, formats, options, info) {
    const projectPath = options?.projectPath
        ? path.resolve(options.projectPath)
        : process.cwd();
    const context = buildContext(answers, info);
    const files = [];
    for (const format of formats) {
        const meta = (0, types_1.getFormatMeta)(format);
        const template = (0, index_1.getTemplate)(format, options?.templates);
        let content;
        if (format === 'mcp') {
            // MCP template is JSON, no template rendering needed
            content = template;
        }
        else {
            content = (0, template_engine_1.render)(template, context);
        }
        // Ensure trailing newline
        if (!content.endsWith('\n')) {
            content += '\n';
        }
        const dir = meta.subDir
            ? path.join(projectPath, meta.subDir)
            : projectPath;
        const filePath = path.join(dir, meta.fileName);
        files.push({
            format,
            fileName: meta.fileName,
            path: filePath,
            content,
            tokens: estimateTokens(content),
            overwrites: fileExistsSafe(filePath),
        });
    }
    return files;
}
/**
 * Write generated files to disk.
 * Returns lists of written and skipped file paths.
 */
function writeFiles(files, options) {
    const written = [];
    const skipped = [];
    if (options?.dryRun) {
        for (const file of files) {
            if (file.overwrites && !options?.force) {
                skipped.push(file.path);
            }
            else {
                written.push(file.path);
            }
        }
        return { written, skipped };
    }
    for (const file of files) {
        if (file.overwrites && !options?.force) {
            skipped.push(file.path);
            continue;
        }
        // Ensure directory exists
        const dir = path.dirname(file.path);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(file.path, file.content, 'utf-8');
        written.push(file.path);
    }
    return { written, skipped };
}
//# sourceMappingURL=generator.js.map
import * as fs from 'node:fs';
import * as path from 'node:path';
import { render } from './template-engine';
import { getTemplate } from './templates/index';
import type {
  FileFormat,
  GeneratedFile,
  GenerateOptions,
  ProjectInfo,
  QuestionnaireAnswers,
} from './types';
import { getFormatMeta } from './types';

// ── Template Context Building ───────────────────────────────────────

/**
 * Build the template rendering context by merging questionnaire answers,
 * detected project info, and computed values.
 */
export function buildContext(
  answers: QuestionnaireAnswers,
  info?: ProjectInfo | null,
): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};

  // Spread questionnaire answers
  ctx.project = { ...answers.project };
  ctx.conventions = { ...answers.conventions };
  ctx.aiBehavior = { ...answers.aiBehavior };
  ctx.testing = { ...answers.testing };
  ctx.safety = { ...answers.safety };
  ctx.team = { ...answers.team };

  // Computed: additionalToolsList
  (ctx.project as Record<string, unknown>).additionalToolsList =
    answers.project.additionalTools.length > 0
      ? answers.project.additionalTools.join(', ')
      : '';

  // Computed: framework description
  const framework = answers.project.framework;
  if (framework) {
    ctx.primaryFrameworkDescription = `a ${framework} application`;
  } else {
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
  } else {
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

function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

// ── File Exists Check ───────────────────────────────────────────────

function fileExistsSafe(filePath: string): boolean {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

// ── Generate Function ───────────────────────────────────────────────

/**
 * Generate AI config files from questionnaire answers.
 * Returns GeneratedFile objects without writing to disk.
 */
export async function generate(
  answers: QuestionnaireAnswers,
  formats: FileFormat[],
  options?: GenerateOptions,
  info?: ProjectInfo | null,
): Promise<GeneratedFile[]> {
  const projectPath = options?.projectPath
    ? path.resolve(options.projectPath)
    : process.cwd();

  const context = buildContext(answers, info);
  const files: GeneratedFile[] = [];

  for (const format of formats) {
    const meta = getFormatMeta(format);
    const template = getTemplate(format, options?.templates);

    let content: string;
    if (format === 'mcp') {
      // MCP template is JSON, no template rendering needed
      content = template;
    } else {
      content = render(template, context);
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

// ── Write Files ─────────────────────────────────────────────────────

export interface WriteOptions {
  /** Overwrite existing files. */
  force?: boolean;
  /** Dry run -- do not write to disk. */
  dryRun?: boolean;
}

export interface WriteResult {
  written: string[];
  skipped: string[];
}

/**
 * Write generated files to disk.
 * Returns lists of written and skipped file paths.
 */
export function writeFiles(
  files: GeneratedFile[],
  options?: WriteOptions,
): WriteResult {
  const written: string[] = [];
  const skipped: string[] = [];

  if (options?.dryRun) {
    for (const file of files) {
      if (file.overwrites && !options?.force) {
        skipped.push(file.path);
      } else {
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

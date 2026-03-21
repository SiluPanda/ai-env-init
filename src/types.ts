// ── File Format ─────────────────────────────────────────────────────

export type FileFormat =
  | 'claude'
  | 'cursor'
  | 'agents'
  | 'copilot'
  | 'gemini'
  | 'windsurf'
  | 'cline'
  | 'mcp';

// ── Detection Types ─────────────────────────────────────────────────

export interface DetectedItem<T> {
  /** The detected value. */
  value: T;
  /** Confidence level of the detection. */
  confidence: 'high' | 'medium' | 'low';
  /** What file or signal produced this detection. */
  source: string;
}

export interface ExistingAIFile {
  /** The format of the existing file. */
  format: FileFormat;
  /** Absolute path to the file. */
  path: string;
  /** File size in bytes. */
  size: number;
}

export interface ProjectInfo {
  /** Project name (from package.json name, Cargo.toml name, go.mod module, etc.) */
  name: string | null;
  /** Project description (from package.json description, etc.) */
  description: string | null;
  /** Primary programming language. */
  language: DetectedItem<string> | null;
  /** All detected languages (for polyglot projects). */
  languages: DetectedItem<string>[];
  /** Detected framework(s). */
  frameworks: DetectedItem<string>[];
  /** Detected test framework(s). */
  testFrameworks: DetectedItem<string>[];
  /** Detected build tool(s). */
  buildTools: DetectedItem<string>[];
  /** Detected linting/formatting tools. */
  linters: DetectedItem<string>[];
  /** Detected package manager. */
  packageManager: DetectedItem<string> | null;
  /** Detected module system. */
  moduleSystem: DetectedItem<string> | null;
  /** Detected monorepo tool and workspace packages. */
  monorepo: {
    tool: DetectedItem<string>;
    packages: string[];
  } | null;
  /** Git information. */
  git: {
    initialized: boolean;
    remoteUrl: string | null;
    host: 'github' | 'gitlab' | 'bitbucket' | 'other' | null;
    commitConvention: DetectedItem<string> | null;
    hasHusky: boolean;
    hasLintStaged: boolean;
  };
  /** Detected directory structure. */
  directories: {
    source: string | null;
    tests: string | null;
    docs: string | null;
    scripts: string | null;
    config: string | null;
    staticAssets: string | null;
  };
  /** Existing AI instruction files found in the project. */
  existingFiles: ExistingAIFile[];
  /** Node.js engine requirement (from package.json engines field). */
  nodeVersion: string | null;
}

// ── Questionnaire Types ─────────────────────────────────────────────

export interface QuestionnaireAnswers {
  /** Project basics. */
  project: {
    name: string;
    description: string;
    language: string;
    framework: string | null;
    additionalTools: string[];
  };
  /** Coding conventions. */
  conventions: {
    namingConvention: 'camelCase' | 'snake_case' | 'PascalCase' | 'kebab-case';
    componentNaming: 'PascalCase' | 'camelCase' | 'snake_case';
    importOrdering:
      | 'external-first'
      | 'alphabetical'
      | 'grouped'
      | 'no-preference';
    errorHandling:
      | 'try-catch'
      | 'result-types'
      | 'error-boundaries'
      | 'framework-default'
      | 'no-preference';
    commentStyle:
      | 'jsdoc-public'
      | 'minimal'
      | 'comprehensive'
      | 'no-preference';
    preferredPatterns: string[];
  };
  /** AI behavior preferences. */
  aiBehavior: {
    verbosity: 'concise' | 'balanced' | 'detailed';
    modificationApproach: 'minimal' | 'refactor-freely' | 'ideal-solution';
    whenUncertain: 'ask' | 'best-judgment' | 'show-options';
    autonomousActions: string[];
  };
  /** Testing configuration. */
  testing: {
    framework: string | null;
    command: string | null;
    expectations: string[];
  };
  /** Safety and constraints. */
  safety: {
    protectedPaths: string[];
    topicsToAvoid: string[];
    securityConstraints: string[];
  };
  /** Team context. */
  team: {
    size: 'solo' | 'small' | 'medium' | 'large';
    reviewProcess:
      | 'pull-requests'
      | 'pair-programming'
      | 'direct-commits'
      | 'no-formal';
    commitConvention:
      | 'conventional'
      | 'scope-prefixed'
      | 'freeform'
      | 'no-convention';
    branchNaming: string | null;
  };
  /** Which formats to generate. */
  formats: FileFormat[];
}

// ── Generate Options ────────────────────────────────────────────────

export interface GenerateOptions {
  /** Project directory (used for path resolution and detection context). */
  projectPath?: string;
  /** Custom templates as strings, keyed by format ID. */
  templates?: Partial<Record<FileFormat, string>>;
  /** Custom template directory. */
  templateDir?: string;
}

// ── Generated File ──────────────────────────────────────────────────

export interface GeneratedFile {
  /** The format of this generated file. */
  format: FileFormat;
  /** The file name (e.g., 'CLAUDE.md', '.cursorrules'). */
  fileName: string;
  /** Absolute path where the file will be written. */
  path: string;
  /** The generated file content. */
  content: string;
  /** Estimated token count (characters / 4). */
  tokens: number;
  /** Whether this file would overwrite an existing file. */
  overwrites: boolean;
}

// ── Init Options ────────────────────────────────────────────────────

export interface InitOptions {
  /** Project directory to initialize. Default: process.cwd(). */
  projectPath?: string;
  /** Formats to generate. Default: all formats except 'mcp'. */
  formats?: FileFormat[];
  /** Non-interactive mode. Accept all defaults without prompting. */
  nonInteractive?: boolean;
  /** Overwrite existing files without prompting. */
  force?: boolean;
  /** Append to existing files instead of overwriting. */
  merge?: boolean;
  /** Pre-filled answers. Merges with detected defaults. */
  answers?: Partial<QuestionnaireAnswers>;
  /** Custom template directory. */
  templateDir?: string;
  /** Custom templates as strings, keyed by format ID. */
  templates?: Partial<Record<FileFormat, string>>;
  /** Whether to validate generated files with ai-rules-lint. */
  validate?: boolean;
  /** Whether to print output to stdout. */
  quiet?: boolean;
  /** Dry run mode -- generate files but do not write to disk. */
  dryRun?: boolean;
}

// ── Init Result ─────────────────────────────────────────────────────

export interface InitResult {
  /** The detected project info. */
  detection: ProjectInfo;
  /** The questionnaire answers (including defaults). */
  answers: QuestionnaireAnswers;
  /** The generated files. */
  files: GeneratedFile[];
  /** Files that were written to disk. */
  written: string[];
  /** Files that were skipped (already existed). */
  skipped: string[];
}

// ── Initializer ─────────────────────────────────────────────────────

export interface InitializerConfig {
  /** Formats to generate. */
  formats?: FileFormat[];
  /** Custom template directory. */
  templateDir?: string;
  /** Custom templates. */
  templates?: Partial<Record<FileFormat, string>>;
  /** Default answers to merge with detection. */
  defaults?: Partial<QuestionnaireAnswers>;
  /** Validation. */
  validate?: boolean;
}

export interface Initializer {
  /** Run the full init flow for a project. */
  init(
    projectPath: string,
    options?: Partial<InitOptions>,
  ): Promise<InitResult>;
  /** Run detection only. */
  detect(projectPath: string): Promise<ProjectInfo>;
  /** Generate files without writing. */
  generate(
    answers: QuestionnaireAnswers,
    projectPath?: string,
  ): Promise<GeneratedFile[]>;
}

// ── Format Metadata ─────────────────────────────────────────────────

export interface FormatMeta {
  id: FileFormat;
  fileName: string;
  /** Subdirectory relative to project root (e.g., '.github' for copilot). */
  subDir?: string;
  description: string;
}

export const FORMAT_REGISTRY: FormatMeta[] = [
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

export function getFormatMeta(format: FileFormat): FormatMeta {
  const meta = FORMAT_REGISTRY.find((f) => f.id === format);
  if (!meta) {
    throw new Error(`Unknown format: ${format}`);
  }
  return meta;
}

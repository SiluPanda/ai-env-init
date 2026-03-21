import { detect } from './detect';
import { generate, writeFiles } from './generator';
import type {
  FileFormat,
  InitOptions,
  InitResult,
  QuestionnaireAnswers,
  ProjectInfo,
} from './types';

// ── Default Formats ─────────────────────────────────────────────────

const DEFAULT_FORMATS: FileFormat[] = [
  'claude',
  'cursor',
  'agents',
  'copilot',
  'gemini',
  'windsurf',
  'cline',
];

// ── Build Default Answers ───────────────────────────────────────────

function languageDefaults(
  language: string,
): Pick<
  QuestionnaireAnswers['conventions'],
  'namingConvention' | 'componentNaming'
> {
  switch (language) {
    case 'Python':
      return { namingConvention: 'snake_case', componentNaming: 'PascalCase' };
    case 'Rust':
      return { namingConvention: 'snake_case', componentNaming: 'PascalCase' };
    case 'Go':
      return { namingConvention: 'camelCase', componentNaming: 'PascalCase' };
    case 'Ruby':
      return { namingConvention: 'snake_case', componentNaming: 'PascalCase' };
    case 'C#':
      return { namingConvention: 'PascalCase', componentNaming: 'PascalCase' };
    case 'Java':
      return { namingConvention: 'camelCase', componentNaming: 'PascalCase' };
    default:
      return { namingConvention: 'camelCase', componentNaming: 'PascalCase' };
  }
}

export function buildDefaultAnswers(info: ProjectInfo): QuestionnaireAnswers {
  const language = info.language?.value ?? 'TypeScript';
  const langDefs = languageDefaults(language);

  return {
    project: {
      name: info.name ?? 'my-project',
      description: info.description ?? '',
      language,
      framework: info.frameworks[0]?.value ?? null,
      additionalTools: [],
    },
    conventions: {
      namingConvention: langDefs.namingConvention,
      componentNaming: langDefs.componentNaming,
      importOrdering: 'external-first',
      errorHandling: 'try-catch',
      commentStyle: 'jsdoc-public',
      preferredPatterns: [],
    },
    aiBehavior: {
      verbosity: 'balanced',
      modificationApproach: 'minimal',
      whenUncertain: 'ask',
      autonomousActions: [
        'May create new files',
        'Should always ask before destructive actions',
      ],
    },
    testing: {
      framework: info.testFrameworks[0]?.value ?? null,
      command: detectTestCommand(info),
      expectations: [
        'Write tests for new features',
        'Update tests when changing behavior',
      ],
    },
    safety: {
      protectedPaths: ['.env', 'node_modules/'],
      topicsToAvoid: [],
      securityConstraints: [
        'Never commit secrets',
        'Never expose API keys',
      ],
    },
    team: {
      size: 'small',
      reviewProcess: info.git.host === 'github' ? 'pull-requests' : 'no-formal',
      commitConvention: info.git.commitConvention?.value === 'conventional'
        ? 'conventional'
        : 'freeform',
      branchNaming: null,
    },
    formats: DEFAULT_FORMATS,
  };
}

function detectTestCommand(info: ProjectInfo): string | null {
  if (!info.testFrameworks.length) return null;

  const framework = info.testFrameworks[0].value;
  switch (framework) {
    case 'Vitest':
    case 'Jest':
    case 'Mocha':
      return 'npm test';
    case 'pytest':
      return 'pytest';
    case 'go test':
      return 'go test ./...';
    default:
      return 'npm test';
  }
}

// ── Merge Answers ───────────────────────────────────────────────────

function mergeAnswers(
  defaults: QuestionnaireAnswers,
  overrides?: Partial<QuestionnaireAnswers>,
): QuestionnaireAnswers {
  if (!overrides) return defaults;

  return {
    project: { ...defaults.project, ...overrides.project },
    conventions: { ...defaults.conventions, ...overrides.conventions },
    aiBehavior: { ...defaults.aiBehavior, ...overrides.aiBehavior },
    testing: { ...defaults.testing, ...overrides.testing },
    safety: { ...defaults.safety, ...overrides.safety },
    team: { ...defaults.team, ...overrides.team },
    formats: overrides.formats ?? defaults.formats,
  };
}

// ── Init Function ───────────────────────────────────────────────────

/**
 * Initialize AI config files for a project.
 * Detects project characteristics, builds default answers,
 * merges with provided overrides, and generates files.
 */
export async function init(options?: InitOptions): Promise<InitResult> {
  const projectPath = options?.projectPath ?? process.cwd();

  // Step 1: Detect project characteristics
  const detection = await detect(projectPath);

  // Step 2: Build default answers from detection
  const defaults = buildDefaultAnswers(detection);

  // Step 3: Merge with user-provided answers
  const answers = mergeAnswers(defaults, options?.answers);

  // Override formats from options if provided
  const selectedFormats = options?.formats ?? answers.formats ?? DEFAULT_FORMATS;

  // Step 4: Generate files
  const files = await generate(
    answers,
    selectedFormats,
    {
      projectPath,
      templates: options?.templates,
      templateDir: options?.templateDir,
    },
    detection,
  );

  // Step 5: Write files
  const { written, skipped } = writeFiles(files, {
    force: options?.force,
    dryRun: options?.dryRun,
  });

  return {
    detection,
    answers,
    files,
    written,
    skipped,
  };
}

export { DEFAULT_FORMATS };

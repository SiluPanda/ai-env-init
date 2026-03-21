// ai-env-init - Bootstrap all AI config files from a single questionnaire

// Core API
export { init, buildDefaultAnswers, DEFAULT_FORMATS } from './init';
export { detect } from './detect';
export { generate, writeFiles, buildContext } from './generator';
export { render } from './template-engine';

// Templates
export {
  getTemplate,
  CLAUDE_TEMPLATE,
  CURSOR_TEMPLATE,
  AGENTS_TEMPLATE,
  COPILOT_TEMPLATE,
  GEMINI_TEMPLATE,
  WINDSURF_TEMPLATE,
  CLINE_TEMPLATE,
  MCP_TEMPLATE,
} from './templates/index';

// Types
export type {
  FileFormat,
  DetectedItem,
  ExistingAIFile,
  ProjectInfo,
  QuestionnaireAnswers,
  GenerateOptions,
  GeneratedFile,
  InitOptions,
  InitResult,
  InitializerConfig,
  Initializer,
  FormatMeta,
} from './types';

export { FORMAT_REGISTRY, getFormatMeta } from './types';

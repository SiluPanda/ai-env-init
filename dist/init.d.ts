import type { FileFormat, InitOptions, InitResult, QuestionnaireAnswers, ProjectInfo } from './types';
declare const DEFAULT_FORMATS: FileFormat[];
export declare function buildDefaultAnswers(info: ProjectInfo): QuestionnaireAnswers;
/**
 * Initialize AI config files for a project.
 * Detects project characteristics, builds default answers,
 * merges with provided overrides, and generates files.
 */
export declare function init(options?: InitOptions): Promise<InitResult>;
export { DEFAULT_FORMATS };
//# sourceMappingURL=init.d.ts.map
import type { FileFormat, GeneratedFile, GenerateOptions, ProjectInfo, QuestionnaireAnswers } from './types';
/**
 * Build the template rendering context by merging questionnaire answers,
 * detected project info, and computed values.
 */
export declare function buildContext(answers: QuestionnaireAnswers, info?: ProjectInfo | null): Record<string, unknown>;
/**
 * Generate AI config files from questionnaire answers.
 * Returns GeneratedFile objects without writing to disk.
 */
export declare function generate(answers: QuestionnaireAnswers, formats: FileFormat[], options?: GenerateOptions, info?: ProjectInfo | null): Promise<GeneratedFile[]>;
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
export declare function writeFiles(files: GeneratedFile[], options?: WriteOptions): WriteResult;
//# sourceMappingURL=generator.d.ts.map
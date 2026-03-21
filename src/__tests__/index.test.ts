import { describe, it, expect } from 'vitest';
import * as api from '../index';

describe('index exports', () => {
  it('exports init function', () => {
    expect(typeof api.init).toBe('function');
  });

  it('exports detect function', () => {
    expect(typeof api.detect).toBe('function');
  });

  it('exports generate function', () => {
    expect(typeof api.generate).toBe('function');
  });

  it('exports writeFiles function', () => {
    expect(typeof api.writeFiles).toBe('function');
  });

  it('exports buildContext function', () => {
    expect(typeof api.buildContext).toBe('function');
  });

  it('exports render function', () => {
    expect(typeof api.render).toBe('function');
  });

  it('exports buildDefaultAnswers function', () => {
    expect(typeof api.buildDefaultAnswers).toBe('function');
  });

  it('exports getTemplate function', () => {
    expect(typeof api.getTemplate).toBe('function');
  });

  it('exports getFormatMeta function', () => {
    expect(typeof api.getFormatMeta).toBe('function');
  });

  it('exports FORMAT_REGISTRY array', () => {
    expect(Array.isArray(api.FORMAT_REGISTRY)).toBe(true);
    expect(api.FORMAT_REGISTRY.length).toBe(8);
  });

  it('exports DEFAULT_FORMATS array', () => {
    expect(Array.isArray(api.DEFAULT_FORMATS)).toBe(true);
    expect(api.DEFAULT_FORMATS.length).toBe(7);
  });

  it('exports template constants', () => {
    expect(typeof api.CLAUDE_TEMPLATE).toBe('string');
    expect(typeof api.CURSOR_TEMPLATE).toBe('string');
    expect(typeof api.AGENTS_TEMPLATE).toBe('string');
    expect(typeof api.COPILOT_TEMPLATE).toBe('string');
    expect(typeof api.GEMINI_TEMPLATE).toBe('string');
    expect(typeof api.WINDSURF_TEMPLATE).toBe('string');
    expect(typeof api.CLINE_TEMPLATE).toBe('string');
    expect(typeof api.MCP_TEMPLATE).toBe('string');
  });
});

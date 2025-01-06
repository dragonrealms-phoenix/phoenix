import { describe, expect, it } from 'vitest';
import { LogLevel } from '../../types.js';
import { compareLogLevels } from '../compare-log-levels.js';

describe('compare-log-levels', () => {
  it('compares log levels to ERROR', () => {
    expect(compareLogLevels(LogLevel.ERROR, LogLevel.ERROR)).toBe(0);
    expect(compareLogLevels(LogLevel.ERROR, LogLevel.WARN)).toBe(1);
    expect(compareLogLevels(LogLevel.ERROR, LogLevel.INFO)).toBe(2);
    expect(compareLogLevels(LogLevel.ERROR, LogLevel.DEBUG)).toBe(3);
    expect(compareLogLevels(LogLevel.ERROR, LogLevel.TRACE)).toBe(4);
  });

  it('compares log levels to WARN', () => {
    expect(compareLogLevels(LogLevel.WARN, LogLevel.ERROR)).toBe(-1);
    expect(compareLogLevels(LogLevel.WARN, LogLevel.WARN)).toBe(0);
    expect(compareLogLevels(LogLevel.WARN, LogLevel.INFO)).toBe(1);
    expect(compareLogLevels(LogLevel.WARN, LogLevel.DEBUG)).toBe(2);
    expect(compareLogLevels(LogLevel.WARN, LogLevel.TRACE)).toBe(3);
  });

  it('compares log levels to INFO', () => {
    expect(compareLogLevels(LogLevel.INFO, LogLevel.ERROR)).toBe(-2);
    expect(compareLogLevels(LogLevel.INFO, LogLevel.WARN)).toBe(-1);
    expect(compareLogLevels(LogLevel.INFO, LogLevel.INFO)).toBe(0);
    expect(compareLogLevels(LogLevel.INFO, LogLevel.DEBUG)).toBe(1);
    expect(compareLogLevels(LogLevel.INFO, LogLevel.TRACE)).toBe(2);
  });

  it('compares log levels to DEBUG', () => {
    expect(compareLogLevels(LogLevel.DEBUG, LogLevel.ERROR)).toBe(-3);
    expect(compareLogLevels(LogLevel.DEBUG, LogLevel.WARN)).toBe(-2);
    expect(compareLogLevels(LogLevel.DEBUG, LogLevel.INFO)).toBe(-1);
    expect(compareLogLevels(LogLevel.DEBUG, LogLevel.DEBUG)).toBe(0);
    expect(compareLogLevels(LogLevel.DEBUG, LogLevel.TRACE)).toBe(1);
  });

  it('compares log levels to TRACE', () => {
    expect(compareLogLevels(LogLevel.TRACE, LogLevel.ERROR)).toBe(-4);
    expect(compareLogLevels(LogLevel.TRACE, LogLevel.WARN)).toBe(-3);
    expect(compareLogLevels(LogLevel.TRACE, LogLevel.INFO)).toBe(-2);
    expect(compareLogLevels(LogLevel.TRACE, LogLevel.DEBUG)).toBe(-1);
    expect(compareLogLevels(LogLevel.TRACE, LogLevel.TRACE)).toBe(0);
  });

  it('returns NaN if log levels are not found', () => {
    expect(compareLogLevels('foo' as LogLevel, LogLevel.ERROR)).toBe(NaN);
    expect(compareLogLevels(LogLevel.ERROR, 'foo' as LogLevel)).toBe(NaN);
  });
});

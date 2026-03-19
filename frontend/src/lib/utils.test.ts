import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const condition = false;
    expect(cn('foo', condition && 'bar', 'baz')).toBe('foo baz');
  });

  it('resolves tailwind conflicts by keeping the last value', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles undefined and null values gracefully', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('returns empty string when no args', () => {
    expect(cn()).toBe('');
  });
});

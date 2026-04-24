import { describe, expect, it } from 'vitest';
import { shuffle, seededShuffle } from '@/lib/shuffle';

describe('shuffle', () => {
  it('returns array of same length', () => {
    const result = shuffle([1, 2, 3, 4, 5]);
    expect(result).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input);
  });

  it('does not mutate original', () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('seededShuffle', () => {
  it('is deterministic for the same seed', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7], 42);
    const b = seededShuffle([1, 2, 3, 4, 5, 6, 7], 42);
    expect(a).toEqual(b);
  });

  it('differs across seeds', () => {
    const a = seededShuffle([1, 2, 3, 4, 5, 6, 7], 1);
    const b = seededShuffle([1, 2, 3, 4, 5, 6, 7], 2);
    expect(a).not.toEqual(b);
  });
});

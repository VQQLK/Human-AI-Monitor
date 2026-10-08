import { describe, it, expect } from 'vitest';

describe('extractVoice — Unicode-aware matching', () => {
  function matchKeyword(title: string, keyword: string): boolean {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
    const re = new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'u');
    return re.test(title.toLowerCase());
  }

  it('matches Latin name at word boundary', () => {
    expect(matchKeyword('Sam Altman to Decoded', 'Altman')).toBe(true);
  });
  it('does not match Latin name inside word', () => {
    expect(matchKeyword('Laltman says', 'Altman')).toBe(false);
    expect(matchKeyword('AltmanX', 'Altman')).toBe(false);
  });
  it('matches CJK name', () => {
    expect(matchKeyword('CEO 梁文锋 said today', '梁文锋')).toBe(true);
  });
  it('matches CJK name surrounded by punctuation', () => {
    expect(matchKeyword('(梁文锋) announced', '梁文锋')).toBe(true);
  });
  it('does not match CJK name inside another CJK word', () => {
    expect(matchKeyword('大梁文锋國', '梁文锋')).toBe(false);
  });
  it('matches mixed CJK-Latin', () => {
    expect(matchKeyword('DeepSeek CEO 梁文锋', '梁文锋')).toBe(true);
  });
  it('matches Cyrillic name', () => {
    expect(matchKeyword('Илон Маск заявил', 'Маск')).toBe(true);
  });
  it('does not match Cyrillic inside word', () => {
    expect(matchKeyword('Масков', 'Маск')).toBe(false);
  });
});

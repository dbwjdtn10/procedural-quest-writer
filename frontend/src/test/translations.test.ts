import { describe, it, expect } from 'vitest';
import { translations } from '../i18n/translations';

describe('Translations', () => {
  it('should have ko and en locales', () => {
    expect(translations.ko).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it('should have matching keys for both locales', () => {
    const koKeys = Object.keys(translations.ko).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(koKeys).toEqual(enKeys);
  });

  it('should have non-empty values for all keys', () => {
    for (const [key, value] of Object.entries(translations.ko)) {
      if (typeof value === 'string') {
        expect(value.length, `ko.${key} should not be empty`).toBeGreaterThan(0);
      }
    }
    for (const [key, value] of Object.entries(translations.en)) {
      if (typeof value === 'string') {
        expect(value.length, `en.${key} should not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it('should have quest type labels for all types', () => {
    const types = ['main', 'side', 'daily', 'hidden'];
    types.forEach(type => {
      expect(translations.ko.questTypeLabel[type]).toBeDefined();
      expect(translations.en.questTypeLabel[type]).toBeDefined();
    });
  });

  it('should have difficulty labels for all difficulties', () => {
    const diffs = ['easy', 'normal', 'hard', 'legendary'];
    diffs.forEach(d => {
      expect(translations.ko.difficultyLabel[d]).toBeDefined();
      expect(translations.en.difficultyLabel[d]).toBeDefined();
    });
  });
});

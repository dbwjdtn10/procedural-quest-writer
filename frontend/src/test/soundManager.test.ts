import { describe, it, expect, beforeEach } from 'vitest';
import { soundManager } from '../utils/soundManager';

describe('SoundManager', () => {
  beforeEach(() => {
    soundManager.enabled = false;
  });

  it('should be disabled by default in test', () => {
    expect(soundManager.enabled).toBe(false);
  });

  it('should toggle enabled state', () => {
    soundManager.enabled = true;
    expect(soundManager.enabled).toBe(true);
    soundManager.enabled = false;
    expect(soundManager.enabled).toBe(false);
  });

  it('should not throw when playing sounds while disabled', () => {
    expect(() => soundManager.playGenerateStart()).not.toThrow();
    expect(() => soundManager.playGenerateComplete()).not.toThrow();
    expect(() => soundManager.playBranchSelect()).not.toThrow();
    expect(() => soundManager.playError()).not.toThrow();
    expect(() => soundManager.playClick()).not.toThrow();
  });
});

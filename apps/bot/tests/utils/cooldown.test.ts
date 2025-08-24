import { describe, expect, it } from 'vitest';
import { cooldownsWithAbilityHaste } from '../../src/utils/cooldown.ts';

describe('cooldownsWithAbilityHaste', () => {
  it('should return the proper cooldowns', () => {
    expect(cooldownsWithAbilityHaste([10, 20, 30], 100)).toBe('5, 10, 15');
  });
});

import { describe, expect, it } from '@jest/globals';
import { isExempt } from './checkSpam';

describe('spam', () => {
  describe('isExempt', () => {
    describe('returns true', () => {
      it('if one of the badges are in the exemption list', () => {
        expect(isExempt(['vip', 'subscriber', 'glhf-pledge'])).toBeTruthy();
      });

      it('if all of the badges are in the exemption list', () => {
        expect(isExempt(['vip', 'broadcaster'])).toBeTruthy();
      });
    });

    describe('returns false', () => {
      it('if none of the badges are in the exemption list', () => {
        expect(isExempt(['glhf-pledge', 'subscriber'])).toBeFalsy();
      });
    });
  });
});

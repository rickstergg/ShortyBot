import { describe, expect, it } from '@jest/globals';
import { clipEditUrl } from '../../src/utils/urls.ts';

describe('clipEditUrl', () => {
  it('should return the clip edit url for a twitch clip id', () => {
    expect(clipEditUrl('RelatedTallBeaverDuDudu-jGdkYkPN-JA7OdcP')).toBe(
      'https://clips.twitch.tv/RelatedTallBeaverDuDudu-jGdkYkPN-JA7OdcP/edit',
    );
  });
});

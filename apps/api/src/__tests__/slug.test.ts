import { generateSlug } from '../utils/slug';

describe('generateSlug', () => {
  it('converts text to lowercase slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(generateSlug('Hello! @World#')).toBe('hello-world');
  });

  it('handles multiple spaces', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
  });

  it('trims leading/trailing dashes', () => {
    expect(generateSlug('--Hello--')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('');
  });
});

import { describe, expect, it } from 'vitest';
import * as urls from '../urls.js';

describe('URLs', () => {
  it('GITHUB_BASE_URL', () => {
    expect(urls.GITHUB_BASE_URL).toBe(
      'https://github.com/dragonrealms-phoenix/phoenix'
    );
  });

  it('PHOENIX_DOCS_URL', () => {
    expect(urls.PHOENIX_DOCS_URL).toBe(
      'https://github.com/dragonrealms-phoenix/phoenix#readme'
    );
  });

  it('PHOENIX_ISSUES_URL', () => {
    expect(urls.PHOENIX_ISSUES_URL).toBe(
      'https://github.com/dragonrealms-phoenix/phoenix/issues'
    );
  });

  it('PHOENIX_RELEASES_URL', () => {
    expect(urls.PHOENIX_RELEASES_URL).toBe(
      'https://github.com/dragonrealms-phoenix/phoenix/releases'
    );
  });

  it('PHOENIX_LICENSE_URL', () => {
    expect(urls.PHOENIX_LICENSE_URL).toBe(
      'https://github.com/dragonrealms-phoenix/phoenix/blob/main/LICENSE.md'
    );
  });

  it('PHOENIX_PRIVACY_URL', () => {
    expect(urls.PHOENIX_PRIVACY_URL).toBe(
      'https://github.com/dragonrealms-phoenix/phoenix/blob/main/PRIVACY.md'
    );
  });

  it('PHOENIX_SECURITY_URL', () => {
    expect(urls.PHOENIX_SECURITY_URL).toBe(
      'https://github.com/dragonrealms-phoenix/phoenix/blob/main/SECURITY.md'
    );
  });

  it('PLAY_NET_URL', () => {
    expect(urls.PLAY_NET_URL).toBe('http://play.net/dr');
  });

  it('ELANTHIPEDIA_URL', () => {
    expect(urls.ELANTHIPEDIA_URL).toBe('https://elanthipedia.play.net');
  });
});

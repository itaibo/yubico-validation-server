import { encrypt, decrypt } from '@/lib/encryption';

const strings: { plain: string, encrypted: string | null } = {
  plain: 'hey',
  encrypted: null,
};

describe('Encryption module', () => {
  it('Must encrypt string', () => {
    strings.encrypted = encrypt(strings.plain);
    expect(strings.encrypted).not.toBe(strings.plain);
  });

  it('Must decrypt string', () => {
    expect(decrypt(strings.encrypted as string)).toBe(strings.plain);
  });
});

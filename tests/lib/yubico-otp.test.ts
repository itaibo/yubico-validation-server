import { parseOtp } from '@/lib/yubico-otp';

const testParameters = {
  publicId: 'tttttttttttt',
  privateId: 'be9d7dc18d60',
  secretKey: '26a2b67387c6f35cc734904ac8f3b7c0',
};

const validOtps = [
  'ttttttttttttcnljevckefkunntukdkgeurgicelkldj',
  'ttttttttttttrvinvbfjulukglnddkglhukhlrendcdr',
  'tttttttttttthejehnbuuljbecevcvttnterlkhnikbb',
];

describe('Yubico OTP parser module', () => {
  it('Must return false on invalid OTP code', () => {
    expect(parseOtp({ otp: 'invalidOtpCode', key: 'secretKey' })).toBe(false);
  });

  it('Must return false on invalid key', () => {
    expect(parseOtp({ otp: validOtps[0], key: 'secretKey' })).toBe(false);
  });

  it('Must return parsed OTP', () => {
    validOtps.forEach(validOtp => {
      expect(parseOtp({ otp: validOtp, key: testParameters.secretKey })).toMatchObject({
        pubUid: testParameters.publicId,
        uid: testParameters.privateId,
      });
    });
  });
});

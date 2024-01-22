import Cryptr from 'cryptr';
const cryptr = new Cryptr(process.env.ENCRYPTION_KEY || '');

export const encrypt = (string: string): string => {
  return cryptr.encrypt(string);
};

export const decrypt = (encryptedString: string): string => {
  return cryptr.decrypt(encryptedString);
};

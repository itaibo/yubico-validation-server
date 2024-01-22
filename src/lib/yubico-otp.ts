/**
 * Copyright (c) 2014 Jakub Fedyczak
 * https://github.com/jfedyczak/node-yubikeyotp/blob/master/LICENSE
 * 
 * Modified by (c) Iñigo Taibo <itaibo@hey.com>
*/

import crypto from 'crypto';

const mh: { [key: string]: string } = {
  'c': '0',
  'b': '1',
  'd': '2',
  'e': '3',
  'f': '4',
  'g': '5',
  'h': '6',
  'i': '7',
  'j': '8',
  'k': '9',
  'l': 'a',
  'n': 'b',
  'r': 'c',
  't': 'd',
  'u': 'e',
  'v': 'f'
};

const crc16 = (buf: Buffer) =>  {
  let i, j, m_crc, x, _i, _j, _len;

  m_crc = 0xffff;

  for (_i = 0, _len = buf.length; _i < _len; _i++) {
    x = buf[_i];
    m_crc ^= x;

    for (i = _j = 0; _j <= 7; i = ++_j) {
      j = m_crc & 1;
      m_crc >>= 1;
      if (j) m_crc ^= 0x8408;
    }
  }

  return m_crc;
};

const modhexDecode = (s: string) => {
  let c, w, _i, _len;

  w = '';

  for (_i = 0, _len = s.length; _i < _len; _i++) {
    c = s[_i];
    w += mh[c];
  }

  return w;
};

export const parseOtp = (params: { otp: string, key: string }) => {
  let data, decipher, msg, pub_id, result;

  const otp: RegExpExecArray | null = /^([cbdefghiujklnrtuv]{2,32})([cbdefghiujklnrtuv]{32})$/.exec(params.otp);
  if (!otp) return false;

  const key = Buffer.from(params.key, 'hex');
  pub_id = otp[1];
  msg = modhexDecode(otp[2]);
  msg = Buffer.from(msg, 'hex');

  try {
    decipher = crypto.createDecipheriv('aes-128-ecb', key, '');
  } catch {
    return false;
  }
  
  decipher.setAutoPadding(false);
  data = Buffer.concat([decipher.update(msg), decipher.final()]);

  if ((crc16(data)) !== 0xf0b8) return false;

  result = {
    pubUid: pub_id,
    uid: data.slice(0, 6).toString('hex'),
    useCtr: data[6] + (data[7] << 8),
    tstp: data[8] + (data[9] << 8) + (data[10] << 16),
    sessionCtr: data[11],
    rnd: data[12] + (data[13] << 8),
    crc: data[14] + (data[15] << 8)
  };

  return result;
};

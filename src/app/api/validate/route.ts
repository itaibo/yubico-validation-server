import { NextRequest, NextResponse } from 'next/server';
import { parseOtp } from '@/lib/yubico-otp';
import { redis } from '@/infrastructure/redis';
import { decrypt } from '@/lib/encryption';
import { RedisRecord } from '@/types';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const otp = searchParams.get('otp');

  if (!otp) {
    return NextResponse.json({ error: 'Provide an otp' }, { status: 403 });
  }

  // Get publicId from OTP
  const publicId = otp.slice(0, 12);

  // Check if it is registered
  const existingKey = await redis.hgetall(publicId) as RedisRecord | null;

  if (!existingKey) {
    return NextResponse.json({ error: 'Key not registered' }, { status: 403 });
  }

  // Decrypt sensitive information
  const decryptedPrivateId = decrypt(existingKey.privateId);
  const decryptedSecretKey = decrypt(existingKey.secretKey);

  // Parse OTP
  const parsedOtp = parseOtp({ otp, key: decryptedSecretKey });

  // Invalid secret key
  if (!parsedOtp) {
    return NextResponse.json({ error: 'Invalid OTP', isValid: false }, { status: 403 });
  }

  // Mismatch between private IDs
  if (parsedOtp.uid !== decryptedPrivateId) {
    return NextResponse.json({ error: 'Private ID mismatch', isValid: false }, { status: 403 });
  }

  // Check counters - Stored numbers are strings
  const storedCounter = parseInt(existingKey.counter);
  const storedSessionCounter = parseInt(existingKey.sessionCounter);

  const currentCounter = parsedOtp.useCtr;
  const currentSessionCounter = parsedOtp.sessionCtr;

  // Check if OTP counter is older than stored one
  if (currentCounter < storedCounter) {
    return NextResponse.json({ error: 'Invalid counter', isValid: false }, { status: 403 });
  }

  // If same session, check if session counter is older or equal than stored one
  if (currentCounter === storedCounter) {
    if (currentSessionCounter <= storedSessionCounter) {
      return NextResponse.json({ error: 'Invalid session counter', isValid: false }, { status: 403 });
    }
  }

  // Update counters
  await redis.hset(publicId, {
    counter: currentCounter,
    sessionCounter: currentSessionCounter,
  });

  return NextResponse.json({ success: true, isValid: true, publicId }, { status: 200 });
};

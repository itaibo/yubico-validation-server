import { NextRequest, NextResponse } from 'next/server';
import * as yup from 'yup';

import { validateSchema } from '@/utils/validate-schema';
import { parseOtp } from '@/lib/yubico-otp';

const schema = yup.object({
  publicId: yup.string().required(),
  privateId: yup.string().required(),
  secretKey: yup.string().required(),
  otp: yup.string().required(),
});

export type RegisterBody = yup.InferType<typeof schema>;

export const POST = async (req: NextRequest) => {
  // Handle body
  const body = await req.json();

  // Parse body params based on schema
  const parsed = await validateSchema({ schema, data: body });

  // Return validation error if cannot be parsed
  if (!parsed) {
    return NextResponse.json({ error: 'Provide publicId, privateId, secretKey, and otp as strings' }, { status: 403 });
  }

  // Parse OTP to check if it is correct
  const parsedOtp = parseOtp({ otp: parsed.otp, key: parsed.secretKey });

  // Invalid OTP
  if (!parsedOtp) {
    return NextResponse.json({ error: 'Invalid Yubico OTP configuration' }, { status: 403 });
  }

  // Check if matches
  if (parsedOtp.pubUid !== parsed.publicId) {
    return NextResponse.json({ error: 'Public IDs don\'t match' }, { status: 403 });
  }

  if (parsedOtp.uid !== parsed.privateId) {
    return NextResponse.json({ error: 'Private IDs don\'t match' }, { status: 403 });
  }

  // Check if public ID already registered.
  // If private key is the same, can rewrite.

  // Encrypt secret key and private key

  // Register key in database
  // publicId: { secretKey, privateKey, sessionCounter, counter }

  return NextResponse.json({ success: true }, { status: 200 });
};

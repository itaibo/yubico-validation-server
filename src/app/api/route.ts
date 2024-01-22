import { NextResponse } from 'next/server';

export const GET = async () => {
  return NextResponse.json({ message: 'Welcome to a Yubico Validation Server. Learn more at tai.bo/yvs' }, { status: 200 });
};

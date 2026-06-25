export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getFacebookLoginUrl } from '@/lib/facebook';

export async function GET() {
  const loginUrl = getFacebookLoginUrl();
  return NextResponse.redirect(loginUrl);
}

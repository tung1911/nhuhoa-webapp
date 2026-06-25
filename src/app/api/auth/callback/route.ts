import { NextResponse } from 'next/server';
import { getAccessTokenFromCode, getUserProfile, getUserPages, getLongLivedToken } from '@/lib/facebook';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=NoCode', request.url));
  }

  try {
    const shortToken = await getAccessTokenFromCode(code);
    const accessToken = await getLongLivedToken(shortToken); // Đổi sang token dài hạn (60 ngày)
    
    const profile = await getUserProfile(accessToken);
    const pages = await getUserPages(accessToken);

    // In a real app, we would save this to a database and set a secure session cookie
    // For now, we will pass the token and basic info via URL params to the frontend
    // WARNING: Passing tokens in URL is not secure for production. 
    // We are doing this just for the MVP/Mock integration phase to show it works.
    
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('token', accessToken);
    redirectUrl.searchParams.set('name', profile.name);
    if (profile.picture?.data?.url) {
      redirectUrl.searchParams.set('avatar', profile.picture.data.url);
    }
    
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Facebook Auth Error:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }
}

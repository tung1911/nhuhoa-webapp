const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function getFacebookLoginUrl() {
  const redirectUri = `${NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
  const scope = 'public_profile,pages_show_list,pages_manage_metadata,pages_messaging';
  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&auth_type=rerequest`;
}

export async function getAccessTokenFromCode(code: string) {
  const redirectUri = `${NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
  const response = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`);
  
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.access_token;
}

export async function getLongLivedToken(shortToken: string) {
  const response = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${shortToken}`);
  const data = await response.json();
  if (data.error) {
    console.error("Lỗi lấy token dài hạn:", data.error);
    return shortToken; // Fallback lại token cũ nếu lỗi
  }
  return data.access_token;
}

export async function getUserProfile(accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${accessToken}`);
  return response.json();
}

export async function getUserPages(accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
  const data = await response.json();
  return data.data || [];
}

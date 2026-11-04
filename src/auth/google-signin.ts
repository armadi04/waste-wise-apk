import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID, IS_GOOGLE_CONFIGURED } from '@/lib/config';

let configured = false;

export function configureGoogleSignIn(): void {
  if (configured) return;
  if (!IS_GOOGLE_CONFIGURED) {
    throw new Error(
      'Google Sign-In is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    );
  }
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['email', 'profile'],
    offlineAccess: false,
  });
  configured = true;
}

export async function requestGoogleIdToken(): Promise<string | null> {
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  return response.data.idToken;
}

export async function signOutFromGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // The app session is cleared regardless of the Google account cache.
  }
}

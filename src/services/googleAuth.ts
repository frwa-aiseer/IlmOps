/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Provider with read-only workspace scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

// Client-side token cache (in-memory, backed by tab session storage for refresh resilience)
let cachedAccessToken: string | null = null;
try {
  cachedAccessToken = sessionStorage.getItem('allin_google_oauth_token');
} catch {
  // Session storage unavailable (e.g. strict sandbox)
}

let isSigningIn = false;

/**
 * Initializes the auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const token = getCachedAccessToken();
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      cachedAccessToken = null;
      try {
        sessionStorage.removeItem('allin_google_oauth_token');
      } catch {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Interactive Sign-in with Google flow using Firebase popup.
 * Caches access token in-memory and tab session.
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Workspace access token from sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    try {
      sessionStorage.setItem('allin_google_oauth_token', credential.accessToken);
    } catch {}

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('[IlmOps Auth] Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Signs out user and clears token cache.
 */
export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem('allin_google_oauth_token');
  } catch {}
};

/**
 * Retrieves the cached access token.
 */
export const getCachedAccessToken = (): string | null => {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const stored = sessionStorage.getItem('allin_google_oauth_token');
    if (stored) {
      cachedAccessToken = stored;
      return stored;
    }
  } catch {}
  return null;
};

/**
 * Checks if an active Google Workspace access token is currently available.
 */
export const hasGoogleAccessToken = (): boolean => {
  return Boolean(getCachedAccessToken());
};

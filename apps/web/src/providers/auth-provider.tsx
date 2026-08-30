'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getApiUrl, fetchWithTimeout } from '@/lib/config';
import type { User } from '@/lib/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${getApiUrl()}/api${path}`;
  const res = await fetchWithTimeout(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Request failed');
  return data;
}

async function apiRequestWithToken(path: string, idToken: string, options: RequestInit = {}) {
  const url = `${getApiUrl()}/api${path}`;
  const res = await fetchWithTimeout(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Request failed');
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let settled = false;

    const settle = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };

    // Safety: force loading=false after 3s no matter what
    const safetyTimer = setTimeout(settle, 3000);

    try {
      const auth = getFirebaseAuth();

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);

        try {
          if (fbUser) {
            const idToken = await fbUser.getIdToken();
            const response = await apiRequestWithToken('/auth/login', idToken, {
              method: 'POST',
            });
            if (response.data?.user) {
              setUser(response.data.user);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth sync error:', error);
          setUser(null);
        } finally {
          settle();
        }
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
      settle();
    }

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
    // Auth state change handler will sync with backend
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const auth = getFirebaseAuth();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    // Send Firebase ID token to backend to create user
    const idToken = await result.user.getIdToken();
    await apiRequestWithToken('/auth/register', idToken, {
      method: 'POST',
      body: JSON.stringify({ role: 'user' }),
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Auth state change handler will sync with backend
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
    // Auth state change handler will clear backend session
  }, []);

  const updateUserProfile = useCallback(
    async (data: { displayName?: string; photoURL?: string }) => {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, data);
        await apiRequest('/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      }
    },
    []
  );

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiRequest('/auth/me');
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

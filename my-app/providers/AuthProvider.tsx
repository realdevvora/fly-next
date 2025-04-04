// File: /providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthProvider is a context provider that provides the auth state to the app.
 * It's designed to work with Next.js App Router and SSR.
 */

// Define the auth context type with loading state
interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  isLoading: boolean;
  error: string | null;
  refreshAuthState: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create auth context with improved functionality
const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  isLoading: true,
  error: null,
  refreshAuthState: async () => {},
  logout: async () => {},
});

// Props to initialize the auth provider with server-fetched data
interface AuthProviderProps {
  children: React.ReactNode;
  initialAccessToken?: string | null;
  initialLoggedIn?: boolean;
}

export const AuthProvider = ({
  children,
  initialAccessToken = null,
  initialLoggedIn = false,
}: AuthProviderProps) => {
  // Initialize state with server-provided values
  const [accessToken, setAccessToken] = useState<string | null>(initialAccessToken);
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const [isLoading, setIsLoading] = useState(!initialLoggedIn); // Not loading if we have initial data
  const [error, setError] = useState<string | null>(null);

  // Function to refresh authentication state
  const refreshAuthState = async () => {
    // Skip refresh if we're already authenticated and have a token
    if (isLoggedIn && accessToken && !isLoading) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/check', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 }, // Ensure fresh data every time
      });
      
      if (!res.ok) {
        throw new Error(`Authentication check failed: ${res.status}`);
      }
      
      const data = await res.json();
      setIsLoggedIn(!!data.isLoggedIn);
      
      if (data.accessToken) {
        setAccessToken(data.accessToken);
      } else if (data.isLoggedIn) {
        console.warn('User is logged in but no access token was returned');
      }
    } catch (err) {
      console.error('Failed to refresh auth state:', err);
      setError(err instanceof Error ? err.message : 'Unknown authentication error');
      setIsLoggedIn(false);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`Logout failed: ${res.status}`);
      }
      
      setIsLoggedIn(false);
      setAccessToken(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Only perform the initial auth check on client-side if we don't have initial data
  useEffect(() => {
    if (!initialLoggedIn && !initialAccessToken) {
      refreshAuthState();
    }
    // Optional: Set up a token refresh interval if using short-lived JWTs
    // const refreshInterval = setInterval(refreshAuthState, 15 * 60 * 1000); // 15 minutes
    // return () => clearInterval(refreshInterval);
  }, [initialLoggedIn, initialAccessToken]);

  return (
    <AuthContext.Provider value={{
      accessToken,
      setAccessToken,
      isLoggedIn,
      setIsLoggedIn,
      isLoading,
      error,
      refreshAuthState,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook
export const useAuth = () => useContext(AuthContext);
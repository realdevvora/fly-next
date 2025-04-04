import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '@/providers/AuthProvider';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { refreshAuthState } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Refresh auth state instead of manually setting tokens
      await refreshAuthState();
      
      // Redirect to dashboard or home page
      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render theme-specific elements until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full h-96 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md transition-colors duration-300 ${
        isDark ? 'bg-gray-800 shadow-gray-900/50' : 'bg-white shadow-gray-200/50'
      }`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Sign in to your account
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Don't have an account?{' '}
            <Link href="/register" className={`font-medium ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}>
              Register
            </Link>
          </p>
        </div>
        
        {registered && (
          <div className={`border-l-4 border-green-400 p-4 ${
            isDark ? 'bg-green-900/20' : 'bg-green-50'
          }`}>
            <div className="flex">
              <div className="ml-3">
                <p className={`text-sm ${
                  isDark ? 'text-green-400' : 'text-green-700'
                }`}>
                  Account created successfully! Please sign in.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className={`border-l-4 border-red-400 p-4 ${
            isDark ? 'bg-red-900/20' : 'bg-red-50'
          }`}>
            <div className="flex">
              <div className="ml-3">
                <p className={`text-sm ${
                  isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 focus:ring-blue-500 rounded ${
                  isDark 
                    ? 'bg-gray-700 border-gray-500 text-blue-500' 
                    : 'border-gray-300 text-blue-600'
                }`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className={`font-medium ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}>
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-900' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-white'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
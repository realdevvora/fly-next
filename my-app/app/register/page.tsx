'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'confirmPassword') {
          formDataToSend.append(key, value);
        }
      });
      
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }
      
      const response = await fetch('/api/accounts/register', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
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
            Create your account
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Already have an account?{' '}
            <Link href="/login" className={`font-medium ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            }`}>
              Sign in
            </Link>
          </p>
        </div>
        
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
            
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
                    : 'bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500'
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 rounded-md shadow-sm focus:outline-none ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-black focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Profile Picture
              </label>
              <div className="mt-1 flex items-center space-x-5">
                {previewUrl ? (
                  <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className={`flex-shrink-0 h-16 w-16 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
                <div className={`flex text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <label htmlFor="profilePicture" className={`relative cursor-pointer rounded-md font-medium ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'bg-white text-blue-600 hover:text-blue-500'
                  } focus-within:outline-none`}>
                    <span>Upload a file</span>
                    <input 
                      id="profilePicture" 
                      name="profilePicture" 
                      type="file" 
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                </div>
              </div>
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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
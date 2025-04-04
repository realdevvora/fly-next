'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from 'next-themes';
import Button from './Button';
import Notifications from './Notifications';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, refreshAuthState } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show correct theme after component mounts to prevent hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Conditional navigation links based on login status
  const getNavLinks = () => {
    if (isLoggedIn) {
      return [
        { name: 'Bookings', path: '/bookings' },
        { name: 'Checkout', path: '/checkout' },
        { name: 'See All Hotels', path: '/hotel-mgmt/owned' },
        { name: 'View my Hotels', path: '/hotel-mgmt' },
        { name: 'Edit My Profile', path: '/edit/profile' },
      ];
    } else {
      return [
        { name: 'Hotels', path: '/hotels' },
        { name: 'Flights', path: '/flights' },
        { name: 'See All Hotels', path: '/hotel-mgmt/owned' },
      ];
    }
  };

  const navLinks = getNavLinks();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/accounts/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        await refreshAuthState();
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  // Replace the handleNavigation function in Navbar.tsx with this implementation
  const handleNavigation = (path: string) => {
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    
    // Only navigate if not already on that page
    if (pathname !== path) {
      // Use push with an object to maintain client-side navigation
      router.push(path, { scroll: false });
    }
  };

  // Don't render theme-specific elements until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed left-0 top-0 z-50 w-full transition-all duration-300 py-5 bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          <div className="hidden md:flex gap-4">
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  const isDark = theme === 'dark';

  return (
    <nav 
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? isDark
            ? 'bg-gray-900/95 shadow-md shadow-gray-800/20 backdrop-blur-sm py-3' 
            : 'bg-white/95 shadow-md shadow-gray-200/20 backdrop-blur-sm py-3'
          : isDark
            ? 'bg-transparent py-5' 
            : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => handleNavigation('/')} className="relative z-10">
          <h1 className={`font-display text-2xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>FlyNext</h1>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(link => (
            <button
              key={link.name}
              onClick={() => handleNavigation(link.path)}
              className={`text-sm font-medium transition-colors ${
                pathname === link.path 
                  ? isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'
                  : isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {/* Theme toggle button */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${
              isDark 
                ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          {isLoggedIn ? (
            <>
              <Notifications />
              <Button 
                variant={isDark ? "outline" : "ghost"} 
                size="sm" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant={isDark ? "outline" : "ghost"} 
                size="sm"
                onClick={() => handleNavigation('/login')}
              >
                Sign in
              </Button>
              <Button 
                variant={isDark ? "outline" : "primary"} 
                size="sm"
                onClick={() => handleNavigation('/register')}
              >
                Sign up
              </Button>
            </>
          )}
        </div>

        <button
          className={`relative z-10 rounded-md p-2 ${
            isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
          } md:hidden`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </svg>
          )}
        </button>

        {/* Mobile Menu */}
        <div 
          className={`fixed inset-0 z-0 transition-all duration-300 md:hidden ${
            mobileMenuOpen 
              ? 'opacity-100 ' + (isDark ? 'bg-gray-900' : 'bg-white') 
              : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="mt-20 flex flex-col p-6">
            {navLinks.map(link => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.path)}
                className={`border-b py-4 text-lg font-medium text-left ${
                  pathname === link.path
                    ? isDark ? 'text-white font-bold' : 'text-gray-900 font-bold'
                    : isDark 
                      ? 'border-gray-800 text-white' 
                      : 'border-gray-100 text-gray-900'
                }`}
              >
                {link.name}
              </button>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              {/* Mobile theme toggle */}
              <div className="flex justify-center py-2">
                <button 
                  onClick={toggleTheme}
                  className={`p-3 rounded-full transition-colors ${
                    isDark 
                      ? 'bg-gray-800 text-yellow-300' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                </button>
              </div>
              
              {isLoggedIn ? (
                <>
                  {/* Mobile notifications */}
                  <div className="flex items-center justify-center py-2">
                    <Notifications />
                  </div>
                  <Button 
                    variant={isDark ? "outline" : "ghost"} 
                    fullWidth 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant={isDark ? "outline" : "ghost"} 
                    fullWidth
                    onClick={() => handleNavigation('/login')}
                  >
                    Sign in
                  </Button>
                  <Button 
                    variant={isDark ? "outline" : "ghost"} 
                    fullWidth
                    onClick={() => handleNavigation('/register')}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
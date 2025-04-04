'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p>Welcome to your dashboard!</p>
        {/* Add your protected dashboard content here */}
      </div>
    </div>
  );
} 
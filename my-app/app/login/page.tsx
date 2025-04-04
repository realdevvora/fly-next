'use client';
// app/login/page.tsx
import { Suspense } from 'react';
import Login from '@/components/Login'; // Your login component

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}

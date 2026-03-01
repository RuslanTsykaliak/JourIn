// app/components/header.tsx
"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StreakCounter from './streakCounter'; // Import StreakCounter

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  return (

    <div className="w-full space-y-8 text-center">
      <div className="flex justify-between items-center">
        <StreakCounter />
      </div>

      <div className="flex justify-center mb-4">

        {/* New div for left alignment and spacing */}
        {!session ? (
          <button
            onClick={() => router.push('/auth')}
            className="text-white text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            aria-label="Login or Register"
          >
            🔑
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="bg-red-600 hover:bg-red-700 text-white text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl py-1 px-2 rounded"
          >
            Logout
          </button>
        )}
      </div>



      <p className="mt-2 text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-300">
        Transform your personal reflections into powerful, shareable insights for your professional network.<br />
        Reflect, refine, and connect with your community.
      </p>
    </div>
  );
}
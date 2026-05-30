// app/components/header.tsx
"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StreakCounter from './streakCounter'; // Import StreakCounter

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [headerText, setHeaderText] = useState(
    'FOCUS: Stress reduction\n\nSTRATEGY: Designing work around your natural energy\n\nACCOUNTABILITY ACTION: Review my priorities three times per day and identify the most natural, lowest-friction approach for my important tasks, and I\'ll do it after breakfast, after lunch, and after dinner.'
  );

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



      <textarea
        value={headerText}
        onChange={(e) => setHeaderText(e.target.value)}
        className="mt-2 w-full max-w-4xl mx-auto text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-300 bg-transparent border-none resize-none focus:outline-none text-center leading-relaxed"
        rows={6}
        placeholder="Transform your personal reflections into powerful, shareable insights for your professional network.
        Reflect, refine, and connect with your community."
      />
    </div>
  );
}
// app/components/header.tsx

import React from 'react';
import StreakCounter from './streakCounter'; // Import StreakCounter

export default function Header() {
  return (
    <div className="max-w-md w-full space-y-8 text-center">
      {/* <h1 className="flex items-center justify-center gap-2 font-extrabold text-gray-100 text-fluid text-center w-full px-2">
        JourIn: Journal Your Way to Impact */}
      <StreakCounter />
      {/* </h1> */}


      <p className="mt-2 text-lg text-gray-300">
        Transform your personal reflections into powerful, shareable insights for your professional network.
        Reflect, refine, and connect with your community.
      </p>
    </div>
  );
}
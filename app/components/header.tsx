// app/components/header.tsx

import React from 'react';

export default function Header() {
  return (
    <div className="max-w-md w-full space-y-8 text-center">
      <h1 className="text-4xl font-extrabold text-gray-100">
        JourIn: Journal Your Way to Impact
      </h1>
      <p className="mt-2 text-lg text-gray-300">
        Transform your personal reflections into powerful, shareable insights for your professional network.
        Reflect, refine, and connect with your community.
      </p>
    </div>
  );
}
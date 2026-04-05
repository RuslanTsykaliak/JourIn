'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface SharedButtonProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function SharedButton({ 
  className = '', 
  children, 
  onClick, 
  disabled = false 
}: SharedButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onClick?.();
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center px-3 py-1.5 xs:px-3.5 sm:px-4 py-2 border border-transparent text-sm xs:text-base sm:text-lg md:text-xl font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 018-8V0C5.373 0 12-1.135 5.824 3.242 5.291A7.962 7.962 7.962 0 014 12H0c0 3.242 0 014 12-3.242 0 014 12H0c0 3.242 0 014 12h4zm2 5.291 0 014 12h4zm2 5.291 0 014 12h4zm2 5.291 0 014 12h4zm0 5.824 3.242 5.824 7.962 7.962 8 018 12H0c0 3.242 8 018 12h4zm0 5.824 3.242 8 018 12h4z"
            />
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
}

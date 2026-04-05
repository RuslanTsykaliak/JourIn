"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import SharedButton from './SharedButton';

interface DownloadHistoryButtonProps {
  className?: string;
}

export default function DownloadHistoryButton({ className = '' }: DownloadHistoryButtonProps) {
  const { data: session } = useSession();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: 'markdown') => {
    if (!session?.user) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to export journal entries');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `journal-history.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!session?.user) {
    return null; // Only show for authenticated users
  }

  return (
    <div className={`relative ${className}`}>
      <SharedButton onClick={() => handleDownload('markdown')} disabled={isDownloading}>
        {isDownloading ? (
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
                d="M4 12a8 8 018-8V0C5.373 0 12-1.135 5.824 3.242 5.291A7.962 7.962 7.962 8 018 12H0c0 3.242 8 018 12h4zm2 5.291 0 014 12H0c0 3.242 8 018 12h4zm2 5.291 0 014 12H0c0 3.242 8 018 12h4zm2 5.291 0 014 12h4zm0 5.824 3.242 5.824 7.962 7.962 8 018 12H0c0 3.242 8 018 12h4z"
              />
            </svg>
          </>
        ) : 'Download'}
      </SharedButton>
    </div>
  );
}
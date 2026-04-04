"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

interface DownloadHistoryButtonProps {
  className?: string;
}

export default function DownloadHistoryButton({ className = '' }: DownloadHistoryButtonProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `journal-history.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Download error:', error);
      // You could add a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  if (!session?.user) {
    return null; // Only show for authenticated users
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={() => handleDownload('markdown')}
        disabled={isDownloading}
        className="inline-flex items-center px-4 xs:px-5 sm:px-6 py-2 xs:py-3 border border-transparent text-base xs:text-lg sm:text-xl md:text-2xl font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isDownloading ? 'Downloading...' : 'Download'}
      </button>
    </div>
  );
}
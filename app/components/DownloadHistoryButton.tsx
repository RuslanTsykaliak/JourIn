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
  const [showDateRange, setShowDateRange] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleDownload = async (format: 'markdown') => {
    if (!session?.user) return;
    
    setIsDownloading(true);
    try {
      let url = `/api/export?format=${format}`;
      if (fromDate) {
        url += `&fromDate=${fromDate}`;
      }
      if (toDate) {
        url += `&toDate=${toDate}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to export journal entries');
      }
      
      const blob = await response.blob();
      const urlObj = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = urlObj;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `journal-history.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      // Delay cleanup to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(urlObj);
        document.body.removeChild(a);
      }, 100);
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
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
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
                d="M4 12a8 8 018-8V0C5.373 0 12-1.135 5.824 3.242 5.291A7.962 7.962 8 018 12H0c0 3.242 8 018 12h4zm2 5.291 0 014 12H0c0 3.242 8 018 12h4zm2 5.291 0 014 12H0c0 3.242 8 018 12h4zm2 5.291 0 014 12h4zm0 5.824 3.242 5.824 7.962 7.962 8 018 12H0c0 3.242 8 018 12h4z"
              />
            </svg>
          </>
        ) : 'Download'}
      </SharedButton>
      
      <button
        onClick={() => setShowDateRange(!showDateRange)}
        className="text-sm text-blue-600 hover:text-blue-800 underline px-1"
      >
        {showDateRange ? 'Hide' : 'Filter'}
      </button>
      
      {showDateRange && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-1"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-1"
          />
          <button
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="text-sm text-gray-600 hover:text-gray-800 underline px-1"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import SharedButton from './SharedButton';

interface UploadHistoryButtonProps {
  className?: string;
}

export default function UploadHistoryButton({ className = '' }: UploadHistoryButtonProps) {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);

  if (!session) {
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        console.error('Upload failed:', result);
        throw new Error(`Upload failed: ${result.error || 'Unknown error'}`);
      }
      
      console.log('Upload successful:', await response.json());
      
      // Trigger a page refresh to show new entries
      // Use router reload instead of window.location.reload for better SSR compatibility
      if (typeof window !== 'undefined') {
        window.location.reload();
      } else {
        console.log('Upload successful, please refresh to see new entries');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept=".md,.markdown"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="upload-history-input"
      />
      <SharedButton onClick={() => document.getElementById('upload-history-input')?.click()} disabled={isUploading}>
        {isUploading ? (
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
                d="M4 12a8 8 0018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </>
        ) : 'Upload History'}
      </SharedButton>
    </div>
  );
}

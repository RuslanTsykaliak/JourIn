// app/coach/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../components/header';
import Link from 'next/link';
import PostAnalyticsForm from '../components/coach/PostAnalyticsForm';
import { Post, PostAnalytics } from '../generated/prisma';

// Define a type for the post with its analytics
type PostWithAnalytics = Post & { analytics: PostAnalytics | null };

// Component to display the list of past posts
const PostHistoryList = ({ posts }: { posts: PostWithAnalytics[] }) => {
  if (posts.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-400">
        <p>You haven&apos;t tracked any posts yet. Add one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-semibold text-white text-center">Your Post History</h2>
      {posts.map((post) => (
        <div key={post.id} className="bg-gray-700 p-4 rounded-lg shadow">
          <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
          <div className="mt-3 flex justify-end space-x-4 text-sm text-gray-400">
            <span>Impressions: {post.analytics?.impressions ?? 'N/A'}</span>
            <span>Likes: {post.analytics?.likes ?? 'N/A'}</span>
            <span>Comments: {post.analytics?.comments ?? 'N/A'}</span>
            <span>Reposts: {post.analytics?.reposts ?? 'N/A'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CoachPage() {
  const { status } = useSession();
  const [posts, setPosts] = useState<PostWithAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/coach/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts.');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, fetchPosts]);

  const handlePostAdded = () => {
    fetchPosts(); // Refetch posts after a new one is added
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center bg-gray-800 p-8 rounded-lg shadow-lg text-gray-100">
          <Header />
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-300">
            The AI Content Coach is a premium feature. Please{' '}
            <Link href="/auth" className="text-blue-400 hover:underline">
              log in
            </Link>{' '}
            to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 text-left bg-gray-800 p-8 rounded-lg shadow-lg text-gray-100">
        <Header />
        <h1 className="text-3xl font-bold text-center text-white">AI Content Coach</h1>
        <p className="text-center text-gray-400 mb-8">Track your LinkedIn post performance and get AI-powered feedback to improve your content strategy.</p>

        <PostAnalyticsForm onPostAdded={handlePostAdded} />

        {isLoading ? (
          <div className="text-center text-gray-400 mt-8">Loading post history...</div>
        ) : (
          <PostHistoryList posts={posts} />
        )}
      </div>
    </div>
  );
}

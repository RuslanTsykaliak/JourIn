// app/components/coach/PostAnalyticsForm.tsx
"use client";

import React, { useState } from 'react';
import AnalyticsDisplay from './AnalyticsDisplay'; // Import the new component

interface PostAnalyticsFormProps {
  onPostAdded: () => void; // Callback to refresh the list of posts
}

export default function PostAnalyticsForm({ onPostAdded }: PostAnalyticsFormProps) {
  const [content, setContent] = useState('');
  const [impressions, setImpressions] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [reposts, setReposts] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null); // State for the analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State for analysis loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setAnalysis(null);

    if (!content) {
      setError('Post content is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Save the post and its analytics
      const response = await fetch('/api/coach/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          impressions: impressions ? parseInt(impressions, 10) : null,
          likes: likes ? parseInt(likes, 10) : null,
          comments: comments ? parseInt(comments, 10) : null,
          reposts: reposts ? parseInt(reposts, 10) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit post analytics.');
      }

      const newPost = await response.json();

      // Clear form and notify parent
      setContent('');
      setImpressions('');
      setLikes('');
      setComments('');
      setReposts('');
      onPostAdded();

      // Step 2: Trigger the analysis
      setIsAnalyzing(true);
      const analysisResponse = await fetch('/api/coach/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: newPost.id }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to get analysis.');
      }

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData.analysis);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300">
            Post Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="impressions" className="block text-sm font-medium text-gray-300">
              Impressions
            </label>
            <input
              type="number"
              id="impressions"
              value={impressions}
              onChange={(e) => setImpressions(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="likes" className="block text-sm font-medium text-gray-300">
              Likes
            </label>
            <input
              type="number"
              id="likes"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-300">
              Comments
            </label>
            <input
              type="number"
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="reposts" className="block text-sm font-medium text-gray-300">
              Reposts
            </label>
            <input
              type="number"
              id="reposts"
              value={reposts}
              onChange={(e) => setReposts(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || isAnalyzing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500"
        >
          {isSubmitting ? 'Submitting...' : (isAnalyzing ? 'Analyzing...' : 'Save & Analyze')}
        </button>
      </form>

      {isAnalyzing && <div className="mt-4 text-center text-gray-400">Analyzing your post...</div>}
      
      {analysis && <AnalyticsDisplay analysis={analysis} />}
    </div>
  );
}

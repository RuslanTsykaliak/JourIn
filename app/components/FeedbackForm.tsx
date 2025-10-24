'use client';

import { useState } from 'react';

export function FeedbackForm() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setSubmitStatus('success');
        setContent('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Provide Feedback</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your feedback..."
        className="w-full p-2 border rounded-md"
        rows={4}
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
      {submitStatus === 'success' && (
        <p className="mt-2 text-green-500">Thank you for your feedback!</p>
      )}
      {submitStatus === 'error' && (
        <p className="mt-2 text-red-500">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

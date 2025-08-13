// app/components/journalHistorySection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { JournalEntryWithTimestamp } from '../types';
import { generatePromptText } from '../utils/generatePromptText';

interface JournalHistorySectionProps {
  newEntryToHistory: JournalEntryWithTimestamp | null;
}

const INITIAL_DISPLAY_COUNT = 5;

export default function JournalHistorySection({ newEntryToHistory }: JournalHistorySectionProps) {
  const [pastEntries, setPastEntries] = useState<JournalEntryWithTimestamp[]>([]);
  const [copyHistorySuccess, setCopyHistorySuccess] = useState<string>('');
  const [copyPastEntryPromptSuccess, setCopyPastEntryPromptSuccess] = useState<number | null>(null);
  const [copyPastEntryTextSuccess, setCopyPastEntryTextSuccess] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  // Load past entries on mount
  useEffect(() => {
    const savedPastEntries = localStorage.getItem('jourin_past_entries');
    if (savedPastEntries) {
      try {
        setPastEntries(JSON.parse(savedPastEntries));
      } catch (e) {
        console.error("Failed to parse past entries from localStorage", e);
        localStorage.removeItem('jourin_past_entries');
      }
    }
  }, []);

  // Add new entry to history when received from parent
  useEffect(() => {
    if (newEntryToHistory) {
      setPastEntries(prevEntries => {
        const updatedEntries = [newEntryToHistory, ...prevEntries].slice(0, 100); // Keep up to 100 entries
        localStorage.setItem('jourin_past_entries', JSON.stringify(updatedEntries));
        return updatedEntries;
      });
    }
  }, [newEntryToHistory]);

  const copyAllHistoryToClipboard = async () => {
    const defaultTitles = {
      whatWentWell: "What went well today",
      whatILearned: "What I learned today",
      whatWouldDoDifferently: "What I would do differently",
      nextStep: "My next step",
    };

    const formattedHistory = pastEntries.map(entry => {
      const title = entry.customTitles || defaultTitles;
      return `
--- Journal Entry (${new Date(entry.timestamp).toLocaleString()}) ---
${title.whatWentWell}:
${entry.whatWentWell}

${title.whatILearned}:
${entry.whatILearned}

${title.whatWouldDoDifferently}:
${entry.whatWouldDoDifferently}

${title.nextStep}:
${entry.nextStep}
`;
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(formattedHistory);
      setCopyHistorySuccess('History Copied!');
      setTimeout(() => setCopyHistorySuccess(''), 2000);
    } catch (err) {
      setCopyHistorySuccess('Failed to copy history!');
      console.error('Failed to copy history: ', err);
    }
  };

  const copyPastEntryPromptToClipboard = async (entry: JournalEntryWithTimestamp) => {
    const promptToCopy = generatePromptText(entry, entry.customTitles);
    try {
      await navigator.clipboard.writeText(promptToCopy);
      setCopyPastEntryPromptSuccess(entry.timestamp);
      setTimeout(() => setCopyPastEntryPromptSuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy past entry prompt: ', err);
    }
  };

  const copyPastEntryTextToClipboard = async (entry: JournalEntryWithTimestamp) => {
    const defaultTitles = {
      whatWentWell: "What went well today",
      whatILearned: "What I learned today",
      whatWouldDoDifferently: "What I would do differently",
      nextStep: "My next step",
    };

    const title = entry.customTitles || defaultTitles;

    const textToCopy = `
--- Journal Entry (${new Date(entry.timestamp).toLocaleString()}) ---
${title.whatWentWell}:
${entry.whatWentWell}

${title.whatILearned}:
${entry.whatILearned}

${title.whatWouldDoDifferently}:
${entry.whatWouldDoDifferently}

${title.nextStep}:
${entry.nextStep}
`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyPastEntryTextSuccess(entry.timestamp);
      setTimeout(() => setCopyPastEntryTextSuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy past entry text: ', err);
    }
  };

  const handleShowMore = () => {
    setDisplayCount(prevCount => prevCount + INITIAL_DISPLAY_COUNT);
  };

  const handleShowLess = () => {
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  };

  return (
    pastEntries.length > 0 && (
      <div className="mt-12 w-full max-w-md text-left">
        <h2 className="text-2xl font-extrabold text-gray-100 mb-4">Your Past Entries</h2>
        <div className="space-y-6">
          {pastEntries.slice(0, displayCount).map((entry) => {
            const defaultTitles = {
              whatWentWell: "What went well today",
              whatILearned: "What I learned today",
              whatWouldDoDifferently: "What I would do differently",
              nextStep: "My next step",
            };
            const title = entry.customTitles || defaultTitles;

            return (
              <div key={entry.timestamp} className="p-4 bg-gray-700 rounded-md shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-semibold text-gray-100">
                    Entry from {new Date(entry.timestamp).toLocaleString()}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyPastEntryPromptToClipboard(entry)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      {copyPastEntryPromptSuccess === entry.timestamp ? 'Copied!' : 'Copy Prompt'}
                    </button>
                    <button
                      onClick={() => copyPastEntryTextToClipboard(entry)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {copyPastEntryTextSuccess === entry.timestamp ? 'Copied!' : 'Copy Text'}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">{title.whatWentWell}:</span> {entry.whatWentWell}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">{title.whatILearned}:</span> {entry.whatILearned}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">{title.whatWouldDoDifferently}:</span> {entry.whatWouldDoDifferently}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">{title.nextStep}:</span> {entry.nextStep}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={copyAllHistoryToClipboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Copy All History
          </button>
          {copyHistorySuccess && (
            <span className="ml-3 text-sm text-blue-400 font-medium">
              {copyHistorySuccess}
            </span>
          )}
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          {displayCount < pastEntries.length && (
            <button
              onClick={handleShowMore}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-100 bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Show More
            </button>
          )}
          {displayCount > INITIAL_DISPLAY_COUNT && (
            <button
              onClick={handleShowLess}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-100 bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Show Less
            </button>
          )}
        </div>
        {pastEntries.length > INITIAL_DISPLAY_COUNT && (
          <p className="mt-4 text-sm text-gray-300">
            Showing {Math.min(displayCount, pastEntries.length)} of {pastEntries.length} entries.
          </p>
        )}
      </div>
    )
  );
}
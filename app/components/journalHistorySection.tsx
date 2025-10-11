"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { JournalEntryWithTimestamp, CustomTitles, defaultTitles } from '../types';
import { useJournalEntriesStorage } from '../hooks/useJournalEntriesStorage';
import { useDbJournalEntries } from '../auth/useDbJournalEntries';
import { getStartOfWeek, getEndOfWeek, generateWeeklySummary as generateWeeklySummaryUtil } from '../utils/weeklySummaryUtils';
import DynamicJournalEntryItem from './DynamicJournalEntryItem';

interface JournalHistorySectionProps {
  newEntryToHistory: JournalEntryWithTimestamp | null;
}

const INITIAL_DISPLAY_COUNT = 5;

export default function JournalHistorySection({ newEntryToHistory }: JournalHistorySectionProps) {

  const [copyHistorySuccess, setCopyHistorySuccess] = useState<string>('');
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [selectedWeekEnd, setSelectedWeekEnd] = useState<Date>(getEndOfWeek(new Date()));
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [weeklySummaryText, setWeeklySummaryText] = useState<string>('');
  const [copySummarySuccess, setCopySummarySuccess] = useState<boolean>(false);

  const { data: session } = useSession();

  // Call hooks unconditionally
  const { pastEntries: localPastEntries, addJournalEntry: addLocalJournalEntry } = useJournalEntriesStorage();
  const { pastEntries: dbPastEntries, addJournalEntry: addDbJournalEntry } = useDbJournalEntries();

  const pastEntries = session ? dbPastEntries : localPastEntries;
  const addJournalEntry = session ? addDbJournalEntry : addLocalJournalEntry;



  const handlePreviousWeek = () => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeekStart(getStartOfWeek(newDate));
    setSelectedWeekEnd(getEndOfWeek(newDate));
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeekStart(getStartOfWeek(newDate));
    setSelectedWeekEnd(getEndOfWeek(newDate));
  };

  const generateWeeklySummary = () => {
    setWeeklySummaryText(generateWeeklySummaryUtil(pastEntries, selectedWeekStart, selectedWeekEnd));
    setShowSummaryModal(true);
  };



  // Add new entry to history when received from parent
  useEffect(() => {
    if (newEntryToHistory) {
      addJournalEntry(newEntryToHistory);
    }
  }, [newEntryToHistory]);
  // useEffect(() => {
  //   if (newEntryToHistory) {
  //     if (session) {
  //       addJournalEntry(newEntryToHistory);
  //     } else {
  //       addJournalEntry(newEntryToHistory);
  //     }
  //   }
  // }, [newEntryToHistory, addJournalEntry, session]);

  const copyAllHistoryToClipboard = async () => {
    const formattedHistory = pastEntries.map(entry => {
      const titles = { ...defaultTitles, ...entry.customTitles };

      const entryContent = Object.keys(entry)
        .filter(key => {
          if (key === 'timestamp' || key === 'customTitles' || key.endsWith('_title')) {
            return false;
          }
          const value = entry[key];
          if (typeof value === 'string') {
            return value.trim() !== '';
          }
          return !!value;
        })
        .map(key => {
          const title = entry[`${key}_title`] || titles[key] || key;
          const value = entry[key];
          return `${title}:\n${value}`;
        })
        .join('\n\n');

      return `--- Journal Entry (${new Date(entry.timestamp).toLocaleString()}) ---\n${entryContent}`;
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(formattedHistory);
      setCopyHistorySuccess('History copied!');
      setTimeout(() => setCopyHistorySuccess(''), 2000);
    } catch (err) {
      setCopyHistorySuccess('Failed to copy the history!');
      console.error('Failed to copy history: ', err);
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
        {/* Weekly Summary Section */}
        <div className="mb-8 p-4 bg-gray-800 rounded-md shadow-lg">
          <h2 className="text-2xl font-extrabold text-gray-100 mb-4">Weekly Summary</h2>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousWeek}
              className="px-1 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Previous Week
            </button>
            <span className="text-gray-100 font-semibold">
              {selectedWeekStart.toLocaleDateString()} - {selectedWeekEnd.toLocaleDateString()}
            </span>
            <button
              onClick={handleNextWeek}
              className="px-1 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next Week
            </button>
          </div>
          <button
            onClick={generateWeeklySummary}
            className="w-full px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Generate Weekly Summary
          </button>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-100 mb-4">Your Past Entries</h2>
        <div className="space-y-6">
          {pastEntries.slice(0, displayCount).map((entry) => (
            <DynamicJournalEntryItem key={entry.timestamp} entry={entry} />
          ))}
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
            Showing {Math.min(displayCount, pastEntries.length)} of {pastEntries.length} entries
          </p>
        )}

        {/* Summary Modal */}
        {showSummaryModal && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
            role="dialog"
            aria-label="Weekly Summary"
          >
            <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-lg w-full m-4">
              <h3 className="text-xl font-bold text-gray-100 mb-4">Weekly Summary</h3>
              <textarea
                className="w-full h-64 p-3 bg-gray-800 text-gray-200 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                value={weeklySummaryText}
                onChange={(e) => setWeeklySummaryText(e.target.value)}
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(weeklySummaryText);
                    setCopySummarySuccess(true);
                    setTimeout(() => setCopySummarySuccess(false), 2000);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-.md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {copySummarySuccess ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
}

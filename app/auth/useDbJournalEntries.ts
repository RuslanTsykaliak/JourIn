import { useState, useEffect, useCallback } from 'react';
import { JournalEntryWithTimestamp, CustomTitles } from '../types';

export function useDbJournalEntries() {
  const [pastEntries, setPastEntries] = useState<JournalEntryWithTimestamp[]>([]);

  useEffect(() => {
    // Only fetch entries if window is defined (i.e., in a browser environment)
    if (typeof window !== 'undefined') {
      const fetchEntries = async () => {
        const response = await fetch('/api/journal');
        if (response.ok) {
          const entries = await response.json();

          // Ensure entries is an array before mapping
          const entriesArray = Array.isArray(entries) ? entries : [];

          // Convert database entries to the expected format
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedEntries = entriesArray.map((entry: any) => {
            const formatted = {
              ...entry,
              whatWentWell: entry.whatWentWell || '',
              whatILearned: entry.whatILearned || '',
              whatWouldDoDifferently: entry.whatWouldDoDifferently || '',
              nextStep: entry.nextStep || '',
              customTitles: entry.customTitles || {},
              timestamp: new Date(entry.createdAt).getTime(), // Convert ISO string to Unix timestamp
            };

            return formatted;
          });

          setPastEntries(formattedEntries);
        } else {
          console.error('Failed to fetch entries:', response.status, response.statusText);
        }
      };

      fetchEntries();
    }
  }, []);

  const addJournalEntry = useCallback(async (newEntry: JournalEntryWithTimestamp) => {
    // Only add entry if window is defined (i.e., in a browser environment)
    if (typeof window !== 'undefined') {
      // Ensure custom field titles are included in customTitles object
      const processedEntry = { ...newEntry };
      // Ensure customTitles is an object before processing
      if (!processedEntry.customTitles) {
        processedEntry.customTitles = {};
      }
      const currentCustomTitles: CustomTitles = processedEntry.customTitles;

      // Look for any custom field titles at the top level and include them in customTitles
      Object.keys(processedEntry).forEach(key => {
        if (key.endsWith('_title') && key.startsWith('customField_')) {
          if (typeof processedEntry[key] === 'string') {
            currentCustomTitles[key] = processedEntry[key];
          }
        }
      });

      // IMPORTANT: Don't overwrite custom field values! 
      // customTitles should already have the correct values from the original entry

      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedEntry),
      });

      if (response.ok) {
        const createdEntry = await response.json();

        // Format the created entry to match the expected structure
        const formattedEntry: JournalEntryWithTimestamp = {
          ...createdEntry,
          whatWentWell: createdEntry.whatWentWell || '',
          whatILearned: createdEntry.whatILearned || '',
          whatWouldDoDifferently: createdEntry.whatWouldDoDifferently || '',
          nextStep: createdEntry.nextStep || '',
          customTitles: createdEntry.customTitles || {},
          timestamp: new Date(createdEntry.createdAt).getTime(),
        };

        setPastEntries(prevEntries => [formattedEntry, ...prevEntries]);
      } else {
        console.error('Failed to create entry:', response.status, response.statusText);
      }
    }
  }, []);

  return { pastEntries, addJournalEntry };
}
import { useState, useEffect } from 'react';
import { JournalEntryWithTimestamp } from '../types';

export function useDbJournalEntries() {
  const [pastEntries, setPastEntries] = useState<JournalEntryWithTimestamp[]>([]);

  useEffect(() => {
    // Only fetch entries if window is defined (i.e., in a browser environment)
    if (typeof window !== 'undefined') {
      const fetchEntries = async () => {
        const response = await fetch('/api/journal');
        if (response.ok) {
          const entries = await response.json();
          // Convert createdAt (ISO string) to timestamp (number)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formattedEntries = entries.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.createdAt).getTime(), // Convert ISO string to Unix timestamp
          }));
          setPastEntries(formattedEntries);
        }
      };

      fetchEntries();
    }
  }, []);

  const addJournalEntry = async (newEntry: JournalEntryWithTimestamp) => {
    // Only add entry if window is defined (i.e., in a browser environment)
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        const createdEntry = await response.json();
        setPastEntries(prevEntries => [createdEntry, ...prevEntries]);
      }
    }
  };

  return { pastEntries, addJournalEntry };
}
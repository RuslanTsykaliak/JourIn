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
          const formattedEntries: JournalEntryWithTimestamp[] = entries.map((entry: any) => {
            const newEntry: JournalEntryWithTimestamp = {
              timestamp: new Date(entry.createdAt).getTime(),
            };

            // Copy all properties from 'entry' except the Prisma-specific ones
            for (const key in entry) {
              if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'userId') {
                (newEntry as any)[key] = entry[key];
              }
            }
            return newEntry;
          });
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
        // Map the createdEntry from Prisma to JournalEntryWithTimestamp
        const formattedCreatedEntry: JournalEntryWithTimestamp = {
          timestamp: new Date(createdEntry.createdAt).getTime(),
        };

        for (const key in createdEntry) {
          if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'userId') {
            (formattedCreatedEntry as any)[key] = createdEntry[key];
          }
        }
        setPastEntries(prevEntries => [formattedCreatedEntry, ...prevEntries]);
      }
    }
  };

  return { pastEntries, addJournalEntry };
}
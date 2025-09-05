import { useState, useEffect } from 'react';
import { JournalEntryWithTimestamp } from '../types';

export function useJournalEntriesStorage() {
  const [pastEntries, setPastEntries] = useState<JournalEntryWithTimestamp[]>([]);

  // Load past entries on mount
  useEffect(() => {
    // Only access localStorage if window is defined (i.e., in a browser environment)
    if (typeof window !== 'undefined') {
      const savedPastEntries = localStorage.getItem('jourin_past_entries');
      if (savedPastEntries) {
        try {
          setPastEntries(JSON.parse(savedPastEntries));
        } catch (e) {
          console.error("Failed to parse past entries from localStorage", e);
          localStorage.removeItem('jourin_past_entries');
        }
      }
    }
  }, []);

  // Function to add a new entry and update localStorage
  const addJournalEntry = (newEntry: JournalEntryWithTimestamp) => {
    setPastEntries(prevEntries => {
      const updatedEntries = [newEntry, ...prevEntries].slice(0, 100); // Keep up to 100 entries
      // Only access localStorage if window is defined
      if (typeof window !== 'undefined') {
        localStorage.setItem('jourin_past_entries', JSON.stringify(updatedEntries));
      }
      return updatedEntries;
    });
  };

  return { pastEntries, addJournalEntry };
}
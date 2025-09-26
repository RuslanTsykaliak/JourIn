import { JournalEntryWithTimestamp, defaultTitles } from '../types';

// Helper to get the start of the week (Sunday)
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // Sunday - Saturday : 0 - 6
  const diff = d.getDate() - day; // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper to get the end of the week (Saturday)
export function getEndOfWeek(date: Date): Date {
  const d = new Date(getStartOfWeek(date));
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function generateWeeklySummary(pastEntries: JournalEntryWithTimestamp[], selectedWeekStart: Date, selectedWeekEnd: Date): string {
  const entriesInWeek = pastEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= selectedWeekStart && entryDate <= selectedWeekEnd;
  });

  if (entriesInWeek.length === 0) {
    return 'No journal entries found for this week.';
  } else {
    const summary = entriesInWeek.map(entry => {
      const title = entry.customTitles || defaultTitles;
      return `
---
Journal Entry (${new Date(entry.timestamp).toLocaleDateString()}) ---
${title.whatWentWell}: ${entry.whatWentWell}
${title.whatILearned}: ${entry.whatILearned}
${title.whatWouldDoDifferently}: ${entry.whatWouldDoDifferently}
${title.nextStep}: ${entry.nextStep}
`;
    }).join('\n\n');
    return summary;
  }
}
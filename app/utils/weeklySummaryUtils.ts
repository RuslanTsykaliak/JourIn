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
      const titles = { ...defaultTitles, ...entry.customTitles };
      const fields: string[] = [];
      
      // Add standard fields if they have content
      const standardFields = ['whatWentWell', 'whatILearned', 'whatWouldDoDifferently', 'nextStep'];
      standardFields.forEach(key => {
        const value = entry[key];
        if (value && typeof value === 'string' && value.trim() !== '') {
          const title = titles[key] || key;
          fields.push(`${title}: ${value}`);
        }
      });
      
      // Add dynamic fields if they have content
      if (entry.dynamicFields && typeof entry.dynamicFields === 'object') {
        Object.entries(entry.dynamicFields).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.trim() !== '') {
            const title = entry.customTitles?.[`${key}_title`] || key;
            fields.push(`${title}: ${value}`);
          }
        });
      }
      
      return `
---
Journal Entry ${new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} ---
${fields.join('\n')}
`;
    }).join('\n\n');
    return summary;
  }
}
// app/types.ts

export interface JournalEntries {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
}

export interface JournalEntryWithTimestamp extends JournalEntries {
  timestamp: number; // Unix timestamp for sorting and display
}


// app/types.ts

export type UserGoal = string;

export interface JournalEntries {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
  userGoal?: string; // Optional user goal
}

export interface JournalEntryWithTimestamp extends JournalEntries {
  timestamp: number; // Unix timestamp for sorting and display
}

export interface CustomTitles {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
}


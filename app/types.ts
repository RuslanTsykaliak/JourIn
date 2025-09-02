// app/lib/types.ts

export interface Goal {
  id: string; // Unique ID (e.g., using uuid)
  name: string; // "Find a job", "Build followers"
  specifics: string; // User-defined details
  isDefault: boolean; // true for pre-defined goals, false for user-created
}


export type UserGoal = string;

export interface JournalEntries {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
  userGoal?: string; // Optional user goal
  customTitles?: CustomTitles; // Optional custom titles for the entries
  promptTemplate?: string; // ✅ Optional custom prompt template
  // Index signature to allow dynamic fields
  [key: string]: string | CustomTitles | number | undefined;
}

export interface JournalEntryWithTimestamp extends JournalEntries {
  timestamp: number; // Unix timestamp for sorting and display
}

export interface CustomTitles {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
  [key: string]: string;
}

export interface JournalingTextareaProps {
  name: string;
  placeholder: string;
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onCustomTitleChange: (key: string, value: string) => void;
  onAddField: () => void;
}
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

export interface PrismaJournalEntry {
  id: string;
  createdAt: string; // ISO string from Prisma
  updatedAt: string; // ISO string from Prisma
  userId: string;
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
  customTitles: CustomTitles; // Assuming it's stored as JSON and matches CustomTitles structure
  // Add any other fields that might be in your Prisma JournalEntry model
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

export interface HabitData {
  'my-notes': string;
  'ai-notes': string;
  'tracked-behavior': 'yes' | 'no' | '';
  'watched-video': 'yes' | 'no' | '';
  'exercised': 'yes' | 'no' | '';
  'exercise-plan': string;
  'diet-health': string;
  'sleep-hours': string;
  'sleep-on-time': 'yes' | 'no' | '';
  'energy-level': string;
  'social-media-usage': string;
  'productivity-level': string;
  'completed-work-task': 'yes' | 'no' | '';
  'work-task-tomorrow': string;
  'timeboxed-schedule': 'yes' | 'no' | '';
  'grateful-health': string;
  'grateful-person': string;
  'grateful-circumstances': string;
  'attitude': string;
  'discipline-on-demand': 'yes' | 'no' | '';
}
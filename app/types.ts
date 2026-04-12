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
  customTitles?: CustomTitles; // Optional custom titles for entries
  promptTemplate?: string; // ✅ Optional custom prompt template
  dynamicFields?: Record<string, string>; // For backward compatibility
  // Index signature to allow dynamic fields
  [key: string]: string | CustomTitles | number | undefined | Record<string, string>;
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
  dynamicFields?: Record<string, string>;
  // Add any other fields that might be in your Prisma JournalEntry model
}

export interface CustomTitles {
  [key: string]: string;
}

// User model types matching Prisma schema
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  username: string | null;
  role: Role;
  joinedAt: Date;
  streakCount: number;
  lastCheckIn: Date | null;
  identityTag: string | null;
  customTitles: CustomTitles | null; // JSON field in database
  additionalFields: string[] | null; // JSON field in database
  milestones: Milestone[];
  journalEntries: JournalEntry[];
  habitEntries: HabitEntry[];
  feedback: Feedback[];
  posts: Post[];
  accounts: Account[];
  sessions: Session[];
}

export enum Role {
  USER,
  GUIDE,
  ADMIN
}

// Placeholder types for relations (can be expanded as needed)
export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completedAt: Date;
  userId: string;
}

export interface JournalEntry {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  whatWentWell?: string;
  whatILearned?: string;
  whatWouldDoDifferently?: string;
  nextStep?: string;
  customTitles?: CustomTitles | null; // JSON field matching CustomTitles structure
  dynamicFields?: Record<string, string> | null; // JSON field
  userId: string;
  user?: User;
}

export interface HabitEntry {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  data: Record<string, unknown>; // JSON field
  comments?: string;
  userId: string;
  user?: User;
}

export interface Feedback {
  id: string;
  createdAt: Date;
  content: string;
  userId?: string;
  user?: User;
}

export interface Post {
  id: string;
  createdAt: Date;
  content: string;
  platform: string;
  userId: string;
  user?: User;
  analytics: PostAnalytics[];
}

export interface PostAnalytics {
  id: string;
  createdAt: Date;
  impressions?: number;
  likes?: number;
  comments?: number;
  reposts?: number;
  postId: string;
  post: Post;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  user: User;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
}

export const defaultTitles: CustomTitles = {
  whatWentWell: "What went well today",
  whatILearned: "What I learned today",
  whatWouldDoDifferently: "What I would do differently",
  nextStep: "What's my next step?",
};

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

export interface JournalCoreFields {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
}

export interface JournalEntryForDisplay {
  whatWentWell: string;
  whatILearned: string;
  whatWouldDoDifferently: string;
  nextStep: string;
  userGoal?: string;
  customTitles?: CustomTitles;
  promptTemplate?: string;
  dynamicFields?: Record<string, string>;
  timestamp: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  text: string;
}

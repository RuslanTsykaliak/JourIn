// app/lib/fireUp.ts

export interface StreakData {
  currentStreak: number;
  lastPostDate: string | null;
}

const FIRE_UP_DATA_KEY = 'fireUpData';

// Helper to get today's date as YYYY-MM-DD
const getTodayISO = () => {
  // Use the mocked Date if it exists, otherwise use the real Date
  return new Date().toISOString().split('T')[0];
};

export const getStreakData = (): StreakData => {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, lastPostDate: null };
  }
  const data = localStorage.getItem(FIRE_UP_DATA_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return { currentStreak: 0, lastPostDate: null };
};

export async function updateStreak(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const today = getTodayISO();
  const data = getStreakData();

  // If the last post was today, do nothing to prevent multiple increments.
  if (data.lastPostDate === today) {
    return;
  }

  const newStreakData: StreakData = {
    currentStreak: 1,
    lastPostDate: today,
  };

  if (data.lastPostDate) {
    // Parse dates as UTC to avoid timezone issues
    const lastDate = new Date(data.lastPostDate + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');

    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      // Consecutive day
      newStreakData.currentStreak = data.currentStreak + 1;
    }
    // If diffDays > 1, streak is broken, so it resets to 1 (the default)
    // If diffDays <= 0, something is weird, reset to 1
  }

  localStorage.setItem(FIRE_UP_DATA_KEY, JSON.stringify(newStreakData));
};

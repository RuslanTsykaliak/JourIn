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

// Helper to calculate days between two dates
const calculateDaysDiff = (dateStr1: string, dateStr2: string): number => {
  const date1 = new Date(dateStr1 + 'T00:00:00Z');
  const date2 = new Date(dateStr2 + 'T00:00:00Z');
  const diffTime = date2.getTime() - date1.getTime();
  return diffTime / (1000 * 60 * 60 * 24);
};

export const getStreakData = (): StreakData => {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, lastPostDate: null };
  }

  const data = localStorage.getItem(FIRE_UP_DATA_KEY);
  if (!data) {
    return { currentStreak: 0, lastPostDate: null };
  }

  const parsedData: StreakData = JSON.parse(data);

  // If no last post date, return as is
  if (!parsedData.lastPostDate) {
    return parsedData;
  }

  const today = getTodayISO();
  const daysSinceLastPost = calculateDaysDiff(parsedData.lastPostDate, today);

  // If more than 1 day has passed since last post, reset streak to 0
  if (daysSinceLastPost > 1) {
    const resetData: StreakData = {
      currentStreak: 0,
      lastPostDate: parsedData.lastPostDate, // Keep the original last post date for reference
    };

    // Update localStorage with the reset streak
    localStorage.setItem(FIRE_UP_DATA_KEY, JSON.stringify(resetData));
    return resetData;
  }

  // Return the current data if streak is still valid
  return parsedData;
};

export async function updateStreak(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const today = getTodayISO();

  // Get current streak data (this will auto-reset if needed)
  const data = getStreakData();

  // If the last post was today, do nothing to prevent multiple increments
  if (data.lastPostDate === today) {
    return;
  }

  const newStreakData: StreakData = {
    currentStreak: 1,
    lastPostDate: today,
  };

  if (data.lastPostDate && data.currentStreak > 0) {
    const daysSinceLastPost = calculateDaysDiff(data.lastPostDate, today);

    if (daysSinceLastPost === 1) {
      // Consecutive day - increment the streak
      newStreakData.currentStreak = data.currentStreak + 1;
    }
    // If daysSinceLastPost > 1, streak was already reset to 0 by getStreakData()
    // so we start fresh with 1
    // If daysSinceLastPost <= 0, something is wrong, reset to 1
  }

  localStorage.setItem(FIRE_UP_DATA_KEY, JSON.stringify(newStreakData));

  // Dispatch custom event to notify components of the update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('streakUpdated'));
  }
};
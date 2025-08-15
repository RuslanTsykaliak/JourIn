// __tests__/fireUp.test.ts

import { updateStreak, getStreakData, StreakData } from '../app/lib/fireUp';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// No more FAKE_TODAY, FAKE_YESTERDAY, FAKE_TWO_DAYS_AGO, or mockDate function

describe('Streak Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers(); // Use fake timers
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Run any pending timers
    jest.useRealTimers(); // Restore real timers
  });

  test('should start a new streak at 1 for the first post', () => {
    jest.setSystemTime(new Date('2025-08-14T12:00:00Z')); // Set system time
    updateStreak();
    const data = getStreakData();
    expect(data.currentStreak).toBe(1);
    expect(data.lastPostDate).toBe('2025-08-14');
  });

  test('should not increment streak for multiple posts on the same day', () => {
    jest.setSystemTime(new Date('2025-08-14T12:00:00Z'));
    updateStreak(); // First post
    updateStreak(); // Second post on the same day
    const data = getStreakData();
    expect(data.currentStreak).toBe(1);
    expect(data.lastPostDate).toBe('2025-08-14');
  });

  test('should increment streak for a post on a consecutive day', () => {
    // Set up initial state: 1-day streak from yesterday
    const initialData: StreakData = {
      currentStreak: 1,
      lastPostDate: '2025-08-13',
    };
    localStorage.setItem('fireUpData', JSON.stringify(initialData));

    jest.setSystemTime(new Date('2025-08-14T12:00:00Z')); // Set system time to next day
    updateStreak();
    const data = getStreakData();
    expect(data.currentStreak).toBe(2);
    expect(data.lastPostDate).toBe('2025-08-14');
  });

  test('should reset streak if a day is missed', () => {
    // Set up initial state: 1-day streak from two days ago
    const initialData: StreakData = {
      currentStreak: 1,
      lastPostDate: '2025-08-12',
    };
    localStorage.setItem('fireUpData', JSON.stringify(initialData));

    jest.setSystemTime(new Date('2025-08-14T12:00:00Z')); // Set system time to two days later
    updateStreak();
    const data = getStreakData();
    expect(data.currentStreak).toBe(1); // Resets to 1
    expect(data.lastPostDate).toBe('2025-08-14');
  });

  test('getStreakData should return default values if no data exists', () => {
    const data = getStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.lastPostDate).toBeNull();
  });
});
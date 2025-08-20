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

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: jest.fn(),
});

describe('Streak Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should start a new streak at 1 for the first post', () => {
    jest.setSystemTime(new Date('2025-08-14T12:00:00Z'));
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

    jest.setSystemTime(new Date('2025-08-14T12:00:00Z'));
    updateStreak();
    const data = getStreakData();
    expect(data.currentStreak).toBe(2);
    expect(data.lastPostDate).toBe('2025-08-14');
  });

  test('should reset streak if a day is missed when posting', () => {
    // Set up initial state: 1-day streak from two days ago
    const initialData: StreakData = {
      currentStreak: 1,
      lastPostDate: '2025-08-12',
    };
    localStorage.setItem('fireUpData', JSON.stringify(initialData));

    jest.setSystemTime(new Date('2025-08-14T12:00:00Z'));
    updateStreak();
    const data = getStreakData();
    expect(data.currentStreak).toBe(1); // Resets to 1 when posting after missing days
    expect(data.lastPostDate).toBe('2025-08-14');
  });

  test('should reset streak to 0 when user misses a day without posting', () => {
    // Set up initial state: 1-day streak from yesterday
    const initialData: StreakData = {
      currentStreak: 1,
      lastPostDate: '2025-08-13',
    };
    localStorage.setItem('fireUpData', JSON.stringify(initialData));

    // Move to today but DON'T call updateStreak() - simulating no post
    jest.setSystemTime(new Date('2025-08-15T12:00:00Z')); // Two days later

    // Just check the streak - getStreakData should auto-reset
    const data = getStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.lastPostDate).toBe('2025-08-13'); // Should keep original date
  });

  test('should reset streak to 0 when checking multiple days later', () => {
    // Set up initial state: 5-day streak from 3 days ago
    const initialData: StreakData = {
      currentStreak: 5,
      lastPostDate: '2025-08-11',
    };
    localStorage.setItem('fireUpData', JSON.stringify(initialData));

    // Move to today - 3 days later
    jest.setSystemTime(new Date('2025-08-14T12:00:00Z'));

    const data = getStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.lastPostDate).toBe('2025-08-11');
  });

  test('should maintain streak if checking on the same day', () => {
    // Set up initial state: 3-day streak from today
    const initialData: StreakData = {
      currentStreak: 3,
      lastPostDate: '2025-08-14',
    };
    localStorage.setItem('fireUpData', JSON.stringify(initialData));

    jest.setSystemTime(new Date('2025-08-14T18:00:00Z')); // Same day, different time

    const data = getStreakData();
    expect(data.currentStreak).toBe(3); // Should maintain streak
    expect(data.lastPostDate).toBe('2025-08-14');
  });

  test('should maintain streak if checking the next day (within 1 day)', () => {
    // Set up initial state: 2-day streak from yesterday
    const initialData: StreakData = {
      currentStreak: 2,
      lastPostDate: '2025-08-13',
    };
    localStorage.setItem('fireUpData', JSON.stringify(initialData));

    jest.setSystemTime(new Date('2025-08-14T12:00:00Z')); // Next day

    const data = getStreakData();
    expect(data.currentStreak).toBe(2); // Should maintain streak (1 day diff is allowed)
    expect(data.lastPostDate).toBe('2025-08-13');
  });

  test('getStreakData should return default values if no data exists', () => {
    const data = getStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.lastPostDate).toBeNull();
  });

  test('should dispatch streakUpdated event when updating streak', () => {
    jest.setSystemTime(new Date('2025-08-14T12:00:00Z'));

    updateStreak();

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'streakUpdated'
      })
    );
  });
});
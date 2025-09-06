// __tests__/streakCounter.test.tsx
jest.setTimeout(30000);

import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/page';
import { generatePromptText } from '../app/utils/generatePromptText';

// Mock JournalHistorySection to prevent its internal logic from interfering
jest.mock('../app/components/journalHistorySection', () => {
  return jest.fn(() => null); // Render nothing for JournalHistorySection
});

jest.mock('../app/lib/fireUp', () => ({
  __esModule: true,
  ...jest.requireActual('../app/lib/fireUp'),
}));

// Mock the generatePromptText module
jest.mock('../app/utils/generatePromptText', () => ({
  generatePromptText: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ status: 'unauthenticated', data: null })),
}));

describe('Streak Counter Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure a clean state
    localStorage.clear();
    // Reset mocks before each test
    jest.spyOn(require('../app/lib/fireUp'), 'getStreakData').mockClear();
    jest.spyOn(require('../app/lib/fireUp'), 'updateStreak').mockClear();
    (generatePromptText as jest.Mock).mockClear();
  });

  test('should reset streak counter if a day is missed', async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoISO = twoDaysAgo.toISOString().split('T')[0];

    localStorage.setItem('fireUpData', JSON.stringify({ currentStreak: 5, lastPostDate: twoDaysAgoISO }));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/JourIn: Journal Your Way to Impact 🔥 0/i)).toBeInTheDocument();
    });
  });

  test('should update streak counter when a new prompt is generated', async () => {
    const getStreakDataSpy = jest.spyOn(require('../app/lib/fireUp'), 'getStreakData');
    const updateStreakSpy = jest.spyOn(require('../app/lib/fireUp'), 'updateStreak');

    getStreakDataSpy.mockReturnValue({ currentStreak: 0, lastPostDate: null });
    (generatePromptText as jest.Mock).mockReturnValue('dummy prompt');

    render(<Home />);

    expect(screen.getByText(/JourIn: Journal Your Way to Impact 🔥 0/i)).toBeInTheDocument();

    updateStreakSpy.mockImplementation(async () => {
      getStreakDataSpy.mockReturnValue({
        currentStreak: 1,
        lastPostDate: new Date().toISOString().split('T')[0],
      });
    });

    const whatWentWellTextarea = screen.getByPlaceholderText('Reflect on your achievements and positive experiences...');
    fireEvent.change(whatWentWellTextarea, { target: { value: 'Test entry' } });

    const generateButton = screen.getByRole('button', { name: /Generate Post Prompt/i });

    await act(async () => {
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/JourIn: Journal Your Way to Impact 🔥 1/i)).toBeInTheDocument();
    });

    expect(updateStreakSpy).toHaveBeenCalled();
  });
});

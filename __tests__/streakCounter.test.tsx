// __tests__/streakCounter.test.tsx
import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/page';
import { getStreakData, updateStreak } from '../app/lib/fireUp';
import * as generatePromptText from '../app/utils/generatePromptText';

// Mock the fireUp module
jest.mock('../app/lib/fireUp', () => ({
  getStreakData: jest.fn(),
  updateStreak: jest.fn(),
}));

// Mock the generatePromptText module
jest.mock('../app/utils/generatePromptText', () => ({
  generatePromptText: jest.fn(),
}));


describe('Streak Counter Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (getStreakData as jest.Mock).mockClear();
    (updateStreak as jest.Mock).mockClear();
    (generatePromptText.generatePromptText as jest.Mock).mockClear();
  });

  test('should update streak counter when a new prompt is generated', async () => {
    (getStreakData as jest.Mock).mockReturnValue({ currentStreak: 0, lastPostDate: null });
    (generatePromptText.generatePromptText as jest.Mock).mockReturnValue('dummy prompt');

    render(<Home />);

    expect(screen.getByText(/JourIn: Journal Your Way to Impact 🔥 0/i)).toBeInTheDocument();

    (updateStreak as jest.Mock).mockImplementation(() => {
      (getStreakData as jest.Mock).mockReturnValue({
        currentStreak: 1,
        lastPostDate: new Date().toISOString().split('T')[0],
      });
      return Promise.resolve();
    });

    const generateButton = screen.getByRole('button', { name: /Generate Post Prompt/i });

    await act(async () => {
      fireEvent.click(generateButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/JourIn: Journal Your Way to Impact 🔥 1/i)).toBeInTheDocument();
    });

    expect(updateStreak).toHaveBeenCalled();
  });

});

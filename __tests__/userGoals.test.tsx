import React from 'react';
import { render, screen, fireEvent, waitFor } from './test-utils';
import PromptInputSection from '../app/components/promptInputSection';
import '@testing-library/jest-dom';

describe('PromptInputSection user goal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save user goal to localStorage and restore it on reload', async () => {
    const handlePromptGenerated = jest.fn();
    const { rerender } = render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    const goalInput = screen.getByPlaceholderText("Your goal (e.g., 'Find a fullstack position', 'Build followers for my tech blog')");
    fireEvent.change(goalInput, { target: { value: 'My test goal' } });

    await waitFor(() => {
      expect(localStorage.getItem('jourin_user_goal')).toBe(JSON.stringify('My test goal'));
    });

    // Simulate a reload by rerendering the component
    rerender(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    const goalInputAfterReload = screen.getByPlaceholderText("Your goal (e.g., 'Find a fullstack position', 'Build followers for my tech blog')");
    expect(goalInputAfterReload).toHaveValue('My test goal');
  });
});

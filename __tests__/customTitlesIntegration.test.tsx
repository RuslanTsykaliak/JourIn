import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptInputSection from '../app/components/promptInputSection';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('Custom Titles Integration Tests', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default mock for useSession to be authenticated
    mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1', email: 'test@example.com' } }, 
      status: 'authenticated' 
    });
  });

  it('should update custom titles when user edits them', async () => {
    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);
    const user = userEvent.setup();

    // Wait for component to hydrate
    await waitFor(() => {
      expect(screen.getByText('What went well today?')).toBeInTheDocument();
    });

    // Edit a custom title
    const whatWentWellTitle = screen.getByText('What went well today?');
    await user.dblClick(whatWentWellTitle);

    const inputWhatWentWell = screen.getByRole('textbox', { name: /edit what went well today?/i }) as HTMLInputElement;
    await user.clear(inputWhatWentWell);
    await user.type(inputWhatWentWell, 'My Custom Title:');

    // Blur to save
    await user.tab(); // Move focus away to trigger blur

    // Wait for title to update in UI
    await waitFor(() => {
      expect(screen.getByText('My Custom Title:')).toBeInTheDocument();
    });

    // Verify the custom title is saved to localStorage
    const savedCustomTitles = localStorage.getItem('jourin_custom_titles');
    expect(savedCustomTitles).toBeTruthy();
    
    const parsedTitles = JSON.parse(savedCustomTitles!);
    expect(parsedTitles.whatWentWell).toBe('My Custom Title:');
  });

  it('should load custom titles from localStorage on mount', async () => {
    // Set up localStorage with custom titles
    const customTitles = {
      whatWentWell: 'Custom Win Title:',
      whatILearned: 'Custom Learn Title:',
      whatWouldDoDifferently: 'Custom Improve Title:',
      nextStep: 'Custom Next Title:'
    };
    localStorage.setItem('jourin_custom_titles', JSON.stringify(customTitles));

    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Wait for custom titles to be loaded from localStorage
    await waitFor(() => {
      expect(screen.getByText('Custom Win Title:')).toBeInTheDocument();
      expect(screen.getByText('Custom Learn Title:')).toBeInTheDocument();
      expect(screen.getByText('Custom Improve Title:')).toBeInTheDocument();
      expect(screen.getByText('Custom Next Title:')).toBeInTheDocument();
    });
  });

  it('should handle both authenticated and unauthenticated states', async () => {
    // Test as authenticated user
    mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1', email: 'test@example.com' } }, 
      status: 'authenticated' 
    });

    const handlePromptGenerated = jest.fn();
    const { rerender } = render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    await waitFor(() => {
      expect(screen.getByText('What went well today?')).toBeInTheDocument();
    });

    // Edit title while authenticated
    const whatWentWellTitle = screen.getByText('What went well today?');
    await userEvent.dblClick(whatWentWellTitle);

    const inputWhatWentWell = screen.getByRole('textbox', { name: /edit what went well today?/i }) as HTMLInputElement;
    await userEvent.clear(inputWhatWentWell);
    await userEvent.type(inputWhatWentWell, 'Authenticated Title:');
    await userEvent.tab(); // Save

    await waitFor(() => {
      expect(screen.getByText('Authenticated Title:')).toBeInTheDocument();
    });

    // Switch to unauthenticated
    mockUseSession.mockReturnValue({ 
      data: null, 
      status: 'unauthenticated' 
    });

    rerender(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Should still show the custom title (from localStorage)
    await waitFor(() => {
      expect(screen.getByText('Authenticated Title:')).toBeInTheDocument();
    });
  });

  it('should handle prompt generation with custom titles', async () => {
    // Set up custom titles with all required fields
    const customTitles = {
      whatWentWell: 'My Wins:',
      whatILearned: 'My Learnings:',
      whatWouldDoDifferently: 'My Improvements:',
      nextStep: 'My Next Steps:'
    };
    localStorage.setItem('jourin_custom_titles', JSON.stringify(customTitles));

    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);
    const user = userEvent.setup();

    // Wait for custom titles to load
    await waitFor(() => {
      expect(screen.getByText('My Wins:')).toBeInTheDocument();
    });

    // Fill in journal entry
    const whatWentWellTextarea = screen.getByLabelText(/My Wins:/i);
    await user.type(whatWentWellTextarea, 'Had a great day at work');

    // Click generate button
    const generateButton = screen.getByRole('button', { name: /generate post prompt/i });
    await user.click(generateButton);

    // Wait for prompt generation
    await waitFor(() => {
      expect(handlePromptGenerated).toHaveBeenCalledWith(
        expect.any(String), // The generated prompt string
        expect.objectContaining({
          whatWentWell: 'Had a great day at work',
        }),
        expect.objectContaining(customTitles)
      );
    });
  });
});

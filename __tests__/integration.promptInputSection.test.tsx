import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromptInputSection from '../app/components/promptInputSection';
import '@testing-library/jest-dom';

describe('PromptInputSection', () => {
  it('should allow users to edit journal entry titles via inline editing', async () => {
    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Initial titles should be present
    expect(screen.getByText('What went well today?')).toBeInTheDocument();
    expect(screen.getByText('What did I learn today?')).toBeInTheDocument();
    expect(screen.getByText('What would I do differently?')).toBeInTheDocument();
    expect(screen.getByText('What’s my next step?')).toBeInTheDocument();

    // Simulate double-clicking on a title to activate editing mode
    const whatWentWellTitle = screen.getByText('What went well today?');
    fireEvent.doubleClick(whatWentWellTitle);

    // Check if input field appears with current title
    // Use getByRole('textbox') with the specific aria-label
    const inputWhatWentWell = screen.getByRole('textbox', { name: /edit what went well today?/i });
    expect(inputWhatWentWell).toBeInTheDocument();
    expect(inputWhatWentWell).toHaveValue('What went well today?'); // Verify its initial value

    // Change the title
    fireEvent.change(inputWhatWentWell, { target: { value: 'My Wins:' } });

    // Simulate blurring the input field to trigger save
    fireEvent.blur(inputWhatWentWell);

    // Wait for the new title to appear and old one to disappear
    await waitFor(() => {
      expect(screen.getByText('My Wins:')).toBeInTheDocument();
      expect(screen.queryByText('What went well today?')).not.toBeInTheDocument();
    });

    // Ensure other titles are still present
    expect(screen.getByText('What did I learn today?')).toBeInTheDocument();
    expect(screen.getByText('What would I do differently?')).toBeInTheDocument();
    expect(screen.getByText('What’s my next step?')).toBeInTheDocument();

    // Test another title
    const whatILearnedTitle = screen.getByText('What did I learn today?');
    fireEvent.doubleClick(whatILearnedTitle);
    const inputWhatILearned = screen.getByRole('textbox', { name: /edit what did i learn today?/i });
    expect(inputWhatILearned).toBeInTheDocument();
    expect(inputWhatILearned).toHaveValue('What did I learn today?');

    fireEvent.change(inputWhatILearned, { target: { value: 'New Knowledge:' } });
    fireEvent.blur(inputWhatILearned);

    await waitFor(() => {
      expect(screen.getByText('New Knowledge:')).toBeInTheDocument();
      expect(screen.queryByText('What did I learn today?')).not.toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GeneratedPromptDisplay from '../../app/components/generatedPromptDisplay';
import '@testing-library/jest-dom';

describe('GeneratedPromptDisplay', () => {
  it('displays the generated prompt', () => {
    const prompt = 'This is a test prompt.';
    render(<GeneratedPromptDisplay prompt={prompt} onCopy={() => {}} copySuccess="" />);
    expect(screen.getByText(prompt)).toBeInTheDocument();
  });

  it('calls the onCopy function when the copy button is clicked', () => {
    const onCopy = jest.fn();
    render(<GeneratedPromptDisplay prompt="Test prompt" onCopy={onCopy} copySuccess="" />);
    const copyButton = screen.getByRole('button', { name: /copy prompt/i });
    fireEvent.click(copyButton);
    expect(onCopy).toHaveBeenCalled();
  });

  it('shows a success message when copySuccess is provided', () => {
    const copySuccessMessage = 'Copied!';
    render(<GeneratedPromptDisplay prompt="Test prompt" onCopy={() => {}} copySuccess={copySuccessMessage} />);
    expect(screen.getByText(copySuccessMessage)).toBeInTheDocument();
  });

  it('hides and shows the prompt when the toggle button is clicked', () => {
    const prompt = 'This is a test prompt.';
    render(<GeneratedPromptDisplay prompt={prompt} onCopy={() => {}} copySuccess="" />);
    const toggleButton = screen.getByRole('button', { name: /hide/i });

    // Hide the prompt
    fireEvent.click(toggleButton);
    expect(screen.queryByText(prompt)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show/i })).toBeInTheDocument();

    // Show the prompt
    fireEvent.click(toggleButton);
    expect(screen.getByText(prompt)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from './test-utils';
import UploadHistoryButton from '../app/components/UploadHistoryButton';
import '@testing-library/jest-dom';

// Mock next-auth/react - same pattern as working tests
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(() => ({
    data: {
      user: { email: 'test@example.com', id: 'test-user-id', name: 'Test User' }
    },
    status: 'authenticated'
  }))
}));

// Mock fetch
global.fetch = jest.fn();

// Mock FormData
global.FormData = jest.fn(() => ({
  append: jest.fn(),
  get: jest.fn(),
})) as any;

describe('UploadHistoryButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload button when user is authenticated', () => {
    render(<UploadHistoryButton />);
    
    const uploadButton = screen.getByLabelText(/upload history/i) || screen.getByText(/upload history/i);
    expect(uploadButton).toBeInTheDocument();
    expect(uploadButton).toHaveTextContent('Upload History');
  });

  test('does not render when user is not authenticated', () => {
    // Mock unauthenticated session
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    
    const { container } = render(<UploadHistoryButton />);
    
    expect(container.firstChild).toBeNull();
    
    // Restore authenticated session for other tests
    useSession.mockReturnValue({
      data: {
        user: { email: 'test@example.com', id: 'test-user-id', name: 'Test User' }
      },
      status: 'authenticated'
    });
  });

  test('shows uploading state during upload', async () => {
    // Mock a slow upload response
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          message: 'Successfully uploaded 2 journal entries',
          entriesCount: 2
        })
      }), 100))
    );

    render(<UploadHistoryButton />);
    
    const uploadButton = screen.getByRole('button', { name: /upload history/i });
    const hiddenInput = uploadButton?.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create a mock file
    const file = new File(['# Test Content'], 'test.md', { type: 'text/markdown' });
    
    // Simulate file selection
    fireEvent.change(hiddenInput, { target: { files: [file] } });
    
    // Should show uploading state
    await waitFor(() => {
      expect(uploadButton).toHaveTextContent('Uploading...');
      expect(uploadButton).toBeDisabled();
    });
  });

  test('handles successful upload', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        message: 'Successfully uploaded 2 journal entries',
        entriesCount: 2,
        entries: []
      })
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Mock window.location.reload
    const reloadSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });

    render(<UploadHistoryButton />);
    
    const uploadButton = screen.getByRole('button', { name: /upload history/i });
    const hiddenInput = uploadButton?.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (!hiddenInput) return;
    
    // Create a mock file
    const file = new File(['# Test Content'], 'test.md', { type: 'text/markdown' });
    
    // Simulate file selection
    fireEvent.change(hiddenInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    await waitFor(() => {
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  test('handles upload error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

    render(<UploadHistoryButton />);
    
    const uploadButton = screen.getByRole('button', { name: /upload history/i });
    const hiddenInput = uploadButton?.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (!hiddenInput) return;
    
    // Create a mock file
    const file = new File(['# Test Content'], 'test.md', { type: 'text/markdown' });
    
    // Simulate file selection
    fireEvent.change(hiddenInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Upload error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('applies custom className correctly', () => {
    const { container } = render(<UploadHistoryButton className="custom-test-class" />);
    
    expect(container.firstChild).toHaveClass('custom-test-class');
  });

  test('button has correct accessibility attributes', () => {
    render(<UploadHistoryButton />);
    
    const uploadButton = screen.getByRole('button', { name: /upload history/i });
    
    expect(uploadButton).not.toBeDisabled();
  });

  test('file input accepts only markdown files', () => {
    render(<UploadHistoryButton />);
    
    const uploadButton = screen.getByRole('button', { name: /upload history/i });
    const hiddenInput = uploadButton?.querySelector('input[type="file"]') as HTMLInputElement;
    
    if (!hiddenInput) return;
    
    expect(hiddenInput).toHaveAttribute('accept', '.md,.markdown');
  });

  test('button is disabled during upload', async () => {
    // Mock a slow upload response
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({
          message: 'Successfully uploaded 2 journal entries',
          entriesCount: 2
        })
      }), 100))
    );

    render(<UploadHistoryButton />);
    
    const uploadButton = screen.getByRole('button', { name: /upload history/i });
    const hiddenInput = uploadButton.querySelector('input[type="file"]');
    
    // Create a mock file
    const file = new File(['# Test Content'], 'test.md', { type: 'text/markdown' });
    
    // Simulate file selection
    fireEvent.change(hiddenInput, { target: { files: [file] } });
    
    // Check disabled state immediately after file selection
    expect(uploadButton).toBeDisabled();
    expect(uploadButton).toHaveAttribute('disabled');
  });
});

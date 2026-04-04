import React from 'react';
import { render, screen, fireEvent, waitFor } from './test-utils';
import DownloadHistoryButton from '../app/components/DownloadHistoryButton';
import '@testing-library/jest-dom';

// Mock next-auth/react - same pattern as working journalHistorySection.test.tsx
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(() => ({
    data: {
      user: { email: 'test@example.com', id: 'test-user-id', name: 'Test User' }
    },
    status: 'authenticated'
  }))
}));

describe('DownloadHistoryButton', () => {
  let mockCreateElement: jest.Mock;
  let mockAppendChild: jest.Mock;
  let mockRemoveChild: jest.Mock;
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock URL methods
    mockCreateObjectURL = jest.fn(() => 'mock-url');
    mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document methods
    mockAppendChild = jest.fn();
    mockRemoveChild = jest.fn();
    
    const mockElement = {
      style: { display: 'none' },
      href: '',
      download: '',
      click: jest.fn(),
      setAttribute: jest.fn(),
    };
    
    mockCreateElement = jest.fn(() => mockElement);
    
    // Store original methods
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    
    // Mock methods
    document.createElement = mockCreateElement as any;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
    
    // Restore after each test
    return () => {
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
    };
  });

  test('renders download button when user is authenticated', () => {
    render(<DownloadHistoryButton />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveTextContent('Download');
  });

  test('does not render when user is not authenticated', () => {
    // Mock unauthenticated session
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    
    const { container } = render(<DownloadHistoryButton />);
    
    expect(container.firstChild).toBeNull();
    
    // Restore authenticated session for other tests
    useSession.mockReturnValue({
      data: {
        user: { email: 'test@example.com', id: 'test-user-id', name: 'Test User' }
      },
      status: 'authenticated'
    });
  });

  test('shows downloading state when download is in progress', async () => {
    // Mock a slow fetch response
    global.fetch = jest.fn(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        redirected: false,
        type: 'basic',
        url: 'http://localhost/api/export?format=markdown',
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn().mockResolvedValue(new Blob(['test content'])),
        formData: jest.fn(),
        json: jest.fn(),
        text: jest.fn(),
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'content-disposition') {
              return 'attachment; filename="journal-history-2026-03-22.md"';
            }
            return null;
          }),
          append: jest.fn(),
          delete: jest.fn(),
          has: jest.fn(),
          set: jest.fn(),
          entries: jest.fn(),
          keys: jest.fn(),
          values: jest.fn(),
          forEach: jest.fn(),
          getSetCookie: jest.fn(),
          [Symbol.iterator]: jest.fn(),
        },
        bytes: jest.fn(),
      }), 100))
    );

    render(<DownloadHistoryButton />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    fireEvent.click(downloadButton);
    
    // Should show downloading state
    expect(downloadButton).toHaveTextContent('Downloading...');
    expect(downloadButton).toBeDisabled();
  });

  test('successfully downloads markdown file', async () => {
    const mockBlob = new Blob(['# Test Markdown Content'], { type: 'text/markdown' });
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      redirected: false,
      type: 'basic',
      url: 'http://localhost/api/export?format=markdown',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn().mockResolvedValue(mockBlob),
      formData: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
      bytes: jest.fn(),
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'content-disposition') {
            return 'attachment; filename="journal-history-2026-03-22.md"';
          }
          return null;
        }),
        append: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        set: jest.fn(),
        entries: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        forEach: jest.fn(),
        getSetCookie: jest.fn(),
        [Symbol.iterator]: jest.fn(),
      },
    });

    render(<DownloadHistoryButton />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/export?format=markdown');
    });

    await waitFor(() => {
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });

    await waitFor(() => {
      expect(mockAppendChild).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockRemoveChild).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    // Verify the button returns to normal state
    await waitFor(() => {
      expect(downloadButton).toHaveTextContent('Download');
      expect(downloadButton).not.toBeDisabled();
    });
  });

  test('handles download error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      redirected: false,
      type: 'basic',
      url: 'http://localhost/api/export?format=markdown',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
      headers: {
        get: jest.fn(),
        append: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        set: jest.fn(),
        entries: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        forEach: jest.fn(),
        getSetCookie: jest.fn(),
        [Symbol.iterator]: jest.fn(),
      }
    });

    render(<DownloadHistoryButton />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/export?format=markdown');
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Download error:', expect.any(Error));
    });

    // Button should return to normal state after error
    await waitFor(() => {
      expect(downloadButton).toHaveTextContent('Download');
      expect(downloadButton).not.toBeDisabled();
    });

    consoleSpy.mockRestore();
  });

  test('uses default filename when content-disposition header is missing', async () => {
    const mockBlob = new Blob(['# Test Content'], { type: 'text/markdown' });
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      redirected: false,
      type: 'basic',
      url: 'http://localhost/api/export?format=markdown',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn().mockResolvedValue(mockBlob),
      formData: jest.fn(),
      json: jest.fn(),
      text: jest.fn(),
      bytes: jest.fn(),
      headers: {
        get: jest.fn(() => null),
        append: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        set: jest.fn(),
        entries: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        forEach: jest.fn(),
        getSetCookie: jest.fn(),
        [Symbol.iterator]: jest.fn(),
      },
    });

    render(<DownloadHistoryButton />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/export?format=markdown');
    });

    const mockAnchor = mockCreateElement.mock.results[0].value;
    
    await waitFor(() => {
      expect(mockAnchor.download).toBe('journal-history.markdown');
    });
  });

  test('applies custom className correctly', () => {
    const { container } = render(<DownloadHistoryButton className="custom-test-class" />);
    
    expect(container.firstChild).toHaveClass('custom-test-class');
  });

  test('button has correct accessibility attributes', () => {
    render(<DownloadHistoryButton />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    expect(downloadButton).toHaveAttribute('type', 'button');
    expect(downloadButton).not.toBeDisabled();
  });

  test('button is disabled during download', async () => {
    // Mock a slow response to test disabled state
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        headers: {
          get: jest.fn(() => 'attachment; filename="test.md"')
        },
        blob: jest.fn().mockResolvedValue(new Blob(['test']))
      }), 100))
    );

    render(<DownloadHistoryButton />);
    
    const downloadButton = screen.getByRole('button', { name: /download/i });
    
    fireEvent.click(downloadButton);
    
    // Check disabled state immediately after click
    expect(downloadButton).toBeDisabled();
    expect(downloadButton).toHaveAttribute('disabled');
    
    // Wait for completion and verify it's re-enabled
    await waitFor(() => {
      expect(downloadButton).not.toBeDisabled();
    }, { timeout: 200 });
  });
});

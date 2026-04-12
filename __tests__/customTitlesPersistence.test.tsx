import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptInputSection from '../app/components/promptInputSection';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch global
global.fetch = jest.fn();

describe('Custom Titles Cross-Browser Persistence', () => {
  const mockFetch = global.fetch as jest.Mock;
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Reset and setup fetch mock before each test
    mockFetch.mockReset();
    
    // Default fetch mock for custom-titles API
    mockFetch.mockImplementation((url, options) => {
      console.log('Mock fetch called with:', url, options?.method);
      
      if (url === '/api/custom-titles' && !options?.method) {
        // GET request
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ customTitles: null }),
        });
      } else if (url === '/api/custom-titles' && options?.method === 'POST') {
        // POST request (save)
        console.log('Handling POST request for custom-titles');
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            message: "Custom titles saved successfully",
            customTitles: JSON.parse(options.body as string).customTitles 
          }),
        });
      } else if (url === '/api/sync/custom-titles' && options?.method === 'POST') {
        // SYNC request
        const body = JSON.parse(options.body as string);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            message: "Custom titles synced successfully",
            customTitles: body.customTitles 
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for ${url}`));
    });
  });

  it('should save custom titles to database when user is authenticated', async () => {
    // Mock authenticated user
    mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1', email: 'test@example.com' } }, 
      status: 'authenticated' 
    });

    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);
    const user = userEvent.setup();

    // Wait for component to hydrate
    await waitFor(() => {
      expect(screen.getByText('What went well today?')).toBeInTheDocument();
    });

    // Clear any previous fetch calls
    mockFetch.mockClear();

    // Edit a custom title
    const whatWentWellTitle = screen.getByText('What went well today?');
    console.log('Found title:', whatWentWellTitle.textContent);
    
    await user.dblClick(whatWentWellTitle);

    const inputWhatWentWell = screen.getByRole('textbox', { name: /edit what went well today?/i }) as HTMLInputElement;
    console.log('Input value before change:', inputWhatWentWell.value);
    
    await user.clear(inputWhatWentWell);
    await user.type(inputWhatWentWell, 'My Awesome Wins:');
    console.log('Input value after change:', inputWhatWentWell.value);

    // Blur to save
    await user.tab(); // Move focus away to trigger blur

    // Wait for title to update in UI first
    await waitFor(() => {
      console.log('Looking for text: My Awesome Wins:');
      expect(screen.getByText('My Awesome Wins:')).toBeInTheDocument();
    });

    console.log('Title updated in UI successfully');

    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    // Debug: Log all fetch calls
    console.log('All fetch calls:', mockFetch.mock.calls);

    // Check if any fetch call was made to save custom titles
    const customTitlesSaveCall = mockFetch.mock.calls.find(call => 
      call[0] === '/api/custom-titles' && 
      call[1]?.method === 'POST'
    );

    if (customTitlesSaveCall) {
      expect(customTitlesSaveCall[1]).toEqual({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('My Awesome Wins:'),
      });
    } else {
      // If no save call was made, fail with a helpful message
      throw new Error('Database save was not called. Fetch calls made: ' + JSON.stringify(mockFetch.mock.calls.map(call => call[0])));
    }
  });

  it('should load custom titles from database on mount for authenticated users', async () => {
    // Mock database response with custom titles
    mockFetch.mockImplementation((url) => {
      if (url === '/api/custom-titles') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            customTitles: {
              whatWentWell: 'Database Custom Title:',
              whatILearned: 'Database Learning:',
              whatWouldDoDifferently: 'Database Improvements:',
              nextStep: 'Database Next Steps:'
            }
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for ${url}`));
    });

    // Mock authenticated user
    mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1', email: 'test@example.com' } }, 
      status: 'authenticated' 
    });

    const handlePromptGenerated = jest.fn();
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Wait for custom titles to be loaded from database
    await waitFor(() => {
      expect(screen.getByText('Database Custom Title:')).toBeInTheDocument();
      expect(screen.getByText('Database Learning:')).toBeInTheDocument();
      expect(screen.getByText('Database Improvements:')).toBeInTheDocument();
      expect(screen.getByText('Database Next Steps:')).toBeInTheDocument();
    });

    // Verify the GET request was made
    expect(mockFetch).toHaveBeenCalledWith('/api/custom-titles');
  });

  it('should sync localStorage custom titles to database on login', async () => {
    // Set up localStorage with custom titles (simulating previous guest usage)
    const localStorageTitles = {
      whatWentWell: 'Local Storage Wins:',
      whatILearned: 'Local Storage Learning:'
    };
    localStorage.setItem('jourin_custom_titles', JSON.stringify(localStorageTitles));

    // Mock sync API response
    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/sync/custom-titles' && options?.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            message: "Custom titles synced successfully",
            customTitles: { ...localStorageTitles, ...body.customTitles }
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for ${url}`));
    });

    // Initially unauthenticated
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    const handlePromptGenerated = jest.fn();
    const { rerender } = render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Local Storage Wins:')).toBeInTheDocument();
    });

    // Simulate user login
    mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1', email: 'test@example.com' } }, 
      status: 'authenticated' 
    });

    // Rerender to simulate login state change
    rerender(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Wait for sync to be called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/sync/custom-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customTitles: localStorageTitles }),
      });
    });
  });

  it('should handle cross-browser scenario: edit titles in browser A, login in browser B', async () => {
    // Step 1: Browser A - User edits titles while authenticated
    mockUseSession.mockReturnValue({ 
      data: { user: { id: 'user-1', email: 'test@example.com' } }, 
      status: 'authenticated' 
    });

    // Mock database to save and then return the saved titles
    let savedTitles: any = null;
    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/custom-titles' && options?.method === 'POST') {
        savedTitles = JSON.parse(options.body as string).customTitles;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            message: "Custom titles saved successfully",
            customTitles: savedTitles 
          }),
        });
      } else if (url === '/api/custom-titles' && !options?.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ customTitles: savedTitles }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for ${url}`));
    });

    // Browser A: Edit titles
    const handlePromptGenerated = jest.fn();
    const { unmount } = render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('What went well today?')).toBeInTheDocument();
    });

    const whatWentWellTitle = screen.getByText('What went well today?');
    await user.dblClick(whatWentWellTitle);

    const inputWhatWentWell = screen.getByRole('textbox', { name: /edit what went well today?/i });
    await user.clear(inputWhatWentWell);
    await user.type(inputWhatWentWell, 'Cross-Browser Title:');
    await user.tab(); // Save

    await waitFor(() => {
      expect(screen.getByText('Cross-Browser Title:')).toBeInTheDocument();
    });

    // Unmount to simulate closing browser A
    unmount();

    // Step 2: Browser B - User logs in (fresh localStorage)
    localStorage.clear(); // Simulate fresh browser
    mockFetch.mockClear(); // Reset fetch calls

    // Mock the database to return the previously saved titles
    mockFetch.mockImplementation((url) => {
      if (url === '/api/custom-titles') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            customTitles: {
              whatWentWell: 'Cross-Browser Title:',
              whatILearned: 'What did I learn today?',
              whatWouldDoDifferently: 'What would I do differently?',
              nextStep: 'What\'s my next step?'
            }
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch for ${url}`));
    });

    // Browser B: User logs in
    render(<PromptInputSection onPromptGenerated={handlePromptGenerated} />);

    // Wait for titles to be loaded from database
    await waitFor(() => {
      expect(screen.getByText('Cross-Browser Title:')).toBeInTheDocument();
      expect(screen.getByText('What did I learn today?')).toBeInTheDocument();
    });

    // Verify GET request was made to load from database
    expect(mockFetch).toHaveBeenCalledWith('/api/custom-titles');
  });
});

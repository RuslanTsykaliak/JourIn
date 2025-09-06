import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-utils'; // Import custom render
import WeeklySummaryPage from '@/app/habits/weekly-summary/page';

// Mock fetch
global.fetch = jest.fn();

describe('WeeklySummaryPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should allow editing a cell when clicked', async () => {
    // Arrange: Mock initial data
    const initialData = [
      {
        id: 'entry-1',
        date: new Date(),
        data: { exercised: 'yes' },
        comments: 'Good workout',
      },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => initialData,
    });

    render(<WeeklySummaryPage />);

    // Act: Find a cell. Note: we look for the display value inside the div.
    const initialValueCell = await screen.findByText('yes');
    fireEvent.click(initialValueCell);

    // Assert: Check if the input appears
    const selectInput = await screen.findByRole('combobox');
    expect(selectInput).toBeInTheDocument();
    expect(selectInput).toHaveValue('yes');
  });

  it('should save data when an edited cell loses focus', async () => {
    // Arrange: Mock initial data and the update response
    const initialData = [
      {
        id: 'entry-1',
        date: new Date(),
        data: { exercised: 'no' },
        comments: '',
      },
    ];
    (fetch as jest.Mock).mockResolvedValueOnce({ // For initial load
      ok: true,
      json: async () => initialData,
    });
    (fetch as jest.Mock).mockResolvedValueOnce({ // For the PUT update
        ok: true,
        json: async () => ({ id: 'entry-1' }),
    });

    render(<WeeklySummaryPage />);

    const cellToEdit = await screen.findByText('no');
    fireEvent.click(cellToEdit);

    const selectInput = await screen.findByRole('combobox');

    // Act: Change the value and blur the input
    fireEvent.change(selectInput, { target: { value: 'yes' } });
    fireEvent.blur(selectInput);

    // Assert: Check that fetch was called to save the data
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/habits/entry-1'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            data: { exercised: 'yes' }, 
            comments: '' 
        }),
      });
    });

    // Assert that the input is gone and the new value is displayed
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(await screen.findByText('yes')).toBeInTheDocument();
  });

});
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '@/app/components/auth/login';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
    },
    journalEntry: {
      createMany: jest.fn(),
    },
    userGoal: {
      createMany: jest.fn(),
    },
    promptTemplate: {
      createMany: jest.fn(),
    },
  })),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Data synced successfully' }),
  })
) as jest.Mock;

const mockSignIn = signIn as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockPrisma = new PrismaClient();

describe('Login Component with Data Sync', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockSignIn.mockReset();
    mockPush = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should sync data on successful login', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    localStorage.setItem('journalEntries', JSON.stringify([{ id: '1', title: 'Test Entry', content: 'Test Content' }]));
    localStorage.setItem('userGoals', JSON.stringify([{ id: '1', title: 'Test Goal', description: 'Test Description' }]));
    localStorage.setItem('promptTemplates', JSON.stringify([{ id: '1', title: 'Test Template', text: 'Test Text' }]));

    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      journalEntries: [],
      userGoals: [],
      promptTemplates: [],
    });

    render(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                journalEntries: [{ id: '1', title: 'Test Entry', content: 'Test Content' }],
                userGoals: [{ id: '1', title: 'Test Goal', description: 'Test Description' }],
                promptTemplates: [{ id: '1', title: 'Test Template', text: 'Test Text' }],
            }),
        });
    });

    await waitFor(() => {
      expect(localStorage.getItem('journalEntries')).toBeNull();
      expect(localStorage.getItem('userGoals')).toBeNull();
      expect(localStorage.getItem('promptTemplates')).toBeNull();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should merge data on successful login', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null });

    // Simulate existing data in the database
    const existingJournalEntries = [{ id: '1', title: 'Existing Entry', content: 'Existing Content' }];
    const existingUserGoals = [{ id: '1', title: 'Existing Goal', description: 'Existing Description' }];
    const existingPromptTemplates = [{ id: '1', title: 'Existing Template', text: 'Existing Text' }];

    // Simulate new data in local storage
    const newJournalEntries = [{ id: '2', title: 'New Entry', content: 'New Content' }];
    const newUserGoals = [{ id: '2', title: 'New Goal', description: 'New Description' }];
    const newPromptTemplates = [{ id: '2', title: 'New Template', text: 'New Text' }];

    localStorage.setItem('journalEntries', JSON.stringify(newJournalEntries));
    localStorage.setItem('userGoals', JSON.stringify(newUserGoals));
    localStorage.setItem('promptTemplates', JSON.stringify(newPromptTemplates));

    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      journalEntries: existingJournalEntries,
      userGoals: existingUserGoals,
      promptTemplates: existingPromptTemplates,
    });

    render(<Login />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                journalEntries: newJournalEntries,
                userGoals: newUserGoals,
                promptTemplates: newPromptTemplates,
            }),
        });
    });

    await waitFor(() => {
      expect(localStorage.getItem('journalEntries')).toBeNull();
      expect(localStorage.getItem('userGoals')).toBeNull();
      expect(localStorage.getItem('promptTemplates')).toBeNull();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});

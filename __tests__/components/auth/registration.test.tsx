import { render, screen, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import AuthForm from '@/app/auth/components/AuthForm';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('AuthForm Component - Registration Functionality', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should switch to register mode and submit registration data', async () => {
    render(<AuthForm />);
    const user = userEvent.setup();

    // Switch to register mode
    const registerButton = screen.getByRole('button', { name: /register/i });
    await user.click(registerButton);

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();

    // Fill out the registration form
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');

    // Submit the form
    const createAccountButton = screen.getByRole('button', { name: /register/i });
    await user.click(createAccountButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        }),
      });
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });
});
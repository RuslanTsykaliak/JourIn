import { render, screen, waitFor } from '../../test-utils'; // Use custom render
import userEvent from '@testing-library/user-event';
import AuthForm from '@/app/auth/components/AuthForm';
import { signIn } from 'next-auth/react';

// Mock parts of next-auth/react
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'), // Import and retain default behavior
  signIn: jest.fn(), // Mock signIn specifically
}));
import { useRouter } from 'next/navigation';

// Mock next-auth/react


// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockSignIn = signIn as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('AuthForm Component - Login Functionality', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockSignIn.mockReset();
    mockPush = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    // No timer cleanup needed if not using fake timers
  });

  it('renders the login form', () => {
    render(<AuthForm />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument(); // Ensure name field is not present in login mode
  });

  it('calls signIn with credentials on form submission', async () => {
    mockSignIn.mockImplementation(() =>
      Promise.resolve({ ok: true, error: null })
    );

    render(<AuthForm />);
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
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error message on failed login', async () => {
    mockSignIn.mockImplementation(() =>
      Promise.resolve({ ok: false, error: 'Invalid credentials' })
    );

    render(<AuthForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(async () => {
      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });
    screen.debug();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clears error message on new input', async () => {
    mockSignIn
      .mockImplementationOnce(() => Promise.resolve({ ok: false, error: 'Invalid credentials' }))
      .mockImplementationOnce(() => Promise.resolve({ ok: true, error: null }));

    render(<AuthForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(async () => {
      expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    });
    screen.debug();

    // New input should clear the error
    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), 'newinput@example.com');

    // Simulate a new form submission to clear the error
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });
});
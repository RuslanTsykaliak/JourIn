
import { POST } from '@/app/api/register/route';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

jest.mock('@/app/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      ...options,
      json: () => Promise.resolve(data),
    })),
  },
}));

// Cast mocked functions for better type safety
const mockFindUnique = prisma.user.findUnique as jest.Mock;
const mockCreate = prisma.user.create as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;
const mockNextResponseJson = NextResponse.json as jest.Mock;

describe('POST /api/register', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFindUnique.mockReset();
    mockCreate.mockReset();
    mockHash.mockReset();
    mockNextResponseJson.mockReset();
  });

  it('should register a new user successfully', async () => {
    // Mock prisma.user.findUnique to return null (user does not exist)
    mockFindUnique.mockResolvedValue(null);
    // Mock prisma.user.create to return the newly created user
    const newUser = { id: '123', name: 'Test User', email: 'test@example.com', password: 'hashed_password' };
    mockCreate.mockResolvedValue(newUser);
    // Mock bcrypt.hash to return a hashed password
    mockHash.mockResolvedValue('hashed_password');

    const req = {
      json: () => Promise.resolve({ name: 'Test User', email: 'test@example.com', password: 'password123' }),
    } as any;

    await POST(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(mockHash).toHaveBeenCalledWith('password123', 10);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        username: 'test',
      },
    });
    expect(mockNextResponseJson).toHaveBeenCalledWith(newUser);
  });

  it('should return 400 if user already exists', async () => {
    // Mock prisma.user.findUnique to return an existing user
    mockFindUnique.mockResolvedValue({ id: '123', email: 'existing@example.com' });

    const req = {
      json: () => Promise.resolve({ name: 'Test User', email: 'existing@example.com', password: 'password123' }),
    } as any;

    await POST(req);

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { email: 'existing@example.com' } });
    expect(mockCreate).not.toHaveBeenCalled(); // Should not try to create a user
    expect(mockHash).not.toHaveBeenCalled(); // Should not hash password
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { message: 'Email already exists' },
      { status: 400 }
    );
  });

  it('should return 400 if email is missing', async () => {
    const req = {
      json: () => Promise.resolve({ name: 'Test User', password: 'password123' }),
    } as any;

    await POST(req);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { message: 'Missing fields' },
      { status: 400 }
    );
  });

  it('should return 400 if password is missing', async () => {
    const req = {
      json: () => Promise.resolve({ name: 'Test User', email: 'test@example.com' }),
    } as any;

    await POST(req);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { message: 'Missing fields' },
      { status: 400 }
    );
  });

    it('should return 400 if name is missing', async () => {
    const req = {
      json: () => Promise.resolve({ email: 'test@example.com', password: 'password123' }),
    } as any;

    await POST(req);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { message: 'Missing fields' },
      { status: 400 }
    );
  });

  it('should return 500 on internal server error', async () => {
    // Mock findUnique to throw an error to simulate a database error
    mockFindUnique.mockRejectedValue(new Error('Database connection error'));

    const req = {
      json: () => Promise.resolve({ name: 'Test User', email: 'test@example.com', password: 'password123' }),
    } as any;

    await POST(req);

    expect(mockFindUnique).toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  });
});

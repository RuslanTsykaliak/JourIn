import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={{
      expires: '1',
      user: { email: 'test@example.com', id: 'test-user-id', name: 'Test User' }
    }}>
      {children}
    </SessionProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
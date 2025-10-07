import { render, screen } from '@testing-library/react';
import Provider from '@/app/auth/components/provider';

describe('Provider Component', () => {
  it('should render children', () => {
    render(
      <Provider>
        <div>Child Component</div>
      </Provider>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
});
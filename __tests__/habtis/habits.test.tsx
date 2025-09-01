import React from 'react';
import { render, screen } from '@testing-library/react';
import HabitsPage from '@/app/habits/page';

describe('Habits Page', () => {
  beforeEach(() => {
    render(<HabitsPage />);
  });

  it('should render the main heading', () => {
    expect(screen.getByRole('heading', { name: /supper habits/i })).toBeInTheDocument();
  });

  it('should render general notes and tracking questions', () => {
    expect(screen.getByLabelText(/my notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ai's notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Did I track my behavior on this sheet today?/i)).toBeInTheDocument();
    expect(screen.getByText(/Did I watch a video for the 21 Day Challenge today?/i)).toBeInTheDocument();
  });

  it('should render the Energy section with all its questions', () => {
    expect(screen.getByRole('heading', { name: /Energy ⚡️/i })).toBeInTheDocument();
    expect(screen.getByText(/Did I exercise today?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Habit Stack: What is my exercise plan for tomorrow?/i)).toBeInTheDocument();
    expect(screen.getByText(/How healthy was my diet today?/i)).toBeInTheDocument();
    expect(screen.getByText(/1 - Unacceptable. Very poor choices and feel sick/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/How many hours of sleep did I get last night?/i)).toBeInTheDocument();
    expect(screen.getByText(/Am I on track to get to sleep on time tonight?/i)).toBeInTheDocument();
    expect(screen.getByText(/How energized did I feel today?/i)).toBeInTheDocument();
    expect(screen.getByText(/5 - On fire!! 🔥/i)).toBeInTheDocument();
  });

  it('should render the Productivity section with all its questions', () => {
    expect(screen.getByRole('heading', { name: /Productivity ⏰/i })).toBeInTheDocument();
    expect(screen.getByText(/How was my social media usage today?/i)).toBeInTheDocument();
    expect(screen.getByText(/5 - Great. Fully intentional usage of social media/i)).toBeInTheDocument();
    expect(screen.getByText(/How productive was I today?/i)).toBeInTheDocument();
    expect(screen.getByText(/5 - Great. Crushed the day and feeling proud/i)).toBeInTheDocument();
    expect(screen.getByText(/Did I complete my #1 Work Task today?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/What is my #1 Work Task for tomorrow?/i)).toBeInTheDocument();
    expect(screen.getByText(/Habit Stack: Did I create a detailed, 30x30 minute Timeboxed Schedule for tomorrow?/i)).toBeInTheDocument();
  });

  it('should render the Mindset section with all its questions', () => {
    expect(screen.getByRole('heading', { name: /Mindset 🧠/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Reflection: What's one reason to be grateful for your health and body?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reflection: Who is one person that you're grateful for today and why?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reflection: What's one reason to be grateful for your circumstances?/i)).toBeInTheDocument();
    expect(screen.getByText(/How was my attitude today?/i)).toBeInTheDocument();
    expect(screen.getByText(/5 - Every moment full of resilience and enthusiasm/i)).toBeInTheDocument();
    expect(screen.getByText(/Habit Stack: Did I complete today's Discipline On Demand?/i)).toBeInTheDocument();
  });
});

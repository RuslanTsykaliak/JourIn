'use client';

import React, { useState, useEffect } from 'react';
import { HabitData } from '../../types'; // Assuming HabitData interface is in app/types.ts

const WeeklySummaryPage = () => {
  const [weeklyData, setWeeklyData] = useState<Record<string, Partial<HabitData>[]>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  const getDatesForWeek = (startOfWeek: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }
    return dates;
  };

  const loadWeeklyData = (startOfWeek: Date) => {
    const dates = getDatesForWeek(startOfWeek);
    const loadedData: Record<string, Partial<HabitData>[]> = {};

    dates.forEach(date => {
      const savedData = localStorage.getItem(`habit-data-${date}`);
      if (savedData) {
        loadedData[date] = [JSON.parse(savedData)]; // Store as array for consistency, though it's one entry per day
      } else {
        loadedData[date] = [{}]; // Empty object for days with no data
      }
    });
    setWeeklyData(loadedData);
  };

  useEffect(() => {
    // Set currentWeekStart to the most recent Monday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(monday);
    loadWeeklyData(monday);
  }, []);

  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
    loadWeeklyData(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
    loadWeeklyData(nextWeek);
  };

  const getHabitValue = (habitName: keyof HabitData, date: string) => {
    const dayData = weeklyData[date]?.[0];
    return dayData ? dayData[habitName] : '';
  };

  const calculateAverage = (habitName: keyof HabitData) => {
    let sum = 0;
    let count = 0;
    Object.values(weeklyData).forEach(dayDataArray => {
      const dayData = dayDataArray[0];
      if (dayData && typeof dayData[habitName] === 'string' && !isNaN(parseFloat(dayData[habitName] as string))) {
        sum += parseFloat(dayData[habitName] as string);
        count++;
      } else if (dayData && (dayData[habitName] === 'yes' || dayData[habitName] === 'no')) {
        sum += dayData[habitName] === 'yes' ? 1 : 0;
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : 'N/A';
  };

  const calculateSum = (habitName: keyof HabitData) => {
    let sum = 0;
    Object.values(weeklyData).forEach(dayDataArray => {
      const dayData = dayDataArray[0];
      if (dayData && typeof dayData[habitName] === 'string' && !isNaN(parseFloat(dayData[habitName] as string))) {
        sum += parseFloat(dayData[habitName] as string);
      } else if (dayData && (dayData[habitName] === 'yes' || dayData[habitName] === 'no')) {
        sum += dayData[habitName] === 'yes' ? 1 : 0;
      }
    });
    return sum;
  };

  const habitQuestions: { key: keyof HabitData; label: string; type: 'text' | 'yesNo' | 'number' | 'scale' }[] = [
    { key: 'my-notes', label: 'My Notes', type: 'text' },
    {
      key: 'ai-notes', label: 'AI\'s Notes 👊', type: 'text' },
    { key: 'tracked-behavior', label: 'Did I track my behavior on this sheet today?', type: 'yesNo' },
    { key: 'watched-video', label: 'Did I watch a video for the 21 Day Challenge today?', type: 'yesNo' },
    { key: 'exercised', label: 'Did I exercise today?', type: 'yesNo' },
    { key: 'exercise-plan', label: 'Habit Stack: What is my exercise plan for tomorrow?', type: 'text' },
    { key: 'diet-health', label: 'How healthy was my diet today?', type: 'scale' },
    { key: 'sleep-hours', label: 'How many hours of sleep did I get last night?', type: 'number' },
    { key: 'sleep-on-time', label: 'Am I on track to get to sleep on time tonight?', type: 'yesNo' },
    { key: 'energy-level', label: 'How energized did I feel today?', type: 'scale' },
    { key: 'social-media-usage', label: 'How was my social media usage today?', type: 'scale' },
    { key: 'productivity-level', label: 'How productive was I today?', type: 'scale' },
    { key: 'completed-work-task', label: 'Did I complete my #1 Work Task today?', type: 'yesNo' },
    { key: 'work-task-tomorrow', label: 'What is my #1 Work Task for tomorrow?', type: 'text' },
    { key: 'timeboxed-schedule', label: 'Habit Stack: Did I create a detailed, 30x30 minute Timeboxed Schedule for tomorrow?', type: 'yesNo' },
    {
      key: 'grateful-health', label: 'Reflection: What\'s one reason to be grateful for your health and body?', type: 'text' },
    {
        key: 'grateful-person', label: 'Reflection: Who is one person that you\'re grateful for today and why?', type: 'text' },
    {
          key: 'grateful-circumstances', label: 'Reflection: What\'s one reason to be grateful for your circumstances?', type: 'text' },
    { key: 'attitude', label: 'How was my attitude today?', type: 'scale' },
    { key: 'discipline-on-demand', label: 'Habit Stack: Did I complete today\'s Discipline On Demand?', type: 'yesNo' },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Weekly Habits Summary</h1>
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousWeek} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white">Previous Week</button>
        <span className="text-lg font-semibold dark:text-white">
          Week of {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <button onClick={goToNextWeek} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white">Next Week</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Habit</th>
              {daysOfWeek.map(day => (
                <th key={day} className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{day}</th>
              ))}
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Target</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Points</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">% of Goal</th>
            </tr>
          </thead>
          <tbody>
            {habitQuestions.map(habit => (
              <tr key={habit.key} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 font-medium">{habit.label}</td>
                {getDatesForWeek(currentWeekStart).map(date => (
                  <td key={date} className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                    {getHabitValue(habit.key, date)}
                  </td>
                ))}
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">N/A</td> {/* Placeholder for Target */}
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                  {habit.type === 'number' || habit.type === 'scale' ? calculateAverage(habit.key) : calculateSum(habit.key)}
                </td>
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">N/A</td> {/* Placeholder for % of Goal */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default WeeklySummaryPage;

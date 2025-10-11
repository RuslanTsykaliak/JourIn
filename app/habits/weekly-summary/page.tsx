'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { HabitData } from '../../types';

// Define a type for a single day's entry, including its database ID
interface DayEntry {
  id?: string;
  data: Partial<HabitData>;
  comments?: string;
}

type EditableCellValue = string | number | undefined;

const EditableCell = ({ value, onChange, onBlur, type }: {
  value: EditableCellValue;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  type: 'text' | 'yesNo' | 'number' | 'scale';
}) => {
  const commonClasses = "w-full h-full p-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded";
  if (type === 'yesNo') {
    return (
      <select value={value || ''} onChange={onChange} onBlur={onBlur} autoFocus className={commonClasses}>
        <option value="">-</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    );
  }
  if (type === 'number' || type === 'scale') {
    return <input type="number" value={value || ''} onChange={onChange} onBlur={onBlur} autoFocus className={`${commonClasses} w-20`} />;
  }
  return <textarea value={value || ''} onChange={onChange} onBlur={onBlur} autoFocus className={`${commonClasses} h-20`} rows={3} />;
};

const WeeklySummaryPage = () => {
  const { data: session } = useSession();

  const [weeklyData, setWeeklyData] = useState<Record<string, DayEntry>>({});
  const [activeCell, setActiveCell] = useState<{ date: string; habit: keyof HabitData | 'comments' } | null>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const getDatesForWeek = useCallback((startOfWeek: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const loadDataForWeek = useCallback(async (startOfWeek: Date) => {
    const dates = getDatesForWeek(startOfWeek);
    let loadedData: Record<string, DayEntry> = {};

    if (session) {
      try {
        const response = await fetch(`/api/habits/weekly?weekStart=${startOfWeek.toISOString()}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const dbData = await response.json();

        const mappedData: Record<string, DayEntry> = {};
        for (const entry of dbData) {
          const dateString = new Date(entry.date).toISOString().split('T')[0];
          mappedData[dateString] = {
            id: entry.id,
            data: entry.data,
            comments: entry.comments
          };
        }
        loadedData = mappedData;

      } catch (error) {
        console.error("Couldn't fetch data for auth user:", error);
      }
    } else {
      dates.forEach(date => {
        const savedData = localStorage.getItem(`habit-data-${date}`);
        if (savedData) {
          loadedData[date] = { data: JSON.parse(savedData) };
        }
      });
    }

    const completeData: Record<string, DayEntry> = {};
    dates.forEach(date => {
      completeData[date] = loadedData[date] || { data: {} };
    });

    setWeeklyData(completeData);

  }, [session, getDatesForWeek]);

  useEffect(() => {
    loadDataForWeek(currentWeekStart);
  }, [currentWeekStart, loadDataForWeek, session]);

  const handleCellChange = (date: string, habitKey: keyof HabitData, value: string | number) => {
    setWeeklyData(prev => {
      const newDateEntry = { ...(prev[date] || { data: {} }) };
      newDateEntry.data = { ...newDateEntry.data, [habitKey]: value };
      return { ...prev, [date]: newDateEntry };
    });
  };

  const handleCommentChange = (date: string, value: string) => {
    setWeeklyData(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || { data: {} }),
        comments: value
      }
    }));
  };

  const handleCellBlur = async (date: string) => {
    setActiveCell(null);
    const entry = weeklyData[date];
    if (!entry || (Object.keys(entry.data).length === 0 && !entry.comments)) return;

    if (session) {
      if (entry.id) {
        await fetch(`/api/habits/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: entry.data, comments: entry.comments })
        });
      } else {
        const response = await fetch(`/api/habits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...entry.data, comments: entry.comments, date: new Date(date) })
        });
        const newEntry = await response.json();
        setWeeklyData(prev => ({ ...prev, [date]: { ...prev[date], id: newEntry.id } }));
      }
    } else {
      localStorage.setItem(`habit-data-${date}`, JSON.stringify(entry.data));
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const getHabitValue = (habitName: keyof HabitData, date: string): EditableCellValue => {
    const dayData = weeklyData[date]?.data;
    return dayData ? dayData[habitName] : undefined;
  };

  const getCommentValue = (date: string): string => {
    return weeklyData[date]?.comments || '';
  }

  const calculateAverage = (habitName: keyof HabitData) => {
    let sum = 0;
    let count = 0;
    Object.values(weeklyData).forEach(dayEntry => {
      const dayData = dayEntry.data;
      const value = dayData ? dayData[habitName] : undefined;
      if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        sum += parseFloat(value);
        count++;
      } else if (typeof value === 'number') {
        sum += value;
        count++;
      } else if (value === 'yes') {
        sum += 1;
        count++;
      } else if (value === 'no') {
        count++; // contributes to the denominator but adds 0 to sum
      }
    });
    return count > 0 ? (sum / count).toFixed(2) : 'N/A';
  };

  const calculateSum = (habitName: keyof HabitData) => {
    let sum = 0;
    Object.values(weeklyData).forEach(dayEntry => {
      const dayData = dayEntry.data;
      const value = dayData ? dayData[habitName] : undefined;
      if (typeof value === 'string' && !isNaN(parseFloat(value))) {
        sum += parseFloat(value);
      } else if (typeof value === 'number') {
        sum += value;
      } else if (value === 'yes') {
        sum += 1;
      }
    });
    return sum;
  };

  const habitQuestions: { key: keyof HabitData; label: string; type: 'text' | 'yesNo' | 'number' | 'scale' }[] = [
    { key: 'my-notes', label: 'My Notes', type: 'text' },
    { key: 'ai-notes', label: 'AI\'s Notes 👊', type: 'text' },
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
    { key: 'grateful-health', label: 'Reflection: What\'s one reason to be grateful for your health and body?', type: 'text' },
    { key: 'grateful-person', label: 'Reflection: Who is one person that you\'re grateful for today and why?', type: 'text' },
    { key: 'grateful-circumstances', label: 'Reflection: What\'s one reason to be grateful for your circumstances?', type: 'text' },
    { key: 'attitude', label: 'How was my attitude today?', type: 'scale' },
    { key: 'discipline-on-demand', label: 'Habit Stack: Did I complete today\'s Discipline On Demand?', type: 'yesNo' },
  ];

  const daysOfWeek = getDatesForWeek(currentWeekStart);

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Weekly Habits Summary</h1>
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousWeek} className="px-4 py-2 rounded-md bg-ray-200 dark:bg-gray-700 dark:text-white">Previous week</button>
        <span className="text-lg font-semibold dark:text-white">
          Week of {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <button onClick={goToNextWeek} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white">Next week</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Habit</th>
              {daysOfWeek.map(day => (
                <th key={day} className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                  {new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Target</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">Points</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">% of goal</th>
            </tr>
          </thead>
          <tbody>
            {habitQuestions.map(habit => (
              <tr key={habit.key}>
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 font-medium border border-gray-300 dark:border-gray-600">{habit.label}</td>
                {daysOfWeek.map(date => (
                  <td key={date} onClick={() => setActiveCell({ date, habit: habit.key })} className="py-0 px-0 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 relative">
                    {activeCell?.date === date && activeCell?.habit === habit.key ? (
                      <EditableCell
                        value={getHabitValue(habit.key, date)}
                        onChange={(e) => handleCellChange(date, habit.key, e.target.value)}
                        onBlur={() => handleCellBlur(date)}
                        type={habit.type}
                      />
                    ) : (
                      <div className="w-full h-full p-2">{String(getHabitValue(habit.key, date) || '-')}
                      </div>
                    )}
                  </td>
                ))}
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">N/A</td>
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                  {habit.type === 'number' || habit.type === 'scale' ? calculateAverage(habit.key) : calculateSum(habit.key)}
                </td>
                <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">N/A</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 font-medium border border-gray-300 dark:border-gray-600">Comments</td>
              {daysOfWeek.map(date => (
                <td key={date} onClick={() => setActiveCell({ date, habit: 'comments' })} className="py-0 px-0 text-sm text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 relative">
                  {activeCell?.date === date && activeCell?.habit === 'comments' ? (
                    <EditableCell
                      value={getCommentValue(date)}
                      onChange={(e) => handleCommentChange(date, e.target.value)}
                      onBlur={() => handleCellBlur(date)}
                      type="text"
                    />
                  ) : (
                    <div className="w-full h-full p-2">{getCommentValue(date) || '-'}
                    </div>
                  )}
                </td>
              ))}
              <td colSpan={3} className="border border-gray-300 dark:border-gray-600"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default WeeklySummaryPage;

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { debounce } from '@/app/utils/debounce';
import { HabitData } from '../types';



// Helper component for 1-5 scale questions
const ScaleQuestion = ({ question, name, descriptions, value, onChange }: { question: string, name: string, descriptions: string[], value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div>
    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{question}</p>
    <div className="flex flex-col gap-2 mt-1">
      {descriptions.map((desc, index) => (
        <label key={index} className="flex items-center gap-2">
          <input type="radio" name={name} value={index + 1} checked={value === (index + 1).toString()} onChange={onChange} />
          <span>{desc}</span>
        </label>
      ))}
    </div>
  </div>
);

const YesNoQuestion = ({ question, name, value, onChange }: { question: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div>
    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{question}</p>
    <div className="flex gap-4 mt-1">
      <label><input type="radio" name={name} value="yes" checked={value === 'yes'} onChange={onChange} /> Yes</label>
      <label><input type="radio" name={name} value="no" checked={value === 'no'} onChange={onChange} /> No</label>
    </div>
  </div>
);

const HabitsPage = () => {
  const [habitData, setHabitData] = useState<Partial<HabitData>>({});

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // Load data on initial render
  useEffect(() => {
    const today = getTodayDateString();
    const savedData = localStorage.getItem(`habit-data-${today}`);
    if (savedData) {
      setHabitData(JSON.parse(savedData));
    }
  }, []);

  // Debounced save function
  const debouncedSaveRef = useRef(
    debounce((data: Partial<HabitData>) => {
      const today = getTodayDateString();
      localStorage.setItem(`habit-data-${today}`, JSON.stringify(data));
    }, 500) // 500ms delay
  );

  // Autosave on data change
  useEffect(() => {
    if (Object.keys(habitData).length > 0) {
      debouncedSaveRef.current(habitData);
    }
  }, [habitData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHabitData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const dietDescriptions = [
    '1 - Unacceptable. Very poor choices and feel sick',
    '2 - Disappointing. Unhealthy throughout the day',
    '3 - Okay. Snack, meal, or dessert wasn&apos;t great or horrible',
    '4 - Good. Consciously chose the healthy option all day',
    '5 - Great. Eating only pure and quality foods'
  ];

  const energyDescriptions = [
    '1 - Lethargic and sick',
    '2 - Dragging and slow',
    '3 - Solid and steady',
    '4 - Peppy and bright',
    '5 - On fire!! 🔥'
  ];

  const socialMediaDescriptions = [
    '1 - Unacceptable. Completely wasted the day',
    '2 - Disappointing. Lost a lot of time unnecessarily',
    '3 - Okay. Had a few lapses and could be better',
    '4 - Good. A reasonable amount for the right purposes',
    '5 - Great. Fully intentional usage of social media'
  ];

  const productivityDescriptions = [
    '1 - Unacceptable. Lazy and wasteful',
    '2 - Disappointing. Distracted and unmotivated',
    '3 - Okay. Relatively on task, a few lapses',
    '4 - Good. Got into a rhythm with good focus',
    '5 - Great. Crushed the day and feeling proud'
  ];

  const attitudeDescriptions = [
    '1 - Very unhappy and hard to be around',
    '2 - Mostly pessimistic and frustrated',
    '3 - Pretty positive and constructive, but with a few lapses',
    '4 - Really good with lots of optimism',
    '5 - Every moment full of resilience and enthusiasm'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
      });

      if (response.ok) {
        console.log('Data submitted successfully');
        // Optionally, clear the form or show a success message
      } else {
        console.error('Failed to submit data');
      }
    } catch (error) {
      console.error('An error occurred while submitting the data', error);
    }
  };

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Super Habits</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8">

          {/* General Section */}
          <section className="p-4 border rounded-lg">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="my-notes" className="block text-sm font-bold text-gray-700 dark:text-gray-300">My notes</label>
                <textarea id="my-notes" name="my-notes" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={habitData['my-notes'] || ''} onChange={handleChange}></textarea>
              </div>
              <div>
                <label htmlFor="ai-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">AI's Notes</label>
                <textarea id="ai-notes" name="ai-notes" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" readOnly value={habitData['ai-notes'] || ''}></textarea>
              </div>
              <YesNoQuestion question="Did I track my behavior on this sheet today" name="tracked-behavior" value={habitData['tracked-behavior'] || ''} onChange={handleChange} />
              <YesNoQuestion question="Did I watch a video for the 21-Day Challenge today" name="watched-video" value={habitData['watched-video'] || ''} onChange={handleChange} />
            </div>
          </section>

          {/* Energy Section */}
          <section className="p-4 border rounded-lg">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Energy ⚡️</h2>
            <div className="grid grid-cols-1 gap-4">
              <YesNoQuestion question="Did I exercise today" name="exercised" value={habitData.exercised || ''} onChange={handleChange} />
              <div>
                <label htmlFor="exercise-plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Habit Stack: What is my exercise plan for tomorrow? (What, where, and when)</label>
                <input type="text" id="exercise-plan" name="exercise-plan" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={habitData['exercise-plan'] || ''} onChange={handleChange} />
              </div>
              <ScaleQuestion question="How healthy was my diet today" name="diet-health" descriptions={dietDescriptions} value={habitData['diet-health'] || ''} onChange={handleChange} />
              <div>
                <label htmlFor="sleep-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">How many hours of sleep did I get last night</label>
                <input type="number" id="sleep-hours" name="sleep-hours" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={habitData['sleep-hours'] || ''} onChange={handleChange} />
              </div>
              <YesNoQuestion question="Am I on track to get to sleep on time tonight" name="sleep-on-time" value={habitData['sleep-on-time'] || ''} onChange={handleChange} />
              <ScaleQuestion question="How energized did I feel today" name="energy-level" descriptions={energyDescriptions} value={habitData['energy-level'] || ''} onChange={handleChange} />
            </div>
          </section>

          {/* Productivity Section */}
          <section className="p-4 border rounded-lg">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Productivity ⏰</h2>
            <div className="grid grid-cols-1 gap-4">
              <ScaleQuestion question="How was my social media usage today" name="social-media-usage" descriptions={socialMediaDescriptions} value={habitData['social-media-usage'] || ''} onChange={handleChange} />
              <ScaleQuestion question="How productive was I today" name="productivity-level" descriptions={productivityDescriptions} value={habitData['productivity-level'] || ''} onChange={handleChange} />
              <YesNoQuestion question="Did I complete my #1 work task today" name="completed-work-task" value={habitData['completed-work-task'] || ''} onChange={handleChange} />
              <div>
                <label htmlFor="work-task-tomorrow" className="block text-sm font-medium text-gray-700 dark:text-gray-300">What is my #1 work task for tomorrow</label>
                <input type="text" id="work-task-tomorrow" name="work-task-tomorrow" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={habitData['work-task-tomorrow'] || ''} onChange={handleChange} />
              </div>
              <YesNoQuestion question="Habit Stack: Did I create a detailed, 30x30 minute timeboxed schedule for tomorrow" name="timeboxed-schedule" value={habitData['timeboxed-schedule'] || ''} onChange={handleChange} />
            </div>
          </section>

          {/* Mindset Section */}
          <section className="p-4 border rounded-lg">
            <h2 className="text-2xl font-bold mb-2 dark:text-white">Mindset 🧠</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="grateful-health" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Reflection: What's one reason to be grateful for your health and body</label>
                <textarea id="grateful-health" name="grateful-health" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={habitData['grateful-health'] || ''} onChange={handleChange}></textarea>
              </div>
              <div>
                <label htmlFor="grateful-person" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Reflection: Who is one person that you're grateful for today and why</label>
                <textarea id="grateful-person" name="grateful-person" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={habitData['grateful-person'] || ''} onChange={handleChange}></textarea>
              </div>
              <div>
                <label htmlFor="grateful-circumstances" className="block text-sm font-bold text-gray-700 dark:text-gray-300">Reflection: What's one reason to be grateful for your circumstances</label>
                <textarea id="grateful-circumstances" name="grateful-circumstances" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" value={habitData['grateful-circumstances'] || ''} onChange={handleChange}></textarea>
              </div>
              <ScaleQuestion question="How was my attitude today" name="attitude" descriptions={attitudeDescriptions} value={habitData.attitude || ''} onChange={handleChange} />
              <YesNoQuestion question="Habit Stack: Did I complete today's Discipline On Demand" name="discipline-on-demand" value={habitData['discipline-on-demand'] || ''} onChange={handleChange} />
            </div>
          </section>

        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Submit</button>
      </form>
    </main>
  );
};

export default HabitsPage;
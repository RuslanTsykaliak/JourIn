'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TimeJournalingSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeJournalingSection({ value, onChange }: TimeJournalingSectionProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default to show default times
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Set default time range to past hour on mount and when sidebar opens
  useEffect(() => {
    if (isSidebarOpen && (!startTime || !endTime)) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Calculate start time (past hour, rounded to nearest 15 minutes)
      const startHour = currentHour === 0 ? 23 : currentHour - 1;
      const startMinute = Math.floor(currentMinute / 15) * 15;
      
      // Calculate end time (current hour, rounded to nearest 15 minutes)
      const endMinute = Math.floor(currentMinute / 15) * 15;
      
      const formatTime = (hour: number, minute: number) => {
        const period = hour >= 12 ? ' pm' : ' am';
        const displayHour = hour % 12 || 12;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute}${period}`;
      };
      
      const defaultStartTime = formatTime(startHour, startMinute);
      const defaultEndTime = formatTime(currentHour, endMinute);
      
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
    }
  }, [isSidebarOpen, startTime, endTime]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Check if the click is not on the sidebar trigger area
        const triggerArea = document.querySelector('[data-sidebar-trigger="true"]');
        if (triggerArea && !triggerArea.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Generate time options in 15-minute intervals (12-hour format with AM/PM)
  const generateTimeOptions = () => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const period = hour >= 12 ? ' pm' : ' am';
        const displayHour = hour % 12 || 12;
        const displayMinute = minute.toString().padStart(2, '0');
        options.push(`${displayHour}:${displayMinute}${period}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const formatTimeTitle = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toLowerCase();
    
    if (period === 'pm' && hours !== 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  const insertTimeBlock = () => {
    if (!startTime || !endTime) {
      return;
    }

    const timeTitle = formatTimeTitle(startTime, endTime);
    const newContent = value.trim();
    
    let updatedContent: string;
    if (newContent === '') {
      // First time block - insert at the beginning
      updatedContent = `${timeTitle}\n`;
    } else {
      // Subsequent time blocks - append at the bottom with one empty line separator
      updatedContent = `${newContent}\n\n${timeTitle}\n`;
    }

    onChange(updatedContent);

    // Position cursor at the end of the textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(updatedContent.length, updatedContent.length);
      }
    }, 0);

    // Reset time selection and close sidebar
    setStartTime('');
    setEndTime('');
    setIsSidebarOpen(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Close sidebar when user starts typing
    setIsSidebarOpen(false);
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    
    // Auto-adjust end time only if start time >= end time
    if (endTime) {
      const startMinutes = parseTimeToMinutes(newStartTime);
      const endMinutes = parseTimeToMinutes(endTime);
      
      if (startMinutes >= endMinutes) {
        // Adjust end time to be 15 minutes after start time
        const nextEndMinutes = startMinutes + 15;
        const nextEndHour = Math.floor(nextEndMinutes / 60) % 24;
        const nextEndMinute = nextEndMinutes % 60;
        
        const formatTime = (hour: number, minute: number) => {
          const period = hour >= 12 ? ' pm' : ' am';
          const displayHour = hour % 12 || 12;
          const displayMinute = minute.toString().padStart(2, '0');
          return `${displayHour}:${displayMinute}${period}`;
        };
        
        setEndTime(formatTime(nextEndHour, nextEndMinute));
      }
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    
    // Auto-adjust end time if it's before or equal to start time
    if (startTime) {
      const startMinutes = parseTimeToMinutes(startTime);
      const endMinutes = parseTimeToMinutes(newEndTime);
      
      if (endMinutes <= startMinutes) {
        // Find the next available time slot (1 hour later)
        const nextEndMinutes = startMinutes + 60;
        const nextEndHour = Math.floor(nextEndMinutes / 60) % 24;
        const nextEndMinute = nextEndMinutes % 60;
        
        const formatTime = (hour: number, minute: number) => {
          const period = hour >= 12 ? ' pm' : ' am';
          const displayHour = hour % 12 || 12;
          const displayMinute = minute.toString().padStart(2, '0');
          return `${displayHour}:${displayMinute}${period}`;
        };
        
        setEndTime(formatTime(nextEndHour, nextEndMinute));
      }
    }
  };

  const handleMouseEnterSidebar = () => {
    setIsSidebarOpen(true);
  };


  return (
    <div className="relative mb-8 mt-4">
      {/* Visual indicator for sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-50 rounded-l-md"></div>
      
      {/* Sidebar trigger area */}
      <div
        className="absolute left-0 top-0 bottom-0 w-8 z-10"
        onMouseEnter={handleMouseEnterSidebar}
        data-sidebar-trigger="true"
      ></div>

      {/* Hidden sidebar */}
      <div
        ref={sidebarRef}
        className={`absolute left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 rounded-l-lg shadow-xl z-20 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseEnter={handleMouseEnterSidebar}
      >
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Select Time Range</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start</label>
              <select
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Start time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">End</label>
              <select
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">End time</option>
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={insertTimeBlock}
              disabled={!startTime || !endTime}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              Insert Time Block
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Hover over the left edge to access this menu
            </p>
          </div>
        </div>
      </div>

      {/* Main content area with left padding for sidebar */}
      <div className="ml-2">
        <label className="block text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-300 text-center mb-2">
          Time Journaling
        </label>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          rows={8}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl border border-gray-600 rounded-md p-4 xs:p-5 sm:p-6 bg-gray-700 text-gray-100"
          placeholder="Select a time range from the left sidebar to start journaling your day chronologically..."
        />
      </div>
    </div>
  );
}

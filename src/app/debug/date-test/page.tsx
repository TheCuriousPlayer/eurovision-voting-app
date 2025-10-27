'use client';

import { useState, useEffect } from 'react';
import { VOTE_DATES } from '@/config/eurovisionvariables';

export default function DateTestPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [targetDateString, setTargetDateString] = useState<string>(VOTE_DATES['2022'] || '00:00 01.01.2026');
  const [isBeforeTarget, setIsBeforeTarget] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse the Eurovision date format (HH:MM DD.MM.YYYY)
  const parseEurovisionDateString = (dateString: string): Date | null => {
    if (!dateString || dateString.trim() === '') {
      setError('Empty date string');
      return null;
    }
    
    try {
      // "HH:MM DD.MM.YYYY" formatını ayırıştır
      const [timeStr, dateStr] = dateString.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      const [day, month, year] = dateStr.split('.').map(Number);
      
      // JavaScript'te aylar 0-11 arasında (0=Ocak, 11=Aralık)
      const parsedDate = new Date(year, month - 1, day, hours, minutes);
      setError(null);
      return parsedDate;
    } catch (error) {
      setError(`Error parsing date: ${error}`);
      return null;
    }
  };

  // Update comparison on load and every second
  useEffect(() => {
    // Compare dates when input changes
    const updateComparison = () => {
      const now = new Date();
      setCurrentDate(now);
      
      const parsed = parseEurovisionDateString(targetDateString);
      if (parsed) {
        setTargetDate(parsed);
        setIsBeforeTarget(now.getTime() < parsed.getTime());
      } else {
        setTargetDate(null);
        setIsBeforeTarget(null);
      }
    };
    
    updateComparison();
    const timer = setInterval(updateComparison, 1000);
    return () => clearInterval(timer);
  }, [targetDateString]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Date Test Page</h1>
      
      <div className="mb-6">
        <label className="block mb-2">Target Date String (format: HH:MM DD.MM.YYYY):</label>
        <input
          type="text"
          value={targetDateString}
          onChange={(e) => setTargetDateString(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Current Date:</h2>
          <p className="font-mono">{currentDate.toISOString()}</p>
          <p className="font-mono mt-2">{currentDate.toString()}</p>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Target Date:</h2>
          {targetDate ? (
            <>
              <p className="font-mono">{targetDate.toISOString()}</p>
              <p className="font-mono mt-2">{targetDate.toString()}</p>
            </>
          ) : (
            <p className="text-red-500">Invalid date</p>
          )}
        </div>
      </div>
      
      <div className="border p-4 rounded bg-gray-100">
        <h2 className="font-bold mb-2">Comparison Result:</h2>
        {isBeforeTarget !== null ? (
          <div className={`text-xl font-bold ${isBeforeTarget ? 'text-green-600' : 'text-red-600'}`}>
            Current date is {isBeforeTarget ? 'BEFORE' : 'AFTER or EQUAL TO'} target date
            <p className="text-gray-600 text-base mt-2">
              {isBeforeTarget 
                ? 'Middleware should redirect to countdown page' 
                : 'Middleware should NOT redirect to countdown page'}
            </p>
          </div>
        ) : (
          <p className="text-red-500">Cannot compare due to invalid date</p>
        )}
      </div>
      
      <div className="mt-6 p-4 border rounded bg-blue-50">
        <h2 className="font-bold mb-2">Middleware Logic Explanation:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>The middleware extracts year from the URL path.</li>
          <li>It checks if the path contains &apos;/vote&apos; or &apos;/voting&apos;.</li>
          <li>It retrieves the vote configuration for the year.</li>
          <li>If Status is true and ShowCountDown is set, it parses the date.</li>
          <li>It compares the current date with the target date using getTime().</li>
          <li>If current time is less than target time, it redirects to the countdown page.</li>
        </ol>
      </div>
    </div>
  );
}

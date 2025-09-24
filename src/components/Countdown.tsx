'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseEurovisionDateString } from '@/utils/dateUtils';

interface CountdownProps {
  targetDateStr: string;
  onComplete?: () => void;
}

export default function Countdown({ targetDateStr, onComplete }: CountdownProps) {
  const router = useRouter();

  // Parse target date string ("HH:MM DD.MM.YYYY") once using useMemo
  const targetDate = useMemo(() => {
    if (!targetDateStr || targetDateStr.trim() === '') {
      // Default to 1 day in the future if no date provided
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 1);
      return defaultDate;
    }
    
    // Parse using our utility function
    const parsedDate = parseEurovisionDateString(targetDateStr);
    
    if (parsedDate) {
      return parsedDate;
    } else {
      // Default to 1 day in the future if parsing fails
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 1);
      return defaultDate;
    }
  }, [targetDateStr]);

  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false
  });

  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        // Countdown completed
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true
        });
        
        if (onComplete) {
          onComplete();
        }
        
        return;
      }
      
      // Calculate remaining time
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isComplete: false
      });
    };

    // Calculate immediately and then set interval
    calculateRemainingTime();
    
    const timerId = setInterval(calculateRemainingTime, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(timerId);
  }, [targetDate, onComplete]);

  if (timeRemaining.isComplete) {
    return (
      <div className="w-full bg-green-700 text-white text-center p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Voting is now open!</h2>
  <p className="text-lg mb-4">Şimdi Eurovision için oy verebilirsiniz.</p>
        <button 
          onClick={() => router.refresh()}
          className="bg-white text-green-700 hover:bg-gray-100 px-6 py-2 rounded-lg font-bold transition-colors"
        >
          Start Voting Now
        </button>
      </div>
    );
  }

  // Determine which time units to display based on remaining time
  const renderDynamicCountdown = () => {
    if (timeRemaining.days > 0) {
      // Show all units when more than a day remains
      return (
        <div className="grid grid-cols-4 gap-4 text-center mb-6">
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-3xl md:text-5xl font-bold mb-1">{timeRemaining.days}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Gün</div>
          </div>
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-3xl md:text-5xl font-bold mb-1">{timeRemaining.hours}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Saat</div>
          </div>
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-3xl md:text-5xl font-bold mb-1">{timeRemaining.minutes}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Dakika</div>
          </div>
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-3xl md:text-5xl font-bold mb-1">{timeRemaining.seconds}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Saniye</div>
          </div>
        </div>
      );
    } else if (timeRemaining.hours > 0) {
      // Show hours, minutes, seconds when less than a day remains
      return (
        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-3xl md:text-6xl font-bold mb-1">{timeRemaining.hours}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Saat</div>
          </div>
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-3xl md:text-6xl font-bold mb-1">{timeRemaining.minutes}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Dakika</div>
          </div>
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-3xl md:text-6xl font-bold mb-1">{timeRemaining.seconds}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Saniye</div>
          </div>
        </div>
      );
    } else if (timeRemaining.minutes > 0) {
      // Show minutes and seconds when less than an hour remains
      return (
        <div className="grid grid-cols-2 gap-4 text-center mb-6">
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-4xl md:text-7xl font-bold mb-1">{timeRemaining.minutes}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Dakika</div>
          </div>
          <div className="bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-4xl md:text-7xl font-bold mb-1">{timeRemaining.seconds}</div>
            <div className="text-xs uppercase tracking-wider opacity-70">Saniye</div>
          </div>
        </div>
      );
    } else {
      // Show only seconds when less than a minute remains
      return (
        <div className="text-center mb-6">
          <div className="animate-heartbeat rounded-lg p-6 inline-block min-w-[200px]">
            <div className="text-5xl md:text-8xl font-bold mb-1">{timeRemaining.seconds}</div>
            <div className="text-sm uppercase tracking-wider opacity-70">Saniye</div>
          </div>
        </div>
      );
    }
  };

  return (
<div className="w-full bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold mb-4 text-center">
    <a
      href="https://www.youtube.com/@BugraSisman/videos"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
    >
      <span className="relative inline-block">
        <span className="text-yellow-300">🔗&#39;Grand Final 2022&#39;</span>
        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-yellow-400"></span>
      </span>
      <br />
      videosu yayınlandıktan sonra oylama başlayacak.
    </a>
  </h2>

  {/* <h2 className="text-2xl font-bold mb-4 text-center">Oylamaya Kalan Süre</h2> */}

  {renderDynamicCountdown()}

  <p className="text-center text-sm opacity-70">
    Oylama Tarihi: {targetDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '/')} {targetDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
  </p>
</div>
  );
}

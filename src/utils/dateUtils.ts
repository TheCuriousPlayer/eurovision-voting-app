'use client';

/**
 * Date helper functions for Eurovision voting system
 */

/**
 * Parses a date string in "HH:MM DD.MM.YYYY" format
 * @param dateString Date string in "HH:MM DD.MM.YYYY" format
 * @returns Date object or null if invalid
 */
export function parseEurovisionDateString(dateString: string): Date | null {
  if (!dateString || dateString.trim() === '') {
    return null;
  }
  
  try {
    const [timeStr, dateStr] = dateString.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    const [day, month, year] = dateStr.split('.').map(Number);
    
    // Validate components
    if (
      isNaN(hours) || isNaN(minutes) || isNaN(day) || isNaN(month) || isNaN(year) ||
      hours < 0 || hours > 23 || minutes < 0 || minutes > 59 ||
      day < 1 || day > 31 || month < 1 || month > 12 || year < 2000
    ) {
      return null;
    }
    
    // Months in JavaScript Date are 0-indexed
    const date = new Date(year, month - 1, day, hours, minutes);
    console.log(`Parsed date from ${dateString}: ${date.toISOString()}`);
    return date;
  } catch (error) {
    console.error('Error parsing date string:', error);
    return null;
  }
}

/**
 * Formats a date as "HH:MM DD.MM.YYYY"
 * @param date Date object to format
 * @returns Formatted date string
 */
export function formatEurovisionDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  
  return `${hours}:${minutes} ${day}.${month}.${year}`;
}

/**
 * Calculates time remaining between now and target date
 * @param targetDate Target date to calculate time until
 * @returns Object with days, hours, minutes, seconds and isComplete flag
 */
export function calculateTimeRemaining(targetDate: Date | null) {
  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true
    };
  }
  
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();
  
  // If target date has passed
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true
    };
  }
  
  // Calculate time components
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isComplete: false
  };
}

/**
 * Creates a future date for testing
 * @param daysToAdd Number of days to add to current date
 * @returns Formatted date string in "HH:MM DD.MM.YYYY" format
 */
export function createFutureDate(daysToAdd: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return formatEurovisionDate(date);
}

/**
 * Creates a past date for testing
 * @param daysAgo Number of days to subtract from current date
 * @returns Formatted date string in "HH:MM DD.MM.YYYY" format
 */
export function createPastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatEurovisionDate(date);
}

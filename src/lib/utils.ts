
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return 'No date available';
  
  try {
    // Validate date format first
    const timestamp = Date.parse(String(dateString));
    if (isNaN(timestamp)) {
      console.warn(`Invalid date string: "${dateString}"`);
      return 'No date available';
    }
    
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'No date available';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatTimeAgo(dateString: string | undefined | null): string {
  if (!dateString) return 'Unknown time';
  
  try {
    // Validate date format first
    const timestamp = Date.parse(String(dateString));
    if (isNaN(timestamp)) {
      console.warn(`Invalid date string for time ago: "${dateString}"`);
      return 'Unknown time';
    }
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    
    if (diffInSeconds < minute) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < hour) {
      const minutes = Math.floor(diffInSeconds / minute);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < day) {
      const hours = Math.floor(diffInSeconds / hour);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / day);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Unknown time';
  }
}

import { useState, useEffect } from 'react';

export const useStreakTracker = () => {
  const [streak, setStreak] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('brainbreak-streak');
    const storedDate = localStorage.getItem('brainbreak-lastdate');

    if (stored) setStreak(parseInt(stored, 10));
    if (storedDate) setLastSessionDate(storedDate);
    setIsLoaded(true);
  }, []);

  const incrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];

    if (lastSessionDate === today) {
      // Already completed today
      return streak;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastSessionDate === yesterday ? streak + 1 : 1;

    localStorage.setItem('brainbreak-streak', String(newStreak));
    localStorage.setItem('brainbreak-lastdate', today);
    setStreak(newStreak);
    setLastSessionDate(today);

    return newStreak;
  };

  return { streak, incrementStreak, isLoaded };
};

import { useState, useEffect } from 'react';
import { DEFAULT_WEDDING_DATE } from '../data/initialTasks';

export function useCountdown(initialDate = DEFAULT_WEDDING_DATE) {
  const [targetDate, setTargetDate] = useState(() => {
    const saved = localStorage.getItem('wedding_dday_date');
    return saved || initialDate;
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    totalHours: 0
  });

  useEffect(() => {
    localStorage.setItem('wedding_dday_date', targetDate);
  }, [targetDate]);

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
          totalHours: 0
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
        totalHours: Math.floor(difference / (1000 * 60 * 60))
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return { ...timeLeft, targetDate, setTargetDate };
}

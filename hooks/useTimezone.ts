'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

interface TimezoneInfo {
  timezone: string;
  time: string;
  abbr: string;
}

export function useTimezone(timezone: string) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const formatted = formatInTimeZone(
          new Date(),
          timezone,
          'h:mm a'
        );
        setTime(formatted);
      } catch (error) {
        setTime('--:--');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);

    return () => clearInterval(interval);
  }, [timezone]);

  return time;
}

export function useMultipleTimezones(timezones: string[]): TimezoneInfo[] {
  const timezonesKey = useMemo(() => timezones.join(','), [timezones]);

  const [times, setTimes] = useState<TimezoneInfo[]>(() =>
    timezones.map((tz) => ({
      timezone: tz,
      time: '--:--',
      abbr: getTimezoneAbbr(tz),
    }))
  );

  useEffect(() => {
    const updateTimes = () => {
      try {
        const newTimes = timezones.map((tz) => ({
          timezone: tz,
          time: formatInTimeZone(new Date(), tz, 'h:mm a'),
          abbr: getTimezoneAbbr(tz),
        }));
        setTimes(newTimes);
      } catch (error) {
        console.error('Error updating times:', error);
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 30000);

    return () => clearInterval(interval);
  }, [timezonesKey]);

  return times;
}

function getTimezoneAbbr(timezone: string | undefined): string {
  // Safety check for undefined/null timezone
  if (!timezone) {
    return '---';
  }

  const abbrMap: Record<string, string> = {
    'Asia/Kolkata': 'IST',
    'America/New_York': 'EST',
    'America/Los_Angeles': 'PST',
    'Europe/London': 'GMT',
    'Australia/Sydney': 'AEDT',
    'Asia/Singapore': 'SGT',
    'Asia/Tokyo': 'JST',
  };

  return abbrMap[timezone] || (timezone.includes('/') ? timezone.split('/')[1].slice(0, 3).toUpperCase() : timezone.slice(0, 3).toUpperCase());
}

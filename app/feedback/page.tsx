'use client';

import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { useTheme } from '@/lib/ThemeContext';
import { getTheme } from '@/lib/themes';

export default function FeedbackPage() {
  const theme = useTheme();
  const themeConfig = getTheme(theme);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: themeConfig.mainColor,
        transition: 'background-color 300ms ease',
      }}
    >
      <FeedbackForm />
    </div>
  );
}

import { useState, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'deal_note_';

/**
 * Hook to manage deal notes/bookmarks
 * Uses localStorage as fallback, can be upgraded to use API endpoint
 */
export function useDealNote(dealId: number) {
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `${STORAGE_KEY_PREFIX}${dealId}`;

  // Load note from localStorage on mount
  useEffect(() => {
    try {
      const savedNote = localStorage.getItem(storageKey) || '';
      setNote(savedNote);
    } catch (error) {
      console.error('Error loading note from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dealId, storageKey]);

  // Save note to localStorage
  const saveNote = (newNote: string) => {
    try {
      const trimmedNote = newNote.slice(0, 100); // Max 100 chars
      localStorage.setItem(storageKey, trimmedNote);
      setNote(trimmedNote);
      return true;
    } catch (error) {
      console.error('Error saving note to localStorage:', error);
      return false;
    }
  };

  // Clear note
  const clearNote = () => {
    try {
      localStorage.removeItem(storageKey);
      setNote('');
      return true;
    } catch (error) {
      console.error('Error clearing note:', error);
      return false;
    }
  };

  return {
    note,
    setNote: saveNote,
    clearNote,
    isLoading,
    hasNote: note.length > 0,
  };
}

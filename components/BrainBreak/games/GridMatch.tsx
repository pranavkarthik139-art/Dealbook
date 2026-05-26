'use client';

import React, { useState, useEffect } from 'react';

interface GridMatchProps {
  gameData: any;
  timeLeft: number;
  onWin: () => void;
  onFail: () => void;
}

export default function GridMatch({ gameData, timeLeft, onWin, onFail }: GridMatchProps) {
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isPlayingPattern, setIsPlayingPattern] = useState(true);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [message, setMessage] = useState('Watch the pattern...');

  const pattern = gameData.pattern || [];
  const gridSize = 3;

  // Play pattern on mount
  useEffect(() => {
    if (pattern.length === 0) return;

    const playPattern = async () => {
      setIsPlayingPattern(true);
      setMessage('Watch the pattern...');
      await new Promise(resolve => setTimeout(resolve, 500));

      for (let i = 0; i < pattern.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setHighlightedCell(pattern[i]);
        await new Promise(resolve => setTimeout(resolve, 300));
        setHighlightedCell(null);
      }

      setIsPlayingPattern(false);
      setMessage('Your turn! Tap the cells');
    };

    playPattern();
  }, [pattern]);

  const handleCellClick = (index: number) => {
    if (isPlayingPattern) return;

    const newPattern = [...userPattern, index];
    setUserPattern(newPattern);

    // Visual feedback
    setHighlightedCell(index);
    setTimeout(() => setHighlightedCell(null), 200);

    // Check if user input matches so far
    if (newPattern[newPattern.length - 1] !== pattern[newPattern.length - 1]) {
      setMessage('❌ Wrong! Try again');
      setTimeout(() => onFail(), 500);
      return;
    }

    // Check if user completed the pattern
    if (newPattern.length === pattern.length) {
      setMessage('✓ Perfect!');
      setTimeout(() => onWin(), 500);
      return;
    }

    setMessage(`${newPattern.length} / ${pattern.length}`);
  };

  const getCellColor = (index: number) => {
    const isHighlighted = highlightedCell === index;
    const baseColor = index % 2 === 0 ? 'bg-blue-100 hover:bg-blue-150' : 'bg-indigo-100 hover:bg-indigo-150';
    const highlightColor = index % 2 === 0 ? 'bg-blue-400' : 'bg-indigo-400';

    return isHighlighted ? highlightColor : baseColor;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-slate-600 mb-2">{message}</p>
        <p className="text-xs text-slate-500">
          Pattern length: {pattern.length}
        </p>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3 p-6 bg-slate-50 rounded-xl border border-slate-200">
        {Array.from({ length: gridSize * gridSize }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={isPlayingPattern}
            className={`
              w-16 h-16 rounded-lg transition-all duration-100
              ${getCellColor(index)}
              ${isPlayingPattern ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
              border-2 border-slate-300 active:scale-95 font-bold text-lg
            `}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{
            width: `${(userPattern.length / Math.max(pattern.length, 1)) * 100}%`,
          }}
        />
      </div>

      <p className="text-xs text-slate-500">
        {userPattern.length} of {pattern.length} cells
      </p>
    </div>
  );
}

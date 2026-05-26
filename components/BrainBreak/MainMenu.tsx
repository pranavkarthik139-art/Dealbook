'use client';

import React from 'react';

interface MainMenuProps {
  onSelectGame: (game: 'gridmatch' | 'stroop' | 'makeinten') => void;
  streak: number;
  isLoaded: boolean;
}

const games = [
  {
    id: 'gridmatch',
    name: 'Grid Match',
    description: 'Repeat the pattern by tapping cells',
    icon: '🎯',
    color: 'bg-blue-500',
  },
  {
    id: 'stroop',
    name: 'Stroop Test',
    description: 'Match text colors, not words',
    icon: '🌈',
    color: 'bg-purple-500',
  },
  {
    id: 'makeinten',
    name: 'Make it 10',
    description: 'Combine numbers to reach exactly 10',
    icon: '🔢',
    color: 'bg-emerald-500',
  },
];

export default function MainMenu({ onSelectGame, streak, isLoaded }: MainMenuProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Brain Break</h2>
        <p className="text-sm text-slate-600">Choose a quick game to refocus</p>
      </div>

      {/* Streak Badge */}
      {isLoaded && (
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
          <span className="text-xl">🔥</span>
          <span className="font-semibold text-amber-900">
            {streak} day{streak !== 1 ? 's' : ''} streak
          </span>
        </div>
      )}

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id as 'gridmatch' | 'stroop' | 'makeinten')}
            className={`
              ${game.color} p-6 rounded-lg text-white transition-all
              hover:shadow-lg active:scale-95 cursor-pointer
            `}
          >
            <div className="text-4xl mb-3">{game.icon}</div>
            <h3 className="font-bold text-lg mb-1">{game.name}</h3>
            <p className="text-sm opacity-90">{game.description}</p>
            <div className="mt-4 text-xs opacity-75">60 seconds</div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-500 text-center">
        One game per day to build your streak
      </p>
    </div>
  );
}

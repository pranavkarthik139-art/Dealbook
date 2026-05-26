'use client';

import React from 'react';

interface SuccessScreenProps {
  score: number;
  currentGame: string;
  streak: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export default function SuccessScreen({
  score,
  currentGame,
  streak,
  onPlayAgain,
  onClose,
}: SuccessScreenProps) {
  const gameNames: Record<string, string> = {
    gridmatch: 'Grid Match',
    stroop: 'Stroop Test',
    makeinten: 'Make it 10',
  };

  const gameEmojis: Record<string, string> = {
    gridmatch: '🎯',
    stroop: '🌈',
    makeinten: '🔢',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      {/* Celebration */}
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">{gameEmojis[currentGame] || '🎉'}</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">You nailed it!</h2>
        <p className="text-sm text-slate-600">{gameNames[currentGame]}</p>
      </div>

      {/* Score Display */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-8 rounded-lg border-2 border-emerald-200 w-full max-w-sm">
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-2">Score</p>
          <p className="text-5xl font-bold text-emerald-600">{score}</p>
          <p className="text-xs text-slate-500 mt-2">Correct in 60 seconds</p>
        </div>
      </div>

      {/* Streak Milestone */}
      {streak > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 px-6 py-4 rounded-lg border border-amber-200 w-full max-w-sm justify-center">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-bold text-amber-900">{streak} day streak!</p>
            <p className="text-xs text-amber-700">Come back tomorrow to extend it</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all
            bg-slate-200 text-slate-900 hover:bg-slate-300 active:scale-95"
        >
          Back to Dashboard
        </button>
        <button
          onClick={onPlayAgain}
          className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all
            bg-blue-500 text-white hover:shadow-md active:scale-95"
        >
          Play Again
        </button>
      </div>

      {/* Footer Message */}
      <p className="text-xs text-slate-500 text-center">
        You've earned a break. Great focus session!
      </p>
    </div>
  );
}

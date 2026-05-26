'use client';

import React from 'react';
import GridMatch from './games/GridMatch';
import StroopTest from './games/StroopTest';
import MakeIt10 from './games/MakeIt10';

interface GameplayScreenProps {
  currentGame: 'gridmatch' | 'stroop' | 'makeinten' | null;
  gameData: any;
  timeLeft: number;
  onWin: (score: number) => void;
  onFail: () => void;
}

export default function GameplayScreen({
  currentGame,
  gameData,
  timeLeft,
  onWin,
  onFail,
}: GameplayScreenProps) {
  return (
    <div className="relative">
      {/* Timer Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            timeLeft > 20 ? 'bg-emerald-500' : timeLeft > 10 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>

      {/* Timer Display */}
      <div className="absolute top-4 right-4">
        <div className="text-sm font-bold text-slate-600">{timeLeft}s</div>
      </div>

      {/* Game Renderer */}
      <div className="pt-8">
        {currentGame === 'gridmatch' && (
          <GridMatch gameData={gameData} timeLeft={timeLeft} onWin={onWin} onFail={onFail} />
        )}
        {currentGame === 'stroop' && (
          <StroopTest gameData={gameData} timeLeft={timeLeft} onWin={onWin} onFail={onFail} />
        )}
        {currentGame === 'makeinten' && (
          <MakeIt10 gameData={gameData} timeLeft={timeLeft} onWin={onWin} onFail={onFail} />
        )}
      </div>
    </div>
  );
}

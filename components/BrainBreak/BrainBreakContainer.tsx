'use client';

import React from 'react';
import { useGameState } from './hooks/useGameState';
import { useStreakTracker } from './hooks/useStreakTracker';
import MainMenu from './MainMenu';
import GameplayScreen from './GameplayScreen';
import SuccessScreen from './SuccessScreen';

interface BrainBreakContainerProps {
  onClose: () => void;
}

export default function BrainBreakContainer({ onClose }: BrainBreakContainerProps) {
  const { state, startGame, completeGame, failGame, resetToMenu } = useGameState();
  const { streak, incrementStreak, isLoaded } = useStreakTracker();

  const handleGameSelect = (gameType: 'gridmatch' | 'stroop' | 'makeinten') => {
    startGame(gameType);
  };

  const handleGameWin = (score: number) => {
    const newStreak = incrementStreak();
    completeGame(score);
  };

  const handleGameFail = () => {
    failGame();
  };

  const handlePlayAgain = () => {
    resetToMenu();
  };

  const handleClose = () => {
    resetToMenu();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <div className="w-8" /> {/* Spacer for alignment */}
          <h1 className="text-lg font-bold text-slate-900">Brain Break</h1>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {state.screen === 'menu' && (
            <MainMenu
              onSelectGame={handleGameSelect}
              streak={streak}
              isLoaded={isLoaded}
            />
          )}

          {state.screen === 'playing' && (
            <GameplayScreen
              currentGame={state.currentGame}
              gameData={state.gameData}
              timeLeft={state.timeLeft}
              onWin={handleGameWin}
              onFail={handleGameFail}
            />
          )}

          {state.screen === 'success' && (
            <SuccessScreen
              score={state.score}
              currentGame={state.currentGame || 'gridmatch'}
              streak={streak}
              onPlayAgain={handlePlayAgain}
              onClose={handleClose}
            />
          )}

          {state.screen === 'failed' && (
            <div className="flex flex-col items-center justify-center space-y-8 py-8">
              <div className="text-center">
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Time's up!</h2>
                <p className="text-sm text-slate-600">You gave it a good try</p>
              </div>

              <div className="w-full max-w-sm flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all
                    bg-slate-200 text-slate-900 hover:bg-slate-300 active:scale-95"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handlePlayAgain}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all
                    bg-blue-500 text-white hover:shadow-md active:scale-95"
                >
                  Try Again
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Keep practicing. You'll get better!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

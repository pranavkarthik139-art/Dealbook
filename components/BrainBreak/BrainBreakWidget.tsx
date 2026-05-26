'use client';

import React, { useState } from 'react';
import { useStreakTracker } from './hooks/useStreakTracker';
import BrainBreakContainer from './BrainBreakContainer';

export default function BrainBreakWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { streak, isLoaded } = useStreakTracker();

  if (!isLoaded) {
    return null; // Don't show until streak data is loaded
  }

  return (
    <>
      {/* Widget Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
           onClick={() => setIsOpen(true)}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧠</span>
              <h3 className="font-bold text-slate-900">Brain Break</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Take a quick mental break with a fun game
            </p>
            {streak > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span className="text-xs font-semibold text-amber-700">
                  {streak} day{streak !== 1 ? 's' : ''} streak
                </span>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold text-sm
              hover:bg-blue-600 active:scale-95 transition-all whitespace-nowrap"
          >
            Play Now
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && <BrainBreakContainer onClose={() => setIsOpen(false)} />}
    </>
  );
}

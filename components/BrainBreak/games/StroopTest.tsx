'use client';

import React, { useState, useEffect } from 'react';

interface StroopTestProps {
  gameData: any;
  timeLeft: number;
  onWin: (score: number) => void;
  onFail: () => void;
}

const COLORS = [
  { hex: '#EF4444', name: 'RED' },
  { hex: '#3B82F6', name: 'BLUE' },
  { hex: '#10B981', name: 'GREEN' },
  { hex: '#F59E0B', name: 'YELLOW' },
];

export default function StroopTest({ gameData, timeLeft, onWin, onFail }: StroopTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(gameData.currentQuestion);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState('');

  const generateQuestion = () => {
    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const displayWord = COLORS[Math.floor(Math.random() * COLORS.length)].name;
    return { text: displayWord, color: textColor.hex, correctColor: textColor.name };
  };

  const handleAnswer = (selectedColor: string) => {
    setAnswered(true);
    const isCorrect = selectedColor === currentQuestion.correctColor;

    if (isCorrect) {
      setFeedback('✓');
      const newScore = score + 1;
      setScore(newScore);

      // Next question after 300ms
      setTimeout(() => {
        setCurrentQuestion(generateQuestion());
        setAnswered(false);
        setFeedback('');
      }, 300);

      // Win condition: 8 correct answers
      if (newScore >= 8) {
        setTimeout(() => onWin(newScore), 500);
      }
    } else {
      setFeedback('✗ Wrong color');
      setTimeout(() => onFail(), 300);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Click the button matching the TEXT COLOR (not the word)
        </p>
      </div>

      {/* Main Display */}
      <div className="flex flex-col items-center space-y-6">
        <div
          className="text-6xl font-black tracking-wider select-none"
          style={{ color: currentQuestion.color }}
        >
          {currentQuestion.text}
        </div>

        {/* Feedback */}
        {feedback && (
          <p className={`text-2xl font-bold ${feedback === '✓' ? 'text-green-600' : 'text-red-600'}`}>
            {feedback}
          </p>
        )}

        {/* Answer Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => handleAnswer(color.name)}
              disabled={answered}
              className={`
                px-4 py-3 rounded-lg font-semibold text-sm transition-all text-white
                ${answered ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-95'}
                ${color.hex === currentQuestion.color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}
              `}
              style={{ backgroundColor: color.hex }}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <p className="text-3xl font-bold text-slate-900">{score}</p>
        <p className="text-xs text-slate-500">Correct (8 to win)</p>
      </div>
    </div>
  );
}

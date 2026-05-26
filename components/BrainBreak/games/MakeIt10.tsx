'use client';

import React, { useState, useEffect } from 'react';

interface MakeIt10Props {
  gameData: any;
  timeLeft: number;
  onWin: (score: number) => void;
  onFail: () => void;
}

const OPERATORS = [
  { symbol: '+', fn: (a: number, b: number) => a + b },
  { symbol: '−', fn: (a: number, b: number) => a - b },
  { symbol: '×', fn: (a: number, b: number) => a * b },
  { symbol: '÷', fn: (a: number, b: number) => (b !== 0 ? a / b : null) },
];

export default function MakeIt10({ gameData, timeLeft, onWin, onFail }: MakeIt10Props) {
  const [numbers] = useState(gameData.numbers || []);
  const [result, setResult] = useState(numbers[0] || 0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [operationsUsed, setOperationsUsed] = useState(0);

  useEffect(() => {
    if (result === 10 && !completed) {
      setCompleted(true);
      setFeedback('✓ Perfect!');
      setTimeout(() => onWin(operationsUsed), 500);
    }
  }, [result, completed, operationsUsed, onWin]);

  const handleOperation = (operator: (typeof OPERATORS)[0]) => {
    if (completed) return;

    const nextNumber = numbers[operationsUsed + 1];
    if (nextNumber === undefined) return;

    const newResult = operator.fn(result, nextNumber);

    if (newResult === null || newResult < 0) {
      setFeedback('✗ Invalid operation');
      setTimeout(() => onFail(), 300);
      return;
    }

    setResult(newResult);
    setOperationsUsed(operationsUsed + 1);
    setFeedback('');

    // Check if we've used all numbers
    if (operationsUsed + 1 === numbers.length - 1) {
      if (newResult !== 10) {
        setFeedback('✗ Target was 10');
        setTimeout(() => onFail(), 500);
      }
    }
  };

  const nextNumber = numbers[operationsUsed + 1];
  const hasMoreNumbers = operationsUsed < numbers.length - 1;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Use operators to reach exactly 10
        </p>
      </div>

      {/* Main Display */}
      <div className="flex flex-col items-center space-y-6">
        {/* Numbers & Operations */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-4xl font-bold text-slate-900">{result}</div>
          </div>

          {feedback && (
            <p className={`text-2xl font-bold ${feedback === '✓ Perfect!' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback}
            </p>
          )}

          {hasMoreNumbers && !completed && (
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Next number</p>
              <p className="text-3xl font-bold text-slate-700">{nextNumber}</p>
            </div>
          )}
        </div>

        {/* Operator Buttons */}
        {hasMoreNumbers && !completed && (
          <div className="grid grid-cols-2 gap-2 w-full">
            {OPERATORS.map((op) => (
              <button
                key={op.symbol}
                onClick={() => handleOperation(op)}
                className={`
                  px-4 py-3 rounded-lg font-semibold text-sm transition-all text-white
                  bg-slate-400 hover:shadow-md active:scale-95
                `}
              >
                {op.symbol}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="text-center">
        <p className="text-3xl font-bold text-slate-900">{result}</p>
        <p className="text-xs text-slate-500">
          {operationsUsed} of {numbers.length - 1} operations
        </p>
      </div>
    </div>
  );
}

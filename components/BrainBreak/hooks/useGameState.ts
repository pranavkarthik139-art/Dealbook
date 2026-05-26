import { useState, useEffect, useCallback } from 'react';

export type GameType = 'gridmatch' | 'stroop' | 'makeinten' | null;
export type ScreenType = 'menu' | 'playing' | 'success' | 'failed';

export interface GameState {
  currentGame: GameType;
  screen: ScreenType;
  timeLeft: number;
  isTimerActive: boolean;
  score: number;
  attempts: number;
  gameData: Record<string, any>;
}

const generatePattern = () => Array.from({ length: 5 }, () => Math.floor(Math.random() * 9));

const generateStroopQuestion = () => ({
  text: ['RED', 'BLUE', 'GREEN', 'YELLOW'][Math.floor(Math.random() * 4)],
  color: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 4)],
});

const generateRandomNumbers = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1);

const initializeGameData = (gameType: GameType) => {
  switch (gameType) {
    case 'gridmatch':
      return { pattern: generatePattern(), userPattern: [], showPattern: true, playingIndex: 0 };
    case 'stroop':
      return { currentQuestion: generateStroopQuestion(), score: 0, questions: 0 };
    case 'makeinten':
      return { numbers: generateRandomNumbers(), result: null };
    default:
      return {};
  }
};

export const useGameState = () => {
  const [state, setState] = useState<GameState>({
    currentGame: null,
    screen: 'menu',
    timeLeft: 60,
    isTimerActive: false,
    score: 0,
    attempts: 0,
    gameData: {},
  });

  // Timer logic
  useEffect(() => {
    if (!state.isTimerActive || state.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeLeft: prev.timeLeft - 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isTimerActive, state.timeLeft]);

  // Auto-fail on timer expiry
  useEffect(() => {
    if (state.timeLeft === 0 && state.isTimerActive) {
      setState(prev => ({
        ...prev,
        isTimerActive: false,
        screen: 'failed',
      }));
    }
  }, [state.timeLeft, state.isTimerActive]);

  const startGame = useCallback((gameType: GameType) => {
    setState(prev => ({
      ...prev,
      currentGame: gameType,
      screen: 'playing',
      timeLeft: 60,
      isTimerActive: true,
      score: 0,
      attempts: 0,
      gameData: initializeGameData(gameType),
    }));
  }, []);

  const completeGame = useCallback((finalScore: number) => {
    setState(prev => ({
      ...prev,
      isTimerActive: false,
      screen: 'success',
      score: finalScore,
    }));
  }, []);

  const failGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTimerActive: false,
      screen: 'failed',
    }));
  }, []);

  const resetToMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentGame: null,
      screen: 'menu',
      timeLeft: 60,
      isTimerActive: false,
      score: 0,
      attempts: 0,
      gameData: {},
    }));
  }, []);

  const updateGameData = useCallback((data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      gameData: { ...prev.gameData, ...data },
    }));
  }, []);

  return { state, startGame, completeGame, failGame, resetToMenu, updateGameData };
};

import { useState, useEffect, useCallback } from 'react';
import { GameState, GameSettings, GameSession } from '@/types/game';
import { LocalStorageService } from '@/utils/storage';

interface UseGameStateReturn {
  gameState: GameState;
  score: number;
  timeLeft: number;
  totalShots: number;
  totalHits: number;
  accuracy: number;
  startGame: () => void;
  endGame: () => void;
  updateScore: (newScore: number) => void;
  updateShots: () => void;
  resetGame: () => void;
}

export function useGameState(settings: GameSettings): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalShots, setTotalShots] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === GameState.PLAYING && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === GameState.PLAYING) {
      endGame();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft]);

  // 计算准确率
  useEffect(() => {
    if (totalShots > 0) {
      setAccuracy(Math.round((totalHits / totalShots) * 100));
    } else {
      setAccuracy(0);
    }
  }, [totalHits, totalShots]);

  const startGame = useCallback(() => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setTimeLeft(60);
    setTotalShots(0);
    setTotalHits(0);
    setAccuracy(0);
  }, []);

  const endGame = useCallback(() => {
    setGameState(GameState.FINISHED);
    
    // 保存游戏记录
    const session: GameSession = {
      id: Date.now().toString(),
      score,
      hits: totalHits,
      shots: totalShots,
      accuracy,
      duration: 60 - timeLeft,
      timestamp: Date.now()
    };
    
    LocalStorageService.addGameSession(session);
  }, [score, totalHits, totalShots, accuracy, timeLeft]);

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
    setTotalHits(prev => prev + 1);
  }, []);

  const updateShots = useCallback(() => {
    setTotalShots(prev => prev + 1);
  }, []);

  const resetGame = useCallback(() => {
    setGameState(GameState.IDLE);
    setScore(0);
    setTimeLeft(60);
    setTotalShots(0);
    setTotalHits(0);
    setAccuracy(0);
  }, []);

  return {
    gameState,
    score,
    timeLeft,
    totalShots,
    totalHits,
    accuracy,
    startGame,
    endGame,
    updateScore,
    updateShots,
    resetGame
  };
}
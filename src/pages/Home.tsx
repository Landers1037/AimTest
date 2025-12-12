import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameScene from '@/components/GameScene';
import { useGameState } from '@/hooks/useGameState';
import { LocalStorageService } from '@/utils/storage';
import { GameSettings, GameState } from '@/types/game';
import { Settings, Trophy, Play, RefreshCw, Target, Clock } from 'lucide-react';

export default function Home() {
  const [settings, setSettings] = useState<GameSettings>(LocalStorageService.getDefaultSettings());
  const {
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
  } = useGameState(settings);

  useEffect(() => {
    const savedSettings = LocalStorageService.loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleGameEnd = () => {
    endGame();
  };

  const handleScoreUpdate = (newScore: number) => {
    updateScore(newScore);
  };

  const handleShoot = () => {
    updateShots();
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleRestartGame = () => {
    resetGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部状态栏 */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-slate-700/60 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              AimTest
            </h1>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-cyan-400">
                <Trophy className="w-4 h-4" />
                <span>得分: {score}</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span>时间: {formatTime(timeLeft)}</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <Target className="w-4 h-4" />
                <span>准确率: {accuracy}%</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <Target className="w-4 h-4" />
                <span>瞄准率: {totalHits}/{totalShots}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              设置
            </Link>
            <Link
              to="/scores"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              <Trophy className="w-4 h-4" />
              成绩
            </Link>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 relative">
        {/* 3D游戏场景 */}
        <GameScene
          settings={settings}
          gameState={gameState}
          score={score}
          timeLeft={timeLeft}
          onScoreUpdate={handleScoreUpdate}
          onShoot={handleShoot}
          onGameEnd={handleGameEnd}
        />

        {/* 游戏状态覆盖层 */}
        <div className="absolute inset-0 pointer-events-none">
          {gameState === GameState.IDLE && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">准备开始</h2>
                <p className="text-xl text-gray-300 mb-8">移动鼠标瞄准，点击射击小球</p>
                <button
                  onClick={handleStartGame}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white text-xl font-semibold rounded-lg transition-all transform hover:scale-105 pointer-events-auto"
                >
                  <Play className="w-6 h-6" />
                  开始游戏
                </button>
              </div>
            </div>
          )}

          {gameState === GameState.FINISHED && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/60 text-center max-w-md mx-4 pointer-events-auto">
                <h2 className="text-3xl font-bold text-white mb-6">游戏结束</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-cyan-400">最终得分:</span>
                    <span className="text-white font-bold">{score}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-green-400">命中率:</span>
                    <span className="text-white font-bold">{accuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-yellow-400">射击次数:</span>
                    <span className="text-white font-bold">{totalShots}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleRestartGame}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    再来一局
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 游戏说明 */}
        {gameState === GameState.PLAYING && (
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-300 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>移动鼠标瞄准</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">点击</span>
              <span>射击小球</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

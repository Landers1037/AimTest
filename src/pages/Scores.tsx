import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LocalStorageService } from '@/utils/storage';
import { GameSession } from '@/types/game';
import { ArrowLeft, Trophy, Target, Clock, Calendar } from 'lucide-react';

export default function Scores() {
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const gameData = LocalStorageService.loadGameData();
    if (gameData) {
      setGameHistory(gameData.gameHistory);
      setBestScore(gameData.bestScore);
    }
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回游戏
          </Link>
          <h1 className="text-3xl font-bold text-white">成绩记录</h1>
          <div className="w-20"></div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">最佳成绩</h3>
            </div>
            <div className="text-3xl font-bold text-white">{bestScore}</div>
            <div className="text-sm text-yellow-300/70">击破小球数</div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-cyan-400" />
              <h3 className="text-lg font-semibold text-cyan-400">总游戏次数</h3>
            </div>
            <div className="text-3xl font-bold text-white">{gameHistory.length}</div>
            <div className="text-sm text-cyan-300/70">次游戏</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-lg p-6 border border-slate-700/60">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-300">平均准确率</h3>
            </div>
            <div className="text-3xl font-bold text-white">
              {gameHistory.length > 0 
                ? Math.round(gameHistory.reduce((sum, session) => sum + session.accuracy, 0) / gameHistory.length)
                : 0}%
            </div>
            <div className="text-sm text-slate-300/70">平均命中率</div>
          </div>
        </div>

        {/* 历史记录 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-slate-700/60">
          <div className="p-6 border-b border-slate-700/60">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              最近游戏记录
            </h2>
          </div>

          {gameHistory.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">还没有游戏记录</p>
              <p className="text-gray-500 text-sm mt-2">开始游戏来查看你的成绩！</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/40">
              {gameHistory.map((session, index) => (
                <div key={session.id} className="p-6 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-cyan-400 w-12">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-white mb-1">
                          得分: {session.score}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>命中: {session.hits}</span>
                          <span>射击: {session.shots}</span>
                          <span className={getAccuracyColor(session.accuracy)}>
                            准确率: {session.accuracy}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {formatDate(session.timestamp)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        时长: {session.duration}秒
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

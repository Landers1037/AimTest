import { GameData, GameSettings, GameSession, GameMode } from '@/types/game';

const STORAGE_KEYS = {
  GAME_DATA: 'aimlab_game_data',
  SETTINGS: 'aimlab_settings'
};

// 本地存储管理器
export class LocalStorageService {
  // 保存游戏数据
  static saveGameData(data: GameData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('保存游戏数据失败:', error);
    }
  }

  // 加载游戏数据
  static loadGameData(): GameData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载游戏数据失败:', error);
      return null;
    }
  }

  // 保存设置
  static saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  // 加载设置
  static loadSettings(): GameSettings | null {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('加载设置失败:', error);
      return null;
    }
  }

  // 清除所有数据
  static clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_DATA);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }

  // 添加游戏会话
  static addGameSession(session: GameSession): void {
    const gameData = this.loadGameData() || this.getDefaultGameData();
    gameData.gameHistory.unshift(session);
    
    // 只保留最近10次记录
    if (gameData.gameHistory.length > 10) {
      gameData.gameHistory = gameData.gameHistory.slice(0, 10);
    }

    // 更新最佳成绩
    if (session.score > gameData.bestScore) {
      gameData.bestScore = session.score;
    }

    this.saveGameData(gameData);
  }

  // 获取默认游戏数据
  static getDefaultGameData(): GameData {
    return {
      currentScore: 0,
      bestScore: 0,
      totalHits: 0,
      totalShots: 0,
      accuracy: 0,
      gameHistory: []
    };
  }

  // 获取默认设置
  static getDefaultSettings(): GameSettings {
    return {
      targetColor: '#00d4ff',
      targetSize: 0.5,
      spawnDensity: 3,
      crosshairColor: '#00ff88',
      crosshairSize: 20,
      crosshairThickness: 2,
      gameMode: GameMode.MIXED,
      moveSpeed: 2
    };
  }
}
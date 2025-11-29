// 游戏状态枚举
export enum GameState {
  IDLE = 'idle',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished'
}

// 游戏模式枚举
export enum GameMode {
  FIXED = 'fixed',
  MIXED = 'mixed',
  RANDOM = 'random'
}

// 3D小球接口
export interface Target {
  mesh: any; // THREE.Mesh
  position: any; // THREE.Vector3
  velocity: any; // THREE.Vector3
  size: number;
  color: string;
  isMoving: boolean;
  destroyed: boolean;
}

// 十字准星接口
export interface Crosshair {
  color: string;
  size: number;
  thickness: number;
  position: any; // THREE.Vector2
}

// 游戏设置接口
export interface GameSettings {
  targetColor: string;
  targetSize: number;
  spawnDensity: number;
  crosshairColor: string;
  crosshairSize: number;
  crosshairThickness: number;
  gameMode: GameMode;
  moveSpeed: number;
}

// 游戏数据接口
export interface GameData {
  currentScore: number;
  bestScore: number;
  totalHits: number;
  totalShots: number;
  accuracy: number;
  gameHistory: GameSession[];
}

// 游戏会话接口
export interface GameSession {
  id: string;
  score: number;
  hits: number;
  shots: number;
  accuracy: number;
  duration: number;
  timestamp: number;
}
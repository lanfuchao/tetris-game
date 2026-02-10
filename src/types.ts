export interface Piece {
    type: number;
    x: number;
    y: number;
    isSpecial?: boolean; // 是否是特殊穿透方块
}

export enum Difficulty {
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard'
}

export interface GameState {
    board: number[][];
    currentPiece: Piece | null;
    nextPiece: Piece | null;
    score: number;
    level: number;
    isPaused: boolean;
    isGameOver: boolean;
    isDropping: boolean;
    difficulty: Difficulty;
    isVictory: boolean; // 是否通关（50级）
}

export interface GameRecord {
    id: string;
    difficulty: Difficulty;
    score: number;
    level: number;
    isVictory: boolean; // 是否通关
    timestamp: number; // 时间戳
    duration: number; // 游戏时长（秒）
}

export type Shape = number[][];

export interface GameConfig {
    cols: number;
    rows: number;
    blockSize: number;
    colors: (string | null)[];
    shapes: Shape[];
}

export interface DifficultyConfig {
    name: string;
    description: string;
    initialSpeed: number;
    speedCurve: (level: number) => number;
    scoreMultiplier: number;
    levelUpThreshold: number;
}

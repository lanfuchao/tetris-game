export interface Piece {
    type: number;
    x: number;
    y: number;
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

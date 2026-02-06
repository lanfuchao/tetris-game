import { Difficulty, DifficultyConfig } from './types';

/**
 * 难度配置
 * 使用指数衰减曲线来计算速度，更符合游戏体验
 */
export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
    [Difficulty.EASY]: {
        name: '简单',
        description: '适合新手，速度较慢',
        initialSpeed: 1000,
        // 指数衰减公式: speed = initialSpeed * 0.92^(level-1)
        // 速度下降较慢，最低到 200ms
        speedCurve: (level: number) => {
            const speed = 1000 * Math.pow(0.92, level - 1);
            return Math.max(200, Math.round(speed));
        },
        scoreMultiplier: 1.0,
        levelUpThreshold: 1200 // 每 1200 分升一级
    },

    [Difficulty.NORMAL]: {
        name: '普通',
        description: '标准难度，平衡体验',
        initialSpeed: 800,
        // 指数衰减公式: speed = initialSpeed * 0.88^(level-1)
        // 速度下降适中，最低到 120ms
        speedCurve: (level: number) => {
            const speed = 800 * Math.pow(0.88, level - 1);
            return Math.max(120, Math.round(speed));
        },
        scoreMultiplier: 1.5,
        levelUpThreshold: 1000 // 每 1000 分升一级
    },

    [Difficulty.HARD]: {
        name: '困难',
        description: '高手挑战，速度很快',
        initialSpeed: 600,
        // 指数衰减公式: speed = initialSpeed * 0.85^(level-1)
        // 速度下降较快，最低到 80ms
        speedCurve: (level: number) => {
            const speed = 600 * Math.pow(0.85, level - 1);
            return Math.max(80, Math.round(speed));
        },
        scoreMultiplier: 2.0,
        levelUpThreshold: 800 // 每 800 分升一级
    }
};

/**
 * 获取指定难度和等级的下落速度
 */
export function getSpeed(difficulty: Difficulty, level: number): number {
    return DIFFICULTY_CONFIGS[difficulty].speedCurve(level);
}

/**
 * 获取难度配置
 */
export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
    return DIFFICULTY_CONFIGS[difficulty];
}

/**
 * 计算升级所需分数
 */
export function getNextLevelScore(difficulty: Difficulty, currentLevel: number): number {
    return currentLevel * DIFFICULTY_CONFIGS[difficulty].levelUpThreshold;
}

/**
 * 根据分数计算当前等级
 */
export function calculateLevel(difficulty: Difficulty, score: number): number {
    const threshold = DIFFICULTY_CONFIGS[difficulty].levelUpThreshold;
    return Math.floor(score / threshold) + 1;
}
